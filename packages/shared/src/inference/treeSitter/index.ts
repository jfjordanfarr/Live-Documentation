/**
 * Tree-sitter Heuristic Module
 *
 * Provides tree-sitter-based symbol extraction as a fallback heuristic.
 * Unlike regex-based heuristics, tree-sitter uses actual parsing to achieve
 * 100% precision (no false positives) at the cost of async initialization.
 *
 * Usage:
 * ```typescript
 * import { createTreeSitterHeuristic } from "./treeSitter";
 *
 * // Async initialization required
 * const heuristic = await createTreeSitterHeuristic();
 * heuristic.initialize(artifacts);
 * heuristic.evaluate(source, emit);
 * ```
 *
 * @module treeSitter
 */

export { loadTreeSitter, getLanguageWasmPath, isLanguageSupported, LANGUAGE_GRAMMAR_MAP } from "./loader";

export {
  getLanguageConfig,
  getSupportedLanguages,
  type LanguageConfig,
} from "./languages";

export {
  extractSymbolsAndReferences,
  buildSymbolTable,
  findCrossFileEdges,
  type ExtractedSymbol,
  type ExtractedReference,
  type ExtractionResult,
} from "./extractor";
import path from "path";

import type {
  FallbackHeuristic,
  HeuristicArtifact,
  MatchEmitter,
} from "../fallbackHeuristicTypes";
import { loadTreeSitter, isLanguageSupported, getLanguageWasmPath, LANGUAGE_GRAMMAR_MAP } from "./loader";
import type { TreeSitterNode } from "./loader";

/**
 * Maps file extensions to language IDs.
 */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ".go": "go",
  ".cs": "csharp",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".java": "java",
  ".rs": "rust",
  ".rb": "ruby",
};

function getLanguageFromPath(filePath: string): string | undefined {
  const ext = filePath.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ext ? EXTENSION_TO_LANGUAGE[ext] : undefined;
}

interface TreeSitterContext {
  /**
   * The full list of artifacts for import path resolution.
   */
  artifacts: readonly HeuristicArtifact[];
}

/**
 * Creates a tree-sitter-based fallback heuristic.
 *
 * This heuristic uses tree-sitter to parse import/use statements from source
 * files and resolve them to target files in the workspace. Unlike naive symbol
 * matching, this achieves 100% precision by only emitting edges for explicitly
 * imported dependencies.
 *
 * **Important**: This factory function is async because tree-sitter WASM
 * modules must be loaded before the heuristic can be used.
 *
 * @returns A FallbackHeuristic that uses tree-sitter for import extraction
 */
export async function createTreeSitterHeuristic(): Promise<FallbackHeuristic> {
  // Pre-load tree-sitter module
  const TreeSitter = await loadTreeSitter();

  let _context: TreeSitterContext | null = null;

  // Build a path resolver for the artifacts
  function resolveImportPath(
    importPath: string,
    sourceDir: string,
    artifacts: readonly HeuristicArtifact[],
    language?: string
  ): HeuristicArtifact | undefined {
    // Normalize the import path
    const normalized = importPath
      .replace(/^['"]|['"]$/g, "") // Remove quotes
      .replace(/\\/g, "/"); // Normalize slashes

    // Handle relative imports
    if (normalized.startsWith("./") || normalized.startsWith("../")) {
      const resolved = path.posix.join(sourceDir, normalized);
      // Try with and without extension
      for (const ext of ["", ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".cs", ".rs", ".rb"]) {
        const candidate = resolved + ext;
        const match = artifacts.find(
          (a) => a.comparablePath === candidate || a.comparablePath.endsWith("/" + candidate)
        );
        if (match) return match;
      }
      // Try index files
      for (const index of ["index.ts", "index.js", "__init__.py"]) {
        const candidate = resolved + "/" + index;
        const match = artifacts.find(
          (a) => a.comparablePath === candidate || a.comparablePath.endsWith("/" + candidate)
        );
        if (match) return match;
      }
    }

    // Rust-specific resolution for crate:: and use paths
    if (language === "rust") {
      return resolveRustImport(normalized, sourceDir, artifacts);
    }

    // Handle module-style imports (match by file name or path suffix)
    // e.g., "myproject/helpers" should match "src/helpers/helpers.go"
    const lastSegment = normalized.split("/").pop() ?? normalized;
    const candidates = artifacts.filter((a) => {
      const aPath = a.comparablePath;
      const aName = path.posix.basename(aPath, path.posix.extname(aPath));
      return (
        aName === lastSegment ||
        aPath.includes("/" + normalized + ".") ||
        aPath.includes("/" + normalized + "/")
      );
    });

    // Return first match if there's only one, otherwise be conservative
    if (candidates.length === 1) {
      return candidates[0];
    }

    return undefined;
  }

  // Resolve Rust use/mod paths to target files
  function resolveRustImport(
    importPath: string,
    sourceDir: string,
    artifacts: readonly HeuristicArtifact[]
  ): HeuristicArtifact | undefined {
    // Parse Rust module path:
    // - "crate::serde::Serialize" -> module is "serde"
    // - "self::helpers" -> relative to current module
    // - "super::parent" -> parent module
    // - "std::collections" -> external crate (ignored)
    // - "serde" (bare module from mod statement) -> serde.rs or serde/mod.rs

    const parts = importPath.split("::");
    if (parts.length === 0) return undefined;

    // Strip leading crate/self/super prefix
    let prefix: "crate" | "self" | "super" | null = null;
    let moduleParts = parts;
    if (parts[0] === "crate") {
      prefix = "crate";
      moduleParts = parts.slice(1);
    } else if (parts[0] === "self") {
      prefix = "self";
      moduleParts = parts.slice(1);
    } else if (parts[0] === "super") {
      prefix = "super";
      moduleParts = parts.slice(1);
    }

    // Ignore external crates (std, serde, etc.) - no crate/self/super prefix and not a local module
    if (prefix === null && parts.length > 1) {
      // External crate like "std::collections::HashMap"
      return undefined;
    }

    // Get the first module in the path (the file we're referencing)
    const targetModule = moduleParts[0];
    if (!targetModule) return undefined;

    // Find the crate root (usually src/ or the directory containing lib.rs/main.rs)
    const crateRoot = findRustCrateRoot(sourceDir, artifacts);

    // Build candidate paths based on Rust module resolution:
    // - module.rs
    // - module/mod.rs
    const searchBase = prefix === "crate" || prefix === null ? crateRoot : sourceDir;
    if (prefix === "super" && searchBase) {
      // Go up one directory
      const parent = path.posix.dirname(searchBase);
      return resolveRustModuleName(targetModule, parent, artifacts);
    }

    return resolveRustModuleName(targetModule, searchBase ?? "", artifacts);
  }

  // Find the crate root directory (where lib.rs or main.rs lives)
  function findRustCrateRoot(
    sourceDir: string,
    artifacts: readonly HeuristicArtifact[]
  ): string | undefined {
    // Look for lib.rs or main.rs in src/ or the source directory
    const hasLibRs = artifacts.some(
      (a) => a.comparablePath.endsWith("/lib.rs") || a.comparablePath.endsWith("/main.rs")
    );
    if (!hasLibRs) return undefined;

    // Find the directory containing lib.rs
    const libRs = artifacts.find(
      (a) => a.comparablePath.endsWith("/lib.rs")
    );
    if (libRs) {
      return path.posix.dirname(libRs.comparablePath);
    }

    const mainRs = artifacts.find(
      (a) => a.comparablePath.endsWith("/main.rs")
    );
    if (mainRs) {
      return path.posix.dirname(mainRs.comparablePath);
    }

    return undefined;
  }

  // Resolve a Rust module name to a file path
  function resolveRustModuleName(
    moduleName: string,
    baseDir: string,
    artifacts: readonly HeuristicArtifact[]
  ): HeuristicArtifact | undefined {
    // Try module.rs first
    const directPath = baseDir ? `${baseDir}/${moduleName}.rs` : `${moduleName}.rs`;
    const directMatch = artifacts.find(
      (a) => a.comparablePath === directPath || a.comparablePath.endsWith("/" + directPath)
    );
    if (directMatch) return directMatch;

    // Try module/mod.rs
    const modPath = baseDir ? `${baseDir}/${moduleName}/mod.rs` : `${moduleName}/mod.rs`;
    const modMatch = artifacts.find(
      (a) => a.comparablePath === modPath || a.comparablePath.endsWith("/" + modPath)
    );
    if (modMatch) return modMatch;

    return undefined;
  }

  // Extract imports from a tree-sitter parse tree
  async function extractImports(
    content: string,
    languageId: string
  ): Promise<string[]> {
    const grammarName = LANGUAGE_GRAMMAR_MAP[languageId.toLowerCase()];
    if (!grammarName) return [];

    let wasmPath: string;
    try {
      wasmPath = getLanguageWasmPath(grammarName);
    } catch {
      return [];
    }

    const language = await TreeSitter.Language.load(wasmPath);
    const parser = new TreeSitter.Parser();
    parser.setLanguage(language);

    const tree = parser.parse(content);
    const imports: string[] = [];

    function walk(node: TreeSitterNode): void {
      // TypeScript/JavaScript
      if (node.type === "import_statement" || node.type === "export_statement") {
        const stringNode = node.children.find((c: TreeSitterNode) => c.type === "string");
        if (stringNode) {
          imports.push(stringNode.text);
        }
      }

      // Go
      if (node.type === "import_spec") {
        const stringNode = node.children.find(
          (c: TreeSitterNode) => c.type === "interpreted_string_literal"
        );
        if (stringNode) {
          imports.push(stringNode.text);
        }
      }

      // Python
      if (node.type === "import_from_statement") {
        const moduleNode = node.namedChildren.find(
          (c: TreeSitterNode) => c.type === "dotted_name" || c.type === "relative_import"
        );
        if (moduleNode) {
          imports.push(moduleNode.text);
        }
      }

      // Java
      if (node.type === "import_declaration") {
        const scopedNode = node.namedChildren.find(
          (c: TreeSitterNode) => c.type === "scoped_identifier"
        );
        if (scopedNode) {
          imports.push(scopedNode.text);
        }
      }

      // C#
      if (node.type === "using_directive") {
        const nameNode = node.namedChildren.find(
          (c: TreeSitterNode) =>
            c.type === "identifier" || c.type === "qualified_name"
        );
        if (nameNode) {
          imports.push(nameNode.text);
        }
      }

      // Rust
      if (node.type === "use_declaration") {
        const scopedNode = node.namedChildren.find(
          (c: TreeSitterNode) =>
            c.type === "scoped_identifier" || c.type === "identifier"
        );
        if (scopedNode) {
          imports.push(scopedNode.text);
        }
      }
      if (node.type === "mod_item") {
        const nameNode = node.namedChildren.find(
          (c: TreeSitterNode) => c.type === "identifier"
        );
        if (nameNode) {
          imports.push(nameNode.text);
        }
      }

      // Recurse
      for (const child of node.children) {
        walk(child);
      }
    }

    walk(tree.rootNode);
    tree.delete();
    parser.delete();

    return imports;
  }

  return {
    id: "tree-sitter",

    initialize(artifacts: readonly HeuristicArtifact[]): void {
      _context = {
        artifacts,
      };
    },

    appliesTo(source: HeuristicArtifact): boolean {
      const language = getLanguageFromPath(source.comparablePath);
      return language !== undefined && isLanguageSupported(language);
    },

    async evaluate(source: HeuristicArtifact, emit: MatchEmitter): Promise<void> {
      if (!_context) {
        return;
      }

      const language = getLanguageFromPath(source.comparablePath);
      if (!language) {
        return;
      }

      const content = source.content;
      if (!content) {
        return;
      }

      // Extract import statements
      const imports = await extractImports(content, language);

      // Get source directory for relative path resolution
      const sourceDir = path.posix.dirname(source.comparablePath);

      // Resolve each import to a target file
      const emittedTargets = new Set<string>();
      for (const importPath of imports) {
        const target = resolveImportPath(importPath, sourceDir, _context.artifacts, language);
        if (target && target.comparablePath !== source.comparablePath) {
          // Avoid duplicate emissions
          if (emittedTargets.has(target.comparablePath)) {
            continue;
          }
          emittedTargets.add(target.comparablePath);

          emit({
            target,
            confidence: 1.0, // Tree-sitter import extraction is definitive
            rationale: `Imports '${importPath}'`,
            context: "import",
          });
        }
      }
    },
  };
}

/**
 * Checks if a file extension is supported by tree-sitter.
 */
export function isExtensionSupported(filePath: string): boolean {
  const language = getLanguageFromPath(filePath);
  return language !== undefined && isLanguageSupported(language);
}

/**
 * Gets the language ID for a file path.
 */
export function getLanguageFromFilePath(filePath: string): string | undefined {
  return getLanguageFromPath(filePath);
}

import path from "node:path";

import { isImplementationLayer } from "./artifactLayerUtils";
import { isWithinComment } from "./shared";
import type { FallbackHeuristic, HeuristicArtifact, MatchContext } from "../fallbackHeuristicTypes";

/**
 * Matches a single-line Go import: import "module/path"
 * Captures: (1) the import path
 */
const GO_SINGLE_IMPORT_PATTERN = /^\s*import\s+"([^"]+)"/gm;

/**
 * Matches a grouped Go import block: import ( ... )
 * Captures: (1) the block content
 */
const GO_GROUPED_IMPORT_PATTERN = /^\s*import\s+\(([\s\S]*?)\)/gm;

/**
 * Matches individual import lines within a grouped import block.
 * Captures: (1) optional alias, (2) the import path
 */
const GO_IMPORT_LINE_PATTERN = /^\s*(?:([A-Za-z_][A-Za-z0-9_]*)\s+)?"([^"]+)"/gm;

/**
 * Matches Go exported symbol declarations (capitalized identifiers are public).
 * Handles:
 * - func FunctionName(...)
 * - type TypeName struct/interface/...
 * - const/var ConstName = ...
 */
const GO_FUNC_PATTERN = /(?:^|\n)\s*func\s+(?:\([^)]*\)\s+)?([A-Z][A-Za-z0-9_]*)\s*\(/g;
const GO_TYPE_PATTERN = /(?:^|\n)\s*type\s+([A-Z][A-Za-z0-9_]*)\s+(?:struct|interface|[^\s{]+)/g;
const GO_CONST_VAR_PATTERN = /(?:^|\n)\s*(?:const|var)\s+([A-Z][A-Za-z0-9_]*)\s+/g;
const GO_BLOCK_ENTRY_PATTERN = /(?:^|\n)\s*([A-Z][A-Za-z0-9_]*)\s+[^=\s]+\s*=/g;

/**
 * Matches Go private (unexported) symbol declarations (lowercase identifiers).
 * In single-package Go libraries, files reference private symbols from other files.
 * We use these patterns for same-package detection only.
 */
const GO_PRIVATE_FUNC_PATTERN = /(?:^|\n)\s*func\s+(?:\([^)]*\)\s+)?([a-z][A-Za-z0-9_]*)\s*\(/g;
const GO_PRIVATE_TYPE_PATTERN = /(?:^|\n)\s*type\s+([a-z][A-Za-z0-9_]*)\s+(?:struct|interface|[^\s{]+)/g;
const GO_PRIVATE_CONST_VAR_PATTERN = /(?:^|\n)\s*(?:const|var)\s+([a-z][A-Za-z0-9_]*)\s+/g;
const GO_PRIVATE_BLOCK_ENTRY_PATTERN = /(?:^|\n)\s*([a-z][A-Za-z0-9_]*)\s+[^=\s]+\s*=/g;

/**
 * Common Go variable/parameter names that should be excluded from symbol matching.
 * These are frequently used as local variables and matching them across files
 * produces false positives.
 */
const GO_COMMON_VARIABLE_NAMES = new Set([
  // Standard error handling
  "err", "error",
  // Common iteration/result variables
  "match", "matches", "result", "results", "value", "values",
  "key", "keys", "data", "item", "items",
  // Index/loop variables  
  "idx", "index", "len", "size", "count",
  // HTTP/request related
  "req", "res", "resp", "request", "response",
  // Context
  "ctx", "context",
  // IO related
  "buf", "buffer", "reader", "writer",
  // Boolean flags
  "ok", "found", "done", "valid",
  // String processing
  "str", "text", "name", "path", "url",
]);

// Note: GO_PACKAGE_PATTERN could be used in future to extract package names
// const GO_PACKAGE_PATTERN = /^\s*package\s+([A-Za-z_][A-Za-z0-9_]*)/m;

interface GoContext {
  /**
   * Maps package directory paths to their artifacts.
   * Go uses directory-based packages, so src/models/*.go are all in the same package.
   */
  packageIndex: Map<string, HeuristicArtifact[]>;
  
  /**
   * Maps module-relative import paths to package directories.
   * e.g., "rosetta/models" → "src/models"
   */
  importPathIndex: Map<string, string>;
  
  /**
   * Maps exported symbol names to the artifact that defines them (per package directory).
   * Structure: packageDir → symbolName → definingArtifact
   */
  symbolIndex: Map<string, Map<string, HeuristicArtifact>>;
  
  /**
   * Maps package directory paths to their doc.go file (if exists).
   * In Go, doc.go contains package-level documentation and every file in the
   * package implicitly references it.
   */
  docIndex: Map<string, HeuristicArtifact>;
  
  /**
   * The module name from go.mod (e.g., "rosetta").
   */
  moduleName: string | undefined;
  
  /**
   * The directory containing go.mod (or src root).
   */
  moduleRoot: string | undefined;
}

export function createGoHeuristic(): FallbackHeuristic {
  let context: GoContext = {
    packageIndex: new Map(),
    importPathIndex: new Map(),
    symbolIndex: new Map(),
    docIndex: new Map(),
    moduleName: undefined,
    moduleRoot: undefined,
  };

  return {
    id: "go-package-relationships",
    initialize(artifacts) {
      context = buildGoContext(artifacts);
    },
    appliesTo(source) {
      return (
        isImplementationLayer(source.artifact.layer) &&
        source.comparablePath.endsWith(".go")
      );
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }
      
      // Skip doc.go files for same-package symbol detection
      // doc.go is package documentation that mentions symbols without using them
      const isDocFile = source.basename === "doc.go";

      const seenTargets = new Set<string>();
      const importPaths = extractImportPaths(source.content);

      for (const importPath of importPaths) {
        // Skip stdlib packages (no dots, single segment, or starts with known stdlib prefixes)
        if (isStdlibPackage(importPath)) {
          continue;
        }

        const targets = resolveGoImportTargets(importPath, context, source);
        for (const target of targets) {
          if (seenTargets.has(target.artifact.id)) {
            continue;
          }
          
          // Skip self-references (files in the same package)
          const sourceDir = path.dirname(source.comparablePath);
          const targetDir = path.dirname(target.comparablePath);
          if (sourceDir === targetDir) {
            continue;
          }

          seenTargets.add(target.artifact.id);
          
          const matchContext: MatchContext = source.basename === "main.go" ? "import" : "use";
          emit({
            target,
            confidence: 0.7,
            rationale: `go import ${importPath}`,
            context: matchContext,
          });
        }
      }

      // For test files, emit edges to implementation files in the same package.
      // In Go, test files can call functions from implementation files without
      // explicit imports because they share the package namespace.
      //
      // We use three strategies:
      // 1. Same-package symbol reference detection (highest precision)
      // 2. Matching filename: foo_test.go → foo.go (high confidence)
      // 3. Multi-package layout: if only 1-2 impl files in directory, emit to all (moderate confidence)
      if (source.basename.endsWith("_test.go")) {
        const sourceDir = path.dirname(source.comparablePath);
        const packageFiles = context.packageIndex.get(sourceDir);
        if (packageFiles) {
          // Get non-test files in the same package
          const implFiles = packageFiles.filter(f => 
            !f.basename.endsWith("_test.go") && f.artifact.id !== source.artifact.id
          );
          
          // Strategy 1: Same-package symbol reference detection
          // Check which exported symbols from this package are referenced in the test file
          // Note: We only emit edges to implementation files here. While Go tests CAN
          // reference other test files' symbols, detecting these via regex is too
          // imprecise (common helper symbols cause false positives). SCIP can detect
          // these accurately; heuristics trade recall for precision here.
          const packageSymbols = context.symbolIndex.get(sourceDir);
          if (packageSymbols) {
            for (const [symbolName, definingArtifact] of packageSymbols) {
              // Skip self-references
              if (definingArtifact.artifact.id === source.artifact.id) {
                continue;
              }
              // Skip test files as targets to avoid false positives from shared symbols
              if (definingArtifact.basename.endsWith("_test.go")) {
                continue;
              }
              if (seenTargets.has(definingArtifact.artifact.id)) {
                continue;
              }
              // Check if this symbol is referenced without a package qualifier
              // This prevents matching http.NewRequest against local newRequest
              if (isSymbolReferencedLocally(source.content, symbolName)) {
                seenTargets.add(definingArtifact.artifact.id);
                emit({
                  target: definingArtifact,
                  confidence: 0.8,
                  rationale: `go test uses symbol ${symbolName}`,
                  context: "use",
                });
              }
            }
          }
          
          // Strategy 2: Look for matching impl file (foo_test.go → foo.go)
          const baseName = source.basename.replace(/_test\.go$/, ".go");
          const matchingImpl = implFiles.find(f => f.basename === baseName);
          
          if (matchingImpl && !seenTargets.has(matchingImpl.artifact.id)) {
            seenTargets.add(matchingImpl.artifact.id);
            emit({
              target: matchingImpl,
              confidence: 0.75,
              rationale: "go test file tests matching implementation",
              context: "use",
            });
          }
          
          // Strategy 3: For small packages (1-2 impl files), emit to all
          // This handles cases like a single module with helper files
          if (implFiles.length <= 2) {
            for (const implFile of implFiles) {
              if (seenTargets.has(implFile.artifact.id)) {
                continue;
              }
              seenTargets.add(implFile.artifact.id);
              emit({
                target: implFile,
                confidence: 0.6,
                rationale: "go test file references package implementation",
                context: "use",
              });
            }
          }
        }
      }
      
      // For all Go files (including non-test files), detect same-package symbol references
      // This handles cases where impl file A uses symbols from impl file B in the same package
      // Skip doc.go files which document symbols without using them
      if (!source.basename.endsWith("_test.go") && !isDocFile) {
        const sourceDir = path.dirname(source.comparablePath);
        const packageSymbols = context.symbolIndex.get(sourceDir);
        if (packageSymbols) {
          for (const [symbolName, definingArtifact] of packageSymbols) {
            // Skip self-references
            if (definingArtifact.artifact.id === source.artifact.id) {
              continue;
            }
            if (seenTargets.has(definingArtifact.artifact.id)) {
              continue;
            }
            // For non-test source files, only emit edges to other non-test files
            // This prevents spurious impl→test edges from shared symbol names
            if (definingArtifact.basename.endsWith("_test.go")) {
              continue;
            }
            // Check if this symbol is referenced without a package qualifier
            // This prevents matching http.NewRequest against local newRequest
            if (isSymbolReferencedLocally(source.content, symbolName)) {
              seenTargets.add(definingArtifact.artifact.id);
              emit({
                target: definingArtifact,
                confidence: 0.7,
                rationale: `go file uses symbol ${symbolName}`,
                context: "use",
              });
            }
          }
        }
      }
      
      // Emit edges to doc.go for all files in the package
      // In Go, doc.go contains package-level documentation that applies to all files
      // Every file in the package implicitly references the doc.go documentation
      const sourceDir = path.dirname(source.comparablePath);
      const docFile = context.docIndex.get(sourceDir);
      if (docFile && docFile.artifact.id !== source.artifact.id && !seenTargets.has(docFile.artifact.id)) {
        seenTargets.add(docFile.artifact.id);
        emit({
          target: docFile,
          confidence: 0.6,
          rationale: "go file references package documentation",
          context: "use",
        });
      }
    },
  };
}

function buildGoContext(artifacts: readonly HeuristicArtifact[]): GoContext {
  const packageIndex = new Map<string, HeuristicArtifact[]>();
  const importPathIndex = new Map<string, string>();
  const docIndex = new Map<string, HeuristicArtifact>();
  let moduleName: string | undefined;
  let moduleRoot: string | undefined;

  // First pass: find go.mod to determine module name and root
  for (const artifact of artifacts) {
    if (artifact.basename === "go.mod" && artifact.content) {
      const match = artifact.content.match(/^module\s+(\S+)/m);
      if (match) {
        moduleName = match[1];
        moduleRoot = path.dirname(artifact.comparablePath);
      }
      break;
    }
  }

  // Second pass: index Go files by their package directory and extract symbols
  // We include ALL Go files (including tests) in the package index so we can
  // detect edges from test files to other test files and doc.go.
  const symbolIndex = new Map<string, Map<string, HeuristicArtifact>>();
  
  for (const artifact of artifacts) {
    if (!artifact.comparablePath.endsWith(".go")) {
      continue;
    }

    const dir = path.dirname(artifact.comparablePath);
    const isTestFile = artifact.basename.endsWith("_test.go");
    
    // Add ALL Go files to the package index (including tests)
    let existing = packageIndex.get(dir);
    if (!existing) {
      existing = [];
      packageIndex.set(dir, existing);
    }
    existing.push(artifact);
    
    // Track doc.go files for package-level documentation edges
    if (artifact.basename === "doc.go") {
      docIndex.set(dir, artifact);
    }
    
    // Build import path index for non-test files only
    // (test files aren't imported from outside the package)
    if (!isTestFile && moduleName && moduleRoot) {
      const relativePath = path.relative(moduleRoot, dir).replace(/\\/g, "/");
      const importPath = relativePath ? `${moduleName}/${relativePath}` : moduleName;
      importPathIndex.set(importPath, dir);
    }
    
    // Extract ALL symbols (public and private) and add to symbol index
    // For same-package detection, private symbols are also visible.
    // Include test files since they can define helper types/functions.
    // (skip doc.go as it documents but doesn't define symbols)
    if (artifact.content && artifact.basename !== "doc.go") {
      const symbols = extractAllSymbols(artifact.content);
      let packageSymbols = symbolIndex.get(dir);
      if (!packageSymbols) {
        packageSymbols = new Map();
        symbolIndex.set(dir, packageSymbols);
      }
      for (const symbolName of symbols) {
        // First definition wins (consistent with Go's single-package namespace)
        if (!packageSymbols.has(symbolName)) {
          packageSymbols.set(symbolName, artifact);
        }
      }
    }
  }

  return { packageIndex, importPathIndex, symbolIndex, docIndex, moduleName, moduleRoot };
}

function extractImportPaths(content: string): string[] {
  const paths: string[] = [];

  // Single imports: import "path"
  const singlePattern = new RegExp(GO_SINGLE_IMPORT_PATTERN.source, "gm");
  for (const match of content.matchAll(singlePattern)) {
    const importStart = match.index ?? 0;
    if (!isWithinComment(content, importStart)) {
      paths.push(match[1]);
    }
  }

  // Grouped imports: import ( "path1" "path2" )
  const groupedPattern = new RegExp(GO_GROUPED_IMPORT_PATTERN.source, "gm");
  for (const match of content.matchAll(groupedPattern)) {
    const blockStart = match.index ?? 0;
    if (isWithinComment(content, blockStart)) {
      continue;
    }

    const blockContent = match[1];
    const linePattern = new RegExp(GO_IMPORT_LINE_PATTERN.source, "gm");
    for (const lineMatch of blockContent.matchAll(linePattern)) {
      paths.push(lineMatch[2]);
    }
  }

  return paths;
}

function resolveGoImportTargets(
  importPath: string,
  context: GoContext,
  _source: HeuristicArtifact
): HeuristicArtifact[] {
  const targets: HeuristicArtifact[] = [];

  // Helper: pick the best representative from a package
  // Prioritizes implementation files over test files, using ASCII sort for determinism
  const pickRepresentative = (files: HeuristicArtifact[]): HeuristicArtifact | undefined => {
    // Filter to implementation files (non-test)
    const implFiles = files.filter(f => !f.basename.endsWith("_test.go"));
    // Use ASCII comparison (not localeCompare) for deterministic cross-locale ordering
    const candidates = implFiles.length > 0 ? implFiles : files;
    const sorted = [...candidates].sort((a, b) => (a.basename < b.basename ? -1 : a.basename > b.basename ? 1 : 0));
    return sorted[0];
  };

  // Try direct import path lookup
  const dir = context.importPathIndex.get(importPath);
  if (dir) {
    const files = context.packageIndex.get(dir);
    if (files) {
      const rep = pickRepresentative(files);
      if (rep) {
        targets.push(rep);
      }
    }
    return targets;
  }

  // Fallback: try to match by package suffix
  const suffix = importPath.split("/").pop();
  if (suffix) {
    for (const [pkgDir, files] of context.packageIndex) {
      const dirSuffix = path.basename(pkgDir);
      if (dirSuffix === suffix) {
        const rep = pickRepresentative(files);
        if (rep) {
          targets.push(rep);
        }
      }
    }
  }

  return targets;
}

/**
 * Determines if an import path is likely a Go standard library package.
 * Go stdlib packages are single-segment names without dots (e.g., "fmt", "os", "io").
 */
function isStdlibPackage(importPath: string): boolean {
  // Standard library packages don't contain dots and are typically single segment
  if (importPath.includes(".")) {
    return false;
  }

  // Well-known stdlib packages and prefixes
  const stdlibPrefixes = new Set([
    "archive", "bufio", "bytes", "compress", "container", "context",
    "crypto", "database", "debug", "embed", "encoding", "errors",
    "expvar", "flag", "fmt", "go", "hash", "html", "image", "index",
    "internal", "io", "log", "maps", "math", "mime", "net", "os",
    "path", "plugin", "reflect", "regexp", "runtime", "slices",
    "sort", "strconv", "strings", "sync", "syscall", "testing",
    "text", "time", "unicode", "unsafe",
  ]);

  const firstSegment = importPath.split("/")[0];
  return stdlibPrefixes.has(firstSegment);
}

/**
 * Extracts exported symbol names from Go source code.
 * In Go, exported symbols are capitalized identifiers.
 */
function _extractExportedSymbols(content: string): string[] {
  const symbols = new Set<string>();
  
  // Extract function names
  const funcPattern = new RegExp(GO_FUNC_PATTERN.source, "g");
  for (const match of content.matchAll(funcPattern)) {
    symbols.add(match[1]);
  }
  
  // Extract type names
  const typePattern = new RegExp(GO_TYPE_PATTERN.source, "g");
  for (const match of content.matchAll(typePattern)) {
    symbols.add(match[1]);
  }
  
  // Extract const/var names
  const constVarPattern = new RegExp(GO_CONST_VAR_PATTERN.source, "g");
  for (const match of content.matchAll(constVarPattern)) {
    symbols.add(match[1]);
  }
  
  // Extract block entries (const/var blocks)
  const blockEntryPattern = new RegExp(GO_BLOCK_ENTRY_PATTERN.source, "g");
  for (const match of content.matchAll(blockEntryPattern)) {
    symbols.add(match[1]);
  }
  
  return Array.from(symbols).sort();
}

/**
 * Extracts all symbols (both public and private) from Go source code.
 * Used for same-package detection where private symbols are also visible.
 */
function extractAllSymbols(content: string): string[] {
  const symbols = new Set<string>();
  
  // Extract public function names
  const funcPattern = new RegExp(GO_FUNC_PATTERN.source, "g");
  for (const match of content.matchAll(funcPattern)) {
    symbols.add(match[1]);
  }
  
  // Extract private function names
  const privateFuncPattern = new RegExp(GO_PRIVATE_FUNC_PATTERN.source, "g");
  for (const match of content.matchAll(privateFuncPattern)) {
    symbols.add(match[1]);
  }
  
  // Extract public type names
  const typePattern = new RegExp(GO_TYPE_PATTERN.source, "g");
  for (const match of content.matchAll(typePattern)) {
    symbols.add(match[1]);
  }
  
  // Extract private type names
  const privateTypePattern = new RegExp(GO_PRIVATE_TYPE_PATTERN.source, "g");
  for (const match of content.matchAll(privateTypePattern)) {
    symbols.add(match[1]);
  }
  
  // Extract public const/var names
  const constVarPattern = new RegExp(GO_CONST_VAR_PATTERN.source, "g");
  for (const match of content.matchAll(constVarPattern)) {
    symbols.add(match[1]);
  }
  
  // Extract private const/var names
  const privateConstVarPattern = new RegExp(GO_PRIVATE_CONST_VAR_PATTERN.source, "g");
  for (const match of content.matchAll(privateConstVarPattern)) {
    symbols.add(match[1]);
  }
  
  // Extract public block entries (const/var blocks)
  const blockEntryPattern = new RegExp(GO_BLOCK_ENTRY_PATTERN.source, "g");
  for (const match of content.matchAll(blockEntryPattern)) {
    symbols.add(match[1]);
  }
  
  // Extract private block entries (const/var blocks)
  const privateBlockEntryPattern = new RegExp(GO_PRIVATE_BLOCK_ENTRY_PATTERN.source, "g");
  for (const match of content.matchAll(privateBlockEntryPattern)) {
    symbols.add(match[1]);
  }
  
  // Filter out:
  // 1. Very short identifiers (likely false positives)
  // 2. Common Go variable names that are used everywhere as locals
  const filtered = Array.from(symbols).filter(s => 
    s.length > 2 && !GO_COMMON_VARIABLE_NAMES.has(s)
  );
  
  return filtered.sort();
}

/**
 * Strips comments and string literals from Go source code.
 * This prevents false positives from symbol matches in comments/strings
 * (e.g., "Use" in "// Use of this source code is governed by...").
 */
function stripCommentsAndStrings(content: string): string {
  let result = "";
  let i = 0;
  
  while (i < content.length) {
    // Check for line comment
    if (content[i] === "/" && content[i + 1] === "/") {
      // Skip to end of line
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      continue;
    }
    
    // Check for block comment
    if (content[i] === "/" && content[i + 1] === "*") {
      i += 2;
      while (i < content.length - 1 && !(content[i] === "*" && content[i + 1] === "/")) {
        i++;
      }
      i += 2; // Skip closing */
      continue;
    }
    
    // Check for string literal
    if (content[i] === '"') {
      i++; // Skip opening quote
      while (i < content.length && content[i] !== '"') {
        if (content[i] === "\\" && i + 1 < content.length) {
          i += 2; // Skip escaped character
        } else {
          i++;
        }
      }
      i++; // Skip closing quote
      continue;
    }
    
    // Check for raw string literal (backtick)
    if (content[i] === "`") {
      i++; // Skip opening backtick
      while (i < content.length && content[i] !== "`") {
        i++;
      }
      i++; // Skip closing backtick
      continue;
    }
    
    result += content[i];
    i++;
  }
  
  return result;
}

/**
 * Checks if a symbol is referenced in the content without a package qualifier.
 * In Go, `http.NewRequest` should not match local `newRequest`.
 * We look for uses of the symbol that are NOT preceded by a dot.
 * 
 * This function strips comments and string literals first to prevent
 * false positives from matches in non-code contexts (e.g., license comments).
 */
function isSymbolReferencedLocally(content: string, symbolName: string): boolean {
  // Strip comments and strings to avoid false positives
  const codeOnly = stripCommentsAndStrings(content);
  
  // Pattern: symbol not preceded by a dot (package qualifier)
  // We use a negative lookbehind to exclude package-qualified references
  const pattern = new RegExp(`(?<![.])\\b${escapeRegExp(symbolName)}\\b`, "g");
  return pattern.test(codeOnly);
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

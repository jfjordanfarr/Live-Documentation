/**
 * File discovery and symbol indexing for Live Documentation.
 *
 * @remarks
 * This module handles discovering target files for Live Doc generation
 * and building the workspace-wide symbol index for cross-file type linking.
 *
 * @module
 */

import { glob } from "glob";
import ignore, { type Ignore } from "ignore";
import * as fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import { analyzeWithLanguageAdapters } from "./adapters";
import type {
  PublicSymbolEntry,
  ResolvedSymbolLocation,
  WorkspaceSymbolIndex
} from "./coreTypes";
import { detectChangedFiles } from "./gitUtils";
import { computePublicSymbolHeadingInfo } from "./rendering";
import { inferScriptKind, collectExportedSymbols } from "./symbolExtraction";
import type { LiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { normalizeWorkspacePath } from "../tooling/pathUtils";

// ============================================================================
// Discovery Options
// ============================================================================

interface DiscoverOptions {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  include: Set<string>;
  changedOnly: boolean;
}

// ============================================================================
// Gitignore Filtering
// ============================================================================

/**
 * Creates an `ignore` instance seeded with the workspace's `.gitignore` patterns.
 *
 * @param workspaceRoot - Absolute path to the repository root.
 * @returns An `Ignore` instance if `.gitignore` exists, or `null` if not found.
 */
async function createGitignoreFilter(workspaceRoot: string): Promise<Ignore | null> {
  const gitignorePath = path.join(workspaceRoot, ".gitignore");
  try {
    const content = await fs.readFile(gitignorePath, "utf-8");
    const ig = ignore();
    ig.add(content);
    return ig;
  } catch {
    // .gitignore does not exist or is unreadable
    return null;
  }
}

// ============================================================================
// File Discovery
// ============================================================================

/**
 * Locates workspace files that should receive Live Documentation generation.
 *
 * @remarks
 * When `options.changedOnly` is `true`, the discovery set is intersected with
 * files currently marked as changed in git, allowing quick iterations that only
 * regenerate touched artifacts.
 *
 * @param options.workspaceRoot - Absolute path to the repository root the CLI is operating in.
 * @param options.config - Live Documentation configuration describing default globs and overrides.
 * @param options.include - Optional override set limiting discovery to pre-selected relative paths.
 * @param options.changedOnly - When `true`, restricts results to files with local modifications.
 *
 * @see detectChangedFiles
 *
 * @returns A sorted array of absolute, workspace-resolved file paths ready for analysis.
 *
 * @example
 * ```ts
 * const files = await discoverTargetFiles({
 *   workspaceRoot,
 *   config,
 *   include: new Set(["packages/server/src/index.ts"]),
 *   changedOnly: false
 * });
 * ```
 */
export async function discoverTargetFiles(options: DiscoverOptions): Promise<string[]> {
  const patterns = options.include.size > 0 ? Array.from(options.include) : options.config.glob;
  const absoluteFiles = new Set<string>();

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: options.workspaceRoot,
      absolute: true,
      nodir: true,
      dot: false,
      windowsPathsNoEscape: true
    });
    for (const match of matches) {
      absoluteFiles.add(path.resolve(options.workspaceRoot, match));
    }
  }

  let candidates = Array.from(absoluteFiles);

  // Apply gitignore filtering to exclude build artifacts and other ignored paths
  const gitignoreFilter = await createGitignoreFilter(options.workspaceRoot);
  if (gitignoreFilter) {
    candidates = candidates.filter((absolute) => {
      const relative = normalizeWorkspacePath(
        path.relative(options.workspaceRoot, absolute)
      );
      return !gitignoreFilter.ignores(relative);
    });
  }

  if (options.changedOnly) {
    const changed = await detectChangedFiles(options.workspaceRoot);
    if (changed.size > 0) {
      candidates = candidates.filter((absolute) => {
        const relative = normalizeWorkspacePath(
          path.relative(options.workspaceRoot, absolute)
        );
        return changed.has(relative);
      });
    }
  }

  candidates.sort();
  return candidates;
}

// ============================================================================
// Symbol Index Building
// ============================================================================

/**
 * Builds a workspace-wide symbol index for cross-Live-Doc type reference resolution.
 *
 * @remarks
 * This function performs a lightweight pre-scan of all target files to collect
 * exported symbols and their locations. The resulting index enables type references
 * in one Live Doc to link to type definitions in other Live Docs.
 *
 * The index is keyed by symbol name (case-sensitive) and maps to an array of
 * locations, allowing for multiple symbols with the same name from different files.
 *
 * @param options - Configuration for the index build.
 * @param options.targetFiles - Absolute paths to all files being processed.
 * @param options.workspaceRoot - Absolute path to the workspace root.
 * @param options.liveDocsRoot - Workspace-relative path to the Live Docs root (e.g., ".mdmd/layer-4").
 * @param options.docExtension - File extension for Live Docs (e.g., ".mdmd.md").
 *
 * @returns A map from symbol names to their resolved Live Doc locations.
 *
 * @example
 * ```typescript
 * const index = await buildWorkspaceSymbolIndex({
 *   targetFiles: ["/workspace/src/types.ts", "/workspace/src/core.ts"],
 *   workspaceRoot: "/workspace",
 *   liveDocsRoot: ".mdmd/layer-4",
 *   docExtension: ".mdmd.md"
 * });
 * // index.get("Widget") => [{ liveDocPath: ".mdmd/layer-4/src/types.ts.mdmd.md", ... }]
 * ```
 *
 * @see WorkspaceSymbolIndex
 * @see ResolvedSymbolLocation
 */
export async function buildWorkspaceSymbolIndex(options: {
  targetFiles: string[];
  workspaceRoot: string;
  liveDocsRoot: string;
  docExtension: string;
}): Promise<WorkspaceSymbolIndex> {
  const index: WorkspaceSymbolIndex = new Map();

  for (const absolutePath of options.targetFiles) {
    const sourcePath = normalizeWorkspacePath(
      path.relative(options.workspaceRoot, absolutePath)
    );

    // Compute the Live Doc path for this source file
    const liveDocPath = normalizeWorkspacePath(
      path.join(options.liveDocsRoot, `${sourcePath}${options.docExtension}`)
    );

    // Try to extract symbols from the file
    let symbols: PublicSymbolEntry[] = [];
    try {
      const ext = path.extname(absolutePath).toLowerCase();

      // Process JavaScript/TypeScript files with the built-in TypeScript parser
      if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext)) {
        const content = await fs.readFile(absolutePath, "utf8");
        const scriptKind = inferScriptKind(absolutePath);
        const sourceFile = ts.createSourceFile(
          absolutePath,
          content,
          ts.ScriptTarget.Latest,
          true,
          scriptKind
        );
        symbols = collectExportedSymbols(sourceFile);
      } else {
        // Try language-specific adapters for other file types (C#, Java, Python, etc.)
        const adapterResult = await analyzeWithLanguageAdapters({
          absolutePath,
          workspaceRoot: options.workspaceRoot
        });
        if (adapterResult) {
          symbols = adapterResult.symbols;
        }
      }
    } catch {
      // Skip files that can't be read or parsed
      continue;
    }

    // Compute heading info for proper anchor slugs
    const headings = computePublicSymbolHeadingInfo(symbols);

    // Register each symbol in the index
    for (const heading of headings) {
      const symbol = heading.symbol;
      const location: ResolvedSymbolLocation = {
        liveDocPath,
        sourcePath,
        anchor: heading.slug,
        kind: symbol.kind
      };

      // Register by primary name
      const existing = index.get(symbol.name) ?? [];
      existing.push(location);
      index.set(symbol.name, existing);

      // Also register by qualified name if different
      if (symbol.qualifiedName && symbol.qualifiedName !== symbol.name) {
        const qualifiedExisting = index.get(symbol.qualifiedName) ?? [];
        qualifiedExisting.push(location);
        index.set(symbol.qualifiedName, qualifiedExisting);
      }
    }
  }

  return index;
}

// ============================================================================
// Type Resolution
// ============================================================================

/**
 * Resolves a type name to its Live Doc location using the workspace symbol index.
 *
 * @remarks
 * Returns undefined if the type is not found in the index. When multiple
 * symbols with the same name exist, returns the first match (future enhancement:
 * could use import context to disambiguate).
 *
 * @param typeName - The type name to resolve (e.g., "Widget", "Foo.Bar").
 * @param index - The workspace-wide symbol index.
 * @param currentSourcePath - The source path of the file being rendered (to avoid self-links).
 *
 * @returns The resolved location, or undefined if not found.
 */
export function resolveTypeToLiveDoc(
  typeName: string,
  index: WorkspaceSymbolIndex,
  currentSourcePath: string
): ResolvedSymbolLocation | undefined {
  const locations = index.get(typeName);
  if (!locations || locations.length === 0) {
    return undefined;
  }

  // Filter out self-references (types defined in the current file)
  const external = locations.filter((loc) => loc.sourcePath !== currentSourcePath);

  // Prefer external definitions; fall back to any match if all are self-refs
  if (external.length > 0) {
    return external[0];
  }

  // All matches are in the current file — return undefined to avoid self-link
  // (the type is already visible in the same Live Doc)
  return undefined;
}

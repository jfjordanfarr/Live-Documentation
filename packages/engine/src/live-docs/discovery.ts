/**
 * File discovery and symbol indexing for Live Documentation.
 *
 * @remarks
 * This module handles discovering target files for Live Doc generation
 * and building the workspace-wide indexes: the symbols, for cross-file type
 * linking, and the entries manifests declare, for the `Entry` lines.
 *
 * @module
 */

import { glob } from "glob";
import ignore, { type Ignore } from "ignore";
import * as fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import { analyzeWithLanguageAdapters, type WorkspaceFileIndex } from "./adapters";
import { computePublicSymbolHeadingInfo } from "./compose";
import type {
  DeclaredEntry,
  PublicSymbolEntry,
  ResolvedSymbolLocation,
  WorkspaceEntryIndex,
  WorkspaceSymbolIndex
} from "./coreTypes";
import { detectChangedFiles } from "./gitUtils";
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
 *   include: new Set(["packages/generator/src/generator.ts"]),
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
// Index Building
// ============================================================================

/** The two indexes the first pass builds: the symbols every file publishes, and the files manifests declare as entries. */
export interface WorkspaceIndexes {
  symbols: WorkspaceSymbolIndex;
  entries: WorkspaceEntryIndex;
}

/**
 * Builds the workspace-wide indexes for cross-Live-Doc resolution in one pass
 * over the target files.
 *
 * @remarks
 * The symbol index maps each exported symbol's name (case-sensitive) to its
 * locations, so that a type reference in one Live Doc links to the type's
 * definition in another; several files may publish one name. The entry index
 * maps each file a manifest declares as an entry (a script it runs, a binary,
 * its main module) to what declares it, so that the file's doc carries the
 * `Entry` line. TypeScript and JavaScript files are read with the built-in
 * parser; every other file is read by its language adapter.
 *
 * @param options.targetFiles - Absolute paths to all files being processed.
 * @param options.workspaceRoot - Absolute path to the workspace root.
 * @param options.liveDocsRoot - Workspace-relative path to the Live Docs root (e.g., ".live-documentation/source").
 * @param options.docExtension - File extension for Live Docs (e.g., ".md").
 * @param options.fileIndex - The workspace file index, for the adapters that resolve string references.
 */
export async function buildWorkspaceIndexes(options: {
  targetFiles: string[];
  workspaceRoot: string;
  liveDocsRoot: string;
  docExtension: string;
  fileIndex?: WorkspaceFileIndex;
}): Promise<WorkspaceIndexes> {
  const index: WorkspaceSymbolIndex = new Map();
  const entries: WorkspaceEntryIndex = new Map();

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
    let declares: DeclaredEntry[] = [];
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
          workspaceRoot: options.workspaceRoot,
          fileIndex: options.fileIndex
        });
        if (adapterResult) {
          symbols = adapterResult.symbols;
          declares = adapterResult.declares ?? [];
        }
      }
    } catch {
      // Skip files that can't be read or parsed
      continue;
    }

    for (const declared of declares) {
      const by = entries.get(declared.file) ?? [];
      by.push({ declarer: sourcePath, reason: declared.reason, ...(declared.name !== undefined ? { name: declared.name } : {}) });
      entries.set(declared.file, by);
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
        kind: symbol.kind,
        ...(symbol.isReExport ? { isReExport: true } : {})
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

  return { symbols: index, entries };
}

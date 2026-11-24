/**
 * Source file analysis for Live Documentation.
 *
 * @remarks
 * This module provides the main entry point for analyzing source files
 * to extract symbols and dependencies for Live Documentation generation.
 *
 * @module
 */

import path from "node:path";
import ts from "typescript";

import { compareText } from "../tooling/compareText";
import { normalizeWorkspacePath } from "../tooling/pathUtils";
import { readSourceText } from "../tooling/sourceText";
import { analyzeWithLanguageAdapters, type WorkspaceFileIndex } from "./adapters";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
import type { DependencyEntry, SourceAnalysisResult, SourceNotice, PublicSymbolEntry, WorkspaceSymbolIndex } from "./coreTypes";
import {
  collectDependencies,
  mergeDependencyEntries,
  shouldInferDomDependencies,
  augmentWithReExportedSymbols
} from "./dependencies";
import { inferDomDependencies } from "./heuristics/dom";
import { inferRouteDependencies } from "./heuristics/routes";
import { typeScriptBeyondDepth } from "./processMark";
import { inferScriptKind, collectExportedSymbols } from "./symbolExtraction";

// ============================================================================
// Constants
// ============================================================================

const EMPTY_ANALYSIS_RESULT: SourceAnalysisResult = {
  symbols: [],
  dependencies: []
};

// ============================================================================
// Source File Analysis
// ============================================================================

/**
 * Produces symbol and dependency analysis for a single source artifact.
 *
 * @remarks
 * Language-specific adapters run before falling back to the built-in
 * TypeScript/JavaScript parser. This lets polyglot fixtures supply rich metadata
 * without requiring the TypeScript compiler to understand those languages.
 *
 * @param absolutePath - Absolute filesystem path to the source file under inspection.
 * @param workspaceRoot - Workspace root used to normalise relative dependency paths.
 * @param fileIndex - Optional set of workspace file paths for cross-file reference resolution and for bounding DOM markup candidates to the selected scan.
 * @param symbolIndex - The workspace symbol index, when built, so that a call can find the file that serves it.
 *
 * @returns Analyzer output describing exported symbols and detected dependencies.
 *
 * @example
 * ```ts
 * const analysis = await analyzeSourceFile(srcPath, workspaceRoot);
 * if (analysis.symbols.length === 0) {
 *   console.warn("No exports detected");
 * }
 * ```
 */
export async function analyzeSourceFile(
  absolutePath: string,
  workspaceRoot: string,
  fileIndex?: WorkspaceFileIndex,
  symbolIndex?: WorkspaceSymbolIndex
): Promise<SourceAnalysisResult> {
  const extension = path.extname(absolutePath).toLowerCase();

  const adapterResult = await analyzeWithLanguageAdapters({
    absolutePath,
    workspaceRoot,
    fileIndex,
    symbolIndex
  });

  if (adapterResult) {
    return adapterResult;
  }

  if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) {
    return EMPTY_ANALYSIS_RESULT;
  }

  const content = await readSourceText(absolutePath, fileIndex);
  const scriptKind = inferScriptKind(extension);
  const sourceFile = ts.createSourceFile(
    absolutePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );
  // Measured before any walk of ours, so that a file a fresh process might not read marks the process (`processMark.ts`).
  typeScriptBeyondDepth(sourceFile);

  const directSymbols = collectExportedSymbols(sourceFile);
  let dependencies = await collectDependencies({
    sourceFile,
    absolutePath,
    workspaceRoot,
    files: fileIndex
  });

  if (shouldInferDomDependencies(extension)) {
    const domDependencies = await inferDomDependencies({
      absolutePath,
      workspaceRoot,
      sourceFile,
      fileIndex
    });
    if (domDependencies.length > 0) {
      dependencies = mergeDependencyEntries(dependencies, domDependencies);
    }
    if (symbolIndex) {
      const routeDependencies = inferRouteDependencies({
        sourceFile,
        sourcePath: normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath)),
        fileIndex,
        symbolIndex
      });
      if (routeDependencies.length > 0) {
        dependencies = mergeDependencyEntries(dependencies, routeDependencies);
      }
    }
  }

  const { symbols, reExports } = await augmentWithReExportedSymbols({
    sourceAbsolute: absolutePath,
    workspaceRoot,
    dependencies,
    existingSymbols: directSymbols,
    reads: fileIndex
  });

  const notices = unreadPathNotices(dependencies);
  return {
    symbols: sortSymbolsByLocation(symbols),
    dependencies,
    reExportedSymbols: reExports.length > 0 ? reExports : undefined,
    ...(notices.length > 0 ? { notices } : {})
  };
}

/** Why a relative import was not linked: the scan's rules deliberately left the path out. */
const LEFT_OUT_IMPORT = "imports of a path the scan left out, left unread and marked (left out)";
/** Why a bare `export *` from a left-out path names nothing: what the scan leaves out is never read. */
const LEFT_OUT_RE_EXPORT = "re-exports of everything a path the scan left out offers, their names unknown";
/** Why a relative import has no file: no file stands at its path in the listing and no active rule left it out. */
const MISSING_IMPORT = "imports of a path where the scan finds no file, left unread and labelled as written";
/** Why a bare `export *` from a missing path names nothing: no file stands at its path in the listing. */
const MISSING_RE_EXPORT = "re-exports of everything a path offers where the scan finds no file, their names unknown";

/**
 * The relative imports the run's listing holds no file for, each said once by its specifier, for the run to count at its
 * end: left-out paths are distinguished from absent paths now that the leave-out rules answer for paths never entered.
 */
function unreadPathNotices(dependencies: readonly DependencyEntry[]): SourceNotice[] {
  const notices = new Map<string, SourceNotice>();
  for (const dependency of dependencies) {
    if (dependency.resolvedPath || dependency.basis || !dependency.specifier.startsWith(".")) continue;
    const reason = dependency.leftOut
      ? (dependency.reExportAll ? LEFT_OUT_RE_EXPORT : LEFT_OUT_IMPORT)
      : (dependency.reExportAll ? MISSING_RE_EXPORT : MISSING_IMPORT);
    notices.set(`${reason}\u0000${dependency.specifier}`, { reason, subject: dependency.specifier });
  }
  return [...notices.values()];
}

// ============================================================================
// Internal Helpers
// ============================================================================

function sortSymbolsByLocation(symbols: PublicSymbolEntry[]): PublicSymbolEntry[] {
  return [...symbols].sort((a, b) => {
    const aLine = a.location?.line ?? Number.MAX_SAFE_INTEGER;
    const bLine = b.location?.line ?? Number.MAX_SAFE_INTEGER;
    if (aLine !== bLine) {
      return aLine - bLine;
    }

    const aChar = a.location?.character ?? Number.MAX_SAFE_INTEGER;
    const bChar = b.location?.character ?? Number.MAX_SAFE_INTEGER;
    if (aChar !== bChar) {
      return aChar - bChar;
    }

    return compareText(a.name, b.name);
  });
}

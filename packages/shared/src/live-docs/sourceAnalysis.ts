/**
 * Source file analysis for Live Documentation.
 *
 * @remarks
 * This module provides the main entry point for analyzing source files
 * to extract symbols and dependencies for Live Documentation generation.
 *
 * @module
 */

import * as fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import { analyzeWithLanguageAdapters } from "./adapters";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
import type { SourceAnalysisResult, PublicSymbolEntry } from "./coreTypes";
import {
  collectDependencies,
  mergeDependencyEntries,
  shouldInferDomDependencies,
  augmentWithReExportedSymbols
} from "./dependencies";
import { inferDomDependencies } from "./heuristics/dom";
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
  workspaceRoot: string
): Promise<SourceAnalysisResult> {
  const extension = path.extname(absolutePath).toLowerCase();

  const adapterResult = await analyzeWithLanguageAdapters({
    absolutePath,
    workspaceRoot
  });

  if (adapterResult) {
    return adapterResult;
  }

  if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) {
    return EMPTY_ANALYSIS_RESULT;
  }

  const content = await fs.readFile(absolutePath, "utf8");
  const scriptKind = inferScriptKind(extension);
  const sourceFile = ts.createSourceFile(
    absolutePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  const directSymbols = collectExportedSymbols(sourceFile);
  let dependencies = await collectDependencies({
    sourceFile,
    absolutePath,
    workspaceRoot
  });

  if (shouldInferDomDependencies(extension)) {
    const domDependencies = await inferDomDependencies({
      absolutePath,
      workspaceRoot,
      content
    });
    if (domDependencies.length > 0) {
      dependencies = mergeDependencyEntries(dependencies, domDependencies);
    }
  }

  const { symbols, reExports } = await augmentWithReExportedSymbols({
    sourceAbsolute: absolutePath,
    workspaceRoot,
    dependencies,
    existingSymbols: directSymbols
  });

  return {
    symbols: sortSymbolsByLocation(symbols),
    dependencies,
    reExportedSymbols: reExports.length > 0 ? reExports : undefined
  };
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

    return a.name.localeCompare(b.name);
  });
}

/**
 * Dependency collection and resolution for Live Documentation.
 *
 * @remarks
 * This module handles extracting import/export dependencies from TypeScript
 * source files and resolving module specifiers to workspace-relative paths.
 *
 * @module
 */

import path from "node:path";
import ts from "typescript";

import { compareText } from "../tooling/compareText";
import { normalizeWorkspacePath } from "../tooling/pathUtils";
import { readSourceText, type SourceReads, throwIfMachineFailure } from "../tooling/sourceText";
import { type ListedFiles, pathKind } from "../tooling/workspaceProbes";
import { MODULE_RESOLUTION_EXTENSIONS, SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
import type {
  DependencyEntry,
  PublicSymbolEntry,
  ReExportedSymbolInfo
} from "./coreTypes";
import { displayDependencyKey, getNodeLocation } from "./coreUtils";
import { typeScriptBeyondDepth } from "./processMark";
import { inferScriptKind, collectExportedSymbols } from "./symbolExtraction";

// ============================================================================
// Dependency Collection
// ============================================================================

/**
 * Enumerates import and export dependencies declared within a TypeScript source file.
 *
 * @remarks
 * Relative specifiers are resolved against the workspace using Node-style extension
 * fallbacks so the resulting Live Docs can point to concrete files when possible.
 * A dynamic `import("...")` with a string literal, anywhere in the file, is an
 * import of the whole module, as the compiler records it; one whose argument
 * is computed names nothing the docs can carry.
 *
 * @param params.sourceFile - Parsed source file that acts as the dependency origin.
 * @param params.absolutePath - Absolute path to the origin file, used for resolution.
 * @param params.workspaceRoot - Workspace root for normalising resolved paths.
 *
 * @see resolveDependency
 *
 * @returns A sorted list of dependency entries describing specifiers and imported symbols.
 */
export async function collectDependencies(params: {
  sourceFile: ts.SourceFile;
  absolutePath: string;
  workspaceRoot: string;
  files?: ListedFiles;
}): Promise<DependencyEntry[]> {
  const entries: DependencyEntry[] = [];

  for (const statement of params.sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      const symbols = extractImportNames(statement.importClause);
      const resolvedPath = await resolveDependency(specifier, params.absolutePath, params.workspaceRoot, params.files);
      const typeOnlySymbols = typedImportNames(statement.importClause);
      entries.push({
        specifier,
        resolvedPath,
        symbols,
        kind: "import",
        isTypeOnly: statement.importClause ? statement.importClause.isTypeOnly || (symbols.length > 0 && typeOnlySymbols.length === symbols.length) : undefined,
        ...(typeOnlySymbols.length > 0 ? { typeOnlySymbols } : {}),
        location: getNodeLocation(statement, params.sourceFile)
      });
      continue;
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const specifier = statement.moduleSpecifier.text;
      const symbolTargets: Record<string, string> = {};
      const typeOnlySymbols: string[] = [];
      const symbols =
        statement.exportClause && ts.isNamedExports(statement.exportClause)
          ? statement.exportClause.elements.map((element) => {
              const exportedName = element.name.text;
              const originalName = element.propertyName?.text ?? exportedName;
              symbolTargets[exportedName] = originalName;
              if (statement.isTypeOnly || element.isTypeOnly) typeOnlySymbols.push(exportedName);
              return exportedName;
            })
          : [];
      const resolvedPath = await resolveDependency(specifier, params.absolutePath, params.workspaceRoot, params.files);
      const exportIsTypeOnly = Boolean(
        statement.isTypeOnly ||
          (statement.exportClause &&
            ts.isNamedExports(statement.exportClause) &&
            statement.exportClause.elements.length > 0 &&
            statement.exportClause.elements.every((element) => element.isTypeOnly))
      );
      entries.push({
        specifier,
        resolvedPath,
        symbols,
        kind: "export",
        isTypeOnly: exportIsTypeOnly,
        ...(typeOnlySymbols.length > 0 ? { typeOnlySymbols } : {}),
        reExportAll: !statement.exportClause,
        location: getNodeLocation(statement, params.sourceFile),
        symbolTargets: Object.keys(symbolTargets).length > 0 ? symbolTargets : undefined
      });
    }
  }

  for (const call of dynamicImports(params.sourceFile)) {
    const specifier = call.specifier.text;
    entries.push({
      specifier,
      resolvedPath: await resolveDependency(specifier, params.absolutePath, params.workspaceRoot, params.files),
      symbols: [],
      kind: "import",
      location: getNodeLocation(call.node, params.sourceFile)
    });
  }

  entries.sort((a, b) => compareText(displayDependencyKey(a), displayDependencyKey(b)));
  return entries;
}

/** Every `import("literal")` call in the file, in source order. */
function dynamicImports(sourceFile: ts.SourceFile): Array<{ node: ts.CallExpression; specifier: ts.StringLiteral }> {
  const calls: Array<{ node: ts.CallExpression; specifier: ts.StringLiteral }> = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteral(argument)) {
        calls.push({ node, specifier: argument });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return calls;
}

/** The names of an import a written `type` marks, each name's own or its statement's, as {@link extractImportNames} names them. */
function typedImportNames(importClause: ts.ImportClause | undefined): string[] {
  if (!importClause) return [];
  if (importClause.isTypeOnly) return extractImportNames(importClause);
  if (!importClause.namedBindings || !ts.isNamedImports(importClause.namedBindings)) return [];
  return importClause.namedBindings.elements.filter((element) => element.isTypeOnly).map((element) => element.propertyName?.text ?? element.name.text);
}

function extractImportNames(importClause: ts.ImportClause | undefined): string[] {
  if (!importClause) {
    return [];
  }

  const names: string[] = [];

  if (importClause.name) {
    names.push(importClause.name.text);
  }

  if (!importClause.namedBindings) {
    return names;
  }

  // Namespace imports (import * as X) cannot be mapped to specific symbols
  // in the target file, so return empty array to produce a whole-file link
  if (ts.isNamespaceImport(importClause.namedBindings)) {
    return names;
  }

  if (ts.isNamedImports(importClause.namedBindings)) {
    for (const element of importClause.namedBindings.elements) {
      const importedName = element.propertyName?.text ?? element.name.text;
      names.push(importedName);
    }
  }

  return names;
}

// ============================================================================
// Dependency Merging
// ============================================================================

/**
 * Merges additional dependency entries into a base list, combining symbols.
 *
 * @param base - The original dependency list
 * @param extras - Additional dependencies to merge
 * @returns A merged, sorted dependency list
 */
export function mergeDependencyEntries(
  base: DependencyEntry[],
  extras: DependencyEntry[]
): DependencyEntry[] {
  if (extras.length === 0) {
    return base;
  }

  const map = new Map<string, DependencyEntry>();

  const keyOf = (entry: DependencyEntry): string => `${displayDependencyKey(entry)}|${entry.basis ?? ""}|${entry.reExportAll ? "star" : ""}`;

  for (const entry of base) {
    const clone = cloneDependency(entry);
    map.set(keyOf(clone), clone);
  }

  for (const entry of extras) {
    const key = keyOf(entry);
    const existing = map.get(key);
    if (existing) {
      for (const symbol of entry.symbols) {
        if (!existing.symbols.includes(symbol)) {
          existing.symbols.push(symbol);
        }
      }
      existing.symbols.sort();

      if (!existing.resolvedPath && entry.resolvedPath) {
        existing.resolvedPath = entry.resolvedPath;
      }

      if (entry.symbolTargets) {
        existing.symbolTargets = mergeSymbolTargets(existing.symbolTargets, entry.symbolTargets);
      }

      if (entry.isTypeOnly && !existing.isTypeOnly) {
        existing.isTypeOnly = entry.isTypeOnly;
      }
      for (const symbol of entry.typeOnlySymbols ?? []) {
        if (!(existing.typeOnlySymbols ??= []).includes(symbol)) existing.typeOnlySymbols.push(symbol);
      }

      if (!existing.location && entry.location) {
        existing.location = { ...entry.location };
      }
      continue;
    }

    map.set(key, cloneDependency(entry));
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => compareText(displayDependencyKey(a), displayDependencyKey(b)));
  return merged;
}

function cloneDependency(entry: DependencyEntry): DependencyEntry {
  return {
    specifier: entry.specifier,
    resolvedPath: entry.resolvedPath,
    symbols: [...entry.symbols],
    kind: entry.kind,
    isTypeOnly: entry.isTypeOnly,
    ...(entry.typeOnlySymbols ? { typeOnlySymbols: [...entry.typeOnlySymbols] } : {}),
    location: entry.location ? { ...entry.location } : undefined,
    symbolTargets: entry.symbolTargets ? { ...entry.symbolTargets } : undefined,
    reExportAll: entry.reExportAll,
    basis: entry.basis
  };
}

function mergeSymbolTargets(
  existing: Record<string, string> | undefined,
  incoming: Record<string, string>
): Record<string, string> {
  if (!existing) {
    return { ...incoming };
  }
  return { ...existing, ...incoming };
}

// ============================================================================
// Dependency Resolution
// ============================================================================

/**
 * Resolves a relative module specifier to a workspace-relative file path.
 *
 * @param specifier - Module specifier as written in the source file (for example, "./utils").
 * @param fromFile - Absolute path to the file containing the specifier.
 * @param workspaceRoot - Workspace root used to convert to a relative path.
 *
 * @see collectDependencies
 *
 * @returns The normalised relative path when resolution succeeds, otherwise `undefined`.
 */
export function resolveDependency(
  specifier: string,
  fromFile: string,
  workspaceRoot: string,
  files?: ListedFiles
): Promise<string | undefined> {
  // Answered at once from the run's listing (or the disk, for no run) since 2026-11-22; kept a promise for its callers.
  return Promise.resolve(resolvedDependency(specifier, fromFile, workspaceRoot, files));
}

/**
 * A specifier's file among those the scan keeps: what the scan leaves out is never read, so an import of one is
 * labelled as the kept file wrote it (2026-11-22, root's ruling, measured first to move no fact of real code).
 */
function resolvedDependency(specifier: string, fromFile: string, workspaceRoot: string, files: ListedFiles | undefined): string | undefined {
  if (!specifier.startsWith(".")) {
    return resolveWorkspaceAlias(specifier, workspaceRoot, files);
  }

  const base = path.resolve(path.dirname(fromFile), specifier);
  const resolved = resolveWithExtensions(base, files);
  if (!resolved) {
    return undefined;
  }

  return normalizeWorkspacePath(path.relative(workspaceRoot, resolved));
}

function resolveWorkspaceAlias(
  specifier: string,
  workspaceRoot: string,
  files?: ListedFiles
): string | undefined {
  const prefix = "@live-documentation/";
  if (!specifier.startsWith(prefix)) {
    if (specifier.startsWith("@/")) {
      const remainder = specifier.slice(2);
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, "src", remainder)], files);
    }

    if (specifier.startsWith("~/")) {
      const remainder = specifier.slice(2);
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, "src", remainder)], files);
    }

    const aliasMatch = specifier.match(/^@([^/]+)\/?(.*)$/);
    if (aliasMatch) {
      const [, aliasName, rawRemainder] = aliasMatch;
      const remainder = rawRemainder ?? "";
      const candidates: string[] = [];
      candidates.push(path.resolve(workspaceRoot, "packages", aliasName, "src", remainder));
      candidates.push(path.resolve(workspaceRoot, "src", aliasName, remainder));
      if (remainder) {
        candidates.push(path.resolve(workspaceRoot, "src", remainder));
      }

      const resolved = resolveAliasCandidates(workspaceRoot, candidates, files);
      if (resolved) {
        return resolved;
      }
    }

    if (specifier.startsWith("src/")) {
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, specifier)], files);
    }

    return undefined;
  }

  const remainder = specifier.slice(prefix.length);
  if (!remainder) {
    return undefined;
  }

  const segments = remainder.split("/");
  const packageName = segments.shift();
  if (!packageName) {
    return undefined;
  }

  const candidateBase = path.resolve(workspaceRoot, "packages", packageName, "src", ...segments);
  const matched = resolveWithExtensions(candidateBase, files);
  if (!matched) {
    return undefined;
  }
  return normalizeWorkspacePath(path.relative(workspaceRoot, matched));
}

function resolveAliasCandidates(
  workspaceRoot: string,
  candidates: string[],
  files?: ListedFiles
): string | undefined {
  for (const candidate of candidates) {
    const matched = resolveWithExtensions(candidate, files);
    if (matched) {
      return normalizeWorkspacePath(path.relative(workspaceRoot, matched));
    }
  }
  return undefined;
}

/** The TypeScript sources a specifier written with a JavaScript extension may name. */
const TYPESCRIPT_SOURCES_FOR: Record<string, string[]> = {
  ".js":  [".ts", ".tsx"],
  ".jsx": [".tsx"],
  ".mjs": [".mts"],
  ".cjs": [".cts"]
};

function resolveWithExtensions(basePath: string, files?: ListedFiles): string | undefined {
  const attempts: string[] = [];
  const explicitExt = path.extname(basePath);

  if (MODULE_RESOLUTION_EXTENSIONS.includes(explicitExt)) {
    // "./widget.ts" names that file; "./widget.js" names the TypeScript source it compiles from.
    const stem = basePath.slice(0, basePath.length - explicitExt.length);
    attempts.push(basePath, ...(TYPESCRIPT_SOURCES_FOR[explicitExt] ?? []).map((ext) => `${stem}${ext}`));
  } else {
    // Anything else is a whole file name: "./csharp.dependencies" is csharp.dependencies.ts, not csharp.ts.
    for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
      attempts.push(`${basePath}${ext}`);
    }
    for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
      attempts.push(path.join(basePath, `index${ext}`));
    }
  }

  for (const candidate of attempts) {
    if (pathKind(candidate, files) === "file") {
      return candidate;
    }
  }

  return undefined;
}

// ============================================================================
// Re-Export Symbol Collection
// ============================================================================

/**
 * Checks if DOM dependency inference should run for a file type.
 */
export function shouldInferDomDependencies(extension: string): boolean {
  switch (extension) {
    case ".ts":
    case ".tsx":
    case ".js":
    case ".jsx":
      return true;
    default:
      return false;
  }
}

/**
 * Augments symbol list with re-exported symbols from star exports.
 *
 * For pure barrel files (no existing symbols), re-exports are returned in the
 * `reExports` array rather than being added to `symbols`. This ensures:
 * - The "Public Symbols" section correctly shows no declared symbols
 * - The "Re-Exported Symbol Anchors" section lists what the barrel re-exports
 * - Precision metrics remain accurate (re-exports aren't declared in the file)
 *
 * @param params - Parameters for augmentation
 * @returns Object containing augmented symbols and re-export info
 */
export async function augmentWithReExportedSymbols(params: {
  sourceAbsolute: string;
  workspaceRoot: string;
  dependencies: DependencyEntry[];
  existingSymbols: PublicSymbolEntry[];
  /** The run's reads, so that a provider behind `export *` is read through the run's one read of it. */
  reads?: SourceReads & ListedFiles;
}): Promise<{ symbols: PublicSymbolEntry[]; reExports: ReExportedSymbolInfo[] }> {
  if (!params.dependencies.some((entry) => entry.reExportAll)) {
    return { symbols: params.existingSymbols, reExports: [] };
  }

  const reExports = await collectReExportStarSymbols({
    sourceAbsolute: params.sourceAbsolute,
    workspaceRoot: params.workspaceRoot,
    dependencies: params.dependencies,
    existingSymbols: params.existingSymbols,
    reads: params.reads
  });

  if (reExports.length === 0) {
    return { symbols: params.existingSymbols, reExports: [] };
  }

  // Always return re-exports in the dedicated array. For pure barrel files
  // (existingSymbols.length === 0), this ensures the Public Symbols section
  // correctly shows "No public symbols detected" while the Re-Exported Symbol
  // Anchors section displays the re-exported API surface.
  return { symbols: params.existingSymbols, reExports };
}

async function collectReExportStarSymbols(params: {
  sourceAbsolute: string;
  workspaceRoot: string;
  dependencies: DependencyEntry[];
  existingSymbols: PublicSymbolEntry[];
  reads?: SourceReads & ListedFiles;
}): Promise<ReExportedSymbolInfo[]> {
  const results: ReExportedSymbolInfo[] = [];
  const seen = new Set(params.existingSymbols.map((entry) => entry.name));
  const cache = new Map<string, PublicSymbolEntry[]>();

  for (const dependency of params.dependencies) {
    if (!dependency.reExportAll || !dependency.resolvedPath) continue;

    const targetAbsolute = path.resolve(params.workspaceRoot, dependency.resolvedPath);
    const stack = new Set<string>([path.resolve(params.sourceAbsolute)]);
    const exportedSymbols = await gatherExportedSymbolsFromFile({
      absolutePath: targetAbsolute,
      workspaceRoot: params.workspaceRoot,
      cache,
      stack,
      reads: params.reads
    });

    if (!exportedSymbols.length) {
      continue;
    }

    for (const symbol of exportedSymbols) {
      if (!symbol.name || symbol.isDefault || seen.has(symbol.name)) {
        continue;
      }

      results.push({
        name: symbol.name,
        kind: symbol.kind,
        isTypeOnly: symbol.isTypeOnly,
        location: dependency.location ?? { line: 1, character: 1 },
        sourceModulePath: dependency.resolvedPath
      });
      seen.add(symbol.name);
    }
  }

  return results;
}

async function gatherExportedSymbolsFromFile(params: {
  absolutePath: string;
  workspaceRoot: string;
  cache: Map<string, PublicSymbolEntry[]>;
  stack: Set<string>;
  reads?: SourceReads & ListedFiles;
}): Promise<PublicSymbolEntry[]> {
  const normalized = path.resolve(params.absolutePath);

  if (params.cache.has(normalized)) {
    return params.cache.get(normalized)!;
  }

  if (params.stack.has(normalized)) {
    return [];
  }

  params.stack.add(normalized);

  const extension = path.extname(normalized).toLowerCase();
  if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) {
    params.stack.delete(normalized);
    params.cache.set(normalized, []);
    return [];
  }

  let content: string;
  try {
    content = await readSourceText(normalized, params.reads);
  } catch (error) {
    // A file that cannot be read is read as exporting nothing, but a failure of the machine's (too many open files, a
    // file Windows holds) is no property of the file and is thrown, so that no summary is made with it (`processMark.ts`).
    throwIfMachineFailure(error);
    params.stack.delete(normalized);
    params.cache.set(normalized, []);
    return [];
  }

  const scriptKind = inferScriptKind(extension);
  const sourceFile = ts.createSourceFile(
    normalized,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );
  // A provider behind `export *` may be a file the analysis pass never parses (one the configuration excludes, say).
  typeScriptBeyondDepth(sourceFile);

  const directSymbols = collectExportedSymbols(sourceFile);
  const dependencies = await collectDependencies({
    sourceFile,
    absolutePath: normalized,
    workspaceRoot: params.workspaceRoot,
    files: params.reads
  });

  const aggregated: PublicSymbolEntry[] = [...directSymbols];

  for (const dependency of dependencies) {
    if (!dependency.reExportAll || !dependency.resolvedPath) {
      continue;
    }

    const childAbsolute = path.resolve(params.workspaceRoot, dependency.resolvedPath);
    const nested = await gatherExportedSymbolsFromFile({
      absolutePath: childAbsolute,
      workspaceRoot: params.workspaceRoot,
      cache: params.cache,
      stack: params.stack,
      reads: params.reads
    });

    for (const entry of nested) {
      if (!entry.name || entry.isDefault) {
        continue;
      }
      if (!aggregated.some((candidate) => candidate.name === entry.name)) {
        aggregated.push(entry);
      }
    }
  }

  params.stack.delete(normalized);
  params.cache.set(normalized, aggregated);
  return aggregated;
}

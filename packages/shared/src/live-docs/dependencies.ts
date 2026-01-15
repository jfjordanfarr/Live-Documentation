/**
 * Dependency collection and resolution for Live Documentation.
 *
 * @remarks
 * This module handles extracting import/export dependencies from TypeScript
 * source files and resolving module specifiers to workspace-relative paths.
 *
 * @module
 */

import * as fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import { MODULE_RESOLUTION_EXTENSIONS, SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
import type {
  DependencyEntry,
  PublicSymbolEntry,
  ReExportedSymbolInfo
} from "./coreTypes";
import { displayDependencyKey, getNodeLocation } from "./coreUtils";
import { inferScriptKind, collectExportedSymbols } from "./symbolExtraction";
import { normalizeWorkspacePath } from "../tooling/pathUtils";

// ============================================================================
// Dependency Collection
// ============================================================================

/**
 * Enumerates import and export dependencies declared within a TypeScript source file.
 *
 * @remarks
 * Relative specifiers are resolved against the workspace using Node-style extension
 * fallbacks so the resulting Live Docs can point to concrete files when possible.
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
}): Promise<DependencyEntry[]> {
  const entries: DependencyEntry[] = [];

  for (const statement of params.sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      const symbols = extractImportNames(statement.importClause);
      const resolvedPath = await resolveDependency(specifier, params.absolutePath, params.workspaceRoot);
      entries.push({
        specifier,
        resolvedPath,
        symbols,
        kind: "import",
        isTypeOnly: statement.importClause?.isTypeOnly,
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
      const symbols =
        statement.exportClause && ts.isNamedExports(statement.exportClause)
          ? statement.exportClause.elements.map((element) => {
              const exportedName = element.name.text;
              const originalName = element.propertyName?.text ?? exportedName;
              symbolTargets[exportedName] = originalName;
              return exportedName;
            })
          : [];
      const resolvedPath = await resolveDependency(specifier, params.absolutePath, params.workspaceRoot);
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
        location: getNodeLocation(statement, params.sourceFile),
        symbolTargets: Object.keys(symbolTargets).length > 0 ? symbolTargets : undefined
      });
    }
  }

  entries.sort((a, b) => displayDependencyKey(a).localeCompare(displayDependencyKey(b)));
  return entries;
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

  for (const entry of base) {
    const clone = cloneDependency(entry);
    map.set(displayDependencyKey(clone), clone);
  }

  for (const entry of extras) {
    const key = displayDependencyKey(entry);
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

      if (!existing.location && entry.location) {
        existing.location = { ...entry.location };
      }
      continue;
    }

    map.set(key, cloneDependency(entry));
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => displayDependencyKey(a).localeCompare(displayDependencyKey(b)));
  return merged;
}

function cloneDependency(entry: DependencyEntry): DependencyEntry {
  return {
    specifier: entry.specifier,
    resolvedPath: entry.resolvedPath,
    symbols: [...entry.symbols],
    kind: entry.kind,
    isTypeOnly: entry.isTypeOnly,
    location: entry.location ? { ...entry.location } : undefined,
    symbolTargets: entry.symbolTargets ? { ...entry.symbolTargets } : undefined
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
export async function resolveDependency(
  specifier: string,
  fromFile: string,
  workspaceRoot: string
): Promise<string | undefined> {
  if (!specifier.startsWith(".")) {
    return resolveWorkspaceAlias(specifier, workspaceRoot);
  }

  const base = path.resolve(path.dirname(fromFile), specifier);
  const resolved = await resolveWithExtensions(base);
  if (!resolved) {
    return undefined;
  }

  return normalizeWorkspacePath(path.relative(workspaceRoot, resolved));
}

async function resolveWorkspaceAlias(
  specifier: string,
  workspaceRoot: string
): Promise<string | undefined> {
  const prefix = "@live-documentation/";
  if (!specifier.startsWith(prefix)) {
    if (specifier.startsWith("@/")) {
      const remainder = specifier.slice(2);
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, "src", remainder)]);
    }

    if (specifier.startsWith("~/")) {
      const remainder = specifier.slice(2);
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, "src", remainder)]);
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

      const resolved = await resolveAliasCandidates(workspaceRoot, candidates);
      if (resolved) {
        return resolved;
      }
    }

    if (specifier.startsWith("src/")) {
      return resolveAliasCandidates(workspaceRoot, [path.resolve(workspaceRoot, specifier)]);
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
  const matched = await resolveWithExtensions(candidateBase);
  if (!matched) {
    return undefined;
  }
  return normalizeWorkspacePath(path.relative(workspaceRoot, matched));
}

async function resolveAliasCandidates(
  workspaceRoot: string,
  candidates: string[]
): Promise<string | undefined> {
  for (const candidate of candidates) {
    const matched = await resolveWithExtensions(candidate);
    if (matched) {
      return normalizeWorkspacePath(path.relative(workspaceRoot, matched));
    }
  }
  return undefined;
}

async function resolveWithExtensions(basePath: string): Promise<string | undefined> {
  const attempts: string[] = [];
  const explicitExt = path.extname(basePath);

  if (explicitExt) {
    attempts.push(basePath);
  } else {
    for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
      attempts.push(`${basePath}${ext}`);
    }
  }

  const indexBase = explicitExt ? basePath.slice(0, basePath.length - explicitExt.length) : basePath;
  for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
    attempts.push(path.join(indexBase, `index${ext}`));
  }

  for (const candidate of attempts) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
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
}): Promise<{ symbols: PublicSymbolEntry[]; reExports: ReExportedSymbolInfo[] }> {
  if (!params.dependencies.some((entry) => entry.kind === "export")) {
    return { symbols: params.existingSymbols, reExports: [] };
  }

  const reExports = await collectReExportStarSymbols({
    sourceAbsolute: params.sourceAbsolute,
    workspaceRoot: params.workspaceRoot,
    dependencies: params.dependencies,
    existingSymbols: params.existingSymbols
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
}): Promise<ReExportedSymbolInfo[]> {
  const results: ReExportedSymbolInfo[] = [];
  const seen = new Set(params.existingSymbols.map((entry) => entry.name));
  const cache = new Map<string, PublicSymbolEntry[]>();

  for (const dependency of params.dependencies) {
    if (dependency.kind !== "export") {
      continue;
    }

    if (!dependency.resolvedPath) {
      continue;
    }

    if (dependency.symbols.length > 0) {
      // Named re-exports already contribute symbols via collectExportedSymbols.
      continue;
    }

    const targetAbsolute = path.resolve(params.workspaceRoot, dependency.resolvedPath);
    const stack = new Set<string>([path.resolve(params.sourceAbsolute)]);
    const exportedSymbols = await gatherExportedSymbolsFromFile({
      absolutePath: targetAbsolute,
      workspaceRoot: params.workspaceRoot,
      cache,
      stack
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
    content = await fs.readFile(normalized, "utf8");
  } catch {
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

  const directSymbols = collectExportedSymbols(sourceFile);
  const dependencies = await collectDependencies({
    sourceFile,
    absolutePath: normalized,
    workspaceRoot: params.workspaceRoot
  });

  const aggregated: PublicSymbolEntry[] = [...directSymbols];

  for (const dependency of dependencies) {
    if (dependency.kind !== "export" || dependency.symbols.length > 0 || !dependency.resolvedPath) {
      continue;
    }

    const childAbsolute = path.resolve(params.workspaceRoot, dependency.resolvedPath);
    const nested = await gatherExportedSymbolsFromFile({
      absolutePath: childAbsolute,
      workspaceRoot: params.workspaceRoot,
      cache: params.cache,
      stack: params.stack
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

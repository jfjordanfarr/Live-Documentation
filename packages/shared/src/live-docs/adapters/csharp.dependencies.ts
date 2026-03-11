/**
 * C# dependency extraction module.
 *
 * Extracts dependency information from C# source files including:
 * - using directives (namespace imports)
 * - Configuration/AppSettings references
 * - Type.GetType() reflection calls
 * - Hangfire background job targets
 *
 * @module csharp.dependencies
 */

import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry } from "../core";

// Pattern definitions
const USING_DIRECTIVE_PATTERN = /^\s*using\s+(?:static\s+)?([^;]+);/gm;
const USING_ALIAS_SEPARATOR = "=";
const BUILT_IN_NAMESPACE_PREFIX = "System";
const APP_SETTINGS_PATTERN = /ConfigurationManager\.AppSettings\s*\[\s*"([^"]+)"\s*\]/g;
const CONFIGURATION_INDEXER_PATTERN = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*"([^"]+)"\s*\]/g;
const TYPE_GET_TYPE_PATTERN = /Type\.GetType\s*\(\s*"([^"]+)"\s*\)/g;
const TYPE_NAME_LITERAL_PATTERN = /"([A-Z][A-Za-z0-9_]*(?:\.[A-Z][A-Za-z0-9_]*)+)"/g;
const HANGFIRE_GENERIC_CALL_PATTERN = /\b(?:BackgroundJob|IBackgroundJobClient|RecurringJob|IRecurringJobManager)\s*\.\s*(?:Enqueue|Schedule|AddOrUpdate)\s*<\s*([^>\s]+)\s*>/g;
const HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*(Enqueue|Schedule|AddOrUpdate)\s*<\s*([^>\s]+)\s*>/g;

/**
 * Parameters for dependency extraction.
 */
export interface ExtractDependenciesParams {
  /** Source file content */
  content: string;
  /** Absolute path to the source file */
  absolutePath: string;
  /** Workspace root directory */
  workspaceRoot: string;
  /** Optional function to extract symbols from content (for reflection resolution) */
  extractSymbolsFn?: (content: string) => PublicSymbolEntry[];
}

/**
 * Extracts all dependencies from a C# source file.
 *
 * @param params - Extraction parameters
 * @returns Array of dependency entries
 */
export async function extractDependencies(params: ExtractDependenciesParams): Promise<DependencyEntry[]> {
  const { content, absolutePath, workspaceRoot, extractSymbolsFn } = params;
  const namespaces = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = USING_DIRECTIVE_PATTERN.exec(content)) !== null) {
    let directive = match[1]?.trim();
    if (!directive) {
      continue;
    }

    // Handle using aliases: `using RTypes = Rosetta.Types;`
    // Extract the namespace from the right-hand side of the alias
    if (directive.includes(USING_ALIAS_SEPARATOR)) {
      const parts = directive.split(USING_ALIAS_SEPARATOR);
      directive = parts[1]?.trim() ?? "";
      if (!directive) continue;
    }

    const normalized = directive.replace(/\s+/g, "");
    if (!normalized) {
      continue;
    }

    if (
      normalized === BUILT_IN_NAMESPACE_PREFIX ||
      normalized.startsWith(`${BUILT_IN_NAMESPACE_PREFIX}.`)
    ) {
      continue;
    }

    namespaces.add(normalized);
  }

  USING_DIRECTIVE_PATTERN.lastIndex = 0;

  const dependencies = Array.from(namespaces)
    .sort((a, b) => a.localeCompare(b))
    .map((specifier) => ({
      specifier,
      resolvedPath: undefined,
      symbols: [],
      kind: "import"
    })) as DependencyEntry[];

  const appSettingsMatches = collectConfigKeys(APP_SETTINGS_PATTERN, content);
  if (appSettingsMatches.size > 0) {
    const configPath = await locateNearestFile(absolutePath, workspaceRoot, ["Web.config", "web.config", "App.config", "app.config"]);
    if (configPath) {
      dependencies.push({
        specifier: configPath,
        resolvedPath: configPath,
        symbols: Array.from(appSettingsMatches).sort(),
        kind: "import"
      });
    }
  }

  const configurationKeys = collectConfigurationIndexerKeys(content);
  if (configurationKeys.size > 0) {
    const appsettingsPath = await locateNearestFile(absolutePath, workspaceRoot, [
      "appsettings.json",
      "appsettings.Development.json",
      "appsettings.Production.json"
    ]);
    if (appsettingsPath) {
      dependencies.push({
        specifier: appsettingsPath,
        resolvedPath: appsettingsPath,
        symbols: Array.from(configurationKeys).sort(),
        kind: "import"
      });
    }
  }

  const reflectionTypes = collectConfigKeys(TYPE_GET_TYPE_PATTERN, content);
  const literalTypeNames = collectTypeNameLiterals(content);
  const combinedTypeNames = new Set<string>([...reflectionTypes, ...literalTypeNames]);
  if (combinedTypeNames.size > 0) {
    const resolvedTypes = await resolveReflectionTargets(Array.from(combinedTypeNames), workspaceRoot, extractSymbolsFn);
    for (const resolved of resolvedTypes) {
      dependencies.push(resolved);
    }
  }

  const hangfireTargets = collectHangfireTargets(content);
  if (hangfireTargets.size > 0) {
    const resolved = await resolveReflectionTargets(Array.from(hangfireTargets), workspaceRoot, extractSymbolsFn);
    dependencies.push(...resolved);
  }

  return dependencies;
}

/**
 * Collects configuration keys using a given regex pattern.
 *
 * @param pattern - Regex pattern with capture group for the key
 * @param content - Source content to search
 * @returns Set of matched keys
 */
export function collectConfigKeys(pattern: RegExp, content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const value = match[1]?.trim();
    if (value) {
      results.add(value);
    }
  }

  pattern.lastIndex = 0;
  return results;
}

/**
 * Collects configuration keys from IConfiguration indexer patterns.
 * Only matches identifiers that contain "config" (case-insensitive).
 *
 * @param content - Source content to search
 * @returns Set of configuration keys
 */
export function collectConfigurationIndexerKeys(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = CONFIGURATION_INDEXER_PATTERN.exec(content)) !== null) {
    const identifier = match[1]?.trim();
    const key = match[2]?.trim();
    if (!key) {
      continue;
    }

    if (identifier && /config/i.test(identifier)) {
      results.add(key);
    }
  }

  CONFIGURATION_INDEXER_PATTERN.lastIndex = 0;
  return results;
}

/**
 * Collects fully-qualified type name literals from string constants.
 * Looks for patterns like "MyNamespace.MyClass" in string literals.
 *
 * @param content - Source content to search
 * @returns Set of type names
 */
export function collectTypeNameLiterals(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = TYPE_NAME_LITERAL_PATTERN.exec(content)) !== null) {
    const literal = match[1]?.trim();
    if (!literal) {
      continue;
    }

    const segments = literal.split(".");
    if (segments.length < 2) {
      continue;
    }

    if (!segments.every((segment) => /^[A-Z]/.test(segment))) {
      continue;
    }

    const preceding = content[match.index - 1];
    if (preceding && /[A-Za-z0-9_]/.test(preceding)) {
      continue;
    }

    results.add(literal);
  }

  TYPE_NAME_LITERAL_PATTERN.lastIndex = 0;
  return results;
}

/**
 * Collects Hangfire background job target types.
 * Detects BackgroundJob.Enqueue<T>, RecurringJob.AddOrUpdate<T>, etc.
 *
 * @param content - Source content to search
 * @returns Set of target type names
 */
export function collectHangfireTargets(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = HANGFIRE_GENERIC_CALL_PATTERN.exec(content)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }
    const candidate = raw.replace(/\s+/g, "");
    if (candidate.includes("(")) {
      continue;
    }
    results.add(candidate);
  }

  HANGFIRE_GENERIC_CALL_PATTERN.lastIndex = 0;

  const recurringManagers = collectTypeIdentifiers(content, "IRecurringJobManager");
  const backgroundClients = collectTypeIdentifiers(content, "IBackgroundJobClient");
  const aliasCandidates = new Set<string>([...recurringManagers, ...backgroundClients]);

  while ((match = HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN.exec(content)) !== null) {
    const alias = match[1]?.trim();
    const method = match[2]?.trim();
    const raw = match[3]?.trim();
    if (!alias || !raw) {
      continue;
    }

    if (!aliasCandidates.has(alias)) {
      continue;
    }

    if (method === "AddOrUpdate" && !recurringManagers.has(alias)) {
      continue;
    }

    const candidate = raw.replace(/\s+/g, "");
    if (candidate.includes("(")) {
      continue;
    }

    results.add(candidate);
  }

  HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN.lastIndex = 0;
  return results;
}

/**
 * Collects variable identifiers declared with a specific type.
 *
 * @param content - Source content to search
 * @param typeName - Type name to search for (e.g., "IRecurringJobManager")
 * @returns Set of variable identifiers
 */
export function collectTypeIdentifiers(content: string, typeName: string): Set<string> {
  const results = new Set<string>();
  const pattern = new RegExp(`\\b${typeName}\\s+([A-Za-z_][A-Za-z0-9_]*)`, "g");
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const identifier = match[1]?.trim();
    if (identifier) {
      results.add(identifier);
    }
  }

  pattern.lastIndex = 0;
  return results;
}

/**
 * Locates the nearest file matching one of the candidate names,
 * searching from the source file's directory up to the workspace root.
 *
 * @param sourcePath - Path to the source file
 * @param workspaceRoot - Workspace root directory
 * @param candidates - List of filenames to search for
 * @returns Normalized workspace-relative path, or undefined if not found
 */
export async function locateNearestFile(
  sourcePath: string,
  workspaceRoot: string,
  candidates: string[]
): Promise<string | undefined> {
  const workspaceResolved = path.resolve(workspaceRoot);
  let current = path.resolve(path.dirname(sourcePath));

  while (true) {
    for (const candidate of candidates) {
      const absoluteCandidate = path.join(current, candidate);
      if (await fileExists(absoluteCandidate)) {
        return normalizeWorkspacePath(path.relative(workspaceRoot, absoluteCandidate));
      }
    }

    if (current === workspaceResolved) {
      break;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return undefined;
}

/**
 * Checks if a file exists at the given path.
 *
 * @param candidate - Path to check
 * @returns True if the file exists
 */
export async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Resolves reflection target type names to workspace files.
 *
 * @param typeNames - Array of fully-qualified type names
 * @param workspaceRoot - Workspace root directory
 * @param extractSymbolsFn - Optional function to extract symbols from file content
 * @returns Array of resolved dependency entries
 */
export async function resolveReflectionTargets(
  typeNames: string[],
  workspaceRoot: string,
  extractSymbolsFn?: (content: string) => PublicSymbolEntry[]
): Promise<DependencyEntry[]> {
  const results: DependencyEntry[] = [];

  for (const typeName of typeNames) {
    const resolved = await resolveReflectionTarget(typeName, workspaceRoot, extractSymbolsFn);
    if (resolved) {
      results.push(resolved);
    }
  }

  return results;
}

/**
 * Resolves a single reflection target type name to a workspace file.
 *
 * @param typeName - Fully-qualified type name (e.g., "MyNamespace.MyClass")
 * @param workspaceRoot - Workspace root directory
 * @param extractSymbolsFn - Optional function to extract symbols from file content
 * @returns Resolved dependency entry, or undefined if not found
 */
export async function resolveReflectionTarget(
  typeName: string,
  workspaceRoot: string,
  extractSymbolsFn?: (content: string) => PublicSymbolEntry[]
): Promise<DependencyEntry | undefined> {
  const segments = typeName.split(".").filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  const simpleName = segments[segments.length - 1];
  const namespacePrefix = segments.slice(0, -1).join(".");

  const pattern = `**/${simpleName}.cs`;
  const matches = await glob(pattern, {
    cwd: workspaceRoot,
    absolute: true,
    nodir: true,
    windowsPathsNoEscape: true
  });

  for (const candidate of matches) {
    const content = await readFileSafe(candidate);
    if (!content) {
      continue;
    }

    if (namespacePrefix && !content.includes(`namespace ${namespacePrefix}`)) {
      continue;
    }

    const relative = normalizeWorkspacePath(path.relative(workspaceRoot, candidate));
    let symbolTargets: Record<string, string> | undefined;

    if (extractSymbolsFn) {
      const symbolEntries = extractSymbolsFn(content);
      const targetSymbol = symbolEntries.find((entry) => entry.name === simpleName && entry.kind);
      if (targetSymbol?.kind) {
        const normalizedKind = targetSymbol.kind.toLowerCase();
        symbolTargets = {
          [typeName]: `${targetSymbol.name} (${normalizedKind})`
        };
      }
    }

    return {
      specifier: relative,
      resolvedPath: relative,
      symbols: [typeName],
      kind: "import",
      symbolTargets
    };
  }

  return undefined;
}

/**
 * Safely reads a file, returning undefined on error.
 *
 * @param filePath - Path to the file
 * @returns File content or undefined
 */
export async function readFileSafe(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

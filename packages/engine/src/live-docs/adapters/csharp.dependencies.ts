/**
 * The C# dependencies no compiler sees.
 *
 * The C# adapter resolves type names through the syntax tree. This module covers
 * the patterns that reach outside the language: configuration keys read through
 * `ConfigurationManager` and `IConfiguration`, WCF client endpoint names, types
 * named in string literals for reflection, and Hangfire job targets. Its
 * patterns run over the file's text with every comment the syntax tree finds
 * written over in spaces, so that a commented-out key, type or job is not
 * read (the comment guard of 2026-11-21, `commentGuard.test.ts`).
 *
 * @module csharp.dependencies
 */
import { compareText } from "../../tooling/compareText";
import type { DependencyEntry } from "../core";
import { folderOf, joinWorkspacePath, lookUpWorkspaceFile } from "./dotnetPaths";
import type { WorkspaceFileIndex } from "./index";

const APP_SETTINGS_PATTERN                  = /ConfigurationManager\.AppSettings\s*\[\s*"([^"]+)"\s*\]/g;
const CONFIGURATION_INDEXER_PATTERN         = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*"([^"]+)"\s*\]/g;
const TYPE_GET_TYPE_PATTERN                 = /Type\.GetType\s*\(\s*"([^"]+)"\s*\)/g;
const TYPE_NAME_LITERAL_PATTERN             = /"([A-Z][A-Za-z0-9_]*(?:\.[A-Z][A-Za-z0-9_]*)+)"/g;
const HANGFIRE_GENERIC_CALL_PATTERN         = /\b(?:BackgroundJob|IBackgroundJobClient|RecurringJob|IRecurringJobManager)\s*\.\s*(?:Enqueue|Schedule|AddOrUpdate)\s*<\s*([^>\s]+)\s*>/g;
const HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*(Enqueue|Schedule|AddOrUpdate)\s*<\s*([^>\s]+)\s*>/g;

const DOTNET_CONFIG_FILES = ["Web.config", "App.config"];
const APPSETTINGS_FILES   = ["appsettings.json", "appsettings.Development.json", "appsettings.Production.json"];

/** A configuration name the syntax tree found, with its key resolved from a literal or a constant. */
export interface ConfigReference {
  kind: "appSetting" | "connectionString" | "endpoint";
  name: string;
}

/** A workspace file that declares the named type. */
export interface ResolvedTypeTarget {
  file: string;
  name: string;
}

/** Resolves a simple or qualified type name to the workspace files that declare it. */
export type TypeResolver = (typeName: string) => ResolvedTypeTarget[];

/** Extracts the configuration, reflection and Hangfire dependencies of one C# file. */
export function extractDynamicDependencies(params: {
  /** The file's text, its comments written over. */
  content:          string;
  /** The C# file's workspace-relative path. */
  thisFile:         string;
  fileIndex:        WorkspaceFileIndex | undefined;
  configReferences: ConfigReference[];
  resolveType:      TypeResolver;
}): DependencyEntry[] {
  const { content, thisFile, fileIndex, configReferences, resolveType } = params;
  const dependencies: DependencyEntry[] = [];

  const configNames = collectConfigKeys(APP_SETTINGS_PATTERN, content);
  for (const reference of configReferences) configNames.add(reference.name);
  if (configNames.size > 0) {
    const configPath = locateNearestFile(thisFile, DOTNET_CONFIG_FILES, fileIndex);
    if (configPath) {
      dependencies.push({ specifier: configPath, resolvedPath: configPath, symbols: Array.from(configNames).sort(), kind: "import" });
    }
  }

  const configurationKeys = collectConfigurationIndexerKeys(content);
  if (configurationKeys.size > 0) {
    const appsettingsPath = locateNearestFile(thisFile, APPSETTINGS_FILES, fileIndex);
    if (appsettingsPath) {
      dependencies.push({ specifier: appsettingsPath, resolvedPath: appsettingsPath, symbols: Array.from(configurationKeys).sort(), kind: "import" });
    }
  }

  const typeNames = new Set<string>([
    ...collectConfigKeys(TYPE_GET_TYPE_PATTERN, content),
    ...collectTypeNameLiterals(content),
    ...collectHangfireTargets(content)
  ]);
  dependencies.push(...resolveReflectionTargets(Array.from(typeNames), resolveType));

  return dependencies;
}

/** Collects the first capture group of every match. */
export function collectConfigKeys(pattern: RegExp, content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const value = match[1]?.trim();
    if (value) results.add(value);
  }
  pattern.lastIndex = 0;
  return results;
}

/** Keys read through an `IConfiguration` indexer, recognised by an identifier containing "config". */
export function collectConfigurationIndexerKeys(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = CONFIGURATION_INDEXER_PATTERN.exec(content)) !== null) {
    const identifier = match[1]?.trim();
    const key        = match[2]?.trim();
    if (key && identifier && /config/i.test(identifier)) results.add(key);
  }
  CONFIGURATION_INDEXER_PATTERN.lastIndex = 0;
  return results;
}

/** Dotted, capitalised names inside string literals, the shape of a type name passed to reflection. */
export function collectTypeNameLiterals(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = TYPE_NAME_LITERAL_PATTERN.exec(content)) !== null) {
    const literal  = match[1]?.trim();
    if (!literal) continue;
    const segments = literal.split(".");
    if (segments.length < 2 || !segments.every((segment) => /^[A-Z]/.test(segment))) continue;
    const preceding = content[match.index - 1];
    if (preceding && /[A-Za-z0-9_]/.test(preceding)) continue;
    results.add(literal);
  }
  TYPE_NAME_LITERAL_PATTERN.lastIndex = 0;
  return results;
}

/** Job types named in `BackgroundJob.Enqueue<T>`, `RecurringJob.AddOrUpdate<T>` and their instance forms. */
export function collectHangfireTargets(content: string): Set<string> {
  const results = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = HANGFIRE_GENERIC_CALL_PATTERN.exec(content)) !== null) {
    const candidate = match[1]?.trim().replace(/\s+/g, "");
    if (candidate && !candidate.includes("(")) results.add(candidate);
  }
  HANGFIRE_GENERIC_CALL_PATTERN.lastIndex = 0;

  const recurringManagers = collectTypeIdentifiers(content, "IRecurringJobManager");
  const backgroundClients = collectTypeIdentifiers(content, "IBackgroundJobClient");
  const aliases           = new Set<string>([...recurringManagers, ...backgroundClients]);

  while ((match = HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN.exec(content)) !== null) {
    const alias  = match[1]?.trim();
    const method = match[2]?.trim();
    const raw    = match[3]?.trim();
    if (!alias || !raw || !aliases.has(alias)) continue;
    if (method === "AddOrUpdate" && !recurringManagers.has(alias)) continue;
    const candidate = raw.replace(/\s+/g, "");
    if (!candidate.includes("(")) results.add(candidate);
  }
  HANGFIRE_INSTANCE_GENERIC_CALL_PATTERN.lastIndex = 0;

  return results;
}

/** Variable identifiers declared with the given type name. */
export function collectTypeIdentifiers(content: string, typeName: string): Set<string> {
  const results = new Set<string>();
  const pattern = new RegExp(`\\b${typeName}\\s+([A-Za-z_][A-Za-z0-9_]*)`, "g");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const identifier = match[1]?.trim();
    if (identifier) results.add(identifier);
  }
  return results;
}

/**
 * The nearest workspace file with one of the candidate names, from the source
 * file's folder up to the workspace root, named in any case as Windows reads
 * it (see {@link lookUpWorkspaceFile}). Candidates are tried in order in each
 * folder. Where a folder holds two files whose names differ only by case,
 * there is no answer: Windows could not hold both, and neither is chosen.
 */
export function locateNearestFile(thisFile: string, candidates: string[], fileIndex: WorkspaceFileIndex | undefined): string | undefined {
  let folder = folderOf(thisFile);
  while (true) {
    for (const candidate of candidates) {
      const lookup = lookUpWorkspaceFile(joinWorkspacePath(folder, candidate), fileIndex);
      if ("file" in lookup) return lookup.file;
      if ("ambiguous" in lookup) return undefined;
    }
    if (folder === "") return undefined;
    folder = folderOf(folder);
  }
}

/** One dependency per workspace file that declares any of the named types, carrying the type names as symbols. */
export function resolveReflectionTargets(typeNames: string[], resolveType: TypeResolver): DependencyEntry[] {
  const byFile = new Map<string, Set<string>>();
  for (const typeName of typeNames) {
    for (const target of resolveType(typeName)) {
      const symbols = byFile.get(target.file) ?? new Set<string>();
      symbols.add(target.name);
      byFile.set(target.file, symbols);
    }
  }
  return Array.from(byFile.entries())
    .sort(([left], [right]) => compareText(left, right))
    .map(([file, symbols]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(symbols).sort(), kind: "import" as const }));
}

/**
 * JSON configuration file adapter for Live Documentation.
 *
 * @remarks
 * Extracts dependencies from JSON files by detecting string values that
 * reference other workspace files. Uses a file index to resolve references
 * precisely without filesystem crawling. The comments and trailing commas
 * that a `tsconfig*.json`, a `devcontainer.json` or a `.vscode/settings.json`
 * carries are read as editors read them.
 *
 * Supported patterns:
 * - Relative paths: `"./src/utils.ts"`, `"../config/settings.json"`
 * - Workspace-relative paths: `"packages/engine/src/index.ts"`
 * - Bare filenames: `"expected.json"` (resolved relative to JSON file's directory)
 *
 * A `package.json` is a manifest rather than configuration: its package is its
 * one public symbol, and what it depends on is a dependency, linked to the
 * workspace package of that name when there is one and external otherwise,
 * with the range as written. What its scripts run, its binaries and its main
 * module are the files it declares as entries, each written on that file's doc.
 *
 * @module
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import ts from "typescript";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, WorkspaceSymbolIndex } from "../core";
import type { DeclaredEntry } from "../coreTypes";
import { PACKAGE_KIND, isToolingFile } from "../openings";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";

const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

/** What a `package.json` says: the package it names, the packages it stands on, and the files its scripts, binaries and main module start. */
function analyzePackageManifest(parsed: unknown, thisFile: string, manifestAbsolute: string, workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined, symbolIndex: WorkspaceSymbolIndex | undefined): SourceAnalysisResult {
  const manifest = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  const symbols: PublicSymbolEntry[] = typeof manifest.name === "string" && manifest.name ? [{ name: manifest.name, kind: PACKAGE_KIND, location: { line: 1, character: 1 } }] : [];

  const linked = new Map<string, Set<string>>();
  const external = new Set<string>();
  for (const field of DEPENDENCY_FIELDS) {
    const block = manifest[field];
    if (!block || typeof block !== "object" || Array.isArray(block)) continue;
    for (const [name, range] of Object.entries(block as Record<string, unknown>)) {
      const packages = (symbolIndex?.get(name) ?? []).filter((location) => location.kind === PACKAGE_KIND && location.sourcePath !== thisFile);
      if (packages.length > 0) {
        for (const location of packages) {
          const names = linked.get(location.sourcePath) ?? new Set<string>();
          names.add(name);
          linked.set(location.sourcePath, names);
        }
      } else {
        external.add(typeof range === "string" && range ? `${name}@${range}` : name);
      }
    }
  }

  const dependencies: DependencyEntry[] = Array.from(linked.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const }));
  for (const specifier of Array.from(external).sort()) {
    dependencies.push({ specifier, symbols: [], kind: "import" });
  }
  const declares = fileIndex ? declaredEntries(manifest, manifestAbsolute, workspaceRoot, fileIndex) : [];
  return declares.length > 0 ? { symbols, dependencies, declares } : { symbols, dependencies };
}

// ============================================================================
// What a manifest starts
// ============================================================================

/** The separators between the commands of one script. */
const COMMAND_SEPARATOR = /\s*(?:&&|\|\||;|\|)\s*/u;

/**
 * The files a manifest declares as entries: the workspace file each script
 * runs, each binary, and the main module, in path order.
 *
 * @remarks
 * A script is read command by command; in each, the first token that names a
 * workspace file is what the command runs, flags passed over and a tooling
 * input passed over too, since a command names one as an input, never as what
 * it runs (`tsx --tsconfig ./tsconfig.base.json scripts/run.ts` runs the
 * script; `tsc -p tsconfig.json` runs nothing of the workspace). A built path
 * is mapped back to its source through the tsconfig beside the manifest: a
 * file under `outDir` is looked for under `rootDir` with the TypeScript
 * extension that compiles to it.
 */
function declaredEntries(manifest: Record<string, unknown>, manifestAbsolute: string, workspaceRoot: string, fileIndex: WorkspaceFileIndex): DeclaredEntry[] {
  const directory = path.dirname(manifestAbsolute);
  const toSource = sourceMapper(directory, workspaceRoot, fileIndex);
  const declared = new Map<string, DeclaredEntry>();
  const declare = (entry: DeclaredEntry): void => {
    declared.set(`${entry.reason}\u0000${entry.file}\u0000${entry.name ?? ""}`, entry);
  };

  const scripts = manifest.scripts;
  if (scripts && typeof scripts === "object" && !Array.isArray(scripts)) {
    for (const [name, command] of Object.entries(scripts as Record<string, unknown>)) {
      if (typeof command !== "string") continue;
      for (const segment of command.split(COMMAND_SEPARATOR)) {
        const file = runFileOf(segment, toSource);
        if (file) declare({ reason: "command", file, name });
      }
    }
  }

  const bin = manifest.bin;
  const binaries: Array<[string, unknown]> = typeof bin === "string"
    ? [[typeof manifest.name === "string" ? manifest.name : "", bin]]
    : bin && typeof bin === "object" && !Array.isArray(bin) ? Object.entries(bin as Record<string, unknown>) : [];
  for (const [name, target] of binaries) {
    const file = typeof target === "string" ? toSource(target) : undefined;
    if (file && name) declare({ reason: "command", file, name });
  }

  if (typeof manifest.main === "string") {
    const file = toSource(manifest.main);
    if (file) declare({ reason: "module", file });
  }

  return Array.from(declared.values()).sort((a, b) => a.file.localeCompare(b.file) || a.reason.localeCompare(b.reason) || (a.name ?? "").localeCompare(b.name ?? ""));
}

/** The workspace file one command runs: the first token naming one that is not a tooling input, flags passed over. */
function runFileOf(command: string, toSource: (candidate: string) => string | undefined): string | undefined {
  for (const token of command.trim().split(/\s+/u)) {
    if (token.length === 0 || token.startsWith("-")) continue;
    const candidate = token.replace(/^["']|["']$/gu, "");
    if (!candidate.includes("/") && !/\.[A-Za-z0-9]+$/u.test(candidate)) continue;
    const file = toSource(candidate);
    if (file && !isToolingFile(file)) return file;
  }
  return undefined;
}

/** Maps a path a manifest names, relative to the manifest, to the workspace source file it stands for, through the tsconfig beside the manifest. */
function sourceMapper(directory: string, workspaceRoot: string, fileIndex: WorkspaceFileIndex): (candidate: string) => string | undefined {
  const compiled = compilerPaths(directory);
  const inIndex = (absolute: string): string | undefined => {
    const relative = normalizeWorkspacePath(path.relative(workspaceRoot, absolute));
    return fileIndex.has(relative) ? relative : undefined;
  };
  return (candidate: string): string | undefined => {
    const normalized = candidate.replace(/\\/gu, "/");
    if (normalized.includes("node_modules/")) return undefined;
    const absolute = path.resolve(directory, normalized);
    const direct = inIndex(absolute);
    if (direct) return direct;
    if (!compiled) return undefined;
    const relative = path.relative(compiled.outDir, absolute);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return undefined;
    for (const root of compiled.rootDirs) {
      const built = path.join(root, relative);
      for (const source of sourcesOf(built)) {
        const found = inIndex(source);
        if (found) return found;
      }
    }
    return undefined;
  };
}

/** The source files a built file may compile from, the file itself first. */
function sourcesOf(built: string): string[] {
  const extension = path.extname(built).toLowerCase();
  const base = built.slice(0, built.length - extension.length);
  const sources: Record<string, string[]> = { ".js": [".ts", ".tsx"], ".mjs": [".mts"], ".cjs": [".cts"], ".jsx": [".tsx"] };
  return [built, ...(sources[extension] ?? []).map((candidate) => `${base}${candidate}`)];
}

/** Where the tsconfig beside a manifest writes its output and reads its sources, as absolute paths; absent without a tsconfig or an outDir. */
function compilerPaths(directory: string): { outDir: string; rootDirs: string[] } | undefined {
  const tsconfig = path.join(directory, "tsconfig.json");
  if (!ts.sys.fileExists(tsconfig)) return undefined;
  const read = ts.readConfigFile(tsconfig, (file) => ts.sys.readFile(file));
  if (read.error || !read.config) return undefined;
  const options = ts.parseJsonConfigFileContent(read.config, ts.sys, directory, undefined, tsconfig).options;
  if (!options.outDir) return undefined;
  const rootDirs = options.rootDir ? [options.rootDir] : [directory, path.join(directory, "src")];
  return { outDir: path.resolve(directory, options.outDir), rootDirs: rootDirs.map((root) => path.resolve(directory, root)) };
}

// ============================================================================
// Pattern Detection
// ============================================================================

/**
 * Patterns that indicate a string is NOT a file path reference.
 */
const SKIP_PATTERNS = [
  /^https?:\/\//i,           // URLs
  /^git\+/i,                 // Git URLs
  /^file:\/\//i,             // File URLs (could support later)
  /^[a-z]+:\/\//i,           // Other schemes
  /^\^[\d.]/,                // Version ranges (^1.0.0)
  /^~[\d.]/,                 // Version ranges (~1.0.0)
  /^>=?[\d.]/,               // Version ranges (>=1.0.0)
  /^<=?[\d.]/,               // Version ranges (<=1.0.0)
  /^\d+\.\d+/,               // Plain versions (1.0.0)
  /^@[a-z0-9-]+\/[a-z0-9-]+$/i, // Scoped npm packages (@scope/name)
  /\*\*/,                    // Glob patterns with **
  /\*/,                      // Glob patterns with *
  /^\s*$/,                   // Empty/whitespace
  /^#/,                      // Fragment references
];

/**
 * Determines whether a string value looks like it could be a file path.
 */
function looksLikeFilePath(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  // Skip values matching known non-path patterns
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(value)) {
      return false;
    }
  }

  // Must contain path-like characters or be a plausible filename
  const hasPathSeparator = value.includes("/") || value.includes("\\");
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(value);
  const startsWithDot = value.startsWith("./") || value.startsWith("../");

  return hasPathSeparator || hasExtension || startsWithDot;
}

// ============================================================================
// String Value Extraction
// ============================================================================

/**
 * Recursively extracts all string values from a JSON structure.
 */
function extractStringValues(obj: unknown, values: Set<string>): void {
  if (typeof obj === "string") {
    values.add(obj);
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractStringValues(item, values);
    }
    return;
  }

  if (obj !== null && typeof obj === "object") {
    for (const value of Object.values(obj)) {
      extractStringValues(value, values);
    }
  }
}

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Attempts to resolve a path-like string to a workspace file.
 *
 * @param candidate - The string value that might be a path reference.
 * @param jsonDir - Directory containing the JSON file (for relative resolution).
 * @param workspaceRoot - Workspace root directory.
 * @param fileIndex - Set of known workspace-relative file paths.
 *
 * @returns The resolved workspace-relative path, or undefined if not found.
 */
function resolveToWorkspaceFile(
  candidate: string,
  jsonDir: string,
  workspaceRoot: string,
  fileIndex: WorkspaceFileIndex
): string | undefined {
  // Normalize the candidate path
  const normalized = candidate.replace(/\\/g, "/");

  // Strategy 1: Direct match against file index (workspace-relative paths)
  if (fileIndex.has(normalized)) {
    return normalized;
  }

  // Strategy 2: Resolve relative to the JSON file's directory
  // (for paths starting with ./ or ../, or bare filenames)
  if (normalized.startsWith("./") || normalized.startsWith("../") || !normalized.includes("/")) {
    const absoluteResolved = path.resolve(jsonDir, normalized);
    const workspaceRelative = normalizeWorkspacePath(
      path.relative(workspaceRoot, absoluteResolved)
    );

    if (fileIndex.has(workspaceRelative)) {
      return workspaceRelative;
    }
  }

  // Strategy 3: Try as workspace-root-relative (without leading ./)
  const rootRelative = normalizeWorkspacePath(normalized);
  if (fileIndex.has(rootRelative)) {
    return rootRelative;
  }

  // Strategy 4: Try resolving as JSON-dir-relative even for paths with /
  // (handles cases like "typescript/basic/expected.json" in fixtures.manifest.json)
  {
    const absoluteResolved = path.resolve(jsonDir, normalized);
    const workspaceRelative = normalizeWorkspacePath(
      path.relative(workspaceRoot, absoluteResolved)
    );

    if (fileIndex.has(workspaceRelative)) {
      return workspaceRelative;
    }
  }

  return undefined;
}

// ============================================================================
// JSON Adapter
// ============================================================================

/**
 * Reduces JSON with the comments and trailing commas an editor allows (a
 * `tsconfig.json`, a `devcontainer.json`, a `.vscode/settings.json`) to the
 * JSON that `JSON.parse` reads: a comment goes, a comma that only precedes a
 * closing bracket goes, a byte order mark goes, and a string passes through
 * intact, so a `//` or a `,]` inside one is left alone. What remains is parsed
 * strictly, so a malformed document still fails as it did.
 */
function toStrictJson(text: string): string {
  let strict = "";
  // Where in `strict` the last comma stands while nothing but whitespace and comments has followed it.
  let trailingComma = -1;
  let index = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  while (index < text.length) {
    const char = text[index];
    if (char === "/" && text[index + 1] === "/") {
      index += 2;
      while (index < text.length && text[index] !== "\n" && text[index] !== "\r") {
        index += 1;
      }
    } else if (char === "/" && text[index + 1] === "*") {
      const close = text.indexOf("*/", index + 2);
      index = close === -1 ? text.length : close + 2;
    } else if (char === '"') {
      const end = endOfStringLiteral(text, index);
      strict += text.slice(index, end);
      index = end;
      trailingComma = -1;
    } else {
      if (char === ",") {
        trailingComma = strict.length;
      } else if (char === "]" || char === "}") {
        if (trailingComma !== -1) {
          strict = strict.slice(0, trailingComma) + strict.slice(trailingComma + 1);
        }
        trailingComma = -1;
      } else if (!/\s/u.test(char)) {
        trailingComma = -1;
      }
      strict += char;
      index += 1;
    }
  }
  return strict;
}

/** The index just past the string literal opening at `start`, its escapes passed over; the text's end when it never closes. */
function endOfStringLiteral(text: string, start: number): number {
  let index = start + 1;
  while (index < text.length) {
    if (text[index] === "\\") {
      index += 2;
    } else if (text[index] === '"') {
      return index + 1;
    } else {
      index += 1;
    }
  }
  return text.length;
}

/**
 * Every key path in a JSON document, joined with `:` the way `IConfiguration` addresses
 * nested settings (`Hangfire:Queue`). Arrays are not descended into.
 */
export function collectKeyPaths(value: unknown, prefix = "", into: string[] = []): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return into;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const keyPath = prefix ? `${prefix}:${key}` : key;
    into.push(keyPath);
    collectKeyPaths(child, keyPath, into);
  }
  return into;
}

/** Language adapter for JSON and JSONC files. Publishes key paths as public symbols and detects file-path references in string values. */
export const jsonAdapter: LanguageAdapter = {
  id: "json-config",
  extensions: [".json"],

  async analyze({ absolutePath, workspaceRoot, fileIndex, symbolIndex }): Promise<SourceAnalysisResult | null> {
    let content: string;
    try {
      content = await fs.readFile(absolutePath, "utf8");
    } catch {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(toStrictJson(content));
    } catch {
      // A malformed document is not read: an empty analysis, as for one that cannot be read at all.
      return {
        symbols: [],
        dependencies: []
      };
    }

    if (path.basename(absolutePath) === "package.json") {
      return analyzePackageManifest(parsed, normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath)), absolutePath, workspaceRoot, fileIndex, symbolIndex);
    }

    const symbols: PublicSymbolEntry[] = collectKeyPaths(parsed).map((keyPath) => ({ name: keyPath, kind: "key" }));

    // Reference resolution needs the file index
    if (!fileIndex || fileIndex.size === 0) {
      return {
        symbols,
        dependencies: []
      };
    }

    const jsonDir = path.dirname(absolutePath);
    const stringValues = new Set<string>();
    extractStringValues(parsed, stringValues);

    const dependencies: DependencyEntry[] = [];
    const seenTargets = new Set<string>();

    for (const candidate of stringValues) {
      if (!looksLikeFilePath(candidate)) {
        continue;
      }

      const resolved = resolveToWorkspaceFile(candidate, jsonDir, workspaceRoot, fileIndex);
      if (resolved && !seenTargets.has(resolved)) {
        seenTargets.add(resolved);
        dependencies.push({
          specifier: candidate,
          resolvedPath: resolved,
          kind: "import", // JSON references are conceptually similar to imports
          symbols: []
        });
      }
    }

    // Sort dependencies by resolved path for deterministic output
    dependencies.sort((a, b) => (a.resolvedPath ?? "").localeCompare(b.resolvedPath ?? ""));

    return {
      symbols,
      dependencies
    };
  }
};

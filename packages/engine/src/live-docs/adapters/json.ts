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
 * with the range as written; only another `package.json` is matched, so that
 * a crate or a Maven artifact of the same name is never taken for a package.
 * What its scripts run, its binaries and its main module are the files it
 * declares as entries, each written on that file's doc.
 *
 * @module
 */

import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import { compareText } from "../../tooling/compareText";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { decodeSourceText, readSourceText, throwIfMachineFailure } from "../../tooling/sourceText";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult } from "../core";
import type { DeclaredEntry } from "../coreTypes";
import { isToolingFile } from "../openings";
import { jsonChildren, markProcess, nestingBeyondDepth, READING_DEPTH, TREE_DEPTH } from "../processMark";
import type { LanguageAdapter, WorkspaceFileIndex } from "./index";
import { ManifestDependencies, manifestContext, packageSymbols, stringOf, tableOf, type ManifestContext } from "./manifest";

const PACKAGE_JSON = "package.json";
const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

/** What a `package.json` says: the package it names, the packages it stands on, and the files its scripts, binaries and main module start. */
function analyzePackageManifest(parsed: unknown, context: ManifestContext): SourceAnalysisResult {
  const manifest = tableOf(parsed) ?? {};
  const symbols = packageSymbols(stringOf(manifest.name));

  const dependencies = new ManifestDependencies();
  for (const field of DEPENDENCY_FIELDS) {
    for (const [name, range] of Object.entries(tableOf(manifest[field]) ?? {})) {
      dependencies.byName(name, stringOf(range), PACKAGE_JSON, context);
    }
  }

  const declares = context.fileIndex ? declaredEntries(manifest, context.absolutePath, context.workspaceRoot, context.fileIndex) : [];
  return declares.length > 0 ? { symbols, dependencies: dependencies.entries(), declares } : { symbols, dependencies: dependencies.entries() };
}

// ============================================================================
// What a manifest starts
// ============================================================================

/**
 * The files a manifest declares as entries: the workspace files each script
 * runs ({@link filesRunBy}), each binary, and the main module, in path order.
 * A built path is mapped back to its source through the tsconfig beside the
 * manifest: a file under `outDir` is looked for under `rootDir` with the
 * TypeScript extension that compiles to it.
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
      for (const file of filesRunBy(command, toSource)) {
        declare({ reason: "command", file, name });
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

  return Array.from(declared.values()).sort((a, b) => compareText(a.file, b.file) || compareText(a.reason, b.reason) || compareText(a.name ?? "", b.name ?? ""));
}

/**
 * The workspace files a script runs: in each of its commands
 * ({@link shellCommands}), the first word that names a workspace file which
 * is not a tooling input; and each command of a quoted command line the
 * script holds, read the same way.
 *
 * @remarks
 * Flags are passed over, and so is a tooling input, since a command names one
 * as an input, never as what it runs: `tsx --tsconfig ./tsconfig.base.json
 * scripts/run.ts` runs the script, and `tsc -p tsconfig.json` runs nothing of
 * the workspace. What follows the file a command runs is that file's
 * arguments. A quoted word that holds whitespace and names no file is a
 * command line of its own, wherever it stands, so that what a wrapper is
 * handed as a quoted command is found without a list of wrappers:
 * `concurrently "node api.js" "tsx web.ts"`, `start-server-and-test 'node
 * serve.mjs' http://localhost:3000 'node check.mjs'`, `nodemon --exec "tsx
 * main.ts"`, `sh -c "NODE_ENV=prod node a.js"`. A quoted word after `-e` or
 * `-c` is read like any other. That is right for a shell's `-c`. For inline
 * JavaScript it is harmless on every script measured, but only by luck: the
 * engine's own build until 2026-10-16, `node -e "require('node:fs')
 * .copyFileSync('src/…/powershell.emit-ast.ps1', 'dist/…/powershell.emit-ast.ps1')"`,
 * gives words such as `dist/…/powershell.emit-ast.ps1)` that name no file,
 * because `(` and `)` stay inside words. Split there as a shell splits them,
 * that `dist/` path would map back to the emitter's source and make the build
 * its start.
 *
 * This is the rule measured on 2026-11-19 (the probe
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/script-entries/README.md`).
 * Taking every word that names a file was measured there and refused: on 983
 * real scripts it found no start this rule misses and made 13 false ones (a
 * minifier's `-o min.js`, a `cp` target, a file a script rewrites). A list of
 * launchers, refused before it by two reviews, missed whatever it lacked.
 *
 * Known wrong answers, each pinned by a test:
 * - A wrapper's command after a bare `--` is not read: `dotenv -e
 *   config/dev.env -- vite-node scripts/a.ts` gives `config/dev.env` and
 *   misses `scripts/a.ts`. This repository's browser lane, `node
 *   scripts/browser-lane.mjs --label gate -- node scripts/e2e-passes.mjs`,
 *   gives the lane and misses the passes. A third rule was measured for this
 *   case: read a `--` followed by a program name as the start of a new
 *   command. It finds both of these, and it also reads `node gen.mjs -- go
 *   x.js` as running `x.js`. On the real scripts it changed no answer: 11 had a
 *   program name after `--`, and in 7 of those the name was a script's
 *   argument (`node Makefile.js lint -- fix`). So it waits for a real case.
 * - The first file of a command is taken for its program even when it is
 *   something else:
 *   - an environment file (`node --env-file .env server.js`);
 *   - a tool's output (`babel -o legacy.js index.js`);
 *   - a copy's source (`cp src/a.js dist/`);
 *   - the file `tee` writes.
 *   A program run after a preloaded module (`node -r ./setup.js main.js`) is
 *   not seen.
 * - A quoted word that only mentions a command is read as one: `echo "node
 *   b.js must run first"` gives `b.js`.
 * - A path is resolved from the manifest's folder, so `(cd x && node ../a.js)`
 *   is not read. Nor are `%VAR%` and `$(…)`, which only a shell expands. A
 *   Windows path, `node scripts\a.ts`, is read: the backslash stays in the
 *   word, and the path's resolution turns it into `/`.
 */
function filesRunBy(script: string, toSource: (candidate: string) => string | undefined, depth = 1): string[] {
  // Each quoted word that holds words is read a level down, by this function's own recursion (`shellCommands` reads by a
  // loop, and `JSON.parse` built the script without the stack): past the tree's bound, the process is marked
  // (`processMark.ts`). No script reaches it in practice, since each level must escape the quotes of every level below.
  if (depth > TREE_DEPTH) markProcess("deep");
  const files: string[] = [];
  for (const words of shellCommands(script)) {
    let runs = false;
    for (const word of words) {
      const file = word.text.startsWith("-") || !looksLikePath(word.text) ? undefined : toSource(word.text);
      if (file) {
        if (!runs && !isToolingFile(file)) {
          files.push(file);
          runs = true;
        }
      } else if (word.spaced) {
        files.push(...filesRunBy(word.text, toSource, depth + 1));
      }
    }
  }
  return files;
}

/** True for a word that may be a path: it holds a slash or a backslash, or ends in an extension. */
function looksLikePath(word: string): boolean {
  return word.includes("/") || word.includes("\\") || /\.[A-Za-z0-9]+$/u.test(word);
}

/** A word of a command line, and whether a quote held whitespace in it, as a quoted command line does. */
interface ShellWord {
  text: string;
  spaced: boolean;
}

/**
 * A command line split into commands, and each command into its words, as a
 * shell splits them. That is enough to find what each command runs; nothing
 * is expanded or run.
 *
 * @remarks
 * - Commands are separated by `&&`, `||`, `;`, `|`, `&` and line breaks
 *   outside quotes.
 * - Words are separated by whitespace outside quotes.
 * - A single quote keeps every character to the next one. A double quote keeps
 *   every character to the next unescaped one, a backslash escaping only `"`,
 *   `\`, `$` and a backtick.
 * - Outside quotes, a backslash escapes only whitespace, a quote, a backslash,
 *   `$`, a backtick and the characters that separate commands, redirect and
 *   comment. So `scripts\a.ts` keeps its backslash, and Windows paths stay
 *   paths.
 * - A `#` that begins a word begins a comment, to the end of the line.
 * - A redirection's file is not a word of the command. That covers `<`, `>`,
 *   `>>`, `&>`, a here-string's `<<<`, a here-document's `<<` and a numbered
 *   one's `2>`. `2>&1` names no file, and its `&` separates nothing.
 * - `(` and `)` stay inside words: a subshell is not read, and neither is
 *   inline code's call ({@link filesRunBy}).
 */
function shellCommands(line: string): ShellWord[][] {
  const commands: ShellWord[][] = [];
  let words: ShellWord[] = [];
  let text = "";
  let started = false;
  let spaced = false;
  let redirected = false;
  const endWord = (): void => {
    if (started && !redirected) words.push({ text, spaced });
    if (started) redirected = false;
    text = "";
    started = false;
    spaced = false;
  };
  const endCommand = (): void => {
    endWord();
    redirected = false;
    if (words.length > 0) commands.push(words);
    words = [];
  };
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === "'") {
      const end = line.indexOf("'", index + 1);
      const quoted = end < 0 ? line.slice(index + 1) : line.slice(index + 1, end);
      text += quoted;
      spaced ||= /\s/u.test(quoted);
      started = true;
      index = end < 0 ? line.length : end;
    } else if (character === '"') {
      let quoted = "";
      for (index += 1; index < line.length && line[index] !== '"'; index += 1) {
        if (line[index] === "\\" && index + 1 < line.length && '"\\$`'.includes(line[index + 1])) index += 1;
        quoted += line[index];
      }
      text += quoted;
      spaced ||= /\s/u.test(quoted);
      started = true;
    } else if (character === "\\" && index + 1 < line.length && /[\s"'\\$`&|;<>#]/u.test(line[index + 1])) {
      index += 1;
      text += line[index];
      started = true;
    } else if (character === "#" && !started) {
      const end = line.indexOf("\n", index);
      index = end < 0 ? line.length : end - 1;
    } else if (character === "<" || character === ">" || (character === "&" && line[index + 1] === ">")) {
      // A descriptor's number before the redirection belongs to it, and so does a descriptor it duplicates (`2>&1`), which names no file.
      if (started && /^\d+$/u.test(text)) started = false;
      endWord();
      while (index + 1 < line.length && /[<>&|]/u.test(line[index + 1])) index += 1;
      if (line[index] === "&" && /\d/u.test(line[index + 1] ?? "")) {
        while (/\d/u.test(line[index + 1] ?? "")) index += 1;
      } else {
        redirected = true;
      }
    } else if (character === "&" || character === "|" || character === ";" || character === "\n") {
      if ((character === "&" || character === "|") && line[index + 1] === character) index += 1;
      endCommand();
    } else if (/\s/u.test(character)) {
      endWord();
    } else {
      text += character;
      started = true;
    }
  }
  endCommand();
  return commands;
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

/**
 * Where the tsconfig beside a manifest writes its output and reads its sources, as absolute paths; absent without a
 * tsconfig or an outDir.
 *
 * @remarks
 * TypeScript reads the tsconfig, and each one it extends, through the host it is handed, and turns whatever that host
 * throws into a diagnostic; its own host, `ts.sys`, reads every failure as no file. So the host here reads the disk by
 * the one rule of the readers (`decodeSourceText`), keeps a failure of the machine's (`throwIfMachineFailure`), and
 * throws it once TypeScript has read: a tsconfig that could not be read for a cause of the machine's never reads as one
 * with no paths (since 2026-11-20). The files the tsconfig includes are not listed, since only its options are read.
 */
function compilerPaths(directory: string): { outDir: string; rootDirs: string[] } | undefined {
  const failures: unknown[] = [];
  const kept = <T>(call: () => T, otherwise: T): T => {
    try {
      return call();
    } catch (error) {
      failures.push(error);
      return otherwise;
    }
  };
  const host: ts.ParseConfigHost = {
    // The scan reads names as they are written, whatever machine it runs on. Until 2026-11-21 this asked TypeScript's
    // host on Node (`ts.sys`), whose answer differs between Windows and Linux for the same folder, which a repository's
    // history must not, and which is undefined where TypeScript runs without Node, as in a page, where the read threw.
    useCaseSensitiveFileNames: true,
    readDirectory: () => [],
    fileExists: (file) => kept(() => statSync(file).isFile(), false),
    readFile: (file) => kept(() => {
      const reading = decodeSourceText(readFileSync(file));
      return reading.encoding === "unread" ? undefined : reading.text;
    }, undefined)
  };
  const tsconfig = path.join(directory, "tsconfig.json");
  const read = ts.readConfigFile(tsconfig, (file) => host.readFile(file));
  failures.forEach(throwIfMachineFailure);
  if (read.error || !read.config) return undefined;
  // TypeScript's reader of JSON recurses as its parser does: measured once it has read, as after a parse of a module.
  nestingBeyondDepth(read.config as unknown, jsonChildren, READING_DEPTH);
  const options = ts.parseJsonConfigFileContent(read.config, host, directory, undefined, tsconfig).options;
  failures.forEach(throwIfMachineFailure);
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
export function collectKeyPaths(value: unknown, prefix?: string, into: string[] = []): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return into;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    // Beneath an empty key the path still names it: `{"": {"a": 1}}` has the paths "" and ":a", apart from a key "a".
    const keyPath = prefix === undefined ? key : `${prefix}:${key}`;
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
      content = await readSourceText(absolutePath);
    } catch (error) {
      throwIfMachineFailure(error);
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
    // `JSON.parse` holds no stack; the walks below recurse, so a value nested deeper than a fresh process could walk marks the process.
    nestingBeyondDepth(parsed, jsonChildren, TREE_DEPTH);

    if (path.basename(absolutePath) === PACKAGE_JSON) {
      return analyzePackageManifest(parsed, manifestContext({ absolutePath, workspaceRoot, fileIndex, symbolIndex }));
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
    dependencies.sort((a, b) => compareText(a.resolvedPath ?? "", b.resolvedPath ?? ""));

    return {
      symbols,
      dependencies
    };
  }
};

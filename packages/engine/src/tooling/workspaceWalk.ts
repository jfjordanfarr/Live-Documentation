/**
 * Pure host-driven top-down folder walk and in-memory glob matching for Live Documentation.
 *
 * @remarks
 * Written 2026-11-24 for Step 5 of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 6): replaces `glob` across discovery, the generator and
 * `graphFiles.ts` with a top-down walk over `FileHost.entries()`. The walk asks `shouldEnter(relativeFolder)` before
 * entering each folder so ignored, excluded and never-documented subtrees are never listed, matches glob patterns in
 * memory, and records unreadable folders cleanly so a failure of the machine's is never mistaken for an empty folder.
 *
 * Nothing here touches a disk or imports `node:fs` or `glob`: the host does.
 *
 * @module
 */
import { machineFailure } from "../live-docs/processMark";
import path from "./enginePath";
import type { FileHost, FolderEntries } from "./workspaceFiles";

/** A file found by a walk: its absolute path and its workspace-relative path with forward slashes. */
export interface WalkedFile {
  absolute: string;
  relative: string;
}

/** A folder the walk could not read for a cause of the machine's: its paths and the error. */
export interface UnreadableFolder extends WalkedFile {
  error: NodeJS.ErrnoException;
}

/** Options for {@link walkWorkspace}. */
export interface WalkWorkspaceOptions {
  workspaceRoot: string;
  host: FileHost;
  /** Glob patterns to match file paths against (workspace-relative, forward slashes). Omit to keep every file. */
  patterns?: readonly string[];
  /**
   * Called before calling `host.entries` on a folder (including `""` for `workspaceRoot`).
   * Return `false` to skip reading this folder and everything beneath it.
   */
  shouldEnter?: (relativeFolder: string) => boolean;
}

/** Result of {@link walkWorkspace}: matched files in workspace order, unreadable folders, and the root's file names. */
export interface WalkWorkspaceResult {
  files: WalkedFile[];
  unreadable: UnreadableFolder[];
  /** Immediate file names at `workspaceRoot`, when the root folder was entered and read. */
  rootFiles?: ReadonlySet<string>;
}

// ============================================================================
// In-Memory Glob Matching
// ============================================================================

/** One compiled segment of a glob pattern: either `**` (zero or more segments) or a single-segment matcher. */
type CompiledSegment = "**" | RegExp;

/** One brace-expanded glob pattern split into compiled segments. */
export interface CompiledGlob {
  /** Whether the pattern ends with a trailing slash (matches folders only, never files). */
  folderOnly: boolean;
  /** True when the pattern starts with `**`, which never traverses directory symbolic links by itself. */
  leadingGlobstar: boolean;
  segments: readonly CompiledSegment[];
}

/**
 * Expands top-level and nested `{a,b}` brace groups in a glob pattern into alternative patterns.
 * An unclosed `{` or a `{...}` containing no comma is kept literally.
 */
export function expandGlobBraces(pattern: string): string[] {
  const open = findBraceGroup(pattern);
  if (open === undefined) return [pattern];
  const { start, end, parts } = open;
  const prefix = pattern.slice(0, start);
  const suffix = pattern.slice(end + 1);
  const expanded: string[] = [];
  for (const part of parts) {
    for (const tail of expandGlobBraces(`${prefix}${part}${suffix}`)) {
      expanded.push(tail);
    }
  }
  return expanded;
}

function findBraceGroup(pattern: string): { start: number; end: number; parts: string[] } | undefined {
  for (let i = 0; i < pattern.length; i += 1) {
    if (pattern[i] !== "{") continue;
    let depth = 0;
    const parts: string[] = [];
    let partStart = i + 1;
    for (let j = i; j < pattern.length; j += 1) {
      const ch = pattern[j];
      if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          parts.push(pattern.slice(partStart, j));
          if (parts.length > 1) return { start: i, end: j, parts };
          break;
        }
      } else if (ch === "," && depth === 1) {
        parts.push(pattern.slice(partStart, j));
        partStart = j + 1;
      }
    }
  }
  return undefined;
}

/** Compiles one glob segment (without `/`) into a RegExp that matches across any non-`/` character including newlines. */
function compileSegment(segment: string): RegExp {
  let source = "^";
  for (let i = 0; i < segment.length; i += 1) {
    const ch = segment[i];
    if (ch === "*") {
      while (segment[i + 1] === "*") i += 1;
      source += "[^/]*";
    } else if (ch === "?") {
      source += "[^/]";
    } else if (ch === "[") {
      const close = findCharClassEnd(segment, i);
      if (close === -1) {
        source += "\\[";
      } else {
        let body = segment.slice(i + 1, close);
        if (body.startsWith("!")) body = `^${body.slice(1)}`;
        // Escape characters that are special inside a JS RegExp character class, excluding the leading negation `^`.
        const negated = body.startsWith("^");
        const content = (negated ? body.slice(1) : body).replace(/[\\[\]]/gu, "\\$&");
        source += `[${negated ? "^" : ""}${content}]`;
        i = close;
      }
    } else {
      source += ch.replace(/[.+^${}()|[\]\\]/gu, "\\$&");
    }
  }
  source += "$";
  return new RegExp(source, "u");
}

function findCharClassEnd(segment: string, open: number): number {
  let j = open + 1;
  if (segment[j] === "!" || segment[j] === "^") j += 1;
  if (segment[j] === "]") j += 1;
  while (j < segment.length && segment[j] !== "]") j += 1;
  return j < segment.length ? j : -1;
}

/** Normalizes and compiles a list of glob patterns (stripping leading `./`, expanding `{a,b}` braces). */
export function compileGlobPatterns(patterns: readonly string[]): CompiledGlob[] {
  const compiled: CompiledGlob[] = [];
  for (const raw of patterns) {
    for (const expanded of expandGlobBraces(raw.trim())) {
      const normalized = expanded.replace(/^\.\/+/u, "");
      if (normalized === "") continue;
      const folderOnly = normalized.endsWith("/");
      const trimmed = folderOnly ? normalized.replace(/\/+$/u, "") : normalized;
      const parts = trimmed.split("/").filter((part) => part !== "");
      const segments: CompiledSegment[] = [];
      for (const part of parts) {
        if (part === "**") {
          if (segments[segments.length - 1] !== "**") segments.push("**");
        } else {
          segments.push(compileSegment(part));
        }
      }
      if (segments.length === 0) continue;
      compiled.push({ folderOnly, leadingGlobstar: segments[0] === "**", segments });
    }
  }
  return compiled;
}

/** True when `pathSegments` matches `patternSegments` from indices `(si, pi)`. */
function matchSegments(pathSegments: readonly string[], patternSegments: readonly CompiledSegment[], si: number, pi: number): boolean {
  while (pi < patternSegments.length) {
    const token = patternSegments[pi];
    if (token === "**") {
      if (pi === patternSegments.length - 1) return true;
      for (let skip = si; skip <= pathSegments.length; skip += 1) {
        if (matchSegments(pathSegments, patternSegments, skip, pi + 1)) return true;
      }
      return false;
    }
    if (si >= pathSegments.length) return false;
    if (!token.test(pathSegments[si])) return false;
    si += 1;
    pi += 1;
  }
  return si === pathSegments.length;
}

/**
 * True when some file strictly beneath `folderSegments` (at least one more path segment) can match `patternSegments`.
 * Used to skip entering folders that no pattern can ever match inside.
 */
function canMatchUnderSegments(folderSegments: readonly string[], patternSegments: readonly CompiledSegment[], si: number, pi: number): boolean {
  if (si === folderSegments.length) {
    // We matched the entire folder prefix; remaining pattern must be able to match at least one file segment below it.
    return pi < patternSegments.length;
  }
  if (pi >= patternSegments.length) return false;
  const token = patternSegments[pi];
  if (token === "**") {
    // `**` can absorb 0..remaining folder segments and still match below.
    if (pi === patternSegments.length - 1) return true;
    for (let skip = si; skip <= folderSegments.length; skip += 1) {
      if (canMatchUnderSegments(folderSegments, patternSegments, skip, pi + 1)) return true;
    }
    return true;
  }
  if (!token.test(folderSegments[si])) return false;
  return canMatchUnderSegments(folderSegments, patternSegments, si + 1, pi + 1);
}

/** True when `relativePath` (forward slashes) matches a single glob pattern. */
export function matchGlobPattern(relativePath: string, pattern: string): boolean {
  return matchesAnyGlob(relativePath, compileGlobPatterns([pattern]));
}

/** True when `relativePath` (forward slashes) matches at least one compiled file glob pattern. */
export function matchesAnyGlob(relativePath: string, compiled: readonly CompiledGlob[]): boolean {
  const segments = relativePath.split("/");
  for (const pattern of compiled) {
    if (pattern.folderOnly) continue;
    if (matchSegments(segments, pattern.segments, 0, 0)) return true;
  }
  return false;
}

function canMatchUnderAny(relativeFolder: string, compiled: readonly CompiledGlob[]): boolean {
  const segments = relativeFolder.split("/");
  return compiled.some((pattern) => !pattern.folderOnly && canMatchUnderSegments(segments, pattern.segments, 0, 0));
}

function followsLinkedUnderAny(relativeFolder: string, compiled: readonly CompiledGlob[]): boolean {
  const segments = relativeFolder.split("/");
  return compiled.some((pattern) => !pattern.folderOnly && !pattern.leadingGlobstar && canMatchUnderSegments(segments, pattern.segments, 0, 0));
}

// ============================================================================
// Top-Down Host Walk
// ============================================================================

const byCodeUnit = (a: WalkedFile, b: WalkedFile): number => (a.relative < b.relative ? -1 : a.relative > b.relative ? 1 : 0);

/**
 * Walks a workspace top-down through `host.entries()`, pruning before reading each folder via `shouldEnter` and
 * matching files against `patterns` in memory.
 *
 * A folder whose read fails for a cause of the machine's (`scandir` error other than `ENOENT`) is recorded in
 * `unreadable` so the caller can judge whether everything in it would have been left out; a `stat` machine failure
 * on a symlink target is rethrown immediately. Missing folders (`ENOENT`) and non-machine errors read as empty.
 */
export async function walkWorkspace(options: WalkWorkspaceOptions): Promise<WalkWorkspaceResult> {
  const root = path.resolve(options.workspaceRoot);
  const compiled = options.patterns !== undefined ? compileGlobPatterns(options.patterns) : undefined;
  const files: WalkedFile[] = [];
  const unreadable: UnreadableFolder[] = [];
  let rootFiles: ReadonlySet<string> | undefined;

  const visit = async (relativeFolder: string, insideLink: boolean): Promise<void> => {
    if (options.shouldEnter && !options.shouldEnter(relativeFolder)) return;
    const absoluteFolder = relativeFolder === "" ? root : path.join(root, relativeFolder);
    let entries: FolderEntries;
    try {
      entries = await options.host.entries(absoluteFolder);
    } catch (error) {
      const errno = error as NodeJS.ErrnoException;
      if (machineFailure(error) && errno.code !== "ENOENT") {
        // A symlink target `stat` failure (such as EACCES on an unreachable target) stops the walk immediately;
        // a folder `scandir` failure is recorded so discovery can pass over ignored/excluded folders.
        if (errno.syscall === "stat") throw error;
        unreadable.push({ absolute: absoluteFolder, relative: relativeFolder, error: errno });
      }
      return;
    }

    if (relativeFolder === "") {
      rootFiles = new Set(entries.files);
    }

    for (const file of entries.files) {
      const relative = relativeFolder === "" ? file : `${relativeFolder}/${file}`;
      if (!compiled || matchesAnyGlob(relative, compiled)) {
        files.push({ absolute: path.join(absoluteFolder, file), relative });
      }
    }

    for (const folder of entries.folders) {
      const childRelative = relativeFolder === "" ? folder : `${relativeFolder}/${folder}`;
      if (!compiled || canMatchUnderAny(childRelative, compiled)) {
        await visit(childRelative, insideLink);
      }
    }

    // Symbolic links to directories are never entered by bare `**` globs, nor nested inside another followed link.
    if (!insideLink && entries.linkedFolders && compiled) {
      for (const folder of entries.linkedFolders) {
        const childRelative = relativeFolder === "" ? folder : `${relativeFolder}/${folder}`;
        if (followsLinkedUnderAny(childRelative, compiled)) {
          await visit(childRelative, true);
        }
      }
    }
  };

  await visit("", false);
  files.sort(byCodeUnit);
  return { files, unreadable, rootFiles };
}

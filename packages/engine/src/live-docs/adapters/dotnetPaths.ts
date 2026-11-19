/**
 * Paths written in .NET Framework files, resolved the way Windows reads them.
 *
 * .NET Framework runs on Windows, whose file system does not tell `Web.config`
 * from `web.config`. A project file, a directive or a solution written there may
 * name a file in any case, and the build succeeds. Asking the disk for that
 * spelling gives a different answer on Linux than on Windows, and on Windows
 * gives back the spelling asked for rather than the file's own. So these readers
 * never ask the disk: a written path is looked up in the list of the workspace's
 * files, its exact spelling first, then the one file whose path matches without
 * regard to case. Two files that match only that way are a fault Windows would
 * not allow; no link is drawn to either. The link is written in the file's true
 * spelling.
 *
 * @module dotnetPaths
 */
import path from "node:path";

import type { WorkspaceFileIndex } from "./index";

/**
 * Why a .NET reader drew no link where a file names something: a short fixed
 * phrase, so that counts add up across files, and what was named. Readers keep
 * these beside their dependencies for a run to report at its end.
 */
export interface ReaderNotice {
  reason:  string;
  subject: string;
}

/** A written path looked up in the workspace's files. */
export type WorkspacePathLookup =
  | { file: string }
  | { missing: true }
  | { ambiguous: string[] };

const foldedIndexes = new WeakMap<WorkspaceFileIndex, Map<string, string[]>>();

function foldedIndex(fileIndex: WorkspaceFileIndex): Map<string, string[]> {
  let folded = foldedIndexes.get(fileIndex);
  if (!folded) {
    folded = new Map();
    for (const file of fileIndex) {
      const key = file.toLowerCase();
      folded.set(key, [...(folded.get(key) ?? []), file]);
    }
    foldedIndexes.set(fileIndex, folded);
  }
  return folded;
}

/** The workspace file a workspace-relative path names: its exact spelling, else the one file that matches it without regard to case. */
export function lookUpWorkspaceFile(relative: string | undefined, fileIndex: WorkspaceFileIndex | undefined): WorkspacePathLookup {
  if (relative === undefined || !fileIndex) return { missing: true };
  if (fileIndex.has(relative)) return { file: relative };
  const matches = foldedIndex(fileIndex).get(relative.toLowerCase()) ?? [];
  if (matches.length === 1) return { file: matches[0] };
  return matches.length === 0 ? { missing: true } : { ambiguous: [...matches].sort() };
}

/** The workspace file a workspace-relative path names, or undefined when none does or several do. */
export function workspaceFile(relative: string | undefined, fileIndex: WorkspaceFileIndex | undefined): string | undefined {
  const lookup = lookUpWorkspaceFile(relative, fileIndex);
  return "file" in lookup ? lookup.file : undefined;
}

/**
 * A path written relative to a workspace folder, as a workspace-relative path
 * with forward slashes: backslashes read as separators, `.` and `..` applied.
 * Undefined when it climbs out of the workspace or is absolute.
 */
export function joinWorkspacePath(folder: string, written: string): string | undefined {
  const slashed = written.trim().replace(/\\/gu, "/");
  if (slashed.startsWith("/") || /^[A-Za-z]:/u.test(slashed)) return undefined;
  const joined = path.posix.normalize(path.posix.join(folder || ".", slashed));
  if (joined === ".." || joined.startsWith("../")) return undefined;
  return joined === "." ? "" : joined.replace(/\/$/u, "");
}

/** The folder of a workspace-relative path, `""` for the workspace root. */
export function folderOf(relative: string): string {
  const folder = path.posix.dirname(relative);
  return folder === "." ? "" : folder;
}

/** The project file extensions of .NET. */
export const PROJECT_FILE_EXTENSIONS = [".csproj", ".vbproj", ".fsproj"] as const;

/** True when the path names a .NET project file. */
export function isProjectFile(relative: string): boolean {
  const lower = relative.toLowerCase();
  return PROJECT_FILE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

const projectFoldersCache = new WeakMap<WorkspaceFileIndex, Set<string>>();

/** The folders of the workspace that hold a .NET project file. */
export function projectFolders(fileIndex: WorkspaceFileIndex): Set<string> {
  let folders = projectFoldersCache.get(fileIndex);
  if (!folders) {
    folders = new Set(Array.from(fileIndex).filter(isProjectFile).map(folderOf));
    projectFoldersCache.set(fileIndex, folders);
  }
  return folders;
}

/** The nearest folder at or above a file's own that holds a .NET project file. */
export function nearestProjectFolder(relative: string, fileIndex: WorkspaceFileIndex): string | undefined {
  const folders = projectFolders(fileIndex);
  let folder = folderOf(relative);
  while (true) {
    if (folders.has(folder)) return folder;
    if (folder === "") return undefined;
    folder = folderOf(folder);
  }
}

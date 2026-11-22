/**
 * What a reader may ask of the files a scan keeps without reading any of them: what lies at a path (a kept file, a
 * folder that holds kept files, or nothing), and what a folder holds. Answered at once from the run's listing, the
 * workspace-relative paths the scan keeps, so that a page, where asking the browser of a picked folder waits, answers a
 * reader's probe as fast as a disk, and no reader sees a file the scan leaves out.
 *
 * @remarks
 * Written 2026-11-22, the fourth step of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 6). Before, each reader asked Node's disk for itself (`statSync`,
 * `fs.promises.stat`, `fs.promises.access`, `readdirSync`), and in a page the stand-ins had to hold the whole folder to
 * answer. Root's ruling of that day: what a scan leaves out, no reader sees ("The list the user sees for ignore patterns
 * is the source of truth for our software", the owner, 2026-11-21). Measured before any probe moved: on DNN's Library,
 * this repository's 31 sample programs and its fixtures, and this repository itself with its `node_modules`, no
 * reader's probe reached a file on the disk that the listing does not hold.
 *
 * A reader asks through `pathKind` and `folderChildren` (`workspaceProbes.ts`), handing the file index it was handed;
 * the generator builds the listing on that index, beside the run's reads. Names are matched as written, whatever the
 * machine: the engine's own rule of case.
 *
 * @module
 */
import path from "node:path";

/** What lies at a path: a file, or a folder. */
export type PathKind = "file" | "folder";

/** A folder's entries by name: its files, and its folders. */
export interface FolderChildren {
  files: ReadonlySet<string>;
  folders: ReadonlySet<string>;
}

/** A run's listing: what lies at a path, and what a folder holds, among the files the scan keeps. */
export interface WorkspaceListing {
  /** A kept file, a folder holding kept files, or nothing (a path the listing does not hold, inside or outside the workspace). */
  kindOf(absolutePath: string): PathKind | undefined;
  /** A folder's kept files and the folders that hold kept files, or nothing when the listing holds no such folder. */
  childrenOf(absoluteFolder: string): FolderChildren | undefined;
}

/** The listing of the files a scan keeps, given as paths relative to the workspace with forward slashes. */
export function workspaceListing(workspaceRoot: string, relativePaths: Iterable<string>): WorkspaceListing {
  const root = path.resolve(workspaceRoot);
  const files = new Set<string>();
  const folders = new Map<string, { files: Set<string>; folders: Set<string> }>([["", { files: new Set(), folders: new Set() }]]);
  const folderOf = (relative: string): { files: Set<string>; folders: Set<string> } => {
    let entry = folders.get(relative);
    if (entry === undefined) {
      entry = { files: new Set(), folders: new Set() };
      folders.set(relative, entry);
      const slash = relative.lastIndexOf("/");
      folderOf(slash === -1 ? "" : relative.slice(0, slash)).folders.add(relative.slice(slash + 1));
    }
    return entry;
  };
  for (const relative of relativePaths) {
    files.add(relative);
    const slash = relative.lastIndexOf("/");
    folderOf(slash === -1 ? "" : relative.slice(0, slash)).files.add(relative.slice(slash + 1));
  }
  /** A path relative to the workspace with forward slashes, or nothing when it lies outside it. */
  const relativeOf = (absolutePath: string): string | undefined => {
    const relative = path.relative(root, path.resolve(absolutePath));
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return undefined;
    return relative.split(path.sep).join("/");
  };
  return {
    kindOf: (absolutePath) => {
      const relative = relativeOf(absolutePath);
      if (relative === undefined) return undefined;
      if (files.has(relative)) return "file";
      return folders.has(relative) ? "folder" : undefined;
    },
    childrenOf: (absoluteFolder) => {
      const relative = relativeOf(absoluteFolder);
      return relative === undefined ? undefined : folders.get(relative);
    }
  };
}

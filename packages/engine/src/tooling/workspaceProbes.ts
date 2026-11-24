/**
 * The one way a reader asks what lies at a path, or what a folder holds: from the run's listing where the run hands it
 * (`workspaceListing.ts`, carried on the file index every reader is handed), else from the disk by the Node host, as
 * for a reader called with no run (its own tests). The pair of `readSourceText` for a file's bytes.
 *
 * @remarks
 * Written 2026-11-22, the fourth step of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 6). The fallback to the disk goes with the one for reads, at step
 * 9, when no reader can be called without a run.
 *
 * @module
 */
import { childrenOnDisk, kindOnDisk } from "./nodeHost";
import type { FolderChildren, PathKind, WorkspaceListing } from "./workspaceListing";

/** A run's listing, where a run hands one: the file index a reader is handed carries it. */
export type ListedFiles = Partial<WorkspaceListing> & {
  /** True when the scan's active leave-out, exclude, gitignore, or never-documented rules left this workspace-relative path out. */
  isLeftOut?: (relativePath: string) => boolean;
};

/** What lies at a path: a kept file or a folder holding kept files, from the run's listing; else on the disk. */
export function pathKind(absolutePath: string, files?: ListedFiles): PathKind | undefined {
  return files?.kindOf ? files.kindOf(absolutePath) : kindOnDisk(absolutePath);
}

/** A folder's files and folders by name, from the run's listing; else on the disk. Nothing when there is no such folder. */
export function folderChildren(absoluteFolder: string, files?: ListedFiles): FolderChildren | undefined {
  return files?.childrenOf ? files.childrenOf(absoluteFolder) : childrenOnDisk(absoluteFolder);
}

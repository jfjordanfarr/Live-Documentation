/**
 * The Node host's answer to the engine's one question of a file (`FileHost` in `workspaceFiles.ts`): its bytes, and its
 * first bytes, read from the disk by Node. The only module of a scan's path that reads a source file from a disk.
 *
 * @remarks
 * Written 2026-11-22 for the third step of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`): the reads every reader and the generator made of Node for themselves,
 * gathered into the one host that answers them. The generator reads through it unless it is handed another host, as
 * the check that the engine runs in a page hands it one; a reader called with no run's reads (as a reader's own tests
 * call it) reads through it directly (`readSourceReading` in `sourceText.ts`).
 *
 * @module
 */
import { promises as fs, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { throwIfMachineFailure } from "./sourceText";
import type { FileHost, FolderEntries } from "./workspaceFiles";
import type { FolderChildren, PathKind } from "./workspaceListing";

const byCodeUnit = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** A file's bytes, from the disk. */
export async function readFileBytes(absolutePath: string): Promise<Uint8Array> {
  return fs.readFile(absolutePath);
}

/** The first `bytes` of a file, for the content's say on what the file is; fewer when the file is shorter. */
export async function readFileHead(absolutePath: string, bytes: number): Promise<Uint8Array> {
  const handle = await fs.open(absolutePath, "r");
  try {
    const buffer = new Uint8Array(bytes);
    const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/**
 * A folder's immediate files and subfolders on the disk, sorted by name. Symbolic links are inspected with `stat`: a
 * link to a file joins `files`, a link to a folder joins `linkedFolders`, a link whose target is absent, loops or
 * passes through a file is skipped, and a failure of the machine's (permission denied, too many open files) is thrown.
 */
export async function listFolderEntries(absoluteFolder: string): Promise<FolderEntries> {
  const dirents = await fs.readdir(absoluteFolder, { withFileTypes: true });
  const files: string[] = [];
  const folders: string[] = [];
  const linkedFolders: string[] = [];
  for (const entry of dirents) {
    if (entry.isFile()) {
      files.push(entry.name);
    } else if (entry.isDirectory()) {
      folders.push(entry.name);
    } else if (entry.isSymbolicLink()) {
      try {
        const stats = await fs.stat(path.join(absoluteFolder, entry.name));
        if (stats.isFile()) files.push(entry.name);
        else if (stats.isDirectory()) linkedFolders.push(entry.name);
      } catch (error) {
        throwIfMachineFailure(error);
      }
    }
  }
  files.sort(byCodeUnit);
  folders.sort(byCodeUnit);
  if (linkedFolders.length === 0) return { files, folders };
  linkedFolders.sort(byCodeUnit);
  return { files, folders, linkedFolders };
}

/**
 * Workspace-relative paths of files matching `extension` on the disk, skipping `.git` and `ignoredFolders` by folder
 * name, sorted. Used only when a language reader is called standalone without a run's `WorkspaceFileIndex`.
 */
export async function listFilesOnDisk(
  workspaceRoot: string,
  extension: string,
  ignoredFolders: ReadonlySet<string>,
  caseInsensitive = false
): Promise<string[]> {
  const target = caseInsensitive ? extension.toLowerCase() : extension;
  const matches = (name: string): boolean => (caseInsensitive ? name.toLowerCase() : name).endsWith(target);
  const found: string[] = [];
  const visit = async (relative: string): Promise<void> => {
    const absolute = relative === "" ? workspaceRoot : path.join(workspaceRoot, relative);
    let entries: FolderEntries;
    try {
      entries = await listFolderEntries(absolute);
    } catch (error) {
      throwIfMachineFailure(error);
      return;
    }
    for (const file of entries.files) {
      if (matches(file)) found.push(relative === "" ? file : `${relative}/${file}`);
    }
    for (const folder of entries.folders) {
      if (folder === ".git" || ignoredFolders.has(folder)) continue;
      await visit(relative === "" ? folder : `${relative}/${folder}`);
    }
  };
  await visit("");
  return found.sort(byCodeUnit);
}

/**
 * What lies at a path on the disk, links followed: a file, a folder, or nothing. A failure of the machine's is thrown;
 * any other (no such file, a name the disk cannot hold) is nothing there. For a reader called with no run's listing,
 * as a reader's own tests call it (`pathKind` in `workspaceProbes.ts`).
 */
export function kindOnDisk(absolutePath: string): PathKind | undefined {
  try {
    const stats = statSync(absolutePath);
    return stats.isFile() ? "file" : stats.isDirectory() ? "folder" : undefined;
  } catch (error) {
    throwIfMachineFailure(error);
    return undefined;
  }
}

/** A folder's files and folders on the disk, by name, links followed; nothing when it is no folder (`folderChildren`). */
export function childrenOnDisk(absoluteFolder: string): FolderChildren | undefined {
  if (kindOnDisk(absoluteFolder) !== "folder") return undefined;
  const files = new Set<string>();
  const folders = new Set<string>();
  for (const entry of readdirSync(absoluteFolder, { withFileTypes: true })) {
    const kind = entry.isSymbolicLink() ? kindOnDisk(path.join(absoluteFolder, entry.name)) : entry.isDirectory() ? "folder" : entry.isFile() ? "file" : undefined;
    if (kind === "file") files.add(entry.name);
    else if (kind === "folder") folders.add(entry.name);
  }
  return { files, folders };
}

/** The disk, as Node reads it. */
export const NODE_FILE_HOST: FileHost = { read: readFileBytes, head: readFileHead, entries: listFolderEntries };

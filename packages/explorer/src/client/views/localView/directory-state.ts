/**
 * The directories a person has opened in the Local Map, and the state each
 * directory of a picture is in. A directory has three states on one scale
 * (the owner's answers, 2026-10-08): closed, a pseudo-node without symbols
 * that stands in for everything under it; encasing, drawn as a membrane
 * around the files party to the picture's wires, the rest counted on its
 * label; and open, every file inside drawn as a compact card and every
 * subdirectory as a closed box, one level deep. Opening is the pin of a
 * directory. Closing steps it down as far as it can go: to encasing when a
 * party file or an opened directory stands under it, else to closed, as a
 * file that pinned files depend on cannot be unpinned below what they need.
 *
 * Pure-function module: no DOM. The opened set is the only state; every
 * other fact is derived from it and from what the picture holds.
 *
 * @module directory-state
 */

/** The directories opened, by path relative to the scan root. */
export type OpenDirectories = ReadonlySet<string>;

/** No directory opened: the picture as the pins alone make it. */
export const NO_OPEN_DIRECTORIES: OpenDirectories = new Set();

/** Where a directory stands on the scale: a box, a membrane around its party files, or a membrane around everything it holds. */
export type DirectoryState = "closed" | "encasing" | "open";

/** Whether a path is the directory or stands under it; the scan root, "", holds everything. */
export const under = (path: string, directory: string): boolean =>
  directory === "" || path === directory || path.startsWith(`${directory}/`);

/** The set with the directory opened; the same set when it already was. */
export function openDirectory(opened: OpenDirectories, directory: string): OpenDirectories {
  if (opened.has(directory)) return opened;
  return new Set([...opened, directory]);
}

/** The set without the directory and everything opened under it: closing a directory closes what it holds. */
export function closeDirectory(opened: OpenDirectories, directory: string): OpenDirectories {
  const next = new Set([...opened].filter(path => !under(path, directory)));
  return next.size === opened.size ? opened : next;
}

/**
 * A directory's state: open when it is opened; encasing when a party file,
 * or another opened directory, stands under it; else closed.
 */
export function directoryState(directory: string, opened: OpenDirectories, party: Iterable<string>): DirectoryState {
  if (opened.has(directory)) return "open";
  for (const path of opened) if (under(path, directory)) return "encasing";
  for (const file of party) if (under(file, directory)) return "encasing";
  return "closed";
}

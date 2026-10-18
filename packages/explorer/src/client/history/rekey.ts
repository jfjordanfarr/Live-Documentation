/**
 * Re-keying the 3D picture through the renames of a step of history, so that
 * a renamed file and a renamed directory's hub keep their objects under their
 * new ids (the plan's C4 and C6: a hub's identity is its path across time).
 *
 * The view keeps its nodes by id and its links by kind and endpoints, and the
 * library's data join binds a sphere or a line to the data object it was made
 * for, so keeping an object across a rename means moving its data object to
 * the new key and writing the new id on it. A hub is carried by the innermost
 * renamed directory that holds its path, as the engine follows a pinned
 * directory; a merge into a directory that already stood is no rename, so its
 * hub dies and the standing one lives on.
 *
 * Pure-function module: no DOM. The maps returned are new; the node objects
 * are the same objects, with their ids rewritten, since that is what keeps
 * them in the picture.
 *
 * @module rekey
 */

import { directoryNodeId } from "../views/forceGraphData";

/** The renames between two moments of the picture: files by path, directories by path, each from the old to the new. */
export interface Renames {
  files: ReadonlyMap<string, string>;
  directories: ReadonlyMap<string, string>;
}

/** No rename. */
export const NO_RENAMES: Renames = { files: new Map(), directories: new Map() };

const HUB_PREFIX = directoryNodeId("");

/** Whether there is anything to re-key. */
export const hasRenames = (renames: Renames): boolean => renames.files.size > 0 || renames.directories.size > 0;

/** The renames the other way, for a step back. */
export function invertedRenames(renames: Renames): Renames {
  const invert = (map: ReadonlyMap<string, string>): Map<string, string> => new Map([...map].map(([from, to]) => [to, from]));
  return { files: invert(renames.files), directories: invert(renames.directories) };
}

/** The renames of one move followed by another's: a path renamed twice goes to where the second took it. */
export function composedRenames(first: Renames, second: Renames): Renames {
  const compose = (a: ReadonlyMap<string, string>, b: ReadonlyMap<string, string>): Map<string, string> => {
    const result = new Map<string, string>();
    for (const [from, to] of a) result.set(from, b.get(to) ?? to);
    const reached = new Set(a.values());
    for (const [from, to] of b) if (!reached.has(from) && !result.has(from)) result.set(from, to);
    return result;
  };
  return { files: compose(first.files, second.files), directories: compose(first.directories, second.directories) };
}

/** A directory's path after the renames: carried by the innermost renamed directory that holds it, or its own. */
export function renamedDirectory(directory: string, renames: ReadonlyMap<string, string>): string {
  let best: [string, string] | undefined;
  for (const [from, to] of renames) {
    if ((directory === from || directory.startsWith(`${from}/`)) && (!best || from.length > best[0].length)) best = [from, to];
  }
  return best ? `${best[1]}${directory.slice(best[0].length)}` : directory;
}

/** The id a node of the picture has after the renames: a file's new path, a hub's new directory, or its own id. */
export function renamedId(id: string, renames: Renames): string {
  if (id.startsWith(HUB_PREFIX)) return directoryNodeId(renamedDirectory(id.slice(HUB_PREFIX.length), renames.directories));
  return renames.files.get(id) ?? id;
}

/** What the re-key needs of a cached link: its ends, as ids or as the node objects D3 resolved them to. */
export interface RekeyedLink<N extends { id: string }> {
  source: string | N;
  target: string | N;
}

/**
 * The view's caches with every renamed node and link moved to its new key: the node objects kept and their ids
 * rewritten, a link's string ends rewritten (its object ends follow their node), and every key recomputed.
 */
export function rekeyedCaches<N extends { id: string }, L extends RekeyedLink<N>>(
  nodes: ReadonlyMap<string, N>,
  links: ReadonlyMap<string, L>,
  renames: Renames,
  linkKey: (link: L) => string
): { nodes: Map<string, N>; links: Map<string, L> } {
  if (!hasRenames(renames)) return { nodes: new Map(nodes), links: new Map(links) };
  const movedNodes = new Map<string, N>();
  for (const [id, node] of nodes) {
    const next = renamedId(id, renames);
    node.id = next;
    movedNodes.set(next, node);
  }
  const movedLinks = new Map<string, L>();
  for (const link of links.values()) {
    if (typeof link.source === "string") link.source = renamedId(link.source, renames);
    if (typeof link.target === "string") link.target = renamedId(link.target, renames);
    movedLinks.set(linkKey(link), link);
  }
  return { nodes: movedNodes, links: movedLinks };
}

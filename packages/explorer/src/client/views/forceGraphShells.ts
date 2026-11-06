/**
 * Directory shells in the 3D Local Map, experiment 2 of the shrink-wrap work behind the tuning's Group Wrappers
 * (2026-11-05): the files a picture leaves out of a group it partly shows are gathered, by directory, into shells, each
 * one body of the simulation standing for many files, a padded hull a click pops open into its files and the shells of
 * its subdirectories, a balloon full of balloons. The owner, correcting the first experiment's rule that only a
 * disconnected group may be wrapped: "The idea is to abstract a crapton of nodes into fewer ungulfing "nodes" (meshes that
 * wrap those nodes)" ([Turn 11 of the November 5 record](../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11)),
 * and on November 4, of what to wrap, "If you think of it more from an optimization perspective (obscuring nodes which
 * aren't part of the hop chain in the current pin set, etc.) the problem of what to wrap and not wrap may resolve more
 * cleanly" ([Turn 17 of the November 3 record](../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-03.1.record.md#turn-17--november-4)).
 *
 * The rule here is one of several the owner may compare: a hidden file belongs to the shell of its directory cut to the
 * Shell Depth under the scan root, a directory of fewer than two hidden files makes none, and a popped directory's files
 * are shown while its subdirectories become shells of their own. A shell's wires are its members' references bundled,
 * one wire for each pair of a shown file or shell with a shell, its count the references between them in both
 * directions, so that a route through hidden files still shows as a route through a shell. A shell is drawn over a
 * phantom packing of its members, a deterministic arrangement scaled to its body, never a layout of the files
 * themselves: the picture simulates the shown files and the shells, never the files the shells hold.
 *
 * Pure-function module: no DOM, no GPU. The page draws, picks and pops what these functions describe.
 */

import type { FileConnection } from "./fileConnections";
import { seededDirection, spatialNodeRadius, type SpatialNode } from "./forceGraphLayout";
import type { GroupMember, GroupShape } from "./forceGraphWrappers";
import type { ForceGraphTuning } from "../types";
import { parentDirectory } from "./localView/directory-bands";

/** The id of a directory's shell, outside the files' and the hubs' namespaces. */
export const shellId = (directory: string): string => `shell:${directory}`;

/** The directory a shell stands for, or undefined for an id that is not a shell's. */
export const shellDirectory = (id: string): string | undefined => (id.startsWith("shell:") ? id.slice("shell:".length) : undefined);

/** How many directories deep a path is: none for the scan root, one for `packages`, two for `packages/explorer`. */
export const depthOf = (directory: string): number => (directory === "" ? 0 : directory.split("/").length);

/** A directory cut to its first `depth` directories; a shallower directory is itself. */
export function directoryAt(directory: string, depth: number): string {
  return directory === "" ? "" : directory.split("/").slice(0, depth).join("/");
}

/** One shell: its id, its directory, and the hidden files it holds, in id order. */
export interface DirectoryShell {
  id: string;
  /** The deepest directory that holds all its files: a pop opens it, and its id names it. */
  directory: string;
  /** Its name: the last directory of the cut, and the chain below it that holds nothing else, as a hub's chain is named. */
  name: string;
  files: readonly string[];
}

/** How the hidden files of a picture are held. */
export interface ShellPartition {
  /** Every shell, in directory order. */
  shells: DirectoryShell[];
  /** The hidden files the pops show: a popped directory's own, and a lone file of a subdirectory a pop opened. */
  released: string[];
  /** The hidden files no shell holds and no pop shows: hidden as before, a ring on a shown neighbour saying so. */
  loose: string[];
}

/**
 * Whether a directory is open: popped itself or, at the cut's depth or below it, above a popped directory, in the chain a
 * shell's name collapsed. Above the cut nothing collapses, so that a pop below the scan root opens none of its files.
 */
const openIn = (popped: ReadonlySet<string>, depth: number) => (directory: string): boolean => {
  if (popped.has(directory)) return true;
  if (depthOf(directory) < depth) return false;
  for (const at of popped) if (at.startsWith(`${directory}/`)) return true;
  return false;
};

/** The deepest directory holding every one of these directories. */
function commonDirectory(directories: readonly string[]): string {
  let common = directories[0].split("/");
  for (const directory of directories.slice(1)) {
    const parts = directory.split("/");
    let same = 0;
    while (same < common.length && same < parts.length && common[same] === parts[same]) same++;
    common = common.slice(0, same);
  }
  return common.join("/");
}

/**
 * Partition the hidden files by directory: a file belongs to the shell of its directory cut to `depth`, or, where that
 * directory is open, of its directory cut one deeper, until a directory not open; a file whose own directory is open is
 * released into the picture. A directory of fewer than two hidden files makes no shell: its file stays loose, unless a
 * pop opened its parent, when it is released with the popped directory's own files, so that a pop loses nothing it held.
 * A shell stands for the deepest directory holding all its files, so that a pop always opens onto more than one thing:
 * this repository's `packages/engine` shell, whose hidden files all lie under `src`, is `engine/src`, and a pop of it
 * opens `src` and the chain above it. Files are given by id with their path.
 */
export function partitionHidden(hidden: ReadonlyArray<{ id: string; path: string }>, depth: number, popped: ReadonlySet<string>): ShellPartition {
  const paths = new Map(hidden.map(file => [file.id, file.path]));
  return partitionBy(hidden.map(file => file.id), id => paths.get(id), depth, popped);
}

/** The partition of the files named, each read by its path; a file with none is left out, as a document is. */
function partitionBy(hidden: readonly string[], pathOf: (id: string) => string | undefined, depth: number, popped: ReadonlySet<string>): ShellPartition {
  if (!Number.isInteger(depth) || depth < 1) throw new Error("A shell's depth is a whole number of directories, at least one.");
  const open = openIn(popped, depth);
  const groups = new Map<string, string[]>(), fromPop = new Set<string>(), released: string[] = [], loose: string[] = [];
  // Where each directory's files go, worked out once a directory: the T3 sample hides 19,398 files in far fewer.
  const placeOf = new Map<string, string | null>();
  const place = (own: string): string | null => {
    let at = directoryAt(own, depth);
    while (open(at) && at !== own) at = directoryAt(own, depthOf(at) + 1);
    if (open(at)) return null;
    if (at !== directoryAt(own, depth)) fromPop.add(at);
    return at;
  };
  for (const id of hidden) {
    const path = pathOf(id);
    if (path === undefined) continue;
    const own = parentDirectory(path);
    let at = placeOf.get(own);
    if (at === undefined) placeOf.set(own, at = place(own));
    if (at === null) { released.push(id); continue; }
    (groups.get(at) ?? groups.set(at, []).get(at)!).push(id);
  }
  // Each cut's directories, for the deepest that holds them all.
  const owns = new Map<string, string[]>();
  for (const [own, at] of placeOf) if (at !== null) (owns.get(at) ?? owns.set(at, []).get(at)!).push(own);
  const shells: DirectoryShell[] = [];
  for (const cut of [...groups.keys()].sort()) {
    const files = groups.get(cut)!;
    // The scope lists each group's files in id order, so a shell of one group needs no sort.
    if (files.some((file, i) => i > 0 && files[i - 1] > file)) files.sort();
    if (files.length < 2) { (fromPop.has(cut) ? released : loose).push(...files); continue; }
    const directory = commonDirectory(owns.get(cut)!);
    const last = cut.split("/").pop() || "Scan root";
    shells.push({ id: shellId(directory), directory, name: directory === cut ? last : `${last}${directory.slice(cut.length)}`, files });
  }
  shells.sort((a, b) => (a.directory < b.directory ? -1 : a.directory > b.directory ? 1 : 0));
  return { shells, released: released.sort(), loose: loose.sort() };
}

/** A file the shells read: its id and path, and its kind, since a document is never held. */
export interface ShellCandidate {
  id: string;
  codeRelativePath: string;
  archetype?: string;
}

/** What a picture's shells are: the partition, the bundled wires and the counts its rings show. */
export interface ShellPicture<T extends string = string> extends ShellPartition {
  /**
   * The bundled wires: one for each pair of a shown file or shell with a shell that its members' references join, its
   * ends in id order as a file pair's are, `forward` counting the references the source makes of the target and
   * `backward` the others, `count` their sum.
   */
  wires: FileConnection<T>[];
  /** For each shown or released file, how many of its connected files neither the picture shows nor a shell holds. */
  beyond: Map<string, number>;
}

/** What the shells of a picture are read from. */
export interface ShellSource<N extends ShellCandidate, T extends string = string> {
  /** The picture's nodes, or the same by id when the caller has them so. */
  nodes: readonly N[] | ReadonlyMap<string, N>;
  /** The file pairs, each with its counts in both directions, as `spatialGraphOf` gives them. */
  links: readonly FileConnection<T>[];
  /** The ids the picture shows. */
  shown: ReadonlySet<string>;
  /** The files of the groups the picture shows in part that it leaves out (`SpatialScope.hidden`). */
  hidden: readonly string[];
  depth: number;
  popped: ReadonlySet<string>;
  /** Each node's connected neighbours, over the links that connect in the layout (`connectedNeighbours`). */
  beside: ReadonlyMap<string, ReadonlySet<string>>;
  /** Whether a link is a reference a shell's wire bundles: never containment nor a document's citation. */
  bundles: (link: FileConnection<T>) => boolean;
}

/**
 * The shells of a picture: the hidden files partitioned by directory (documents left hidden: a shell holds files), each
 * reference between a shown or released file and a held file, or between files of two shells, bundled into one wire per
 * pair of ends, and the counts left for the rings: a file whose hidden neighbours are all held needs no ring, since the
 * shell says it.
 */
export function shellPicture<N extends ShellCandidate, T extends string>(source: ShellSource<N, T>): ShellPicture<T> {
  const byId: ReadonlyMap<string, N> = source.nodes instanceof Map ? source.nodes : new Map((source.nodes as readonly N[]).map(node => [node.id, node]));
  const partition = partitionBy(source.hidden, id => {
    const node = byId.get(id);
    return node && node.archetype !== "related-doc" ? node.codeRelativePath : undefined;
  }, source.depth, source.popped);
  // Each end a link can have: a held file its shell's, a standing file its own. Read once a link, the T3 sample's 80,108.
  const ends = new Map<string, string>();
  for (const shell of partition.shells) for (const file of shell.files) ends.set(file, shell.id);
  for (const id of source.shown) ends.set(id, id);
  for (const id of partition.released) ends.set(id, id);
  const wires = new Map<string, FileConnection<T>>();
  for (const link of source.links) {
    const a = ends.get(link.source), b = ends.get(link.target);
    // A pair of shown files is the picture's own wire; a pair inside one shell is the shell's business; a loose end has none.
    if (a === undefined || b === undefined || a === b || (a === link.source && b === link.target) || !source.bundles(link)) continue;
    const ordered = a < b;
    const [from, to] = ordered ? [a, b] : [b, a];
    const forward = ordered ? link.forward : link.backward, backward = ordered ? link.backward : link.forward;
    const key = `${from}\0${to}`, wire = wires.get(key);
    if (wire) { wire.count += link.count; wire.forward += forward; wire.backward += backward; }
    else wires.set(key, { source: from, target: to, kind: link.kind, count: link.count, forward, backward });
  }
  const beyond = new Map<string, number>();
  for (const id of [...source.shown, ...partition.released]) {
    let count = 0;
    for (const neighbour of source.beside.get(id) ?? []) if (!ends.has(neighbour)) count++;
    if (count) beyond.set(id, count);
  }
  return { ...partition, wires: [...wires.values()].sort((x, y) => (x.source < y.source ? -1 : x.source > y.source ? 1 : x.target < y.target ? -1 : x.target > y.target ? 1 : 0)), beyond };
}

/** The golden angle, the turn between successive points of a Fibonacci sphere. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** A number in [0, 1) seeded by an id, the same on every machine: the jitter of a phantom. */
function seededFraction(id: string): number {
  let hash = 2166136261;
  for (let index = id.length - 1; index >= 0; index--) { hash ^= id.charCodeAt(index); hash = Math.imul(hash, 16777619) >>> 0; }
  return hash / 0x100000000;
}

/** How many of a body's members stand in its outer layer, the skin's lumps, when it has more. */
export const OUTER_LAYER = 48;

/**
 * Where a body's members stand while it is wrapped: a phantom packing, never a layout. Up to `OUTER_LAYER` members, the
 * first by a hash of their ids, stand in an outer layer near the skin, each at a direction of a Fibonacci sphere turned
 * toward one seeded by its id and at a depth the id jitters, so that the hull over them is lumpy rather than a gem; the
 * rest fill the inner part of the body the same way, so that the hull is shaped by the few on its outside and a large
 * body costs no more to wrap than a small one. Each member stands so far inside that its sphere, padded, stays within
 * `bodyRadius`, at the centre when it cannot. A member named `centre` stands at the centre itself, as a wrapped group's
 * seed does. Positions are relative to the centre, and they and the members' order, by the hash, do not depend on the order given.
 */
export function phantomShape(seed: string, members: ReadonlyArray<{ id: string; radius: number }>, bodyRadius: number, padding: number, centre?: string): GroupShape {
  const placed: GroupMember[] = [];
  const middle = members.find(member => member.id === centre);
  if (middle) placed.push({ id: middle.id, x: 0, y: 0, z: 0, radius: middle.radius });
  const byHash = members.filter(member => member.id !== centre).map(member => ({ member, hash: seededFraction(member.id) }))
    .sort((a, b) => a.hash - b.hash || (a.member.id < b.member.id ? -1 : a.member.id > b.member.id ? 1 : 0));
  const outer = byHash.slice(0, OUTER_LAYER), inner = byHash.slice(OUTER_LAYER);
  /** Lay a layer's members along a Fibonacci sphere, each between `low` and `high` of its room from the centre. */
  const layer = (entries: typeof byHash, low: number, high: number): void => entries.forEach(({ member }, i) => {
    const count = entries.length;
    const y = 1 - (2 * (i + 0.5)) / count, ring = Math.sqrt(Math.max(0, 1 - y * y)), turn = i * GOLDEN_ANGLE;
    const jitter = seededDirection(member.id);
    let dx = ring * Math.cos(turn) + 0.3 * jitter.x, dy = y + 0.3 * jitter.y, dz = ring * Math.sin(turn) + 0.3 * jitter.z;
    const length = Math.hypot(dx, dy, dz) || 1;
    dx /= length; dy /= length; dz /= length;
    const room = Math.max(0, bodyRadius - member.radius - padding);
    // The inner members spread through their part of the volume by the cube root; the outer ones by a second hash of the
    // id, apart from the one that orders them around the sphere, so that depth does not follow the spiral.
    const spread = seededFraction(`${member.id}\u0001`);
    const share = low > 0 ? spread : Math.cbrt(((i + 0.5) * 0.6180339887498949 + spread) % 1);
    const depth = room * (low + (high - low) * share);
    placed.push({ id: member.id, x: dx * depth, y: dy * depth, z: dz * depth, radius: member.radius });
  });
  layer(outer, 0.8, 1);
  layer(inner, 0, 0.6);
  return { seed, members: placed };
}

/**
 * The radius a packing of so many files takes: their volume, each a file with no symbols in a wrapper's padding, so that
 * every member's padded sphere fits and the hull over them is lumpy. A shell's body in the field is smaller
 * (`shellRadius`, the files without their padding), and the view draws the hull and births the files a pop releases
 * scaled down to fit it.
 */
export function packingRadius(files: number, tuning: Pick<ForceGraphTuning, "nodeSize">, padding: number): number {
  return (tuning.nodeSize + padding) * Math.cbrt(Math.max(1, files));
}

/**
 * A body's phantom packing of its files, as the tuning sizes them, each file its own sphere inside a packing of so many
 * padded files. A wrapped group packs its files about its seed. A directory shell packs its own files one by one and each
 * subdirectory as one ball of its files' volume, its files at its centre, so that the lumps of its skin, its outline,
 * are its subdirectories and a pop releases each subdirectory's shell where its ball stood, the balloons inside the
 * balloon.
 */
export function bodyShape<N extends SpatialNode & { codeRelativePath?: string }>(seed: string, files: readonly N[], tuning: ForceGraphTuning, padding: number,
  centre?: string, directory?: string): GroupShape {
  const sized = files.map(file => ({ id: file.id, radius: spatialNodeRadius(file, tuning), path: file.codeRelativePath ?? file.id }));
  const body = packingRadius(files.length, tuning, padding);
  if (directory === undefined) return phantomShape(seed, sized, body, padding, centre);
  const units = new Map<string, typeof sized>();
  for (const file of sized) {
    const own = parentDirectory(file.path);
    // A file of the directory itself is a unit alone, named apart from any subdirectory.
    const unit = own === directory ? `\0${file.id}` : directoryAt(own, depthOf(directory) + 1);
    (units.get(unit) ?? units.set(unit, []).get(unit)!).push(file);
  }
  if (units.size < 2) return phantomShape(seed, sized, body, padding);
  const unitRadius = (members: typeof sized): number => (members.length === 1 ? members[0].radius + padding : packingRadius(members.length, tuning, padding));
  const places = phantomShape(seed, [...units].map(([id, members]) => ({ id, radius: unitRadius(members) })), body, 0);
  const placed: GroupMember[] = [];
  // The hull is taken over the units' balls, each padded as a member is, which hold every member's padded sphere.
  const outline = places.members.map(unit => ({ ...unit, radius: units.get(unit.id)!.length === 1 ? units.get(unit.id)![0].radius : unit.radius - padding }));
  for (const unit of places.members) {
    const members = units.get(unit.id)!;
    // A subdirectory's files stand at its centre: a pop shows only the shell's own files, and the subdirectory's shell is
    // born where they stand, its own packing built when it is wrapped. Packing them here cost 71 ms of the T3 sample's
    // largest shell, 13,095 files (measured 2026-11-05).
    for (const member of members) placed.push({ id: member.id, x: unit.x, y: unit.y, z: unit.z, radius: member.radius });
  }
  return { seed, members: placed, outline };
}

/** The pops of a picture after `directory` is popped open, or wrapped again with every pop beneath it. */
export function poppedAfter(popped: ReadonlySet<string>, directory: string, open: boolean): Set<string> {
  const next = new Set(popped);
  if (open) { next.add(directory); return next; }
  for (const at of popped) if (at === directory || directory === "" || at.startsWith(`${directory}/`)) next.delete(at);
  return next;
}

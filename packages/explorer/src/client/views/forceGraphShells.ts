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
 * phantom packing of its members, a deterministic arrangement inside its body, never a layout of the files themselves:
 * the picture simulates the shown files and the shells, never the files the shells hold. Since November 6 the body is
 * the shell's true size and the skin shows within it the units a pop releases, its own files and its subdirectories'
 * balloons, where the pop leaves them; the owner had found the first shells "a replacement for the ring around a single
 * node rather than a computed mesh which is a stand-in for many many many nodes underneath it"
 * ([Turn 3 of the November 6 record](../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)).
 *
 * Pure-function module: no DOM, no GPU. The page draws, picks and pops what these functions describe.
 */

import type { FileConnection } from "./fileConnections";
import { seededDirection, spatialNodeRadius, type Placed, type SpatialNode } from "./forceGraphLayout";
import type { BodyUnit, GroupMember, GroupShape } from "./forceGraphWrappers";
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

/** A number in [0, 1) seeded by an id, the same on every machine. */
function seededFraction(id: string): number {
  let hash = 2166136261;
  for (let index = id.length - 1; index >= 0; index--) { hash ^= id.charCodeAt(index); hash = Math.imul(hash, 16777619) >>> 0; }
  return hash / 0x100000000;
}

/** The room a body keeps between two of its units' surfaces, and between its units and its skin, in a tuning's units. */
export interface BodyGaps {
  /** Between two units' surfaces: the collision's gap, so that what a pop releases stands clear of its neighbours. */
  gap: number;
  /** Between a bubble's units and its skin. */
  margin: number;
}

/** A body's gaps for a tuning: the collision's gap between units, half of it to the skin (2026-11-06, second round). */
export function bodyGaps(tuning: Pick<ForceGraphTuning, "collisionGap">): BodyGaps {
  return { gap: tuning.collisionGap, margin: tuning.collisionGap / 2 };
}

/** One sphere to pack: its id and radius. */
interface Packable {
  id: string;
  radius: number;
}

/** Below this many units a packing places each in turn and compares every pair; above it, it relaxes a spiral, through a grid. */
const PAIRWISE = 48;

/** The directions a sphere may touch another in, for a greedy packing: 64 along a Fibonacci sphere. */
const DIRECTIONS: ReadonlyArray<Placed> = Array.from({ length: 64 }, (_, i) => {
  const h = 1 - 2 * (i + 0.5) / 64, ring = Math.sqrt(1 - h * h), turn = i * Math.PI * (3 - Math.sqrt(5));
  return { x: ring * Math.cos(turn), y: h, z: ring * Math.sin(turn) };
});

/**
 * Pack spheres into a ball, apart by `gap` between their surfaces, about the origin (2026-11-06, second round): they start
 * on a Fibonacci ball, the largest nearest the centre, and are pulled toward the centre and pushed apart in turn, the
 * lighter of two moving the more, then only pushed apart until no two are closer than the gap by more than a hundredth
 * of it; one named `centre` stands at the origin throughout, as a wrapped group's seed does. A ball of mixed spheres
 * settles at about the density of spheres poured into a jar. The places depend only on the spheres given, not on their
 * order. Returns each sphere's place and the radius from the origin that holds them all.
 */
export function packBall(units: readonly Packable[], gap: number, centre?: string): { places: Map<string, Placed>; extent: number } {
  const order = [...units].sort((a, b) => (a.id === centre ? -1 : b.id === centre ? 1 : 0) || b.radius - a.radius
    || seededFraction(a.id) - seededFraction(b.id) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const n = order.length;
  const x = new Float64Array(n), y = new Float64Array(n), z = new Float64Array(n), r = Float64Array.from(order.map(unit => unit.radius));
  const fixed = order.map(unit => unit.id === centre);
  let volume = 0;
  for (const radius of r) volume += (radius + gap / 2) ** 3;
  const start = Math.cbrt(volume / 0.5);
  if (n <= PAIRWISE) {
    // Few spheres, often of very different sizes: each, the largest first, stands touching one already placed where it
    // reaches least far from the middle of the first two, so that small spheres fill the waist beside large ones rather
    // than a shell around them.
    let mx = 0, my = 0, mz = 0;
    // Only a placed sphere nearer sphere j than a place's distance from j and that sphere's clearance together can block
    // the place (2026-11-07, third round), so that a place is tested against a handful of neighbours rather than every
    // sphere; and a place is tested only when it would reach less far than the best yet. Neither changes what is chosen.
    const neighbours = new Int32Array(n * n), nearFrom = new Int32Array(n + 1);
    for (let i = 1; i < n; i++) {
      if (fixed[i]) continue;
      let count = 0;
      for (let j = 0; j < i; j++) {
        nearFrom[j] = count;
        const reach = r[j] + r[i] + gap;
        for (let m = 0; m < i; m++) {
          const ex = x[j] - x[m], ey = y[j] - y[m], ez = z[j] - z[m], within = reach + r[m] + r[i] + gap + 1e-6 * (1 + reach);
          if (ex * ex + ey * ey + ez * ez < within * within) neighbours[count++] = m;
        }
      }
      nearFrom[i] = count;
      let best = -1, bx = 0, by = 0, bz = 0;
      for (let j = 0; j < i; j++) for (let k = 0; k < DIRECTIONS.length; k++) {
        const d = DIRECTIONS[k], reach = r[j] + r[i] + gap;
        const cx = x[j] + d.x * reach, cy = y[j] + d.y * reach, cz = z[j] + d.z * reach;
        const score = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2 + (cz - mz) ** 2) + r[i];
        if (!(best < 0 || score < best - 1e-9)) continue;
        let clear = true;
        for (let at = nearFrom[j], end = nearFrom[j + 1]; at < end && clear; at++) {
          const m = neighbours[at], ex = cx - x[m], ey = cy - y[m], ez = cz - z[m], least = r[m] + r[i] + gap - 1e-9;
          if (ex * ex + ey * ey + ez * ez < least * least) clear = false;
        }
        if (clear) { best = score; bx = cx; by = cy; bz = cz; }
      }
      x[i] = bx; y[i] = by; z[i] = bz;
      if (i === 1 && !fixed[0]) {
        // The middle of the ball that holds the first two, on the line between them.
        const d = Math.hypot(x[1] - x[0], y[1] - y[0], z[1] - z[0]) || 1, along = (d + r[1] - r[0]) / 2;
        mx = x[0] + (x[1] - x[0]) / d * along; my = y[0] + (y[1] - y[0]) / d * along; mz = z[0] + (z[1] - z[0]) / d * along;
      }
    }
  } else order.forEach((unit, i) => {
    if (fixed[i]) return;
    // The i-th of n along a Fibonacci spiral, at the depth the ball's volume puts the i-th sphere, turned by the id.
    const k = i + 0.5, h = 1 - 2 * k / n, ring = Math.sqrt(Math.max(0, 1 - h * h)), turn = i * GOLDEN_ANGLE, jitter = seededDirection(unit.id);
    const dx = ring * Math.cos(turn) + 0.25 * jitter.x, dy = h + 0.25 * jitter.y, dz = ring * Math.sin(turn) + 0.25 * jitter.z;
    const length = Math.hypot(dx, dy, dz) || 1, depth = start * Math.cbrt(k / n);
    x[i] = dx / length * depth; y[i] = dy / length * depth; z[i] = dz / length * depth;
  });
  const mass = Float64Array.from(r, radius => radius ** 3);
  // A sphere more than twice the median's radius is large, compared with every sphere; the grid's cell holds the rest.
  const sortedRadii = Float64Array.from(r).sort(), median = sortedRadii[Math.floor((n - 1) / 2)];
  const large: number[] = [];
  let typical = 0;
  for (let i = 0; i < n; i++) if (r[i] > 2 * median) large.push(i); else typical = Math.max(typical, r[i]);
  const cellX = new Int32Array(n), cellY = new Int32Array(n), cellZ = new Int32Array(n), next = new Int32Array(n);
  let head = new Int32Array(0);
  /** Push apart each pair closer than their radii and the gap; the largest shortfall found. */
  const separate = (): number => {
    let worst = 0;
    const push = (i: number, j: number): void => {
      let dx = x[i] - x[j], dy = y[i] - y[j], dz = z[i] - z[j];
      const least = r[i] + r[j] + gap, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= least * least) return;
      let d = Math.sqrt(d2);
      const short = least - d;
      if (short > worst) worst = short;
      if (d < 1e-9) { const unit = seededDirection(`${order[Math.min(i, j)].id}\0${order[Math.max(i, j)].id}`); dx = unit.x; dy = unit.y; dz = unit.z; d = 1; }
      const share = fixed[i] ? 0 : fixed[j] ? 1 : mass[j] / (mass[i] + mass[j]);
      const ux = dx / d * short, uy = dy / d * short, uz = dz / d * short;
      x[i] += ux * share; y[i] += uy * share; z[i] += uz * share;
      x[j] -= ux * (1 - share); y[j] -= uy * (1 - share); z[j] -= uz * (1 - share);
    };
    if (n <= PAIRWISE) {
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) push(i, j);
      return worst;
    }
    // Through a dense grid whose cell holds two of the rest and the gap, each cell a list threaded through `next`; the
    // large spheres compared with every sphere.
    const cell = 2 * typical + gap;
    let lowX = Infinity, lowY = Infinity, lowZ = Infinity, highX = -Infinity, highY = -Infinity, highZ = -Infinity;
    for (let i = 0; i < n; i++) {
      if (r[i] > 2 * median) continue;
      const cx = cellX[i] = Math.floor(x[i] / cell), cy = cellY[i] = Math.floor(y[i] / cell), cz = cellZ[i] = Math.floor(z[i] / cell);
      if (cx < lowX) lowX = cx; if (cx > highX) highX = cx; if (cy < lowY) lowY = cy; if (cy > highY) highY = cy; if (cz < lowZ) lowZ = cz; if (cz > highZ) highZ = cz;
    }
    const spanX = highX - lowX + 1, spanY = highY - lowY + 1, spanZ = highZ - lowZ + 1, cells = spanX * spanY * spanZ;
    if (head.length < cells) head = new Int32Array(cells);
    head.fill(-1, 0, cells);
    for (let i = 0; i < n; i++) {
      if (r[i] > 2 * median) continue;
      const at = ((cellX[i] - lowX) * spanY + cellY[i] - lowY) * spanZ + cellZ[i] - lowZ;
      next[i] = head[at]; head[at] = i;
    }
    for (let i = 0; i < n; i++) {
      if (r[i] > 2 * median) continue;
      for (let ox = -1; ox <= 1; ox++) {
        const gx = cellX[i] + ox - lowX;
        if (gx < 0 || gx >= spanX) continue;
        for (let oy = -1; oy <= 1; oy++) {
          const gy = cellY[i] + oy - lowY;
          if (gy < 0 || gy >= spanY) continue;
          for (let oz = -1; oz <= 1; oz++) {
            const gz = cellZ[i] + oz - lowZ;
            if (gz < 0 || gz >= spanZ) continue;
            for (let j = head[(gx * spanY + gy) * spanZ + gz]; j >= 0; j = next[j]) if (i < j) push(i, j);
          }
        }
      }
    }
    for (const i of large) for (let j = 0; j < n; j++) if (j !== i && (r[j] <= 2 * median || j > i)) push(i, j);
    return worst;
  };
  /**
   * The centre of a small ball holding every sphere, after Bădoiu and Clarkson: from `start`, step toward the farthest
   * sphere's far side by a shrinking share, so that a ball of one large sphere and a few small ones is centred between
   * them rather than on the large one. The origin, when a sphere is fixed there.
   */
  const centreOf = (start: Placed, steps: number): Placed => {
    if (fixed.some(Boolean)) return { x: 0, y: 0, z: 0 };
    let cx = start.x, cy = start.y, cz = start.z;
    for (let step = 1; step <= steps; step++) {
      let far = -1, reach = -Infinity;
      for (let i = 0; i < n; i++) { const d = Math.sqrt((x[i] - cx) ** 2 + (y[i] - cy) ** 2 + (z[i] - cz) ** 2) + r[i]; if (d > reach) { reach = d; far = i; } }
      const d = Math.sqrt((x[far] - cx) ** 2 + (y[far] - cy) ** 2 + (z[far] - cz) ** 2) || 1, k = (d + r[far]) / d;
      const qx = cx + (x[far] - cx) * k, qy = cy + (y[far] - cy) * k, qz = cz + (z[far] - cz) * k;
      cx += (qx - cx) / (step + 1); cy += (qy - cy) / (step + 1); cz += (qz - cz) / (step + 1);
    }
    return { x: cx, y: cy, z: cz };
  };
  let middle: Placed = { x: 0, y: 0, z: 0 };
  if (n > 1) {
    // Drawn toward the middle of the ball that holds them and pushed apart, so that the ball closes up; then apart
    // alone, until no pair is short.
    for (let pass = 0; pass < (n <= PAIRWISE ? 20 : 40); pass++) {
      middle = centreOf(middle, 16);
      const squeeze = 0.985;
      for (let i = 0; i < n; i++) if (!fixed[i]) { x[i] = middle.x + (x[i] - middle.x) * squeeze; y[i] = middle.y + (y[i] - middle.y) * squeeze; z[i] = middle.z + (z[i] - middle.z) * squeeze; }
      separate();
    }
    for (let pass = 0; pass < 150 && separate() > 1e-2 * Math.max(gap, 1e-3); pass++);
    middle = centreOf(middle, 200);
  }
  const places = new Map<string, Placed>();
  let extent = 0;
  order.forEach((unit, i) => {
    const at = { x: x[i] - middle.x, y: y[i] - middle.y, z: z[i] - middle.z };
    places.set(unit.id, at);
    extent = Math.max(extent, Math.hypot(at.x, at.y, at.z) + r[i]);
  });
  return { places, extent };
}

/** One sphere a body is drawn over: a file, or a bubble of the files of a directory below it, about the body's centre. */
interface BodyNode {
  id: string;
  kind: "file" | "directory";
  radius: number;
  /** The files it holds, one for a file. */
  files: number;
  archetype?: string;
  /** A bubble's units, about its centre. */
  children: Array<{ node: BodyNode; x: number; y: number; z: number }>;
}

/** A file the tree is built over: its id, radius, kind and its own directory's names. */
interface TreeFile {
  id: string;
  radius: number;
  archetype?: string;
  parts: readonly string[];
}

/** How many names two lists of directory names share from the start. */
function sharedNames(a: readonly string[], b: readonly string[]): number {
  let same = 0;
  while (same < a.length && same < b.length && a[same] === b[same]) same++;
  return same;
}

/** A body's building, a step at a time: each step one bubble packed (2026-11-07, third round). */
export type BodyBuilding = Generator<void, GroupShape, void>;

/**
 * The bubble of these files, from the leaves (2026-11-06, second round): the deepest directory holding them all, so that
 * a chain of directories holding nothing but one subdirectory collapses into what it holds; its own files each a unit,
 * each subdirectory of one file that file, and each other subdirectory a bubble of its own, built the same way and
 * first; the units packed apart by the gap, and the bubble as large as holds them with the margin, so that the
 * polyhedra a hull stands in for their padded spheres with stay within it. Its radius is the same whether it is a body
 * of the picture or a bubble inside one. It pauses after each bubble it packs, so that a large body's building can be
 * spread over frames (2026-11-07, third round).
 */
function* bubbleOf(files: readonly TreeFile[], gaps: BodyGaps): Generator<void, BodyNode, void> {
  let depth = files[0].parts.length;
  for (const file of files) depth = Math.min(depth, sharedNames(files[0].parts, file.parts));
  const directory = files[0].parts.slice(0, depth).join("/");
  const units: BodyNode[] = [], groups = new Map<string, TreeFile[]>();
  for (const file of files) {
    if (file.parts.length === depth) units.push({ id: file.id, kind: "file", radius: file.radius, files: 1, archetype: file.archetype, children: [] });
    else (groups.get(file.parts[depth]) ?? groups.set(file.parts[depth], []).get(file.parts[depth])!).push(file);
  }
  for (const group of groups.values()) {
    units.push(group.length === 1 ? { id: group[0].id, kind: "file", radius: group[0].radius, files: 1, archetype: group[0].archetype, children: [] } : yield* bubbleOf(group, gaps));
  }
  const bubble = enclose(directory, units, gaps);
  yield;
  return bubble;
}

/** A bubble around these units, packed apart, its radius such that each unit's padded polyhedron stays within it. */
function enclose(id: string, units: BodyNode[], gaps: BodyGaps, centre?: string): BodyNode {
  const { places } = packBall(units.map(unit => ({ id: unit.id, radius: unit.radius })), gaps.gap, centre);
  let radius = 0;
  // In id order, so that what is built from the bubble does not depend on the order its files came in.
  const children = [...units].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map(node => {
    const at = places.get(node.id)!;
    radius = Math.max(radius, Math.hypot(at.x, at.y, at.z) + node.radius + gaps.margin);
    return { node, x: at.x, y: at.y, z: at.z };
  });
  return { id, kind: "directory", radius, files: units.reduce((sum, unit) => sum + unit.files, 0), children };
}

/**
 * The most files a body draws within its skins (2026-11-06, second round): over it, the bubbles whose files would pass it
 * are drawn veiled, their files unseen. Set by the cost of drawing spheres in the software renderer this repository's
 * pictures are taken in; the label keeps the true count.
 */
export const DRAWN_FILES = 1024;

/**
 * A body's packing of its files, as the tuning sizes them, built from the leaves (2026-11-06, second round). A directory
 * shell is the bubble of its directory (`bubbleOf`): every file a sphere inside the innermost bubble that holds it. A
 * wrapped group is one bubble of its files about its seed, which stands at the centre. The result names every file's
 * place about the body's centre (`members`), the spheres the hull is taken over, the body's own units (`outline`), its
 * radius, the margin the hull pads them by, and what its skin shows within it (`units`): every inner bubble and every
 * file but a group's seed, opened breadth-first from the body itself while the files shown stay within `DRAWN_FILES`,
 * a bubble that would pass it drawn veiled with nothing shown inside it. Nothing depends on the order the files are given in.
 */
export function bodyShape<N extends SpatialNode & { codeRelativePath?: string; archetype?: string }>(seed: string, files: readonly N[], tuning: ForceGraphTuning,
  centre?: string, directory?: string): GroupShape {
  const steps = bodySteps(seed, files, tuning, centre, directory);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/**
 * `bodyShape` a bubble at a time (2026-11-07, third round): the page builds a large picture's bodies over frames, a few
 * bubbles a frame, rather than all in the frame that names them, a stall of one to two seconds on the T3 sample. The
 * result is `bodyShape`'s, whatever the steps are spread over.
 */
export function* bodySteps<N extends SpatialNode & { codeRelativePath?: string; archetype?: string }>(seed: string, files: readonly N[], tuning: ForceGraphTuning,
  centre?: string, directory?: string): BodyBuilding {
  const gaps = bodyGaps(tuning);
  const tree: TreeFile[] = files.map(file => {
    const own = parentDirectory(file.codeRelativePath ?? file.id);
    return { id: file.id, radius: spatialNodeRadius(file, tuning), archetype: file.archetype, parts: own === "" ? [] : own.split("/") };
  });
  const root = directory === undefined || tree.length < 2
    ? enclose(seed, tree.map(file => ({ id: file.id, kind: "file" as const, radius: file.radius, files: 1, archetype: file.archetype, children: [] })), gaps, centre)
    : yield* bubbleOf(tree, gaps);
  return assembled(seed, root, gaps, centre);
}

/** The bubbles each body was assembled from, so that a bubble inside it can be a body of its own without packing it again. */
const assembledFrom = new WeakMap<GroupShape, { root: BodyNode; gaps: BodyGaps }>();

/**
 * The body a bubble inside this one would be as the shell of its directory (2026-11-07, third round): what a pop makes
 * of each bubble it releases. Since a bubble's packing depends only on what it holds, this is the shape `bodyShape`
 * would build for the bubble's files, taken from the packing already made instead of packing again; undefined when no
 * bubble directly inside the body is that directory's. Its seed is the shell's id, or, in the Structure layout, the
 * directory's hub's (`seed`, 2026-11-07).
 */
export function innerShape(shape: GroupShape, directory: string, seed = shellId(directory)): GroupShape | undefined {
  const from = assembledFrom.get(shape);
  const bubble = from?.root.children.find(child => child.node.kind === "directory" && child.node.id === directory)?.node;
  return bubble && from ? assembled(seed, bubble, from.gaps) : undefined;
}

/**
 * What a body's skin shows when nothing is drawn within it: one veiled bubble filling it, never an empty skin; the
 * label keeps the true count. A body whose own files pass `DRAWN_FILES` is drawn so, and since 2026-11-07 any body the
 * picture's budget (`pictureVeils`) veils.
 */
export function veiledUnits(shape: Pick<GroupShape, "seed" | "radius" | "margin" | "files">): BodyUnit[] {
  const radius = shape.radius ?? 0;
  return [{ id: shape.seed, kind: "directory", x: 0, y: 0, z: 0, radius: Math.max(0, radius - (shape.margin ?? 0)), reach: radius, files: shape.files ?? 0, depth: -1, veiled: true }];
}

/**
 * Which bodies of a picture draw nothing within their skins, so that the picture as a whole draws no more files within
 * skins than `DRAWN_FILES`, as one body does (2026-11-07, third round): while the files drawn pass the limit, the body
 * farthest from what was asked about is veiled, and among bodies as far, the largest by the files it holds, so that the
 * budget goes to the neighbourhood of the pin and, there, to the bodies whose interiors a person can read (the root's
 * order; the builder's brief had said the smallest first, which on the T3 sample gave the whole budget to one giant far
 * from the pin and veiled the shells beside it). Each body is given by its id, the files it holds, the files its skin
 * would draw and its hop from what was asked about, the nearest hop of a shown file it is wired to, or none when it is
 * wired to no shown file; the ids veiled are returned. Labels keep the true counts.
 */
export function pictureVeils(bodies: ReadonlyArray<{ id: string; files: number; drawn: number; hop?: number }>, limit = DRAWN_FILES): Set<string> {
  let drawn = 0;
  for (const body of bodies) drawn += body.drawn;
  const veiled = new Set<string>();
  const far = (body: { hop?: number }): number => body.hop ?? Infinity;
  const farther = (a: { hop?: number }, b: { hop?: number }): number => (far(b) > far(a) ? 1 : far(b) < far(a) ? -1 : 0);
  const order = bodies.filter(body => body.drawn > 0).sort((a, b) => farther(a, b) || b.files - a.files || b.drawn - a.drawn || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const body of order) {
    if (drawn <= limit) break;
    veiled.add(body.id);
    drawn -= body.drawn;
  }
  return veiled;
}

/** A body's shape from its packed bubble: every file's place, the units its skin shows within `DRAWN_FILES`, its outline. */
function assembled(seed: string, root: BodyNode, gaps: BodyGaps, centre?: string): GroupShape {
  const members: GroupMember[] = [], units: BodyUnit[] = [];
  /** Every file's place, depth first. */
  const place = (node: BodyNode, ox: number, oy: number, oz: number): void => {
    for (const child of node.children) {
      const x = ox + child.x, y = oy + child.y, z = oz + child.z;
      if (child.node.kind === "file") members.push({ id: child.node.id, x, y, z, radius: child.node.radius });
      else place(child.node, x, y, z);
    }
  };
  place(root, 0, 0, 0);
  // What the skin shows: opened breadth-first, a bubble's own files counted against the limit when it opens.
  let shown = 0;
  const queue: Array<{ node: BodyNode; x: number; y: number; z: number; depth: number }> = [{ node: root, x: 0, y: 0, z: 0, depth: 0 }];
  const fileCount = (node: BodyNode): number => node.children.filter(child => child.node.kind === "file" && child.node.id !== centre).length;
  let veiled = false;
  if (fileCount(root) > DRAWN_FILES) veiled = true;
  else shown += fileCount(root);
  for (let at = 0; !veiled && at < queue.length; at++) {
    const { node, x: ox, y: oy, z: oz, depth } = queue[at];
    // The smaller bubbles open first, so that as many as can be are seen open.
    for (const child of [...node.children].sort((a, b) => a.node.files - b.node.files || (a.node.id < b.node.id ? -1 : 1))) {
      const x = ox + child.x, y = oy + child.y, z = oz + child.z;
      if (child.node.kind === "file") {
        if (child.node.id !== centre) units.push({ id: child.node.id, kind: "file", x, y, z, radius: child.node.radius, reach: child.node.radius + gaps.gap / 2, files: 1, archetype: child.node.archetype, depth, parent: node === root ? undefined : node.id });
        continue;
      }
      const inner = fileCount(child.node), open = shown + inner <= DRAWN_FILES;
      if (open) shown += inner;
      units.push({ id: child.node.id, kind: "directory", x, y, z, radius: child.node.radius, reach: child.node.radius, files: child.node.files, depth, veiled: !open, parent: node === root ? undefined : node.id });
      if (open) queue.push({ node: child.node, x, y, z, depth: depth + 1 });
    }
  }
  const outline = root.children.map(child => ({ id: child.node.id, x: child.x, y: child.y, z: child.z, radius: child.node.radius }));
  const shape: GroupShape = { seed, members, outline, units, radius: root.radius, margin: gaps.margin, veiled, files: root.files };
  // A body whose own files are too many to draw is one veiled bubble inside its skin, never an empty one.
  if (veiled) units.push(...veiledUnits(shape));
  assembledFrom.set(shape, { root, gaps });
  return shape;
}

/** The pops of a picture after `directory` is popped open, or wrapped again with every pop beneath it. */
export function poppedAfter(popped: ReadonlySet<string>, directory: string, open: boolean): Set<string> {
  const next = new Set(popped);
  if (open) { next.add(directory); return next; }
  for (const at of popped) if (at === directory || directory === "" || at.startsWith(`${directory}/`)) next.delete(at);
  return next;
}

/**
 * What a body's pop releases, about the place the body stood (2026-11-05; the third round's bodies, 2026-11-07): each of
 * its files where its packing held it, and each bubble of its own skin where the skin showed it, as the body of its
 * directory, its packing taken from the popped body's (`innerShape`). A bubble is named by `bubbleId`: a directory
 * shell's id in the Connections layout, the directory's hub's in the Structure layout, where the bubbles are hubs.
 */
export function releaseOf(shape: GroupShape, place: Placed, bubbleId: (directory: string) => string = shellId): { born: Map<string, Placed>; bodies: Map<string, GroupShape> } {
  const born = new Map<string, Placed>(), bodies = new Map<string, GroupShape>();
  for (const member of shape.members) born.set(member.id, { x: place.x + member.x, y: place.y + member.y, z: place.z + member.z });
  for (const unit of shape.units ?? []) if (unit.kind === "directory" && unit.depth === 0) born.set(bubbleId(unit.id), { x: place.x + unit.x, y: place.y + unit.y, z: place.z + unit.z });
  for (const part of shape.outline ?? []) {
    const inner = innerShape(shape, part.id, bubbleId(part.id));
    if (inner) bodies.set(bubbleId(part.id), inner);
  }
  return { born, bodies };
}

/** One bubble of the Structure layout: a directory's hub drawn as the body of what stands under it, by the hub's id. */
export interface StructureCell {
  id: string;
  directory: string;
  /** Every file and document under the directory, at any depth, that the picture does not show, in id order. */
  files: string[];
}

/**
 * The bubbles of the Structure layout with Group Wrappers on (2026-11-07, the bag of cells): every directory hub the
 * picture shows none of whose children it shows, a hub at the frontier of the hops or one not opened, is drawn as the
 * body of everything under its directory, built from the leaves as a shell's body is, and keeps the hub's place, its
 * containment wire to its parent and its actions; a hub whose children the picture shows stays a hub with its spokes.
 * The owner, of the shells of the Connections layout, "I LOOOOOOOOVE seeing the cells in these embryos", and then "can
 * we also get the bag-of-cells look for the "structure" part too?" (Turn 8 of the November 6 record, linked from this file's
 * Live Doc).
 * The tree is read from the containment links, a hub's to its child hubs and to its own files and documents; a bubble
 * holds what under it the picture does not show, so that nothing is drawn twice. In directory order.
 *
 * No bubble shows one cell (the owner, November 7: "Make no embryos which appear to have only one cell"): a hub at the
 * frontier with one file under it is no bubble; that file stands in the hub's place, on the hub's wire to its parent
 * (`lone`), as a bubble's packing holds a subdirectory of one file as that file.
 */
export function structureCells(nodes: ReadonlyArray<{ id: string; directoryPath?: string }>,
  links: ReadonlyArray<{ source: string | { id: string }; target: string | { id: string }; kind?: string }>, shown: ReadonlySet<string>):
  { cells: StructureCell[]; lone: Array<{ hub: string; file: string; parent?: string }> } {
  const end = (endpoint: string | { id: string }): string => (typeof endpoint === "string" ? endpoint : endpoint.id);
  const children = new Map<string, string[]>(), parents = new Map<string, string>();
  for (const link of links) if (link.kind === "containment") {
    const parent = end(link.source);
    (children.get(parent) ?? children.set(parent, []).get(parent)!).push(end(link.target));
    parents.set(end(link.target), parent);
  }
  const hubs = new Set(nodes.filter(node => node.directoryPath !== undefined).map(node => node.id));
  const cells: StructureCell[] = [], lone: Array<{ hub: string; file: string; parent?: string }> = [];
  for (const node of nodes) {
    if (node.directoryPath === undefined || !shown.has(node.id)) continue;
    const below = children.get(node.id) ?? [];
    if (!below.length || below.some(id => shown.has(id))) continue;
    // Every leaf beneath it, whatever the depth, but what the picture shows apart from it: a pinned file, or a directory
    // opened deep inside, whose chain of hubs the hops did not join to this one, stands for itself and is not held twice.
    const files: string[] = [], stack = [...below];
    while (stack.length) {
      const id = stack.pop()!;
      if (shown.has(id)) continue;
      if (hubs.has(id)) stack.push(...(children.get(id) ?? []));
      else files.push(id);
    }
    if (files.length > 1) cells.push({ id: node.id, directory: node.directoryPath, files: files.sort() });
    else if (files.length === 1) lone.push({ hub: node.id, file: files[0], ...(parents.has(node.id) ? { parent: parents.get(node.id) } : {}) });
  }
  return { cells: cells.sort((a, b) => (a.directory < b.directory ? -1 : a.directory > b.directory ? 1 : 0)), lone: lone.sort((a, b) => (a.hub < b.hub ? -1 : a.hub > b.hub ? 1 : 0)) };
}

/** Where a child of the structure layout stands about its hub: the hub's id, its spoke's rest length, its place about the hub. */
export interface Spoke {
  hub: string;
  rest: number;
  at: Placed;
}

/**
 * The spokes of the structure layout's bag of cells (2026-11-08): each hub the picture shows with children shown is
 * packed as a ball with its children about it, the hub the fixed centre, by `packBall` with the gap given; each
 * child's distance from the hub there is its containment spoke's rest length, and its place about the hub where it is
 * born once its hub is placed. A child is as large as it stands: a file its sphere, a bubble its body, and a hub shown
 * open the ball of its own children, packed first, so that what an open subdirectory spreads around it has its room.
 * The springs are then at rest where nothing overlaps: with spokes ruled by the two ends' sizes and the link gap, the
 * bubbles of hundreds of files hung on spokes far shorter than themselves and stood through each other, and this
 * repository's start at one hop rested in four and a half times the frames it took without them (2026-11-07).
 *
 * The skins keep their own packing, free of their hubs: a ball centred on a small hub must be twice as wide as its
 * largest child, and nested so, the bubble of this repository's tests grew tenfold (545 units to 5,748, tried on
 * 2026-11-08). So a pop releases its children where the skin showed them, and they move from there to where their
 * spokes rest. By the child's id; the containment links read are those between shown nodes.
 *
 * The page packs the spokes with the tuning's link gap, the gap a spoke keeps between its ends when the wrappers are Off,
 * not the collision's: packed as tight as a skin packs its files, a hub's many files were pressed together against the
 * repulsion between them, and the headless twin of this repository's start at two hops took 824 ticks to rest against
 * 326 Off; with the link gap 328, and at one hop 147 against Off's 162 (2026-11-08).
 */
export function structureSpokes(links: ReadonlyArray<{ source: string | { id: string }; target: string | { id: string }; kind?: string }>, shown: ReadonlySet<string>,
  radiusOf: (id: string) => number, gap: number): Map<string, Spoke> {
  const end = (endpoint: string | { id: string }): string => (typeof endpoint === "string" ? endpoint : endpoint.id);
  const children = new Map<string, string[]>();
  for (const link of links) {
    if (link.kind !== "containment") continue;
    const hub = end(link.source), child = end(link.target);
    if (shown.has(hub) && shown.has(child)) (children.get(hub) ?? children.set(hub, []).get(hub)!).push(child);
  }
  const spokes = new Map<string, Spoke>(), extents = new Map<string, number>();
  const extentOf = (hub: string, path: Set<string>): number => {
    const known = extents.get(hub);
    if (known !== undefined) return known;
    const own = radiusOf(hub), below = children.get(hub) ?? [];
    if (!below.length || path.has(hub)) return own;
    path.add(hub);
    const units = [{ id: hub, radius: own }, ...below.map(child => ({ id: child, radius: children.has(child) ? extentOf(child, path) : radiusOf(child) }))];
    path.delete(hub);
    const { places, extent } = packBall(units, gap, hub);
    for (const child of below) {
      const at = places.get(child)!;
      spokes.set(child, { hub, rest: Math.hypot(at.x, at.y, at.z), at });
    }
    extents.set(hub, extent);
    return extent;
  };
  for (const hub of [...children.keys()].sort()) extentOf(hub, new Set());
  return spokes;
}

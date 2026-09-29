/**
 * What the inside of a thing shows: the folder map.
 *
 * @remarks
 * A thing opened is a folder. Its files are cards with their public symbols
 * as rows. A folder inside it closes into a box whose rows are its neighbours
 * with counts, unless it is small and holds no folder of its own, when its
 * files show flat; a folder that holds no files of its own is passed through,
 * its folders standing in its place under their longer names. An
 * edge between two files inside is a wire from the provider's row to the
 * consumer; an edge that leaves or enters the folder is a pin on the wall, one
 * per counterpart, the thing or the folder on the other side, with a count.
 * Providers rank left of their consumers, so provision flows left to right, as
 * it does at every scale inside a thing. Pure; the panel draws what this
 * returns.
 */

import { symbolName } from "@live-documentation/engine/live-docs/document";
import type { EdgeBasis, LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

/** A folder with this many files or fewer, and no folder of its own, shows its files instead of closing into a box. */
export const FLAT_FILES = 6;

export interface InsideRow {
  name: string;
  kind: string;
  slug?: string;
}

/** A file: a card with its public symbols as rows. */
export interface InsideCard {
  kind: "file";
  /** The file's workspace-relative path. */
  id: string;
  name: string;
  /** The path shown under the name, relative to the thing's folder. */
  sub: string;
  rows: InsideRow[];
}

/** A folder closed into a box. */
export interface InsideBox {
  kind: "folder";
  /** The folder's workspace-relative path. */
  id: string;
  name: string;
  /** The files inside it, at any depth. */
  files: string[];
}

export type InsideNode = InsideCard | InsideBox;

export interface InsideLine {
  from: string;
  to: string;
  label: string;
}

/** An edge between two nodes inside, from the consumer to the provider, as the docs write it. */
export interface InsideEdge {
  from: string;
  to: string;
  /** The provider's symbol the edge lands on, when the provider is a card. */
  toSymbol?: string;
  /** The consumer's symbol that carries the reference, when the consumer is a card and the docs say. */
  fromSymbol?: string;
  basis?: EdgeBasis;
  count: number;
  lines: InsideLine[];
}

/** A node a wall pin's edges touch, on which row. */
export interface InsideWallNode {
  id: string;
  symbol?: string;
  count: number;
}

/** A pin on the wall: what the folder calls beyond itself (`out`, the left wall) or serves to it (`in`, the right wall). */
export interface InsideWall {
  role: "in" | "out";
  counterpart: string;
  count: number;
  nodes: InsideWallNode[];
  lines: InsideLine[];
}

export interface InsideModel {
  thing: string;
  /** The folder opened, workspace-relative. */
  folder: string;
  nodes: InsideNode[];
  edges: InsideEdge[];
  walls: InsideWall[];
  /** Each node's column: providers left of their consumers. */
  rank: Map<string, number>;
}

export interface InsideOptions {
  thing: string;
  /** The thing's folder, workspace-relative. */
  thingFolder: string;
  /** The folder to open, the thing's folder or one inside it. */
  folder: string;
  /** The files of the thing, workspace-relative, sorted. */
  files: string[];
  graph: LiveDocGraph;
  /** The thing a file of the graph belongs to, when one does. */
  thingOf: (file: string) => string | undefined;
}

/** Builds the folder map of a thing, or of a folder inside it. */
export function buildInsideModel(options: InsideOptions): InsideModel {
  const { thing, thingFolder, folder, files, graph, thingOf } = options;
  const nodes: InsideNode[] = [];
  const nodeOf = new Map<string, string>();
  const card = (file: string): InsideCard => ({
    kind: "file",
    id: file,
    name: basename(file),
    sub: relative(file, thingFolder),
    rows: (graph.files[file]?.symbols ?? []).map((symbol) => ({ name: symbolName(symbol), kind: symbol.kind, ...(symbol.slug ? { slug: symbol.slug } : {}) }))
  });

  const children = new Map<string, string[]>();
  for (const file of files.filter((candidate) => isUnder(candidate, folder))) {
    const rest = relative(file, folder);
    const slash = rest.indexOf("/");
    if (slash === -1) {
      nodes.push(card(file));
      nodeOf.set(file, file);
    } else {
      const child = rest.slice(0, slash);
      children.set(child, [...(children.get(child) ?? []), file]);
    }
  }
  const pending: Array<{ path: string; name: string; members: string[] }> = [...children.entries()].map(([child, members]) => ({ path: `${folder}/${child}`, name: child, members }));
  while (pending.length) {
    const { path, name, members } = pending.shift()!;
    const inner = new Map<string, string[]>();
    let direct = 0;
    for (const file of members) {
      const rest = relative(file, path);
      const slash = rest.indexOf("/");
      if (slash === -1) {
        direct += 1;
      } else {
        const child = rest.slice(0, slash);
        inner.set(child, [...(inner.get(child) ?? []), file]);
      }
    }
    if (direct === 0 && inner.size > 0) {
      pending.unshift(...[...inner.entries()].map(([child, files]) => ({ path: `${path}/${child}`, name: `${name}/${child}`, members: files })));
    } else if (members.length <= FLAT_FILES && inner.size === 0) {
      for (const file of members) {
        nodes.push(card(file));
        nodeOf.set(file, file);
      }
    } else {
      nodes.push({ kind: "folder", id: path, name, files: [...members] });
      for (const file of members) {
        nodeOf.set(file, path);
      }
    }
  }
  const isBox = (id: string): boolean => nodes.some((node) => node.kind === "folder" && node.id === id);

  const counterpartOf = (file: string): string => {
    const owner = thingOf(file);
    if (owner !== undefined && owner !== thing) {
      return owner;
    }
    if (owner === thing) {
      const dir = dirname(relative(file, thingFolder));
      return dir === "" ? thing : dir;
    }
    return "elsewhere";
  };

  const edges = new Map<string, InsideEdge>();
  const walls = new Map<string, InsideWall>();
  const wall = (role: "in" | "out", counterpart: string, node: string, symbol: string | undefined, line: InsideLine): void => {
    const key = `${role}\u0000${counterpart}`;
    let entry = walls.get(key);
    if (!entry) {
      entry = { role, counterpart, count: 0, nodes: [], lines: [] };
      walls.set(key, entry);
    }
    entry.count += 1;
    entry.lines.push(line);
    const touched = entry.nodes.find((candidate) => candidate.id === node && candidate.symbol === symbol);
    if (touched) {
      touched.count += 1;
    } else {
      entry.nodes.push({ id: node, ...(symbol ? { symbol } : {}), count: 1 });
    }
  };

  for (const [file, doc] of Object.entries(graph.files)) {
    const inside = nodeOf.get(file);
    for (const edge of doc.edges) {
      if (edge.to === undefined) {
        continue;
      }
      const target = nodeOf.get(edge.to);
      const line: InsideLine = { from: file, to: edge.to, label: edge.label };
      if (inside !== undefined && target !== undefined) {
        if (inside === target && isBox(inside)) {
          continue;
        }
        const boxed = isBox(inside) || isBox(target);
        const toSymbol = boxed ? undefined : edge.toSymbol;
        const fromSymbol = boxed ? undefined : edge.from;
        const key = [inside, target, toSymbol ?? "", fromSymbol ?? ""].join("\u0000");
        const known = edges.get(key);
        if (known) {
          known.count += 1;
          known.lines.push(line);
        } else {
          edges.set(key, { from: inside, to: target, ...(toSymbol ? { toSymbol } : {}), ...(fromSymbol ? { fromSymbol } : {}), ...(edge.basis ? { basis: edge.basis } : {}), count: 1, lines: [line] });
        }
      } else if (inside !== undefined) {
        wall("out", counterpartOf(edge.to), inside, isBox(inside) ? undefined : edge.from, line);
      } else if (target !== undefined) {
        wall("in", counterpartOf(file), target, isBox(target) ? undefined : edge.toSymbol, line);
      }
    }
  }

  const providers = new Map<string, Set<string>>();
  for (const edge of edges.values()) {
    if (edge.from !== edge.to) {
      providers.set(edge.from, new Set([...(providers.get(edge.from) ?? []), edge.to]));
    }
  }
  const rank = new Map<string, number>();
  const stack = new Set<string>();
  const rankOf = (id: string): number => {
    const known = rank.get(id);
    if (known !== undefined) {
      return known;
    }
    if (stack.has(id)) {
      return 0;
    }
    stack.add(id);
    let value = 0;
    for (const provider of providers.get(id) ?? []) {
      value = Math.max(value, rankOf(provider) + 1);
    }
    stack.delete(id);
    rank.set(id, value);
    return value;
  };
  for (const node of nodes) {
    rankOf(node.id);
  }

  const byName = (a: { id: string }, b: { id: string }): number => a.id.localeCompare(b.id);
  return {
    thing,
    folder,
    nodes,
    edges: [...edges.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || (a.toSymbol ?? "").localeCompare(b.toSymbol ?? "")),
    walls: [...walls.values()].sort((a, b) => a.role.localeCompare(b.role) || b.count - a.count || a.counterpart.localeCompare(b.counterpart)).map((entry) => ({ ...entry, nodes: [...entry.nodes].sort(byName) })),
    rank
  };
}

/** The nodes a node is wired to, by the edges and the walls. */
export function neighboursOf(model: InsideModel, id: string): Set<string> {
  const related = new Set<string>([id]);
  for (const edge of model.edges) {
    if (edge.from === id) {
      related.add(edge.to);
    }
    if (edge.to === id) {
      related.add(edge.from);
    }
  }
  return related;
}

export function isUnder(file: string, folder: string): boolean {
  return folder === "" || file.startsWith(`${folder}/`);
}

export function relative(file: string, folder: string): string {
  return folder === "" ? file : file.slice(folder.length + 1);
}

export function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

export function dirname(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
}

/**
 * Where a board meets the graph.
 *
 * @remarks
 * A board names things and where their docs come from; the graph holds every
 * doc of the workspace. This module joins them: which files each thing has,
 * the doors it serves, the wires between things that the file-level edges
 * imply, the declared connections as wires of their own, and what the join
 * found wanting. A wire is what Structurizr calls an implied relationship: an
 * edge between files of two things is a wire between the things, grouped by
 * the door it lands on and the basis it was observed with. Nothing here reads
 * the file system, so a host that holds a board and a graph can draw the
 * board wherever it runs.
 *
 * @module
 */

import { DOOR_KINDS, type Board, type BoardIssue, type Door, type Thing } from "./board";
import { symbolName } from "./document";
import type { GraphFile, LiveDocGraph } from "./graph";

// ============================================================================
// The model
// ============================================================================

/** How a wire is known: the basis of the edges it stands for, or `declared` for a connection a person wrote. */
export type WireBasis = "source" | "contract" | "configuration" | "declared";

/** A door a wire lands on; the kind is absent when a declared connection names a door nothing serves. */
export interface WireDoor {
  name: string;
  kind?: string;
}

/** One wire between two things. */
export interface Wire {
  from: string;
  to: string;
  door?: WireDoor;
  basis: WireBasis;
  /** How many file-level edges the wire stands for; one for a declared connection. */
  edges: number;
  /** The technology a declared connection names. */
  over?: string;
}

/** A thing of the board with what the graph says about it. */
export interface BoardThing {
  thing: Thing;
  /** The workspace-relative folder `From` resolved to, when it stays inside the workspace. */
  folder?: string;
  /** The files of the graph under that folder, minus those under a thing nested inside it, sorted. */
  files: string[];
  /** The doors the docs say the thing serves, then the doors it declares, without repeats. */
  doors: Door[];
}

/** A board joined to the graph. */
export interface BoardGraph {
  things: BoardThing[];
  wires: Wire[];
  /** What the join found wanting: a `From` with no docs, a declared door nothing serves. Reports, not refusals. */
  issues: BoardIssue[];
}

// ============================================================================
// The join
// ============================================================================

/**
 * Joins a board to the graph of the workspace it sits in.
 *
 * @param board - The parsed board.
 * @param graph - The graph derived from the workspace's docs.
 * @param boardPath - Workspace-relative path of the board file, with forward slashes; `From` paths resolve against its folder.
 */
export function deriveBoardGraph(board: Board, graph: LiveDocGraph, boardPath: string): BoardGraph {
  const issues: BoardIssue[] = [];
  const boardDir = dirname(boardPath);

  const things: BoardThing[] = board.things.map((thing) => {
    const entry: BoardThing = { thing, files: [], doors: [] };
    if (thing.from !== undefined) {
      const folder = normalizePath(`${boardDir}/${thing.from}`);
      if (folder.startsWith("../") || folder === ".." || folder.startsWith("/")) {
        issues.push({ message: `${thing.name} comes from ${thing.from}, which is outside the workspace` });
      } else {
        entry.folder = folder;
      }
    }
    return entry;
  });

  // A file belongs to the thing with the longest folder that contains it, so a thing nested inside another keeps its own files.
  const owners = things.filter((entry) => entry.folder !== undefined).sort((a, b) => b.folder!.length - a.folder!.length);
  const ownerOf = new Map<string, BoardThing>();
  for (const codePath of Object.keys(graph.files)) {
    const owner = owners.find((entry) => codePath === entry.folder || codePath.startsWith(`${entry.folder}/`));
    if (owner) {
      owner.files.push(codePath);
      ownerOf.set(codePath, owner);
    }
  }
  for (const entry of things) {
    entry.files.sort();
    if (entry.folder !== undefined && entry.files.length === 0) {
      issues.push({ message: `${entry.thing.name} has no docs under ${entry.folder}` });
    }
    const seen = new Set<string>();
    const add = (door: Door): void => {
      const key = `${door.kind}\u0000${door.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        entry.doors.push(door);
      }
    };
    for (const codePath of entry.files) {
      for (const door of doorsOf(graph.files[codePath])) {
        add(door);
      }
    }
    for (const door of entry.thing.serves) {
      add(door);
    }
  }

  const wires = new Map<string, Wire>();
  for (const entry of things) {
    for (const codePath of entry.files) {
      for (const edge of graph.files[codePath].edges) {
        if (edge.to === undefined) {
          continue;
        }
        const target = ownerOf.get(edge.to);
        if (!target || target === entry) {
          continue;
        }
        const door = edge.toSymbol ? doorNamed(graph.files[edge.to], edge.toSymbol) : undefined;
        const basis: WireBasis = edge.basis ?? "source";
        const key = wireKey(entry.thing.name, target.thing.name, door, basis);
        const wire = wires.get(key);
        if (wire) {
          wire.edges += 1;
        } else {
          wires.set(key, { from: entry.thing.name, to: target.thing.name, ...(door ? { door } : {}), basis, edges: 1 });
        }
      }
    }
  }
  for (const connection of board.connections) {
    const target = things.find((entry) => entry.thing.name === connection.to);
    let door: WireDoor | undefined;
    if (connection.door !== undefined) {
      const served = target?.doors.find((candidate) => candidate.name === connection.door);
      door = served ?? { name: connection.door };
      if (!served) {
        issues.push({ message: `${connection.from} to ${connection.to}.${connection.door}: ${connection.to} serves no such door` });
      }
    }
    const wire: Wire = { from: connection.from, to: connection.to, ...(door ? { door } : {}), basis: "declared", edges: 1 };
    if (connection.over !== undefined) {
      wire.over = connection.over;
    }
    wires.set(wireKey(connection.from, connection.to, door, "declared"), wire);
  }

  return { things, wires: [...wires.values()].sort(compareWires), issues };
}

/** The doors a file serves: its public symbols whose kind is an opening kind. */
export function doorsOf(file: GraphFile): Door[] {
  return file.symbols.filter((symbol) => DOOR_KINDS.has(symbol.kind)).map((symbol) => ({ name: symbolName(symbol), kind: symbol.kind }));
}

function doorNamed(file: GraphFile, slug: string): WireDoor | undefined {
  const symbol = file.symbols.find((candidate) => candidate.slug === slug);
  return symbol && DOOR_KINDS.has(symbol.kind) ? { name: symbolName(symbol), kind: symbol.kind } : undefined;
}

function wireKey(from: string, to: string, door: WireDoor | undefined, basis: WireBasis): string {
  return [from, to, door?.kind ?? "", door?.name ?? "", basis].join("\u0000");
}

function compareWires(a: Wire, b: Wire): number {
  return compare(a.from, b.from) || compare(a.to, b.to) || compare(a.door?.name ?? "", b.door?.name ?? "") || compare(a.basis, b.basis);
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function dirname(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "." : path.slice(0, slash);
}

/** Collapses `.` and `..` segments of a forward-slash path, keeping a leading `..` that escapes the start. */
function normalizePath(path: string): string {
  const segments: string[] = [];
  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === ".." && segments.length > 0 && segments[segments.length - 1] !== "..") {
      segments.pop();
    } else {
      segments.push(segment);
    }
  }
  return `${path.startsWith("/") ? "/" : ""}${segments.join("/")}`;
}

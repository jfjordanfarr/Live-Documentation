/**
 * Where a board meets the graph.
 *
 * @remarks
 * A board names things and where their docs come from; the graph holds every
 * doc of the workspace. This module joins them: which files each thing has,
 * the doors it serves, what it stands on, the wires between things that the
 * file-level edges imply, the declared connections as wires of their own, and
 * what the join found wanting. A wire is what Structurizr calls an implied
 * relationship: an edge between files of two things is a wire between the
 * things, grouped by the door it lands on and the basis it was observed with.
 * Nothing here reads the file system, so a host that holds a board and a
 * graph can draw the board wherever it runs.
 *
 * @module
 */

import { DOOR_KINDS, type Board, type BoardIssue, type Door, type Thing } from "./board";
import { symbolName } from "./document";
import type { EdgeBasis, GraphFile, LiveDocGraph } from "./graph";
import { MANIFEST_KINDS } from "./openings";

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

/** One file-level edge behind a wire: the evidence a hover shows. */
export interface WireLine {
  from: string;
  to: string;
  /** The dependency label as the doc writes it. */
  label: string;
}

/** One wire between two things. */
export interface Wire {
  from: string;
  to: string;
  door?: WireDoor;
  basis: WireBasis;
  /** How many file-level edges the wire stands for; one for a declared connection. */
  edges: number;
  /** The file-level edges behind the wire; empty for a declared connection. */
  lines: WireLine[];
  /** The technology a declared connection names. */
  over?: string;
}

/** Something a thing stands on that lives outside it: what a manifest names and no doc answers to. */
export interface StandsOn {
  /** The label as the manifest's doc writes it, `name@version` for a package. */
  label: string;
  /** The manifest file that names it. */
  manifest: string;
}

/** A ghost: what files of a thing name and nothing on the board serves, a route, an address or a database object, with the basis it was named under. */
export interface Ghost {
  /** The name as the doc writes it. */
  label: string;
  basis: EdgeBasis;
  /** The files that name it, sorted. */
  files: string[];
}

/** A door a thing serves, with the file whose doc publishes it; no file when the board declares the door. */
export interface ServedDoor extends Door {
  file?: string;
}

/** A thing of the board with what the graph says about it. */
export interface BoardThing {
  thing: Thing;
  /** The workspace-relative folder `From` resolved to, when it stays inside the workspace. */
  folder?: string;
  /** The files of the graph under that folder, minus those under a thing nested inside it, sorted. */
  files: string[];
  /** The doors the docs say the thing serves, each with its file, then the doors it declares, without repeats. */
  doors: ServedDoor[];
  /** What its manifests name that nothing in the workspace answers to, without repeats. */
  standsOn: StandsOn[];
  /** What its files name under a basis that nothing on the board serves, one ghost per name and basis. */
  ghosts: Ghost[];
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

  const things: BoardThing[] = board.things.map((thing) => {
    const entry: BoardThing = { thing, files: [], doors: [], standsOn: [], ghosts: [] };
    if (thing.from !== undefined) {
      const folder = folderOf(thing.from, boardPath);
      if (folder === undefined) {
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
    const seenDoors = new Set<string>();
    const addDoor = (door: ServedDoor): void => {
      const key = `${door.kind}\u0000${door.name}`;
      if (!seenDoors.has(key)) {
        seenDoors.add(key);
        entry.doors.push(door);
      }
    };
    const seenLabels = new Set<string>();
    const ghosts = new Map<string, Ghost>();
    for (const codePath of entry.files) {
      const file = graph.files[codePath];
      for (const door of doorsOf(file)) {
        addDoor({ ...door, file: codePath });
      }
      const manifest = file.symbols.some((symbol) => MANIFEST_KINDS.has(symbol.kind));
      for (const edge of file.edges) {
        if (edge.to !== undefined || (edge.kind !== "import" && edge.kind !== "re-export")) {
          continue;
        }
        if (edge.basis !== undefined) {
          const key = `${edge.basis}\u0000${edge.label}`;
          const ghost = ghosts.get(key) ?? { label: edge.label, basis: edge.basis, files: [] };
          if (!ghost.files.includes(codePath)) {
            ghost.files.push(codePath);
          }
          ghosts.set(key, ghost);
        } else if (manifest && edge.link === undefined && !seenLabels.has(edge.label)) {
          seenLabels.add(edge.label);
          entry.standsOn.push({ label: edge.label, manifest: codePath });
        }
      }
    }
    entry.ghosts = [...ghosts.values()].sort((a, b) => compare(a.basis, b.basis) || compare(a.label, b.label));
    for (const door of entry.thing.serves) {
      addDoor(door);
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
        const line: WireLine = { from: codePath, to: edge.to, label: edge.label };
        const wire = wires.get(key);
        if (wire) {
          wire.edges += 1;
          wire.lines.push(line);
        } else {
          wires.set(key, { from: entry.thing.name, to: target.thing.name, ...(door ? { door } : {}), basis, edges: 1, lines: [line] });
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
    const wire: Wire = { from: connection.from, to: connection.to, ...(door ? { door } : {}), basis: "declared", edges: 1, lines: [] };
    if (connection.over !== undefined) {
      wire.over = connection.over;
    }
    wires.set(wireKey(connection.from, connection.to, door, "declared"), wire);
  }

  return { things, wires: [...wires.values()].sort(compareWires), issues };
}

/**
 * The workspace-relative folder a `From` line names, resolved against the board's folder;
 * undefined when it leaves the workspace.
 */
export function folderOf(from: string, boardPath: string): string | undefined {
  const folder = normalizePath(`${dirname(boardPath)}/${from}`);
  return folder.startsWith("../") || folder === ".." || folder.startsWith("/") ? undefined : folder;
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

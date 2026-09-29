/**
 * What the World Map draws, read from a board joined to the graph.
 *
 * @remarks
 * A thing that holds things is a region; every other thing is a piece. A wire
 * between two pieces is a road: in the air, door to door, when it lands on a
 * door or was observed beyond source, which is a call; on the board when it is
 * an import or a project reference, which is one piece standing on another's
 * code. A declared connection between two regions is a crossing. What two or
 * more pieces stand on outside the board is a token they share. Pure; the
 * renderer draws what this returns.
 */

import { legendFor, SHAPES, TINTS, type Board } from "@live-documentation/engine/live-docs/board";
import type { BoardGraph, ServedDoor, StandsOn, WireBasis, WireDoor, WireLine } from "@live-documentation/engine/live-docs/boardGraph";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import type { Shape } from "./layout";
import type { Point2 } from "./projection";

export type Tint = "blue" | "orange" | "green" | "grey" | "violet" | "rose";

/** A thing drawn as a solid on the board. */
export interface WorldPiece {
  name: string;
  kind?: string;
  shape: Shape;
  /** The region that holds it, when one does. */
  region?: string;
  folder?: string;
  /** The files of its docs, sorted. */
  files: string[];
  symbols: number;
  doors: ServedDoor[];
  /** What its manifests name outside the workspace. */
  standsOn: StandsOn[];
  /** No folder and no docs: a thing imagined and not yet built. */
  imagined: boolean;
}

/** A thing that holds things, drawn as a tinted region around them. */
export interface WorldRegion {
  name: string;
  kind?: string;
  tint: Tint;
  /** What it holds directly, pieces and regions. */
  holds: string[];
  /** Every piece inside it, at any depth. */
  pieces: string[];
  parent?: string;
  depth: number;
}

/** A wire between two pieces. */
export interface WorldRoad {
  id: string;
  from: string;
  to: string;
  /** A call in the air, door to door; or one piece standing on another's code, a line on the board. */
  kind: "call" | "stands";
  door?: WireDoor;
  basis: WireBasis;
  count: number;
  lines: WireLine[];
  over?: string;
}

/** A declared connection between two regions. */
export interface WorldCrossing {
  id: string;
  from: string;
  to: string;
  over?: string;
}

/** Something two or more pieces stand on. */
export interface WorldToken {
  key: string;
  label: string;
  kind: "package" | "reference";
  users: string[];
}

export interface WorldModel {
  title: string;
  pieces: WorldPiece[];
  regions: WorldRegion[];
  roads: WorldRoad[];
  crossings: WorldCrossing[];
  tokens: WorldToken[];
  /** Positions the board's Layout gives, in board units, for pieces. */
  positions: Map<string, Point2>;
  /** What could not be drawn, in words. */
  issues: string[];
}

/** Builds what the World Map draws. */
export function buildWorldModel(board: Board, joined: BoardGraph, graph: LiveDocGraph): WorldModel {
  const issues = joined.issues.map((issue) => issue.message);
  const holderOf = new Map<string, string>();
  for (const thing of board.things) {
    for (const held of thing.holds) {
      holderOf.set(held, thing.name);
    }
  }
  const isRegion = new Set(board.things.filter((thing) => thing.holds.length > 0).map((thing) => thing.name));

  const regions: WorldRegion[] = board.things
    .filter((thing) => isRegion.has(thing.name))
    .map((thing) => {
      const entry = legendFor(board, thing.kind);
      const tint = entry && TINTS.has(entry.as) ? (entry.as as Tint) : "grey";
      let depth = 0;
      for (let holder = holderOf.get(thing.name); holder !== undefined; holder = holderOf.get(holder)) {
        depth += 1;
      }
      return { name: thing.name, kind: thing.kind, tint, holds: [...thing.holds], pieces: [], parent: holderOf.get(thing.name), depth };
    });
  const regionByName = new Map(regions.map((region) => [region.name, region]));
  const leavesOf = (name: string, seen = new Set<string>()): string[] => {
    const region = regionByName.get(name);
    if (!region || seen.has(name)) {
      return [];
    }
    seen.add(name);
    return region.holds.flatMap((held) => (isRegion.has(held) ? leavesOf(held, seen) : [held]));
  };
  for (const region of regions) {
    region.pieces = leavesOf(region.name);
  }

  const pieces: WorldPiece[] = joined.things
    .filter((entry) => !isRegion.has(entry.thing.name))
    .map((entry) => {
      const legend = legendFor(board, entry.thing.kind);
      const shape = legend && SHAPES.has(legend.as) ? (legend.as as Shape) : "cube";
      return {
        name: entry.thing.name,
        kind: entry.thing.kind,
        shape,
        region: holderOf.get(entry.thing.name),
        folder: entry.folder,
        files: entry.files,
        symbols: entry.files.reduce((count, file) => count + (graph.files[file]?.symbols.length ?? 0), 0),
        doors: entry.doors,
        standsOn: entry.standsOn,
        imagined: entry.thing.from === undefined
      };
    });
  const pieceNames = new Set(pieces.map((piece) => piece.name));

  const roads: WorldRoad[] = [];
  const crossings: WorldCrossing[] = [];
  for (const wire of joined.wires) {
    const fromPiece = pieceNames.has(wire.from);
    const toPiece = pieceNames.has(wire.to);
    if (fromPiece && toPiece) {
      const kind = wire.door || wire.basis !== "source" ? "call" : "stands";
      roads.push({ id: `${wire.from}>${wire.to}:${wire.door?.name ?? ""}:${wire.basis}`, from: wire.from, to: wire.to, kind, door: wire.door, basis: wire.basis, count: wire.edges, lines: wire.lines, over: wire.over });
    } else if (isRegion.has(wire.from) && isRegion.has(wire.to)) {
      crossings.push({ id: `${wire.from}>${wire.to}`, from: wire.from, to: wire.to, over: wire.over });
    } else {
      issues.push(`${wire.from} to ${wire.to} joins a thing and a region, which is not drawn yet`);
    }
  }

  const usersOf = new Map<string, string[]>();
  for (const piece of pieces) {
    for (const item of piece.standsOn) {
      usersOf.set(item.label, [...(usersOf.get(item.label) ?? []), piece.name]);
    }
  }
  const tokens: WorldToken[] = [...usersOf.entries()]
    .filter(([, users]) => users.length > 1)
    .map(([label, users]): WorldToken => ({ key: label, label, kind: label.includes("@") ? "package" : "reference", users }))
    .sort((a, b) => b.users.length - a.users.length || a.label.localeCompare(b.label));

  const positions = new Map<string, Point2>();
  for (const placement of board.layout) {
    if (pieceNames.has(placement.name)) {
      positions.set(placement.name, [placement.x, placement.y]);
    }
  }

  return { title: board.title, pieces, regions, roads, crossings, tokens, positions, issues };
}

/** The region a piece is in, at every depth, nearest first. */
export function regionsOf(model: WorldModel, piece: string): WorldRegion[] {
  const result: WorldRegion[] = [];
  let name = model.pieces.find((candidate) => candidate.name === piece)?.region;
  while (name !== undefined) {
    const region = model.regions.find((candidate) => candidate.name === name);
    if (!region) {
      break;
    }
    result.push(region);
    name = region.parent;
  }
  return result;
}

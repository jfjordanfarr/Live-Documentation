/**
 * Where the folder map's cards, boxes, pins and wall pins sit.
 *
 * @remarks
 * Columns by rank, providers left; cards stacked in a column by name; a card
 * as tall as its rows and a closed box as tall as its neighbours; wall pins
 * down the left edge for what the folder calls and down the right edge for
 * what it serves. Sizes are in pixels at reading size and never scale. Pure.
 */

import type { InsideModel, InsideWall } from "./model";

export const CARD_W = 220;
export const ROW_H = 20;
export const HEAD_H = 46;
export const GAP = 22;
/** The least room left of the first column, and right of the last, for the wall labels. */
export const X0 = 70;
/** Room per character of the longest wall label, beyond a margin of 24. */
const LABEL_PX = 7;
export const Y0 = 60;
export const WALL_STEP = 40;
export const WALL_Y0 = 40;

export interface PlacedNode {
  id: string;
  kind: "file" | "folder";
  x: number;
  y: number;
  w: number;
  h: number;
  /** The row keys in order: a card's symbol slugs then `""` for Internals; a box's neighbour ids. */
  rows: string[];
}

export interface PlacedWall extends InsideWall {
  x: number;
  y: number;
}

export interface InsideLayout {
  width: number;
  height: number;
  nodes: Map<string, PlacedNode>;
  walls: PlacedWall[];
}

/** Lays the folder map out for a viewport, in map pixels. */
export function layoutInside(model: InsideModel, viewport: { width: number; height: number }): InsideLayout {
  const maxRank = Math.max(0, ...[...model.rank.values()]);
  const labelRoom = (role: "in" | "out"): number => Math.max(X0, 24 + LABEL_PX * Math.max(0, ...model.walls.filter((wall) => wall.role === role).map((wall) => `${wall.counterpart} · ${wall.count}`.length)));
  const left = labelRoom("out");
  const right = labelRoom("in");
  const columnWidth = clamp((viewport.width - 40 - left - right - CARD_W) / Math.max(1, maxRank), 250, 300);
  const columns = new Map<number, string[]>();
  for (const node of model.nodes) {
    const rank = model.rank.get(node.id) ?? 0;
    columns.set(rank, [...(columns.get(rank) ?? []), node.id]);
  }
  const neighboursOfBox = (id: string): string[] => {
    const set = new Set<string>();
    for (const edge of model.edges) {
      if (edge.from === id && edge.to !== id) {
        set.add(edge.to);
      }
      if (edge.to === id && edge.from !== id) {
        set.add(edge.from);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  };
  const nodes = new Map<string, PlacedNode>();
  let maxX = 0;
  let maxY = 0;
  for (const [rank, ids] of [...columns.entries()].sort((a, b) => a[0] - b[0])) {
    ids.sort((a, b) => a.slice(a.lastIndexOf("/") + 1).localeCompare(b.slice(b.lastIndexOf("/") + 1)));
    let y = Y0;
    const x = left + rank * columnWidth;
    for (const id of ids) {
      const node = model.nodes.find((candidate) => candidate.id === id)!;
      const rows = node.kind === "file" ? [...node.rows.map((row) => row.slug ?? row.name), ""] : neighboursOfBox(id);
      const h = HEAD_H + ROW_H * Math.max(1, rows.length) + 2;
      nodes.set(id, { id, kind: node.kind, x, y, w: CARD_W, h, rows });
      y += h + GAP;
      maxX = Math.max(maxX, x + CARD_W);
      maxY = Math.max(maxY, y);
    }
  }
  const outs = model.walls.filter((wall) => wall.role === "out");
  const ins = model.walls.filter((wall) => wall.role === "in");
  const width = Math.max(maxX + right + 20, 620);
  const height = Math.max(maxY, WALL_Y0 + WALL_STEP * Math.max(outs.length, ins.length) + 20) + 30;
  const walls: PlacedWall[] = [
    ...outs.map((wall, i) => ({ ...wall, x: 0, y: WALL_Y0 + WALL_STEP * i })),
    ...ins.map((wall, i) => ({ ...wall, x: width, y: WALL_Y0 + WALL_STEP * i }))
  ];
  return { width, height, nodes, walls };
}

/** Where a wire meets a node: at the row named, or the last row, on the left for a pin that takes or the right for one that gives. */
export function pinOf(layout: InsideLayout, id: string, row: string | undefined, side: "in" | "out"): [number, number] {
  const node = layout.nodes.get(id);
  if (!node) {
    return [0, 0];
  }
  let index = row === undefined ? -1 : node.rows.indexOf(row);
  if (index === -1) {
    index = node.rows.length - 1;
  }
  return [side === "out" ? node.x + node.w : node.x, node.y + 1 + HEAD_H + ROW_H * Math.max(0, index) + ROW_H / 2];
}

export function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

/**
 * A plain drawing of a lab picture, at reading size (one pixel of the picture to one pixel of the drawing), for judging
 * outlines by eye: each directory's outline by the page's own `membranePath`, its name at the label's place, every card
 * as a box with its file's name, and every wire as a straight line from pin to pin through its lanes' slots. Ground an
 * outline encloses over a column in which its directory holds no card of its own is tinted amber, so that what a person
 * sees first is the ground a directory claims and holds nothing in. It is the picture's geometry, not the page's look: a
 * light ground for legibility, no rows, no curves, no colours of kind.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <out.png> <x> <y> <width> <height> <title>=<geometry.json> ...
 *
 * Draws each geometry's region, two a row, each under its title, into one PNG (by ImageMagick's drawing language).
 *
 * @module layout-price/draw
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { rowItemsOf } from "../../../../../../../packages/explorer/src/client/views/localView/branch-scene";
import { membranePath } from "../../../../../../../packages/explorer/src/client/views/localView/membrane-outline";
import type { Picture } from "./lean";

export interface Geometry {
  cards: Array<{ id: string; left: number; top: number; width: number; height: number }>;
  /** Each segment says whether its directory holds a card of its own in that column. */
  boxes: Array<{ key: string; directory: string; depth: number; segments: Array<{ left: number; right: number; top: number; bottom: number; holds?: boolean }> }>;
  wires: Array<[number, number, number, number]>;
}

/** The picture's geometry: cards, drawn outlines and straight wires. */
export function geometryOf({ scene }: Pick<Picture, "scene">): Geometry {
  const cards = [...scene.items.values()].map(item => ({
    id: item.id, left: scene.lefts[item.column] + item.inset, top: scene.tops.get(item.id) ?? 0,
    width: scene.widths[item.column] - 2 * item.inset, height: scene.heights.get(item.id) ?? 0
  }));
  const depthOf = (box: (typeof scene.boxes)[number]): number => { let d = 0; for (let b = box.parent; b; b = b.parent) d++; return d; };
  const boxes = scene.boxes.filter(box => box.kind === "directory").map(box => {
    const own = new Set(rowItemsOf(box).map(id => scene.items.get(id)?.column));
    return { key: box.key, directory: box.directory, depth: depthOf(box), segments: box.segments.map(s => ({ left: s.left, right: s.right, top: s.top, bottom: s.bottom, holds: own.has(s.column) })) };
  });
  // Where a wire's end stands: a card's pin at its edge, or a lane's slot at its middle.
  const card = new Map(cards.map(c => [c.id, c]));
  const slotX = new Map<string, number>();
  for (const lane of scene.lanes.values()) {
    const segment = lane.segments[0];
    if (segment) for (const slot of lane.slots ?? []) slotX.set(slot, (segment.left + segment.right) / 2);
  }
  const end = (pin: { item: string; offset: number }, side: "left" | "right"): [number, number] | null => {
    const top = scene.placement.top.get(pin.item);
    if (top === undefined) return null;
    const c = card.get(pin.item);
    const x = c ? (side === "right" ? c.left + c.width : c.left) : slotX.get(pin.item);
    return x === undefined ? null : [x, top + pin.offset];
  };
  const wires: Geometry["wires"] = [];
  for (const wire of scene.wires) {
    const a = end(wire.from, "right"), b = end(wire.to, "left");
    if (a && b) wires.push([a[0], a[1], b[0], b[1]]);
  }
  return { cards, boxes, wires };
}

const escape = (text: string): string => text.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");

const quote = (text: string): string => text.replace(/\\/gu, "\\\\").replace(/'/gu, "\\'");

/**
 * One panel as an ImageMagick drawing (MVG, whose strokes ImageMagick draws where its SVG reader drops them): the region
 * [x, y, w, h] of a geometry under a title, the region's corner at the panel's.
 */
function panel(g: Geometry, x: number, y: number, w: number, h: number, title: string): { mvg: string; width: number; height: number } {
  const head = 40;
  const parts: string[] = [`viewbox 0 0 ${w} ${h + head}`, "stroke none", `fill #ffffff rectangle 0,0 ${w},${head}`, `fill #f2f2ee rectangle 0,${head} ${w},${h + head}`,
    "push graphic-context", `translate ${-x},${head - y}`];
  const fills = ["#e6e3f5", "#d9d4f0", "#ccc5ea", "#bfb6e4", "#b3a8de"];
  for (const box of [...g.boxes].sort((a, b) => a.depth - b.depth)) {
    const d = membranePath(box.segments, 8);
    parts.push(`stroke none fill ${fills[Math.min(box.depth, fills.length - 1)]} path '${d}'`);
    // Ground the directory claims over a column where it holds no card of its own.
    for (const s of box.segments) if (s.holds === false) parts.push(`stroke none fill #f7c873 rectangle ${s.left},${s.top} ${s.right},${s.bottom}`);
    parts.push(`fill none stroke #4b3fa0 stroke-width 3 path '${d}'`);
    const first = box.segments[0];
    parts.push(`stroke none fill #2c2370 font-size 15 text ${first.left + 12},${first.top + 24} '${quote(box.directory)}'`);
  }
  for (const [x1, y1, x2, y2] of g.wires) parts.push(`fill none stroke #1d8f7c stroke-width 1.4 line ${x1},${y1} ${x2},${y2}`);
  for (const c of g.cards) {
    parts.push(`fill #ffffff stroke #555555 stroke-width 2 rectangle ${c.left},${c.top} ${c.left + c.width},${c.top + c.height}`);
    parts.push(`stroke none fill #111111 font-size 15 text ${c.left + 12},${c.top + 24} '${quote(c.id.split("/").pop()!)}'`);
  }
  // The title's band last, so that nothing above the region is drawn over the title.
  parts.push("pop graphic-context", `stroke none fill #ffffff rectangle 0,0 ${w},${head - 1}`, `stroke none fill #111111 font-size 20 text 12,27 '${quote(title)}'`);
  return { mvg: parts.join("\n"), width: w, height: h + head };
}

function main(): void {
  const [out, xs, ys, ws, hs, ...rest] = process.argv.slice(2);
  const [x, y, w, h] = [xs, ys, ws, hs].map(Number);
  // `--scale <n>` as the last two arguments enlarges the drawing, for a detail too small to see at reading size.
  const scaleAt = rest.indexOf("--scale");
  const scale = scaleAt >= 0 ? Number(rest[scaleAt + 1]) : 1;
  const specs = scaleAt >= 0 ? rest.slice(0, scaleAt) : rest;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "draw-"));
  // Each panel drawn alone, then two a row, so that a before and its after stand side by side.
  const pngs = specs.map((spec, i) => {
    const at = spec.indexOf("=");
    const g = JSON.parse(fs.readFileSync(spec.slice(at + 1), "utf8")) as Geometry;
    const drawn = panel(g, x, y, w, h, spec.slice(0, at));
    execFileSync("convert", ["-size", `${drawn.width}x${drawn.height}`, "xc:white", "-draw", drawn.mvg, "-bordercolor", "#888888", "-border", "6", path.join(dir, `${i}.png`)]);
    return path.join(dir, `${i}.png`);
  });
  const rows: string[] = [];
  for (let i = 0; i < pngs.length; i += 2) {
    const row = path.join(dir, `row-${i}.png`);
    execFileSync("convert", [...pngs.slice(i, i + 2), "+append", row]);
    rows.push(row);
  }
  execFileSync("convert", [...rows, "-append", ...(scale !== 1 ? ["-filter", "point", "-resize", `${scale * 100}%`] : []), out]);
  fs.rmSync(dir, { recursive: true });
}

if (process.argv[1] && /draw\.ts$/u.test(process.argv[1])) main();

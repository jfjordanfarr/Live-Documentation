/**
 * A plain drawing of a lab picture, at reading size (one pixel of the picture to one pixel of the drawing), for judging
 * outlines by eye: each directory's outline by the page's own `membranePath`, its name at the label's place, every card
 * as a box with its file's name, and every wire as a straight line from pin to pin through its lanes' slots. It is the
 * picture's geometry, not the page's look: no rows, no curves, no colours of kind.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <out.png> <x> <y> <width> <height> <title>=<geometry.json> ...
 *
 * Draws each geometry's region, two a row, each under its title, into one PNG (by ImageMagick's own SVG renderer).
 *
 * @module layout-price/draw
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { membranePath } from "../../../../../../../packages/explorer/src/client/views/localView/membrane-outline";
import type { Picture } from "./lean";

export interface Geometry {
  cards: Array<{ id: string; left: number; top: number; width: number; height: number }>;
  boxes: Array<{ key: string; directory: string; depth: number; segments: Array<{ left: number; right: number; top: number; bottom: number }> }>;
  wires: Array<[number, number, number, number]>;
}

/** The picture's geometry: cards, drawn outlines and straight wires. */
export function geometryOf({ scene }: Pick<Picture, "scene">): Geometry {
  const cards = [...scene.items.values()].map(item => ({
    id: item.id, left: scene.lefts[item.column] + item.inset, top: scene.tops.get(item.id) ?? 0,
    width: scene.widths[item.column] - 2 * item.inset, height: scene.heights.get(item.id) ?? 0
  }));
  const depthOf = (box: (typeof scene.boxes)[number]): number => { let d = 0; for (let b = box.parent; b; b = b.parent) d++; return d; };
  const boxes = scene.boxes.filter(box => box.kind === "directory").map(box => ({
    key: box.key, directory: box.directory, depth: depthOf(box), segments: box.segments.map(s => ({ left: s.left, right: s.right, top: s.top, bottom: s.bottom }))
  }));
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

/** One panel as its own SVG: the region [x, y, w, h] of a geometry under a title, the region's corner at the panel's. */
function panel(g: Geometry, x: number, y: number, w: number, h: number, title: string): string {
  const head = 36;
  const parts: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + head}">`, `<rect width="${w}" height="${h + head}" fill="#111111"/>`,
    `<rect y="${head}" width="${w}" height="${h}" fill="#1f1f1f"/>`, `<g transform="translate(${-x},${head - y})">`];
  for (const box of [...g.boxes].sort((a, b) => a.depth - b.depth)) {
    const shade = Math.min(70, 36 + 7 * box.depth);
    parts.push(`<path d="${membranePath(box.segments, 8)}" fill="rgb(${shade},${shade},${shade + 10})" stroke="#8a7fd0" stroke-width="2"/>`);
    const first = box.segments[0];
    parts.push(`<text x="${first.left + 12}" y="${first.top + 24}" font-size="14" fill="#c8c8ff" font-family="DejaVu Sans">${escape(box.directory)}</text>`);
  }
  for (const [x1, y1, x2, y2] of g.wires) parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2fb8a0" stroke-width="1.5"/>`);
  for (const c of g.cards) {
    parts.push(`<rect x="${c.left}" y="${c.top}" width="${c.width}" height="${c.height}" rx="6" fill="#2b2b2b" stroke="#888888" stroke-width="1.5"/>`);
    parts.push(`<text x="${c.left + 12}" y="${c.top + 22}" font-size="14" font-weight="bold" fill="#f2f2f2" font-family="DejaVu Sans">${escape(c.id.split("/").pop()!)}</text>`);
  }
  parts.push("</g>", `<text x="10" y="25" font-size="19" fill="#eeeeee" font-family="DejaVu Sans">${escape(title)}</text>`, "</svg>");
  return parts.join("\n");
}

function main(): void {
  const [out, xs, ys, ws, hs, ...specs] = process.argv.slice(2);
  const [x, y, w, h] = [xs, ys, ws, hs].map(Number);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "draw-"));
  // Each panel drawn alone, then two a row, so that a before and its after stand side by side.
  const pngs = specs.map((spec, i) => {
    const at = spec.indexOf("=");
    const g = JSON.parse(fs.readFileSync(spec.slice(at + 1), "utf8")) as Geometry;
    fs.writeFileSync(path.join(dir, `${i}.svg`), panel(g, x, y, w, h, spec.slice(0, at)));
    execFileSync("convert", [path.join(dir, `${i}.svg`), "-bordercolor", "#111111", "-border", "12", path.join(dir, `${i}.png`)]);
    return path.join(dir, `${i}.png`);
  });
  const rows: string[] = [];
  for (let i = 0; i < pngs.length; i += 2) {
    const row = path.join(dir, `row-${i}.png`);
    execFileSync("convert", [...pngs.slice(i, i + 2), "+append", row]);
    rows.push(row);
  }
  execFileSync("convert", [...rows, "-append", out]);
  fs.rmSync(dir, { recursive: true });
}

if (process.argv[1] && /draw\.ts$/u.test(process.argv[1])) main();

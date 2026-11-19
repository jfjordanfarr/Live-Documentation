/**
 * The text-shape probe's sheets without a browser (2026-11-19): when the shared browser lane is busy, lays out the
 * pictures `run.ts` drew in the same rows as `compose.ts`, without the captions (the README names each row and tile by
 * position). It reads the PNGs `shape.ts` wrote, which are unfiltered, so decoding is an inflate.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/text-shape/compose-plain.ts
 */

import * as fs from "node:fs";
import path from "node:path";
import { inflateSync } from "node:zlib";

import { png, type Picture } from "./shape";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SHOTS = path.join(HERE, "../../Screenshots/text-shape");
fs.mkdirSync(SHOTS, { recursive: true });
const sheets = JSON.parse(fs.readFileSync(path.join(HERE, "sheets.json"), "utf8")) as Record<string, Array<{ heading: string; tiles: Array<{ image: string }> }>>;

/** A PNG `shape.ts` wrote: one IDAT, filter 0 on every row. */
function read(file: string): Picture {
  const bytes = fs.readFileSync(file);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  const chunks: Buffer[] = [];
  for (let at = 8; at < bytes.length;) {
    const length = bytes.readUInt32BE(at), type = bytes.toString("ascii", at + 4, at + 8);
    if (type === "IDAT") chunks.push(bytes.subarray(at + 8, at + 8 + length));
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(chunks)), data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) raw.copy(Buffer.from(data.buffer, y * width * 4, width * 4), 0, y * (width * 4 + 1) + 1, (y + 1) * (width * 4 + 1));
  return { width, height, data };
}

const GAP = 14, ROW_GAP = 28, WIDTH = 1560;
for (const [name, rows] of Object.entries(sheets)) {
  // Lines of tiles, wrapped at the sheet's width, a wider gap between the sheet's rows.
  const lines: Picture[][] = [];
  const rowStarts: number[] = [];
  for (const row of rows) {
    rowStarts.push(lines.length);
    let line: Picture[] = [], used = GAP;
    for (const tile of row.tiles) {
      const picture = read(path.join(HERE, "out", tile.image));
      if (used + picture.width + GAP > WIDTH && line.length) { lines.push(line); line = []; used = GAP; }
      line.push(picture); used += picture.width + GAP;
    }
    lines.push(line);
  }
  const heights = lines.map(line => Math.max(...line.map(p => p.height)));
  const height = heights.reduce((a, b) => a + b, 0) + GAP * lines.length + ROW_GAP * rows.length + GAP;
  const out = new Uint8ClampedArray(WIDTH * height * 4);
  for (let i = 0; i < WIDTH * height; i++) { out[i * 4] = 16; out[i * 4 + 1] = 17; out[i * 4 + 2] = 20; out[i * 4 + 3] = 255; }
  let y = GAP;
  lines.forEach((line, l) => {
    if (rowStarts.includes(l)) y += ROW_GAP;
    let x = GAP;
    for (const p of line) {
      const top = y + Math.round((heights[l] - p.height) / 2);
      for (let py = 0; py < p.height; py++) for (let px = 0; px < p.width; px++) {
        const from = (py * p.width + px) * 4, to = ((top + py) * WIDTH + x + px) * 4;
        for (let c = 0; c < 4; c++) out[to + c] = p.data[from + c];
      }
      x += p.width + GAP;
    }
    y += heights[l] + GAP;
  });
  fs.writeFileSync(path.join(SHOTS, `${name}.png`), png({ width: WIDTH, height, data: out }));
  console.log(`Wrote ${name}.png`);
}

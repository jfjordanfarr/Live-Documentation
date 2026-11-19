/**
 * The text-shape probe's pure part (2026-11-19, the owner's Turn 24 of the November 18 record): a file's text as a grid of
 * ink, a small sketch of each band of its lines, and three candidate marbles and a 2D pin drawn from them, pixel by
 * pixel, into RGBA buffers. No browser: the sheets are composed from these pictures afterwards. Nothing here is product
 * code; it reads the product's feature directions so that the grain is the milestone-three construction per band.
 */

import { deflateSync } from "node:zlib";

import { featureDirection } from "../../../../../../../packages/explorer/src/client/views/marbleSketch";

/** The grid: 32 columns over the first 128 characters (four to a cell, tabs as four spaces). */
export const COLUMNS = 32, CHARACTERS = 128, TAB = 4;

/**
 * Rows: one per line up to 64, then 64 rows each the mean of its lines. A marble on screen is at most about 60 pixels
 * across, so more rows than 64 could not be drawn; fewer than the file's lines would merge the lines of a short file,
 * whose shape is line by line. So a short file keeps its lines, and a long file is squeezed to its page's profile.
 */
export const MAX_ROWS = 64;

/** The bands that carry their own grain, and how much of a band's sum turns its grain by a radian. */
export const BANDS = 8, GRAIN_TURN = 0.35;

export interface Shape {
  /** The ink of each cell, 0 to 1, row by row. */
  ink: Float32Array;
  rows: number;
  lines: number;
  /** Each band's eight strengths, -1 to 1. */
  grain: number[][];
}

/** A text's lines, tabs expanded. */
const linesOf = (text: string): string[] => {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines.map(line => line.replace(/\t/g, " ".repeat(TAB)));
};

/** A text's shape: its ink grid and its bands' grain. */
export function shapeOf(text: string): Shape {
  const lines = linesOf(text);
  const count = Math.max(1, lines.length), rows = Math.min(MAX_ROWS, count);
  const ink = new Float32Array(rows * COLUMNS);
  for (let r = 0; r < rows; r++) {
    const from = Math.floor(r * count / rows), to = Math.max(from + 1, Math.floor((r + 1) * count / rows));
    for (let l = from; l < to; l++) {
      const line = lines[l] ?? "";
      for (let ch = 0; ch < Math.min(CHARACTERS, line.length); ch++) if (line[ch] !== " ") ink[r * COLUMNS + Math.floor(ch * COLUMNS / CHARACTERS)] += 1;
    }
    const cells = (to - from) * (CHARACTERS / COLUMNS);
    for (let c = 0; c < COLUMNS; c++) ink[r * COLUMNS + c] = Math.min(1, ink[r * COLUMNS + c] / cells);
  }
  const grain: number[][] = [];
  for (let b = 0; b < BANDS; b++) {
    const from = Math.floor(b * count / BANDS), to = Math.floor((b + 1) * count / BANDS);
    const sum = new Array<number>(8).fill(0);
    for (let l = from; l < to; l++) {
      const direction = featureDirection(`line\u0000${(lines[l] ?? "").trim()}`);
      for (let i = 0; i < 8; i++) sum[i] += direction[i];
    }
    grain.push(sum.map(value => Math.sin(value / GRAIN_TURN)));
  }
  return { ink, rows, lines: lines.length, grain };
}

/** The ink at a point of the page, u across and v down, both 0 to 1, read between the cells. */
function inkAt(shape: Shape, u: number, v: number): number {
  const x = Math.min(COLUMNS - 1, Math.max(0, u * COLUMNS - 0.5)), y = Math.min(shape.rows - 1, Math.max(0, v * shape.rows - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(COLUMNS - 1, x0 + 1), y1 = Math.min(shape.rows - 1, y0 + 1);
  const fx = x - x0, fy = y - y0, at = (c: number, r: number): number => shape.ink[r * COLUMNS + c];
  return (at(x0, y0) * (1 - fx) + at(x1, y0) * fx) * (1 - fy) + (at(x0, y1) * (1 - fx) + at(x1, y1) * fx) * fy;
}

/** Fixed directions, frequencies and phases of the grain's eight fine waves over the page. */
const GRAIN_WAVES = Array.from({ length: 8 }, (_, i) => ({ angle: i * 0.785 + 0.3, frequency: 9 + (i % 4) * 2.5, phase: i * 1.7 }));

/** The grain of a point of the page in its band, about -1 to 1. */
function grainAt(shape: Shape, u: number, v: number): number {
  const strengths = shape.grain[Math.min(BANDS - 1, Math.max(0, Math.floor(v * BANDS)))];
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    const wave = GRAIN_WAVES[i];
    sum += strengths[i] * Math.sin(2 * Math.PI * wave.frequency * (Math.cos(wave.angle) * u + Math.sin(wave.angle) * v) + wave.phase);
  }
  return sum / 2.4;
}

export type Candidate = "P" | "PG" | "BG";

export interface Look {
  /** The kind's colour, the glass. */
  glass: string;
  /** The veins' colours and their shares, for BG. */
  offers: string;
  uses: string;
  shares: { offers: number; uses: number };
  /** A number from the file's path, 0 to 1, that tilts BG. */
  seed: number;
}

const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
const mixed = (a: number[], b: number[], t: number): number[] => a.map((value, i) => value * (1 - t) + b[i] * t);

/** Square from disc (the elliptical grid mapping's inverse), so that the whole page fills the ball's face. */
function discToSquare(x: number, y: number): [number, number] {
  const r2 = 2 * Math.SQRT2, a = 2 + x * x - y * y, b = 2 - x * x + y * y;
  const u = 0.5 * Math.sqrt(Math.max(0, a + r2 * x)) - 0.5 * Math.sqrt(Math.max(0, a - r2 * x));
  const v = 0.5 * Math.sqrt(Math.max(0, b + r2 * y)) - 0.5 * Math.sqrt(Math.max(0, b - r2 * y));
  return [(u + 1) / 2, (1 - v) / 2];
}

const LIGHT = (() => { const l = [-0.45, 0.75, 0.5], n = Math.hypot(...l); return l.map(v => v / n); })();
/** How much the ink darkens the glass, and how much the grain moves its light: low contrast both. */
const INK = 0.42, GRAIN = 0.2;

/** The colour of a point of a marble, unlit, at a point of the ball facing the viewer (x right, y up, z out). */
function surface(shape: Shape, candidate: Candidate, look: Look, x: number, y: number, z: number): number[] {
  const glass = rgb(look.glass);
  if (candidate !== "BG") {
    const [u, v] = discToSquare(x, y);
    let colour = glass.map(value => value * (1 - INK * inkAt(shape, u, v)));
    if (candidate === "PG") colour = colour.map(value => value * (1 + GRAIN * grainAt(shape, u, v)));
    return colour;
  }
  // The bands as veins: the page wrapped round a ball tilted by the file's path, rows as latitudes, its front half's
  // columns as longitudes, and the ink drawn in the veins' colours, blue and green in their shares' proportion by row.
  const tilt = (look.seed - 0.5) * 1.2, lean = 0.35;
  const x1 = x * Math.cos(tilt) - y * Math.sin(tilt), y1 = x * Math.sin(tilt) + y * Math.cos(tilt);
  const y2 = y1 * Math.cos(lean) - z * Math.sin(lean), z2 = y1 * Math.sin(lean) + z * Math.cos(lean);
  const v = Math.acos(Math.max(-1, Math.min(1, y2))) / Math.PI, u = 0.5 + Math.atan2(x1, z2) / Math.PI;
  const ink = u >= 0 && u <= 1 ? inkAt(shape, u, v) : 0;
  const row = Math.floor(v * shape.rows);
  const total = look.shares.offers + look.shares.uses;
  const blueRow = ((row * 2654435761) >>> 0) / 0x100000000 < (total ? look.shares.offers / total : 0.5);
  const vein = total ? rgb(blueRow ? look.offers : look.uses) : glass.map(value => Math.min(1, value * 1.45 + 0.1));
  let colour = mixed(glass, vein, Math.min(1, ink * 1.6) * 0.8);
  colour = colour.map(value => value * (1 + GRAIN * grainAt(shape, Math.min(1, Math.max(0, u)), v)));
  return colour;
}

/** RGBA pixels. */
export interface Picture { width: number; height: number; data: Uint8ClampedArray }

const BACKGROUND = rgb("#101114");

/** A marble of `size` pixels across, on the sheets' dark ground. */
export function marble(shape: Shape, candidate: Candidate, look: Look, size: number): Picture {
  const data = new Uint8ClampedArray(size * size * 4), k = size <= 64 ? 3 : 2;
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const sum = [0, 0, 0];
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) {
      const x = ((px + (i + 0.5) / k) / size) * 2 - 1, y = 1 - ((py + (j + 0.5) / k) / size) * 2, r2 = x * x + y * y;
      let colour = BACKGROUND;
      if (r2 <= 1) {
        const z = Math.sqrt(1 - r2);
        const lambert = 0.38 + 0.62 * Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
        const reflect = 2 * (x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]) * z - LIGHT[2];
        const shine = 0.3 * Math.pow(Math.max(0, reflect), 56);
        // The glass at three quarters, over the ground, as the map draws a sphere.
        colour = mixed(BACKGROUND, surface(shape, candidate, look, x, y, z).map(value => Math.min(1, value * lambert + shine)), 0.85);
      }
      for (let c = 0; c < 3; c++) sum[c] += colour[c];
    }
    const at = (py * size + px) * 4;
    for (let c = 0; c < 3; c++) data[at + c] = Math.round(255 * sum[c] / (k * k));
    data[at + 3] = 255;
  }
  return { width: size, height: size, data };
}

/** The Internals row's inbound pin as a small rounded box holding the page, on the card's ground. */
export function pin(shape: Shape, look: Look, width: number, height: number, grain: boolean, card: string): Picture {
  const data = new Uint8ClampedArray(width * height * 4), k = 3, ground = rgb(card), glass = rgb(look.glass);
  const radius = Math.min(width, height) * 0.3;
  for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
    const sum = [0, 0, 0];
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) {
      const x = px + (i + 0.5) / k, y = py + (j + 0.5) / k;
      const dx = Math.max(radius - x, 0, x - (width - radius)), dy = Math.max(radius - y, 0, y - (height - radius));
      let colour = ground;
      if (dx * dx + dy * dy <= radius * radius) {
        const u = x / width, v = y / height;
        let inside = glass.map(value => value * (1 - INK * inkAt(shape, u, v)));
        if (grain) inside = inside.map(value => value * (1 + GRAIN * grainAt(shape, u, v)));
        colour = mixed(ground, inside, 0.8);
      }
      for (let c = 0; c < 3; c++) sum[c] += colour[c];
    }
    const at = (py * width + px) * 4;
    for (let c = 0; c < 3; c++) data[at + c] = Math.round(255 * sum[c] / (k * k));
    data[at + 3] = 255;
  }
  return { width, height, data };
}

/** How far two pictures of one size differ where they differ most: the largest mean change of brightness over 8 × 8 windows, 0 to 255. */
export function largestChange(a: Picture, b: Picture): number {
  let most = 0;
  const luma = (p: Picture, i: number): number => 0.2126 * p.data[i] + 0.7152 * p.data[i + 1] + 0.0722 * p.data[i + 2];
  for (let y = 0; y + 8 <= a.height; y += 4) for (let x = 0; x + 8 <= a.width; x += 4) {
    let total = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const at = ((y + j) * a.width + x + i) * 4; total += Math.abs(luma(a, at) - luma(b, at)); }
    most = Math.max(most, total / 64);
  }
  return most;
}

/** A picture as PNG bytes. */
export function png(picture: Picture): Buffer {
  const { width, height, data } = picture;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (width * 4 + 1)] = 0; Buffer.from(data.buffer, data.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1); }
  const table = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buffer: Buffer): number => { let c = 0xffffffff; for (const byte of buffer) c = table[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type: string, body: Buffer): Buffer => {
    const head = Buffer.alloc(8); head.writeUInt32BE(body.length, 0); head.write(type, 4, "ascii");
    const tail = Buffer.alloc(4); tail.writeUInt32BE(crc(Buffer.concat([head.subarray(4), body])), 0);
    return Buffer.concat([head, body, tail]);
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", header), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

/** The shape in Braille, two columns and four rows of the grid to a character, a dot where the ink passes a quarter. */
export function braille(shape: Shape): string {
  const bits = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
  const out: string[] = [];
  for (let r = 0; r < shape.rows; r += 4) {
    let line = "";
    for (let c = 0; c < COLUMNS; c += 2) {
      let code = 0;
      for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) if (r + dy < shape.rows && shape.ink[(r + dy) * COLUMNS + c + dx] > 0.25) code |= bits[dy][dx];
      line += String.fromCharCode(0x2800 + code);
    }
    out.push(line.replace(/⠀+$/u, ""));
  }
  return out.join("\n");
}

/** The shape as one line: the grid at four levels, two bits a cell, then the grain at a byte a strength, in base64. */
export function encoded(shape: Shape): string {
  const grid = Buffer.alloc(Math.ceil(shape.rows * COLUMNS / 4));
  for (let i = 0; i < shape.rows * COLUMNS; i++) grid[i >> 2] |= Math.min(3, Math.round(shape.ink[i] * 3 / 0.6)) << ((i & 3) * 2);
  const grain = Buffer.from(shape.grain.flat().map(value => Math.round((value + 1) * 127.5)));
  return `${shape.rows}:${grid.toString("base64")}:${grain.toString("base64")}`;
}

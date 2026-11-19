/**
 * The text-shape probe's blind reading (2026-11-19, root's addition on the owner's invitation to hear "this does not
 * work"): unlabelled pictures for a stranger, with the answers kept apart in `trials-key.json`. Each picture is balls
 * (or 2D pins) on the dark ground in rows, with no names or captions. The candidates are P, PG and BG of `shape.ts`, and
 * today's From Its Doc marble (D), its shader ported here pixel for pixel, as the baseline. Run from the repository's
 * root after `run.ts`:
 *
 *   npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/text-shape/trials.ts
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";

import { parseLiveDoc } from "../../../../../../../packages/engine/src/live-docs/document";
import { deriveLiveDocGraph, linkTarget } from "../../../../../../../packages/engine/src/live-docs/graph";
import { DEFAULT_PALETTE, paletteNamed } from "../../../../../../../packages/explorer/src/client/palette";
import { fileShares, MARBLE_WAVES, marbleCounts, marbleSeed, spatialKindOf } from "../../../../../../../packages/explorer/src/client/views/forceGraphAppearance";
import { marbleSketches, type Sketch } from "../../../../../../../packages/explorer/src/client/views/marbleSketch";
import { explorerGraphOf } from "../../../../../../../packages/explorer/src/shared/graph";
import { marble, pin, png, shapeOf, type Candidate, type Look, type Picture } from "./shape";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(HERE, "trials");
fs.mkdirSync(OUT, { recursive: true });
const PALETTE = paletteNamed(DEFAULT_PALETTE);
const git = (...args: string[]): Buffer | null => { try { return execFileSync("git", args, { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }); } catch { return null; } };
const textAt = (commit: string, file: string): string | null => { const b = git("show", `${commit}:${file}`); return b === null ? null : file.endsWith(".png") ? b.toString("latin1") : b.toString("utf8"); };

const data = JSON.parse(fs.readFileSync("dist/explorer/explorer-data.json", "utf8")) as { graph: Parameters<typeof explorerGraphOf>[0] };
const graph = explorerGraphOf(data.graph);
const counts = marbleCounts(graph);
const archetypeOf = (file: string): string => graph.nodes.find(node => node.id === file)?.archetype ?? (file.endsWith(".png") ? "asset" : "implementation");
const lookOf = (file: string): Look => {
  const archetype = archetypeOf(file);
  return { glass: PALETTE.kind[spatialKindOf(archetype)], offers: PALETTE.role.offers, uses: PALETTE.role.uses, shares: fileShares(file, archetype, counts), seed: marbleSeed(file) };
};

// A seeded run of numbers, so that the trials are the same on every run.
let state = 20261119;
const random = (): number => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 0x100000000; };
const shuffle = <T>(items: T[]): T[] => { const out = [...items]; for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; };

/** Today's From Its Doc marble, the product's fragment shader computed here: the baseline. */
function today(file: string, sketch: Sketch | undefined, size: number): Picture {
  const look = lookOf(file), seed = look.seed, rgb = (hex: string): number[] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const glass = rgb(look.glass), blue = rgb(look.offers), green = rgb(look.uses), ground = rgb("#101114");
  const z0 = 2 * ((seed * 7.31) % 1) - 1, around = 2 * Math.PI * ((seed * 3.17) % 1);
  const axis = [Math.sqrt(Math.max(0, 1 - z0 * z0)) * Math.cos(around), Math.sqrt(Math.max(0, 1 - z0 * z0)) * Math.sin(around), z0];
  const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cross = (a: number[], b: number[]): number[] => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a: number[]): number[] => { const n = Math.hypot(...a); return a.map(v => v / n); };
  const u = norm(cross(axis, helper)), v = cross(axis, u), dot = (a: number[], b: number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const light = norm([-0.45, 0.75, 0.5]);
  const out = new Uint8ClampedArray(size * size * 4), k = 3;
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const sum = [0, 0, 0];
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) {
      const x = ((px + (i + 0.5) / k) / size) * 2 - 1, y = 1 - ((py + (j + 0.5) / k) / size) * 2, r2 = x * x + y * y;
      let colour = ground;
      if (r2 <= 1) {
        const p = [x, y, Math.sqrt(1 - r2)];
        const h = dot(p, axis), turn = Math.atan2(dot(p, v), dot(p, u) + 1e-6) / (2 * Math.PI);
        let warp: number;
        if (sketch) warp = MARBLE_WAVES.bend * MARBLE_WAVES.waves.reduce((total, wave, w) => total + sketch[w] * Math.sin(wave.frequency * dot(wave.direction as unknown as number[], p) + wave.phase), 0);
        else warp = 0.07 * Math.sin(7 * h + 2 * Math.PI * seed) + 0.042 * Math.sin(4 * Math.PI * turn + 4 * h);
        const t = 3 * turn + 1.35 * h + warp + seed, f = t - Math.floor(t);
        const surfaceColour = f < look.shares.offers ? blue : f < look.shares.offers + look.shares.uses ? green : glass;
        const lambert = 0.38 + 0.62 * Math.max(0, dot(p, light)), reflect = 2 * dot(p, light) * p[2] - light[2];
        const lit = surfaceColour.map(c => Math.min(1, c * lambert + 0.3 * Math.pow(Math.max(0, reflect), 56)));
        colour = ground.map((g, c) => g * 0.15 + lit[c] * 0.85);
      }
      for (let c = 0; c < 3; c++) sum[c] += colour[c];
    }
    const at = (py * size + px) * 4;
    for (let c = 0; c < 3; c++) out[at + c] = Math.round(255 * sum[c] / (k * k));
    out[at + 3] = 255;
  }
  return { width: size, height: size, data: out };
}

/** A file's doc sketch at a commit, as the product makes it (as `docSketchAt` in scripts/contact-sheet/marble-sheet.ts). */
function docSketchAt(commit: string, id: string): Sketch | undefined {
  const location = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
  const own = `${location.root}/${location.baseLayer}/${id}${location.extension}`, text = textAt(commit, own);
  if (text === null) return undefined;
  const doc = parseLiveDoc(text), docs = [{ docPath: own, doc }];
  const links = new Set<string>();
  for (const dependency of doc.dependencies) if (dependency.link) links.add(dependency.link);
  for (const symbol of doc.symbols) for (const reference of symbol.references) {
    for (const type of reference.role === "Parameters" ? reference.parameters.flatMap(parameter => parameter.types) : reference.types) if (type.link) links.add(type.link);
  }
  for (const link of links) {
    const target = linkTarget(own, link, location);
    if (!target || target.codePath === id || docs.some(entry => entry.docPath === target.docPath)) continue;
    const targetText = textAt(commit, target.docPath);
    if (targetText !== null) docs.push({ docPath: target.docPath, doc: parseLiveDoc(targetText) });
  }
  return marbleSketches(explorerGraphOf(deriveLiveDocGraph(docs, location))).get(id);
}

type Kind = Candidate | "D";
const draw = (kind: Kind, file: string, commit: string, size: number): Picture => {
  const text = textAt(commit, file) ?? "";
  return kind === "D" ? today(file, docSketchAt(commit, file), size) : marble(shapeOf(text), kind, lookOf(file), size);
};

/** Pictures in rows on the dark ground, with a gap, as one picture. */
function grid(rows: Picture[][], gap = 18): Picture {
  const width = Math.max(...rows.map(row => row.reduce((w, p) => w + p.width, 0) + gap * (row.length + 1)));
  const height = rows.reduce((h, row) => h + Math.max(...row.map(p => p.height)), 0) + gap * (rows.length + 1);
  const out = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) { out[i * 4] = 16; out[i * 4 + 1] = 17; out[i * 4 + 2] = 20; out[i * 4 + 3] = 255; }
  let y = gap;
  for (const row of rows) {
    let x = gap;
    for (const p of row) {
      for (let py = 0; py < p.height; py++) for (let px = 0; px < p.width; px++) {
        const from = (py * p.width + px) * 4, to = ((y + py) * width + x + px) * 4;
        for (let c = 0; c < 4; c++) out[to + c] = p.data[from + c];
      }
      x += p.width + gap;
    }
    y += Math.max(...row.map(p => p.height)) + gap;
  }
  return { width, height, data: out };
}

const key: Record<string, unknown> = {};
let number = 0;
const write = (picture: Picture, answer: unknown, note: unknown): string => {
  const name = `trial-${String(++number).padStart(2, "0")}.png`;
  fs.writeFileSync(path.join(OUT, name), png(picture));
  key[name] = { answer, note };
  return name;
};

const touches = JSON.parse(fs.readFileSync(path.join(HERE, "touches.json"), "utf8")) as Array<{ commit: string; file: string }>;
const textFiles = [...new Set(touches.map(t => t.file))].filter(f => /\.(ts|css|md|json|mjs)$/.test(f));
const KINDS: Kind[] = ["P", "PG", "BG", "D"];
const plan: Array<{ picture: string; question: string }> = [];

const Q1 = "Two rows of the same six balls, in the same order: the top row at one moment, the bottom row at a later one. Exactly one ball changed between them. Which one (count from the left, 1 to 6)? Say how sure you are and what you saw.";
const Q2 = Q1;
const Q3 = "Two balls. One is drawn from a database query whose text was aligned by eye in columns (every alias at one column, the joins and their conditions lined up); the other from the same query formatted conventionally. Which one (left or right) is the aligned one, and what in the picture tells you?";
const Q4 = "Four balls. Three are drawn from text files of different lengths, one from a file that is not text at all. Which one (1 to 4 from the left) is not text? Then order the other three from the shortest file to the longest.";

// Q1: a real touch, the changed file and five files the commit did not touch, before and after it; three trials a kind.
const q1Touches = shuffle(touches.filter(t => textFiles.includes(t.file))).slice(0, 12);
KINDS.forEach((kind, k) => {
  for (let trial = 0; trial < 3; trial++) {
    const touch = q1Touches[k * 3 + trial];
    const others = shuffle(textFiles.filter(f => f !== touch.file && textAt(`${touch.commit}^`, f) !== null)).slice(0, 5);
    const files = shuffle([touch.file, ...others]);
    const rows = [`${touch.commit}^`, touch.commit].map(commit => files.map(file => draw(kind, file, commit, 72)));
    plan.push({ picture: write(grid(rows), files.indexOf(touch.file) + 1, { kind, question: 1, file: touch.file, commit: touch.commit }), question: Q1 });
  }
});

// Q2: one or two lines of a small file; two trials a kind.
const smalls: Array<{ commit: string; file: string }> = [];
{
  const log = git("log", "-600", "--numstat", "--format=C %H", "--", "packages", "scripts", "tests/e2e")!.toString().split("\n");
  let commit = "";
  for (const line of log) {
    if (line.startsWith("C ")) { commit = line.slice(2); continue; }
    const parts = line.split("\t");
    if (parts.length !== 3 || parts[0] === "-") continue;
    const changed = Number(parts[0]) + Number(parts[1]);
    if (changed < 1 || changed > 2 || !/\.(ts|css)$/.test(parts[2])) continue;
    const after = textAt(commit, parts[2]), before = textAt(`${commit}^`, parts[2]);
    if (!after || !before) continue;
    const length = after.split("\n").length;
    if (length >= 15 && length <= 60 && !smalls.some(s => s.file === parts[2])) smalls.push({ commit, file: parts[2] });
    if (smalls.length >= 8) break;
  }
}
KINDS.forEach((kind, k) => {
  for (let trial = 0; trial < 2; trial++) {
    const touch = smalls[(k * 2 + trial) % smalls.length];
    const others = shuffle(textFiles.filter(f => f !== touch.file && textAt(`${touch.commit}^`, f) !== null && (textAt(touch.commit, f) ?? "").split("\n").length <= 120)).slice(0, 5);
    const files = shuffle([touch.file, ...others]);
    const rows = [`${touch.commit}^`, touch.commit].map(commit => files.map(file => draw(kind, file, commit, 72)));
    plan.push({ picture: write(grid(rows), files.indexOf(touch.file) + 1, { kind, question: 2, file: touch.file, commit: touch.commit }), question: Q2 });
  }
});

// Q3: aligned against conventional, one trial a candidate (today's marble has no doc for these files).
const aligned = fs.readFileSync(path.join(HERE, "payments-aligned.sql"), "utf8"), conventional = fs.readFileSync(path.join(HERE, "payments-conventional.sql"), "utf8");
for (const kind of ["P", "PG", "BG"] as Candidate[]) {
  const left = random() < 0.5;
  const [a, c] = [aligned, conventional].map(text => marble(shapeOf(text), kind, lookOf("payments.sql"), 120));
  plan.push({ picture: write(grid([left ? [a, c] : [c, a]]), left ? "left" : "right", { kind, question: 3 }), question: Q3 });
}

// Q4: three text files of about 30, 300 and 2,000 lines and a PNG; two trials a kind.
{
  const lengths = textFiles.map(file => ({ file, lines: (textAt("HEAD", file) ?? "").split("\n").length })).filter(f => f.lines > 1);
  const near = (target: number, skip: string[]): string => lengths.filter(f => !skip.includes(f.file)).sort((a, b) => Math.abs(Math.log(a.lines / target)) - Math.abs(Math.log(b.lines / target)))[0].file;
  const pngs = ["AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/marble-patterns/files-doc.png", "AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/marble-patterns/bends.png"];
  const used: string[] = [];
  KINDS.forEach(kind => {
    for (let trial = 0; trial < 2; trial++) {
      const files = [30, 300, 2000].map(target => { const f = near(target * (trial ? 1.3 : 1), used); used.push(f); return f; });
      const order = shuffle([...files, pngs[trial]]);
      const pictures = order.map(file => draw(kind, file, "HEAD", 96));
      const answer = { notText: order.indexOf(pngs[trial]) + 1, shortestToLongest: files.map(f => order.indexOf(f) + 1) };
      plan.push({ picture: write(grid([pictures]), answer, { kind, question: 4, files: order }), question: Q4 });
    }
  });
}

// Q5: questions 1 and 3 on the 2D pin at its real size (18 × 14) on the card's ground, the page alone and with grain.
for (const grain of [false, true]) {
  for (let trial = 0; trial < 2; trial++) {
    const touch = q1Touches[(trial + (grain ? 2 : 0) + 5) % q1Touches.length];
    const others = shuffle(textFiles.filter(f => f !== touch.file && textAt(`${touch.commit}^`, f) !== null)).slice(0, 5);
    const files = shuffle([touch.file, ...others]);
    const rows = [`${touch.commit}^`, touch.commit].map(commit => files.map(file => pin(shapeOf(textAt(commit, file) ?? ""), lookOf(file), 18, 14, grain, "#1d2027")));
    plan.push({ picture: write(grid(rows, 14), files.indexOf(touch.file) + 1, { kind: grain ? "pin+G" : "pin", question: "5/1", file: touch.file, commit: touch.commit }),
      question: Q1.replace("balls", "small boxes").replace("ball changed", "box changed") });
  }
  const left = random() < 0.5;
  const [a, c] = [aligned, conventional].map(text => pin(shapeOf(text), lookOf("payments.sql"), 18, 14, grain, "#1d2027"));
  plan.push({ picture: write(grid([left ? [a, c] : [c, a]], 14), left ? "left" : "right", { kind: grain ? "pin+G" : "pin", question: "5/3" }),
    question: Q3.replace("Two balls", "Two small boxes") });
}

fs.writeFileSync(path.join(HERE, "trials-key.json"), JSON.stringify(key, null, 2));
fs.writeFileSync(path.join(OUT, "questions.json"), JSON.stringify(plan, null, 2));
console.log(`${plan.length} trials`);

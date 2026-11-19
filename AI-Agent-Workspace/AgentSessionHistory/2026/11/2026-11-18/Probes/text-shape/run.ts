/**
 * The text-shape probe's run (2026-11-19): draws every picture the sheets need into `out/`, counts how many of the 384
 * touches of the last 150 commits to c5493364 move each candidate's marble, and writes `sheets.json` for `compose.ts`
 * and `numbers.json`. Run from the repository's root, after `npm run live-docs:visualize` has built `dist/explorer`:
 *
 *   npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/text-shape/run.ts
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";

import { paletteNamed, DEFAULT_PALETTE } from "../../../../../../../packages/explorer/src/client/palette";
import { fileShares, marbleCounts, marbleSeed, spatialKindOf } from "../../../../../../../packages/explorer/src/client/views/forceGraphAppearance";
import { explorerGraphOf } from "../../../../../../../packages/explorer/src/shared/graph";
import { braille, encoded, largestChange, marble, pin, png, shapeOf, type Candidate, type Look, type Picture, type Shape } from "./shape";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(HERE, "out");
fs.mkdirSync(OUT, { recursive: true });
const PALETTE = paletteNamed(DEFAULT_PALETTE);
const CANDIDATES: Candidate[] = ["P", "PG", "BG"];
const CARD = "#1d2027";

const git = (...args: string[]): Buffer | null => { try { return execFileSync("git", args, { maxBuffer: 1 << 28 }); } catch { return null; } };
const textAt = (commit: string, file: string): string | null => {
  const bytes = git("show", `${commit}:${file}`);
  return bytes === null ? null : file.endsWith(".png") ? bytes.toString("latin1") : bytes.toString("utf8");
};

const data = JSON.parse(fs.readFileSync("dist/explorer/explorer-data.json", "utf8")) as { graph: Parameters<typeof explorerGraphOf>[0] };
const graph = explorerGraphOf(data.graph);
const counts = marbleCounts(graph);
const archetypeOf = (file: string): string => graph.nodes.find(node => node.id === file)?.archetype ?? (file.endsWith(".png") ? "asset" : file.endsWith(".md") ? "document" : "implementation");
const lookOf = (file: string): Look => {
  const archetype = archetypeOf(file);
  return { glass: PALETTE.kind[spatialKindOf(archetype)], offers: PALETTE.role.offers, uses: PALETTE.role.uses, shares: fileShares(file, archetype, counts), seed: marbleSeed(file) };
};

let serial = 0;
const save = (picture: Picture, name: string): string => {
  const file = `${String(serial++).padStart(4, "0")}-${name.replace(/[^a-z0-9.-]+/gi, "_")}.png`;
  fs.writeFileSync(path.join(OUT, file), png(picture));
  return file;
};

interface Tile { image: string; caption: string }
interface Row { heading: string; tiles: Tile[] }
const sheets: Record<string, Row[]> = {};
const base = (file: string): string => file.slice(file.lastIndexOf("/") + 1);

/** A file's marbles in the three candidates, at a size, and its flat page beside them. */
const marbles = (shape: Shape, file: string, size: number, label: string): Tile[] => [
  { image: save(pin(shape, lookOf(file), Math.round(size * 0.8), size, false, CARD), `${label}-page`), caption: `${label}: the page, flat` },
  ...CANDIDATES.map(candidate => ({ image: save(marble(shape, candidate, lookOf(file), size), `${label}-${candidate}`), caption: `${label}: ${candidate}` }))
];

// 1. forceGraphView.ts over its last ten commits, each candidate a row.
{
  const file = "packages/explorer/src/client/views/forceGraphView.ts";
  const commits = git("log", "-10", "--format=%H %cs", "--", file)!.toString().trim().split("\n").map(line => line.split(" ")).reverse();
  const shapes = commits.map(([commit]) => shapeOf(textAt(commit, file)!));
  const lines = commits.map(([commit]) => { const [a, d] = git("show", "--numstat", "--format=", commit, "--", file)!.toString().trim().split(/\s+/).map(Number); return a + d; });
  sheets.fork = CANDIDATES.map(candidate => {
    let previous: Picture | undefined;
    return { heading: `${candidate}: ${file}, its last ten commits, oldest first (Δ: the largest 8 × 8 change of brightness at 48 px, 0 to 255)`, tiles: commits.map(([commit, date], i) => {
      const small = marble(shapes[i], candidate, lookOf(file), 48);
      const delta = previous ? ` Δ${largestChange(previous, small).toFixed(1)}` : "";
      previous = small;
      return { image: save(marble(shapes[i], candidate, lookOf(file), 96), `fork-${candidate}-${commit.slice(0, 7)}`), caption: `${commit.slice(0, 7)} ${date.slice(5)}\n±${lines[i]} lines${delta}` };
    }) };
  });
}

// 2. A small file, before and after a commit that changed one or two of its lines.
let small: { file: string; commit: string; before: string; after: string; subject: string } | undefined;
{
  const log = git("log", "-400", "--numstat", "--format=C %H %s", "--", "packages", "scripts")!.toString().split("\n");
  let commit = "", subject = "";
  for (const line of log) {
    if (line.startsWith("C ")) { commit = line.slice(2, 42); subject = line.slice(43); continue; }
    const parts = line.split("\t");
    if (parts.length !== 3 || parts[0] === "-" ) continue;
    const changed = Number(parts[0]) + Number(parts[1]), file = parts[2];
    if (changed < 1 || changed > 2 || !/\.(ts|css)$/.test(file)) continue;
    const after = textAt(commit, file), before = textAt(`${commit}^`, file);
    if (!after || !before) continue;
    const length = after.split("\n").length;
    if (length >= 20 && length <= 60) { small = { file, commit, before, after, subject }; break; }
  }
  if (!small) throw new Error("No small file changed by one or two lines in the last 400 commits.");
  const [b, a] = [shapeOf(small.before), shapeOf(small.after)];
  sheets.small = [
    { heading: `${small.file} (${small.after.split("\n").length - 1} lines) before ${small.commit.slice(0, 7)}, "${small.subject}"`, tiles: marbles(b, small.file, 160, "before") },
    { heading: "and after it", tiles: marbles(a, small.file, 160, "after") }
  ];
}

// 3. The owner's case: one query aligned by eye and conventionally formatted.
const aligned = fs.readFileSync(path.join(HERE, "payments-aligned.sql"), "utf8"), conventional = fs.readFileSync(path.join(HERE, "payments-conventional.sql"), "utf8");
sheets.sql = [
  { heading: "payments-aligned.sql: aliases at one column, joins and their conditions lined up", tiles: marbles(shapeOf(aligned), "payments-aligned.sql", 160, "aligned") },
  { heading: "payments-conventional.sql: the same query, nothing aligned by hand", tiles: marbles(shapeOf(conventional), "payments-conventional.sql", 160, "conventional") }
];

// 4. Kinds.
const KINDS: Array<[string, string]> = [
  ["a test", "packages/explorer/src/client/views/marbleSketch.test.ts"],
  ["a stylesheet", "packages/explorer/src/client/styles/local.css"],
  ["JSON", "package.json"],
  ["Markdown", "AGENTS.md"],
  ["the estate's stored procedure", "tests/integration/programs/csharp/estate/Database/SqlServer/dbo.usp_PostPayment.sql"],
  ["a PNG's bytes as text", "AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/marble-patterns/files-doc.png"]
];
sheets.kinds = KINDS.map(([word, file]) => ({ heading: `${word}: ${file}`, tiles: marbles(shapeOf(textAt("HEAD", file)!), file, 112, base(file)) }));

// 5. A field of forty files at the sizes spheres have on screen.
{
  const veined = graph.nodes.filter(node => node.archetype === "implementation" || node.archetype === "test")
    .filter(node => (counts.get(node.id)?.uses ?? 0) + (counts.get(node.id)?.usedBy ?? 0) > 0).map(node => node.id).sort();
  const forty = Array.from({ length: 40 }, (_, i) => veined[Math.floor((i + 0.5) * veined.length / 40)]);
  const shapes = forty.map(file => shapeOf(textAt("HEAD", file) ?? ""));
  sheets.field = CANDIDATES.map(candidate => ({ heading: `${candidate}: forty files at 20 to 60 px`, tiles: forty.map((file, i) => {
    const size = 20 + Math.round(40 * (((i * 2654435761) >>> 0) / 0x100000000));
    return { image: save(marble(shapes[i], candidate, lookOf(file), size), `field-${candidate}-${i}`), caption: "" };
  }) }));
}

// The 2D pins: the Internals row's inbound pin as a rounded box holding the page, at the three looks' sizes and four times.
{
  const cases: Array<[string, string, string]> = [
    [`${base(small.file)} before`, small.file, small.before], [`${base(small.file)} after`, small.file, small.after],
    ["aligned SQL", "payments-aligned.sql", aligned], ["conventional SQL", "payments-conventional.sql", conventional],
    ...KINDS.map(([word, file]): [string, string, string] => [word, file, textAt("HEAD", file)!])
  ];
  const sizes: Array<[number, number, string]> = [[18, 14, "reading, 18 × 14"], [26, 20, "middle, 26 × 20"], [36, 28, "far, 36 × 28"], [72, 56, "reading × 4"]];
  sheets.pins = [false, true].map(grain => ({ heading: grain ? "The page with its grain" : "The page alone", tiles: cases.flatMap(([word, file, text]) => sizes.map(([w, h, size]) => ({
    image: save(pin(shapeOf(text), lookOf(file), w, h, grain, CARD), `pin-${grain}-${word}-${w}`), caption: size === sizes[0][2] ? word : size
  }))) }));
}

// The numbers: over the 384 touches, the largest change of each candidate's 48 px marble.
const touches: Array<{ commit: string; file: string; values: Record<Candidate, number> }> = [];
let born = 0;
{
  const commits = git("log", "-150", "--format=%H", "c5493364")!.toString().trim().split("\n");
  for (const commit of commits) {
    const changed = git("diff-tree", "--no-commit-id", "--name-only", "-r", commit)!.toString().trim().split("\n").filter(Boolean)
      .filter(file => !file.startsWith(".mdmd/") && !file.startsWith("AI-Agent-Workspace/"));
    for (const file of changed) {
      if (git("cat-file", "-e", `${commit}:.mdmd/layer-4/${file}.mdmd.md`) === null) continue;
      const after = textAt(commit, file), before = textAt(`${commit}^`, file);
      if (after === null || before === null) { born++; continue; }
      const [b, a] = [shapeOf(before), shapeOf(after)], look = lookOf(file);
      const values = Object.fromEntries(CANDIDATES.map(candidate => [candidate, largestChange(marble(b, candidate, look, 48), marble(a, candidate, look, 48))])) as Record<Candidate, number>;
      touches.push({ commit, file, values });
    }
  }
}
const thresholds = [1, 2, 3, 4, 6, 8, 12];
const numbers = {
  touches: touches.length, bornOrGone: born,
  moved: Object.fromEntries(CANDIDATES.map(candidate => [candidate, Object.fromEntries(thresholds.map(t => [t, touches.filter(touch => touch.values[candidate] > t).length]))])),
  zero: Object.fromEntries(CANDIDATES.map(candidate => [candidate, touches.filter(touch => touch.values[candidate] === 0).length])),
  bytes: {
    forceGraphView: encoded(shapeOf(textAt("HEAD", "packages/explorer/src/client/views/forceGraphView.ts")!)).length,
    small: encoded(shapeOf(small.after)).length,
    brailleForceGraphView: Buffer.byteLength(braille(shapeOf(textAt("HEAD", "packages/explorer/src/client/views/forceGraphView.ts")!))),
    brailleSmall: Buffer.byteLength(braille(shapeOf(small.after)))
  }
};
fs.writeFileSync(path.join(HERE, "numbers.json"), JSON.stringify(numbers, null, 2));
fs.writeFileSync(path.join(HERE, "touches.json"), JSON.stringify(touches.map(touch => ({ ...touch, values: Object.fromEntries(Object.entries(touch.values).map(([k, v]) => [k, Math.round(v * 10) / 10])) }))));

// Pairs around the thresholds, for judging one by eye: for PG and P, the touches nearest each of several values.
for (const candidate of ["PG", "P"] as Candidate[]) {
  const rows: Row[] = [];
  for (const target of [1.5, 3, 5, 8]) {
    const nearest = [...touches].sort((x, y) => Math.abs(x.values[candidate] - target) - Math.abs(y.values[candidate] - target)).slice(0, 3);
    rows.push({ heading: `${candidate}, pairs whose change is near ${target}`, tiles: nearest.flatMap(touch => {
      const look = lookOf(touch.file), b = shapeOf(textAt(`${touch.commit}^`, touch.file)!), a = shapeOf(textAt(touch.commit, touch.file)!);
      return [
        { image: save(marble(b, candidate, look, 48), `pair-${candidate}-b`), caption: `${touch.commit.slice(0, 7)} ${base(touch.file)}\nbefore` },
        { image: save(marble(a, candidate, look, 48), `pair-${candidate}-a`), caption: `after Δ${touch.values[candidate].toFixed(1)}` }
      ];
    }) });
  }
  sheets[`pairs-${candidate}`] = rows;
}

fs.writeFileSync(path.join(HERE, "sheets.json"), JSON.stringify(sheets));
fs.writeFileSync(path.join(HERE, "proposal-samples.txt"), [
  `${small.file} at ${small.commit.slice(0, 7)}, Braille (${Buffer.byteLength(braille(shapeOf(small.after)))} bytes):`, braille(shapeOf(small.after)), "",
  `the same, one encoded line (${encoded(shapeOf(small.after)).length} bytes):`, encoded(shapeOf(small.after)), "",
  `payments-aligned.sql, Braille (${Buffer.byteLength(braille(shapeOf(aligned)))} bytes):`, braille(shapeOf(aligned)), "",
  `the same, one encoded line (${encoded(shapeOf(aligned)).length} bytes):`, encoded(shapeOf(aligned)), "",
  `packages/explorer/src/client/views/forceGraphView.ts, Braille (${numbers.bytes.brailleForceGraphView} bytes):`, braille(shapeOf(textAt("HEAD", "packages/explorer/src/client/views/forceGraphView.ts")!)), ""
].join("\n"));
console.log(JSON.stringify(numbers, null, 2));
console.log(`small file: ${small.file} at ${small.commit}`);

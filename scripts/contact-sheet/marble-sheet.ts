/// <reference lib="dom" />
/**
 * @file marble-sheet.ts
 * @description Draws marbles alone, large and side by side, with the Explorer's own shaders, so that their patterns can
 * be judged (the pattern trial, 2026-11-18, the owner's wish that "Minor changes to files produce subtle shifts on the
 * surface of these little marble planets. Massive changes to files completely changes their patterns"). The marbles are
 * worked out here, from the bundle's graph by the Explorer's own modules; a built page lends its renderer, lights and
 * the marbled spheres' material, and draws them row by row in front of its camera, each row in its pattern and Vein Bend
 * as the Tuning levers set them, nothing of the page's own picture showing.
 *
 * ## Usage
 *
 * ```bash
 * npm run marble:sheet -- --bundle dist/explorer --sheet files --out <dir>
 * npm run marble:sheet -- --bundle dist/explorer --sheet bends --out <dir>
 * npm run marble:sheet -- --bundle dist/explorer --sheet run --file packages/engine/src/live-docs/pathfind.ts --out <dir>
 * npm run marble:sheet -- --bundle dist/explorer --sheet history --history dist/explorer/samples/history --out <dir>
 * npm run marble:sheet -- --bundle dist/explorer --sheet fork --file packages/explorer/src/client/views/forceGraphView.ts --out <dir>
 * ```
 *
 * `files` draws forty of the bundle's files, spread over its files with veins, near, and again at a middling and a far
 * size, once in each pattern. `bends` draws the same forty from their docs at three Vein Bends. `run` draws one file
 * through a made-up run of changes to what its Live Doc lists: as it is, one symbol added, five added, half its uses
 * replaced, all replaced; and, for comparison with what the docs could carry, the same run with its symbols named.
 * `history` draws, for each step of another bundle's history, the files the step changed, before and after it.
 *
 * `fork` is for the owner's open choice of what a marble is made from (2026-11-19): one file over the last commits that
 * touched it, in two rows. The first is From Its Doc, the sketch made as the product makes it from that commit's Live
 * Doc. The second is a sketch made the same way from the file's own text at that commit, one feature per distinct
 * trimmed line weighted by how often it occurs, which the product does not have: it exists in this script alone, and
 * the Live Doc format, the graph and the history are untouched by it. Both rows keep today's glass and veins' shares, so
 * that only the pattern differs; a marble the same as the one before it is marked.
 */

import { chromium, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import path from "node:path";

import { parseLiveDoc } from "../../packages/engine/src/live-docs/document";
import { deriveLiveDocGraph, linkTarget, type GraphFile } from "../../packages/engine/src/live-docs/graph";
import { seek } from "../../packages/engine/src/live-docs/history/sequence";
import { snapshotGraphOf } from "../../packages/explorer/src/client/history/snapshot";
import { DEFAULT_MARBLE_BEND, DEFAULT_PALETTE, paletteNamed } from "../../packages/explorer/src/client/palette";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { MARBLE_PATTERNS, type MarblePattern } from "../../packages/explorer/src/client/types";
import { marbleCounts, marbleOf, marbleTint, type Marble } from "../../packages/explorer/src/client/views/forceGraphAppearance";
import { fileFeatures, marbleSketches, sketchDistance, sketchOf, type Sketch, type SketchFeature } from "../../packages/explorer/src/client/views/marbleSketch";
import { explorerGraphOf } from "../../packages/explorer/src/shared/graph";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";
import { browserLaunchOptions } from "../../tests/e2e/browser-launch";
import { observeGraph } from "../../tests/e2e/force-graph-observation";
import { optionValue, runCommand, UsageError } from "../live-docs/cli";
import { escape, ORIGIN, serve } from "./bundle-page";

const PALETTE = paletteNamed(DEFAULT_PALETTE);

/** One marble on a sheet: its caption, the marble, its far tint, the pattern it is drawn in and how far it bends. */
interface Item { caption: string; marble: Marble; tint: string; pattern: MarblePattern; bend: number }

/** A row of marbles at one size, under a heading. */
interface Row { heading: string; items: Item[]; radius: number }

const PATTERN_WORDS: Record<MarblePattern, string> = { one: "One Pattern", doc: "From Its Doc" };

/** A file's marble in a graph, in a pattern: with its sketch from the graph, or another sketch given. */
function itemOf(graph: ExplorerGraphPayload, id: string, pattern: MarblePattern, caption: string, sketch?: Sketch, bend = DEFAULT_MARBLE_BEND): Item | null {
  const node = graph.nodes.find(candidate => candidate.id === id);
  const plain = node ? marbleOf(id, node.archetype, marbleCounts(graph), PALETTE) : null;
  if (!plain) return null;
  const marble = pattern === "one" ? plain : { ...plain, sketch: sketch ?? marbleSketches(graph).get(id)! };
  return { caption, marble, tint: marbleTint(marble.glass, marble, PALETTE), pattern, bend };
}

const base = (id: string): string => id.slice(id.lastIndexOf("/") + 1);

/** Forty files with veins, spread evenly over the scan's files in the order of their paths. */
function fortyFiles(graph: ExplorerGraphPayload): string[] {
  const counts = marbleCounts(graph);
  const veined = graph.nodes.filter(node => node.archetype === "implementation" || node.archetype === "test")
    .filter(node => (counts.get(node.id)?.uses ?? 0) + (counts.get(node.id)?.usedBy ?? 0) > 0).map(node => node.id).sort();
  return Array.from({ length: Math.min(40, veined.length) }, (_, i) => veined[Math.floor((i + 0.5) * veined.length / Math.min(40, veined.length))]);
}

function filesRows(graph: ExplorerGraphPayload, patterns: readonly MarblePattern[]): Row[][] {
  const ids = fortyFiles(graph);
  return patterns.map(pattern => {
    const items = ids.map(id => itemOf(graph, id, pattern, base(id))!);
    const rows: Row[] = [];
    for (let at = 0; at < items.length; at += 8) rows.push({ heading: at ? "" : `${PATTERN_WORDS[pattern]}, near`, items: items.slice(at, at + 8), radius: 78 });
    rows.push({ heading: `${PATTERN_WORDS[pattern]}, the first twenty at a middling size`, items: items.slice(0, 20), radius: 22 });
    rows.push({ heading: `${PATTERN_WORDS[pattern]}, the first twenty far`, items: items.slice(0, 20), radius: 7 });
    return rows;
  });
}

/** The forty files from their docs at three Vein Bends, each bend's forty in rows of ten. */
function bendsRows(graph: ExplorerGraphPayload): Row[][] {
  const ids = fortyFiles(graph);
  const rows: Row[] = [];
  for (const bend of [0.25, 0.55, 0.85]) {
    const items = ids.map(id => itemOf(graph, id, "doc", base(id), undefined, bend)!);
    for (let at = 0; at < items.length; at += 10) rows.push({ heading: at ? "" : `From Its Doc, Vein Bend ${bend}${bend === DEFAULT_MARBLE_BEND ? " (the default)" : ""}`, items: items.slice(at, at + 10), radius: 56 });
  }
  return [rows];
}

/** The file's uses, the references it makes to each, from the graph's links. */
function usesOf(graph: ExplorerGraphPayload, id: string): Map<string, number> {
  const uses = new Map<string, number>();
  for (const link of graph.links) {
    const source = typeof link.source === "string" ? link.source : link.source.id, target = typeof link.target === "string" ? link.target : link.target.id;
    if (source === id && target !== id) uses.set(target, (uses.get(target) ?? 0) + Math.max(1, link.referenceCount ?? 1));
  }
  return uses;
}

/** One file through a made-up run of changes to what its Live Doc lists, in each pattern, and with its symbols named. */
function runRows(graph: ExplorerGraphPayload, id: string, patterns: readonly MarblePattern[]): Row[][] {
  const node = graph.nodes.find(candidate => candidate.id === id);
  if (!node) throw new UsageError(`No file ${id} in the bundle.`);
  const symbols = node.publicSymbols.length, uses = usesOf(graph, id);
  const others = graph.nodes.map(other => other.id).filter(other => other !== id && !uses.has(other)).sort();
  const replaced = (share: number): Map<string, number> => {
    const kept = [...uses].slice(Math.round(share * uses.size));
    const fresh = [...uses].slice(0, Math.round(share * uses.size)).map(([, count], i): [string, number] => [others[(i * 37) % others.length], count]);
    return new Map([...kept, ...fresh]);
  };
  const steps: Array<{ caption: string; symbols: number; uses: Map<string, number>; names: string[] }> = [];
  const names = node.publicSymbols;
  steps.push({ caption: `as it is: ${symbols} symbols, ${uses.size} uses`, symbols, uses, names });
  steps.push({ caption: "one symbol added", symbols: symbols + 1, uses, names: [...names, "addedOne"] });
  steps.push({ caption: "five symbols added", symbols: symbols + 5, uses, names: [...names, ...["a1", "a2", "a3", "a4", "a5"]] });
  steps.push({ caption: "half replaced", symbols, uses: replaced(0.5), names: names.map((name, i) => (i % 2 ? `${name}Rewritten` : name)) });
  steps.push({ caption: "all replaced", symbols, uses: replaced(1), names: names.map(name => `${name}Rewritten`) });
  const named = (step: (typeof steps)[number]): Sketch => sketchOf(id, [
    ...step.names.map((name): SketchFeature => ({ text: `symbol-name\u0000${id}\u0000${name}`, weight: 1 })),
    ...fileFeatures(id, 0, step.uses)
  ]);
  const rows: Row[] = patterns.map(pattern => ({ heading: PATTERN_WORDS[pattern], radius: 110,
    items: steps.map(step => itemOf(graph, id, pattern, step.caption, sketchOf(id, fileFeatures(id, step.symbols, step.uses)))!) }));
  rows.push({ heading: `${PATTERN_WORDS.doc}, if the sketch took the symbols' names (today's docs carry them, the history does not)`, radius: 110,
    items: steps.map(step => itemOf(graph, id, "doc", step.caption, named(step))!) });
  return [rows];
}

/** For each step of a bundle's history, the files it changed, before and after. */
async function historyRows(bundle: string, patterns: readonly MarblePattern[]): Promise<Row[][]> {
  const data = JSON.parse(await fs.readFile(path.join(bundle, "explorer-data.json"), "utf8")) as { history?: { file: string } };
  if (!data.history) throw new UsageError(`${bundle} carries no history.`);
  const sequence = JSON.parse(await fs.readFile(path.join(bundle, data.history.file), "utf8")) as Parameters<typeof seek>[0];
  const rows: Row[] = [];
  for (const pattern of patterns) {
    for (let step = 1; step < sequence.steps.length; step++) {
      const before = snapshotGraphOf(seek(sequence, step - 1)), after = snapshotGraphOf(seek(sequence, step));
      const items: Item[] = [];
      for (const node of after.nodes) {
        const was = itemOf(before, node.id, pattern, `${base(node.id)} before`), now = itemOf(after, node.id, pattern, `${base(node.id)} after`);
        if (!now) continue;
        const moved = !was || JSON.stringify(was.marble) !== JSON.stringify(now.marble);
        if (moved) items.push(...(was ? [was] : []), now);
      }
      const subject = (sequence.steps[step] as { commit: { subject: string } }).commit.subject;
      rows.push({ heading: `${PATTERN_WORDS[pattern]}, step ${step}: ${subject}${items.length ? "" : " (no marble changed)"}`, items, radius: 64 });
    }
  }
  return [rows];
}

/** Git, read only, in the working directory's repository. */
const git = (...args: string[]): string => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 });

/** Where the docs are, from the repository's configuration. */
async function docLocation(): Promise<{ root: string; baseLayer: string; extension: string }> {
  const config = JSON.parse(await fs.readFile(".live-docs.config.json", "utf8")) as { root: string; baseLayer: string; extension: string };
  return { root: config.root, baseLayer: config.baseLayer, extension: config.extension };
}

/**
 * A file's sketch from its Live Doc at a commit, as the product makes it: the doc parsed, the graph derived from it and
 * the docs its links name at that commit, projected as the page projects it, and the sketch read from that.
 */
function docSketchAt(commit: string, id: string, location: { root: string; baseLayer: string; extension: string }): Sketch {
  const docPathOf = (codePath: string): string => `${location.root}/${location.baseLayer}/${codePath}${location.extension}`;
  const read = (docPath: string): string | null => { try { return git("show", `${commit}:${docPath}`); } catch { return null; } };
  const own = docPathOf(id), text = read(own);
  if (text === null) throw new UsageError(`${id} has no Live Doc at ${commit}.`);
  const doc = parseLiveDoc(text);
  const docs = [{ docPath: own, doc }];
  const probe = deriveLiveDocGraph(docs, location).files[id] as GraphFile;
  const links = new Set<string>();
  for (const dependency of doc.dependencies) if (dependency.link) links.add(dependency.link);
  for (const symbol of doc.symbols) for (const reference of symbol.references) {
    for (const type of reference.role === "Parameters" ? reference.parameters.flatMap(parameter => parameter.types) : reference.types) if (type.link) links.add(type.link);
  }
  for (const link of links) {
    const target = linkTarget(probe.docPath, link, location);
    if (!target || target.codePath === id || docs.some(entry => entry.docPath === target.docPath)) continue;
    const targetText = read(target.docPath);
    if (targetText !== null) docs.push({ docPath: target.docPath, doc: parseLiveDoc(targetText) });
  }
  return marbleSketches(explorerGraphOf(deriveLiveDocGraph(docs, location))).get(id)!;
}

/** A sketch of a file's own text at a commit: one feature per distinct trimmed non-empty line, weighted by its count. */
function contentSketchAt(commit: string, id: string): Sketch {
  const counts = new Map<string, number>();
  for (const line of git("show", `${commit}:${id}`).split("\n")) {
    const trimmed = line.trim();
    if (trimmed) counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }
  return sketchOf(id, [...counts].map(([line, count]): SketchFeature => ({ text: `line\u0000${line}`, weight: count })));
}

/** The fork's two rows: one file over the last commits that touched it, from its doc and from its contents. */
async function forkRows(graph: ExplorerGraphPayload, id: string, count: number): Promise<Row[][]> {
  const location = await docLocation();
  const commits = git("log", `-${count}`, "--format=%H %cs", "--", id).trim().split("\n").map(line => line.split(" ") as [string, string]).reverse();
  const row = (heading: string, sketchAt: (commit: string) => Sketch): Row => {
    let previous: Sketch | undefined;
    const items = commits.map(([commit, date]) => {
      const sketch = sketchAt(commit);
      const same = previous !== undefined && sketchDistance(previous, sketch) < 1e-12;
      const moved = previous === undefined ? "" : same ? " = same" : ` Δ${sketchDistance(previous, sketch).toFixed(2)}`;
      previous = sketch;
      return itemOf(graph, id, "doc", `${commit.slice(0, 7)} ${date.slice(5)}${moved}`, sketch)!;
    });
    return { heading, items, radius: 60 };
  };
  return [[
    row(`From Its Doc: the sketch of what ${base(id)}'s Live Doc listed at each commit, as the product makes it`, commit => docSketchAt(commit, id, location)),
    row("From its contents: the same sketch over the file's own lines at each commit (this sheet only; not in the product)", commit => contentSketchAt(commit, id))
  ]];
}

const GAP = 30, CAPTION = 34, HEADING = 30, WIDTH = 1500;

/** One row's strip on the sheet: where it stands, how tall it is, and its marbles' centres within it. */
interface Strip { top: number; height: number; items: Array<{ item: Item; x: number; y: number; r: number }> }

function layout(rows: Row[]): { strips: Strip[]; headings: Array<{ text: string; y: number }>; height: number } {
  const strips: Strip[] = [], headings: Array<{ text: string; y: number }> = [];
  let y = 0;
  for (const row of rows) {
    if (row.heading) { headings.push({ text: row.heading, y }); y += HEADING; }
    const cell = Math.max(2 * row.radius + GAP, row.radius > 40 ? 150 : 70);
    const perLine = Math.max(1, Math.floor(WIDTH / cell));
    const line = 2 * row.radius + CAPTION + 10, lines = Math.max(1, Math.ceil(row.items.length / perLine));
    strips.push({ top: y, height: lines * line, items: row.items.map((item, i) => ({ item, x: (i % perLine) * cell + cell / 2, y: Math.floor(i / perLine) * line + row.radius + 4, r: row.radius })) });
    y += lines * line + 4;
  }
  return { strips, headings, height: y };
}

/**
 * Draws one strip's marbles in the page, with its renderer, lights and marbled material, the pattern and the Vein Bend
 * set by the Tuning levers as a viewer sets them, and returns the strip as a PNG's data address. Given as text: a
 * function compiled by tsx carries helpers the page does not have (see `mergeStorage`).
 */
const DRAW = `async ({ marbles, width, height, pattern, bend }) => {
  const choose = (id, value, event) => { const control = document.getElementById(id); control.value = String(value); control.dispatchEvent(new Event(event, { bubbles: true })); };
  choose("tuning-marble-pattern", pattern, "change");
  choose("tuning-marble-bend", bend, "input");
  const { scene, camera, renderer } = window.renderedGraph;
  let nodes = null;
  scene.traverse(object => { if (object.userData && object.userData.spatialBatch && object.userData.spatialBatch.kind === "nodes") nodes = object; });
  const Geometry = nodes.geometry.constructor, Attribute = nodes.geometry.getAttribute("spatialOpacity").constructor;
  const ColorOf = nodes.material.color.constructor, Matrix = camera.matrix.constructor;
  const geometry = new Geometry(1, 96, 64);
  const n = marbles.length;
  const attribute = (size) => new Attribute(new Float32Array(size * Math.max(1, n)), size);
  const opacity = attribute(1), glass = attribute(3), veins = attribute(4), first = attribute(4), second = attribute(4);
  geometry.setAttribute("spatialOpacity", opacity); geometry.setAttribute("spatialMarbleGlass", glass); geometry.setAttribute("spatialMarbleVeins", veins);
  geometry.setAttribute("spatialMarbleSketchA", first); geometry.setAttribute("spatialMarbleSketchB", second);
  const mesh = new nodes.constructor(geometry, nodes.material, Math.max(1, n));
  mesh.instanceColor = attribute(3); mesh.frustumCulled = false; mesh.count = n;
  const canvasWidth = renderer.domElement.clientWidth, canvasHeight = renderer.domElement.clientHeight;
  const saved = { position: camera.position.clone(), quaternion: camera.quaternion.clone(), fov: camera.fov, near: camera.near, far: camera.far, fog: scene.fog };
  const fov = 8, distance = (canvasHeight / 2) / Math.tan(fov * Math.PI / 360);
  const matrix = new Matrix();
  marbles.forEach((m, i) => {
    matrix.makeScale(m.r, m.r, m.r); matrix.setPosition(m.x - canvasWidth / 2, canvasHeight / 2 - m.y, 0);
    mesh.setMatrixAt(i, matrix);
    const tint = new ColorOf(m.tint), g = new ColorOf(m.glass);
    mesh.instanceColor.setXYZ(i, tint.r, tint.g, tint.b);
    opacity.setX(i, 0.75); glass.setXYZ(i, g.r, g.g, g.b);
    veins.setXYZW(i, m.offers, m.uses, m.seed, 1);
    const s = m.sketch || [0, 0, 0, 0, 0, 0, 0, 0];
    first.setXYZW(i, s[0], s[1], s[2], s[3]); second.setXYZW(i, s[4], s[5], s[6], s[7]);
  });
  const hidden = scene.children.filter(child => !child.isLight && child.visible);
  hidden.forEach(child => { child.visible = false; });
  scene.add(mesh); scene.fog = null;
  camera.position.set(0, 0, distance); camera.quaternion.set(0, 0, 0, 1); camera.fov = fov; camera.near = distance / 4; camera.far = distance * 4;
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  // Compiled before the picture is taken, so that the first frame of a changed pattern is not a blank one.
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  const ratio = renderer.domElement.width / canvasWidth;
  const strip = document.createElement("canvas"); strip.width = width; strip.height = height;
  strip.getContext("2d").drawImage(renderer.domElement, 0, 0, width * ratio, height * ratio, 0, 0, width, height);
  const url = strip.toDataURL("image/png");
  scene.remove(mesh); scene.fog = saved.fog; hidden.forEach(child => { child.visible = true; });
  camera.position.copy(saved.position); camera.quaternion.copy(saved.quaternion); camera.fov = saved.fov; camera.near = saved.near; camera.far = saved.far;
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  geometry.dispose();
  return url;
}`;

/** Draws a sheet's rows in the page, one render for each run of a row's marbles in one pattern and bend, and composes them with captions. */
async function drawSheet(page: Page, rows: Row[], heading: string, file: string): Promise<void> {
  const { strips, headings, height } = layout(rows);
  const canvas = await page.evaluate(() => { const c = document.querySelector("#graph-svg canvas") as HTMLCanvasElement; return { width: c.clientWidth, height: c.clientHeight }; });
  if (canvas.width < WIDTH) throw new Error(`The page's canvas is ${canvas.width} pixels wide; the sheet needs ${WIDTH}.`);
  const images: Array<{ top: number; url: string }> = [];
  for (const strip of strips) {
    if (strip.height > canvas.height) throw new Error(`A row ${strip.height} pixels tall does not fit the page's canvas of ${canvas.height}.`);
    for (const pattern of MARBLE_PATTERNS) {
      for (const bend of new Set(strip.items.map(at => at.item.bend))) {
        const mine = strip.items.filter(at => at.item.pattern === pattern && at.item.bend === bend);
        if (!mine.length) continue;
        const marbles = mine.map(at => ({ x: at.x, y: at.y, r: at.r, tint: at.item.tint, glass: at.item.marble.glass, offers: at.item.marble.offers,
          uses: at.item.marble.uses, seed: at.item.marble.seed, sketch: at.item.marble.sketch ?? null }));
        const url = await page.evaluate(`(${DRAW})(${JSON.stringify({ marbles, width: WIDTH, height: strip.height, pattern, bend })})`) as string;
        images.push({ top: strip.top, url });
      }
    }
  }
  const sheet = await page.context().newPage();
  await sheet.setViewportSize({ width: WIDTH + 48, height: 800 });
  const captions = strips.flatMap(strip => strip.items.map(at => `<div class="caption" style="left:${at.x - 75}px;top:${strip.top + at.y + at.r + 6}px">${at.r > 30 ? escape(at.item.caption) : ""}</div>`)).join("");
  const heads = headings.map(at => `<div class="heading" style="top:${at.y}px">${escape(at.text)}</div>`).join("");
  // A strip of one pattern and bend lies over the row's others: lighten keeps each marble over the shared dark ground.
  const pictures = images.map(image => `<img style="top:${image.top}px" src="${image.url}">`).join("");
  await sheet.setContent(`<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; padding: 24px; background: #101114; color: #e8e8ec; font: 14px/1.25 system-ui, sans-serif; width: ${WIDTH}px; }
    h1 { font-size: 18px; margin: 0 0 12px; }
    .board { position: relative; width: ${WIDTH}px; height: ${height + 20}px; }
    .board img { position: absolute; left: 0; mix-blend-mode: lighten; }
    .caption { position: absolute; width: 150px; text-align: center; color: #c8cad2; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .heading { position: absolute; left: 0; color: #f0f0f4; font-weight: 600; }
  </style><h1>${escape(heading)}</h1><div class="board">${pictures}${heads}${captions}</div>`);
  await sheet.locator("body").screenshot({ path: file });
  await sheet.close();
}

type SheetName = "files" | "bends" | "run" | "history" | "fork";
const SHEETS: readonly SheetName[] = ["files", "bends", "run", "history", "fork"];

interface Options { bundle: string; out: string; sheet: SheetName; file?: string; history?: string; commits: number; patterns: MarblePattern[] }

function parseArgs(args: string[]): Options {
  const options: Partial<Options> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--bundle") options.bundle = optionValue(args, ++i, arg);
    else if (arg === "--out") options.out = optionValue(args, ++i, arg);
    else if (arg === "--file") options.file = optionValue(args, ++i, arg);
    else if (arg === "--history") options.history = optionValue(args, ++i, arg);
    else if (arg === "--commits") options.commits = Number(optionValue(args, ++i, arg));
    else if (arg === "--sheet") {
      const sheet = optionValue(args, ++i, arg);
      options.sheet = SHEETS.find(known => known === sheet) ?? (() => { throw new UsageError(`--sheet takes ${SHEETS.join(", ")}, not ${sheet}.`); })();
    } else if (arg === "--patterns") {
      const patterns = optionValue(args, ++i, arg).split(",");
      options.patterns = patterns.map(name => MARBLE_PATTERNS.find(known => known === name) ?? (() => { throw new UsageError(`No marble pattern ${name}; the patterns are ${MARBLE_PATTERNS.join(", ")}.`); })());
    } else throw new UsageError(`${arg} is not an option. Options: --bundle --out --sheet (${SHEETS.join(", ")}) --file --history --commits --patterns (${MARBLE_PATTERNS.join(", ")})`);
  }
  if (!options.bundle || !options.out || !options.sheet) throw new UsageError("Name the built bundle with --bundle, where to write with --out, and the sheet with --sheet.");
  if ((options.sheet === "run" || options.sheet === "fork") && !options.file) throw new UsageError(`A ${options.sheet} sheet names its file with --file.`);
  options.patterns ??= [...MARBLE_PATTERNS];
  options.commits ??= 10;
  if (!(options.commits >= 2)) throw new UsageError("--commits takes a number of two or more.");
  return options as Options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const bundleDir = path.resolve(options.bundle), out = path.resolve(options.out);
  await fs.mkdir(out, { recursive: true });
  const data = JSON.parse(await fs.readFile(path.join(bundleDir, "explorer-data.json"), "utf8")) as { graph: Parameters<typeof explorerGraphOf>[0] };
  const graph = explorerGraphOf(data.graph);
  const sheets = options.sheet === "files" ? filesRows(graph, options.patterns)
    : options.sheet === "bends" ? bendsRows(graph)
      : options.sheet === "run" ? runRows(graph, options.file!, options.patterns)
        : options.sheet === "fork" ? await forkRows(graph, options.file!, options.commits)
          : await historyRows(path.resolve(options.history ?? bundleDir), options.patterns);
  const named = (i: number): { name: string; heading: string } => {
    switch (options.sheet) {
      case "files": return { name: `files-${options.patterns[i]}`, heading: `${path.basename(bundleDir)}: forty files, ${PATTERN_WORDS[options.patterns[i]]}` };
      case "bends": return { name: "bends", heading: `${path.basename(bundleDir)}: forty files from their docs at three Vein Bends` };
      case "run": return { name: `run-${base(options.file!)}`, heading: `${options.file}: a made-up run of changes to what its Live Doc lists` };
      case "fork": return { name: `fork-${base(options.file!)}`, heading: `${options.file}: its last ${options.commits} commits, oldest first; Δ is the sketch's move from the marble before` };
      default: return { name: "history", heading: `${path.basename(path.resolve(options.history ?? bundleDir))}: each step's changed marbles, before and after` };
    }
  };

  const browser = await chromium.launch(browserLaunchOptions());
  try {
    const context = await browser.newContext({ viewport: { width: 2300, height: 1300 } });
    await serve(context, bundleDir);
    const page = await context.newPage();
    await observeGraph(page);
    await page.goto(`${ORIGIN}/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d" })}`);
    await page.waitForFunction(() => document.querySelector("#graph-svg")?.getAttribute("aria-busy") === "false" && Boolean((window as unknown as { renderedGraph?: unknown }).renderedGraph), undefined, { timeout: 120_000 });
    for (const [i, rows] of sheets.entries()) {
      const { name, heading } = named(i);
      await drawSheet(page, rows, heading, path.join(out, `${name}.png`));
      console.log(`Wrote ${path.join(out, `${name}.png`)}`);
    }
  } finally {
    await browser.close();
  }
}

runCommand("marble:sheet", main);

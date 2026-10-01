/**
 * The still-picture instrument.
 *
 * Six quantized measures of one view in one state, each taken against the
 * graph rather than against what the view chose to draw, so that no view can
 * score by drawing less. The deck that defines them, with the predictions
 * written before this code existed, is
 * `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`.
 *
 * A fact is one reference in the Explorer's graph payload. The scope is a set
 * of files; the facts in scope are the references with both ends in the set.
 * A wire is legible when both endpoint rows and both file names sit inside the
 * frame, uncovered, at a rendered font of at least {@link READING_PX}.
 */

import type { Page } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { normalizeSymbolIdentifier } from "../../packages/explorer/src/client/views/symbolAnchors";
import { explorerGraphOf } from "../../packages/explorer/src/shared/graph";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/** The smallest rendered font that counts as readable, in CSS pixels. A parameter of the deck, the same for every view. */
export const READING_PX = 9;

/** The container every view draws into; the frame of every picture. */
const FRAME = "#main";

// ─── Facts ────────────────────────────────────────────────────────────────

/** One reference between two files, in the graph's orientation: the consumer uses the provider's symbol. */
export interface Fact {
  consumer: string;
  provider: string;
  /** Normalized, or empty when the docs do not know which symbol of the consumer carries the reference. */
  consumerSymbol: string;
  /** Normalized, or empty when the reference is file-level. */
  providerSymbol: string;
  kinds: string[];
}

export const factKey = (fact: Pick<Fact, "consumer" | "provider" | "consumerSymbol" | "providerSymbol">): string =>
  `${fact.consumer}|${fact.provider}|${fact.consumerSymbol}|${fact.providerSymbol}`;

const normalized = (symbol: string | undefined | null): string => normalizeSymbolIdentifier(symbol) ?? "";

const endpointId = (endpoint: string | { id: string }): string => (typeof endpoint === "string" ? endpoint : endpoint.id);

/** The bundle a page serves, projected the way the client projects it. */
export async function loadGraph(page: Page, base: string): Promise<ExplorerGraphPayload> {
  const response = await page.request.get(`${base}explorer-data.json`);
  if (!response.ok()) {
    throw new Error(`No bundle at ${base}explorer-data.json (${response.status()})`);
  }
  const bundle = (await response.json()) as StaticExplorerData;
  return explorerGraphOf(bundle.graph);
}

/** The references with both ends in the scope, merged by endpoints and symbols. */
export function factsInScope(graph: ExplorerGraphPayload, scope: readonly string[]): Fact[] {
  const inScope = new Set(scope);
  const facts = new Map<string, Fact>();
  for (const link of graph.links) {
    const consumer = endpointId(link.source);
    const provider = endpointId(link.target);
    if (!inScope.has(consumer) || !inScope.has(provider) || consumer === provider) {
      continue;
    }
    const fact: Fact = {
      consumer,
      provider,
      consumerSymbol: normalized(link.sourceSymbol),
      providerSymbol: normalized(link.targetSymbol),
      kinds: [link.kind]
    };
    const key = factKey(fact);
    const known = facts.get(key);
    if (known) {
      if (!known.kinds.includes(link.kind)) {
        known.kinds.push(link.kind);
      }
    } else {
      facts.set(key, fact);
    }
  }
  return [...facts.values()];
}

/** The files that use `symbol` of `file`, the answer a journey must reach. */
export function consumersOf(graph: ExplorerGraphPayload, file: string, symbol: string): string[] {
  const wanted = normalized(symbol);
  const users = new Set<string>();
  for (const link of graph.links) {
    if (endpointId(link.target) === file && normalized(link.targetSymbol) === wanted) {
      users.add(endpointId(link.source));
    }
  }
  return [...users].sort();
}

/** For each file, its symbols' display names keyed by their normalized form, so a wire's symbol finds its row. */
export function displayNames(graph: ExplorerGraphPayload, files: Iterable<string>): Record<string, Record<string, string>> {
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const result: Record<string, Record<string, string>> = {};
  for (const id of files) {
    const node = byId.get(id);
    if (!node) {
      continue;
    }
    result[id] = {};
    for (const name of node.publicSymbols) {
      result[id][normalized(name)] = name;
    }
  }
  return result;
}

// ─── Addresses ────────────────────────────────────────────────────────────

/** The address of the Membrane Map with every symbol of every file in the set pinned, at the default camera. */
export function membranePinAllUrl(graph: ExplorerGraphPayload, base: string, files: readonly string[]): string {
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const pins: Array<{ n: string; s: string }> = [];
  for (const id of files) {
    const node = byId.get(id);
    if (!node) {
      throw new Error(`${id} is not in the bundle`);
    }
    for (const symbol of node.publicSymbols) {
      pins.push({ n: id, s: symbol });
    }
    pins.push({ n: id, s: "__internals__" });
  }
  return `${base}?s=${compressToEncodedURIComponent(JSON.stringify({ v: 1, w: "membrane", p: pins }))}`;
}

/** The address of the Membrane Map browsing the folder of `file`, with the file selected and nothing pinned. */
export function membraneBrowseUrl(base: string, file: string): string {
  const parts = file.split("/");
  const folders: string[] = [];
  for (let i = 1; i < parts.length; i += 1) {
    folders.push(parts.slice(0, i).join("/"));
  }
  return `${base}?s=${compressToEncodedURIComponent(JSON.stringify({ v: 1, w: "membrane", n: file, e: folders }))}`;
}

export const localMapUrl = (base: string, file: string): string => `${base}?view=local&node=${encodeURIComponent(file)}`;

export const forceGraphUrl = (base: string, file: string): string => `${base}?view=force&node=${encodeURIComponent(file)}`;

// ─── Reading a view ───────────────────────────────────────────────────────

/** How a view's DOM is read: where its wires, cards, rows and names are, and which way its wires are stamped. */
export interface ViewReading {
  /** The elements that are wires, each stamped with `data-source-id`, `data-target-id`, `data-source-symbol`, `data-target-symbol`. */
  wires: string;
  /** The element that is a file's card, carrying `data-id`. */
  card: string;
  /** Within a card, the element that is one symbol's row, carrying `data-node-id` and `data-symbol`. */
  row: string;
  /** Within a row, the element that holds the symbol's name. */
  rowLabel: string;
  /** Within a card, the element that holds the file's name. */
  name: string;
  /** The element whose CSS transform is the camera. */
  camera: string;
  /** The element to drag to pan. */
  pannable: string;
  /** Whether `data-source-id` is the consumer (the graph's orientation) or the provider (the Membrane's flow orientation). */
  sourceIs: "consumer" | "provider";
  /** The text the design audit reads. */
  text: string[];
}

export const LOCAL_MAP: ViewReading = {
  wires: "#map-connections .connection-path",
  card: "#map-container .node-card",
  row: ".symbol-row",
  rowLabel: ".symbol-label",
  name: ".node-title",
  camera: "#map-viewport",
  pannable: "#map-viewport",
  sourceIs: "consumer",
  text: [
    "#view-map .node-title",
    "#view-map .node-path",
    "#view-map .symbol-label",
    "#view-map .local-column-label",
    "#view-map .local-stack-group__label",
    "#view-map .node-directory",
    "#view-map .node-tests__label",
    "#view-map .node-tests__item",
    "#view-map .local-column-empty"
  ]
};

export const MEMBRANE_MAP: ViewReading = {
  wires: "#membrane-container .membrane-connection",
  card: "#membrane-container .membrane-card",
  row: ".membrane-card__symbol-row",
  rowLabel: ".membrane-card__symbol-label",
  name: ".membrane-card__header",
  camera: "#membrane-container",
  pannable: "#membrane-viewport",
  sourceIs: "provider",
  text: [
    "#view-membrane .membrane-card__header",
    "#view-membrane .membrane-card__path",
    "#view-membrane .membrane-card__symbol-label",
    "#view-membrane .membrane-card__directory",
    "#view-membrane .pa-band-membrane__label",
    "#view-membrane .pa-ancestor-membrane__label",
    "#view-membrane .pin-active-column__label",
    "#view-membrane .pin-active-header__back",
    "#view-membrane .membrane__label",
    "#view-membrane .membrane-leaf__name",
    "#view-membrane .membrane-browse-breadcrumb__segment"
  ]
};

/** What the page reports about one wire. */
export interface WireReading {
  key: string;
  consumer: string;
  provider: string;
  /** The wire's own box meets the frame. */
  inFrame: boolean;
  /** Every endpoint row and name is inside the frame and uncovered. */
  endpointsInFrame: boolean;
  endpointsUncovered: boolean;
  /** The smallest rendered font among the four endpoint texts, in CSS pixels. */
  smallestFontPx: number;
  /** Samples along the path that fell on a card the wire does not end at, and samples taken. */
  occludedSamples: number;
  samples: number;
}

/** What the page reports about the picture as a whole. */
export interface PictureReading {
  wires: WireReading[];
  scale: number;
  cardsTotal: number;
  cardsInFrame: number;
  cardsPartlyInFrame: number;
  smallestLabelPx: number | null;
}

/** Reads the wires, cards and camera of a view as drawn now. */
export async function readPicture(page: Page, view: ViewReading, names: Record<string, Record<string, string>>): Promise<PictureReading> {
  return page.evaluate(
    ({ view, names, frameSelector, readingPx }) => {
      const frame = document.querySelector(frameSelector)!.getBoundingClientRect();
      const inside = (r: DOMRect): boolean => r.width > 0 && r.height > 0 && r.left >= frame.left - 0.5 && r.right <= frame.right + 0.5 && r.top >= frame.top - 0.5 && r.bottom <= frame.bottom + 0.5;
      const meets = (r: DOMRect): boolean => r.width > 0 && r.height > 0 && r.right > frame.left && r.left < frame.right && r.bottom > frame.top && r.top < frame.bottom;
      const uncovered = (el: Element): boolean => {
        const r = el.getBoundingClientRect();
        const top = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
        return !!top && (top === el || el.contains(top) || top.contains(el));
      };
      const fontPx = (el: Element): number => {
        const html = el as HTMLElement;
        const r = html.getBoundingClientRect();
        const ratio = html.offsetHeight > 0 ? r.height / html.offsetHeight : 1;
        return parseFloat(getComputedStyle(html).fontSize) * ratio;
      };
      const cameraEl = document.querySelector<HTMLElement>(view.camera);
      const scale = cameraEl ? new DOMMatrix(getComputedStyle(cameraEl).transform).a || 1 : 1;

      const cards = [...document.querySelectorAll<HTMLElement>(view.card)];
      let cardsInFrame = 0;
      let cardsPartlyInFrame = 0;
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        if (inside(r)) cardsInFrame += 1;
        else if (meets(r)) cardsPartlyInFrame += 1;
      }
      let smallestLabelPx: number | null = null;
      for (const label of document.querySelectorAll<HTMLElement>(`${view.card} ${view.rowLabel}`)) {
        if (!meets(label.getBoundingClientRect())) continue;
        const px = fontPx(label);
        if (smallestLabelPx === null || px < smallestLabelPx) smallestLabelPx = px;
      }

      /** The row of a symbol on a file's card, by the display name the DOM carries, or the file's internals row, or the card. */
      const endpointTexts = (file: string, symbol: string): Element[] | null => {
        const fileCards = cards.filter(card => card.dataset.id === file);
        if (fileCards.length === 0) return null;
        const display = symbol === "" ? "__internals__" : names[file]?.[symbol];
        for (const card of fileCards) {
          const name = card.querySelector(view.name);
          if (!name) continue;
          if (display !== undefined) {
            const rows = [...card.querySelectorAll<HTMLElement>(view.row)].filter(row => row.dataset.nodeId === file && row.dataset.symbol === display);
            const label = rows[0]?.querySelector(view.rowLabel);
            if (label) return [name, label];
          }
          if (symbol === "") return [name, name];
        }
        return null;
      };

      const wires: WireReading[] = [];
      for (const el of document.querySelectorAll<SVGGeometryElement>(view.wires)) {
        const data = (el as unknown as HTMLElement).dataset;
        const sourceId = data.sourceId ?? "";
        const targetId = data.targetId ?? "";
        if (!sourceId || !targetId || sourceId === targetId) continue;
        const clean = (symbol: string | undefined): string => (symbol === "__internals__" || symbol === "*" || symbol === undefined ? "" : symbol);
        const consumer = view.sourceIs === "consumer" ? sourceId : targetId;
        const provider = view.sourceIs === "consumer" ? targetId : sourceId;
        const consumerSymbol = clean(view.sourceIs === "consumer" ? data.sourceSymbol : data.targetSymbol);
        const providerSymbol = clean(view.sourceIs === "consumer" ? data.targetSymbol : data.sourceSymbol);
        const key = `${consumer}|${provider}|${consumerSymbol}|${providerSymbol}`;

        const box = el.getBoundingClientRect();
        const texts = [...(endpointTexts(consumer, consumerSymbol) ?? []), ...(endpointTexts(provider, providerSymbol) ?? [])];
        const complete = texts.length === 4;
        const endpointsInFrame = complete && texts.every(text => inside(text.getBoundingClientRect()));
        const endpointsUncovered = complete && texts.every(uncovered);
        const smallestFontPx = complete ? Math.min(...texts.map(fontPx)) : 0;

        let occludedSamples = 0;
        let samples = 0;
        const ctm = el.getScreenCTM();
        if (ctm && typeof el.getTotalLength === "function") {
          const length = el.getTotalLength();
          for (let at = 0; at <= length; at += 8) {
            const point = el.getPointAtLength(at).matrixTransform(ctm);
            if (point.x < frame.left || point.x > frame.right || point.y < frame.top || point.y > frame.bottom) continue;
            samples += 1;
            const top = document.elementFromPoint(point.x, point.y);
            const card = top?.closest<HTMLElement>(view.card);
            if (card && card.dataset.id !== consumer && card.dataset.id !== provider) occludedSamples += 1;
          }
        }
        wires.push({ key, consumer, provider, inFrame: meets(box), endpointsInFrame, endpointsUncovered, smallestFontPx, occludedSamples, samples });
      }
      void readingPx;
      return { wires, scale, cardsTotal: cards.length, cardsInFrame, cardsPartlyInFrame, smallestLabelPx };
    },
    { view, names, frameSelector: FRAME, readingPx: READING_PX }
  );
}

// ─── The six measures ─────────────────────────────────────────────────────

export interface LegibilityScore {
  facts: number;
  /** Legible by the deck's full definition: in frame, uncovered, at reading size. */
  legible: number;
  /** In frame and uncovered, whatever the font. */
  inFrame: number;
  drawn: number;
  notDrawn: number;
  /** Drawn, but an endpoint is outside the frame; a pan recovers it. */
  offFrame: number;
  /** Drawn with endpoints in frame, but something covers one. */
  covered: number;
  /** Drawn, in frame and uncovered, but under reading size; a zoom recovers it. */
  small: number;
}

/** Test 1 and test 5: the facts in scope against the wires drawn. */
export function scoreLegibility(facts: readonly Fact[], picture: PictureReading): LegibilityScore {
  const byKey = new Map<string, WireReading[]>();
  for (const wire of picture.wires) {
    const list = byKey.get(wire.key) ?? [];
    list.push(wire);
    byKey.set(wire.key, list);
  }
  const score: LegibilityScore = { facts: facts.length, legible: 0, inFrame: 0, drawn: 0, notDrawn: 0, offFrame: 0, covered: 0, small: 0 };
  for (const fact of facts) {
    const wires = byKey.get(factKey(fact));
    if (!wires || wires.length === 0) {
      score.notDrawn += 1;
      continue;
    }
    score.drawn += 1;
    const best = (test: (wire: WireReading) => boolean): boolean => wires.some(test);
    if (best(wire => wire.inFrame && wire.endpointsInFrame && wire.endpointsUncovered && wire.smallestFontPx >= READING_PX)) {
      score.legible += 1;
      score.inFrame += 1;
    } else if (best(wire => wire.inFrame && wire.endpointsInFrame && wire.endpointsUncovered)) {
      score.inFrame += 1;
      score.small += 1;
    } else if (best(wire => wire.inFrame && wire.endpointsInFrame)) {
      score.covered += 1;
    } else {
      score.offFrame += 1;
    }
  }
  return score;
}

export interface OcclusionScore {
  wires: number;
  occludedWires: number;
  occludedSamples: number;
  samples: number;
}

/** Test 2: wires that cross a card they do not end at. */
export function scoreOcclusion(picture: PictureReading): OcclusionScore {
  let occludedWires = 0;
  let occludedSamples = 0;
  let samples = 0;
  for (const wire of picture.wires) {
    if (wire.occludedSamples > 0) occludedWires += 1;
    occludedSamples += wire.occludedSamples;
    samples += wire.samples;
  }
  return { wires: picture.wires.length, occludedWires, occludedSamples, samples };
}

export interface TextScore {
  labels: number;
  collisions: number;
  cutOffs: number;
  faults: string;
}

/** Test 3: the design audit over the view's text. */
export async function scoreText(page: Page, view: ViewReading): Promise<TextScore> {
  const boxes = await textBoxes(page, view.text);
  const overlaps = overlapsAmong(boxes);
  const cut = await truncations(page, view.text);
  return { labels: boxes.length, collisions: overlaps.length, cutOffs: cut.length, faults: describeFaults(overlaps, cut) };
}

/** The shape of every wire with its translation removed, keyed by its edge and its order among wires of that edge. */
async function routeShapes(page: Page, view: ViewReading): Promise<Record<string, string>> {
  return page.evaluate(({ wires }) => {
    const shapes: Record<string, string> = {};
    const seen = new Map<string, number>();
    for (const el of document.querySelectorAll<SVGElement>(wires)) {
      const data = (el as unknown as HTMLElement).dataset;
      const edge = `${data.sourceId}|${data.targetId}|${data.sourceSymbol}|${data.targetSymbol}`;
      const index = seen.get(edge) ?? 0;
      seen.set(edge, index + 1);
      const text = el.getAttribute("d") ?? el.getAttribute("points") ?? "";
      const numbers = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number);
      if (numbers.length < 2) {
        shapes[`${edge}#${index}`] = text;
        continue;
      }
      const [x0, y0] = numbers;
      const relative = numbers.map((value, i) => Math.round((value - (i % 2 === 0 ? x0 : y0)) * 2) / 2);
      shapes[`${edge}#${index}`] = relative.join(",");
    }
    return shapes;
  }, { wires: view.wires });
}

/** A point inside the frame over nothing a drag would pick up: no card, button, panel or input. */
async function emptySpot(page: Page, view: ViewReading): Promise<{ x: number; y: number }> {
  const spot = await page.evaluate(({ pannable, card, frameSelector }) => {
    const frame = document.querySelector(frameSelector)!.getBoundingClientRect();
    const surface = document.querySelector(pannable);
    for (let y = frame.bottom - 40; y > frame.top + 60; y -= 24) {
      for (let x = frame.left + 40; x < frame.right - 40; x += 24) {
        const top = document.elementFromPoint(x, y);
        if (!top || !surface?.contains(top)) continue;
        if (top.closest(`${card}, button, input, select, a, #detail-panel, #controls, .pathfind-toolbar, .membrane--collapsed, .membrane-leaf`)) continue;
        return { x, y };
      }
    }
    return null;
  }, { pannable: view.pannable, card: view.card, frameSelector: FRAME });
  if (!spot) {
    throw new Error("no empty spot in the frame to drag");
  }
  return spot;
}

/** Pans the view by dragging an empty spot of it with the mouse, as a person would; the drag stays inside the frame. */
export async function dragBy(page: Page, view: ViewReading, dx: number, dy: number): Promise<{ dx: number; dy: number }> {
  const frame = (await boxOf(page, FRAME))!;
  const spot = await emptySpot(page, view);
  const toX = Math.max(frame.x + 20, Math.min(frame.x + frame.width - 20, spot.x + dx));
  const toY = Math.max(frame.y + 20, Math.min(frame.y + frame.height - 20, spot.y + dy));
  await page.mouse.move(spot.x, spot.y);
  await page.mouse.down();
  await page.mouse.move((spot.x + toX) / 2, (spot.y + toY) / 2, { steps: 6 });
  await page.mouse.move(toX, toY, { steps: 6 });
  // Come to rest before letting go, so a view with inertia does not keep sliding after the hand lifts.
  await page.waitForTimeout(160);
  await page.mouse.move(toX, toY);
  await page.mouse.up();
  await page.waitForTimeout(700);
  return { dx: toX - spot.x, dy: toY - spot.y };
}

export interface RouteScore {
  pans: number;
  compared: number;
  changed: number;
  /** Wires that appeared or disappeared during a pan. */
  countChanges: number;
  examples: string[];
}

/** Test 4: the shape of every wire across six pans by mouse, translation removed. */
export async function scoreRoutes(page: Page, view: ViewReading): Promise<RouteScore> {
  const pans: Array<[number, number]> = [[180, 0], [0, 140], [-260, -60], [90, -200], [-120, 160], [200, 90]];
  const before = await routeShapes(page, view);
  const changed = new Set<string>();
  const examples: string[] = [];
  let countChanges = 0;
  for (const [dx, dy] of pans) {
    await dragBy(page, view, dx, dy);
    const after = await routeShapes(page, view);
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of keys) {
      if (!(key in before) || !(key in after)) {
        countChanges += 1;
        continue;
      }
      if (before[key] !== after[key]) {
        changed.add(key);
        if (examples.length < 3) {
          examples.push(`${key} after pan (${dx}, ${dy})`);
        }
      }
    }
  }
  return { pans: pans.length, compared: Object.keys(before).length, changed: changed.size, countChanges, examples };
}

// ─── Journeys ─────────────────────────────────────────────────────────────

export interface Journey {
  question: string;
  answer: string[];
  gestures: number;
  smallestTargetPx: number | null;
  /** How far the subject's card moved on screen between the first frame and the frame after the last move, in CSS pixels. */
  subjectMovedPx: number | null;
  /** How many of the answer's file names are legible when the journey ends. */
  answerLegible: number;
  /** Whether the journey's moves made a history entry, so that Back could return. */
  historyEntry: boolean;
  /** After the view's own return move, how far the subject sits from where it started, in CSS pixels. */
  returnErrorPx: number | null;
  notes: string[];
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The screen box of the first element the selector names, or null. */
export async function boxOf(page: Page, selector: string): Promise<Box | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, selector);
}

export const centerDistance = (a: Box | null, b: Box | null): number | null =>
  a && b ? Math.round(Math.hypot(a.x + a.width / 2 - (b.x + b.width / 2), a.y + a.height / 2 - (b.y + b.height / 2))) : null;

/** What one move of a journey cost: the gestures it took, counting the pans that brought the target into the frame, and the short side of the target hit. */
export interface Move {
  gestures: number;
  targetPx: number;
}

/**
 * Clicks the element as a person would: never by scrolling a clipped container, but by panning the view until the
 * target is inside the frame, each pan a gesture, then clicking its center. Reports the short side of the target's box.
 */
export async function gesture(page: Page, view: ViewReading, selector: string): Promise<Move> {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 10_000 });
  let gestures = 0;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const frame = (await boxOf(page, FRAME))!;
    const box = await locator.boundingBox();
    if (!box) break;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const margin = 24;
    if (cx > frame.x + margin && cx < frame.x + frame.width - margin && cy > frame.y + margin && cy < frame.y + frame.height - margin) break;
    await dragBy(page, view, frame.x + frame.width / 2 - cx, frame.y + frame.height / 2 - cy);
    gestures += 1;
  }
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${selector} has no box to click`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  gestures += 1;
  return { gestures, targetPx: Math.round(Math.min(box.width, box.height)) };
}

/** How many of the files' names are legible on their cards now: in frame, uncovered, at reading size. */
export async function legibleNames(page: Page, view: ViewReading, files: readonly string[]): Promise<number> {
  return page.evaluate(
    ({ view, files, frameSelector, readingPx }) => {
      const frame = document.querySelector(frameSelector)!.getBoundingClientRect();
      let count = 0;
      for (const file of files) {
        const cards = [...document.querySelectorAll<HTMLElement>(view.card)].filter(card => card.dataset.id === file);
        const legible = cards.some(card => {
          const name = card.querySelector<HTMLElement>(view.name);
          if (!name) return false;
          const r = name.getBoundingClientRect();
          if (!(r.width > 0 && r.height > 0 && r.left >= frame.left && r.right <= frame.right && r.top >= frame.top && r.bottom <= frame.bottom)) return false;
          const top = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
          if (!top || !(top === name || name.contains(top) || top.contains(name))) return false;
          const ratio = name.offsetHeight > 0 ? r.height / name.offsetHeight : 1;
          return parseFloat(getComputedStyle(name).fontSize) * ratio >= readingPx;
        });
        if (legible) count += 1;
      }
      return count;
    },
    { view, files, frameSelector: FRAME, readingPx: READING_PX }
  );
}

export const backEnabled = (page: Page): Promise<boolean> => page.locator("#history-back").isEnabled();

// ─── The scoreboard ───────────────────────────────────────────────────────

export interface Scoreboard {
  measuredAt: string;
  bundle: string;
  view: string;
  state: string;
  scope: { files: number; facts: number };
  legibility: LegibilityScore | null;
  picture: { scale: number; smallestLabelPx: number | null; cardsTotal: number; cardsInFrame: number; cardsPartlyInFrame: number; wires: number } | null;
  occlusion: OcclusionScore | null;
  text: TextScore;
  routes: RouteScore | null;
  journey: Journey | null;
  notes: string[];
}

const cell = (value: number | string | null | undefined): string => (value === null || value === undefined ? "n/a" : String(value));

/** The scoreboard of one bundle as a markdown table, one row per view, one column per number the deck defines. */
export function scoreboardTable(rows: readonly Scoreboard[]): string {
  const header = [
    "| View | State | Facts in scope | Legible | In frame | Drawn | Not drawn | Off frame | Covered | Small | Scale | Smallest label px | Cards (in frame / partly / all) | Wires | Occluded wires | Occluded samples / samples | Collisions | Cut-offs | Routes changed / compared | Gestures | Smallest target px | Subject moved px | Answer legible / answer | History entry | Return error px |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- | ---: | ---: | --- | ---: | ---: | ---: | --- | --- | ---: |"
  ];
  const lines = rows.map(row => {
    const l = row.legibility;
    const p = row.picture;
    const o = row.occlusion;
    const r = row.routes;
    const j = row.journey;
    return [
      row.view,
      row.state,
      row.scope.facts,
      l ? l.legible : "n/a",
      l ? l.inFrame : "n/a",
      l ? l.drawn : "n/a",
      l ? l.notDrawn : "n/a",
      l ? l.offFrame : "n/a",
      l ? l.covered : "n/a",
      l ? l.small : "n/a",
      p ? p.scale.toFixed(2) : "n/a",
      p ? (p.smallestLabelPx === null ? "n/a" : p.smallestLabelPx.toFixed(1)) : "n/a",
      p ? `${p.cardsInFrame} / ${p.cardsPartlyInFrame} / ${p.cardsTotal}` : "n/a",
      p ? p.wires : "n/a",
      o ? o.occludedWires : "n/a",
      o ? `${o.occludedSamples} / ${o.samples}` : "n/a",
      row.text.collisions,
      row.text.cutOffs,
      r ? `${r.changed} / ${r.compared}` : "n/a",
      j ? j.gestures : "n/a",
      j ? cell(j.smallestTargetPx) : "n/a",
      j ? cell(j.subjectMovedPx) : "n/a",
      j ? `${j.answerLegible} / ${j.answer.length}` : "n/a",
      j ? (j.historyEntry ? "yes" : "no") : "n/a",
      j ? cell(j.returnErrorPx) : "n/a"
    ].map(String).join(" | ");
  });
  return [...header, ...lines.map(line => `| ${line} |`)].join("\n");
}

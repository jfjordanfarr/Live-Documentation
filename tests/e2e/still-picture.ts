/**
 * The still-picture instrument.
 *
 * Quantized measures of one view in one state, each taken against the graph
 * rather than against what the view chose to draw, so that no view can score
 * by drawing less: the six tests of the deck, and the nine the owner's reading
 * of the first scoreboard added (crossings, shared channels, flow, folder
 * adjacency and legibility, symbols shown, hidden among drawn, churn, the
 * tour). The deck that defines them, with the predictions written before this
 * code existed, is `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`.
 * The pure geometry under the added measures is `still-picture-geometry.ts`.
 *
 * A fact is one reference in the Explorer's graph payload. The scope is a set
 * of files; the facts in scope are the references with both ends in the set.
 * A wire is legible when both endpoint rows and both file names sit inside the
 * frame, uncovered, at a rendered font of at least {@link READING_PX}.
 */

import type { Page } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import {
  crossings,
  flowOf,
  folderAdjacency,
  planTour,
  sharedChannels,
  type AdjacencyScore,
  type ChannelScore,
  type CrossingScore,
  type Polyline,
  type TourFact,
  type TourPan
} from "./still-picture-geometry";
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

/** How many public symbols each file has, the denominator of the symbols-shown measure. */
export function symbolCounts(graph: ExplorerGraphPayload): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const node of graph.nodes) counts[node.id] = node.publicSymbols.length;
  return counts;
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

/** The address of the Local Map with every file of the set retained whole, the first as the subject, at the view's own fit. */
export function localRetainUrl(base: string, files: readonly string[]): string {
  return `${base}?s=${compressToEncodedURIComponent(JSON.stringify({ v: 1, w: "map", n: files[0], p: files.map(n => ({ n, s: "*" })) }))}`;
}

export const forceGraphUrl = (base: string, file: string): string => `${base}?view=force&node=${encodeURIComponent(file)}`;

/**
 * Waits until the Local Map's picture is at rest: a change of pins moves the branch picture from one arrangement to the
 * next over the tuning's move length, and the continuing search may move it again to a better arrangement
 * (2026-10-07); the root says `data-moving` while a move runs and `data-search-status` what the search is doing.
 */
export async function localMapSettled(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const root = document.querySelector<HTMLElement>("#map-container .local-placed");
    return !root || (root.dataset.moving !== "true" && root.dataset.searchStatus !== "running");
  }, undefined, { timeout: 30_000 });
}

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
  /** Within a card, the elements that name its folder (a path or directory line), when the view prints one. */
  folderText?: string[];
  /** A container the view draws around the cards of one folder, and the element within it that names the folder. */
  folderContainer?: { container: string; label: string };
  /** The box the view draws around a directory's cards, carrying `data-directory`; a wire inside one that holds neither of its ends passes a foreign directory. */
  folderBox?: string;
  /** The directories' shapes as SVG geometry, each with `data-directory`, where a view draws them as outlines rather than boxes. */
  folderShape?: string;
  /** The gaps the view reserves for wires that pass a column, when it reserves any. */
  lane?: string;
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
    "#view-map .local-column-empty",
    "#view-map .local-directory-name",
    "#view-map .local-directory-more",
    "#view-map .local-directory-closed__name",
    "#view-map .local-directory-closed__count"
  ],
  folderText: [".node-path", ".node-directory"],
  folderContainer: { container: ".local-stack-group", label: ".local-stack-group__label" },
  folderShape: "#map-container .local-membrane-shape[data-directory]",
  lane: "#map-container .local-pass-through"
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
  ],
  folderText: [".membrane-card__path", ".membrane-card__directory"],
  folderContainer: { container: ".pa-band-membrane, .pa-ancestor-membrane, .membrane", label: ".pa-band-membrane__label, .pa-ancestor-membrane__label, .membrane__label" },
  folderBox: "#membrane-container .pa-band-membrane[data-directory]"
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
  /** Samples, over the whole path, inside a directory's box that holds neither end of the wire. */
  foreignSamples: number;
  /** Samples inside a lane, and of those, inside a foreign directory's box: a lane placed where the wire does not belong. */
  laneSamples: number;
  foreignLaneSamples: number;
  /** The drawn length of the path in screen pixels, and its horizontal and vertical parts summed over the samples. */
  lengthPx: number;
  horizontalPx: number;
  verticalPx: number;
  /** The whole path sampled every 8 px in screen coordinates, flattened x, y, x, y. */
  points: number[];
  /** Which end of the sampled path sits at the provider's card: the first (0) or the last (1). */
  providerEnd: 0 | 1;
  /** The union of the four endpoint texts' boxes, when all four exist. */
  endpointBox: Box | null;
  /** A French Corset stub rather than a route: a closed shape at one pin that marks a reference drawn no further. */
  stub: boolean;
}

/** What the page reports about one card. */
export interface CardReading {
  id: string;
  folder: string;
  box: Box;
  fullyInFrame: boolean;
  meetsFrame: boolean;
  /** Distinct public symbols with a legible row on this card. */
  symbolsLegible: number;
  /** The folder named legibly on the card or on a container drawn around it; null when the file sits at the root. */
  folderLegible: boolean | null;
}

/** What the page reports about the picture as a whole. */
export interface PictureReading {
  wires: WireReading[];
  cards: CardReading[];
  frame: Box;
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
      const legibleText = (el: Element): boolean => inside(el.getBoundingClientRect()) && uncovered(el) && fontPx(el) >= readingPx;
      const folderOf = (id: string): string => (id.lastIndexOf("/") < 0 ? "" : id.slice(0, id.lastIndexOf("/")));
      const within = (r: DOMRect, x: number, y: number): boolean => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      /** Whether a file lies in a directory or below it; the root holds everything. */
      const under = (directory: string, file: string): boolean => directory === "" || folderOf(file) === directory || folderOf(file).startsWith(`${directory}/`);
      const folderBoxes = (view.folderBox ? [...document.querySelectorAll<HTMLElement>(view.folderBox)] : []).map(el => ({ directory: el.dataset.directory ?? "", rect: el.getBoundingClientRect() }));
      const folderShapes = (view.folderShape ? [...document.querySelectorAll<SVGGeometryElement>(view.folderShape)] : [])
        .flatMap(el => { const inverse = el.getScreenCTM()?.inverse(); return inverse ? [{ directory: el.dataset.directory ?? "", el, inverse }] : []; });
      /** Whether a screen point lies in a directory's drawn region: its box, or its shape's fill. */
      const inFolder = (folder: { directory: string }, x: number, y: number): boolean =>
        "rect" in folder ? within((folder as { rect: DOMRect }).rect, x, y) : (folder as { el: SVGGeometryElement; inverse: DOMMatrix }).el.isPointInFill(new DOMPoint(x, y).matrixTransform((folder as { inverse: DOMMatrix }).inverse));
      const folders: Array<{ directory: string }> = [...folderBoxes, ...folderShapes];
      const laneBoxes = (view.lane ? [...document.querySelectorAll<HTMLElement>(view.lane)] : []).map(el => el.getBoundingClientRect());
      /** Whether a label's text names the folder: the whole path, its last segment, or a file path inside it. */
      const namesFolder = (text: string, folder: string): boolean => {
        const t = text.trim().toLowerCase();
        const f = folder.toLowerCase();
        const last = f.slice(f.lastIndexOf("/") + 1);
        return t.length > 0 && (t === f || t === last || t.includes(`${f}/`) || t.endsWith(`/${last}`));
      };
      const toBox = (r: DOMRect): Box => ({ x: r.x, y: r.y, width: r.width, height: r.height });
      const cameraEl = document.querySelector<HTMLElement>(view.camera);
      const scale = cameraEl ? new DOMMatrix(getComputedStyle(cameraEl).transform).a || 1 : 1;

      const cards = [...document.querySelectorAll<HTMLElement>(view.card)];
      let cardsInFrame = 0;
      let cardsPartlyInFrame = 0;
      const cardReadings: CardReading[] = [];
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        if (inside(r)) cardsInFrame += 1;
        else if (meets(r)) cardsPartlyInFrame += 1;
        const id = card.dataset.id ?? "";
        const folder = folderOf(id);
        const legibleSymbols = new Set<string>();
        for (const row of card.querySelectorAll<HTMLElement>(view.row)) {
          if (row.dataset.nodeId !== id || !row.dataset.symbol || row.dataset.symbol === "__internals__") continue;
          const label = row.querySelector(view.rowLabel);
          if (label && legibleText(label)) legibleSymbols.add(row.dataset.symbol);
        }
        let folderLegible: boolean | null = folder === "" ? null : false;
        if (folder !== "") {
          for (const selector of view.folderText ?? []) {
            for (const el of card.querySelectorAll(selector)) {
              if (namesFolder(el.textContent ?? "", folder) && legibleText(el)) folderLegible = true;
            }
          }
          const around = view.folderContainer;
          if (!folderLegible && around) {
            let container = card.parentElement?.closest(around.container) ?? null;
            while (container && !folderLegible) {
              const own = container;
              const labels = [...own.querySelectorAll(around.label)].filter(label => label.closest(around.container) === own);
              if (labels.some(label => namesFolder(label.textContent ?? "", folder) && legibleText(label))) folderLegible = true;
              container = own.parentElement?.closest(around.container) ?? null;
            }
          }
        }
        cardReadings.push({ id, folder, box: toBox(r), fullyInFrame: inside(r), meetsFrame: meets(r), symbolsLegible: legibleSymbols.size, folderLegible });
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
        // A wire the page holds but does not show, such as a back reference's route before a hover, is not drawn.
        if (getComputedStyle(el).display === "none") continue;
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
        let foreignSamples = 0;
        let laneSamples = 0;
        let foreignLaneSamples = 0;
        let lengthPx = 0;
        const points: number[] = [];
        const ctm = el.getScreenCTM();
        if (ctm && typeof el.getTotalLength === "function") {
          const length = el.getTotalLength();
          lengthPx = length * Math.hypot(ctm.a, ctm.b);
          const sample = (at: number): DOMPoint => el.getPointAtLength(at).matrixTransform(ctm);
          for (let at = 0; at <= length; at += 8) {
            const point = sample(at);
            points.push(point.x, point.y);
            // Where the wire is drawn, in or out of the frame: a directory's box is a fact of the layout, not of the camera.
            const foreign = folders.some(folder => inFolder(folder, point.x, point.y) && !under(folder.directory, consumer) && !under(folder.directory, provider));
            if (foreign) foreignSamples += 1;
            if (laneBoxes.some(rect => within(rect, point.x, point.y))) {
              laneSamples += 1;
              if (foreign) foreignLaneSamples += 1;
            }
            if (point.x < frame.left || point.x > frame.right || point.y < frame.top || point.y > frame.bottom) continue;
            samples += 1;
            const top = document.elementFromPoint(point.x, point.y);
            const card = top?.closest<HTMLElement>(view.card);
            if (card && card.dataset.id !== consumer && card.dataset.id !== provider) occludedSamples += 1;
          }
          const end = sample(length);
          points.push(end.x, end.y);
        }
        // Which end sits at the provider: the nearer of the path's ends to any card of the provider, with the
        // consumer's cards weighing in from the other end, since a view may draw one file as two cards.
        let providerEnd: 0 | 1 = 0;
        if (points.length >= 4) {
          const gapTo = (id: string, x: number, y: number): number => {
            let nearest = Infinity;
            for (const card of cards) {
              if (card.dataset.id !== id) continue;
              const r = card.getBoundingClientRect();
              const gap = Math.hypot(Math.max(0, r.left - x, x - r.right), Math.max(0, r.top - y, y - r.bottom));
              if (gap < nearest) nearest = gap;
            }
            return nearest === Infinity ? 0 : nearest;
          };
          const [x0, y0] = points;
          const xN = points[points.length - 2];
          const yN = points[points.length - 1];
          const providerFirst = gapTo(provider, x0, y0) + gapTo(consumer, xN, yN);
          const providerLast = gapTo(provider, xN, yN) + gapTo(consumer, x0, y0);
          providerEnd = providerFirst <= providerLast ? 0 : 1;
        }
        let endpointBox: Box | null = null;
        if (complete) {
          const rects = texts.map(text => text.getBoundingClientRect());
          const left = Math.min(...rects.map(r => r.left));
          const top = Math.min(...rects.map(r => r.top));
          endpointBox = { x: left, y: top, width: Math.max(...rects.map(r => r.right)) - left, height: Math.max(...rects.map(r => r.bottom)) - top };
        }
        let horizontalPx = 0, verticalPx = 0;
        for (let i = 2; i < points.length; i += 2) { horizontalPx += Math.abs(points[i] - points[i - 2]); verticalPx += Math.abs(points[i + 1] - points[i - 1]); }
        wires.push({ key, consumer, provider, inFrame: meets(box), endpointsInFrame, endpointsUncovered, smallestFontPx, occludedSamples, samples, foreignSamples, laneSamples, foreignLaneSamples, lengthPx, horizontalPx, verticalPx, points, providerEnd, endpointBox, stub: el.tagName.toLowerCase() === "polygon" });
      }
      return { wires, cards: cardReadings, frame: toBox(frame), scale, cardsTotal: cards.length, cardsInFrame, cardsPartlyInFrame, smallestLabelPx };
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

export interface ForeignScore {
  wires: number;
  /** Wires with any sample inside a directory's box that holds neither of their ends. */
  foreignWires: number;
  foreignSamples: number;
  samples: number;
  /** Samples inside lanes, and of those, inside a foreign directory; a view without lanes reports zero of zero. */
  laneSamples: number;
  foreignLaneSamples: number;
}

/** Test 16: wires drawn through a directory that holds neither of their ends, over the whole path, and the part of it that lies in lanes. */
export function scoreForeign(picture: PictureReading): ForeignScore {
  const score: ForeignScore = { wires: picture.wires.length, foreignWires: 0, foreignSamples: 0, samples: 0, laneSamples: 0, foreignLaneSamples: 0 };
  for (const wire of picture.wires) {
    if (wire.foreignSamples > 0) score.foreignWires += 1;
    score.foreignSamples += wire.foreignSamples;
    score.samples += wire.points.length / 2;
    score.laneSamples += wire.laneSamples;
    score.foreignLaneSamples += wire.foreignLaneSamples;
  }
  return score;
}

export interface LengthScore {
  wires: number;
  /** The drawn length of every wire added up, in screen pixels at the view's scale. */
  totalPx: number;
  /** The mean per wire. */
  meanPx: number;
  /** The horizontal and vertical parts of the total, summed over the sampled points. */
  horizontalPx: number;
  verticalPx: number;
}

/** Test 17: the total drawn length of the wires, the owner's reward for the Local Map (2026-10-05): the shorter, the fewer turns and extensions. */
export function scoreLength(picture: PictureReading): LengthScore {
  const wires = picture.wires.filter(wire => !wire.stub);
  const totalPx = wires.reduce((sum, wire) => sum + wire.lengthPx, 0);
  const horizontalPx = wires.reduce((sum, wire) => sum + wire.horizontalPx, 0);
  const verticalPx = wires.reduce((sum, wire) => sum + wire.verticalPx, 0);
  return { wires: wires.length, totalPx: Math.round(totalPx), meanPx: wires.length ? Math.round(totalPx / wires.length) : 0, horizontalPx: Math.round(horizontalPx), verticalPx: Math.round(verticalPx) };
}

/** The legibility of one wire by the deck's full definition. */
export const wireLegible = (wire: WireReading): boolean => wire.inFrame && wire.endpointsInFrame && wire.endpointsUncovered && wire.smallestFontPx >= READING_PX;

const polylinesOf = (picture: PictureReading): Polyline[] =>
  picture.wires
    .filter(wire => wire.points.length >= 4)
    .map((wire, index) => {
      const points: Array<[number, number]> = [];
      for (let i = 0; i + 1 < wire.points.length; i += 2) points.push([wire.points[i], wire.points[i + 1]]);
      return { id: `${wire.key}#${index}`, points };
    });

export interface ExpandedScore {
  /** Test 7. */
  crossings: CrossingScore;
  /** Test 8. */
  channels: ChannelScore;
  /** Test 9. */
  flow: { drawn: number; flowing: number; backward: number };
  /** Tests 10 and 11. */
  folders: { adjacency: AdjacencyScore; legible: { counted: number; legible: number } };
  /** Test 12: over the cards that meet the frame. */
  symbols: { total: number; legible: number };
}

/** Tests 7 to 12 over one picture; `counts` is the graph's public symbol count per file. */
export function scoreExpanded(picture: PictureReading, counts: Record<string, number>): ExpandedScore {
  const lines = polylinesOf(picture);
  let flowing = 0;
  let backward = 0;
  for (const wire of picture.wires) {
    if (wire.points.length < 4) continue;
    const points: Array<[number, number]> = [];
    for (let i = 0; i + 1 < wire.points.length; i += 2) points.push([wire.points[i], wire.points[i + 1]]);
    const reading = flowOf(points, wire.providerEnd);
    if (reading.flowing) flowing += 1;
    if (reading.backward) backward += 1;
  }
  const adjacency = folderAdjacency(picture.cards.map(card => ({ id: card.id, folder: card.folder, box: card.box })));
  const withFolder = picture.cards.filter(card => card.fullyInFrame && card.folderLegible !== null);
  let total = 0;
  let legible = 0;
  for (const card of picture.cards) {
    if (!card.meetsFrame) continue;
    const count = counts[card.id] ?? 0;
    total += count;
    legible += Math.min(card.symbolsLegible, count);
  }
  return {
    crossings: crossings(lines),
    channels: sharedChannels(lines),
    flow: { drawn: lines.length, flowing, backward },
    folders: { adjacency, legible: { counted: withFolder.length, legible: withFolder.filter(card => card.folderLegible === true).length } },
    symbols: { total, legible }
  };
}

export interface HiddenScore {
  /** References between two drawn cards. */
  facts: number;
  /** Of those, references with no wire. */
  hidden: number;
}

/** Test 13: test 5 with the scope widened to whatever the view drew. */
export function scoreHiddenAmongDrawn(graph: ExplorerGraphPayload, picture: PictureReading): HiddenScore {
  const drawn = [...new Set(picture.cards.map(card => card.id).filter(Boolean))];
  const facts = factsInScope(graph, drawn);
  return { facts: facts.length, hidden: scoreLegibility(facts, picture).notDrawn };
}

/** Which hops of a chain are legible: a hop is legible when any reference between its two files is. */
export function scoreHops(graph: ExplorerGraphPayload, chain: readonly string[], picture: PictureReading): { hops: number; legible: number } {
  let legible = 0;
  for (let i = 0; i + 1 < chain.length; i += 1) {
    const facts = factsInScope(graph, [chain[i], chain[i + 1]]).filter(fact => fact.consumer === chain[i] && fact.provider === chain[i + 1]);
    if (scoreLegibility(facts, picture).legible > 0) legible += 1;
  }
  return { hops: chain.length - 1, legible };
}

export interface ChurnScore {
  /** Cards present before and after, by file. */
  present: number;
  /** Of those, cards that moved more than the threshold. */
  moved: number;
  /** The sum of their displacements, in px. */
  movedPx: number;
  added: number;
  removed: number;
}

/** Test 14: what one gesture did to every card. */
export function scoreChurn(before: Record<string, Box>, after: Record<string, Box>, thresholdPx = 8): ChurnScore {
  let present = 0;
  let moved = 0;
  let movedPx = 0;
  let removed = 0;
  for (const [id, box] of Object.entries(before)) {
    const now = after[id];
    if (!now) {
      removed += 1;
      continue;
    }
    present += 1;
    const distance = centerDistance(box, now) ?? 0;
    if (distance > thresholdPx) {
      moved += 1;
      movedPx += distance;
    }
  }
  const added = Object.keys(after).filter(id => !(id in before)).length;
  return { present, moved, movedPx: Math.round(movedPx), added, removed };
}

/** The screen box of the first card of each file. */
export async function cardBoxes(page: Page, view: ViewReading): Promise<Record<string, Box>> {
  return page.evaluate((card) => {
    const boxes: Record<string, { x: number; y: number; width: number; height: number }> = {};
    for (const el of document.querySelectorAll<HTMLElement>(card)) {
      const id = el.dataset.id ?? "";
      if (!id || id in boxes) continue;
      const r = el.getBoundingClientRect();
      boxes[id] = { x: r.x, y: r.y, width: r.width, height: r.height };
    }
    return boxes;
  }, view.card);
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

/**
 * A point inside the frame over nothing a drag would pick up: no card, button, panel or input. Given the drag to
 * come, prefers a spot from which the whole drag stays inside the frame, so that one drag is one pan.
 */
async function emptySpot(page: Page, view: ViewReading, dx = 0, dy = 0): Promise<{ x: number; y: number }> {
  const spot = await page.evaluate(({ pannable, card, frameSelector, dx, dy }) => {
    const frame = document.querySelector(frameSelector)!.getBoundingClientRect();
    const surface = document.querySelector(pannable);
    let fallback: { x: number; y: number } | null = null;
    for (let y = frame.bottom - 40; y > frame.top + 60; y -= 24) {
      for (let x = frame.left + 40; x < frame.right - 40; x += 24) {
        const top = document.elementFromPoint(x, y);
        if (!top || !surface?.contains(top)) continue;
        if (top.closest(`${card}, button, input, select, a, #detail-panel, #controls, .pathfind-toolbar, .membrane--collapsed, .membrane-leaf`)) continue;
        const fits = x + dx > frame.left + 20 && x + dx < frame.right - 20 && y + dy > frame.top + 20 && y + dy < frame.bottom - 20;
        if (fits) return { x, y };
        fallback ??= { x, y };
      }
    }
    return fallback;
  }, { pannable: view.pannable, card: view.card, frameSelector: FRAME, dx, dy });
  if (!spot) {
    throw new Error("no empty spot in the frame to drag");
  }
  return spot;
}

/** Pans the view by dragging an empty spot of it with the mouse, as a person would; the drag stays inside the frame. */
export async function dragBy(page: Page, view: ViewReading, dx: number, dy: number): Promise<{ dx: number; dy: number }> {
  const frame = (await boxOf(page, FRAME))!;
  const spot = await emptySpot(page, view, dx, dy);
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

export interface TourScore {
  /** Facts in scope that are drawn, the tour's denominator. */
  drawn: number;
  /** Legible before any pan. */
  legibleAtStart: number;
  pans: TourPan[];
  blindPans: number;
  /** Facts legible at least once by the end of the planned tour. */
  legibleAfter: number;
  /** Facts no pan can make legible: under reading size, or endpoints further apart than the frame. */
  unreachable: number;
  /** Facts legible at least once as the pans were actually made, by mouse. */
  verified: number;
  notes: string[];
}

/**
 * Test 15: plan the tour from the picture as it stands, then make the pans by mouse and count what became legible.
 * The camera is left where the tour ends.
 */
export async function runTour(page: Page, view: ViewReading, facts: readonly Fact[], names: Record<string, Record<string, string>>): Promise<TourScore> {
  const picture = await readPicture(page, view, names);
  const byKey = new Map<string, WireReading[]>();
  for (const wire of picture.wires) byKey.set(wire.key, [...(byKey.get(wire.key) ?? []), wire]);
  const tourFacts: TourFact[] = [];
  for (const fact of facts) {
    const wires = byKey.get(factKey(fact));
    if (!wires || wires.length === 0) continue;
    const legibleNow = wires.some(wireLegible);
    const candidates = wires.filter(wire => wire.endpointBox !== null && wire.smallestFontPx >= READING_PX);
    const best = candidates.sort((a, b) => a.endpointBox!.width * a.endpointBox!.height - b.endpointBox!.width * b.endpointBox!.height)[0];
    tourFacts.push({ key: factKey(fact), box: best?.endpointBox ?? { x: 0, y: 0, width: Infinity, height: Infinity }, atReadingSize: best !== undefined, legibleNow });
  }
  const frame = picture.frame;
  const plan = planTour(frame, tourFacts, picture.cards.map(card => card.box), frame.width - 80, frame.height - 80);
  const seen = new Set(tourFacts.filter(fact => fact.legibleNow).map(fact => fact.key));
  const notes: string[] = [];
  for (const pan of plan.pans) {
    let remainingX = pan.dx;
    let remainingY = pan.dy;
    for (let drag = 0; drag < 3 && (Math.abs(remainingX) > 4 || Math.abs(remainingY) > 4); drag += 1) {
      const made = await dragBy(page, view, remainingX, remainingY);
      remainingX -= made.dx;
      remainingY -= made.dy;
      if (drag > 0) notes.push(`a planned pan took ${drag + 1} drags`);
    }
    const now = await readPicture(page, view, names);
    for (const wire of now.wires) if (wireLegible(wire)) seen.add(wire.key);
  }
  const verified = tourFacts.filter(fact => seen.has(fact.key)).length;
  if (verified !== plan.legibleAfter) notes.push(`planned ${plan.legibleAfter} legible after the tour, verified ${verified}`);
  return { drawn: tourFacts.length, legibleAtStart: tourFacts.filter(fact => fact.legibleNow).length, pans: plan.pans, blindPans: plan.blindPans, legibleAfter: plan.legibleAfter, unreachable: plan.unreachable, verified, notes };
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

/** The chain scope's journey: from A's single-file state to a picture in which the hops are legible. */
export interface ChainJourney {
  question: string;
  path: string[];
  gestures: number;
  smallestTargetPx: number | null;
  /** How far A's card moved on screen between the first frame and the frame after the last move. */
  subjectMovedPx: number | null;
  hops: number;
  hopsLegible: number;
  /** How many of the chain's file names are legible at the end. */
  namesLegible: number;
  historyEntry: boolean;
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
  /** Which scope set the row measures: the five files, or the chain. */
  scopeName?: string;
  view: string;
  state: string;
  scope: { files: number; facts: number };
  legibility: LegibilityScore | null;
  picture: { scale: number; smallestLabelPx: number | null; cardsTotal: number; cardsInFrame: number; cardsPartlyInFrame: number; wires: number } | null;
  occlusion: OcclusionScore | null;
  text: TextScore;
  routes: RouteScore | null;
  journey: Journey | null;
  /** Tests 7 to 12; absent on rows measured before the deck grew. */
  expanded?: ExpandedScore | null;
  /** Test 13. */
  hiddenAmongDrawn?: HiddenScore | null;
  /** Test 16; absent on rows measured before it was defined. */
  foreign?: ForeignScore | null;
  /** Test 17; absent on rows measured before it was defined. */
  length?: LengthScore | null;
  /** Test 14, after the journey's one gesture. */
  churn?: ChurnScore | null;
  /** Test 15. */
  tour?: TourScore | null;
  /** The chain scope's journey. */
  chain?: ChainJourney | null;
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

/** The expanded measures of one bundle as a second table, one row per view. */
export function expandedTable(rows: readonly Scoreboard[]): string {
  const header = [
    "| View | State | Crossings (points / spots / beyond 80 px of pins / pairs / wires crossed of drawn) | Channels (wires of drawn / longest px) | Flow (flowing of drawn / backward) | Folder adjacency | Folder legible | Symbols shown | Hidden among drawn | Foreign directory (wires of drawn / samples of all / in lanes of lane samples) | Wire length (total px / mean / horizontal / vertical) | Churn (moved of present / px / added / removed) | Tour (pans / blind / legible after of drawn / unreachable / verified) |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
  ];
  const lines = rows.map(row => {
    const e = row.expanded ?? null;
    const h = row.hiddenAmongDrawn ?? null;
    const f = row.foreign ?? null;
    const n = row.length ?? null;
    const c = row.churn ?? null;
    const t = row.tour ?? null;
    return [
      row.view,
      row.state,
      e ? `${e.crossings.points} / ${e.crossings.spots ?? "n/a"} / ${e.crossings.farPoints} / ${e.crossings.pairs} / ${e.crossings.wiresCrossed} of ${e.flow.drawn}` : "n/a",
      e ? `${e.channels.wires} of ${e.flow.drawn} / ${e.channels.longestRunPx}` : "n/a",
      e ? `${e.flow.flowing} of ${e.flow.drawn} / ${e.flow.backward}` : "n/a",
      e ? `${e.folders.adjacency.adjacent} of ${e.folders.adjacency.counted}` : "n/a",
      e ? `${e.folders.legible.legible} of ${e.folders.legible.counted}` : "n/a",
      e ? `${e.symbols.legible} of ${e.symbols.total}` : "n/a",
      h ? `${h.hidden} of ${h.facts}` : "n/a",
      f ? `${f.foreignWires} of ${f.wires} / ${f.foreignSamples} of ${f.samples} / ${f.foreignLaneSamples} of ${f.laneSamples}` : "n/a",
      n ? `${n.totalPx} / ${n.meanPx} / ${n.horizontalPx} / ${n.verticalPx}` : "n/a",
      c ? `${c.moved} of ${c.present} / ${c.movedPx} / ${c.added} / ${c.removed}` : "n/a",
      t ? `${t.pans.length} / ${t.blindPans} / ${t.legibleAfter} of ${t.drawn} / ${t.unreachable} / ${t.verified}` : "n/a"
    ].join(" | ");
  });
  return [...header, ...lines.map(line => `| ${line} |`)].join("\n");
}

/** The chain journeys of one bundle as a table. */
export function chainTable(rows: readonly Scoreboard[]): string {
  const header = [
    "| View | State | Gestures | Smallest target px | A moved px | Hops legible | Names legible | History entry | Return error px |",
    "| --- | --- | ---: | ---: | ---: | --- | --- | --- | ---: |"
  ];
  const lines = rows
    .filter(row => row.chain)
    .map(row => {
      const j = row.chain!;
      return [row.view, row.state, j.gestures, cell(j.smallestTargetPx), cell(j.subjectMovedPx), `${j.hopsLegible} of ${j.hops}`, `${j.namesLegible} of ${j.path.length}`, j.historyEntry ? "yes" : "no", cell(j.returnErrorPx)].map(String).join(" | ");
    });
  return [...header, ...lines.map(line => `| ${line} |`)].join("\n");
}

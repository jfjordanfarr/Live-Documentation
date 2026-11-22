/**
 * The still-picture instrument's reading as it stood until 2026-11-22, kept word for word as the oracle its faster
 * successor is held to: `readPicture` in `still-picture.ts` must give this reading to the number on the same page.
 * Nothing but the comparison calls it; it costs what the old reading cost, so it is run on small pictures in the suite
 * and on the large one only by the probe that measured the change
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/instrument-and-look-cost/`).
 */
import type { Page } from "@playwright/test";

import { READING_PX, type Box, type CardReading, type PictureReading, type ViewReading, type WireReading } from "./still-picture";

/** The element whose box is the picture's frame, as `still-picture.ts` has it. */
const FRAME = "#main";

/** Reads the wires, cards and camera of a view as drawn now, as the instrument read them until 2026-11-22. */
export async function readPictureReference(page: Page, view: ViewReading, names: Record<string, Record<string, string>>, along = true): Promise<PictureReading> {
  return page.evaluate(
    ({ view, names, frameSelector, readingPx, along }) => {
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
      type Edges = Pick<DOMRect, "left" | "right" | "top" | "bottom">;
      const within = (r: Edges, x: number, y: number): boolean => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      /** A box grown by a margin on every side. */
      const grown = (r: Edges, by: number): Edges => ({ left: r.left - by, right: r.right + by, top: r.top - by, bottom: r.bottom + by });
      /** Whether a file lies in a directory or below it; the root holds everything. */
      const under = (directory: string, file: string): boolean => directory === "" || folderOf(file) === directory || folderOf(file).startsWith(`${directory}/`);
      const folderBoxes = (view.folderBox ? [...document.querySelectorAll<HTMLElement>(view.folderBox)] : []).map(el => ({ directory: el.dataset.directory ?? "", rect: el.getBoundingClientRect() }));
      // A shape's fill lies within its box; the box, a pixel wider for the edges' rounding, says where the fill test can say yes.
      const folderShapes = (view.folderShape ? [...document.querySelectorAll<SVGGeometryElement>(view.folderShape)] : [])
        .flatMap(el => { const inverse = el.getScreenCTM()?.inverse(); return inverse ? [{ directory: el.dataset.directory ?? "", el, inverse, bounds: grown(el.getBoundingClientRect(), 1) }] : []; });
      /** Whether a screen point lies in a directory's drawn region: its box, or its shape's fill. */
      const folders = [...folderBoxes, ...folderShapes];
      const inFolder = (folder: typeof folders[number], x: number, y: number): boolean =>
        "rect" in folder ? within(folder.rect, x, y) : within(folder.bounds, x, y) && folder.el.isPointInFill(new DOMPoint(x, y).matrixTransform(folder.inverse));
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
      // A card's hull: its box and its parts' boxes, since a part may stand out of the card (an anchor on its edge), a
      // few pixels wider for strokes and glyphs. The page's hit test can name a card at a point only within its hull.
      const hulls = cards.map(card => {
        const r = card.getBoundingClientRect();
        const hull = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        for (const part of card.querySelectorAll("*")) {
          const b = part.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) continue;
          hull.left = Math.min(hull.left, b.left); hull.right = Math.max(hull.right, b.right);
          hull.top = Math.min(hull.top, b.top); hull.bottom = Math.max(hull.bottom, b.bottom);
        }
        return { id: card.dataset.id ?? "", bounds: grown(hull, 8) };
      });
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
        const style = getComputedStyle(el);
        if (style.display === "none") continue;
        const stub = el.tagName.toLowerCase() === "polygon";
        const kind = el.classList.contains("bundle-run") ? "run" as const : el.classList.contains("back-route") ? "back" as const : stub ? "stub" as const : "route" as const;
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
        if (along && ctm && typeof el.getTotalLength === "function") {
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
            // Occluded where the page's topmost element at the sample belongs to a card other than the wire's ends; the
            // hit test, the costly reading, is asked only within such a card's hull, where alone it can say so.
            if (hulls.some(hull => hull.id !== consumer && hull.id !== provider && within(hull.bounds, point.x, point.y))) {
              const top = document.elementFromPoint(point.x, point.y);
              const card = top?.closest<HTMLElement>(view.card);
              if (card && card.dataset.id !== consumer && card.dataset.id !== provider) occludedSamples += 1;
            }
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
        wires.push({ key, consumer, provider, inFrame: meets(box), endpointsInFrame, endpointsUncovered, smallestFontPx, occludedSamples, samples, foreignSamples, laneSamples, foreignLaneSamples, lengthPx, horizontalPx, verticalPx, points, providerEnd, endpointBox, stub, kind, opacity: Number(style.opacity), filter: style.filter });
      }
      return { wires, cards: cardReadings, frame: toBox(frame), scale, cardsTotal: cards.length, cardsInFrame, cardsPartlyInFrame, smallestLabelPx };
    },
    { view, names, frameSelector: FRAME, readingPx: READING_PX, along }
  );
}

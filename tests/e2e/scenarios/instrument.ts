/**
 * The reading instrument: what the settled 2D Local Map says, captured as a `Reading` (`reading.ts`), with a screenshot
 * saved beside it so that an eye can confirm the reading means what it says.
 *
 * It reads the page from outside, as the other instruments do, and reuses them rather than reading the same thing
 * twice: the still-picture instrument's `readPicture` for the wires (sampled paths, which end is the provider's, cards
 * crossed, lanes in a stranger's directory) and the cards' boxes, and the design audit for collisions and cut text. It
 * adds only what neither reads: the frame and its edge signs, each card's state and directory, the dots, each wire's
 * kind and style, the directories' published segments, the lanes, and the colours the tone promises are judged by.
 * Kept small on purpose: an instrument that lies makes every judgment lie with it.
 */

import fs from "node:fs";
import path from "node:path";

import type { Page } from "@playwright/test";

import { backdrop, contrastRatio, parseColour } from "../contrast";
import { overlapsAmong, textBoxes, truncations } from "../design-audit";
import { LOCAL_MAP, localMapStill, readPicture } from "../still-picture";

import type { Box, Reading, TextFault, WireKind } from "./reading";

/** What a page did while a scenario loaded: errors it logged and requests it made off its own site. */
export interface PageWatch {
  consoleErrors: string[];
  offSiteRequests: string[];
}

/** Starts watching a page before it opens the scenario's address. */
export function watchPage(page: Page, origin: string): PageWatch {
  const watch: PageWatch = { consoleErrors: [], offSiteRequests: [] };
  page.on("console", message => { if (message.type() === "error") watch.consoleErrors.push(message.text()); });
  page.on("pageerror", error => watch.consoleErrors.push(String(error)));
  page.on("request", request => {
    const url = request.url();
    if (!url.startsWith(origin) && !url.startsWith("data:") && !url.startsWith("blob:")) watch.offSiteRequests.push(url);
  });
  return watch;
}

/** The page's own reading of what the still-picture instrument does not read. */
interface Extras {
  frame: Box;
  picture: Box | null;
  edgeSigns: Reading["edgeSigns"];
  look: string | null;
  cards: Array<{ id: string; subject: boolean; pinned: boolean; directory: string | null }>;
  anchors: Reading["anchors"];
  wires: Array<{ key: string; kind: WireKind; opacity: number; filter: string }>;
  directories: Reading["directories"];
  lanes: Reading["lanes"];
  colours: {
    fileName: { colour: string; layers: string[] } | null;
    symbolName: { colour: string; layers: string[] } | null;
    prose: { colour: string; layers: string[] } | null;
    outline: { stroke: string; fill: string; border: string; layers: string[] } | null;
  };
}

async function readExtras(page: Page): Promise<Extras> {
  return page.evaluate(({ wiresSelector, cardSelector }) => {
    const toBox = (r: DOMRect) => ({ x: r.x, y: r.y, width: r.width, height: r.height });
    const signs = document.querySelector<HTMLElement>("#view-map .map-edges")!;
    const layout = document.querySelector<HTMLElement>("#map-container .local-layout");
    const map = document.querySelector<HTMLElement>("#map-container")!;
    const cards = [...document.querySelectorAll<HTMLElement>(cardSelector)].map(card => ({
      id: card.dataset.id ?? "",
      subject: card.classList.contains("local-focus"),
      pinned: card.querySelector('.local-file-pin[aria-pressed="true"]') !== null || card.querySelector(".symbol-row.symbol-pinned") !== null,
      directory: card.closest<HTMLElement>(".local-directory-band")?.dataset.directory ?? null
    }));
    const anchors = [...document.querySelectorAll<HTMLElement>("#map-container .node-card .symbol-anchor.dot")].flatMap(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || getComputedStyle(el).display === "none") return [];
      return [{
        file: el.closest<HTMLElement>(".node-card")!.dataset.id ?? "",
        symbol: el.dataset.symbol ?? "",
        side: el.classList.contains("outbound") ? "outbound" as const : "inbound" as const,
        x: (r.left + r.right) / 2,
        y: (r.top + r.bottom) / 2
      }];
    });
    // The wires in the order and by the rules `readPicture` reads them, so that the two lists stand side by side.
    const clean = (symbol: string | undefined): string => (symbol === "__internals__" || symbol === "*" || symbol === undefined ? "" : symbol);
    const wires = [...document.querySelectorAll<SVGGeometryElement>(wiresSelector)].flatMap(el => {
      const data = (el as unknown as HTMLElement).dataset;
      if (!data.sourceId || !data.targetId || data.sourceId === data.targetId) return [];
      const style = getComputedStyle(el);
      if (style.display === "none") return [];
      const kind = el.classList.contains("bundle-run") ? "run" : el.classList.contains("back-route") ? "back" : el.tagName.toLowerCase() === "polygon" ? "stub" : "route";
      return [{ key: `${data.sourceId}|${data.targetId}|${clean(data.sourceSymbol)}|${clean(data.targetSymbol)}`, kind: kind as "run" | "back" | "stub" | "route", opacity: Number(style.opacity), filter: style.filter }];
    });
    const placed = document.querySelector<HTMLElement>("#map-container .local-placed");
    const origin = placed?.getBoundingClientRect();
    const scale = placed && origin ? origin.width / (placed.offsetWidth || 1) : 1;
    const directories = [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-band[data-segments]")].map(band => ({
      directory: band.dataset.directory ?? "",
      parent: band.parentElement?.closest<HTMLElement>(".local-directory-band")?.dataset.directory ?? null,
      drawn: band.querySelector(":scope > .local-membrane > .local-membrane-shape[d]") !== null,
      segments: (band.dataset.segments ?? "").split(";").filter(Boolean).map(part => {
        const [column, left, top, right, bottom] = part.split(":").map(Number);
        return { column, box: { x: origin!.left + left * scale, y: origin!.top + top * scale, width: (right - left) * scale, height: (bottom - top) * scale } };
      }),
      // The product keeps each directory's inset to itself; until it publishes it, a card is held inside its segment only.
      insetPx: 0
    }));
    const lanes = [...document.querySelectorAll<HTMLElement>("#map-container .local-pass-through[data-lane]")].map(lane => ({
      box: toBox(lane.getBoundingClientRect()),
      slots: (lane.dataset.slots ?? "").split(",").filter(Boolean).map(Number)
    }));
    const layers = (element: Element): string[] => {
      const list: string[] = [];
      for (let layer: Element | null = element; layer; layer = layer.parentElement) list.unshift(getComputedStyle(layer).backgroundColor);
      return list;
    };
    const tone = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? { colour: getComputedStyle(element).color, layers: layers(element) } : null;
    };
    const subject = "#map-container .node-card.local-focus";
    const shape = document.querySelector<SVGPathElement>("#map-container .local-membrane-shape");
    const plainCard = document.querySelector<HTMLElement>("#map-container .node-card:not(.test-backed):not(.selected)");
    const band = shape?.closest(".local-directory-band");
    return {
      frame: toBox(signs.getBoundingClientRect()),
      picture: layout ? toBox(layout.getBoundingClientRect()) : null,
      edgeSigns: { above: signs.dataset.above === "true", below: signs.dataset.below === "true", left: signs.dataset.left === "true", right: signs.dataset.right === "true" },
      look: map.dataset.look ?? null,
      cards,
      anchors,
      wires,
      directories,
      lanes,
      colours: {
        fileName: tone(`${subject} .local-file-name-text`),
        symbolName: tone(`${subject} .symbol-row:not(.internals-row) .symbol-label-text`),
        prose: tone(`${subject} .local-reading-purpose .local-reading-prose`),
        outline: shape && plainCard && band ? { stroke: getComputedStyle(shape).stroke, fill: getComputedStyle(shape).fill, border: getComputedStyle(plainCard).borderTopColor, layers: layers(band) } : null
      }
    };
  }, { wiresSelector: LOCAL_MAP.wires, cardSelector: LOCAL_MAP.card });
}

const ratio = (tone: { colour: string; layers: string[] } | null): number | null => (tone ? contrastRatio(parseColour(tone.colour), backdrop(tone.layers)) : null);

/**
 * Reads the settled Local Map: waits until it is still, moves the pointer off the map, reads, and saves the screenshot
 * at `shotPath`. `names` is the bundle's display names per file (`displayNames` of the still-picture instrument), by
 * which a wire's symbol finds its row.
 */
export async function readSettled(page: Page, context: { scenario: string; map: string; watch: PageWatch; names: Record<string, Record<string, string>>; shotPath: string }): Promise<Reading> {
  await localMapStill(page);
  const viewport = page.viewportSize() ?? { width: 0, height: 0 };
  // The pointer rests at the window's bottom left corner, over no card, so that no hover shapes the reading.
  await page.mouse.move(1, viewport.height - 1);
  await page.waitForTimeout(250);
  const picture = await readPicture(page, LOCAL_MAP, context.names);
  const extras = await readExtras(page);
  if (extras.wires.length !== picture.wires.length || extras.wires.some((wire, i) => wire.key !== picture.wires[i].key)) {
    throw new Error("The instrument's two readings of the wires disagree; it will not report a reading it cannot stand behind.");
  }
  const boxes = await textBoxes(page, LOCAL_MAP.text);
  const textFaults: TextFault[] = [
    ...overlapsAmong(boxes).map(overlap => ({ kind: "collision" as const, text: overlap.a.text, other: overlap.b.text, amount: overlap.area })),
    ...(await truncations(page, LOCAL_MAP.text)).map(cut => ({ kind: "cut" as const, text: cut.text, amount: cut.hidden }))
  ];
  fs.mkdirSync(path.dirname(context.shotPath), { recursive: true });
  await page.screenshot({ path: context.shotPath });
  const card = new Map(extras.cards.map((meta, i) => [i, meta]));
  const outline = extras.colours.outline;
  const surface = outline ? backdrop(outline.layers) : null;
  const url = new URL(page.url());
  return {
    scenario: context.scenario,
    map: context.map,
    address: `${url.pathname}${url.search}`,
    viewport,
    frame: extras.frame,
    picture: extras.picture,
    edgeSigns: extras.edgeSigns,
    scale: picture.scale,
    look: extras.look,
    cards: picture.cards.map((read, i) => ({ id: read.id, box: read.box, subject: card.get(i)?.subject ?? false, pinned: card.get(i)?.pinned ?? false, directory: card.get(i)?.directory ?? null })),
    anchors: extras.anchors,
    wires: picture.wires.map((read, i) => {
      const points: Array<[number, number]> = [];
      for (let k = 0; k + 1 < read.points.length; k += 2) points.push([read.points[k], read.points[k + 1]]);
      return { key: read.key, consumer: read.consumer, provider: read.provider, kind: extras.wires[i].kind, points, providerEnd: read.providerEnd, occludedSamples: read.occludedSamples, foreignLaneSamples: read.foreignLaneSamples, opacity: extras.wires[i].opacity, filter: extras.wires[i].filter };
    }),
    directories: extras.directories,
    lanes: extras.lanes,
    textBoxes: boxes.length,
    textFaults,
    tone: {
      fileName: ratio(extras.colours.fileName),
      symbolName: ratio(extras.colours.symbolName),
      prose: ratio(extras.colours.prose),
      outline: outline && surface ? contrastRatio(parseColour(outline.stroke), surface) : null,
      cardBorder: outline && surface ? contrastRatio(parseColour(outline.border), surface) : null,
      outlineFillAlpha: outline ? parseColour(outline.fill)[3] : null
    },
    consoleErrors: [...context.watch.consoleErrors],
    offSiteRequests: [...context.watch.offSiteRequests],
    screenshot: path.basename(context.shotPath)
  };
}

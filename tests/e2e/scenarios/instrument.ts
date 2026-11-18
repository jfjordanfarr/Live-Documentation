/**
 * The reading instrument: what the settled 2D Local Map says, captured as a `Reading` (`reading.ts`), with a screenshot
 * saved beside it so that an eye can confirm the reading means what it says.
 *
 * It reads the page from outside, as the other instruments do, and reuses them rather than reading the same thing
 * twice: the still-picture instrument's `readPicture` for the wires (sampled paths, which end is the provider's, cards
 * crossed, lanes in a stranger's directory) and the cards' boxes, and the design audit for collisions and cut text. It
 * adds only what neither reads: the frame and its edge signs, each card's state and directory, the dots, the
 * directories' published segments and insets, the lanes, the root's columns, the lines each name is drawn on, and the
 * colours the tone promises are judged by.
 * Kept small on purpose: an instrument that lies makes every judgment lie with it.
 */

import fs from "node:fs";
import path from "node:path";

import type { Page } from "@playwright/test";

import { backdrop, contrastRatio, parseColour } from "../contrast";
import { overlapsAmong, textBoxes, truncations } from "../design-audit";
import { LOCAL_MAP, localMapStill, readPicture } from "../still-picture";

import type { Box, Reading, TextFault } from "./reading";

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
  directories: Reading["directories"];
  lanes: Reading["lanes"];
  rootColumns: Reading["rootColumns"];
  names: Reading["names"];
  raw: Reading["tone"]["colours"];
  colours: {
    fileName: { colour: string; layers: string[] } | null;
    symbolName: { colour: string; layers: string[] } | null;
    prose: { colour: string; layers: string[] } | null;
    outline: { stroke: string; fill: string; border: string; layers: string[] } | null;
  };
}

async function readExtras(page: Page): Promise<Extras> {
  return page.evaluate(({ cardSelector }) => {
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
      // The padding and border the map keeps between a directory's edge and its members, as the renderer publishes it.
      insetPx: Number(band.dataset.inset ?? Number.NaN) * scale
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
    /** Whether an element is drawn: it has a box, and neither it nor an ancestor hides it or fades it out. */
    const shown = (element: Element): boolean => {
      const r = element.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      for (let at: Element | null = element; at; at = at.parentElement) {
        const style = getComputedStyle(at);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
      }
      return true;
    };
    const colourOf = (selectors: string[]): string | null => {
      for (const selector of selectors) {
        const element = [...document.querySelectorAll(selector)].find(shown);
        if (element) return getComputedStyle(element).color;
      }
      return null;
    };
    // Every drawn name and the lines it stands on, read letter by letter from where the browser laid each one.
    const names = [...document.querySelectorAll("#map-container .node-card .local-file-name-text, #map-container .node-card .local-file-name-held, #map-container .node-card .symbol-label-text")]
      .filter(shown)
      .map(element => {
        const lines: string[] = [];
        let top: number | null = null;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        for (let text = walker.nextNode(); text; text = walker.nextNode()) {
          const content = text.textContent ?? "";
          for (let i = 0; i < content.length; i += 1) {
            const range = document.createRange();
            range.setStart(text, i);
            range.setEnd(text, i + 1);
            const rect = range.getClientRects()[0];
            if (!rect) continue;
            if (top === null || Math.abs(rect.top - top) > rect.height / 2) { lines.push(""); top = rect.top; }
            lines[lines.length - 1] += content[i];
          }
        }
        return { text: (element.textContent ?? "").replace(/\s+/gu, " ").trim(), lines: lines.map(line => line.trim()).filter(Boolean) };
      });
    const rootColumns = new Map<number, number>();
    for (const column of document.querySelectorAll(".local-directory-root > .local-column")) {
      const r = column.getBoundingClientRect();
      if (r.width === 0) continue;
      rootColumns.set(Math.round(r.left), Math.min(rootColumns.get(Math.round(r.left)) ?? Infinity, r.top));
    }
    return {
      rootColumns: [...rootColumns].map(([x, top]) => ({ x, top })),
      names,
      raw: {
        fileName: colourOf([`${subject} .local-file-name-held`, `${subject} .local-file-name-text`]),
        symbolName: colourOf([`${subject} .symbol-row:not(.internals-row) .symbol-label-text`]),
        purpose: colourOf([`${subject} .local-reading-purpose .local-reading-prose`]),
        description: colourOf([`${subject} .symbol-row .local-reading-slot[data-reading-open="true"] .local-reading-prose`])
      },
      frame: toBox(signs.getBoundingClientRect()),
      picture: layout ? toBox(layout.getBoundingClientRect()) : null,
      edgeSigns: { above: signs.dataset.above === "true", below: signs.dataset.below === "true", left: signs.dataset.left === "true", right: signs.dataset.right === "true" },
      look: map.dataset.look ?? null,
      cards,
      anchors,
      directories,
      lanes,
      colours: {
        fileName: tone(`${subject} .local-file-name-text`),
        symbolName: tone(`${subject} .symbol-row:not(.internals-row) .symbol-label-text`),
        prose: tone(`${subject} .local-reading-purpose .local-reading-prose`),
        outline: shape && plainCard && band ? { stroke: getComputedStyle(shape).stroke, fill: getComputedStyle(shape).fill, border: getComputedStyle(plainCard).borderTopColor, layers: layers(band) } : null
      }
    };
  }, { cardSelector: LOCAL_MAP.card });
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
  // The instrument does not report what it cannot stand behind: cards read twice must be the same cards, and a
  // directory must say its inset, since a missing one would let every card pass as inside.
  if (extras.cards.length !== picture.cards.length || extras.cards.some((card, i) => card.id !== picture.cards[i].id)) {
    throw new Error("The instrument's two readings of the cards disagree.");
  }
  const silent = extras.directories.filter(directory => !Number.isFinite(directory.insetPx)).map(directory => directory.directory || "the root");
  if (silent.length > 0) throw new Error(`The map publishes no inset for ${silent.join(", ")}.`);
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
    wires: picture.wires.map(read => {
      const points: Array<[number, number]> = [];
      for (let k = 0; k + 1 < read.points.length; k += 2) points.push([read.points[k], read.points[k + 1]]);
      return { key: read.key, consumer: read.consumer, provider: read.provider, kind: read.kind, points, providerEnd: read.providerEnd, occludedSamples: read.occludedSamples, foreignLaneSamples: read.foreignLaneSamples, opacity: read.opacity, filter: read.filter };
    }),
    directories: extras.directories,
    lanes: extras.lanes,
    rootColumns: extras.rootColumns,
    names: extras.names,
    textBoxes: boxes.length,
    textFaults,
    tone: {
      fileName: ratio(extras.colours.fileName),
      symbolName: ratio(extras.colours.symbolName),
      prose: ratio(extras.colours.prose),
      outline: outline && surface ? contrastRatio(parseColour(outline.stroke), surface) : null,
      cardBorder: outline && surface ? contrastRatio(parseColour(outline.border), surface) : null,
      outlineFillAlpha: outline ? parseColour(outline.fill)[3] : null,
      colours: extras.raw
    },
    consoleErrors: [...context.watch.consoleErrors],
    offSiteRequests: [...context.watch.offSiteRequests],
    screenshot: path.basename(context.shotPath)
  };
}

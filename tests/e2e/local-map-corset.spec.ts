import { expect, test, type Page } from "@playwright/test";

import { localMapUrl, localRetainUrl } from "./still-picture";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { LocalMapTuning } from "../../packages/explorer/src/client/types";
import { LACE_PITCH } from "../../packages/explorer/src/client/views/connection-geometry";
import { normalizeSymbolIdentifier } from "../../packages/explorer/src/client/views/symbolAnchors";

/**
 * The French Corset: a file's own references are drawn as laces, one at each
 * pin, that leave the pin, sweep past the card's edge, turn toward the
 * partner's row and come back to be cut flush by the card's edge, as a wire
 * passing behind the card would be. The owner saw two straight stubs of one
 * pin meet as a chevron that read as an arrowhead (2026-10-05, Turn 14), asked
 * for a loop-around shape (Turn 15), and showed with a marked-up picture what
 * "going behind" the card must look like: the return vanishes where the
 * card's border begins (2026-10-07, Turn 14). These tests hold the laces to
 * that picture in both drawers, the selected file's and the retained
 * exploration's, and hold the laces' dials in the tuning panel to the shape
 * they name as they move (2026-10-06, Turn 13: the shape is the owner's to
 * tune by eye).
 */

const FILE = "packages/engine/src/live-docs/adapters/csharp.dependencies.ts";
const GRAPH = "packages/engine/src/live-docs/graph.ts";
const DOCUMENT = "packages/engine/src/live-docs/document.ts";

test.use({ viewport: { width: 1600, height: 1000 } });

interface Point { x: number; y: number }
interface Lace {
  role: "provider" | "consumer";
  file: string;
  symbol: string;
  left: number; right: number; top: number; bottom: number;
  /** Where the lace leaves its pin, between the two sides of its stem, in page pixels. */
  start: Point;
  /** The lace's far end, where the card's edge cuts it, in page pixels. */
  end: Point;
  /** Every point of the lace's outline, in page pixels. */
  points: Point[];
}
interface Pin { file: string; symbol: string; side: "inbound" | "outbound"; x: number; y: number }
interface Card { file: string; left: number; right: number }

/** The laces, pins and cards in page pixels, with the map's scale, by which a page pixel becomes a CSS pixel of the map. */
async function readLaces(page: Page): Promise<{ laces: Lace[]; pins: Pin[]; cards: Card[]; scale: number }> {
  return page.evaluate(() => {
    const scale = new DOMMatrix(getComputedStyle(document.getElementById("map-viewport")!).transform).a || 1;
    const laces = [...document.querySelectorAll<SVGPolygonElement>("#map-connections polygon.self-loop")].map(el => {
      const r = el.getBoundingClientRect();
      const provider = el.classList.contains("self-loop-provider");
      // The outline's points in page pixels: the polygon's own box maps onto its rendered box by one uniform scale.
      const box = el.getBBox();
      const k = r.width / box.width;
      const points = Array.from({ length: el.points.numberOfItems }, (_, i) => el.points.getItem(i)).map(p => ({ x: r.left + (p.x - box.x) * k, y: r.top + (p.y - box.y) * k }));
      // The outline runs out along one side and back along the other, so it starts and ends at the pin and the far end is
      // its middle pair.
      const [a, b] = [points[points.length / 2 - 1], points[points.length / 2]];
      const [first, last] = [points[0], points[points.length - 1]];
      return {
        role: provider ? "provider" as const : "consumer" as const,
        file: provider ? el.dataset.targetId! : el.dataset.sourceId!,
        symbol: provider ? el.dataset.targetSymbol! : el.dataset.sourceSymbol!,
        left: r.left, right: r.right, top: r.top, bottom: r.bottom,
        start: { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 },
        end: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        points
      };
    });
    const pins = [...document.querySelectorAll<HTMLElement>("#map-container .node-card .symbol-anchor")].map(el => {
      const r = el.getBoundingClientRect();
      return {
        file: el.closest<HTMLElement>(".node-card")!.dataset.id!,
        symbol: el.dataset.symbol!,
        side: el.classList.contains("outbound") ? "outbound" as const : "inbound" as const,
        x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2
      };
    });
    const cards = [...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(el => {
      const r = el.getBoundingClientRect();
      return { file: el.dataset.id!, left: r.left, right: r.right };
    });
    return { laces, pins, cards, scale };
  });
}

/**
 * Every lace of the file starts at its pin, sweeps the shape's reach beyond its card's edge, comes back the shape's curl
 * along the edge toward its partner's row, and is cut flush where the card's edge begins; over the card there is only
 * its stem at the pin's row. Returns how many laces the file has.
 */
async function expectLacesCut(page: Page, file: string, shape: Pick<LocalMapTuning, "laceReach" | "laceCurl" | "laceWidth"> = getDefaultTuning().localMap): Promise<number> {
  const { laces, pins, cards, scale } = await readLaces(page);
  const own = laces.filter(lace => lace.file === file);
  expect(own.length, "the file has self-references, drawn as laces").toBeGreaterThan(0);
  expect(own.filter(lace => lace.role === "provider").length, "one lace at each end of every self-reference").toBe(own.filter(lace => lace.role === "consumer").length);
  const card = cards.find(candidate => candidate.file === file);
  expect(card, `the card of ${file}`).toBeDefined();
  for (const lace of own) {
    const side = lace.role === "provider" ? "outbound" : "inbound";
    // Two symbols may share a normalized name (graph.ts's LinkTarget and linkTarget), so of the pins that carry the
    // lace's name, take the one on whose row the lace starts.
    const candidates = pins.filter(candidate => candidate.file === file && candidate.side === side && (normalizeSymbolIdentifier(candidate.symbol) ?? candidate.symbol) === lace.symbol);
    const pin = candidates.sort((a, b) => Math.abs(a.y - lace.start.y) - Math.abs(b.y - lace.start.y))[0];
    expect(pin, `a pin for the ${lace.role} lace of ${lace.symbol}`).toBeDefined();
    const name = `the ${lace.role} lace of ${lace.symbol}`;
    expect(Math.abs(lace.start.y - pin!.y) / scale, `${name} leaves its pin's row`).toBeLessThanOrEqual(0.5);
    const edge = lace.role === "provider" ? card!.right : card!.left;
    const outward = lace.role === "provider" ? 1 : -1;
    expect(Math.abs(lace.end.x - edge) / scale, `${name} is cut flush at the card's edge`).toBeLessThanOrEqual(0.75);
    const curl = Math.abs(lace.end.y - pin!.y) / scale;
    expect(curl, `${name} comes back the curl along the edge`).toBeGreaterThanOrEqual(shape.laceCurl - 1.5);
    expect(curl, `${name} comes back the curl along the edge`).toBeLessThanOrEqual(shape.laceCurl + 1.5);
    // The laces of one pin that turn the same way nest outward by the pitch, so a pin with several reaches as far further.
    const atPin = own.filter(other => other.role === lace.role && other.symbol === lace.symbol).length;
    const reach = (lace.role === "provider" ? lace.right - edge : edge - lace.left) / scale;
    expect(reach, `${name} sweeps the reach beyond the card's edge`).toBeGreaterThanOrEqual(shape.laceReach - 0.75);
    expect(reach, `${name} sweeps the reach beyond the card's edge`).toBeLessThanOrEqual(shape.laceReach + (atPin - 1) * LACE_PITCH + shape.laceWidth / 2 + 0.75);
    const inside = lace.points.filter(point => outward * (point.x - edge) < -0.5 * scale);
    expect(inside.length, `${name} has a stem over the card`).toBeGreaterThan(2);
    for (const point of inside) expect(Math.abs(point.y - pin!.y) / scale, `${name} over the card is only its stem at the pin's row`).toBeLessThanOrEqual(shape.laceWidth / 2 + 1);
    expect(lace.top, `${name} passes its pin's row`).toBeLessThanOrEqual(pin!.y + 2 * scale);
    expect(lace.bottom, `${name} passes its pin's row`).toBeGreaterThanOrEqual(pin!.y - 2 * scale);
  }
  return own.length;
}

test("the selected file's own references are laces that leave a pin, loop past the card's edge and are cut by it", async ({ page }) => {
  await page.goto(localMapUrl("/", FILE));
  await page.waitForSelector(`#map-container .node-card.local-focus[data-id="${FILE}"]`, { timeout: 20_000 });
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 10_000 });
  await expectLacesCut(page, FILE);
});

test("a retained exploration draws the same laces, and two of one pin make a bracket, not an arrowhead", async ({ page }) => {
  await page.goto(localRetainUrl("/", [GRAPH, DOCUMENT]));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 10_000 });
  await page.waitForTimeout(500);
  const count = await expectLacesCut(page, GRAPH);
  // Some row of graph.ts is referred to from more than one other row, so one pin carries several laces, each cut by
  // the card by the check above: a bracket, where straight stubs met as a chevron.
  const { laces } = await readLaces(page);
  const perPin = new Map<string, number>();
  for (const lace of laces.filter(lace => lace.file === GRAPH)) perPin.set(`${lace.role}\0${lace.symbol}`, (perPin.get(`${lace.role}\0${lace.symbol}`) ?? 0) + 1);
  const busiest = [...perPin.entries()].sort((a, b) => b[1] - a[1])[0];
  expect(busiest[1], `the pin with the most laces, ${busiest[0].replace("\0", " ")}`).toBeGreaterThan(1);
  expect(count).toBeGreaterThanOrEqual(busiest[1]);
});

/** Moves a slider of the tuning panel as a person would, firing the input event the panel listens for. */
async function turnDial(page: Page, id: string, value: number): Promise<void> {
  await page.locator(`#${id}`).evaluate((input, next) => {
    const slider = input as HTMLInputElement;
    slider.closest("details")!.open = true;
    slider.value = String(next);
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await page.waitForTimeout(300);
}

test("the laces' dials in Tuning redraw them as they move: the reach sweeps further out, the curl comes back further along the edge, and the cut stays flush", async ({ page }) => {
  await page.goto(localMapUrl("/", FILE));
  await page.waitForSelector(`#map-container .node-card.local-focus[data-id="${FILE}"]`, { timeout: 20_000 });
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 10_000 });
  const defaults = getDefaultTuning().localMap;
  await expectLacesCut(page, FILE, defaults);
  await turnDial(page, "tuning-lace-reach", 32);
  await expectLacesCut(page, FILE, { ...defaults, laceReach: 32 });
  await turnDial(page, "tuning-lace-curl", 24);
  await expectLacesCut(page, FILE, { ...defaults, laceReach: 32, laceCurl: 24 });
  // The dials persist with the rest of the tuning and come back after a reload.
  await page.reload();
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 20_000 });
  await page.waitForTimeout(300);
  expect(await page.locator("#tuning-lace-reach").inputValue()).toBe("32");
  expect(await page.locator("#tuning-lace-curl").inputValue()).toBe("24");
  await expectLacesCut(page, FILE, { ...defaults, laceReach: 32, laceCurl: 24 });
});

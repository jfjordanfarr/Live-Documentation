import { expect, test, type Page } from "@playwright/test";

import { localMapUrl, localRetainUrl } from "./still-picture";
import { normalizeSymbolIdentifier } from "../../packages/explorer/src/client/views/symbolAnchors";

/**
 * The French Corset: a file's own references are drawn as laces, one at each
 * pin, that leave the pin, turn toward the partner's row and return to the
 * card's edge. The owner saw two straight stubs of one pin meet as a chevron
 * that read as an arrowhead (2026-10-05, Turn 14) and asked for a loop-around
 * shape (Turn 15). These tests hold the laces closed on the card in both
 * drawers, the selected file's and the retained exploration's, and the
 * laces' dials in the tuning panel redrawing them as they move (2026-10-06,
 * Turn 13: the shape is the owner's to tune by eye).
 */

const FILE = "packages/engine/src/live-docs/adapters/csharp.dependencies.ts";
const GRAPH = "packages/engine/src/live-docs/graph.ts";
const DOCUMENT = "packages/engine/src/live-docs/document.ts";

test.use({ viewport: { width: 1600, height: 1000 } });

interface Lace { role: "provider" | "consumer"; file: string; symbol: string; left: number; right: number; top: number; bottom: number }
interface Pin { file: string; symbol: string; side: "inbound" | "outbound"; x: number; y: number; diameter: number }

async function readLaces(page: Page): Promise<{ laces: Lace[]; pins: Pin[] }> {
  return page.evaluate(() => {
    const laces = [...document.querySelectorAll<SVGPolygonElement>("#map-connections polygon.self-loop")].map(el => {
      const r = el.getBoundingClientRect();
      const provider = el.classList.contains("self-loop-provider");
      return {
        role: provider ? "provider" as const : "consumer" as const,
        file: provider ? el.dataset.targetId! : el.dataset.sourceId!,
        symbol: provider ? el.dataset.targetSymbol! : el.dataset.sourceSymbol!,
        left: r.left, right: r.right, top: r.top, bottom: r.bottom
      };
    });
    const pins = [...document.querySelectorAll<HTMLElement>("#map-container .node-card .symbol-anchor")].map(el => {
      const r = el.getBoundingClientRect();
      return {
        file: el.closest<HTMLElement>(".node-card")!.dataset.id!,
        symbol: el.dataset.symbol!,
        side: el.classList.contains("outbound") ? "outbound" as const : "inbound" as const,
        x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, diameter: r.width
      };
    });
    return { laces, pins };
  });
}

/** Every lace starts at its pin, reaches out a little way, and comes back to the card's edge at the pin's own x. */
async function expectLacesClosed(page: Page, file: string): Promise<number> {
  const { laces, pins } = await readLaces(page);
  const own = laces.filter(lace => lace.file === file);
  expect(own.length, "the file has self-references, drawn as laces").toBeGreaterThan(0);
  expect(own.filter(lace => lace.role === "provider").length, "one lace at each end of every self-reference").toBe(own.filter(lace => lace.role === "consumer").length);
  for (const lace of own) {
    const side = lace.role === "provider" ? "outbound" : "inbound";
    // Two symbols may share a normalized name (graph.ts's LinkTarget and linkTarget), so of the pins that carry the
    // lace's name, take the one whose row the lace passes.
    const candidates = pins.filter(candidate => candidate.file === file && candidate.side === side && (normalizeSymbolIdentifier(candidate.symbol) ?? candidate.symbol) === lace.symbol);
    const pin = candidates.sort((a, b) => Math.abs(a.y - (lace.top + lace.bottom) / 2) - Math.abs(b.y - (lace.top + lace.bottom) / 2))[0];
    expect(pin, `a pin for the ${lace.role} lace of ${lace.symbol}`).toBeDefined();
    // Pins are drawn 12 CSS px across; the rendered diameter gives the map's scale.
    const scale = pin!.diameter / 12;
    const reach = lace.role === "provider" ? (lace.right - pin!.x) / scale : (pin!.x - lace.left) / scale;
    const closed = lace.role === "provider" ? Math.abs(lace.left - pin!.x) / scale : Math.abs(lace.right - pin!.x) / scale;
    expect(closed, `the ${lace.role} lace of ${lace.symbol} returns to the card's edge at its pin`).toBeLessThanOrEqual(2);
    expect(reach, `the ${lace.role} lace of ${lace.symbol} reaches out past the pin`).toBeGreaterThan(12);
    expect(reach, `the ${lace.role} lace of ${lace.symbol} stays near its card`).toBeLessThan(45);
    expect(lace.top, `the ${lace.role} lace of ${lace.symbol} passes its pin's row`).toBeLessThanOrEqual(pin!.y + 2 * scale);
    expect(lace.bottom, `the ${lace.role} lace of ${lace.symbol} passes its pin's row`).toBeGreaterThanOrEqual(pin!.y - 2 * scale);
    expect((lace.bottom - lace.top) / scale, `the ${lace.role} lace of ${lace.symbol} turns along the edge, not into the open`).toBeLessThan(40);
  }
  return own.length;
}

test("the selected file's own references are laces that leave a pin and close on the card's edge", async ({ page }) => {
  await page.goto(localMapUrl("/", FILE));
  await page.waitForSelector(`#map-container .node-card.local-focus[data-id="${FILE}"]`, { timeout: 20_000 });
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 10_000 });
  await expectLacesClosed(page, FILE);
});

test("a retained exploration draws the same laces, and two of one pin make a bracket, not an arrowhead", async ({ page }) => {
  await page.goto(localRetainUrl("/", [GRAPH, DOCUMENT]));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 10_000 });
  await page.waitForTimeout(500);
  const count = await expectLacesClosed(page, GRAPH);
  // Some row of graph.ts is referred to from more than one other row, so one pin carries several laces, each closed
  // on the card by the check above: a bracket, where straight stubs met as a chevron.
  const { laces } = await readLaces(page);
  const perPin = new Map<string, number>();
  for (const lace of laces.filter(lace => lace.file === GRAPH)) perPin.set(`${lace.role}\0${lace.symbol}`, (perPin.get(`${lace.role}\0${lace.symbol}`) ?? 0) + 1);
  const busiest = [...perPin.entries()].sort((a, b) => b[1] - a[1])[0];
  expect(busiest[1], `the pin with the most laces, ${busiest[0].replace("\0", " ")}`).toBeGreaterThan(1);
  expect(count).toBeGreaterThanOrEqual(busiest[1]);
});

/** Every lace of the file with how far it reaches out from its pin and where its far end lies, at the map's scale. */
async function laceReaches(page: Page, file: string): Promise<Array<{ reach: number; farX: number }>> {
  const { laces, pins } = await readLaces(page);
  const scale = (pins[0]?.diameter ?? 12) / 12;
  return laces.filter(lace => lace.file === file).map(lace => {
    const side = lace.role === "provider" ? "outbound" : "inbound";
    const pin = pins.filter(candidate => candidate.file === file && candidate.side === side && (normalizeSymbolIdentifier(candidate.symbol) ?? candidate.symbol) === lace.symbol)
      .sort((a, b) => Math.abs(a.y - (lace.top + lace.bottom) / 2) - Math.abs(b.y - (lace.top + lace.bottom) / 2))[0];
    return lace.role === "provider"
      ? { reach: (lace.right - pin.x) / scale, farX: (pin.x - lace.left) / scale }
      : { reach: (pin.x - lace.left) / scale, farX: (lace.right - pin.x) / scale };
  });
}

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

test("the laces' dials in Tuning redraw them as they move: the reach sweeps further out, the inset dives further under the card", async ({ page }) => {
  await page.goto(localMapUrl("/", FILE));
  await page.waitForSelector(`#map-container .node-card.local-focus[data-id="${FILE}"]`, { timeout: 20_000 });
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 10_000 });
  const before = await laceReaches(page, FILE);
  expect(before.length).toBeGreaterThan(0);
  // On the edge by default: the far end stands at the pin's own x, within a hairline.
  for (const lace of before) expect(Math.abs(lace.farX)).toBeLessThanOrEqual(2);
  await turnDial(page, "tuning-lace-reach", 32);
  const reached = await laceReaches(page, FILE);
  expect(reached.length).toBe(before.length);
  for (let i = 0; i < before.length; i++) expect(reached[i].reach, "a lace reaches further out with the dial").toBeGreaterThan(before[i].reach + 10);
  await turnDial(page, "tuning-lace-inset", 8);
  const inset = await laceReaches(page, FILE);
  for (const lace of inset) {
    expect(lace.farX, "a lace ends further inside the card with the inset").toBeGreaterThanOrEqual(6);
    expect(lace.farX).toBeLessThanOrEqual(10);
  }
  // The dials persist with the rest of the tuning and come back after a reload.
  await page.reload();
  await page.waitForSelector("#map-connections polygon.self-loop", { timeout: 20_000 });
  await page.waitForTimeout(300);
  expect(await page.locator("#tuning-lace-reach").inputValue()).toBe("32");
  expect(await page.locator("#tuning-lace-inset").inputValue()).toBe("8");
  for (const lace of await laceReaches(page, FILE)) expect(lace.farX).toBeGreaterThanOrEqual(6);
});

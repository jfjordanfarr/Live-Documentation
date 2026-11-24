import { expect, test, type Page } from "@playwright/test";

import type { LiveDocGraph } from "../../packages/engine/src/live-docs/graph";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { UnconnectedRows } from "../../packages/explorer/src/client/types";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { arriveAtReadingSize, AT_READING_SIZE, LOCAL_MAP, localMapStill } from "./still-picture";

/**
 * Tuning → 2D Layout → Unconnected (default Folded since 2026-11-24; trial 2026-11-23 on the owner's "holy moly"
 * before a card of 138 unwired rows): what a card pinned whole does with the rows of symbols no reference of the graph
 * touches. Read on the estate sample's payments controller, which has rows of both kinds, so that neither a card with
 * nothing to fold nor one with nothing left passes.
 */
const BASE = "/samples/estate/";
const FILE = "Gateway/Controllers/PaymentsController.cs";

test.use({ viewport: { width: 1440, height: 900 } });

/**
 * The oracle: the file's symbols that no edge of the engine's graph touches, read from the bundle's graph itself rather
 * than the Explorer's projection of it. A symbol is touched when an edge of another file names it as its target, when
 * an edge of its own carries it to another file, or when a reference ties it to another symbol of its file, by a link to
 * the file itself or by a bare type name that is the name of one of its symbols.
 */
async function oracle(page: Page): Promise<{ connected: string[]; unconnected: string[] }> {
  const bundle = (await (await page.request.get(`${BASE}explorer-data.json`)).json()) as StaticExplorerData;
  const graph = bundle.graph as LiveDocGraph;
  const file = graph.files[FILE];
  // An edge names a symbol by its slug, so the oracle reads only a file whose every symbol has one.
  expect(file.symbols.every(symbol => symbol.slug !== undefined), "every symbol of the file has a slug").toBe(true);
  const symbols = file.symbols.map(symbol => ({ ...symbol, slug: symbol.slug ?? "" }));
  const touched = new Set<string>();
  for (const other of Object.values(graph.files)) {
    for (const edge of other.edges) {
      if (edge.to === FILE && edge.toSymbol && other.codePath !== FILE) touched.add(edge.toSymbol);
    }
  }
  const names = new Set(file.symbols.map(symbol => symbol.name));
  for (const edge of file.edges) {
    if (edge.from && edge.to) touched.add(edge.from);
    if (edge.to === FILE && edge.toSymbol) touched.add(edge.toSymbol);
  }
  const slugOf = new Map(symbols.map(symbol => [symbol.name, symbol.slug]));
  for (const symbol of symbols) {
    for (const line of symbol.references) {
      const types = line.role === "Parameters" ? line.parameters.flatMap(parameter => parameter.types) : line.types;
      for (const type of types) {
        if (type.link || !names.has(type.name)) continue;
        touched.add(symbol.slug);
        touched.add(slugOf.get(type.name)!);
      }
    }
  }
  const connected = symbols.filter(symbol => touched.has(symbol.slug)).map(symbol => symbol.name);
  const unconnected = symbols.filter(symbol => !touched.has(symbol.slug)).map(symbol => symbol.name);
  // Every case reads the oracle, so none passes on a file with nothing to fold or nothing left.
  expect(connected.length, "connected rows").toBeGreaterThan(0);
  expect(unconnected.length, "unconnected rows").toBeGreaterThan(0);
  return { connected, unconnected };
}

/**
 * The address with the file pinned whole and its subject, the lever carried by the link when it is not its default.
 */
const address = (unconnected?: UnconnectedRows): string => `${BASE}?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, selectedNodeId: FILE, pinSet: { entries: [{ nodeId: FILE, symbol: "*" }] },
  ...(unconnected ? { layout: { localMap: { ...AT_READING_SIZE, unconnected } } } : null)
})}`;

const card = (page: Page) => page.locator(`#map-container .node-card[data-id="${FILE}"]`);

/** The card's symbol rows that are drawn, Internals aside, by name, and those of them drawn faded. */
async function rows(page: Page): Promise<{ drawn: string[]; faded: string[] }> {
  return card(page).evaluate(element => {
    const shown = [...element.querySelectorAll<HTMLElement>(".symbol-row:not(.internals-row)")]
      .filter(row => !row.classList.contains("branch-symbol-hidden") && [...row.children].some(child => (child as HTMLElement).getClientRects().length));
    return {
      drawn: shown.map(row => row.dataset.symbol!).sort(),
      faded: shown.filter(row => row.classList.contains("branch-symbol-muted")
        && Number(getComputedStyle(row.querySelector(".symbol-label-wrapper")!).opacity) < 1).map(row => row.dataset.symbol!).sort()
    };
  });
}

const count = (page: Page) => card(page).locator(":scope > button.local-disclosure:not(.local-back-references):not([data-outside])");

async function open(page: Page, unconnected?: UnconnectedRows): Promise<void> {
  await arriveAtReadingSize(page);
  await page.goto(address(unconnected));
  await card(page).waitFor();
  await localMapStill(page);
}

test("Folded, the default, draws only the connected rows, counts the rest truly, and expands and refolds cleanly by keyboard", async ({ page }) => {
  await open(page);
  const { connected, unconnected } = await oracle(page);
  const plural = unconnected.length === 1 ? "" : "s";
  expect((await rows(page)).drawn).toEqual([...connected].sort());
  await expect(count(page)).toHaveText(`+${unconnected.length}\u00a0symbol${plural}`);
  // Expanding by keyboard reveals every row and turns the foot button into its reversible inverse with focus kept.
  await count(page).focus();
  await page.keyboard.press("Enter");
  await localMapStill(page);
  expect((await rows(page)).drawn).toEqual([...connected, ...unconnected].sort());
  await expect(count(page)).toHaveText(`\u2212${unconnected.length}\u00a0symbol${plural}`);
  await expect(count(page)).toHaveAttribute("aria-label", `Fold ${unconnected.length}\u00a0symbol${plural}`);
  await expect(count(page)).toBeFocused();
  // Pressing Enter again refolds back to only the connected rows and restores "+N symbols" with focus kept.
  await page.keyboard.press("Enter");
  await localMapStill(page);
  expect((await rows(page)).drawn).toEqual([...connected].sort());
  await expect(count(page)).toHaveText(`+${unconnected.length}\u00a0symbol${plural}`);
  await expect(count(page)).toBeFocused();
});

test("Shown draws every row of the card pinned whole, none faded and none counted", async ({ page }) => {
  await open(page, "shown");
  const { connected, unconnected } = await oracle(page);
  const { drawn, faded } = await rows(page);
  expect(drawn).toEqual([...connected, ...unconnected].sort());
  expect(faded).toEqual([]);
  await expect(count(page)).toHaveCount(0);
});

test("Dimmed keeps every row and fades exactly the unconnected ones", async ({ page }) => {
  await open(page, "dimmed");
  const { connected, unconnected } = await oracle(page);
  const { drawn, faded } = await rows(page);
  expect(drawn).toEqual([...connected, ...unconnected].sort());
  expect(faded).toEqual([...unconnected].sort());
  await expect(count(page)).toHaveCount(0);
});

test("on the owner's 138-symbol file at default pull-back, +138 symbols stands visible and clear of Internals, expands, and refolds", async ({ page }) => {
  const owners = "tests/integration/programs/powershell/rollout/expected/powershell-ast.json";
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: owners, pinSet: { entries: [{ nodeId: owners, symbol: "*" }] } })}`);
  const ownerCard = page.locator(`#map-container .node-card[data-id="${owners}"]`);
  await ownerCard.waitFor();
  await localMapStill(page);
  const disclosure = ownerCard.locator(":scope > button.local-disclosure[data-symbol-disclosure]");
  await expect(disclosure).toBeVisible();
  await expect(disclosure).toHaveText("+138\u00a0symbols");
  // The count stands clear below Internals' dashed box with zero collision, even at the connections look.
  const geometry = await ownerCard.evaluate(element => {
    const internals = element.querySelector<HTMLElement>(".internals-row .internals-label")!;
    const button = element.querySelector<HTMLElement>(":scope > button.local-disclosure[data-symbol-disclosure]")!;
    const after = getComputedStyle(internals, "::after");
    const iRect = internals.getBoundingClientRect();
    const bRect = button.getBoundingClientRect();
    const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
    const afterH = parseFloat(after.height);
    const internalsBottom = Number.isFinite(afterH) && afterH > 0 ? iRect.top + (afterH - 1) * k : iRect.bottom;
    return {
      look: document.querySelector<HTMLElement>("#map-container")?.dataset.look ?? null,
      visibility: getComputedStyle(button).visibility,
      opacity: Number(getComputedStyle(button).opacity),
      internalsBottom,
      buttonTop: bRect.top
    };
  });
  expect(geometry.visibility).toBe("visible");
  expect(geometry.opacity).toBe(1);
  expect(geometry.buttonTop, `button top ${geometry.buttonTop} vs Internals bottom ${geometry.internalsBottom} (${geometry.look})`).toBeGreaterThan(geometry.internalsBottom);

  /** Capture camera transform, owner card top, disclosure screen size, and neighbour visibility inside the viewport. */
  const snapshotView = () => page.evaluate(id => {
    const view = document.querySelector("#view-map")!.getBoundingClientRect();
    const matrix = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform);
    const cardEl = document.querySelector<HTMLElement>(`#map-container .node-card[data-id="${CSS.escape(id)}"]`)!;
    const btn = cardEl.querySelector<HTMLElement>(":scope > button.local-disclosure[data-symbol-disclosure]")!;
    const cardRect = cardEl.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const neighbours = [...document.querySelectorAll<HTMLElement>("#map-container .node-card")]
      .filter(el => el.dataset.id !== id)
      .map(el => {
        const r = el.getBoundingClientRect();
        const inView = r.right > view.left && r.left < view.right && r.bottom > view.top && r.top < view.bottom;
        const whollyInView = r.left >= view.left && r.right <= view.right && r.top >= view.top && r.bottom <= view.bottom;
        return { id: el.dataset.id!, top: r.top, bottom: r.bottom, inView, whollyInView };
      });
    return {
      k: matrix.a, x: matrix.e, y: matrix.f,
      cardTop: cardRect.top,
      buttonTop: btnRect.top,
      buttonBottom: btnRect.bottom,
      buttonHeight: btnRect.height,
      viewTop: view.top,
      viewBottom: view.bottom,
      neighbours
    };
  }, owners);

  const before = await snapshotView();
  expect(before.neighbours.length, "neighbour cards rendered").toBeGreaterThanOrEqual(5);
  expect(before.neighbours.every(n => n.inView), "all neighbours start in view").toBe(true);

  // Pressing +138 symbols reveals all 138 rows in place without zooming out, keeps the card title anchored where
  // pressed, and draws −138 symbols inside the viewport at the same screen scale as +138 symbols.
  await disclosure.click();
  await localMapStill(page);
  await expect(ownerCard.locator(".symbol-row:not(.internals-row):not(.branch-symbol-hidden)")).toHaveCount(138);
  await expect(disclosure).toHaveText("\u2212138\u00a0symbols");
  const expanded = await snapshotView();
  expect(expanded.k, "expand keeps camera scale steady").toBeCloseTo(before.k, 3);
  expect(Math.abs(expanded.cardTop - before.cardTop), "expand anchors card title vertically").toBeLessThan(2);
  expect(expanded.buttonTop, "−138 symbols stands inside viewport").toBeGreaterThanOrEqual(expanded.viewTop);
  expect(expanded.buttonBottom, "−138 symbols stays above viewport bottom").toBeLessThanOrEqual(expanded.viewBottom);
  expect(Math.abs(expanded.buttonHeight - before.buttonHeight), "−138 symbols matches +138 symbols screen height").toBeLessThan(2);

  // Pressing −138 symbols folds the rows back and returns cleanly to the pre-expand camera and neighbourhood framing.
  await disclosure.click();
  await localMapStill(page);
  await expect(ownerCard.locator(".symbol-row:not(.internals-row):not(.branch-symbol-hidden)")).toHaveCount(0);
  await expect(disclosure).toHaveText("+138\u00a0symbols");
  const refolded = await snapshotView();
  expect(refolded.k, "refold keeps camera scale steady").toBeCloseTo(before.k, 3);
  expect(Math.abs(refolded.x - before.x), "refold restores camera x").toBeLessThan(2);
  expect(Math.abs(refolded.y - before.y), "refold restores camera y").toBeLessThan(2);
  expect(Math.abs(refolded.cardTop - before.cardTop), "refold keeps card title anchored").toBeLessThan(2);
  expect(refolded.neighbours.every(n => n.inView), "all neighbours remain in view after refold").toBe(true);
  for (const name of ["Logging.ps1", "Settings.ps1"]) {
    const start = before.neighbours.find(n => n.id.endsWith(name));
    const end = refolded.neighbours.find(n => n.id.endsWith(name));
    expect(end, `${name} rendered`).toBeTruthy();
    expect(end!.top, `${name} stays below top of viewport`).toBeGreaterThanOrEqual(refolded.viewTop);
    expect(Math.abs(end!.top - start!.top), `${name} returns to its pre-expand vertical position`).toBeLessThan(2);
  }
});

/**
 * The design audit's rules over the owner's own picture: the PowerShell sample's parse, pinned whole in this repository's
 * map, a card of 138 rows none of which is wired, at the arrival that ships. Folded draws no fault (with "+138 symbols"
 * visible). Dimmed draws no fault that Shown does not: on 2026-11-23 Shown had 72 of the card's long row names cut at
 * the arrival's pull-back, which is the card's own matter and not this lever's; this case holds that fading adds none.
 */
test("on the owner's file Folded draws no text that collides or is cut, and Dimmed adds no such fault to Shown's", async ({ page }) => {
  const owners = "tests/integration/programs/powershell/rollout/expected/powershell-ast.json";
  const faults: Record<string, string[]> = {};
  for (const unconnected of ["shown", "dimmed", "folded"] as const) {
    await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: owners, pinSet: { entries: [{ nodeId: owners, symbol: "*" }] }, layout: { localMap: { unconnected } } })}`);
    await page.locator(`#map-container .node-card[data-id="${owners}"]`).waitFor();
    await localMapStill(page);
    const texts = await textBoxes(page, LOCAL_MAP.text), overlaps = overlapsAmong(texts), cut = await truncations(page, LOCAL_MAP.text);
    faults[unconnected] = overlaps.length + cut.length ? describeFaults(overlaps, cut).split("\n").sort() : [];
  }
  expect(faults.folded, faults.folded.join("\n")).toEqual([]);
  expect(faults.dimmed.filter(fault => !faults.shown.includes(fault)), "faults Dimmed adds to Shown").toEqual([]);
});

test("the lever's value rides the share link, chosen in the panel and opened from the link in a fresh page", async ({ page, browser, baseURL }) => {
  await open(page);
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  await expect(page.locator("#tuning-unconnected")).toHaveValue("folded");
  await page.locator("#tuning-unconnected").selectOption("shown");
  await localMapStill(page);
  const { connected, unconnected } = await oracle(page);
  expect((await rows(page)).drawn).toEqual([...connected, ...unconnected].sort());
  await expect.poll(() => decompressSnapshot(new URL(page.url()).searchParams.get("s")!).layout?.localMap?.unconnected).toBe("shown");
  // A stranger's page, with no tuning of its own, opens the link in Shown.
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  const fresh = await context.newPage();
  await arriveAtReadingSize(fresh);
  await fresh.goto(page.url());
  await card(fresh).waitFor();
  await localMapStill(fresh);
  expect((await rows(fresh)).drawn).toEqual([...connected, ...unconnected].sort());
  await fresh.getByRole("button", { name: /^Layout tuning/ }).click();
  await expect(fresh.locator("#tuning-unconnected")).toHaveValue("shown");
  await context.close();
});

test("opening the Reader drawer keeps zoom controls in the bottom bar when wide and lifts them when narrow", async ({ page }) => {
  const file = "packages/engine/src/live-docs/archetype.ts";
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: file, inspection: { kind: "file", nodeId: file } })}`);
  await page.locator("#detail-panel.visible").waitFor();
  await localMapStill(page);
  // At 1440x900 (#main ~1180px wide), #controls and .pin-tray sit in the bottom bar beside .perspective-controls.
  const wide = await page.evaluate(() => {
    const controls = document.querySelector("#controls")!.getBoundingClientRect();
    const toolbar = document.querySelector(".perspective-controls")!.getBoundingClientRect();
    const tray = document.querySelector(".pin-tray-toggle")!.getBoundingClientRect();
    const reader = document.querySelector("#detail-panel")!.getBoundingClientRect();
    return { controls, toolbar, tray, reader };
  });
  expect(Math.abs(wide.controls.bottom - wide.toolbar.bottom), "controls align on the bottom bar").toBeLessThanOrEqual(6);
  expect(wide.controls.right, "controls clear of toolbar").toBeLessThan(wide.toolbar.left - 8);
  expect(wide.toolbar.right, "toolbar clear of pin tray").toBeLessThan(wide.tray.left - 8);
  expect(wide.tray.right, "pin tray clear of reader").toBeLessThan(wide.reader.left - 4);
  // At 1024x900 (#main ~764px wide), #controls and .pin-tray lift cleanly above .perspective-controls without overlap.
  await page.setViewportSize({ width: 1024, height: 900 });
  const narrow = await page.evaluate(() => {
    const controls = document.querySelector("#controls")!.getBoundingClientRect();
    const toolbar = document.querySelector(".perspective-controls")!.getBoundingClientRect();
    const tray = document.querySelector(".pin-tray-toggle")!.getBoundingClientRect();
    return { controls, toolbar, tray };
  });
  expect(narrow.controls.bottom, "controls lifted above toolbar when narrow").toBeLessThan(narrow.toolbar.top);
  expect(narrow.tray.bottom, "pin tray lifted above toolbar when narrow").toBeLessThan(narrow.toolbar.top);
});

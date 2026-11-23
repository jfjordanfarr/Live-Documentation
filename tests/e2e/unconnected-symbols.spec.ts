import { expect, test, type Page } from "@playwright/test";

import type { LiveDocGraph } from "../../packages/engine/src/live-docs/graph";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { UnconnectedRows } from "../../packages/explorer/src/client/types";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { arriveAtReadingSize, AT_READING_SIZE, LOCAL_MAP, localMapStill } from "./still-picture";

/**
 * Tuning → 2D Layout → Unconnected (a trial of 2026-11-23, the owner's "holy moly" before a card of dozens of unwired
 * rows): what a card pinned whole does with the rows of symbols no reference of the graph touches. Read on the estate
 * sample's payments controller, which has rows of both kinds, so that neither a card with nothing to fold nor one with
 * nothing left passes.
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
 * The address with the file pinned whole and its subject, the lever carried by the link when it is not its default. A
 * link that carries any of the map's tuning carries all of it, so the arrival held at reading size goes with the lever:
 * with the lever alone the page arrived at the pull-back that ships, where a folded card has no room to write its count,
 * and the press of the count met nothing (the sixth landing of 2026-11-23, and a probe that read the count not drawn).
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

test("Shown, the default, draws every row of the card pinned whole, none faded and none counted", async ({ page }) => {
  await open(page);
  const { connected, unconnected } = await oracle(page);
  const { drawn, faded } = await rows(page);
  expect(drawn).toEqual([...connected, ...unconnected].sort());
  expect(faded).toEqual([]);
  await expect(count(page)).toHaveCount(0);
});

test("Folded draws only the connected rows, counts the rest truly, and the count's press shows them", async ({ page }) => {
  await open(page, "folded");
  const { connected, unconnected } = await oracle(page);
  expect((await rows(page)).drawn).toEqual([...connected].sort());
  await expect(count(page)).toHaveText(`+${unconnected.length} symbol${unconnected.length === 1 ? "" : "s"}`);
  // The press is the count's own: a button the keyboard reaches and presses.
  await count(page).focus();
  await page.keyboard.press("Enter");
  await localMapStill(page);
  expect((await rows(page)).drawn).toEqual([...connected, ...unconnected].sort());
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

/**
 * The design audit's rules over the owner's own picture: the PowerShell sample's parse, pinned whole in this repository's
 * map, a card of 138 rows none of which is wired, at the arrival that ships. Folded draws no fault. Dimmed draws no fault
 * that Shown does not: on 2026-11-23 Shown, today's picture, had 72 of the card's long row names cut at the arrival's
 * pull-back (for example "files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:Power…", by 140 px), which is the card's
 * own matter and not this lever's; this case holds that fading the rows adds none.
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
  await page.locator("#tuning-unconnected").selectOption("folded");
  await localMapStill(page);
  const { connected } = await oracle(page);
  expect((await rows(page)).drawn).toEqual([...connected].sort());
  await expect.poll(() => decompressSnapshot(new URL(page.url()).searchParams.get("s")!).layout?.localMap?.unconnected).toBe("folded");
  // A stranger's page, with no tuning of its own, opens the link in Folded.
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  const fresh = await context.newPage();
  await arriveAtReadingSize(fresh);
  await fresh.goto(page.url());
  await card(fresh).waitFor();
  await localMapStill(fresh);
  expect((await rows(fresh)).drawn).toEqual([...connected].sort());
  await fresh.getByRole("button", { name: /^Layout tuning/ }).click();
  await expect(fresh.locator("#tuning-unconnected")).toHaveValue("folded");
  await context.close();
});

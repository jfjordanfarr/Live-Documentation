/**
 * The high-precision pass: a configuration rendered by the page itself, with
 * the tuning seeded into the Explorer's storage, and read with the deck's own
 * instrument, beside the lab's numbers for it.
 *
 * @module layout-lab/verify
 */
import { chromium } from "@playwright/test";

import type { LabConfig } from "./evaluate";
import { admitCompiledFunctions, ORIGIN, serveBundle, type ScopeRun } from "./scopes";
import type { Signals } from "./signals";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";
import { displayNames, LOCAL_MAP, localRetainUrl, readPicture, scoreExpanded, scoreForeign, scoreLength, symbolCounts } from "../../tests/e2e/still-picture";

/** What the page showed for a configuration, read by the deck's instrument. */
export interface Verification {
  lengthPx: number;
  horizontalPx: number;
  verticalPx: number;
  spots: number;
  foreignSamples: number;
  pictureWidth: number;
  pictureHeight: number;
  placementCost: number;
  scale: number;
}

/** Renders a configuration in the page with the tuning seeded and reads it with the deck's instrument. */
export async function verifyConfig(run: ScopeRun, graph: ExplorerGraphPayload, config: LabConfig, shot?: string): Promise<Verification> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: 1, tuning: { localMap: config } }) });
    await serveBundle(page);
    await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
    await page.waitForSelector("#map-container .branch-mode", { timeout: 30_000 });
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
    await page.waitForTimeout(600);
    await admitCompiledFunctions(page);
    const picture = await readPicture(page, LOCAL_MAP, displayNames(graph, graph.nodes.map(node => node.id)));
    const length = scoreLength(picture);
    const expanded = scoreExpanded(picture, symbolCounts(graph));
    const foreign = scoreForeign(picture);
    const root = await page.evaluate(() => { const el = document.querySelector<HTMLElement>("#map-container .local-placed"); return { cost: Number(el?.dataset.placementCost), width: parseFloat(el?.style.width ?? "0"), height: parseFloat(el?.style.height ?? "0") }; });
    if (shot) await page.screenshot({ path: shot });
    return { lengthPx: length.totalPx, horizontalPx: length.horizontalPx, verticalPx: length.verticalPx, spots: expanded.crossings.spots ?? 0, foreignSamples: foreign.foreignSamples, pictureWidth: root.width, pictureHeight: root.height, placementCost: root.cost, scale: picture.scale };
  } finally {
    await browser.close();
  }
}

/** The lab's and the page's numbers side by side. */
export function compareTable(lab: Signals, page: Verification): string {
  const row = (name: string, a: number, b: number): string => `| ${name} | ${Math.round(a).toLocaleString("en-US")} | ${Math.round(b).toLocaleString("en-US")} | ${b === 0 ? "n/a" : `${(((a - b) / b) * 100).toFixed(1)}%`} |`;
  return [
    "| Signal | Lab | Page (deck) | Lab vs page |",
    "| --- | ---: | ---: | ---: |",
    row("Length px", lab.lengthPx, page.lengthPx),
    row("Horizontal px", lab.horizontalPx, page.horizontalPx),
    row("Vertical px", lab.verticalPx, page.verticalPx),
    row("Crossing spots", lab.crossings.spots, page.spots),
    row("Foreign samples", lab.foreignSamples, page.foreignSamples),
    row("Picture width", lab.pictureWidth, page.pictureWidth),
    row("Picture height", lab.pictureHeight, page.pictureHeight),
    row("Placement measure", lab.placementCost, page.placementCost)
  ].join("\n");
}

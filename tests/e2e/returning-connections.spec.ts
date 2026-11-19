import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { explorerGraphOf } from "../../packages/explorer/src/shared/graph";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import { localMapStill } from "./still-picture";

/**
 * A cycle's returning connection on the 2D Local Map, in the picture the owner sent on 2026-11-19 (Turn 23 of the
 * November 18 record): the estate sample with the directories PaymentService and PaymentService/Data opened, in Flow,
 * the cards' rows shown. The cycle is PaymentService.cs to PaymentsContext.cs to App.config and back; its return,
 * App.config's use of PaymentService.cs, runs against the left-to-right order and is drawn as two laces. Half of ten
 * blind testers read each lace as a file linking to itself, and the owner, pointing at a row, found that its wires did
 * not stay lit: in Flow every wire between two cards of an opened directory is a pair line between the files' hubs, and
 * a row's hover claimed none, so it faded them all.
 *
 * What a row's hover keeps is read from an oracle apart from the page: the graph's own links, from the bundle's data,
 * say which files a row's links join, and so which drawn things carry them.
 */
const SERVICE = "PaymentService/PaymentService.cs";
const CONFIG = "PaymentService/App.config";
const OWNER = `/samples/estate/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", openDirectories: new Set(["PaymentService", "PaymentService/Data"])
})}`;

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

/** The opacity of a wire at rest, the stylesheet's, which a hover leaves to what it keeps. */
const REST = 0.7;

/** The graph's links of the estate sample, from the bundle's data: who uses whom, from which row to which. */
function estateLinks(): Array<{ source: string; target: string; sourceSymbol: string; targetSymbol: string }> {
  const data = JSON.parse(readFileSync("dist/explorer/samples/estate/explorer-data.json", "utf8")) as StaticExplorerData;
  const id = (end: unknown): string => (typeof end === "string" ? end : (end as { id: string }).id);
  return explorerGraphOf(data.graph).links.map(link => ({
    source: id(link.source), target: id(link.target), sourceSymbol: link.sourceSymbol || "__internals__", targetSymbol: link.targetSymbol || "__internals__"
  }));
}

/** Opens the owner's picture at rest, with its two cycle cards' rows shown as the owner had them, or as it arrives. */
async function ownerPicture(page: Page, rows = true): Promise<void> {
  await page.goto(OWNER);
  await page.locator(`.node-card[data-id="${SERVICE}"]`).waitFor();
  await localMapStill(page);
  for (const file of rows ? [CONFIG, SERVICE] : []) {
    const more = page.locator(`.node-card[data-id="${file}"] > button.local-disclosure:not(.local-reveal-connections):not(.local-back-references)`);
    if (await more.count()) {
      await more.evaluate(element => (element as HTMLElement).click());
      await localMapStill(page);
    }
  }
  await page.mouse.move(1430, 890);
}

/** Every drawn wire, line and lace: its two files, whether it is a return's lace or route, and its opacity once a fade has ended. */
async function drawn(page: Page) {
  await page.waitForTimeout(250);
  return page.locator("#map-connections .connection-path:not(.bundle-run)").evaluateAll(elements => elements
    .filter(element => getComputedStyle(element).display !== "none")
    .map(element => ({
      pair: `${(element as SVGElement).dataset.sourceId} uses ${(element as SVGElement).dataset.targetId}`,
      what: element.classList.contains("back-route") ? "route" : element.tagName === "polygon" ? "lace" : "wire",
      opacity: Number(getComputedStyle(element).opacity)
    })));
}

test("in the owner's picture a hovered row keeps every drawn thing that carries one of its links and fades the rest", async ({ page }) => {
  test.setTimeout(90_000);
  const links = estateLinks();
  await ownerPicture(page);
  const rest = await drawn(page);
  expect(rest.length, "the picture draws its lines").toBeGreaterThan(3);
  expect(rest.filter(each => each.what === "lace").map(each => each.pair), "the cycle's return is two laces")
    .toEqual([`${CONFIG} uses ${SERVICE}`, `${CONFIG} uses ${SERVICE}`]);
  // PaymentService.cs's row PaymentService is what App.config's return reaches; App.config's Internals is where it
  // leaves; PaymentsDb is used by PaymentsContext.cs; Estate.Payments.PaymentService carries no link at all.
  for (const [file, symbol] of [[SERVICE, "PaymentService"], [CONFIG, "__internals__"], [CONFIG, "PaymentsDb"], [CONFIG, "Estate.Payments.PaymentService"]]) {
    const own = new Set(links.filter(link => (link.source === file && link.sourceSymbol === symbol) || (link.target === file && link.targetSymbol === symbol))
      .map(link => `${link.source} uses ${link.target}`));
    await page.locator(`.node-card[data-id="${file}"] .symbol-row[data-symbol="${symbol}"] .symbol-label`).hover();
    const hovered = await drawn(page);
    for (const each of hovered) {
      if (own.has(each.pair)) expect(each.opacity, `${file} ${symbol}: ${each.what} ${each.pair} is kept`).toBe(REST);
      else expect(each.opacity, `${file} ${symbol}: ${each.what} ${each.pair} fades`).toBeLessThanOrEqual(0.1);
    }
    // Every drawn pair the row's links join is drawn, a return's route among them once its laces are kept.
    const shown = new Set(hovered.map(each => each.pair));
    for (const pair of own) if (rest.some(each => each.pair === pair)) expect(shown.has(pair), pair).toBe(true);
    if (own.has(`${CONFIG} uses ${SERVICE}`)) expect(hovered.filter(each => each.what === "route" && each.opacity === REST), "the return's whole route").toHaveLength(1);
    await page.mouse.move(1430, 890);
  }
});

import { test, expect, type Page } from "@playwright/test";

import { choose, currentSnapshot, newestKey, pathAddress } from "./search-bar";
import { LOCAL_MAP, boxOf, centerDistance, displayNames, loadGraph, readPicture, scoreExpanded, symbolCounts } from "./still-picture";
import { decompressSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { describeRetained, retainedItems, retainedKey } from "../../packages/explorer/src/client/views/retained-state";

/**
 * The Local Map's path mode draws a path only in the map's reading direction:
 * what offers stands left of what uses it, every wire leaves a blue pin and
 * enters a green one. Asked the other way round it draws nothing and offers
 * the reverse question as a link (the owner's rule of 2025-12-18). A path is
 * asked through the search bar (2026-10-14): the newest pin is where it starts,
 * the destination field, shown once anything is pinned, is where it ends, and
 * clearing the destination returns to the exploration.
 *
 * Over the estate sample, whose chain GatewayClient.cs -> PaymentsController.cs
 * -> HubProxy.cs -> IPaymentHub.cs runs from the file that depends to the
 * file depended on.
 */
const BASE = "/samples/estate/";
const DEPENDENT = "Portal/Services/GatewayClient.cs";
const DEPENDENCY = "Contracts/IPaymentHub.cs";
const FRAME = { width: 1600, height: 1000 };

test.use({ viewport: FRAME });

async function openLocalMap(page: Page, file: string): Promise<void> {
  await page.goto(`${BASE}?view=local&node=${encodeURIComponent(file)}`);
  await page.waitForSelector(`#map-container .node-card[data-id="${file}"]`);
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await page.waitForTimeout(600);
}

/** Each wire's two ends in screen coordinates with the pin nearest to each, so the grammar can be read off the picture. */
async function wireEnds(page: Page): Promise<Array<{ startPin: string; endPin: string; startX: number; endX: number }>> {
  return page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>("#map-connections svg");
    const ctm = svg?.getScreenCTM();
    const pins = [...document.querySelectorAll<HTMLElement>("#map-container .symbol-anchor")].map(pin => {
      const box = pin.getBoundingClientRect();
      return { cls: pin.className, x: box.left + box.width / 2, y: box.top + box.height / 2 };
    });
    const nearest = (x: number, y: number): string => {
      let best = { cls: "none", d: Infinity };
      for (const pin of pins) {
        const d = Math.hypot(pin.x - x, pin.y - y);
        if (d < best.d) best = { cls: pin.cls, d };
      }
      return best.d <= 12 ? best.cls : `none within 12 px (${Math.round(best.d)})`;
    };
    return [...document.querySelectorAll<SVGPathElement>("#map-connections path.connection-path")].map(path => {
      const toScreen = (p: DOMPoint): { x: number; y: number } =>
        ctm ? { x: ctm.a * p.x + ctm.c * p.y + ctm.e, y: ctm.b * p.x + ctm.d * p.y + ctm.f } : { x: p.x, y: p.y };
      const start = toScreen(path.getPointAtLength(0));
      const end = toScreen(path.getPointAtLength(path.getTotalLength()));
      return { startPin: nearest(start.x, start.y), endPin: nearest(end.x, end.y), startX: start.x, endX: end.x };
    });
  });
}

const pathFiles = (page: Page): Promise<string[]> =>
  page.locator("#map-container .path-node").evaluateAll(columns => columns
    .sort((a, b) => Number((a as HTMLElement).dataset.column) - Number((b as HTMLElement).dataset.column))
    .map(column => column.querySelector<HTMLElement>(".node-card")!.dataset.id!));

for (const [base, file] of [["/", "packages/explorer/src/client/index.ts"], [BASE, DEPENDENT]]) {
  test(`a direct file link starts in the directory-aware layout: ${base}`, async ({ page }) => {
    await page.goto(`${base}?view=local&node=${encodeURIComponent(file)}`);
    await expect(page.locator("#map-container .local-placed")).toBeVisible();
    const subject = page.locator(`#map-container .node-card[data-id="${file}"]`);
    await expect(subject).toBeVisible();
    expect(await subject.locator("xpath=ancestor::*[contains(@class,'local-directory-band')]").count()).toBeGreaterThan(0);
    const ids = () => page.locator("#map-container .node-card").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id).sort());
    const before = await ids();
    expect(before.length).toBeGreaterThan(2);
    await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
    await subject.locator(".node-title").click();
    expect(await ids(), "retaining the selected file does not switch to a different neighborhood renderer").toEqual(before);
    await expect(page.locator("#map-container .local-placed")).toBeVisible();
  });
}

test.describe("Local Map path mode", () => {
  test("asked with the dependent first, it draws nothing and offers the reverse; the reverse pins the destination and draws blue to green; clearing returns to the exploration", async ({ page }) => {
    await openLocalMap(page, DEPENDENT);
    const subject = `#map-container .node-card[data-id="${DEPENDENT}"]`;
    await expect(page.locator("#search-destination-field")).toBeHidden();

    // Choosing the subject in the bar pins it, and the destination field appears
    await choose(page, "subject", "GatewayClient", { file: DEPENDENT });
    await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
    await expect(page.locator("#search-subject")).toHaveValue("GatewayClient.cs");
    await expect(page.locator("#search-destination-field")).toBeVisible();
    await page.waitForTimeout(400);
    const start = await boxOf(page, subject);
    const wiresBefore = await page.locator("#map-connections .connection-path").count();
    expect(wiresBefore).toBeGreaterThan(0);

    await choose(page, "destination", "IPaymentHub", { file: DEPENDENCY });
    await page.waitForSelector("#pathfind-status a");
    await page.waitForTimeout(200);

    // Nothing drawn, the reverse offered as a link whose address pins the destination and asks the way back
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
    const status = page.locator("#pathfind-status");
    await expect(status).toContainText("No path runs from GatewayClient.cs to IPaymentHub.cs");
    await expect(status).toContainText("IPaymentHub.cs reaches GatewayClient.cs through 4 files");
    const href = await page.locator("#pathfind-status a").getAttribute("href");
    const offered = decompressSnapshot(new URL(href!, page.url()).searchParams.get("s")!);
    expect(offered.destination).toEqual({ kind: "file", nodeId: DEPENDENT });
    expect(newestKey(offered)).toBe(retainedKey({ kind: "pin", pin: { nodeId: DEPENDENCY, symbol: "*" } }));
    expect(currentSnapshot(page).destination, "the question asked rides the address").toEqual({ kind: "file", nodeId: DEPENDENCY });
    expect(centerDistance(start, await boxOf(page, subject)), "the offer leaves the picture as it was").toBeLessThanOrEqual(1);

    // Taking the offer pins the destination, newest, and draws from it
    await page.click("#pathfind-status a");
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(800);
    expect(currentSnapshot(page).destination).toEqual({ kind: "file", nodeId: DEPENDENT });
    expect(newestKey(currentSnapshot(page))).toBe(retainedKey({ kind: "pin", pin: { nodeId: DEPENDENCY, symbol: "*" } }));
    await expect(page.locator("#search-subject")).toHaveValue("IPaymentHub.cs");
    await expect(page.locator("#search-destination")).toHaveValue("GatewayClient.cs");
    await expect(page.locator(".pin-tray-toggle")).toHaveText("2 pins");
    await expect(status).toHaveText("Path found: 4 files");
    expect(await pathFiles(page)).toEqual([DEPENDENCY, "Gateway/Wcf/HubProxy.cs", "Gateway/Controllers/PaymentsController.cs", DEPENDENT]);
    await expect(page.locator(".path-mode.local-placed")).toBeVisible();
    expect(await page.locator("#map-container .local-membrane").count()).toBeGreaterThan(0);
    const strip = await page.locator("#pathfind-path .pathfind-path-hop-name").allTextContents();
    expect(strip).toEqual(["IPaymentHub.cs", "HubProxy.cs", "PaymentsController.cs", "GatewayClient.cs"]);

    // Every wire leaves a blue (offers) pin and enters a green (uses) pin, left to right
    const ends = await wireEnds(page);
    expect(ends.length).toBeGreaterThanOrEqual(3);
    for (const wire of ends) {
      expect(wire.startPin, "a wire leaves an offering pin").toMatch(/symbol-anchor.*outbound/);
      expect(wire.endPin, "a wire enters a using pin").toMatch(/symbol-anchor.*inbound/);
      expect(wire.endX, "a wire runs left to right").toBeGreaterThan(wire.startX + 24);
    }
    // and the instrument reads the same: every drawn wire flows, none runs backward
    const graph = await loadGraph(page, BASE);
    const picture = await readPicture(page, LOCAL_MAP, displayNames(graph, graph.nodes.map(node => node.id)));
    const flow = scoreExpanded(picture, symbolCounts(graph)).flow;
    expect(flow.backward).toBe(0);
    expect(flow.flowing).toBe(flow.drawn);

    // The path's first file is in the frame, at reading size
    const first = await boxOf(page, `#map-container .local-column[data-path-index="0"] .node-card, #map-container .path-origin .node-card`);
    expect(first).not.toBeNull();
    expect(first!.x).toBeGreaterThanOrEqual(260);
    expect(first!.x + first!.width).toBeLessThanOrEqual(FRAME.width);

    // Clearing the destination returns to the exploration, both pins kept, the question gone from the address
    await page.click("#search-destination-clear");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(800);
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
    await expect(status).toBeHidden();
    expect(currentSnapshot(page).destination).toBeNull();
    await expect(page.locator(".pin-tray-toggle")).toHaveText("2 pins");
    await expect(page.locator("#search-destination")).toHaveValue("");
    await expect(page.locator(subject)).toBeVisible();
    await expect(page.locator(`#map-container .node-card[data-id="${DEPENDENCY}"]`)).toBeVisible();
    expect(currentSnapshot(page).selectedNodeId, "the file chosen by the reverse question is the subject now").toBe(DEPENDENCY);
  });

  test("asked in the map's direction, it draws at once, and a path from the address draws the same", async ({ page }) => {
    await openLocalMap(page, DEPENDENCY);
    await choose(page, "subject", "IPaymentHub", { file: DEPENDENCY });
    await choose(page, "destination", "GatewayClient", { file: DEPENDENT });
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(800);
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    expect(await page.locator("#pathfind-status a").count()).toBe(0);
    const drawn = await wireEnds(page);
    expect(drawn.length).toBeGreaterThanOrEqual(3);

    await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }));
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(800);
    expect(await pathFiles(page)).toEqual([DEPENDENCY, "Gateway/Wcf/HubProxy.cs", "Gateway/Controllers/PaymentsController.cs", DEPENDENT]);
    await expect(page.locator(".path-mode.local-placed")).toBeVisible();
    expect(await page.locator("#map-container .local-membrane").count()).toBeGreaterThan(0);
    expect((await wireEnds(page)).length).toBe(drawn.length);
    await expect(page.locator("#search-subject")).toHaveValue("IPaymentHub.cs");
    await expect(page.locator("#search-destination")).toHaveValue("GatewayClient.cs");
  });

  test("a direct dependency asked the wrong way round is offered, two files that do not connect get no path either way, and a directory is an end of a path too", async ({ page }) => {
    await openLocalMap(page, DEPENDENT);
    await choose(page, "subject", "GatewayClient", { file: DEPENDENT });
    await choose(page, "destination", "PaymentRequestModel", { file: "Portal/Models/PaymentRequestModel.cs" });
    await page.waitForSelector("#pathfind-status:not([hidden])");
    // GatewayClient.cs depends on PaymentRequestModel.cs, so the drawable direction is the reverse: offered
    await expect(page.locator("#pathfind-status")).toContainText("PaymentRequestModel.cs reaches GatewayClient.cs through 2 files");
    await choose(page, "destination", "Default.aspx.cs", { file: "Portal/Pages/Default.aspx.cs" });
    await page.waitForSelector("#pathfind-status.error");
    await expect(page.locator("#pathfind-status")).toContainText("No path either way");
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);

    // A directory as the end stands for any file inside it: GatewayClient.cs depends on files of Contracts, so the drawable
    // direction is the reverse, and the nearest file of the directory answers, closer than IPaymentHub.cs alone (4 files)
    await choose(page, "destination", "Contracts", { directory: "Contracts" });
    await page.waitForSelector("#pathfind-status a");
    await expect(page.locator("#pathfind-status")).toContainText("No path runs from GatewayClient.cs to Contracts. Contracts reaches GatewayClient.cs through");
    const offered = (await page.locator("#pathfind-status").textContent())!.match(/through (\d+) files/)!;
    const hops = Number(offered[1]);
    expect(hops, "the nearest file of the directory is nearer than IPaymentHub.cs").toBeLessThan(4);
    expect(currentSnapshot(page).destination).toEqual({ kind: "directory", directory: "Contracts" });
    await page.click("#pathfind-status a");
    await page.waitForSelector("#view-map.has-path");
    await page.waitForTimeout(800);
    await expect(page.locator("#pathfind-status")).toHaveText(`Path found: ${hops} files`);
    const drawn = await pathFiles(page);
    expect(drawn).toHaveLength(hops);
    expect(drawn[0].startsWith("Contracts/"), "the path leaves from a file of the directory").toBe(true);
    expect(drawn.at(-1)).toBe(DEPENDENT);
    expect(currentSnapshot(page).openDirectories.has("Contracts"), "the reverse question opened the directory as the newest pin").toBe(true);
    await expect(page.locator("#search-subject")).toHaveValue("Contracts");
  });

  test("the subject field follows the newest pin, and a new subject chosen in the bar asks the path again from it", async ({ page }) => {
    await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }, DEPENDENT));
    await page.locator("#view-map.has-path").waitFor();
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    await expect(page.locator("#search-subject")).toHaveValue("IPaymentHub.cs");
    await choose(page, "subject", "HubProxy", { file: "Gateway/Wcf/HubProxy.cs" });
    await page.waitForTimeout(800);
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 3 files");
    expect(await pathFiles(page)).toEqual(["Gateway/Wcf/HubProxy.cs", "Gateway/Controllers/PaymentsController.cs", DEPENDENT]);
    await expect(page.locator("#search-subject")).toHaveValue("HubProxy.cs");
    await expect(page.locator(".pin-tray-toggle")).toHaveText("2 pins");
    expect(currentSnapshot(page).destination).toEqual({ kind: "file", nodeId: DEPENDENT });
  });
});

test("pinning a path symbol opens branches, clears the old path status and keeps the clicked row in place", async ({ page }) => {
  await page.goto(pathAddress(BASE, DEPENDENCY, { kind: "file", nodeId: DEPENDENT }, DEPENDENT));
  await page.locator("#view-map.has-path").waitFor();
  await page.waitForTimeout(800);
  const label = page.locator(".path-origin .symbol-row:not(.internals-row) .symbol-label-wrapper").first();
  const before = (await label.boundingBox())!;
  const symbol = await label.evaluate(element => element.parentElement!.dataset.symbol!);
  await label.click();
  await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
  await expect(page.locator("#pathfind-status")).toBeHidden();
  await expect(page.locator(".branch-mode")).toBeVisible();
  await page.waitForTimeout(100);
  const after = (await page.locator(`.node-card[data-id="${DEPENDENCY}"] .symbol-row[data-symbol="${symbol}"] .symbol-label-wrapper`).boundingBox())!;
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(1);
  expect(currentSnapshot(page).destination, "leaving the path by the picture forgets the question").toBeNull();
  await expect(page.locator("#search-destination")).toHaveValue("");
  // The origin was pinned whole, so the click toggled its symbol out and left the others pinned one by one; the field shows whichever is newest
  const snapshot = currentSnapshot(page);
  const newest = retainedItems({ pins: snapshot.pinSet, openDirectories: snapshot.openDirectories, retentionOrder: snapshot.retentionOrder }).at(-1)!;
  expect(newest.kind === "pin" && newest.pin.nodeId).toBe(DEPENDENCY);
  expect(newest.kind === "pin" && newest.pin.symbol).not.toBe(symbol);
  await expect(page.locator("#search-subject"), "the field follows the newest pin").toHaveValue(describeRetained(newest, id => id.split("/").pop()).name);
});

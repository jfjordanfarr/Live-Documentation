import { test, expect, type Page } from "@playwright/test";

import { LOCAL_MAP, boxOf, centerDistance, displayNames, loadGraph, readPicture, scoreExpanded, symbolCounts } from "./still-picture";

/**
 * The Local Map's path mode draws a path only in the map's reading direction:
 * what offers stands left of what uses it, every wire leaves a blue pin and
 * enters a green one. Asked the other way round it draws nothing and offers
 * the reverse question as a link (the owner's rule of 2025-12-18). Clear
 * returns to the file that was selected, camera and wires included.
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
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)");
  await page.waitForTimeout(600);
}

async function pick(page: Page, input: "from" | "to", file: string): Promise<void> {
  await page.click(`#pathfind-${input}`);
  await page.keyboard.type(file.split("/").pop()!);
  await page.waitForSelector(`#pathfind-${input}-results .pathfind-result`);
  const index = await page.evaluate(
    ({ input, file }) => [...document.querySelectorAll<HTMLElement>(`#pathfind-${input}-results .pathfind-result`)]
      .findIndex(el => el.querySelector(".pathfind-result-path")?.textContent?.trim() === file),
    { input, file }
  );
  expect(index, `${file} among the pathfinder's results`).toBeGreaterThanOrEqual(0);
  await page.click(`#pathfind-${input}-results .pathfind-result[data-index="${index}"]`);
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

const columnLabels = (page: Page): Promise<string[]> =>
  page.evaluate(() => [...document.querySelectorAll<HTMLElement>("#map-container .local-column-label")].map(el => el.textContent?.trim() ?? ""));

test.describe("Local Map path mode", () => {
  test("asked with the dependent first, it draws nothing and offers the reverse; the reverse draws blue to green, and Clear returns", async ({ page }) => {
    await openLocalMap(page, DEPENDENT);
    const subject = `#map-container .node-card[data-id="${DEPENDENT}"]`;
    const start = await boxOf(page, subject);
    const wiresBefore = await page.locator("#map-connections .connection-path").count();
    expect(wiresBefore).toBeGreaterThan(0);

    await pick(page, "from", DEPENDENT);
    await pick(page, "to", DEPENDENCY);
    await page.click("#pathfind-go");
    await page.waitForSelector("#pathfind-status a");
    await page.waitForTimeout(200);

    // Nothing drawn, the reverse offered as a link that carries the reverse question in its address
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
    const status = page.locator("#pathfind-status");
    await expect(status).toContainText("No path runs from GatewayClient.cs to IPaymentHub.cs");
    await expect(status).toContainText("IPaymentHub.cs reaches GatewayClient.cs through 4 files");
    const href = await page.locator("#pathfind-status a").getAttribute("href");
    expect(href).toContain(`from=${encodeURIComponent(DEPENDENCY)}`);
    expect(href).toContain(`to=${encodeURIComponent(DEPENDENT)}`);
    expect(await boxOf(page, subject), "the offer leaves the picture as it was").toEqual(start);

    // Taking the offer swaps the ends and draws
    await page.click("#pathfind-status a");
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)");
    await page.waitForTimeout(800);
    expect(page.url()).toContain(`from=${encodeURIComponent(DEPENDENCY)}`);
    expect(page.url()).toContain(`to=${encodeURIComponent(DEPENDENT)}`);
    await expect(status).toHaveText("Path found: 4 files");
    expect(await columnLabels(page)).toEqual(["FROM", "Via 1", "Via 2", "TO"]);
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

    // Clear returns to the selected file: same place, same wires, same address
    await page.click("#pathfind-clear");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)");
    await page.waitForTimeout(800);
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
    const returned = await boxOf(page, subject);
    expect(returned).not.toBeNull();
    expect(centerDistance(start, returned)).toBeLessThanOrEqual(1);
    expect(await page.locator("#map-connections .connection-path").count()).toBe(wiresBefore);
    expect(page.url()).toContain(`node=${encodeURIComponent(DEPENDENT)}`);
    expect(page.url()).not.toContain("from=");
  });

  test("asked in the map's direction, it draws at once, and a path from the address draws the same", async ({ page }) => {
    await openLocalMap(page, DEPENDENCY);
    await pick(page, "from", DEPENDENCY);
    await pick(page, "to", DEPENDENT);
    await page.click("#pathfind-go");
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)");
    await page.waitForTimeout(800);
    await expect(page.locator("#pathfind-status")).toHaveText("Path found: 4 files");
    expect(await page.locator("#pathfind-status a").count()).toBe(0);
    const drawn = await wireEnds(page);
    expect(drawn.length).toBeGreaterThanOrEqual(3);

    await page.goto(`${BASE}?view=local&node=${encodeURIComponent(DEPENDENCY)}&from=${encodeURIComponent(DEPENDENCY)}&to=${encodeURIComponent(DEPENDENT)}`);
    await page.waitForSelector("#view-map.has-path");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)");
    await page.waitForTimeout(800);
    expect(await columnLabels(page)).toEqual(["FROM", "Via 1", "Via 2", "TO"]);
    expect((await wireEnds(page)).length).toBe(drawn.length);
  });

  test("a direct dependency asked the wrong way round is offered, and two files that do not connect get no path either way", async ({ page }) => {
    await openLocalMap(page, DEPENDENT);
    await pick(page, "from", DEPENDENT);
    await pick(page, "to", "Portal/Models/PaymentRequestModel.cs");
    await page.click("#pathfind-go");
    await page.waitForSelector("#pathfind-status:not([hidden])");
    // GatewayClient.cs depends on PaymentRequestModel.cs, so the drawable direction is the reverse: offered
    await expect(page.locator("#pathfind-status")).toContainText("PaymentRequestModel.cs reaches GatewayClient.cs through 2 files");
    await page.click("#pathfind-to-clear");
    await pick(page, "to", "Portal/Pages/Default.aspx.cs");
    await page.click("#pathfind-go");
    await page.waitForSelector("#pathfind-status.error");
    await expect(page.locator("#pathfind-status")).toContainText("No path either way");
    await expect(page.locator("#view-map")).not.toHaveClass(/has-path/);
  });
});

test("pinning a path symbol opens branches, clears the old path status and keeps the clicked row in place", async ({ page }) => {
  await page.goto(`${BASE}?view=local&node=${encodeURIComponent(DEPENDENT)}&from=${encodeURIComponent(DEPENDENCY)}&to=${encodeURIComponent(DEPENDENT)}`);
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
  expect(new URL(page.url()).searchParams.has("from")).toBe(false);
  expect(new URL(page.url()).searchParams.has("to")).toBe(false);
});

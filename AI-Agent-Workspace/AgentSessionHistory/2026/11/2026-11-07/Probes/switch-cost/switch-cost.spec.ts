import { test, expect, type Page } from "@playwright/test";

import { observeGraph, renderedNodes } from "../force-graph-observation";

/**
 * Times the steps of force-graph-focus.spec.ts:70 ("a focused URL centers its node, direct clicks pin it, and More
 * opens its details"), which ran at 29.7 s in the gate over the 3D shells' third round and timed out at 31.9 s in the
 * next, so that the cost of the 2D and 3D switches can be compared between two builds served on two ports.
 */
const GRAPH = "packages/engine/src/live-docs/graph.ts";

async function expectFocused(page: Page, id: string): Promise<void> {
  const label = page.locator(".force-graph-focus");
  await expect(label).toHaveAttribute("data-node-id", id, { timeout: 120_000 });
  await expect(label).toBeVisible({ timeout: 120_000 });
  await expect.poll(() => page.locator("#graph-svg").evaluate(element => {
    const marker = element.querySelector<HTMLElement>(".force-graph-focus")!;
    const frame = element.getBoundingClientRect();
    const controls = [...document.querySelectorAll<HTMLElement>(".perspective-controls:not([hidden]), .history-scrubber:not([hidden])")]
      .map(control => control.getBoundingClientRect()).filter(box => box.width && box.top > frame.top && box.bottom <= frame.bottom + 1);
    const bottom = Math.min(frame.bottom, ...controls.map(box => box.top)) - frame.top;
    return Math.hypot(parseFloat(marker.style.left) - element.clientWidth / 2, parseFloat(marker.style.top) - bottom / 2);
  }), { timeout: 120_000 }).toBeLessThan(8);
}

async function hittablePoint(page: Page, id: string): Promise<{ x: number; y: number } | null> {
  const nodes = await renderedNodes(page);
  const target = nodes.find(node => node.id === id)!;
  const nearer = nodes.filter(node => node.id !== id && node.depth < target.depth);
  const covered = (x: number, y: number): boolean => nearer.some(node => Math.hypot(node.x - x, node.y - y) <= node.screenRadius + 2);
  const candidates = [[0, 0], ...Array.from({ length: 8 }, (_, i) => [Math.cos(i * Math.PI / 4), Math.sin(i * Math.PI / 4)])];
  for (const scale of [0, 0.5, 0.75]) {
    for (const [dx, dy] of candidates) {
      const x = target.x + dx * target.screenRadius * scale;
      const y = target.y + dy * target.screenRadius * scale;
      if (!covered(x, y) && await page.evaluate(({ x, y }) =>
        document.elementFromPoint(x, y) === document.querySelector("#graph-svg canvas"), { x, y })) return { x, y };
    }
  }
  return null;
}

async function uncover(page: Page, id: string): Promise<{ x: number; y: number }> {
  for (let turn = 0; turn < 8; turn++) {
    const point = await hittablePoint(page, id);
    if (point) return point;
    const box = (await page.locator("#graph-svg canvas").boundingBox())!;
    const cx = box.x + box.width / 2 + 200;
    const cy = box.y + box.height / 2 + 200;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 90, cy + 30, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  }
  throw new Error(`${id} stayed covered by nearer spheres after eight turns of the camera`);
}

test("the switch's cost", async ({ page }) => {
  test.setTimeout(600_000);
  const times: Record<string, number> = {};
  let mark = Date.now();
  const lap = (name: string): void => { const now = Date.now(); times[name] = (now - mark) / 1000; mark = now; };
  await observeGraph(page);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  lap("load and focus");
  const point = await uncover(page, GRAPH);
  await page.mouse.click(point.x, point.y);
  lap("uncover and click");
  await page.locator(".force-graph-actions").getByRole("button", { name: "More actions for graph.ts", exact: true }).click();
  await page.getByRole("menuitem", { name: "Inspect graph.ts", exact: true }).click();
  await expect(page.locator("#detail-panel")).toContainText(GRAPH);
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
  await page.locator("#detail-panel").getByRole("button", { name: "Centre on graph.ts", exact: true }).click();
  await expectFocused(page, GRAPH);
  await expect(page.locator("#view-graph.active")).toBeVisible();
  lap("inspect and centre");
  await page.getByRole("button", { name: "2D", exact: true }).click();
  lap("2D click returned");
  await expect(page.locator(`.node-card.local-focus[data-id="${GRAPH}"]`)).toBeVisible({ timeout: 120_000 });
  lap("2D focus card visible");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  lap("3D click returned");
  await expectFocused(page, GRAPH);
  lap("3D focused");
  const busy = await page.locator("#graph-svg").getAttribute("aria-busy");
  const measures = await page.evaluate(() => performance.getEntriesByType("measure").filter(entry => entry.name.startsWith("live-docs:"))
    .reduce<Record<string, { count: number; total: number; max: number }>>((acc, entry) => {
      const bucket = acc[entry.name] ?? (acc[entry.name] = { count: 0, total: 0, max: 0 });
      bucket.count++; bucket.total += entry.duration; bucket.max = Math.max(bucket.max, entry.duration);
      return acc;
    }, {}));
  const total = Object.values(times).reduce((sum, value) => sum + value, 0);
  console.log(`SWITCH-COST ${JSON.stringify({ site: page.url().replace(/\/\?.*$/, ""), times, total: Math.round(total * 10) / 10, busy, measures }, null, 1)}`);
});

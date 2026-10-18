import { expect, test, type Page } from "@playwright/test";

import { engineActivity, markedRenderedLinks, markRenderedLinks, observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import { settleTicksOf } from "../../packages/explorer/src/client/views/forceGraphLayout";

/**
 * The one update path of a membership change in the 3D Local Map, fed by the update energy (ticket C2 of the
 * change-over-time plan, 2026-10-18), held on this repository's bundle in the connections layout, where Show Tests
 * brings two hundred-odd spheres in and out: a picture opened with the tests hidden has never placed them, so showing
 * them is a change with births. Everything is read from the rendered scene through the observation instrument, never
 * from the Explorer's state. The viewport is modest because the software renderer's frame is the cost of every tick.
 */

test.use({ viewport: { width: 1100, height: 700 } });

type Rendered = Awaited<ReturnType<typeof renderedNodes>>;
type Point = { x: number; y: number; z: number };

const entry = (updateEnergy: number, showTests: boolean): string => `/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT,
  perspective: "3d",
  spatialLayout: "connections",
  filters: { showTests, showAssets: false },
  layout: { forceGraph: { updateEnergy } }
})}`;

const gap = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const positions = (nodes: Rendered): Map<string, Point> => new Map(nodes.map(node => [node.id, node.world]));
/** The mean move of the spheres present before and after. */
const meanMove = (before: Map<string, Point>, after: Map<string, Point>): number => {
  const stayed = [...before].filter(([id]) => after.has(id));
  return stayed.reduce((sum, [id, was]) => sum + gap(was, after.get(id)!), 0) / stayed.length;
};

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
}

/** The ticks the engine took for the last change, read as the frames between the container's last busy and its settle. */
async function ticksOfLastChange(page: Page): Promise<number> {
  const { changes } = await engineActivity(page);
  const stop = changes[changes.length - 1], start = changes[changes.length - 2];
  expect(stop?.busy, "the last change of aria-busy is the settle").toBe(false);
  expect(start?.busy, "the change before it is the engine starting").toBe(true);
  return stop.frame - start.frame;
}

/** The spring's rest length between two rendered spheres for a pair of the given reference count: the page's own rule. */
function restLength(a: Rendered[number], b: Rendered[number], count: number): number {
  const tuning = getDefaultTuning().forceGraph;
  return a.radius + b.radius + Math.max(tuning.collisionGap, tuning.linkGap / (1 + tuning.coupling * Math.log2(Math.max(1, count))));
}

test("placement alone seats each born sphere beside what it is wired to, keeps every unchanged sphere exactly where it stood, and ticks nothing", async ({ page }) => {
  test.setTimeout(150_000);
  await observeGraph(page);
  await page.goto(entry(0, false));
  await settled(page);
  const before = positions(await renderedNodes(page));
  expect(before.size).toBeGreaterThan(500);
  const activity = await engineActivity(page);
  await page.locator("#filter-toggle-tests").check();
  let after: Rendered = [];
  await expect.poll(async () => { after = await renderedNodes(page); return after.length; }).toBeGreaterThan(before.size + 100);
  // No sphere that stayed moved, not by a bit: there was no tick to move it.
  for (const node of after) if (before.has(node.id)) expect(node.world, node.id).toEqual(before.get(node.id));
  // The engine never ran: the container was never busy for the change.
  expect((await engineActivity(page)).changes.length).toBe(activity.changes.length);
  // A born sphere wired only to spheres that already stood starts at the mean of the springs' rest lengths from their
  // mean position, in the direction its id seeds: the page's placement rule read back from the scene, not the origin
  // where D3 would have seated it. Tests wired to other born tests are placed after them and are left to the unit tests.
  const byId = new Map(after.map(node => [node.id, node]));
  const links = (await renderedLinks(page)).filter(link => link.kind !== "containment");
  let checked = 0;
  for (const born of after.filter(node => !before.has(node.id))) {
    const wired = links.filter(link => link.source === born.id || link.target === born.id)
      .map(link => ({ other: byId.get(link.source === born.id ? link.target : link.source)!, count: link.count }));
    if (!wired.length || wired.some(({ other }) => !before.has(other.id))) continue;
    const anchor = { x: 0, y: 0, z: 0 };
    for (const { other } of wired) { anchor.x += other.world.x / wired.length; anchor.y += other.world.y / wired.length; anchor.z += other.world.z / wired.length; }
    const rest = wired.reduce((sum, { other, count }) => sum + restLength(born, other, count), 0) / wired.length;
    expect(gap(born.world, anchor), `${born.id} stands at its springs' rest length from what it is wired to`).toBeCloseTo(rest, 3);
    checked++;
  }
  expect(checked).toBeGreaterThan(50);
  // Back out: the born spheres leave and, again, nothing else moves.
  await page.locator("#filter-toggle-tests").uncheck();
  await expect.poll(async () => (await renderedNodes(page)).length).toBe(before.size);
  for (const node of await renderedNodes(page)) expect(node.world, node.id).toEqual(before.get(node.id));
});

test("the full reheat and the gentle update settle in their own ticks, the gentle one stirring the unchanged spheres less, and both keep the lines' objects", async ({ page }) => {
  test.setTimeout(240_000);
  await observeGraph(page);
  await page.goto(entry(1, true));
  await settled(page);
  const start = await renderedNodes(page);
  const tests = new Set<string>();
  const kept = await markRenderedLinks(page, "before the first toggle");
  expect(kept).toBeGreaterThan(0);

  // The full reheat, today's update path at energy one: three hundred ticks to the settled alpha.
  await page.locator("#filter-toggle-tests").uncheck();
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "true");
  await settled(page);
  const fullTicks = await ticksOfLastChange(page);
  expect(fullTicks).toBeGreaterThanOrEqual(settleTicksOf(1));
  expect(fullTicks).toBeLessThanOrEqual(settleTicksOf(1) + 3);
  const reduced = await renderedNodes(page);
  const stayed = new Set(reduced.map(node => node.id));
  for (const node of start) if (!stayed.has(node.id)) tests.add(node.id);
  expect(tests.size).toBeGreaterThan(100);
  const fullMove = meanMove(positions(start), positions(reduced));
  expect(fullMove).toBeGreaterThan(0);
  // Every line between two spheres that stayed kept its object; the lines that left were the tests'.
  const among = (await renderedLinks(page)).filter(link => link.kind !== "containment");
  expect(among.every(link => stayed.has(link.source) && stayed.has(link.target))).toBe(true);
  const marks = await markedRenderedLinks(page, "before the first toggle");
  expect(marks.total).toBe(among.length);
  expect(marks.marked).toBe(marks.total);
  expect(marks.marked).toBeLessThan(kept);

  // In again at full energy, so that the gentle update below leaves a settled picture of the same membership.
  await page.locator("#filter-toggle-tests").check();
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "true");
  await settled(page);
  const beforeGentle = positions(await renderedNodes(page));
  expect(beforeGentle.size).toBe(start.length);

  // A tenth of the energy, set by the slider as a person would: fewer ticks, to the same stillness, and a smaller stir.
  await page.getByText("Tuning", { exact: true }).click();
  const energy = page.locator("#tuning-force-update-energy");
  await expect(energy).toHaveValue("1");
  await energy.focus();
  await page.keyboard.press("Home");
  for (let step = 0; step < 10; step++) await page.keyboard.press("ArrowRight");
  await expect(energy).toHaveValue("0.1");
  await expect(page.locator("#tuning-force-update-energy-value")).toHaveText("0.1");
  // Moving the energy changes no force, so the settled picture does not stir.
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false");
  await page.locator("#filter-toggle-tests").uncheck();
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "true");
  await settled(page);
  const gentleTicks = await ticksOfLastChange(page);
  expect(gentleTicks).toBeGreaterThanOrEqual(settleTicksOf(0.1));
  expect(gentleTicks).toBeLessThanOrEqual(settleTicksOf(0.1) + 3);
  expect(settleTicksOf(0.1)).toBeLessThan(settleTicksOf(1));
  const gentleMove = meanMove(beforeGentle, positions(await renderedNodes(page)));
  expect(gentleMove).toBeGreaterThan(0);
  // The forces see a tenth of alpha, the collision and the library's centring all of it, so the stir is not a tenth: the
  // page measured 0.42 of the full reheat's on this toggle (2026-10-18), and a share not applied would give about 0.9,
  // since a full-alpha run cut at a hundredth of alpha has done nearly all its moving. The bound sits between.
  expect(gentleMove, `a tenth of the energy (${gentleMove.toFixed(1)}) against the full reheat (${fullMove.toFixed(1)})`).toBeLessThan(fullMove * 0.6);
  // The setting rides the address and the container's layout settings, as every layout setting does.
  expect(new URL(page.url()).searchParams.get("s")).toBeTruthy();
  await expect.poll(() => page.evaluate(() => JSON.parse(document.querySelector("#graph-svg")!.getAttribute("data-layout-settings")!).updateEnergy)).toBe(0.1);
});

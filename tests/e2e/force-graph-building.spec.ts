import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { spatialScope, startHops, startOf } from "../../packages/explorer/src/client/views/forceGraphScope";
import { observeGraph, renderedNodes } from "./force-graph-observation";
import { loadGraph } from "./still-picture";

/**
 * While the 3D Local Map builds, its nodes take no hover and no click, and the map says it is building (the owner's
 * decision, [Turn 4 of the November 15 record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-4)):
 * building is a body packing, the reveal bringing spheres in, a perspective change or the camera's framing flight with
 * them, which the container's `data-building` says; a pointer that has not moved since building began starts nothing
 * until it moves. On this repository's archipelago, a click on the largest group's seed, the journey of the original
 * finding (a click on a seed, the pointer kept still, the grown picture arriving faded around an unrelated file). The
 * build is made long enough to act inside by a setting that exists: two hops and Reveal Frames at its most, 240, so that
 * the second hop enters a sphere or two a frame; wrappers off, so that the software renderer draws it quickly enough.
 */
test.use({ viewport: { width: 1440, height: 900 } });

const entry = `/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", filters: { showTests: true, showAssets: false },
  layout: { forceGraph: { groupWrappers: "off", hops: 2, revealFrames: 240 } }
})}`;

const map = (page: Page) => page.locator("#graph-svg");
/** A sphere faded by a hover is drawn at a fifth of its strength, 0.15 for a full one; the frontier is drawn at 0.3. */
const FADED = 0.2;

type Sphere = Awaited<ReturnType<typeof renderedNodes>>[number];

/** The archipelago built, and the largest group's seed as it stands now, over the bare canvas. */
async function archipelago(page: Page): Promise<Sphere> {
  await observeGraph(page);
  await page.goto(entry);
  await expect.poll(async () => (await renderedNodes(page).catch(() => [])).length, { timeout: 60_000 }).toBeGreaterThan(10);
  await expect(map(page)).not.toHaveAttribute("data-building", /.*/, { timeout: 60_000 });
  const graph = await loadGraph(page, "/");
  const data = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], "connections");
  const pulls = (link: { kind?: string }): boolean => linkPulls(link, "connections");
  const scope = spatialScope(data.nodes, data.links, startOf(data.nodes, data.links, "connections", pulls), startHops("connections", 2), pulls);
  const [largest] = [...scope.groups.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const seed = (await renderedNodes(page)).find(node => node.id === largest[0])!;
  expect(seed, "the largest group's seed is drawn").toBeDefined();
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, seed), "the seed stands over the bare canvas").toBe("CANVAS");
  return seed;
}

/** What the pointer holds and what is faded, as the page draws it. */
async function looking(page: Page, at: { x: number; y: number }): Promise<{ hovered: string | null; faded: number; under: string | null; building: string | null }> {
  const spheres = await renderedNodes(page);
  const under = spheres.filter(sphere => Math.hypot(sphere.x - at.x, sphere.y - at.y) <= sphere.screenRadius).sort((a, b) => a.depth - b.depth)[0];
  return { hovered: await map(page).getAttribute("data-hovered-node"), faded: spheres.filter(sphere => sphere.opacity < FADED).length,
    under: under?.id ?? null, building: await map(page).getAttribute("data-building") };
}

/** The largest sphere near the picture's middle depth whose place on the screen holds, within a pixel, between two readings. */
async function steadySphere(page: Page): Promise<Sphere> {
  let found: Sphere | undefined;
  await expect.poll(async () => {
    const first = (await renderedNodes(page)).filter(sphere => sphere.screenRadius >= 6 && sphere.depth > -1 && sphere.depth < 1).sort((a, b) => b.screenRadius - a.screenRadius);
    const again = new Map((await renderedNodes(page)).map(sphere => [sphere.id, sphere]));
    found = first.map(sphere => again.get(sphere.id)).find((sphere, index) => !!sphere && Math.hypot(sphere.x - first[index].x, sphere.y - first[index].y) < 1);
    return !!found;
  }, { timeout: 90_000, intervals: [0], message: "a sphere of the grown picture holds its place on the screen" }).toBe(true);
  return found!;
}

/** The line along the map's top edge as drawn, and the cursor over the picture. */
const sign = (page: Page) => page.evaluate(() => {
  const line = getComputedStyle(document.getElementById("graph-svg")!, "::before");
  return { opacity: Number(line.opacity), animation: line.animationName, height: line.height, cursor: getComputedStyle(document.querySelector("#graph-svg canvas")!).cursor };
});

const pins = (page: Page): string[] => decompressSnapshot(new URL(page.url()).searchParams.get("s")!).pinSet.entries.map(pin => pin.nodeId).sort();

test("a click on a seed with the pointer kept still: nothing hovers or fades while the map builds or after it, the map says it is building, and the pointer's first move hovers", async ({ page }) => {
  test.setTimeout(240_000);
  const seed = await archipelago(page);
  const at = { x: seed.x, y: seed.y };
  // Before the click the pointer's own move hovers the seed, and the rest fades around it.
  await page.mouse.move(at.x, at.y);
  await expect.poll(async () => (await looking(page, at)).hovered).toBe("true");
  expect((await looking(page, at)).faded, "the hover fades the other seeds").toBeGreaterThan(0);
  await page.mouse.down(); await page.mouse.up();
  // The click pins the seed and its group grows: the map builds, and the hover that was showing ends at once.
  expect(await looking(page, at), "at once after the click, the hover has ended and nothing is faded").toMatchObject({ hovered: "false", faded: 0 });
  const samples: Array<Awaited<ReturnType<typeof looking>>> = [];
  let shown: Awaited<ReturnType<typeof sign>> | null = null;
  for (let read = 0; read < 400; read++) {
    const now = await looking(page, at);
    if (!now.building) break;
    samples.push(now);
    expect(now, `while the map builds (read ${read}), nothing under the still pointer is hovered or faded`).toMatchObject({ hovered: "false", faded: 0 });
    if (now.building === "shown" && !shown) shown = await sign(page);
    await page.waitForTimeout(150);
  }
  expect(samples.length, "the build lasted long enough to look at it").toBeGreaterThan(3);
  expect(samples.some(sample => sample.under), "a sphere stood under the still pointer while the map built").toBe(true);
  expect(shown, "the map said it was building").toMatchObject({ opacity: 0.7, animation: "graph-building", height: "2px", cursor: "progress" });
  expect(pins(page), "the seed was pinned").toEqual([seed.id]);
  // Built, the still pointer still starts nothing, through the drift and past the hover's grace.
  await page.waitForTimeout(600);
  expect(await looking(page, at)).toMatchObject({ hovered: "false", faded: 0, building: null });
  expect(await sign(page), "the sign and the waiting cursor are gone").toMatchObject({ opacity: 0, cursor: "auto" });
  // The pointer's first move hovers as before: onto a sphere of the grown picture, the rest fading around it. The
  // picture is built and not yet at rest, and the camera still follows it, so a sphere's place on the screen is as old
  // as its reading: the largest sphere whose place holds between two readings is taken, and the pointer moves once.
  // (Until 2026-11-18 the largest sphere of one reading was taken; beside a second worker it had left the pointer's
  // place by more than its own radius before the next frame picked, in 14 of 16 runs.)
  const target = await steadySphere(page);
  await page.mouse.move(target.x, target.y);
  await expect.poll(async () => (await looking(page, target)).hovered).toBe("true");
  await expect.poll(async () => (await looking(page, target)).faded, { message: "the rest fades for the hover" }).toBeGreaterThan(0);
});

test("a press on a node while the map builds does nothing and is not replayed once it has built; a drag from a sphere turns the camera", async ({ page }) => {
  test.setTimeout(240_000);
  const seed = await archipelago(page);
  const others = (await renderedNodes(page)).filter(sphere => sphere.id !== seed.id && sphere.screenRadius >= 4 && Math.hypot(sphere.x - seed.x, sphere.y - seed.y) > 80);
  await page.mouse.move(seed.x, seed.y);
  await page.mouse.down(); await page.mouse.up();
  // A press on another sphere, where one stands now.
  const now = await renderedNodes(page);
  const other = now.find(sphere => others.some(before => before.id === sphere.id) && sphere.depth > -1 && sphere.depth < 1);
  expect(other, "another seed stands in the picture").toBeDefined();
  const pressedWhile = [await map(page).getAttribute("data-building")];
  await page.mouse.click(other!.x, other!.y);
  // A press on the pinned seed's own name, which would release it.
  const name = page.locator(`.force-graph-label[data-node-id="${seed.id}"]:not([hidden]), .force-graph-focus[data-node-id="${seed.id}"]:not([hidden])`).first();
  await expect(name, "the pinned seed is named").toBeVisible();
  const box = (await name.boundingBox())!;
  pressedWhile.push(await map(page).getAttribute("data-building"));
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  expect(pins(page), "neither press acted").toEqual([seed.id]);
  expect(pressedWhile.every(phase => phase === "begun" || phase === "shown"), `both presses were made while the map built (${pressedWhile.join(", ")})`).toBe(true);
  // A drag from a sphere turns the camera rather than carrying the sphere.
  const bearing = (): Promise<number[]> => page.evaluate(() => {
    const elements = (window as unknown as { renderedGraph: { camera: { matrixWorld: { elements: number[] } } } }).renderedGraph.camera.matrixWorld.elements;
    return [elements[8], elements[9], elements[10]];
  });
  const sphere = (await renderedNodes(page)).filter(node => node.depth > -1 && node.depth < 1 && node.screenRadius >= 4).sort((a, b) => b.screenRadius - a.screenRadius)[0];
  const before = await bearing();
  await expect(map(page), "still building at the drag").toHaveAttribute("data-building", /^(begun|shown)$/);
  await page.mouse.move(sphere.x, sphere.y);
  await page.mouse.down();
  for (let step = 1; step <= 8; step++) await page.mouse.move(sphere.x + step * 20, sphere.y + step * 6);
  await page.mouse.up();
  await page.waitForTimeout(400);
  const after = await bearing();
  const turned = Math.acos(Math.min(1, before[0] * after[0] + before[1] * after[1] + before[2] * after[2])) * 180 / Math.PI;
  // Grabbed, as a press on a sphere is once the map has built, the sphere would follow the pointer and the camera stay.
  expect(turned, "the camera turned").toBeGreaterThan(5);
  // Built, nothing of the presses is replayed.
  await expect(map(page)).not.toHaveAttribute("data-building", /.*/, { timeout: 180_000 });
  await page.waitForTimeout(800);
  expect(pins(page), "nothing replayed").toEqual([seed.id]);
});

test("under reduced motion the map's sign of building is still", async ({ page }) => {
  test.setTimeout(240_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const seed = await archipelago(page);
  await page.mouse.move(seed.x, seed.y);
  await page.mouse.down(); await page.mouse.up();
  await expect(map(page)).toHaveAttribute("data-building", "shown");
  expect(await sign(page)).toMatchObject({ opacity: 0.45, animation: "none", height: "2px", cursor: "progress" });
  await expect(map(page)).not.toHaveAttribute("data-building", /.*/, { timeout: 180_000 });
  expect(await sign(page)).toMatchObject({ opacity: 0 });
});

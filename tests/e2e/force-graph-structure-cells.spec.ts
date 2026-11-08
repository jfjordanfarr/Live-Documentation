import { expect, test, type Page } from "@playwright/test";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { loadGraph } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { GroupWrappers } from "../../packages/explorer/src/client/types";
import { directoryNodeId, spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { spatialScope } from "../../packages/explorer/src/client/views/forceGraphScope";
import { structureCells } from "../../packages/explorer/src/client/views/forceGraphShells";

/**
 * The bag of cells in the Structure layout (2026-11-07; the owner, "can we also get the bag-of-cells look for the
 * "structure" part too?", [Turn 8 of the November 6 record](../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-8)):
 * with Group Wrappers on, every directory hub the picture shows none of whose children it shows is drawn as the bubble
 * of what stands under it; a click on one opens its directory, the opened set the 2D and the address share, and its hub
 * stands with its files and its subdirectories' bubbles where the skin showed them; Close wraps it again; Off draws the
 * hubs as before. The bubbles expected are computed from the bundle by the pure functions the page runs; the bubbles
 * drawn are read from the page's own buffers.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const ESTATE = "/samples/estate/";
const entry = (base = "/"): string => `${base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure", filters: { showTests: true, showAssets: false } })}`;

/** Choose the wrappers and the hops before the page starts, as saved Tuning choices, keeping the suite's still Local Map search. */
async function choose(page: Page, look: GroupWrappers, hops: number): Promise<void> {
  await page.addInitScript(([key, version, wrappers, hopsShown]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: wrappers, hops: hopsShown } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, look, hops] as const);
}

/** The bubbles of the Structure picture with nothing pinned and these directories opened, by the page's own pure functions. */
async function expectedCells(page: Page, hops: number, opened: readonly string[] = [], base = "/"): Promise<ReturnType<typeof structureCells> & { shown: Set<string> }> {
  const graph = await loadGraph(page, base);
  const tree = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], "structure");
  const scope = spatialScope(tree.nodes, tree.links, new Set([directoryNodeId(""), ...opened.map(directoryNodeId)]), hops, link => linkPulls(link, "structure"));
  const shown = new Set(scope.hops.keys());
  return { ...structureCells(tree.nodes, tree.links, shown), shown };
}

/** What the page draws: the bubbles (nodes drawn as bodies) with the files each holds, the wrapped seeds, and every node. */
async function drawn(page: Page): Promise<{ bubbles: Record<string, number>; wrapped: string[]; nodes: Map<string, { x: number; y: number; z: number; shellBody?: number }> }> {
  const found = await page.evaluate(() => {
    const result = { bubbles: {} as Record<string, number>, wrapped: [] as string[], nodes: [] as Array<{ id: string; x: number; y: number; z: number; shellBody?: number }> };
    // Before the first picture there is no scene yet: nothing is drawn.
    (window as unknown as { renderedGraph?: { scene: { traverse(visit: (object: { name: string; userData: Record<string, unknown> }) => void): void } } }).renderedGraph?.scene.traverse(object => {
      const batch = object.userData.spatialBatch as { kind: string; entries: Array<{ data: { id: string; x: number; y: number; z: number; shellFiles?: number; shellBody?: number } }> } | undefined;
      if (batch?.kind === "nodes") for (const { data } of batch.entries) {
        result.nodes.push({ id: data.id, x: data.x, y: data.y, z: data.z, shellBody: data.shellBody });
        if (data.shellFiles !== undefined) result.bubbles[data.id] = data.shellFiles;
      }
      if (object.name === "Spatial wrappers") result.wrapped = (object.userData.spatialWrappers as { seeds: string[] }).seeds;
    });
    return result;
  });
  return { bubbles: found.bubbles, wrapped: [...found.wrapped].sort(), nodes: new Map(found.nodes.map(node => [node.id, node])) };
}

/** What each skin shows within it, at its own level, as the page draws it. */
async function shownUnits(page: Page, seed: string): Promise<Array<{ id: string; kind: string; x: number; y: number; z: number; radius: number; depth?: number }>> {
  return page.evaluate(wanted => {
    const found: Array<{ seed: string; id: string; kind: string; x: number; y: number; z: number; radius: number; depth?: number }> = [];
    (window as unknown as { renderedGraph: { scene: { traverse(visit: (object: { name: string; visible: boolean; userData: Record<string, unknown> }) => void): void } } }).renderedGraph.scene.traverse(object => {
      if ((object.name === "Spatial shell files" || object.name === "Spatial shell balloons") && object.visible) found.push(...object.userData.spatialUnits as typeof found);
    });
    return found.filter(unit => unit.seed === wanted && (unit.depth ?? 0) === 0);
  }, seed);
}

const bubblesOf = (cells: ReturnType<typeof structureCells>): Record<string, number> => Object.fromEntries(cells.cells.map(cell => [cell.id, cell.files.length]));
const settled = (page: Page): Promise<void> => expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });

test("the Structure start with Skin is the root's files and one bubble per top-level directory, each its true count, not dimmed and with no ring", async ({ page }) => {
  test.setTimeout(180_000);
  await observeGraph(page);
  await choose(page, "skin", 1);
  await page.goto(entry());
  const expected = await expectedCells(page, 1);
  // This repository's top level: packages, tests, scripts and the dot directories, every one but a lone file's a bubble.
  expect(expected.cells.length, "the top level has several directories of many files").toBeGreaterThan(3);
  // Read as soon as the bubbles stand and their skins are built; the picture itself takes minutes to rest here.
  await expect.poll(async () => (await drawn(page)).bubbles, { timeout: 120_000 }).toEqual(bubblesOf(expected));
  await expect.poll(async () => (await drawn(page)).wrapped, { timeout: 60_000 }).toEqual(expected.cells.map(cell => cell.id).sort());
  const nodes = await renderedNodes(page);
  // A top-level directory of one file is that file, in its hub's place; the root's own files stand as spheres.
  for (const { hub, file } of expected.lone) {
    expect(nodes.some(node => node.id === hub), `${hub} is no bubble of one cell`).toBe(false);
    expect(nodes.some(node => node.id === file), `${file} stands in its hub's place`).toBe(true);
  }
  for (const cell of expected.cells) {
    const node = nodes.find(item => item.id === cell.id)!;
    expect(node.ring, `${cell.directory} wears no ring: its skin says there is more`).toBe(false);
    const label = page.locator(`.force-graph-label[data-node-id="${cell.id}"]`);
    if (await label.isVisible()) {
      await expect(label).toHaveText(`${cell.directory.split("/").pop()} · ${cell.files.length.toLocaleString("en-US")}`);
      await expect(label).toHaveAttribute("data-context", "false");
    }
    // Every file it holds within its skin, as many as its name counts, or a veil the budget drew.
    const units = await shownUnits(page, cell.id);
    expect(units.length, `${cell.directory} shows what it holds`).toBeGreaterThan(1);
  }
});

/**
 * On the estate, whose Structure start at one hop rests in seconds where this repository's takes minutes in the
 * software renderer: its portal's bubble holds its own files and two subdirectories' bubbles.
 */
test("a click on a bubble opens its directory: its hub stands with its files and its subdirectories' bubbles where the skin showed them, and Close wraps it again", async ({ page }) => {
  test.setTimeout(180_000);
  await observeGraph(page);
  await choose(page, "skin", 1);
  await page.clock.install();
  await page.goto(entry(ESTATE));
  const before = await expectedCells(page, 1, [], ESTATE), after = await expectedCells(page, 1, ["Portal"], ESTATE);
  const id = directoryNodeId("Portal");
  await settled(page);
  await expect.poll(async () => (await drawn(page)).wrapped, { timeout: 30_000 }).toContain(id);
  const skin = (await drawn(page)).nodes.get(id)!, shown = await shownUnits(page, id);
  expect(shown.filter(unit => unit.kind === "directory").length, "the portal's bubble shows its subdirectories' bubbles").toBeGreaterThan(1);
  expect(shown.filter(unit => unit.kind === "file").length, "and its own files").toBeGreaterThan(0);
  // The page's clock stops at the click and goes one frame on: the frame of the pop is the page's own first after it.
  await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1000);
  await page.locator(`.force-graph-label[data-node-id="${id}"]`).evaluate(element => (element as HTMLElement).click());
  await page.clock.runFor(20);
  // The opened set is the shared one, the address's, and nothing was pinned.
  expect([...decompressSnapshot(new URL(page.url()).searchParams.get("s")!).openDirectories]).toEqual(["Portal"]);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  const popped = await drawn(page);
  expect(popped.bubbles[id], "the hub stands open, a hub again").toBeUndefined();
  expect(popped.nodes.has(id)).toBe(true);
  expect(popped.bubbles).toEqual(bubblesOf(after));
  // Each unit the skin showed at its own level stands where it was shown, a file by its id and a bubble as its hub, at
  // its bubble's size, inside the skin; each has had the frame's one tick of motion.
  const tick = getDefaultTuning().forceGraph.collisionGap;
  for (const unit of shown) {
    const born = popped.nodes.get(unit.kind === "file" ? unit.id : directoryNodeId(unit.id)) ?? popped.nodes.get(unit.id);
    expect(born, `${unit.id} stands at the frame of the pop`).toBeDefined();
    expect(Math.hypot(born!.x - unit.x, born!.y - unit.y, born!.z - unit.z), `${unit.id} stands where it was shown`).toBeLessThan(tick);
    if (unit.kind === "directory" && born!.shellBody !== undefined) expect(born!.shellBody, `${unit.id} keeps its bubble's size`).toBeCloseTo(unit.radius, 6);
    expect(Math.hypot(born!.x - skin.x, born!.y - skin.y, born!.z - skin.z) + unit.radius, `${unit.id} stands inside the skin`).toBeLessThanOrEqual(skin.shellBody! + tick);
  }
  await page.clock.resume();
  // Close, by the shared tray, wraps it again: the start's bubbles, the portal among them with its true count.
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await page.getByRole("button", { name: "Release directory Portal", exact: true }).click();
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
  await expect.poll(async () => (await drawn(page)).bubbles, { timeout: 30_000 }).toEqual(bubblesOf(before));
});

test("Off draws the Structure start's hubs as before, Skin wraps those at the frontier, and Off again unwraps them", async ({ page }) => {
  test.setTimeout(300_000);
  await observeGraph(page);
  await choose(page, "off", 2);
  await page.goto(entry());
  const expected = await expectedCells(page, 2);
  await settled(page);
  // Off: every node of the hops, every hub a hub, nothing wrapped.
  const off = await drawn(page);
  expect([...off.nodes.keys()].sort()).toEqual([...expected.shown].sort());
  expect(off.bubbles).toEqual({});
  expect(off.wrapped).toEqual([]);
  await page.getByText("Tuning", { exact: true }).click();
  const choice = page.locator("#tuning-force-group-wrappers");
  await choice.selectOption("skin");
  // Two hops: the top-level directories stand as hubs with their spokes, the next level as bubbles.
  expect(expected.cells.length, "two hops leave bubbles at the frontier").toBeGreaterThan(3);
  await expect.poll(async () => (await drawn(page)).bubbles, { timeout: 60_000 }).toEqual(bubblesOf(expected));
  await choice.selectOption("off");
  await expect.poll(async () => (await drawn(page)).bubbles, { timeout: 60_000 }).toEqual({});
  await expect.poll(async () => [...(await drawn(page)).nodes.keys()].sort(), { timeout: 30_000 }).toEqual([...expected.shown].sort());
  expect((await drawn(page)).wrapped).toEqual([]);
});

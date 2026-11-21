import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { GroupWrappers } from "../../packages/explorer/src/client/types";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { spatialScope, startHops, startOf } from "../../packages/explorer/src/client/views/forceGraphScope";
import { DRAWN_FILES } from "../../packages/explorer/src/client/views/forceGraphShells";
import { wrappedSeeds } from "../../packages/explorer/src/client/views/forceGraphWrappers";
import { observeGraph, renderedNodes } from "./force-graph-observation";
import { loadGraph } from "./still-picture";

/**
 * Group Wrappers, an experiment behind one Tuning choice (2026-11-05; the owner's proposal of November 4, [Turn 16 of the
 * November 3 record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-03/2026-11-03.1.record.md#turn-16--november-4)): with the
 * choice Off, the 3D Local Map draws no wrapper; with Skin, every disconnected group the picture shows only
 * by its seed, of two files or more, is drawn in a hull of its own files, a click on which pins the seed as a click on
 * the seed does, and releasing the pin wraps the group again. The wrappers are read from the mesh the page draws and the
 * groups expected are computed from the bundle by the same pure scope the page uses. On this repository's archipelago.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const entry = (): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", filters: { showTests: true, showAssets: false } })}`;

/** Choose the wrappers before the page starts, as a saved Tuning choice, keeping the suite's still Local Map search. */
async function chooseWrappers(page: Page, look: GroupWrappers): Promise<void> {
  await page.addInitScript(([key, version, choice]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: choice } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, look] as const);
}

/** What the wrappers' one mesh draws: its look, the seeds wrapped and those bursting open, and its triangles. */
async function drawnWrappers(page: Page): Promise<{ look: string; seeds: string[]; popping: string[]; triangles: number; visible: boolean }> {
  return page.evaluate(() => {
    const observed = (window as unknown as { renderedGraph?: { scene: { traverse(visit: (object: { name: string; visible: boolean; userData: Record<string, unknown> }) => void): void } } }).renderedGraph;
    let found = { look: "none", seeds: [] as string[], popping: [] as string[], triangles: 0, visible: false };
    observed?.scene.traverse(object => {
      if (object.name !== "Spatial wrappers") return;
      const info = object.userData.spatialWrappers as { look: string; seeds: string[]; popping: string[]; triangles: number };
      found = { ...info, visible: object.visible };
    });
    return found;
  });
}

/** The archipelago's groups of two files or more, each by its seed, and every group's size, over the bundle's own graph. */
async function expectedGroups(page: Page): Promise<{ wrapped: string[]; sizes: Map<string, number> }> {
  const graph = await loadGraph(page, "/");
  const data = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], "connections");
  const pulls = (link: { kind?: string }): boolean => linkPulls(link, "connections");
  const scope = spatialScope(data.nodes, data.links, startOf(data.nodes, data.links, "connections", pulls), startHops("connections", getDefaultTuning().forceGraph.hops), pulls);
  return { wrapped: wrappedSeeds(scope.groups), sizes: scope.groups };
}

const legendRow = (page: Page, label: RegExp) => page.locator("#spatial-legend .legend-row").filter({ hasText: label });
const WRAPPED_ROW = /^Wrapped group$/;
const RING_ROW = /^More connected$/;

test("explicit Off draws no wrapper, and the groups' seeds keep their rings", async ({ page }) => {
  await observeGraph(page);
  await chooseWrappers(page, "off");
  await page.goto(entry());
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  expect(await page.locator("#tuning-force-group-wrappers").inputValue()).toBe("off");
  expect(await drawnWrappers(page)).toMatchObject({ look: "off", seeds: [], triangles: 0, visible: false });
  await expect(legendRow(page, RING_ROW)).toBeVisible();
  await expect(legendRow(page, WRAPPED_ROW)).toHaveCount(0);
});

/** The page started with the default Skin, its wrappers built, and the groups it must wrap. */
async function skinArchipelago(page: Page): Promise<{ wrapped: string[]; sizes: Map<string, number> }> {
  await observeGraph(page);
  await page.goto(entry());
  const groups = await expectedGroups(page);
  // The research of November 5 counted 42 groups of two files or more among this repository's 95.
  expect(groups.wrapped.length, "this repository has many groups of two files or more").toBeGreaterThan(10);
  await expect.poll(async () => (await drawnWrappers(page)).seeds, { timeout: 10_000 }).toEqual(groups.wrapped);
  return groups;
}

test("the skin wraps every group of two files or more, in place of its seed's ring, and no sphere wears one", async ({ page }) => {
  const { wrapped } = await skinArchipelago(page);
  const drawn = await drawnWrappers(page);
  expect(drawn.look).toBe("skin");
  expect(drawn.visible).toBe(true);
  expect(drawn.triangles, "a hull is a closed surface of at least four triangles").toBeGreaterThanOrEqual(4 * wrapped.length);
  // The wrapper says what the ring said: the wrapped seeds wear none, and the key names the wrapped group instead.
  await expect(legendRow(page, WRAPPED_ROW)).toBeVisible();
  await expect(legendRow(page, RING_ROW)).toHaveCount(0);
  const seeds = await renderedNodes(page);
  expect(seeds.filter(node => wrapped.includes(node.id)).map(node => node.id).sort(), "every wrapped seed is drawn").toEqual(wrapped);
  for (const node of seeds.filter(node => wrapped.includes(node.id))) expect(node.ring, `${node.id} is wrapped, not ringed`).toBe(false);
  // Since 2026-11-18 no sphere wears a ring while a wrapper is on, a seed or not.
  expect(seeds.filter(node => node.ring).map(node => node.id), "no ring with the wrappers on").toEqual([]);
});

/**
 * The owner's picture of November 17 (Turn 12 of the November 16 record): this repository pinned on `archetype.ts` at one
 * hop, with both kinds of document shown. Rings stood there beside the membranes, on files with documents beyond the hops
 * and beside the one file of a directory beyond them; the owner: "Didn't we replace ringed nodes with membranes?" Since
 * 2026-11-18 none is drawn while a wrapper is on, and with the wrappers Off the ring stays, that picture's only sign.
 */
const OWNER_PIN = "packages/engine/src/live-docs/archetype.ts";
const ownerPicture = (groupWrappers: GroupWrappers): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections",
  pinSet: { entries: [{ nodeId: OWNER_PIN, symbol: "*" }] }, filters: { showTests: true, showAssets: false, showRelatedDocs: true, showCitingDocs: true },
  layout: { forceGraph: { groupWrappers, hops: 1 } } })}`;

test("with any wrapper on, the owner's picture with documents shown wears no ring; with the wrappers Off it keeps them", async ({ page }) => {
  test.setTimeout(120_000);
  await observeGraph(page);
  await page.goto(ownerPicture("off"));
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
  const off = await renderedNodes(page);
  // The same spheres the skin will show wear rings here: the picture leaves connections of theirs out.
  const ringedOff = off.filter(node => node.ring).map(node => node.id);
  expect(ringedOff.length, "with the wrappers Off the frontier wears rings").toBeGreaterThan(0);
  await expect(legendRow(page, RING_ROW)).toBeVisible();
  for (const look of ["skin", "cloud"] as const) {
    await page.goto(ownerPicture(look));
    await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
    await expect.poll(async () => (await drawnWrappers(page)).seeds.length, { timeout: 10_000 }).toBeGreaterThan(0);
    const nodes = await renderedNodes(page);
    expect(nodes.filter(node => ringedOff.includes(node.id)).length, `${look}: spheres ringed when Off stand here too`).toBeGreaterThan(0);
    expect(nodes.filter(node => node.ring).map(node => node.id), `${look}: no ring`).toEqual([]);
    await expect(legendRow(page, RING_ROW)).toHaveCount(0);
  }
});

test("the skin shows within each wrapped group every file it holds about its seed, and is drawn at their size", async ({ page }) => {
  // The owner on November 6: "I strongly prefer when I can see a bundle of nodes engulfed rather than just one which
  // suddenly appears to multiply into many" (second round): a group's skin is no longer fitted down to its seed's room.
  const { wrapped, sizes } = await skinArchipelago(page);
  await expect.poll(async () => (await page.evaluate(() => {
    let count = 0;
    (window as unknown as { renderedGraph: { scene: { traverse(visit: (object: { name: string; userData: Record<string, unknown> }) => void): void } } }).renderedGraph.scene.traverse(object => {
      if (object.name === "Spatial shell files") count = (object.userData.spatialUnits as unknown[]).length;
    });
    return count;
  })), { timeout: 10_000 }).toBeGreaterThan(0);
  const { units, ranges } = await page.evaluate(() => {
    const found = { units: [] as Array<{ seed: string; kind: string; x: number; y: number; z: number; radius: number }>, ranges: [] as Array<{ seed: string; x: number; y: number; z: number; radius: number }> };
    (window as unknown as { renderedGraph: { scene: { traverse(visit: (object: { name: string; userData: Record<string, unknown> }) => void): void } } }).renderedGraph.scene.traverse(object => {
      if (object.name === "Spatial shell files") found.units.push(...object.userData.spatialUnits as typeof found.units);
      if (object.name === "Spatial wrappers") found.ranges = (object.userData.spatialWrappers as { ranges: typeof found.ranges }).ranges;
    });
    return found;
  });
  // The picture draws at most DRAWN_FILES files within its skins, as one body does (2026-11-07): past it the bodies
  // farthest from what was asked are veiled, the largest first, each shown as one veiled bubble while its name keeps its
  // count. With nothing asked every seed stands at the same hop. This repository's archipelago came within 8 files of the
  // budget on 2026-11-19 (1,016 files beside their seeds) and passed it on 2026-11-21, when the readers of SQL,
  // PowerShell and .NET brought 1,137, and its largest group, 696 files, is veiled.
  // The rule written out here rather than asked of the page's own function: the largest bodies veiled, one by one, while
  // the files the skins would draw pass the budget.
  const veiled = new Set<string>();
  let drawing = wrapped.reduce((sum, seed) => sum + sizes.get(seed)! - 1, 0);
  for (const seed of [...wrapped].sort((a, b) => sizes.get(b)! - sizes.get(a)! || (a < b ? -1 : 1))) {
    if (drawing <= DRAWN_FILES) break;
    veiled.add(seed);
    drawing -= sizes.get(seed)! - 1;
  }
  const balloons = await page.evaluate(() => {
    const found: Array<{ seed: string; veiled?: boolean }> = [];
    (window as unknown as { renderedGraph: { scene: { traverse(visit: (object: { name: string; userData: Record<string, unknown> }) => void): void } } }).renderedGraph.scene.traverse(object => {
      if (object.name === "Spatial shell balloons") found.push(...object.userData.spatialUnits as typeof found);
    });
    return found;
  });
  for (const seed of wrapped) {
    const files = units.filter(unit => unit.seed === seed);
    if (veiled.has(seed)) {
      // A veiled body draws no file and one veiled bubble filling its skin.
      expect(files, `${seed}, veiled by the picture's budget, draws no file`).toEqual([]);
      expect(balloons.filter(unit => unit.seed === seed).map(unit => !!unit.veiled), `${seed}: one veiled bubble`).toEqual([true]);
      continue;
    }
    // Its files and its seed, drawn as a sphere of its own at the centre: as many as the group holds.
    expect(files.length + 1, seed).toBe(sizes.get(seed));
    const skin = ranges.find(range => range.seed === seed)!;
    for (const unit of files) expect(Math.hypot(unit.x - skin.x, unit.y - skin.y, unit.z - skin.z) + unit.radius, unit.seed).toBeLessThanOrEqual(skin.radius + 1e-3);
  }
});

test("hovering a wrapper names its group; a click pops it open into its files, and releasing the pin wraps it again", async ({ page }) => {
  const { wrapped, sizes } = await skinArchipelago(page);
  // The camera follows the first unfold, so the pointer aims at a picture at rest.
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const seeds = await renderedNodes(page);
  // Aim at a middling group's seed, among the small islands; a nearer wrapper may stand in front of it from this camera,
  // and then the pointer is over that one, which is the group the page names and pops: the test follows the page's pick.
  const aimed = wrapped.filter(seed => sizes.get(seed)! >= 5 && sizes.get(seed)! <= 40).sort((a, b) => sizes.get(b)! - sizes.get(a)! || a.localeCompare(b))[0];
  const seed = seeds.find(node => node.id === aimed)!;
  await page.mouse.move(seed.x, seed.y);
  const named = page.locator(".force-graph-label[data-priority=\"1\"]:not([hidden])");
  await expect(named, "hovering a wrapper names one group by its seed").toHaveCount(1);
  const chosen = (await named.getAttribute("data-node-id"))!;
  expect(wrapped, "the group named is a wrapped one").toContain(chosen);
  await expect(named).toHaveAttribute("title", new RegExp(` · ${sizes.get(chosen)} files in this group`));
  // The name says what a press does, which the key's row said until 2026-11-16 ("click to open it").
  await expect(named).toHaveAttribute("title", / · Open this group and pin this file$/u);
  // A click on the wrapper pins its seed, as a click on the seed does: the group grows and its wrapper bursts and is gone.
  await page.mouse.click(seed.x, seed.y);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await expect.poll(async () => (await drawnWrappers(page)).seeds.includes(chosen), { timeout: 5_000 }).toBe(false);
  await expect.poll(async () => (await drawnWrappers(page)).popping, { timeout: 5_000 }).toEqual([]);
  // The pinned group, shown now in part, holds its hidden files in directory shells (experiment 2, 2026-11-05): the other
  // groups' wrappers are as they were.
  expect((await drawnWrappers(page)).seeds.filter(seed => !seed.startsWith("shell:"))).toEqual(wrapped.filter(id => id !== chosen));
  await expect.poll(async () => (await renderedNodes(page)).length, { message: "the group grows by its hops", timeout: 5_000 }).toBeGreaterThan(seeds.length);
  // The group's files enter where its skin showed them (2026-11-06, second round), under the pointer that popped it: the
  // pointer leaves, so that its hover of one of them takes no part in the release.
  await page.mouse.move(2, 2);
  // Releasing the pin with Enter on the seed's name, which stays named while pinned, wraps the group again.
  // The name shown, the focus label or the name label: with directory shells beside it the two need not both be placed.
  const name = page.locator(`.force-graph-label[data-node-id="${chosen}"]:not([hidden]), .force-graph-focus[data-node-id="${chosen}"]:not([hidden])`).first();
  await expect(name).toBeVisible();
  await name.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
  await expect.poll(async () => (await drawnWrappers(page)).seeds, { timeout: 5_000 }).toEqual(wrapped);
});

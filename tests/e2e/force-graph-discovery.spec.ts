import { expect, test, type Page } from "@playwright/test";

import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { loadGraph } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { SpatialLayout } from "../../packages/explorer/src/client/types";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { spatialScope, startHops, startOf } from "../../packages/explorer/src/client/views/forceGraphScope";

/**
 * Discovery, the 3D Local Map's default since 2026-10-31 (the owner's direction, [Turn 4 of the October 31 record]
 * (../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)): the picture is what a person asked
 * about and the tuning's hops of connections around it, the last hop dimmed as the frontier, and, since 2026-11-02, the
 * seed of every group the hops do not reach, dimmed past the frontier; with nothing asked about, the layout's start, in
 * Connections the archipelago of every group's seed ([Turn 3 of the November 2 record]
 * (../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-3)). The spheres are read from the rendered scene and the expected picture is
 * computed from the bundle by the same pure scope the page uses, so that the test says what the picture must hold and
 * not merely that it holds something. On this repository's bundle; the counts are read from the sidebar's line.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const FULL = 0.75, FRONTIER = 0.3;

const entry = (extra: Partial<typeof DEFAULT_SNAPSHOT> = {}): string => `/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", filters: { showTests: true, showAssets: false }, ...extra
})}`;

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
}

/** The picture the page must show: the hops around the attention set, or around the start, over the bundle's own graph. */
async function expected(page: Page, layout: SpatialLayout, attention: ReadonlySet<string>, hops = getDefaultTuning().forceGraph.hops) {
  const graph = await loadGraph(page, "/");
  const data = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], layout);
  const pulls = (link: { kind?: string }): boolean => linkPulls(link, layout);
  const asked = attention.size ? attention : startOf(data.nodes, data.links, layout, pulls);
  const scope = spatialScope(data.nodes, data.links, asked, attention.size ? hops : startHops(layout, hops), pulls);
  return { asked, scope, files: data.nodes.filter(node => node.directoryPath === undefined).length };
}

/** Whether a shown sphere is drawn dimmed: at the last hop shown, or an unreached group's seed one past it. */
const dimmed = (hop: number, hops: number): boolean => hop > 0 && hop >= hops;

/** What is on screen: every sphere's id and alpha, and the sidebar's counts of files shown, groups and lone files. */
async function shown(page: Page): Promise<{ ids: Set<string>; alpha: Map<string, number>; counts: { shown: number; total: number; groups: number; alone: number } }> {
  const nodes = await renderedNodes(page);
  const text = (await page.locator("#stats-line").textContent()) ?? "";
  const counts = /([\d,]+) of ([\d,]+) files shown · ([\d,]+) groups?, ([\d,]+) alone/.exec(text);
  expect(counts, `the sidebar says how many files are shown, in how many groups, and how many stand alone: ${text}`).not.toBeNull();
  const number = (index: number): number => Number(counts![index].replace(/,/g, ""));
  return { ids: new Set(nodes.map(node => node.id)), alpha: new Map(nodes.map(node => [node.id, node.opacity])),
    counts: { shown: number(1), total: number(2), groups: number(3), alone: number(4) } };
}

test("with nothing asked about, the connections layout starts at the archipelago, every group's seed and nothing grown; a click on a seed pins it and grows its group, the other seeds dimmed", async ({ page }) => {
  // Each picture enters over the tuning's frames and settles on screen: the start takes some forty seconds of the software renderer.
  test.setTimeout(300_000);
  await observeGraph(page);
  await page.goto(entry());
  await settled(page);
  const { asked, scope, files } = await expected(page, "connections", new Set());
  // This repository's references fall into many groups: one large structure, islands and lone files, each with a seed.
  expect(asked.size, "every group has a seed").toBeGreaterThan(10);
  expect(scope.hops.size, "nothing is grown around a seed").toBe(asked.size);
  const picture = await shown(page);
  expect([...picture.ids].sort(), "the picture is exactly the seeds").toEqual([...asked].sort());
  for (const id of asked) expect(picture.alpha.get(id), `${id}, a seed, in full`).toBeCloseTo(FULL, 2);
  // The sidebar counts the groups of two or more files and the lone files apart, as Knowledge Sources and `inspect --groups` do.
  const alone = [...asked].filter(id => !scope.groups.has(id)).length, groups = asked.size - alone;
  expect(picture.counts).toEqual({ shown: asked.size, total: files, groups, alone });
  expect(picture.counts.shown, "a start is a part of the whole").toBeLessThan(files / 2);
  expect((await renderedLinks(page)).filter(wire => wire.visible), "no wire joins two groups").toEqual([]);
  await expect(page.locator("#spatial-legend .legend-row").filter({ hasText: /^Dimmed: a hop beyond, or another group; click to see more$/ })).toHaveCount(0);
  // The names stay off the seeds at rest (2026-11-02: "until the very last second"), so a seed is found by hovering it.
  const seeds = (await renderedNodes(page)).filter(node => asked.has(node.id));
  // A ring says a click will show more (the owner's choice of 2026-11-02): on a group's seed, whose connections the
  // start does not show, and on no lone file; the key says what the ring means.
  for (const node of seeds) expect(node.ring, `${node.id}: a ring only where the picture leaves connections out`).toBe((scope.beyond.get(node.id) ?? 0) > 0);
  expect(seeds.filter(node => node.ring).length, "the groups' seeds wear rings, the lone files none").toBe(groups);
  await expect(page.locator("#spatial-legend .legend-row").filter({ hasText: /^Ring: more connected, not shown; click to see it$/ })).toBeVisible();
  await expect(page.locator(".force-graph-label[data-node-id]")).toHaveCount(0);
  const largest = [...scope.groups.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  const seed = seeds.find(node => node.id === largest[0])!;
  await page.mouse.move(seed.x, seed.y);
  const label = page.locator(`.force-graph-label[data-node-id="${seed.id}"]`);
  await expect(label).toBeVisible();
  await expect(label, "the seed's hover says how large its group is").toHaveAttribute("title", new RegExp(`${largest[1].toLocaleString("en-US")} files in this group`));
  // A click pins the seed: its hops are shown in full with the last hop dimmed, and every other group stands by its seed, dimmed past the frontier.
  await label.click();
  await settled(page);
  const grown = await expected(page, "connections", new Set([seed.id]));
  const after = await shown(page);
  expect([...after.ids].sort(), "the pinned seed's hops, and the other seeds").toEqual([...grown.scope.hops.keys()].sort());
  for (const [id, hop] of grown.scope.hops) expect(after.alpha.get(id), `${id} at hop ${hop}`).toBeCloseTo(dimmed(hop, 2) ? FRONTIER : FULL, 2);
  // Grown, the rings move to where there is more now: a frontier sphere with connections beyond, another group's seed
  // with a group behind it, and none on a sphere whose connections are all on screen.
  for (const node of await renderedNodes(page)) expect(node.ring, `${node.id}: a ring only where the picture leaves connections out`).toBe((grown.scope.beyond.get(node.id) ?? 0) > 0);
  expect(grown.scope.groups.size, "every other group stands by its seed").toBe(asked.size - 1);
  expect(after.counts).toEqual({ shown: grown.scope.hops.size, total: files, groups, alone });
  await expect(page.locator("#spatial-legend .legend-row").filter({ hasText: /^Dimmed: a hop beyond, or another group; click to see more$/ })).toBeVisible();
  // A wire to the frontier is dimmed with it; a wire among the full spheres is not.
  const wires = await renderedLinks(page);
  const frontier = (id: string): boolean => dimmed(grown.scope.hops.get(id) ?? 0, 2);
  expect(wires.some(wire => (frontier(wire.source) || frontier(wire.target)) && wire.opacity < 0.2), "a wire to the frontier is dimmed").toBe(true);
  expect(wires.filter(wire => !frontier(wire.source) && !frontier(wire.target)).every(wire => wire.opacity > 0.25), "the wires among the full spheres are drawn whole").toBe(true);
  // A frontier sphere's name says how many of its connections the picture leaves out.
  const beyond = [...grown.scope.beyond.entries()].filter(([id]) => frontier(id));
  expect(beyond.length, "the frontier has connections beyond it").toBeGreaterThan(0);
  // The amount omitted stays visible in a short viewport, including while the person scrolls through Tuning.
  await page.setViewportSize({ width: 1065, height: 530 });
  await expect(page.locator("#stats-line")).toBeInViewport({ ratio: 1 });
  await page.locator(".sidebar-details > summary").click();
  await page.locator(".tuning-export").scrollIntoViewIfNeeded();
  await expect(page.locator("#stats-line")).toBeInViewport({ ratio: 1 });
  await page.locator(".tuning-export").click({ trial: true });
});

test("a pin is asked about: its hops are the picture, the hops lever narrows it, and the structure layout starts at the root", async ({ page }) => {
  // Each picture enters over the tuning's frames and settles on screen: the start takes some forty seconds of the software renderer.
  test.setTimeout(300_000);
  const pin = "packages/generator/src/generator.ts";
  await observeGraph(page);
  await page.goto(entry({ pinSet: { entries: [{ nodeId: pin, symbol: "*" }] } }));
  await settled(page);
  const two = await expected(page, "connections", new Set([pin]));
  const pinned = await shown(page);
  expect([...pinned.ids].sort(), "the picture is the pin's two hops").toEqual([...two.scope.hops.keys()].sort());
  expect(pinned.alpha.get(pin)).toBeCloseTo(FULL, 2);
  expect(pinned.counts.shown).toBe(two.scope.hops.size);

  // One hop shown: the direct connections, as the frontier.
  await page.addInitScript(() => {
    window.localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 }, forceGraph: { hops: 1 } } }));
  });
  await page.goto(entry({ pinSet: { entries: [{ nodeId: pin, symbol: "*" }] } }));
  await settled(page);
  const one = await expected(page, "connections", new Set([pin]), 1);
  const narrowed = await shown(page);
  expect([...narrowed.ids].sort(), "one hop around the pin").toEqual([...one.scope.hops.keys()].sort());
  expect(narrowed.counts.shown).toBeLessThan(pinned.counts.shown);
  for (const [id, hop] of one.scope.hops) expect(narrowed.alpha.get(id), `${id} at hop ${hop}`).toBeCloseTo(dimmed(hop, 1) ? FRONTIER : FULL, 2);
  await expect(page.locator("#tuning-force-hops")).toHaveValue("1");

  // The structure layout, with nothing asked about, starts at the scan root: its children in full, their children dimmed.
  await page.addInitScript(() => { window.localStorage.removeItem("live-docs-explorer:ui:v2"); });
  await page.goto(entry({ spatialLayout: "structure" }));
  await settled(page);
  const tree = await expected(page, "structure", new Set());
  expect([...tree.asked]).toEqual(["directory:"]);
  const root = await shown(page);
  expect([...root.ids].sort(), "the root, its children and their children").toEqual([...tree.scope.hops.keys()].sort());
  expect(root.alpha.get("directory:")).toBeCloseTo(FULL, 2);
  expect(root.alpha.get("directory:packages")).toBeCloseTo(FULL, 2);
  expect(root.alpha.get("directory:packages/explorer")).toBeCloseTo(FRONTIER, 2);
  expect(root.counts.shown, "the root's own files are shown; the rest are not").toBeLessThan(40);
});

test("discovery survives closing and sharing the reader; an open directory is shown whole", async ({ page }) => {
  // Each picture enters over the tuning's frames and settles on screen: the start takes some forty seconds of the software renderer.
  test.setTimeout(300_000);
  const pin = "packages/generator/src/generator.ts";
  await observeGraph(page);
  await page.goto(entry({ pinSet: { entries: [{ nodeId: pin, symbol: "*" }] } }));
  await settled(page);
  const before = await shown(page);
  // A file at the pin's frontier, two hops out, with connections of its own beyond it.
  const around = await expected(page, "connections", new Set([pin]));
  const frontierFile = [...around.scope.hops].filter(([id, hop]) => hop === 2 && (around.scope.beyond.get(id) ?? 0) > 0).map(([id]) => id).sort()[0];
  expect(frontierFile, "the pin's frontier has a file with more beyond it").toBeDefined();
  expect(before.alpha.get(frontierFile), "the file stands at the frontier before it is inspected").toBeCloseTo(FRONTIER, 2);
  await page.goto(entry({ pinSet: { entries: [{ nodeId: pin, symbol: "*" }] }, inspection: { kind: "file", nodeId: frontierFile } }));
  await settled(page);
  const grown = await shown(page);
  const both = await expected(page, "connections", new Set([pin, frontierFile]));
  expect([...grown.ids].sort(), "the picture is the pin's and the inspected file's hops").toEqual([...both.scope.hops.keys()].sort());
  expect(grown.alpha.get(frontierFile), "inspected, the file is shown in full").toBeCloseTo(FULL, 2);
  expect(grown.counts.shown).toBeGreaterThan(before.counts.shown);
  await page.getByRole("button", { name: "Close" }).first().click();
  await settled(page);
  const closed = await shown(page);
  expect([...closed.ids].sort(), "Close keeps the discovered neighborhood").toEqual([...grown.ids].sort());
  const shared = page.url();
  await page.goto("about:blank");
  await page.goto(shared);
  await settled(page);
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  expect([...(await shown(page)).ids].sort(), "the closed-reader address keeps discovery independently").toEqual([...grown.ids].sort());

  await page.goto(entry({ openDirectories: new Set(["packages/explorer/src/client/views"]) }));
  await settled(page);
  const graph = await loadGraph(page, "/");
  const members = graph.nodes.filter(node => node.id.startsWith("packages/explorer/src/client/views/") && (node.archetype || "").toLowerCase() !== "asset").map(node => node.id);
  const opened = await shown(page);
  for (const id of members) expect(opened.alpha.get(id), `${id} is in the open directory, shown whole`).toBeCloseTo(FULL, 2);
  const directory = await expected(page, "connections", new Set(members));
  expect([...opened.ids].sort(), "the directory's files and their hops").toEqual([...directory.scope.hops.keys()].sort());
});

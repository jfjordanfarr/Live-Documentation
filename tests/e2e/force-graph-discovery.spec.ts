import { expect, test, type Page } from "@playwright/test";

import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { loadGraph } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import type { SpatialLayout } from "../../packages/explorer/src/client/types";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { spatialScope, startOf } from "../../packages/explorer/src/client/views/forceGraphScope";

/**
 * Discovery, the 3D Local Map's default since 2026-10-31 (the owner's direction, [Turn 4 of the October 31 record]
 * (../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)): the picture is what a person asked
 * about and the tuning's hops of connections around it, the last hop dimmed as the frontier, and nothing beyond; with
 * nothing asked about, the layout's start. The spheres are read from the rendered scene and the expected picture is
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
  const scope = spatialScope(data.nodes, data.links, asked, hops, pulls);
  return { asked, scope, files: data.nodes.filter(node => node.directoryPath === undefined).length };
}

/** What is on screen: every sphere's id and alpha, and the sidebar's count of files shown. */
async function shown(page: Page): Promise<{ ids: Set<string>; alpha: Map<string, number>; counts: { shown: number; total: number } }> {
  const nodes = await renderedNodes(page);
  const text = (await page.locator("#stats-line").textContent()) ?? "";
  const counts = /([\d,]+) of ([\d,]+) files shown/.exec(text);
  expect(counts, `the sidebar says how many files are shown: ${text}`).not.toBeNull();
  return { ids: new Set(nodes.map(node => node.id)), alpha: new Map(nodes.map(node => [node.id, node.opacity])),
    counts: { shown: Number(counts![1].replace(/,/g, "")), total: Number(counts![2].replace(/,/g, "")) } };
}

test("with nothing asked about, the connections layout starts at the declared entry points, their hops in full and the last hop dimmed, and says how much is shown", async ({ page }) => {
  // Each picture enters over the tuning's frames and settles on screen: the start takes some forty seconds of the software renderer.
  test.setTimeout(300_000);
  await observeGraph(page);
  await page.goto(entry());
  await settled(page);
  const { asked, scope, files } = await expected(page, "connections", new Set());
  expect([...asked], "this repository declares the Explorer's page and stylesheet as its entry points").toEqual(["packages/explorer/src/client/index.ts", "packages/explorer/src/client/styles.css"]);
  const picture = await shown(page);
  expect([...picture.ids].sort(), "the picture is exactly the start's hops").toEqual([...scope.hops.keys()].sort());
  for (const [id, hop] of scope.hops) expect(picture.alpha.get(id), `${id} at hop ${hop}`).toBeCloseTo(hop === 2 ? FRONTIER : FULL, 2);
  expect(picture.counts).toEqual({ shown: scope.hops.size, total: files });
  expect(picture.counts.shown, "a start is a part of the whole").toBeLessThan(files / 2);
  await expect(page.locator("#spatial-legend .legend-row").filter({ hasText: /^Dimmed: a hop beyond; click to see more$/ })).toBeVisible();
  // A wire to the frontier is dimmed with it; a wire among the full spheres is not.
  const wires = await renderedLinks(page);
  const frontier = (id: string): boolean => scope.hops.get(id) === 2;
  expect(wires.some(wire => (frontier(wire.source) || frontier(wire.target)) && wire.opacity < 0.2), "a wire to the frontier is dimmed").toBe(true);
  expect(wires.filter(wire => !frontier(wire.source) && !frontier(wire.target)).every(wire => wire.opacity > 0.25), "the wires among the full spheres are drawn whole").toBe(true);
  // A frontier sphere's name says how many of its connections the picture leaves out.
  const beyond = [...scope.beyond.entries()].filter(([id]) => frontier(id));
  expect(beyond.length, "the frontier has connections beyond it").toBeGreaterThan(0);
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
  for (const [id, hop] of one.scope.hops) expect(narrowed.alpha.get(id), `${id} at hop ${hop}`).toBeCloseTo(hop === 1 ? FRONTIER : FULL, 2);
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

test("the inspected file is asked about, so the picture grows from it and recedes when the reader closes; an open directory is shown whole", async ({ page }) => {
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
  const receded = await shown(page);
  expect([...receded.ids].sort(), "the growth recedes with the reader; the pin's picture stays").toEqual([...before.ids].sort());

  await page.goto(entry({ openDirectories: new Set(["packages/explorer/src/client/views"]) }));
  await settled(page);
  const graph = await loadGraph(page, "/");
  const members = graph.nodes.filter(node => node.id.startsWith("packages/explorer/src/client/views/") && (node.archetype || "").toLowerCase() !== "asset").map(node => node.id);
  const opened = await shown(page);
  for (const id of members) expect(opened.alpha.get(id), `${id} is in the open directory, shown whole`).toBeCloseTo(FULL, 2);
  const directory = await expected(page, "connections", new Set(members));
  expect([...opened.ids].sort(), "the directory's files and their hops").toEqual([...directory.scope.hops.keys()].sort());
});

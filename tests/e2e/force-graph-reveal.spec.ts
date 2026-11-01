import { expect, test, type Page } from "@playwright/test";

import { engineActivity, observeGraph, renderedNodes, renderedPieces } from "./force-graph-observation";
import { loadGraph } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { nextRevealCount } from "../../packages/explorer/src/client/views/forceGraphReveal";
import { spatialScope } from "../../packages/explorer/src/client/views/forceGraphScope";

/**
 * The 3D Local Map enters in pieces (2026-10-28; by hops at a pace in frames since 2026-10-31): the first piece, what was
 * asked about directly with its first hop, at once, warmed hidden as the first picture always was, then a share of the whole at every frame
 * until every file is in, so that the hops read as waves, and only then does the picture come to rest. A membership
 * change keeps what is shown and brings the newcomers in the same way. The pieces are read from the rendered scene as
 * each frame is drawn, since at this size a tick is faster than a poll from outside the page; the sequence of sizes
 * drawn must be exactly the rule's. On this repository's bundle in the connections layout, where the picture is the
 * subject's two hops, or the start's. The viewport is modest because the software renderer's frame is the cost of every tick.
 */
test.use({ viewport: { width: 1100, height: 700 } });

const FRAMES = getDefaultTuning().forceGraph.revealFrames;

const entry = (showTests: boolean, selectedNodeId?: string): string => `/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT,
  perspective: "3d",
  spatialLayout: "connections",
  filters: { showTests, showAssets: true },
  ...(selectedNodeId ? { selectedNodeId } : {})
})}`;

/** The sizes a reveal passes through from `shown` to `total`, by the page's own rule, `shown` included. */
function rule(shown: number, total: number): number[] {
  const sizes = [shown];
  while (sizes[sizes.length - 1] < total) sizes.push(nextRevealCount(sizes[sizes.length - 1], total, FRAMES));
  return sizes;
}

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 90_000 });
}

test("the first picture enters from the subject with its first hop, a share of the whole a frame, and rests only when every file is in", async ({ page }) => {
  test.setTimeout(150_000);
  const subject = "packages/explorer/src/client/views/forceGraphView.ts";
  await observeGraph(page);
  await page.goto(entry(true, subject));
  await settled(page);
  const sizes = await renderedPieces(page);
  const whole = sizes[sizes.length - 1];
  // The first piece, by the shared scope: the subject and the files one hop from it.
  const graph = await loadGraph(page, "/");
  const data = spatialGraphOf(graph, () => true, [], "connections");
  const scope = spatialScope(data.nodes, data.links, new Set([subject]), getDefaultTuning().forceGraph.hops, link => linkPulls(link, "connections"));
  const first = [...scope.hops.values()].filter(hop => hop <= 1).length;
  expect(sizes[0], "the first piece is the subject with its first hop").toBe(first);
  expect(whole, "the subject's two hops are many files").toBeGreaterThan(FRAMES);
  expect(sizes, "the sizes the picture had, from the first piece to the whole").toEqual(rule(first, whole));
  expect(sizes.length, "the whole is in within the tuning's frames").toBeLessThanOrEqual(FRAMES + 1);
  expect((await renderedNodes(page)).some(node => node.id === subject), "the subject is in the picture").toBe(true);
  const { changes } = await engineActivity(page);
  expect(changes.map(change => change.busy), "the engine runs from the first tick to the one stillness, never stopping part way").toEqual([true, false]);
});

test("a membership change keeps what is shown and brings the newcomers in pieces of the rule's sizes", async ({ page }) => {
  test.setTimeout(150_000);
  await observeGraph(page);
  await page.goto(entry(false));
  await settled(page);
  const before = await renderedPieces(page);
  const shown = before[before.length - 1];
  const kept = new Set((await renderedNodes(page)).map(node => node.id));
  const { changes: untilNow } = await engineActivity(page);
  await page.getByLabel("Show Tests").check();
  await settled(page);
  const sizes = (await renderedPieces(page)).slice(before.length - 1);
  const whole = sizes[sizes.length - 1];
  expect(whole, "the tests shown make the start's picture bigger").toBeGreaterThan(shown);
  expect(sizes, "the sizes after the change: what was shown, then a share of the whole a frame to the whole").toEqual(rule(shown, whole));
  const after = await renderedNodes(page);
  expect(after.filter(node => kept.has(node.id)).length, "every sphere shown before the change is still shown").toBe(kept.size);
  const { changes } = await engineActivity(page);
  expect(changes.slice(untilNow.length).map(change => change.busy), "one run of the engine from the change to its stillness").toEqual([true, false]);
});

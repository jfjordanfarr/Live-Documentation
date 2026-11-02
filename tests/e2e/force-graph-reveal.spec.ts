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
  // Around a subject: the start's seeds are what is asked about there, and what is asked about enters at once (2026-11-02).
  const subject = "packages/explorer/src/client/views/forceGraphView.ts";
  await observeGraph(page);
  await page.goto(entry(false, subject));
  await settled(page);
  const before = await renderedPieces(page);
  const shown = before[before.length - 1];
  const { changes: untilNow } = await engineActivity(page);
  // The picture before and after, by the shared scope: the tests shown join groups the subject's hops do not reach, and a
  // group whose most connected file changes stands by its new seed, so a seed or two can leave as the newcomers enter.
  const graph = await loadGraph(page, "/");
  const scopeOf = (showTests: boolean): Set<string> => {
    const data = spatialGraphOf(graph, node => showTests || (node.archetype || "").toLowerCase() !== "test", [], "connections");
    return new Set(spatialScope(data.nodes, data.links, new Set([subject]), getDefaultTuning().forceGraph.hops, link => linkPulls(link, "connections")).hops.keys());
  };
  const was = scopeOf(false), is = scopeOf(true);
  const kept = [...was].filter(id => is.has(id));
  expect(shown, "the picture before the change is the subject's scope").toBe(was.size);
  await page.getByLabel("Show Tests").check();
  await settled(page);
  const sizes = (await renderedPieces(page)).slice(before.length - 1);
  const whole = sizes[sizes.length - 1];
  expect(whole, "the tests shown make the subject's picture bigger").toBe(is.size);
  expect(sizes, "the sizes after the change: what was shown, then from what is kept a share of the whole a frame to the whole").toEqual([shown, ...rule(kept.length, whole).slice(1)]);
  const after = await renderedNodes(page);
  expect(after.map(node => node.id).filter(id => was.has(id)).sort(), "every sphere shown before the change and still in the picture is shown").toEqual(kept.sort());
  const { changes } = await engineActivity(page);
  expect(changes.slice(untilNow.length).map(change => change.busy), "one run of the engine from the change to its stillness").toEqual([true, false]);
});

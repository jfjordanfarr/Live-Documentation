import { expect, test, type Page } from "@playwright/test";

import { engineActivity, observeGraph, renderedNodes, renderedPieces } from "./force-graph-observation";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { nextRevealCount, REVEAL } from "../../packages/explorer/src/client/views/forceGraphReveal";

/**
 * The 3D Local Map enters in pieces (2026-10-28): the first piece at once, warmed hidden as the first picture always was,
 * then a share more at every tick until every file is in, and only then does the picture come to rest. A membership
 * change keeps what is shown and brings the newcomers in the same way. The pieces are read from the rendered scene as
 * each frame is drawn, since at this size a tick is faster than a poll from outside the page; the sequence of sizes
 * drawn must be exactly the rule's. On this repository's bundle in the connections layout, where the picture is bigger
 * than the first piece. The viewport is modest because the software renderer's frame is the cost of every tick.
 */
test.use({ viewport: { width: 1100, height: 700 } });

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
  while (sizes[sizes.length - 1] < total) sizes.push(nextRevealCount(sizes[sizes.length - 1], total, REVEAL.share, REVEAL.least));
  return sizes;
}

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 90_000 });
}

test("the first picture enters in pieces of the rule's sizes, the subject in the first, and rests only when every file is in", async ({ page }) => {
  test.setTimeout(150_000);
  const subject = "packages/explorer/src/client/views/forceGraphView.ts";
  await observeGraph(page);
  await page.goto(entry(true, subject));
  await settled(page);
  const sizes = await renderedPieces(page);
  const whole = sizes[sizes.length - 1];
  expect(whole, "the whole picture is bigger than the first piece").toBeGreaterThan(REVEAL.first);
  expect(sizes, "the sizes the picture had, from the first piece to the whole").toEqual(rule(REVEAL.first, whole));
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
  expect(whole, "the tests shown make the picture bigger").toBeGreaterThan(shown);
  expect(sizes, "the sizes after the change: what was shown, then a share more at a tick to the whole").toEqual(rule(shown, whole));
  const after = await renderedNodes(page);
  expect(after.filter(node => kept.has(node.id)).length, "every sphere shown before the change is still shown").toBe(kept.size);
  const { changes } = await engineActivity(page);
  expect(changes.slice(untilNow.length).map(change => change.busy), "one run of the engine from the change to its stillness").toEqual([true, false]);
});

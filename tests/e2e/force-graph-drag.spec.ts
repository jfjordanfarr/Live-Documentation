import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { observeGraph, renderedNodes } from "./force-graph-observation";
import { loadGraph } from "./still-picture";

/**
 * A drag brings the simulation back (the owner, 2026-11-22: "I notice that the 3D graph stops simulating rather
 * quickly. It's efficient, which is awesome, but the one place I would want that responsiveness back is when I'm
 * clicking and dragging an item and swinging the graph around with me"). While a sphere is in a hand the forces run
 * at the pace a settle runs at, so that what is tied to it follows the hand as it moves and not only once it stops;
 * let go, the picture cools to rest as a settle does. On this repository's map with one file pinned, a picture stiff
 * enough that a tick of its motion takes several substeps: there, until that day, a moving hand held the motion to one
 * substep a frame, and a tied file trailed far behind it.
 *
 * And a drag swings what it holds (the owner, 2026-11-23, of the two ways Tuning's Drag offered: "I like \"Swings\" a
 * little bettter"): the files tied to the held sphere let go of where they stood and follow it by their ties alone,
 * while every other sphere is held toward where it stood. Since the same day's pick rule the hand takes the sphere
 * itself, where the press had taken a directory shell in front of it. Measured that day: under the way not chosen,
 * every file held toward where it stood, the sphere let go came back to 0.489 of the hand's way, against the bound of a
 * half below, red in one whole run and passed in the next with nothing in the motion changed; swinging, it kept 0.70,
 * and the tied files had come 1.16 of their final way when the hand arrived, against the bar of 0.6
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/landing/README.md`).
 */
test.use({ viewport: { width: 1440, height: 900 } });

const PIN = "packages/engine/src/live-docs/graph.ts";
const entry = `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", pinSet: { entries: [{ nodeId: PIN, symbol: "*" }] } })}`;
const map = (page: Page) => page.locator("#graph-svg");
/**
 * The share of its own way a tied file has come, at the median, when the hand arrives. Measured on 2026-11-22 with an
 * instrument that made the same drag: about 0.3 on the build before the mend.
 */
const FOLLOWED = 0.6;

type Places = Map<string, { x: number; y: number; z: number; sx: number; sy: number }>;
const places = async (page: Page): Promise<Places> => new Map((await renderedNodes(page)).map(node => [node.id, { ...node.world, sx: node.x, sy: node.y }]));
const moved = (from: Places, to: Places, id: string): number => {
  const a = from.get(id)!, b = to.get(id)!;
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
};

test("files tied to a dragged sphere swing after it while the hand still moves, and the map rests again once it is let go", async ({ page }) => {
  test.setTimeout(240_000);
  await observeGraph(page);
  await page.goto(entry);
  await expect(map(page)).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
  const graph = await loadGraph(page, "/");
  const id = (end: string | { id: string }): string => typeof end === "string" ? end : end.id;
  const tied = new Set(graph.links.flatMap(link => id(link.source) === PIN ? [id(link.target)] : id(link.target) === PIN ? [id(link.source)] : []));
  const before = await places(page);
  const neighbours = [...tied].filter(file => before.has(file));
  expect(neighbours.length, "files tied to the pinned file stand in the picture as spheres").toBeGreaterThan(3);
  const at = before.get(PIN)!;
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, { x: at.sx, y: at.sy }), "the pinned sphere stands over the bare canvas").toBe("CANVAS");

  // The hand takes the sphere and carries it across the picture in forty moves, never pausing.
  await page.mouse.move(at.sx, at.sy);
  await page.mouse.down();
  for (let step = 1; step <= 40; step++) await page.mouse.move(at.sx + step * 7, at.sy - step * 3);
  // Read at once, the button still down: where the tied files are while the hand has only just arrived.
  const carried = await places(page);
  const hand = moved(before, carried, PIN);
  expect(hand, "the sphere went with the hand").toBeGreaterThan(50);
  await expect(map(page), "the forces run while a sphere is held").toHaveAttribute("aria-busy", "true");

  // Let go, the picture cools to rest as a settle does, the sphere staying where it was put.
  await page.mouse.up();
  await expect(map(page)).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
  const rested = await places(page);
  const kept = moved(before, rested, PIN) / hand;
  // How far each tied file had come when the hand arrived, as a share of the way it goes in the end: the picture's
  // gravity and the rest of the map still act on a tied file, so its own way, not the hand's, is the measure.
  const shares = neighbours.filter(file => moved(before, rested, file) > 10).map(file => moved(before, carried, file) / moved(before, rested, file)).sort((a, b) => a - b);
  const median = shares[Math.floor(shares.length / 2)];
  console.log(`DRAG-READING ${JSON.stringify({ kept: Number(kept.toFixed(3)), median: median === undefined ? null : Number(median.toFixed(3)), tiedMoved: shares.length })}`);
  expect(kept, "the sphere rests near where the hand left it, not where it began").toBeGreaterThan(1 / 2);
  expect(shares.length, "tied files that the drag moved in the end").toBeGreaterThan(3);
  expect(median, `the tied files had come most of their way by the time the hand arrived (shares: ${shares.map(share => share.toFixed(2)).join(", ")})`).toBeGreaterThan(FOLLOWED);
  const settled = await places(page);
  for (const file of neighbours) expect(moved(rested, settled, file), `${file} is still at rest`).toBeLessThan(1e-6);
});

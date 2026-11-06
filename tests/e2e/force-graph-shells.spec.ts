import { expect, test, type Page } from "@playwright/test";

import { observeGraph } from "./force-graph-observation";
import { loadGraph } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { GroupWrappers } from "../../packages/explorer/src/client/types";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls, shellRadius } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { connectedNeighbours, spatialScope } from "../../packages/explorer/src/client/views/forceGraphScope";
import { shellPicture, type ShellPicture } from "../../packages/explorer/src/client/views/forceGraphShells";

/**
 * Directory shells, experiment 2 of the shrink-wrap work behind the Group Wrappers choice (2026-11-05; the owner's
 * correction of [Turn 11 of the November 5 record](../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11)):
 * with the choice Off, the default, no shell is drawn; with Skin, the files a pinned picture leaves out of the group it
 * shows in part stand as one body per directory at the Shell Depth, each wired to what its files reference; a click pops
 * a shell into its own files and its subdirectories' shells, and its directory's name wraps it again. The shells drawn
 * are read from the page's own buffers and the shells expected are computed from the bundle by the pure functions the
 * page runs.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const REPO_PIN = "packages/explorer/src/client/views/forceGraphView.ts";
const ESTATE_PIN = "PaymentService/PaymentService.cs";
const entry = (base: string, pin: string): string => `${base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections",
  filters: { showTests: true, showAssets: false }, pinSet: { entries: [{ nodeId: pin, symbol: "*" }] } })}`;

/** Choose the wrappers and the shells' depth before the page starts, as saved Tuning choices, keeping the suite's still Local Map search. */
async function choose(page: Page, look: GroupWrappers, shellDepth = getDefaultTuning().forceGraph.shellDepth): Promise<void> {
  await page.addInitScript(([key, version, wrappers, depth]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: wrappers, shellDepth: depth } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, look, shellDepth] as const);
}

/** The shells a pinned picture holds, by the page's own pure functions over the bundle, with some directories popped. */
async function expectedShells(page: Page, base: string, pin: string, depth: number, popped: readonly string[] = []): Promise<ShellPicture> {
  const graph = await loadGraph(page, base);
  const data = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], "connections");
  const pulls = (link: { kind?: string }): boolean => linkPulls(link, "connections");
  const scope = spatialScope(data.nodes, data.links, new Set([pin]), getDefaultTuning().forceGraph.hops, pulls);
  return shellPicture({ nodes: data.nodes, links: data.links, shown: new Set(scope.hops.keys()), hidden: scope.hidden, depth, popped: new Set(popped),
    beside: connectedNeighbours(data.nodes, data.links, pulls), bundles: link => pulls(link) && link.kind !== "related-doc" && link.kind !== "cited-by" });
}

/** What the page draws: its nodes, the shells among them with their wires, and the wrappers' mesh. */
async function drawnShells(page: Page): Promise<{ nodes: string[]; shells: string[]; shellWires: number; wrapped: string[]; popping: string[] }> {
  return page.evaluate(() => {
    type Entry = { data: { id: string; shellFiles?: number; source: string | { id: string }; target: string | { id: string } } };
    const observed = (window as unknown as { renderedGraph?: { scene: { traverse(visit: (object: { name: string; userData: Record<string, unknown> }) => void): void } } }).renderedGraph;
    const found = { nodes: [] as string[], shells: [] as string[], shellWires: 0, wrapped: [] as string[], popping: [] as string[] };
    let links: Entry[] = [];
    observed?.scene.traverse(object => {
      const batch = object.userData.spatialBatch as { kind: string; entries: Entry[] } | undefined;
      if (batch?.kind === "nodes") for (const { data } of batch.entries) (data.shellFiles === undefined ? found.nodes : found.shells).push(data.id);
      if (batch?.kind === "links") links = batch.entries;
      if (object.name === "Spatial wrappers") {
        const info = object.userData.spatialWrappers as { seeds: string[]; popping: string[] };
        found.wrapped = info.seeds; found.popping = info.popping;
      }
    });
    const shells = new Set(found.shells);
    for (const { data } of links) {
      const a = typeof data.source === "string" ? data.source : data.source.id, b = typeof data.target === "string" ? data.target : data.target.id;
      if (shells.has(a) || shells.has(b)) found.shellWires++;
    }
    found.nodes.sort(); found.shells.sort();
    return found;
  });
}

/** Where a node stands on screen, and how large its body draws there. */
async function screenOf(page: Page, id: string, radius: number): Promise<{ x: number; y: number; r: number } | null> {
  return page.evaluate(([wanted, size]) => {
    type Datum = { id: string; x: number; y: number; z: number };
    type Projector = { project(camera: unknown): { x: number; y: number }; clone(): Projector; set(x: number, y: number, z: number): Projector };
    const observed = (window as unknown as { renderedGraph: { camera: { position: Projector; matrixWorld: { elements: number[] } };
      scene: { traverse(visit: (object: { userData: Record<string, unknown> }) => void): void } } }).renderedGraph;
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    let found: { x: number; y: number; r: number } | null = null;
    observed.scene.traverse(object => {
      const batch = object.userData.spatialBatch as { kind: string; entries: Array<{ data: Datum }> } | undefined;
      if (batch?.kind !== "nodes") return;
      for (const { data } of batch.entries) if (data.id === wanted) {
        const right = observed.camera.matrixWorld.elements;
        const at = observed.camera.position.clone().set(data.x, data.y, data.z).project(observed.camera);
        const rim = observed.camera.position.clone().set(data.x + right[0] * size, data.y + right[1] * size, data.z + right[2] * size).project(observed.camera);
        found = { x: rect.left + (at.x + 1) * rect.width / 2, y: rect.top + (1 - at.y) * rect.height / 2, r: Math.abs(rim.x - at.x) * rect.width / 2 };
      }
    });
    return found;
  }, [id, radius] as const);
}

const legendRow = (page: Page, label: RegExp) => page.locator("#spatial-legend .legend-row").filter({ hasText: label });
const SHELL_ROW = /^Shell: N files of a directory; click to open it$/;

test("off, the default, draws no shell: the pinned picture is its hops alone", async ({ page }) => {
  await observeGraph(page);
  await page.goto(entry("/samples/estate/", ESTATE_PIN));
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  expect(await page.locator("#tuning-force-group-wrappers").inputValue()).toBe("off");
  const expected = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 2);
  expect(expected.shells.length, "the estate's pinned picture would have shells to draw").toBeGreaterThan(0);
  const drawn = await drawnShells(page);
  expect(drawn.shells).toEqual([]);
  expect(drawn.wrapped).toEqual([]);
  await expect(legendRow(page, SHELL_ROW)).toHaveCount(0);
});

test("the skin holds this repository's hidden files in a shell per directory two deep, each wired by its bundled references", async ({ page }) => {
  await observeGraph(page);
  await choose(page, "skin");
  await page.goto(entry("/", REPO_PIN));
  const expected = await expectedShells(page, "/", REPO_PIN, 2);
  // Measured on November 5: 328 hidden files in 10 shells, 134 bundled wires, no file loose.
  expect(expected.shells.length, "this repository's pinned picture has several shells").toBeGreaterThan(4);
  const ids = expected.shells.map(shell => shell.id).sort();
  // The shells enter with their hop of the reveal and are wrapped as their hulls are built, a few a frame.
  await expect.poll(async () => (await drawnShells(page)).shells, { timeout: 20_000 }).toEqual(ids);
  await expect.poll(async () => (await drawnShells(page)).wrapped.filter(id => id.startsWith("shell:")).sort(), { timeout: 10_000 }).toEqual(ids);
  expect((await drawnShells(page)).shellWires, "one wire for each pair of ends the members' references join").toBe(expected.wires.length);
  for (const shell of expected.shells) expect(expected.wires.some(wire => wire.source === shell.id || wire.target === shell.id), shell.directory).toBe(true);
  await expect(legendRow(page, SHELL_ROW)).toBeVisible();
});

test("a click pops a shell into its own files and a shell of a subdirectory, and its directory's name wraps it again", async ({ page }) => {
  await observeGraph(page);
  await choose(page, "skin", 1);
  await page.goto(entry("/samples/estate/", ESTATE_PIN));
  const before = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 1);
  const portal = before.shells.find(shell => shell.directory === "Portal")!;
  expect(portal, "the estate's portal stands as one shell one directory deep").toBeDefined();
  const after = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 1, ["Portal"]);
  const subShells = after.shells.filter(shell => shell.directory.startsWith("Portal/")).map(shell => shell.id);
  expect(after.released.length, "the pop releases files").toBeGreaterThan(0);
  expect(subShells.length, "the pop leaves a subdirectory's shell").toBeGreaterThan(0);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  await expect.poll(async () => (await drawnShells(page)).wrapped).toContain(portal.id);
  // Aim at the shell where the pointer names it: its centre, or a point within its body when a sphere stands in front.
  const radius = shellRadius(portal.files.length, getDefaultTuning().forceGraph);
  const at = (await screenOf(page, portal.id, radius))!;
  const named = page.locator(`.force-graph-label[data-node-id="${portal.id}"]:not([hidden])`);
  let aimed: { x: number; y: number } | null = null;
  for (const [dx, dy] of [[0, 0], [0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) {
    const point = { x: at.x + dx * at.r, y: at.y + dy * at.r };
    await page.mouse.move(point.x, point.y);
    if (await named.isVisible().catch(() => false) && await named.getAttribute("data-priority").catch(() => null) === "1") { aimed = point; break; }
  }
  expect(aimed, "the pointer names the shell somewhere within its body").not.toBeNull();
  await expect(named).toHaveAttribute("title", new RegExp(`^Portal · ${portal.files.length} files · Open this shell$`));
  await page.mouse.click(aimed!.x, aimed!.y);
  // Nothing was pinned: the pop is the view's own, the shell is gone, its files and its subdirectory's shell are drawn.
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await expect.poll(async () => (await drawnShells(page)).shells, { timeout: 5_000 }).toEqual(after.shells.map(shell => shell.id).sort());
  const opened = await drawnShells(page);
  for (const id of after.released) expect(opened.nodes, id).toContain(id);
  // Wrapping again: the directory keeps a dimmed name where its files stand, a click on which brings the shell back.
  const chip = page.locator('.force-graph-label[data-kind="popped"][data-directory="Portal"]');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveAttribute("data-context", "true");
  // The name follows its files while they settle, some 15 s on this picture: the keyboard acts on it where it stands.
  await chip.focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await drawnShells(page)).shells, { timeout: 5_000 }).toEqual(before.shells.map(shell => shell.id).sort());
  const wrapped = await drawnShells(page);
  for (const id of after.released) expect(wrapped.nodes, id).not.toContain(id);
  await expect(chip).toHaveCount(0);
});

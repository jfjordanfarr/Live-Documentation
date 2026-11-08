import { test, expect, type Page } from "@playwright/test";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";
import { localRetainUrl } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { spatialScope, startHops, startOf } from "../../packages/explorer/src/client/views/forceGraphScope";
import { explorerGraphOf } from "../../packages/explorer/src/shared/graph";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";

const GRAPH = "packages/engine/src/live-docs/graph.ts";
const DOCUMENT = "packages/engine/src/live-docs/document.ts";

async function expectFocused(page: Page, id: string): Promise<void> {
  const label = page.locator(".force-graph-focus");
  await expect(label).toHaveAttribute("data-node-id", id);
  await expect(label).toBeVisible();
  await expect.poll(() => page.locator("#graph-svg").evaluate(element => {
    const marker = element.querySelector<HTMLElement>(".force-graph-focus")!;
    const frame = element.getBoundingClientRect();
    const controls = [...document.querySelectorAll<HTMLElement>(".perspective-controls:not([hidden]), .history-scrubber:not([hidden])")]
      .map(control => control.getBoundingClientRect()).filter(box => box.width && box.top > frame.top && box.bottom <= frame.bottom + 1);
    const bottom = Math.min(frame.bottom, ...controls.map(box => box.top)) - frame.top;
    return Math.hypot(parseFloat(marker.style.left) - element.clientWidth / 2, parseFloat(marker.style.top) - bottom / 2);
  })).toBeLessThan(8);
}

/**
 * A point on a file's rendered sphere that no nearer sphere covers: its centre when that is clear, else a point
 * part way out on its disc; null when a bigger neighbour standing in front covers the whole of it (pathfind.ts
 * came to cover graph.ts at the camera's centre once the graph gained its files, 2026-10-15).
 */
async function hittablePoint(page: Page, id: string): Promise<{ x: number; y: number } | null> {
  const nodes = await renderedNodes(page);
  const target = nodes.find(node => node.id === id)!;
  const nearer = nodes.filter(node => node.id !== id && node.depth < target.depth);
  const covered = (x: number, y: number): boolean => nearer.some(node => Math.hypot(node.x - x, node.y - y) <= node.screenRadius + 2);
  const candidates = [[0, 0], ...Array.from({ length: 8 }, (_, i) => [Math.cos(i * Math.PI / 4), Math.sin(i * Math.PI / 4)])];
  for (const scale of [0, 0.5, 0.75]) {
    for (const [dx, dy] of candidates) {
      const x = target.x + dx * target.screenRadius * scale;
      const y = target.y + dy * target.screenRadius * scale;
      if (!covered(x, y) && await page.evaluate(({ x, y }) =>
        document.elementFromPoint(x, y) === document.querySelector("#graph-svg canvas"), { x, y })) return { x, y };
    }
  }
  return null;
}

/** Orbit the camera a little, as a person would, until the file's sphere shows past whatever stands in front of it. */
async function uncover(page: Page, id: string): Promise<{ x: number; y: number }> {
  for (let turn = 0; turn < 8; turn++) {
    const point = await hittablePoint(page, id);
    if (point) return point;
    const box = (await page.locator("#graph-svg canvas").boundingBox())!;
    const cx = box.x + box.width / 2 + 200;
    const cy = box.y + box.height / 2 + 200;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 90, cy + 30, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  }
  throw new Error(`${id} stayed covered by nearer spheres after eight turns of the camera`);
}

test("a focused URL centers its node, direct clicks pin it, and More opens its details", async ({ page }) => {
  await observeGraph(page);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  // Hit the rendered sphere, not the HTML label, to verify the camera's target.
  const point = await uncover(page, GRAPH);
  await page.mouse.click(point.x, point.y);
  expect(currentSnapshot(page).selectedNodeId).toBe(GRAPH);
  expect(currentSnapshot(page).pinSet.entries).toEqual([{ nodeId: GRAPH, symbol: "*" }]);
  expect(currentSnapshot(page).inspection).toBeNull();
  await page.locator(".force-graph-actions").getByRole("button", { name: "More actions for graph.ts", exact: true }).click();
  await page.getByRole("menuitem", { name: "Inspect graph.ts", exact: true }).click();
  await expect(page.locator("#detail-panel")).toContainText(GRAPH);
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
  await page.locator("#detail-panel").getByRole("button", { name: "Centre on graph.ts", exact: true }).click();
  // Opening the Local Map respects the representation already chosen.
  await expectFocused(page, GRAPH);
  await expect(page.locator("#view-graph.active")).toBeVisible();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(`.node-card.local-focus[data-id="${GRAPH}"]`)).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expectFocused(page, GRAPH);
});

/**
 * The longest a press of 2D or 3D may hold the page's main thread on the focus case's picture for the switch's own work,
 * in milliseconds: its capture, its hold and its handing over. Measured on 2026-11-07 at 10 s and 15 s with the 2D map's
 * render included, and after the fix at 0.2 to 0.3 s each beside that render on a busy night (2026-11-08). A press of 2D
 * also pays the 2D map's own render of the picture, which any arrival in 2D pays (0.9 to 1.2 s on this machine) and which
 * the page measures as "live-docs:switch-render"; that render is the 2D map's cost, not the switch's, and is left out of
 * the bound.
 */
const PRESS_BOUND = 500;

/**
 * The longest the page may leave a timer waiting from the press's return until the transition's layer goes, in
 * milliseconds: the switch's later work (the cards' copies, made in slices of 16 ms, and the transition's frames) must
 * leave the page answering. The fixed bundle's longest wait was 0.19 to 0.32 s on this machine (2026-11-08), where the 3D
 * picture's software renderer draws a frame in a few hundred milliseconds; before the fix the copies alone held the page
 * for seconds in one task.
 */
const WAIT_BOUND = 1000;

/**
 * How long after its start the transition's first frame may come, in milliseconds: the directory membranes peel in its
 * first 0.3 s, and what comes before its first frame is never seen. Before the switch-cost fix the first frame came 4.6 s
 * late on the way to 2D, the page laying out its copy of every element of the 2D map; after it, 83 to 179 ms on this
 * machine (2026-11-08), where a frame of the 3D picture's software renderer takes a few hundred milliseconds.
 */
const FIRST_FRAME_BOUND = 400;

/** Note when the transition's layer is appended, its start to well under a millisecond, before the page's code runs. */
async function noteTransitionStart(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const append = Element.prototype.append;
    Element.prototype.append = function (this: Element, ...nodes: (Node | string)[]) {
      append.apply(this, nodes);
      if (this === document.body && nodes.some(node => node instanceof HTMLElement && node.classList.contains("perspective-transition") && node.dataset.graphFiles)) {
        (window as unknown as { transitionStarted: number }).transitionStarted = performance.now();
      }
    };
  });
}

/**
 * One press of 2D or 3D, timed in the page from the click until the press's own work is done (its handler and the
 * microtasks it queued, read at the next task), and the transition watched every frame until its layer goes: the
 * travelling names shown, the directory membranes and the folding cards drawn.
 */
async function timedPress(page: Page, label: "2D" | "3D") {
  return page.evaluate(label => new Promise<{ returned: number; render: number | null; longestWait: number; firstFrame: number | null; layer: boolean; names: string[]; membranes: number; cards: number; folding: boolean }>(resolve => {
    const button = [...document.querySelectorAll<HTMLButtonElement>(".perspective-controls button")].find(each => each.textContent === label)!;
    const names = new Set<string>();
    let membranes = 0, cards = 0, folding = false, seen = false, returned = 0, render: number | null = null, longestWait = 0, done = false, firstFrame: number | null = null;
    const finish = (): void => {
      if (done) return;
      done = true;
      resolve({ returned, render, longestWait, firstFrame, layer: seen, names: [...names], membranes, cards, folding });
    };
    // A timer every 20 ms from the press's return: how late it runs is how long the page leaves input waiting.
    const beat = (expected: number): void => {
      if (done) return;
      longestWait = Math.max(longestWait, performance.now() - expected);
      const due = performance.now() + 20;
      setTimeout(() => beat(due), 20);
    };
    const watch = (): void => {
      const layer = document.querySelector<HTMLElement>(".perspective-transition[data-graph-files]");
      if (!layer) {
        if (seen) finish();
        else requestAnimationFrame(watch);
        return;
      }
      // The first frame after the layer's start, on the clock: how much of the transition went unseen.
      if (!seen) firstFrame = performance.now() - ((window as unknown as { transitionStarted?: number }).transitionStarted ?? NaN);
      seen = true;
      for (const name of layer.querySelectorAll<HTMLElement>(".perspective-file-name")) if (Number(name.style.opacity) > 0) names.add(name.dataset.nodeId!);
      membranes = Math.max(membranes, layer.querySelectorAll("[data-transition-directory]").length);
      const drawn = [...layer.querySelectorAll<HTMLElement>(".perspective-card")];
      cards = Math.max(cards, drawn.length);
      folding ||= drawn.some(card => Number(card.style.opacity) > 0 && Number(card.style.opacity) < 1);
      requestAnimationFrame(watch);
    };
    const channel = new MessageChannel(), started = performance.now();
    channel.port1.onmessage = () => {
      returned = performance.now() - started;
      render = performance.getEntriesByName("live-docs:switch-render").filter(entry => entry.startTime >= started).at(-1)?.duration ?? null;
      requestAnimationFrame(watch);
      const due = performance.now() + 20;
      setTimeout(() => beat(due), 20);
      // A transition that never shows its layer is reported as such rather than by the test's timeout.
      setTimeout(finish, 60_000);
    };
    button.click();
    channel.port2.postMessage(null);
  }), label);
}

test("the 2D and 3D presses return at once, and the transition still folds the cards, peels the membranes and carries the names", async ({ page }) => {
  // The focus case's picture, where each press had blocked the page for ten and fifteen seconds (2026-11-07): the hold
  // copied the whole source surface, every computed property of every element, and the capture copied every card of
  // the 2D map, most of them outside the frame.
  test.setTimeout(120_000);
  await observeGraph(page);
  await noteTransitionStart(page);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  const toMap = await timedPress(page, "2D");
  await expect(page.locator(`.node-card.local-focus[data-id="${GRAPH}"]`)).toBeVisible();
  const toGraph = await timedPress(page, "3D");
  await expectFocused(page, GRAPH);
  // The readings, for the switch-cost probe's record.
  console.log(`SWITCH-PRESSES ${JSON.stringify({ toMap: { ...toMap, names: toMap.names.length }, toGraph: { ...toGraph, names: toGraph.names.length } })}`);
  for (const [direction, press] of [["2D", toMap], ["3D", toGraph]] as const) {
    // A bundle that does not measure the destination's render is held to the bound whole.
    const own = press.returned - (direction === "2D" ? press.render ?? 0 : 0);
    expect(own, `the ${direction} press returned in ${Math.round(press.returned)} ms, the 2D map's render ${Math.round(press.render ?? 0)} ms`).toBeLessThan(PRESS_BOUND);
    expect(press.longestWait, `after the ${direction} press the page left input waiting ${Math.round(press.longestWait)} ms at most`).toBeLessThan(WAIT_BOUND);
    expect(press.layer, `the ${direction} transition showed its layer`).toBe(true);
    expect(press.firstFrame, `the ${direction} transition's first frame came ${Math.round(press.firstFrame ?? NaN)} ms after its start`).toBeLessThan(FIRST_FRAME_BOUND);
    expect(press.names, `the ${direction} transition carries the focus's name`).toContain(GRAPH);
    expect(press.membranes, `the ${direction} transition draws the directory membranes`).toBeGreaterThan(0);
    expect(press.cards, `the ${direction} transition draws the cards`).toBeGreaterThan(0);
    expect(press.folding, `the ${direction} transition folds the cards`).toBe(true);
  }
});

test("search moves focus smoothly, survives filtering, and resizes with its container", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  await page.keyboard.press("Control+p");
  await expect(page.locator("#search-subject")).toBeFocused();
  await page.keyboard.type("document.ts");
  await page.locator(`#search-subject-results .search-row--file:has(.search-row-context:text-is("${DOCUMENT}"))`).click();
  await expectFocused(page, DOCUMENT);
  await expect(page.locator(".pin-tray-toggle"), "a chosen file is pinned").toHaveText("1 pin");
  await page.locator("#filter-toggle-tests").uncheck();
  await expectFocused(page, DOCUMENT);
  await page.setViewportSize({ width: 1100, height: 800 });
  await expectFocused(page, DOCUMENT);
  const container = (await page.locator("#graph-svg").boundingBox())!;
  const canvas = (await page.locator("#graph-svg canvas").boundingBox())!;
  expect(canvas.width).toBe(container.width);
  expect(canvas.height).toBe(container.height);
});

test("direct labels release independent pins, preserve required neighbors, and share the remaining set into 2D", async ({ page, browser }) => {
  test.setTimeout(60_000);
  await observeGraph(page);
  const file = "Portal/Services/GatewayClient.cs", orphan = "Estate.sln";
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d",
    pinSet: { entries: [{ nodeId: file, symbol: "*" }, { nodeId: orphan, symbol: "*" }] } })}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const label = (id: string) => page.locator(`.force-graph-label[data-node-id="${id}"], .force-graph-focus[data-node-id="${id}"]`);
  await expect(label(orphan)).toHaveAttribute("aria-pressed", "true");
  await label(orphan).click();
  // Released, the lone file stays in the picture as its own group's seed, dimmed beyond the frontier (2026-11-02).
  await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === orphan)?.opacity).toBeLessThan(0.5);
  expect(currentSnapshot(page).pinSet.entries).toEqual([{ nodeId: file, symbol: "*" }]);
  const shared = await browser.newPage();
  try {
    await shared.goto(page.url());
    await shared.getByRole("button", { name: "2D", exact: true }).click();
    await expect(shared.locator(`.node-card[data-id="${file}"] .local-file-pin`)).toHaveAttribute("aria-pressed", "true");
    expect(currentSnapshot(shared).pinSet.entries).toEqual(currentSnapshot(page).pinSet.entries);
  } finally { await shared.close(); }
  // A needed neighbor stays visible after withdrawing its own pin, and keyboard activation is the same toggle. A
  // neighbour is named at rest only when its sphere draws large enough (2026-11-02), so it is hovered to be named.
  const neighbor = "Portal/Models/PaymentResultModel.cs";
  const neighbourSphere = (await renderedNodes(page)).find(node => node.id === neighbor)!;
  await page.mouse.move(neighbourSphere.x, neighbourSphere.y);
  await label(neighbor).focus(); await page.keyboard.press("Enter");
  await expect(label(neighbor)).toHaveAttribute("aria-pressed", "true");
  await label(neighbor).press("Enter");
  await expect(label(neighbor)).toHaveAttribute("aria-pressed", "false");
  expect(currentSnapshot(page).pinSet.entries).toEqual([{ nodeId: file, symbol: "*" }]);
  expect((await renderedNodes(page)).some(node => node.id === neighbor)).toBe(true);
});

test("a second directory click withdraws discovery without retaining its subtree", async ({ page }) => {
  test.setTimeout(60_000);
  await observeGraph(page);
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure" })}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  // A hub not asked about is named at rest only when it draws large enough (2026-11-02): hovering it names it.
  const hub = (await renderedNodes(page)).find(node => node.id === "directory:Contracts")!;
  await page.mouse.move(hub.x, hub.y);
  const label = page.locator('.force-graph-label[data-node-id="directory:Contracts"]');
  await label.click();
  expect(currentSnapshot(page).discovery).toEqual({ kind: "directory", directory: "Contracts" });
  expect(currentSnapshot(page).openDirectories.size).toBe(0);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  await label.click();
  expect(currentSnapshot(page).discovery).toBeUndefined();
  expect(currentSnapshot(page).inspection).toBeNull();
  expect(currentSnapshot(page).openDirectories.size).toBe(0);
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/);
});

test("manual pan survives a 2D and 3D round trip without restarting the settled layout", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  // Compare a settled graph. The full repository took 31–33s in software-rendered
  // Chromium; this is setup for navigation assertions, not a frame-time benchmark.
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
  const canvas = (await page.locator("#graph-svg canvas").boundingBox())!;
  const position = (): Promise<{ x: number; y: number }> => page.locator(".force-graph-focus").evaluate(element => ({ x: parseFloat((element as HTMLElement).style.left), y: parseFloat((element as HTMLElement).style.top) }));
  const centered = await position();
  // File-pair aggregation changes placement. Pan the background: a press on
  // a sphere invokes the library's node drag and reheats the simulation.
  let x = 0, y = 0, background = false;
  for (const [fx, fy] of [[.7, .7], [.8, .8], [.3, .8], [.8, .3], [.2, .2]]) {
    x = canvas.x + canvas.width * fx; y = canvas.y + canvas.height * fy;
    await page.mouse.move(x, y);
    await page.waitForTimeout(120); // Native hover picking is throttled at 50 ms.
    if (await page.locator("#graph-svg").getAttribute("data-hovered-node") === "false") { background = true; break; }
  }
  expect(background, "the gesture begins on background, not a draggable sphere").toBe(true);
  await page.mouse.down({ button: "right" });
  // Deliver a real drag over several rendered frames. A burst of synthetic
  // moves can be coalesced before TrackballControls observes the gesture.
  for (let step = 1; step <= 10; step++) {
    await page.mouse.move(x + step * 6, y - step * 2);
    await page.waitForTimeout(25);
  }
  await page.mouse.up({ button: "right" });
  await expect(page.getByRole("menu", { name: "Item actions" }), "a camera pan is not a context request").toBeHidden();
  let previous = await position();
  let stillFrames = 0;
  await expect.poll(async () => {
    const next = await position();
    stillFrames = Math.hypot(next.x - previous.x, next.y - previous.y) < 0.1 ? stillFrames + 1 : 0;
    previous = next;
    return stillFrames;
  }, { intervals: [100], timeout: 5000 }).toBeGreaterThanOrEqual(3);
  const before = await position();
  expect(Math.hypot(before.x - centered.x, before.y - centered.y)).toBeGreaterThan(20);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await page.waitForTimeout(800);
  const after = await position();
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(3);
});

test("reduced motion still focuses a requested file", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/samples/estate/?view=local&mode=3d&node=${encodeURIComponent("PaymentService/PaymentService.cs")}`);
  await expectFocused(page, "PaymentService/PaymentService.cs");
});

test("keyboard More keeps its sphere's controls available until Escape restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal%2FServices%2FGatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const id = "Portal/Models/PaymentResultModel.cs";
  const point = await uncover(page, id);
  await page.mouse.move(point.x, point.y);
  const strip = page.locator(".force-graph-actions");
  const more = strip.getByRole("button", { name: "More actions for PaymentResultModel.cs", exact: true });
  await expect(more).toBeVisible();
  await strip.getByRole("button", { name: "Pin PaymentResultModel.cs", exact: true }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(more).toBeFocused();
  expect(await more.evaluate(element => element.matches(":focus-visible"))).toBe(true);
  await page.mouse.move(30, 50);
  const before = currentSnapshot(page);
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: "Item actions" });
  await expect(menu).toBeVisible();
  // Let focusout and the hover-exit grace run: the old strip vanished only after the menu took focus.
  await page.waitForTimeout(250);
  await expect(strip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(more).toBeVisible();
  await expect(more).toBeFocused();
  expect(currentSnapshot(page)).toEqual(before);
});

test("mouse Unpin releases hover attention; real keyboard focus previews without retaining the file", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  const subject = "Portal/Services/GatewayClient.cs";
  const retained = "Portal/Models/PaymentResultModel.cs";
  await page.goto(`/samples/estate/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    view: "map",
    perspective: "2d",
    selectedNodeId: subject,
    pinSet: { entries: [{ nodeId: retained, symbol: "*" }] }
  })}`);
  await expect(page.locator(".local-placed")).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator(".perspective-transition")).toHaveCount(0);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const initialIds = (await renderedNodes(page)).map(node => node.id).sort();
  const point = await uncover(page, retained);
  await page.mouse.move(point.x, point.y);
  const strip = page.locator(".force-graph-actions");
  await strip.getByRole("button", { name: "Unpin PaymentResultModel.cs", exact: true }).click();
  const primary = strip.getByRole("button", { name: "Pin PaymentResultModel.cs", exact: true });
  await expect(primary).toBeFocused();
  expect(await primary.evaluate(element => element.matches(":focus-visible"))).toBe(false);
  const empty = await emptyPoint(page);
  await page.mouse.move(empty.x, empty.y);
  const leastOpacity = async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity));
  // No sphere is faded by the hover any more; the frontier's dimming (.3) is the picture's own (discovery, 2026-10-31).
  await expect.poll(leastOpacity, { message: "moving away after mouse Unpin restores every sphere without a second click" }).toBeGreaterThan(.25);
  // Unpinned, the file stays in the picture as the subject's neighbour, and what only its pin reached has left.
  const afterIds = (await renderedNodes(page)).map(node => node.id).sort();
  expect(afterIds).toContain(retained);
  expect(afterIds.length).toBeLessThanOrEqual(initialIds.length);
  expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: subject, inspection: null, pinSet: { entries: [] } });
  await expect(primary).toBeVisible();
  await expect(primary).toBeFocused();
  const afterUnpin = currentSnapshot(page);

  // Tab establishes a new deliberate keyboard preview even though the mouse preview has already ended.
  await page.keyboard.press("Tab");
  const centre = strip.getByRole("button", { name: "Centre on PaymentResultModel.cs", exact: true });
  await expect(centre).toBeFocused();
  expect(await centre.evaluate(element => element.matches(":focus-visible"))).toBe(true);
  await expect.poll(async () => (await renderedNodes(page)).filter(node => node.opacity > .7).length).toBeLessThan(initialIds.length);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  expect(await strip.evaluate(element => element.contains(document.activeElement))).toBe(false);
  // The new spatial names are also keyboard preview targets. Leave the map's names and controls deliberately.
  await page.getByRole("button", { name: "Fit current scope", exact: true }).focus();
  await expect.poll(leastOpacity).toBeGreaterThan(.25);
  expect(currentSnapshot(page)).toEqual(afterUnpin);
});

test("dragging a sphere cancels a held action and the release does not inspect or pin it", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal%2FServices%2FGatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const id = "Portal/Models/PaymentResultModel.cs";
  const point = await uncover(page, id);
  const before = currentSnapshot(page);
  const beforeWorld = (await renderedNodes(page)).find(node => node.id === id)!.world;
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 80, point.y + 45, { steps: 12 });
  // Wait past the stationary hold threshold while still dragging.
  await page.waitForTimeout(650);
  const afterWorld = (await renderedNodes(page)).find(node => node.id === id)!.world;
  expect(Math.hypot(afterWorld.x - beforeWorld.x, afterWorld.y - beforeWorld.y, afterWorld.z - beforeWorld.z)).toBeGreaterThan(1);
  await expect(page.getByRole("menu", { name: "Item actions" })).toBeHidden();
  await page.mouse.up();
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/);
  await expect(page.getByRole("menu", { name: "Item actions" })).toBeHidden();
  expect(currentSnapshot(page)).toEqual(before);
});

test("a stationary pointer rechecks its sphere when wheel movement changes the camera", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal%2FServices%2FGatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const id = "Portal/Models/PaymentResultModel.cs";
  const point = await uncover(page, id);
  await page.mouse.move(point.x, point.y);
  const strip = page.locator(".force-graph-actions");
  await expect(strip).toHaveAttribute("data-node-id", id);
  const world = (await renderedNodes(page)).find(node => node.id === id)!.world;
  await page.mouse.wheel(0, 1200);
  await expect.poll(async () => {
    const node = (await renderedNodes(page)).find(node => node.id === id)!;
    return Math.hypot(node.x - point.x, node.y - point.y) - node.screenRadius;
  }, { message: "the camera carries the sphere clear of the unmoved pointer" }).toBeGreaterThan(2);
  await expect.poll(async () => await strip.isVisible() ? strip.getAttribute("data-node-id") : null).not.toBe(id);
  expect((await renderedNodes(page)).find(node => node.id === id)!.world).toEqual(world);
});

test.describe("touch pointer lifetime", () => {
  test.use({ hasTouch: true, viewport: { width: 1600, height: 1000 } });

  test("lifting a finger clears pointer attention while its explicit pin remains", async ({ page }) => {
    await observeGraph(page);
    await page.goto("/samples/estate/?view=local&mode=3d&node=Portal%2FServices%2FGatewayClient.cs");
    await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
    const id = "Portal/Models/PaymentResultModel.cs";
    const point = await uncover(page, id);
    const input = await page.context().newCDPSession(page);
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    await expect(page.locator(".force-graph-actions")).toHaveAttribute("data-node-id", id);
    await expect(page.locator("#graph-svg")).toHaveAttribute("data-hovered-node", "true");
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/);
    await expect(page.locator("#graph-svg")).toHaveAttribute("data-hovered-node", "false");
    await expect.poll(async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity))).toBeGreaterThan(.25);
    expect(currentSnapshot(page).inspection).toBeNull();
    expect(currentSnapshot(page).pinSet.entries).toEqual([{ nodeId: id, symbol: "*" }]);
    await input.detach();
  });
});

test("hover peeks outside the retained scope, leaving restores it, and clearing pins releases dimming", async ({ page }) => {
  // Two settles of the software renderer, the start's some forty seconds (discovery, 2026-10-31), and the hover search between.
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  const subject = "tests/integration/programs/typescript/rosetta/src/helpers.ts";
  await page.goto(localRetainUrl("/", [subject]));
  // Compressed links carry their own representation; use the public control.
  if (await page.getByRole("button", { name: "3D", exact: true }).getAttribute("aria-pressed") !== "true") {
    await page.getByRole("button", { name: "3D", exact: true }).click();
  }
  await expect(page.locator(".perspective-transition")).toHaveCount(0);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
  await page.mouse.move(30, 50);
  const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
  const initialNodes = await renderedNodes(page);
  // The frontier's spheres, dimmed to .3 (discovery, 2026-10-31): a hover brings one to full and leaving dims it again.
  const candidates = initialNodes.filter(node => node.opacity < .35 && node.depth > -1 && node.depth < 1
    && node.x > frame.x + 50 && node.x < frame.x + frame.width - 70 && node.y > frame.y + 50 && node.y < frame.y + frame.height - 100)
    .sort((a, b) => a.distance - b.distance);
  expect(candidates.length).toBeGreaterThan(0);
  let found: typeof candidates[number] | undefined;
  for (const node of candidates.slice(0, 20)) {
    await page.mouse.move(node.x, node.y);
    await page.waitForTimeout(120); // Native picking is throttled at 50 ms.
    if (await page.locator(".force-graph-actions").getAttribute("data-node-id") === node.id) { found = node; break; }
  }
  expect(found, "a visible distant sphere is hoverable").toBeDefined();
  const opacity = async () => (await renderedNodes(page)).find(node => node.id === found!.id)!.opacity;
  await expect.poll(opacity).toBeGreaterThan(.7);
  await page.mouse.move(30, 50);
  await expect.poll(opacity).toBeLessThan(.35);
  // Re-enter the very same sphere, at a point where it is hittable now (a nearer sphere can cover its centre in the
  // smaller picture of 2026-10-31): the library can retain its old hover cache across a viewport exit and emit no
  // second onNodeHover callback.
  const again = await uncover(page, found!.id);
  await page.mouse.move(again.x, again.y);
  await expect.poll(opacity).toBeGreaterThan(.7);
  // Keyboard focus holds the hover's attention while the pointer moves onto empty canvas. Leaving those controls
  // must release it even after the earlier hover-exit timer already returned because focus was still inside.
  const actions = page.locator(".force-graph-actions");
  await expect(actions).toHaveAttribute("data-node-id", found!.id);
  await expect(actions.getByRole("button", { name: `Pin ${found!.name}`, exact: true })).toBeVisible();
  await actions.getByRole("button", { name: `Pin ${found!.name}`, exact: true }).focus();
  await page.keyboard.press("Tab");
  const keyboardTarget = actions.getByRole("button", { name: `Centre on ${found!.name}`, exact: true });
  await expect(keyboardTarget).toBeFocused();
  expect(await keyboardTarget.evaluate(element => element.matches(":focus-visible"))).toBe(true);
  const empty = await emptyPoint(page);
  await page.mouse.move(empty.x, empty.y);
  await page.waitForTimeout(250);
  await expect.poll(opacity).toBeGreaterThan(.7);
  // A pointer can temporarily peek elsewhere while the keyboard target stays in the strip. Leaving that sphere
  // must restore the actual keyboard target, not keep whichever sphere the pointer last happened to cross.
  const otherCandidates = (await renderedNodes(page)).filter(node => node.opacity < .35 && node.depth > -1 && node.depth < 1
    && node.x > frame.x + 50 && node.x < frame.x + frame.width - 70 && node.y > frame.y + 50 && node.y < frame.y + frame.height - 100)
    .sort((a, b) => a.distance - b.distance);
  let peeked = false;
  for (const node of otherCandidates.slice(0, 20)) {
    await page.mouse.move(node.x, node.y);
    await page.waitForTimeout(120);
    if ((await renderedNodes(page)).find(candidate => candidate.id === node.id)!.opacity > .7) { peeked = true; break; }
  }
  expect(peeked, "another unrelated sphere can be temporarily peeked").toBe(true);
  await expect.poll(opacity).toBeLessThan(.35);
  await keyboardTarget.hover();
  await expect.poll(opacity, { message: "returning over the named controls restores their own preview" }).toBeGreaterThan(.7);
  await page.mouse.move(empty.x, empty.y);
  await expect.poll(opacity).toBeGreaterThan(.7);
  await page.mouse.move(30, 50);
  await expect.poll(opacity, { message: "leaving the viewport preserves the deliberate keyboard target too" }).toBeGreaterThan(.7);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Fit current scope", exact: true }).focus();
  await expect.poll(opacity).toBeLessThan(.35);
  await page.mouse.move(30, 50);
  await expect.poll(opacity).toBeLessThan(.35);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await page.getByRole("button", { name: "Clear exploration pins" }).click();
  // Clearing the pins releases the subject too, so nothing is asked about and the picture is the layout's start, with
  // nothing faded by attention and the frontier's own dimming (discovery, 2026-10-31).
  await expect.poll(async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity))).toBeGreaterThan(.25);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
  expect(currentSnapshot(page)).toMatchObject({ pinSet: { entries: [] } });
  const graph = explorerGraphOf((await (await page.request.get("/explorer-data.json")).json() as StaticExplorerData).graph);
  // The retain link carries no filters, which its old grammar reads as tests and assets both shown: every file is in the picture.
  const data = spatialGraphOf(graph, () => true, [], "connections");
  const pulls = (link: { kind?: string }): boolean => linkPulls(link, "connections");
  // The start shows what a start shows: in Connections the archipelago of seeds, nothing grown (2026-11-02).
  const start = spatialScope(data.nodes, data.links, startOf(data.nodes, data.links, "connections", pulls), startHops("connections", getDefaultTuning().forceGraph.hops), pulls);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual([...start.hops.keys()].sort());
});

/**
 * A point of the canvas with no sphere under it. A middle-button press on a sphere is a node drag to the library's
 * drag controls, which suspend the navigation controls for the drag, so the zoom this test measures never starts; the
 * picture changes as the repository grows, so the point is found from the rendered scene rather than fixed. The
 * The application-owned sphere pick must report no target, and the DOM hit must be
 * the canvas rather than a control standing over it. Distances and sphere radii are both in screen pixels.
 */
async function emptyPoint(page: Page): Promise<{ x: number; y: number }> {
  const box = (await page.locator("#graph-svg canvas").boundingBox())!;
  const nodes = await renderedNodes(page);
  for (const [fx, fy] of [[.8, .8], [.2, .8], [.8, .2], [.2, .2], [.9, .5], [.5, .9], [.1, .5], [.5, .1], [.7, .9], [.3, .9]]) {
    const x = box.x + box.width * fx, y = box.y + box.height * fy;
    const clear = nodes.every(node => node.depth < -1 || node.depth > 1 || Math.hypot(node.x - x, node.y - y) > node.screenRadius + 12);
    if (!clear) continue;
    const onCanvas = await page.evaluate(({ x, y }) =>
      document.elementFromPoint(x, y) === document.querySelector("#graph-svg canvas"), { x, y });
    if (!onCanvas) continue;
    await page.mouse.move(x, y);
    await page.waitForTimeout(120); // Native picking is throttled at 50 ms.
    if (await page.locator("#graph-svg").getAttribute("data-hovered-node") === "false") return { x, y };
  }
  throw new Error("no empty point of the canvas was found among the candidates");
}

test("wheel approaches the focused sphere and does not jump outward after a closer middle-button zoom", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  const subject = "tests/integration/programs/typescript/rosetta/src/helpers.ts";
  await page.goto(`/?view=local&mode=3d&node=${subject}`);
  await expectFocused(page, subject);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
  const distance = async () => (await renderedNodes(page)).find(node => node.id === subject)!.distance;
  const initial = await distance();
  const { x, y } = await emptyPoint(page);
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -120);
  await expect.poll(distance).toBeLessThan(initial - 5);
  await page.waitForTimeout(300);
  const inward = await distance();
  await page.mouse.wheel(0, 120);
  await expect.poll(distance).toBeGreaterThan(inward + 5);
  await page.waitForTimeout(300);
  // Reach the wheel's near limit through real middle-button zoom. The retired wrapper left trackball controls at
  // their initial 300×150 canvas size, so one fixed drag was much stronger than at the actual resized viewport.
  // Bound the setup: a broken gesture must fail to reach the same limit, not silently skip this regression.
  let close = await distance();
  for (let attempt = 0; attempt < 4 && close >= 65; attempt++) {
    const start = await emptyPoint(page);
    await page.mouse.down({ button: "middle" });
    for (let i = 1; i <= 12; i++) { await page.mouse.move(start.x, start.y - i * 8); await page.waitForTimeout(25); }
    await page.mouse.up({ button: "middle" });
    await page.waitForTimeout(1000);
    close = await distance();
  }
  expect(close).toBeLessThan(65);
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(500);
  expect(await distance()).toBeLessThanOrEqual(close + .01);
  const beforeOutward = await distance();
  await page.mouse.wheel(0, 100);
  await expect.poll(distance).toBeGreaterThan(beforeOutward + .01);
});

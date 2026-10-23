import { test, expect, type Page } from "@playwright/test";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";
import { localRetainUrl } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

const GRAPH = "packages/engine/src/live-docs/graph.ts";
const DOCUMENT = "packages/engine/src/live-docs/document.ts";

async function expectFocused(page: Page, id: string): Promise<void> {
  const label = page.locator(".force-graph-focus");
  await expect(label).toHaveAttribute("data-node-id", id);
  await expect(label).toBeVisible();
  await expect.poll(() => page.locator("#graph-svg").evaluate(element => {
    const marker = element.querySelector<HTMLElement>(".force-graph-focus")!;
    return Math.hypot(parseFloat(marker.style.left) - element.clientWidth / 2, parseFloat(marker.style.top) - element.clientHeight / 2);
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

test("a focused URL centers the actual graph node and opens that file's details", async ({ page }) => {
  await observeGraph(page);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  // Hit the rendered sphere, not the HTML label, to verify the camera's target.
  const point = await uncover(page, GRAPH);
  await page.mouse.click(point.x, point.y);
  expect(currentSnapshot(page).selectedNodeId).toBe(GRAPH);
  expect(currentSnapshot(page).pinSet.entries, "inspection does not retain the sphere").toEqual([]);
  expect(currentSnapshot(page).inspection).toEqual({ kind: "file", nodeId: GRAPH });
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

test("manual pan survives a 2D and 3D round trip without restarting the settled layout", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  // Compare a settled graph: the container is busy until the simulation's alpha falls below its minimum.
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const canvas = (await page.locator("#graph-svg canvas").boundingBox())!;
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
  const position = (): Promise<{ x: number; y: number }> => page.locator(".force-graph-focus").evaluate(element => ({ x: parseFloat((element as HTMLElement).style.left), y: parseFloat((element as HTMLElement).style.top) }));
  let previous = await position();
  let stillFrames = 0;
  await expect.poll(async () => {
    const next = await position();
    stillFrames = Math.hypot(next.x - previous.x, next.y - previous.y) < 0.1 ? stillFrames + 1 : 0;
    previous = next;
    return stillFrames;
  }, { intervals: [100], timeout: 5000 }).toBeGreaterThanOrEqual(3);
  const before = await position();
  expect(Math.hypot(before.x - canvas.width / 2, before.y - canvas.height / 2)).toBeGreaterThan(20);
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
  await expect.poll(leastOpacity, { message: "moving away after mouse Unpin restores every sphere without a second click" }).toBeGreaterThan(.7);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual(initialIds);
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
  await expect.poll(leastOpacity).toBeGreaterThan(.7);
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

  test("lifting a finger clears pointer attention while its explicit inspection remains available", async ({ page }) => {
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
    await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
    await expect(page.locator("#graph-svg")).toHaveAttribute("data-hovered-node", "false");
    await expect.poll(async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity))).toBeGreaterThan(.7);
    expect(currentSnapshot(page).inspection).toEqual({ kind: "file", nodeId: id });
    expect(currentSnapshot(page).pinSet.entries).toEqual([]);
    await input.detach();
  });
});

test("hover peeks outside the retained scope, leaving restores it, and clearing pins releases dimming", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  const subject = "tests/integration/programs/typescript/rosetta/src/helpers.ts";
  await page.goto(localRetainUrl("/", [subject]));
  // Compressed links carry their own representation; use the public control.
  if (await page.getByRole("button", { name: "3D", exact: true }).getAttribute("aria-pressed") !== "true") {
    await page.getByRole("button", { name: "3D", exact: true }).click();
  }
  await expect(page.locator(".perspective-transition")).toHaveCount(0);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  await page.mouse.move(30, 50);
  const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
  const initialNodes = await renderedNodes(page);
  const candidates = initialNodes.filter(node => node.opacity < .3 && node.depth > -1 && node.depth < 1
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
  await expect.poll(opacity).toBeLessThan(.3);
  // Re-enter the very same sphere: the library can retain its old hover
  // cache across a viewport exit and emit no second onNodeHover callback.
  await page.mouse.move(found!.x, found!.y);
  await expect.poll(opacity).toBeGreaterThan(.7);
  // Keyboard focus holds the hover's attention while the pointer moves onto empty canvas. Leaving those controls
  // must release it even after the earlier hover-exit timer already returned because focus was still inside.
  const actions = page.locator(".force-graph-actions");
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
  const otherCandidates = (await renderedNodes(page)).filter(node => node.opacity < .3 && node.depth > -1 && node.depth < 1
    && node.x > frame.x + 50 && node.x < frame.x + frame.width - 70 && node.y > frame.y + 50 && node.y < frame.y + frame.height - 100)
    .sort((a, b) => a.distance - b.distance);
  let peeked = false;
  for (const node of otherCandidates.slice(0, 20)) {
    await page.mouse.move(node.x, node.y);
    await page.waitForTimeout(120);
    if ((await renderedNodes(page)).find(candidate => candidate.id === node.id)!.opacity > .7) { peeked = true; break; }
  }
  expect(peeked, "another unrelated sphere can be temporarily peeked").toBe(true);
  await expect.poll(opacity).toBeLessThan(.3);
  await keyboardTarget.hover();
  await expect.poll(opacity, { message: "returning over the named controls restores their own preview" }).toBeGreaterThan(.7);
  await page.mouse.move(empty.x, empty.y);
  await expect.poll(opacity).toBeGreaterThan(.7);
  await page.mouse.move(30, 50);
  await expect.poll(opacity, { message: "leaving the viewport preserves the deliberate keyboard target too" }).toBeGreaterThan(.7);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Fit current scope", exact: true }).focus();
  await expect.poll(opacity).toBeLessThan(.3);
  await page.mouse.move(30, 50);
  await expect.poll(opacity).toBeLessThan(.3);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await page.getByRole("button", { name: "Clear exploration pins" }).click();
  await expect.poll(async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity))).toBeGreaterThan(.7);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual(initialNodes.map(node => node.id).sort());
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
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  const subject = "tests/integration/programs/typescript/rosetta/src/helpers.ts";
  await page.goto(`/?view=local&mode=3d&node=${subject}`);
  await expectFocused(page, subject);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
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
  await page.mouse.down({ button: "middle" });
  for (let i = 1; i <= 12; i++) { await page.mouse.move(x, y - i * 8); await page.waitForTimeout(25); }
  await page.mouse.up({ button: "middle" });
  await page.waitForTimeout(1000);
  const close = await distance();
  expect(close).toBeLessThan(65);
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(500);
  expect(await distance()).toBeLessThanOrEqual(close + .01);
  const beforeOutward = await distance();
  await page.mouse.wheel(0, 100);
  await expect.poll(distance).toBeGreaterThan(beforeOutward + .01);
});

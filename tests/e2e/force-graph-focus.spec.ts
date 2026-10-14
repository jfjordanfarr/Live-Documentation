import { test, expect, type Page } from "@playwright/test";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { localRetainUrl } from "./still-picture";

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

test("a focused URL centers the actual graph node and opens that file's details", async ({ page }) => {
  await page.goto(`/?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await expectFocused(page, GRAPH);
  const canvas = page.locator("#graph-svg canvas");
  const box = (await canvas.boundingBox())!;
  // Hit the rendered sphere, not the HTML label, to verify the camera's target.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator("#detail-panel")).toContainText(GRAPH);
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
  await page.locator('[onclick="openInLocalView()"]').click();
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
  // The existing force simulation has a 15-second cooldown. Compare a settled graph.
  await page.waitForTimeout(16_000);
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
    if ((await page.locator(".float-tooltip-kap").textContent())?.startsWith(`${node.name} ·`)) { found = node; break; }
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
  await page.mouse.move(30, 50);
  await expect.poll(opacity).toBeLessThan(.3);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await page.getByRole("button", { name: "Clear exploration pins" }).click();
  await expect.poll(async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity))).toBeGreaterThan(.7);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual(initialNodes.map(node => node.id).sort());
});

test("wheel approaches the inspected sphere and does not jump outward after a closer middle-button zoom", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await observeGraph(page);
  const subject = "tests/integration/programs/typescript/rosetta/src/helpers.ts";
  await page.goto(`/?view=local&mode=3d&node=${subject}`);
  await expectFocused(page, subject);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const distance = async () => (await renderedNodes(page)).find(node => node.id === subject)!.distance;
  const initial = await distance();
  const box = (await page.locator("#graph-svg canvas").boundingBox())!;
  const x = box.x + box.width * .8, y = box.y + box.height * .8;
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

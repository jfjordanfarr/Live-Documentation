import { test, expect, type Page } from "@playwright/test";

import { overlapsAmong, textBoxes, truncations } from "./design-audit";
import { engineActivity, observeGraph, renderedNodes, renderedLinks } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";

const names = [".force-graph-focus", ".force-graph-label"];

/** Inspect compositor pixels, since correct scene objects cannot prove that an idle canvas stayed painted. */
async function blueSphereIsPainted(page: Page, id: string): Promise<void> {
  const node = (await renderedNodes(page)).find(item => item.id === id)!;
  const canvas = page.locator("#graph-svg canvas");
  const bounds = (await canvas.boundingBox())!;
  const png = await canvas.screenshot({ scale: "css" });
  const painted = await page.evaluate(async ({ bytes, x, y }) => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: "image/png" }));
    const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = offscreen.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const pixels = context.getImageData(Math.round(x) - 1, Math.round(y) - 1, 3, 3).data;
    for (let at = 0; at < pixels.length; at += 4) {
      // A blue implementation sphere has all three ordered channels; the dark blue background has R = G.
      if (pixels[at + 2] > pixels[at + 1] && pixels[at + 1] > pixels[at]) return true;
    }
    return false;
  }, { bytes: [...png], x: node.x - bounds.x, y: node.y - bounds.y });
  expect(painted, `${id}'s sphere remains painted after the scene becomes idle`).toBe(true);
}

async function readableNames(page: Page): Promise<void> {
  const boxes = await textBoxes(page, [...names, ".perspective-controls", ".force-graph-actions"]);
  expect(boxes.length).toBeGreaterThan(3);
  expect(overlapsAmong(boxes)).toEqual([]);
  expect(await truncations(page, names)).toEqual([]);
  const bounds = await page.locator(".force-graph-focus:visible, .force-graph-label:visible").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, fontSize: parseFloat(getComputedStyle(element).fontSize) };
  }));
  const viewport = page.viewportSize()!;
  for (const box of bounds) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(viewport.width);
    expect(box.bottom).toBeLessThanOrEqual(viewport.height);
    expect(box.fontSize).toBeGreaterThanOrEqual(13);
  }
}

for (const [base, subject] of [["/", "packages/generator/src/generator.ts"], ["/samples/estate/", "Portal/Services/GatewayClient.cs"]]) {
  test(`a 3D arrival names and frames the file's neighbourhood, with deliberate fit recovery: ${base}`, async ({ page }) => {
    if (base === "/") test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await observeGraph(page);
    await page.goto(`${base}?view=local&mode=3d&node=${subject}`);
    // The growing repository needs a longer settle allowance than the estate;
    // frame/identity assertions below still inspect the actual finished scene.
    await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: base === "/" ? 60_000 : 25_000 });
    const label = page.locator(`.force-graph-focus[data-node-id="${subject}"]`);
    await expect(label).toBeVisible();
    const links = await renderedLinks(page);
    const neighbours = new Set([subject]);
    for (const link of links) if (link.source === subject || link.target === subject) { neighbours.add(link.source); neighbours.add(link.target); }
    expect(neighbours.size).toBeGreaterThan(1);
    const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
    const framed = async (): Promise<boolean> => (await renderedNodes(page)).filter(node => neighbours.has(node.id)).every(node =>
      node.depth > -1 && node.depth < 1 && node.x - node.screenRadius > frame.x && node.x + node.screenRadius < frame.x + frame.width
      && node.y - node.screenRadius > frame.y && node.y + node.screenRadius < frame.y + frame.height);
    await expect.poll(framed).toBe(true);
    await readableNames(page);
    const idle = await engineActivity(page);
    await page.waitForTimeout(250);
    expect((await engineActivity(page)).frames, "the unchanged scene draws no more WebGL frames").toBe(idle.frames);
    await blueSphereIsPainted(page, subject);
    const snapshot = currentSnapshot(page);
    await page.mouse.move(frame.x + frame.width * .8, frame.y + frame.height * .8);
    await page.mouse.wheel(0, -1200);
    await expect.poll(framed).toBe(false);
    expect((await engineActivity(page)).frames).toBeGreaterThan(idle.frames);
    await page.getByRole("button", { name: "Fit current scope", exact: true }).click();
    await expect.poll(framed).toBe(true);
    expect(currentSnapshot(page)).toEqual(snapshot);
    await readableNames(page);
  });
}

test("Portal keeps readable directory and file identities through layouts and inspection", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await observeGraph(page);
  await page.goto("/samples/estate/?view=local&mode=3d&dir=Portal&layout=structure");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  await expect(page.locator('.force-graph-label[data-kind="directory"]').filter({ hasText: /^Portal$/ })).toBeVisible();
  const gateway = page.locator('.force-graph-label[data-node-id="Portal/Services/GatewayClient.cs"]');
  await expect(gateway).toBeVisible();
  await readableNames(page);
  await blueSphereIsPainted(page, "Portal/Services/GatewayClient.cs");
  const before = currentSnapshot(page);
  await gateway.click();
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
  expect(currentSnapshot(page).openDirectories).toEqual(before.openDirectories);
  expect(currentSnapshot(page).selectedNodeId).toBe(before.selectedNodeId);
  await page.getByRole("button", { name: "Close details", exact: true }).click();
  await page.getByRole("button", { name: "Connections", exact: true }).click();
  await page.getByRole("button", { name: "Fit current scope", exact: true }).click();
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  await expect(gateway).toBeVisible();
  await readableNames(page);
  expect(currentSnapshot(page).openDirectories).toEqual(before.openDirectories);
});

test("an unselected 3D arrival frames the estate without inventing pins", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await observeGraph(page);
  await page.goto("/samples/estate/?view=local&mode=3d");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
  const nodes = await renderedNodes(page);
  expect(nodes.length).toBeGreaterThan(20);
  for (const node of nodes) {
    expect(node.depth).toBeGreaterThan(-1); expect(node.depth).toBeLessThan(1);
    expect(node.x - node.screenRadius).toBeGreaterThan(frame.x);
    expect(node.x + node.screenRadius).toBeLessThan(frame.x + frame.width);
    expect(node.y - node.screenRadius).toBeGreaterThan(frame.y);
    expect(node.y + node.screenRadius).toBeLessThan(frame.y + frame.height);
  }
  expect(currentSnapshot(page).pinSet.entries).toEqual([]);
  expect(currentSnapshot(page).selectedNodeId).toBeFalsy();
  await readableNames(page);
});

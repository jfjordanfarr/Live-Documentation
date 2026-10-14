import { expect, test } from "@playwright/test";

import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { localMapSettled } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

test.use({ viewport: { width: 1600, height: 1000 } });

const entry = (showDirectories: boolean) => `/samples/estate/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT,
  perspective: "3d",
  filters: { showTests: true, showAssets: false, showDirectories, showDirectoryLinks: false }
})}`;

test("optional recursive directory hubs affect placement while membership-line visibility leaves it unchanged", async ({ page }) => {
  test.setTimeout(60_000); // Observe two complete native simulation cooldowns.
  await observeGraph(page);
  await page.goto(entry(false));
  const graph = page.locator("#graph-svg");
  await expect(graph).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const files = await renderedNodes(page);
  const referenceFacts = (links: Awaited<ReturnType<typeof renderedLinks>>) => links
    .filter(link => link.kind !== "containment")
    .map(({ source, target, kind, count }) => JSON.stringify([source, target, kind, count])).sort();
  const references = referenceFacts(await renderedLinks(page));
  expect(files.every(node => node.directory === undefined)).toBe(true);

  await page.getByRole("checkbox", { name: "Show Directories", exact: true }).check();
  await expect.poll(async () => (await renderedNodes(page)).filter(node => node.directory !== undefined).length).toBeGreaterThan(0);
  await expect(graph).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const withHubs = await renderedNodes(page);
  const links = await renderedLinks(page);
  // A hidden link need not have a render object at all. Inspect the complete
  // containment tree after making it visible, while also proving no re-layout.
  expect(links.filter(link => link.kind === "containment" && link.visible)).toEqual([]);
  expect(referenceFacts(links)).toEqual(references);
  expect(withHubs.some(node => {
    const before = files.find(file => file.id === node.id);
    return before && Math.hypot(node.world.x - before.world.x, node.world.y - before.world.y, node.world.z - before.world.z) > 1;
  })).toBe(true);

  const positions = withHubs.map(node => ({ id: node.id, world: node.world }));
  await page.getByRole("checkbox", { name: "Directory Connections", exact: true }).check();
  await expect.poll(async () => (await renderedLinks(page)).filter(link => link.kind === "containment" && link.visible).length).toBe(withHubs.length - 1);
  const membership = (await renderedLinks(page)).filter(link => link.kind === "containment");
  expect(new Set(membership.map(link => link.target)).size).toBe(membership.length);
  const parent = withHubs.find(node => node.directory === "Portal")!;
  const child = withHubs.find(node => node.directory === "Portal/Models")!;
  expect(membership).toContainEqual({ source: parent.id, target: child.id, kind: "containment", count: 1, visible: true });
  expect((await renderedNodes(page)).map(node => ({ id: node.id, world: node.world }))).toEqual(positions);
  await expect(graph).toHaveAttribute("aria-busy", "false");
  await page.getByRole("checkbox", { name: "Show Directories", exact: true }).uncheck();
  await expect.poll(async () => (await renderedNodes(page)).filter(node => node.directory !== undefined).length).toBe(0);
  expect(referenceFacts(await renderedLinks(page))).toEqual(references);
});

test("a native directory hub reveals membership, frames its members, and releases through the shared tray", async ({ page }) => {
  test.setTimeout(45_000);
  await observeGraph(page);
  await page.goto(entry(true));
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
  const nodes = await renderedNodes(page);
  const candidates = nodes.filter(node => node.directory && (node.files ?? 0) > 1 && node.depth > -1 && node.depth < 1
    && node.x > frame.x + 50 && node.x < frame.x + frame.width - 50
    && node.y > frame.y + 70 && node.y < frame.y + frame.height - 90)
    .sort((a, b) => a.distance - b.distance);
  let chosen: typeof candidates[number] | undefined;
  for (const node of candidates.slice(0, 20)) {
    await page.mouse.move(node.x, node.y);
    await page.waitForTimeout(120); // Native hover picking is throttled.
    if ((await page.locator(".float-tooltip-kap").textContent())?.startsWith(`${node.directory} ·`)) {
      chosen = node;
      break;
    }
  }
  expect(chosen, "a rendered directory hub is hoverable").toBeDefined();
  expect((await renderedLinks(page)).some(link => link.kind === "containment" && link.visible)).toBe(true);
  await page.mouse.click(chosen!.x, chosen!.y);
  await page.mouse.move(30, 50);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.locator(".pin-tray-row")).toHaveCount(1);
  const directory = chosen!.directory!;
  const members = async () => (await renderedNodes(page)).filter(node => node.directory === directory
    || node.id.startsWith(`${directory}/`) || node.directory?.startsWith(`${directory}/`));
  await expect.poll(async () => (await members()).every(node => node.x > frame.x && node.x < frame.x + frame.width
    && node.y > frame.y && node.y < frame.y + frame.height)).toBe(true);
  await expect.poll(async () => {
    const shown = await members();
    return Math.max(
      (Math.max(...shown.map(node => node.x)) - Math.min(...shown.map(node => node.x))) / frame.width,
      (Math.max(...shown.map(node => node.y)) - Math.min(...shown.map(node => node.y))) / frame.height
    );
  }).toBeGreaterThan(.2);

  await page.getByRole("button", { name: "2D", exact: true }).click();
  await localMapSettled(page);
  await expect(page.locator(`.local-directory-label[data-directory="${directory}"] .local-directory-close`)).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await page.getByRole("button", { name: `Release directory ${directory}`, exact: true }).click();
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
  const snapshot = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
  expect(snapshot.openDirectories.size).toBe(0);
  await expect.poll(async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity))).toBeGreaterThan(.7);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual(nodes.map(node => node.id).sort());
});

test("changing a preset keeps the directory being inspected in place even when a file remains selected", async ({ page }) => {
  test.setTimeout(60_000); // Initial layout and a complete reheat after the preset change.
  await observeGraph(page);
  const directory = "Portal/Models";
  const file = "Contracts/IPaymentService.cs";
  await page.goto(`/samples/estate/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    perspective: "3d",
    selectedNodeId: file,
    pinSet: { entries: [{ nodeId: file, symbol: "*" }] },
    openDirectories: new Set([directory]),
    filters: { showTests: true, showAssets: false, showDirectories: true }
  })}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const id = (await renderedNodes(page)).find(node => node.directory === directory)!.id;
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await page.getByRole("button", { name: `Show directory ${directory}`, exact: true }).click();
  await expect(page.locator(".force-graph-focus")).toHaveAttribute("data-node-id", id);
  await page.waitForTimeout(600); // The directory camera flight lasts 500 ms.
  const sample = await page.evaluate(async () => {
    const label = document.querySelector<HTMLElement>(".force-graph-focus")!;
    const position = () => ({ id: label.dataset.nodeId, x: parseFloat(label.style.left), y: parseFloat(label.style.top) });
    const before = position();
    document.querySelector<HTMLButtonElement>('[data-layout-preset="compact"]')!.click();
    const frames: ReturnType<typeof position>[] = [];
    await new Promise<void>(resolve => {
      const read = () => {
        frames.push(position());
        if (document.querySelector("#graph-svg")!.getAttribute("aria-busy") === "true") requestAnimationFrame(read);
        else resolve();
      };
      requestAnimationFrame(read);
    });
    return { before, frames };
  });
  expect(sample.frames.length).toBeGreaterThan(4);
  for (const frame of sample.frames) {
    expect(frame.id).toBe(id);
    expect(Math.hypot(frame.x - sample.before.x, frame.y - sample.before.y)).toBeLessThan(1.5);
  }
  const beforeZoom = (await renderedNodes(page)).find(node => node.id === id)!;
  const canvas = (await page.locator("#graph-svg canvas").boundingBox())!;
  await page.mouse.move(canvas.x + canvas.width * .7, canvas.y + canvas.height * .7);
  await page.mouse.wheel(0, -120);
  await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === id)!.distance).toBeLessThan(beforeZoom.distance - 1);
  await page.waitForTimeout(250); // Wheel interpolation lasts 180 ms.
  const zoomed = (await renderedNodes(page)).find(node => node.id === id)!;
  expect(Math.hypot(zoomed.x - beforeZoom.x, zoomed.y - beforeZoom.y)).toBeLessThan(.1);
});

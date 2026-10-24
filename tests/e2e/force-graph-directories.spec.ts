import { expect, test, type Page } from "@playwright/test";

import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { localMapSettled } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { SpatialLayout } from "../../packages/explorer/src/client/types";

test.use({ viewport: { width: 1600, height: 1000 } });

const entry = (spatialLayout: SpatialLayout) => `/samples/estate/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT,
  perspective: "3d",
  spatialLayout,
  filters: { showTests: true, showAssets: false }
})}`;

type Rendered = Awaited<ReturnType<typeof renderedNodes>>;
const referenceFacts = (links: Awaited<ReturnType<typeof renderedLinks>>) => links
  .filter(link => link.kind !== "containment")
  .map(({ source, target, kind, count }) => JSON.stringify([source, target, kind, count])).sort();
const gap = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * Every line shown is drawn: it has a length and runs from the sphere of one end to the sphere of the other. Visibility
 * alone passed while every reference revealed in the structure layout sat unpositioned at the origin (2026-10-16).
 */
async function expectDrawnBetweenSpheres(page: Page): Promise<number> {
  const spheres = new Map((await renderedNodes(page)).map(node => [node.id, node.world]));
  const shown = (await renderedLinks(page)).filter(line => line.visible);
  for (const link of shown) {
    const source = spheres.get(link.source)!, target = spheres.get(link.target)!;
    const name = `${link.kind} ${link.source} to ${link.target}`;
    expect(link.length, name).toBeGreaterThan(0);
    expect(link.length, name).toBeCloseTo(gap(source, target), 1);
    expect(gap(link.start, source), `${name} starts at its source`).toBeLessThan(.05);
    expect(gap(link.end, target), `${name} ends at its target`).toBeLessThan(.05);
  }
  return shown.filter(link => link.kind !== "containment").length;
}

const extent = (nodes: Rendered): number => Math.max(...["x", "y", "z"].map(axis =>
  Math.max(...nodes.map(node => node.world[axis as "x" | "y" | "z"])) - Math.min(...nodes.map(node => node.world[axis as "x" | "y" | "z"]))));

test("the structure layout hangs every file from its directory from where it stood, sizes a hub by its members, and draws a reference only on demand", async ({ page }) => {
  test.setTimeout(90_000); // Two complete settlings of the native simulation and a hover search.
  await observeGraph(page);
  await page.goto(entry("connections"));
  // Volume is a world-space contract. Zoom resistance compensates each node's depth independently, so compare
  // the actual rendered volumes under explicit perspective sizing, rather than assuming a visual default.
  await page.getByText("Tuning", { exact: true }).click();
  const resistance = page.getByRole("slider", { name: /Node Zoom Resistance/ });
  await resistance.press("Home");
  await expect(resistance).toHaveValue("0");
  await page.getByText("Tuning", { exact: true }).click();
  const graph = page.locator("#graph-svg");
  await expect(graph).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const network = await renderedNodes(page);
  expect(network.every(node => node.directory === undefined)).toBe(true);
  const networkLinks = await renderedLinks(page);
  const references = referenceFacts(networkLinks);
  expect(references.length).toBeGreaterThan(0);
  expect(networkLinks.every(link => link.visible)).toBe(true);
  expect(await expectDrawnBetweenSpheres(page)).toBe(references.length);
  const structure = page.getByRole("button", { name: "Structure", exact: true });
  await expect(structure).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Connections", exact: true })).toHaveAttribute("aria-pressed", "true");

  await structure.click();
  await expect(structure).toHaveAttribute("aria-pressed", "true");
  // The first picture with hubs is read as soon as it exists, a few ticks into the fold: the files have not been thrown
  // back to a cold start, which would gather them on a small spiral about the origin, and the scan root's hub begins
  // among them, at the centroid of the files that already stood somewhere.
  let first: Rendered = [];
  await expect.poll(async () => { first = await renderedNodes(page); return first.some(node => node.directory !== undefined); }, { timeout: 10_000 }).toBe(true);
  const span = extent(network);
  const moved = first.filter(node => node.directory === undefined).map(node => {
    const before = network.find(file => file.id === node.id)!;
    return Math.hypot(node.world.x - before.world.x, node.world.y - before.world.y, node.world.z - before.world.z);
  }).sort((a, b) => a - b);
  expect(moved[Math.floor(moved.length / 2)]).toBeLessThan(span * .25);
  expect(extent(first.filter(node => node.directory === undefined))).toBeGreaterThan(span * .5);
  const root = first.find(node => node.directory === "")!;
  for (const axis of ["x", "y", "z"] as const) {
    expect(root.world[axis]).toBeGreaterThan(Math.min(...network.map(node => node.world[axis])) - span * .1);
    expect(root.world[axis]).toBeLessThan(Math.max(...network.map(node => node.world[axis])) + span * .1);
  }

  await expect(graph).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const tree = await renderedNodes(page);
  const links = await renderedLinks(page);
  expect(tree.filter(node => node.directory === undefined).map(node => node.id).sort()).toEqual(network.map(node => node.id).sort());
  const membership = links.filter(link => link.kind === "containment");
  expect(membership).toHaveLength(tree.length - 1);
  expect(new Set(membership.map(link => link.target)).size).toBe(membership.length);
  expect(membership.every(link => link.visible)).toBe(true);
  // A reference hidden at rest need not have a render object at all; none that exists is drawn.
  expect(links.filter(link => link.kind !== "containment").every(link => !link.visible)).toBe(true);
  const parent = tree.find(node => node.directory === "Portal")!;
  const child = tree.find(node => node.directory === "Portal/Models")!;
  expect(membership).toContainEqual(expect.objectContaining({ source: parent.id, target: child.id, kind: "containment", count: 1, visible: true }));
  // A hub's volume is the sum of its members' volumes, read from the rendered spheres themselves.
  const volume = (node: Rendered[number]): number => Math.pow(node.radius, 3);
  const files = tree.filter(node => node.directory === undefined);
  expect(volume(root)).toBeCloseTo(files.reduce((sum, node) => sum + volume(node), 0), 0);
  expect(volume(parent)).toBeCloseTo(files.filter(node => node.id.startsWith("Portal/")).reduce((sum, node) => sum + volume(node), 0), 0);
  expect(root.radius).toBeGreaterThan(Math.max(...files.map(node => node.radius)));

  // A reference is drawn for the hovered file and put away when the pointer leaves it.
  const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
  const connected = new Set(networkLinks.filter(link => link.kind !== "containment").flatMap(link => [link.source, link.target]));
  const candidates = tree.filter(node => node.directory === undefined && connected.has(node.id) && node.depth > -1 && node.depth < 1
    && node.x > frame.x + 50 && node.x < frame.x + frame.width - 50 && node.y > frame.y + 70 && node.y < frame.y + frame.height - 90)
    .sort((a, b) => a.distance - b.distance);
  let hovered: Rendered[number] | undefined;
  for (const node of candidates.slice(0, 20)) {
    await page.mouse.move(node.x, node.y);
    await page.waitForTimeout(120); // Native hover picking is throttled.
    if (await page.locator(".force-graph-actions").getAttribute("data-node-id") === node.id) { hovered = node; break; }
  }
  expect(hovered, "a connected file is hoverable").toBeDefined();
  const incident = (await renderedLinks(page)).filter(link => link.kind !== "containment" && (link.source === hovered!.id || link.target === hovered!.id));
  expect(incident.length).toBeGreaterThan(0);
  expect(incident.every(link => link.visible)).toBe(true);
  expect((await renderedLinks(page)).filter(link => link.kind !== "containment" && link.visible)).toHaveLength(incident.length);
  expect(await expectDrawnBetweenSpheres(page)).toBe(incident.length);
  await page.mouse.move(30, 50);
  await expect.poll(async () => (await renderedLinks(page)).filter(link => link.kind !== "containment" && link.visible).length).toBe(0);

  // The choice rides the address as a step in the history and comes back with Back.
  expect(decompressSnapshot(new URL(page.url()).searchParams.get("s")!).spatialLayout).toBe("structure");
  await page.goBack();
  await expect(page.getByRole("button", { name: "Connections", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => (await renderedNodes(page)).filter(node => node.directory !== undefined).length).toBe(0);
  expect(referenceFacts(await renderedLinks(page))).toEqual(references);
  await expect.poll(async () => (await renderedLinks(page)).every(link => link.visible)).toBe(true);
});

test("a directory hub inspects, its Open action frames its members, and the shared tray releases it", async ({ page }) => {
  test.setTimeout(45_000);
  await observeGraph(page);
  await page.goto(entry("structure"));
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
    if (await page.locator(".force-graph-actions").getAttribute("data-node-id") === node.id) {
      chosen = node;
      break;
    }
  }
  expect(chosen, "a rendered directory hub is hoverable").toBeDefined();
  expect((await renderedLinks(page)).some(link => link.kind === "containment" && link.visible)).toBe(true);
  const directory = chosen!.directory!;
  await page.mouse.click(chosen!.x, chosen!.y);
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/);
  const inspected = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
  expect(inspected.inspection).toEqual({ kind: "directory", directory });
  expect(inspected.openDirectories.size, "inspecting a hub does not open it").toBe(0);
  await page.getByRole("button", { name: "Close details", exact: true }).click();
  await page.mouse.move(chosen!.x, chosen!.y);
  await page.locator(".force-graph-actions").getByRole("button", { name: `Open ${directory}`, exact: true }).click();
  await expect(page.locator(".force-graph-actions").getByRole("button", { name: `Close ${directory}`, exact: true }),
    "an open directory's primary action closes it, as its 2D label does").toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(30, 50);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.locator(".pin-tray-row")).toHaveCount(1);
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
  await expect(page.getByRole("button", { name: "Structure", exact: true })).toBeHidden();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "Structure", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: `Release directory ${directory}`, exact: true }).click();
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
  const snapshot = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
  expect(snapshot.openDirectories.size).toBe(0);
  await expect.poll(async () => Math.min(...(await renderedNodes(page)).map(node => node.opacity))).toBeGreaterThan(.7);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual(nodes.map(node => node.id).sort());
});

test("changing a preset keeps the framed directory in place even when a file remains selected", async ({ page }) => {
  test.setTimeout(60_000); // Initial layout and a complete reheat after the preset change.
  await observeGraph(page);
  const directory = "Portal/Models";
  const file = "Contracts/IPaymentService.cs";
  await page.goto(`/samples/estate/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    perspective: "3d",
    spatialLayout: "structure",
    selectedNodeId: file,
    pinSet: { entries: [{ nodeId: file, symbol: "*" }] },
    openDirectories: new Set([directory]),
    filters: { showTests: true, showAssets: false }
  })}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  // The pinned file's references are drawn among the retained files, each between its two spheres.
  expect(await expectDrawnBetweenSpheres(page)).toBeGreaterThan(0);
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

import { expect, test, type Page } from "@playwright/test";
import type { Scene } from "three";

import { observeGraph, renderedBodyCarriers, renderedNodes } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";
import { localMapSettled } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

// These arrivals must have no saved UI entry, including the suite's usual partial search preference.
test.use({ viewport: { width: 1280, height: 800 }, storageState: { cookies: [], origins: [] } });

const entry = (layout: "structure" | "connections" = "structure") => `/samples/estate/?view=local&mode=3d&layout=${layout}`;

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
}

async function choices(page: Page, wrappers: string, hops: number): Promise<void> {
  await expect(page.locator("#tuning-force-group-wrappers")).toHaveValue(wrappers);
  await expect(page.getByRole("combobox", { name: "Hops shown", exact: true })).toHaveValue(String(hops));
  await expect(page.locator("#tuning-force-hops")).toHaveValue(String(hops));
}

/** Seed once, so a reload reads what the application actually saved. */
async function saved(page: Page, tuning: object): Promise<void> {
  await page.addInitScript(({ key, version, tuning }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify({ version, tuning }));
  }, { key: PERSISTED_UI_KEY, version: PERSISTED_UI_VERSION, tuning });
}

/** The skin and its files submitted to Three, rather than a control value standing in for the visible behavior. */
async function skin(page: Page): Promise<{ look: string; wrappers: number; triangles: number; files: number }> {
  return page.evaluate(() => {
    const { scene } = (window as unknown as { renderedGraph: { scene: Scene } }).renderedGraph;
    const drawn = { look: "", wrappers: 0, triangles: 0, files: 0 };
    scene.traverse(object => {
      if (object.name === "Spatial wrappers") {
        const info = object.userData.spatialWrappers as { look: string; seeds: string[]; triangles: number };
        drawn.look = info.look; drawn.wrappers = info.seeds.length; drawn.triangles = info.triangles;
      }
      if (object.name === "Spatial shell files") {
        const units = object.userData.spatialUnits as Array<{ kind: string }>;
        drawn.files = units.filter(unit => unit.kind === "file").length;
      }
    });
    return drawn;
  });
}

for (const layout of ["structure", "connections"] as const) {
  test(`a fresh ${layout} arrival draws Skin and its contained files at one hop`, async ({ page }) => {
    await observeGraph(page);
    await page.goto(entry(layout));
    await settled(page);
    await choices(page, "skin", 1);
    const drawn = await skin(page);
    expect(drawn.look).toBe("skin");
    expect(drawn.wrappers).toBeGreaterThan(0);
    expect(drawn.triangles).toBeGreaterThan(0);
    expect(drawn.files, "the default skin visibly holds multiple files").toBeGreaterThan(1);
  });
}

test("sparse preferences inherit Skin and one hop without losing independent saved tuning", async ({ page }) => {
  await saved(page, { forceGraph: { gravity: 0.03 }, history: { playRate: 0.5 } });
  await page.goto(entry());
  await settled(page);
  await choices(page, "skin", 1);
  const tuning = JSON.parse((await page.locator("#graph-svg").getAttribute("data-layout-settings"))!);
  expect(tuning.gravity).toBe(0.03);
  await expect(page.locator("#tuning-history-play-rate")).toHaveValue("0.5");
});

test("saved Off and two hops survive a link without layout settings, a preference write and reload", async ({ page }) => {
  await saved(page, { forceGraph: { groupWrappers: "off", hops: 2 } });
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure" })}`);
  await settled(page);
  await choices(page, "off", 2);
  await page.getByRole("checkbox", { name: "Show Tests", exact: true }).uncheck();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), PERSISTED_UI_KEY))
    .toMatchObject({ version: 2, tuning: { forceGraph: { groupWrappers: "off", hops: 2 } } });
  await page.reload();
  await settled(page);
  await choices(page, "off", 2);
});

for (const [stored, shared] of [["skin", "off"], ["off", "skin"]] as const) {
  test(`a shared ${shared} setting overrides saved ${stored}, including its hop count`, async ({ page }) => {
    await saved(page, { forceGraph: { groupWrappers: stored, hops: stored === "off" ? 2 : 1 } });
    const hops = shared === "off" ? 2 : 1;
    await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure", layout: { forceGraph: { groupWrappers: shared, hops } } })}`);
    await settled(page);
    await choices(page, shared, hops);
    await page.reload();
    await settled(page);
    await choices(page, shared, hops);
  });
}

test("Skin directory cards visibly travel to their real cell or sole file in both directions", async ({ page }) => {
  await observeGraph(page);
  await page.clock.install();
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, spatialLayout: "structure", openDirectories: new Set(["Portal"]) })}`);
  await localMapSettled(page);
  const before = currentSnapshot(page);
  // These are the canonical contents of the estate fixture, not names guessed from the rendered labels.
  const representatives = new Map([
    ["directory:Portal/App_Code", "Portal/App_Code/Globals.cs"],
    ["directory:Portal/Controllers", "Portal/Controllers/PaymentsController.cs"],
    ["directory:Portal/Scripts", "Portal/Scripts/portal.js"],
    ["directory:Portal/Services", "Portal/Services/GatewayClient.cs"],
    ["directory:Portal/Models", "directory:Portal/Models"],
    ["directory:Portal/Pages", "directory:Portal/Pages"]
  ]);
  let sourcePoints = new Map<string, { x: number; y: number; labelY: number }>();
  let sourceBodies: Awaited<ReturnType<typeof renderedBodyCarriers>> = [];
  const nativeDestinations = async () => {
    sourcePoints = new Map((await renderedNodes(page)).map(node => [node.id, { x: node.x, y: node.y, labelY: node.y + node.screenRadius + 10 }]));
    sourceBodies = await renderedBodyCarriers(page);
    for (const body of sourceBodies) sourcePoints.set(body.id, { x: body.x, y: body.y, labelY: Math.max(...body.boundary.map(point => point.y)) + 10 });
  };
  for (const toGraph of [true, false]) {
    if (!toGraph) await nativeDestinations();
    await page.getByRole("button", { name: toGraph ? "3D" : "2D", exact: true }).click();
    const layer = page.locator(".perspective-transition[data-graph-files]");
    await expect(layer).toBeVisible();
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 20);
    const atElapsed = async (target: number): Promise<void> => {
      const elapsed = Number(await layer.getAttribute("data-progress"));
      expect(elapsed, "the measured transition has not already passed the phase being inspected").toBeLessThan(target);
      await page.clock.runFor(Math.ceil((target - elapsed) * 1400));
    };
    await atElapsed(toGraph ? 0.55 : 0.2);
    if (toGraph) await nativeDestinations();
    const names = async () => {
      const frame = (await layer.boundingBox())!;
      const drawn = await layer.locator(".perspective-file-name").evaluateAll(elements => elements.map(element => {
        const label = element as HTMLElement;
        return { id: label.dataset.nodeId!, opacity: Number(label.style.opacity), x: parseFloat(label.style.left), y: parseFloat(label.style.top) };
      }));
      const result = new Map<string, { distance: number; x: number; y: number }>();
      for (const [id, destination] of representatives) {
        const matches = drawn.filter(label => label.id === id && label.opacity > 0.1);
        expect(matches, `${id} has exactly one visible travelling identity`).toHaveLength(1);
        const target = sourcePoints.get(destination);
        expect(target, `${destination} is submitted before the transition captures it`).toBeDefined();
        const x = matches[0].x + frame.x, y = matches[0].y + frame.y;
        result.set(id, { x, y, distance: Math.hypot(x - target!.x, y - target!.labelY) });
      }
      return result;
    };
    const early = await names();
    await atElapsed(toGraph ? 0.8 : 0.45);
    const late = await names();
    for (const [id, point] of late) {
      const start = early.get(id)!;
      expect(Math.hypot(point.x - start.x, point.y - start.y), `${id} actually moves`).toBeGreaterThan(0.5);
      if (toGraph) expect(point.distance, `${id} moves toward its canonical destination`).toBeLessThan(start.distance);
      else expect(point.distance, `${id} returns from its canonical destination`).toBeGreaterThan(start.distance);
    }
    // The contour and colored marks must actually be painted, not merely present in capture metadata.
    const models = sourceBodies.find(body => body.id === "directory:Portal/Models")!;
    expect(models.files.length).toBeGreaterThan(1);
    const label = late.get(models.id)!;
    const shift = { x: label.x - models.x, y: label.y - sourcePoints.get(models.id)!.labelY };
    const probes = models.files.map(file => ({ x: file.x + shift.x, y: file.y + shift.y, color: file.color }));
    const contour = models.boundary.reduce((best, point) => point.x > best.x ? point : best);
    const painted = await layer.locator("canvas").evaluate((element, { probes, contour }) => {
      const canvas = element as HTMLCanvasElement;
      const context = canvas.getContext("2d")!, frame = canvas.getBoundingClientRect();
      const ratio = canvas.width / frame.width;
      const pixels = (x: number, y: number) => context.getImageData(Math.round((x - frame.left) * ratio) - 1, Math.round((y - frame.top) * ratio) - 1, 3, 3).data;
      const srgb = (value: number) => Math.round(255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055));
      const marks = probes.map(probe => {
        const data = pixels(probe.x, probe.y), expected = probe.color.map(srgb);
        for (let index = 0; index < data.length; index += 4) {
          if (data[index + 3] > 40 && expected.every((channel, offset) => Math.abs(channel - data[index + offset]) < 24)) return true;
        }
        return false;
      });
      const edge = pixels(contour.x, contour.y);
      let boundary = false;
      for (let index = 0; index < edge.length; index += 4) {
        if (edge[index + 3] > 4 && edge[index + 2] > edge[index] && edge[index + 1] > edge[index]) boundary = true;
      }
      return { marks, boundary };
    }, { probes, contour: { x: contour.x + shift.x, y: contour.y + shift.y } });
    expect(painted.marks, "each submitted Models file is painted in its uploaded kind color at its real carried place").toEqual(models.files.map(() => true));
    expect(painted.boundary, "the skin follows its uploaded silhouette rather than a radius proxy").toBe(true);
    if (!toGraph) {
      await atElapsed(0.85);
      await expect(layer).toHaveAttribute("data-file-pairs", "0");
      await expect(layer).toHaveAttribute("data-wire-fold", "0");
      const transparent = await layer.locator("canvas").evaluate(element => {
        const canvas = element as HTMLCanvasElement;
        const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
        return pixels.every((value, index) => index % 4 !== 3 || value === 0);
      });
      expect(transparent, "graph-only wires disappear with the 3D side before the source 2D cards finish unfolding").toBe(true);
    }
    await page.clock.runFor(1600);
    await page.clock.resume();
    await expect(layer).toHaveCount(0);
    if (toGraph) await settled(page);
    else await localMapSettled(page);
  }
  expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: before.selectedNodeId, pinSet: before.pinSet, openDirectories: before.openDirectories });
});

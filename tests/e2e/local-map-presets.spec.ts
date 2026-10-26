import { expect, test, type Page } from "@playwright/test";
import * as fs from "node:fs/promises";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { DECK_SCOPES } from "./scopes";
import { localMapSettled, localRetainUrl } from "./still-picture";
import { LAYOUT_PRESETS } from "../../packages/explorer/src/client/layout-presets";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

const generator = "packages/generator/src/generator.ts";
test.use({ viewport: { width: 1600, height: 1000 } });

async function facts(page: Page) {
  return page.evaluate(() => ({
    files: [...document.querySelectorAll<HTMLElement>(".local-placed .node-card")].map(card => ({ id: card.dataset.id,
      symbols: [...card.querySelectorAll<HTMLElement>(".symbol-row")].map(row => row.dataset.symbol).sort() })).sort((a, b) => a.id!.localeCompare(b.id!)),
    references: [...new Set([...document.querySelectorAll<SVGPathElement>(".connection-path[data-source-id]")]
      .map(edge => JSON.stringify([edge.dataset.sourceId, edge.dataset.sourceSymbol, edge.dataset.targetId, edge.dataset.targetSymbol, edge.dataset.kind])))].sort()
  }));
}

for (const [base, subject] of [["/", generator], ["/samples/estate/", "Contracts/IPaymentService.cs"]]) {
  test(`packing, advanced edits, export and sharing remain coherent across representations: ${subject}`, async ({ page, browser }) => {
    // A journey of two pages: the picture settled, a preset, 3D, the tuning, an export, a share opened fresh and back to 2D.
    // Over this repository it takes 27 seconds on one worker, and took 32 once (2026-10-19); the half minute is not its measure.
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}?view=local&node=${encodeURIComponent(subject)}`);
    await page.locator(".local-placed").waitFor();
    await localMapSettled(page);
    const before = await facts(page);
    expect(before.files.length).toBeGreaterThan(1);
    const preset = page.getByRole("button", { name: "Compact", exact: true });
    await expect(page.getByRole("button", { name: "Relaxed", exact: true })).toHaveAttribute("aria-pressed", "true");
    await preset.click();
    await localMapSettled(page);
    expect(await facts(page)).toEqual(before);
    await page.getByRole("button", { name: "3D", exact: true }).click();
    await page.locator("#view-graph.active canvas").waitFor();
    await expect(preset).toBeEnabled();
    await expect(preset).toHaveAttribute("aria-pressed", "true");
    await page.getByText("Tuning", { exact: true }).click();
    const labels = ["details[data-tuning-perspective][open] .tuning-slider span", "details[data-tuning-perspective][open] output", ".perspective-controls button", ".tuning-export"];
    const boxes = await textBoxes(page, labels);
    expect(boxes.length).toBeGreaterThan(10);
    const overlaps = overlapsAmong(boxes), cut = await truncations(page, labels);
    expect(overlaps, describeFaults(overlaps, cut)).toEqual([]);
    expect(cut, describeFaults(overlaps, cut)).toEqual([]);
    const coupling = page.locator("#tuning-force-coupling");
    await expect(coupling).toBeVisible();
    await coupling.focus(); await page.keyboard.press("ArrowRight");
    await expect(coupling).toHaveValue("1.1");
    await expect(preset).toHaveAttribute("aria-pressed", "true");
    await page.locator("#tuning-force-node-size").focus(); await page.keyboard.press("ArrowRight");
    await page.getByRole("slider", { name: /Wire Thickness/ }).focus(); await page.keyboard.press("ArrowRight");
    await page.getByRole("slider", { name: /Node Zoom Resistance/ }).focus(); await page.keyboard.press("ArrowRight");
    await page.getByRole("slider", { name: /Wire Zoom Resistance/ }).focus(); await page.keyboard.press("ArrowRight");
    await page.locator("#tuning-force-link-gap").focus(); await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: "Layout tuning: Custom", exact: true })).toBeVisible();
    await expect(preset).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Relaxed", exact: true }).click();
    await expect(coupling).toHaveValue("1.1");
    await expect(page.locator("#tuning-force-node-size")).toHaveValue("4.25");
    await expect(page.locator("#tuning-force-link-width")).toHaveValue("1.1");
    await expect(page.locator("#tuning-force-node-zoom-resistance")).toHaveValue("0.35");
    await expect(page.locator("#tuning-force-wire-zoom-resistance")).toHaveValue("0.95");
    await page.locator("#filter-toggle-related-docs").check();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export layout settings", exact: true }).click();
    const download = await downloadPromise;
    const settings = JSON.parse(await fs.readFile((await download.path())!, "utf8")) as { localMap: object; forceGraph: object };
    expect(settings.localMap).toEqual(LAYOUT_PRESETS.relaxed.localMap);
    expect(settings.forceGraph).toMatchObject({ ...LAYOUT_PRESETS.relaxed.forceGraph, coupling: 1.1, nodeSize: 4.25, symbolScale: 1, linkWidth: 1.1, nodeZoomResistance: 0.35, wireZoomResistance: 0.95 });
    const shared = page.url();
    // A share must stand on its own. Close the publisher before starting the
    // recipient instead of running two unnecessary WebGL simulations at once.
    await page.close();
    const fresh = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    fresh.on("pageerror", error => errors.push(error.message));
    try {
      await fresh.goto(shared);
      await fresh.locator("#view-graph.active canvas").waitFor();
      await expect(fresh.getByRole("button", { name: "Relaxed", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(fresh.locator("#filter-toggle-related-docs")).toBeChecked();
      expect(JSON.parse((await fresh.locator("#graph-svg").getAttribute("data-layout-settings"))!)).toEqual(settings.forceGraph);
      await fresh.getByRole("button", { name: "2D", exact: true }).click();
      await localMapSettled(fresh);
      await expect(fresh.getByRole("button", { name: "Relaxed", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(fresh.locator("#tuning-force-coupling")).toHaveValue("1.1");
      await expect(fresh.locator("#tuning-force-link-width")).toHaveValue("1.1");
      await expect(fresh.locator("#tuning-force-node-zoom-resistance")).toHaveValue("0.35");
      await expect(fresh.locator("#tuning-force-wire-zoom-resistance")).toHaveValue("0.95");
    } finally { await fresh.close(); }
    expect(errors).toEqual([]);
  });
}

test("preset changes keep the selected file in place through 2D and 3D motion", async ({ page }) => {
  // Entering 3D settles eleven hundred spheres at full energy, about 20 seconds on this renderer alone, and the preset's
  // reheat settles them again: the whole test took 48 to 53 seconds in a night's green runs and lost one run at the
  // settle's 25-second wait with the box in use beside it (2026-10-19). The budgets are twice the measured times.
  test.setTimeout(120_000);
  await page.goto(`/?view=local&node=${generator}`);
  await page.locator(".local-placed").waitFor();
  await localMapSettled(page);
  for (const [mode, preset] of [["2d", "compact"], ["3d", "relaxed"]] as const) {
    if (mode === "3d") {
      await page.getByRole("button", { name: "3D", exact: true }).click();
      await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
    }
    const result = await page.evaluate(async ({ mode, preset, generator }) => {
      const point = (): { x: number; y: number } => {
        if (mode === "3d") {
          const label = document.querySelector<HTMLElement>(".force-graph-focus")!;
          return { x: parseFloat(label.style.left), y: parseFloat(label.style.top) };
        }
        const card = [...document.querySelectorAll<HTMLElement>(".node-card")].find(node => node.dataset.id === generator)!;
        const rect = card.getBoundingClientRect(); return { x: rect.left, y: rect.top };
      };
      const before = point();
      const frames: Array<{ x: number; y: number; moving: boolean }> = [];
      document.querySelector<HTMLButtonElement>(`[data-layout-preset="${preset}"]`)!.click();
      await new Promise<void>(resolve => {
        const sample = (): void => {
          const root = document.querySelector<HTMLElement>(".local-placed")!;
          const moving = mode === "2d" ? root.hasAttribute("data-moving") : document.querySelector("#graph-svg")!.getAttribute("aria-busy") === "true";
          frames.push({ ...point(), moving });
          if (moving || mode === "2d" && root.dataset.searchStatus === "running") requestAnimationFrame(sample);
          else resolve();
        };
        requestAnimationFrame(sample);
      });
      return { before, frames };
    }, { mode, preset, generator });
    expect(result.frames.filter(frame => frame.moving).length).toBeGreaterThan(3);
    for (const frame of result.frames) expect(Math.hypot(frame.x - result.before.x, frame.y - result.before.y)).toBeLessThanOrEqual(1.5);
  }
});

test("instant continuing layouts redraw the actual wires onto their pins", async ({ page }) => {
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); },
    { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { moveMs: 0, membraneEvenness: 1, membraneSimplicity: 100, rowLevelness: 0 } } }) });
  const scope = DECK_SCOPES.find(run => run.bundle === "estate" && run.scopeName === "five files")!;
  await page.goto(localRetainUrl(scope.base, scope.scope));
  await page.locator(".local-placed").waitFor();
  await localMapSettled(page);
  expect(Number(await page.locator(".local-placed").getAttribute("data-search-adopted"))).toBeGreaterThan(0);
  const separation = await page.evaluate(() => {
    const path = document.querySelector<SVGPathElement>('.connection-path[data-source-id="Contracts/IPaymentService.cs"][data-source-symbol="post"][data-target-id="Contracts/PaymentRequest.cs"]')!;
    const source = document.querySelector<HTMLElement>('.node-card[data-id="Contracts/PaymentRequest.cs"] .symbol-row[data-symbol="PaymentRequest"] .symbol-anchor.outbound')!.getBoundingClientRect();
    const target = document.querySelector<HTMLElement>('.node-card[data-id="Contracts/IPaymentService.cs"] .symbol-row[data-symbol="Post"] .symbol-anchor.inbound')!.getBoundingClientRect();
    const matrix = path.getScreenCTM()!;
    const a = path.getPointAtLength(0), b = path.getPointAtLength(path.getTotalLength());
    const start = new DOMPoint(a.x, a.y).matrixTransform(matrix), end = new DOMPoint(b.x, b.y).matrixTransform(matrix);
    return [Math.abs(start.y - source.top - source.height / 2), Math.abs(end.y - target.top - target.height / 2)];
  });
  for (const distance of separation) expect(distance).toBeLessThan(1);
});

test("Relaxed aligns the three Rosetta cards while both presets preserve their facts", async ({ page }) => {
  const root = "tests/integration/programs/typescript/rosetta/src/";
  await page.goto(`/?view=local&node=${root}main.ts`);
  await page.locator(".local-placed").waitFor();
  const read = async () => page.locator(".local-placed").evaluate(element => {
    const cards = [...element.querySelectorAll<HTMLElement>(".node-card")];
    // The three source cards stand in one row under Relaxed; the sample's data files, cards since the asset rule of
    // 2026-10-16, stand in their own directories and are not measured for the row.
    const source = cards.filter(card => card.dataset.id?.startsWith("tests/integration/programs/typescript/rosetta/src/"));
    return { ids: cards.map(card => card.dataset.id).sort(), tops: source.map(card => card.getBoundingClientRect().top),
      references: [...document.querySelectorAll<SVGElement>(".connection-path[data-source-id]")].map(path =>
        JSON.stringify([path.dataset.sourceId, path.dataset.sourceSymbol, path.dataset.targetId, path.dataset.targetSymbol, path.dataset.kind])).sort() };
  });
  await page.getByRole("button", { name: "Compact", exact: true }).click();
  await localMapSettled(page);
  const compact = await read();
  expect(compact.ids).toEqual(expect.arrayContaining([`${root}main.ts`, `${root}models.ts`, `${root}processor.ts`]));
  expect(compact.tops).toHaveLength(3);
  expect(compact.references.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Relaxed", exact: true }).click();
  await localMapSettled(page);
  const relaxed = await read();
  expect(relaxed.ids).toEqual(compact.ids);
  expect(relaxed.references).toEqual(compact.references);
  expect(Math.max(...relaxed.tops) - Math.min(...relaxed.tops)).toBeLessThan(.1);
});

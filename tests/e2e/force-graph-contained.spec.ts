import { expect, test, type Page } from "@playwright/test";

import { clippedContainedMark, compareContainedRendering } from "./contained-sphere-reference";
import { observeGraph } from "./force-graph-observation";
import { localMapSettled } from "./still-picture";

const entry = "/samples/estate/?view=local&mode=3d&dir=Portal&layout=structure";
test.use({ viewport: { width: 1280, height: 800 } });

async function arrive(page: Page, native: boolean): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  if (native) await page.addInitScript(() => {
    const getExtension = WebGL2RenderingContext.prototype.getExtension;
    WebGL2RenderingContext.prototype.getExtension = function (name: string) {
      return name === "OES_sample_variables" ? null : Reflect.apply(getExtension, this, [name]);
    };
  });
  await observeGraph(page);
  await page.goto(entry);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  return errors;
}

for (const native of [false, true]) {
  const backend = native ? "native compatibility" : "per-sample";
  test(`${backend} contained files match independent native rendering through clipping, lens shifts and overlap`, async ({ page }) => {
    const errors = await arrive(page, native);
    const report = await compareContainedRendering(page, native);
    await test.info().attach("native-rendering-comparison", { body: JSON.stringify(report), contentType: "application/json" });
    expect(report.material).toBe(native ? "MeshLambertMaterial" : "RawShaderMaterial");
    expect(report.vertices).toBe(native ? 169 : 4);
    expect(report.samples, "the coverage comparison exercises actual multisampling").toBeGreaterThan(1);
    for (const pose of report.results) {
      if (pose.visible) expect(pose.covered, `${pose.name}: the independent reference actually draws a surface`).toBeGreaterThan(20);
      else expect(pose.covered, `${pose.name}: the independent FrontSide reference draws nothing`).toBe(0);
      if (native || !pose.visible) expect(pose.all.max, `${pose.name}: native fallback or fully absent surface has identical pixels`).toBe(0);
      else {
        if (pose.name === "close" || pose.overlap) expect(pose.interior.pixels, "the interior comparison is nonempty").toBeGreaterThan(0);
        if (pose.overlap) expect(pose.overlapInterior, "multiple translucent instances cover a real interior region").toBeGreaterThan(0);
        expect(pose.edge.total / pose.edge.pixels, `${pose.name}: native MSAA edge coverage`).toBeLessThan(3);
        expect(pose.interior.total / Math.max(1, pose.interior.pixels), `${pose.name}: lighting and translucent opacity`).toBeLessThan(.25);
        expect(pose.interior.changed / Math.max(1, pose.interior.pixels), `${pose.name}: no opacity/depth error across the interior`).toBeLessThan(.0001);
        expect(pose.outside.max, `${pose.name}: nothing is painted beyond the reference edge band`).toBeLessThanOrEqual(3);
      }
    }
    expect(errors).toEqual([]);
  });

  test(`${backend} clipped contained marks keep their real hole and rim while travelling in both directions`, async ({ page }) => {
    await page.clock.install();
    const errors = await arrive(page, native);
    // Pause before the operation, then drive real RAF steps: pausing after a GPU read can race a past timestamp.
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    let probes = await clippedContainedMark(page);
    await test.info().attach("clipped-gpu-source", { body: JSON.stringify(probes), contentType: "application/json" });
    expect(probes.sidesInside, "the geometric skin anchor retains the full projected boundary").toBe(true);
    expect(probes.enclosed, "target-specific rim pixels surround the actual GPU hole").toBe(true);
    expect(probes.hole, "the actual GPU surface has a hollow center before capture").toEqual(Array(9).fill(0));
    for (const toGraph of [false, true]) {
      await page.getByRole("button", { name: toGraph ? "3D" : "2D", exact: true }).click();
      const layer = page.locator(".perspective-transition[data-graph-files]");
      await expect.poll(async () => { await page.clock.runFor(16); return layer.isVisible(); }, { intervals: [0] }).toBe(true);
      if (!toGraph) {
        const sourceAnchor = await layer.locator(`.perspective-file-name[data-node-id="${probes.seed}"]`).evaluate(element => { const label = element as HTMLElement, frame = label.parentElement!.getBoundingClientRect(); return { x: frame.left + parseFloat(label.style.left), y: frame.top + parseFloat(label.style.top) }; });
        await test.info().attach("skin-anchor-difference", { body: JSON.stringify({ sourceAnchor, geometricRasterAnchor: probes.body, dx: sourceAnchor.x - probes.body.x, dy: sourceAnchor.y - probes.body.labelY }), contentType: "application/json" });
        expect(Math.abs(sourceAnchor.x - probes.body.x)).toBeLessThan(1);
        expect(Math.abs(sourceAnchor.y - probes.body.labelY)).toBeLessThan(1);
      }
      const target = toGraph ? .55 : .2, progress = Number(await layer.getAttribute("data-progress"));
      expect(progress).toBeLessThan(target);
      await page.clock.runFor(Math.ceil((target - progress) * 1400));
      if (toGraph) probes = await clippedContainedMark(page, false);
      expect(probes.sidesInside).toBe(true);
      expect(probes.enclosed).toBe(true);
      expect(probes.hole).toEqual(Array(9).fill(0));
      const label = layer.locator(`.perspective-file-name[data-node-id="${probes.seed}"]`);
      await expect(label).toHaveCount(1);
      const painted = await layer.locator("canvas").evaluate((element, probes) => {
        const canvas = element as HTMLCanvasElement, context = canvas.getContext("2d")!, frame = canvas.getBoundingClientRect();
        const label = document.querySelector<HTMLElement>(`.perspective-file-name[data-node-id="${probes.seed}"]`)!;
        const shift = { x: parseFloat(label.style.left) + frame.left - probes.body.x, y: parseFloat(label.style.top) + frame.top - probes.body.labelY };
        const srgb = (value: number) => Math.round(255 * (value <= .0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - .055));
        const expected = probes.color.map(srgb), ratio = canvas.width / frame.width;
        const containsFile = (point: { x: number; y: number }): boolean => {
          const x = Math.floor((point.x + shift.x - frame.left) * ratio), y = Math.floor((point.y + shift.y - frame.top) * ratio);
          const data = context.getImageData(x - 1, y - 1, 3, 3).data;
          for (let at = 0; at < data.length; at += 4) if (data[at + 3] > 40 && expected.every((channel, index) => Math.abs(channel - data[at + index]) < 24)) return true;
          return false;
        };
        const mapped = { x: (probes.holePoint.x + shift.x - frame.left) * ratio, y: (probes.holePoint.y + shift.y - frame.top) * ratio };
        const selectedPixel = { x: Math.floor(mapped.x), y: Math.floor(mapped.y) };
        return { shift, mapped, selectedPixel, selectedCenter: { x: selectedPixel.x + .5, y: selectedPixel.y + .5 }, holeFilled: containsFile(probes.holePoint), rimDrawn: probes.rimPoints.map(containsFile), opacity: Number(label.style.opacity) };
      }, probes);
      await test.info().attach(`carried-mark-${toGraph ? "out" : "back"}`, { body: JSON.stringify({ probes, painted }), contentType: "application/json" });
      expect(painted.opacity, "the container identity is visibly travelling").toBeGreaterThan(.1);
      expect(painted.holeFilled, "the carrier never fills the front surface clipped out of the actual GPU picture").toBe(false);
      expect(painted.rimDrawn, "three target-specific colored rim points still surround the travelling hole").toEqual([true, true, true]);
      await page.clock.runFor(1600); await page.clock.resume();
      await expect(layer).toHaveCount(0);
      if (toGraph) await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
      else { await localMapSettled(page); await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000); }
    }
    expect(errors).toEqual([]);
  });
}

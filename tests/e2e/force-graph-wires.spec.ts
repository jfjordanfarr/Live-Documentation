import { expect, test, type Locator, type Page } from "@playwright/test";
import type { Mesh, Scene, Camera, PerspectiveCamera, WebGLRenderer } from "three";

import { engineActivity, observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/** These contracts exercise both sizing endpoints explicitly, independently of the visually tuned defaults. */
async function seedSizing(page: Page): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: {
      localMap: { searchStarts: 0 }, forceGraph: { nodeZoomResistance: 0, wireZoomResistance: 1, linkWidth: 1 }
    } })
  });
}

async function setSlider(slider: Locator, value: number): Promise<void> {
  const range = await slider.evaluate(element => ({ min: Number((element as HTMLInputElement).min), step: Number((element as HTMLInputElement).step) }));
  await slider.press("Home");
  for (let i = 0; i < Math.round((value - range.min) / range.step); i++) await slider.press("ArrowRight");
  await expect(slider).toHaveValue(String(value));
}

async function cameraPose(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const camera = (window as unknown as { renderedGraph: { camera: Camera } }).renderedGraph.camera;
    return [...camera.matrixWorld.elements, ...camera.projectionMatrix.elements];
  });
}

/** Isolate a real graph wire and measure its GPU pixels through the production scene hooks and shader. */
async function resistancePixels(page: Page) {
  return page.evaluate(() => {
    type NativeMesh = Mesh & { __graphObjType?: string; __linkThreeObjType?: string; __data?: { count?: number } };
    const { scene, camera, renderer } = (window as unknown as {
      renderedGraph: { scene: Scene; camera: PerspectiveCamera; renderer: WebGLRenderer }
    }).renderedGraph;
    const objects: Array<{ mesh: NativeMesh; visible: boolean }> = [];
    scene.traverse(object => {
      const mesh = object as NativeMesh;
      if (mesh.__graphObjType || mesh.__linkThreeObjType === "arrow") objects.push({ mesh, visible: mesh.visible });
    });
    const wire = objects.find(({ mesh }) => mesh.__graphObjType === "link" && mesh.__data?.count === 1)!.mesh;
    const saved = { position: wire.position.clone(), rotation: wire.quaternion.clone(), scale: wire.scale.clone(), near: camera.near, far: camera.far };
    const canvas = document.createElement("canvas");
    canvas.width = renderer.domElement.width; canvas.height = renderer.domElement.height;
    const context = canvas.getContext("2d")!;
    const cssScale = canvas.height / renderer.domElement.getBoundingClientRect().height;
    const pixelScale = Math.abs(camera.projectionMatrix.elements[5]) * canvas.height / (2 * cssScale);
    const point = (x: number, depth: number) => camera.position.clone().set(x * depth / camera.projectionMatrix.elements[0], 0, -depth);
    const draw = (from: ReturnType<typeof point>, to: ReturnType<typeof point>): Uint8ClampedArray => {
      const start = from.clone().applyMatrix4(camera.matrixWorld), end = to.clone().applyMatrix4(camera.matrixWorld);
      wire.position.copy(wire.parent!.worldToLocal(start.clone()));
      wire.lookAt(end); wire.scale.set(1, 1, start.distanceTo(end));
      scene.updateMatrixWorld(true); renderer.render(scene, camera);
      context.drawImage(renderer.domElement, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const signal = (pixels: Uint8ClampedArray, x: number, y: number): number => {
      const i = (y * canvas.width + x) * 4, background = x * 4;
      return Math.max(...[0, 1, 2].map(channel => Math.abs(pixels[i + channel] - pixels[background + channel])));
    };
    const widths = (pixels: Uint8ClampedArray): number[] => [.35, .5, .65].map(fraction => {
      const x = Math.round(canvas.width * fraction), profile: number[] = [];
      for (let y = Math.floor(canvas.height / 2 - 30 * cssScale); y <= canvas.height / 2 + 30 * cssScale; y++) profile.push(signal(pixels, x, y));
      const peak = Math.max(...profile);
      return peak ? profile.reduce((sum, value) => sum + value / peak, 0) / cssScale : 0;
    });
    const cap = (pixels: Uint8ClampedArray): number[] => {
      const result: number[] = [];
      for (let y = Math.floor(canvas.height / 2 - 8 * cssScale); y < canvas.height / 2 + 8 * cssScale; y++) {
        for (let x = Math.floor(canvas.width / 2 - 8 * cssScale); x < canvas.width / 2 + 8 * cssScale; x++) result.push(signal(pixels, x, y));
      }
      return result;
    };
    try {
      for (const { mesh } of objects) mesh.visible = false;
      wire.visible = true;
      camera.near = pixelScale / 8; camera.far = pixelScale * 100; camera.updateProjectionMatrix();
      const depthWidths = [pixelScale / 2, pixelScale * 2].map(depth => widths(draw(point(-.55, depth), point(.55, depth)))[1]);
      const near = point(-.55, camera.near), far = point(.55, pixelScale * 4);
      const between = near.clone().lerp(far, camera.near * .9 / (far.z - near.z));
      const behind = near.clone().lerp(far, camera.near * 2 / (far.z - near.z));
      const clipped = widths(draw(near, far));
      const betweenCameraAndNear = widths(draw(between, far));
      const crossingCamera = widths(draw(behind, far));
      const nearCap = point(0, pixelScale / 2), farCap = point(0, pixelScale * 2);
      const expectedCap = cap(draw(nearCap, nearCap));
      const capInk = expectedCap.reduce((sum, value) => sum + value, 0);
      const capDifference = (actual: number[]): number => actual.reduce((sum, value, i) => sum + Math.abs(value - expectedCap[i]), 0) / capInk;
      const forwardCapDifference = capDifference(cap(draw(nearCap, farCap)));
      const reversedCapDifference = capDifference(cap(draw(farCap, nearCap)));
      return { depthWidths, clipped, betweenCameraAndNear, crossingCamera, capInk, forwardCapDifference, reversedCapDifference };
    } finally {
      camera.near = saved.near; camera.far = saved.far; camera.updateProjectionMatrix();
      wire.position.copy(saved.position); wire.quaternion.copy(saved.rotation); wire.scale.copy(saved.scale);
      for (const { mesh, visible } of objects) mesh.visible = visible;
      scene.updateMatrixWorld(true); renderer.render(scene, camera);
    }
  });
}

for (const [base, subject] of [["/", "packages/generator/src/generator.ts"], ["/samples/estate/", "Portal/Services/GatewayClient.cs"]]) {
  test(`wire thickness reflects coupling and adjusts without disturbing the scene: ${base}`, async ({ page }) => {
    // This is a functional sizing journey, not a frame-rate benchmark. Completed GPU measurements on this
    // software renderer took 37s even with the original renderer; retain room for setup and the control journey.
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await observeGraph(page);
    await seedSizing(page);
    await page.goto(`${base}?view=local&mode=3d&node=${subject}`);
    await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
    await page.mouse.move(5, 5);
    const links = await renderedLinks(page);
    const byCount = new Map<number, number>();
    for (const link of links) {
      expect(link.width).toBeGreaterThanOrEqual(0.99);
      expect(link.width).toBeLessThanOrEqual(3.01);
      if (byCount.has(link.count)) expect(link.width).toBeCloseTo(byCount.get(link.count)!, 5);
      else byCount.set(link.count, link.width);
    }
    const counts = [...byCount.keys()].sort((a, b) => a - b);
    expect(counts.length).toBeGreaterThan(2);
    expect(byCount.get(1)).toBeCloseTo(1, 5);
    for (let i = 1; i < counts.length; i++) expect(byCount.get(counts[i])!).toBeGreaterThanOrEqual(byCount.get(counts[i - 1])! - 0.00001);
    expect(byCount.get(counts[counts.length - 1])!).toBeGreaterThan(1.2 * byCount.get(1)!);

    await page.getByText("Tuning", { exact: true }).click();
    const slider = page.getByRole("slider", { name: /Wire Thickness/ });
    await expect(slider).toHaveValue("1");
    const before = await renderedNodes(page);
    const activity = await engineActivity(page);
    await slider.focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("2");
    await expect(page.locator("#tuning-force-link-width-value")).toHaveText("2");
    await expect.poll(async () => Math.min(...(await renderedLinks(page)).map(link => link.width))).toBeGreaterThan(1.99);
    const widths = new Map(links.map(link => [JSON.stringify([link.source, link.target, link.kind]), link.width]));
    for (const link of await renderedLinks(page)) {
      // The native width accessor rounds to tenths before supplying the screen-space batch.
      expect(Math.abs(link.width - 2 * widths.get(JSON.stringify([link.source, link.target, link.kind]))!)).toBeLessThan(0.101);
    }
    const after = await renderedNodes(page);
    expect(after.map(node => ({ id: node.id, world: node.world, x: node.x, y: node.y })))
      .toEqual(before.map(node => ({ id: node.id, world: node.world, x: node.x, y: node.y })));
    expect((await engineActivity(page)).changes).toEqual(activity.changes);
    await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false");

    // Exercise ordinary zoom: weights and actual endpoints survive camera motion without waking the layout.
    await page.mouse.move(900, 450);
    await page.mouse.wheel(0, -400);
    await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === subject)!.screenRadius)
      .toBeGreaterThan(before.find(node => node.id === subject)!.screenRadius * 1.4);
    for (const link of await renderedLinks(page)) {
      expect(Math.abs(link.width - 2 * widths.get(JSON.stringify([link.source, link.target, link.kind]))!)).toBeLessThan(0.101);
    }
    expect((await engineActivity(page)).changes).toEqual(activity.changes);
  });
}

test("node and wire resistance controls are independent, preserve placement, and persist", async ({ page, context }) => {
  test.setTimeout(60_000);
  await observeGraph(page); await seedSizing(page);
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
  await page.getByText("Tuning", { exact: true }).click();
  await page.mouse.move(5, 5);
  const nodeSlider = page.getByRole("slider", { name: /Node Zoom Resistance/ });
  const wireSlider = page.getByRole("slider", { name: /Wire Zoom Resistance/ });
  const baseline = await renderedNodes(page), camera = await cameraPose(page), activity = await engineActivity(page);
  const positions = (nodes: Awaited<ReturnType<typeof renderedNodes>>) => nodes.map(node => ({ id: node.id, world: node.world, x: node.x, y: node.y }));
  const reference = baseline.filter(node => node.depth >= -1 && node.depth <= 1 && node.screenRadius > .1);
  expect(reference.length).toBeGreaterThan(3);
  const radii = new Map<number, Map<string, number>>([[0, new Map(baseline.map(node => [node.id, node.screenRadius]))]]);
  for (const resistance of [.5, 1]) {
    await setSlider(nodeSlider, resistance);
    await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === reference[0].id)!.screenRadius)
      .not.toBe(radii.get(resistance === 1 ? .5 : 0)!.get(reference[0].id));
    const nodes = await renderedNodes(page);
    radii.set(resistance, new Map(nodes.map(node => [node.id, node.screenRadius])));
    expect(positions(nodes)).toEqual(positions(baseline));
    expect(await cameraPose(page)).toEqual(camera);
    await expect(wireSlider).toHaveValue("1");
  }
  for (const node of reference) {
    // These are the radii of the actual instanced spheres, not values read back from the controls.
    expect(radii.get(1)!.get(node.id)!).toBeCloseTo(node.radius, 3);
    expect(radii.get(.5)!.get(node.id)! ** 2).toBeCloseTo(radii.get(0)!.get(node.id)! * radii.get(1)!.get(node.id)!, 3);
  }
  const fixedNodes = await renderedNodes(page);
  for (const resistance of [0, .5, 1]) {
    await setSlider(wireSlider, resistance);
    await expect.poll(async () => (JSON.parse((await page.locator("#graph-svg").getAttribute("data-layout-settings"))!) as { wireZoomResistance: number }).wireZoomResistance).toBe(resistance);
    expect(await renderedNodes(page)).toEqual(fixedNodes);
    expect(await cameraPose(page)).toEqual(camera);
    await expect(nodeSlider).toHaveValue("1");
  }
  expect((await engineActivity(page)).changes).toEqual(activity.changes);
  await setSlider(nodeSlider, .5); await setSlider(wireSlider, .5);
  await expect.poll(async () => page.evaluate(key => {
    const stored = JSON.parse(localStorage.getItem(key)!) as { tuning?: { forceGraph?: { nodeZoomResistance?: number; wireZoomResistance?: number } } };
    return [stored.tuning?.forceGraph?.nodeZoomResistance, stored.tuning?.forceGraph?.wireZoomResistance];
  }, PERSISTED_UI_KEY)).toEqual([.5, .5]);
  // A new page in the same browser reads the persisted choices without this page's seeding script or shared URL.
  await page.close();
  const fresh = await context.newPage();
  try {
    await fresh.goto("/samples/estate/");
    await expect(fresh.locator("#tuning-force-node-zoom-resistance")).toHaveValue("0.5");
    await expect(fresh.locator("#tuning-force-wire-zoom-resistance")).toHaveValue("0.5");
  } finally { await fresh.close(); }
});

for (const dpr of [1, 2]) {
  test(`wire pixels keep their width across depth and zoom at DPR ${dpr}`, async ({ browser, baseURL }) => {
    const page = await browser.newPage({ baseURL, viewport: { width: 1280, height: 800 }, deviceScaleFactor: dpr });
    try {
      await observeGraph(page);
      await seedSizing(page);
      await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
      await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
      await page.getByText("Tuning", { exact: true }).click();
      const slider = page.getByRole("slider", { name: /Wire Thickness/ });
      await slider.focus();
      for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
      await expect.poll(async () => Math.min(...(await renderedLinks(page)).filter(link => link.count === 1).map(link => link.width))).toBe(2);
      const widths = await page.evaluate(() => {
        type NativeMesh = Mesh & { __graphObjType?: string; __linkThreeObjType?: string; __data?: { count?: number } };
        const observed = (window as unknown as { renderedGraph: { scene: Scene; camera: Camera; renderer: WebGLRenderer } }).renderedGraph;
        const { scene, camera, renderer } = observed;
        const objects: Array<{ mesh: NativeMesh; visible: boolean }> = [];
        scene.traverse(object => {
          const mesh = object as NativeMesh;
          if (mesh.__graphObjType || mesh.__linkThreeObjType === "arrow") objects.push({ mesh, visible: mesh.visible });
        });
        const wire = objects.find(({ mesh }) => mesh.__graphObjType === "link" && mesh.__data?.count === 1)!.mesh;
        const saved = { position: wire.position.clone(), rotation: wire.quaternion.clone(), scale: wire.scale.clone() };
        const canvas = document.createElement("canvas");
        canvas.width = renderer.domElement.width; canvas.height = renderer.domElement.height;
        const context = canvas.getContext("2d")!;
        const cssScale = canvas.height / renderer.domElement.getBoundingClientRect().height;
        const result: number[] = [];
        try {
          // Isolate a real graph wire and draw it at controlled camera-relative depths, through the real scene hooks
          // and GPU shader. Read actual pixels immediately after each draw; no application state or shader formula.
          for (const { mesh } of objects) mesh.visible = false;
          wire.visible = true;
          for (const distance of [500, 2000, 8000]) {
            const start = wire.position.clone().set(-distance * .4, 0, -distance).applyMatrix4(camera.matrixWorld);
            const end = wire.position.clone().set(distance * 1.6, 0, -distance * 4).applyMatrix4(camera.matrixWorld);
            wire.position.copy(wire.parent!.worldToLocal(start.clone()));
            wire.lookAt(end); wire.scale.set(1, 1, start.distanceTo(end));
            scene.updateMatrixWorld(true); renderer.render(scene, camera);
            context.drawImage(renderer.domElement, 0, 0);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            for (const fraction of [.4, .5, .6]) {
              const x = Math.round(canvas.width * fraction);
              const background = pixels[x * 4];
              const profile: number[] = [];
              for (let y = Math.floor(canvas.height / 2) - 15 * cssScale; y <= canvas.height / 2 + 15 * cssScale; y++) {
                profile.push(Math.max(0, pixels[(y * canvas.width + x) * 4] - background));
              }
              const peak = Math.max(...profile);
              result.push(peak ? profile.reduce((sum, value) => sum + value / peak, 0) / cssScale : 0);
            }
          }
        } finally {
          wire.position.copy(saved.position); wire.quaternion.copy(saved.rotation); wire.scale.copy(saved.scale);
          for (const { mesh, visible } of objects) mesh.visible = visible;
          scene.updateMatrixWorld(true); renderer.render(scene, camera);
        }
        return result;
      });
      expect(widths).toHaveLength(9);
      for (const width of widths) expect(Math.abs(width - 2)).toBeLessThan(.55);
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(.55);
    } finally { await page.close(); }
  });

  test(`partial wire resistance, clipped tapers, and end-on caps render correctly at DPR ${dpr}`, async ({ browser, baseURL }) => {
    test.setTimeout(60_000);
    const page = await browser.newPage({ baseURL, viewport: { width: 1280, height: 800 }, deviceScaleFactor: dpr });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    try {
      await observeGraph(page); await seedSizing(page);
      await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
      await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
      await page.getByText("Tuning", { exact: true }).click();
      await setSlider(page.getByRole("slider", { name: /Wire Thickness/ }), 4);
      await expect.poll(async () => Math.min(...(await renderedLinks(page)).filter(link => link.count === 1).map(link => link.width))).toBe(4);
      const pictures = new Map<number, Awaited<ReturnType<typeof resistancePixels>>>();
      for (const resistance of [0, .5, 1]) {
        await setSlider(page.getByRole("slider", { name: /Wire Zoom Resistance/ }), resistance);
        const picture = await resistancePixels(page); pictures.set(resistance, picture);
        for (let i = 0; i < picture.clipped.length; i++) {
          expect(picture.clipped[i]).toBeGreaterThan(1);
          expect(Math.abs(picture.betweenCameraAndNear[i] - picture.clipped[i])).toBeLessThan(.55);
          expect(Math.abs(picture.crossingCamera[i] - picture.clipped[i])).toBeLessThan(.55);
        }
        expect(picture.capInk).toBeGreaterThan(0);
        expect(picture.forwardCapDifference).toBeLessThan(.1);
        expect(picture.reversedCapDifference).toBeLessThan(.1);
      }
      const perspective = pictures.get(0)!.depthWidths, partial = pictures.get(.5)!.depthWidths, invariant = pictures.get(1)!.depthWidths;
      for (let i = 0; i < 2; i++) {
        expect(Math.abs(perspective[i] - [8, 2][i])).toBeLessThan(.65);
        expect(Math.abs(invariant[i] - 4)).toBeLessThan(.65);
        // The partial response is measured between the two rasterized endpoints, not read from shader uniforms.
        expect(Math.abs(partial[i] - Math.sqrt(perspective[i] * invariant[i]))).toBeLessThan(.65);
      }
      expect(partial[0]).toBeGreaterThan(invariant[0] + 1);
      expect(partial[1]).toBeLessThan(invariant[1] - .5);
      expect(errors).toEqual([]);
    } finally { await page.close(); }
  });
}

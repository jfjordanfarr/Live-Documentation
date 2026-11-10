import { test, expect, type Page } from "@playwright/test";

import { overlapsAmong, textBoxes, truncations } from "./design-audit";
import { engineActivity, observeGraph, renderedNodes, renderedLinks } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";
import { localMapSettled } from "./still-picture";

const names = [".force-graph-focus", ".force-graph-label"];

test("a fresh 3D visit without declared entries starts in Structure and remembers a deliberate layout choice", async ({ page }) => {
  await page.goto("/samples/estate/?view=local&mode=3d");
  await expect(page.getByRole("button", { name: "Structure", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Connections", exact: true }).click();
  await page.goto("/samples/estate/?view=local&mode=3d");
  await expect(page.getByRole("button", { name: "Connections", exact: true })).toHaveAttribute("aria-pressed", "true");
});

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
  // At rest only what was asked about is named (2026-11-02), so the boxes are the toolbar and a name or a few; the
  // rules below, no collision, no cut text, every name in the viewport at reading size, are what the check holds.
  expect(boxes.length).toBeGreaterThan(1);
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
    const rewrittenNames = await page.evaluate(async () => {
      let changes = 0;
      const observer = new MutationObserver(records => {
        changes += records.filter(record => record.target instanceof HTMLElement
          && record.target.matches(".force-graph-focus, .force-graph-label")).length;
      });
      observer.observe(document.getElementById("graph-svg")!, { attributes: true, subtree: true });
      await new Promise(resolve => setTimeout(resolve, 250));
      observer.disconnect();
      return changes;
    });
    expect(rewrittenNames, "stationary names are not rewritten on every animation frame").toBe(0);
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
  // The open directory is named as asked about; its member files are named on approach or hover (2026-11-02).
  const gatewaySphere = (await renderedNodes(page)).find(node => node.id === "Portal/Services/GatewayClient.cs")!;
  await page.mouse.move(gatewaySphere.x, gatewaySphere.y);
  const gateway = page.locator('.force-graph-label[data-node-id="Portal/Services/GatewayClient.cs"]');
  await expect(gateway).toBeVisible();
  await readableNames(page);
  await blueSphereIsPainted(page, "Portal/Services/GatewayClient.cs");
  const before = currentSnapshot(page);
  await gateway.focus();
  await page.getByRole("button", { name: "More actions for GatewayClient.cs", exact: true }).click();
  await page.getByRole("menuitem", { name: "Inspect GatewayClient.cs", exact: true }).click();
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
  // The fresh Skin/one-hop start frames the root's own file and its six top-level directory cells.
  await expect(page.getByRole("button", { name: "Structure", exact: true })).toHaveAttribute("aria-pressed", "true");
  const files = nodes.filter(node => node.directory === undefined);
  expect(files.map(node => node.id)).toEqual(["Estate.sln"]);
  expect(nodes.filter(node => node.directory !== undefined).map(node => node.directory).sort())
    .toEqual(["", "Contracts", "Database", "Gateway", "Hub", "PaymentService", "Portal"]);
  expect(nodes.some(node => node.directory === "")).toBe(true);
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

test.describe("names beside visible rings", () => {
  // This is the owner's ordinary journey: the 2D search and all motion retain their product defaults.
  test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });

  test("directory names clear visible rings through the perspective journey and a rewrap", async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await observeGraph(page);
    const settled = (): Promise<void> => expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
    const switchTo = async (name: "2D" | "3D"): Promise<void> => {
      const begun = page.locator(".perspective-transition").waitFor({ state: "visible" });
      await page.getByRole("button", { name, exact: true }).click();
      await begun;
      await expect(page.locator(".perspective-transition")).toHaveCount(0, { timeout: 25_000 });
      if (name === "2D") await localMapSettled(page);
      else await settled();
    };
    const checkRings = async (name: string): Promise<void> => {
      await page.mouse.move(300, 900);
      // Wait for the pointer's temporary attention to leave before reading the ordinary names and uploaded picture.
      await expect(page.locator("#graph-svg")).toHaveAttribute("data-hovered-node", "false");
      const picture = await page.evaluate(() => {
        const observed = window as unknown as { renderedGraph: { scene: import("three").Scene; camera: import("three").Camera } };
        const { scene, camera } = observed.renderedGraph;
        const canvas = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
        const mesh = scene.getObjectByName("Spatial rings") as import("three").InstancedMesh;
        const entries = mesh.userData.spatialBatch.entries as Array<{ data: { id: string }; slot: number; enabled: boolean }>;
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        // Read the submitted ring geometry and matrices, independently of the label candidates and radius constant.
        const rings = entries.filter(entry => entry.enabled && entry.slot < mesh.count).map(entry => {
          const matrix = mesh.matrixWorld.clone(); mesh.getMatrixAt(entry.slot, matrix); matrix.premultiply(mesh.matrixWorld);
          const sphere = mesh.geometry.boundingSphere!.clone().applyMatrix4(matrix);
          const point = sphere.center.clone().project(camera), right = camera.matrixWorld.elements;
          const rim = sphere.center.clone().add(sphere.center.clone().set(right[0], right[1], right[2]).multiplyScalar(sphere.radius)).project(camera);
          return { id: entry.data.id, x: canvas.left + (point.x + 1) * canvas.width / 2,
            y: canvas.top + (1 - point.y) * canvas.height / 2, radius: Math.abs(rim.x - point.x) * canvas.width / 2 };
        });
        const labels = [...document.querySelectorAll<HTMLButtonElement>(".force-graph-label")].filter(label => !label.hidden).map(label => {
          const box = label.getBoundingClientRect();
          return { id: label.dataset.nodeId, text: label.textContent, x: box.x, y: box.y, width: box.width, height: box.height };
        });
        const clearances = labels.flatMap(label => rings.map(ring => {
          const dx = Math.max(label.x, Math.min(ring.x, label.x + label.width)) - ring.x;
          const dy = Math.max(label.y, Math.min(ring.y, label.y + label.height)) - ring.y;
          return { label: label.id, ring: ring.id, clearance: Math.hypot(dx, dy) - ring.radius };
        }));
        return { labels, rings, clearances };
      });
      await testInfo.attach(`${name}-geometry`, { body: JSON.stringify(picture, null, 2), contentType: "application/json" });
      expect(picture.labels.map(label => label.id).sort(), `${name} retains every independently observed ordinary name`).toEqual([
        "Contracts/PaymentQuery.cs", "Contracts/PaymentRequest.cs", "PaymentService/Data/Payment.cs",
        "PaymentService/Data/PaymentsContext.cs", "PaymentService/Data/PostPaymentRow.cs", "shell:Gateway", "shell:Hub",
        "shell:Portal/Models", "shell:Portal/Pages"
      ]);
      expect(picture.rings.map(ring => ring.id).sort()).toEqual([
        "Contracts/PaymentQuery.cs", "Contracts/PaymentRequest.cs", "Contracts/PaymentResult.cs",
        "Database/SqlServer/dbo.usp_PostPayment.sql", "Hub/App.config"
      ]);
      // Allow 0.1 CSS pixels for rounding between uploaded geometry and the browser's measured label rectangles.
      expect(picture.clearances.filter(pair => pair.clearance < 1.9), `${name}: every name clears the uploaded outer rings by two CSS pixels, within rounding`).toEqual([]);
      expect(currentSnapshot(page).openDirectories).toEqual(new Set(["PaymentService"]));
      expect(currentSnapshot(page).pinSet.entries).toEqual([]);
    };

    await page.goto("/samples/estate/?view=local&mode=3d&layout=structure");
    await settled();
    await page.locator('.force-graph-label[data-node-id="directory:PaymentService"]').click();
    await settled();
    await switchTo("2D");
    await switchTo("3D");
    await page.getByRole("button", { name: "Connections", exact: true }).click();
    await settled();
    await checkRings("connections-ending");

    // Repacking changes the projected obstacles; a remembered name side must be checked against the new picture.
    await page.locator('.force-graph-label[data-node-id="shell:Gateway"]').click();
    await settled();
    await page.getByRole("button", { name: "Wrap Gateway again", exact: true }).click();
    await settled();
    await checkRings("gateway-rewrapped");
  });
});

import { expect, test, type Page } from "@playwright/test";
import type { BufferGeometry, Mesh, MeshLambertMaterial, Scene } from "three";

import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

test.use({ viewport: { width: 1280, height: 800 } });

const key = (page: Page, text: string) => page.locator("#spatial-legend .legend-row").filter({ hasText: new RegExp(`^${text}$`) });

/** Compare the painted key swatch with the node material sent to Three, rather than importing the shared palette. */
async function matchesNodeColour(page: Page, label: string, id: string): Promise<void> {
  const color = await key(page, label).locator(".spatial-legend-sample").evaluate(element =>
    getComputedStyle(element, "::before").backgroundColor);
  const agrees = await page.evaluate(({ id, color }) => {
    const { scene } = (window as unknown as { renderedGraph: { scene: Scene } }).renderedGraph;
    let matches = false;
    scene.traverse(object => {
      const mesh = object as Mesh<BufferGeometry, MeshLambertMaterial> & { __graphObjType?: string; __data?: { id?: string } };
      if (mesh.__graphObjType === "node" && mesh.__data?.id === id) {
        matches = mesh.material.color.clone().setStyle(color).equals(mesh.material.color);
      }
    });
    return matches;
  }, { id, color });
  expect(agrees, `${label}'s key matches ${id}'s rendered material`).toBe(true);
}

test("the spatial key follows rendered kinds, including a retained test hidden by the general filter", async ({ page }) => {
  // The estate has no tests or citations. This eight-file history sample has both, without a repository-sized scene.
  const subject = "src/app/main.ts", retainedTest = "tests/main.test.ts";
  await observeGraph(page);
  await page.goto(`/samples/history/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT, perspective: "3d", selectedNodeId: subject,
    pinSet: { entries: [{ nodeId: retainedTest, symbol: "*" }] },
    filters: { showTests: true, showAssets: false, showRelatedDocs: false, showCitingDocs: false }
  })}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  await expect(page.locator("#spatial-legend .legend-row")).toHaveText([
    "Implementation", "Test", "Size: public symbols", "Width: references"
  ]);
  await expect(page.locator("#local-legend")).toBeHidden();
  await matchesNodeColour(page, "Implementation", subject);
  await matchesNodeColour(page, "Test", retainedTest);

  await page.getByRole("checkbox", { name: "Show Tests", exact: true }).uncheck();
  await expect(key(page, "Test")).toBeVisible();
  await expect.poll(async () => (await renderedNodes(page)).some(node => node.id === retainedTest)).toBe(true);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await page.getByRole("button", { name: `Release ${retainedTest}`, exact: true }).click();
  await expect.poll(async () => (await renderedNodes(page)).some(node => node.id === retainedTest)).toBe(false);
  await expect(key(page, "Test")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Show Tests", exact: true }).check();
  await expect(key(page, "Test")).toBeVisible();
  await expect.poll(async () => (await renderedNodes(page)).some(node => node.id === retainedTest)).toBe(true);

  // An enabled filter with no matching data must not invent a document or citation key.
  await page.getByRole("checkbox", { name: "Show Citing Docs", exact: true }).check();
  await expect(key(page, "Document")).toHaveCount(0);
  await expect(key(page, "Cited by document")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Show Related Docs", exact: true }).check();
  await expect(key(page, "Document")).toBeVisible();
  await expect(key(page, "Cites document")).toBeVisible();
  await expect.poll(async () => (await renderedLinks(page)).filter(link => link.kind === "related-doc").length).toBeGreaterThan(0);
  await page.getByRole("checkbox", { name: "Show Related Docs", exact: true }).uncheck();
  await expect(key(page, "Document")).toHaveCount(0);
  await expect(key(page, "Cites document")).toHaveCount(0);
  await expect.poll(async () => (await renderedNodes(page)).filter(node => node.id.startsWith("related:")).length).toBe(0);
});

test("the Local Map shows the matching legend and lends neither key to another view", async ({ page }) => {
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#spatial-legend")).toBeVisible();
  await expect(page.locator("#spatial-legend .legend-row")).toHaveText([
    "Implementation", "Size: public symbols", "Width: references"
  ]);
  await expect(page.locator("#local-legend")).toBeHidden();

  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator("#local-legend")).toBeVisible();
  await expect(page.locator("#local-legend .legend-row")).toHaveText([
    "Wire from what offers", "Wire to what uses", "Offers", "Uses", "Test-backed"
  ]);
  await expect(page.locator("#spatial-legend")).toBeHidden();
  for (const view of ["sources", "world"]) {
    await page.locator(`.nav-item[data-view="${view}"]`).click();
    await expect(page.locator(`#view-${view}`)).toBeVisible();
    if (view === "world") await expect(page.locator("#world-root .world")).toBeVisible();
    await expect(page.locator("#map-legend")).toBeHidden();
    await expect(page.locator("#local-legend")).toBeHidden();
    await expect(page.locator("#spatial-legend")).toBeHidden();
  }
  await page.locator('.nav-item[data-view="map"]').click();
  await expect(page.locator("#local-legend")).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator("#spatial-legend")).toBeVisible();
  await expect(page.locator("#local-legend")).toBeHidden();
});

import { test, expect, type Page } from "@playwright/test";
import type { Camera } from "three";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { localMapSettled, panIntoView } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

const A = "Portal/Services/GatewayClient.cs";
const B = "Portal/Models/PaymentResultModel.cs";
const snapshot = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
const card = (page: Page, id: string) => page.locator(`.node-card[data-id="${id}"]`);

/** Wait for entry framing too: the layout's settled flag does not describe the camera's initial approach. */
async function ready(page: Page): Promise<void> {
  await expect(card(page, A)).toBeVisible();
  await localMapSettled(page);
  await page.evaluate(async () => {
    let previous = "", since = performance.now();
    const deadline = since + 5000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      const rect = document.querySelector(".node-card.local-focus")!.getBoundingClientRect();
      const value = [rect.x, rect.y, rect.width, rect.height].join(",");
      if (value !== previous) { previous = value; since = performance.now(); }
      if (performance.now() - since > 200) return;
    }
    throw new Error("The entry camera did not settle");
  });
}

const geometry = (page: Page) => page.locator("#map-container .node-card").evaluateAll(cards => cards.map(element => {
  const rect = element.getBoundingClientRect();
  return { id: (element as HTMLElement).dataset.id, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}));

test.use({ viewport: { width: 1600, height: 1000 } });

test("inspection and Back preserve the map; direct pins and shared evidence remain independent", async ({ page, browser }) => {
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(A)}`);
  await ready(page);
  const row = card(page, A).locator('.symbol-row[data-symbol="GetPaymentAsync"]');
  await panIntoView(page, row.locator(".symbol-label-wrapper"));
  const originalMap = await page.locator(".local-placed").elementHandle();
  const before = await geometry(page);

  await row.locator(".type-badge-return").click();
  await expect(page.locator("#detail-panel.visible")).toContainText(B);
  expect(snapshot(page)).toMatchObject({
    selectedNodeId: A, pinSet: { entries: [] },
    inspection: { kind: "file", nodeId: B }
  });
  expect(await geometry(page)).toEqual(before);
  expect(await originalMap!.evaluate(element => element === document.querySelector(".local-placed"))).toBe(true);

  await page.goBack();
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  expect(snapshot(page).inspection).toBeNull();
  expect(await geometry(page)).toEqual(before);
  expect(await originalMap!.evaluate(element => element === document.querySelector(".local-placed"))).toBe(true);

  await row.locator(".local-symbol-pin").click();
  await localMapSettled(page);
  const pinSet = { entries: [{ nodeId: A, symbol: "GetPaymentAsync" }] };
  expect(snapshot(page)).toMatchObject({ selectedNodeId: A, pinSet, inspection: null });
  await card(page, A).locator(".local-file-inspect").click();
  await page.locator(`#detail-panel .node-link[data-node-id="${B}"]`).first().click();
  const inspection = snapshot(page).inspection;
  expect(inspection).toEqual({ kind: "file", nodeId: B, symbol: "PaymentResultModel" });
  const shared = page.url();
  await page.reload();
  await ready(page);
  await expect(page.locator("#detail-panel.visible")).toContainText(B);
  expect(snapshot(page)).toMatchObject({ selectedNodeId: A, pinSet, inspection });

  const recipient = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  try {
    const other = await recipient.newPage();
    await other.goto(shared);
    await expect(other.locator("#detail-panel.visible")).toContainText(B);
    expect(snapshot(other)).toMatchObject({ selectedNodeId: A, pinSet, inspection });
  } finally { await recipient.close(); }

  await page.getByRole("button", { name: "Close details", exact: true }).click();
  expect(snapshot(page).inspection).toBeNull();
  await page.goBack();
  await expect(page.locator("#detail-panel.visible")).toContainText(B);
  expect(snapshot(page)).toMatchObject({ selectedNodeId: A, pinSet, inspection });
  await page.locator("#detail-panel").getByRole("button", { name: "Centre on PaymentResultModel.cs", exact: true }).click();
  await expect(page.locator("#context-name")).toHaveText(B);
  expect(snapshot(page)).toMatchObject({ selectedNodeId: B, pinSet, inspection: null });
});

test("Internals inspection pins its own endpoint; centring an already open directory clears the subject", async ({ page }) => {
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(A)}&dir=Portal%2FServices`);
  await ready(page);
  const internals = card(page, A).locator('.symbol-row[data-symbol="__internals__"]');
  await panIntoView(page, internals.locator(".symbol-label-wrapper"));
  await internals.locator(".symbol-label").click();
  await expect(page.locator("#detail-panel.visible")).toContainText("Internal implementation");
  expect(snapshot(page).inspection).toEqual({ kind: "file", nodeId: A, symbol: "__internals__" });
  await page.getByRole("button", { name: "Pin Internals", exact: true }).click();
  expect(snapshot(page).pinSet.entries).toEqual([{ nodeId: A, symbol: "__internals__" }]);
  await page.reload();
  await expect(page.getByRole("button", { name: "Unpin Internals", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close details", exact: true }).click();
  await localMapSettled(page);
  const directory = page.locator('.local-directory-label[data-directory="Portal/Services"]');
  await panIntoView(page, directory);
  await directory.getByRole("button", { name: "Inspect Portal/Services", exact: true }).click();
  expect(snapshot(page)).toMatchObject({ selectedNodeId: A, inspection: { kind: "directory", directory: "Portal/Services" } });
  await page.locator("#detail-panel").getByRole("button", { name: "Centre on directory", exact: true }).click();
  await localMapSettled(page);
  expect(snapshot(page)).toMatchObject({ selectedNodeId: null, inspection: null });
  expect(snapshot(page).pinSet.entries).toEqual([{ nodeId: A, symbol: "__internals__" }]);
  await expect(page.locator(".node-card.selected")).toHaveCount(0);
  await expect(page.locator("#context-name")).toHaveText("Portal/Services");
});

test("keyboard reading keeps focus through links and an Inspect–Back–Forward–Close journey", async ({ page }) => {
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(A)}`);
  await ready(page);
  const opener = card(page, A).locator(".local-file-inspect");
  await opener.focus();
  await page.keyboard.press("Enter");
  const link = page.locator(`#detail-panel .node-link[data-node-id="${B}"]`).first();
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#detail-panel.visible")).toContainText(B);
  expect(await page.locator("#detail-panel").evaluate(panel => panel.contains(document.activeElement))).toBe(true);
  await page.goBack();
  await page.goBack();
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  await expect(opener).toBeFocused();
  await page.goForward();
  await expect(page.locator("#detail-panel.visible")).toContainText(A);
  await page.getByRole("button", { name: "Close details", exact: true }).click();
  await expect(opener).toBeFocused();
});

test("a real bundled section link uses its canonical punctuation-bearing anchor through reload and Back", async ({ page }) => {
  const source = "packages/engine/src/config/liveDocumentationConfig.ts";
  const path = "AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md";
  const fragment = "turn-19-config--schema-hardening-lines-3561-3760";
  await page.goto(`/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT, view: "map", selectedNodeId: source,
    inspection: { kind: "file", nodeId: source }
  })}`);
  await page.locator(`#detail-body a.bundled-doc-link[data-doc-path="${path}"]`).first().click();
  const target = { kind: "bundled-doc", path, fragment };
  expect(snapshot(page)).toMatchObject({ selectedNodeId: source, inspection: target, pinSet: { entries: [] } });
  const heading = page.locator(`#detail-body #${fragment}`);
  await expect(heading).toContainText("Turn 19: Config & Schema Hardening");
  const atSection = async () => Math.abs((await heading.boundingBox())!.y - (await page.locator("#detail-body").boundingBox())!.y);
  await expect.poll(atSection).toBeLessThan(2);
  await page.reload();
  await expect(heading).toBeVisible();
  await expect.poll(atSection).toBeLessThan(2);
  expect(snapshot(page).inspection).toEqual(target);
  await page.goBack();
  await expect(page.locator("#detail-panel.visible")).toContainText(source);
  expect(snapshot(page).selectedNodeId).toBe(source);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`full reader at ${viewport.width}×${viewport.height} keeps keyboard focus and its own history controls`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`/samples/estate/?s=${compressSnapshot({
      ...DEFAULT_SNAPSHOT, view: "map", selectedNodeId: A,
      inspection: { kind: "file", nodeId: A }
    })}`);
    const reader = page.locator("#detail-panel");
    await expect(reader).toHaveAttribute("aria-modal", "true");
    await expect.poll(() => reader.boundingBox()).toEqual({ x: 0, y: 0, ...viewport });
    await expect(page.locator("#view-map")).toHaveAttribute("inert", "");
    await expect(page.getByRole("button", { name: "Close details", exact: true })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    expect(await reader.evaluate(element => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Tab");
    expect(await reader.evaluate(element => element.contains(document.activeElement))).toBe(true);
    await reader.locator(`.node-link[data-node-id="${B}"]`).first().click();
    await expect(reader).toContainText(B);
    await reader.locator("#reader-back").click();
    await expect(reader).toContainText(A);
    await expect(reader.locator("#reader-forward")).toBeEnabled();
    await page.keyboard.press("Escape");
    await expect(reader).not.toHaveClass(/visible/u);
    expect(snapshot(page).inspection).toBeNull();
    await expect(page.locator("#view-map")).not.toHaveAttribute("inert", "");
    await expect(page.locator("#view-graph")).toHaveAttribute("inert", "");
    expect(await page.evaluate(() => !!document.activeElement?.getClientRects().length)).toBe(true);
    expect(await page.evaluate(() => document.activeElement?.matches("input, textarea")),
      "with no opener, focus returns to the map, not a field that raises a phone's keyboard").toBe(false);
  });
}

test("a Pin pressed twice leaves the map as it was, and closing the reader finds its rebuilt opener", async ({ page }) => {
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(A)}`);
  await ready(page);
  const pin = () => card(page, A).locator(".local-file-pin");
  await pin().click();
  await localMapSettled(page);
  expect(snapshot(page)).toMatchObject({ selectedNodeId: A, pinSet: { entries: [{ nodeId: A, symbol: "*" }] } });
  await expect(pin()).toHaveAttribute("aria-pressed", "true");
  await pin().click();
  await localMapSettled(page);
  expect(snapshot(page), "Unpin undoes the Pin; it is not the card's close").toMatchObject({ selectedNodeId: A, pinSet: { entries: [] } });
  await expect(card(page, A)).toBeVisible();
  await expect(pin()).toHaveAttribute("aria-pressed", "false");

  // The reader's own Pin and Unpin re-render every card, the opener among them.
  const opener = card(page, A).locator(".local-file-inspect");
  await opener.focus();
  await page.keyboard.press("Enter");
  await page.locator("#detail-panel").getByRole("button", { name: "Pin file", exact: true }).click();
  await page.locator("#detail-panel").getByRole("button", { name: "Unpin file", exact: true }).click();
  expect(snapshot(page)).toMatchObject({ selectedNodeId: A, pinSet: { entries: [] } });
  await page.getByRole("button", { name: "Close details", exact: true }).click();
  await expect(card(page, A).locator(".local-file-inspect")).toBeFocused();
});

test("one Escape closes only the topmost surface: the search field, then the reader, then the World Map's help", async ({ page }) => {
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "world", inspection: { kind: "file", nodeId: A } })}`);
  await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 20_000 });
  const reader = page.locator("#detail-panel");
  await expect(reader).toHaveClass(/visible/u);
  const search = page.locator("#search-subject");
  await search.focus();
  await page.keyboard.press("Escape");
  await expect(search).not.toBeFocused();
  await expect(reader, "the search field's Escape is the field's alone").toHaveClass(/visible/u);
  const help = page.locator("#view-world .world-help");
  await page.keyboard.press("?");
  await expect(help).toHaveClass(/\bon\b/u);
  await page.keyboard.press("Escape");
  await expect(reader).not.toHaveClass(/visible/u);
  await expect(help, "the reader's Escape is not also the map's").toHaveClass(/\bon\b/u);
  await page.keyboard.press("Escape");
  await expect(help).not.toHaveClass(/\bon\b/u);
});

test("keys typed in the full-screen reader do not reach the World Map behind it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "world", inspection: { kind: "file", nodeId: A } })}`);
  await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 20_000 });
  await expect(page.locator("#detail-panel")).toHaveAttribute("aria-modal", "true");
  const world = page.locator("#view-world .world");
  const theme = await world.getAttribute("data-theme");
  await page.keyboard.press("d");
  await page.keyboard.press("?");
  expect(await world.getAttribute("data-theme")).toBe(theme);
  await expect(page.locator("#view-world .world-help")).not.toHaveClass(/\bon\b/u);
});

test("a direct 3D Pin and sphere inspection preserve subject and camera across perspective changes", async ({ page }) => {
  await observeGraph(page);
  await page.goto(`/samples/estate/?view=local&mode=3d&node=${encodeURIComponent(A)}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false");
  await page.waitForTimeout(900);
  const point = (await renderedNodes(page)).find(node => node.id === B)!;
  const camera = () => page.evaluate(() => {
    const observed = (window as unknown as { renderedGraph: { camera: Camera } }).renderedGraph.camera;
    return { position: observed.position.toArray(), matrix: [...observed.matrixWorld.elements] };
  });
  await page.mouse.move(point.x, point.y);
  await page.getByRole("button", { name: "Pin PaymentResultModel.cs", exact: true }).click();
  expect(snapshot(page)).toMatchObject({
    selectedNodeId: A, pinSet: { entries: [{ nodeId: B, symbol: "*" }] }, inspection: null
  });
  const before = await camera();
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("#detail-panel.visible")).toContainText(B);
  expect(snapshot(page).selectedNodeId).toBe(A);
  expect(await camera()).toEqual(before);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(card(page, A)).toBeVisible();
  await expect(page.locator("#detail-panel.visible")).toContainText(B);
  expect(snapshot(page)).toMatchObject({
    selectedNodeId: A, perspective: "2d", inspection: { kind: "file", nodeId: B },
    pinSet: { entries: [{ nodeId: B, symbol: "*" }] }
  });
});

import { expect, test, type Page } from "@playwright/test";

import { overlapsAmong, textBoxes, truncations } from "./design-audit";
import { choose } from "./search-bar";
import { localMapSettled, panIntoView } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";

const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const pathfind = "packages/engine/src/live-docs/pathfind.ts";
const card = (page: Page, id: string) => page.locator(`.node-card[data-id="${id}"]`);
const url = (state: Partial<UrlStateSnapshot>): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;
const state = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);

/** Wait for the camera and disclosure together, including the first approach and a responsive resize. */
async function still(page: Page): Promise<void> {
  await localMapSettled(page);
  await page.evaluate(async () => {
    let previous = "", since = performance.now();
    const deadline = since + 5000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      const picture = [...document.querySelectorAll(".node-card")].map(element => {
        const rect = element.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      });
      const value = JSON.stringify(picture);
      if (value !== previous) { previous = value; since = performance.now(); }
      if (performance.now() - since > 150) return;
    }
    throw new Error("The reading picture did not settle");
  });
}

const geometry = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => {
  const rect = element.getBoundingClientRect();
  return { id: (element as HTMLElement).dataset.id!, box: [rect.x, rect.y, rect.width, rect.height] };
}));
type Picture = Awaited<ReturnType<typeof geometry>>;
function samePicture(before: Picture, after: Picture): void {
  expect(after.map(item => item.id).sort()).toEqual(before.map(item => item.id).sort());
  for (const item of before) {
    const next = after.find(other => other.id === item.id)!;
    item.box.forEach((value, index) => expect(Math.abs(value - next.box[index]), item.id).toBeLessThan(0.1));
  }
}

test.use({ viewport: { width: 1440, height: 960 } });

test("temporary Walk and walk reading replaces the preview and restores the same picture repeatedly", async ({ page }) => {
  const pins = { entries: [{ nodeId: pathfind, symbol: "Walk (interface)" }, { nodeId: pathfind, symbol: "walk (function)" }] };
  await page.goto(url({ pinSet: pins, reading: [{ nodeId: pathfind, open: false }] }));
  const subject = card(page, pathfind);
  await subject.waitFor();
  await still(page);
  await panIntoView(page, subject);
  await page.mouse.move(280, 55);
  await still(page);
  const before = await geometry(page), original = await subject.elementHandle();
  for (let cycle = 0; cycle < 4; cycle++) {
    for (const symbol of ["Walk (interface)", "walk (function)", "Walk (interface)"]) {
      const row = subject.locator(`.symbol-row[data-symbol="${symbol}"]`);
      await row.locator(".symbol-label").hover();
      await expect(row.locator(".local-reading-block")).toBeVisible();
      await still(page);
      expect(await subject.locator(".symbol-row .local-reading-block:visible").count()).toBe(1);
      expect(state(page).pinSet).toEqual(pins);
    }
    await page.mouse.move(280, 55);
    await expect(subject.locator(".symbol-row .local-reading-block:visible")).toHaveCount(0);
    await still(page);
    samePicture(before, await geometry(page));
    expect(await original!.evaluate(element => element.isConnected)).toBe(true);
  }
  await subject.locator(".node-title").hover();
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-expanded", "false");
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-pressed", "false");
  expect(state(page).reading).toEqual([{ nodeId: pathfind, open: false }]);
});

test("the portrait reading frame returns from overview and follows a phone resize without shrinking text", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await still(page);
  const before = await geometry(page);
  await page.mouse.move(280, 60);
  await page.mouse.wheel(0, 500);
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-expanded", "false");
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-pressed", "true");
  await still(page);
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await still(page);
  samePicture(before, await geometry(page));
  await page.setViewportSize({ width: 390, height: 844 });
  await still(page);
  const bounds = await subject.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(48);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(await subject.locator(".local-reading-purpose").evaluate(element => {
    const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
    return parseFloat(getComputedStyle(element).fontSize) * scale;
  })).toBeGreaterThanOrEqual(16);
  const selectors = [".local-focus .symbol-label", ".local-focus .node-title", ".local-focus .local-reading-types", ".local-focus .local-reading-full:not([hidden])"];
  expect(overlapsAmong(await textBoxes(page, selectors))).toEqual([]);
  expect(await truncations(page, selectors)).toEqual([]);
  await expect(subject.locator(".local-reading-purpose .local-reading-full")).toBeInViewport();
});

test("full reading keeps map and pins, traps keyboard focus, and restores the opener on Close and Back", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment), opener = subject.locator(".local-reading-purpose .local-reading-full");
  await opener.waitFor();
  await still(page);
  const before = await geometry(page);
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toContainText("Download Markdown");
  expect(await dialog.locator(".reader-prose p").first().evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(15);
  samePicture(before, await geometry(page));
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  samePicture(before, await geometry(page));
  await opener.click();
  await page.goBack();
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  expect(state(page).pinSet.entries).toEqual([]);
  samePicture(before, await geometry(page));
});

test("an explicit fold stays folded while its book control keeps keyboard focus", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment), book = subject.locator(".local-file-read");
  await book.waitFor();
  await still(page);
  await page.keyboard.press("Tab");
  await book.focus();
  await page.keyboard.press("Enter");
  await expect(book).toBeFocused();
  await expect(book).toHaveAttribute("aria-pressed", "false");
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
  expect(state(page).reading).toEqual([{ nodeId: payment, open: false }]);
});

test("shared reading can be open without a pin and folded with a pin, and the full reader carries every symbol section", async ({ page, browser }) => {
  const choices = [{ nodeId: payment, open: false }, { nodeId: pathfind, symbol: "reachability (function)", open: true }];
  const pins = { entries: [{ nodeId: payment, symbol: "*" }] };
  await page.goto(url({ pinSet: pins, reading: choices }));
  await card(page, payment).waitFor();
  await still(page);
  await expect(card(page, payment).locator(".local-reading-purpose")).toBeHidden();
  const row = card(page, pathfind).locator('.symbol-row[data-symbol="reachability (function)"]');
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row).not.toHaveClass(/branch-symbol-muted/u);
  await panIntoView(page, row.locator(".local-reading-full"));
  await row.locator(".local-reading-full").click();
  await expect(page.getByRole("dialog")).toContainText("The most hops a path takes.");
  const shared = page.url();
  const recipient = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  try {
    const other = await recipient.newPage();
    await other.goto(shared);
    await expect(other.getByRole("dialog")).toContainText("The most hops a path takes.");
    expect(state(other)).toMatchObject({ pinSet: pins, reading: choices,
      inspection: { kind: "file", nodeId: pathfind, symbol: "reachability (function)", presentation: "reading" } });
    await expect(card(other, payment).locator(".local-reading-purpose")).toBeHidden();
    await expect(card(other, pathfind).locator('.symbol-row[data-symbol="reachability (function)"] .local-reading-block')).toBeVisible();
    await other.keyboard.press("Escape");
    const close = card(other, pathfind).getByRole("button", { name: "Close pathfind.ts", exact: true });
    await panIntoView(other, close);
    await close.click();
    await still(other);
    await expect(card(other, pathfind)).toHaveCount(0);
    expect(state(other)).toMatchObject({ pinSet: pins, reading: [{ nodeId: payment, open: false }] });
  } finally { await recipient.close(); }
});

test("a symbol search restores reading from overview, follows the row on resize and yields Escape to inspection", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  await card(page, payment).waitFor();
  await still(page);
  await page.mouse.move(280, 60);
  await page.mouse.wheel(0, 700);
  await still(page);
  await choose(page, "subject", "pathfind.ts walk", { file: pathfind, symbol: "walk (function)" });
  const row = card(page, pathfind).locator('.symbol-row[data-symbol="walk (function)"]');
  await still(page);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await still(page);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 960 });
  await still(page);
  await row.locator(".symbol-label").click();
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
});

test("restoring a full reader in 3D keeps its evidence out of the discovered neighborhood", async ({ page }) => {
  const selectedNodeId = "Portal/Services/GatewayClient.cs";
  await page.goto(`/samples/estate${url({ perspective: "3d", selectedNodeId,
    inspection: { kind: "file", nodeId: "PaymentService/PaymentService.cs", presentation: "reading" } })}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  expect(state(page)).toMatchObject({ selectedNodeId, pinSet: { entries: [] } });
  expect(state(page).discovery ?? null).toBeNull();
  await page.reload();
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  expect(state(page).discovery ?? null).toBeNull();
});

test("a preview ends when leaving 2D and does not become saved reading on return", async ({ page }) => {
  const id = "PaymentService/PaymentService.cs";
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(id)}`);
  const subject = card(page, id);
  await subject.waitFor();
  await still(page);
  await subject.locator(".local-file-read").click();
  await page.mouse.move(280, 55);
  await still(page);
  const block = subject.locator('.symbol-row[data-symbol="PaymentService"] .local-reading-block');
  await subject.locator('.symbol-row[data-symbol="PaymentService"] .symbol-label').hover();
  await expect(block).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "2D", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await still(page);
  await expect(block).toBeHidden();
  expect(state(page)).toMatchObject({ pinSet: { entries: [] }, reading: [{ nodeId: id, open: false }] });
});

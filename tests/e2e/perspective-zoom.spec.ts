import { expect, test } from "@playwright/test";

const ROOT = "tests/integration/programs/typescript/rosetta/src/";
const cardSelector = `#map-container .node-card[data-id="${ROOT}helpers.ts"]`;

test.use({ viewport: { width: 1600, height: 1000 } });

test("hover isolates inside a whole-file pin and an explicit symbol survives its removal", async ({ page }) => {
  await page.goto(`/?view=local&node=${ROOT}helpers.ts`);
  const card = page.locator(cardSelector);
  await card.locator(".local-file-pin").click();
  const ids = () => page.locator("#map-container .node-card").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id).sort());
  const wholeFile = await ids();
  const label = card.locator('.symbol-row[data-symbol="format"] .symbol-label-wrapper');
  await label.click();
  expect(await ids()).toEqual(wholeFile);
  await page.mouse.move(900, 60);
  await label.hover();
  await expect(page.locator("#map-container")).toHaveClass(/symbol-hover-active/);
  const unrelated = card.locator(".symbol-row:not(.symbol-highlighted):not(.branch-symbol-hidden) .symbol-label-wrapper").first();
  await expect.poll(() => unrelated.evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(.8);
  await expect(label).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(900, 60);
  await expect(page.locator("#map-container")).not.toHaveClass(/symbol-hover-active/);
  await expect(label).toHaveAttribute("aria-pressed", "true");
  await card.locator(".local-file-pin").click();
  await expect(card.locator(".local-file-pin")).toHaveAttribute("aria-pressed", "false");
  await expect(label).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Clear exploration pins" })).toHaveText("1 pin ×");
  await expect(page.locator('.local-directory-band[data-directory="tests/integration/programs/typescript/rosetta/src"]')).toBeVisible();
});

test("zoom stops at each boundary and carries a real projected subject through a deliberate second gesture", async ({ page }) => {
  await page.goto(`/?view=local&node=${ROOT}helpers.ts`);
  await expect(page.locator(cardSelector)).toBeVisible();
  await page.waitForTimeout(500);
  await page.mouse.move(950, 500);
  await page.mouse.wheel(0, 4000);
  await expect(page.locator(".zoom-boundary")).toHaveText("Scroll again for 3D");
  await page.waitForTimeout(450);
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  await page.mouse.wheel(0, 120);
  const bridge = page.locator(".perspective-transition[data-graph-files]");
  await expect(bridge).toBeVisible();
  expect(Number(await bridge.getAttribute("data-graph-files"))).toBeGreaterThan(10);
  await expect(bridge.locator(`[data-node-id="${ROOT}helpers.ts"]`)).toBeAttached();
  await expect(page.locator(".perspective-transition")).toHaveCount(0);
  await expect(page.locator("#view-graph")).toHaveClass(/active/);
  await page.mouse.wheel(0, -4000);
  await expect(page.locator(".zoom-boundary")).toHaveText("Scroll again for 2D");
  await page.waitForTimeout(450);
  await expect(page.locator("#view-graph")).toHaveClass(/active/);
  await page.mouse.wheel(0, -120);
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  await expect(page.locator(".perspective-transition")).toHaveCount(0);
  await expect(page.locator(cardSelector)).toBeVisible();
});

test("a thirteen-file path keeps its ordered steps and constrained symbols through the overview", async ({ page }) => {
  const root = "tests/integration/programs/csharp/estate/";
  const from = `${root}Database/Oracle/CENTRAL.ACCOUNT.sql`, to = `${root}Portal/Pages/Default.aspx`;
  await page.goto(`/?view=local&node=${from}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  await expect(page.locator("#pathfind-status")).toContainText("Path found: 13 files");
  await expect(page.locator("#pathfind-status")).toContainText("3 references between these files run the other way and are not drawn");
  const ids = () => page.locator("#map-container .path-node .node-card").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id));
  const before = await ids();
  expect(before).toHaveLength(13);
  expect(before[0]).toBe(from); expect(before[12]).toBe(to);
  expect(await page.locator("#map-container .branch-symbol-hidden").count()).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Force Graph · 3D", exact: true }).click();
  await expect(page.locator("#view-graph")).toHaveClass(/active/);
  await page.getByRole("button", { name: "Local Map · 2D", exact: true }).click();
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  expect(await ids()).toEqual(before);
  expect(new URL(page.url()).searchParams.get("from")).toBe(from);
  expect(new URL(page.url()).searchParams.get("to")).toBe(to);
});

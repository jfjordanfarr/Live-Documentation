import { expect, test, type Page } from "@playwright/test";

const ROOT = "tests/integration/programs/typescript/rosetta/src/";
const card = (page: Page, file: string) => page.locator(`#map-container .node-card[data-id="${ROOT}${file}"]`);
const pin = (page: Page, file: string, symbol: string) => card(page, file).locator(`.symbol-row[data-symbol="${symbol}"] .symbol-label-wrapper`);

async function start(page: Page): Promise<void> {
  await page.goto(`/?view=local&node=${ROOT}helpers.ts`);
  await expect(card(page, "helpers.ts")).toBeVisible();
  await page.waitForTimeout(500);
}

async function branches(page: Page): Promise<void> {
  await pin(page, "helpers.ts", "format").click();
  await card(page, "processor.ts").getByRole("button", { name: "+2 symbols", exact: true }).click();
  await pin(page, "processor.ts", "run").click();
}

test("independent symbol branches retain cross-connections, survive reload, and remove only the chosen pin", async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1100 });
  await start(page);
  await branches(page);
  await expect(pin(page, "helpers.ts", "format")).toHaveAttribute("aria-pressed", "true");
  await expect(pin(page, "processor.ts", "run")).toHaveAttribute("aria-pressed", "true");
  // Neither pin requested this relationship, but both of its endpoints are retained.
  await expect(page.locator(`#map-connections .connection-path[data-source-id="${ROOT}models.ts"][data-target-id="${ROOT}types.ts"]`).first()).toBeAttached();
  await pin(page, "types.ts", "ProcessorConfig").click();
  await expect(page.getByRole("button", { name: "Clear exploration pins" })).toHaveText("3 pins ×");
  await page.reload();
  await expect(pin(page, "helpers.ts", "format")).toHaveAttribute("aria-pressed", "true");
  await expect(pin(page, "processor.ts", "run")).toHaveAttribute("aria-pressed", "true");
  await expect(pin(page, "types.ts", "ProcessorConfig")).toHaveAttribute("aria-pressed", "true");
  await pin(page, "processor.ts", "run").click();
  await expect(page.getByRole("button", { name: "Clear exploration pins" })).toHaveText("2 pins ×");
  await expect(pin(page, "helpers.ts", "format")).toHaveAttribute("aria-pressed", "true");
  await expect(pin(page, "types.ts", "ProcessorConfig")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Clear exploration pins" }).click();
  await expect(page.locator(".branch-mode")).toHaveCount(0);
});

test("both perspective changes keep the subject at its screen anchor during motion and preserve branch history", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await start(page);
  await branches(page);
  const title = card(page, "processor.ts").locator(".node-title");
  const before = (await title.boundingBox())!;
  const anchor = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
  const recording = page.evaluate(async () => {
    const samples: Array<{ x: number; y: number }> = [];
    const start = performance.now();
    await new Promise<void>(resolve => {
      const sample = (): void => {
        const container = document.querySelector<HTMLElement>("#view-graph.active #graph-svg");
        const label = container?.querySelector<HTMLElement>(".force-graph-focus:not([hidden])");
        if (container && label) {
          const rect = container.getBoundingClientRect();
          samples.push({ x: rect.left + parseFloat(label.style.left), y: rect.top + parseFloat(label.style.top) });
        }
        if (performance.now() - start < 1800) requestAnimationFrame(sample); else resolve();
      };
      requestAnimationFrame(sample);
    });
    return samples;
  });
  await page.getByRole("button", { name: "Force Graph · 3D", exact: true }).click();
  const samples = await recording;
  expect(samples.length).toBeGreaterThan(4);
  expect(Math.max(...samples.map(p => Math.hypot(p.x - anchor.x, p.y - anchor.y)))).toBeLessThan(3);
  await expect(page.locator(".force-graph-focus")).toHaveAttribute("data-node-id", `${ROOT}processor.ts`);
  await page.getByRole("button", { name: "Local Map · 2D", exact: true }).click();
  const after = (await title.boundingBox())!;
  expect(Math.hypot(after.x + after.width / 2 - anchor.x, after.y + after.height / 2 - anchor.y)).toBeLessThan(3);
  await expect(page.getByRole("button", { name: "Clear exploration pins" })).toHaveText("2 pins ×");
  await page.goBack();
  await expect(page.locator("#view-graph")).toHaveClass(/active/);
  await expect(page.getByRole("button", { name: "Clear exploration pins" })).toHaveText("2 pins ×");
  await page.goForward();
  await expect(pin(page, "helpers.ts", "format")).toHaveAttribute("aria-pressed", "true");
});

test("file pins and symbol pins work by keyboard with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  const symbol = pin(page, "helpers.ts", "format");
  await symbol.focus();
  await page.keyboard.press("Space");
  await expect(symbol).toHaveAttribute("aria-pressed", "true");
  await expect(symbol).toBeFocused();
  await page.keyboard.press("Space");
  await expect(symbol).toHaveAttribute("aria-pressed", "false");
  const file = card(page, "helpers.ts").locator(".local-file-pin");
  await file.focus();
  await page.keyboard.press("Enter");
  await expect(file).toHaveAttribute("aria-pressed", "true");
  await expect(card(page, "helpers.ts").getByText(/connections? hidden by filters/)).toBeVisible();
  await page.getByRole("button", { name: "Force Graph · 3D", exact: true }).click();
  await expect(page.locator(".force-graph-focus")).toHaveAttribute("data-node-id", `${ROOT}helpers.ts`);
  await page.getByRole("button", { name: "Local Map · 2D", exact: true }).click();
  await expect(file).toHaveAttribute("aria-pressed", "true");
});

test("a type-reference badge retains its source pin and keeps the referenced file as the detail target", async ({ page }) => {
  const graph = "packages/engine/src/live-docs/graph.ts";
  const document = "packages/engine/src/live-docs/document.ts";
  await page.goto(`/?view=local&node=${graph}`);
  await page.locator('.local-focus .symbol-row[data-symbol="GraphFile"] .type-badge-extends').click();
  await expect(page.locator("#context-name")).toHaveText(document);
  await expect(page.locator('.symbol-row[data-symbol="GraphFile"] .symbol-label-wrapper')).toHaveAttribute("aria-pressed", "true");
  await page.locator('.nav-item[data-view="graph"]').click();
  await expect(page.locator(".force-graph-focus")).toHaveAttribute("data-node-id", document);
  await expect(page.getByRole("button", { name: "Clear exploration pins" })).toHaveText("1 pin ×");
});

import { expect, test, type Page } from "@playwright/test";

import { LOCAL_MAP, displayNames, loadGraph, localRetainUrl, readPicture, scoreExpanded, scoreOcclusion, symbolCounts } from "./still-picture";

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
    let firstFrame: number | null = null;
    await new Promise<void>(resolve => {
      const sample = (): void => {
        const container = document.querySelector<HTMLElement>("#view-graph.active #graph-svg");
        const label = container?.querySelector<HTMLElement>(".force-graph-focus:not([hidden])");
        if (container && label) {
          firstFrame ??= performance.now();
          const rect = container.getBoundingClientRect();
          samples.push({ x: rect.left + parseFloat(label.style.left), y: rect.top + parseFloat(label.style.top) });
        }
        const finished = firstFrame !== null && performance.now() - firstFrame > 500 && !document.querySelector(".perspective-transition");
        if (!finished && performance.now() - start < 10000) requestAnimationFrame(sample); else resolve();
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

test("file retention, individual pruning and close work by keyboard with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  const file = card(page, "helpers.ts");
  await file.focus();
  await page.keyboard.press("Enter");
  const symbol = pin(page, "helpers.ts", "format");
  await expect(symbol).toHaveAttribute("aria-pressed", "true");
  await expect(file.getByText(/connections? hidden by filters/)).toBeVisible();
  await symbol.focus();
  await page.keyboard.press("Space");
  await expect(symbol).toHaveAttribute("aria-pressed", "false");
  await expect(symbol).toBeFocused();
  await page.keyboard.press("Space");
  await expect(symbol).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Force Graph · 3D", exact: true }).click();
  await expect(page.locator(".force-graph-focus")).toHaveAttribute("data-node-id", `${ROOT}helpers.ts`);
  await page.getByRole("button", { name: "Local Map · 2D", exact: true }).click();
  await expect(symbol).toHaveAttribute("aria-pressed", "true");
  await file.getByRole("button", { name: "Close helpers.ts", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#map-container .node-card")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Clear exploration pins" })).toBeHidden();
  await expect(page.locator("#context-name")).toHaveText("None");
  await expect(page.locator("#map-container .empty-hint")).toBeFocused();
});

test("closing a retained file keeps only symbols needed elsewhere and removes its unneeded branch", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  const file = (name: string) => page.locator(`#map-container .node-card[data-id="scripts/slopcop/${name}"]`);
  await page.goto("/?view=local&node=scripts/slopcop/symbolReferences.ts");
  await file("symbolReferences.ts").locator(".node-title").click();
  await file("check-symbols.ts").locator(".node-title").click();
  await expect(file("symbolReferences.ts").locator('.symbol-row[data-symbol="SymbolIssueKind"] .symbol-label-wrapper')).toBeVisible();
  const before = (await file("symbolReferences.ts").boundingBox())!;
  const config = (await file("config.ts").boundingBox())!;
  expect(Math.abs(config.x - before.x)).toBeLessThan(2);
  const routes = await page.locator('#map-connections .connection-path[data-target-id="scripts/slopcop/config.ts"]').evaluateAll(paths => paths.map(path => path.getAttribute("d")!));
  expect(routes.length).toBeGreaterThan(0);
  expect(routes.every(route => route.includes(" C ") && !route.includes(" Q "))).toBe(true);
  // Two files and their neighbours strain nothing: no nudge toward the Force Graph.
  await expect(page.locator(".perspective-strain")).toBeHidden();
  await file("symbolReferences.ts").getByRole("button", { name: "Close symbolReferences.ts", exact: true }).click();
  const after = (await file("symbolReferences.ts").boundingBox())!;
  expect(after.height).toBeLessThan(before.height);
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(1);
  expect(await file("symbolReferences.ts").locator(".symbol-row:not(.branch-symbol-hidden)").evaluateAll(rows => rows.map(row => (row as HTMLElement).dataset.symbol))).toEqual([
    "SymbolRuleSetting", "SymbolReferenceIssue", "findSymbolReferenceAnomalies"
  ]);
  await expect(file("markdownShared.ts")).toHaveCount(0);
  await expect(file("check-symbols.ts").locator('.symbol-row[data-symbol="__internals__"] .symbol-label-wrapper')).toHaveAttribute("aria-pressed", "true");
  await file("symbolReferences.ts").locator(".node-title").click();
  await expect(file("markdownShared.ts")).toBeVisible();
  await expect(file("symbolReferences.ts").locator('.symbol-row[data-symbol="SymbolIssueKind"] .symbol-label-wrapper')).toHaveAttribute("aria-pressed", "true");
});

test("a retained exploration threads skipped references through lanes: nothing over the top, nothing across a card, every wire forward", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  const files = [
    "packages/engine/src/live-docs/graph.ts",
    "packages/engine/src/live-docs/document.ts",
    "packages/engine/src/live-docs/graphFiles.ts",
    "packages/explorer/src/shared/staticExplorerData.ts",
    "packages/explorer/src/shared/staticBuilder.ts"
  ];
  await page.goto(localRetainUrl("/", files));
  await page.waitForSelector("#map-container .branch-mode");
  await page.waitForSelector("#map-connections .connection-path");
  await page.waitForTimeout(900);
  const graph = await loadGraph(page, "/");
  const picture = await readPicture(page, LOCAL_MAP, displayNames(graph, graph.nodes.map(node => node.id)));
  expect(picture.wires.length).toBeGreaterThan(100);
  expect(scoreOcclusion(picture).occludedWires, "no wire crosses a card it does not end at").toBe(0);
  const routesOnly = { ...picture, wires: picture.wires.filter(wire => !wire.stub) };
  expect(scoreExpanded(routesOnly, symbolCounts(graph)).flow.backward, "no drawn route reads backward; a cycle's feedback is stubs").toBe(0);
  // This scope's references skip columns, so lanes exist, and every wire stays inside the picture's own extent: no headroom above it.
  const lanes = await page.locator("#map-container .local-pass-through").count();
  expect(lanes).toBeGreaterThan(0);
  const top = await page.evaluate(() => Math.min(...[...document.querySelectorAll<HTMLElement>("#map-container .node-card, #map-container .local-pass-through")].map(el => el.getBoundingClientRect().top)));
  const highest = Math.min(...picture.wires.flatMap(wire => wire.points.filter((_, i) => i % 2 === 1)));
  expect(highest).toBeGreaterThanOrEqual(top - 1);
  // The old detour drew every skipped reference as an orthogonal route; a threaded wire is curves and lane runs only.
  const detours = await page.locator('#map-connections path.connection-path:not(.back-route)').evaluateAll(paths => paths.filter(path => /\sQ\s.*\sQ\s/u.test(path.getAttribute("d") ?? "")).length);
  expect(detours).toBe(0);
  // Over a hundred references thread columns here, past the default threshold: the Local Map says so beside the 3D control.
  const nudge = page.locator(".perspective-strain");
  await expect(nudge).toBeVisible();
  await expect(nudge).toHaveAttribute("title", /references skip columns/);
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

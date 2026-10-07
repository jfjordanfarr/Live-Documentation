import { expect, test, type Page } from "@playwright/test";

import { displayNames, loadGraph, LOCAL_MAP, localMapSettled, localRetainUrl, readPicture, scoreExpanded, scoreForeign, scoreOcclusion, symbolCounts } from "./still-picture";

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
  // Each pin moves the picture to its next arrangement; the measurements below are of the picture at rest.
  await localMapSettled(page);
}

/** Every lane's height and the slot lines it publishes, as the router reads them. */
async function readLanes(page: Page): Promise<Array<{ height: number; slots: number[] }>> {
  return page.locator("#map-container .local-pass-through[data-lane]").evaluateAll(elements => elements.map(element => ({
    height: (element as HTMLElement).offsetHeight,
    slots: ((element as HTMLElement).dataset.slots ?? "").split(",").map(Number)
  })));
}

/**
 * A lane is a box around its slots: its first wire 9 px below its top (the padding and the slot's middle pixel), each next
 * wire at least the 7 px pitch further, its bottom edge 10 px below the last.
 */
function expectLaneBoxes(lanes: ReadonlyArray<{ height: number; slots: number[] }>): void {
  for (const lane of lanes) {
    expect(lane.slots[0]).toBe(9);
    for (let i = 1; i < lane.slots.length; i++) expect(lane.slots[i] - lane.slots[i - 1]).toBeGreaterThanOrEqual(7);
    expect(lane.height).toBe(lane.slots[lane.slots.length - 1] + 10);
  }
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
  await localMapSettled(page);
  const before = (await file("symbolReferences.ts").boundingBox())!;
  const config = (await file("config.ts").boundingBox())!;
  expect(Math.abs(config.x - before.x)).toBeLessThan(2);
  const routes = await page.locator('#map-connections .connection-path[data-target-id="scripts/slopcop/config.ts"]').evaluateAll(paths => paths.map(path => path.getAttribute("d")!));
  expect(routes.length).toBeGreaterThan(0);
  expect(routes.every(route => route.includes(" C ") && !route.includes(" Q "))).toBe(true);
  // Two files and their neighbours strain nothing: no nudge toward the Force Graph.
  await expect(page.locator(".perspective-strain")).toBeHidden();
  await file("symbolReferences.ts").getByRole("button", { name: "Close symbolReferences.ts", exact: true }).click();
  // The closed card is the one last acted on, so the move holds it still; at rest it stands where it stood.
  await localMapSettled(page);
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
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await page.waitForTimeout(900);
  const graph = await loadGraph(page, "/");
  const picture = await readPicture(page, LOCAL_MAP, displayNames(graph, graph.nodes.map(node => node.id)));
  expect(picture.wires.length).toBeGreaterThan(100);
  expect(scoreOcclusion(picture).occludedWires, "no wire crosses a card it does not end at").toBe(0);
  const foreign = scoreForeign(picture);
  expect(foreign.laneSamples, "the lanes are where the wires run").toBeGreaterThan(0);
  expect(foreign.foreignLaneSamples, "no lane lies in a directory that holds neither end of its wires").toBe(0);
  const routesOnly = { ...picture, wires: picture.wires.filter(wire => !wire.stub) };
  expect(scoreExpanded(routesOnly, symbolCounts(graph)).flow.backward, "no drawn route reads backward; a cycle's feedback is stubs").toBe(0);
  // This scope's references skip columns, so lanes exist, and every wire stays inside the picture's own extent: no headroom above it.
  const lanes = await readLanes(page);
  expect(lanes.length).toBeGreaterThan(0);
  expectLaneBoxes(lanes);
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

test("a lane's slots spread to the wires through them where the wires ask", async ({ page }) => {
  // The five-file scope's lanes all stand at pitch since the span-minimal ranking (2026-10-06); on the chain scope the wires still ask.
  await page.setViewportSize({ width: 1600, height: 1000 });
  const files = [
    "packages/explorer/src/client/index.ts",
    "packages/explorer/src/client/persistence/compressed-url-state.ts",
    "packages/explorer/src/client/views/pin-state.ts",
    "packages/explorer/src/client/views/symbolAnchors.ts"
  ];
  await page.goto(localRetainUrl("/", files));
  await page.waitForSelector("#map-container .branch-mode");
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await page.waitForTimeout(900);
  const lanes = await readLanes(page);
  expect(lanes.length).toBeGreaterThan(0);
  expectLaneBoxes(lanes);
  expect(lanes.some(lane => lane.height > 12 + 7 * lane.slots.length), "the placement spreads a lane's slots where its wires ask").toBe(true);
});

test("directories are membranes: one connected shape per directory, siblings never crossing, every card inside its own", async ({ page }) => {
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
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await page.waitForTimeout(900);
  /** Each directory's segments as the renderer published them, in the picture's own pixels, with the cards it holds directly. */
  const bands = await page.evaluate(() => {
    const layout = document.querySelector<HTMLElement>("#map-container .local-placed")!;
    const origin = layout.getBoundingClientRect();
    const scale = origin.width / layout.offsetWidth || 1;
    const parse = (text: string) => text.split(";").filter(Boolean).map(part => {
      const [column, left, top, right, bottom] = part.split(":").map(Number);
      return { column, left, top, right, bottom };
    });
    return [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-band[data-segments]")].map(band => ({
      directory: band.dataset.directory ?? "",
      parent: band.parentElement?.closest<HTMLElement>(".local-directory-band")?.dataset.directory ?? null,
      segments: parse(band.dataset.segments ?? ""),
      drawn: band.querySelector(":scope > .local-membrane > .local-membrane-shape[d]") !== null,
      cards: [...band.querySelectorAll<HTMLElement>(":scope > .local-column > .node-card")].map(card => {
        const r = card.getBoundingClientRect();
        return { id: card.dataset.id, left: (r.left - origin.left) / scale, top: (r.top - origin.top) / scale, right: (r.right - origin.left) / scale, bottom: (r.bottom - origin.top) / scale };
      })
    }));
  });
  expect(bands.length).toBeGreaterThan(2);
  for (const band of bands) {
    // Every directory but the root draws one outline; its segments run column by column, each overlapping the next by the neck.
    expect(band.drawn, band.directory).toBe(band.directory !== "");
    expect(band.segments.length).toBeGreaterThan(0);
    for (let i = 1; i < band.segments.length; i++) {
      const a = band.segments[i - 1], b = band.segments[i];
      expect(b.column).toBe(a.column + 1);
      expect(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top), `${band.directory} between columns ${a.column} and ${b.column}`).toBeGreaterThanOrEqual(60);
    }
    // Every card the directory holds directly lies inside its segment of that column, with the padding; the root pads nothing.
    const inset = band.directory === "" ? 0 : 12;
    for (const card of band.cards) {
      const segment = band.segments.find(s => card.left >= s.left - 1 && card.right <= s.right + 1);
      expect(segment, `${card.id} across a segment of ${band.directory || "the root"}`).toBeTruthy();
      expect(card.top, `${card.id} below the top of its segment`).toBeGreaterThanOrEqual(segment!.top + inset - 1);
      expect(card.bottom, `${card.id} above the bottom of its segment`).toBeLessThanOrEqual(segment!.bottom - inset + 1);
    }
  }
  // Siblings never cross: two directories in one parent keep apart in every column they share, one wholly above the other.
  for (const a of bands) for (const b of bands) {
    if (a.directory >= b.directory || a.parent !== b.parent) continue;
    for (const sa of a.segments) {
      const sb = b.segments.find(s => s.column === sa.column);
      if (!sb) continue;
      expect(sa.bottom + 28 <= sb.top || sb.bottom + 28 <= sa.top, `${a.directory} and ${b.directory} in column ${sa.column}`).toBe(true);
    }
  }
  // And the membranes extrude: on this scope some directory's segments stand at different heights in different columns.
  expect(bands.some(band => band.segments.some(s => s.top !== band.segments[0].top || s.bottom !== band.segments[0].bottom)), "a membrane follows its members from column to column").toBe(true);
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

test("a card's rows stand where their wires lead by default, and Tuning offers the alphabetical order and the file's own", async ({ page }) => {
  // Four renders of a five-file scope and a reload: the suite's half minute is not enough.
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  const subject = "packages/engine/src/live-docs/document.ts";
  const files = [
    "packages/engine/src/live-docs/graph.ts",
    subject,
    "packages/engine/src/live-docs/graphFiles.ts",
    "packages/explorer/src/shared/staticExplorerData.ts",
    "packages/explorer/src/shared/staticBuilder.ts"
  ];
  const settle = async (): Promise<void> => {
    await page.waitForSelector("#map-container .branch-mode");
    await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
    await page.waitForTimeout(900);
  };
  /** The card's symbol rows, top to bottom, Internals left out. */
  const rowsOf = async (): Promise<string[]> =>
    page.locator(`#map-container .node-card[data-id="${subject}"] .symbol-row:not(.internals-row)`).evaluateAll(rows => rows.map(row => (row as HTMLElement).dataset.symbol!));
  /** How far the card's rows are from the order their wires' far ends ask for: pairs of rows whose far ends stand the other way round. */
  const disorder = async (): Promise<number> => page.evaluate(id => {
    const far = new Map<string, number[]>();
    document.querySelectorAll<SVGPathElement>("#map-connections path.connection-path:not(.back-route):not(.bundle-run)").forEach(path => {
      const numbers = (path.getAttribute("d") ?? "").match(/-?\d+(?:\.\d+)?/gu)?.map(Number) ?? [];
      if (numbers.length < 4) return;
      const start = numbers[1], end = numbers[numbers.length - 1];
      const row = path.dataset.targetId === id ? [path.dataset.targetSymbol!, end] as const : path.dataset.sourceId === id ? [path.dataset.sourceSymbol!, start] as const : null;
      if (row) (far.get(row[0]) ?? far.set(row[0], []).get(row[0])!).push(row[1]);
    });
    const rows = [...document.querySelectorAll<HTMLElement>(`#map-container .node-card[data-id="${id}"] .symbol-row:not(.internals-row)`)].map(row => row.dataset.symbol!.toLowerCase());
    const means = rows.map(name => { const ends = far.get(name); return ends ? ends.reduce((a, b) => a + b, 0) / ends.length : null; });
    let pairs = 0;
    for (let i = 0; i < means.length; i++) for (let j = i + 1; j < means.length; j++) if (means[i] !== null && means[j] !== null && means[i]! > means[j]! + 1) pairs++;
    return pairs;
  }, subject);
  const choose = async (order: string): Promise<void> => {
    await page.locator("#tuning-symbol-order").evaluate(select => { select.closest("details")!.open = true; });
    await page.locator("#tuning-symbol-order").selectOption(order);
    await settle();
  };
  /** Every card keeps every symbol row whatever the order: graph.ts has LinkTarget and linkTarget, which share a normalized name. */
  const everyRowKept = async (): Promise<void> => {
    const cards = await page.locator("#map-container .node-card").evaluateAll(cards => cards.map(card => ({
      id: (card as HTMLElement).dataset.id!,
      rows: [...card.querySelectorAll<HTMLElement>(".symbol-row:not(.internals-row)")].map(row => row.dataset.symbol!)
    })));
    for (const card of cards) {
      const node = graph.nodes.find(node => node.id === card.id);
      if (node) expect([...card.rows].sort(), card.id).toEqual([...node.publicSymbols].sort());
    }
  };
  await page.goto(localRetainUrl("/", files));
  await settle();
  const graph = await loadGraph(page, "/");
  const listed = graph.nodes.find(node => node.id === subject)!.publicSymbols;
  expect(listed.length).toBeGreaterThan(10);
  const byLayout = await rowsOf();
  const layoutDisorder = await disorder();
  expect([...byLayout].sort()).toEqual([...listed].sort());
  await everyRowKept();

  await choose("appearance");
  expect(await rowsOf()).toEqual(listed);
  const appearanceDisorder = await disorder();
  expect(layoutDisorder, "the layout order follows the wires more closely than the file's order").toBeLessThan(appearanceDisorder);

  await choose("alphabetical");
  const alphabetical = await rowsOf();
  expect(alphabetical).toEqual([...listed].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }) || a.localeCompare(b)));
  await everyRowKept();
  const graphRows = await page.locator('#map-container .node-card[data-id="packages/engine/src/live-docs/graph.ts"] .symbol-row:not(.internals-row)').evaluateAll(rows => rows.map(row => (row as HTMLElement).dataset.symbol!));
  expect(graphRows).toEqual([...graphRows].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }) || a.localeCompare(b)));
  // The choice is kept across a reload, and every card ends with Internals whatever the order.
  await page.reload();
  await settle();
  expect(await rowsOf()).toEqual(alphabetical);
  const lastRows = await page.locator("#map-container .node-card").evaluateAll(cards => cards.map(card => [...card.querySelectorAll<HTMLElement>(".symbol-row")].at(-1)?.dataset.symbol));
  expect(lastRows.every(symbol => symbol === "__internals__")).toBe(true);
  await choose("layout");
  expect(await rowsOf()).toEqual(byLayout);
});

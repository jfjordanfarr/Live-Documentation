import { expect, test } from "@playwright/test";

import { currentSnapshot, newestKey, pathAddress } from "./search-bar";
import { localMapSettled } from "./still-picture";
import { retainedKey } from "../../packages/explorer/src/client/views/retained-state";

const ROOT = "tests/integration/programs/typescript/rosetta/src/";
const cardSelector = `#map-container .node-card[data-id="${ROOT}helpers.ts"]`;

test.use({ viewport: { width: 1600, height: 1000 } });

test("hover isolates within retained files, and a row of a whole file narrows the pin to it and back", async ({ page }) => {
  await page.goto(`/?view=local&node=${ROOT}helpers.ts`);
  const card = page.locator(cardSelector);
  await card.getByRole("button", { name: "Pin helpers.ts", exact: true }).click();
  const ids = () => page.locator("#map-container .node-card").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id).sort());
  const wholeFile = await ids();
  const label = card.locator('.symbol-row[data-symbol="format"] .symbol-label-wrapper');
  const row = card.locator('.symbol-row[data-symbol="format"]');
  const symbolPin = row.locator(".local-symbol-pin");
  await page.mouse.move(900, 60);
  await label.hover();
  await expect(page.locator("#map-container")).toHaveClass(/symbol-hover-active/);
  const unrelated = card.locator(".symbol-row:not(.symbol-highlighted):not(.branch-symbol-hidden) .symbol-label-wrapper").first();
  await expect.poll(() => unrelated.evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(.8);
  await expect(row).toHaveClass(/symbol-pinned/);
  await expect(symbolPin).toHaveAttribute("aria-pressed", "false");
  await page.mouse.move(900, 60);
  await expect(page.locator("#map-container")).not.toHaveClass(/symbol-hover-active/);
  await expect(row).toHaveClass(/symbol-pinned/);
  // A row of a file pinned whole narrows the pin to it; released again, the last symbol leaves the file whole (2026-10-15)
  await symbolPin.click();
  await expect(symbolPin).toHaveAttribute("aria-pressed", "true");
  const other = card.locator('.symbol-row[data-symbol="sum"]');
  await expect(other).not.toHaveClass(/symbol-pinned/);
  await symbolPin.click();
  await expect(symbolPin).toHaveAttribute("aria-pressed", "false");
  await expect(row).toHaveClass(/symbol-pinned/);
  await expect(other).toHaveClass(/symbol-pinned/);
  await expect(card.locator(".local-file-pin")).toHaveAttribute("aria-pressed", "true");
  expect(await ids()).toEqual(wholeFile);
  await page.reload();
  await expect(row).toHaveClass(/symbol-pinned/);
  await expect(other).toHaveClass(/symbol-pinned/);
  await expect(card.locator(".local-file-pin")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('.local-directory-band[data-directory="tests/integration/programs/typescript/rosetta/src"]')).toBeVisible();
});

test("perspective copies preserve every computed SVG declaration without live identifiers or hooks", async ({ page }) => {
  await page.goto(`/?view=local&node=${ROOT}helpers.ts`);
  const expected = await page.locator(`${cardSelector} .local-file-pin svg path`).evaluate(element => {
    const source = element as SVGElement;
    source.id = "transition-source-marker";
    source.setAttribute("data-transition-source", "marker");
    source.setAttribute("onclick", "void 0");
    source.style.setProperty("--snapshot-punctuation", '"left;right:still"');
    source.style.strokeDasharray = "1px, 2px";
    const computed = getComputedStyle(source);
    const names = Array.from(computed);
    const reference = source.cloneNode(false) as SVGElement;
    // Normalize all declarations through CSSOM, as the original freeze did. Computed aliases can change spelling
    // when assigned (for example app-region), so comparing raw computed strings would report false differences.
    for (const name of names) reference.style.setProperty(name, computed.getPropertyValue(name));
    return Object.fromEntries(names.map(name => [name, reference.style.getPropertyValue(name)]));
  });
  expect(expected["--snapshot-punctuation"]).toBe('"left;right:still"');
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const bridge = page.locator(".perspective-transition[data-graph-files]");
  await expect(bridge).toBeVisible();
  const ghost = bridge.locator(`.perspective-card:has(+ .perspective-file-name[data-node-id="${ROOT}helpers.ts"])`);
  const actual = await ghost.locator('button[aria-label="Pin helpers.ts"] svg path').evaluate((element, names) =>
    Object.fromEntries(names.map(name => [name, (element as SVGElement).style.getPropertyValue(name)])), Object.keys(expected));
  expect(actual).toEqual(expected);
  await expect(bridge).toHaveAttribute("aria-hidden", "true");
  await expect(bridge).toHaveAttribute("inert", "");
  await expect(bridge.locator("[id], [data-transition-source], [onclick]")).toHaveCount(0);
  await expect(page.locator("#transition-source-marker")).toHaveCount(1);
  await expect(bridge).toHaveCount(0);
});

test("scroll zooms within each perspective; only the 2D and 3D buttons change it", async ({ page }) => {
  await page.goto(`/?view=local&node=${ROOT}helpers.ts`);
  await expect(page.locator(cardSelector)).toBeVisible();
  await localMapSettled(page);
  await page.waitForTimeout(500);
  await page.mouse.move(950, 500);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(450);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(450);
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  const scale = await page.locator("#map-viewport").evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a);
  expect(scale).toBeLessThan(0.4);
  expect(scale).toBeGreaterThan(0);
  await expect(page.locator(".zoom-boundary, .perspective-transition")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset Zoom" }).click();
  await page.waitForTimeout(450);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const bridge = page.locator(".perspective-transition[data-graph-files]");
  await expect(bridge).toBeVisible();
  expect(Number(await bridge.getAttribute("data-graph-files"))).toBeGreaterThan(10);
  await expect(bridge.locator(`[data-node-id="${ROOT}helpers.ts"]`)).toBeAttached();
  await expect(bridge).toHaveCount(0);
  await page.mouse.move(950, 500);
  await page.mouse.wheel(0, -4000);
  await page.waitForTimeout(450);
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(450);
  await expect(page.locator("#view-graph")).toHaveClass(/active/);
  await expect(page.locator(".zoom-boundary, .perspective-transition")).toHaveCount(0);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  await expect(page.locator(".perspective-transition")).toHaveCount(0);
  await expect(page.locator(cardSelector)).toBeVisible();
});

test("a thirteen-file path keeps its ordered steps and constrained symbols through the overview", async ({ page }) => {
  const root = "tests/integration/programs/csharp/estate/";
  const from = `${root}Database/Oracle/CENTRAL.ACCOUNT.sql`, to = `${root}Portal/Pages/Default.aspx`;
  await page.goto(pathAddress("/", from, { kind: "file", nodeId: to }));
  await expect(page.locator("#pathfind-status")).toContainText("Path found: 13 files");
  await expect(page.locator("#pathfind-status")).toContainText("3 references between these files run the other way and are not drawn");
  const ids = () => page.locator("#map-container .path-node .node-card").evaluateAll(cards => cards.sort((a, b) => Number((a.closest(".local-column") as HTMLElement).dataset.column) - Number((b.closest(".local-column") as HTMLElement).dataset.column)).map(card => (card as HTMLElement).dataset.id));
  const before = await ids();
  expect(before).toHaveLength(13);
  expect(before[0]).toBe(from); expect(before[12]).toBe(to);
  expect(await page.locator("#map-container .branch-symbol-hidden").count()).toBeGreaterThan(0);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator("#view-graph")).toHaveClass(/active/);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  expect(await ids()).toEqual(before);
  expect(currentSnapshot(page).destination).toEqual({ kind: "file", nodeId: to });
  expect(newestKey(currentSnapshot(page))).toBe(retainedKey({ kind: "pin", pin: { nodeId: from, symbol: "*" } }));
});

test("native symbol wires gather by file pair and directory shells reverse their containment order", async ({ page }) => {
  await page.goto("/?view=local&node=scripts/slopcop/symbolReferences.ts");
  const card = (name: string) => page.locator(`#map-container .node-card[data-id="scripts/slopcop/${name}"]`);
  await card("symbolReferences.ts").getByRole("button", { name: "Pin symbolReferences.ts", exact: true }).click();
  await card("check-symbols.ts").getByRole("button", { name: "Pin check-symbols.ts", exact: true }).click();
  await localMapSettled(page);
  await page.mouse.move(1500, 950);
  await expect(page.locator('#map-container .local-directory-band[data-directory=""]')).toBeVisible();
  const nativeWires = await page.locator("#map-connections .connection-path").count();
  expect(nativeWires).toBeGreaterThan(10);
  for (const button of ["3D", "2D"]) {
    await page.getByRole("button", { name: button, exact: true }).click();
    const bridge = page.locator(".perspective-transition[data-graph-files]");
    await expect(bridge).toBeVisible();
    expect(Number(await bridge.getAttribute("data-symbol-wires"))).toBe(nativeWires);
    expect(Number(await bridge.getAttribute("data-file-pairs"))).toBeGreaterThan(1);
    expect(Number(await bridge.getAttribute("data-file-pairs"))).toBeLessThan(nativeWires);
    const frames = await page.evaluate(async () => {
      const samples: Array<{ fold: number; root: number; children: number[] }> = [];
      await new Promise<void>(resolve => {
        const sample = (): void => {
          const layer = document.querySelector<HTMLElement>(".perspective-transition[data-graph-files]");
          if (!layer) { resolve(); return; }
          const root = layer.querySelector<HTMLElement>('[data-transition-directory=""]')!;
          const children = [...layer.querySelectorAll<HTMLElement>('[data-depth="1"]')];
          samples.push({ fold: Number(layer.dataset.wireFold), root: Number(root.style.opacity), children: children.map(child => Number(child.style.opacity)) });
          requestAnimationFrame(sample);
        }; requestAnimationFrame(sample);
      });
      return samples;
    });
    expect(frames.length).toBeGreaterThan(5);
    expect(frames.some(frame => frame.fold > 0 && frame.fold < 1)).toBe(true);
    expect(frames.every(frame => frame.children.length === 2 && frame.children.every(child => child >= frame.root))).toBe(true);
    if (button === "2D") {
      expect(frames.some(frame => frame.root === 0 && frame.children.some(child => child > 0))).toBe(true);
    }
  }
  await expect(card("symbolReferences.ts").locator('.symbol-row[data-symbol="SymbolIssueKind"]')).toHaveClass(/symbol-pinned/);
  expect(await page.locator("#map-connections .connection-path").count()).toBe(nativeWires);
});

test("nested directory animation represents each ancestor once, without loose-file pseudo-membranes", async ({ page }) => {
  const directory = "packages/explorer/src/client/views/localView";
  await page.goto(`/?view=local&node=${directory}/controller.ts`);
  await page.locator(".local-focus").getByRole("button", { name: "Pin controller.ts", exact: true }).click();
  const names = await page.locator("#map-container .local-directory-band").evaluateAll(bands => bands.map(band => (band as HTMLElement).dataset.directory));
  expect(new Set(names).size).toBe(names.length);
  expect(names).toEqual(expect.arrayContaining(["", "packages/explorer/src", "packages/explorer/src/client", "packages/explorer/src/client/views", directory]));
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const bridge = page.locator(".perspective-transition[data-graph-files]");
  await expect(bridge).toBeVisible();
  const shells = await bridge.locator("[data-transition-directory]").evaluateAll(bands => bands.map(band => ({ name: (band as HTMLElement).dataset.transitionDirectory, depth: Number((band as HTMLElement).dataset.depth) })));
  expect(shells.map(shell => shell.name)).toEqual(names);
  expect(shells.find(shell => shell.name === "")?.depth).toBe(0);
  expect(shells.find(shell => shell.name === directory)?.depth).toBe(4);
  await expect(bridge).toHaveCount(0);
});

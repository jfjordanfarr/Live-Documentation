import { expect, test } from "@playwright/test";

const ROOT = "tests/integration/programs/typescript/rosetta/src/";
const cardSelector = `#map-container .node-card[data-id="${ROOT}helpers.ts"]`;

test.use({ viewport: { width: 1600, height: 1000 } });

test("hover isolates within retained files and a row toggles the effective file-wide selection", async ({ page }) => {
  await page.goto(`/?view=local&node=${ROOT}helpers.ts`);
  const card = page.locator(cardSelector);
  await card.locator(".node-title").click();
  const ids = () => page.locator("#map-container .node-card").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.id).sort());
  const wholeFile = await ids();
  const label = card.locator('.symbol-row[data-symbol="format"] .symbol-label-wrapper');
  await page.mouse.move(900, 60);
  await label.hover();
  await expect(page.locator("#map-container")).toHaveClass(/symbol-hover-active/);
  const unrelated = card.locator(".symbol-row:not(.symbol-highlighted):not(.branch-symbol-hidden) .symbol-label-wrapper").first();
  await expect.poll(() => unrelated.evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(.8);
  await expect(label).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(900, 60);
  await expect(page.locator("#map-container")).not.toHaveClass(/symbol-hover-active/);
  await expect(label).toHaveAttribute("aria-pressed", "true");
  await label.click();
  await expect(label).toHaveAttribute("aria-pressed", "false");
  const other = card.locator('.symbol-row[data-symbol="sum"] .symbol-label-wrapper');
  await expect(other).toHaveAttribute("aria-pressed", "true");
  await label.click();
  await expect(label).toHaveAttribute("aria-pressed", "true");
  expect(await ids()).toEqual(wholeFile);
  await page.reload();
  await expect(label).toHaveAttribute("aria-pressed", "true");
  await expect(other).toHaveAttribute("aria-pressed", "true");
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

test("native symbol wires gather by file pair and directory shells reverse their containment order", async ({ page }) => {
  await page.goto("/?view=local&node=scripts/slopcop/symbolReferences.ts");
  const card = (name: string) => page.locator(`#map-container .node-card[data-id="scripts/slopcop/${name}"]`);
  await card("symbolReferences.ts").locator(".node-title").click();
  await card("check-symbols.ts").locator(".node-title").click();
  await page.mouse.move(1500, 950);
  await expect(page.locator('#map-container .local-directory-band[data-directory=""]')).toBeVisible();
  const nativeWires = await page.locator("#map-connections .connection-path").count();
  expect(nativeWires).toBeGreaterThan(10);
  for (const button of ["Force Graph · 3D", "Local Map · 2D"]) {
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
    if (button.startsWith("Local")) {
      expect(frames.some(frame => frame.root === 0 && frame.children.some(child => child > 0))).toBe(true);
    }
  }
  await expect(card("symbolReferences.ts").locator('.symbol-row[data-symbol="SymbolIssueKind"] .symbol-label-wrapper')).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator("#map-connections .connection-path").count()).toBe(nativeWires);
});

test("nested directory animation represents each ancestor once, without loose-file pseudo-membranes", async ({ page }) => {
  const directory = "packages/explorer/src/client/views/localView";
  await page.goto(`/?view=local&node=${directory}/controller.ts`);
  await page.locator(".local-focus .node-title").click();
  const names = await page.locator("#map-container .local-directory-band").evaluateAll(bands => bands.map(band => (band as HTMLElement).dataset.directory));
  expect(new Set(names).size).toBe(names.length);
  expect(names).toEqual(expect.arrayContaining(["", "packages/explorer/src", "packages/explorer/src/client", "packages/explorer/src/client/views", directory]));
  await page.getByRole("button", { name: "Force Graph · 3D", exact: true }).click();
  const bridge = page.locator(".perspective-transition[data-graph-files]");
  await expect(bridge).toBeVisible();
  const shells = await bridge.locator("[data-transition-directory]").evaluateAll(bands => bands.map(band => ({ name: (band as HTMLElement).dataset.transitionDirectory, depth: Number((band as HTMLElement).dataset.depth) })));
  expect(shells.map(shell => shell.name)).toEqual(names);
  expect(shells.find(shell => shell.name === "")?.depth).toBe(0);
  expect(shells.find(shell => shell.name === directory)?.depth).toBe(4);
  await expect(bridge).toHaveCount(0);
});

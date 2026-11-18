import { expect, test, type Page } from "@playwright/test";
import type { InstancedMesh, MeshLambertMaterial, Scene } from "three";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { spatialNodeStyles } from "../../packages/explorer/src/client/views/forceGraphAppearance";
import type { SpatialDrawEntry } from "../../packages/explorer/src/client/views/forceGraphBatches";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { localMapSettled } from "./still-picture";

test.use({ viewport: { width: 1280, height: 800 } });

/** A sample of the 3D key with its words: a row's one mark, or one kind of the kinds' row (2026-11-16). */
const key = (page: Page, text: string) => page.locator("#spatial-legend .legend-mark").filter({ hasText: new RegExp(`^${text}$`) });

/** What a row of a key shows and says: the words beside its samples, every word it draws, and its sentence. */
interface RowRead { kinds: boolean; words: string[]; drawn: string[]; samples: number; title: string; description: string }

const rowsOf = (page: Page, legend: string): Promise<RowRead[]> => page.locator(`${legend} .legend-row:visible`).evaluateAll(rows => rows.map(row => ({
  kinds: row.classList.contains("legend-row--kinds"),
  words: [...row.querySelectorAll(".legend-word")].map(word => (word.textContent ?? "").trim()),
  drawn: (row as HTMLElement).innerText.split(/\s+/u).filter(Boolean),
  samples: row.querySelectorAll('[aria-hidden="true"]:not([aria-hidden="true"] *)').length,
  title: row.getAttribute("title") ?? "", description: row.getAttribute("aria-description") ?? ""
})));

/**
 * The legend's rule of 2026-11-16 (the owner: "I still strongly strongly strongly continue to urge to minimize visibile
 * words that come from _us_"): a row is a sample and at most two words, with no sentence, colon or instruction, and
 * what it said at length is its tooltip and its description. The kinds' row alone has several samples, each with its
 * one word.
 */
function expectFewWords(rows: RowRead[], where: string): void {
  expect(rows.length, `${where}: rows drawn`).toBeGreaterThan(0);
  for (const row of rows) {
    const said = `${where}: "${row.drawn.join(" ")}"`;
    expect.soft(row.drawn.join(" "), `${said}: every word drawn stands beside a sample`).toBe(row.words.join(" "));
    if (row.kinds) expect.soft(row.words.filter(word => /\s/u.test(word)), `${said}: a kind is one word`).toEqual([]);
    else expect.soft(row.drawn.length, `${said}: two words at most`).toBeLessThanOrEqual(2);
    expect.soft(row.drawn.join(" "), `${said}: words alone`).toMatch(/^[\p{L}\- ]+$/u);
    expect.soft(row.samples, `${said}: a sample`).toBeGreaterThanOrEqual(row.kinds ? row.words.length : 1);
    expect.soft(row.title, `${said}: its sentence is its tooltip`).toMatch(/^\p{Lu}.{20,}\.$/u);
    expect.soft(row.description, `${said}: and its description`).toBe(row.title);
  }
}

/** Compare the painted key swatch with the node material sent to Three, rather than importing the shared palette. */
async function matchesNodeColour(page: Page, label: string, id: string): Promise<void> {
  const color = await key(page, label).locator(".spatial-legend-sample").evaluate(element =>
    getComputedStyle(element, "::before").backgroundColor);
  const agrees = await page.evaluate(({ id, color }) => {
    const { scene } = (window as unknown as { renderedGraph: { scene: Scene } }).renderedGraph;
    let matches = false;
    scene.traverse(object => {
      const mesh = object as InstancedMesh;
      const batch = mesh.userData.spatialBatch as { kind: string; entries: SpatialDrawEntry<{ id: string }>[] } | undefined;
      if (batch?.kind !== "nodes") return;
      const entry = batch.entries.find(item => item.data.id === id);
      if (!entry) return;
      const actual = (mesh.material as MeshLambertMaterial).color.clone(); mesh.getColorAt(entry.slot, actual);
      const expected = actual.clone().setStyle(color);
      matches = actual.r === Math.fround(expected.r) && actual.g === Math.fround(expected.g) && actual.b === Math.fround(expected.b);
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
  // The subject is selected and a test pinned: the picture is their hops, which here reach every connected file in one
  // hop, so no hop is dimmed as a frontier (discovery, 2026-10-31; until then pins faded the rest of the picture and the
  // key carried a Faded row for it); the sample's other groups stand by their seeds, dimmed, and the key says so (2026-11-02).
  await expect(page.locator("#spatial-legend .legend-word")).toHaveText(["Implementation", "Test", "Symbols", "References", "Beyond"]);
  await expect(page.locator("#spatial-legend .legend-row")).toHaveCount(4);
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
  await expect(key(page, "Cited by")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Show Related Docs", exact: true }).check();
  await expect(key(page, "Document")).toBeVisible();
  await expect(key(page, "Cites")).toBeVisible();
  await expect.poll(async () => (await renderedLinks(page)).filter(link => link.kind === "related-doc").length).toBeGreaterThan(0);
  await page.getByRole("checkbox", { name: "Show Related Docs", exact: true }).uncheck();
  await expect(key(page, "Document")).toHaveCount(0);
  await expect(key(page, "Cites")).toHaveCount(0);
  await expect.poll(async () => (await renderedNodes(page)).filter(node => node.id.startsWith("related:")).length).toBe(0);
});

test("the Local Map shows the matching legend and lends neither key to another view", async ({ page }) => {
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#spatial-legend")).toBeVisible();
  // The subject's one hop ends in a frontier; Skin also names the wrapped groups and directory shells. The frontier's spheres
  // with more behind them wear rings, and the key says what the ring means (2026-11-02).
  await expect(page.locator("#spatial-legend .legend-row")).toHaveText([
    "Implementation", "Symbols", "References", "Beyond", "More connected", "Wrapped group", "Directory shell"
  ]);
  expectFewWords(await rowsOf(page, "#spatial-legend"), "the 3D key");
  await expect(key(page, "More connected").locator("xpath=..")).toHaveAccessibleDescription("A ring: more is connected to this file than the picture shows. Press the file to see it.");
  await expect(page.locator("#local-legend")).toBeHidden();

  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator("#local-legend")).toBeVisible();
  // The rows the 2D map's arrival shows; the gathered wires' key, "References", is drawn only at the overview band
  // (2026-11-06), whose wires it explains, and local-map-overview.spec.ts holds it there.
  await expect(page.locator("#local-legend .legend-word:visible")).toHaveText(["Offers", "Uses", "Test-backed"]);
  await expect(page.locator("#local-legend .legend-row--gathered")).toBeHidden();
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

/** This repository's scripts directory, opened in 2D: the directories inside it are closed, their cells of several kinds. */
const CLOSED = "/?view=local&dir=scripts";
/** A directory whose closed boxes still draw their cells at the overview look, for the key's audit at its most rows. */
const KINDS_ZOOMED_OUT = "/?view=local&dir=packages/explorer/src/client";

async function still(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(500);
}

/** A visit with a choice of how a closed directory is drawn, beside the suite's own setting. */
const choosing = (page: Page, localMap: Record<string, string>): Promise<void> => page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
  key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, ...localMap } } })
});

/** The colours the closed directories' cells are drawn in at this moment, read from the picture, as the names the 3D map gives them. */
const kindsDrawn = async (page: Page): Promise<string[]> => {
  const fills = await page.evaluate(() => [...new Set([...document.querySelectorAll<SVGElement>("#map-container .local-cell")]
    .filter(cell => cell.checkVisibility({ visibilityProperty: true })).map(cell => getComputedStyle(cell).fill))]);
  const rgb = (hex: string): string => `rgb(${[1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16)).join(", ")})`;
  return Object.values(spatialNodeStyles()).filter(style => fills.includes(rgb(style.color))).map(style => style.label);
};

test("each row of the 2D key is a sample and two words at most at every look, its sentence kept for its tooltip", async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(CLOSED);
  await still(page);
  const shown: Record<string, string[]> = {};
  let pressed = 0;
  for (const [look, presses] of [["reading", 0], ["connections", 3], ["overview", 7]] as const) {
    for (; pressed < presses; pressed += 1) {
      await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
      await still(page);
    }
    await expect(page.locator("#map-container")).toHaveAttribute("data-look", look);
    const rows = await rowsOf(page, "#local-legend");
    expectFewWords(rows, `the ${look} look`);
    shown[look] = rows.filter(row => !row.kinds).flatMap(row => row.words);
    // The kinds' row says the colours the cells are drawn in at this look, and is not drawn where no cell is.
    const kinds = await kindsDrawn(page);
    expect(rows.filter(row => row.kinds).flatMap(row => row.words), `the ${look} look's kinds`).toEqual(kinds);
    await expect(page.locator("#local-legend-kinds")).toBeVisible({ visible: kinds.length > 0 });
    if (look === "reading") expect(kinds.length, "this directory's closed directories hold files of more than one kind").toBeGreaterThan(1);
  }
  expect(shown.reading, "the two roles are one row, and the wires' width is the overview's").toEqual(["Offers", "Uses", "Test-backed"]);
  expect(shown.overview).toEqual(["Offers", "Uses", "Test-backed", "References"]);
  // The roles' row is a drawing between its two words: what offers, a wire, what uses.
  const roles = page.locator("#local-legend .legend-row--roles");
  await expect(roles).toHaveAccessibleDescription(/^A wire runs from what one file offers, in blue, to the file that uses it, in green\./u);
  expect(await roles.evaluate(row => [...row.children].map(child => child.className))).toEqual(["legend-word", "legend-roles", "legend-word"]);
});

test("the 2D key has no kinds row where the cells are one grey or a closed directory has no cells", async ({ browser }) => {
  test.setTimeout(90_000);
  for (const choice of [{ closedCells: "grey" }, { closedDirectory: "box" }] as Array<Record<string, string>>) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await choosing(page, choice);
    await page.goto(CLOSED);
    await still(page);
    await expect(page.locator("#map-container .local-directory-closed").first()).toBeVisible();
    // In grey the cells are drawn; a plain box has none.
    if ("closedCells" in choice) await expect(page.locator("#map-container .local-cell").first()).toBeAttached();
    else await expect(page.locator("#map-container .local-cell")).toHaveCount(0);
    expect(await kindsDrawn(page), "no cell is drawn in a kind's colour").toEqual([]);
    await expect(page.locator("#local-legend-kinds")).toBeHidden();
    await expect(page.locator("#local-legend .legend-word:visible")).toHaveText(["Offers", "Uses", "Test-backed"]);
    await context.close();
  }
});

test("the key's words are whole and apart in both maps, in the sidebar's one width and on a narrow screen", async ({ page }) => {
  test.setTimeout(150_000);
  const WORDS = ["#map-legend .legend-word"];
  const audit = async (where: string, floor: number): Promise<void> => {
    const boxes = await textBoxes(page, WORDS);
    expect(boxes.length, `${where}: the words audited`).toBeGreaterThanOrEqual(floor);
    const overlaps = overlapsAmong(boxes), cut = await truncations(page, [...WORDS, "#map-legend .legend-row"]);
    expect(overlaps.length + cut.length, `${where}: ${describeFaults(overlaps, cut)}`).toBe(0);
    const inside = await page.evaluate(() => {
      const panel = document.querySelector("#map-legend")!.getBoundingClientRect();
      return [...document.querySelectorAll("#map-legend .legend-word")].filter(word => word.getClientRects().length)
        .every(word => { const box = word.getBoundingClientRect(); return box.left >= panel.left && box.right <= panel.right; });
    });
    expect(inside, `${where}: every word inside the panel`).toBe(true);
  };
  // The sidebar has one width, 260 px, at every size of window. A narrow window starts with it collapsed, and a reader
  // who opens it has it laid over the page at that width: there the audit reads the overview look's rows, the 2D key's most.
  // Read on the client's directories, whose closed boxes keep their cells zoomed out and so the key its row of kinds:
  // `scripts` lost them on 2026-11-16, when a directory whose name takes two lines joined it (the row of cells is drawn
  // in every sibling or in none). The floor of five words says so if this family loses them too.
  for (const width of [1280, 640]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(KINDS_ZOOMED_OUT);
    await still(page);
    if (width === 1280) await audit("2D at 1280 px", 4);
    for (let press = 0; press < 7; press += 1) {
      await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
      await still(page);
    }
    if (width === 640) {
      await expect(page.locator("#map-legend")).toBeHidden();
      await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      await expect(page.locator("#sidebar")).not.toHaveClass(/collapsed/u);
      await page.waitForTimeout(400);
    }
    await audit(`2D at ${width} px, the overview look`, 5);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#spatial-legend .legend-row")).toHaveCount(7);
  await audit("3D", 7);
  // The audit sees these words: squeezed into a quarter of the panel, they are cut, and it says so.
  await page.addStyleTag({ content: "#map-legend { width: 60px; overflow: hidden; }" });
  expect((await truncations(page, WORDS)).length, "the audit finds the key's words when they are cut").toBeGreaterThan(0);
});

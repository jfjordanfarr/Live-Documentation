import { expect, test, type Locator, type Page } from "@playwright/test";

import { AA_SMALL_TEXT, backdrop, contrastRatio, parseColour } from "./contrast";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { choose, currentSnapshot, newestKey } from "./search-bar";
import { loadGraph, localMapSettled } from "./still-picture";
import type { LiveDocGraph } from "../../packages/engine/src/live-docs/graph";
import { retainedKey } from "../../packages/explorer/src/client/views/retained-state";

/**
 * One search at the top of the Explorer, in every view, in place of the Ctrl+P dialog and the FROM/TO toolbar
 * (the owner's ask, 2026-10-14): it finds directories, files and symbols, grouped directory, file, symbol; choosing
 * a row pins what it names and makes it the newest pin; once anything is pinned a destination field appears, and
 * choosing there asks the path at once. The path's own behaviour is in local-map-path.spec.ts.
 */
const INDEX = "packages/explorer/src/client/index.ts";
const LAYOUT = "packages/explorer/src/client/views/forceGraphLayout.ts";
const VIEWS = "packages/explorer/src/client/views";
const ESTATE = "/samples/estate/";
const BAR_TEXT = [".search-group", ".search-row-name", ".search-row-context", ".search-row-badge", "#pathfind-status", ".pathfind-path-hop-name", ".pathfind-path-hop-symbol"];

test.use({ viewport: { width: 1600, height: 1000 } });

/** Names read since November 5; the evidence reader is reached through More → Inspect on the card or the row. */
async function inspectFromMore(page: Page, scope: Locator, name: string): Promise<void> {
  await scope.locator(".local-symbol-more, .local-file-more").first().click();
  await page.getByRole("menuitem", { name: `Inspect ${name}`, exact: true }).click();
}

for (const width of [952, 1280]) {
  test(`symbol search frames the requested row and its actions after retained layout movement at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const config = "packages/engine/src/config/liveDocumentationConfig.ts";
    const pathfind = "packages/engine/src/live-docs/pathfind.ts";
    await page.goto(`/?view=local&mode=2d&node=${config}`);
    await page.locator(".local-placed").waitFor();
    await localMapSettled(page);
    await choose(page, "subject", "liveDocumentationConfig", {file:config});
    await choose(page, "subject", "Neighbours", {file:pathfind,symbol:"Neighbours"});
    await localMapSettled(page);
    const row=page.locator(`.node-card[data-id="${pathfind}"] .symbol-row[data-symbol="Neighbours"]`);
    await expect(row.locator(".symbol-label-wrapper")).toBeInViewport({ratio:1});
    await expect(row.locator(".local-symbol-pin")).toBeInViewport({ratio:1});
    // A trial click also checks occlusion by the bottom controls; mere DOM visibility would miss the original failure.
    await row.locator(".local-symbol-pin").click({trial:true});
    expect(currentSnapshot(page).pinSet.entries).toContainEqual({nodeId:config,symbol:"*"});
    expect(currentSnapshot(page).pinSet.entries).toContainEqual({nodeId:pathfind,symbol:"Neighbours"});
    await row.locator(".symbol-label").hover();
    const highlighted=page.locator(`.node-card[data-id="${pathfind}"] .symbol-highlighted`);
    expect(await highlighted.evaluateAll(rows=>rows.map(row=>row.getAttribute("data-symbol"))).then(names=>names.sort()))
      .toEqual(["Neighbours","components","reachFrom","walk (function)"].sort());
  });
}

test("same-name declarations remain distinct through search, inspection and reload", async ({ page }) => {
  const file="packages/engine/src/live-docs/pathfind.ts";
  await page.goto(`/?view=local&mode=2d&node=${file}`);
  await page.locator(".local-placed").waitFor();
  await localMapSettled(page);
  await choose(page,"subject","walk",{file,symbol:"walk (function)"});
  await localMapSettled(page);
  const card=page.locator(`.node-card[data-id="${file}"]`);
  await inspectFromMore(page,card.locator('.symbol-row[data-symbol="walk (function)"]'),"walk (function)");
  const panel=page.locator("#detail-panel");
  await expect(panel).toContainText("Walks breadth-first from a set of files");
  expect(currentSnapshot(page).pinSet.entries).toEqual([{nodeId:file,symbol:"walk (function)"}]);
  expect(currentSnapshot(page).inspection).toEqual({kind:"file",nodeId:file,symbol:"walk (function)"});
  await page.reload();
  await expect(panel).toContainText("Walks breadth-first from a set of files");
  await page.getByRole("button",{name:"Close details",exact:true}).click();
  await choose(page,"subject","walk",{file,symbol:"Walk (interface)"});
  await localMapSettled(page);
  await inspectFromMore(page,card.locator('.symbol-row[data-symbol="Walk (interface)"]'),"Walk (interface)");
  await expect(panel).toContainText("What one breadth-first walk from a set of files found.");
  expect(currentSnapshot(page).pinSet.entries).toEqual([
    {nodeId:file,symbol:"walk (function)"},{nodeId:file,symbol:"Walk (interface)"}
  ]);
});

test("a reader link's explicit anchor wins over a different declaration with that heading", async ({ page }) => {
  const file="packages/engine/src/live-docs/pathfind.ts";
  await page.route("**/explorer-data.json", async route => {
    const response=await route.fetch();
    const data=await response.json() as {graph:LiveDocGraph};
    const document=data.graph.files[file];
    const base={kind:"type",flags:[],references:[]};
    document.symbols.unshift(
      {...base,name:"reader-fragment",slug:"heading-declaration",sections:[{title:"Summary",body:["The similarly spelled heading."]}]},
      {...base,name:"Actual anchor target",slug:"reader-fragment",sections:[{title:"Summary",body:["The explicitly anchored declaration."]}]}
    );
    document.reExports=[...(document.reExports??[]),{name:"reader-fragment",slug:"alias-declaration",flags:[],from:{label:"other declaration",link:"#heading-declaration"}}];
    document.authored+="\n\n[Read the anchored declaration](#reader-fragment)\n";
    await route.fulfill({response,json:data});
  });
  await page.goto(`/?view=local&mode=2d&node=${file}`);
  await page.locator(".local-placed").waitFor();
  await localMapSettled(page);
  await inspectFromMore(page,page.locator(`.node-card[data-id="${file}"]`),"pathfind.ts");
  await page.locator("#detail-panel").getByRole("link",{name:"Read the anchored declaration",exact:true}).click();
  expect(currentSnapshot(page).inspection).toEqual({kind:"file",nodeId:file,symbol:"Actual anchor target"});
  await expect(page.locator("#detail-panel")).toContainText("The explicitly anchored declaration.");
});

test("one search finds directories, files and symbols, grouped; a chosen one is pinned and becomes the newest pin", async ({ page }) => {
  await page.goto(`/?view=local&node=${encodeURIComponent(INDEX)}`);
  await localMapSettled(page);
  await expect(page.locator("#omnisearch, #omnisearch-trigger, #pathfind-from, #pathfind-to, #pathfind-go, #pathfind-clear")).toHaveCount(0);
  await expect(page.locator("#search-subject")).toBeVisible();
  await expect(page.locator("#search-destination-field"), "no path can be asked before anything is pinned").toBeHidden();
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");

  // Ctrl+P goes to the field; a word finds a directory by its name, and files under group headings
  await page.keyboard.press("Control+p");
  await expect(page.locator("#search-subject")).toBeFocused();
  await page.keyboard.type("views");
  const results = page.locator("#search-subject-results");
  await expect(results.locator(`.search-row--directory:has(.search-row-name:text-is("${VIEWS}"))`)).toBeVisible();
  expect(await results.locator(".search-group, .search-row--directory").count(), "results are grouped by directory").toBeGreaterThan(1);
  await page.keyboard.press("Escape");
  await expect(results).toBeHidden();
  await expect(page.locator("#search-subject")).toHaveValue("");

  // A symbol chosen under its file is pinned alone, and the destination field appears
  await choose(page, "subject", "spatialNodeValue", { file: LAYOUT, symbol: "spatialNodeValue" });
  await localMapSettled(page);
  await expect(page.locator("#search-subject")).toHaveValue("spatialNodeValue");
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  expect(currentSnapshot(page).pinSet.entries).toEqual([{ nodeId: LAYOUT, symbol: "spatialNodeValue" }]);
  await expect(page.locator("#search-destination-field")).toBeVisible();
  await expect(page.locator(`#map-container .node-card[data-id="${LAYOUT}"]`)).toBeVisible();

  // A directory chosen is opened, newest
  await choose(page, "subject", "views", { directory: VIEWS });
  await localMapSettled(page);
  expect(currentSnapshot(page).openDirectories.has(VIEWS)).toBe(true);
  expect(newestKey(currentSnapshot(page))).toBe(retainedKey({ kind: "directory", directory: VIEWS }));
  await expect(page.locator("#search-subject")).toHaveValue("views");
  await expect(page.locator(".pin-tray-toggle")).toHaveText("2 pins");

  // A file chosen is pinned whole, newest
  await choose(page, "subject", "index.ts", { file: INDEX });
  await localMapSettled(page);
  expect(currentSnapshot(page).pinSet.entries).toContainEqual({ nodeId: INDEX, symbol: "*" });
  expect(newestKey(currentSnapshot(page))).toBe(retainedKey({ kind: "pin", pin: { nodeId: INDEX, symbol: "*" } }));
  await expect(page.locator("#search-subject")).toHaveValue("index.ts");
  await expect(page.locator(".pin-tray-toggle")).toHaveText("3 pins");
});

test("a file named by the words comes first, ahead of files that only expose a symbol of that name", async ({ page }) => {
  // The October 23 review typed "generator" and found generator.ts in the ninth row, behind a symbol of tsconfig.base.json and
  // GeneratorIdentity: the name was scored with its extension and the groups were then sorted by directory
  await page.goto("/");
  await page.click("#search-subject");
  await page.keyboard.type("generator");
  const first = page.locator("#search-subject-results .search-row--file").first();
  await expect(first.locator(".search-row-context")).toHaveText("packages/generator/src/generator.ts");
  await expect(first.locator(".search-row-name")).toHaveText("generator.ts");
});

test("a result's path is readable: at least 4.5:1 against its row, selected or not, at its own size", async ({ page }) => {
  // The paths were 10 px #666 on the results' #1f1f22, about 2.9:1, under WCAG AA's 4.5:1 for small text
  await page.goto("/");
  await page.click("#search-subject");
  await page.keyboard.type("generator");
  const results = page.locator("#search-subject-results");
  await expect(results.locator(".search-row--file.selected .search-row-context")).toHaveCount(1);
  const paths = await results.locator(".search-row-context").evaluateAll(elements => elements.map(element => {
    const layers: string[] = [];
    for (let layer: Element | null = element; layer; layer = layer.parentElement) layers.unshift(getComputedStyle(layer).backgroundColor);
    const style = getComputedStyle(element);
    return { text: element.textContent ?? "", selected: !!element.closest(".selected"), colour: style.color, fontSize: parseFloat(style.fontSize), layers };
  }));
  expect(paths.length).toBeGreaterThan(3);
  expect(paths.some(path => path.selected) && paths.some(path => !path.selected), "both a selected and an unselected row are measured").toBe(true);
  for (const path of paths) {
    expect(path.fontSize, path.text).toBeGreaterThanOrEqual(10);
    expect(contrastRatio(parseColour(path.colour), backdrop(path.layers)), `${path.text}${path.selected ? ", selected" : ""}`).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  }
});

test("each field is a combobox over a listbox: open or closed, and the keyboard's row named while focus stays in the field", async ({ page }) => {
  await page.goto("/");
  const field = page.getByRole("combobox", { name: /^Search files, symbols and directories/u });
  await expect(field).toHaveAttribute("aria-autocomplete", "list");
  await expect(field).toHaveAttribute("aria-controls", "search-subject-results");
  await expect(field).toHaveAttribute("aria-expanded", "false");
  await expect(field).not.toHaveAttribute("aria-activedescendant", /./u);

  await field.click();
  await page.keyboard.type("generator");
  const results = page.locator("#search-subject-results");
  await expect(results).toBeVisible();
  await expect(field).toHaveAttribute("aria-expanded", "true");
  await expect(results).toHaveAttribute("role", "listbox");
  const rows = await results.locator(".search-row").evaluateAll(elements => elements.map(element => ({ id: element.id, role: element.getAttribute("role") })));
  expect(rows.length).toBeGreaterThan(3);
  expect(rows.every(row => row.role === "option" && row.id !== ""), "every row is an option with an id").toBe(true);
  expect(new Set(rows.map(row => row.id)).size, "the ids are distinct").toBe(rows.length);
  expect(await results.locator(".search-group").evaluateAll(groups => groups.map(group => group.getAttribute("role"))))
    .toEqual(expect.arrayContaining(["presentation"]));
  expect(await results.locator(".search-group:not([role=presentation])").count(), "group headings are presentational").toBe(0);

  // The active descendant follows the keyboard's row; focus never leaves the field
  const active = () => field.getAttribute("aria-activedescendant");
  await expect(field).toHaveAttribute("aria-activedescendant", rows[0].id);
  await expect(page.locator(`#${rows[0].id}`)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  expect(await active()).toBe(rows[1].id);
  await expect(page.locator(`#${rows[1].id}`)).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(`#${rows[0].id}`)).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  expect(await active(), "ArrowUp from the first row wraps to the last").toBe(rows.at(-1)!.id);
  await expect(field).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(results).toBeHidden();
  await expect(field).toHaveAttribute("aria-expanded", "false");
  await expect(field).not.toHaveAttribute("aria-activedescendant", /./u);

  // The destination field, once anything is pinned, is the same
  await choose(page, "subject", "generator", { file: "packages/generator/src/generator.ts" });
  const destination = page.getByRole("combobox", { name: "The end of a path from the newest pin" });
  await expect(destination).toHaveAttribute("aria-controls", "search-destination-results");
  await expect(destination).toHaveAttribute("aria-expanded", "false");
  await destination.click();
  await page.keyboard.type("engine");
  await expect(page.locator("#search-destination-results")).toBeVisible();
  await expect(destination).toHaveAttribute("aria-expanded", "true");
  await expect(destination).toHaveAttribute("aria-activedescendant", /^search-destination-results-\d+$/u);
});

test("a file's matched symbols are capped at five with the rest counted, and the fold lists them all", async ({ page }) => {
  await page.goto(`/?view=local&node=${encodeURIComponent(INDEX)}`);
  await localMapSettled(page);
  const graph = await loadGraph(page, "/");
  const matching = (node: typeof graph.nodes[number]): string[] => (node.publicSymbols ?? [])
    .filter(symbol => symbol.toLowerCase().includes("e") || symbol.toLowerCase().includes(node.name.toLowerCase()));
  const rich = graph.nodes.map(node => ({ node, matched: matching(node) }))
    .filter(entry => entry.matched.length >= 7 && graph.nodes.filter(other => other.name === entry.node.name).length === 1)
    .sort((a, b) => b.matched.length - a.matched.length)[0];
  expect(rich, "a uniquely named file with at least seven symbols containing an e").toBeDefined();
  await page.click("#search-subject");
  await page.keyboard.type(`${rich.node.name} e`);
  const results = page.locator("#search-subject-results");
  const fileRow = results.locator(`.search-row--file:has(.search-row-context:text-is("${rich.node.codeRelativePath}"))`);
  await expect(fileRow).toBeVisible();
  /** The symbol rows right under the file, and the fold that follows them, if any. */
  const under = () => fileRow.evaluate(row => {
    let symbols = 0;
    let next = row.nextElementSibling;
    for (; next?.classList.contains("search-row--symbol"); next = next.nextElementSibling) symbols++;
    const fold = next?.classList.contains("search-row--more") ? { text: next.textContent?.trim() ?? "", index: Number((next as HTMLElement).dataset.index) } : null;
    return { symbols, fold };
  });
  const capped = await under();
  expect(capped.symbols).toBe(5);
  expect(capped.fold?.text).toBe(`${rich.matched.length - 5} more symbols`);
  await results.locator(`.search-row[data-index="${capped.fold!.index}"]`).click();
  await expect(results).toBeVisible();
  const unfolded = await under();
  expect(unfolded.symbols).toBe(rich.matched.length);
  expect(unfolded.fold).toBeNull();
});

test("the bar stands in every view, a file chosen on the World Map opens the Local Map pinned, and its words are never cut", async ({ page }) => {
  await page.goto(ESTATE);
  await expect(page.locator("#view-world.active")).toBeVisible();
  await expect(page.locator("#search-subject")).toBeVisible();
  await page.getByRole("button", { name: "Knowledge Sources", exact: true }).click();
  await expect(page.locator("#view-sources.active")).toBeVisible();
  await expect(page.locator("#search-subject")).toBeVisible();
  await page.getByRole("button", { name: "World Map", exact: true }).click();
  await expect(page.locator("#view-world.active")).toBeVisible();

  await choose(page, "subject", "GatewayClient", { file: "Portal/Services/GatewayClient.cs" });
  await expect(page.locator("#view-map.active")).toBeVisible();
  await localMapSettled(page);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await expect(page.locator("#search-destination-field")).toBeVisible();

  // With results open, no word collides with another or runs past its box
  await page.click("#search-destination");
  await page.keyboard.type("Payment");
  await expect(page.locator("#search-destination-results .search-row").first()).toBeVisible();
  let boxes = await textBoxes(page, BAR_TEXT);
  let overlaps = overlapsAmong(boxes);
  let cut = await truncations(page, BAR_TEXT);
  expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
  await page.keyboard.press("Escape");

  // With a path answered, the status and the strip read whole too
  await choose(page, "destination", "IPaymentHub", { file: "Contracts/IPaymentHub.cs" });
  await page.waitForSelector("#pathfind-status:not([hidden])");
  await page.click("#pathfind-status a");
  await page.waitForSelector("#view-map.has-path");
  await page.waitForTimeout(600);
  boxes = await textBoxes(page, BAR_TEXT);
  overlaps = overlapsAmong(boxes);
  cut = await truncations(page, BAR_TEXT);
  expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
});

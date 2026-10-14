import { expect, test } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { choose, currentSnapshot, newestKey } from "./search-bar";
import { loadGraph, localMapSettled } from "./still-picture";
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

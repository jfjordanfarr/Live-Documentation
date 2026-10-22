import { expect, test } from "@playwright/test";

import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

/**
 * The documents that cite a file, the `Cited By` section the generator writes
 * since 2026-10-22: the 3D Local Map draws them by their own filter, from the
 * document to the file and apart from the documents the file's own words
 * cite, and the reader lists them under the file and opens one. Each
 * expectation is computed again from `explorer-data.json`, so that a picture
 * or a panel that showed other documents would fail.
 */

interface Bundle {
  graph: { files: Record<string, { docPath: string; archetype?: string; citedBy?: Array<{ label: string; link: string }> }> };
  bundledMarkdown?: Record<string, string>;
  relatedDocLinks?: Array<{ sourceId: string; targetPath: string; direction: "cites" | "cited-by" }>;
}

test.use({ viewport: { width: 1400, height: 900 } });

const bundleOf = async (page: import("@playwright/test").Page): Promise<Bundle> => (await page.request.get("/explorer-data.json")).json() as Promise<Bundle>;

test("the 3D picture draws the citing documents by their own filter, from the document to the file", async ({ page }) => {
  const bundle = await bundleOf(page);
  // The spheres shown by default: assets are hidden, so a document citing only an asset is not drawn.
  const citing = (bundle.relatedDocLinks ?? []).filter(link => link.direction === "cited-by" && bundle.graph.files[link.sourceId]?.archetype !== "asset");
  expect(citing.length, "this repository's files are cited by its design documents").toBeGreaterThan(0);
  await observeGraph(page);
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "3d", filters: { ...DEFAULT_SNAPSHOT.filters, showCitingDocs: true } })}`);
  await page.locator("#view-graph.active canvas").waitFor();
  await expect(page.locator("#filter-toggle-citing-docs")).toBeChecked();
  await expect(page.locator("#filter-toggle-related-docs")).not.toBeChecked();
  const documents = async (): Promise<string[]> => (await renderedNodes(page)).map(node => node.id).filter(id => id.startsWith("related:")).sort();
  const expected = [...new Set(citing.map(link => `related:${link.targetPath}`))].sort();
  await expect.poll(documents, { timeout: 30_000 }).toEqual(expected);
  const links = await renderedLinks(page);
  const drawn = links.filter(link => link.kind === "cited-by");
  expect(drawn.length).toBeGreaterThan(0);
  expect(drawn.every(link => link.source.startsWith("related:") && bundle.graph.files[link.target] !== undefined), "a citation is drawn from the document to the file").toBe(true);
  expect(links.some(link => link.kind === "related-doc"), "the documents the files cite stay hidden under their own filter").toBe(false);
  // The filter rides the address, and unchecking it takes the documents away.
  expect(currentSnapshot(page).filters.showCitingDocs).toBe(true);
  await page.locator("#filter-toggle-citing-docs").uncheck();
  await expect.poll(documents, { timeout: 30_000 }).toEqual([]);
  expect(currentSnapshot(page).filters.showCitingDocs).toBe(false);
});

test("the reader lists the documents that cite a file and opens one", async ({ page }) => {
  const bundle = await bundleOf(page);
  const carried = (label: string): boolean => !!bundle.bundledMarkdown && Object.hasOwn(bundle.bundledMarkdown, label);
  const file = Object.keys(bundle.graph.files).find(key => bundle.graph.files[key].citedBy?.some(entry => carried(entry.label)));
  expect(file, "a cited file whose citing document the bundle carries").toBeDefined();
  const document = bundle.graph.files[file!].citedBy!.find(entry => carried(entry.label))!.label;
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", selectedNodeId: file!, inspection: { kind: "file", nodeId: file! } })}`);
  const panel = page.locator("#detail-panel");
  // The section itself, since the file's authored words may link to the same document.
  const section = panel.locator(".detail-section").filter({ has: page.locator(".detail-label", { hasText: "Cited By" }) });
  await expect(section).toHaveCount(1);
  const link = section.locator(`a.bundled-doc-link[data-doc-path="${document}"]`);
  await expect(link).toHaveText(document);
  await link.click();
  await expect.poll(() => currentSnapshot(page).inspection).toEqual({ kind: "bundled-doc", path: document });
  await expect(panel).toContainText(document.slice(document.lastIndexOf("/") + 1));
});

import { expect, test, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";

/**
 * The Knowledge Sources panel says what the graph index says, and no more
 * (rewritten 2026-10-08 from the dead code sweep): the bundle's shape, the
 * files most used and most using, what nothing references, the related
 * documentation and the export. Each expectation here is computed again from
 * `explorer-data.json`, independently of the panel's own module, so that a
 * panel that counted wrong would fail.
 */

test.use({ viewport: { width: 1400, height: 1000 } });

/** The text the design audit reads on this panel. */
const TEXT = [
  "#view-sources h1",
  "#view-sources .sources-title",
  "#view-sources .sources-group-name",
  "#view-sources .sources-directory-name",
  "#view-sources .sources-row-label",
  "#view-sources .sources-row-value",
  "#view-sources .sources-file",
  "#view-sources .sources-path",
  "#view-sources .sources-count",
  "#view-sources .sources-directory",
  "#view-sources .sources-inline",
  "#view-sources .sources-note",
  "#view-sources .sources-panel-desc",
  "#view-sources .sources-empty",
  "#view-sources .sources-symbols code",
  "#view-sources .sources-kind",
  "#view-sources .bundled-tree-name",
  "#view-sources .export-label",
  "#view-sources .export-format-option span",
  "#view-sources .action-btn"
];

interface IndexFile { codePath: string; archetype?: string; inbound: string[]; outbound: string[]; symbols: { name: string; slug?: string }[]; edges: { to?: string; toSymbol?: string }[] }

/** What the index says, read again here. */
async function expectations(page: Page, base: string) {
  const data = await (await page.request.get(`${base}explorer-data.json`)).json() as { graph: { files: Record<string, IndexFile> } };
  const files = Object.values(data.graph.files).sort((a, b) => a.codePath.localeCompare(b.codePath));
  const unreferenced = files.filter(file => file.inbound.length === 0);
  const mostUsed = [...files].sort((a, b) => b.inbound.length - a.inbound.length || a.codePath.localeCompare(b.codePath))[0];
  const named = new Set<string>();
  for (const file of files) for (const edge of file.edges) if (edge.to === mostUsed.codePath && edge.toSymbol && edge.to !== file.codePath) named.add(edge.toSymbol);
  return { files, unreferenced, mostUsed, mostUsedSymbolsNamed: named.size };
}

async function open(page: Page, base: string): Promise<void> {
  await page.goto(`${base}?view=sources`);
  await page.waitForSelector("#sources-container h1", { timeout: 15_000 });
}

for (const [label, base] of [["this repository", "/"], ["the estate sample", "/samples/estate/"]] as const) {
  test(`${label}: the panel's counts are the index's, a named file goes to the detail panel, and no text collides`, async ({ page }) => {
    const expected = await expectations(page, base);
    await open(page, base);

    const bundle = page.locator('[data-section="bundle"]');
    await expect(bundle.locator('.sources-row[data-row="files"] .sources-row-value')).toHaveText(new RegExp(`^${expected.files.length.toLocaleString()}: `));

    const used = page.locator('[data-section="use"] ol').first().locator("li").first();
    await expect(used.locator(".sources-file")).toHaveText(expected.mostUsed.codePath.slice(expected.mostUsed.codePath.lastIndexOf("/") + 1));
    await expect(used.locator(".sources-count")).toHaveText(`used by ${expected.mostUsed.inbound.length.toLocaleString()} files, ${expected.mostUsedSymbolsNamed} of ${expected.mostUsed.symbols.length} symbol${expected.mostUsed.symbols.length === 1 ? "" : "s"}`);

    const unreferenced = page.locator('[data-section="unreferenced"]');
    await expect(unreferenced.locator("h2 .sources-count")).toHaveText(expected.unreferenced.length.toLocaleString());
    // The groups by archetype hold every unreferenced file between them, each a button.
    const groups = unreferenced.locator('[data-list="unreferenced"] details.sources-group[data-archetype]');
    let listed = 0;
    for (const group of await groups.all()) listed += await group.locator(".sources-file").count();
    expect(listed).toBe(expected.unreferenced.length);

    // A file's name puts it in the detail panel without leaving the panel.
    const firstGroup = groups.first();
    await firstGroup.locator("summary").click();
    const first = firstGroup.locator(".sources-file").first();
    const firstPath = await first.getAttribute("data-node-id");
    await first.click();
    await expect(page.locator("#context-name")).toHaveText(firstPath!);
    await expect(page.locator("#sources-container h1")).toBeVisible();

    // The words keep apart, with one group open.
    const boxes = await textBoxes(page, TEXT);
    expect(boxes.length).toBeGreaterThan(20);
    const overlaps = overlapsAmong(boxes);
    const cut = await truncations(page, TEXT);
    expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
  });

  test(`${label}: the panel's facts come out as JSON`, async ({ page }) => {
    const expected = await expectations(page, base);
    await open(page, base);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#download-facts-btn").click()]);
    expect(download.suggestedFilename()).toBe("knowledge-sources.json");
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const facts = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { shape: { files: number }; unreferenced: { path: string }[]; mostUsed: { path: string }[] };
    expect(facts.shape.files).toBe(expected.files.length);
    expect(facts.unreferenced.map(entry => entry.path)).toEqual(expected.unreferenced.map(file => file.codePath));
    expect(facts.mostUsed[0].path).toBe(expected.mostUsed.codePath);
  });
}

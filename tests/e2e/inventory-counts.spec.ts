import { expect, test, type Page } from "@playwright/test";

import type { HistorySequence } from "../../packages/engine/src/live-docs/history/format";
import { seek } from "../../packages/engine/src/live-docs/history/sequence";

/**
 * The inventory's totals say one number and say what it counts (the owner's decision of 2026-10-30): the sidebar's
 * line and Knowledge Sources give the same documented references, both the index's own count of edges between two
 * files of the scan, read again here from `explorer-data.json`; Knowledge Sources says its counts are of the whole
 * scan today; and while the 3D picture shows a moment of the history, the sidebar's line counts that moment, read
 * again here from the bundle's history file through the engine's `seek`, and returns to today when the history
 * closes.
 */

test.use({ viewport: { width: 1280, height: 800 } });

interface IndexEdge { kind: string; to?: string }
interface IndexFile { codePath: string; edges: IndexEdge[] }
interface Bundle { graph: { files: Record<string, IndexFile> }; history?: { file: string } }

/** The digits of a count as the page prints it, separators and all. */
const count = (text: string): number => Number(text.replace(/[^0-9]/g, ""));

/** The sidebar's line in its three parts; the third is absent at a moment of the history. */
async function statsLine(page: Page): Promise<{ text: string; files: number; references: number; outside?: number }> {
  const text = await page.locator("#stats-line").innerText();
  const match = /^([\d,.\s]+) files, ([\d,.\s]+) references(?:, ([\d,.\s]+) dependencies outside the scan)?$/.exec(text);
  expect(match, `the sidebar's line: ${text}`).not.toBeNull();
  return { text, files: count(match![1]), references: count(match![2]), ...(match![3] !== undefined ? { outside: count(match![3]) } : {}) };
}

for (const [label, base] of [["this repository", "/"], ["the estate sample", "/samples/estate/"]] as const) {
  test(`${label}: the sidebar and Knowledge Sources print the index's documented references, and the panel says what it counts`, async ({ page }) => {
    const data = await (await page.request.get(`${base}explorer-data.json`)).json() as Bundle;
    const files = Object.values(data.graph.files);
    const references = files.reduce((sum, file) => sum + file.edges.filter(edge => edge.to !== undefined && edge.to !== file.codePath && edge.to in data.graph.files).length, 0);
    // A dependency line is an import or a re-export; with no target, what it names lies outside the scan.
    const outside = files.reduce((sum, file) => sum + file.edges.filter(edge => (edge.kind === "import" || edge.kind === "re-export") && edge.to === undefined).length, 0);
    expect(references, `${label} has references to count`).toBeGreaterThan(0);

    await page.goto(`${base}?view=sources`);
    await page.waitForSelector("#sources-container h1", { timeout: 15_000 });
    const bundle = page.locator('[data-section="bundle"]');
    const panel = count(await bundle.locator('.sources-row[data-row="references"] .sources-row-value').innerText());
    const line = await statsLine(page);

    expect(panel).toBe(references);
    expect(line.references).toBe(panel);
    expect(line.files).toBe(files.length);
    expect(line.outside).toBe(outside);
    await expect(page.locator("#stats-line")).toHaveText(`${files.length.toLocaleString()} files, ${references.toLocaleString()} references, ${outside.toLocaleString()} dependencies outside the scan`);
    await expect(bundle.locator('.sources-row[data-row="scope"] .sources-row-value')).toHaveText("the whole scan today, unfiltered by Display");
  });
}

test("the history sample: the sidebar's line counts the moment the 3D picture shows, and today's again when the history closes", async ({ page }) => {
  const base = "/samples/history/";
  const data = await (await page.request.get(`${base}explorer-data.json`)).json() as Bundle;
  expect(data.history, "the sample carries a history").toBeDefined();
  const sequence = await (await page.request.get(`${base}${data.history!.file}`)).json() as HistorySequence;
  const step = 2;
  const shape = seek(sequence, step);
  const atStep = { files: shape.files.size, references: [...shape.edges.values()].reduce((sum, edges) => sum + edges, 0) };

  await page.goto(`${base}?view=local&mode=3d`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
  const today = await statsLine(page);
  expect(today.outside).toBeDefined();

  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator(".history-scrubber")).toBeVisible();
  const tick = (await page.locator(`.history-tick[data-step="${step}"]`).boundingBox())!;
  await page.mouse.click(tick.x + tick.width / 2, tick.y + tick.height / 2);
  await expect(page.locator(".history-track")).toHaveAttribute("aria-valuenow", String(step));

  // The moment's files and references; what lay outside the scan then is not known, so not said.
  await expect(page.locator("#stats-line")).toHaveText(`${atStep.files.toLocaleString()} files, ${atStep.references.toLocaleString()} references`);
  expect(atStep, "the step differs from today, so the line's change is seen").not.toEqual({ files: today.files, references: today.references });

  // Closed, the picture is today's, and so is the line.
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator(".history-scrubber")).toBeHidden();
  await expect(page.locator("#stats-line")).toHaveText(today.text);
});

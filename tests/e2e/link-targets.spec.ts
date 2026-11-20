import { expect, test } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { currentSnapshot } from "./search-bar";

/**
 * The Explorer opens what the engine counted. The link-targets sample (`tests/integration/fixtures/link-targets`)
 * links its one file's Purpose to `notes/plan (draft).md` by every form CommonMark reads for a target that holds
 * parentheses, and once into a folder named `(auth)`; the reader must open each, as the engine counted each among
 * the file's related documents. Its docstring holds a line the Live Doc writes behind a backslash, which the reader
 * shows as the line, as a markdown viewer does. Until 2026-11-19 the reader ended a target at its first `)`.
 */

interface Bundle {
  relatedDocLinks?: Array<{ sourceId: string; targetPath: string; direction: "cites" | "cited-by" }>;
}

const FILE = "src/plan.ts";
const SAMPLE = "/samples/link-targets/";
const at = (inspection: object): string => `${SAMPLE}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", selectedNodeId: FILE, inspection } as typeof DEFAULT_SNAPSHOT)}`;

test.use({ viewport: { width: 1400, height: 900 } });

test("a link whose target holds parentheses opens its document in the reader, written each way CommonMark reads it", async ({ page }) => {
  const bundle = (await (await page.request.get(`${SAMPLE}explorer-data.json`)).json()) as Bundle;
  const counted = (bundle.relatedDocLinks ?? []).filter(link => link.sourceId === FILE && link.direction === "cites").map(link => link.targetPath).sort();
  expect(counted, "the engine counts both documents the Purpose names").toEqual(["app/(auth)/notes.md", "notes/plan (draft).md"]);

  await page.goto(at({ kind: "file", nodeId: FILE }));
  const purpose = page.locator("#detail-panel .doc-authored").filter({ hasText: "Drafts the plan in" });
  const links = purpose.locator("a.bundled-doc-link");
  // Angle brackets, bare, encoded, escaped, a title in quotes, a title in parentheses; the route group; and a
  // reference whose definition stands in the Notes section, which the reader renders apart.
  await expect(links).toHaveText(["angle brackets", "bare", "encoded", "escaped", "with a title", "with a title in parentheses", "a route group", "by reference"]);
  const opened = await links.evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute("data-doc-path")));
  expect(opened).toEqual([...Array(6).fill("notes/plan (draft).md"), "app/(auth)/notes.md", "notes/plan (draft).md"]);
  // The definition is read, not shown.
  await expect(page.locator("#detail-panel")).not.toContainText("[plan]:");
  expect([...new Set(opened)].sort(), "the reader opens exactly what the engine counted").toEqual(counted);
  await expect(purpose.locator(".unavailable-link")).toHaveCount(0);
  await expect(purpose).not.toContainText(".md");

  await links.filter({ hasText: "escaped" }).click();
  await expect.poll(() => currentSnapshot(page).inspection).toEqual({ kind: "bundled-doc", path: "notes/plan (draft).md" });
  await expect(page.locator("#detail-panel")).toContainText("The plan, in draft");
});

test("the inspected symbol shows what the doc's reader reads: a docstring line written behind a backslash is its own markdown again", async ({ page }) => {
  await page.goto(at({ kind: "file", nodeId: FILE, symbol: "draftPlan" }));
  const symbol = page.locator("#detail-panel [data-reader-symbol=\"draftPlan\"]");
  // The docstring's own heading, which the Live Doc writes behind a backslash so that it is not read as a symbol's.
  await expect(symbol.locator("h4", { hasText: "notes" })).toHaveCount(1);
  await expect(symbol).toContainText("What the notes say, in a sentence.");
  await expect(symbol).not.toContainText("\\");
  await expect(symbol).not.toContainText("####");
});

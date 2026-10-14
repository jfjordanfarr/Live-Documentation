/**
 * Helpers for driving the search bar in browser specs: choosing a row by what it is, and an address that asks for a
 * path, the origin pinned and the destination named.
 */
import { expect, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { PathDestination } from "../../packages/explorer/src/client/types";
import { retainedKey } from "../../packages/explorer/src/client/views/retained-state";

export type SearchFieldName = "subject" | "destination";

/** The row wanted: a file by its path, a directory by its path, or a symbol of a file. */
export type WantedRow = { file: string } | { directory: string } | { file: string; symbol: string };

/** Click a field of the bar, type, and choose the row wanted among the results. */
export async function choose(page: Page, field: SearchFieldName, typed: string, wanted: WantedRow): Promise<void> {
  await page.click(`#search-${field}`);
  await page.keyboard.type(typed);
  await page.waitForSelector(`#search-${field}-results .search-row`);
  const index = await page.evaluate(({ field, wanted }) => {
    const rows = [...document.querySelectorAll<HTMLElement>(`#search-${field}-results .search-row`)];
    const text = (row: Element, cls: string): string | undefined => row.querySelector(`.${cls}`)?.textContent?.trim();
    if ("symbol" in wanted) {
      let inFile = false;
      for (const [i, row] of rows.entries()) {
        if (row.classList.contains("search-row--file")) inFile = text(row, "search-row-context") === wanted.file;
        else if (inFile && row.classList.contains("search-row--symbol") && text(row, "search-row-name") === wanted.symbol) return i;
      }
      return -1;
    }
    if ("directory" in wanted) {
      return rows.findIndex(row => row.classList.contains("search-row--directory") && text(row, "search-row-name") === (wanted.directory || "Scan root"));
    }
    return rows.findIndex(row => row.classList.contains("search-row--file") && text(row, "search-row-context") === wanted.file);
  }, { field, wanted });
  expect(index, `${JSON.stringify(wanted)} among the rows for "${typed}"`).toBeGreaterThanOrEqual(0);
  await page.click(`#search-${field}-results .search-row[data-index="${index}"]`);
}

/** An address that asks for a path: the origin pinned as a whole file and newest, the destination named, a file selected. */
export function pathAddress(base: string, origin: string, destination: PathDestination, selected: string | null = origin, extra: Partial<UrlStateSnapshot> = {}): string {
  const pin = { nodeId: origin, symbol: "*" };
  const snapshot: UrlStateSnapshot = {
    ...DEFAULT_SNAPSHOT, view: "map", selectedNodeId: selected, pinSet: { entries: [pin] },
    retentionOrder: [retainedKey({ kind: "pin", pin })], destination, ...extra
  };
  return `${base}?s=${compressSnapshot(snapshot)}`;
}

/** The exploration the page's address carries now. */
export const currentSnapshot = (page: Page): UrlStateSnapshot => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);

/** The key of the newest retained item in a snapshot, or null. */
export function newestKey(snapshot: UrlStateSnapshot): string | null {
  return snapshot.retentionOrder?.at(-1) ?? null;
}

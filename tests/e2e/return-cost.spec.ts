import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { DEFAULT_RETURN_COST } from "../../packages/explorer/src/client/views/localView/cycle-order";
import { AT_READING_SIZE, localMapSettled } from "./still-picture";

/**
 * A cycle's other orders as trials of the continuing search (2026-11-16). The first draw stands every cycle in the greedy
 * order; the search then tries each other order on the page's own measurements, priced with the wires' horizontal length
 * and Tuning's Return Cost for every returning reference, and moves to one only when it pays for its move. The 3D
 * button's count and the cards' feet follow the move. `adapters/manifest.ts` opened alone holds a cycle with the
 * adapters around it: the greedy order draws one returning connection; returning fewer stands every adapter in one
 * column right of the manifest and draws none. On 2026-11-16 the search adopted that order from a Return Cost of about
 * 1,175 px of wire (measured in the lab on real card sizes); since the manifest and its adapters came to read their
 * source through `tooling/sourceText.ts` (2026-11-20) it is the cheaper picture at any Return Cost, so the first two
 * cases read the move and the first draw there, and the cost itself is read on a fixed program (the last case).
 */
const MANIFEST = "packages/engine/src/live-docs/adapters/manifest.ts";

const link = (returnCost?: number, node = MANIFEST, site = "/"): string => `${site}?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: node,
  ...(returnCost === undefined ? null : { layout: { localMap: { returnCost } } })
})}`;

/** Opens the address, the manifest's by default, with the search seeded as asked, and records every count of returning connections the overlay shows. */
async function open(page: Page, localMap: Record<string, number>, address = link()): Promise<void> {
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, ...localMap } } }) });
  await page.addInitScript(() => {
    const counts: number[] = [];
    (window as unknown as { backwardCounts: number[] }).backwardCounts = counts;
    new MutationObserver(records => {
      for (const record of records) {
        const value = (record.target as HTMLElement).dataset.backwardConnections;
        if (value !== undefined && counts[counts.length - 1] !== Number(value)) counts.push(Number(value));
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-backward-connections"] });
  });
  await page.goto(address);
  await page.waitForSelector("#map-container .local-placed", { timeout: 30_000 });
  await localMapSettled(page, 60_000);
}

/** The counts the overlay showed, what the search did with the cycle, and the cards' feet as they stand. */
const read = (page: Page) => page.evaluate(() => {
  const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;
  const feet = [...document.querySelectorAll<HTMLElement>("#map-container .node-card .local-back-references")]
    .reduce((sum, note) => sum + Number(/^\d+/u.exec(note.textContent ?? "")?.[0] ?? 0), 0);
  return {
    counts: (window as unknown as { backwardCounts: number[] }).backwardCounts,
    tried: Number(root.dataset.searchCycleTried ?? 0), adopted: Number(root.dataset.searchCycleAdopted ?? 0), feet, endpoints: root.dataset.searchEndpoints
  };
});

test("with the search on, a picture with a cycle arrives in the greedy order, moves once to the cheaper order, and the cue and the feet follow", async ({ page }) => {
  test.setTimeout(90_000);
  await open(page, { searchStarts: 4, searchPatience: 4, moveMs: 0 });
  const searched = await read(page);
  expect(searched.tried, "the cycle's other order was tried").toBeGreaterThanOrEqual(1);
  expect(searched.adopted, "and adopted once").toBe(1);
  expect(searched.endpoints, "the search measured the returning references' endpoints when it first needed them").toBe("every");
  expect(searched.counts, "the cue counted the greedy order's return, then none").toEqual([1, 0]);
  expect(searched.feet, "no card's foot tells a return any more").toBe(0);
  await expect(page.getByRole("button", { name: "3D", exact: true }), "the 3D button's cue is out").not.toHaveAttribute("data-backward", /./u);
});

test("with the search off, the picture stays as first drawn: the greedy order, its return counted and told at its cards", async ({ page }) => {
  await open(page, { searchStarts: 0 });
  const first = await read(page);
  expect(first.tried).toBe(0);
  expect(first.endpoints, "the first draw measured only the endpoints of the wires it draws").toBe("drawn");
  expect(first.counts).toEqual([1]);
  expect(first.feet, "the return is told at both its cards").toBe(2);
  await expect(page.getByRole("button", { name: "3D", exact: true })).toHaveAttribute("data-backward", "some");
});

/**
 * The Rosetta C# program's `Models/ModelFactory.cs` and `Models/Record.cs` use each other: the greedy order draws two
 * returning references, and standing the pair the other way round returns one at the cost of longer wires. On 2026-11-20
 * the page priced that order 1,786 px of wire dearer than the shown picture at no Return Cost, so the search adopts it
 * from a Return Cost of about 1,800 px and not below: kept at 500, adopted at 4,000, both on the lever's range and far
 * from the line, and on a fixed program that this repository's growth does not move.
 */
const MODEL_FACTORY = "src/Models/ModelFactory.cs";
const ROSETTA_CSHARP = "/samples/rosetta/csharp/";

test("a link that names a Return Cost reopens the picture the search makes at it, and Tuning shows the cost", async ({ page, context }) => {
  test.setTimeout(90_000);
  const searching = { searchStarts: 4, searchPatience: 4, moveMs: 0 };
  await open(page, searching, link(500, MODEL_FACTORY, ROSETTA_CSHARP));
  const cheap = await read(page);
  expect(cheap.tried, "the pair's other order was tried").toBe(1);
  expect(cheap.counts, "at 500 px a return is not worth the wire the other order spends").toEqual([2]);
  await expect(page.locator("#tuning-return-cost")).toHaveValue("500");
  // The same picture at a dearer return, in a page of its own: the search moves, and the cue counts one return.
  const dear = await context.newPage();
  await open(dear, searching, link(4000, MODEL_FACTORY, ROSETTA_CSHARP));
  expect((await read(dear)).counts, "at 4,000 px a return is worth the wire").toEqual([2, 1]);
  await expect(dear.locator("#tuning-return-cost")).toHaveValue("4000");
  await dear.close();
  await page.goto(link());
  await page.waitForSelector("#map-container .local-placed", { timeout: 30_000 });
  await localMapSettled(page, 60_000);
  await expect(page.locator("#tuning-return-cost")).toHaveValue(String(DEFAULT_RETURN_COST));
});

import { expect, test, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { LOCAL_MAP, localMapSettled, localRetainUrl } from "./still-picture";

/**
 * Directories open and close inside the Local Map (the owner's grammar,
 * 2026-10-08). A directory has three states on one scale: closed, a box
 * without symbols standing in for everything under it; encasing, the
 * membrane around the files party to the wires, the rest counted on its
 * label; open, every file inside as a compact card and every subdirectory as
 * a closed box. The name opens, the X closes as far as the pins allow, a
 * closed box opens in place, and no wire ever reaches a closed box.
 */

const ENGINE = "packages/engine/src";
const LIVE_DOCS = `${ENGINE}/live-docs`;

test.use({ viewport: { width: 1800, height: 1100 } });

const box = (page: Page, directory: string) => page.locator(`#map-container .local-directory-closed[data-directory="${directory}"]`);
const label = (page: Page, directory: string) => page.locator(`#map-container .local-directory-label[data-directory="${directory}"]`);
const cards = (page: Page) => page.locator("#map-container .node-card");
const wires = (page: Page) => page.locator("#map-connections .connection-path:not(.bundle-run)");

async function settled(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(600);
}

/** Every text box of the Local Map, checked for collisions and cut-offs as the design audit does. */
async function expectNoTextFault(page: Page): Promise<void> {
  const boxes = await textBoxes(page, LOCAL_MAP.text);
  expect(boxes.length).toBeGreaterThan(4);
  const overlaps = overlapsAmong(boxes);
  const cut = await truncations(page, LOCAL_MAP.text);
  expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
}

/** "N files, M directories" for a directory, as the Explorer counts it, from the bundle's data by this file's own reading. */
async function expectedCounts(page: Page, directory: string): Promise<string> {
  const data = await (await page.request.get("/explorer-data.json")).json() as { graph: { files: Record<string, { codePath: string; archetype?: string }> } };
  const under = Object.values(data.graph.files)
    .filter(file => (file.archetype ?? "").toLowerCase() !== "asset" && file.codePath.startsWith(`${directory}/`))
    .map(file => file.codePath.slice(directory.length + 1));
  const subdirectories = new Set(under.filter(path => path.includes("/")).map(path => path.slice(0, path.indexOf("/"))));
  return `${under.length} files, ${subdirectories.size} directories`;
}

test("a directory entered with nothing pinned is a grid of compact cards and closed boxes, with no wire, and its address round-trips", async ({ page }) => {
  await page.goto(`/?view=local&dir=${ENGINE}`);
  await settled(page);
  // packages/engine/src holds only directories: four closed boxes, each named and counted, inside one membrane that says it is open.
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(4);
  await expect(box(page, LIVE_DOCS).locator(".local-directory-closed__name")).toHaveText("live-docs");
  // A box counts the files under it at any depth and its immediate subdirectories, over the files the picture shows: tests
  // in, assets out by default. The expectation is read from the bundle's data, so that the repository may grow a folder.
  await expect(box(page, LIVE_DOCS).locator(".local-directory-closed__count")).toHaveText(await expectedCounts(page, LIVE_DOCS));
  await expect(cards(page)).toHaveCount(0);
  await expect(wires(page)).toHaveCount(0);
  await expect(label(page, ENGINE).locator(".local-directory-close")).toBeVisible();
  await expect(page.locator("#context-name")).toHaveText(ENGINE);
  await expect(page.locator("#map-container .node-card.local-focus")).toHaveCount(0);
  // The whole picture is in the frame: nothing to focus on, so the fit keeps it visible.
  const frame = (await page.locator("#view-map").boundingBox())!;
  for (const b of await page.locator("#map-container .local-directory-closed").all()) {
    const r = (await b.boundingBox())!;
    expect(r.x).toBeGreaterThanOrEqual(frame.x);
    expect(r.x + r.width).toBeLessThanOrEqual(frame.x + frame.width);
    expect(r.y + r.height).toBeLessThanOrEqual(frame.y + frame.height);
  }
  await expectNoTextFault(page);
  // Opening a box writes the opened set into the address, and the address reopens the same picture.
  await box(page, `${ENGINE}/config`).click();
  await settled(page);
  await expect(label(page, `${ENGINE}/config`).locator(".local-directory-close")).toBeVisible();
  await expect(cards(page)).toHaveCount(2);
  expect(page.url()).toContain("?s=");
  await page.reload();
  await settled(page);
  await expect(label(page, `${ENGINE}/config`).locator(".local-directory-close")).toBeVisible();
  await expect(cards(page)).toHaveCount(2);
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(3);
});

test("a closed box opens in place, the membrane growing from the box while the picture moves, and its X closes it back to a box", async ({ page }) => {
  await page.goto(`/?view=local&dir=${ENGINE}`);
  await settled(page);
  const before = (await box(page, LIVE_DOCS).boundingBox())!;
  const moveStarted = page.waitForFunction(() => document.querySelector<HTMLElement>("#map-container .local-placed")?.dataset.moving === "true", undefined, { timeout: 5_000 });
  await box(page, LIVE_DOCS).click();
  await moveStarted;
  // Early in the move the new membrane stands where the box stood, no wider than the box was, and grows from there.
  const early = (await page.locator(`#map-container .local-directory-band[data-directory="${LIVE_DOCS}"]`).boundingBox())!;
  expect(Math.abs(early.x - before.x)).toBeLessThan(40);
  expect(Math.abs(early.y - before.y)).toBeLessThan(40);
  await settled(page);
  const after = (await page.locator(`#map-container .local-directory-band[data-directory="${LIVE_DOCS}"]`).boundingBox())!;
  expect(after.width).toBeGreaterThan(early.width);
  expect(after.height).toBeGreaterThan(early.height);
  // Open: its files compact, its subdirectories closed boxes, the parent's other boxes still boxes, and still no wire.
  await expect(box(page, LIVE_DOCS)).toHaveCount(0);
  await expect(box(page, `${LIVE_DOCS}/adapters`)).toBeVisible();
  await expect(box(page, `${LIVE_DOCS}/heuristics`)).toBeVisible();
  await expect(box(page, `${ENGINE}/config`)).toBeVisible();
  const compact = await cards(page).count();
  expect(compact).toBeGreaterThan(20);
  await expect(page.locator("#map-container .node-card .symbol-row:not(.branch-symbol-hidden)")).toHaveCount(0);
  await expect(wires(page)).toHaveCount(0);
  // A compact card counts its collapsed public symbols on its reveal; a file with none, a test file, has no reveal, since the Internals row is not a symbol.
  const graphCard = page.locator(`#map-container .node-card[data-id="${LIVE_DOCS}/graph.ts"]`);
  const publicRows = await graphCard.locator(".symbol-row:not(.internals-row)").count();
  expect(publicRows).toBeGreaterThan(0);
  await expect(graphCard.getByRole("button", { name: /^\+\d+ symbols$/ })).toHaveText(`+${publicRows} symbols`);
  const testCard = page.locator(`#map-container .node-card[data-id="${LIVE_DOCS}/graph.test.ts"]`);
  await expect(testCard).toHaveCount(1);
  await expect(testCard.locator(".symbol-row:not(.internals-row)")).toHaveCount(0);
  await expect(testCard.getByRole("button", { name: /^\+\d+ symbols$/ })).toHaveCount(0);
  // The label the person clicked through to stands where the box was: what was acted on keeps its place.
  const opened = (await label(page, LIVE_DOCS).boundingBox())!;
  expect(Math.abs(opened.x - before.x)).toBeLessThan(40);
  expect(Math.abs(opened.y - before.y)).toBeLessThan(40);
  await label(page, LIVE_DOCS).locator(".local-directory-close").click();
  await settled(page);
  await expect(box(page, LIVE_DOCS)).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(4);
});

test("an encasing membrane counts what it hides, its name opens it around the pinned files, and no wire reaches a closed box", async ({ page }) => {
  const graph = `${LIVE_DOCS}/graph.ts`;
  const builder = "packages/explorer/src/shared/staticBuilder.ts";
  await page.goto(localRetainUrl("/", [graph, builder]));
  await settled(page);
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  const drawn = await wires(page).count();
  expect(drawn).toBeGreaterThan(0);
  // The live-docs membrane encases graph.ts and whatever its pins reach; the rest of its files and its two subdirectories are counted, and no X shows.
  const more = label(page, LIVE_DOCS).locator(".local-directory-more");
  await expect(more).toHaveText(/^\+\d+ files, 2 directories$/);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toHaveCount(0);
  const partyCards = await cards(page).count();
  // The map does not scroll and the encased picture may be wider than the frame, with its label under the sidebar, so
  // the click is dispatched to the name rather than aimed at the frame, as the member's and the X's are below.
  await label(page, LIVE_DOCS).locator(".local-directory-name").evaluate(name => (name as HTMLElement).click());
  await settled(page);
  // Open: every file of live-docs is drawn, the ones not party compact and unwired, and its subdirectories are boxes; the wires are the same.
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeVisible();
  await expect(more).toHaveCount(0);
  expect(await cards(page).count()).toBeGreaterThan(partyCards);
  await expect(page.locator("#map-container .node-card.branch-member .symbol-row:not(.branch-symbol-hidden)")).toHaveCount(0);
  await expect(wires(page)).toHaveCount(drawn);
  await expect(box(page, `${LIVE_DOCS}/adapters`)).toBeVisible();
  await expect(box(page, `${LIVE_DOCS}/heuristics`)).toBeVisible();
  // No wire's end lies inside a closed box.
  const boxes = await page.locator("#map-container .local-directory-closed").evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON() as { left: number; top: number; right: number; bottom: number }));
  const ends = await page.locator("#map-connections .connection-path:not(.bundle-run)").evaluateAll(paths => paths.flatMap(path => {
    const svg = path.closest("svg")!;
    const origin = svg.getBoundingClientRect();
    const numbers = (path.getAttribute("d") ?? "").match(/-?\d+(?:\.\d+)?/gu)?.map(Number) ?? [];
    if (numbers.length < 4) return [];
    const scale = origin.width / Math.max(1, svg.clientWidth || origin.width);
    return [{ x: origin.left + numbers[0] * scale, y: origin.top + numbers[1] * scale }, { x: origin.left + numbers[numbers.length - 2] * scale, y: origin.top + numbers[numbers.length - 1] * scale }];
  }));
  expect(ends.length).toBeGreaterThan(0);
  for (const end of ends) for (const b of boxes) {
    expect(end.x >= b.left && end.x <= b.right && end.y >= b.top && end.y <= b.bottom, "a wire ends inside a closed box").toBe(false);
  }
  await expectNoTextFault(page);
  // A compact member retains on a click, as any card does, and its wires appear; the directory stays open. The map does
  // not scroll and the opened picture is wide, so the click is dispatched to the title rather than aimed at the frame.
  const member = page.locator("#map-container .node-card.branch-member").first();
  const memberId = await member.getAttribute("data-id");
  await member.locator(".node-title").evaluate(title => (title as HTMLElement).click());
  await settled(page);
  await expect(page.locator(`#map-container .node-card[data-id="${memberId}"]`)).not.toHaveClass(/branch-member/);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeVisible();
  // The X steps live-docs down to encasing: the member just retained stays, the unwired ones go, the boxes go.
  await label(page, LIVE_DOCS).locator(".local-directory-close").evaluate(close => (close as HTMLElement).click());
  await settled(page);
  await expect(page.locator(`#map-container .node-card[data-id="${memberId}"]`)).toBeVisible();
  await expect(page.locator("#map-container .node-card.branch-member")).toHaveCount(0);
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(0);
  await expect(more).toBeVisible();
});

test("keyboard release preserves an independently opened child and the enclosure required by a pinned file", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const graph = `${LIVE_DOCS}/graph.ts`;
  await page.goto(localRetainUrl("/", [graph]));
  await settled(page);
  await label(page, LIVE_DOCS).locator(".local-directory-name").focus();
  await page.keyboard.press("Enter");
  await settled(page);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeVisible();
  await box(page, `${LIVE_DOCS}/adapters`).focus();
  await page.keyboard.press("Space");
  await settled(page);
  await expect(label(page, `${LIVE_DOCS}/adapters`).locator(".local-directory-close")).toBeVisible();
  // Release only this opening. The independently opened child and graph.ts still require their enclosures.
  await label(page, LIVE_DOCS).locator(".local-directory-close").focus();
  await page.keyboard.press("Enter");
  await settled(page);
  await expect(label(page, `${LIVE_DOCS}/adapters`)).toHaveCount(1);
  await expect(label(page, `${LIVE_DOCS}/adapters`).locator(".local-directory-close")).toBeVisible();
  await expect(box(page, `${LIVE_DOCS}/adapters`)).toHaveCount(0);
  await expect(label(page, LIVE_DOCS)).toBeVisible();
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toHaveCount(0);
  await expect(page.locator(`#map-container .node-card[data-id="${graph}"]`)).toBeVisible();
});

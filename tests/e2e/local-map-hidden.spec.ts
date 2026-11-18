import { expect, test, type Page } from "@playwright/test";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { engineActivity, observeGraph, renderedNodes } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";
import { localMapSettled, localRetainUrl } from "./still-picture";

/**
 * The Local Map's work stays with the view (the owner's choice, 2026-10-16).
 * The continuing search runs only while the map is the view shown and the page
 * visible; a render asked for while another view is shown is owed, and runs
 * when the map is shown again; a return to an unchanged picture draws nothing
 * and lets the search go on from where it paused. Before, the search went on
 * behind Knowledge Sources and was begun anew on return, and the return drew
 * the unchanged picture again (measured 2026-10-16: 240 ms, and the search from
 * seed one).
 */

const FILES = [
  "packages/engine/src/live-docs/graph.ts",
  "packages/engine/src/live-docs/document.ts",
  "packages/engine/src/live-docs/graphFiles.ts",
  "packages/explorer/src/shared/staticExplorerData.ts",
  "packages/explorer/src/shared/staticBuilder.ts"
];

test.use({ viewport: { width: 1600, height: 1000 } });

/** `tried` counts every trial of the search, its seeds, its boundary joins and its cycles' orders: a pause must stop them all (2026-11-18; before, the seeds alone). */
interface Reading { status: string; tried: number; next: number; marked: number; cards: number }

/** Opens the retained scope with a long search, so that a view is switched while it runs. */
async function open(page: Page): Promise<void> {
  await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { orderStarts: 0, searchStarts: 80, searchPatience: 80, moveMs: 0 } } }) });
  await page.goto(localRetainUrl("/", FILES));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
}

const read = (page: Page): Promise<Reading> => page.evaluate(() => {
  const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;
  const cards = [...document.querySelectorAll<HTMLElement>("#map-container .node-card")];
  return { status: root.dataset.searchStatus ?? "", tried: Number(root.dataset.searchTried || 0) + Number(root.dataset.searchAlignmentTried || 0) + Number(root.dataset.searchCycleTried || 0), next: Number(root.dataset.searchNext), marked: cards.filter(card => card.dataset.mark === "kept").length, cards: cards.length };
});

/** Marks every card, so that a card drawn anew is told from one kept. */
const mark = (page: Page): Promise<void> => page.evaluate(() => { document.querySelectorAll<HTMLElement>("#map-container .node-card").forEach(card => { card.dataset.mark = "kept"; }); });

const show = async (page: Page, view: "sources" | "world" | "map"): Promise<void> => { await page.click(`.nav-item[data-view="${view}"]`); };

test("the search pauses while another view is shown, and a return to the unchanged picture keeps it and resumes the search", { tag: "@alone" }, async ({ page }) => {
  // The search runs to its end after the return: 23 to 29 seconds on one worker (2026-10-19), 41 to 42 on 2026-11-18 (80
  // seeds and 121 boundary joins), so the case runs alone (`@alone`); the half minute is not its measure.
  test.setTimeout(60_000);
  await open(page);
  const started = await read(page);
  expect(started.status, "the search is still running when the view is switched").toBe("running");
  await mark(page);
  await show(page, "sources");
  await expect(page.locator("#view-sources")).toHaveClass(/active/);
  const away = await read(page);
  await page.waitForTimeout(800);
  const later = await read(page);
  expect(later.tried, "no start is tried while the map is not shown").toBe(away.tried);
  expect(later.status).toBe("running");

  await show(page, "map");
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  const back = await read(page);
  expect(back.marked, "the picture is the one that stood before: every card kept its element").toBe(back.cards);
  expect(back.next, "the search goes on from the seed after the last tried, not from the first").toBeGreaterThanOrEqual(away.next);
  // The existing 60-second test budget covers the boundary-alignment trials that continue after all 80 seeds.
  await localMapSettled(page, 45_000);
  const done = await read(page);
  expect(done.tried, "the search tried more starts after the return").toBeGreaterThan(later.tried);
  expect(done.marked, "the search's adoptions move the cards without drawing them anew").toBe(done.cards);
});

test("a change made while another view is shown is drawn when the map is shown again", async ({ page }) => {
  await open(page);
  await mark(page);
  await show(page, "sources");
  await expect(page.locator("#view-sources")).toHaveClass(/active/);
  // The tests filter is a picture input: the map is told, and owes the render until it is shown.
  await page.click("#filter-toggle-tests");
  await page.waitForTimeout(300);
  expect((await read(page)).marked, "nothing is drawn while the map is hidden").toBeGreaterThan(0);
  await show(page, "map");
  await expect(page.locator("#view-map")).toHaveClass(/active/);
  const back = await read(page);
  expect(back.marked, "the owed render drew the cards anew").toBe(0);
  expect(back.cards).toBeGreaterThan(0);
});

test("the search pauses while the page is hidden and resumes when it is visible again", async ({ page }) => {
  // The case asks that starts are tried again, which is its promise. Until 2026-11-18 it waited for the search's end, 19 to
  // 25 s when written and 41 since the boundary joins (121 trials on this picture whatever the seeds), under a 45 s wait.
  await open(page);
  expect((await read(page)).status).toBe("running");
  const setVisibility = (state: "hidden" | "visible"): Promise<void> => page.evaluate(value => {
    Object.defineProperty(document, "visibilityState", { value, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
  await setVisibility("hidden");
  await page.waitForTimeout(100);
  const hidden = await read(page);
  await page.waitForTimeout(600);
  const stillHidden = await read(page);
  expect(stillHidden.tried, "no start is tried while the page is hidden").toBe(hidden.tried);
  await setVisibility("visible");
  const tried = (): Promise<number> => read(page).then(reading => reading.tried);
  await expect.poll(tried, { message: "the search went on once the page was visible", timeout: 15_000 }).toBeGreaterThan(hidden.tried);
});

test("pinning from the reader in Knowledge Sources keeps hidden 3D paused and appears when the map returns", async ({ page }) => {
  const subject = "Portal/Services/GatewayClient.cs";
  await observeGraph(page);
  await page.goto(`/samples/estate/?view=local&mode=3d&node=${encodeURIComponent(subject)}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const nodeIds = (await renderedNodes(page)).map(node => node.id).sort();
  const focus = page.locator(".force-graph-focus");
  await expect(focus).toHaveAttribute("data-node-id", subject);
  await focus.focus();
  await page.getByRole("button", { name: "More actions for GatewayClient.cs", exact: true }).click();
  await page.getByRole("menuitem", { name: "Inspect GatewayClient.cs", exact: true }).click();
  await expect(page.locator("#detail-panel.visible")).toContainText(subject);
  await show(page, "sources");
  await expect(page.locator("#view-sources")).toHaveClass(/active/);
  expect(currentSnapshot(page)).toMatchObject({ view: "sources", perspective: "3d", pinSet: { entries: [] } });

  // Let a frame already queued when the view changed finish, then establish a paused baseline.
  await page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
  const paused = await engineActivity(page);
  expect(paused.frames, "the observation saw the real graph render before it was hidden").toBeGreaterThan(0);
  await page.waitForTimeout(250);
  expect((await engineActivity(page)).frames, "the hidden renderer is already paused").toBe(paused.frames);

  await page.locator("#detail-panel").getByRole("button", { name: "Pin file", exact: true }).click();
  const pins = { entries: [{ nodeId: subject, symbol: "*" }] };
  expect(currentSnapshot(page)).toMatchObject({ view: "sources", perspective: "3d", selectedNodeId: subject, pinSet: pins });
  await page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
  const afterPin = await engineActivity(page);
  await page.waitForTimeout(400);
  expect((await engineActivity(page)).frames, "reader retention must not resume hidden WebGL rendering").toBe(afterPin.frames);
  expect(afterPin.frames, "the hidden picture needs no render for the pin").toBe(paused.frames);

  await show(page, "map");
  await expect(page.locator("#view-graph")).toHaveClass(/active/);
  await expect.poll(async () => (await engineActivity(page)).frames).toBeGreaterThan(afterPin.frames);
  expect(currentSnapshot(page)).toMatchObject({ view: "map", perspective: "3d", selectedNodeId: subject, pinSet: pins });
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === subject)?.opacity ?? 0).toBeGreaterThan(.7);
  // The pinned subject's picture is its own two hops; the frontier's spheres are present and dimmed (.3), the rest full (2026-10-31).
  await expect.poll(async () => (await renderedNodes(page)).filter(node => node.opacity < .35).length,
    "returning draws the pin's attention while other native nodes remain present").toBeGreaterThan(0);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual(nodeIds);
});

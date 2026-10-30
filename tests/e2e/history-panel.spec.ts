import { expect, test, type Page } from "@playwright/test";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { choose, pathAddress } from "./search-bar";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

/**
 * The history's step panel and what the map says at a moment (2026-10-30): the panel as tall as what it says, hidden
 * and shown again while the scrubber stays, the absence of a pinned thing said where the person looks, and a path, its
 * reach and its report asked over the moment's wires rather than today's. Held over
 * the scripted repository of the history command's integration test (`tests/integration/live-docs/scripted-repository.ts`),
 * served as `samples/history/`; its commits are read from the bundle's own history file.
 */

interface Commit { id: string; subject: string; date: string }
interface Sequence { base: { commit: Commit }; steps: Array<{ commit: Commit }> }

const BASE = "/samples/history/";

/** The bundle's commits, oldest first, read from its history file. */
async function commitsOf(page: Page): Promise<Commit[]> {
  const data = await (await page.request.get(`${BASE}explorer-data.json`)).json() as { history?: { file: string } };
  expect(data.history, `${BASE} carries a history`).toBeDefined();
  const sequence = await (await page.request.get(`${BASE}${data.history!.file}`)).json() as Sequence;
  return [sequence.base.commit, ...sequence.steps.map(step => step.commit)];
}

/** The 3D structure layout at a commit, or today when none is named. */
const entry = (extra: Partial<typeof DEFAULT_SNAPSHOT> = {}): string => `${BASE}?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT,
  perspective: "3d",
  spatialLayout: "structure",
  filters: { showTests: true, showAssets: false },
  layout: { forceGraph: { updateEnergy: 0 } },
  ...extra
})}`;

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
}

const panel = (page: Page) => page.locator(".history-step-panel");
const track = (page: Page) => page.locator(".history-track");

/** The panel's box against its content: its height, the content's scroll height and its borders, and the scrubber's top. */
async function panelBox(page: Page): Promise<{ height: number; client: number; scroll: number; borders: number; bottom: number; scrubberTop: number }> {
  return page.locator(".history-step-panel").evaluate(element => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      height: box.height,
      client: element.clientHeight,
      scroll: element.scrollHeight,
      borders: parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth),
      bottom: box.bottom,
      scrubberTop: document.querySelector(".history-scrubber")!.getBoundingClientRect().top
    };
  });
}

for (const viewport of [{ width: 1400, height: 900 }, { width: 1280, height: 800 }]) {
  test(`at ${viewport.width}x${viewport.height} the step panel is as tall as what the step says`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const commits = await commitsOf(page);
    // Step 5 resizes one file: one group of one line.
    await page.goto(entry({ commit: commits[5].id }));
    await settled(page);
    await expect(panel(page).locator("h2")).toHaveText(commits[5].subject);
    const box = await panelBox(page);
    expect(box.height).toBeLessThan(viewport.height / 2);
    expect(box.scroll).toBe(box.client);
    expect(box.height).toBeCloseTo(box.scroll + box.borders, 0);
    expect(box.bottom).toBeLessThan(box.scrubberTop);
  });
}

test("a step longer than the room scrolls inside a panel that ends above the scrubber", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 420 });
  const commits = await commitsOf(page);
  // Step 3 says the most: a file created, one deleted, wires added and removed, a document linked.
  await page.goto(entry({ commit: commits[3].id }));
  await settled(page);
  await expect(panel(page).locator("h2")).toHaveText(commits[3].subject);
  const box = await panelBox(page);
  expect(box.scroll).toBeGreaterThan(box.client);
  // The room between the panel and the scrubber is the gap the scrubber asks for, ten pixels.
  expect(box.scrubberTop - box.bottom).toBeCloseTo(10, 0);
});

test("the panel says Created and Deleted, never Born and Dead", async ({ page }) => {
  const commits = await commitsOf(page);
  // Step 3 rewrites the big helper below git's threshold: huge.ts created, big.ts deleted.
  await page.goto(entry({ commit: commits[3].id }));
  await settled(page);
  const titles = panel(page).locator("summary > span:first-child");
  await expect(titles.filter({ hasText: /^Created$/u })).toHaveCount(1);
  await expect(titles.filter({ hasText: /^Deleted$/u })).toHaveCount(1);
  await expect(panel(page)).not.toContainText(/\b(Born|Dead)\b/u);
});

test("the panel hides by its own button and comes back by the scrubber's toggle, the scrubber staying, and an opened history shows it again", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(entry());
  await settled(page);
  await page.getByRole("button", { name: "History", exact: true }).click();
  const scrubber = page.locator(".history-scrubber");
  const toggle = scrubber.getByRole("button", { name: "Step details", exact: true });
  const hide = panel(page).getByRole("button", { name: "Hide step details", exact: true });
  await expect(panel(page)).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAttribute("title", "Step details");
  await expect(hide).toHaveAttribute("title", "Hide step details");

  // The panel's button: the panel goes, the scrubber stays, the toggle unpressed and holding the focus.
  await hide.click();
  await expect(panel(page)).toBeHidden();
  await expect(scrubber).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toBeFocused();

  // A step changed with the panel hidden keeps it hidden.
  await track(page).focus();
  await page.keyboard.press("Home");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await settled(page);
  await expect(panel(page)).toBeHidden();

  // The toggle by the keyboard brings it back, drawn for the step now shown.
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(panel(page)).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(panel(page).locator(".history-step-note")).toHaveText("The beginning of what is known: 8 files and 8 wires.");

  // And hides it again; the panel's own button by the keyboard too.
  await page.keyboard.press("Space");
  await expect(panel(page)).toBeHidden();
  await page.keyboard.press("Space");
  await expect(panel(page)).toBeVisible();
  await hide.focus();
  await page.keyboard.press("Enter");
  await expect(panel(page)).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  // Closed and opened again, the history shows its panel.
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(scrubber).toBeHidden();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(scrubber).toBeVisible();
  await expect(panel(page)).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

/** A path from a pinned file of today to another, asked by the address, in the 3D structure layout at a commit or today. */
const pathEntry = (origin: string, destination: string, commit: string | null = null): string => pathAddress(BASE, origin, { kind: "file", nodeId: destination }, origin, {
  perspective: "3d",
  spatialLayout: "structure",
  filters: { showTests: true, showAssets: false },
  layout: { forceGraph: { updateEnergy: 0 } },
  commit
});

const status = (page: Page) => page.locator("#pathfind-status");
const hops = (page: Page) => page.locator("#pathfind-path .pathfind-path-hop-name");

test("a file pinned today and not yet created at a commit is said so on its search chip, in the path report and in the reader", async ({ page }) => {
  const commits = await commitsOf(page);
  const moment = `${commits[0].date.slice(0, 10)}, commit ${commits[0].id.slice(0, 8)}`;
  await page.goto(pathEntry("lib/huge.ts", "tests/main.test.ts"));
  await settled(page);
  // Today: the path from the huge helper through the main file to its test, and nothing said of a moment.
  await expect(status(page)).toHaveText("Path found: 3 files");
  await expect(status(page).locator(".pathfind-at")).toHaveCount(0);
  await expect(page.locator("#search-subject-absence")).toBeHidden();
  // The reader opened on the helper from the path's strip.
  await page.getByRole("button", { name: "Inspect path file 1 of 3: lib/huge.ts", exact: true }).click();
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
  await expect(page.locator("#detail-panel .detail-note")).toBeHidden();

  // The beginning, before the helper was created.
  await page.getByRole("button", { name: "History", exact: true }).click();
  await track(page).focus();
  await page.keyboard.press("Home");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await settled(page);
  const chip = page.locator("#search-subject-absence");
  await expect(chip).toBeVisible();
  await expect(chip).toHaveText("not yet created");
  await expect(chip).toHaveAttribute("title", `The picture shows ${moment}`);
  await expect(page.locator("#search-subject")).toHaveAttribute("aria-describedby", "search-subject-absence");
  await expect(page.locator("#search-destination-absence")).toBeHidden();
  await expect(status(page)).toHaveText(`At ${moment}: huge.ts, not yet created`);
  await expect(page.locator("#pathfind-path")).toBeHidden();
  await expect(page.locator("#detail-panel .detail-note")).toHaveText(`Today's version. The picture shows ${moment}: not yet created.`);

  // At the step that creates it the helper stands, and the path runs again, named at that commit.
  await track(page).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "3");
  await settled(page);
  await expect(chip).toBeHidden();
  await expect(status(page)).toHaveText(`At ${commits[3].date.slice(0, 10)}, commit ${commits[3].id.slice(0, 8)}: Path found: 3 files`);
  await expect(page.locator("#detail-panel .detail-note")).toHaveText(`Today's version. The picture shows ${commits[3].date.slice(0, 10)}, commit ${commits[3].id.slice(0, 8)}.`);

  // Closed, the history leaves today's path and nothing said of a moment.
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(status(page)).toHaveText("Path found: 3 files");
  await expect(chip).toBeHidden();
  await expect(page.locator("#detail-panel .detail-note")).toBeHidden();
});

test("a path asked at a moment runs over that moment's wires and names its files as the moment does", async ({ page }) => {
  const commits = await commitsOf(page);
  const moment = `${commits[0].date.slice(0, 10)}, commit ${commits[0].id.slice(0, 8)}`;
  await observeGraph(page);
  // Opened on the beginning, where the engine was still the core and the screen still the view.
  await page.goto(pathEntry("src/engine/model.ts", "src/app/screen.ts", commits[0].id));
  await settled(page);
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await expect(status(page)).toHaveText(`At ${moment}: Path found: 2 files`);
  await expect(hops(page)).toHaveText(["model.ts", "view.ts"]);
  await expect(hops(page).first()).toHaveAttribute("title", "src/core/model.ts");
  await expect(hops(page).last()).toHaveAttribute("title", "src/app/view.ts");
  // The picture draws the path as the moment names it: the view, an end that is not pinned, at the pinned model's
  // strength, and a file off the path fainter.
  const opacity = async (id: string): Promise<number> => (await renderedNodes(page)).find(node => node.id === id)!.opacity;
  await expect.poll(() => opacity("src/app/view.ts")).toBe(await opacity("src/core/model.ts"));
  expect(await opacity("src/app/view.ts")).toBeGreaterThan(await opacity("lib/legacy.ts"));

  // Today the same question runs over today's wires and names today's files.
  await track(page).focus();
  await page.keyboard.press("End");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "6");
  await settled(page);
  await expect(status(page)).toHaveText("Path found: 2 files");
  await expect(hops(page)).toHaveText(["model.ts", "screen.ts"]);

  // Asked again at the moment: cleared, and the destination chosen while the beginning is shown.
  await page.keyboard.press("Home");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await settled(page);
  await page.getByRole("button", { name: "Clear the path", exact: true }).click();
  await expect(status(page)).toBeHidden();
  await choose(page, "destination", "main.test", { file: "tests/main.test.ts" });
  await expect(status(page)).toHaveText(`At ${moment}: Path found: 3 files`);
  await expect(hops(page).first()).toHaveAttribute("title", "src/core/model.ts");
});

test("the destination offers what a path from the newest pin reaches at the moment shown", async ({ page }) => {
  const commits = await commitsOf(page);
  const offered = page.locator("#search-destination-results .search-row--file:not(.is-apart) .search-row-context");
  // The main file depends on the huge helper today; at the beginning the helper is not yet created.
  await page.goto(pathEntry("src/app/main.ts", "tests/main.test.ts"));
  await settled(page);
  await page.click("#search-destination");
  await page.keyboard.type("huge");
  await expect(offered).toHaveText(["lib/huge.ts"]);
  await page.keyboard.press("Escape");

  await page.goto(pathEntry("src/app/main.ts", "tests/main.test.ts", commits[0].id));
  await settled(page);
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await page.click("#search-destination");
  await page.keyboard.type("huge");
  await expect(page.locator("#search-destination-results .search-row--apart")).toBeVisible();
  await expect(offered).toHaveCount(0);
});

import { expect, test, type Page } from "@playwright/test";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { choose, pathAddress } from "./search-bar";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

/**
 * The history's step panel and what the map says at a moment: the panel compact (2026-11-11, the owner's "the big
 * commit texts should be relegated to '...' ... with a click engaging some kind of modal to render the full text"), its
 * subject in two lines at most and one line of counts, clear of the control strip and the scrubber; the whole step in a
 * modal dialog its "…" button opens, which pauses playback, closes by Escape, its button and its backdrop, gives the
 * focus back, and closes when a file or a document is chosen; the panel hidden and shown again while the scrubber stays
 * (2026-10-30); the absence of a pinned thing said where the person looks, and a path, its reach and its report asked
 * over the moment's wires rather than today's. Held over the scripted repository of the history command's integration
 * test (`tests/integration/live-docs/scripted-repository.ts`), served as `samples/history/`, and, for a long subject
 * and a step of many changes, over this repository's own bundle, whose history `npm run live-docs:history` computes;
 * the commits are read from each bundle's own history file.
 */

interface Commit { id: string; subject: string; date: string }
type Delta = Partial<Record<"born" | "resized" | "renamed" | "edgesAdded" | "edgesRemoved" | "edgesChanged" | "docLinksAdded" | "docLinksRemoved" | "directoriesRenamed", unknown[][]> & Record<"dead" | "touched", unknown[]>>;
interface Sequence { base: { commit: Commit }; steps: Array<{ commit: Commit; delta: Delta }> }

const BASE = "/samples/history/";

/** A bundle's history file. */
async function sequenceOf(page: Page, base = BASE): Promise<Sequence> {
  const data = await (await page.request.get(`${base}explorer-data.json`)).json() as { history?: { file: string } };
  expect(data.history, `${base} carries a history (for this repository, npm run live-docs:history computes it before the bundle is built)`).toBeDefined();
  return await (await page.request.get(`${base}${data.history!.file}`)).json() as Sequence;
}

/** The bundle's commits, oldest first, read from its history file. */
async function commitsOf(page: Page, base = BASE): Promise<Commit[]> {
  const sequence = await sequenceOf(page, base);
  return [sequence.base.commit, ...sequence.steps.map(step => step.commit)];
}

/** The 3D structure layout at a commit, or today when none is named. */
const entry = (extra: Partial<typeof DEFAULT_SNAPSHOT> = {}): string => `${BASE}?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT,
  perspective: "3d",
  spatialLayout: "structure",
  filters: { showTests: true, showAssets: false },
  // Four hops show the whole scripted sample from its start with nothing pinned (discovery, 2026-10-31).
  layout: { forceGraph: { updateEnergy: 0, hops: 4 } },
  ...extra
})}`;

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
}

const panel = (page: Page) => page.locator(".history-step-panel");
const dialog = (page: Page) => page.locator("dialog.history-step-dialog");
const more = (page: Page) => panel(page).getByRole("button", { name: "Show the whole step", exact: true });
const track = (page: Page) => page.locator(".history-track");

/** This repository's bundle in the 3D structure layout at a commit, read once its panel says the commit: these cases are about the panel and
 * the dialog, and the picture of 950 files settling (about 25 s on this machine, 29 s under load) is not their subject. */
async function openOurs(page: Page, commit: Commit): Promise<void> {
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure", commit: commit.id })}`);
  await expect(panel(page).locator("h2")).toHaveText(commit.subject, { timeout: 20_000 });
}

interface Box { left: number; right: number; top: number; bottom: number; width: number; height: number }
const intersects = (a: Box, b: Box): boolean => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** The compact panel against what stands near it: its box and its content's, its subject's lines, the control strip and the scrubber. */
async function panelBox(page: Page): Promise<{ panel: Box; client: number; scroll: number; borders: number; subjectLines: number; subjectCut: boolean; strip: Box; scrubber: Box }> {
  return page.locator(".history-step-panel").evaluate(element => {
    const box = (target: Element): Box => {
      const { left, right, top, bottom, width, height } = target.getBoundingClientRect();
      return { left, right, top, bottom, width, height };
    };
    const style = getComputedStyle(element);
    const subject = element.querySelector("h2")!;
    return {
      panel: box(element),
      client: element.clientHeight,
      scroll: element.scrollHeight,
      borders: parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth),
      subjectLines: Math.round(subject.clientHeight / parseFloat(getComputedStyle(subject).lineHeight)),
      subjectCut: subject.scrollHeight > subject.clientHeight + 1,
      strip: box(document.querySelector(".perspective-controls")!),
      scrubber: box(document.querySelector(".history-scrubber")!)
    };
  });
}

/** What a step changed, counted from the history file's own delta: each file once, by its index. */
function expectedCounts(delta: Delta): string {
  const files = new Set([...(delta.born ?? []).map(born => born[0]), ...(delta.dead ?? []), ...(delta.renamed ?? []).map(rename => rename[1]),
    ...(delta.resized ?? []).map(resized => resized[0]), ...(delta.touched ?? [])]).size;
  const wires = (delta.edgesAdded?.length ?? 0) + (delta.edgesRemoved?.length ?? 0) + (delta.edgesChanged?.length ?? 0);
  const links = (delta.docLinksAdded?.length ?? 0) + (delta.docLinksRemoved?.length ?? 0);
  const directories = delta.directoriesRenamed?.length ?? 0;
  const words = (count: number, one: string, many: string) => count ? [`${count.toLocaleString("en-US")} ${count === 1 ? one : many}`] : [];
  return `Changed: ${[...words(files, "file", "files"), ...words(wires, "wire", "wires"), ...words(links, "document link", "document links"), ...words(directories, "directory renamed whole", "directories renamed whole")].join(", ")}`;
}

for (const viewport of [{ width: 1400, height: 900 }, { width: 1280, height: 420 }]) {
  test(`at ${viewport.width}x${viewport.height} the compact panel is as tall as its few lines, holds no list and stands clear of the control strip and the scrubber, its buttons in one place at every step`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const sequence = await sequenceOf(page);
    const commits = [sequence.base.commit, ...sequence.steps.map(step => step.commit)];
    // Step 5 resizes one file; step 3 says the most: a file created, one deleted, wires added and removed, a document linked.
    await page.goto(entry({ commit: commits[5].id }));
    await settled(page);
    await expect(panel(page).locator("h2")).toHaveText(commits[5].subject);
    await expect(panel(page).locator(".history-step-counts")).toHaveText("Changed: 1 file");
    const short = await panelBox(page);
    const buttons = async () => [(await more(page).boundingBox())!, (await panel(page).getByRole("button", { name: "Hide step details", exact: true }).boundingBox())!];
    const placed = await buttons();
    await track(page).focus();
    for (const step of [4, 3]) {
      await page.keyboard.press("ArrowLeft");
      await expect(track(page)).toHaveAttribute("aria-valuenow", String(step));
    }
    await settled(page);
    await expect(panel(page).locator("h2")).toHaveText(commits[3].subject);
    await expect(panel(page).locator(".history-step-counts")).toHaveText(expectedCounts(sequence.steps[2].delta));
    await expect(panel(page).locator(".history-step-counts")).toHaveText("Changed: 2 files, 2 wires, 1 document link");
    expect(await buttons(), "the panel's buttons stand where they stood").toEqual(placed);
    for (const box of [short, await panelBox(page)]) {
      expect(box.scroll, "nothing scrolls inside the compact panel").toBe(box.client);
      expect(box.panel.height).toBeCloseTo(box.scroll + box.borders, 0);
      expect(box.subjectLines).toBeLessThanOrEqual(2);
      expect(box.subjectCut, "the sample's short subjects are whole").toBe(false);
      expect(intersects(box.panel, box.strip), "the panel is clear of the control strip").toBe(false);
      expect(intersects(box.panel, box.scrubber), "the panel is clear of the scrubber").toBe(false);
    }
    await expect(panel(page).locator("details, li")).toHaveCount(0);
  });
}

test("this repository's long subject at a step of many changes: two lines cut with an ellipsis, whole in its title, the changes counted and the panel clear of the strip and the scrubber", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const sequence = await sequenceOf(page, "/");
  // "Discover the 3D Local Map by hops ...", about a hundred characters, and dozens of files and wires.
  const index = sequence.steps.findIndex(step => step.commit.id.startsWith("85ba619f"));
  expect(index, "this repository's history holds 85ba619f").toBeGreaterThanOrEqual(0);
  const { commit, delta } = sequence.steps[index];
  expect(commit.subject.length).toBeGreaterThan(80);
  await openOurs(page, commit);
  const subject = panel(page).locator("h2");
  await expect(subject).toHaveText(commit.subject);
  await expect(subject).toHaveAttribute("title", commit.subject);
  await expect(subject).toHaveCSS("-webkit-line-clamp", "2");
  await expect(panel(page).locator(".history-step-meta code")).toHaveText(commit.id.slice(0, 8));
  await expect(panel(page).locator(".history-step-counts")).toHaveText(expectedCounts(delta));
  await expect(panel(page).locator(".history-step-counts")).toHaveText(/^Changed: \d+ files, \d+ wires, \d+ document links?$/u);
  await expect(panel(page).locator("details, li")).toHaveCount(0);
  const box = await panelBox(page);
  expect(box.subjectLines, "the subject's slot is two lines").toBe(2);
  expect(box.subjectCut, "the rest of the subject is cut").toBe(true);
  // The subject's two lines, the meta and the counts: no taller than about six lines of text and the padding.
  expect(box.panel.height).toBeLessThan(140);
  expect(box.scroll).toBe(box.client);
  expect(intersects(box.panel, box.strip), "the panel is clear of the control strip").toBe(false);
  expect(intersects(box.panel, box.scrubber), "the panel is clear of the scrubber").toBe(false);
});

test("the … button opens the whole step in a modal dialog over an inert page; Escape closes it and the focus is on the button again", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const sequence = await sequenceOf(page, "/");
  const { commit } = sequence.steps.find(step => step.commit.id.startsWith("85ba619f"))!;
  await openOurs(page, commit);
  await expect(more(page)).toHaveAttribute("aria-haspopup", "dialog");
  await expect(more(page)).toHaveAttribute("title", "Show the whole step");
  await expect(dialog(page)).toBeHidden();
  // By the keyboard: the button is reachable and Enter opens the dialog.
  await more(page).focus();
  await page.keyboard.press("Enter");
  const whole = page.getByRole("dialog", { name: commit.subject, exact: true });
  await expect(whole).toBeVisible();
  await expect(whole.locator("h2")).toHaveText(commit.subject);
  expect(await whole.evaluate(element => element.matches(":modal"))).toBe(true);
  // The groups the step changed, in the dialog.
  const titles = whole.locator("summary > span:first-child");
  await expect(titles).toHaveText(["Created", "Resized", "Wires added", "Wires changed", "Documents unlinked", "Content changed, shape kept"]);
  await expect(whole.locator(".history-step-meta code")).toHaveText(commit.id.slice(0, 8));
  // The page behind takes neither the focus nor the pointer.
  const behind = await page.evaluate(() => {
    const play = document.querySelector<HTMLButtonElement>(".history-play")!;
    play.focus();
    const box = play.getBoundingClientRect();
    return { focused: document.activeElement === play, hit: document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.tagName ?? null };
  });
  expect(behind).toEqual({ focused: false, hit: "DIALOG" });
  // Escape closes the dialog alone, and the focus is where it was.
  await page.keyboard.press("Escape");
  await expect(whole).toBeHidden();
  await expect(more(page)).toBeFocused();
  await expect(panel(page)).toBeVisible();
  // Its own close button does the same.
  await more(page).click();
  await expect(whole).toBeVisible();
  await whole.getByRole("button", { name: "Close", exact: true }).click();
  await expect(whole).toBeHidden();
  await expect(more(page)).toBeFocused();
});

test("with the reader open beside the picture, Escape closes the dialog alone, wherever the focus is in it", async ({ page }) => {
  // Wide enough that the reader leaves the panel its room.
  await page.setViewportSize({ width: 1920, height: 1080 });
  const commits = await commitsOf(page);
  // Step 4 unlinks the design document, which the bundle carries.
  await page.goto(entry({ commit: commits[4].id, filters: { showTests: true, showAssets: false, showRelatedDocs: true } }));
  await settled(page);
  await more(page).click();
  await dialog(page).locator('button[data-read="docs/design.md"]').click();
  await expect(dialog(page)).toBeHidden();
  const reader = page.locator("#detail-panel");
  await expect(reader).toHaveClass(/visible/u);
  await expect(panel(page)).toBeVisible();
  await more(page).click();
  await expect(dialog(page)).toBeVisible();
  // A click on the words, not on a control: the focus stays with the dialog, and the reader's own Escape does not hear the key.
  await dialog(page).locator(".history-step-meta span").first().click();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await expect(reader).toHaveClass(/visible/u);
  // The next Escape is the reader's again.
  await page.keyboard.press("Escape");
  await expect(reader).not.toHaveClass(/visible/u);
});

test("a click on the dialog's backdrop closes it and does not reach what stands behind", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const commits = await commitsOf(page);
  await page.goto(entry({ commit: commits[3].id }));
  await settled(page);
  const hide = (await panel(page).getByRole("button", { name: "Hide step details", exact: true }).boundingBox())!;
  await more(page).click();
  await expect(dialog(page)).toBeVisible();
  const box = (await dialog(page).boundingBox())!;
  // The panel's hide button stands outside the dialog's box, under its backdrop.
  expect(hide.x + hide.width < box.x || hide.y + hide.height < box.y).toBe(true);
  await page.mouse.click(hide.x + hide.width / 2, hide.y + hide.height / 2);
  await expect(dialog(page)).toBeHidden();
  await expect(panel(page)).toBeVisible();
  // A press inside the dialog that is released inside does not close it.
  await more(page).click();
  await dialog(page).locator("h2").click();
  await expect(dialog(page)).toBeVisible();
});

test("opening the whole step while the history plays pauses it on the step shown, and closing it does not play on", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  const commits = await commitsOf(page);
  await page.goto(entry({ commit: commits[0].id }));
  await settled(page);
  const play = page.locator(".history-play");
  // One step a second: the play is still under way, steps from its end, when the dialog opens.
  await page.locator(".history-rate").selectOption("1");
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "1");
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await more(page).click();
  await expect(dialog(page)).toBeVisible();
  await expect(play).toHaveAttribute("aria-pressed", "false");
  const step = Number(await track(page).getAttribute("aria-valuenow"));
  expect(step).toBeLessThan(commits.length - 1);
  await expect(dialog(page).locator("h2")).toHaveText(commits[step].subject);
  // A playing history would have moved on by now.
  await page.waitForTimeout(1600);
  await expect(track(page)).toHaveAttribute("aria-valuenow", String(step));
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await page.waitForTimeout(1600);
  await expect(track(page)).toHaveAttribute("aria-valuenow", String(step));
  await expect(play).toHaveAttribute("aria-pressed", "false");
});

test("a file chosen in the dialog is pinned at its moment and the dialog closes so that it is seen; the panel says Created and Deleted, never Born and Dead", async ({ page }) => {
  const commits = await commitsOf(page);
  // Step 3 rewrites the big helper below git's threshold: huge.ts created, big.ts deleted.
  await page.goto(entry({ commit: commits[3].id }));
  await settled(page);
  await more(page).click();
  const titles = dialog(page).locator("summary > span:first-child");
  await expect(titles.filter({ hasText: /^Created$/u })).toHaveCount(1);
  await expect(titles.filter({ hasText: /^Deleted$/u })).toHaveCount(1);
  await expect(dialog(page)).not.toContainText(/\b(Born|Dead)\b/u);
  await dialog(page).locator('button[data-file="lib/huge.ts"]').click();
  await expect(dialog(page)).toBeHidden();
  await expect(track(page)).toHaveAttribute("aria-valuenow", "3");
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.locator(".pin-tray-name").filter({ hasText: /^huge\.ts$/u })).toHaveCount(1);
});

for (const viewport of [{ width: 900, height: 700 }, { width: 480, height: 800 }]) {
  test(`at ${viewport.width}x${viewport.height} the dialog fits the viewport, scrolls inside itself and causes no horizontal scroll`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const sequence = await sequenceOf(page, "/");
    // "Repair Explorer history, discovery and directory framing": 45 files, 36 wires and 3 document links.
    const { commit } = sequence.steps.find(step => step.commit.id.startsWith("e99d592d"))!;
    await openOurs(page, commit);
    await more(page).click();
    await expect(dialog(page)).toBeVisible();
    // Every group opened, so that the dialog says as much as it can.
    const folded = dialog(page).locator("details:not([open]) > summary");
    expect(await folded.count(), "the step has folded groups to open").toBeGreaterThan(0);
    while (await folded.count()) await folded.first().click();
    const fit = await dialog(page).evaluate(element => {
      const body = element.querySelector(".history-step-dialog-body")!;
      const box = element.getBoundingClientRect();
      return {
        left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width,
        pageScrolls: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        dialogScrollsAcross: element.scrollWidth > element.clientWidth || body.scrollWidth > body.clientWidth,
        bodyScrolls: body.scrollHeight > body.clientHeight
      };
    });
    expect(fit.left).toBeGreaterThanOrEqual(0);
    expect(fit.top).toBeGreaterThanOrEqual(0);
    expect(fit.right).toBeLessThanOrEqual(viewport.width);
    expect(fit.bottom).toBeLessThanOrEqual(viewport.height);
    expect(fit.width).toBeLessThanOrEqual(Math.min(720, viewport.width - 32) + 1);
    expect(fit.width).toBeGreaterThanOrEqual(Math.min(720, viewport.width - 32) - 1);
    expect(fit.pageScrolls, "the page does not scroll across").toBe(false);
    expect(fit.dialogScrollsAcross, "the dialog does not scroll across").toBe(false);
    expect(fit.bodyScrolls, "the whole step is taller than the viewport and scrolls inside the dialog").toBe(true);
    // The last row is reached by scrolling the dialog, its header standing.
    const last = dialog(page).locator("li").last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport();
    await expect(dialog(page).getByRole("button", { name: "Close", exact: true })).toBeInViewport();
  });
}

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
  layout: { forceGraph: { updateEnergy: 0, hops: 4 } },
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
  // strength, and a file off the path fainter; util.ts, in the model's folder, is in the path's picture (discovery,
  // 2026-10-31), where the legacy helper, four containment hops away, is not.
  // The moment's picture reveals its spheres over frames, the path's files first and util.ts, a hop beyond, after them:
  // a gate of 2026-11-06 read the picture one frame before util.ts had entered. Each sphere is read once it is there.
  const rendered = async (id: string) => (await renderedNodes(page)).find(node => node.id === id);
  for (const id of ["src/app/view.ts", "src/core/model.ts", "src/core/util.ts"]) await expect.poll(async () => Boolean(await rendered(id)), { message: `${id} enters the moment's picture` }).toBe(true);
  const opacity = async (id: string): Promise<number> => (await rendered(id))!.opacity;
  await expect.poll(() => opacity("src/app/view.ts")).toBe(await opacity("src/core/model.ts"));
  expect(await opacity("src/app/view.ts")).toBeGreaterThan(await opacity("src/core/util.ts"));

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
  await expect(page.locator("#search-destination-results .search-empty")).toHaveText("Nothing found");
  await expect(offered).toHaveCount(0);
});

/** The on-screen box of every sphere drawn, with the compact panel, the control strip and the picture's frame. */
async function pictureBox(page: Page): Promise<{ left: number; right: number; top: number; bottom: number; panel: Box; strip: Box; frame: Box }> {
  const nodes = await renderedNodes(page);
  const { panel: panelAt, strip } = await panelBox(page);
  const frame = await page.locator("#graph-svg").evaluate(element => {
    const { left, right, top, bottom, width, height } = element.getBoundingClientRect();
    return { left, right, top, bottom, width, height };
  });
  return {
    left: Math.min(...nodes.map(node => node.x - node.screenRadius)), right: Math.max(...nodes.map(node => node.x + node.screenRadius)),
    top: Math.min(...nodes.map(node => node.y - node.screenRadius)), bottom: Math.max(...nodes.map(node => node.y + node.screenRadius)),
    panel: panelAt, strip, frame
  };
}

test("the camera frames the picture beside the compact panel, clear of it and of the control strip", async ({ page }) => {
  // As it framed the picture beside the tall panel: the room beside is the taller one, and a picture is drawn larger
  // there than below (`cornerPanelInsets`). Measured from the spheres drawn.
  await observeGraph(page);
  const commits = await commitsOf(page);
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(entry({ commit: commits[3].id }));
  await settled(page);
  await expect.poll(async () => {
    const box = await pictureBox(page);
    return box.left >= box.panel.right && box.bottom <= box.strip.top && box.top >= box.frame.top;
  }, { timeout: 15_000, message: "the picture stands to the right of the panel and above the control strip" }).toBe(true);
});

/** The width of the picture left uncovered beside the reader, from the frame's left edge to the reader's. */
const column = (page: Page): Promise<number> => page.evaluate(() =>
  document.querySelector("#detail-panel")!.getBoundingClientRect().left - document.querySelector("#graph-svg")!.getBoundingClientRect().left);

test("the compact panel stays when a reader opens, the picture framed below it where nothing is left beside, and gives way where the picture's room would be narrower than 320 px", async ({ page }) => {
  await observeGraph(page);
  const commits = await commitsOf(page);
  const last = commits[commits.length - 1].id;
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(pathEntry("lib/huge.ts", "tests/main.test.ts", last));
  await settled(page);
  await expect(panel(page)).toBeVisible();
  await page.getByRole("button", { name: "Inspect path file 1 of 3: lib/huge.ts", exact: true }).click();
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
  await expect(panel(page), "the picture is framed below the panel, so the reader does not squeeze it").toBeVisible();
  const boxes = await page.evaluate(() => ({
    panel: document.querySelector(".history-step-panel")!.getBoundingClientRect().right,
    reader: document.querySelector("#detail-panel")!.getBoundingClientRect().left
  }));
  expect(boxes.panel, "the panel stands clear of the reader").toBeLessThanOrEqual(boxes.reader);

  // At 1000 px the reader leaves the picture a column wider than 320 px: the panel stands above the picture and stays.
  // The tall panel was hidden here, since beside it nothing was left.
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto(pathEntry("lib/huge.ts", "tests/main.test.ts", last));
  await settled(page);
  await page.getByRole("button", { name: "Inspect path file 1 of 3: lib/huge.ts", exact: true }).click();
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
  // The reader slides in: its resting place is read once it is narrower than the frame's half, and is still 320 px or more.
  await expect.poll(() => column(page), { message: "the picture's column beside the reader, once it has slid in" }).toBeLessThan(400);
  expect(await column(page)).toBeGreaterThanOrEqual(320);
  await expect(panel(page)).toBeVisible();
  // Beside the panel less than 320 px are left, so the picture is framed below it, in the column, never under it.
  await expect.poll(async () => {
    const box = await pictureBox(page);
    return box.top >= box.panel.bottom && box.bottom <= box.strip.top && box.left >= box.frame.left && box.right <= box.frame.left + await column(page);
  }, { timeout: 15_000, message: "the picture stands below the panel, above the control strip, within the column the reader leaves" }).toBe(true);

  // At 900 px the reader leaves a column narrower than 320 px: the panel gives way, and the scrubber's toggle can bring it back.
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto(pathEntry("lib/huge.ts", "tests/main.test.ts", last));
  await settled(page);
  await expect(panel(page)).toBeVisible();
  await page.getByRole("button", { name: "Inspect path file 1 of 3: lib/huge.ts", exact: true }).click();
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
  await expect.poll(() => column(page), { message: "the picture's column beside the reader, once it has slid in" }).toBeLessThan(320);
  await expect(panel(page)).toBeHidden();
  await expect(page.locator(".history-scrubber").getByRole("button", { name: "Step details", exact: true })).toHaveAttribute("aria-pressed", "false");
});

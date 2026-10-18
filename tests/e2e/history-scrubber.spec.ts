import { expect, test, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { engineActivity, markedRenderedLinks, markRenderedLinks, observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

/**
 * The history of the 3D Local Map (ticket C4 of the change-over-time plan, 2026-10-18): the scrubber along the
 * bottom, the step panel beside the picture, the address that carries the commit, the pins said absent, the
 * truncated beginning and the Knowledge Sources line, held over the scripted repository of the history command's
 * integration test, served as two bundles (`samples/history/`, the whole; `samples/history-window/`, its last four
 * commits), so that nothing here depends on this repository's own history. The spheres and lines are read from the
 * rendered scene through the observation instrument; the commits are read from the bundle's own history file.
 */

test.use({ viewport: { width: 1400, height: 900 } });

/** The text the design audit reads with the history open. */
const TEXT = [
  ".history-step-panel h2",
  ".history-step-meta > *",
  ".history-step-note",
  ".history-step-panel summary > span",
  ".history-step-panel li > *",
  ".history-readout > *",
  ".history-ruler-label",
  ".history-notice",
  ".force-graph-focus",
  ".pin-tray-panel strong",
  ".pin-tray-name",
  ".pin-tray-context",
  ".pin-tray-absent",
  ".pin-tray-toggle",
  ".perspective-controls button"
];

interface Head { commits: number }
interface Sequence { base: { commit: { id: string; subject: string; date: string } }; steps: Array<{ commit: { id: string; subject: string; date: string; author?: string } }> }

/** The bundle's commits, oldest first, read from its history file. */
async function commitsOf(page: Page, base: string): Promise<Array<{ id: string; subject: string; date: string; author?: string }>> {
  const data = await (await page.request.get(`${base}explorer-data.json`)).json() as { history?: { file: string; head: Head } };
  expect(data.history, `${base} carries a history`).toBeDefined();
  const sequence = await (await page.request.get(`${base}${data.history!.file}`)).json() as Sequence;
  return [sequence.base.commit, ...sequence.steps.map(step => step.commit)];
}

/** The 3D structure layout, placed without a tick so that a step moves a sphere only by what the step says. */
const entry = (base: string, extra: Partial<typeof DEFAULT_SNAPSHOT> = {}): string => `${base}?s=${compressSnapshot({
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

async function openHistory(page: Page): Promise<void> {
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.locator(".history-scrubber")).toBeVisible();
}

const track = (page: Page) => page.locator(".history-track");
const panel = (page: Page) => page.locator(".history-step-panel");
const group = (page: Page, title: string) => panel(page).locator("details").filter({ has: page.locator(`summary > span:first-child:text-is("${title}")`) });

async function stepTo(page: Page, step: number): Promise<void> {
  const box = (await page.locator(`.history-tick[data-step="${step}"]`).boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(track(page)).toHaveAttribute("aria-valuenow", String(step));
  await settled(page);
}

async function audit(page: Page, what: string): Promise<void> {
  const boxes = await textBoxes(page, TEXT);
  expect(boxes.length, `${what}: words to audit`).toBeGreaterThan(8);
  const overlaps = overlapsAmong(boxes);
  const cut = await truncations(page, TEXT);
  expect(overlaps.length + cut.length, `${what}: ${describeFaults(overlaps, cut)}`).toBe(0);
}

type Rendered = Awaited<ReturnType<typeof renderedNodes>>;
const byId = (nodes: Rendered) => new Map(nodes.map(node => [node.id, node.world]));

test("the control opens a scrubber with one tick per step and the panel says what the last step changed, with no words on top of each other", async ({ page }) => {
  const commits = await commitsOf(page, "/samples/history/");
  await page.goto(entry("/samples/history/"));
  await settled(page);
  const history = page.getByRole("button", { name: "History", exact: true });
  await expect(history).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".history-scrubber")).toBeHidden();
  await openHistory(page);
  await expect(history).toHaveAttribute("aria-pressed", "true");

  // The last step is today: the thumb at the end, the value spoken as the date and the subject.
  const last = commits.length - 1;
  await expect(track(page)).toHaveAttribute("aria-valuemax", String(last));
  await expect(track(page)).toHaveAttribute("aria-valuenow", String(last));
  await expect(track(page)).toHaveAttribute("aria-valuetext", `${commits[last].date.slice(0, 10)}: ${commits[last].subject}`);
  await expect(page.locator(".history-tick")).toHaveCount(commits.length);
  // With nothing pinned every step is a major tick, the beginning too.
  await expect(page.locator(".history-tick.is-major")).toHaveCount(commits.length);
  await expect(page.locator(".history-ruler-label:not([hidden])").first()).toHaveText("5 Jan 2026");
  await expect(page.locator(".history-readout code")).toHaveText(commits[last].id.slice(0, 8));
  await expect(page.locator(".history-truncated")).toBeHidden();

  // The panel: the commit, and the one file whose content changed while its shape did not.
  await expect(panel(page).locator("h2")).toHaveText(commits[last].subject);
  await expect(panel(page).locator(".history-step-meta code")).toHaveText(commits[last].id.slice(0, 8));
  await expect(group(page, "Content changed, shape kept").locator("summary .history-count")).toHaveText("1");
  await expect(group(page, "Content changed, shape kept").locator("li button")).toHaveText("model.ts");
  await expect(group(page, "Born")).toHaveCount(0);

  // The open scrubber takes the bottom: the controls and the tray stand above it.
  const scrubber = (await page.locator(".history-scrubber").boundingBox())!;
  const controls = (await page.locator(".perspective-controls").boundingBox())!;
  const tray = (await page.locator(".pin-tray-toggle").boundingBox())!;
  expect(controls.y + controls.height).toBeLessThan(scrubber.y);
  expect(tray.y + tray.height).toBeLessThan(scrubber.y);
  await audit(page, "the control open at today");
});

test("the keys walk the steps: a renamed file and its directory's hub keep their objects and their places, and the beginning is the first snapshot without motion", async ({ page }) => {
  const commits = await commitsOf(page, "/samples/history/");
  await observeGraph(page);
  await page.goto(entry("/samples/history/"));
  await settled(page);
  await openHistory(page);
  await track(page).focus();

  // Home: the beginning, the base's snapshot in full, nothing born.
  await page.keyboard.press("Home");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await settled(page);
  await expect(panel(page).locator("h2")).toHaveText(commits[0].subject);
  await expect(panel(page).locator(".history-step-note")).toHaveText("The beginning of what is known: 8 files and 8 wires.");
  await expect(page.locator("#graph-svg")).toHaveAttribute("data-history-step", "0");
  const beginning = byId(await renderedNodes(page));
  expect(beginning.has("src/core/model.ts")).toBe(true);
  expect(beginning.has("src/engine/model.ts")).toBe(false);
  expect(beginning.has("directory:src/core")).toBe(true);
  expect(beginning.has("lib/legacy.ts")).toBe(true);
  const marked = await markRenderedLinks(page, "at the beginning");
  expect(marked).toBeGreaterThan(0);

  // One step: the core becomes the engine. The renamed spheres and the hub stand exactly where they stood; the lines kept.
  await page.keyboard.press("ArrowRight");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "1");
  await settled(page);
  await expect(panel(page).locator("h2")).toHaveText(commits[1].subject);
  await expect(group(page, "Renamed").locator("summary .history-count")).toHaveText("2");
  await expect(group(page, "Renamed").locator("li").first()).toContainText("src/core/model.ts");
  await expect(group(page, "Renamed").locator("li").first().locator("button")).toHaveText("model.ts");
  await expect(group(page, "Renamed whole").locator("li")).toHaveText(/src\/core\s*to\s*src\/engine/);
  const renamed = byId(await renderedNodes(page));
  expect(renamed.has("src/core/model.ts")).toBe(false);
  expect(renamed.get("src/engine/model.ts")).toEqual(beginning.get("src/core/model.ts"));
  expect(renamed.get("src/engine/util.ts")).toEqual(beginning.get("src/core/util.ts"));
  expect(renamed.get("directory:src/engine")).toEqual(beginning.get("directory:src/core"));
  expect(renamed.get("src/app/main.ts")).toEqual(beginning.get("src/app/main.ts"));
  const kept = await markedRenderedLinks(page, "at the beginning");
  expect(kept.total).toBe(marked);
  expect(kept.marked).toBe(marked);

  // The stops with nothing pinned are every step: End, Page Down, Page Up.
  await page.keyboard.press("End");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "6");
  await page.keyboard.press("PageDown");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "5");
  await page.keyboard.press("PageUp");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "6");
  await page.keyboard.press("ArrowRight");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "6");
  await settled(page);
  await expect(page.locator("#graph-svg")).toHaveAttribute("data-history-step", "");
  await audit(page, "the rename step");
});

test("a death is shown as a death, the panel says gone since, and a born file that stands today is a link that pins it", async ({ page }) => {
  const commits = await commitsOf(page, "/samples/history/");
  await observeGraph(page);
  await page.goto(entry("/samples/history/"));
  await settled(page);
  await openHistory(page);

  // Step 3: big.ts rewritten below the threshold is a death and a birth; huge.ts stands today.
  await stepTo(page, 3);
  const born = group(page, "Born").locator("li");
  await expect(born).toHaveCount(1);
  await expect(born.locator("button")).toHaveText("huge.ts");
  await expect(born).toContainText("implementation, 2 symbols");
  const dead = group(page, "Dead").locator("li");
  await expect(dead).toHaveCount(1);
  await expect(dead.locator(".history-file-name")).toHaveText("big.ts");
  await expect(dead.locator("button")).toHaveCount(0);
  await expect(dead.locator(".history-gone")).toHaveText(`gone since ${commits[3].id.slice(0, 8)}`);
  const at3 = byId(await renderedNodes(page));
  expect(at3.has("lib/huge.ts")).toBe(true);
  expect(at3.has("lib/big.ts")).toBe(false);

  // Step 4: the legacy helper retired; its sphere leaves and its wire goes.
  await stepTo(page, 4);
  await expect(panel(page).locator("h2")).toHaveText(commits[4].subject);
  await expect(group(page, "Dead").locator("li .history-file-name")).toHaveText("legacy.ts");
  await expect(group(page, "Wires removed").locator("li")).toHaveText(/src\/app\/main\.ts\s*to\s*lib\/legacy\.ts/);
  expect(byId(await renderedNodes(page)).has("lib/legacy.ts")).toBe(false);

  // The born file's name pins it today.
  await stepTo(page, 3);
  await born.locator("button").click();
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.locator(".pin-tray-name")).toHaveText("huge.ts");
  await expect(page.locator(".pin-tray-absent")).toBeHidden();
});

test("a pin whose file is not yet born is said so in the tray and never dropped, and its birth is the one major tick the step key moves to", async ({ page }) => {
  await observeGraph(page);
  await page.goto(entry("/samples/history/"));
  await settled(page);
  await page.locator("#search-subject").fill("huge");
  await page.locator("#search-subject-results .search-row--file").first().click();
  await settled(page);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await openHistory(page);

  // With huge.ts pinned, only its birth changes the shape of what is pinned: one major tick, at step 3.
  await expect(page.locator(".history-tick.is-major")).toHaveCount(1);
  await expect(page.locator(".history-tick.is-major")).toHaveAttribute("data-step", "3");
  await expect(page.locator(".history-tick.is-minor")).toHaveCount(0);

  await stepTo(page, 1);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await expect(page.locator(".pin-tray-absent")).toHaveText("not yet born");
  expect(byId(await renderedNodes(page)).has("lib/huge.ts")).toBe(false);
  await audit(page, "the tray with a pin not yet born");
  await page.getByRole("button", { name: "Hide pins", exact: true }).click();

  // Page Up goes to the birth; Page Down from there back to the beginning, the only stops.
  await track(page).focus();
  await page.keyboard.press("PageUp");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "3");
  await settled(page);
  expect(byId(await renderedNodes(page)).has("lib/huge.ts")).toBe(true);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.locator(".pin-tray-absent")).toBeHidden();
  await page.getByRole("button", { name: "Hide pins", exact: true }).click();
  await track(page).focus();
  await page.keyboard.press("PageDown");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
});

test("the address carries the commit and the authors toggle, a link to a moment opens on it, and leaving 3D returns the picture to today", async ({ page }) => {
  const commits = await commitsOf(page, "/samples/history/");
  await observeGraph(page);
  await page.goto(entry("/samples/history/"));
  await settled(page);
  await openHistory(page);
  await stepTo(page, 2);
  const address = () => decompressSnapshot(new URL(page.url()).searchParams.get("s") ?? "");
  expect(address().commit).toBe(commits[2].id);
  expect(address().authors).toBe(false);
  await expect(panel(page).locator(".history-author")).toHaveCount(0);
  await page.getByRole("button", { name: "Show authors", exact: true }).click();
  await expect(panel(page).locator(".history-author")).toHaveText(commits[2].author!);
  expect(address().authors).toBe(true);
  await page.getByRole("button", { name: "Hide authors", exact: true }).click();
  await expect(panel(page).locator(".history-author")).toHaveCount(0);

  // A link to the moment opens on it: the control open, the thumb at the step, the picture that step's.
  const link = page.url();
  await page.goto("about:blank");
  await page.goto(link);
  await settled(page);
  await expect(page.locator(".history-scrubber")).toBeVisible();
  await expect(track(page)).toHaveAttribute("aria-valuenow", "2");
  await expect(panel(page).locator("h2")).toHaveText(commits[2].subject);
  const at2 = byId(await renderedNodes(page));
  expect(at2.has("src/app/screen.ts")).toBe(true);
  expect(at2.has("src/app/view.ts")).toBe(false);
  expect(at2.has("lib/big.ts")).toBe(true);

  // A commit the history lacks is said, and today shown.
  await page.goto(entry("/samples/history/", { commit: "0000000000000000000000000000000000000000" }));
  await settled(page);
  await expect(page.locator(".history-notice")).toHaveText("00000000 is not in this history");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "6");

  // Leaving for 2D: today, the control closed, the address without a commit; back in 3D it stays today.
  await stepTo(page, 2);
  expect(address().commit).toBe(commits[2].id);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".history-scrubber")).toBeHidden();
  await expect(page.getByRole("button", { name: "History", exact: true })).toBeHidden();
  await expect.poll(() => address().commit).toBeNull();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "History", exact: true })).toBeVisible();
  await expect(page.locator(".history-scrubber")).toBeHidden();
  await expect(page.locator("#graph-svg")).toHaveAttribute("data-history-step", "");
  expect(byId(await renderedNodes(page)).has("src/app/screen.ts")).toBe(true);
});

test("a drag places every step it crosses without a tick, and the rest settles at the tuning's energy", async ({ page }) => {
  test.setTimeout(120_000);
  await observeGraph(page);
  // The tuning's energy, a tenth: a rest reheats, a drag does not.
  await page.goto(entry("/samples/history/", { layout: { forceGraph: { updateEnergy: 0.1 } } }));
  await settled(page);
  await openHistory(page);
  await track(page).focus();
  await page.keyboard.press("Home");
  await settled(page);
  const before = await engineActivity(page);
  const from = (await page.locator('.history-tick[data-step="0"]').boundingBox())!;
  const to = (await page.locator('.history-tick[data-step="6"]').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  const steps = new Set<string>();
  for (let move = 1; move <= 12; move++) {
    await page.mouse.move(from.x + (to.x - from.x) * move / 12, from.y, { steps: 2 });
    await page.waitForTimeout(80);
    steps.add((await track(page).getAttribute("aria-valuenow")) ?? "");
    // Placed without a tick: the engine never starts while the thumb moves.
    await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false");
  }
  for (const step of ["1", "2", "3", "4", "5", "6"]) expect(steps.has(step), `step ${step} shown while the thumb crossed it`).toBe(true);
  expect((await engineActivity(page)).changes.length).toBe(before.changes.length);
  await page.mouse.up();
  // At rest the picture is fed at the tuning's energy: the engine runs and settles.
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "true");
  await settled(page);
  expect((await engineActivity(page)).changes.length).toBeGreaterThan(before.changes.length);
  await expect(track(page)).toHaveAttribute("aria-valuenow", "6");
});

test("the window's beginning is marked truncated and says why; the whole history's is not", async ({ page }) => {
  await page.goto(entry("/samples/history-window/"));
  await settled(page);
  await openHistory(page);
  await expect(track(page)).toHaveAttribute("aria-valuemax", "3");
  const mark = page.locator(".history-truncated");
  await expect(mark).toBeVisible();
  await expect(mark).toHaveAttribute("title", "The export carries the history from this commit on; what came before is not in it.");
  await track(page).focus();
  await page.keyboard.press("Home");
  await settled(page);
  await expect(panel(page).locator(".history-step-note")).toHaveText("The beginning of what is known: 8 files and 8 wires. The export carries the history from this commit on; what came before is not in it.");
  await expect(group(page, "Born")).toHaveCount(0);
  // The lane and the ruler start after the band.
  const band = (await mark.boundingBox())!;
  const firstTick = (await page.locator('.history-tick[data-step="0"]').boundingBox())!;
  expect(firstTick.x).toBeGreaterThan(band.x + band.width);
  await audit(page, "the truncated beginning");
});

test("Knowledge Sources says what the bundle carries of its history, or names the command to compute it", async ({ page }) => {
  await page.goto("/samples/history/?view=sources");
  await page.waitForSelector("#sources-container h1");
  await expect(page.locator('[data-row="history"] .sources-row-value')).toHaveText("7 commits, 2026-01-05 to 2026-01-11");
  await expect(page.locator('[data-row="history"] .sources-copy')).toHaveCount(0);
  await page.goto("/samples/history-window/?view=sources");
  await page.waitForSelector("#sources-container h1");
  await expect(page.locator('[data-row="history"] .sources-row-value')).toHaveText("4 commits, 2026-01-08 to 2026-01-11, the last 4");
  await page.goto("/samples/estate/?view=sources");
  await page.waitForSelector("#sources-container h1");
  await expect(page.locator('[data-row="history"] .sources-row-value')).toHaveText("none computed; npm run live-docs:history computes it, then rebuild the bundle");
  await expect(page.locator('[data-row="history"] .sources-copy')).toHaveText("Copy");
  await expect(page.getByRole("button", { name: "History", exact: true })).toHaveCount(0);
});

/** Every rendered line begins and ends on a rendered sphere; a line to an object the caches left behind leads nowhere. */
async function expectEveryLineOnSpheres(page: Page, what: string): Promise<void> {
  const spheres = byId(await renderedNodes(page));
  const lines = await renderedLinks(page);
  expect(lines.length, `${what}: lines to check`).toBeGreaterThan(0);
  const stray = lines.filter(line => {
    const from = spheres.get(line.source), to = spheres.get(line.target);
    return !from || !to || gap(from, line.start) > 1 || gap(to, line.end) > 1;
  }).map(line => `${line.source} -> ${line.target}`);
  expect(stray, `${what}: lines that lead nowhere`).toEqual([]);
}

const gap = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

test("a file renamed onto a dead file's path keeps its own sphere and lines, and no line leads nowhere after walking there and back", async ({ page }) => {
  await observeGraph(page);
  // The connections layout, where the references pull and are drawn: a reference resolved to a left-behind object would be a line to nothing.
  await page.goto(entry("/samples/history-collision/", { spatialLayout: "connections" }));
  await settled(page);
  await openHistory(page);
  await track(page).focus();
  await page.keyboard.press("Home");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await settled(page);
  const beginning = byId(await renderedNodes(page));
  expect(beginning.has("src/helper.ts")).toBe(true);
  expect(beginning.has("src/old.ts")).toBe(true);
  await expectEveryLineOnSpheres(page, "the beginning");
  // Step 1: old.ts dies; its object lingers in the view's caches.
  await page.keyboard.press("ArrowRight");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "1");
  await settled(page);
  expect(byId(await renderedNodes(page)).has("src/old.ts")).toBe(false);
  // Step 2: the helper is renamed onto the dead file's path. The sphere at that path is the helper's, where the helper stood, and every line still ends on a sphere.
  await page.keyboard.press("ArrowRight");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "2");
  await settled(page);
  const renamed = byId(await renderedNodes(page));
  expect(renamed.has("src/helper.ts")).toBe(false);
  expect(renamed.get("src/old.ts")).toEqual(beginning.get("src/helper.ts"));
  await expectEveryLineOnSpheres(page, "the rename onto the dead path");
  await page.keyboard.press("End");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "3");
  await settled(page);
  await expectEveryLineOnSpheres(page, "today");
  // And back to the beginning: the helper under its old name, where it stood, and the old file's sphere its own.
  await page.keyboard.press("Home");
  await expect(track(page)).toHaveAttribute("aria-valuenow", "0");
  await settled(page);
  const again = byId(await renderedNodes(page));
  expect(again.get("src/helper.ts")).toEqual(beginning.get("src/helper.ts"));
  expect(again.has("src/old.ts")).toBe(true);
  await expectEveryLineOnSpheres(page, "the beginning again");
});


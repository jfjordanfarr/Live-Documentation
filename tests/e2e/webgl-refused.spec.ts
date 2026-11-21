import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_NAV_KEY, PERSISTED_NAV_VERSION, PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";
import { WEBGL_REFUSED } from "../../packages/explorer/src/client/views/webgl-support";
import { localMapSettled } from "./still-picture";

/**
 * The Explorer in a browser that refuses WebGL (2026-11-21): Chromium launched with `--disable-3d-apis`, which is what a
 * policy or a driver's blocklist does. The root's probe of that day found a link to the 3D map a dead page there, "The
 * Explorer stopped" over an empty map, while the 2D map of the same subject worked
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md`, finding 3). The owner
 * means to show the tool on a VM whose graphics nobody knows: "We want this to be able to run on absolute garbage".
 *
 * A request for the 3D map, by a link, by the remembered choice or by the 3D control, shows the same subject in the 2D
 * map and the address says so; the 3D control stays on the toolbar, unavailable, and says why; the remembered choice of
 * 3D is left for the browser that can draw it. This file alone launches its browser without WebGL: `test.use` with
 * launch options gives the file a worker of its own.
 */
test.use({ launchOptions: { args: ["--disable-3d-apis"] }, viewport: { width: 1280, height: 800 } });

const SUBJECTS = [
  { name: "the estate sample", base: "/samples/estate/", file: "PaymentService/PaymentService.cs" },
  { name: "this repository's map", base: "/", file: "packages/engine/src/live-docs/graph.ts" }
] as const;

/** What the page did wrong: every uncaught error, and the fault panel if it was opened. */
function watchFaults(page: Page): string[] {
  const faults: string[] = [];
  page.on("pageerror", error => faults.push(error.message));
  return faults;
}

/** The remembered navigation as a person who last chose 3D left it, written once before the page first reads it. */
async function rememberThreeD(page: Page, nodeId?: string): Promise<void> {
  await page.addInitScript(({ key, value }) => {
    if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
  }, { key: PERSISTED_NAV_KEY, value: JSON.stringify({ version: PERSISTED_NAV_VERSION, view: "map", perspective: "3d", ...(nodeId ? { nodeId } : {}) }) });
}

async function rememberedNav(page: Page): Promise<{ perspective?: string; nodeId?: string | null } | null> {
  return page.evaluate(key => JSON.parse(window.localStorage.getItem(key) ?? "null"), PERSISTED_NAV_KEY);
}

const threeD = (page: Page) => page.getByRole("button", { name: "3D", exact: true });
const card = (page: Page, id: string) => page.locator(`#map-container .node-card[data-id="${id}"]`);

/** The 2D map of the subject on screen, the 3D one not, no fault shown, and the address saying 2D. */
async function expectTwoDOf(page: Page, file: string, faults: string[]): Promise<void> {
  // The bundle loaded and the first view chosen: this repository's bundle takes seconds to arrive on a busy machine.
  await expect(page.locator("#explorer-loading")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#view-map")).toHaveClass(/\bactive\b/);
  await expect(page.locator("#view-graph")).not.toHaveClass(/\bactive\b/);
  await expect(page.getByRole("heading", { name: "The Explorer stopped" })).toHaveCount(0);
  await expect(page.locator("#view-graph canvas")).toHaveCount(0);
  await localMapSettled(page);
  await expect(card(page, file)).toBeVisible();
  const shown = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
  expect(shown.perspective, "the address says what is shown").toBe("2d");
  expect(shown.selectedNodeId, "the address keeps the subject").toBe(file);
  expect(faults, "no error reached the page").toEqual([]);
}

/** The 3D control is on the toolbar, unavailable in the platform's way, and its name and explanation say why. */
async function expectThreeDRefused(page: Page): Promise<void> {
  const button = threeD(page);
  await expect(button).toBeVisible();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(button).toHaveAccessibleDescription(WEBGL_REFUSED);
  await expect(button).toHaveAttribute("title", WEBGL_REFUSED);
  await expect(page.getByRole("button", { name: "2D", exact: true })).toHaveAttribute("aria-pressed", "true");
}

test("the browser of this file gives no WebGL, so that every case below asks what it means to ask", async ({ page }) => {
  await page.goto("/samples/estate/");
  expect(await page.evaluate(() => !document.createElement("canvas").getContext("webgl2") && !document.createElement("canvas").getContext("webgl"))).toBe(true);
});

for (const subject of SUBJECTS) {
  test(`a link to the 3D map shows its subject in 2D, and the 3D control says why: ${subject.name}`, async ({ page }) => {
    test.setTimeout(subject.base === "/" ? 90_000 : 30_000);
    const faults = watchFaults(page);
    await rememberThreeD(page);
    await page.goto(`${subject.base}?view=local&mode=3d&node=${encodeURIComponent(subject.file)}`);
    await expectTwoDOf(page, subject.file, faults);
    await expectThreeDRefused(page);

    // The explanation is reached by the keyboard too: the control keeps its focus stop, and Enter on it changes nothing.
    await threeD(page).focus();
    await expect(threeD(page)).toBeFocused();
    await page.keyboard.press("Enter");
    await threeD(page).click({ force: true });
    await expectTwoDOf(page, subject.file, faults);
    await expectThreeDRefused(page);

    // The person's remembered choice of 3D stands for the browser that can draw it; the subject was remembered beside it.
    await expect.poll(async () => (await rememberedNav(page))?.nodeId).toBe(subject.file);
    expect((await rememberedNav(page))?.perspective).toBe("3d");
  });
}

test("on a 2D arrival the 3D control becomes unavailable without a press, shortly after the picture is up", async ({ page }) => {
  const subject = SUBJECTS[0];
  const faults = watchFaults(page);
  await page.goto(`${subject.base}?view=local&node=${encodeURIComponent(subject.file)}`);
  await expectTwoDOf(page, subject.file, faults);
  // The browser is asked once the page is idle after its first picture, or within three seconds whatever happens.
  await expect(threeD(page)).toBeDisabled({ timeout: 5_000 });
  await expectThreeDRefused(page);
  await expect(page.locator("details[data-tuning-perspective='3d']:has(#tuning-force-hops) > summary")).toHaveAttribute("aria-disabled", "true");
  expect(faults).toEqual([]);
});

test("Tuning's 3D layout is not offered and says why, and its stored settings are left alone", async ({ page }) => {
  const subject = SUBJECTS[0];
  const faults = watchFaults(page);
  await page.goto(`${subject.base}?view=local&node=${encodeURIComponent(subject.file)}`);
  await expectTwoDOf(page, subject.file, faults);
  const stored = await page.evaluate(key => window.localStorage.getItem(key), PERSISTED_UI_KEY);
  await page.locator(".sidebar-details > summary").click();
  const group = page.locator("details[data-tuning-perspective='3d']:has(#tuning-force-hops)");
  const heading = group.locator(":scope > summary");
  await expect(heading).toBeVisible();
  await expect(heading).toHaveAttribute("aria-disabled", "true");
  await expect(heading).toHaveAttribute("title", WEBGL_REFUSED);
  await expect(heading).toHaveAccessibleDescription(WEBGL_REFUSED);
  // A press and the keyboard open nothing; the heading keeps its focus stop.
  await heading.click();
  await heading.focus();
  await expect(heading).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(group).not.toHaveAttribute("open");
  await expect(page.locator("#tuning-force-hops")).toBeHidden();
  // The History group drives the scrubber both maps share, and stays offered.
  await expect(page.locator("details[data-tuning-perspective='3d']:has(#tuning-history-axis) > summary")).not.toHaveAttribute("aria-disabled");
  expect(await page.evaluate(key => window.localStorage.getItem(key), PERSISTED_UI_KEY), "the stored settings are as they were").toBe(stored);
  expect(faults).toEqual([]);
});

test("the remembered choice of 3D opens its subject in 2D and is still remembered", async ({ page }) => {
  const subject = SUBJECTS[0];
  const faults = watchFaults(page);
  await rememberThreeD(page, subject.file);
  await page.goto(subject.base);
  await expectTwoDOf(page, subject.file, faults);
  await expectThreeDRefused(page);
  await page.reload();
  await expectTwoDOf(page, subject.file, faults);
  expect((await rememberedNav(page))?.perspective).toBe("3d");
});

test("Back or Forward to an entry whose address names 3D shows that place in 2D", async ({ page }) => {
  const subject = SUBJECTS[0];
  const other = "Hub/PaymentHub.cs";
  const faults = watchFaults(page);
  await page.goto(`${subject.base}?view=local&node=${encodeURIComponent(subject.file)}`);
  await expectTwoDOf(page, subject.file, faults);
  // The page writes 2D into every entry it makes here, so an entry that names 3D is one the page did not write: pushed
  // by hand, then left and returned to, as Forward returns to it.
  const threeDPlace = `${subject.base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "3d", selectedNodeId: other })}`;
  await page.evaluate(address => { window.history.pushState({ liveDocsPosition: 1 }, "", address); }, threeDPlace);
  await page.goBack();
  await expect(card(page, subject.file)).toBeVisible();
  await page.goForward();
  await expect(card(page, other)).toBeVisible();
  await expectTwoDOf(page, other, faults);
  await expectThreeDRefused(page);
});

// An entry that differs from the place shown only by naming 3D is restored by the evidence-only return of
// `restoreFromUrl`, which keeps the camera and the picture as they are; its address is rewritten there too.
test("Back or Forward to an entry that differs from the place shown only by naming 3D rewrites its address to 2D", async ({ page }) => {
  const subject = SUBJECTS[0];
  const faults = watchFaults(page);
  await page.goto(`${subject.base}?view=local&node=${encodeURIComponent(subject.file)}`);
  await expectTwoDOf(page, subject.file, faults);
  const shown = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
  await page.evaluate(address => { window.history.pushState({ liveDocsPosition: 1 }, "", address); }, `${subject.base}?s=${compressSnapshot({ ...shown, perspective: "3d" })}`);
  await page.goBack();
  await page.goForward();
  await expect(card(page, subject.file)).toBeVisible();
  await expect.poll(() => decompressSnapshot(new URL(page.url()).searchParams.get("s")!).perspective, { timeout: 3_000 }).toBe("2d");
});

test("a 3D link to a moment of the history shows that moment in 2D", async ({ page }) => {
  const faults = watchFaults(page);
  const base = "/samples/history/";
  const data = await (await page.request.get(`${base}explorer-data.json`)).json() as { history: { file: string } };
  const sequence = await (await page.request.get(`${base}${data.history.file}`)).json() as { steps: Array<{ commit: { id: string } }> };
  // The scripted history's second step, where src/core has become src/engine; its main file stands at every step.
  const commit = sequence.steps[1].commit.id;
  const file = "src/app/main.ts";
  await page.goto(`${base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "3d", selectedNodeId: file, commit,
    pinSet: { entries: [{ nodeId: file, symbol: "*" }] }, filters: { showTests: true, showAssets: false } })}`);
  await expectTwoDOf(page, file, faults);
  await expectThreeDRefused(page);
  await expect(page.locator(".history-track")).toHaveAttribute("aria-valuenow", "2");
  expect(decompressSnapshot(new URL(page.url()).searchParams.get("s")!).commit).toBe(commit);
  expect(faults).toEqual([]);
});

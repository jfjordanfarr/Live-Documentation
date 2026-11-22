import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";
import { readSettled, watchPage } from "./scenarios/instrument";
import { LAWS, routesForward, usesLeftOfferingsRight } from "./scenarios/judgments";
import { displayNames, loadGraph, localMapStill } from "./still-picture";

/**
 * The mirror (2026-11-22): the 2D Local Map's toolbar button draws the same picture the other way round, what uses on
 * the left, and the choice is the person's own. Read on this repository's map, the pathfinder in focus, which has
 * files on both sides of it; nothing remembered but the suite's stilled search.
 */
const SUBJECT = "packages/explorer/src/client/pathfind.ts";
const ADDRESS = `/?view=local&node=${SUBJECT}`;
const button = (page: Page) => page.getByRole("button", { name: "Mirror the map", exact: true });
const layer = (page: Page) => page.locator("#map-viewport");

test.use({ viewport: { width: 1280, height: 800 } });

/** Where each card's middle stands across the page, by its file. */
async function middles(page: Page): Promise<Record<string, { x: number; y: number }>> {
  return page.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .node-card[data-id]")].map(card => {
    const rect = card.getBoundingClientRect();
    return [card.dataset.id!, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }];
  })));
}

test("a press mirrors the picture about the subject, which keeps its place, and the button and the key say so", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  await expect(button(page)).toHaveAttribute("aria-pressed", "false");
  await expect(button(page)).toHaveAttribute("title", /^Mirror the map: /u);
  await expect(layer(page)).not.toHaveAttribute("data-reads", /.*/u);
  const key = page.locator("#local-legend .legend-row--roles");
  await expect(key).toHaveAttribute("title", /uses enters on the left and what it offers leaves on the right/u);
  const before = await middles(page);

  await button(page).click();
  await expect(button(page)).toHaveAttribute("aria-pressed", "true");
  await expect(button(page)).toHaveAttribute("title", /^Mirrored: /u);
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");
  await expect(key).toHaveAttribute("title", /uses enters on the right and what it offers leaves on the left/u);
  await expect(key).toHaveAttribute("aria-description", /uses enters on the right and what it offers leaves on the left/u);
  await localMapStill(page);
  const after = await middles(page);
  const others = Object.keys(before).filter(id => id !== SUBJECT);
  expect(others.length).toBeGreaterThan(1);
  expect(Math.abs(after[SUBJECT].x - before[SUBJECT].x)).toBeLessThan(1);
  for (const id of others) {
    // Every other card stands as far from the subject as it did, on the other side, at the same height.
    expect(Math.abs((after[id].x - after[SUBJECT].x) + (before[id].x - before[SUBJECT].x)), id).toBeLessThan(1);
    expect(Math.abs(after[id].y - before[id].y), id).toBeLessThan(1);
  }

  await button(page).click();
  // The button says so at once; the picture changes when the cut has faded the others out, which is what is waited for.
  await atRest(page, false);
  const back = await middles(page);
  for (const id of Object.keys(before)) expect(Math.abs(back[id].x - before[id].x), id).toBeLessThan(1);
});

test("the keyboard presses it, and its explanation is there for the pointer and the focus alike", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  await button(page).focus();
  await expect(button(page)).toBeFocused();
  // The explanation is the button's title, which a pointer's rest shows, and its accessible name, which the focus reads.
  await expect(button(page)).toHaveAccessibleName("Mirror the map");
  await expect(button(page)).toHaveAttribute("title", /what uses on the left and what offers on the right/u);
  await page.keyboard.press("Enter");
  await expect(button(page)).toHaveAttribute("aria-pressed", "true");
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");
  await expect(button(page)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(button(page)).toHaveAttribute("aria-pressed", "false");
  await expect(layer(page)).not.toHaveAttribute("data-reads", /.*/u);
});

test("the choice outlasts a reload, and no link carries it", async ({ page, browser, baseURL }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  const address = page.url();
  await button(page).click();
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key) ?? "", PERSISTED_UI_KEY)).toContain('"reads":"usesFirst"');
  // The address a person would copy says nothing of it.
  expect(page.url()).toBe(address);

  await page.reload();
  await localMapStill(page);
  await expect(button(page)).toHaveAttribute("aria-pressed", "true");
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");

  // The same address in a browser that has never pressed the button shows the picture as laid out.
  const other = await browser.newContext({ baseURL });
  const fresh = await other.newPage();
  await fresh.goto(address);
  await localMapStill(fresh);
  await expect(button(fresh)).toHaveAttribute("aria-pressed", "false");
  await expect(layer(fresh)).not.toHaveAttribute("data-reads", /.*/u);
  await other.close();
});

test("a mirrored picture keeps every law of the picture, the sides exchanged", async ({ page, baseURL }, testInfo) => {
  const graph = await loadGraph(page, "/");
  const names = displayNames(graph, graph.nodes.map(node => node.id));
  const watch = watchPage(page, baseURL!);
  await page.goto(ADDRESS);
  const broken = (laws: ReturnType<(typeof LAWS)[number]>[]): string[] => laws.filter(verdict => verdict.outcome === "broken").map(verdict => `${verdict.judgment}: ${verdict.findings.join("; ")}`);
  const laidOut = await readSettled(page, { scenario: "the pathfinder as laid out", map: "/", watch, names, shotPath: path.join(testInfo.outputDir, "as-laid-out.png") });
  expect(laidOut.mirrored).toBeUndefined();
  expect(usesLeftOfferingsRight(laidOut)).toMatchObject({ judgment: "uses enter on the left and offerings leave on the right", outcome: "kept" });
  await button(page).click();
  await atRest(page, true);
  const reading = await readSettled(page, { scenario: "the pathfinder mirrored", map: "/", watch, names, shotPath: path.join(testInfo.outputDir, "mirrored.png") });
  expect(reading.mirrored).toBe(true);
  expect(reading.wires.length).toBeGreaterThan(10);
  expect(usesLeftOfferingsRight(reading)).toMatchObject({ judgment: "uses enter on the right and offerings leave on the left", outcome: "kept" });
  expect(routesForward(reading)).toMatchObject({ outcome: "kept" });
  // Said to read the other way, the same picture breaks the law: it is the drawing that is judged, not the saying.
  expect(usesLeftOfferingsRight({ ...reading, mirrored: false }).outcome).toBe("broken");
  // Every other law of the table is kept or broken by the mirrored picture exactly as by the picture as laid out
  // (a tall subject at this window reaches below the frame either way), the law of the sides aside, whose name changes.
  const sides = (verdict: string): boolean => verdict.startsWith("uses enter on the");
  expect(broken(LAWS.map(law => law(reading))).filter(each => !sides(each))).toEqual(broken(LAWS.map(law => law(laidOut))).filter(each => !sides(each)));
});

test("the button is offered only where the picture has a left-to-right rule", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  await expect(button(page)).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator("#view-graph")).toBeVisible();
  await expect(button(page)).toBeHidden();
  await page.goto("/?view=world");
  await expect(page.locator("#world-root")).toBeVisible();
  await expect(button(page)).toBeHidden();
});

/**
 * The motion (Tuning's Mirror Turn, a trial of 2026-11-22): while the picture turns or slides the map's layer says
 * which, and the page is watched for it from before the press, since the motion is over in two thirds of a second.
 */
async function watchMotion(page: Page): Promise<void> {
  await page.evaluate(() => {
    const layer = document.getElementById("map-viewport")!, picture = document.querySelector("#map-container .local-layout")!;
    const held = document.querySelector("#map-container .node-card.local-focus");
    const other = [...document.querySelectorAll("#map-container .node-card")].find(card => card !== held) ?? null;
    const watch = { seen: [] as string[], heldFaintest: 1, heldDimmedBy: "", otherFaintest: 1 };
    (window as unknown as { mirrorWatch: typeof watch }).mirrorWatch = watch;
    /**
     * How strongly an element is drawn within the map: its own opacity and every box's around it up to the map's
     * layer, as the page computes them now. Not further: the view around the map fades in when the page opens, and
     * under a loaded machine that fade was still ending as a case began (found 2026-11-22, the view at 0.98).
     */
    const strength = (element: Element | null): number => {
      let drawn = 1;
      for (let at = element; at && at !== layer.parentElement; at = at.parentElement) drawn *= Number(getComputedStyle(at).opacity);
      return drawn;
    };
    let form: string | null = null, turned = false;
    const frame = (): void => {
      const now = layer.getAttribute("data-turning");
      if (now) {
        form = now;
        // The plane's own turning, as the page computes it: a form named and nothing turned is no motion.
        const angle = Number(/(-?[\d.]+)deg/u.exec(getComputedStyle(picture).rotate)?.[1] ?? 0) % 180;
        if (angle > 1 && angle < 179) turned = true;
      } else if (form) {
        watch.seen.push(`${form}:${turned ? "turned" : "flat"}`);
        form = null;
        turned = false;
      }
      if (held && strength(held) < watch.heldFaintest) {
        watch.heldFaintest = strength(held);
        // Which box dimmed it, so that a failure says whose doing it was.
        for (let at: Element | null = held; at && at !== layer.parentElement; at = at.parentElement) {
          if (Number(getComputedStyle(at).opacity) < 1) watch.heldDimmedBy = `${at.tagName.toLowerCase()}.${at.className} at ${getComputedStyle(at).opacity}, animations: ${at.getAnimations().map(animation => (animation as CSSAnimation).animationName ?? animation.constructor.name).join(",")}, transition: ${getComputedStyle(at).transitionProperty}`;
        }
      }
      if (other) watch.otherFaintest = Math.min(watch.otherFaintest, strength(other));
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
interface MirrorWatch { seen: string[]; heldFaintest: number; heldDimmedBy: string; otherFaintest: number }
const watched = (page: Page): Promise<MirrorWatch> => page.evaluate(() => (window as unknown as { mirrorWatch: MirrorWatch }).mirrorWatch);
const motions = async (page: Page): Promise<string[]> => (await watched(page)).seen;
const seedTurn = async (page: Page, mirrorTurn: string): Promise<void> => void await page.addInitScript(({ key, value }) => localStorage.setItem(key, value),
  { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0, mirrorTurn } } }) });
/** The picture at rest in one of its two states: no motion named, the layer and the button agreeing. */
async function atRest(page: Page, mirrored: boolean): Promise<void> {
  await expect(layer(page)).not.toHaveAttribute("data-turning", /.*/u);
  await expect(button(page)).toHaveAttribute("aria-pressed", String(mirrored));
  if (mirrored) await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");
  else await expect(layer(page)).not.toHaveAttribute("data-reads", /.*/u);
  await localMapStill(page);
}

test("by default the press turns the picture's plane, and the lever chooses the slide or the cut", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  await expect(page.locator("#tuning-mirror-turn")).toHaveValue("turn");
  const before = await middles(page);
  /** As the plane stands edge-on everything but the held card is faded; the held card never is. */
  const othersFadeAndTheHeldCardDoesNot = async (on: Page, form: string): Promise<void> => {
    const strengths = await watched(on);
    expect(strengths.heldFaintest, `${form} (dimmed by ${strengths.heldDimmedBy})`).toBeGreaterThan(0.99);
    // Read at whatever frames the page drew, which under a loaded machine need not include the faintest: any frame of
    // the motion's middle nine tenths shows the others below nine tenths of their strength.
    expect(strengths.otherFaintest, form).toBeLessThan(0.9);
  };
  await watchMotion(page);
  await button(page).click();
  await atRest(page, true);
  expect(await motions(page), "the default names the turn, and the plane turns").toEqual(["turn:turned"]);
  await othersFadeAndTheHeldCardDoesNot(page, "turn");
  // The turn ends in the mirror image: the subject where it stood, every other card as far from it on the other side.
  const after = await middles(page);
  expect(Math.abs(after[SUBJECT].x - before[SUBJECT].x)).toBeLessThan(1);
  for (const id of Object.keys(before)) expect(Math.abs((after[id].x - after[SUBJECT].x) + (before[id].x - before[SUBJECT].x)), id).toBeLessThan(1);

  for (const [form, seen] of [["slide", ["slide:turned"]], ["cut", []]] as const) {
    const other = await page.context().browser()!.newContext({ baseURL: new URL(page.url()).origin, viewport: { width: 1280, height: 800 } });
    const chosen = await other.newPage();
    await seedTurn(chosen, form);
    await chosen.goto(ADDRESS);
    await localMapStill(chosen);
    await expect(chosen.locator("#tuning-mirror-turn")).toHaveValue(form);
    await watchMotion(chosen);
    await button(chosen).click();
    await atRest(chosen, true);
    expect(await motions(chosen), form).toEqual(seen);
    if (form === "slide") await othersFadeAndTheHeldCardDoesNot(chosen, form);
    // Each form ends where the turn does, to the pixel.
    const ended = await middles(chosen);
    for (const id of Object.keys(after)) expect(Math.abs(ended[id].x - after[id].x), `${form}: ${id}`).toBeLessThan(1);
    await other.close();
  }
});

test("reduced motion takes the cut whatever the lever says", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ADDRESS);
  await localMapStill(page);
  await expect(page.locator("#tuning-mirror-turn")).toHaveValue("turn");
  await watchMotion(page);
  await button(page).click();
  await atRest(page, true);
  expect(await motions(page)).toEqual([]);
});

test("a second press before the turn ends leaves the picture in one of its two states, never between", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  const before = await middles(page);
  await watchMotion(page);
  // Both presses in one task of the page, so that the second falls inside the first's motion whatever the machine's load.
  await button(page).evaluate((element: HTMLElement) => { element.click(); element.click(); });
  await atRest(page, false);
  // Long enough for a motion left running by mistake to end and write its state.
  await page.waitForTimeout(900);
  await atRest(page, false);
  const after = await middles(page);
  for (const id of Object.keys(before)) expect(Math.abs(after[id].x - before[id].x), id).toBeLessThan(1);
  // And a press, a pause inside the motion, and a press: the same.
  await button(page).click();
  await page.waitForTimeout(150);
  await button(page).click();
  await atRest(page, false);
  await page.waitForTimeout(900);
  await atRest(page, false);
  const again = await middles(page);
  for (const id of Object.keys(before)) expect(Math.abs(again[id].x - before[id].x), id).toBeLessThan(1);
});

test("the cut fades everything but the held card, which a mirror does not move and so never leaves", async ({ page }) => {
  await seedTurn(page, "cut");
  await page.goto(ADDRESS);
  await localMapStill(page);
  const before = await middles(page);
  await watchMotion(page);
  await button(page).click();
  await atRest(page, true);
  await page.waitForTimeout(500);
  const cut = await watched(page);
  expect(cut.seen).toEqual([]);
  expect(cut.heldFaintest, `the held card keeps its strength throughout (dimmed by ${cut.heldDimmedBy})`).toBeGreaterThan(0.99);
  // Read at whatever frames the page drew: the others are at nothing as the picture changes and a frame near it is enough.
  expect(cut.otherFaintest, "every other card fades while the picture changes").toBeLessThan(0.5);
  const after = await middles(page);
  expect(Math.abs(after[SUBJECT].x - before[SUBJECT].x)).toBeLessThan(1);
});

/**
 * The cut's signs at the edges (Tuning's Cut Counted) count what a step opened past each edge of the view. Mirroring
 * the picture moves every one of those cards, so the signs are counted again as it comes to rest: read on
 * `live-docs/history` opened from the engine's pathfinder, a directory no view holds whole at reading size.
 */
test("a step's cut is counted again when the picture is mirrored: the signs say what lies past each edge now", async ({ page }) => {
  const subject = "packages/engine/src/live-docs/pathfind.ts", history = "packages/engine/src/live-docs/history";
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value),
    { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0, step: "least", cutCounted: "on" } } }) });
  await page.goto(`/?view=local&node=${subject}`);
  await localMapStill(page);
  // Pressed by its own click: where the handle stands is not what is read here.
  await page.getByRole("button", { name: `Open ${history}`, exact: true }).evaluate((handle: HTMLElement) => handle.click());
  await expect(page.locator(`.local-directory-label[data-directory="${history}"]`)).toHaveCount(1, { timeout: 15_000 });
  await localMapStill(page);
  /** What the signs say beside what the page shows: the directory's cards past each edge, each once, at the edge it reaches farthest past. */
  const read = () => page.evaluate(directory => {
    const band = document.querySelector(`.local-directory-label[data-directory="${directory}"]`)!.closest(".local-directory-band")!;
    const frame = document.querySelector(".map-cut-signs")!.getBoundingClientRect();
    const shown: Record<string, number> = {};
    for (const card of band.querySelectorAll<HTMLElement>(".node-card[data-id], .local-directory-closed[data-directory]")) {
      const rect = card.getBoundingClientRect();
      const beyond: Array<[string, number]> = [["left", frame.left - rect.left], ["right", rect.right - frame.right], ["top", frame.top - rect.top], ["bottom", rect.bottom - frame.bottom]];
      const farthest = beyond.filter(([, by]) => by > 0.5).sort((a, b) => b[1] - a[1])[0];
      if (farthest) shown[farthest[0]] = (shown[farthest[0]] ?? 0) + 1;
    }
    const said = Object.fromEntries([...document.querySelectorAll<HTMLElement>(".map-cut-sign:not([hidden])")].map(sign => [sign.dataset.edge!, Number(sign.textContent)]));
    return { shown, said };
  }, history);
  const laidOut = await read();
  expect(Object.keys(laidOut.said).length, "the opened directory goes on past an edge, and that is said").toBeGreaterThan(0);
  expect(laidOut.said).toEqual(laidOut.shown);
  await button(page).click();
  await atRest(page, true);
  const mirrored = await read();
  expect(mirrored.said, "mirrored, the signs say where the cards lie now").toEqual(mirrored.shown);
  expect(mirrored.shown, "and that is not where they lay").not.toEqual(laidOut.shown);
  await button(page).click();
  await atRest(page, false);
  const back = await read();
  expect(back.said).toEqual(back.shown);
});


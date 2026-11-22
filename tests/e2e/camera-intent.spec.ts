import { expect, test, type Browser, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ArrivalFraming, CameraFraming, CutCounted, StepFraming } from "../../packages/explorer/src/client/types";
import { ARRIVAL_FLOOR_RATIO, ARRIVAL_REST_S } from "../../packages/explorer/src/client/views/localView/camera-intent";
import { choose } from "./search-bar";
import { AT_READING_SIZE, loadGraph, localMapSettled } from "./still-picture";

/**
 * The 2D camera follows the intent a gesture declares (2026-11-19). A step from inside the map keeps the camera's scale
 * and brings what it brought into view: the owner, on the cells, "I might wish the camera followed the newly-opened one
 * though, as I quickly lose it." A fresh subject is framed by Tuning's Arrival: at reading size and then eased back to
 * the neighbours, for a reader who must first see that the deepest level of detail exists, its look changed at rest
 * after the ease, the default since 2026-11-22 (the owner, of the three forms: "Reading, Then Neighbours, Look After");
 * the same with the look changed where the zoom crosses its edge, or before the ease; at reading size, the default until
 * then; or on the neighbours at once. The pull-back waits on the person (Arrival Waits and Arrival Rest; the owner the
 * same day: "ensure a minimum of N seconds of reading view size time, then permit immediate zoom-out when pointer exits
 * node"). Read on this repository's `pathfind.ts`, the owner's picture, and the estate's `PaymentsContext.cs`, whose
 * neighbours all fit. A case whose subject is a step, the following camera or the cut counted, and not the arrival,
 * arrives at reading size and says so (`AT_READING_SIZE`, still-picture.ts).
 */

const SUBJECT = "packages/engine/src/live-docs/pathfind.ts";
const HISTORY = "packages/engine/src/live-docs/history";
const ESTATE = "/samples/estate/";
const PAYMENTS = "PaymentService/Data/PaymentsContext.cs";

interface Box { left: number; top: number; right: number; bottom: number }

/** A fresh visitor at an address, with Tuning's Arrival chosen or left to its default, and the continuing search off. */
async function visit(browser: Browser, address: string, arrival?: ArrivalFraming, reducedMotion: "reduce" | "no-preference" = "no-preference") {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, ...(arrival ? { arrival } : {}) } } })
  });
  const page = await context.newPage();
  await page.goto(address);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  return { context, page };
}

/** Waits for the map's rest: the camera's own moves, an arrival's hold and ease among them, and the picture's. */
async function still(page: Page): Promise<void> {
  await localMapSettled(page);
  await page.waitForTimeout(300);
  await localMapSettled(page);
}

/** The camera's frame on screen: the map layer's box under the toolbar, above the controls that float over its foot. */
const frameOf = (page: Page): Promise<Box> => page.evaluate(() => {
  const view = document.querySelector("#view-map")!.getBoundingClientRect(), layer = document.querySelector<HTMLElement>("#map-viewport")!;
  const left = view.left + layer.offsetLeft, top = view.top + layer.offsetTop, right = left + layer.offsetWidth;
  const controls = [...document.querySelectorAll<HTMLElement>(".perspective-controls:not([hidden]), #controls")].map(element => element.getBoundingClientRect())
    .filter(rect => rect.width && rect.height && rect.right > left && rect.left < right && rect.top >= top);
  return { left, top, right, bottom: Math.min(top + layer.offsetHeight, ...controls.map(rect => rect.top)) };
});

const boxOf = (page: Page, selector: string): Promise<Box | null> => page.evaluate(selector => {
  const rect = document.querySelector(selector)?.getBoundingClientRect();
  return rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } : null;
}, selector);

const inside = (box: Box | null, frame: Box): boolean => !!box &&
  box.left >= frame.left - 1 && box.right <= frame.right + 1 && box.top >= frame.top - 1 && box.bottom <= frame.bottom + 1;

/** The camera's scale and the look it draws. */
const cameraOf = (page: Page) => page.evaluate(() => ({
  k: new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a,
  look: document.querySelector<HTMLElement>("#map-container")!.dataset.look,
  moving: document.querySelector<HTMLElement>("#map-container")!.dataset.camera === "moving"
}));

const card = (id: string): string => `#map-container .node-card[data-id="${id}"]`;

test("a cell's press brings its new card wholly into view at the same scale, or its top where it is taller than the view, and marks it", async ({ browser }) => {
  test.setTimeout(120_000);
  // The owner's case: the reading look at pathfind.ts, a cell under live-docs/history. Its first cell's card was placed
  // past the view's right edge; its sixteenth cell's card is taller than the view at this scale.
  for (const index of [0, 15]) {
    // The step is the subject here, taken from reading size as the owner took it: the arrival is held there.
    const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, "reading");
    await still(page);
    const cell = page.locator(`.local-directory-label[data-directory="${HISTORY}"] .local-directory-field .local-directory-cell--file:not([hidden])`).nth(index);
    const path = (await cell.getAttribute("data-path"))!;
    const before = await cameraOf(page);
    await cell.click();
    // The newcomer's outline is drawn emphasised for about a second once the picture has settled.
    await expect(page.locator(`${card(path)}.local-step-mark`)).toHaveCount(1, { timeout: 10_000 });
    await still(page);
    await expect(page.locator(`${card(path)}.local-step-mark`)).toHaveCount(0);
    const after = await cameraOf(page);
    expect(after.k, "a step keeps the camera's scale").toBeCloseTo(before.k, 6);
    const frame = await frameOf(page), drawn = (await boxOf(page, card(path)))!, title = (await boxOf(page, `${card(path)} .node-title`))!;
    if (drawn.bottom - drawn.top <= frame.bottom - frame.top) {
      expect(inside(drawn, frame), `${path}'s card ${JSON.stringify(drawn)} wholly inside ${JSON.stringify(frame)}`).toBe(true);
    } else {
      expect(inside(title, frame), `${path}'s name row ${JSON.stringify(title)} inside ${JSON.stringify(frame)}`).toBe(true);
      expect(drawn.top, `${path}'s card entered at its top`).toBeGreaterThanOrEqual(frame.top - 1);
      expect(drawn.top, `${path}'s card entered at its top`).toBeLessThan(frame.top + 80);
    }
    await context.close();
  }
});

test("Reading Size, the default until 2026-11-22, rests on the subject's card at reading size and stays there", async ({ browser }) => {
  const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, "reading");
  await still(page);
  const rest = await cameraOf(page);
  expect(rest.look).toBe("reading");
  await expect(page.locator("#tuning-arrival")).toHaveValue("reading");
  // Longer than any rest and ease: nothing eases back.
  await page.waitForTimeout(ARRIVAL_REST_S * 1000 + 1600);
  expect(await cameraOf(page)).toEqual(rest);
  await context.close();
});

test("Reading, Then Neighbours rests at reading size, then ends with every card one connection from PaymentsContext.cs in view", async ({ browser }) => {
  test.setTimeout(90_000);
  const reading = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "reading");
  await still(reading.page);
  const readingK = (await cameraOf(reading.page)).k;
  await reading.context.close();
  const { context, page } = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "then-neighbours");
  // It arrives as the default does, at reading size, and says that the camera is busy while it holds there.
  await expect.poll(async () => { const camera = await cameraOf(page); return camera.moving && Math.abs(camera.k - readingK) < 1e-3; },
    { timeout: 5_000, intervals: [20] }).toBe(true);
  await still(page);
  const end = await cameraOf(page);
  expect(end.k).toBeLessThan(readingK);
  expect(end.k).toBeGreaterThanOrEqual(readingK * ARRIVAL_FLOOR_RATIO - 1e-6);
  const graph = await loadGraph(page, ESTATE);
  const id = (end: string | { id: string }): string => typeof end === "string" ? end : end.id;
  const neighbours = new Set(graph.links.flatMap(link => id(link.source) === PAYMENTS ? [id(link.target)] : id(link.target) === PAYMENTS ? [id(link.source)] : [])
    .filter(neighbour => neighbour !== PAYMENTS));
  expect(neighbours.size, "PaymentsContext.cs's neighbours").toBeGreaterThan(3);
  const frame = await frameOf(page);
  for (const neighbour of [PAYMENTS, ...neighbours]) {
    const drawn = await boxOf(page, card(neighbour));
    expect(drawn, `${neighbour} drawn`).not.toBeNull();
    expect(inside(drawn!, frame), `${neighbour} ${JSON.stringify(drawn)} wholly inside ${JSON.stringify(frame)}`).toBe(true);
  }
  await context.close();
});

test("Reading, Then Neighbours on pathfind.ts stops where names still read and centres the subject, its far neighbours cut", async ({ browser }) => {
  test.setTimeout(90_000);
  const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, "then-neighbours");
  await expect.poll(async () => (await cameraOf(page)).look, { timeout: 5_000, intervals: [20] }).toBe("reading");
  const readingK = (await cameraOf(page)).k;
  await still(page);
  const end = await cameraOf(page);
  expect(end.look, "the connections look, where every card's names read").toBe("connections");
  expect(end.k).toBeCloseTo(readingK * ARRIVAL_FLOOR_RATIO, 6);
  const frame = await frameOf(page), subject = (await boxOf(page, card(SUBJECT)))!;
  expect((subject.left + subject.right) / 2).toBeCloseTo((frame.left + frame.right) / 2, 0);
  expect((subject.top + subject.bottom) / 2).toBeCloseTo((frame.top + frame.bottom) / 2, 0);
  await context.close();
});

/**
 * Every frame's scale and look from the page's start, read by the page itself (the pull-back's trials of 2026-11-21:
 * where in the motion the look changes is what they change).
 */
interface LoggedFrame { k: number; look: string; t: number; arrival: string | null }

async function frameLog(page: Page): Promise<LoggedFrame[]> {
  return page.evaluate(() => (window as unknown as { frameLog: LoggedFrame[] }).frameLog);
}

/** A fresh visitor whose page logs every frame: its scale, its look, its time and what the map says of its arrival. */
async function visitLogged(browser: Browser, address: string, localMap: Record<string, string | number>, reducedMotion: "reduce" | "no-preference" = "no-preference") {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, ...localMap } } })
  });
  await context.addInitScript(() => {
    const log: Array<{ k: number; look: string; t: number; arrival: string | null }> = (window as unknown as { frameLog: typeof log }).frameLog = [];
    const tick = (): void => {
      const viewport = document.querySelector<HTMLElement>("#map-viewport"), map = document.querySelector<HTMLElement>("#map-container");
      const k = Number((viewport?.style.transform.match(/scale\(([\d.e-]+)\)/) ?? [])[1]);
      if (map?.dataset.look && Number.isFinite(k)) log.push({ k, look: map.dataset.look, t: performance.now(), arrival: map.dataset.arrival ?? null });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const page = await context.newPage();
  await page.goto(address);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  return { context, page };
}

test("Look After holds the reading look through the whole ease and changes it once at rest; Look Before changes it at reading size before the camera moves", async ({ browser }) => {
  test.setTimeout(120_000);
  for (const arrival of ["then-neighbours-after", "then-neighbours-before"] as const) {
    const { context, page } = await visitLogged(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, { arrival });
    await expect.poll(async () => (await cameraOf(page)).moving, { timeout: 5_000, intervals: [20] }).toBe(true);
    await still(page);
    const log = await frameLog(page), start = log[0].k, end = log.at(-1)!;
    expect(end.look, `${arrival}: it ends in the connections look`).toBe("connections");
    expect(end.k).toBeLessThan(start * 0.5);
    // The frames of the motion: each at a scale between the rest's and the end's.
    const moving = log.filter(frame => frame.k < start - 1e-6 && frame.k > end.k + 1e-6);
    expect(moving.length, `${arrival}: the ease draws frames`).toBeGreaterThan(2);
    const looks = new Set(moving.map(frame => frame.look));
    expect([...looks], `${arrival}: one look through the whole motion`).toEqual([arrival === "then-neighbours-after" ? "reading" : "connections"]);
    if (arrival === "then-neighbours-before") {
      expect(log.some(frame => frame.look === "connections" && Math.abs(frame.k - start) < 1e-6), "the look changed at reading size").toBe(true);
    }
    await context.close();
  }
});

/** What the map says of its arrival: resting, waiting on the person, easing, or nothing. */
const arrivalOf = (page: Page) => page.evaluate(() => document.querySelector<HTMLElement>("#map-container")!.dataset.arrival ?? null);

/** When, by the page's own clock, the first frame after `since` was drawn at a scale below `k`; null when none was. */
const firstBelow = async (page: Page, k: number, since: number): Promise<number | null> =>
  (await frameLog(page)).find(frame => frame.t >= since && frame.k < k - 1e-6)?.t ?? null;

test("the default arrival rests at reading size for the rest, eases back in the reading look and changes the look once at its end", async ({ browser }) => {
  test.setTimeout(120_000);
  // Nothing chosen: the product's own defaults, with only the continuing search off.
  const { context, page } = await visitLogged(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, {});
  await expect(page.locator("#tuning-arrival")).toHaveValue("then-neighbours-after");
  await expect(page.locator("#tuning-arrival-waits")).toHaveValue("attended");
  await expect(page.locator("#tuning-arrival-rest")).toHaveValue(String(ARRIVAL_REST_S));
  await expect.poll(() => arrivalOf(page), { timeout: 5_000, intervals: [20] }).toBe("resting");
  await still(page);
  expect(await arrivalOf(page), "the arrival is over").toBeNull();
  const log = await frameLog(page), start = log[0].k, end = log.at(-1)!;
  expect(end.look, "it ends in the connections look, where every card's names read").toBe("connections");
  expect(end.k).toBeCloseTo(start * ARRIVAL_FLOOR_RATIO, 6);
  // At reading size for at least the rest, counted on the page's own clock from the first frame it said it rested.
  const rested = log.find(frame => frame.arrival === "resting")!, eased = log.find(frame => frame.k < start - 1e-6)!;
  expect(eased.t - rested.t, "the rest at reading size").toBeGreaterThanOrEqual(ARRIVAL_REST_S * 1000);
  // Nobody pointed at the card or focused it: it never waited on anyone, and went when the rest had passed.
  expect(log.some(frame => frame.arrival === "waiting"), "it waited on nobody").toBe(false);
  // The reading look through the whole ease, and one change, at rest at its end.
  const moving = log.filter(frame => frame.k < start - 1e-6 && frame.k > end.k + 1e-6);
  expect(moving.length, "the ease draws frames").toBeGreaterThan(2);
  expect([...new Set(moving.map(frame => frame.look))], "one look through the whole motion").toEqual(["reading"]);
  expect(log.filter((frame, index) => index > 0 && frame.look !== log[index - 1].look).length, "the look changes once").toBe(1);
  const subject = (await boxOf(page, card(SUBJECT)))!, frame = await frameOf(page);
  expect((subject.left + subject.right) / 2).toBeCloseTo((frame.left + frame.right) / 2, 0);
  await context.close();
});

test("the default arrival waits while the pointer is on the card it arrived at, at rest and at reading size, and eases back as soon as the pointer leaves", async ({ browser }) => {
  test.setTimeout(120_000);
  const { context, page } = await visitLogged(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, {});
  await expect.poll(() => arrivalOf(page), { timeout: 5_000, intervals: [20] }).toBe("resting");
  const name = (await page.locator(`${card(PAYMENTS)} .local-file-name`).boundingBox())!;
  await page.mouse.move(name.x + name.width / 2, name.y + name.height / 2, { steps: 4 });
  // Past its rest it waits on the reader, and says so: the camera does not move, and whoever waits for rest has it.
  await expect.poll(() => arrivalOf(page), { timeout: 10_000, intervals: [50] }).toBe("waiting");
  expect((await cameraOf(page)).moving, "waiting on the reader, the camera is at rest").toBe(false);
  // Reading size, read once the camera's own move to it has ended.
  const readingK = (await cameraOf(page)).k;
  // Twice the rest more, the pointer still on the card: nothing has moved.
  await page.waitForTimeout(ARRIVAL_REST_S * 2000);
  expect(await arrivalOf(page)).toBe("waiting");
  expect((await cameraOf(page)).k, "still at reading size").toBeCloseTo(readingK, 6);
  // The pointer leaves the card for the empty map at the view's foot: the ease begins at once, with no second rest.
  const left = await page.evaluate(() => performance.now());
  await page.mouse.move(2, 890, { steps: 4 });
  await expect.poll(() => firstBelow(page, readingK, left), { timeout: 5_000, intervals: [20] }).not.toBeNull();
  const began = (await firstBelow(page, readingK, left))!;
  expect(began - left, "the pull-back begins as soon as the pointer is off the card").toBeLessThan(500);
  await still(page);
  expect((await cameraOf(page)).k).toBeLessThan(readingK);
  expect(await arrivalOf(page)).toBeNull();
  await context.close();
});

test("the keyboard's focus holds the default arrival as the pointer does: inside the card it waits, a Tab within the card keeps it, and it eases back when the focus leaves", async ({ browser }) => {
  test.setTimeout(120_000);
  const { context, page } = await visitLogged(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, {});
  await expect.poll(() => arrivalOf(page), { timeout: 5_000, intervals: [20] }).toBe("resting");
  // The focus comes to the card's name as a keyboard brings it: no pointer has been used on this page.
  await page.locator(`${card(PAYMENTS)} .local-file-name`).focus();
  const inCard = () => page.evaluate(id => !!document.activeElement?.closest(`.node-card[data-id="${CSS.escape(id)}"]`), PAYMENTS);
  expect(await page.evaluate(() => document.activeElement?.matches(":focus-visible")), "the focus is a keyboard's").toBe(true);
  await expect.poll(() => arrivalOf(page), { timeout: 10_000, intervals: [50] }).toBe("waiting");
  // Reading size, read once the camera's own move to it has ended.
  const readingK = (await cameraOf(page)).k;
  await page.waitForTimeout(ARRIVAL_REST_S * 1000);
  expect((await cameraOf(page)).k, "still at reading size").toBeCloseTo(readingK, 6);
  // A key that only moves the focus is no act on the picture: on to the card's next control, the arrival still waits.
  await page.keyboard.press("Tab");
  expect(await inCard(), "the next stop is in the same card").toBe(true);
  await page.waitForTimeout(300);
  expect(await arrivalOf(page), "a Tab inside the card neither ends the arrival nor lets it go").toBe("waiting");
  // Back out of the card, a stop at a time: the pull-back begins when the focus has left it.
  const left = await page.evaluate(() => performance.now());
  for (let presses = 0; presses < 6 && await inCard(); presses += 1) await page.keyboard.press("Shift+Tab");
  expect(await inCard(), "the focus left the card").toBe(false);
  await expect.poll(() => firstBelow(page, readingK, left), { timeout: 5_000, intervals: [20] }).not.toBeNull();
  await still(page);
  expect((await cameraOf(page)).k).toBeLessThan(readingK);
  await context.close();
});

test("a person who moves the camera while the default arrival waits has taken it: no pull-back follows when the pointer leaves the card", async ({ browser }) => {
  test.setTimeout(120_000);
  const { context, page } = await visitLogged(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, {});
  await expect.poll(() => arrivalOf(page), { timeout: 5_000, intervals: [20] }).toBe("resting");
  const name = (await page.locator(`${card(PAYMENTS)} .local-file-name`).boundingBox())!;
  await page.mouse.move(name.x + name.width / 2, name.y + name.height / 2, { steps: 4 });
  await expect.poll(() => arrivalOf(page), { timeout: 10_000, intervals: [50] }).toBe("waiting");
  // Their own camera move, a turn of the wheel on the card.
  await page.mouse.wheel(0, 120);
  await still(page);
  expect(await arrivalOf(page), "the arrival ended where it stood").toBeNull();
  const taken = await cameraOf(page);
  await page.mouse.move(2, 890, { steps: 4 });
  // Longer than any rest and ease: the picture is theirs and stays where they put it.
  await page.waitForTimeout(ARRIVAL_REST_S * 1000 + 1600);
  expect(await cameraOf(page)).toEqual(taken);
  await context.close();
});

test("where the person prefers reduced motion, the default arrival is on the neighbours at once, with no rest and no ease", async ({ browser }) => {
  test.setTimeout(90_000);
  const reduced = await visitLogged(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, {}, "reduce");
  await still(reduced.page);
  const log = await frameLog(reduced.page), first = await cameraOf(reduced.page);
  await reduced.context.close();
  const neighbours = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "neighbours");
  await still(neighbours.page);
  const end = await cameraOf(neighbours.page);
  await neighbours.context.close();
  expect(first.k, "the neighbours' frame").toBeCloseTo(end.k, 6);
  expect(first.look).toBe(end.look);
  expect(log.some(frame => frame.arrival !== null), "no arrival rested, waited or eased").toBe(false);
});

test("Arrival Waits, Never and the trial of 2026-11-21: never, the pull-back goes while the pointer rests on the card; in the trial, a pointer brought to the card holds the rest until it leaves", async ({ browser }) => {
  test.setTimeout(120_000);
  for (const arrivalWaits of ["never", "pointed"] as const) {
    const { context, page } = await visitLogged(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, { arrival: "then-neighbours", arrivalWaits });
    await expect.poll(async () => { const camera = await cameraOf(page); return camera.moving && camera.look === "reading"; }, { timeout: 5_000, intervals: [20] }).toBe(true);
    const readingK = (await cameraOf(page)).k;
    const name = (await page.locator(`${card(SUBJECT)} .local-file-name`).boundingBox())!;
    await page.mouse.move(name.x + name.width / 2, name.y + name.height / 2, { steps: 4 });
    // Three seconds when the rest was 0.9 s, fixed, as this case was written; longer by what the rest is longer since.
    await page.waitForTimeout(3000 + ARRIVAL_REST_S * 1000 - 900);
    const held = (await cameraOf(page)).k;
    if (arrivalWaits === "never") expect(held, "never: pulled back while the pointer rests on the card").toBeLessThan(readingK * 0.9);
    else {
      expect(held, "while pointed at: still at reading size").toBeCloseTo(readingK, 6);
      await page.mouse.move(2, 890, { steps: 4 });
      await expect.poll(async () => (await cameraOf(page)).k, { timeout: 10_000 }).toBeLessThan(readingK * 0.9);
    }
    await context.close();
  }
});

test("the person's input during the rest ends the arrival where it stands, under the default and under Reading, Then Neighbours", async ({ browser }) => {
  test.setTimeout(90_000);
  for (const arrival of [undefined, "then-neighbours"] as const) {
    const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, arrival);
    await expect.poll(async () => { const camera = await cameraOf(page); return camera.moving && camera.look === "reading"; }, { timeout: 5_000, intervals: [20] }).toBe(true);
    const frame = await frameOf(page);
    await page.mouse.move((frame.left + frame.right) / 2, (frame.top + frame.bottom) / 2);
    await page.mouse.wheel(0, 1);
    await still(page);
    const at = await cameraOf(page);
    // Longer than any rest and ease.
    await page.waitForTimeout(ARRIVAL_REST_S * 1000 + 1600);
    const later = await cameraOf(page);
    expect(later, arrival ?? "the default").toEqual(at);
    expect(later.look, "the camera never eased back to the neighbours").toBe("reading");
    await context.close();
  }
});

test("where the person prefers reduced motion, Reading, Then Neighbours arrives on the neighbours at once, as Neighbours does", async ({ browser }) => {
  const reduced = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "then-neighbours", "reduce");
  await localMapSettled(reduced.page);
  const first = await cameraOf(reduced.page);
  await reduced.context.close();
  const neighbours = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`, "neighbours");
  await still(neighbours.page);
  const end = await cameraOf(neighbours.page);
  await neighbours.context.close();
  expect(first.look).toBe("connections");
  expect(first.k).toBeCloseTo(end.k, 6);
});

test("a link carries Arrival: a fresh browser opens the link's choice", async ({ browser }) => {
  const link = `${ESTATE}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: PAYMENTS, pinSet: { entries: [{ nodeId: PAYMENTS, symbol: "*" }] },
    layout: { localMap: { arrival: "neighbours" } } })}`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(link);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  await still(page);
  expect((await cameraOf(page)).look).toBe("connections");
  await expect(page.locator("#tuning-arrival")).toHaveValue("neighbours");
  await context.close();
});

/**
 * The camera that follows the pins (Tuning → 2D Layout → Framing, Follows Pins; a trial of 2026-11-19 for the owner's
 * eye). The owner, Turn 37 of the November 18 record: "follow the sucker for a bit if the user hasn't provided input to
 * navigate", "try to frame every pinned thing as best you can with bias towards most recent items", and of two pinned
 * symbols, "having the camera really zoom in to care only about those two symbols". Each case reads the lever both ways:
 * By Hand is today's camera, and the case's promise fails there.
 */
const ROW = "PaymentService/Data/PostPaymentRow.cs";

/** A fresh visitor at an address with Tuning's Framing chosen, the continuing search off, once the map is still. */
async function visitFraming(browser: Browser, address: string, framing: CameraFraming) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, framing } } })
  });
  const page = await context.newPage();
  await page.goto(address);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  await still(page);
  return { context, page };
}

const link = (base: string, pins: Array<{ nodeId: string; symbol: string }>, selected: string) =>
  `${base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: selected, pinSet: { entries: pins } })}`;

const scaleOf = (page: Page): Promise<number> => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a);

const row = (id: string, symbol: string): string => `${card(id)} .symbol-row[data-symbol="${symbol}"]`;
const cell = (page: Page) => page.locator(`.local-directory-label[data-directory="${HISTORY}"] .local-directory-field .local-directory-cell--file:not([hidden])`).first();
const follow = (page: Page) => page.locator(".perspective-controls button[aria-label='Follow pins']");

test("following, the owner's two pinned symbols are framed with their cards' names; by hand they are not", async ({ browser }) => {
  test.setTimeout(90_000);
  const pins = [{ nodeId: ROW, symbol: "PostPaymentRow" }, { nodeId: PAYMENTS, symbol: "PostPayment" }];
  const seen: Record<string, boolean> = {};
  for (const framing of ["hand", "follows"] as const) {
    const { context, page } = await visitFraming(browser, link(ESTATE, pins, PAYMENTS), framing);
    const frame = await frameOf(page);
    const parts = [row(ROW, "PostPaymentRow"), `${card(ROW)} .node-title`, row(PAYMENTS, "PostPayment"), `${card(PAYMENTS)} .node-title`];
    const boxes = await Promise.all(parts.map(part => boxOf(page, part)));
    seen[framing] = boxes.every(box => inside(box, frame));
    if (framing === "follows") expect(seen[framing], `${JSON.stringify(boxes)} inside ${JSON.stringify(frame)}`).toBe(true);
    await context.close();
  }
  expect(seen.hand, "by hand, the arrival frames the subject's card alone").toBe(false);
});

test("following, a cell's press far from the subject frames the new card and says the subject is left out; by hand it pans at its scale and says nothing", async ({ browser }) => {
  test.setTimeout(120_000);
  // The owner's case: the first history cell's card lands about 2,700 map px below pathfind.ts's name, farther than the
  // floor can hold beside it in a 900 px window, so the newest is framed alone and the subject said left out. After the hold
  // of the pressed handle the rest of the move is under a frame's diagonal at this size, so it eases flat; at 390 px it
  // takes the smooth zoom's path (the evidence's README), which camera-intent.test.ts holds to its shape.
  for (const framing of ["hand", "follows"] as const) {
    const { context, page } = await visitFraming(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, framing);
    const before = await scaleOf(page);
    const target = cell(page);
    const path = (await target.getAttribute("data-path"))!;
    await target.click();
    await expect(page.locator(card(path))).toHaveCount(1);
    await still(page);
    const frame = await frameOf(page), map = page.locator("#map-container");
    expect(inside(await boxOf(page, `${card(path)} .node-title`), frame), "the new card's name in view").toBe(true);
    if (framing === "follows") {
      await expect(map).toHaveAttribute("data-framing-path", /^(smooth|flat)$/);
      expect((await map.getAttribute("data-framing-left-out"))?.split(" ")).toContain(SUBJECT);
    } else {
      expect(await scaleOf(page), "a step keeps the camera's scale").toBeCloseTo(before, 6);
      expect(await map.getAttribute("data-framing-path"), "by hand there is no following path").toBeNull();
    }
    await context.close();
  }
});

test("the person's wheel takes the camera: a new pin then only pans at the same scale, and Fit gives the following back", async ({ browser }) => {
  test.setTimeout(120_000);
  const { context, page } = await visitFraming(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, "follows");
  await expect(follow(page)).toHaveAttribute("aria-pressed", "true");
  const frame = await frameOf(page), map = page.locator("#map-container");
  await page.mouse.move((frame.left + frame.right) / 2, (frame.top + frame.bottom) / 2);
  await page.mouse.wheel(0, 200);
  await still(page);
  await expect(follow(page)).toHaveAttribute("aria-pressed", "false");
  const before = await scaleOf(page);
  const target = cell(page);
  const path = (await target.getAttribute("data-path"))!;
  await target.click();
  await expect(page.locator(card(path))).toHaveCount(1);
  await still(page);
  expect(await scaleOf(page), "the person's frame keeps its scale").toBeCloseTo(before, 6);
  expect(await map.getAttribute("data-framing-left-out"), "nothing is said left out while the person holds the camera").toBeNull();
  await follow(page).click();
  await expect(follow(page)).toHaveAttribute("aria-pressed", "true");
  await still(page);
  expect(inside(await boxOf(page, `${card(path)} .node-title`), await frameOf(page)), "Fit frames the newest pin again").toBe(true);
  expect((await map.getAttribute("data-framing-left-out"))?.split(" ")).toContain(SUBJECT);
  await context.close();
});

test("following, the continuing search's rearrangement never zooms in and keeps both pins' names in view; by hand it does not hold them", async ({ browser }) => {
  test.setTimeout(120_000);
  const pins = ["packages/engine/src/live-docs/graph.ts", SUBJECT].map(nodeId => ({ nodeId, symbol: "*" }));
  for (const framing of ["hand", "follows"] as const) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 6, framing } } })
    });
    const page = await context.newPage();
    await page.goto(link("/", pins, SUBJECT));
    await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
    const first = await scaleOf(page);
    await still(page);
    const frame = await frameOf(page);
    const names = [inside(await boxOf(page, `${card(pins[0].nodeId)} .node-title`), frame), inside(await boxOf(page, `${card(SUBJECT)} .node-title`), frame)];
    if (framing === "follows") {
      expect(await scaleOf(page), "the search's re-frame never zooms in").toBeLessThanOrEqual(first + 1e-6);
      expect(names, "both pins' names held").toEqual([true, true]);
    } else expect(names.every(Boolean), "by hand the arrival frames the subject alone").toBe(false);
    await context.close();
  }
});

test("following, pins that cannot all be framed leave the oldest out, always frame the newest, and the tray says so", async ({ browser }) => {
  test.setTimeout(90_000);
  const files = ["packages/engine/src/live-docs/graph.ts", "scripts/live-docs/visualize-static.ts", "packages/explorer/src/client/index.ts",
    "packages/engine/src/live-docs/history/codec.ts", SUBJECT];
  const pins = files.map(nodeId => ({ nodeId, symbol: "*" }));
  for (const framing of ["hand", "follows"] as const) {
    const { context, page } = await visitFraming(browser, link("/", pins, SUBJECT), framing);
    const leftOut = await page.locator("#map-container").getAttribute("data-framing-left-out");
    if (framing === "hand") expect(leftOut, "by hand nothing is framed for the pins").toBeNull();
    else {
      expect(leftOut?.split(" ")[0], "the oldest pin is the first left out").toBe(files[0]);
      expect(leftOut?.split(" "), "the newest is never left out").not.toContain(SUBJECT);
      const frame = await frameOf(page);
      expect(inside(await boxOf(page, `${card(SUBJECT)} .node-title`), frame)).toBe(true);
    }
    // The pin tray says which pins are outside the frame, in its quiet words and in the row's name.
    await page.locator(".pin-tray-toggle").click();
    const oldest = page.locator(`.pin-tray-row[data-retained-key='${JSON.stringify(["pin", files[0], "*"])}'] .pin-tray-subject`);
    if (framing === "follows") await expect(oldest).toHaveAttribute("aria-label", /outside the frame$/);
    else await expect(oldest).not.toHaveAttribute("aria-label", /outside the frame/);
    await context.close();
  }
});

/**
 * What a step frames (Tuning → 2D Layout → Step; a trial of 2026-11-21, the root's brief after blind testers answered
 * from a cut-off view). Opening `live-docs/history` from pathfind.ts at reading size, a directory too large to stand
 * whole at that scale. Least Pan, the default, is the case above; these are the trial's other camera values.
 */
async function visitStep(browser: Browser, step: StepFraming, cutCounted: CutCounted = "off") {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, step, cutCounted } } })
  });
  const page = await context.newPage();
  await page.goto(`/?view=local&node=${encodeURIComponent(SUBJECT)}`);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  await still(page);
  return { context, page };
}

const band = (directory: string): string => `.local-directory-band:has(> .local-directory-label[data-directory="${directory}"])`;

/** The label of an opened directory and the first row it holds under the label, on screen. */
const labelAndFirstRow = (page: Page, directory: string): Promise<{ label: Box; row: Box[] }> => page.evaluate(directory => {
  const box = (rect: DOMRect) => ({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
  const label = document.querySelector(`.local-directory-label[data-directory="${directory}"]`)!;
  const band = label.closest(".local-directory-band")!, head = label.getBoundingClientRect();
  const held = [...band.querySelectorAll<HTMLElement>(".node-card, .local-directory-closed, .local-directory-band")]
    .filter(element => element.parentElement?.closest(".local-directory-band") === band).map(element => element.getBoundingClientRect())
    .filter(rect => rect.top >= head.top);
  const top = Math.min(...held.map(rect => rect.top));
  return { label: box(head), row: held.filter(rect => rect.top <= top + 8).map(box) };
}, directory);

test("Least Pan: a directory opened by the handle on its drawn label is a step, its label and first row brought into view at the same scale", async ({ browser }) => {
  test.setTimeout(120_000);
  const { context, page } = await visitStep(browser, "least");
  const before = await scaleOf(page);
  await page.getByRole("button", { name: `Open ${HISTORY}`, exact: true }).click();
  await expect(page.locator(`${band(HISTORY)}`)).toHaveCount(1, { timeout: 15_000 });
  await still(page);
  expect(await scaleOf(page), "a step keeps the scale").toBeCloseTo(before, 6);
  const frame = await frameOf(page), { label, row } = await labelAndFirstRow(page, HISTORY);
  expect(inside(label, frame), `the opened directory's label ${JSON.stringify(label)} inside ${JSON.stringify(frame)}`).toBe(true);
  expect(row.length, "a first row under the label").toBeGreaterThan(0);
  for (const box of row) expect(inside(box, frame), `its first row ${JSON.stringify(box)} inside ${JSON.stringify(frame)}`).toBe(true);
  await context.close();
});

for (const step of ["whole", "lines"] as const) {
  test(`Step, ${step}: a directory no scale at or above the floor holds whole is not eased out; the step is Least Pan's`, async ({ browser }) => {
    test.setTimeout(120_000);
    const { context, page } = await visitStep(browser, step);
    const before = await scaleOf(page);
    await page.getByRole("button", { name: `Open ${HISTORY}`, exact: true }).click();
    await expect(page.locator(`${band(HISTORY)}`)).toHaveCount(1, { timeout: 15_000 });
    await still(page);
    expect(await scaleOf(page), "the scale kept: an ease out that cannot deliver the whole is not taken").toBeCloseTo(before, 6);
    const frame = await frameOf(page), { label, row } = await labelAndFirstRow(page, HISTORY);
    expect(inside(label, frame), `the opened directory's label ${JSON.stringify(label)} inside ${JSON.stringify(frame)}`).toBe(true);
    for (const box of row) expect(inside(box, frame), `its first row ${JSON.stringify(box)} inside ${JSON.stringify(frame)}`).toBe(true);
    await context.close();
  });
}

test("Step, With Its Lines: Data opened inside the estate's PaymentService is framed whole with every card its lines reach", async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, step: "lines" } } })
  });
  const page = await context.newPage();
  await page.goto(ESTATE);
  await page.waitForSelector("#view-world.active", { timeout: 20_000 });
  await choose(page, "subject", "PaymentService", { directory: "PaymentService" });
  await expect(page.locator(band("PaymentService"))).toHaveCount(1, { timeout: 15_000 });
  await still(page);
  const before = await scaleOf(page);
  await page.getByRole("button", { name: "Open PaymentService/Data", exact: true }).click();
  await expect(page.locator(band("PaymentService/Data"))).toHaveCount(1, { timeout: 15_000 });
  await still(page);
  const after = await scaleOf(page);
  expect(after, "eased out, never past the floor").toBeLessThan(before);
  expect(after).toBeGreaterThanOrEqual(before * ARRIVAL_FLOOR_RATIO * 0.999);
  const frame = await frameOf(page);
  for (const id of ["PaymentService/Data/PostPaymentRow.cs", "PaymentService/Data/Payment.cs", "PaymentService/Data/PaymentsContext.cs", "PaymentService/PaymentService.cs", "PaymentService/App.config"]) {
    expect(inside(await boxOf(page, card(id)), frame), `${id} whole in view`).toBe(true);
  }
  await context.close();
});

/**
 * The cut said at the edges (Tuning → 2D Layout → Cut Counted, a trial of 2026-11-21): after a step, at each edge past
 * which what it opened goes on, an arrow and the count of its cards there, a control that pans to them. Read on
 * live-docs/history opened by its handle, which no frame holds whole at reading scale; off, nothing is said.
 */
test("Cut Counted: the edges past which an opened directory goes on each say how many of its cards lie there, and a press pans to them", async ({ browser }) => {
  test.setTimeout(120_000);
  const signs = (page: Page) => page.locator(".map-cut-sign:not([hidden])");
  for (const cutCounted of ["off", "on"] as const) {
    const { context, page } = await visitStep(browser, "least", cutCounted);
    await page.getByRole("button", { name: `Open ${HISTORY}`, exact: true }).click();
    await expect(page.locator(`${band(HISTORY)}`)).toHaveCount(1, { timeout: 15_000 });
    await still(page);
    if (cutCounted === "off") {
      await expect(signs(page), "off, nothing is said").toHaveCount(0);
      await context.close();
      continue;
    }
    // What the page says is what the page shows: each sign's count is the number of the directory's cards past its edge.
    const read = () => page.evaluate(directory => {
      const label = document.querySelector(`.local-directory-label[data-directory="${directory}"]`)!;
      const band = label.closest(".local-directory-band")!;
      const frame = document.querySelector(".map-cut-signs")!.getBoundingClientRect();
      const cards = [...band.querySelectorAll<HTMLElement>(".node-card[data-id], .local-directory-closed[data-directory]")].map(card => card.getBoundingClientRect());
      // Each card not wholly in view counted once, at the edge it reaches farthest past, a tie to the left or right.
      const past: Record<string, number> = { left: 0, right: 0, top: 0, bottom: 0 };
      let cut = 0;
      for (const rect of cards) {
        const beyond: Array<[string, number]> = [["left", frame.left - rect.left], ["right", rect.right - frame.right], ["top", frame.top - rect.top], ["bottom", rect.bottom - frame.bottom]];
        const farthest = beyond.filter(([, by]) => by > 0.5).sort((a, b) => b[1] - a[1])[0];
        if (farthest) { past[farthest[0]]++; cut++; }
      }
      const said = Object.fromEntries([...document.querySelectorAll<HTMLElement>(".map-cut-sign:not([hidden])")].map(sign => [sign.dataset.edge, Number(sign.textContent)]));
      return { past: Object.fromEntries(Object.entries(past).filter(([, count]) => count > 0)), said, cut };
    }, HISTORY);
    const first = await read();
    expect(Object.keys(first.said).length, "the opened directory goes on past at least one edge, and that is said").toBeGreaterThan(0);
    expect(first.said).toEqual(first.past);
    expect(Object.values(first.said as Record<string, number>).reduce((sum, count) => sum + count, 0), "the counts sum to the cards not wholly in view").toBe(first.cut);
    const edge = Object.keys(first.said)[0];
    const sign = page.locator(`.map-cut-sign[data-edge="${edge}"]`);
    await expect(sign).toHaveAccessibleName(new RegExp(`^${first.said[edge]} cards? of what you opened`));
    await expect(sign).toHaveAttribute("title", new RegExp(`^${first.said[edge]} cards? of what you opened`));
    const before = await scaleOf(page);
    await sign.focus();
    await page.keyboard.press("Enter");
    await still(page);
    expect(await scaleOf(page), "a sign pans; it does not zoom").toBeCloseTo(before, 6);
    const second = await read();
    expect(second.said).toEqual(second.past);
    expect(second.said[edge] ?? 0, `fewer of its cards past the ${edge} edge after its sign was pressed`).toBeLessThan(first.said[edge]);
    await context.close();
  }
});

test("a link carries Step: a fresh browser opens the link's choice", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${ESTATE}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: PAYMENTS, layout: { localMap: { step: "lines" } } })}`);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  await expect(page.locator("#tuning-step")).toHaveValue("lines");
  await context.close();
});

test("a folder chosen in the search stands whole in the frame, not centred on its name with the window's upper half empty", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0 } } })
  });
  const page = await context.newPage();
  await page.goto(ESTATE);
  await page.waitForSelector("#view-world.active", { timeout: 20_000 });
  await choose(page, "subject", "PaymentService", { directory: "PaymentService" });
  await expect(page.locator(band("PaymentService"))).toHaveCount(1, { timeout: 15_000 });
  await still(page);
  const frame = await frameOf(page), drawn = (await boxOf(page, band("PaymentService")))!;
  expect(drawn.bottom - drawn.top, "the estate's PaymentService fits the frame at its scale").toBeLessThan(frame.bottom - frame.top);
  expect(inside(drawn, frame), `the folder ${JSON.stringify(drawn)} whole inside ${JSON.stringify(frame)}`).toBe(true);
  const above = drawn.top - frame.top, below = frame.bottom - drawn.bottom;
  expect(Math.abs(above - below), `centred: ${above} px above it, ${below} px below`).toBeLessThan(24);
  await context.close();
});

test("a folder chosen in the search that no frame holds is entered at its label and its first row, at reading size", async ({ browser }) => {
  // The search's builder's picture of 2026-11-21: live-docs/history chosen in the search beside pathfind.ts opened and
  // left its label below the window, the camera entering the folder's box at its top-left, which in Flow stands some
  // 2,000 px above the label, beside the columns of the folder that holds it. A step's rule is the one that holds here.
  test.setTimeout(120_000);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0 } } })
  });
  const page = await context.newPage();
  await page.goto(`/?view=local&mode=2d&node=${encodeURIComponent(SUBJECT)}`);
  await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
  await still(page);
  await choose(page, "subject", "live-docs/history", { directory: HISTORY });
  await expect(page.locator(band(HISTORY))).toHaveCount(1, { timeout: 15_000 });
  await still(page);
  const frame = await frameOf(page), drawn = (await boxOf(page, band(HISTORY)))!;
  expect(drawn.bottom - drawn.top, "no frame at reading size holds the folder").toBeGreaterThan(frame.bottom - frame.top);
  expect((await cameraOf(page)).k, "at reading size").toBeCloseTo(1, 3);
  const label = `.local-directory-label[data-directory="${HISTORY}"]`;
  expect(inside(await boxOf(page, label), frame), `the folder's label ${JSON.stringify(await boxOf(page, label))} inside ${JSON.stringify(frame)}`).toBe(true);
  // Its first row: the cards it holds directly that stand highest below its label.
  const firstRow = await page.evaluate(selector => {
    const head = document.querySelector(selector)!, folder = head.closest(".local-directory-band")!, top = head.getBoundingClientRect().top;
    const held = [...folder.querySelectorAll<HTMLElement>(".node-card, .local-directory-closed")]
      .filter(element => element.parentElement?.closest(".local-directory-band") === folder)
      .map(element => element.getBoundingClientRect()).filter(box => box.top >= top);
    const highest = Math.min(...held.map(box => box.top));
    return held.filter(box => box.top <= highest + 8).map(box => ({ left: box.left, top: box.top, right: box.right, bottom: box.bottom }));
  }, label);
  expect(firstRow.length, "the folder holds cards under its label").toBeGreaterThan(0);
  for (const box of firstRow) expect(box.top, "the first row's top in view").toBeLessThan(frame.bottom);
  expect(firstRow.some(box => inside(box, frame) || (box.left < frame.right && box.top >= frame.top && box.top < frame.bottom)), "a card of the first row in view").toBe(true);
  await context.close();
});

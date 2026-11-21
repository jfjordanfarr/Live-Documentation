import { expect, test, type Browser, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ArrivalFraming, CameraFraming, StepFraming } from "../../packages/explorer/src/client/types";
import { ARRIVAL_FLOOR_RATIO } from "../../packages/explorer/src/client/views/localView/camera-intent";
import { choose } from "./search-bar";
import { loadGraph, localMapSettled } from "./still-picture";

/**
 * The 2D camera follows the intent a gesture declares (2026-11-19). A step from inside the map keeps the camera's scale
 * and brings what it brought into view: the owner, on the cells, "I might wish the camera followed the newly-opened one
 * though, as I quickly lose it." A fresh subject is framed by Tuning's Arrival: at reading size, the default; at reading
 * size and then eased back to the neighbours, the owner's "reasonable best-of-both-worlds default?" for a reader who
 * must first see that the deepest level of detail exists; or on the neighbours at once. Read on this repository's
 * `pathfind.ts`, the owner's picture, and the estate's `PaymentsContext.cs`, whose neighbours all fit.
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
    const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`);
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

test("the default arrival rests on the subject's card at reading size and stays there", async ({ browser }) => {
  const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`);
  await still(page);
  const rest = await cameraOf(page);
  expect(rest.look).toBe("reading");
  await expect(page.locator("#tuning-arrival")).toHaveValue("reading");
  // Longer than any hold and ease: nothing eases back.
  await page.waitForTimeout(2500);
  expect(await cameraOf(page)).toEqual(rest);
  await context.close();
});

test("Reading, Then Neighbours rests at reading size, then ends with every card one connection from PaymentsContext.cs in view", async ({ browser }) => {
  test.setTimeout(90_000);
  const reading = await visit(browser, `${ESTATE}?view=local&node=${encodeURIComponent(PAYMENTS)}`);
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

test("the person's input during the hold ends the arrival where it stands", async ({ browser }) => {
  const { context, page } = await visit(browser, `/?view=local&node=${encodeURIComponent(SUBJECT)}`, "then-neighbours");
  await expect.poll(async () => { const camera = await cameraOf(page); return camera.moving && camera.look === "reading"; }, { timeout: 5_000, intervals: [20] }).toBe(true);
  const frame = await frameOf(page);
  await page.mouse.move((frame.left + frame.right) / 2, (frame.top + frame.bottom) / 2);
  await page.mouse.wheel(0, 1);
  await still(page);
  const at = await cameraOf(page);
  await page.waitForTimeout(2500);
  const later = await cameraOf(page);
  expect(later).toEqual(at);
  expect(later.look, "the camera never eased back to the neighbours").toBe("reading");
  await context.close();
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
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, framing } } })
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
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 6, framing } } })
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
async function visitStep(browser: Browser, step: StepFraming) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, step } } })
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
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, step: "lines" } } })
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
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
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

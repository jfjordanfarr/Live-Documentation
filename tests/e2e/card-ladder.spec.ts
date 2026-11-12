import { expect, test, type Page } from "@playwright/test";

import { localMapStill } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { LAST_STEP, STEP_HYSTERESIS, STEP_RATIO } from "../../packages/explorer/src/client/views/localView/ladder-steps";

/**
 * The card ladder of November 5 (Turn 9), slot composition: inside a box that never changes, the camera's zoom picks a
 * band, and each band below reading scale lets one tier of the card leave while names, the node's controls and the
 * anchor dots hold their screen size by the resistances in Tuning, and below reading scale a name grows into the room
 * its description leaves, up to Name Growth times its held size (Turn 11). Since November 6 (Turns 17 to 19) the held
 * sizes are breakpoints: a step every 20 % of zoom, read from the map's `data-step` beside its band in `data-lod`, each
 * with its limits, a first step that holds reading size for every closer zoom and a last one past which nothing changes.
 */
const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const stillPicture = "tests/e2e/still-picture.ts";
const url = (state: Partial<UrlStateSnapshot>): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;

const layoutBoxes = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => ({
  id: (element as HTMLElement).dataset.id!, width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight
})).sort((a, b) => a.id.localeCompare(b.id)));

/** Screen sizes of the parts whose constancy the ladder promises, the band and step the map reports, and the rooms the card reading measured. */
const reading = (page: Page) => page.evaluate(id => {
  const container = document.querySelector<HTMLElement>("#map-container")!;
  const card = document.querySelector<HTMLElement>(`.node-card[data-id="${id}"]`)!;
  const row = card.querySelector<HTMLElement>('.symbol-row[data-symbol="PaymentService"]')!;
  const size = (selector: string): number => card.querySelector(selector)!.getBoundingClientRect().height;
  const width = (selector: string): number => card.querySelector(selector)!.getBoundingClientRect().width;
  const number = (element: HTMLElement, name: string): number => parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;
  const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
  // The file's name as drawn: the text in the layout at reading scale, from the middle band out the held drawing, whose
  // line is its line height at its own scale.
  const held = card.querySelector<HTMLElement>(".local-file-name-held")!, heldStyle = getComputedStyle(held);
  const title = heldStyle.display === "none" ? size(".local-file-name .local-file-name-text")
    : parseFloat(heldStyle.lineHeight) * new DOMMatrix(heldStyle.transform).a * scale;
  return {
    band: container.dataset.lod,
    step: Number(container.dataset.step),
    scale,
    name: size('.symbol-row[data-symbol="PaymentService"] .symbol-label .symbol-label-text'),
    title,
    more: width(".local-file-more"),
    rowMore: width('.symbol-row[data-symbol="PaymentService"] .local-symbol-more'),
    anchor: width('.symbol-row[data-symbol="PaymentService"] .symbol-anchor.inbound'),
    growth: number(container, "--name-growth"), textScale: number(container, "--text-scale"), controlScale: number(container, "--control-scale"),
    rowH: number(row, "--row-h"), rowRoomW: number(row, "--row-room-w"), rowNameW: number(row, "--row-name-w"), rowFillH: number(row, "--row-fill-h"),
    rowControlsW: number(row, "--row-controls-w"), rowMoreW: number(row, "--row-more-w"), rowDotRoom: number(row, "--row-dot-room"), slotLines: number(container, "--slot-lines"),
    titleHeadH: number(card, "--title-head-h"), titleLine: number(card, "--title-line"),
    // The held name's scale, 1 where it is not drawn: the far and overview bands hold the node's More no taller than a
    // line of it (the header round, 2026-11-08).
    titleScale: heldStyle.display === "none" ? 1 : new DOMMatrix(heldStyle.transform).a
  };
}, payment);
type Reading = Awaited<ReturnType<typeof reading>>;

/** The stylesheet's limits, as the ladder block states them: a held scale between 1 and the row's height over the element's. */
const held = (scale: number, ceiling: number): number => Math.min(Math.max(1, scale), Math.max(1, ceiling));

/** Zoom out one step at a time until the map reports the band, within a bounded number of steps. */
async function zoomOutTo(page: Page, band: string): Promise<void> {
  for (let step = 0; step < 8; step += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
    if (await page.locator("#map-container").getAttribute("data-lod") === band) return;
  }
  throw new Error(`The ${band} band was not reached in eight steps`);
}

test.use({ viewport: { width: 1440, height: 960 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cardText: "slot" } } })
  });
});

test("each band below reading scale lets one tier leave, names and controls hold their screen size, and no box changes", async ({ page }) => {
  // Name Growth at 1.5, the lever's default until the far-zoom review of 2026-11-06 set it to 1, so that this walk still
  // sees a symbol's name grow into the room its description leaves.
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cardText: "slot", nameGrowth: 1.5 } } })
  });
  await page.goto(url({ selectedNodeId: payment }));
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await localMapStill(page);
  const boxes = await layoutBoxes(page);
  const start = await reading(page);
  expect(start.band).toBe("reading");
  expect(start.step).toBe(0);
  const row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(row.locator(".local-symbol-pin")).toBeVisible();
  await expect(row.locator(".local-symbol-more")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeVisible();
  await expect(subject.locator(".local-file-pin")).toBeVisible();

  // One step closer stays in the reading band and the first step: zooming in shrinks nothing (the owner, 2026-11-06,
  // Turns 17 to 19), so the name, the More buttons and the anchor dot all grow with the map.
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await localMapStill(page);
  const closer = await reading(page);
  expect(closer.band).toBe("reading");
  expect(closer.step).toBe(0);
  expect(closer.scale).toBeGreaterThan(start.scale);
  for (const part of ["name", "more", "rowMore", "anchor"] as const) expect(closer[part] / start[part]).toBeCloseTo(closer.scale / start.scale, 1);
  await page.getByRole("button", { name: "Return to reading size", exact: true }).click();
  await localMapStill(page);

  const ratioOf = (band: { scale: number }): number => band.scale / start.scale;
  // A symbol's name holds its step's scale and grows past it into the room across its box less its row's controls
  // held, nine tenths of it, up to Name Growth, never past its row's height, never below 1: the stylesheet's rule.
  const expectedName = (band: Reading, controlsW: number): number => {
    const rowControls = held(band.controlScale, (band.rowH - 2) / 17);
    const byWidth = 0.9 * (band.rowRoomW - controlsW * rowControls) / band.rowNameW;
    return start.name * Math.max(1, Math.min(band.rowFillH, Math.max(band.textScale, Math.min(byWidth, band.textScale * band.growth)))) * ratioOf(band);
  };
  const nodeControls = (band: Reading): number => {
    const controls = held(band.controlScale, (32 + band.slotLines * 17) / 20);
    return band.band === "far" || band.band === "overview" ? Math.min(controls, band.titleLine * band.titleScale / 20) : controls;
  };
  // The file's name holds its step's scale whatever Name Growth says, wrapping rather than growing, as long as one of its
  // lines fits the header's room (2026-11-06, the far-zoom review).
  const expectedTitle = (band: Reading): number => start.title * Math.max(1, Math.min(band.textScale, band.titleHeadH / band.titleLine)) * ratioOf(band);
  // A held control is drawn at its step's scale: on screen within its step and the step's margins of its reading size,
  // 1.2 to the power of three quarters either way (0.87 to 1.15). A dot holds only as far as its card's edge and its
  // row allow, and follows the map past that (the far-zoom review).
  const heldLow = STEP_RATIO ** -(0.5 + STEP_HYSTERESIS), heldHigh = STEP_RATIO ** (0.5 + STEP_HYSTERESIS);
  const dotCeiling = (band: Reading): number => Math.min(band.rowDotRoom, band.rowH / 14);
  const expectHeld = (band: Reading): void => {
    expect(Math.abs(band.more - start.more * nodeControls(band) * ratioOf(band))).toBeLessThan(1);
    expect(Math.abs(band.rowMore - start.rowMore * held(band.controlScale, (band.rowH - 2) / 17) * ratioOf(band))).toBeLessThan(1);
    expect(Math.abs(band.anchor - start.anchor * held(band.controlScale, dotCeiling(band)) * ratioOf(band))).toBeLessThan(1);
    const parts = band.controlScale <= dotCeiling(band) ? ["more", "rowMore", "anchor"] as const : ["more", "rowMore"] as const;
    // Beyond the middle band the node's More holds no more than a line of the held name, so its screen size is that cap's.
    for (const part of parts.filter(part => part !== "more" || band.band === "middle" || band.band === "reading")) {
      expect(band[part] / start[part]).toBeGreaterThan(heldLow - 0.01);
      expect(band[part] / start[part]).toBeLessThan(heldHigh + 0.01);
    }
  };

  // Middle: the descriptions, the badges, the path and the directory line leave; the row's Pin and More stay, held;
  // the name holds its screen size (resistance 1) and grows into its row's room up to Name Growth (1.5 here), the file's
  // name holds its size and wraps within its header, short of the card's buttons; the node's controls and the anchor
  // dots hold their size; every box is the same.
  await zoomOutTo(page, "middle");
  const middle = await reading(page);
  await expect(row.locator(".local-reading-slot")).toBeHidden();
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(row.locator(".local-symbol-pin")).toBeVisible();
  await expect(row.locator(".local-symbol-more")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeHidden();
  await expect(subject.locator(".local-file-pin")).toBeVisible();
  expect(middle.step).toBeGreaterThan(0);
  expect(middle.textScale).toBeCloseTo(STEP_RATIO ** middle.step, 2);
  expect(middle.growth).toBe(1.5);
  expect(Math.abs(middle.name - expectedName(middle, middle.rowControlsW))).toBeLessThan(1);
  expect(middle.name).toBeGreaterThan(start.name);
  expect(Math.abs(middle.title - expectedTitle(middle))).toBeLessThan(1);
  expect(Math.abs(middle.title - start.title)).toBeLessThan(1);
  expectHeld(middle);
  expect(await layoutBoxes(page)).toEqual(boxes);

  // Far: More alone remains of the node's controls and of the row's, and the names have the row up to More.
  await zoomOutTo(page, "far");
  const far = await reading(page);
  await expect(row.locator(".local-symbol-pin")).toBeHidden();
  await expect(row.locator(".local-symbol-more")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeHidden();
  await expect(subject.locator(".node-directory")).toBeHidden();
  await expect(subject.locator(".local-file-pin")).toBeHidden();
  await expect(subject.locator(".local-file-close")).toBeHidden();
  await expect(subject.locator(".local-file-more")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeVisible();
  expect(Math.abs(far.name - expectedName(far, far.rowMoreW))).toBeLessThan(1);
  expect(Math.abs(far.title - expectedTitle(far))).toBeLessThan(1);
  expectHeld(far);
  expect(await layoutBoxes(page)).toEqual(boxes);

  // Return to reading size brings the reading band back with everything in it.
  await page.getByRole("button", { name: "Return to reading size", exact: true }).click();
  await localMapStill(page);
  const back = await reading(page);
  expect(back.band).toBe("reading");
  expect(back.step).toBe(0);
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(subject.locator(".node-path")).toBeVisible();
  await expect(subject.locator(".local-file-pin")).toBeVisible();
  expect(Math.abs(back.name - start.name)).toBeLessThan(0.5);
  expect(Math.abs(back.title - start.title)).toBeLessThan(0.5);
  expect(await layoutBoxes(page)).toEqual(boxes);
});

test("the resistances and the growth in Tuning change how much names and controls hold their size, and 0 and 1 follow the map", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await localMapStill(page);
  const start = await reading(page);
  await page.getByText("Tuning", { exact: true }).click();
  const section = page.locator("details.tuning-subsection").filter({ hasText: "2D Layout" });
  if (!await section.evaluate(details => (details as HTMLDetailsElement).open)) await section.locator("summary").click();
  for (const [id, value] of [["tuning-text-resistance", "0"], ["tuning-control-resistance", "0"], ["tuning-name-growth", "1"]] as const) {
    await page.locator(`#${id}`).evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
    await expect(page.locator(`#${id}-value`)).toHaveText(value);
  }
  await localMapStill(page);
  await zoomOutTo(page, "middle");
  const middle = await reading(page);
  // With no resistance and no growth everything scales with the map, controls and the file's name included.
  expect(middle.name / start.name).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.title / start.title).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.more / start.more).toBeCloseTo(middle.scale / start.scale, 1);
  expect(middle.anchor / start.anchor).toBeCloseTo(middle.scale / start.scale, 1);
});

test("the map says when its camera moves, and is a compositor layer only meanwhile, so that it draws crisp at rest", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
  await localMapStill(page);
  const camera = () => page.evaluate(() => ({
    camera: document.querySelector<HTMLElement>("#map-container")!.dataset.camera ?? null,
    layer: getComputedStyle(document.querySelector("#map-viewport")!).willChange
  }));
  // At rest: no motion said, no layer (the owner's blur close up and aliasing far out, 2026-11-06, Turn 17).
  expect(await camera()).toEqual({ camera: null, layer: "auto" });

  // A wheel's zoom eases the camera: the map says so from the event on, and promotes the layer meanwhile.
  const during = await page.evaluate(() => {
    const view = document.querySelector<HTMLElement>("#view-map")!, box = view.getBoundingClientRect();
    view.dispatchEvent(new WheelEvent("wheel", { deltaY: 120, clientX: box.left + box.width / 2, clientY: box.top + box.height / 2, bubbles: true, cancelable: true }));
    return { camera: document.querySelector<HTMLElement>("#map-container")!.dataset.camera ?? null, layer: getComputedStyle(document.querySelector("#map-viewport")!).willChange };
  });
  expect(during).toEqual({ camera: "moving", layer: "transform" });
  await localMapStill(page);
  expect(await camera()).toEqual({ camera: null, layer: "auto" });

  // A held drag moves the camera until it is released; a Zoom button's step is an instant jump, no motion.
  // The drag starts on the map's background, where a press takes the camera rather than a card or its controls.
  const free = await page.evaluate(() => {
    const box = document.querySelector("#view-map")!.getBoundingClientRect();
    for (let y = box.top + 30; y < box.bottom - 30; y += 20) for (let x = box.left + 30; x < box.right - 30; x += 20) {
      const hit = document.elementFromPoint(x, y);
      if (hit?.closest("#view-map") && !hit.closest(".node-card, button, .local-directory-label, .local-directory-closed")) return { x, y };
    }
    return null;
  });
  expect(free).not.toBeNull();
  await page.mouse.move(free!.x, free!.y);
  await page.mouse.down();
  await page.mouse.move(free!.x + 50, free!.y + 20, { steps: 4 });
  expect(await camera()).toEqual({ camera: "moving", layer: "transform" });
  await page.mouse.up();
  await localMapStill(page);
  expect(await camera()).toEqual({ camera: null, layer: "auto" });
  await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  expect(await camera()).toEqual({ camera: null, layer: "auto" });
});

/**
 * Every row of a card at one moment: which rows break a rule of the pass (a dot over its name, a name across its row's
 * More or out of its row, a More not drawn, a name drawn outside its limits, a silent row at the overview band drawing its name), the pinned row's highlight against its
 * text and row, and the held scales in the map's own units, from their screen sizes.
 */
const stepReading = (page: Page, id: string, pinned: string) => page.evaluate(({ id, pinned }) => {
  const map = document.querySelector<HTMLElement>("#map-container")!;
  const card = document.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(id)}"]`)!;
  const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
  const number = (element: Element, name: string): number => parseFloat(getComputedStyle(element).getPropertyValue(name));
  const textScale = number(map, "--text-scale"), growth = number(map, "--name-growth");
  const broken: string[] = [];
  let truncated = 0;
  for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
    const span = row.querySelector<HTMLElement>(".symbol-label-text")!, text = span.getBoundingClientRect(), box = row.getBoundingClientRect();
    const symbol = row.dataset.symbol!;
    // The overview band is the file's own: a row goes silent but for a symbol pinned by name, its name and its More no
    // longer drawn (the far-zoom review, 2026-11-06).
    if (map.dataset.lod === "overview" && !row.classList.contains("symbol-pinned-named")) {
      if (getComputedStyle(span).visibility !== "hidden") broken.push(`${symbol}: a silent row draws its name`);
      continue;
    }
    const inbound = row.querySelector(".symbol-anchor.dot.inbound")?.getBoundingClientRect();
    const outbound = row.querySelector(".symbol-anchor.dot.outbound")?.getBoundingClientRect();
    if (inbound && inbound.right > text.left + 0.5) broken.push(`${symbol}: the use-dot covers the name`);
    if (outbound && outbound.left < text.right - 0.5) broken.push(`${symbol}: the offer-dot covers the name`);
    const more = row.querySelector<HTMLElement>(".local-symbol-more")!;
    const moreBox = more.getBoundingClientRect();
    if (getComputedStyle(more).visibility === "hidden" || !moreBox.width) broken.push(`${symbol}: More is not drawn`);
    if (text.right > moreBox.left + 0.5) broken.push(`${symbol}: the name crosses More`);
    if (!row.classList.contains("internals-row") && (text.top < box.top - 0.5 || text.bottom > box.bottom + 0.5)) broken.push(`${symbol}: the name leaves its row`);
    if (map.dataset.lod !== "reading" && map.dataset.lod !== "close") {
      const scale = new DOMMatrix(getComputedStyle(span).transform).a, fill = number(row, "--row-fill-h");
      if (scale < Math.min(Math.max(1, fill), textScale) - 0.01) broken.push(`${symbol}: the name is drawn below its held size`);
      if (scale > Math.max(1, Math.min(fill, textScale * growth)) + 0.01) broken.push(`${symbol}: the name is drawn past Name Growth or its row`);
      if (span.scrollWidth > span.clientWidth + 1) truncated += 1;
    }
  }
  const row = card.querySelector<HTMLElement>(`.symbol-row[data-symbol="${CSS.escape(pinned)}"]`)!;
  const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper")!, wrapperBox = wrapper.getBoundingClientRect();
  const layer = getComputedStyle(wrapper, "::before");
  const lightTop = wrapperBox.top + parseFloat(layer.top) * k;
  const light = { top: lightTop, bottom: lightTop + parseFloat(layer.height) * k, left: wrapperBox.left, right: wrapperBox.right };
  const text = row.querySelector(".symbol-label-text")!.getBoundingClientRect(), box = row.getBoundingClientRect();
  const above = row.previousElementSibling?.getBoundingClientRect();
  const mapUnits = (selector: string, size: number): number => card.querySelector(selector)!.getBoundingClientRect().height / (size * k);
  // A wire from the pinned row's offer-dot starts where that dot is drawn at this step, one pin radius right of its
  // centre, as local-map-motion's oracle holds every wire end to its dot: the wires are drawn again at a new step.
  const offer = row.querySelector(".symbol-anchor.dot.outbound")!.getBoundingClientRect();
  const wireErrors = [...document.querySelectorAll<SVGPathElement>(`.connection-path[data-target-id="${CSS.escape(id)}"][data-target-symbol="${CSS.escape(pinned)}"]`)].map(wire => {
    const start = new DOMPoint(wire.getPointAtLength(0).x, wire.getPointAtLength(0).y).matrixTransform(wire.getScreenCTM()!);
    return Math.hypot(start.x - offer.left - offer.width / 2 - 6 * k, start.y - offer.top - offer.height / 2);
  });
  return {
    band: map.dataset.lod!, step: Number(map.dataset.step), k, textScale, controlScale: number(map, "--control-scale"), broken, truncated, wireErrors,
    rowH: number(row, "--row-h"), dotRoom: number(row, "--row-dot-room"),
    // The pinned row's text lies inside its highlight; the highlight reaches no further down than its row and no further
    // up than its wrapper's 2 px margin, never into the row above.
    textInLight: text.top >= light.top - 0.5 && text.bottom <= light.bottom + 0.5 && text.left >= light.left - 0.5 && text.right <= light.right + 0.5,
    lightInRow: light.bottom <= box.bottom + 0.5 && light.top >= box.top - 2 * k - 0.5 && (!above || light.top >= above.bottom - 0.5),
    pinDrawn: getComputedStyle(row.querySelector(".local-symbol-pin")!).visibility !== "hidden",
    dot: mapUnits(`.symbol-row[data-symbol="${CSS.escape(pinned)}"] .symbol-anchor.dot.inbound`, 14),
    rowMore: mapUnits(`.symbol-row[data-symbol="${CSS.escape(pinned)}"] .local-symbol-more`, 17),
    nodeMore: mapUnits(".local-file-more", 20),
    titleScale: new DOMMatrix(getComputedStyle(card.querySelector(".local-file-name-held")!).transform).a,
    name: new DOMMatrix(getComputedStyle(row.querySelector(".symbol-label-text")!).transform).a,
    prose: (() => {
      const prose = card.querySelector<HTMLElement>(".local-reading-slot .local-reading-prose")!, style = getComputedStyle(prose);
      return { font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight), screen: parseFloat(style.fontSize) * k };
    })()
  };
}, { id, pinned });

test("at every step a dot never covers its name, More stands on every drawn row and a name never crosses it, the overview silences unpinned rows, the pinned highlight holds its name, and past the last step either way nothing changes", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(url({ selectedNodeId: stillPicture }));
  const subject = page.locator(`.node-card[data-id="${stillPicture}"]`);
  await subject.waitFor();
  await localMapStill(page);
  // The subject's first symbol row, which the arrival frames at the card's title whatever the picture holds: a named
  // symbol lower down (readPicture until 2026-11-06) leaves the frame when the Live Docs gain a card.
  const pinned = (await subject.locator(".symbol-row:not(.internals-row)").first().getAttribute("data-symbol"))!;
  await subject.locator(`.symbol-row[data-symbol="${pinned}"] .local-symbol-pin`).click();
  await localMapStill(page);
  await expect(subject.locator(`.symbol-row[data-symbol="${pinned}"]`)).toHaveClass(/symbol-pinned/u);
  const boxes = await layoutBoxes(page);
  const readings: Awaited<ReturnType<typeof stepReading>>[] = [await stepReading(page, stillPicture, pinned)];
  expect(readings[0].step).toBe(0);

  // Out, one Zoom Out at a time, until the camera can go no farther, which the button says by being disabled (since
  // 2026-11-06 at the last step, or where the whole map stands in the frame where that is farther): every step on the
  // way, and the last step held.
  const zoomOut = page.getByRole("button", { name: "Zoom Out", exact: true });
  for (let click = 0; click < 30 && await zoomOut.isEnabled(); click += 1) {
    await zoomOut.click();
    await localMapStill(page);
    readings.push(await stepReading(page, stillPicture, pinned));
  }
  await expect(zoomOut).toBeDisabled();
  // Zooming out, the step never goes back, from the first to the last.
  const steps = readings.map(each => each.step);
  expect(steps[0]).toBe(0);
  expect(steps.at(-1)).toBe(LAST_STEP);
  for (let index = 1; index < steps.length; index += 1) expect(steps[index]).toBeGreaterThanOrEqual(steps[index - 1]);
  for (const each of readings) {
    expect(each.broken, `step ${each.step} at ${each.k.toFixed(3)}`).toEqual([]);
    expect(each.textInLight, `step ${each.step}`).toBe(true);
    expect(each.lightInRow, `step ${each.step}`).toBe(true);
    expect(each.wireErrors.length, `step ${each.step}: the pinned row's offers are wired`).toBeGreaterThan(0);
    for (const error of each.wireErrors) expect(error, `step ${each.step}: a wire starts at its dot as drawn`).toBeLessThan(1);
    expect(each.pinDrawn).toBe(each.band === "reading" || each.band === "middle");
    expect(each.prose.font).toBe(12);
    expect(each.prose.line).toBe(17);
  }
  // Some name was too long for its room beside More at its held size, and was cut rather than shrunk.
  expect(Math.max(...readings.map(each => each.truncated))).toBeGreaterThan(0);
  expect(await layoutBoxes(page)).toEqual(boxes);

  // At and past the last step: the step and its held scales are the last's, the dot and the buttons at their ceilings
  // (the row's height over theirs, and for the dot its card's edge too), and the readings there in the map's own units
  // are the same; only the map shrinks them. Since the farthest zoom became the last step, or the whole map with its
  // margin where that is farther (2026-11-06), a walk may reach the last step only at its end.
  const atLast = readings.filter(each => each.step === LAST_STEP);
  expect(atLast.length).toBeGreaterThan(0);
  for (const each of atLast) {
    expect(each.textScale).toBeCloseTo(STEP_RATIO ** LAST_STEP, 2);
    expect(each.dot).toBeCloseTo(Math.min(each.dotRoom, each.rowH / 14), 1);
    // A row's buttons stop 2 px above its bottom, so that a pinned row's highlight holds them with air (2026-11-06).
    expect(each.rowMore).toBeCloseTo((each.rowH - 2) / 17, 1);
    // The node's buttons stop at a slot row's allotment, which the pinned row is.
    // At the overview band More is held no taller than a line of the held name, 15 of its units (2026-11-08).
    expect(each.nodeMore).toBeCloseTo(Math.min(each.rowH / 20, 15 * each.titleScale / 20), 1);
  }
  for (const each of atLast) for (const part of ["dot", "rowMore", "nodeMore", "name"] as const) expect(each[part]).toBeCloseTo(atLast[0][part], 2);

  // In: from reading scale, one Zoom In at a time, until the camera can come no closer. Nothing shrinks in the map's
  // own units, so on screen everything grows with the map: the first step holds reading size for every closer zoom,
  // and a description stays at its reading size (Turn 17's close band no longer shrinks the prose).
  await page.getByRole("button", { name: "Return to reading size", exact: true }).click();
  await localMapStill(page);
  let previous = await stepReading(page, stillPicture, pinned);
  const zoomIn = page.getByRole("button", { name: "Zoom In", exact: true });
  for (let click = 0; click < 12 && await zoomIn.isEnabled(); click += 1) {
    await zoomIn.click();
    await localMapStill(page);
    const now = await stepReading(page, stillPicture, pinned);
    expect(now.broken).toEqual([]);
    expect(now.textInLight).toBe(true);
    expect(now.step).toBe(0);
    for (const part of ["dot", "rowMore", "nodeMore", "name"] as const) expect(now[part]).toBeCloseTo(1, 2);
    expect(now.prose.font).toBe(12);
    expect(now.prose.screen).toBeGreaterThanOrEqual(previous.prose.screen - 1e-6);
    if (Math.abs(now.k - previous.k) < 1e-6) break;
    previous = now;
  }
  expect(previous.band).toBe("close");
  // The closest zoom says so too.
  await expect(zoomIn).toBeDisabled();
  expect(await layoutBoxes(page)).toEqual(boxes);
});

test("beyond the middle band a row's Pin folds into its More, which a keyboard reaches and which pins and unpins", async ({ page }) => {
  await page.goto(url({ selectedNodeId: stillPicture }));
  const subject = page.locator(`.node-card[data-id="${stillPicture}"]`);
  await subject.waitFor();
  await localMapStill(page);
  // The subject's first symbol row, which the arrival frames at the card's title whatever the picture holds: a named
  // symbol lower down (readPicture until 2026-11-06) leaves the frame when the Live Docs gain a card.
  const pinned = (await subject.locator(".symbol-row:not(.internals-row)").first().getAttribute("data-symbol"))!;
  const row = subject.locator(`.symbol-row[data-symbol="${pinned}"]`);
  await row.locator(".local-symbol-pin").click();
  await localMapStill(page);
  await expect(row).toHaveClass(/symbol-pinned/u);
  await zoomOutTo(page, "far");
  const pin = row.locator(".local-symbol-pin"), more = row.getByRole("button", { name: `More actions for ${pinned} in still-picture.ts` });
  await expect(pin).toBeHidden();
  await expect(more).toBeVisible();
  // The hidden Pin takes no focus; More does, and its menu carries the Pin's action under its own name.
  await pin.evaluate(element => (element as HTMLElement).focus());
  await expect(pin).not.toBeFocused();
  await more.focus();
  await expect(more).toBeFocused();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu.getByRole("menuitem", { name: "Unpin symbol" })).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitem", { name: "Unpin symbol" })).toBeFocused();
  await page.keyboard.press("Enter");
  // Releasing a file's last symbol pin leaves the file pinned whole (the owner's rule of 2026-10-15, in pressSymbol):
  // every row is pinned, and the same menu narrows the pin to this symbol again.
  const pinnedRows = subject.locator(".symbol-row.symbol-pinned");
  await expect.poll(() => pinnedRows.count()).toBe(await subject.locator(".symbol-row").count());
  await localMapStill(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", /far|overview/u);
  await more.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu").getByRole("menuitem", { name: "Pin only this symbol" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(() => pinnedRows.count()).toBe(1);
  await expect(row).toHaveClass(/symbol-pinned/u);
});

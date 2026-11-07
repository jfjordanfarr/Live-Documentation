import { expect, test, type Page } from "@playwright/test";

import { localMapStill } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { LAST_STEP, STEP_RATIO } from "../../packages/explorer/src/client/views/localView/ladder-steps";
import { GATHERED_WIDTH } from "../../packages/explorer/src/client/views/localView/wire-gathering";

/**
 * The overview band's wires and the farthest zoom (2026-11-06, the far bands' second milestone, after the owner's
 * "'Sixth' order which collapses all symbols down to a single highly-split-out node-level connection" and "Limits limits
 * limits. Clamps clamps clamps"): at the overview band every pair of files joined by a wire is joined by exactly one, each
 * way, from the offering card's node-level hub to the using card's, as wide as its count says; a pinned symbol keeps its
 * own wires from its row's dots; coming back in restores the wires of the closer bands; the legend says what the width
 * means only there; and zooming out stops at the ladder's last step, or where the whole map stands in the frame with a
 * margin where that is farther, the Zoom Out button saying so.
 */
const stillPicture = "tests/e2e/still-picture.ts";
const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const url = (subject: string): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: subject })}`;

test.use({ viewport: { width: 1440, height: 960 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
  });
});

async function open(page: Page, subject: string): Promise<void> {
  await page.goto(url(subject));
  await page.locator(`.node-card[data-id="${subject}"]`).waitFor();
  await localMapStill(page);
}

/** Press a Zoom button so many times, waiting for the picture after each. */
async function press(page: Page, name: "Zoom Out" | "Zoom In", times: number): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    await page.getByRole("button", { name, exact: true }).click();
    await localMapStill(page);
  }
}

/** Every wire drawn: its key, classes, ends by file and symbol, path, width and count, and where it starts and ends on screen. */
const wires = (page: Page) => page.evaluate(() => [...document.querySelectorAll<SVGGeometryElement>("#map-connections .connection-path")].map(path => {
  const data = (path as unknown as HTMLElement).dataset;
  const matrix = path.getScreenCTM()!;
  const point = (at: number): { x: number; y: number } => {
    const local = path.getPointAtLength(at);
    const screen = new DOMPoint(local.x, local.y).matrixTransform(matrix);
    return { x: screen.x, y: screen.y };
  };
  const isPath = path.tagName === "path";
  return {
    key: data.connectionKey ?? "", classes: [...path.classList].sort().join(" "), sourceId: data.sourceId ?? "", targetId: data.targetId ?? "",
    sourceSymbol: data.sourceSymbol ?? "", targetSymbol: data.targetSymbol ?? "", d: path.getAttribute("d") ?? path.getAttribute("points") ?? "",
    width: parseFloat((path as unknown as HTMLElement).style.strokeWidth) || 0, references: Number(data.references ?? 0),
    label: path.getAttribute("aria-label") ?? "", start: isPath ? point(0) : null, end: isPath ? point(path.getTotalLength()) : null
  };
}));
type Wire = Awaited<ReturnType<typeof wires>>[number];

/** A path's numbers, so that two drawings of the same geometry compare to a hundredth of a pixel. */
const numbers = (d: string): number[] => (d.match(/-?\d+(\.\d+)?(e-?\d+)?/gu) ?? []).map(Number);

/** The pairs of files the wires join, offering file first, each direction once; a file's wires to itself join none. */
const pairsOf = (drawn: readonly Wire[]): string[] => [...new Set(drawn.filter(wire => wire.sourceId !== wire.targetId && !wire.classes.includes("bundle-run"))
  .map(wire => `${wire.targetId} -> ${wire.sourceId}`))].sort();

test("the overview band joins each pair of files by one wire each way, hub to hub, and coming back in restores the wires", async ({ page }) => {
  test.setTimeout(120_000);
  await open(page, stillPicture);
  await press(page, "Zoom Out", 6);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "far");
  const before = await wires(page);
  const legend = page.locator("#local-legend .legend-row--gathered");
  await expect(legend).toBeHidden();

  await press(page, "Zoom Out", 1);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "overview");
  const k = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a);
  const overview = await wires(page);
  const gathered = overview.filter(wire => wire.classes.includes("gathered") && !wire.classes.includes("self-loop"));
  // One wire for each pair the closer band joins, each way, and nothing else drawn (no symbol is pinned).
  expect(gathered.map(wire => `${wire.targetId} -> ${wire.sourceId}`).sort()).toEqual(pairsOf(before));
  expect(overview.every(wire => wire.classes.includes("gathered"))).toBe(true);
  await expect(legend).toBeVisible();
  await expect(legend).toHaveText("Width: references");

  // Each ends on two node-level hubs, drawn, inside their cards but for the hubs' designed overhang; its width grows with
  // its count between the bounds, and it names its two files and its count.
  const hubs = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(card => {
    const box = card.getBoundingClientRect();
    const hub = (side: string) => {
      const element = card.querySelector<HTMLElement>(`.symbol-anchor.hub.${side}`);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, drawn: getComputedStyle(element).visibility === "visible", top: rect.top - box.top, bottom: box.bottom - rect.bottom };
    };
    return [card.dataset.id!, { offers: hub("outbound"), uses: hub("inbound") }];
  })));
  for (const wire of gathered.filter(each => !each.classes.includes("back-route"))) {
    const offers = hubs[wire.targetId].offers!, uses = hubs[wire.sourceId].uses!;
    const where = `${wire.targetId} -> ${wire.sourceId}`;
    expect(offers.drawn && uses.drawn, where).toBe(true);
    expect(Math.hypot(wire.start!.x - offers.x - 6 * k, wire.start!.y - offers.y), where).toBeLessThan(1);
    expect(Math.hypot(wire.end!.x - uses.x + 6 * k, wire.end!.y - uses.y), where).toBeLessThan(1);
    for (const hub of [offers, uses]) expect(Math.min(hub.top, hub.bottom), where).toBeGreaterThanOrEqual(-0.5);
    expect(wire.width, where).toBeGreaterThanOrEqual(GATHERED_WIDTH.least);
    expect(wire.width, where).toBeLessThanOrEqual(GATHERED_WIDTH.greatest);
    expect(wire.label, where).toMatch(/ offers .+ \d+ references?$/u);
  }
  const byCount = [...gathered].sort((a, b) => a.references - b.references);
  for (let index = 1; index < byCount.length; index += 1) expect(byCount[index].width).toBeGreaterThanOrEqual(byCount[index - 1].width);
  expect(byCount.at(-1)!.references).toBeGreaterThan(byCount[0].references);
  expect(byCount.at(-1)!.width).toBeGreaterThan(byCount[0].width);
  // The counts are the closer band's wires between each pair.
  for (const wire of gathered.filter(each => !each.classes.includes("back-route"))) {
    const members = before.filter(each => each.targetId === wire.targetId && each.sourceId === wire.sourceId && !each.classes.includes("bundle-run") && !each.classes.includes("self-loop"));
    expect(wire.references, `${wire.targetId} -> ${wire.sourceId}`).toBe(members.length);
  }

  // Back in: the closer band's wires, key for key and path for path, and the legend's row gone.
  await press(page, "Zoom In", 1);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "far");
  const after = await wires(page);
  expect(after.map(wire => wire.key).sort()).toEqual(before.map(wire => wire.key).sort());
  for (const wire of before) {
    const again = after.find(each => each.key === wire.key)!;
    expect(again.classes, wire.key).toBe(wire.classes);
    const a = numbers(wire.d), b = numbers(again.d);
    expect(b.length, wire.key).toBe(a.length);
    a.forEach((value, index) => expect(Math.abs(b[index] - value), wire.key).toBeLessThan(0.01));
  }
  await expect(legend).toBeHidden();
});

test("a pinned symbol keeps its own wires at the overview band, from its row's dots, above the gathered ones", async ({ page }) => {
  test.setTimeout(120_000);
  await open(page, stillPicture);
  const subject = page.locator(`.node-card[data-id="${stillPicture}"]`);
  const pinned = (await subject.locator(".symbol-row:not(.internals-row)").first().getAttribute("data-symbol"))!;
  await subject.locator(`.symbol-row[data-symbol="${pinned}"] .local-symbol-pin`).click();
  await localMapStill(page);
  await press(page, "Zoom Out", 6);
  const ownAtFar = (await wires(page)).filter(wire => !wire.classes.includes("bundle-run")
    && ((wire.targetId === stillPicture && wire.targetSymbol === pinned) || (wire.sourceId === stillPicture && wire.sourceSymbol === pinned)));
  expect(ownAtFar.length).toBeGreaterThan(0);
  await press(page, "Zoom Out", 1);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "overview");
  const k = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a);
  const drawn = await wires(page);
  const own = drawn.filter(wire => wire.classes.includes("own"));
  // Every wire of the pinned symbol at the far band is its own wire at the overview band, and drawn above the gathered.
  expect(own.map(wire => `${wire.sourceId} ${wire.sourceSymbol} ${wire.targetId} ${wire.targetSymbol}`).sort())
    .toEqual(ownAtFar.filter(wire => !wire.classes.includes("self-loop") && !wire.classes.includes("back-route")).map(wire => `${wire.sourceId} ${wire.sourceSymbol} ${wire.targetId} ${wire.targetSymbol}`).sort());
  const lastGathered = Math.max(...drawn.map((wire, index) => wire.classes.includes("gathered") ? index : -1));
  for (const wire of own) expect(drawn.indexOf(wire)).toBeGreaterThan(lastGathered);
  // An offer of the pinned symbol leaves its row's dot, drawn; the gathered wires still count it.
  const dot = await subject.locator(`.symbol-row[data-symbol="${pinned}"] .symbol-anchor.dot.outbound`).evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, drawn: getComputedStyle(element).visibility === "visible" };
  });
  expect(dot.drawn).toBe(true);
  for (const wire of own.filter(each => each.targetId === stillPicture && each.targetSymbol === pinned)) {
    expect(Math.hypot(wire.start!.x - dot.x - 6 * k, wire.start!.y - dot.y)).toBeLessThan(1);
    const pair = drawn.find(each => each.classes.includes("gathered") && each.targetId === wire.targetId && each.sourceId === wire.sourceId);
    expect(pair, `the pair ${wire.targetId} -> ${wire.sourceId}`).toBeDefined();
  }
});

/** Zoom out until the Zoom Out button says it can do no more; the scales on the way. */
async function walkToFarthest(page: Page): Promise<number[]> {
  const zoomOut = page.getByRole("button", { name: "Zoom Out", exact: true });
  const scale = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a);
  const scales = [await scale()];
  for (let index = 0; index < 30 && await zoomOut.isEnabled(); index += 1) {
    await zoomOut.click();
    await localMapStill(page);
    scales.push(await scale());
  }
  await expect(zoomOut).toBeDisabled();
  return scales;
}

test("zooming out stops where the whole of a large map stands in the frame, beyond the last step, and Zoom Out says so", async ({ page }) => {
  test.setTimeout(120_000);
  await open(page, stillPicture);
  const scales = await walkToFarthest(page);
  const farthest = scales.at(-1)!, lastStep = scales[0] * STEP_RATIO ** -LAST_STEP;
  // The still picture is taller than the frame at the last step: the camera goes past it, to where the whole map stands
  // in the frame with a margin, and no farther by the wheel either.
  expect(farthest).toBeLessThan(lastStep);
  const inFrame = await page.evaluate(() => {
    const picture = document.querySelector("#map-container .local-placed")!.getBoundingClientRect(), view = document.querySelector("#view-map")!.getBoundingClientRect();
    return picture.top >= view.top && picture.bottom <= view.bottom && picture.left >= view.left && picture.right <= view.right;
  });
  expect(inFrame).toBe(true);
  const view = (await page.locator("#view-map").boundingBox())!;
  await page.mouse.move(view.x + view.width / 2, view.y + view.height / 2);
  for (let index = 0; index < 5; index += 1) await page.mouse.wheel(0, 400);
  await localMapStill(page);
  const after = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a);
  expect(after).toBeGreaterThanOrEqual(farthest * (1 - 1e-6));
  // Coming back in, Zoom Out says it can go farther again.
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await localMapStill(page);
  await expect(page.getByRole("button", { name: "Zoom Out", exact: true })).toBeEnabled();
});

test("zooming out a small map stops at the ladder's last step, where its drawing stops changing", async ({ page }) => {
  test.setTimeout(120_000);
  await open(page, payment);
  const scales = await walkToFarthest(page);
  // The estate's payment service and its neighbours stand whole in the frame long before the last step. Each scale is
  // read from the computed transform, six significant digits, so two readings agree to about 3e-6 each.
  expect(Math.abs(scales.at(-1)! / (scales[0] * STEP_RATIO ** -LAST_STEP) - 1)).toBeLessThan(1e-5);
  expect(scales).toHaveLength(LAST_STEP + 1);
  await expect(page.locator("#map-container")).toHaveAttribute("data-step", String(LAST_STEP));
});

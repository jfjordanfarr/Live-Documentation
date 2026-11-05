import { expect, test, type Locator, type Page } from "@playwright/test";

import { localMapSettled } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The fixed-slot card composition of the November 5 comparison, behind the Card Text tuning switch: a card's box
 * depends on the file's structure alone, never on what is read or on zoom. The Purpose and every described symbol
 * have a two-line slot cut with an ellipsis in the ordinary type; a tap or Enter on a name opens the full text in
 * the reader dialog; below reading scale the prose fades rather than folds; and no tap saves a reading choice.
 * The growing composition keeps its own spec in card-reading.spec.ts.
 */
const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const pathfind = "packages/engine/src/live-docs/pathfind.ts";
const url = (state: Partial<UrlStateSnapshot>): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;
const state = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
const card = (page: Page, id: string) => page.locator(`.node-card[data-id="${id}"]`);

/** Every card's box in the map's own pixels, which no zoom changes. */
const layoutBoxes = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => ({
  id: (element as HTMLElement).dataset.id!, width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight
})).sort((a, b) => a.id.localeCompare(b.id)));
const geometry = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => {
  const rect = element.getBoundingClientRect();
  return { id: (element as HTMLElement).dataset.id!, box: [rect.x, rect.y, rect.width, rect.height] };
}));
type Picture = Awaited<ReturnType<typeof geometry>>;
function samePicture(before: Picture, after: Picture): void {
  expect(after.map(item => item.id).sort()).toEqual(before.map(item => item.id).sort());
  for (const item of before) {
    const next = after.find(other => other.id === item.id)!;
    item.box.forEach((value, index) => expect(Math.abs(value - next.box[index]), item.id).toBeLessThan(0.1));
  }
}

/** Wait for the camera and the picture together. */
async function still(page: Page): Promise<void> {
  await localMapSettled(page);
  await page.evaluate(async () => {
    let previous = "", since = performance.now();
    const deadline = since + 5000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      const picture = [...document.querySelectorAll(".node-card")].map(element => {
        const rect = element.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      });
      const value = JSON.stringify(picture);
      if (value !== previous) { previous = value; since = performance.now(); }
      if (performance.now() - since > 150) return;
    }
    throw new Error("The picture did not settle");
  });
}

/** Exercise the actual visible hit target without locator scrolling or camera assistance. */
async function pointAt(page: Page, target: Locator, click = false): Promise<void> {
  const point = await target.evaluate(element => {
    const box = element.getBoundingClientRect(), p = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const frame = document.querySelector("#view-map")!.getBoundingClientRect();
    const hit = document.elementFromPoint(p.x, p.y);
    return { ...p, reachable: p.x >= frame.left && p.x <= frame.right && p.y >= frame.top && p.y <= frame.bottom && !!hit && element.contains(hit) };
  });
  expect(point.reachable, "the requested map control is in clear, reachable space").toBe(true);
  await page.mouse.move(point.x, point.y);
  if (click) await page.mouse.click(point.x, point.y);
}

/** The number of lines a prose box shows, and whether it holds more than it shows. */
const proseLines = (prose: Locator) => prose.evaluate(element => ({
  shown: Math.round(element.clientHeight / parseFloat(getComputedStyle(element).lineHeight)),
  clipped: element.scrollHeight > element.clientHeight + 1
}));

test.use({ viewport: { width: 1440, height: 960 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cardText: "slot" } } })
  });
});

/** Every visible symbol row's label and slot heights, in the map's own pixels: the allotment each symbol gets. */
const allotments = (card: Locator) => card.locator(".symbol-row:not(.internals-row)").evaluateAll(rows => rows
  .filter(row => (row as HTMLElement).getClientRects().length)
  .map(row => ({
    symbol: (row as HTMLElement).dataset.symbol!,
    label: row.querySelector<HTMLElement>(".symbol-label-wrapper")!.offsetHeight,
    slot: row.querySelector<HTMLElement>(".local-reading-slot")?.offsetHeight ?? null,
    prose: row.querySelector<HTMLElement>(".local-reading-prose")?.offsetHeight ?? null
  })));

test("fixed slots keep the ordinary drawing, give every symbol the same allotment, and no tap or zoom changes a box", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await still(page);
  await page.mouse.move(280, 55);
  await expect(subject).toHaveClass(/local-slot-card/u);
  await expect(subject).not.toHaveClass(/local-reading-card/u);
  await expect(subject.locator(".local-file-read, .local-symbol-read")).toHaveCount(0);
  await expect(subject.locator(".local-reading-counts")).toBeHidden();
  // Every symbol has the same allotment, two lines by default, filled or not: Get and Post have facts but no prose
  // and keep their empty slots, and a row without facts is no shorter than one with hidden facts.
  const purpose = subject.locator(".local-reading-purpose .local-reading-prose");
  await expect(purpose).toBeVisible();
  const row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(row.locator(".local-reading-types")).toBeHidden();
  await expect(subject.locator('.symbol-row[data-symbol="Get"] .local-reading-slot')).toBeVisible();
  await expect(subject.locator('.symbol-row[data-symbol="Get"] .local-reading-prose')).toBeEmpty();
  const rows = await allotments(subject);
  expect(rows.map(item => item.symbol)).toEqual(["PaymentService", "Get", "Post"]);
  expect(new Set(rows.map(item => item.label)).size, "one label height").toBe(1);
  expect(new Set(rows.map(item => item.slot)).size, "one slot height").toBe(1);
  expect(rows.every(item => item.prose === 34), "two lines of 17 px").toBe(true);
  expect(await proseLines(purpose)).toEqual({ shown: 2, clipped: true });
  expect(await proseLines(row.locator(".local-reading-prose"))).toEqual({ shown: 2, clipped: false });
  const name = row.locator(".symbol-label");
  expect(await name.getAttribute("aria-expanded")).toBeNull();
  const before = await geometry(page), layout = await layoutBoxes(page);
  // Hover draws nothing and moves nothing.
  await pointAt(page, name);
  await page.waitForTimeout(400);
  samePicture(before, await geometry(page));
  // A tap opens the full text in the reader dialog, moves nothing and saves no reading choice.
  await pointAt(page, name, true);
  const reader = page.locator("#detail-panel");
  await expect(reader).toHaveClass(/reading-dialog/u);
  await expect(reader).toHaveClass(/visible/u);
  await expect(reader).toContainText("Posting goes through a stored procedure");
  await still(page);
  samePicture(before, await geometry(page));
  expect(state(page).reading ?? []).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(reader).not.toHaveClass(/visible/u);
  // Two steps out is the ladder's middle band: the descriptions leave (card-ladder.spec.ts holds the rest of the
  // ladder); no box changes, and a tap there opens the reader without moving anything.
  await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await still(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "middle");
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  expect(await layoutBoxes(page)).toEqual(layout);
  const overview = await geometry(page);
  await pointAt(page, name, true);
  await expect(reader).toHaveClass(/visible/u);
  await still(page);
  samePicture(overview, await geometry(page));
  expect(await layoutBoxes(page)).toEqual(layout);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await still(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "reading");
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  samePicture(before, await geometry(page));
});

test("a long description is cut with an ellipsis and the file's name opens the whole file in the reader", async ({ page }) => {
  await page.goto(url({ pinSet: { entries: [{ nodeId: pathfind, symbol: "Walk (interface)" }, { nodeId: pathfind, symbol: "walk (function)" }] } }));
  const subject = card(page, pathfind);
  await subject.waitFor();
  await still(page);
  const walk = subject.locator('.symbol-row[data-symbol="walk (function)"] .local-reading-prose');
  expect(await proseLines(walk)).toEqual({ shown: 2, clipped: true });
  expect(await walk.evaluate(element => getComputedStyle(element).webkitLineClamp)).toBe("2");
  // A pinned row without recorded facts, Walk, gets the allotment every other row gets.
  const rows = await allotments(subject);
  expect(rows.length).toBeGreaterThan(3);
  expect(new Set(rows.map(item => item.slot)).size, "one slot height across pinned, unpinned, with and without facts").toBe(1);
  expect(new Set(rows.map(item => item.label)).size).toBe(1);
  await expect(subject.locator(".local-reading-full:visible")).toHaveCount(0);
  const before = await geometry(page);
  await pointAt(page, subject.locator(".local-file-name"), true);
  const reader = page.locator("#detail-panel");
  await expect(reader).toHaveClass(/reading-dialog/u);
  await expect(reader).toContainText("Pathfinding over the graph index");
  await still(page);
  samePicture(before, await geometry(page));
  expect(state(page).reading ?? []).toEqual([]);
});

test("Enter on a described name opens the reader, and the Tuning switch moves between the compositions at once", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await still(page);
  const name = subject.locator('.symbol-row[data-symbol="PaymentService"] .symbol-label');
  await name.focus();
  await page.keyboard.press("Enter");
  const reader = page.locator("#detail-panel");
  await expect(reader).toHaveClass(/reading-dialog/u);
  await expect(reader).toContainText("Posting goes through a stored procedure");
  await page.keyboard.press("Escape");
  await expect(reader).not.toHaveClass(/visible/u);
  await page.getByText("Tuning", { exact: true }).click();
  const section = page.locator("details.tuning-subsection").filter({ hasText: "2D Layout" });
  if (!await section.evaluate(details => (details as HTMLDetailsElement).open)) await section.locator("summary").click();
  const control = page.locator("#tuning-card-text");
  await expect(control).toBeVisible();
  await expect(control).toHaveValue("slot");
  await control.selectOption("grow");
  await still(page);
  await expect(subject.locator(".local-file-read")).toHaveCount(1);
  await expect(subject.locator(".local-reading-slot")).toHaveCount(0);
  await expect(subject).toHaveClass(/local-reading-card/u);
  await control.selectOption("slot");
  await still(page);
  await expect(subject.locator(".local-file-read")).toHaveCount(0);
  await expect(subject.locator(".local-reading-purpose.local-reading-slot")).toBeVisible();
  await expect(subject).not.toHaveClass(/local-reading-card/u);
});

test("Slot Lines sets every symbol's allotment at once, and the card's box follows", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await still(page);
  const two = (await layoutBoxes(page)).find(item => item.id === payment)!;
  expect((await allotments(subject)).every(item => item.prose === 34)).toBe(true);
  await page.getByText("Tuning", { exact: true }).click();
  const section = page.locator("details.tuning-subsection").filter({ hasText: "2D Layout" });
  if (!await section.evaluate(details => (details as HTMLDetailsElement).open)) await section.locator("summary").click();
  const slider = page.locator("#tuning-slot-lines");
  await expect(slider).toHaveValue("2");
  for (const [lines, prose] of [[3, 51], [1, 17]] as const) {
    await slider.evaluate((input, value) => {
      (input as HTMLInputElement).value = String(value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, lines);
    await expect(page.locator("#tuning-slot-lines-value")).toHaveText(String(lines));
    await still(page);
    const rows = await allotments(subject);
    expect(rows.every(item => item.prose === prose), `${lines} lines of 17 px`).toBe(true);
    expect(new Set(rows.map(item => item.slot)).size).toBe(1);
    expect(await subject.locator(".local-reading-purpose .local-reading-prose").evaluate(element => element.clientHeight)).toBe(prose);
    const box = (await layoutBoxes(page)).find(item => item.id === payment)!;
    expect(Math.sign(box.height - two.height)).toBe(Math.sign(lines - 2));
    expect(box.width).toBe(two.width);
  }
});

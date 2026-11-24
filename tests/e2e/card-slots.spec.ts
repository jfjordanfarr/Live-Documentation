import { expect, test, type Locator, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { AT_READING_SIZE, localMapSettled, panIntoView } from "./still-picture";

/**
 * The fixed-slot card composition of the November 5 comparison, behind the Card Text tuning switch: a card's box
 * depends on the file's structure alone, never on what is read or on zoom. The Purpose and every described symbol
 * have a two-line slot cut with an ellipsis in the ordinary type; a tap or Enter on a name opens the full text in
 * the reader dialog. Books save exact open/fold choices while leaving each slot's space allotted; the ladder hides
 * prose below reading scale without changing those choices. A name's reader action changes no reading choice.
 * The growing composition keeps its own spec in card-reading.spec.ts.
 */
const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const pathfind = "packages/engine/src/live-docs/pathfind.ts";
const readingState = "packages/explorer/src/client/reading-state.ts";
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
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardText: "slot" } } })
  });
});

/** Every visible symbol row's, label's and slot's heights, in the map's own pixels: the allotment each symbol gets. */
const allotments = (card: Locator) => card.locator(".symbol-row:not(.internals-row)").evaluateAll(rows => rows
  .filter(row => (row as HTMLElement).getClientRects().length)
  .map(row => ({
    symbol: (row as HTMLElement).dataset.symbol!,
    row: (row as HTMLElement).offsetHeight,
    label: row.querySelector<HTMLElement>(".symbol-label-wrapper")!.offsetHeight,
    slot: row.querySelector<HTMLElement>(".local-reading-slot")?.offsetHeight ?? null,
    prose: row.querySelector<HTMLElement>(".local-reading-prose")?.offsetHeight ?? null
  })));

test("fixed slots keep the ordinary drawing, give every described symbol the same allotment and an undescribed one a short row, and no tap or zoom changes a box", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await still(page);
  await page.mouse.move(280, 55);
  await expect(subject).toHaveClass(/local-slot-card/u);
  await expect(subject).not.toHaveClass(/local-reading-card/u);
  await expect(subject.locator(".local-file-read")).toHaveCount(1);
  await expect(subject.locator(".local-symbol-read")).toHaveCount(1);
  await expect(subject.locator('.symbol-row[data-symbol="Get"] .local-symbol-read')).toHaveCount(0);
  await expect(subject.locator('.symbol-row[data-symbol="Post"] .local-symbol-read')).toHaveCount(0);
  await expect(subject.locator(".local-reading-counts")).toBeHidden();
  // A described symbol has its slot, two lines by default; Get and Post have facts but no prose, so since 2026-11-13
  // (the owner: "symbols with no description shown to occupy less vertical space on their row") their rows are short,
  // with no slot, each as tall as the other.
  const purpose = subject.locator(".local-reading-purpose .local-reading-prose");
  await expect(purpose).toBeVisible();
  const row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
  await expect(row.locator(".local-reading-slot")).toBeVisible();
  await expect(row.locator(".local-reading-types")).toBeHidden();
  await expect(subject.locator('.symbol-row[data-symbol="Get"] .local-reading-slot')).toBeHidden();
  const rows = await allotments(subject);
  expect(rows.map(item => item.symbol)).toEqual(["PaymentService", "Get", "Post"]);
  expect(new Set(rows.map(item => item.label)).size, "one label height").toBe(1);
  const [described, ...undescribed] = rows;
  expect(described.prose, "two lines of 17 px").toBe(34);
  expect(undescribed.map(item => item.slot), "no slot").toEqual([0, 0]);
  expect(new Set(undescribed.map(item => item.row)).size, "one short row's height").toBe(1);
  expect(undescribed[0].row, "a short row").toBeLessThan(described.row);
  expect(await proseLines(purpose)).toEqual({ shown: 2, clipped: true });
  // At the ordinary card width, the slot card's since 2026-11-06, the service's description no longer fits two lines either.
  expect(await proseLines(row.locator(".local-reading-prose"))).toEqual({ shown: 2, clipped: true });
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
  // Three presses out is the connections look of the default three looks (since 2026-11-13; the stepped ladder's middle
  // band, two presses out, is card-ladder.spec.ts's): the descriptions leave; no box changes, and a tap there opens the
  // reader without moving anything.
  for (let press = 0; press < 3; press += 1) await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await still(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "connections");
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  expect(await layoutBoxes(page)).toEqual(layout);
  const overview = await geometry(page);
  await pointAt(page, name, true);
  await expect(reader).toHaveClass(/visible/u);
  await still(page);
  samePicture(overview, await geometry(page));
  expect(await layoutBoxes(page)).toEqual(layout);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Return to reading size", exact: true }).click();
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
  await expect(subject.locator(".local-file-read")).toHaveCount(1);
  await expect(subject.locator(".local-reading-purpose.local-reading-slot")).toBeVisible();
  await expect(subject).not.toHaveClass(/local-reading-card/u);
});

test("Slot Lines sets every described symbol's allotment at once, an undescribed one's short row stays, and the card's box follows", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await still(page);
  const two = (await layoutBoxes(page)).find(item => item.id === payment)!;
  // PaymentService is described; Get and Post are not, and have short rows whatever Slot Lines says (2026-11-13).
  const described = (rows: Awaited<ReturnType<typeof allotments>>) => rows.filter(item => item.symbol === "PaymentService");
  const undescribed = (rows: Awaited<ReturnType<typeof allotments>>) => rows.filter(item => item.symbol !== "PaymentService");
  const first = await allotments(subject);
  expect(described(first).every(item => item.prose === 34)).toBe(true);
  const shortRow = undescribed(first)[0].row;
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
    expect(described(rows).every(item => item.prose === prose), `${lines} lines of 17 px`).toBe(true);
    expect(undescribed(rows).map(item => item.row), "the short rows stay").toEqual([shortRow, shortRow]);
    expect(await subject.locator(".local-reading-purpose .local-reading-prose").evaluate(element => element.clientHeight)).toBe(prose);
    const box = (await layoutBoxes(page)).find(item => item.id === payment)!;
    expect(Math.sign(box.height - two.height)).toBe(Math.sign(lines - 2));
    expect(box.width).toBe(two.width);
  }
});

/**
 * Since 2026-11-13 a folded description's row is short (the owner: "symbols with no description shown to occupy less
 * vertical space on their row"): a book's fold or restore changes the card's box, a deliberate act; the zoom changes none.
 */
test("books compose all, none and one description, folding rows short and restoring them, and report visible prose separately from saved intent", async ({ page }) => {
  const pinSet = { entries: [{ nodeId: readingState, symbol: "*" }] };
  await page.goto(url({ selectedNodeId: readingState, pinSet }));
  const subject = card(page, readingState), book = subject.locator(".local-file-read");
  const row = subject.locator('.symbol-row[data-symbol="descriptionIsOpen"]');
  const symbolBook = row.locator(".local-symbol-read"), description = row.locator(".local-reading-slot");
  const prose = subject.locator(".local-reading-slot:has(.local-reading-prose:not(:empty))");
  await subject.waitFor();
  await still(page);
  const all = await prose.count(), layout = await layoutBoxes(page);
  expect(all).toBeGreaterThan(2);
  await expect(prose.filter({ visible: true })).toHaveCount(all);
  await expect(book).toHaveAttribute("aria-pressed", "true");
  await expect(book).toHaveAttribute("aria-expanded", "true");

  const height = (boxes: Awaited<ReturnType<typeof layoutBoxes>>): number => boxes.find(item => item.id === readingState)!.height;
  const shortRows = () => subject.locator(".symbol-row.local-row-short");
  const described = await subject.locator(".symbol-row:not(.internals-row):not(.local-row-short)").count();
  await pointAt(page, book, true);
  await still(page);
  await expect(prose.filter({ visible: true })).toHaveCount(0);
  await expect(book).toHaveAttribute("aria-pressed", "false");
  await expect(book).toHaveAttribute("aria-expanded", "false");
  const folded = await layoutBoxes(page);
  expect(height(folded), "every row folded short").toBeLessThan(height(layout));
  await expect(subject.locator(".symbol-row:not(.internals-row):not(.local-row-short)")).toHaveCount(0);
  expect(state(page)).toMatchObject({ pinSet, reading: [{ nodeId: readingState, open: false }] });

  await pointAt(page, symbolBook, true);
  await still(page);
  await expect(prose.filter({ visible: true })).toHaveCount(1);
  await expect(description).toBeVisible();
  await expect(book).toHaveAttribute("aria-pressed", "false");
  await expect(book).toHaveAttribute("aria-expanded", "true");
  await expect(symbolBook).toHaveAttribute("aria-pressed", "true");
  await expect(symbolBook).toHaveAttribute("aria-expanded", "true");
  const one = await layoutBoxes(page);
  expect(height(one), "one row restored").toBeGreaterThan(height(folded));
  await expect(row).not.toHaveClass(/local-row-short/u);
  const subset = [{ nodeId: readingState, open: false }, { nodeId: readingState, symbol: "descriptionIsOpen", open: true }];
  expect(state(page)).toMatchObject({ pinSet, reading: subset });

  // The connections look of the default three looks, where the descriptions leave (the ladder's middle band before
  // 2026-11-13).
  for (let press = 0; press < 3; press += 1) await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await still(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "connections");
  await expect(prose.filter({ visible: true })).toHaveCount(0);
  await expect(book).toHaveAttribute("aria-expanded", "false");
  await expect(symbolBook).toHaveAttribute("aria-expanded", "false");
  await expect(symbolBook).toHaveAttribute("aria-pressed", "true");
  expect(state(page).reading).toEqual(subset);
  expect(await layoutBoxes(page)).toEqual(one);

  // One press back restores the reading band before the growing card's separate fade threshold has recovered.
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await still(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "reading");
  await expect(description).toBeVisible();
  await expect(symbolBook).toHaveAttribute("aria-expanded", "true");
  expect(state(page).reading).toEqual(subset);
  expect(await layoutBoxes(page)).toEqual(one);
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await still(page);

  // A whole-card action replaces individual overrides; an individual fold then wins over that whole-card choice.
  await pointAt(page, book, true);
  await still(page);
  expect(state(page).reading).toEqual([{ nodeId: readingState, open: true }]);
  await expect(prose.filter({ visible: true })).toHaveCount(all);
  await pointAt(page, symbolBook, true);
  await still(page);
  await expect(description).toBeHidden();
  await expect(prose.filter({ visible: true })).toHaveCount(all - 1);
  expect(state(page).reading).toEqual([{ nodeId: readingState, open: true }, { nodeId: readingState, symbol: "descriptionIsOpen", open: false }]);
  await expect(shortRows()).toHaveCount(await subject.locator(".symbol-row:not(.internals-row)").count() - described + 1);
  await expect(row).toHaveClass(/local-row-short/u);
});

for (const composition of [
  { name: "none", choices: [{ nodeId: readingState, open: false }], purpose: false, symbol: false },
  { name: "one description", choices: [{ nodeId: readingState, open: false }, { nodeId: readingState, symbol: "descriptionIsOpen", open: true }], purpose: false, symbol: true },
  { name: "an explicit symbol fold in an open card", choices: [{ nodeId: readingState, open: true }, { nodeId: readingState, symbol: "descriptionIsOpen", open: false }], purpose: true, symbol: false }
]) test(`${composition.name} survives a fresh shared visit, reload and Back without book toggles becoming navigation entries`, async ({ page, browser }) => {
  // Keep a preceding place so that a second Back can prove reading choices did not add their own history entries.
  await page.goto(url({ selectedNodeId: payment }));
  await card(page, payment).waitFor();
  await page.goto(url({ selectedNodeId: readingState, pinSet: { entries: [{ nodeId: readingState, symbol: "*" }] } }));
  const subject = card(page, readingState);
  await subject.waitFor();
  await still(page);
  const book = subject.locator(".local-file-read"), row = subject.locator('.symbol-row[data-symbol="descriptionIsOpen"]');
  if (composition.name !== "an explicit symbol fold in an open card") {
    await pointAt(page, book, true);
    await still(page);
  } else {
    await pointAt(page, book, true);
    await still(page);
    await pointAt(page, book, true);
    await still(page);
  }
  if (composition.name !== "none") {
    await pointAt(page, row.locator(".local-symbol-read"), true);
    await still(page);
  }
  expect(state(page).reading).toEqual(composition.choices);
  const shared = page.url();
  const assertComposition = async (target: Page): Promise<void> => {
    const shown = card(target, readingState);
    await shown.waitFor();
    await expect(shown.locator(".local-reading-purpose"))[composition.purpose ? "toBeVisible" : "toBeHidden"]();
    await expect(shown.locator('.symbol-row[data-symbol="descriptionIsOpen"] .local-reading-slot'))[composition.symbol ? "toBeVisible" : "toBeHidden"]();
    expect(state(target).reading).toEqual(composition.choices);
  };
  await page.reload();
  await subject.waitFor();
  await still(page);
  await assertComposition(page);
  const recipient = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  try {
    const other = await recipient.newPage();
    await other.goto(shared);
    await assertComposition(other);
  } finally { await recipient.close(); }

  await pointAt(page, row.locator(".symbol-label"), true);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goBack();
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  await assertComposition(page);
  await page.goBack();
  await expect(card(page, payment)).toBeVisible();
  expect(state(page).selectedNodeId).toBe(payment);
  await page.goForward();
  await assertComposition(page);
});

test("exact symbol arrivals reveal their heading, while refreshing the same target preserves an intentional scroll", async ({ page }) => {
  await page.goto(url({ selectedNodeId: pathfind }));
  const subject = card(page, pathfind);
  await subject.waitFor();
  await still(page);
  const reachability = subject.locator('.symbol-row[data-symbol="reachability (function)"] .symbol-label');
  await panIntoView(page, reachability);
  await pointAt(page, reachability, true);
  const reader = page.locator("#detail-panel"), body = page.locator("#detail-body");
  const atHeading = async (symbol: string): Promise<void> => {
    const heading = body.locator("[data-reader-symbol] > h4");
    await expect(reader).toHaveClass(/visible/u);
    await expect(heading).toHaveText(symbol);
    await expect(heading).toBeInViewport({ ratio: 1 });
    // A short document may reach its end before its heading can reach the top. Require the nearest possible arrival.
    await expect.poll(() => heading.evaluate(element => {
      const reader = document.querySelector<HTMLElement>("#detail-body")!;
      const top = element.getBoundingClientRect().top - reader.getBoundingClientRect().top + reader.scrollTop;
      return Math.abs(reader.scrollTop - Math.min(top, reader.scrollHeight - reader.clientHeight));
    })).toBeLessThan(1);
  };
  await atHeading("reachability (function)");
  await body.evaluate(element => { element.scrollTop = 200; });
  const scroll = await body.evaluate(element => element.scrollTop);
  expect(scroll).toBeGreaterThan(0);
  await reader.getByRole("button", { name: "Pin symbol", exact: true }).click();
  await expect(reader.getByRole("button", { name: "Unpin symbol", exact: true })).toBeVisible();
  await still(page);
  expect(await body.evaluate(element => element.scrollTop)).toBe(scroll);
  const pins = state(page).pinSet;

  // The long previous description puts Public Symbols well below its heading; its scroll must not hide the new one.
  await body.locator('.symbol-badge[data-symbol="Walk (interface)"]').click();
  await atHeading("Walk (interface)");
  expect(state(page).pinSet).toEqual(pins);
  await page.keyboard.press("Escape");
  await expect(reader).not.toHaveClass(/visible/u);
  const walk = subject.locator('.symbol-row[data-symbol="walk (function)"] .symbol-label');
  await panIntoView(page, walk);
  await pointAt(page, walk, true);
  await atHeading("walk (function)");
  expect(state(page).pinSet).toEqual(pins);
  await page.goBack();
  await expect(reader).not.toHaveClass(/visible/u);
  await page.goForward();
  await atHeading("walk (function)");

  const context = "PaymentService/Data/PaymentsContext.cs";
  // PaymentsContext (constructor) is unconnected, so ask for Unconnected = Shown to click its row directly.
  await page.goto(`/samples/estate${url({ selectedNodeId: context, layout: { localMap: { ...AT_READING_SIZE, unconnected: "shown" } } })}`);
  await card(page, context).waitFor();
  await still(page);
  const constructor = card(page, context).locator('.symbol-row[data-symbol="PaymentsContext (constructor)"] .symbol-label');
  await panIntoView(page, constructor);
  await pointAt(page, constructor, true);
  await atHeading("PaymentsContext (constructor)");
  await body.locator('.symbol-badge[data-symbol="PaymentsContext (class)"]').click();
  await atHeading("PaymentsContext (class)");
});

test("unannotated slot cards omit the empty Purpose block and redundant directory footer while keeping two-line file names whole at connections look", async ({ page }) => {
  const estateService = "PaymentService/PaymentService.cs";
  const estateModel = "PaymentService/Data/Payment.cs";
  await page.goto(`/samples/estate${url({ selectedNodeId: estateService, pinSet: { entries: [{ nodeId: estateService, symbol: "*" }, { nodeId: estateModel, symbol: "*" }] } })}`);
  const serviceCard = card(page, estateService);
  const modelCard = card(page, estateModel);
  await serviceCard.waitFor();
  await modelCard.waitFor();
  await still(page);
  // B1: No empty .local-reading-purpose box or orphaned divider border on unannotated files.
  await expect(serviceCard.locator(".local-reading-purpose")).toHaveCount(0);
  await expect(modelCard.locator(".local-reading-purpose")).toHaveCount(0);
  // B2: Redundant italic .node-directory footer is hidden on every slot card.
  await expect(serviceCard.locator(".node-directory")).toBeHidden();
  await expect(modelCard.locator(".node-directory")).toBeHidden();
  // Short 1-line unannotated filename reserves zero extra --head-gap.
  expect(await modelCard.evaluate(el => el.style.getPropertyValue("--head-gap"))).toBe("");
  // Zoom out to connections look: 2-line unannotated PaymentService.cs stays whole (not truncated with ellipsis).
  for (let press = 0; press < 3; press += 1) await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await still(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "connections");
  const heldText = await serviceCard.locator(".local-file-name-held").evaluate(el => el.getAttribute("data-lines-look-connections") ?? "");
  expect(heldText.replaceAll("\n", ""), "PaymentService.cs stays whole at connections look").toBe("PaymentService.cs");
  expect(heldText).not.toContain("\u2026");
});

test("zero-footer cards ending in Internals hold Internals at full connections-look scale inside the card box", async ({ page }) => {
  await page.goto(url({ selectedNodeId: pathfind }));
  const subject = card(page, pathfind);
  await subject.waitFor();
  await still(page);
  for (let press = 0; press < 3; press += 1) await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await still(page);
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "connections");
  const measured = await page.evaluate(() => {
    const read = (id: string) => {
      const el = document.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(id)}"]`)!;
      const label = el.querySelector<HTMLElement>(".internals-row .symbol-label-text")!;
      const cardRect = el.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const scale = new DOMMatrix(getComputedStyle(label).transform).a || 1;
      const footerCount = el.querySelectorAll(":scope > button.local-disclosure:not(.local-back-references)").length;
      return { id, footerCount, scale, labelBottom: labelRect.bottom, cardBottom: cardRect.bottom };
    };
    return {
      zeroFooter: read("packages/engine/src/live-docs/pathfind.test.ts"),
      overlapping: read("packages/engine/src/live-docs/pathfind.overlapping-ends.test.ts"),
      withFooter: read("packages/engine/src/live-docs/history/queries.test.ts")
    };
  });
  expect(measured.zeroFooter.footerCount).toBe(0);
  expect(measured.overlapping.footerCount).toBe(0);
  expect(measured.withFooter.footerCount).toBeGreaterThan(0);
  for (const item of [measured.zeroFooter, measured.overlapping]) {
    expect(item.scale, `${item.id} holds full connections-look Internals scale`).toBeCloseTo(measured.withFooter.scale, 2);
    expect(item.scale, `${item.id} does not shrink Internals to 1.0`).toBeGreaterThan(2.0);
    expect(item.labelBottom, `${item.id} Internals stays inside card bottom border`).toBeLessThanOrEqual(item.cardBottom - 1);
  }
});

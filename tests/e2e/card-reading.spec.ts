import { expect, test, type Locator, type Page } from "@playwright/test";

import { overlapsAmong, textBoxes, truncations } from "./design-audit";
import { choose } from "./search-bar";
import { keepGrowingComposition, localMapStill, panIntoView } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const pathfind = "packages/engine/src/live-docs/pathfind.ts";
const card = (page: Page, id: string) => page.locator(`.node-card[data-id="${id}"]`);
const url = (state: Partial<UrlStateSnapshot>): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;
const state = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);

const geometry = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => {
  const rect = element.getBoundingClientRect();
  return { id: (element as HTMLElement).dataset.id!, box: [rect.x, rect.y, rect.width, rect.height] };
}));
type Picture = Awaited<ReturnType<typeof geometry>>;
/** Every card's box in the map's own pixels, which no zoom changes. */
const layoutBoxes = (page: Page) => page.locator(".node-card").evaluateAll(elements => elements.map(element => ({
  id: (element as HTMLElement).dataset.id!, width: (element as HTMLElement).offsetWidth, height: (element as HTMLElement).offsetHeight
})).sort((a, b) => a.id.localeCompare(b.id)));
function samePicture(before: Picture, after: Picture): void {
  expect(after.map(item => item.id).sort()).toEqual(before.map(item => item.id).sort());
  for (const item of before) {
    const next = after.find(other => other.id === item.id)!;
    item.box.forEach((value, index) => expect(Math.abs(value - next.box[index]), item.id).toBeLessThan(0.1));
  }
}

test.use({ viewport: { width: 1440, height: 960 } });

/** Every journey here reads the growing composition, which Card Text no longer defaults to (2026-11-05). */
test.beforeEach(async ({ page }) => { await keepGrowingComposition(page); });

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

/** Open the evidence reader the way a person now does from a card: More, then Inspect. */
async function inspectFromMore(page: Page, row: Locator, name: string): Promise<void> {
  await pointAt(page, row.locator(".local-symbol-more, .local-file-more").first(), true);
  await page.getByRole("menuitem", { name: `Inspect ${name}`, exact: true }).click();
}

for (const holdStill of ["click", "hover"] as const) for (const fixture of [
  { id: payment, names: ["PaymentService", "Post"], selected: true },
  { id: pathfind, names: ["Walk (interface)", "walk (function)"], selected: false }
]) {
  test(`taps on ${fixture.selected ? "PaymentService and Post" : "Walk and walk"} open and fold each description with a still name and per-state geometry under ${holdStill} anchoring`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY,
      value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, holdStill, cardText: "grow" } } })
    });
    const pins = { entries: fixture.selected ? [] : fixture.names.map(symbol => ({ nodeId: fixture.id, symbol })) };
    await page.goto(url({ ...(fixture.selected ? { selectedNodeId: fixture.id } : {}), pinSet: pins, reading: [{ nodeId: fixture.id, open: false }] }));
    const subject = card(page, fixture.id);
    await subject.waitFor();
    await localMapStill(page);
    await page.mouse.move(280, 55);
    const initial = await geometry(page);
    const title = (await subject.locator(".node-title").boundingBox())!;
    const block = (name: string) => subject.locator(`.symbol-row[data-symbol="${name}"] .local-reading-block`);
    // Hovering a name draws nothing and moves nothing; only a tap changes the picture.
    await pointAt(page, subject.locator(`.symbol-row[data-symbol="${fixture.names[0]}"] .symbol-label`));
    await page.waitForTimeout(400);
    await expect(block(fixture.names[0])).toBeHidden();
    samePicture(initial, await geometry(page));
    // Each tap opens or folds exactly one description; the same set of open descriptions gives the same picture
    // every time, and the card's name never walks, whichever anchor tuning the person chose.
    const pictures = new Map<string, Picture>();
    const open = new Set<string>();
    for (let pair = 0; pair < 6; pair++) for (const name of fixture.names) {
      await pointAt(page, subject.locator(`.symbol-row[data-symbol="${name}"] .symbol-label`), true);
      if (open.has(name)) open.delete(name); else open.add(name);
      for (const other of fixture.names) await expect(block(other))[open.has(other) ? "toBeVisible" : "toBeHidden"]();
      await localMapStill(page);
      const key = [...open].sort().join("+") || "none";
      const picture = await geometry(page);
      if (pictures.has(key)) samePicture(pictures.get(key)!, picture);
      else pictures.set(key, picture);
      const position = (await subject.locator(".node-title").boundingBox())!;
      expect(Math.abs(position.y - title.y), `the name stays put after a tap on ${name}`).toBeLessThan(1);
      expect(Math.abs(position.x - title.x)).toBeLessThan(1);
      expect(state(page).pinSet).toEqual(pins);
    }
    expect(open.size).toBe(0);
    samePicture(initial, await geometry(page));
    expect(state(page).reading).toEqual([
      { nodeId: fixture.id, open: false },
      ...fixture.names.map(symbol => ({ nodeId: fixture.id, symbol, open: false }))
    ]);
  });
}

for (const viewport of [{ width: 900, height: 700 }, { width: 1440, height: 960 }]) {
  test(`two steps out the prose fades and no card resizes; a tap, the book and a new pin still read at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    // The idle search is off so that each picture below is the solve's own; the search's motion is tested elsewhere.
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY,
      value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, cardText: "grow" } } })
    });
    await page.setViewportSize(viewport);
    await page.goto(url({ selectedNodeId: payment }));
    const subject = card(page, payment), book = subject.locator(".local-file-read");
    await subject.waitFor();
    await localMapStill(page);
    const layout = await layoutBoxes(page);
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
    // Zoom changes no card's box (the owner, 2026-11-05): the prose stays and fades.
    await expect(subject.locator(".local-reading-purpose")).toBeVisible();
    await expect(subject).toHaveClass(/local-reading-faded/u);
    expect(await layoutBoxes(page)).toEqual(layout);
    const initial = state(page);
    const row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
    // A tap folds one description at this scale as at any other, and a second tap opens it again.
    await pointAt(page, row.locator(".symbol-label"), true);
    await expect(row.locator(".local-reading-block")).toBeHidden();
    await localMapStill(page);
    expect(state(page).pinSet).toEqual(initial.pinSet);
    expect(state(page).reading).toEqual([...(initial.reading ?? []), { nodeId: payment, symbol: "PaymentService", open: false }]);
    await pointAt(page, row.locator(".symbol-label"), true);
    await expect(row.locator(".local-reading-block")).toBeVisible();
    await localMapStill(page);
    // The book folds everything and opens everything.
    await pointAt(page, book, true);
    await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
    await expect(book).toHaveAttribute("aria-label", "Read PaymentService.cs");
    expect(state(page).reading).toEqual([{ nodeId: payment, open: false }]);
    await localMapStill(page);
    await pointAt(page, book, true);
    await expect(subject.locator(".local-reading-purpose")).toBeVisible();
    await expect(subject.locator(".symbol-row:not(.internals-row) .local-reading-block:visible")).toHaveCount(3);
    await expect(book).toHaveAttribute("aria-label", "Fold PaymentService.cs");
    expect(state(page).reading).toEqual([{ nodeId: payment, open: true }]);
    await localMapStill(page);
    // Back at reading scale the prose returns to full strength; with everything open again, no box has changed.
    await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
    await localMapStill(page);
    await expect(subject).not.toHaveClass(/local-reading-faded/u);
    expect(await layoutBoxes(page)).toEqual(layout);
    // A new pin changes no reading choice.
    const open = state(page).reading;
    await pointAt(page, subject.locator(".local-file-pin"), true);
    await localMapStill(page);
    expect(state(page).reading).toEqual(open);
    expect(state(page).pinSet.entries).toEqual([{ nodeId: payment, symbol: "*" }]);
    await expect(subject.locator(".symbol-row:not(.internals-row) .local-reading-block:visible")).toHaveCount(3);
  });
}

test("inspection from More, the symbol menu and a pin after a tap keep the clicked symbol context", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment, reading: [{ nodeId: payment, open: false }] }));
  const subject = card(page, payment), row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
  await subject.waitFor();
  await localMapStill(page);
  await pointAt(page, row.locator(".symbol-label"), true);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await localMapStill(page);
  await inspectFromMore(page, row, "PaymentService");
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
  expect(state(page).inspection).toMatchObject({ nodeId: payment, symbol: "PaymentService" });
  expect(state(page).selectedNodeId).toBe(payment);
  expect(state(page).pinSet.entries).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await localMapStill(page);
  const before = (await row.locator(".symbol-label-wrapper").boundingBox())!;
  await pointAt(page, row.locator(".local-symbol-pin"), true);
  await localMapStill(page);
  const after = (await row.locator(".symbol-label-wrapper").boundingBox())!;
  expect(after.x).toBeCloseTo(before.x, 0);
  expect(after.y).toBeCloseTo(before.y, 0);
  expect(state(page).selectedNodeId).toBe(payment);
  expect(state(page).pinSet.entries).toEqual([{ nodeId: payment, symbol: "PaymentService" }]);
  expect(state(page).reading).toEqual([{ nodeId: payment, open: false }, { nodeId: payment, symbol: "PaymentService", open: true }]);
});

test("reversing zoom during disclosure keeps the same reachable frame as settled zoom", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  const endpoints: Array<{ x: number; y: number; camera: number[] }> = [];
  for (const rapid of [true, false]) {
    await page.goto(url({ selectedNodeId: payment }));
    const subject = card(page, payment);
    await subject.waitFor();
    await localMapStill(page);
    const out = (await page.getByRole("button", { name: "Zoom Out", exact: true }).boundingBox())!;
    const inward = (await page.getByRole("button", { name: "Zoom In", exact: true }).boundingBox())!;
    const clickOut = () => page.mouse.click(out.x + out.width / 2, out.y + out.height / 2);
    const clickIn = () => page.mouse.click(inward.x + inward.width / 2, inward.y + inward.height / 2);
    await clickOut();
    if (!rapid) await localMapStill(page);
    await clickOut();
    if (!rapid) await localMapStill(page);
    await clickIn();
    await localMapStill(page);
    endpoints.push(await subject.locator(".node-title").evaluate(element => {
      const box = element.getBoundingClientRect(), frame = document.querySelector("#view-map")!.getBoundingClientRect();
      if (box.left < frame.left || box.right > frame.right || box.top < frame.top || box.bottom > frame.bottom) {
        throw new Error(`Zoom left the subject outside the frame: ${JSON.stringify({ title: box.toJSON(), frame: frame.toJSON() })}`);
      }
      const matrix = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform);
      return { x: box.x, y: box.y, camera: [matrix.a, matrix.e, matrix.f] };
    }));
    await pointAt(page, subject.locator(".local-file-name"));
  }
  expect(Math.abs(endpoints[0].x - endpoints[1].x)).toBeLessThan(0.1);
  expect(Math.abs(endpoints[0].y - endpoints[1].y)).toBeLessThan(0.1);
  endpoints[0].camera.forEach((value, index) => expect(Math.abs(value - endpoints[1].camera[index])).toBeLessThan(0.1));
});

test("tapping Walk and walk opens each, folding both restores the same picture, and the file's name opens and folds everything", async ({ page }) => {
  const pins = { entries: [{ nodeId: pathfind, symbol: "Walk (interface)" }, { nodeId: pathfind, symbol: "walk (function)" }] };
  await page.goto(url({ pinSet: pins, reading: [{ nodeId: pathfind, open: false }] }));
  const subject = card(page, pathfind);
  await subject.waitFor();
  await localMapStill(page);
  await panIntoView(page, subject);
  await page.mouse.move(280, 55);
  await localMapStill(page);
  const before = await geometry(page);
  const row = (symbol: string) => subject.locator(`.symbol-row[data-symbol="${symbol}"]`);
  for (let cycle = 0; cycle < 4; cycle++) {
    for (const [symbol, open] of [["Walk (interface)", 1], ["walk (function)", 2], ["Walk (interface)", 1], ["walk (function)", 0]] as const) {
      await pointAt(page, row(symbol).locator(".symbol-label"), true);
      await expect(subject.locator(".symbol-row .local-reading-block:visible")).toHaveCount(open);
      await localMapStill(page);
      expect(state(page).pinSet).toEqual(pins);
    }
    samePicture(before, await geometry(page));
  }
  const name = subject.locator(".local-file-name"), book = subject.locator(".local-file-read");
  await pointAt(page, name, true);
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await expect(subject.locator(".symbol-row:not(.internals-row) .local-reading-block:visible")).toHaveCount(await subject.locator(".symbol-row.local-row-readable").count());
  await expect(name).toHaveAttribute("aria-expanded", "true");
  await expect(book).toHaveAttribute("aria-expanded", "true");
  await expect(book).toHaveAttribute("aria-pressed", "true");
  expect(state(page).reading).toEqual([{ nodeId: pathfind, open: true }]);
  await localMapStill(page);
  await pointAt(page, name, true);
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
  await expect(name).toHaveAttribute("aria-expanded", "false");
  await expect(book).toHaveAttribute("aria-expanded", "false");
  await expect(book).toHaveAttribute("aria-pressed", "false");
  expect(state(page).reading).toEqual([{ nodeId: pathfind, open: false }]);
  await localMapStill(page);
  samePicture(before, await geometry(page));
});

test("the portrait reading frame returns from overview and follows a phone resize without shrinking text", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await localMapStill(page);
  const before = await geometry(page);
  await page.mouse.move(280, 60);
  await page.mouse.wheel(0, 500);
  await localMapStill(page);
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await expect(subject).toHaveClass(/local-reading-faded/u);
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-expanded", "true");
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await expect(subject).not.toHaveClass(/local-reading-faded/u);
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await localMapStill(page);
  samePicture(before, await geometry(page));
  await page.setViewportSize({ width: 390, height: 844 });
  await localMapStill(page);
  const bounds = await subject.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(48);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(await subject.locator(".local-reading-purpose").evaluate(element => {
    const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
    return parseFloat(getComputedStyle(element).fontSize) * scale;
  })).toBeGreaterThanOrEqual(16);
  const selectors = [".local-focus .symbol-label", ".local-focus .node-title", ".local-focus .local-reading-types", ".local-focus .local-reading-full:not([hidden])"];
  expect(overlapsAmong(await textBoxes(page, selectors))).toEqual([]);
  expect(await truncations(page, selectors)).toEqual([]);
  await expect(subject.locator(".local-reading-purpose .local-reading-full")).toBeInViewport();
});

test("full reading keeps map and pins, traps keyboard focus, and restores the opener on Close and Back", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment), opener = subject.locator(".local-reading-purpose .local-reading-full");
  await opener.waitFor();
  await localMapStill(page);
  const before = await geometry(page);
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toContainText("Download Markdown");
  expect(await dialog.locator(".reader-prose p").first().evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(15);
  samePicture(before, await geometry(page));
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  samePicture(before, await geometry(page));
  await opener.click();
  await page.goBack();
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  expect(state(page).pinSet.entries).toEqual([]);
  samePicture(before, await geometry(page));
});

test("an explicit fold stays folded while its book control keeps keyboard focus", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment), book = subject.locator(".local-file-read");
  await book.waitFor();
  await localMapStill(page);
  await page.keyboard.press("Tab");
  await book.focus();
  await page.keyboard.press("Enter");
  await expect(book).toBeFocused();
  await expect(book).toHaveAttribute("aria-pressed", "false");
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
  expect(state(page).reading).toEqual([{ nodeId: payment, open: false }]);
});

test("a name opens and folds its description from the keyboard and keeps focus, for a symbol and for the file", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment, reading: [{ nodeId: payment, open: false }] }));
  const subject = card(page, payment), row = subject.locator('.symbol-row[data-symbol="Post"]');
  await subject.waitFor();
  await localMapStill(page);
  await row.locator(".symbol-label").focus();
  await page.keyboard.press("Enter");
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeFocused();
  await expect(row.locator(".symbol-label")).toHaveAttribute("aria-expanded", "true");
  await localMapStill(page);
  await page.keyboard.press("Enter");
  await expect(row.locator(".local-reading-block")).toBeHidden();
  await expect(row.locator(".symbol-label")).toBeFocused();
  await expect(row.locator(".symbol-label")).toHaveAttribute("aria-expanded", "false");
  await localMapStill(page);
  const name = subject.locator(".local-file-name");
  await name.focus();
  await page.keyboard.press(" ");
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-expanded", "true");
  expect(state(page).reading).toEqual([{ nodeId: payment, open: true }]);
  expect(state(page).pinSet.entries).toEqual([]);
});

test("shared reading can be open without a pin and folded with a pin, and the full reader carries every symbol section", async ({ page, browser }) => {
  const choices = [{ nodeId: payment, open: false }, { nodeId: pathfind, symbol: "reachability (function)", open: true }];
  const pins = { entries: [{ nodeId: payment, symbol: "*" }] };
  await page.goto(url({ pinSet: pins, reading: choices }));
  await card(page, payment).waitFor();
  await localMapStill(page);
  await expect(card(page, payment).locator(".local-reading-purpose")).toBeHidden();
  const row = card(page, pathfind).locator('.symbol-row[data-symbol="reachability (function)"]');
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row).not.toHaveClass(/branch-symbol-muted/u);
  await panIntoView(page, row.locator(".local-reading-full"));
  await row.locator(".local-reading-full").click();
  await expect(page.getByRole("dialog")).toContainText("The most hops a path takes.");
  const shared = page.url();
  const recipient = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await keepGrowingComposition(recipient);
  try {
    const other = await recipient.newPage();
    await other.goto(shared);
    await expect(other.getByRole("dialog")).toContainText("The most hops a path takes.");
    expect(state(other)).toMatchObject({ pinSet: pins, reading: choices,
      inspection: { kind: "file", nodeId: pathfind, symbol: "reachability (function)", presentation: "reading" } });
    await expect(card(other, payment).locator(".local-reading-purpose")).toBeHidden();
    await expect(card(other, pathfind).locator('.symbol-row[data-symbol="reachability (function)"] .local-reading-block')).toBeVisible();
    await other.keyboard.press("Escape");
    const close = card(other, pathfind).getByRole("button", { name: "Close pathfind.ts", exact: true });
    await panIntoView(other, close);
    await close.click();
    await localMapStill(other);
    await expect(card(other, pathfind)).toHaveCount(0);
    expect(state(other)).toMatchObject({ pinSet: pins, reading: [{ nodeId: payment, open: false }] });
  } finally { await recipient.close(); }
});

test("a symbol search restores reading from overview and follows the row on resize; its name folds and reopens it, and Escape closes the reader opened from More", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  await card(page, payment).waitFor();
  await localMapStill(page);
  await page.mouse.move(280, 60);
  await page.mouse.wheel(0, 700);
  await localMapStill(page);
  await choose(page, "subject", "pathfind.ts walk", { file: pathfind, symbol: "walk (function)" });
  const row = card(page, pathfind).locator('.symbol-row[data-symbol="walk (function)"]');
  await localMapStill(page);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(card(page, pathfind)).not.toHaveClass(/local-reading-faded/u);
  await expect(row.locator(".symbol-label")).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await localMapStill(page);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 960 });
  await localMapStill(page);
  await row.locator(".symbol-label").click();
  await expect(row.locator(".local-reading-block")).toBeHidden();
  await localMapStill(page);
  await row.locator(".symbol-label").click();
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await localMapStill(page);
  await inspectFromMore(page, row, "walk (function)");
  await expect(page.locator("#detail-panel")).toHaveClass(/visible/u);
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
});

test("restoring a full reader in 3D keeps its evidence out of the discovered neighborhood", async ({ page }) => {
  const selectedNodeId = "Portal/Services/GatewayClient.cs";
  await page.goto(`/samples/estate${url({ perspective: "3d", selectedNodeId,
    inspection: { kind: "file", nodeId: "PaymentService/PaymentService.cs", presentation: "reading" } })}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  expect(state(page)).toMatchObject({ selectedNodeId, pinSet: { entries: [] } });
  expect(state(page).discovery ?? null).toBeNull();
  await page.reload();
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  expect(state(page).discovery ?? null).toBeNull();
});

test("a tapped description is saved reading: it survives a 3D round trip and travels without a pin", async ({ page }) => {
  const id = "PaymentService/PaymentService.cs";
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(id)}`);
  const subject = card(page, id);
  await subject.waitFor();
  await localMapStill(page);
  await subject.locator(".local-file-read").click();
  await page.mouse.move(280, 55);
  await localMapStill(page);
  const block = subject.locator('.symbol-row[data-symbol="PaymentService"] .local-reading-block');
  await subject.locator('.symbol-row[data-symbol="PaymentService"] .symbol-label').click();
  await expect(block).toBeVisible();
  await localMapStill(page);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "2D", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await localMapStill(page);
  await expect(block).toBeVisible();
  expect(state(page)).toMatchObject({ pinSet: { entries: [] }, reading: [{ nodeId: id, open: false }, { nodeId: id, symbol: "PaymentService", open: true }] });
});

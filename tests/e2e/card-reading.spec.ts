import { expect, test, type Locator, type Page } from "@playwright/test";

import { overlapsAmong, textBoxes, truncations } from "./design-audit";
import { choose } from "./search-bar";
import { localMapSettled, panIntoView } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const pathfind = "packages/engine/src/live-docs/pathfind.ts";
const card = (page: Page, id: string) => page.locator(`.node-card[data-id="${id}"]`);
const url = (state: Partial<UrlStateSnapshot>): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", ...state })}`;
const state = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);

/** Wait for the camera and disclosure together, including the first approach and a responsive resize. */
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
    throw new Error("The reading picture did not settle");
  });
}

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

test.use({ viewport: { width: 1440, height: 960 } });

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

for (const holdStill of ["click", "hover"] as const) for (const fixture of [
  { id: payment, names: ["PaymentService", "Post"], selected: true },
  { id: pathfind, names: ["Walk (interface)", "walk (function)"], selected: false }
]) {
  test(`uninterrupted ${fixture.selected ? "PaymentService/Post" : "Walk/walk"} reading keeps per-target geometry with ${holdStill} anchoring`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY,
      value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, holdStill } } })
    });
    const pins = { entries: fixture.selected ? [] : fixture.names.map(symbol => ({ nodeId: fixture.id, symbol })) };
    await page.goto(url({ ...(fixture.selected ? { selectedNodeId: fixture.id } : {}), pinSet: pins, reading: [{ nodeId: fixture.id, open: false }] }));
    const subject = card(page, fixture.id);
    await subject.waitFor();
    await still(page);
    await page.mouse.move(280, 55);
    const initial = await geometry(page), choices = state(page).reading;
    const targets = new Map<string, Picture>();
    for (let pair = 0; pair < 8; pair++) for (const name of fixture.names) {
      const row = subject.locator(`.symbol-row[data-symbol="${name}"]`);
      await pointAt(page, row.locator(".symbol-label"));
      await expect(row.locator(".local-reading-block")).toBeVisible();
      await still(page);
      const picture = await geometry(page);
      if (targets.has(name)) samePicture(targets.get(name)!, picture);
      else targets.set(name, picture);
      expect(state(page).pinSet).toEqual(pins);
      expect(state(page).reading).toEqual(choices);
    }
    await page.evaluate(() => document.addEventListener("pointermove", event => {
      Object.assign(window, { readingPointerTarget: (event.target as Element).closest<HTMLElement>(".symbol-row")?.dataset.symbol ?? null });
    }, true));
    const title = (await subject.locator(".node-title").boundingBox())!;
    const observed = new Set<string>();
    for (let visit = 0; visit < 16; visit++) {
      await pointAt(page, subject.locator(`.symbol-row[data-symbol="${fixture.names[visit % 2]}"] .symbol-label`));
      await page.waitForTimeout(110);
      const actual = await page.evaluate(() => Reflect.get(window, "readingPointerTarget") as string | null);
      if (actual && fixture.names.includes(actual)) {
        observed.add(actual);
        await expect(subject.locator(`.symbol-row[data-symbol="${actual}"] .local-reading-block`)).toBeVisible();
      }
      const position = (await subject.locator(".node-title").boundingBox())!;
      expect(Math.abs(position.y - title.y)).toBeLessThan(1);
      expect(Math.abs(position.x - title.x)).toBeLessThan(1);
    }
    expect([...observed].sort()).toEqual([...fixture.names].sort());
    await page.mouse.move(280, 55);
    await still(page);
    samePicture(initial, await geometry(page));
  });
}

for (const viewport of [{ width: 900, height: 700 }, { width: 1440, height: 960 }]) {
  test(`overview reading responds to hover, book and new pins at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(url({ selectedNodeId: payment }));
    const subject = card(page, payment), book = subject.locator(".local-file-read");
    await subject.waitFor();
    await still(page);
    // Cross into automatic overview, then approach to a useful scale without resetting the reading frame.
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    await page.getByRole("button", { name: "Zoom In", exact: true }).click();
    await still(page);
    await expect(subject.locator(".local-reading-purpose")).toBeHidden();
    const initial = state(page), before = await geometry(page);
    const row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
    await pointAt(page, row.locator(".symbol-label"));
    await expect(row.locator(".local-reading-block")).toBeVisible();
    await still(page);
    expect(state(page).pinSet).toEqual(initial.pinSet);
    expect(state(page).reading).toEqual(initial.reading);
    await page.mouse.move(280, 55);
    await still(page);
    samePicture(before, await geometry(page));
    await pointAt(page, book, true);
    await expect(subject.locator(".local-reading-purpose")).toBeVisible();
    await expect(subject.locator(".symbol-row:not(.internals-row) .local-reading-block:visible")).toHaveCount(3);
    await expect(book).toHaveAttribute("aria-label", "Fold PaymentService.cs");
    expect(state(page).reading).toEqual([{ nodeId: payment, open: true }]);
    expect(state(page).pinSet.entries).toEqual([]);
    await still(page);
    await pointAt(page, book, true);
    await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
    await expect(book).toHaveAttribute("aria-label", "Read PaymentService.cs");
    const folded = state(page).reading;
    await still(page);
    await pointAt(page, subject.locator(".local-file-pin"), true);
    await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
    expect(state(page).reading).toEqual(folded);
    expect(state(page).pinSet.entries).toEqual([{ nodeId: payment, symbol: "*" }]);
    // A fresh pin can request automatic descriptions, while the saved explicit Fold above remains authoritative.
    await page.goto(url({ selectedNodeId: payment }));
    await subject.waitFor();
    await still(page);
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    await page.getByRole("button", { name: "Zoom In", exact: true }).click();
    await still(page);
    await expect(subject.locator(".local-reading-purpose")).toBeHidden();
    const freshReading = state(page).reading;
    await pointAt(page, subject.locator(".local-file-pin"), true);
    await expect(subject.locator(".symbol-row:not(.internals-row) .local-reading-block:visible")).toHaveCount(3);
    await expect(subject.locator(".local-reading-purpose")).toBeVisible();
    const requested = state(page);
    expect(requested.reading).toEqual(freshReading);
    expect(requested.pinSet.entries).toEqual([{ nodeId: payment, symbol: "*" }]);
    await page.mouse.move(280, 100);
    await page.mouse.wheel(80, 0);
    await still(page);
    await expect(subject.locator(".local-reading-purpose")).toBeVisible();
    const scaleBefore = await page.locator("#map-viewport").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a);
    // A small inward step stays below automatic restoration, so this checks the request itself survives.
    await page.mouse.wheel(0, -20);
    await still(page);
    expect(await page.locator("#map-viewport").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(scaleBefore);
    await expect(subject.locator(".local-reading-purpose")).toBeVisible();
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await still(page);
    await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
    expect(state(page).reading).toEqual(freshReading);
    expect(state(page).pinSet).toEqual(requested.pinSet);
  });
}

test("inspection, symbol menu and pin during a preview keep the clicked symbol context", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment, reading: [{ nodeId: payment, open: false }] }));
  const subject = card(page, payment), row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
  await subject.waitFor();
  await still(page);
  await pointAt(page, row.locator(".symbol-label"));
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await pointAt(page, row.locator(".symbol-label"), true);
  expect(state(page).inspection).toMatchObject({ nodeId: payment, symbol: "PaymentService" });
  expect(state(page).selectedNodeId).toBe(payment);
  expect(state(page).pinSet.entries).toEqual([]);
  await page.keyboard.press("Escape");
  await still(page);
  await pointAt(page, row.locator(".symbol-label"));
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await pointAt(page, row.locator(".local-symbol-more"), true);
  await expect(page.getByRole("menuitem", { name: "Inspect PaymentService", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await still(page);
  await pointAt(page, row.locator(".symbol-label"));
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await still(page);
  const before = (await row.locator(".symbol-label-wrapper").boundingBox())!;
  await pointAt(page, row.locator(".local-symbol-pin"), true);
  await still(page);
  const after = (await row.locator(".symbol-label-wrapper").boundingBox())!;
  expect(after.x).toBeCloseTo(before.x, 0);
  expect(after.y).toBeCloseTo(before.y, 0);
  expect(state(page).selectedNodeId).toBe(payment);
  expect(state(page).pinSet.entries).toEqual([{ nodeId: payment, symbol: "PaymentService" }]);
  expect(state(page).reading).toEqual([{ nodeId: payment, open: false }]);
});

test("reentering during a preview return preserves the original scene and camera", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto(url({ selectedNodeId: payment, reading: [{ nodeId: payment, open: false }] }));
  const subject = card(page, payment), row = subject.locator('.symbol-row[data-symbol="PaymentService"]');
  await subject.waitFor();
  await still(page);
  const before = await geometry(page), originalState = state(page);
  const camera = () => page.locator("#map-viewport").evaluate(element => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return [matrix.a, matrix.e, matrix.f];
  });
  const originalCamera = await camera();
  await page.evaluate(() => document.addEventListener("pointermove", event => {
    Object.assign(window, { readingPointerTarget: (event.target as Element).closest<HTMLElement>(".symbol-row")?.dataset.symbol ?? null });
  }, true));
  const enter = async (): Promise<void> => {
    await pointAt(page, row.locator(".symbol-label"));
    await page.waitForTimeout(350);
    expect(await page.evaluate(() => Reflect.get(window, "readingPointerTarget"))).toBe("PaymentService");
    await expect(row.locator(".local-reading-block")).toBeVisible();
  };
  await enter();
  for (let visit = 0; visit < 10; visit++) {
    await page.mouse.move(200, 100);
    await page.waitForTimeout(20);
    await enter();
  }
  await page.mouse.move(200, 100);
  await still(page);
  samePicture(before, await geometry(page));
  const returnedCamera = await camera();
  originalCamera.forEach((value, index) => expect(Math.abs(value - returnedCamera[index])).toBeLessThan(0.1));
  expect(state(page).pinSet).toEqual(originalState.pinSet);
  expect(state(page).reading).toEqual(originalState.reading);
});

test("reversing zoom during disclosure keeps the same reachable frame as settled zoom", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  const endpoints: Array<{ x: number; y: number; camera: number[] }> = [];
  for (const rapid of [true, false]) {
    await page.goto(url({ selectedNodeId: payment }));
    const subject = card(page, payment);
    await subject.waitFor();
    await still(page);
    const out = (await page.getByRole("button", { name: "Zoom Out", exact: true }).boundingBox())!;
    const inward = (await page.getByRole("button", { name: "Zoom In", exact: true }).boundingBox())!;
    const clickOut = () => page.mouse.click(out.x + out.width / 2, out.y + out.height / 2);
    const clickIn = () => page.mouse.click(inward.x + inward.width / 2, inward.y + inward.height / 2);
    await clickOut();
    if (!rapid) await still(page);
    await clickOut();
    if (!rapid) await still(page);
    await clickIn();
    await still(page);
    endpoints.push(await subject.locator(".node-title").evaluate(element => {
      const box = element.getBoundingClientRect(), frame = document.querySelector("#view-map")!.getBoundingClientRect();
      if (box.left < frame.left || box.right > frame.right || box.top < frame.top || box.bottom > frame.bottom) {
        throw new Error(`Zoom left the subject outside the frame: ${JSON.stringify({ title: box.toJSON(), frame: frame.toJSON() })}`);
      }
      const matrix = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform);
      return { x: box.x, y: box.y, camera: [matrix.a, matrix.e, matrix.f] };
    }));
    await pointAt(page, subject.locator(".local-file-inspect"));
  }
  expect(Math.abs(endpoints[0].x - endpoints[1].x)).toBeLessThan(0.1);
  expect(Math.abs(endpoints[0].y - endpoints[1].y)).toBeLessThan(0.1);
  endpoints[0].camera.forEach((value, index) => expect(Math.abs(value - endpoints[1].camera[index])).toBeLessThan(0.1));
});

test("temporary Walk and walk reading replaces the preview and restores the same picture repeatedly", async ({ page }) => {
  const pins = { entries: [{ nodeId: pathfind, symbol: "Walk (interface)" }, { nodeId: pathfind, symbol: "walk (function)" }] };
  await page.goto(url({ pinSet: pins, reading: [{ nodeId: pathfind, open: false }] }));
  const subject = card(page, pathfind);
  await subject.waitFor();
  await still(page);
  await panIntoView(page, subject);
  await page.mouse.move(280, 55);
  await still(page);
  const before = await geometry(page), original = await subject.elementHandle();
  for (let cycle = 0; cycle < 4; cycle++) {
    for (const symbol of ["Walk (interface)", "walk (function)", "Walk (interface)"]) {
      const row = subject.locator(`.symbol-row[data-symbol="${symbol}"]`);
      await row.locator(".symbol-label").hover();
      await expect(row.locator(".local-reading-block")).toBeVisible();
      await still(page);
      expect(await subject.locator(".symbol-row .local-reading-block:visible").count()).toBe(1);
      expect(state(page).pinSet).toEqual(pins);
    }
    await page.mouse.move(280, 55);
    await expect(subject.locator(".symbol-row .local-reading-block:visible")).toHaveCount(0);
    await still(page);
    samePicture(before, await geometry(page));
    expect(await original!.evaluate(element => element.isConnected)).toBe(true);
  }
  await subject.locator(".node-title").hover();
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-expanded", "false");
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-pressed", "false");
  expect(state(page).reading).toEqual([{ nodeId: pathfind, open: false }]);
});

test("the portrait reading frame returns from overview and follows a phone resize without shrinking text", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  const subject = card(page, payment);
  await subject.waitFor();
  await still(page);
  const before = await geometry(page);
  await page.mouse.move(280, 60);
  await page.mouse.wheel(0, 500);
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-expanded", "false");
  await expect(subject.locator(".local-file-read")).toHaveAttribute("aria-pressed", "true");
  await still(page);
  await page.getByRole("button", { name: "Reset Zoom", exact: true }).click();
  await expect(subject.locator(".local-reading-purpose")).toBeVisible();
  await still(page);
  samePicture(before, await geometry(page));
  await page.setViewportSize({ width: 390, height: 844 });
  await still(page);
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
  await still(page);
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
  await still(page);
  await page.keyboard.press("Tab");
  await book.focus();
  await page.keyboard.press("Enter");
  await expect(book).toBeFocused();
  await expect(book).toHaveAttribute("aria-pressed", "false");
  await expect(subject.locator(".local-reading-purpose")).toBeHidden();
  await expect(subject.locator(".local-reading-block:visible")).toHaveCount(0);
  expect(state(page).reading).toEqual([{ nodeId: payment, open: false }]);
});

test("shared reading can be open without a pin and folded with a pin, and the full reader carries every symbol section", async ({ page, browser }) => {
  const choices = [{ nodeId: payment, open: false }, { nodeId: pathfind, symbol: "reachability (function)", open: true }];
  const pins = { entries: [{ nodeId: payment, symbol: "*" }] };
  await page.goto(url({ pinSet: pins, reading: choices }));
  await card(page, payment).waitFor();
  await still(page);
  await expect(card(page, payment).locator(".local-reading-purpose")).toBeHidden();
  const row = card(page, pathfind).locator('.symbol-row[data-symbol="reachability (function)"]');
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row).not.toHaveClass(/branch-symbol-muted/u);
  await panIntoView(page, row.locator(".local-reading-full"));
  await row.locator(".local-reading-full").click();
  await expect(page.getByRole("dialog")).toContainText("The most hops a path takes.");
  const shared = page.url();
  const recipient = await browser.newContext({ viewport: { width: 1440, height: 960 } });
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
    await still(other);
    await expect(card(other, pathfind)).toHaveCount(0);
    expect(state(other)).toMatchObject({ pinSet: pins, reading: [{ nodeId: payment, open: false }] });
  } finally { await recipient.close(); }
});

test("a symbol search restores reading from overview, follows the row on resize and yields Escape to inspection", async ({ page }) => {
  await page.goto(url({ selectedNodeId: payment }));
  await card(page, payment).waitFor();
  await still(page);
  await page.mouse.move(280, 60);
  await page.mouse.wheel(0, 700);
  await still(page);
  await choose(page, "subject", "pathfind.ts walk", { file: pathfind, symbol: "walk (function)" });
  const row = card(page, pathfind).locator('.symbol-row[data-symbol="walk (function)"]');
  await still(page);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await still(page);
  await expect(row.locator(".local-reading-block")).toBeVisible();
  await expect(row.locator(".symbol-label")).toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 960 });
  await still(page);
  await row.locator(".symbol-label").click();
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

test("a preview ends when leaving 2D and does not become saved reading on return", async ({ page }) => {
  const id = "PaymentService/PaymentService.cs";
  await page.goto(`/samples/estate/?view=local&node=${encodeURIComponent(id)}`);
  const subject = card(page, id);
  await subject.waitFor();
  await still(page);
  await subject.locator(".local-file-read").click();
  await page.mouse.move(280, 55);
  await still(page);
  const block = subject.locator('.symbol-row[data-symbol="PaymentService"] .local-reading-block');
  await subject.locator('.symbol-row[data-symbol="PaymentService"] .symbol-label').hover();
  await expect(block).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "2D", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await still(page);
  await expect(block).toBeHidden();
  expect(state(page)).toMatchObject({ pinSet: { entries: [] }, reading: [{ nodeId: id, open: false }] });
});

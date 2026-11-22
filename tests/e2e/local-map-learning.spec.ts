import { expect, test, type Page } from "@playwright/test";

import { decompressSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { AT_READING_SIZE, dragBy, keepGrowingComposition, LOCAL_MAP, localMapSettled, panIntoView } from "./still-picture";

const payment = "tests/integration/programs/csharp/estate/PaymentService/PaymentService.cs";
const config = "tests/integration/programs/csharp/estate/PaymentService/App.config";
const entry = `/?view=local&node=${payment}`;

/** Layout completion alone does not mean the camera's following arrival has finished. */
async function stableSubject(page: Page): Promise<{ x: number; y: number; width: number; height: number; scale: number }> {
  return page.evaluate(async () => {
    let previous = "", since = performance.now();
    const deadline = since + 8000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      const title = document.querySelector(".node-card.local-focus .node-title");
      const camera = document.querySelector("#map-viewport");
      if (!title || !camera) continue;
      const box = title.getBoundingClientRect(), transform = getComputedStyle(camera).transform;
      const value = JSON.stringify([box.x, box.y, box.width, box.height, transform]);
      const moving = document.querySelector<HTMLElement>("#map-container .local-placed")?.dataset.moving === "true";
      if (value !== previous || moving) { previous = value; since = performance.now(); }
      if (performance.now() - since > 180) {
        const frame = document.querySelector("#view-map")!.getBoundingClientRect();
        if (box.left < frame.left || box.right > frame.right || box.top < frame.top || box.bottom > frame.bottom) {
          throw new Error(`Stable subject lies outside frame: ${JSON.stringify({ title: box.toJSON(), frame: frame.toJSON(), transform })}`);
        }
        return { x: box.x, y: box.y, width: box.width, height: box.height, scale: new DOMMatrix(transform).a };
      }
    }
    throw new Error("The native subject and camera did not settle together");
  });
}

/** Every journey here reads the growing composition, which Card Text no longer defaults to (2026-11-05). */
test.beforeEach(async ({ page }) => { await keepGrowingComposition(page); });

test("header growth does not pull a deliberately offscreen title back into view", async ({ page }) => {
  await page.goto(entry);
  const title = page.locator(`.node-card[data-id="${payment}"] .node-title`);
  await title.waitFor();
  await localMapSettled(page);
  const frame = (await page.locator("#view-map").boundingBox())!;
  const start = (await title.boundingBox())!;
  await dragBy(page, LOCAL_MAP, 0, frame.y - start.y - 12);
  const before = (await title.boundingBox())!;
  expect(before.y).toBeLessThan(frame.y);
  // Resize the actual header without a navigation action that would choose another held identity.
  await page.locator(".search-bar").evaluate(element => { (element as HTMLElement).style.paddingBottom = "48px"; });
  await expect.poll(async () => (await page.locator("#view-map").boundingBox())!.y).toBeGreaterThan(frame.y);
  await expect.poll(async () => Math.abs((await title.boundingBox())!.y - before.y)).toBeLessThan(1);
});

test("a growing pin header keeps a previously visible acted-on title below its new edge", async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, moveMs: 1200, searchStarts: 0, cardText: "grow" } } })
  });
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto(entry);
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await localMapSettled(page);
  await stableSubject(page);
  const before = (await subject.locator(".node-title").boundingBox())!;
  const oldFrame = (await page.locator("#view-map").boundingBox())!;
  expect(before.y).toBeGreaterThanOrEqual(oldFrame.y);
  await subject.getByRole("button", { name: "Pin PaymentService.cs", exact: true }).click();
  await expect(page.locator(".local-placed")).toHaveAttribute("data-moving", "true");
  expect((await page.locator("#view-map").boundingBox())!.y).toBeGreaterThan(oldFrame.y);
  await localMapSettled(page);
  await expect.poll(async () => (await subject.locator(".node-title").boundingBox())!.y).toBeGreaterThanOrEqual((await page.locator("#view-map").boundingBox())!.y);
  const after = (await subject.locator(".node-title").boundingBox())!;
  expect(after.x).toBeCloseTo(before.x, 0);
  expect(decompressSnapshot(new URL(page.url()).searchParams.get("s")!)?.pinSet.entries).toEqual([{ nodeId: payment, symbol: "*" }]);
});

test("relationship counts name connected files and follow one without acquiring pins", async ({ page }) => {
  await page.goto(entry);
  const subject = page.locator(`.node-card[data-id="${payment}"]`);
  await subject.waitFor();
  await localMapSettled(page);
  const original = await stableSubject(page);
  await subject.getByRole("button", { name: "Used by 3 files", exact: true }).click();
  const menu = page.getByRole("menu", { name: "PaymentService.cs · used by 3 files", exact: true });
  await expect(menu.getByRole("menuitem")).toHaveCount(3);
  await expect(menu).toContainText("File dependency cycle: PaymentService.cs → PaymentsContext.cs → App.config → PaymentService.cs");
  await menu.getByRole("menuitem", { name: /^App\.config/u }).click();
  await expect(page.locator(".node-card.local-focus")).toHaveAttribute("data-id", config);
  await localMapSettled(page);
  expect(decompressSnapshot(new URL(page.url()).searchParams.get("s")!)?.pinSet.entries).toEqual([]);
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  await page.goBack();
  await expect(page.locator(".node-card.local-focus")).toHaveAttribute("data-id", payment);
  await localMapSettled(page);
  const returned = await stableSubject(page);
  expect(returned.x).toBeCloseTo(original.x, 0);
  expect(returned.y).toBeCloseTo(original.y, 0);
  expect(returned.scale).toBeCloseTo(original.scale, 5);
  await subject.getByRole("button", { name: "Uses 7 files", exact: true }).click();
  await expect(page.getByRole("menuitem")).toHaveCount(7);
  await expect(page.getByRole("menuitem", { name: /^PaymentsContext\.cs/u })).toBeVisible();
});

test("the cycle cue names its actual consumer and provider and is keyboard accessible", async ({ page }) => {
  await page.goto(entry);
  const cue = page.locator(`.node-card[data-id="${payment}"] .local-back-references`);
  await cue.waitFor();
  await localMapSettled(page);
  await panIntoView(page, cue);
  await page.keyboard.press("Tab");
  await cue.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: "Connections returning in a cycle", exact: true });
  await expect(menu.getByRole("menuitem")).toHaveCount(1);
  await expect(menu.getByRole("menuitem")).toContainText("App.config uses PaymentService");
  await expect(menu.getByRole("menuitem")).toContainText("PaymentService.cs → PaymentsContext.cs → App.config → PaymentService.cs");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(cue).toBeFocused();
});

test.describe("phone reading", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("Back from a related file restores the reading frame after full reading and relationship menus", async ({ page }) => {
    await page.goto(entry);
    const subject = page.locator(`.node-card[data-id="${payment}"]`);
    await subject.waitFor();
    const original = await stableSubject(page);
    await subject.getByRole("button", { name: "Read full description", exact: true }).first().click();
    await page.keyboard.press("Escape");
    await subject.getByRole("button", { name: "Used by 3 files", exact: true }).click();
    await page.keyboard.press("Escape");
    await subject.getByRole("button", { name: "Uses 7 files", exact: true }).click();
    await page.getByRole("menuitem", { name: /^PaymentRequest\.cs/u }).click();
    await expect(page.locator(".node-card.local-focus")).toHaveAttribute("data-id", "tests/integration/programs/csharp/estate/Contracts/PaymentRequest.cs");
    await stableSubject(page);
    await page.evaluate(nodeId => {
      const observation = { complete: false, samples: 0, outside: [] as Array<{ x: number; y: number }> };
      Object.assign(window, { relationshipReturn: observation });
      let started = 0;
      const sample = (): void => {
        const card = document.querySelector<HTMLElement>(".node-card.local-focus");
        if (card?.dataset.id === nodeId) {
          started ||= performance.now();
          const title = card.querySelector(".node-title")!.getBoundingClientRect();
          const frame = document.querySelector("#view-map")!.getBoundingClientRect();
          observation.samples++;
          if (title.left < frame.left - 1 || title.right > frame.right + 1 || title.top < frame.top - 1 || title.bottom > frame.bottom + 1) {
            observation.outside.push({ x: title.x, y: title.y });
          }
        }
        if (started && performance.now() - started > 1500) observation.complete = true;
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }, payment);
    await page.goBack();
    await expect(page.locator(".node-card.local-focus")).toHaveAttribute("data-id", payment);
    const returned = await stableSubject(page);
    expect(returned.x).toBeCloseTo(original.x, 0);
    expect(returned.y).toBeCloseTo(original.y, 0);
    expect(returned.scale).toBeCloseTo(original.scale, 5);
    await page.waitForFunction(() => Reflect.get(window, "relationshipReturn").complete);
    const motion = await page.evaluate(() => Reflect.get(window, "relationshipReturn") as { samples: number; outside: Array<{ x: number; y: number }> });
    expect(motion.samples).toBeGreaterThan(10);
    expect(motion.outside.length, `First offscreen subject: ${JSON.stringify(motion.outside[0])}`).toBe(0);
    expect(decompressSnapshot(new URL(page.url()).searchParams.get("s")!)?.pinSet.entries).toEqual([]);
    await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  });

  test("touch taps retain command activation and a stationary card hold opens its actions", async ({ page }) => {
    // Its subject is what a tap and a hold do on a card at reading size, not the arrival. On a phone nothing attends
    // the card (no pointer rests, a tap gives no visible focus), so the arrival that ships (2026-11-22) pulls back a
    // second and a half after it lands, under the case's taps.
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      // With the growing composition every journey of this file reads (the beforeEach above), which a whole stored state would otherwise replace.
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardText: "grow" } } })
    });
    await page.goto(entry);
    const subject = page.locator(`.node-card[data-id="${payment}"]`);
    await subject.waitFor();
    await localMapSettled(page);
    const read = subject.locator(".local-file-read");
    await read.tap();
    await expect(read).toHaveAttribute("aria-pressed", "false");
    await read.tap();
    await expect(read).toHaveAttribute("aria-pressed", "true");
    await localMapSettled(page);
    const point = await subject.evaluate(element => {
      const frame = document.querySelector("#view-map")!.getBoundingClientRect();
      for (let y = frame.top + 170; y < frame.bottom - 30; y += 12) {
        for (let x = frame.left + 40; x < frame.right - 30; x += 20) {
          const hit = document.elementFromPoint(x, y);
          if (hit && element.contains(hit) && !hit.closest("button, a, input, select, textarea")) return { x, y };
        }
      }
      throw new Error("No card body is available for a touch hold");
    });
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    await page.waitForTimeout(650);
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
    expect(decompressSnapshot(new URL(page.url()).searchParams.get("s")!)?.pinSet.entries).toEqual([]);
    // What the release of a touch does: the browser sends its own mouse press for the touch to the point the finger
    // lifted from, and the menu, opened under the finger, now stands there. That press lands on the menu's own ground
    // beside its first item. Until 2026-11-22 the browser's default for it took the focus from the menu, which hears
    // Escape only while it has the focus: Escape then closed nothing, and the next tap landed on the menu's first
    // item (the gate of that day; the trace is in the arrival's evidence, tenth milestone). A press on a menu's own
    // ground keeps the menu's focus now (panels/item-menu.ts).
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("[role='menu']")), { message: "the menu keeps the focus after the finger lifts" }).toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
    // Since November 5 a tap on the card's body opens nothing: the file's name folds and opens its reading, and the
    // evidence reader lives in the More menu above.
    await subject.locator(".node-path").tap();
    await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
    const name = subject.locator(".local-file-name");
    await name.tap();
    await expect(name).toHaveAttribute("aria-expanded", "false");
    await expect(read).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
    // The menu's other presses are what they were: one outside it closes it, and one on an item acts.
    const more = subject.locator(".local-file-more");
    await more.tap();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.touchscreen.tap(8, 400);
    await expect(page.getByRole("menu"), "a press outside the menu closes it").toBeHidden();
    await more.tap();
    await page.getByRole("menuitem", { name: /^Inspect /u }).tap();
    await expect(page.getByRole("menu")).toBeHidden();
    await expect(page.locator("#detail-panel"), "a press on an item acts").toHaveClass(/visible/u);
  });

  test("a tap on a wire's reach brings its words, and a tap on something of a card that stands in a wire's reach is the card's own", async ({ page }) => {
    // Wire Answers on a phone (2026-11-22): a finger has no rest and no hover, so a tap is the press that pins a
    // wire's words; and the rule of that day holds for a finger as for a pointer, that everything of a card takes
    // the press before a wire's reach does. Read at reading size: the taps are the subject, not the arrival. Read in
    // the composition that ships, fixed slots, and not in the growing one this file's other journeys read: there the
    // same tap, on the map's ground in a wire's reach, brought no words on the day this was written, twice in two
    // runs, and why was not found (the arrival's evidence, eleventh milestone).
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, cardText: "slots" } } })
    });
    await page.goto(entry);
    await page.locator(`.node-card[data-id="${payment}"]`).waitFor();
    await localMapSettled(page);
    await page.waitForTimeout(600);
    await localMapSettled(page);
    const found = await page.evaluate(() => {
      const view = document.querySelector("#view-map")!.getBoundingClientRect();
      const inView = (x: number, y: number): boolean => x > view.left + 12 && x < view.right - 12 && y > view.top + 70 && y < view.bottom - 110;
      const top = (x: number, y: number): Element | undefined => document.elementsFromPoint(x, y).find(element => !element.classList.contains("wire-band") && !element.classList.contains("wire-hand"));
      let wire: { x: number; y: number; name: string } | null = null, card: { x: number; y: number; what: string } | null = null;
      for (const band of document.querySelectorAll<SVGPathElement>(".wire-band")) {
        const matrix = band.getScreenCTM(), length = band.getTotalLength();
        if (!matrix || !(length > 0)) continue;
        for (const at of [0.5, 0.35, 0.65, 0.2, 0.8, 0.04, 0.96, 0.015, 0.985]) {
          const on = band.getPointAtLength(length * at).matrixTransform(matrix);
          for (const [dx, dy] of [[0, 0], [5, 0], [-5, 0], [0, 5], [0, -5]]) {
            const x = on.x + dx, y = on.y + dy, hit = top(x, y);
            if (!hit || !inView(x, y) || !band.isPointInStroke(new DOMPoint(x, y).matrixTransform(matrix.inverse()))) continue;
            const ground = (hit.id === "view-map" || !!hit.closest("#map-viewport")) && !hit.closest(".node-card, .local-directory-closed, button, a, input, select, .connection-path");
            if (ground && !wire && dx === 0 && dy === 0) wire = { x, y, name: band.getAttribute("aria-label") ?? "" };
            const of = hit.closest<HTMLElement>(".node-card");
            if (of && !card) {
              const control = hit.closest<HTMLElement>("button");
              (control ?? of).addEventListener("click", () => { (window as unknown as { tappedUnderAWire?: boolean }).tappedUnderAWire = true; }, { once: true, capture: true });
              card = { x, y, what: control ? `${control.getAttribute("aria-label") ?? control.className}` : `the card ${of.dataset.id}` };
            }
          }
        }
      }
      return { wire, card, bands: document.querySelectorAll(".wire-band").length };
    });
    expect(found.wire, `a wire's reach on the map's ground in view (${found.bands} wires)`).not.toBeNull();
    await page.touchscreen.tap(found.wire!.x, found.wire!.y);
    const panel = page.locator(".wire-answer");
    const stands = await page.evaluate(({ x, y }) => document.elementsFromPoint(x, y).slice(0, 3).map(element => `${element.tagName.toLowerCase()}.${[...element.classList].slice(0, 2).join(".")}`).join(" over "), found.wire!);
    await expect(panel, `a tap on a wire's reach brings its words (at ${Math.round(found.wire!.x)},${Math.round(found.wire!.y)} stands ${stands})`).toBeVisible();
    await expect(panel).toHaveClass(/pinned/u);
    // The words are the wire's own sentence: its two files are both named in them.
    const said = (await panel.textContent()) ?? "";
    expect(found.wire!.name.split(" ")[0].length > 0 && said.includes(found.wire!.name.split(" ")[0]), `the words "${said}" are those of "${found.wire!.name}"`).toBe(true);
    await page.touchscreen.tap(8, 400);
    await expect(panel, "a tap elsewhere lets go of them").toBeHidden();
    expect(found.card, "something of a card stands in a wire's reach in the phone's picture").not.toBeNull();
    await page.touchscreen.tap(found.card!.x, found.card!.y);
    expect(await page.evaluate(() => (window as unknown as { tappedUnderAWire?: boolean }).tappedUnderAWire === true), `the tap on ${found.card!.what} is its own`).toBe(true);
    await expect(panel, "and brings no wire's words").toBeHidden();
  });

  test("the map ends above its controls and a lower symbol can be panned into clear space", async ({ page }) => {
    await page.goto(entry);
    const subject = page.locator(`.node-card[data-id="${payment}"]`);
    await subject.waitFor();
    await localMapSettled(page);
    // The reading frame slides the card in after the layout settles: the swipe starts once the card has stood still on
    // screen, since under load the scan once ran while the card was still off to the right (2026-11-06).
    await expect.poll(async () => {
      const before = await subject.boundingBox();
      await page.waitForTimeout(300);
      const after = await subject.boundingBox();
      return before && after && before.x === after.x && before.y === after.y && after.x < 390 ? "still" : "moving";
    }, { timeout: 15_000 }).toBe("still");
    const frame = (await page.locator("#view-map").boundingBox())!;
    const controls = (await page.locator(".perspective-controls").boundingBox())!;
    expect(frame.y + frame.height).toBeLessThanOrEqual(controls.y);
    const post = subject.locator('.symbol-row[data-symbol="Post"] .symbol-label');
    const stateBefore = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
    const touch = await page.context().newCDPSession(page);
    for (let attempt = 0; attempt < 12; attempt++) {
      const box = (await post.boundingBox())!;
      if (box.y >= frame.y && box.y + box.height < frame.y + frame.height) break;
      const point = await subject.evaluate((element, area) => {
        for (let y = area.y + area.height - 40; y > area.y + 160; y -= 12) {
          for (let x = area.x + 40; x < area.x + area.width - 30; x += 20) {
            const hit = document.elementFromPoint(x, y);
            if (hit && element.contains(hit) && !hit.closest("button, a, input, select, textarea")) return { x, y };
          }
        }
        throw new Error("No readable card body is available for a touch swipe");
      }, frame);
      await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      const distance = Math.min(180, box.y - frame.y - 80);
      for (let step = 1; step <= 10; step++) {
        await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: point.x, y: point.y - distance * step / 10 }] });
        await page.waitForTimeout(20);
      }
      await page.waitForTimeout(100);
      await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: point.x, y: point.y - distance }] });
      await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await localMapSettled(page);
    }
    const box = (await post.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(frame.y);
    expect(box.y + box.height).toBeLessThan(frame.y + frame.height);
    expect(await post.evaluate(element => {
      const r = element.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return hit === element || (hit !== null && element.contains(hit));
    })).toBe(true);
    const stateAfter = decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
    expect(stateAfter?.selectedNodeId).toEqual(stateBefore?.selectedNodeId);
    expect(stateAfter?.pinSet).toEqual(stateBefore?.pinSet);
    expect(stateAfter?.reading).toEqual(stateBefore?.reading);
    await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/u);
  });
});

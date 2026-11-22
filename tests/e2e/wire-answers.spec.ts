import { expect, test, type Browser, type Page } from "@playwright/test";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { DirectionMarks, MapReads, WireAnswersChoice } from "../../packages/explorer/src/client/types";
import { REST_DWELL } from "../../packages/explorer/src/client/views/pointerRest";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { choose } from "./search-bar";
import { AT_READING_SIZE, LOCAL_MAP, localMapSettled } from "./still-picture";

/**
 * The two wire trials of 2026-11-21, on strangers' top-ranked stumble, which way a line runs (the probe
 * `2026-11-21/Probes/line-direction`). Wire Answers: a 2D wire answers a rested pointer, a press and the keyboard's
 * focus, by the others fading and its words beside it, "`PaymentService.cs` uses `PaymentsContext.cs`", what is used and
 * how many references; a pointer that only passes over draws nothing, a press pins the words until Escape or a press
 * elsewhere, and a drag begun on a wire still pans the map. Direction Marks: chevrons on each wire, along it from what is
 * offered to what uses it, or against it. Read on the estate's `PaymentService` with `Data` opened, the picture a blind
 * playtester stopped at.
 */

const ESTATE = "/samples/estate/";
const directoryBand = (directory: string): string => `.local-directory-band:has(> .local-directory-label[data-directory="${directory}"])`;

async function visit(browser: Browser, localMap: { wireAnswers?: WireAnswersChoice; directionMarks?: DirectionMarks; reads?: MapReads }) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, ...localMap } } })
  });
  const page = await context.newPage();
  await page.goto(ESTATE);
  await page.waitForSelector("#view-world.active", { timeout: 20_000 });
  await choose(page, "subject", "PaymentService", { directory: "PaymentService" });
  await expect(page.locator(directoryBand("PaymentService"))).toHaveCount(1, { timeout: 15_000 });
  await still(page);
  await page.getByRole("button", { name: "Open PaymentService/Data", exact: true }).click();
  await expect(page.locator(directoryBand("PaymentService/Data"))).toHaveCount(1, { timeout: 15_000 });
  await still(page);
  return { context, page };
}

async function still(page: Page): Promise<void> {
  await localMapSettled(page);
  await page.waitForTimeout(300);
  await localMapSettled(page);
}

interface BandPoint { x: number; y: number; key: string; name: string; sourceId: string; targetId: string }

/** A point on a band's wire, in the view and under nothing else, and what the band says; null when none is. */
const bandPoint = (page: Page, selector = ".wire-band:not(.run-band)"): Promise<BandPoint | null> => page.evaluate(selector => {
  const view = document.querySelector("#view-map")!.getBoundingClientRect();
  for (const band of document.querySelectorAll<SVGPathElement>(selector)) {
    for (const at of [0.5, 0.4, 0.6, 0.3, 0.7]) {
      const point = band.getPointAtLength(band.getTotalLength() * at).matrixTransform(band.getScreenCTM()!);
      if (point.x > view.left + 40 && point.x < view.right - 340 && point.y > view.top + 60 && point.y < view.bottom - 160
        && document.elementFromPoint(point.x, point.y) === band) {
        return { x: point.x, y: point.y, key: band.dataset.connectionKey!, name: band.getAttribute("aria-label") ?? "", sourceId: band.dataset.sourceId ?? "", targetId: band.dataset.targetId ?? "" };
      }
    }
  }
  return null;
}, selector);

/** The words standing beside a wire, and whether a press pinned them; null when none stand. */
const answer = (page: Page): Promise<{ text: string; pinned: boolean } | null> => page.evaluate(() => {
  const panel = document.querySelector<HTMLElement>(".wire-answer");
  return panel && !panel.hidden ? { text: panel.textContent ?? "", pinned: panel.classList.contains("pinned") } : null;
});

/** How many wires stand faded: those a highlight did not keep, while one is on. */
const faded = (page: Page): Promise<number> => page.evaluate(() =>
  document.querySelector("#map-container")!.classList.contains("symbol-hover-active")
    ? document.querySelectorAll("#map-connections .connection-path:not(.connection-highlighted):not(.back-route)").length : 0);

const transformOf = (page: Page): Promise<string> => page.evaluate(() => document.querySelector<HTMLElement>("#map-viewport")!.style.transform);

test.describe("Wire Answers", () => {
  test("off, a wire takes no pointer and has no band; on, the default since 2026-11-22, every wire has one", async ({ browser }) => {
    test.setTimeout(120_000);
    const off = await visit(browser, { wireAnswers: "off" });
    expect(await off.page.locator("#map-connections .connection-path").count()).toBeGreaterThan(0);
    await expect(off.page.locator("#map-connections .wire-band")).toHaveCount(0);
    await expect(off.page.locator(".wire-answer")).toBeHidden();
    await off.context.close();
    // Nothing chosen: the product's default.
    const { context, page } = await visit(browser, {});
    await expect(page.locator("#tuning-wire-answers")).toHaveValue("on");
    expect(await page.locator("#map-connections .wire-band").count()).toBeGreaterThan(0);
    await expect(page.locator(".wire-answer")).toBeHidden();
    await context.close();
  });

  /** The panel's box on the screen. */
  const panelBox = (page: Page) => page.evaluate(() => {
    const rect = document.querySelector(".wire-answer")!.getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  });

  /** A pointer brought to rest on a wire in view, its words showing; the default lever. */
  async function rested(browser: Browser) {
    const { context, page } = await visit(browser, {});
    const wire = await bandPoint(page);
    expect(wire, "a wire in view").not.toBeNull();
    await page.mouse.move(wire!.x - 30, wire!.y - 30);
    await page.mouse.move(wire!.x, wire!.y, { steps: 3 });
    await page.waitForTimeout(REST_DWELL + 150);
    const words = await answer(page);
    expect(words?.pinned, "a rested pointer's words, not pinned").toBe(false);
    return { context, page, wire: wire!, words: words! };
  }

  // WCAG 2.1, 1.4.13 Content on Hover or Focus, its three words, and the owner's wish of 2026-11-22: "the ability to
  // mouse into those popovers so I can copy some text out".
  test("hoverable: the pointer goes from the wire onto its words without their going, their text is selected and copied, and nothing pans or pins", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page, wire, words } = await rested(browser);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const panel = await panelBox(page);
    // Nothing covers what is pointed at: the panel stands beside the point, not on it.
    expect(wire.x > panel.left && wire.x < panel.right && wire.y > panel.top && wire.y < panel.bottom, "the panel is off the point asked at").toBe(false);
    // The way there, a few pixels at a time, to the panel's middle: the same words stand at every step.
    const to = { x: (panel.left + panel.right) / 2, y: (panel.top + panel.bottom) / 2 };
    const steps = Math.ceil(Math.hypot(to.x - wire.x, to.y - wire.y) / 4);
    for (let step = 1; step <= steps; step += 1) {
      await page.mouse.move(wire.x + (to.x - wire.x) * step / steps, wire.y + (to.y - wire.y) * step / steps);
      expect(await answer(page), `the words at step ${step} of ${steps}`).toEqual(words);
    }
    // At rest inside the panel, the words stay and their wire is still the one that stands out.
    await page.waitForTimeout(REST_DWELL + 400);
    expect(await answer(page)).toEqual(words);
    expect(await faded(page), "the others still faded").toBeGreaterThan(0);
    // Their text, selected by a drag along the head and copied: the map does not pan, and nothing is pinned.
    const head = (await page.locator(".wire-answer .h").boundingBox())!;
    const before = await transformOf(page);
    await page.mouse.move(head.x + 1, head.y + head.height / 2);
    await page.mouse.down();
    await page.mouse.move(head.x + head.width - 1, head.y + head.height / 2, { steps: 8 });
    await page.mouse.up();
    const selected = await page.evaluate(() => getSelection()?.toString() ?? "");
    expect(selected, "the head's words selected").toContain(" uses ");
    await page.keyboard.press("ControlOrMeta+c");
    expect(await page.evaluate(() => navigator.clipboard.readText()), "and copied").toBe(selected);
    expect(await transformOf(page), "the map did not pan").toBe(before);
    expect(await answer(page), "the words stand, not pinned").toEqual(words);
    // Off the panel and its wire, for the foot of the view: the words go.
    await page.mouse.move(20, 780, { steps: 4 });
    await expect.poll(() => answer(page)).toBeNull();
    expect(await faded(page)).toBe(0);
    await context.close();
  });

  test("dismissible: Escape takes a rested pointer's words away where the pointer stands, and they stay away until it has been elsewhere", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page, wire, words } = await rested(browser);
    await page.keyboard.press("Escape");
    expect(await answer(page), "gone, the pointer not moved").toBeNull();
    expect(await faded(page), "and the fading with them").toBe(0);
    // Still on that wire, a pixel's drift and a rest: they do not come back.
    await page.mouse.move(wire.x + 1, wire.y);
    await page.waitForTimeout(REST_DWELL + 250);
    expect(await answer(page), "dismissed words stay away while the pointer stays on their wire").toBeNull();
    // Elsewhere, then back to rest on it: asked again, they are shown again.
    await page.mouse.move(20, 780, { steps: 4 });
    await page.mouse.move(wire.x, wire.y, { steps: 3 });
    await page.waitForTimeout(REST_DWELL + 150);
    expect(await answer(page)).toEqual(words);
    await context.close();
  });

  test("persistent: no clock takes the words away, on the wire or inside the panel", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page, wire, words } = await rested(browser);
    await page.waitForTimeout(4000);
    expect(await answer(page), "after four seconds at rest on the wire").toEqual(words);
    const panel = await panelBox(page);
    await page.mouse.move((panel.left + panel.right) / 2, (panel.top + panel.bottom) / 2, { steps: Math.ceil(Math.hypot(panel.left - wire.x, panel.top - wire.y) / 4) + 8 });
    await page.waitForTimeout(4000);
    expect(await answer(page), "after four seconds at rest inside the panel").toEqual(words);
    await context.close();
  });

  test("a pointer passing over a wire draws nothing; one resting on it fades the others and says who uses what; leaving takes the words away", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page } = await visit(browser, { wireAnswers: "on" });
    const wire = await bandPoint(page);
    expect(wire, "a wire in view").not.toBeNull();
    // The user is the subject of its sentence, and the sentence is its spoken name.
    const names = await page.evaluate(({ sourceId, targetId }) => {
      const name = (id: string) => document.querySelector(`#map-container .node-card[data-id="${CSS.escape(id)}"] .local-file-name`)?.textContent?.trim() ?? "";
      return { user: name(sourceId), provider: name(targetId) };
    }, wire!);
    expect(wire!.name.startsWith(`${names.user} uses ${names.provider}`), wire!.name).toBe(true);
    expect(wire!.name).toMatch(/\d+ references?$/);

    await page.mouse.move(wire!.x - 80, wire!.y - 80);
    await page.mouse.move(wire!.x + 80, wire!.y + 80, { steps: 8 });
    await page.waitForTimeout(REST_DWELL + 150);
    expect(await answer(page), "passing over draws nothing").toBeNull();
    expect(await faded(page), "and fades nothing").toBe(0);

    await page.mouse.move(wire!.x, wire!.y, { steps: 3 });
    expect(await answer(page), "nothing before the dwell").toBeNull();
    await page.waitForTimeout(REST_DWELL + 150);
    const words = await answer(page);
    expect(words?.pinned).toBe(false);
    expect(words?.text).toContain(`${names.user} uses ${names.provider}`);
    expect(await faded(page), "the others faded").toBeGreaterThan(0);
    expect(await page.evaluate(key => document.querySelector(`#map-connections [data-connection-key="${CSS.escape(JSON.parse(key)[0])}"]`)?.classList.contains("connection-highlighted"), wire!.key)).toBe(true);
    // Its two cards are kept, unfaded.
    for (const id of [wire!.sourceId, wire!.targetId]) {
      await expect(page.locator(`#map-container .node-card[data-id="${id}"]`)).toHaveClass(/card-highlighted/);
    }

    await page.mouse.move(20, 780, { steps: 4 });
    await expect.poll(() => answer(page)).toBeNull();
    expect(await faded(page)).toBe(0);
    await context.close();
  });

  test("a press pins the words until Escape, and a press elsewhere lets go of them", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page } = await visit(browser, { wireAnswers: "on" });
    const wire = await bandPoint(page);
    expect(wire).not.toBeNull();
    const before = await transformOf(page);
    await page.mouse.move(wire!.x, wire!.y);
    await page.mouse.down();
    await page.mouse.up();
    expect((await answer(page))?.pinned, "pinned at once, without a rest").toBe(true);
    expect(await transformOf(page), "a press does not pan").toBe(before);
    await page.mouse.move(20, 780, { steps: 4 });
    await page.waitForTimeout(REST_DWELL + 150);
    expect((await answer(page))?.pinned, "the pointer's leaving keeps a pin").toBe(true);
    await expect(page.locator(".wire-answer .close")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect.poll(() => answer(page)).toBeNull();
    expect(await faded(page)).toBe(0);

    await page.mouse.move(wire!.x, wire!.y);
    await page.mouse.down();
    await page.mouse.up();
    expect((await answer(page))?.pinned).toBe(true);
    // A press elsewhere: on a card's directory line, which is no control and no wire.
    const elsewhere = await page.evaluate(() => {
      const view = document.querySelector("#view-map")!.getBoundingClientRect();
      for (const line of document.querySelectorAll("#map-container .node-card .node-directory")) {
        const box = line.getBoundingClientRect(), x = box.left + 4, y = box.top + box.height / 2;
        if (box.width > 8 && x > view.left && x < view.right && y > view.top + 60 && y < view.bottom - 80 && line.contains(document.elementFromPoint(x, y))) return { x, y };
      }
      return null;
    });
    expect(elsewhere, "a card's directory line in view").not.toBeNull();
    await page.mouse.move(elsewhere!.x, elsewhere!.y);
    await page.mouse.down();
    await page.mouse.up();
    await expect.poll(() => answer(page)).toBeNull();
    await context.close();
  });

  test("a drag begun on a wire pans the map and pins nothing", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page } = await visit(browser, { wireAnswers: "on" });
    const wire = await bandPoint(page);
    expect(wire).not.toBeNull();
    const before = await transformOf(page);
    await page.mouse.move(wire!.x, wire!.y);
    await page.mouse.down();
    await page.mouse.move(wire!.x - 60, wire!.y - 30, { steps: 10 });
    expect(await answer(page), "a drag shows no words").toBeNull();
    await page.mouse.up();
    await still(page);
    const after = await transformOf(page);
    expect(after, "the map panned").not.toBe(before);
    const shift = (transform: string) => transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/)!.slice(1).map(Number);
    const [x0, y0] = shift(before), [x1, y1] = shift(after);
    expect(x1 - x0).toBeLessThan(-40);
    expect(y1 - y0).toBeLessThan(-15);
    expect(await answer(page), "nor pinned").toBeNull();
    await context.close();
  });

  test("the keyboard walks from a card to its wires, whose words show at once, and back by Escape", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page } = await visit(browser, { wireAnswers: "on" });
    const card = "PaymentService/Data/PaymentsContext.cs";
    await page.locator(`#map-container .node-card[data-id="${card}"]`).focus();
    await page.keyboard.press("ArrowRight");
    const focused = await page.evaluate(() => { const element = document.activeElement as HTMLElement | null; return element?.classList.contains("wire-band") ? { target: element.dataset.targetId, name: element.getAttribute("aria-label") } : null; });
    expect(focused?.target, "a wire leaving the card on the right, which it offers").toBe(card);
    const words = await answer(page);
    expect(words?.pinned).toBe(false);
    expect(words?.text).toContain("uses PaymentsContext.cs");
    await page.keyboard.press("Enter");
    expect((await answer(page))?.pinned).toBe(true);
    await page.keyboard.press("Escape");
    expect((await answer(page))?.pinned, "the first Escape lets go of the pin; the focus stays").toBe(false);
    await page.keyboard.press("Escape");
    await expect.poll(() => page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.id)).toBe(card);
    await expect.poll(() => answer(page)).toBeNull();
    await context.close();
  });

  test("the arrow keys go the way they point on the page, in a picture as laid out and in one mirrored", async ({ browser }) => {
    test.setTimeout(120_000);
    // Judged by where things stand on the screen, not by which end of a wire is which: Right from a card takes a wire
    // that reaches beyond the card's right edge, and Right again a card standing to the right; Left likewise. Mirrored
    // (the map's mirror button, 2026-11-22), what uses stands at the left, and the keys still mean the page's sides.
    for (const reads of ["offersFirst", "usesFirst"] as const) {
      const { context, page } = await visit(browser, { reads });
      const card = "PaymentService/Data/PaymentsContext.cs";
      if (reads === "usesFirst") await expect(page.locator("#map-viewport")).toHaveAttribute("data-reads", "usesFirst");
      const focused = () => page.evaluate(() => {
        const element = document.activeElement as HTMLElement, box = element.getBoundingClientRect();
        return { x: box.left + box.width / 2, left: box.left, right: box.right, band: element.classList.contains("wire-band"), id: element.dataset.id ?? null };
      });
      for (const [key, sign] of [["ArrowRight", 1], ["ArrowLeft", -1]] as const) {
        await page.locator(`#map-container .node-card[data-id="${card}"]`).focus();
        const from = await focused();
        await page.keyboard.press(key);
        const wire = await focused();
        expect(wire.band, `${reads}, ${key}: a wire takes the focus`).toBe(true);
        if (sign > 0) expect(wire.right, `${reads}, ${key}: the wire reaches beyond the card's right edge`).toBeGreaterThan(from.right + 4);
        else expect(wire.left, `${reads}, ${key}: the wire reaches beyond the card's left edge`).toBeLessThan(from.left - 4);
        await page.keyboard.press(key);
        const to = await focused();
        expect(to.band, `${reads}, ${key} again: on to a card`).toBe(false);
        expect(to.id, `${reads}, ${key} again: another card`).not.toBe(card);
        expect(sign * (to.x - from.x), `${reads}, ${key} again: the card at that end stands on that side`).toBeGreaterThan(0);
      }
      await context.close();
    }
  });

  test("a gathered wire's band speaks the user-as-subject sentence in place of the wire's own name", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page } = await visit(browser, { wireAnswers: "on" });
    const gathered = await page.evaluate(() => [...document.querySelectorAll<SVGPathElement>("#map-connections .wire-band")]
      .filter(band => JSON.parse(JSON.parse(band.dataset.connectionKey!)[0])[1] === "gathered")
      .map(band => ({ name: band.getAttribute("aria-label"), wire: document.querySelector(`#map-connections [data-connection-key="${CSS.escape(JSON.parse(band.dataset.connectionKey!)[0])}"]`)?.getAttribute("aria-label") ?? null })));
    expect(gathered.length, "the opened directory's pair lines").toBeGreaterThan(0);
    for (const line of gathered) {
      expect(line.name).toMatch(/^\S+ uses \S+.*, \d+ references?$/);
      expect(line.name).not.toContain("offers");
      expect(line.wire, "the wire itself is not named twice").toBeNull();
    }
    await context.close();
  });
});

test.describe("the design audit with both levers on", () => {
  /**
   * The map's words with every wire banded and marked: none collide or are cut. Then a wire's words pinned: none of the
   * panel's own words are cut, and the panel covers neither of the names it speaks of. The panel floats over the map, as
   * the World Map's does, so what it covers elsewhere is not a collision.
   */
  async function audit(page: Page): Promise<void> {
    const boxes = await textBoxes(page, LOCAL_MAP.text);
    expect(boxes.length).toBeGreaterThan(4);
    const overlaps = overlapsAmong(boxes);
    const cut = await truncations(page, LOCAL_MAP.text);
    expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
    const wire = await bandPoint(page);
    expect(wire).not.toBeNull();
    await page.mouse.move(wire!.x, wire!.y);
    await page.mouse.down();
    await page.mouse.up();
    expect((await answer(page))?.pinned).toBe(true);
    const panelCut = await truncations(page, [".wire-answer .h", ".wire-answer .via"]);
    expect(panelCut.length, describeFaults([], panelCut)).toBe(0);
    const covered = await page.evaluate(({ sourceId, targetId }) => {
      const panel = document.querySelector(".wire-answer")!.getBoundingClientRect();
      return [sourceId, targetId].filter(id => {
        const name = document.querySelector(`#map-container .node-card[data-id="${CSS.escape(id)}"] .local-file-name`)?.getBoundingClientRect();
        return name && name.width > 0 && name.right > panel.left && name.left < panel.right && name.bottom > panel.top && name.top < panel.bottom;
      });
    }, wire!);
    expect(covered, "the end cards' names stay in sight").toEqual([]);
  }

  test("on the estate's PaymentService with Data opened", async ({ browser }) => {
    test.setTimeout(90_000);
    const { context, page } = await visit(browser, { wireAnswers: "on", directionMarks: "along" });
    await audit(page);
    await context.close();
  });

  test("on this repository's pathfind.ts at reading size", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, wireAnswers: "on", directionMarks: "against" } } })
    });
    const page = await context.newPage();
    await page.goto(`/?view=local&node=${encodeURIComponent("packages/engine/src/live-docs/pathfind.ts")}`);
    await page.waitForSelector("#map-container .node-card.local-focus", { timeout: 20_000 });
    await still(page);
    await audit(page);
    await context.close();
  });
});

test.describe("Direction Marks", () => {
  /** For each wire with marks: whether every chevron points along the wire's way from its offering end, by its route. */
  const pointing = (page: Page): Promise<Array<{ marks: number; along: boolean[] }>> => page.evaluate(() => {
    return [...document.querySelectorAll<SVGPathElement>("#map-connections path.connection-path[d]:not(.back-route):not(.bundle-run)")].flatMap(path => {
      const parts = (path.getAttribute("d") ?? "").split("M").map(part => part.trim()).filter(Boolean);
      if (!parts.length) return [];
      const numbers = (text: string) => (text.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      const route = numbers(parts[0]);
      const from = { x: route[0], y: route[1] }, to = { x: route.at(-2)!, y: route.at(-1)! };
      const marks = parts.slice(1).map(numbers);
      if (!marks.length) return [{ marks: 0, along: [] }];
      // A chevron's point leads its arms; along the wire, it leads toward the far end of the stretch it stands on, read
      // by the route's general way from its offering end to its using end.
      const way = { x: to.x - from.x, y: to.y - from.y };
      return [{ marks: marks.length, along: marks.map(m => ((m[2] - (m[0] + m[4]) / 2) * way.x + (m[3] - (m[1] + m[5]) / 2) * way.y) > 0) }];
    });
  });

  for (const marks of ["none", "along", "against"] as const) {
    test(`${marks}: ${marks === "none" ? "no wire has a mark" : marks === "along" ? "every mark points from what is offered to what uses it" : "every mark points from the user to what it uses"}`, async ({ browser }) => {
      test.setTimeout(90_000);
      const { context, page } = await visit(browser, { directionMarks: marks });
      const wires = await pointing(page);
      expect(wires.length).toBeGreaterThan(0);
      if (marks === "none") {
        expect(wires.every(wire => wire.marks === 0)).toBe(true);
      } else {
        expect(wires.filter(wire => wire.marks > 0).length, "most wires hold a mark").toBeGreaterThan(wires.length / 2);
        // The general way of a route is a fair reading of a chevron's way on the wires across a gutter, which these are.
        const all = wires.flatMap(wire => wire.along);
        expect(all.filter(along => along === (marks === "along")).length / all.length).toBeGreaterThan(0.9);
      }
      await context.close();
    });
  }
});

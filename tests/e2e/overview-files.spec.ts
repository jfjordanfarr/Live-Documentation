import { expect, test, type Page } from "@playwright/test";

import { localMapStill } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * Files only at the farthest zoom (Tuning → 2D Layout → Zoomed Out Fully, a trial for the owner's eye of 2026-11-13; the
 * owner: "the "Flow" look is much closer to what the full zoom-out in the 2D Local Map might reasonably be"). With it
 * chosen, at the overview look every file card takes the compact form an opened directory's member has, no row laid out
 * and its width and column kept; one line joins each pair of cards where one uses the other, hub to hub, and no symbol's
 * own wire is drawn; the same branches are laid out again for those heights and moved to with the element under the
 * pointer held still, and zooming back in reverses it to the picture that stood. Elsewhere, and with the default chosen,
 * nothing changes. Read on this repository's documentationLinks.ts pinned whole.
 */
const links = "scripts/doc-tools/documentationLinks.ts";
const pinned = (layout?: object): string => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: links,
  pinSet: { entries: [{ nodeId: links, symbol: "*" }] }, ...(layout ? { layout } : {}) })}`;

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

async function open(page: Page, choice: "keep" | "files", path = pinned()): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, overviewFiles: choice } } })
  });
  await page.goto(path);
  await page.locator(`.node-card[data-id="${links}"]`).waitFor();
  await still(page);
}

/** The picture at rest, its move and the look's fade ended. */
async function still(page: Page): Promise<void> {
  await localMapStill(page);
  await page.waitForFunction(() => !document.querySelector(".local-layout[data-moving]") && document.getAnimations().every(animation => animation.playState !== "running"
    || !(animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element && animation.effect.target.closest("#map-container"))));
}

/** A Zoom button pressed as a click that leaves the pointer where it stands over the map. */
const press = (page: Page, label: "Zoom Out" | "Zoom In"): Promise<void> =>
  page.evaluate(name => document.querySelector<HTMLElement>(`#controls [aria-label="${name}"]`)!.click(), label);

async function presses(page: Page, count: number): Promise<void> {
  for (let i = 0; i < count; i += 1) { await press(page, "Zoom Out"); await still(page); }
}

/** The picture as drawn: the look, every card's box and rows in the map's units, and the wires. */
const picture = (page: Page) => page.evaluate(() => {
  const container = document.querySelector<HTMLElement>("#map-container")!, root = container.querySelector<HTMLElement>(".local-layout")!;
  const k = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a, origin = root.getBoundingClientRect();
  const cards = Object.fromEntries([...root.querySelectorAll<HTMLElement>(".local-column")].map(wrapper => {
    const card = wrapper.firstElementChild as HTMLElement, r = wrapper.getBoundingClientRect();
    return [card.dataset.id ?? card.dataset.path ?? "", [r.left - origin.left, r.top - origin.top, r.width, r.height].map(v => Math.round(v / k * 2) / 2)];
  }));
  const rows = [...root.querySelectorAll<HTMLElement>(".node-card .symbol-row")].filter(row => row.offsetHeight > 0).length;
  // The cards as tall as their name needs whole at the overview, rather than as their rows' card was.
  const nameBound = [...root.querySelectorAll<HTMLElement>(".node-card")].filter(card => Math.abs(card.offsetHeight - parseFloat(getComputedStyle(card).minHeight)) < 1).map(card => card.dataset.id ?? "");
  const wires = [...document.querySelectorAll<SVGElement>(".connection-path")].filter(path => !path.closest("[hidden]"))
    .map(path => ({ source: path.dataset.sourceId ?? "", target: path.dataset.targetId ?? "", gathered: path.classList.contains("gathered"), own: path.classList.contains("own"),
      route: path.classList.contains("outbound") && !path.classList.contains("back-route") }));
  return { look: container.dataset.look, files: container.hasAttribute("data-overview-files"), held: container.dataset.overviewHeld, cards, rows, wires, nameBound,
    camera: getComputedStyle(document.querySelector("#map-viewport")!).transform };
});

test("with files only, the overview draws each file compact with one line a pair, and zooming back in returns every card to where it stood", async ({ page }) => {
  test.setTimeout(180_000);
  await open(page, "files");
  await presses(page, 6);
  const six = await picture(page);
  expect(six.look).toBe("connections");
  expect(six.files).toBe(false);
  await presses(page, 1);
  const seven = await picture(page);
  expect(seven.look).toBe("overview");
  expect(seven.files).toBe(true);
  // No row is laid out, every card keeps its width and its column's left, and the pinned file's card is shorter. A card
  // is no taller than its rows' card, unless it is as tall as its name needs whole at the overview (a long name on a
  // card of few rows), since a compact card's height is free and its name is never cut nor broken inside a word.
  expect(seven.rows).toBe(0);
  for (const [id, box] of Object.entries(six.cards)) {
    expect.soft(seven.cards[id]?.[0], `${id}'s left`).toBe(box[0]);
    expect.soft(seven.cards[id]?.[2], `${id}'s width`).toBe(box[2]);
    if (!seven.nameBound.includes(id)) expect.soft(seven.cards[id]?.[3], `${id}'s height`).toBeLessThanOrEqual(box[3]);
  }
  expect(seven.cards[links][3]).toBeLessThan(six.cards[links][3] / 2);
  // Every wire drawn is a pair's gathered line, one each way at most, and none is a symbol's own.
  expect(seven.wires.length).toBeGreaterThan(3);
  expect(seven.wires.filter(wire => !wire.gathered || wire.own)).toEqual([]);
  const pairs = seven.wires.filter(wire => wire.route).map(wire => `${wire.target}→${wire.source}`);
  expect(new Set(pairs).size).toBe(pairs.length);
  // Hovering a card lights its lines and fades the rest, as Flow does.
  await page.locator(`.node-card[data-id="${links}"]`).hover();
  await expect(page.locator("#map-container")).toHaveClass(/flow-hover/);
  await page.mouse.move(1430, 890);
  // Back in, the rows, the symbol wires and every card's box return as they stood.
  await press(page, "Zoom In");
  await still(page);
  const back = await picture(page);
  expect(back.look).toBe("connections");
  expect(back.files).toBe(false);
  expect(back.cards).toEqual(six.cards);
  expect(back.rows).toBe(six.rows);
  expect(back.wires.length).toBe(six.wires.length);
});

test("the element under the pointer is held still on screen while the picture changes layout, and Fit pressed twice changes nothing", async ({ page }) => {
  test.setTimeout(180_000);
  await open(page, "files");
  await presses(page, 6);
  const card = page.locator(`.node-card[data-id="${links}"]`);
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 12);
  const drift = await page.evaluate(async id => {
    const element = document.querySelector<HTMLElement>(`.node-card[data-id="${id}"]`)!.parentElement!;
    document.querySelector<HTMLElement>('#controls [aria-label="Zoom Out"]')!.click();
    const first = element.getBoundingClientRect();
    let most = 0;
    for (let frame = 0; frame < 90; frame += 1) {
      await new Promise(requestAnimationFrame);
      const now = element.getBoundingClientRect();
      most = Math.max(most, Math.hypot(now.left - first.left, now.top - first.top));
    }
    return most;
  }, links);
  await still(page);
  expect((await picture(page)).held).toBe(links);
  expect(drift).toBeLessThan(1);
  // Fit frames the picture its rows would draw, from either layout: a second press changes nothing.
  const fit = page.getByRole("button", { name: "Fit current scope", exact: true });
  await fit.click();
  await still(page);
  const once = await picture(page);
  await fit.click();
  await still(page);
  const twice = await picture(page);
  expect(twice.camera).toBe(once.camera);
  expect(twice.look).toBe(once.look);
  expect(twice.cards).toEqual(once.cards);
});

test("a render while files only shows leaves Fit framing the new picture with its rows: pressed twice it changes nothing", async ({ page }) => {
  test.setTimeout(180_000);
  await open(page, "files");
  await presses(page, 7);
  const before = await picture(page);
  expect(before.files).toBe(true);
  // A filter changed at the overview draws the picture afresh, files only, without the test files.
  await page.getByLabel("Show Tests").uncheck();
  await still(page);
  const after = await picture(page);
  expect(after.files).toBe(true);
  expect(Object.keys(after.cards).length).toBeLessThan(Object.keys(before.cards).length);
  const fit = page.getByRole("button", { name: "Fit current scope", exact: true });
  await fit.click();
  await still(page);
  const once = await picture(page);
  await fit.click();
  await still(page);
  const twice = await picture(page);
  expect(twice.camera).toBe(once.camera);
  expect(twice.cards).toEqual(once.cards);
});

test("with the default, and at every look but the overview, the picture is the cards as they stand", async ({ page, browser }) => {
  test.setTimeout(180_000);
  await open(page, "keep");
  await presses(page, 6);
  const keepSix = await picture(page);
  await presses(page, 1);
  const keepSeven = await picture(page);
  expect(keepSeven.look).toBe("overview");
  expect(keepSeven.files).toBe(false);
  expect(keepSeven.cards).toEqual(keepSix.cards);
  expect(keepSeven.rows).toBeGreaterThan(0);
  // The choice changes nothing at the connections look: the same boxes and the same wires.
  const other = await browser.newPage();
  await open(other, "files");
  await presses(other, 6);
  const filesSix = await picture(other);
  expect(filesSix.cards).toEqual(keepSix.cards);
  expect(filesSix.wires).toEqual(keepSix.wires);
  await other.close();
});

test("a link carries files only only when chosen, and with reduced motion the new picture stands at once", async ({ browser }) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
  });
  await page.goto(pinned({ localMap: { overviewFiles: "files" } }));
  await page.locator(`.node-card[data-id="${links}"]`).waitFor();
  await still(page);
  await expect(page.locator("#tuning-overview-files")).toHaveValue("files");
  await presses(page, 6);
  const moving = await page.evaluate(async () => {
    document.querySelector<HTMLElement>('#controls [aria-label="Zoom Out"]')!.click();
    const now = !!document.querySelector(".local-layout[data-moving]");
    await new Promise(requestAnimationFrame);
    return now || !!document.querySelector(".local-layout[data-moving]");
  });
  expect(moving).toBe(false);
  expect((await picture(page)).files).toBe(true);
  await context.close();
});

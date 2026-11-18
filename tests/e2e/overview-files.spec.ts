import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { choose } from "./search-bar";
import { localMapStill } from "./still-picture";

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

/** The rows a card draws under files only, each pinned by name: whether its name is drawn whole and clear of the file's name, in its card. */
const pinnedRows = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>("#map-container .node-card .symbol-row")].filter(row => row.offsetHeight > 0).map(row => {
  const card = row.closest<HTMLElement>(".node-card")!, text = row.querySelector<HTMLElement>(".symbol-label-text")!, wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper")!;
  const held = card.querySelector<HTMLElement>(".local-file-name-held")!.getBoundingClientRect(), box = card.getBoundingClientRect();
  // The name's own drawing: every fragment of its text, as the browser laid its lines out.
  const range = document.createRange();
  range.selectNodeContents(text);
  const drawn = [...range.getClientRects()].filter(rect => rect.width > 0), name = text.getBoundingClientRect();
  return {
    card: card.dataset.id ?? "", symbol: row.dataset.symbol ?? "", named: row.classList.contains("symbol-pinned-named"),
    shown: getComputedStyle(wrapper).visibility === "visible",
    // Whole: nothing of the text is clipped by its box, across or down, and no line of it ends in an ellipsis' cut.
    whole: text.scrollWidth <= text.clientWidth + 1 && text.scrollHeight <= text.clientHeight + 1 && drawn.every(rect => rect.right <= name.right + 1 && rect.bottom <= name.bottom + 1),
    belowFileName: name.top >= held.bottom - 0.5,
    inCard: name.left >= box.left - 0.5 && name.right <= box.right + 0.5 && name.bottom <= box.bottom + 0.5,
    dots: [...row.querySelectorAll<HTMLElement>(".symbol-anchor.dot")].filter(dot => getComputedStyle(dot).visibility === "visible").length,
    // The scale the name is drawn at, in the map's own units.
    scale: new DOMMatrix(getComputedStyle(text).transform).a
  };
}));

const branchRenderer = "packages/explorer/src/client/views/localView/branch-renderer.ts", branchRestarts = "packages/explorer/src/client/views/localView/branch-restarts.ts";
for (const [what, pins] of [
  ["one symbol", [{ nodeId: branchRenderer, symbol: "renderBranches" }]],
  ["three symbols on two cards", [{ nodeId: branchRenderer, symbol: "renderBranches" }, { nodeId: branchRenderer, symbol: "BranchStage" }, { nodeId: branchRestarts, symbol: "startOrder" }]]
] as const) {
  test(`files only draws what the person pinned by name, ${what}: each row beneath its file's name, its name whole, with its own wires, and Fit pressed twice frames the same picture`, async ({ page }) => {
    // Files only means files and what the person pinned by name (2026-11-15): until then a symbol pinned by name drew no
    // row and no wire of its own at this look, and nothing on the map said which symbol was pinned.
    test.setTimeout(240_000);
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
    });
    await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: branchRenderer, pinSet: { entries: [...pins] } })}`);
    await page.locator(`.node-card[data-id="${branchRenderer}"]`).waitFor({ timeout: 60_000 });
    await still(page);
    await presses(page, 6);
    const six = await picture(page);
    expect(six.look).toBe("connections");
    const cue = await page.getByRole("button", { name: "3D", exact: true }).getAttribute("title");
    await presses(page, 1);
    const seven = await picture(page);
    expect(seven.look).toBe("overview");
    expect(seven.files).toBe(true);
    // Only the rows pinned by name are laid out, each drawn with its dots, its name whole, beneath its file's name.
    const rows = await pinnedRows(page);
    expect(rows.map(row => `${row.card} ${row.symbol}`).sort(), "the rows laid out are the symbols pinned by name").toEqual(pins.map(pin => `${pin.nodeId} ${pin.symbol}`).sort());
    for (const row of rows) {
      expect.soft(row.named && row.shown, `${row.symbol} is drawn`).toBe(true);
      expect.soft(row.whole, `${row.symbol}'s name is whole`).toBe(true);
      expect.soft(row.belowFileName, `${row.symbol} stands below its file's name`).toBe(true);
      expect.soft(row.inCard, `${row.symbol}'s name is inside its card`).toBe(true);
      expect.soft(row.dots, `${row.symbol} has its dots`).toBeGreaterThan(0);
    }
    // The pinned rows of one card are one size, the tightest's, as its file's name is one size; across cards they may differ.
    for (const card of new Set(rows.map(row => row.card))) {
      expect.soft(new Set(rows.filter(row => row.card === card).map(row => row.scale.toFixed(3))).size, `${card}'s pinned rows are one size`).toBe(1);
    }
    // Its own wires are drawn, each touching a pinned symbol's card, above the pairs' lines, which are all still there.
    const own = seven.wires.filter(wire => wire.own);
    expect(own.length, "a pinned symbol's own wires are drawn").toBeGreaterThan(0);
    const pinnedCards = new Set<string>(pins.map(pin => pin.nodeId));
    expect(own.every(wire => pinnedCards.has(wire.source) || pinnedCards.has(wire.target))).toBe(true);
    // Every other wire is a pair's line, but for the laces and the hidden route of a pinned symbol's own returning
    // reference, which are drawn at its card as the closer looks draw them and are no forward route.
    expect(seven.wires.filter(wire => !wire.gathered && !wire.own && (wire.route || !(pinnedCards.has(wire.source) || pinnedCards.has(wire.target)))),
      "every other wire is a pair's line or a pinned symbol's own return").toEqual([]);
    // The returning connections are counted as at the connections look: the pin's own wires change no number.
    await expect(page.getByRole("button", { name: "3D", exact: true })).toHaveAttribute("title", cue!);
    // Fit pressed twice frames the same picture.
    await page.getByRole("button", { name: "Fit current scope", exact: true }).click();
    await still(page);
    const once = await picture(page);
    await page.getByRole("button", { name: "Fit current scope", exact: true }).click();
    await still(page);
    const twice = await picture(page);
    expect(twice.camera).toBe(once.camera);
    expect(twice.cards).toEqual(once.cards);
  });
}

test("with a symbol pinned by name, files only and back in returns every card, row and wire to where it stood", async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
  });
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: branchRenderer,
    pinSet: { entries: [{ nodeId: branchRenderer, symbol: "renderBranches" }, { nodeId: branchRenderer, symbol: "BranchStage" }, { nodeId: branchRestarts, symbol: "startOrder" }] } })}`);
  await page.locator(`.node-card[data-id="${branchRenderer}"]`).waitFor({ timeout: 60_000 });
  await still(page);
  await presses(page, 6);
  const six = await picture(page);
  await presses(page, 1);
  expect((await picture(page)).files).toBe(true);
  await press(page, "Zoom In");
  await still(page);
  const back = await picture(page);
  expect(back.look).toBe("connections");
  expect(back.files).toBe(false);
  expect(back.cards).toEqual(six.cards);
  expect(back.rows).toBe(six.rows);
  expect(back.wires).toEqual(six.wires);
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

test("with cards keeping their size chosen, and at every look but the overview, the picture is the cards as they stand", async ({ page, browser }) => {
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

test("files only is the default, a link carries the cards' size only when chosen, and with reduced motion the new picture stands at once", async ({ browser }) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
  });
  // Files only is Zoomed Out Fully's default since 2026-11-15, a design change by the owner's eye and a comparison with the cards' rows drawn as bars: until then
  // this case opened a link that said files only and expected the default to keep the cards' size.
  await page.goto(pinned({ localMap: { overviewFiles: "keep" } }));
  await page.locator(`.node-card[data-id="${links}"]`).waitFor();
  await still(page);
  await expect(page.locator("#tuning-overview-files"), "a link that says so opens with the cards' size").toHaveValue("keep");
  // A link that says nothing of it, in a browser that remembers nothing of it, opens with files only.
  await page.goto(pinned());
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

/**
 * What a picture holds, apart from where the layout stood it: each card's size, its rows' places inside it, its pins'
 * heights on it and whether it is pinned, and every wire drawn, by its kind and its two ends.
 */
const heldIn = (page: Page) => page.evaluate(() => {
  const offsetIn = (element: HTMLElement, stop: Element): number => {
    let y = 0;
    for (let at: HTMLElement | null = element; at && at !== stop; at = at.offsetParent as HTMLElement | null) y += at.offsetTop;
    return y;
  };
  const cards = Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(card => {
    const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row")].filter(row => row.offsetParent).map(row => `${row.dataset.symbol} ${row.offsetTop} ${row.offsetHeight}${row.classList.contains("symbol-pinned-named") ? " pinned by name" : ""}`);
    const pins = [...card.querySelectorAll<HTMLElement>(".symbol-anchor")].filter(anchor => anchor.offsetParent)
      .map(anchor => `${anchor.classList.contains("inbound") ? "uses" : "offers"} ${anchor.dataset.symbol ?? "*"} ${offsetIn(anchor, card) + anchor.offsetHeight / 2}`);
    return [card.dataset.id!, { size: `${card.offsetWidth}x${card.offsetHeight}`, rows, pins, pinned: card.classList.contains("file-pinned") }];
  }));
  const wires = [...document.querySelectorAll<SVGElement>("#map-connections .connection-path")].filter(path => getComputedStyle(path).display !== "none").map(path =>
    `${[...path.classList].sort().join(".")} ${path.dataset.targetId ?? ""}#${path.dataset.targetSymbol ?? ""} -> ${path.dataset.sourceId ?? ""}#${path.dataset.sourceSymbol ?? ""}`).sort();
  return { look: document.querySelector<HTMLElement>("#map-container")!.dataset.look, files: document.querySelector("#map-container")!.hasAttribute("data-overview-files"), cards, wires };
});

const stillPicture = "tests/e2e/still-picture.ts";
for (const [what, pin] of [
  ["a whole-file pin, from the card's More", async (page: Page): Promise<void> => {
    await page.locator(`.node-card[data-id="${stillPicture}"] .local-file-more`).click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Pin file", exact: true }).click();
  }],
  ["a symbol pinned by name, from the search", async (page: Page): Promise<void> => choose(page, "subject", "localMapStill", { file: stillPicture, symbol: "localMapStill" })]
] as const) {
  test(`a pin made while files only is showing gives, back at reading size, the cards, rows, pins and wires the same pin gives made at reading size: ${what}`, async ({ page }) => {
    // Files only is the default, and a pin there is made on a picture whose rows are not laid out (2026-11-15): what it
    // shows once the cards have their rows again must not depend on where the person stood when they made it.
    //
    // Where the cards stand is not held, and until 2026-11-17 this case held it, by a coincidence of this repository's
    // files. A picture's order is chosen by the price of the picture as it is drawn when it is made: files only there,
    // with compact cards and one line a pair of cards, and the rows here. With localMapStill pinned, once a thirteenth
    // file used it, the start called "previous" won under files only and "seed 1" at reading size: three cards of the
    // last column stood in another order and the column seven units lower, 192 crossings for 190. The search that
    // continues after every picture, which this spec turns off, then prices the picture shown and moves to a better one.
    test.setTimeout(240_000);
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } })
    });
    const address = `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: stillPicture })}`;
    const arrive = async (): Promise<void> => {
      await page.goto(address);
      await page.locator(`.node-card[data-id="${stillPicture}"]`).waitFor({ timeout: 60_000 });
      await still(page);
    };
    // The pin made at reading size.
    await arrive();
    await pin(page);
    await still(page);
    const near = await heldIn(page);
    expect(near.look).toBe("reading");
    expect(Object.values(near.cards).some(card => card.pinned) || near.cards[stillPicture].rows.some(row => row.endsWith("pinned by name")), "the pin was made").toBe(true);
    // The same pin made seven presses out, where files only is showing, then back at reading size.
    await arrive();
    await presses(page, 7);
    expect((await heldIn(page)).files, "files only is showing").toBe(true);
    // The picture was laid out again around whatever stood under the pointer, and the subject's card may have left the
    // frame: Fit brings every card back into it, still in the overview look, before the pin is made on the card.
    await page.getByRole("button", { name: "Fit current scope", exact: true }).click();
    await still(page);
    expect((await heldIn(page)).files, "files only is still showing after Fit").toBe(true);
    await pin(page);
    await still(page);
    // Back to reading size by the control for it, however far out Fit stood.
    await page.getByRole("button", { name: "Return to reading size", exact: true }).click();
    await still(page);
    const far = await heldIn(page);
    expect(far.look).toBe("reading");
    expect(far.files).toBe(false);
    expect(Object.keys(far.cards).sort(), "the same cards").toEqual(Object.keys(near.cards).sort());
    for (const [id, card] of Object.entries(near.cards)) expect.soft(far.cards[id], id).toEqual(card);
    expect.soft(far.wires, "the same wires, by their kinds and their two ends").toEqual(near.wires);
  });
}

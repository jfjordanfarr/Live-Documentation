import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { explorerGraphOf } from "../../packages/explorer/src/shared/graph";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import { localMapStill } from "./still-picture";

/**
 * A cycle's returning connection on the 2D Local Map, in the picture the owner sent on 2026-11-19 (Turn 23 of the
 * November 18 record): the estate sample with the directories PaymentService and PaymentService/Data opened, in Flow,
 * the cards' rows shown. The cycle is PaymentService.cs to PaymentsContext.cs to App.config and back; its return,
 * App.config's use of PaymentService.cs, runs against the left-to-right order and is drawn as two laces. Half of ten
 * blind testers read each lace as a file linking to itself, and the owner, pointing at a row, found that its wires did
 * not stay lit: in Flow every wire between two cards of an opened directory is a pair line between the files' hubs, and
 * a row's hover claimed none, so it faded them all.
 *
 * What a row's hover keeps is read from an oracle apart from the page: the graph's own links, from the bundle's data,
 * say which files a row's links join, and so which drawn things carry them.
 */
const SERVICE = "PaymentService/PaymentService.cs";
const CONFIG = "PaymentService/App.config";
const OWNER = `/samples/estate/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", openDirectories: new Set(["PaymentService", "PaymentService/Data"])
})}`;

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

/** The opacity of a wire at rest, the stylesheet's, which a hover leaves to what it keeps. */
const REST = 0.7;

/** The graph's links of the estate sample, from the bundle's data: who uses whom, from which row to which. */
function estateLinks(): Array<{ source: string; target: string; sourceSymbol: string; targetSymbol: string }> {
  const data = JSON.parse(readFileSync("dist/explorer/samples/estate/explorer-data.json", "utf8")) as StaticExplorerData;
  const id = (end: unknown): string => (typeof end === "string" ? end : (end as { id: string }).id);
  return explorerGraphOf(data.graph).links.map(link => ({
    source: id(link.source), target: id(link.target), sourceSymbol: link.sourceSymbol || "__internals__", targetSymbol: link.targetSymbol || "__internals__"
  }));
}

/** Opens the owner's picture at rest, with its two cycle cards' rows shown as the owner had them, or as it arrives. */
async function ownerPicture(page: Page, rows = true): Promise<void> {
  await page.goto(OWNER);
  await page.locator(`.node-card[data-id="${SERVICE}"]`).waitFor();
  await localMapStill(page);
  for (const file of rows ? [CONFIG, SERVICE] : []) {
    const more = page.locator(`.node-card[data-id="${file}"] > button.local-disclosure:not(.local-reveal-connections):not(.local-back-references)`);
    if (await more.count()) {
      await more.evaluate(element => (element as HTMLElement).click());
      await localMapStill(page);
    }
  }
  await page.mouse.move(1430, 890);
}

/** Every drawn wire, line and lace: its two files, whether it is a return's lace or route, and its opacity once a fade has ended. */
async function drawn(page: Page) {
  await page.waitForTimeout(250);
  return page.locator("#map-connections .connection-path:not(.bundle-run)").evaluateAll(elements => elements
    .filter(element => getComputedStyle(element).display !== "none")
    .map(element => ({
      pair: `${(element as SVGElement).dataset.sourceId} uses ${(element as SVGElement).dataset.targetId}`,
      what: element.classList.contains("back-route") ? "route" : element.tagName === "polygon" ? "lace" : "wire",
      opacity: Number(getComputedStyle(element).opacity)
    })));
}

/** The cards' opacities by file. */
const cardOpacities = (page: Page) => page.locator("#map-container .node-card").evaluateAll(cards =>
  Object.fromEntries(cards.map(card => [(card as HTMLElement).dataset.id!, Number(getComputedStyle(card).opacity)])));

test("in the owner's picture a hovered row keeps every drawn thing that carries one of its links and fades the rest", async ({ page }) => {
  test.setTimeout(90_000);
  const links = estateLinks();
  await ownerPicture(page);
  const rest = await drawn(page);
  expect(rest.length, "the picture draws its lines").toBeGreaterThan(3);
  expect(rest.filter(each => each.what === "lace").map(each => each.pair), "the cycle's return is two laces")
    .toEqual([`${CONFIG} uses ${SERVICE}`, `${CONFIG} uses ${SERVICE}`]);
  // PaymentService.cs's row PaymentService is what App.config's return reaches; App.config's Internals is where it
  // leaves; PaymentsDb is used by PaymentsContext.cs; Estate.Payments.PaymentService carries no link at all.
  for (const [file, symbol] of [[SERVICE, "PaymentService"], [CONFIG, "__internals__"], [CONFIG, "PaymentsDb"], [CONFIG, "Estate.Payments.PaymentService"]]) {
    const own = new Set(links.filter(link => (link.source === file && link.sourceSymbol === symbol) || (link.target === file && link.targetSymbol === symbol))
      .map(link => `${link.source} uses ${link.target}`));
    await page.locator(`.node-card[data-id="${file}"] .symbol-row[data-symbol="${symbol}"] .symbol-label`).hover();
    const hovered = await drawn(page);
    for (const each of hovered) {
      if (own.has(each.pair)) expect(each.opacity, `${file} ${symbol}: ${each.what} ${each.pair} is kept`).toBe(REST);
      else expect(each.opacity, `${file} ${symbol}: ${each.what} ${each.pair} fades`).toBeLessThanOrEqual(0.1);
    }
    // Every drawn pair the row's links join is drawn, a return's route among them once its laces are kept.
    const shown = new Set(hovered.map(each => each.pair));
    for (const pair of own) if (rest.some(each => each.pair === pair)) expect(shown.has(pair), pair).toBe(true);
    if (own.has(`${CONFIG} uses ${SERVICE}`)) expect(hovered.filter(each => each.what === "route" && each.opacity === REST), "the return's whole route").toHaveLength(1);
    await page.mouse.move(1430, 890);
  }
});

/** The cue's colour as the browser computes it, from the palette's token. */
const CUE = "rgb(233, 184, 109)";

/** Every drawn part: its pair, what it is, whether it returns, and how it is drawn. */
const parts = (page: Page) => page.locator("#map-connections .connection-path:not(.bundle-run)").evaluateAll(elements => elements.map(element => {
  const style = getComputedStyle(element);
  return {
    pair: `${(element as SVGElement).dataset.sourceId} uses ${(element as SVGElement).dataset.targetId}`,
    what: element.classList.contains("back-route") ? "route" : element.tagName === "polygon" ? "lace" : "wire",
    returning: element.classList.contains("returning"),
    shown: style.display !== "none", opacity: Number(style.opacity), fill: style.fill, stroke: style.stroke,
    name: element.getAttribute("aria-label"), tooltip: element.querySelector("title")?.textContent ?? null
  };
}));

test("a returning connection's laces wear the cue's colour, are named by their two ends, and a lace or a foot keeps the whole connection", async ({ page }) => {
  test.setTimeout(90_000);
  // As it arrives, both laces in the frame.
  await ownerPicture(page, false);
  const rest = await parts(page);
  const laces = rest.filter(part => part.what === "lace");
  expect(laces).toHaveLength(2);
  // At rest: both laces in the cue's colour, the colour the 3D button lights in; the route not drawn; every other wire
  // in the roles' gradient.
  for (const lace of laces) {
    expect(lace.fill, "a returning lace wears the cue's colour").toBe(CUE);
    expect(lace.returning).toBe(true);
    // The scan's own names: the files, and the line's count, as a gathered line's name says them.
    expect(lace.name).toBe("PaymentService.cs offers App.config 1 reference");
    expect(lace.tooltip, "the tooltip says the same words, the browser's own, once the pointer rests").toBe(lace.name);
  }
  await expect(page.getByRole("button", { name: "3D", exact: true })).toHaveClass(/has-backward-wires/);
  expect(rest.filter(part => part.what === "route" && part.shown)).toEqual([]);
  expect(rest.filter(part => part.what === "wire").every(part => part.stroke.startsWith("url("))).toBe(true);
  const restCards = await cardOpacities(page);

  /** The picture while something keeps the return: its laces, its route and its cards as at rest, everything else faded. */
  const expectKept = async (how: string): Promise<void> => {
    await expect.poll(async () => (await parts(page)).filter(part => part.what === "wire").every(part => part.opacity <= 0.1), how).toBe(true);
    await page.waitForTimeout(250);
    const kept = await parts(page);
    expect(kept.filter(part => part.what === "lace").map(part => part.opacity), `${how}: both laces`).toEqual([REST, REST]);
    expect(kept.filter(part => part.what === "route").map(part => [part.shown, part.opacity, part.stroke]), `${how}: the whole route, in the cue's colour`)
      .toEqual([[true, REST, CUE]]);
    for (const [file, opacity] of Object.entries(await cardOpacities(page))) {
      if (file === CONFIG || file === SERVICE) expect(opacity, `${how}: ${file} stands`).toBe(1);
      else expect(opacity, `${how}: ${file} fades`).toBeLessThan(0.8);
    }
  };
  const expectRest = async (how: string): Promise<void> => {
    await expect.poll(async () => (await parts(page)).filter(part => part.what === "route" && part.shown).length, how).toBe(0);
    await page.waitForTimeout(250);
    expect((await parts(page)).map(part => [part.pair, part.what, part.opacity]), how).toEqual(rest.map(part => [part.pair, part.what, part.opacity]));
    expect(await cardOpacities(page), how).toEqual(restCards);
  };

  // The pointer on either lace, at its middle.
  for (const index of [0, 1]) {
    const box = (await page.locator("#map-connections polygon.returning").nth(index).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expectKept(`lace ${index} pointed at`);
    await page.mouse.move(1430, 890);
    await expectRest(`lace ${index} left`);
  }
  // The keyboard's focus on a lace.
  await page.locator("#map-connections polygon.returning").first().focus();
  await expectKept("a lace focused");
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expectRest("the lace's focus gone");
  // Either card's foot, by the pointer and by the keyboard.
  for (const file of [CONFIG, SERVICE]) {
    const foot = page.locator(`.node-card[data-id="${file}"] .local-back-references`);
    await foot.hover();
    await expectKept(`${file}'s foot pointed at`);
    await page.mouse.move(1430, 890);
    await expectRest(`${file}'s foot left`);
    await foot.focus();
    await expectKept(`${file}'s foot focused`);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await expectRest(`${file}'s foot's focus gone`);
  }
});

/**
 * Every node-level hub a line ends on, in page pixels: its centre, its size in its own units (its box is 12), the middle
 * and height of its file name's first line as drawn, the top of its card's first drawn row, and the ends of the lines
 * drawn to it; with the look's control scale.
 */
const hubs = (page: Page) => page.evaluate(() => {
  const map = document.querySelector<HTMLElement>("#map-container")!;
  const mapScale = new DOMMatrix(getComputedStyle(document.getElementById("map-viewport")!).transform).a || 1;
  const controlScale = Number(map.style.getPropertyValue("--control-scale") || 1);
  const ends = [...document.querySelectorAll<SVGPathElement>("#map-connections path.connection-path:not(.bundle-run)")]
    .filter(path => getComputedStyle(path).display !== "none")
    .flatMap(path => [path.getPointAtLength(0), path.getPointAtLength(path.getTotalLength())].map(point => {
      const m = path.getScreenCTM()!;
      return { x: point.x * m.a + m.e, y: point.y * m.d + m.f };
    }))
    // A lace's end at its pin: its outline runs out along one side and back along the other, from the pin and to it.
    .concat([...document.querySelectorAll<SVGPolygonElement>("#map-connections polygon.connection-path")].map(lace => {
      const m = lace.getScreenCTM()!, first = lace.points.getItem(0), last = lace.points.getItem(lace.points.numberOfItems - 1);
      return { x: (first.x + last.x) / 2 * m.a + m.e, y: (first.y + last.y) / 2 * m.d + m.f };
    }));
  return [...map.querySelectorAll<HTMLElement>(".node-card .symbol-anchor.hub.hub-ends-wire")].map(hub => {
    const card = hub.closest<HTMLElement>(".node-card")!, box = hub.getBoundingClientRect(), cardBox = card.getBoundingClientRect();
    const held = card.querySelector<HTMLElement>(".local-file-name-held")!;
    let line: { middle: number; height: number };
    if (getComputedStyle(held).display !== "none") {
      // The held name is drawn from its element's top, its lines 15 units tall at its own scale.
      const titleScale = new DOMMatrix(getComputedStyle(held).transform).a;
      line = { middle: held.getBoundingClientRect().top + 7.5 * titleScale * mapScale, height: 15 * titleScale };
    } else {
      const range = document.createRange();
      range.selectNodeContents(card.querySelector(".local-file-name-text")!);
      const first = range.getClientRects()[0];
      line = { middle: first.top + first.height / 2, height: first.height / mapScale };
    }
    const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row .symbol-anchor.dot")]
      .filter(dot => getComputedStyle(dot).visibility !== "hidden" && dot.getBoundingClientRect().height > 0)
      .map(dot => dot.getBoundingClientRect().top);
    const centre = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    return {
      card: card.dataset.id!, centre: centre.y, size: box.height / mapScale / 12, line, firstRow: rows.length ? Math.min(...rows) : null,
      // The ends at its card's edge, within the card's height: the lines that end on it.
      wireEnds: ends.filter(end => Math.abs(end.x - centre.x) <= 7 * box.height / 12 + 1 && end.y >= cardBox.top && end.y <= cardBox.bottom).map(end => end.y),
      controlScale
    };
  });
});

test("a card's node-level hubs stand at its file name's first line at every look, sized as the look's dots, the lines ending there", async ({ page }) => {
  test.setTimeout(90_000);
  await ownerPicture(page);
  for (const [look, presses] of [["reading", 0], ["connections", 3], ["overview", 4]] as const) {
    for (let press = 0; press < presses; press += 1) {
      await page.evaluate(() => document.querySelector<HTMLElement>('#controls [aria-label="Zoom Out"]')!.click());
      await localMapStill(page);
    }
    await expect(page.locator("#map-container")).toHaveAttribute("data-look", look);
    const drawnHubs = await hubs(page);
    expect(drawnHubs.length, `${look}: lines end on hubs`).toBeGreaterThan(3);
    for (const hub of drawnHubs) {
      const where = `${look}: ${hub.card}`;
      // On the name's first line: at its middle where the line is the name's own, and at the middle of the line a name of
      // one line shares with the controls' room, which stands lower than the text, at the reading look.
      expect(Math.abs(hub.centre - hub.line.middle), `${where}: on the name's first line`).toBeLessThanOrEqual(look === "reading" ? hub.line.height / 2 : 1);
      // Above every row the card draws, so that no row can be taken for its end.
      if (hub.firstRow !== null) expect(hub.centre, `${where}: above the card's rows`).toBeLessThan(hub.firstRow);
      // As large as the look's controls, as a row's dot is, and no taller than a line of the name.
      expect(hub.size, `${where}: its size`).toBeCloseTo(Math.max(1, Math.min(hub.controlScale, hub.line.height / 12)), 1);
      // The lines drawn to it end level with it.
      expect(hub.wireEnds.length, `${where}: a line ends there`).toBeGreaterThan(0);
      for (const end of hub.wireEnds) expect(Math.abs(end - hub.centre), `${where}: a line's end`).toBeLessThanOrEqual(1);
    }
    if (look !== "reading") expect(Math.max(...drawnHubs.map(hub => hub.size)), `${look}: the hubs grow with the look`).toBeGreaterThan(1.2);
  }
});

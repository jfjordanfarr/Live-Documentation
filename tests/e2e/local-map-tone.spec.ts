import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { AA_SMALL_TEXT, backdrop, contrastRatio, parseColour } from "./contrast";
import { AT_READING_SIZE, localMapStill } from "./still-picture";

/**
 * Tone on the 2D Local Map (2026-11-15; the owner's "font hierarchy" and "more little nits than we can count"). Read
 * from the page as drawn, with the colours the browser computed: a card's text stands in three tones, the file's name
 * and a symbol's name leading the prose that describes them, each legible against the card; no wire glows, at rest,
 * kept by a hover or dimmed by one, and a wire a hover keeps is drawn exactly as a wire at rest, since a hover fades
 * the irrelevant and boosts nothing; an opened directory's outline can be seen against the map and is no stronger than
 * a card's border; and each sample of the 2D legend is drawn in the colours and at the strength of the mark it names.
 */
const payment = "PaymentService/PaymentService.cs";
const estate = (extra: Partial<typeof DEFAULT_SNAPSHOT> = {}): string => `/samples/estate/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: payment, ...extra
})}`;
// A file of this repository whose card is test-backed, with few neighbours.
const wordSeams = "packages/explorer/src/client/views/localView/word-seams.ts";

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

async function open(page: Page, address: string, subject: string): Promise<void> {
  await page.goto(address);
  await page.locator(`.node-card[data-id="${subject}"]`).waitFor();
  await localMapStill(page);
  await page.mouse.move(700, 880);
}

async function zoomOut(page: Page, presses: number): Promise<void> {
  for (let press = 0; press < presses; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
  }
}

/** A text's computed colour and the backgrounds behind it, outermost first, for the contrast helper. */
const toneOf = (page: Page, selector: string) => page.locator(selector).first().evaluate(element => {
  const layers: string[] = [];
  for (let layer: Element | null = element; layer; layer = layer.parentElement) layers.unshift(getComputedStyle(layer).backgroundColor);
  return { colour: getComputedStyle(element).color, layers };
});
const ratio = (tone: { colour: string; layers: string[] }): number => contrastRatio(parseColour(tone.colour), backdrop(tone.layers));

/** Every wire drawn: its classes (kept by a hover, a bundle's shared run, a pinned symbol's own), its opacity and its filter. */
const wires = (page: Page) => page.locator("#map-connections .connection-path").evaluateAll(paths => paths
  .filter(path => getComputedStyle(path).display !== "none")
  .map(path => {
    const style = getComputedStyle(path);
    return { classes: [...path.classList], opacity: Number(style.opacity), filter: style.filter };
  }));

test("a card's text stands in three tones, names leading the prose, each legible against the card", async ({ page }) => {
  // Its subject is the tones at reading size and three presses out, not the arrival: it begins at reading size, where
  // the arrival that ships (2026-11-22) would have pulled back already and three presses would be the overview.
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0 } } })
  });
  await open(page, estate(), payment);
  const card = `.node-card[data-id="${payment}"]`;
  const tones = {
    file: await toneOf(page, `${card} .local-file-name-text`),
    symbol: await toneOf(page, `${card} .symbol-row:not(.internals-row) .symbol-label-text`),
    purpose: await toneOf(page, `${card} .local-reading-purpose .local-reading-prose`),
    description: await toneOf(page, `${card} .symbol-row .local-reading-slot[data-reading-open="true"] .local-reading-prose`)
  };
  const ratios = { file: ratio(tones.file), symbol: ratio(tones.symbol), purpose: ratio(tones.purpose), description: ratio(tones.description) };
  test.info().annotations.push({ type: "contrast", description: JSON.stringify(Object.fromEntries(Object.entries(ratios).map(([name, value]) => [name, value.toFixed(2)]))) });
  for (const [name, value] of Object.entries(ratios)) expect(value, `${name} is legible small text`).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  expect(tones.description.colour, "the Purpose and a description are one tone").toBe(tones.purpose.colour);
  expect(ratios.file, "the file's name leads its symbols' names, or equals them").toBeGreaterThanOrEqual(ratios.symbol);
  // The sizes are fixed by the fits, so the hierarchy is one of value: a name has half again the prose's contrast.
  expect(ratios.symbol / ratios.purpose, "a symbol's name leads the prose that describes it").toBeGreaterThanOrEqual(1.5);

  // Out at the connections look, where the names are held: the same two tones.
  await zoomOut(page, 3);
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "connections");
  expect((await toneOf(page, `${card} .local-file-name-held`)).colour, "the held file name").toBe(tones.file.colour);
  expect((await toneOf(page, `${card} .symbol-row:not(.internals-row) .symbol-label-text`)).colour, "a held symbol name").toBe(tones.symbol.colour);
});

/** The opacity of a wire at rest: the stylesheet's 0.7, which the hovers leave to the wires they keep. */
const WIRE = 0.7;

test("no wire glows, and a hovered row's wires are drawn as a wire at rest while the others fade", async ({ page }) => {
  await open(page, estate(), payment);
  const rest = await wires(page);
  const plain = rest.filter(wire => !wire.classes.includes("bundle-run"));
  expect(plain.length).toBeGreaterThan(0);
  // Each fact of the picture is judged whole and all are reported, so that one failing does not hide the next.
  expect.soft(rest.filter(wire => wire.filter !== "none").length, "no wire at rest glows").toBe(0);
  expect.soft([...new Set(plain.map(wire => wire.opacity))], "every wire at rest is drawn at one opacity").toEqual([WIRE]);
  const row = page.locator(`.node-card[data-id="${payment}"] .symbol-row[data-symbol="PaymentService"] .symbol-label`);
  await row.hover();
  const kept = (wire: { classes: string[] }): boolean => wire.classes.includes("connection-highlighted");
  // The fade is a 150 ms transition: wait for it to end, then read.
  await expect.poll(async () => Math.max(...(await wires(page)).filter(wire => !kept(wire)).map(wire => wire.opacity))).toBeLessThanOrEqual(0.1);
  await page.waitForTimeout(250);
  const hovered = await wires(page);
  const own = hovered.filter(kept), dimmed = hovered.filter(wire => !kept(wire));
  expect(own.length).toBeGreaterThan(0);
  expect(dimmed.length, "the row's wires are some of the picture's, not all").toBeGreaterThan(0);
  expect.soft([...new Set(own.map(wire => wire.opacity))], "a wire the hover keeps is drawn as a wire at rest, not above it").toEqual([WIRE]);
  expect.soft(own.filter(wire => wire.filter !== "none").length, "no kept wire glows").toBe(0);
  expect.soft(dimmed.filter(wire => wire.filter !== "none").length, "no dimmed wire glows").toBe(0);
});

test("at the overview of cards that keep their size a pinned symbol's own wires are drawn as the gathered lines are, without a glow", async ({ page }) => {
  test.setTimeout(60_000);
  // Files only is Zoomed Out Fully's default since 2026-11-15, a design change by the owner's eye and a comparison with the cards' rows drawn as bars; files only draws
  // no row and so no wire of a symbol's own, so this case chooses the cards' size.
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, overviewFiles: "keep" } } })
  });
  await open(page, estate({ pinSet: { entries: [{ nodeId: payment, symbol: "PaymentService" }] } }), payment);
  await zoomOut(page, 7);
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "overview");
  const drawn = await wires(page);
  const own = drawn.filter(wire => wire.classes.includes("own")), gathered = drawn.filter(wire => wire.classes.includes("gathered"));
  expect(own.length, "the pinned symbol keeps wires of its own").toBeGreaterThan(0);
  expect(gathered.length).toBeGreaterThan(0);
  expect.soft([...new Set(drawn.map(wire => wire.opacity))], "its own wires and the gathered lines are drawn at one opacity").toEqual([WIRE]);
  expect.soft(drawn.filter(wire => wire.filter !== "none").length, "no wire glows at the overview").toBe(0);
});

test("an opened directory's outline can be seen against the map, is no stronger than a card's border, and is no filled box", async ({ page }) => {
  await open(page, estate(), payment);
  const read = await page.evaluate(() => {
    const shape = document.querySelector<SVGPathElement>("#map-container .local-membrane-shape")!;
    const layers: string[] = [];
    for (let layer: Element | null = shape.closest(".local-directory-band"); layer; layer = layer.parentElement) layers.unshift(getComputedStyle(layer).backgroundColor);
    const card = document.querySelector<HTMLElement>("#map-container .node-card:not(.test-backed):not(.selected)")!;
    const style = getComputedStyle(shape);
    return { outline: style.stroke, fill: style.fill, border: getComputedStyle(card).borderTopColor, layers };
  });
  const surface = backdrop(read.layers);
  const outline = contrastRatio(parseColour(read.outline), surface), border = contrastRatio(parseColour(read.border), surface);
  test.info().annotations.push({ type: "contrast", description: JSON.stringify({ outline: outline.toFixed(2), cardBorder: border.toFixed(2) }) });
  // A region is ground and a card is figure: the outline is seen, and stands a step under a card's border.
  expect.soft(outline, "the outline can be seen against the map's surface").toBeGreaterThanOrEqual(1.5);
  expect.soft(outline, "the outline is no stronger than a card's border").toBeLessThanOrEqual(border);
  expect(parseColour(read.fill)[3], "a membrane's fill stays a trace: it is no card").toBeLessThan(0.05);
});

test("each sample of the 2D legend is drawn as the mark it names", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: wordSeams })}`);
  await page.locator(`.node-card[data-id="${wordSeams}"]`).waitFor({ timeout: 60_000 });
  await localMapStill(page);
  await page.mouse.move(700, 880);
  await page.waitForTimeout(300);
  const read = await page.evaluate(() => {
    const style = (selector: string, pseudo?: string): CSSStyleDeclaration => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Nothing matches ${selector}`);
      return getComputedStyle(element, pseudo);
    };
    const box = (declared: CSSStyleDeclaration) => ({ background: declared.backgroundColor, border: declared.borderTopColor, width: declared.width, height: declared.height, shadow: declared.boxShadow });
    const stops = [...document.querySelectorAll("#map-connections linearGradient")[0].querySelectorAll("stop")].map(stop => getComputedStyle(stop).stopColor);
    const wire = style("#map-connections path.connection-path:not(.bundle-run):not(.back-route)");
    // The sample is one wire (2026-11-16; until then a row for each end): its two ends are its gradient's first and last colours.
    const sample = (selector: string) => { const declared = style(selector); return { ends: declared.backgroundImage.match(/rgba?\([^)]+\)/gu) ?? [], opacity: declared.opacity, glow: declared.boxShadow, height: parseFloat(declared.height) }; };
    return {
      wire: { offers: stops[0], uses: stops[stops.length - 1], opacity: wire.opacity, glows: wire.filter !== "none", width: parseFloat(wire.strokeWidth) },
      sample: sample("#local-legend .legend-swatch"),
      dots: { offers: box(style("#map-container .symbol-anchor.dot.outbound:not(.internals-anchor)")), uses: box(style("#map-container .symbol-anchor.dot.inbound:not(.internals-anchor)")) },
      dotSamples: { offers: box(style("#local-legend .legend-symbol--outbound")), uses: box(style("#local-legend .legend-symbol--inbound")) },
      card: { background: style("#map-container .node-card.test-backed").backgroundColor, border: style("#map-container .node-card.test-backed").borderTopColor,
        haloBackground: style("#map-container .node-card.test-backed", "::before").backgroundColor, haloBorder: style("#map-container .node-card.test-backed", "::before").borderTopColor },
      cardSample: { background: style("#local-legend .legend-shadow", "::after").backgroundColor, border: style("#local-legend .legend-shadow", "::after").borderTopColor,
        haloBackground: style("#local-legend .legend-shadow").backgroundColor, haloBorder: style("#local-legend .legend-shadow").borderTopColor }
    };
  });
  // A wire's two ends: the gradient's first and last colours, at a wire's own opacity, glowing only if a wire does.
  // Every sample is judged and all that differ are reported.
  expect.soft(read.sample.ends, "the wire runs from its offering end's colour to its using end's").toEqual([read.wire.offers, read.wire.uses]);
  expect.soft(read.sample.opacity, "the wire, at a wire's own opacity").toBe(read.wire.opacity);
  expect.soft(read.sample.glow !== "none", "the wire glows only if a wire does").toBe(read.wire.glows);
  expect.soft(Math.abs(read.sample.height - read.wire.width), "the wire is as thick as a wire, to half a pixel").toBeLessThanOrEqual(0.5);
  for (const end of ["offers", "uses"] as const) expect.soft(read.dotSamples[end], `the ${end} dot`).toEqual(read.dots[end]);
  expect.soft(read.cardSample, "a test-backed card: the card in its border, inside its halo").toEqual(read.card);
});

/**
 * The layout lab's capture of a Local Map scope: everything the card model
 * needs to size every card at any width, read once from the built page in a
 * browser. Text is prepared with Pretext inside the page, where the canvas
 * knows the fonts, and serialized; the card model lays it out again in node.
 * The capture also records what the page itself showed, the truth the lab's
 * model is held to.
 *
 * @module layout-lab/capture
 */
import { chromium, type Page } from "@playwright/test";
import * as fs from "node:fs/promises";
import path from "node:path";


import { TEXT_TOLERANCE } from "./card-model";
import { admitCompiledFunctions, ORIGIN, serveBundle, type ScopeRun } from "./scopes";
import { localRetainUrl } from "../../tests/e2e/still-picture";

/** A text as Pretext prepared it in the page: its segments and their measured widths, laid out again by arithmetic. */
export interface PreparedText {
  text: string;
  /** The key of the font the text is set in, in `Capture.fonts`. */
  font: string;
  /** Pretext's prepared text, serialized whole; `layoutWithLines` reads it as it is. */
  prepared: unknown;
}

/** A font as the page renders it: the canvas font string, the letter spacing, and the height of one line. */
export interface FontMetrics {
  font: string;
  letterSpacing: number;
  lineHeight: number;
  /** The width of each character the lab may need to set in this font without a prepared text: digits, letters, space and plus. */
  glyphs: Record<string, number>;
}

/** One symbol row of a card: its name, its label's prepared text and the width of its type badges. */
export interface RowCapture {
  /** The symbol as the row's `data-symbol` carries it; `__internals__` for the Internals row. */
  symbol: string;
  label: PreparedText;
  /** The width of the row's type badges, zero when it has none. */
  badgesWidth: number;
}

/** A test chip's, or the test label's, box as the page drew it. */
export interface ChipCapture {
  width: number;
  height: number;
}

/** One card, as the page built it. */
export interface CardCapture {
  id: string;
  /** The card's width as its content asks, with no cap: the wrapper at max-content. */
  naturalWidth: number;
  /** The card's border on each side (two pixels for the subject) and its padding. */
  borderWidth: number;
  padding: number;
  minWidth: number;
  title: PreparedText;
  path: PreparedText;
  directory: PreparedText;
  /** The "No public symbols" line, when the card has one. */
  meta: PreparedText | null;
  rows: RowCapture[];
  tests: { label: ChipCapture; chips: ChipCapture[] } | null;
  /** The disclosure lines under the card as captured: hidden symbols, references read back, connections outside. */
  notes: PreparedText[];
  /** An inbound dot's centre from the card's left edge, an outbound dot's from its right, and the hub's from its right. */
  pinInboundX: number;
  pinOutboundX: number;
  hubX: number;
  /** What the page showed at capture: the card's width and height and every anchor's offset from its top, rounded as the renderer rounds. */
  truth: { width: number; height: number; pins: Record<string, number> };
}

/** The page's constants the card model composes with, read from computed styles. */
export interface CardConstants {
  titleMarginBottom: number;
  titlePaddingRight: number;
  symbolsMarginTop: number;
  gridRowGap: number;
  gridColumnGap: number;
  gridSideColumn: number;
  dotHeight: number;
  badgeHeight: number;
  badgeGap: number;
  testsMarginTop: number;
  testsMarginBottom: number;
  testsGap: number;
  directoryMarginTop: number;
  disclosureMarginTop: number;
  labelPaddingBottom: number;
  /** The Internals row's dot stands this far below the row's top edge of its box, and its placeholder on the other side is this tall with its margin. */
  internalsDotMarginTop: number;
  placeholderHeight: number;
}

/** A scope's capture: the fonts, the constants, every card, every label, the page's truth and the warnings. */
export interface Capture {
  bundle: string;
  base: string;
  scopeName: string;
  subject: string;
  files: string[];
  capturedAt: string;
  userAgent: string;
  fonts: Record<string, FontMetrics>;
  constants: CardConstants;
  cards: Record<string, CardCapture>;
  /** Each drawn directory's label text, prepared. */
  labels: Record<string, PreparedText>;
  /** What the page showed at capture: its placement measure, size and each drawn directory's label height. */
  truth: { placementCost: number; pictureWidth: number; pictureHeight: number; labelHeights: Record<string, number> };
  /** Where Pretext's layout of a text at the page's width disagreed with the page by more than half a pixel. */
  warnings: string[];
}

const PRETEXT_DIST = path.resolve(__dirname, "../../node_modules/@chenglou/pretext/dist");

/** Opens the scope in a browser of the lab's own over the built bundle and reads the capture. */
export async function captureScope(run: ScopeRun): Promise<Capture> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await serveBundle(page);
    await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
    return await captureFromPage(page, run);
  } finally {
    await browser.close();
  }
}

/**
 * Reads the capture from a page already showing the scope's retained Local
 * Map, under any origin: Pretext is served to the page from the lab's own
 * node_modules and loaded as a module, then the page is read in one go.
 */
export async function captureFromPage(page: Page, run: ScopeRun): Promise<Capture> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 30_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.route("**/__pretext/**", async route => {
    const file = path.join(PRETEXT_DIST, new URL(route.request().url()).pathname.replace(/^.*\/__pretext\//u, ""));
    await route.fulfill({ body: await fs.readFile(file), contentType: "application/javascript" });
  });
  await page.addScriptTag({ type: "module", content: `import * as pretext from "/__pretext/layout.js"; window.__pretext = pretext;` });
  await page.waitForFunction("Boolean(window.__pretext)");
  await admitCompiledFunctions(page);
  const read = await readCapture(page);
  return { bundle: run.bundle, base: run.base, scopeName: run.scopeName, subject: run.subject, files: [...run.scope], capturedAt: new Date().toISOString(), ...read };
}

type PageCapture = Pick<Capture, "userAgent" | "fonts" | "constants" | "cards" | "labels" | "truth" | "warnings">;

/** Reads the capture inside the page. One evaluation, so the page is read in one state. */
function readCapture(page: Page): Promise<PageCapture> {
  return page.evaluate(({ tolerance }) => {
    type Pretext = {
      prepareWithSegments: (text: string, font: string, options?: { letterSpacing?: number }) => unknown;
      layout: (prepared: unknown, maxWidth: number, lineHeight: number) => { height: number; lineCount: number };
    };
    const pretext = (window as unknown as { __pretext: Pretext }).__pretext;
    const warnings: string[] = [];
    const viewport = document.querySelector<HTMLElement>("#map-viewport")!;
    const scale = new DOMMatrix(getComputedStyle(viewport).transform).a || 1;
    const px = (value: string): number => parseFloat(value) || 0;
    const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;

    // Fonts: one entry per distinct font string and letter spacing, with the height of one line measured on a probe.
    const fonts: Record<string, { font: string; letterSpacing: number; lineHeight: number; glyphs: Record<string, number> }> = {};
    const probe = document.createElement("div");
    Object.assign(probe.style, { position: "absolute", visibility: "hidden", whiteSpace: "nowrap", left: "0", top: "0" });
    probe.textContent = "Xg";
    root.append(probe);
    const canvas = document.createElement("canvas").getContext("2d")!;
    const GLYPHS = " +0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontOf = (element: Element): string => {
      const style = getComputedStyle(element);
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const letterSpacing = style.letterSpacing === "normal" ? 0 : px(style.letterSpacing);
      const key = `${font}|${letterSpacing}`;
      if (!fonts[key]) {
        probe.style.font = font;
        probe.style.letterSpacing = `${letterSpacing}px`;
        const lineHeight = probe.getBoundingClientRect().height / scale;
        canvas.font = font;
        const glyphs: Record<string, number> = {};
        for (const glyph of GLYPHS) glyphs[glyph] = canvas.measureText(glyph).width + letterSpacing;
        fonts[key] = { font, letterSpacing, lineHeight, glyphs };
      }
      return key;
    };
    const prepared = (element: Element, text = element.textContent ?? ""): { text: string; font: string; prepared: unknown } => {
      const font = fontOf(element);
      const value = pretext.prepareWithSegments(text, fonts[font].font, { letterSpacing: fonts[font].letterSpacing });
      // Hold Pretext to the page: its height at the element's width against the element's own, where the element is shown.
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const width = (rect.width - px(style.paddingLeft) - px(style.paddingRight)) / scale;
      const laid = pretext.layout(value, width + tolerance, fonts[font].lineHeight);
      const own = (rect.height - px(style.paddingTop) - px(style.paddingBottom)) / scale;
      if (rect.width > 0 && Math.abs(laid.height - own) > 0.5) warnings.push(`${JSON.stringify(text)} at ${width.toFixed(2)} px: Pretext ${laid.height.toFixed(2)}, page ${own.toFixed(2)} (${laid.lineCount} lines)`);
      return { text, font, prepared: JSON.parse(JSON.stringify(value)) };
    };

    const cards: Record<string, CardCapture> = {};
    const wrappers = [...root.querySelectorAll<HTMLElement>(".local-column")];
    // Natural widths: every wrapper at max-content with no cap, read together, then restored.
    const saved = wrappers.map(wrapper => [wrapper.style.width, wrapper.style.maxWidth] as const);
    for (const wrapper of wrappers) Object.assign(wrapper.style, { width: "max-content", maxWidth: "" });
    const naturals = wrappers.map(wrapper => wrapper.offsetWidth);
    wrappers.forEach((wrapper, i) => Object.assign(wrapper.style, { width: saved[i][0], maxWidth: saved[i][1] }));
    let constants: CardConstants | null = null;
    wrappers.forEach((wrapper, i) => {
      const card = wrapper.querySelector<HTMLElement>(".node-card")!;
      const id = card.dataset.id!;
      const cardStyle = getComputedStyle(card);
      const cardRect = card.getBoundingClientRect();
      const title = card.querySelector<HTMLElement>(":scope > .node-title")!;
      const pathElement = card.querySelector<HTMLElement>(":scope > .node-path")!;
      const directory = card.querySelector<HTMLElement>(":scope > .node-directory")!;
      const symbols = card.querySelector<HTMLElement>(":scope > .node-symbols")!;
      const meta = symbols.querySelector<HTMLElement>(":scope > .node-meta");
      const grid = symbols.querySelector<HTMLElement>(":scope > .symbol-grid")!;
      const tests = card.querySelector<HTMLElement>(":scope > .node-tests");
      const rows = [...grid.querySelectorAll<HTMLElement>(":scope > .symbol-row")].map(row => {
        const label = row.querySelector<HTMLElement>(".symbol-label")!;
        const badges = row.querySelector<HTMLElement>(".type-refs-indicator");
        return { symbol: row.dataset.symbol ?? "", label: prepared(label), badgesWidth: badges ? badges.getBoundingClientRect().width / scale : 0 };
      });
      if (!constants) {
        // A dot of the stylesheet's size, from a probe rather than this card's first dot, which may be collapsed to nothing.
        const dot = document.createElement("div");
        dot.className = "symbol-anchor dot inbound";
        dot.style.visibility = "hidden";
        grid.append(dot);
        const dotHeight = dot.getBoundingClientRect().height / scale;
        dot.remove();
        const gridStyle = getComputedStyle(grid);
        const titleStyle = getComputedStyle(title);
        // A probe of each class the card may lack, so the constants are the stylesheet's whether or not this card has the element.
        const probeOf = (className: string, parent: HTMLElement): CSSStyleDeclaration => {
          const element = document.createElement("div");
          element.className = className;
          element.style.visibility = "hidden";
          parent.append(element);
          const style = getComputedStyle(element);
          const copy = { ...Object.fromEntries(["marginTop", "marginBottom", "gap", "columnGap", "rowGap", "height", "paddingBottom"].map(key => [key, style[key as keyof CSSStyleDeclaration] as string])) } as unknown as CSSStyleDeclaration;
          element.remove();
          return copy;
        };
        const testsStyle = probeOf("node-tests", card);
        const badgeStyle = probeOf("type-badge", card);
        const metaStyle = probeOf("node-meta", symbols);
        const disclosureStyle = probeOf("local-disclosure", card);
        const labelStyle = probeOf("local-directory-label", root);
        const internalsDot = probeOf("symbol-anchor dot inbound internals-anchor", grid);
        const placeholder = probeOf("symbol-anchor-placeholder", grid);
        void metaStyle;
        constants = {
          internalsDotMarginTop: px(internalsDot.marginTop),
          placeholderHeight: px(placeholder.height) + px(placeholder.marginTop),
          titleMarginBottom: px(titleStyle.marginBottom),
          titlePaddingRight: px(titleStyle.paddingRight),
          symbolsMarginTop: px(getComputedStyle(symbols).marginTop),
          gridRowGap: px(gridStyle.rowGap),
          gridColumnGap: px(gridStyle.columnGap),
          gridSideColumn: px(gridStyle.gridTemplateColumns.split(" ")[0]),
          dotHeight,
          badgeHeight: px(badgeStyle.height),
          badgeGap: px(getComputedStyle(grid.querySelector(".symbol-label-wrapper")!).gap),
          testsMarginTop: px(testsStyle.marginTop),
          testsMarginBottom: px(testsStyle.marginBottom),
          testsGap: px(testsStyle.gap || testsStyle.columnGap),
          directoryMarginTop: px(getComputedStyle(directory).marginTop),
          disclosureMarginTop: px(disclosureStyle.marginTop),
          labelPaddingBottom: px(labelStyle.paddingBottom)
        };
      }
      const chip = (element: Element): ChipCapture => { const r = element.getBoundingClientRect(); return { width: r.width / scale, height: r.height / scale }; };
      const pins: Record<string, number> = {};
      const round = (value: number): number => Math.round(value + 1e-3);
      const wrapperRect = wrapper.getBoundingClientRect();
      for (const anchor of card.querySelectorAll<HTMLElement>(".symbol-anchor")) {
        const r = anchor.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        const direction = anchor.classList.contains("inbound") ? "inbound" : "outbound";
        const symbol = anchor.classList.contains("hub") ? "*" : anchor.dataset.symbol ?? "*";
        pins[`${direction}:${symbol}`] = round((r.top - wrapperRect.top + r.height / 2) / scale);
      }
      // A dot's horizontal place, from a dot the page shows; a card whose rows are all collapsed has none, and then the
      // grid's geometry says where one would be: the dot starts at its 16 px column's edge, inside the border and padding.
      const shownDot = (direction: "inbound" | "outbound"): HTMLElement | null =>
        [...grid.querySelectorAll<HTMLElement>(`.symbol-anchor.dot.${direction}`)].find(dot => dot.getBoundingClientRect().width > 0) ?? null;
      const hub = card.querySelector<HTMLElement>(".symbol-anchor.hub.outbound");
      const centreX = (element: HTMLElement | null): number | null => { if (!element) return null; const r = element.getBoundingClientRect(); return r.width > 0 ? (r.left + r.width / 2) / scale : null; };
      const cardLeft = cardRect.left / scale, cardRight = cardRect.right / scale;
      const edge = px(cardStyle.borderLeftWidth) + px(cardStyle.paddingLeft);
      const dotHalf = (constants?.dotHeight ?? 14) / 2;
      const sideColumn = constants?.gridSideColumn ?? 16;
      cards[id] = {
        id,
        naturalWidth: naturals[i],
        borderWidth: px(cardStyle.borderTopWidth),
        padding: px(cardStyle.paddingTop),
        minWidth: px(cardStyle.minWidth),
        title: prepared(title),
        path: prepared(pathElement),
        directory: prepared(directory),
        meta: meta ? prepared(meta) : null,
        rows,
        tests: tests ? { label: chip(tests.querySelector(".node-tests__label")!), chips: [...tests.querySelectorAll(".node-tests__item, .node-tests__more")].map(chip) } : null,
        notes: [...card.querySelectorAll<HTMLElement>(":scope > .local-disclosure")].map(note => prepared(note)),
        pinInboundX: (centreX(shownDot("inbound")) ?? cardLeft + edge + dotHalf) - cardLeft,
        pinOutboundX: cardRight - (centreX(shownDot("outbound")) ?? cardRight - edge - sideColumn + dotHalf),
        hubX: cardRight - (centreX(hub) ?? cardRight),
        truth: { width: wrapper.offsetWidth, height: wrapper.offsetHeight, pins }
      };
    });
    const labels: Record<string, PreparedText> = {};
    const labelHeights: Record<string, number> = {};
    for (const label of root.querySelectorAll<HTMLElement>(".local-directory-label")) {
      const directory = label.textContent ?? "";
      labels[directory] = prepared(label);
      labelHeights[directory] = label.offsetHeight;
    }
    probe.remove();
    return {
      userAgent: navigator.userAgent,
      fonts,
      constants: constants!,
      cards,
      labels,
      truth: { placementCost: Number(root.dataset.placementCost), pictureWidth: px(root.style.width), pictureHeight: px(root.style.height), labelHeights },
      warnings
    };
  }, { tolerance: TEXT_TOLERANCE });
}

/** Writes a capture as compact JSON. */
export async function writeCapture(capture: Capture, file: string): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(capture));
}

/** Reads a capture written by `writeCapture`. */
export async function readCaptureFile(file: string): Promise<Capture> {
  return JSON.parse(await fs.readFile(file, "utf8")) as Capture;
}

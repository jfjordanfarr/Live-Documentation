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
import type { PreparedTextWithSegments } from "@chenglou/pretext";
import type { PreparedRichInline, RichInlineItem } from "@chenglou/pretext/rich-inline";
import { chromium, type Page } from "@playwright/test";
import * as fs from "node:fs/promises";
import path from "node:path";


import { LAYOUT_PRESETS, type LayoutPreset } from "../../packages/explorer/src/client/layout-presets";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { ExplorerFilters, UnconnectedRows } from "../../packages/explorer/src/client/types";
import { localRetainUrl } from "../../tests/e2e/still-picture";
import { TEXT_TOLERANCE, titleHeight, type TitleRoom } from "./card-model";
import type { ReadingFlow } from "./reading-model";
import { admitCompiledFunctions, ORIGIN, serveBundle, type ScopeRun } from "./scopes";

/** A text as Pretext prepared it in the page: its segments and their measured widths, laid out again by arithmetic. */
export interface PreparedText {
  text: string;
  /** The key of the font the text is set in, in `Capture.fonts`. */
  font: string;
  /** Pretext's prepared text, serialized whole; `layoutWithLines` reads it as it is. */
  prepared: PreparedTextWithSegments;
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
  /**
   * The row's controls beside its label and badges, its Pin and More since 2026-10-20: their widths, each with the gap
   * before it, and the tallest. A row collapsed at capture takes the measure of a row the page showed. Absent in
   * older captures.
   */
  controls?: { width: number; height: number };
  /**
   * What the label's wrapper adds around its content, margins, padding and border on each axis: nothing for a public
   * row, whose padding its negative margin cancels; the Internals row's dashed border. Absent in older captures.
   */
  frame?: { width: number; height: number };
  /** Open description under this row's name and pins, measured again at the proposed text width. */
  reading?: ReadingFlow;
  /**
   * A fixed-slot row whose description is not shown, none written or folded (2026-11-13): it takes the card's short
   * allotment instead of the slot row's. Absent in older captures and for every other row.
   */
  short?: boolean;
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
  paddingInline?: number;
  paddingBottom?: number;
  minWidth: number;
  maxWidth?: number;
  readingWidth?: number;
  readingFrameHeight?: number;
  /**
   * The fixed-slot composition's allotments (2026-11-06): every public row's explicit height, and the Purpose's slot
   * height, which depend on Slot Lines alone; absent for an ordinary or a reading card, whose rows take their content.
   * Since 2026-11-13 a row whose description is not shown is short, `shortHeight` (absent in older captures).
   */
  slot?: { rowHeight: number; purposeHeight: number; shortHeight?: number };
  constants?: CardConstants;
  purpose?: ReadingFlow;
  overflow?: ReadingFlow;
  directoryHidden?: boolean;
  /** Extra zoom-independent bottom padding on `.node-directory` (`--foot-gap`) keeping held footer counts clear of Internals. */
  footGap?: number;
  /** Relationship counts; older captures place them after the rows. */
  footer?: { items: ChipCapture[]; gap: number; top: number; marginTop: number; bottom?: number; position?: "after-path" };
  hubY?: number;
  title: PreparedText;
  /** The room the title keeps after the name for the node's controls; absent in a capture of a page from before it. */
  titleRoom?: TitleRoom | null;
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
  titlePaddingTop?: number;
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
  /** What the page showed at capture: its placement measure, size and each drawn directory's label height. */
  truth: { placementCost: number; pictureWidth: number; pictureHeight: number; labelHeights: Record<string, number> };
  /** Where Pretext's layout of a text at the page's width disagreed with the page by more than half a pixel. */
  warnings: string[];
  /** The page's filters; older retained-scope captures used the compressed URL's default filters. */
  filters?: Pick<ExplorerFilters, "showTests" | "showAssets">;
  /** The page's Unconnected setting at capture; absent in older captures (when Shown was the default). */
  unconnected?: UnconnectedRows;
}

const PRETEXT_DIST = path.join(path.dirname(require.resolve("@chenglou/pretext/package.json")), "dist");
/** The lab's own module that loads Pretext into the page; no file of Pretext's has the name. */
const PRETEXT_ENTRY = "lab-entry.js";

/** Opens the scope in a browser of the lab's own over the built bundle and reads the capture. */
export async function captureScope(run: ScopeRun, preset: LayoutPreset = "relaxed"): Promise<Capture> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await serveBundle(page);
    // A capture is of the first paint: the continuing search is off, so the page keeps the picture it first drew.
    await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...LAYOUT_PRESETS[preset].localMap, searchStarts: 0 } } }) });
    await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
    return await captureFromPage(page, run);
  } finally {
    await browser.close();
  }
}

/**
 * Reads the capture from a page already showing the scope's retained Local
 * Map, under any origin: Pretext is served to the page from the lab's own
 * node_modules and loaded as a module, then the page is read in one go. The
 * module that loads it is served too, from the page's own site, because the
 * page's Content-Security-Policy runs no script written into it.
 */
export async function captureFromPage(page: Page, run: ScopeRun): Promise<Capture> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 30_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.route("**/__pretext/**", async route => {
    const name = new URL(route.request().url()).pathname.replace(/^.*\/__pretext\//u, "");
    const body = name === PRETEXT_ENTRY ? `import * as pretext from "./layout.js"; import * as rich from "./rich-inline.js"; window.__pretext = {...pretext, ...rich};` : await fs.readFile(path.join(PRETEXT_DIST, name));
    await route.fulfill({ body, contentType: "application/javascript" });
  });
  await page.addScriptTag({ type: "module", url: `/__pretext/${PRETEXT_ENTRY}` });
  await page.waitForFunction("Boolean(window.__pretext)");
  await admitCompiledFunctions(page);
  const { titleChecks, ...read } = await readCapture(page);
  // A title holds the room for the node's controls after the name, which Pretext does not lay out: its height is held
  // to the page by the card model's rule for the title, the one the model sizes cards with.
  for (const check of titleChecks) {
    const height = titleHeight(check.lineWidths, check.lineHeight, check.width + TEXT_TOLERANCE, check.room);
    if (Math.abs(height - check.own) > 0.5) read.warnings.push(`${JSON.stringify(check.text)} at ${check.width.toFixed(2)} px: Pretext ${height.toFixed(2)}, page ${check.own.toFixed(2)} (${check.lineWidths.length} lines)`);
  }
  return { bundle: run.bundle, base: run.base, scopeName: run.scopeName, subject: run.subject, files: [...run.scope], capturedAt: new Date().toISOString(), ...read };
}

type PageCapture = Pick<Capture, "userAgent" | "fonts" | "constants" | "cards" | "truth" | "warnings" | "filters" | "unconnected">;

/** A card's title as the page laid it out, for the drift check in node by the card model's own rule (`titleHeight`). */
interface TitleCheck { text: string; width: number; own: number; lineWidths: number[]; lineHeight: number; room: TitleRoom | null }

/** Reads the capture inside the page. One evaluation, so the page is read in one state. */
function readCapture(page: Page): Promise<PageCapture & { titleChecks: TitleCheck[] }> {
  return page.evaluate(({ tolerance }) => {
    type Pretext = {
      prepareWithSegments: (text: string, font: string, options?: { letterSpacing?: number; whiteSpace?: "pre-wrap" }) => PreparedTextWithSegments;
      layout: (prepared: PreparedTextWithSegments, maxWidth: number, lineHeight: number) => { height: number; lineCount: number };
      walkLineRanges: (prepared: PreparedTextWithSegments, maxWidth: number, onLine: (line: { width: number }) => void) => number;
      prepareRichInline: (items: RichInlineItem[]) => PreparedRichInline;
    };
    const pretext = (window as unknown as { __pretext: Pretext }).__pretext;
    const warnings: string[] = [];
    const viewport = document.querySelector<HTMLElement>("#map-viewport")!;
    const scale = new DOMMatrix(getComputedStyle(viewport).transform).a || 1;
    const px = (value: string): number => parseFloat(value) || 0;
    const unit = (value: number): number => Math.round(value * 64) / 64;
    const root = document.querySelector<HTMLElement>("#map-container .local-placed")!;

    // Fonts: one entry per distinct font string and letter spacing, with the height of one line measured on a probe.
    const fonts: Record<string, { font: string; letterSpacing: number; lineHeight: number; glyphs: Record<string, number> }> = {};
    const calibrated = new Set<string>();
    const canvas = document.createElement("canvas").getContext("2d")!;
    const GLYPHS = " +0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontOf = (element: Element): string => {
      const style = getComputedStyle(element);
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const letterSpacing = style.letterSpacing === "normal" ? 0 : px(style.letterSpacing);
      const label = element.matches(".symbol-label");
      const code = element.matches("pre") ? element.querySelector("code") : null;
      const key = `${font}|${letterSpacing}|${style.lineHeight}|${label ? "label" : code ? "pre-code" : "text"}`;
      if (!fonts[key]) {
        const probe = document.createElement("div");
        Object.assign(probe.style, { position: "absolute", visibility: "hidden", whiteSpace: "nowrap", left: "0", top: "0",
          padding: "0", border: "0", margin: "0", font, letterSpacing: `${letterSpacing}px`, lineHeight: style.lineHeight });
        probe.textContent = "Xg";
        root.append(probe);
        const lineHeight = Math.round(probe.getBoundingClientRect().height / scale * 64) / 64;
        probe.remove();
        canvas.font = font;
        const glyphs: Record<string, number> = {};
        for (const glyph of GLYPHS) glyphs[glyph] = canvas.measureText(glyph).width + letterSpacing;
        fonts[key] = { font, letterSpacing, lineHeight, glyphs };
      }
      if ((label || code) && !calibrated.has(key) && element.getBoundingClientRect().width > 0) {
        // Flex labels and pre/code struts round their fractional line boxes in their formatting context. Calibrate
        // one short line there, preserving the original nodes/listeners; Pretext independently reflows the real text.
        const host = code ?? element, children = [...host.childNodes];
        host.replaceChildren("Xg");
        const height = element.getBoundingClientRect().height / scale - px(style.paddingTop) - px(style.paddingBottom)
          - px(style.borderTopWidth) - px(style.borderBottomWidth);
        fonts[key].lineHeight = Math.round(height * 64) / 64;
        host.replaceChildren(...children);
        calibrated.add(key);
      }
      return key;
    };
    const titleChecks: TitleCheck[] = [];
    // The room a card's title keeps after the name for the node's controls, by what the page gives local.css's rule:
    // the controls the header holds, a control's size and their hold. None on a page from before the header round.
    // Read for every title at once, before the capture's probes change the page: a style read after them recomputes
    // the whole map's style, a tenth of a second a card on the repository's pictures.
    const rooms = new Map([...document.querySelectorAll<HTMLElement>("#map-container .node-card > .node-title")].map(title => {
      const actions = title.querySelector(":scope > .local-card-actions");
      if (!actions || !title.querySelector(".local-file-name-room")) return [title, null] as const;
      const style = getComputedStyle(title);
      return [title, { count: actions.children.length, size: px(style.getPropertyValue("--action-size")), hold: parseFloat(style.getPropertyValue("--actions-hold")) || 1 }] as const;
    }));
    const roomOf = (title: HTMLElement): TitleRoom | null => rooms.get(title) ?? null;
    const prepared = (element: Element, text = element.textContent ?? "", room?: TitleRoom | null): PreparedText => {
      const font = fontOf(element);
      // Name seams are real break opportunities, carried by <wbr> rather than textContent.
      // Keep the name itself for consumers, but give Pretext the same break opportunities as the page.
      const withBreaks = (node: Node): string => node instanceof Element && node.tagName === "WBR" ? "\u200b"
        : node.nodeType === Node.TEXT_NODE ? node.textContent ?? "" : [...node.childNodes].map(withBreaks).join("");
      const layoutText = text === element.textContent ? withBreaks(element) : text;
      const value = pretext.prepareWithSegments(layoutText, fonts[font].font, { letterSpacing: fonts[font].letterSpacing });
      // Hold Pretext to the page: its height at the element's width against the element's own, where the element is shown.
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const width = rect.width / scale - px(style.paddingLeft) - px(style.paddingRight);
      const laid = pretext.layout(value, width + tolerance, fonts[font].lineHeight);
      const own = rect.height / scale - px(style.paddingTop) - px(style.paddingBottom);
      if (room !== undefined) {
        // A card's title: checked in node by the card model's rule, which knows the room after the name.
        const lineWidths: number[] = [];
        pretext.walkLineRanges(value, width + tolerance, line => { lineWidths.push(line.width); });
        if (rect.width > 0) titleChecks.push({ text, width, own, lineWidths, lineHeight: fonts[font].lineHeight, room });
      } else if (rect.width > 0 && Math.abs(laid.height - own) > 0.5) warnings.push(`${JSON.stringify(text)} at ${width.toFixed(2)} px: Pretext ${laid.height.toFixed(2)}, page ${own.toFixed(2)} (${laid.lineCount} lines)`);
      return { text, font, prepared: JSON.parse(JSON.stringify(value)) };
    };

    const flow = (element: HTMLElement): ReadingFlow => {
      const style = getComputedStyle(element);
      const length = (value: string): number => Math.trunc(px(value) * 64) / 64;
      const more = element.classList.contains("local-reading-block") ? element.querySelector<HTMLButtonElement>(":scope > .local-reading-full") : null;
      const children = [...element.children].filter(child => child !== more && getComputedStyle(child).display !== "none");
      const blocks = children.filter(child => /^(block|flow-root|list-item)$/u.test(getComputedStyle(child).display));
      const result: ReadingFlow = {
        children: blocks.map(child => flow(child as HTMLElement)), lineHeight: fonts[fontOf(element)].lineHeight,
        inset: { horizontal: length(style.paddingLeft) + length(style.paddingRight) + length(style.borderLeftWidth) + length(style.borderRightWidth),
          vertical: length(style.paddingTop) + length(style.paddingBottom) + length(style.borderTopWidth) + length(style.borderBottomWidth) },
        margin: { top: length(style.marginTop), bottom: length(style.marginBottom) },
        maxHeight: style.maxHeight === "none" ? null : length(style.maxHeight)
      };
      if (!blocks.length) {
        const items: RichInlineItem[] = [];
        const visit = (node: Node): void => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement!, computed = getComputedStyle(parent), font = fonts[fontOf(parent)];
            let text = node.textContent ?? "";
            if (getComputedStyle(parent, "::first-letter").textTransform === "uppercase") text = text.replace(/^./u, char => char.toUpperCase());
            items.push({ text, font: font.font, letterSpacing: font.letterSpacing,
              ...(computed.display === "inline-block" ? { break: "never" as const, extraWidth: px(computed.marginRight) + px(computed.marginLeft) } : {}) });
          } else if (node instanceof HTMLElement && getComputedStyle(node).display !== "none") {
            for (const child of node.childNodes) if (child !== more) visit(child);
          }
        };
        visit(element);
        // Fenced code keeps indentation and whitespace as well as its line boundaries; rich inline is normal flow.
        if (style.whiteSpace.startsWith("pre")) {
          const font = fonts[fontOf(element.querySelector("code") ?? element)];
          result.pre = JSON.parse(JSON.stringify(pretext.prepareWithSegments(element.textContent ?? "", font.font,
            { whiteSpace: "pre-wrap", letterSpacing: font.letterSpacing })));
        } else if (items.some(item => item.text.trim())) {
          const serialized = JSON.parse(JSON.stringify(pretext.prepareRichInline(items))) as PreparedRichInline
            & { items: Array<{ prepared: PreparedTextWithSegments } | null> };
          // Normal prose lets an over-wide word overflow; names with break-word may split it.
          // Pretext supplies emergency grapheme breaks by default, so remove those where CSS does not.
          if (style.overflowWrap === "normal" && style.wordBreak === "normal") {
            for (const item of serialized.items) item?.prepared.breakableFitAdvances.fill(null);
          }
          result.inline = serialized;
        }
      }
      if (more) result.more = { flow: shownFlows.get(more)!, always: element.dataset.hasMore === "true" };
      return result;
    };
    const isVisible = (element: HTMLElement | null): element is HTMLElement => !!element && !element.hidden && getComputedStyle(element).display !== "none";
    const visibleFlow = (element: HTMLElement | null): ReadingFlow | undefined => isVisible(element) ? flow(element) : undefined;
    // A control that is read while shown: a reading block's "more" and a reading card's "read the whole file", each
    // hidden where the text fits. Until 2026-11-22 each was shown, read and hidden again where the walk met it, and
    // every such write made the next read recompute the whole map: on the repository's pictures of 114 and 132 cards
    // the capture took 15 and 20 s of a case's half minute. Now the controls the walk will meet are found first, in
    // its own order, all shown at once, each one's flow read, and all hidden again as they were, so the page pays
    // for one change and not for one a control. A control's flow is its own styles and text, which another control's
    // showing does not enter.
    const shownFlows = new Map<HTMLElement, ReadingFlow>();
    const cardsOf = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>(".local-column")].flatMap(wrapper => wrapper.querySelector<HTMLElement>(".node-card") ?? []);
    {
      const controls: HTMLButtonElement[] = [];
      const meet = (element: HTMLElement): void => {
        const more = element.classList.contains("local-reading-block") ? element.querySelector<HTMLButtonElement>(":scope > .local-reading-full") : null;
        for (const child of element.children) if (child !== more && /^(block|flow-root|list-item)$/u.test(getComputedStyle(child).display)) meet(child as HTMLElement);
        if (more) controls.push(more);
      };
      for (const card of cardsOf()) {
        for (const row of card.querySelectorAll<HTMLElement>(":scope > .node-symbols > .symbol-grid > .symbol-row")) {
          const reading = row.querySelector<HTMLElement>(".local-reading-block");
          if (isVisible(reading)) meet(reading);
        }
        const purpose = card.querySelector<HTMLElement>(":scope > .local-reading-purpose");
        if (isVisible(purpose)) meet(purpose);
        const whole = card.classList.contains("local-reading-card") ? card.querySelector<HTMLButtonElement>(":scope > .local-reading-file-full") : null;
        if (whole) controls.push(whole);
      }
      const hidden = controls.map(control => control.hidden);
      for (const control of controls) control.hidden = false;
      try {
        for (const control of controls) shownFlows.set(control, flow(control));
      } finally {
        controls.forEach((control, i) => { control.hidden = hidden[i]; });
      }
    }

    const cards: Record<string, CardCapture> = {};
    const wrappers = [...root.querySelectorAll<HTMLElement>(".local-column")];
    // Natural widths: every wrapper at max-content with no cap, read together, then restored.
    const saved = wrappers.map(wrapper => [wrapper.style.width, wrapper.style.maxWidth] as const);
    for (const wrapper of wrappers) Object.assign(wrapper.style, { width: "max-content", maxWidth: "" });
    // As the page reads them (`naturalWidthOf`, 2026-10-31): whole pixels, taken up from the browser's 1/64 px unit.
    const naturals = wrappers.map(wrapper => Math.ceil(Math.round(wrapper.getBoundingClientRect().width / scale * 64) / 64));
    wrappers.forEach((wrapper, i) => Object.assign(wrapper.style, { width: saved[i][0], maxWidth: saved[i][1] }));
    // Every card keeps its own inherited probe values. Append all probes before reading any, then remove all before
    // the ordinary card/text measurements: per-card append/read/remove cycles invalidate the whole scene's styles.
    const probeReadings = new Map<HTMLElement, {
      dotHeight: number; testsStyle: CSSStyleDeclaration; badgeStyle: CSSStyleDeclaration;
      disclosureStyle: CSSStyleDeclaration;
      internalsDot: CSSStyleDeclaration; placeholder: CSSStyleDeclaration;
    }>();
    const probes: HTMLElement[] = [];
    const probeOf = (className: string, parent: HTMLElement): HTMLElement => {
      const element = document.createElement("div");
      element.className = className;
      element.style.visibility = "hidden";
      parent.append(element);
      probes.push(element);
      return element;
    };
    const styleOf = (element: HTMLElement): CSSStyleDeclaration => {
      const style = getComputedStyle(element);
      // Copy the scalar values: the live style object would outlast the probe's measurement phase.
      return Object.fromEntries(["marginTop", "marginBottom", "gap", "columnGap", "rowGap", "height", "paddingBottom"]
        .map(key => [key, style[key as keyof CSSStyleDeclaration] as string])) as unknown as CSSStyleDeclaration;
    };
    try {
      const staged = wrappers.flatMap(wrapper => {
        const card = wrapper.querySelector<HTMLElement>(".node-card");
        if (!card) return [];
        const grid = card.querySelector<HTMLElement>(":scope > .node-symbols > .symbol-grid")!;
        return [{ card, dot: probeOf("symbol-anchor dot inbound", grid), tests: probeOf("node-tests", card),
          badge: probeOf("type-badge", card), disclosure: probeOf("local-disclosure", card),
          internals: probeOf("symbol-anchor dot inbound internals-anchor", grid),
          placeholder: probeOf("symbol-anchor-placeholder", grid) }];
      });
      for (const probe of staged) probeReadings.set(probe.card, {
        dotHeight: unit(probe.dot.getBoundingClientRect().height / scale), testsStyle: styleOf(probe.tests),
        badgeStyle: styleOf(probe.badge), disclosureStyle: styleOf(probe.disclosure),
        internalsDot: styleOf(probe.internals), placeholder: styleOf(probe.placeholder)
      });
    } finally {
      for (const probe of probes) probe.remove();
    }
    let constants: CardConstants | null = null;
    // Every row's label stands in a wrapper with its badges and its controls; the controls are the wrapper's other children.
    let shownControls: { width: number; height: number } | null = null;
    const unmeasuredControls: Array<{ controls?: { width: number; height: number } }> = [];
    const controlsOf = (label: HTMLElement, badges: HTMLElement | null): { width: number; height: number } | null => {
      const wrapper = label.parentElement!;
      const others = [...wrapper.children].filter(child => child !== label && child !== badges);
      const rects = others.map(child => child.getBoundingClientRect());
      if (label.getBoundingClientRect().width === 0 || rects.some(rect => rect.width === 0)) return null;
      const gap = px(getComputedStyle(wrapper).columnGap);
      return {
        width: rects.reduce((sum, rect) => sum + unit(rect.width / scale) + gap, 0),
        height: Math.max(0, ...rects.map(rect => unit(rect.height / scale)))
      };
    };
    // A chip's own box: a flex line stretches its shorter items, and at another width the TESTS label may stand on a
    // line of its own rather than beside a taller test chip, so each is read aligned to its line's start. All of the
    // picture's chips are aligned so at once, read, and given their alignment back (2026-11-22; until then one at a
    // time, the page laid out again for each): a chip's own box does not depend on how its neighbours are aligned.
    const chipBoxes = new Map<Element, ChipCapture>();
    {
      const chips = cardsOf().flatMap(card => {
        const footer = card.querySelector<HTMLElement>(".local-reading-counts");
        const tests = card.querySelector<HTMLElement>(":scope > .node-tests");
        return [
          ...(footer && getComputedStyle(footer).display !== "none" ? [...footer.children] : []),
          ...(tests ? [tests.querySelector(".node-tests__label")!, ...tests.querySelectorAll(".node-tests__item, .node-tests__more")] : [])
        ] as HTMLElement[];
      });
      const aligned = chips.map(item => item.style.alignSelf);
      for (const item of chips) item.style.alignSelf = "flex-start";
      for (const item of chips) {
        const r = item.getBoundingClientRect();
        chipBoxes.set(item, { width: unit(r.width / scale), height: unit(r.height / scale) });
      }
      chips.forEach((item, i) => { item.style.alignSelf = aligned[i]; });
    }
    wrappers.forEach((wrapper, i) => {
      // A closed directory's box has a wrapper and no card; the scopes open no directory, and the model does not hold one.
      const card = wrapper.querySelector<HTMLElement>(".node-card");
      if (!card) return;
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
        const controls = controlsOf(label, badges);
        if (controls) shownControls ??= controls;
        // From the computed style, which a collapsed row has as well as a shown one.
        const wrapperStyle = getComputedStyle(label.parentElement!);
        const sides = (...keys: Array<"marginLeft" | "marginRight" | "marginTop" | "marginBottom" | "paddingLeft" | "paddingRight" | "paddingTop" | "paddingBottom" | "borderLeftWidth" | "borderRightWidth" | "borderTopWidth" | "borderBottomWidth">): number =>
          keys.reduce<number>((sum, key) => sum + px(wrapperStyle[key]), 0);
        const frame = {
          width: sides("marginLeft", "marginRight", "paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"),
          height: sides("marginTop", "marginBottom", "paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth")
        };
        const captured: RowCapture = { symbol: row.dataset.symbol ?? "", label: prepared(label), badgesWidth: badges ? badges.getBoundingClientRect().width / scale : 0, frame };
        captured.reading = visibleFlow(row.querySelector<HTMLElement>(".local-reading-block"));
        if (row.classList.contains("local-row-short")) captured.short = true;
        if (controls) captured.controls = controls;
        else if (label.parentElement!.children.length > (badges ? 2 : 1)) unmeasuredControls.push(captured);
        return captured;
      });
      {
        // A dot of the stylesheet's size, from a probe rather than this card's first dot, which may be collapsed to nothing.
        const { dotHeight, testsStyle, badgeStyle, disclosureStyle, internalsDot, placeholder } = probeReadings.get(card)!;
        const gridStyle = getComputedStyle(grid);
        const titleStyle = getComputedStyle(title);
        constants = {
          internalsDotMarginTop: px(internalsDot.marginTop),
          placeholderHeight: px(placeholder.height) + px(placeholder.marginTop),
          titleMarginBottom: px(titleStyle.marginBottom),
          titlePaddingRight: px(titleStyle.paddingRight),
          titlePaddingTop: px(titleStyle.paddingTop),
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
          disclosureMarginTop: px(disclosureStyle.marginTop)
        };
      }
      const chip = (element: Element): ChipCapture => chipBoxes.get(element)!;
      const pins: Record<string, number> = {};
      const round = (value: number): number => Math.round(value + 1e-3);
      const wrapperRect = wrapper.getBoundingClientRect();
      for (const anchor of card.querySelectorAll<HTMLElement>(".symbol-anchor")) {
        // The overview band's own hub, where its gathered wires arrive (2026-11-06), is no pin of the placement: the
        // page registers it under a key of its own, never as the card's `inbound:*`, which stays Internals' dot.
        if (anchor.classList.contains("overview-hub")) continue;
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
        paddingInline: px(cardStyle.paddingLeft),
        paddingBottom: px(cardStyle.paddingBottom),
        minWidth: px(cardStyle.minWidth),
        maxWidth: cardStyle.maxWidth === "none" ? undefined : px(cardStyle.maxWidth),
        readingWidth: card.classList.contains("local-reading-card") ? px(cardStyle.getPropertyValue("--reading-available-width")) : undefined,
        readingFrameHeight: card.classList.contains("local-reading-card") ? px(cardStyle.getPropertyValue("--reading-frame-height")) : undefined,
        constants: constants!,
        slot: card.classList.contains("local-slot-card") ? (() => {
          const row = grid.querySelector<HTMLElement>(":scope > .symbol-row:not(.internals-row):not(.local-row-short)");
          const short = grid.querySelector<HTMLElement>(":scope > .symbol-row.local-row-short:not(.internals-row)");
          const lines = Math.max(1, Math.round(parseFloat(getComputedStyle(root).getPropertyValue("--slot-lines")) || 2));
          const purposeElement = card.querySelector<HTMLElement>(":scope > .local-reading-purpose");
          return { rowHeight: row ? unit(row.getBoundingClientRect().height / scale) : 32 + 17 * lines,
            ...(short ? { shortHeight: unit(short.getBoundingClientRect().height / scale) } : null),
            purposeHeight: purposeElement && getComputedStyle(purposeElement).display !== "none" ? unit(purposeElement.getBoundingClientRect().height / scale) : 0 };
        })() : undefined,
        purpose: visibleFlow(card.querySelector<HTMLElement>(":scope > .local-reading-purpose")),
        overflow: (() => {
          const button = card.querySelector<HTMLButtonElement>(":scope > .local-reading-file-full");
          if (!button || !card.classList.contains("local-reading-card")) return undefined;
          return shownFlows.get(button)!;
        })(),
        directoryHidden: getComputedStyle(directory).display === "none",
        footGap: px(getComputedStyle(directory).paddingBottom) || undefined,
        // The hub's centre as laid out, at the name's first line since 2026-11-19 (half way down a slot card before).
        hubY: px(getComputedStyle(hub!).top) + px(cardStyle.borderTopWidth) + hub!.offsetHeight / 2,
        footer: (() => {
          const footer = card.querySelector<HTMLElement>(".local-reading-counts");
          if (!footer || getComputedStyle(footer).display === "none") return undefined;
          const style = getComputedStyle(footer);
          return {
            items: [...footer.children].map(chip), gap: px(style.gap), marginTop: px(style.marginTop),
            top: px(style.marginTop) + px(style.paddingTop) + px(style.borderTopWidth),
            bottom: px(style.marginBottom) + px(style.paddingBottom) + px(style.borderBottomWidth),
            position: pathElement.nextElementSibling === footer ? "after-path" : undefined
          };
        })(),
        title: prepared(title, undefined, roomOf(title)),
        titleRoom: roomOf(title),
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
    for (const row of unmeasuredControls) if (shownControls) row.controls = shownControls;
    // A drawn directory's label is a strip of constant height (2026-11-15): the page's height is read for the drift
    // check, and nothing of its text enters the model.
    const labelHeights: Record<string, number> = {};
    for (const label of root.querySelectorAll<HTMLElement>(".local-directory-label")) {
      const directory = label.dataset.directory ?? label.textContent ?? "";
      labelHeights[directory] = label.offsetHeight;
    }
    return {
      userAgent: navigator.userAgent,
      fonts,
      constants: constants!,
      cards,
      truth: { placementCost: Number(root.dataset.placementCost), pictureWidth: px(root.style.width), pictureHeight: px(root.style.height), labelHeights },
      warnings,
      titleChecks,
      filters: {
        showTests: document.querySelector<HTMLInputElement>("#filter-toggle-tests")!.checked,
        showAssets: document.querySelector<HTMLInputElement>("#filter-toggle-assets")!.checked
      },
      unconnected: (document.querySelector<HTMLSelectElement>("#tuning-unconnected")?.value as UnconnectedRows | undefined) ?? "folded"
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

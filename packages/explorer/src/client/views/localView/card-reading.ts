import type { TypeRef } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";
import { pathTo, walk } from "@live-documentation/engine/live-docs/pathfind";

import { chooseHeldHeader, HELD_BANDS, heldSegments, heldTitle, type HeldBand, type TitleRooms } from "./held-lines";
import { dotRoom, layoutTopOf, nameFill, nameWraps, rowsBeforeFirstPin } from "./ladder-rooms";
import { FIRST_STEP, LAST_STEP, ladderScales, type LadderResistances } from "./ladder-steps";
import type { LocalEdge, ReadingControl } from "./types";
import type { ExplorerNodePayload } from "../../../shared/types";
import { escapeHtml } from "../../graph-helpers";
import { renderMarkdown } from "../../markdown";
import { createItemMenu } from "../../panels/item-menu";
import { createReaderLinkHandler, type ReaderLinkContext } from "../../reader-links";
import { authoredSections } from "../../reader-sections";
import { descriptionIsOpen, type ReadingChoice } from "../../reading-state";
import type { InspectionTarget } from "../../types";

/**
 * What the card ladder's stylesheet reads, measured for one element and written after every reading: a custom property
 * (an empty value removes it), a `data-` attribute, or a class switched on or off.
 */
type RoomWrite = readonly [element: HTMLElement, name: string, value: string | boolean];

/** A file's Purpose or one exact symbol's description, named by the card it is read on. */
export interface ReadingTarget { nodeId: string; symbol?: string; }

/** Canonical text, application-owned choices and the actions a card's text can lead to. */
export interface CardReadingOptions {
  links: ReaderLinkContext;
  choices(): readonly ReadingChoice[];
  defaultOpen(nodeId: string, symbol?: string): boolean;
  /** The card composition the person chose in Tuning: descriptions that open and grow, or fixed slots. */
  mode(): "grow" | "slot";
  /** Tuning's resistances, which set each step's held scales: the held name's lines are chosen for them at render. */
  resistances(): LadderResistances;
  change(nodeId: string, symbol: string | undefined, open: boolean, control: ReadingControl): void;
  inspect(target: InspectionTarget, fragment?: string): void;
  navigate(node: ExplorerNodePayload): void;
}

interface ReadingBlock {
  element: HTMLElement;
  prose: HTMLElement;
  more: HTMLButtonElement;
  hasMore: boolean;
}

interface ReadingCard {
  card: HTMLElement;
  node: ExplorerNodePayload;
  purpose: ReadingBlock | null;
  overflow: HTMLButtonElement | null;
  symbols: Map<string, ReadingBlock>;
  /** The book beside the file's name and beside each described symbol. */
  controls: Map<string | undefined, HTMLButtonElement>;
  /** The file's name and each described symbol's name: the other way to open what they name. */
  names: Map<string | undefined, HTMLElement>;
}

const BOOK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1Zm0 0v15"/></svg>';

/**
 * Builds on-card explanations from the same bundled docs as the full reader. A description opens and folds only
 * by a deliberate action, a tap on the name it belongs to or on the book beside it; hover draws no text and moves
 * nothing (the owner's verdict of 2026-11-05: expansion on hover was "too difficult and finicky to actually work
 * as a human end user with a computer mouse"). The application saves every choice, so what a person opened is
 * what a shared link shows. Geometry changes belong to the controller and the renderer, which hold the acted-on
 * name still while the card grows or shrinks around it. Zoom never changes a card's box: below reading scale the
 * prose fades (the owner, 2026-11-05: "I really would prefer that the cards don't themselves resize when we zoom
 * out"). With fixed slots, the comparison composition, every symbol has the same allotment of text lines.
 */
export class CardReading {
  private readonly cards = new Map<string, ReadingCard>();
  private readonly connectionsMenu = createItemMenu();
  private readonly backReferences = new Map<string, readonly LocalEdge[]>();
  private visible = true;

  constructor(private readonly container: HTMLElement, private readonly options: CardReadingOptions) {}

  /** Release the transient menu with the Local Map. */
  dispose(): void {
    this.reset();
    this.connectionsMenu.dispose();
  }

  /** A structural render replaces cards; nothing of the old cards may act on their successors. */
  reset(): void {
    this.connectionsMenu.close();
    this.backReferences.clear();
    this.cards.clear();
  }

  /**
   * Open the description a name or book names, or fold it when it is being kept visible: a file's name opens its
   * Purpose and every described symbol, a symbol's name its own. The application saves the choice. False when
   * the card has nothing to open, so that the caller can offer what it does have.
   */
  toggle(nodeId: string, symbol: string | undefined, control: ReadingControl): boolean {
    const model = this.cards.get(nodeId);
    if (!model) return false;
    if (symbol === undefined ? !model.purpose && !model.symbols.size : !model.symbols.has(symbol)) return false;
    if (this.slots) {
      // A fixed slot never opens in the layout: the name opens the full text in the reader (the 2026-11-05 comparison).
      this.options.inspect({ kind: "file", nodeId, ...(symbol ? { symbol } : {}), presentation: "reading" });
      return true;
    }
    const folds = this.controlKeepsVisible(model, symbol);
    this.options.change(nodeId, symbol, !folds, control);
    return true;
  }

  private get slots(): boolean {
    return this.options.mode() === "slot";
  }

  /** Add canonical Purpose, symbol summaries and recorded signature facts to a newly constructed native card. */
  attach(card: HTMLElement, node: ExplorerNodePayload): void {
    const file = this.options.links.files[node.id];
    if (!file) return;
    const summary = purposeOf(file);
    // With fixed slots every card has its Purpose slot and every symbol its slot, filled or not: the same allotment.
    const purpose = summary || this.slots ? this.block(node, undefined, summary, false) : null;
    purpose?.element.classList.add("local-reading-purpose");
    if (purpose) card.querySelector(".node-path")?.after(purpose.element);
    const symbols = new Map<string, ReadingBlock>();
    const controls = new Map<string | undefined, HTMLButtonElement>();
    const names = new Map<string | undefined, HTMLElement>();
    const overflow = this.block(node, undefined, "", false).more;
    if (overflow) {
      overflow.classList.add("local-reading-file-full");
      card.querySelector(".node-path")?.after(overflow);
    }
    const model = { card, node, purpose, overflow, symbols, controls, names };
    this.cards.set(node.id, model);

    if (!this.slots) {
      const book = this.readingButton(node);
      card.querySelector(".local-card-actions")?.prepend(book);
      controls.set(undefined, book);
    }
    const title = card.querySelector<HTMLElement>(".local-file-name");
    if (title) names.set(undefined, title);
    for (const row of card.querySelectorAll<HTMLElement>(".symbol-row:not(.internals-row)")) {
      const name = row.dataset.symbol!;
      const symbol = file.symbols.find(entry => entry.name === name);
      if (!symbol) continue;
      const text = symbol.sections.find(section => section.title === "Summary")?.body.join("\n").trim() ?? "";
      const link = createReaderLinkHandler(node.docPath, this.options.links);
      const types = (values: TypeRef[]): string => values.map(type => {
        const name = (type.link ? link(type.link, escapeHtml(type.name)) : escapeHtml(type.name)) + (type.array ? "[]" : "");
        return type.promise ? `Promise&lt;${name}&gt;` : name;
      }).join(", ");
      const references = symbol.references.map(reference => {
        const values = "parameters" in reference
          ? reference.parameters.map(parameter => `${escapeHtml(parameter.name)}: ${types(parameter.types)}`)
          : [types(reference.types)];
        return { role: reference.role, html: values.join(" · ") };
      }).filter(reference => reference.html);
      const hasMore = symbol.sections.some(section => section.title !== "Summary" && section.body.some(line => line.trim()));
      if (!this.slots && !text && !references.length && !hasMore) continue;
      const block = this.block(node, name, text, hasMore);
      if (references.length) {
        const facts = document.createElement("div");
        facts.className = "local-reading-types";
        for (const reference of references) {
          const line = document.createElement("div"), label = document.createElement("span");
          label.className = "local-reading-role";
          label.textContent = reference.role;
          const values = document.createElement("span");
          values.innerHTML = reference.html;
          line.append(label, values);
          facts.append(line);
        }
        block.element.prepend(facts);
      }
      block.element.dataset.symbol = name;
      row.append(block.element);
      row.classList.add("local-row-readable");
      symbols.set(name, block);
      if (!this.slots) {
        const action = this.readingButton(node, name);
        row.querySelector(".local-symbol-pin")?.before(action);
        controls.set(name, action);
      }
      const label = row.querySelector<HTMLElement>(".symbol-label");
      if (label) names.set(name, label);
    }

    const counts = document.createElement("div");
    counts.className = "local-reading-counts";
    for (const [count, label, direction] of [[file.outbound.length, "Uses", "uses"], [file.inbound.length, "Used by", "used-by"]] as const) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `local-connections-${direction}`;
      item.disabled = count === 0;
      item.setAttribute("aria-haspopup", "menu");
      item.textContent = `${label} ${count} ${count === 1 ? "file" : "files"}`;
      item.title = `${label} ${count} ${count === 1 ? "file" : "files"}; choose one to explore`;
      item.addEventListener("click", event => {
        event.stopPropagation();
        const ids = direction === "uses" ? file.outbound : file.inbound;
        const commands = ids.flatMap(id => {
          const target = this.options.links.nodesById.get(id);
          if (!target) return [];
          const returns = this.backReferences.get(node.id)?.find(edge => direction === "uses"
            ? edge.sourceId === node.id && edge.targetId === id : edge.sourceId === id && edge.targetId === node.id);
          return [{ label: target.name, detail: `${returns ? `${this.cycleSummary(returns)}\n` : ""}${target.codeRelativePath}`,
            run: () => this.options.navigate(target) }];
        });
        const rect = item.getBoundingClientRect();
        this.connectionsMenu.show({ x: rect.left, y: rect.bottom + 4 }, commands, undefined, `${node.name} · ${label.toLowerCase()} ${count} files`);
      });
      counts.append(item);
    }
    card.querySelector(".node-path")?.after(counts);
    this.updateCard(model);
  }

  /** Return references come from the actual displayed ranking, while file counts remain canonical. */
  setBackReferences(nodeId: string, edges: readonly LocalEdge[]): void {
    this.backReferences.set(nodeId, edges);
  }

  /** Name both ends of each return connection and offer ordinary navigation to its other file. */
  showBackReferences(nodeId: string, anchor: { x: number; y: number }): void {
    const commands = (this.backReferences.get(nodeId) ?? []).flatMap(edge => {
      const consumer = this.options.links.nodesById.get(edge.sourceId), provider = this.options.links.nodesById.get(edge.targetId);
      if (!consumer || !provider) return [];
      const other = nodeId === consumer.id ? provider : consumer;
      return [{ label: `${consumer.name} uses ${edge.targetSymbol ?? provider.name}`,
        detail: `${this.cycleSummary(edge)}\nExplore ${other.codeRelativePath}`, run: () => this.options.navigate(other) }];
    });
    this.connectionsMenu.show(anchor, commands, undefined, "Connections returning in a cycle");
  }

  /** Explain the closing reference with a dependency path from the same canonical graph the CLI walks. */
  private cycleSummary(edge: LocalEdge): string {
    const found = walk([edge.targetId], id => this.options.links.files[id]?.outbound ?? [], Infinity, new Set([edge.sourceId]));
    if (!found.reached) return "Returns in a cycle";
    const ids = [...pathTo(found, edge.sourceId), edge.targetId];
    const identities = new Map<string, Set<string>>();
    for (const id of ids) {
      const name = this.options.links.nodesById.get(id)?.name ?? id;
      if (!identities.has(name)) identities.set(name, new Set());
      identities.get(name)!.add(id);
    }
    const names = ids.map(id => {
      const node = this.options.links.nodesById.get(id), name = node?.name ?? id;
      return identities.get(name)!.size > 1 ? node?.codeRelativePath ?? id : name;
    });
    return `File dependency cycle: ${names.join(" → ")}`;
  }

  /** Below reading scale the prose fades; no box changes, so DOM identities, row order and the layout stand. */
  updatePresentation(visible = this.visible): void {
    this.visible = visible;
    for (const card of this.cards.values()) this.updateCard(card);
  }

  /** Explicit whole-card reading also discloses its symbol rows, without claiming additional connections. */
  showsAllRows(nodeId: string): boolean {
    return descriptionIsOpen(this.options.choices(), nodeId, undefined, false);
  }

  /** An explicitly opened symbol stays available even when no pin otherwise needs its row. */
  showsRow(nodeId: string, symbol: string): boolean {
    return descriptionIsOpen(this.options.choices(), nodeId, symbol, false);
  }

  /** Measure overflow after the native layout assigns final widths and before it reads card heights. */
  measure(): void {
    const available = parseFloat(this.container.style.getPropertyValue("--reading-frame-height")) || Infinity;
    for (const { card, purpose, overflow, symbols } of this.cards.values()) {
      if (overflow) overflow.hidden = true;
      for (const block of [...(purpose ? [purpose] : []), ...symbols.values()]) {
        // A slot's ellipsis says there is more; the name opens it. The link would add a line to every card.
        block.more.hidden = this.slots || block.element.hidden || !(block.hasMore || block.prose.scrollHeight > block.prose.clientHeight + 1);
      }
      if (this.slots) continue;
      // A file with many individually short descriptions can still exceed a phone's reading frame. Keep its plain
      // full reader reachable near the top, without shrinking text or installing a scrollbar inside the card.
      if (purpose && !purpose.element.hidden && card.scrollHeight > available) purpose.more.hidden = false;
      if (overflow && (!purpose || purpose.element.hidden) && card.classList.contains("local-reading-card") && card.scrollHeight > available) overflow.hidden = false;
    }
    if (!this.slots) return;
    // The rooms of every slot card are read before any is written, so that the page lays out once for them all rather
    // than once a row (direction.md's November 6 cost finding).
    const resistances = this.options.resistances();
    const rooms = [...this.cards.values()].flatMap(({ card }) => measureRooms(card, resistances));
    for (const write of rooms) applyRoomWrite(write);
  }

  /** Every kept-visible description shows; the books and the names say what each one would do next. */
  private updateCard(model: ReadingCard): void {
    const slots = this.slots;
    const open = (symbol?: string): boolean => slots || this.held(model.node.id, symbol);
    if (model.purpose) model.purpose.element.hidden = !open();
    for (const [name, block] of model.symbols) block.element.hidden = !open(name);
    // Below reading scale the prose fades in either composition; a card's box never depends on zoom.
    model.card.classList.toggle("local-slot-card", slots);
    model.card.classList.toggle("local-reading-faded", !this.visible);
    const reading = !slots && (!!model.purpose && !model.purpose.element.hidden
      || [...model.symbols.values()].some(block => !block.element.hidden));
    model.card.classList.toggle("local-reading-card", reading);
    const expandedOf = (symbol?: string): boolean => symbol === undefined ? reading : !model.symbols.get(symbol)?.element.hidden;
    for (const [symbol, button] of model.controls) {
      const held = symbol === undefined
        ? this.held(model.node.id) && [...model.symbols.keys()].every(name => this.held(model.node.id, name))
        : this.held(model.node.id, symbol);
      button.setAttribute("aria-pressed", String(held));
      button.setAttribute("aria-expanded", String(expandedOf(symbol)));
      const folds = this.controlKeepsVisible(model, symbol);
      button.setAttribute("aria-label", `${folds ? "Fold" : "Read"} ${symbol ?? model.node.name}${symbol ? ` in ${model.node.name}` : ""}`);
      button.title = symbol ? `${folds ? "Fold" : "Keep open"} this explanation; connections stay pinned independently`
        : `${folds ? "Fold" : "Read"} all descriptions in this card; connections stay pinned independently`;
    }
    for (const [symbol, name] of model.names) {
      if (slots) name.removeAttribute("aria-expanded");
      else name.setAttribute("aria-expanded", String(expandedOf(symbol)));
    }
  }

  private controlKeepsVisible(model: ReadingCard, symbol?: string): boolean {
    return symbol === undefined
      ? this.held(model.node.id) && [...model.symbols.keys()].every(name => this.held(model.node.id, name))
      : this.held(model.node.id, symbol);
  }

  private held(nodeId: string, symbol?: string): boolean {
    return descriptionIsOpen(this.options.choices(), nodeId, symbol, this.options.defaultOpen(nodeId, symbol));
  }

  private readingButton(node: ExplorerNodePayload, symbol?: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = symbol === undefined ? "local-file-read" : "local-symbol-read";
    button.innerHTML = BOOK;
    button.addEventListener("click", event => {
      event.stopPropagation();
      this.toggle(node.id, symbol, "book");
    });
    return button;
  }

  private block(node: ExplorerNodePayload, symbol: string | undefined, text: string, hasMore: boolean): ReadingBlock {
    const element = document.createElement("div"), prose = document.createElement("div"), more = document.createElement("button");
    element.className = "local-reading-block";
    if (this.slots) element.classList.add("local-reading-slot");
    element.dataset.hasMore = String(hasMore);
    element.hidden = true;
    prose.className = "local-reading-prose";
    prose.innerHTML = renderMarkdown(text, { linkHandler: createReaderLinkHandler(node.docPath, this.options.links) });
    more.type = "button";
    more.className = "local-reading-full";
    more.textContent = "Read full description";
    more.hidden = true;
    more.addEventListener("click", event => {
      event.stopPropagation();
      this.options.inspect({ kind: "file", nodeId: node.id, ...(symbol ? { symbol } : {}), presentation: "reading" });
    });
    element.append(prose, more);
    element.addEventListener("click", event => {
      event.stopPropagation();
      const link = (event.target as Element).closest<HTMLAnchorElement>("a");
      if (!link) return;
      let target: InspectionTarget | null = null;
      if (link.dataset.nodeId) target = { kind: "file", nodeId: link.dataset.nodeId, ...(link.dataset.symbol ? { symbol: link.dataset.symbol } : {}) };
      else if (link.dataset.docPath) target = { kind: "bundled-doc", path: link.dataset.docPath, ...(link.dataset.fragment ? { fragment: link.dataset.fragment } : {}) };
      else if (link.dataset.directory !== undefined) target = { kind: "directory", directory: link.dataset.directory };
      else if (link.classList.contains("reader-anchor")) target = { kind: "file", nodeId: node.id };
      if (target) {
        event.preventDefault();
        this.options.inspect(target, link.classList.contains("reader-anchor") ? link.dataset.fragment : undefined);
      }
    });
    return { element, prose, more, hasMore };
  }
}

/**
 * What the card ladder's stylesheet needs to know of a slot card's rooms (2026-11-05, Turn 11: "the symbols didn't expand
 * to fill the spaces left by the disappearance of the text"; 2026-11-06, Turns 17 to 19: clamps, and a More held on every
 * row; the far-zoom review of the same day: a held thing is bounded by the room of the box it belongs to), measured once
 * a render in the map's own units so that zoom changes nothing here; read only, the writes returned. Every box read here
 * stands where the layout put it whatever the step draws, so the readings are the same in every band: a name's button,
 * a wrapper and a row are never transformed, and a dot or a button that is is read at its fixed edge or undone.
 *
 * Each symbol row gets its height and the depth of its name below the row's top, from which the stylesheet scales the
 * row's head (the name, the dots' centre line and the buttons) about the row's top edge so that it keeps its reading
 * alignment and stays inside the row; the room across its name's box, the name's text width and whether it wraps at the
 * reading width; the widths of its badges and of its controls with the gaps before them, Pin and More through the middle
 * band and More alone beyond it; More's place and height, which bound the controls' held size by the row; and its dots'
 * centre, height and room to the card's edges, which bound theirs. The file's name gets the room from its top to the
 * header's right edge and down to the first row, to the card's bottom and the row pitch for the overview band, and the
 * card's buttons' widths and overhang, which intrude on its first lines at their held size.
 */
function measureRooms(card: HTMLElement, resistances: LadderResistances): RoomWrite[] {
  const writes: RoomWrite[] = [];
  const k = card.offsetHeight ? card.getBoundingClientRect().height / card.offsetHeight : 0;
  if (!(k > 0)) return writes;
  // Across the card, from its border box's left edge: the inner edges of its border, which no dot may cross.
  const cardRect = card.getBoundingClientRect();
  const innerLeft = card.clientLeft, innerRight = card.clientLeft + card.clientWidth;
  // A name's text is narrower than its stretched box, and the name may already be drawn scaled: the text's own width
  // in layout pixels is its range's width, less the map's scale and its own transform.
  const textOf = (element: HTMLElement): { width: number; lines: number } => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const inner = element.querySelector<HTMLElement>(".symbol-label-text") ?? element;
    const own = new DOMMatrix(getComputedStyle(inner).transform).a || 1;
    const lines = new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
    return { width: range.getBoundingClientRect().width / (k * own), lines };
  };
  // The first symbol row gives the rows' pitch.
  let firstRow: { height: number } | null = null;
  for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
    const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper"), label = row.querySelector<HTMLElement>(".symbol-label");
    if (!wrapper || !label || !label.offsetHeight) continue;
    const text = textOf(label);
    if (!(text.width > 0)) continue;
    const wrapperStyle = getComputedStyle(wrapper);
    const roomWidth = wrapper.clientWidth - parseFloat(wrapperStyle.paddingLeft) - parseFloat(wrapperStyle.paddingRight);
    const rowRect = row.getBoundingClientRect(), wrapperRect = wrapper.getBoundingClientRect(), labelRect = label.getBoundingClientRect();
    const rowHeight = row.clientHeight, nameTop = (labelRect.top - rowRect.top) / k, nameHeight = label.offsetHeight;
    if (!firstRow && !row.classList.contains("internals-row")) firstRow = { height: rowHeight };
    const gap = parseFloat(wrapperStyle.columnGap) || 0;
    const pin = row.querySelector<HTMLElement>(".local-symbol-pin")?.offsetWidth ?? 0;
    const moreButton = row.querySelector<HTMLElement>(".local-symbol-more");
    const more = moreButton?.offsetWidth ?? 0;
    const badges = row.querySelector<HTMLElement>(".type-refs-indicator")?.offsetWidth ?? 0;
    // A held button grows from its own top, so its drawn top is its layout top.
    const moreTop = moreButton ? (moreButton.getBoundingClientRect().top - rowRect.top) / k : 0;
    // A dot is drawn shifted and scaled about its centre, and about its edge beside the name across: its layout box is
    // that edge, its width, and its drawn top with the shift and scale undone.
    let dotMiddle = nameTop + nameHeight / 2, dotHeight = 14, dotScale = Infinity;
    for (const dot of row.querySelectorAll<HTMLElement>(".symbol-anchor.dot")) {
      const rect = dot.getBoundingClientRect(), drawn = new DOMMatrix(getComputedStyle(dot).transform);
      const direction = dot.classList.contains("inbound") ? "inbound" : "outbound";
      const left = direction === "inbound" ? (rect.right - cardRect.left) / k - dot.offsetWidth : (rect.left - cardRect.left) / k;
      dotScale = Math.min(dotScale, dotRoom({ left, right: left + dot.offsetWidth, direction }, innerLeft, innerRight));
      dotHeight = dot.offsetHeight;
      dotMiddle = layoutTopOf((rect.top - rowRect.top) / k, dotHeight, drawn.f, drawn.d || 1) + dotHeight / 2;
    }
    writes.push(
      [row, "--row-h", String(rowHeight)],
      [row, "--row-room-w", roomWidth.toFixed(1)],
      [row, "--row-name-w", text.width.toFixed(1)],
      [row, "--row-name-h", String(nameHeight)],
      [row, "--row-name-y", nameTop.toFixed(2)],
      [row, "--row-wrapper-y", ((wrapperRect.top - rowRect.top) / k).toFixed(2)],
      [row, "--row-fill-h", nameFill(rowHeight, nameTop, nameHeight).toFixed(3)],
      [row, "--row-badges-w", String(badges ? gap + badges : 0)],
      [row, "--row-controls-w", String(pin || more ? gap + pin + (pin && more ? gap : 0) + more : 0)],
      [row, "--row-more-w", String(more ? gap + more : 0)],
      [row, "--row-more-y", moreTop.toFixed(2)],
      [row, "--row-more-h", String(moreButton?.offsetHeight || 17)],
      [row, "--row-dot-mid", dotMiddle.toFixed(2)],
      [row, "--row-dot-h", String(dotHeight)],
      [row, "--row-dot-room", (Number.isFinite(dotScale) ? dotScale : 1).toFixed(3)],
      [row, "local-name-wraps", nameWraps(text.lines, text.width, label.clientWidth)]
    );
  }
  writes.push([card, "--rows-before-pin", firstPinWrite(card)]);
  const title = card.querySelector<HTMLElement>(".local-file-name"), header = card.querySelector<HTMLElement>(".node-title");
  const grid = card.querySelector<HTMLElement>(".symbol-grid"), actions = card.querySelector<HTMLElement>(".local-card-actions");
  if (!title || !header || !grid || !actions || !title.offsetHeight) return writes;
  const cardStyle = getComputedStyle(card), headerRect = header.getBoundingClientRect(), titleRect = title.getBoundingClientRect();
  const contentBottom = cardRect.bottom - (parseFloat(cardStyle.borderBottomWidth) + parseFloat(cardStyle.paddingBottom)) * k;
  const rowGap = parseFloat(getComputedStyle(grid).rowGap) || 0;
  const more = card.querySelector<HTMLElement>(".local-file-more");
  // Each room as the stylesheet reads it, rounded as written, so that the lines chosen below are the lines it draws.
  const fixed = (value: number): number => Number(value.toFixed(1));
  const rooms: TitleRooms = {
    roomW: fixed((headerRect.right - titleRect.left) / k),
    headH: fixed((grid.getBoundingClientRect().top - titleRect.top) / k),
    cardH: fixed((contentBottom - titleRect.top) / k),
    pitch: Math.max(1, (firstRow?.height ?? 0) + rowGap),
    rowGap,
    // The controls that stay at each band follow the name at the header's right edge: all of them at the middle band,
    // More alone further out. Their width is counted from their number, since the farther bands hide all but More.
    actionsW: actions.children.length * (more?.offsetWidth ?? 0) + Math.max(0, actions.children.length - 1) * (parseFloat(getComputedStyle(actions).columnGap) || 0),
    moreW: more?.offsetWidth ?? 0,
    moreH: more?.offsetHeight ?? 0,
    controlCeiling: (32 + (parseFloat(cardStyle.getPropertyValue("--slot-lines")) || 2) * 17) / 20,
    line: parseFloat(cardStyle.getPropertyValue("--title-line")) || 15
  };
  writes.push(
    [card, "--title-room-w", String(rooms.roomW)],
    [card, "--title-head-h", String(rooms.headH)],
    [card, "--title-card-h", String(rooms.cardH)],
    [card, "--title-pitch", String(rooms.pitch)],
    [card, "--title-row-gap", String(rooms.rowGap)],
    [card, "--title-more-h", String(rooms.moreH)]
  );
  const held = title.querySelector<HTMLElement>(".local-file-name-held");
  if (held) {
    const name: HeldName = { held, actions, nameY: fixed((titleRect.top - headerRect.top) / k), segments: heldSegments(held.dataset.name ?? ""),
      measure: textMeasure(getComputedStyle(held)), rooms, resistances };
    heldNames.set(card, name);
    writes.push(...heldLineWrites(name, HELD_BANDS, rowsBeforePin(card)));
  }
  return writes;
}

/** What a card's held header needs to be chosen again: kept from its card's last reading. */
interface HeldName {
  held: HTMLElement;
  /** The node's controls, and the name's top below the header's, which their place is written from. */
  actions: HTMLElement;
  nameY: number;
  segments: string[];
  measure: (text: string) => number;
  rooms: TitleRooms;
  resistances: LadderResistances;
}
const heldNames = new WeakMap<HTMLElement, HeldName>();

/**
 * The held header at each band and step, chosen by the six principles ({@link chooseHeldHeader}) in the room the
 * stylesheet gives it there: the name's lines written as an attribute a band and step, `data-lines-<band>-<step>`, which
 * the stylesheet draws as they are, and the controls' top from the header's top in the map's own units, a custom
 * property a band and step on the controls, `--controls-y-<band>-<step>`, where the stylesheet stands them; a step's
 * held scales as the controller writes them, rounded alike.
 */
function heldLineWrites(name: HeldName, bands: readonly HeldBand[], before: number | null): RoomWrite[] {
  const writes: RoomWrite[] = [];
  for (let step = FIRST_STEP; step <= LAST_STEP; step += 1) {
    const held = ladderScales(step, name.resistances);
    const scales = { text: Number(held.text.toFixed(3)), control: Number(held.control.toFixed(3)) };
    for (const band of bands) {
      const { scale, room } = heldTitle(name.rooms, band, scales, before);
      const header = chooseHeldHeader(name.segments, room, name.measure);
      writes.push(
        [name.held, `data-lines-${band}-${step}`, header.lines.join("\n")],
        [name.actions, `--controls-y-${band}-${step}`, (name.nameY + header.controls.top * scale).toFixed(2)]
      );
    }
  }
  return writes;
}

/**
 * A text's width in its element's font, without laying anything out: a canvas measures it in the font's own pixels,
 * which are the name's own units. Widths are kept per font, since every card's name is measured again for each band
 * and step, mostly in the same pieces.
 */
function textMeasure(style: CSSStyleDeclaration): (text: string) => number {
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const spacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
  const key = `${font}|${spacing}`;
  let widths = measured.get(key);
  if (!widths) measured.set(key, widths = new Map<string, number>());
  const known = widths;
  return text => {
    let width = known.get(text);
    if (width === undefined) {
      // A 2D canvas context is part of every browser the Explorer serves.
      measuring ??= document.createElement("canvas").getContext("2d")!;
      measuring.font = font;
      measuring.letterSpacing = spacing;
      known.set(text, width = measuring.measureText(text).width);
    }
    return width;
  };
}
let measuring: CanvasRenderingContext2D | undefined;
const measured = new Map<string, Map<string, number>>();

/**
 * The count of shown rows above the card's first row pinned by name, which bounds the file's name at the overview band
 * as the first row drawn there, or nothing when no shown row is pinned by name. The branch renderer writes it again whenever it orders a card's rows.
 */
function firstPinWrite(card: HTMLElement): string {
  const before = rowsBeforePin(card);
  return before === null ? "" : String(before);
}

function rowsBeforePin(card: HTMLElement): number | null {
  return rowsBeforeFirstPin([...card.querySelectorAll<HTMLElement>(".symbol-row")].map(row => ({
    shown: !row.classList.contains("branch-symbol-hidden") && !row.classList.contains("symbol-collapsed"),
    pinned: row.classList.contains("symbol-pinned-named")
  })));
}

/**
 * Write {@link firstPinWrite} for a card whose rows were just ordered, and its held name's lines at the overview band,
 * whose room it bounds, from the card's last reading: no layout is read.
 */
export function markFirstPin(card: HTMLElement): void {
  applyRoomWrite([card, "--rows-before-pin", firstPinWrite(card)]);
  const name = heldNames.get(card);
  if (name?.held.isConnected) for (const write of heldLineWrites(name, ["overview"], rowsBeforePin(card))) applyRoomWrite(write);
}

/** A write's name says what it sets: a `data-` attribute, a custom property, or else a class. */
function applyRoomWrite([element, name, value]: RoomWrite): void {
  if (typeof value === "boolean") element.classList.toggle(name, value);
  else if (name.startsWith("data-")) element.setAttribute(name, value);
  else if (value === "") element.style.removeProperty(name);
  else element.style.setProperty(name, value);
}

/** Empty generated placeholders are not a file description. The complete authored text remains in the reader. */
function purposeOf(file: GraphFile): string {
  const purpose = authoredSections(file.authored).find(section => section.heading?.toLowerCase() === "purpose");
  const text = purpose?.markdown.replace(/^###[^\n]*\n?/u, "").trim() ?? "";
  return /^_?Pending(?: authored purpose)?_?\.?$/iu.test(text) ? "" : text;
}

import type { TypeRef } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";
import { pathTo, walk } from "@live-documentation/engine/live-docs/pathfind";

import { drawHeldCells } from "./card-factory";
import { CELLS } from "./closed-looks";
import { CLOSED_FOOT, fitHandle, HANDLE_INDENT, wholeAtSeams } from "./directory-handle";
import { chooseHeldHeader, chooseNameHeader, CONTROLS_GAP, HELD_BANDS, heldLineCount, heldSegments, heldTitle, rowSegments, type HeldBand, type HeldRoom, type TitleRooms } from "./held-lines";
import { dotRoom, evenRows, fitLines, footHold, HEAD_SPACE, headHeight, HIGHLIGHT_BELOW, layoutTopOf, linesOf, nameFill, nameLinesHeld, nameWraps, pinDepth, type FootCount } from "./ladder-rooms";
import { FIRST_STEP, LAST_STEP, ladderScales, LOOK_BANDS, LOOK_SCALES, type LadderResistances, type ZoomLook } from "./ladder-steps";
import { COMPACT_AIR, filesNameScale, OVERVIEW_FILES_ATTRIBUTE, pinnedRowScales, wholeNameScale } from "./overview-files";
import type { LocalEdge, ReadingControl } from "./types";
import { seamsOf } from "./word-seams";
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
  /** Tuning's Zoom Looks: with the trial's three looks, the held name's lines are chosen for each look's scale too. */
  zoomLooks(): "stepped" | "three";
  change(nodeId: string, symbol: string | undefined, open: boolean, control: ReadingControl): void;
  inspect(target: InspectionTarget, fragment?: string): void;
  navigate(node: ExplorerNodePayload): void;
}

interface ReadingBlock {
  element: HTMLElement;
  prose: HTMLElement;
  more: HTMLButtonElement;
  hasMore: boolean;
  hasProse: boolean;
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
 * out"). With fixed slots every symbol keeps the same allotment of text lines; books fold or restore their text,
 * while names open full descriptions in the reader.
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
   * Open or fold the descriptions a book names. Growing-card names share that choice; fixed-slot names open the
   * reader instead. The application saves the choice. False when the card has nothing to open, so that the caller
   * can offer what it does have.
   */
  toggle(nodeId: string, symbol: string | undefined, control: ReadingControl): boolean {
    const model = this.cards.get(nodeId);
    if (!model) return false;
    if (symbol === undefined ? !model.purpose && !model.symbols.size : !model.symbols.has(symbol)) return false;
    if (this.slots && control === "name") {
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

    if (!this.slots || summary || file.symbols.some(symbol => symbol.sections.some(section => section.title === "Summary" && section.body.some(line => line.trim())))) {
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
      if (!this.slots || text) {
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
    const resistances = this.options.resistances(), looks = this.options.zoomLooks() === "three";
    // What the zoom looks drew from the last reading, a name wrapped below its line and the foot's counts held, is taken
    // back first, all at once, so that every box is read as the layout put it (a reading may come between renders).
    for (const { card } of this.cards.values()) {
      card.classList.remove("local-foot-held");
      for (const row of card.querySelectorAll(".symbol-row")) row.classList.remove(...HELD_LOOKS.map(look => `local-name-lines-${look}`));
    }
    const rooms = [...this.cards.values()].flatMap(({ card }) => measureRooms(card, resistances, looks));
    if (looks) for (const box of this.container.querySelectorAll<HTMLElement>(".local-directory-closed")) rooms.push(...closedBoxWrites(box));
    for (const write of rooms) applyRoomWrite(write);
    if (looks) for (const box of this.container.querySelectorAll<HTMLElement>(".local-closed--cells")) drawHeldCells(box);
  }

  /** Every kept-visible description shows; the books and the names say what each one would do next. */
  private updateCard(model: ReadingCard): void {
    const slots = this.slots;
    const open = (symbol?: string): boolean => this.held(model.node.id, symbol);
    const present = (block: ReadingBlock, symbol?: string): void => {
      // Folding text in a fixed slot keeps its allotment, so the card and its connections stay put.
      block.element.hidden = !slots && !open(symbol);
      block.element.dataset.readingOpen = String(open(symbol));
    };
    if (model.purpose) present(model.purpose);
    for (const [name, block] of model.symbols) {
      present(block, name);
      // With fixed slots a symbol whose description is not shown, none written or folded with its book, has a short
      // row (the owner, 2026-11-13: "symbols with no description shown to occupy less vertical space on their row").
      block.element.closest(".symbol-row")?.classList.toggle("local-row-short", this.short(model, name, block));
    }
    // Below reading scale the prose fades in either composition; a card's box never depends on zoom.
    model.card.classList.toggle("local-slot-card", slots);
    model.card.classList.toggle("local-reading-faded", !this.visible);
    const reading = !slots && (!!model.purpose && !model.purpose.element.hidden
      || [...model.symbols.values()].some(block => !block.element.hidden));
    model.card.classList.toggle("local-reading-card", reading);
    const proseShown = !slots || !["middle", "far", "overview"].includes(this.container.dataset.lod ?? "");
    const shown = (block: ReadingBlock | undefined | null, symbol?: string): boolean =>
      !!block && (!slots || block.hasProse) && proseShown && open(symbol);
    const expandedOf = (symbol?: string): boolean => symbol === undefined
      ? shown(model.purpose) || [...model.symbols].some(([name, block]) => shown(block, name))
      : shown(model.symbols.get(symbol), symbol);
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

  /** Whether a symbol's row is short: fixed slots, and its description not shown, none written or folded. */
  private short(model: ReadingCard, symbol: string, block: ReadingBlock): boolean {
    return this.slots && !(block.hasProse && this.held(model.node.id, symbol));
  }

  /**
   * Whether the reading choices now shorten or restore a slot card's row: a deliberate fold or restore, which changes
   * the card's box, so that the map lays out again around the card held still rather than only redrawing its text.
   */
  rowsChange(): boolean {
    for (const model of this.cards.values()) for (const [name, block] of model.symbols) {
      const row = block.element.closest(".symbol-row");
      if (row && row.classList.contains("local-row-short") !== this.short(model, name, block)) return true;
    }
    return false;
  }

  private controlKeepsVisible(model: ReadingCard, symbol?: string): boolean {
    return symbol === undefined
      ? this.held(model.node.id) && [...model.symbols.keys()].every(name => this.held(model.node.id, name))
      : this.held(model.node.id, symbol);
  }

  private held(nodeId: string, symbol?: string): boolean {
    return descriptionIsOpen(this.options.choices(), nodeId, symbol, this.slots || this.options.defaultOpen(nodeId, symbol));
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
    return { element, prose, more, hasMore, hasProse: !!text.trim() };
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
function measureRooms(card: HTMLElement, resistances: LadderResistances, looks: boolean): RoomWrite[] {
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
    const lines = Math.max(1, linesOf([...range.getClientRects()]));
    return { width: range.getBoundingClientRect().width / (k * own), lines };
  };
  // The card's content's bottom edge on screen, inside its border and padding.
  const cardStyle = getComputedStyle(card);
  const contentBottom = cardRect.bottom - (parseFloat(cardStyle.borderBottomWidth) + parseFloat(cardStyle.paddingBottom)) * k;
  const rowsGrid = card.querySelector<HTMLElement>(".symbol-grid");
  const rowsGap = rowsGrid ? parseFloat(getComputedStyle(rowsGrid).rowGap) || 0 : 0;
  // Each row's height as laid out, for the file's name's room at the overview; and with the zoom looks, what each row's
  // head needs in the far looks, placed once every row is read.
  const heights = new Map<HTMLElement, number>();
  const heads: LookHead[] = [];
  for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
    const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper"), label = row.querySelector<HTMLElement>(".symbol-label");
    if (!wrapper || !label || !label.offsetHeight) continue;
    const text = textOf(label);
    if (!(text.width > 0)) continue;
    const wrapperStyle = getComputedStyle(wrapper);
    const roomWidth = wrapper.clientWidth - parseFloat(wrapperStyle.paddingLeft) - parseFloat(wrapperStyle.paddingRight);
    const rowRect = row.getBoundingClientRect(), wrapperRect = wrapper.getBoundingClientRect(), labelRect = label.getBoundingClientRect();
    // With the trial's zoom looks the Internals row, the card's last, has the room down to the card's content bottom,
    // which nothing else uses, so that it is held at the look's scale as the rows above it are (its own row is a line).
    const rowHeight = looks && row.classList.contains("internals-row") && !row.nextElementSibling
      ? Math.max(row.clientHeight, Math.floor((contentBottom - rowRect.top) / k)) : row.clientHeight;
    const nameTop = (labelRect.top - rowRect.top) / k, nameHeight = label.offsetHeight;
    heights.set(row, row.clientHeight);
    const gap = parseFloat(wrapperStyle.columnGap) || 0;
    const pin = row.querySelector<HTMLElement>(".local-symbol-pin")?.offsetWidth ?? 0;
    const read = row.querySelector<HTMLElement>(".local-symbol-read")?.offsetWidth ?? 0;
    const moreButton = row.querySelector<HTMLElement>(".local-symbol-more");
    const more = moreButton?.offsetWidth ?? 0;
    const badges = row.querySelector<HTMLElement>(".type-refs-indicator")?.offsetWidth ?? 0;
    // A held button grows from its own top, so its drawn top is its layout top once the shift of its row's head, which
    // the far looks may draw, is taken back.
    const moreTop = moreButton ? (moreButton.getBoundingClientRect().top - rowRect.top) / k - new DOMMatrix(getComputedStyle(moreButton).transform).f : 0;
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
    // With the zoom looks, a name the room across cannot hold at a look's scale takes the room below it that its
    // description left, on as many lines as the row holds there (2026-11-13), broken where the card breaks it: the lines
    // it takes are written for each look that holds it, and the stylesheet draws it wrapped in a box that tall.
    if (looks) {
      const inner = row.querySelector<HTMLElement>(".symbol-label-text") ?? label;
      const measureName = textMeasure(getComputedStyle(inner));
      const segments = rowSegments(row.dataset.symbol === "__internals__" ? "Internals" : row.dataset.symbol ?? "");
      // One line of the name as the layout draws it, its box over its lines, with its own scale undone.
      const line = inner.getBoundingClientRect().height / (k * (new DOMMatrix(getComputedStyle(inner).transform).d || 1)) / Math.max(1, text.lines);
      writes.push([row, "--row-line", line.toFixed(3)]);
      heads.push({ row, top: (rowRect.top - cardRect.top) / k, height: row.clientHeight, room: rowHeight, internals: row.classList.contains("internals-row"),
        nameTop, nameHeight, line, moreTop, moreHeight: moreButton?.offsetHeight || 17, segments, measure: measureName,
        across: (control: number) => roomWidth - (more ? gap + more : 0) * control });
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
      [row, "--row-controls-w", String([read, pin, more].filter(Boolean).reduce((sum, width) => sum + gap + width, 0))],
      [row, "--row-after-read-w", String([pin, more].filter(Boolean).reduce((sum, width) => sum + gap + width, 0))],
      [row, "--row-more-w", String(more ? gap + more : 0)],
      [row, "--row-more-y", moreTop.toFixed(2)],
      [row, "--row-more-h", String(moreButton?.offsetHeight || 17)],
      [row, "--row-dot-mid", dotMiddle.toFixed(2)],
      [row, "--row-dot-h", String(dotHeight)],
      [row, "--row-dot-room", (Number.isFinite(dotScale) ? dotScale : 1).toFixed(3)],
      [row, "local-name-wraps", nameWraps(text.lines, text.width, label.clientWidth)]
    );
  }
  if (looks) writes.push(...lookHeadWrites(heads, parseFloat(cardStyle.getPropertyValue("--slot-lines")) || 2, rowsGap));
  writes.push(...pinDepthWrites(card, heights, rowsGap));
  const title = card.querySelector<HTMLElement>(".local-file-name"), header = card.querySelector<HTMLElement>(".node-title");
  const grid = card.querySelector<HTMLElement>(".symbol-grid"), actions = card.querySelector<HTMLElement>(".local-card-actions");
  if (!title || !header || !grid || !actions || !title.offsetHeight) return writes;
  const headerRect = header.getBoundingClientRect(), titleRect = title.getBoundingClientRect();
  const more = card.querySelector<HTMLElement>(".local-file-more");
  // Each room as the stylesheet reads it, rounded as written, so that the lines chosen below are the lines it draws.
  const fixed = (value: number): number => Number(value.toFixed(1));
  // The controls that stay at the middle band: all but the book, which leaves with the descriptions it folds (2026-11-13).
  const kept = [...actions.children].filter(control => !control.classList.contains("local-file-read")).length;
  const rooms: TitleRooms = {
    roomW: fixed((headerRect.right - titleRect.left) / k),
    headH: fixed((grid.getBoundingClientRect().top - titleRect.top) / k),
    cardH: fixed((contentBottom - titleRect.top) / k),
    // The controls that stay at each band follow the name at the header's right edge: those above at the middle band,
    // More alone further out. Their width is counted from their number, since the farther bands hide all but More.
    actionsW: kept * (more?.offsetWidth ?? 0) + Math.max(0, kept - 1) * (parseFloat(getComputedStyle(actions).columnGap) || 0),
    moreW: more?.offsetWidth ?? 0,
    moreH: more?.offsetHeight ?? 0,
    controlCeiling: (32 + (parseFloat(cardStyle.getPropertyValue("--slot-lines")) || 2) * 17) / 20,
    line: parseFloat(cardStyle.getPropertyValue("--title-line")) || 15
  };
  const held = title.querySelector<HTMLElement>(".local-file-name-held");
  // At the overview look a file's name is not broken inside a word while a smaller size would keep its pieces whole
  // (2026-11-13 for files only; 2026-11-15 for a card that keeps its size too): it is held at the look's size, or smaller
  // where the widest of its segments would not fit across, never below the connections look's (filesNameScale).
  let overviewScale: number | undefined;
  if (looks && held) {
    const measure = textMeasure(getComputedStyle(held));
    overviewScale = filesNameScale(rooms.roomW, Math.max(0, ...heldSegments(held.dataset.name ?? "").map(segment => measure(segment.trim()))));
  }
  writes.push([card, "--overview-name-scale", overviewScale === undefined ? "" : overviewScale.toFixed(3)]);
  // With files only at the overview (2026-11-13) a compact card's name is held whole and broken only at its seams, as
  // Flow's are; and the card is as tall as the name needs, its More beside or below it, with air below its last line.
  // The member's form had held two lines and cut names that the tall card held whole.
  if (overviewScale !== undefined && held && card.closest(`[${OVERVIEW_FILES_ATTRIBUTE}]`)) {
    const measure = textMeasure(getComputedStyle(held)), text = held.dataset.name ?? "";
    const tall = heldTitle({ ...rooms, cardH: Number.MAX_SAFE_INTEGER }, "overview", { text: overviewScale, control: overviewScale }, null);
    const named = chooseNameHeader(text, tall.room, measure);
    const needed = fixed((Math.max(named.lines.length * rooms.line, named.controls.top + tall.room.controlsHeight) + COMPACT_AIR * rooms.line) * tall.scale);
    // Files only draws a symbol pinned by name beneath its file's name (2026-11-15): the rows stand below what the name
    // needs, pushed down by what that is more than the header's room, and the name's room ends where they begin.
    const pinnedRows = card.querySelector(".symbol-row.symbol-pinned-named") !== null;
    rooms.cardH = pinnedRows ? Math.max(rooms.headH, needed) : Math.max(rooms.cardH, needed);
    writes.push([card, "--files-rows-push", pinnedRows && needed > rooms.headH ? (needed - rooms.headH).toFixed(1) : ""]);
    // The card's min-height in its own box model: a border box counts its padding and border below the content too.
    const below = cardStyle.boxSizing === "border-box" ? parseFloat(cardStyle.paddingBottom) + parseFloat(cardStyle.borderBottomWidth) : 0;
    const top = cardStyle.boxSizing === "border-box" ? cardRect.top : cardRect.top + (parseFloat(cardStyle.borderTopWidth) + parseFloat(cardStyle.paddingTop)) * k;
    writes.push([card, "--files-card-h", ((titleRect.top - top) / k + needed + below).toFixed(1)]);
  }
  writes.push(
    [card, "--title-room-w", String(rooms.roomW)],
    [card, "--title-head-h", String(rooms.headH)],
    [card, "--title-card-h", String(rooms.cardH)],
    [card, "--title-more-h", String(rooms.moreH)]
  );
  if (held) {
    const name: HeldName = { held, actions, nameY: fixed((titleRect.top - headerRect.top) / k), text: held.dataset.name ?? "",
      measure: textMeasure(getComputedStyle(held)), rooms, resistances, looks, overviewScale };
    heldNames.set(card, name);
    writes.push(...heldLineWrites(name, HELD_BANDS, pinDepths(card, heights, rowsGap)));
    if (looks) writes.push(...footWrites(card, { k, cardRect, contentBottom, grid, titleTop: titleRect.top, header: connectionsHeaderHeight(name) }));
  }
  return writes;
}

/** What a row's head needs in the far looks, read at render: its box, its name's top, line and text, and its More. */
interface LookHead {
  row: HTMLElement;
  /** Its top below the card's and its height as laid out, and the room its head has on its own (Internals: to the foot). */
  top: number;
  height: number;
  room: number;
  internals: boolean;
  nameTop: number;
  /** The name's button's height, one line or the lines it wraps on at the reading width. */
  nameHeight: number;
  line: number;
  moreTop: number;
  moreHeight: number;
  segments: string[];
  measure: (text: string) => number;
  /** The room across for the name beside More held at a scale. */
  across: (control: number) => number;
}

/**
 * Each row's lines and head in the far looks (2026-11-13). A name takes as many lines as it needs at the connections
 * look, up to what a slot row holds there, fewer where the card's rows cannot hold them all ({@link fitLines}); the drawn
 * rows' heads, as tall as that, are spaced evenly over the rows' room ({@link evenRows}), each shifted from its row's top
 * and held in its own height and the space after it. The overview look draws its names in the same places, on the
 * lines that share holds at its scale. The Internals row keeps its own place and room, as before.
 */
function lookHeadWrites(heads: readonly LookHead[], slotLines: number, gap: number): RoomWrite[] {
  const writes: RoomWrite[] = [];
  const connections = LOOK_SCALES.connections;
  const slotRow = 32 + slotLines * 17;
  const drawn = heads.filter(head => !head.internals);
  const want = drawn.map(head => heldLineCount(head.segments, head.across(connections) / connections,
    nameLinesHeld(Math.max(head.room, slotRow), head.nameTop, head.line, connections), head.measure));
  const headOf = (index: number, lines: number): number => headHeight(drawn[index], lines, connections);
  const room = drawn.length ? drawn[drawn.length - 1].top + drawn[drawn.length - 1].height - drawn[0].top : 0;
  // Every head keeps the least space after it.
  const lines = fitLines(want, headOf, room + gap - drawn.length * HEAD_SPACE);
  const placed = evenRows(drawn.map((head, index) => ({ top: head.top, height: head.height, head: headOf(index, lines[index]) })), gap);
  const at = new Map(drawn.map((head, index) => [head, { shift: placed[index].shift, height: placed[index].height, lines: lines[index] }]));
  const evenOf = (head: LookHead): { shift: number; height: number; lines: number } => at.get(head) ?? { shift: 0, height: head.room, lines: 0 };
  // A row's room at a look. The overview look draws a row only when its symbol is pinned by name, in its even share
  // where the card keeps its size and in its own row where files only lays it out alone: its head has the lesser of the
  // two. Across, the room is what More leaves, held at a scale no larger than the row holds it.
  const roomsOf = (head: LookHead, look: ZoomLook) => {
    const room = look === "overview" ? Math.min(evenOf(head).height, head.room) : evenOf(head).height;
    const across = (held: number): number => head.across(Math.min(Math.max(1, held), Math.max(1, (room - head.moreTop - HIGHLIGHT_BELOW) / head.moreHeight)));
    return { room, across, linesAt: (scale: number): number => nameLinesHeld(room, head.nameTop, head.line, scale) };
  };
  // At the overview look a name comes down in size before it is cut (2026-11-15), as a file's name does, and its row's
  // More and dots with it, as a file's More follows its name: the largest scale at which every segment fits a line and
  // the lines its seams make fit the row. The rows a card draws there, those pinned by name, take one size, the
  // tightest's (pinnedRowScales): a difference of size that means nothing reads as a difference of kind.
  const overviewScales = pinnedRowScales(heads.map(head => {
    const { across, linesAt } = roomsOf(head, "overview");
    const widest = Math.max(0, ...head.segments.map(segment => head.measure(segment.trimEnd())));
    const whole = (scale: number): boolean => widest <= across(scale) / scale + 1e-6
      && heldLineCount(head.segments, across(scale) / scale, Number.MAX_SAFE_INTEGER, head.measure) <= linesAt(scale);
    return { scale: wholeNameScale(whole), pinned: head.row.classList.contains("symbol-pinned-named") };
  }));
  heads.forEach((head, index) => {
    const even = evenOf(head);
    writes.push([head.row, "--row-even-y", even.shift.toFixed(2)], [head.row, "--row-even-h", even.height.toFixed(2)],
      [head.row, "--row-fill-even", nameFill(even.height, head.nameTop, head.nameHeight).toFixed(3)],
      [head.row, "data-head-h", even.lines ? headOf(drawn.indexOf(head), even.lines).toFixed(2) : ""]);
    for (const look of HELD_LOOKS) {
      const { room, across, linesAt } = roomsOf(head, look);
      const wanted = look === "overview" ? overviewScales[index] : LOOK_SCALES[look];
      // The stylesheet's held scales at the look for a name its room cannot hold on one line, and its room across.
      const scale = Math.max(1, Math.min(nameFill(room, head.nameTop, head.nameHeight), wanted));
      const count = look === "connections" && even.lines ? even.lines : heldLineCount(head.segments, across(wanted) / scale, linesAt(scale), head.measure);
      writes.push([head.row, `--row-lines-${look}`, String(count)], [head.row, `local-name-lines-${look}`, count > 1]);
      if (look === "overview") writes.push([head.row, "--row-scale-overview", wanted.toFixed(3)]);
    }
  });
  return writes;
}

/**
 * A closed directory's box in the far looks (2026-11-13), by the rule of a file's card: its name held at the look's
 * size after its chevron, on the lines its box holds at the name's seams, brought down in size before it is broken inside
 * a word and never below the connections look's size (`fitHandle`, 2026-11-15, when "bootst…" stood cut beside free
 * room), and the box's More following the name at the box's right edge, held no taller than a line of it, where the box
 * holds it too; otherwise More is not drawn, nor is the count of what the box holds, which no look can hold beside the
 * name. Read from the box as laid out, in the map's own units: its content's place and size, the name's line and font,
 * and More's layout box, from which its move to its place is written for each look.
 */
function closedBoxWrites(box: HTMLElement): RoomWrite[] {
  const name = box.querySelector<HTMLElement>(".local-directory-closed__name"), held = box.querySelector<HTMLElement>(".local-directory-closed__held");
  const more = box.querySelector<HTMLElement>(".local-directory-actions");
  const cells = box.classList.contains("local-closed--cells");
  if (!name || !held || !box.offsetHeight) return [];
  const style = getComputedStyle(box), nameStyle = getComputedStyle(name);
  const left = parseFloat(style.paddingLeft), top = parseFloat(style.paddingTop);
  const width = box.clientWidth - left - parseFloat(style.paddingRight), height = box.clientHeight - top - parseFloat(style.paddingBottom);
  // The held name's own room down: to the air above the box's foot, where two lines stand at the connections look's size.
  const nameHeight = box.clientHeight - top - CLOSED_FOOT;
  const line = parseFloat(nameStyle.lineHeight) || name.offsetHeight;
  const measure = textMeasure(nameStyle);
  const segments = seamsOf(held.dataset.name ?? "");
  const moreWidth = more?.offsetWidth ?? 0, moreHeight = Math.max(1, more?.offsetHeight ?? 1);
  const writes: RoomWrite[] = [[box, "--closed-left", left.toFixed(2)], [box, "--closed-top", top.toFixed(2)], [box, "--closed-width", width.toFixed(2)],
    [box, "--closed-line", line.toFixed(3)], [box, "--closed-indent", String(HANDLE_INDENT)]];
  for (const look of HELD_LOOKS) {
    const most = Math.max(1, Math.min(LOOK_SCALES[look], nameHeight / line));
    const controlAt = (scale: number): number => Math.max(1, Math.min(LOOK_SCALES[look], line * scale / moreHeight));
    // The room in the name's own units at a scale, after the chevron that leads every line, with More held beside or not.
    const roomAt = (scale: number, beside: boolean): HeldRoom => ({ width: width / scale - HANDLE_INDENT, height: nameHeight / scale, line,
      controlsWidth: beside ? moreWidth * controlAt(scale) / scale : 0, controlsHeight: beside ? moreHeight * controlAt(scale) / scale : 0, gap: CONTROLS_GAP / scale });
    // The name is fitted first, as a file's is (item by item in `fitHandle`); More joins it where the same lines hold it too.
    const alone = fitHandle(segments, at => roomAt(at, false), measure, most, LOOK_SCALES.connections);
    const scale = alone.scale, control = controlAt(scale), room = roomAt(scale, true);
    const header = chooseHeldHeader(segments, room, measure);
    const fits = !!more && header.controls.top + room.controlsHeight <= room.height + 1e-6 && header.lines.length <= alone.header.lines.length
      && wholeAtSeams(header, segments) === wholeAtSeams(alone.header, segments) && !header.lines.some(text => text.endsWith("…"));
    const lines = fits ? header.lines : alone.header.lines;
    writes.push([held, `data-lines-look-${look}`, lines.join("\n")], [box, `--closed-scale-${look}`, scale.toFixed(3)],
      [box, `--closed-control-${look}`, control.toFixed(3)], [box, `local-closed-controls-${look}`, fits]);
    // The skin with cells (2026-11-13) holds its cells at the look's scale in the room below the held name and the
    // controls held beside it; drawHeldCells draws them from this room, or none where not a row fits.
    if (cells) {
      const below = Math.max(lines.length * line, fits ? header.controls.top + room.controlsHeight : 0) * scale + CELLS.bandGap * scale;
      const fitsRow = height - below >= CELLS.cell * scale - 1e-6;
      writes.push([box, `data-cells-${look}`, fitsRow ? `${left.toFixed(2)} ${(top + below).toFixed(2)} ${(width / scale).toFixed(2)} ${((height - below) / scale).toFixed(2)} ${scale.toFixed(3)}` : ""]);
    }
    if (!fits || !more) continue;
    // More's move, from its layout box to its place at the content's right edge, at the controls' top, held about its top right.
    writes.push([more, `--closed-x-${look}`, (left + width - (more.offsetLeft + more.offsetWidth)).toFixed(2)],
      [more, `--closed-y-${look}`, (top + header.controls.top * scale - more.offsetTop).toFixed(2)]);
  }
  return writes;
}

/** The connections look's held header's height below the name's top, in the map's own units: its lines and its More. */
function connectionsHeaderHeight(name: HeldName): number {
  const { scale, room } = heldTitle(name.rooms, "far", { text: LOOK_SCALES.connections, control: LOOK_SCALES.connections }, null);
  const header = chooseNameHeader(name.text, room, name.measure);
  return Math.max(header.lines.length * room.line, header.controls.top + room.controlsHeight) * scale;
}

/**
 * The counts at a card's foot in the connections look (2026-11-13): "+N symbols" and the framed "+N connections", what a
 * card says of what it does not draw, the second also the control that reveals it. Inside a box that never changes they
 * stand at the look's held size, from the card's foot upward, or are not drawn: never at the map's own size, where five
 * presses out they were five pixels tall. Their room is the card's below what the look draws, its drawn rows or, on a card
 * with none, its file's name as the look holds it; across, the card's content. The card is marked when they fit, with
 * the look's scale, and each count with its distance above the last one's foot, from which the stylesheet holds them
 * together about that foot.
 */
function footWrites(card: HTMLElement, at: { k: number; cardRect: DOMRect; contentBottom: number; grid: HTMLElement; titleTop: number; header: number }): RoomWrite[] {
  const counts = [...card.querySelectorAll<HTMLElement>(":scope > button.local-disclosure:not(.local-back-references)")].filter(count => count.offsetHeight);
  if (!counts.length) return [[card, "local-foot-held", false]];
  const { k } = at, scale = LOOK_SCALES.connections;
  const style = getComputedStyle(card);
  // Every box in the map's own units from the card's top and left.
  const top = at.cardRect.top, left = at.cardRect.left;
  const right = (at.cardRect.right - left) / k - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
  const boxes: FootCount[] = counts.map(count => {
    const rect = count.getBoundingClientRect();
    return { top: (rect.top - top) / k, bottom: (rect.bottom - top) / k, left: (rect.left - left) / k, width: rect.width / k };
  });
  const drawnRows = [...at.grid.querySelectorAll<HTMLElement>(".symbol-row")].some(row => row.offsetHeight > 0);
  const free = drawnRows ? (at.grid.getBoundingClientRect().bottom - top) / k : (at.titleTop - top) / k + at.header;
  // The framed control's frame stands 3 px outside its box (local.css).
  const { held, above } = footHold(boxes, free, right, scale, 3, CONTROLS_GAP);
  const writes: RoomWrite[] = [[card, "local-foot-held", held], [card, "--foot-scale", String(scale)]];
  for (const [index, count] of counts.entries()) writes.push([count, "--foot-y", above[index].toFixed(2)]);
  return writes;
}

/** What a card's held header needs to be chosen again: kept from its card's last reading. */
interface HeldName {
  held: HTMLElement;
  /** The node's controls, and the name's top below the header's, which their place is written from. */
  actions: HTMLElement;
  nameY: number;
  /** The file's name, whose lines are chosen at its seams. */
  text: string;
  measure: (text: string) => number;
  rooms: TitleRooms;
  resistances: LadderResistances;
  /** Whether the trial's zoom looks draw the card, whose lines are chosen for each look's one scale as well. */
  looks: boolean;
  /** The overview look's scale for this card's name (filesNameScale); absent, the look's own. */
  overviewScale?: number;
}
const heldNames = new WeakMap<HTMLElement, HeldName>();

/**
 * The held header at each band and step, chosen by the six principles ({@link chooseHeldHeader}) in the room the
 * stylesheet gives it there: the name's lines written as an attribute a band and step, `data-lines-<band>-<step>`, which
 * the stylesheet draws as they are, and the controls' top from the header's top in the map's own units, a custom
 * property a band and step on the controls, `--controls-y-<band>-<step>`, where the stylesheet stands them; a step's
 * held scales as the controller writes them, rounded alike. With the trial's zoom looks, the same once for each look
 * that holds the name, in its band at its one scale: `data-lines-look-<look>` and `--controls-y-look-<look>`, chosen once
 * a render, so that the name's lines are the same at every zoom inside the look. At the overview the name's room reaches
 * down to the first pinned row as laid out for the ladder, and as the looks draw it, its head shared evenly, for them.
 */
function heldLineWrites(name: HeldName, bands: readonly HeldBand[], depths: PinDepths): RoomWrite[] {
  const writes: RoomWrite[] = [];
  // The looks keep a short extension from a line of its own (chooseNameHeader, 2026-11-13); the ladder keeps the header
  // round's filled first line, which its box audit holds.
  const write = (band: HeldBand, key: string, scales: { text: number; control: number }, depth: number | null, look = false): void => {
    const { scale, room } = heldTitle(name.rooms, band, scales, depth);
    const header = look ? chooseNameHeader(name.text, room, name.measure) : chooseHeldHeader(heldSegments(name.text), room, name.measure);
    writes.push(
      [name.held, `data-lines-${key}`, header.lines.join("\n")],
      [name.actions, `--controls-y-${key}`, (name.nameY + header.controls.top * scale).toFixed(2)]
    );
  };
  for (let step = FIRST_STEP; step <= LAST_STEP; step += 1) {
    const held = ladderScales(step, name.resistances);
    const scales = { text: Number(held.text.toFixed(3)), control: Number(held.control.toFixed(3)) };
    for (const band of bands) write(band, `${band}-${step}`, scales, depths.layout);
  }
  if (name.looks) for (const look of HELD_LOOKS) {
    const band = LOOK_BANDS[look] as HeldBand;
    const scale = look === "overview" ? name.overviewScale ?? LOOK_SCALES[look] : LOOK_SCALES[look];
    if (bands.includes(band)) write(band, `look-${look}`, { text: scale, control: scale }, depths.even, true);
  }
  return writes;
}

/** The zoom looks that draw the held name: the reading look draws the name as composed. */
const HELD_LOOKS: readonly ZoomLook[] = ["connections", "overview"];

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

/** How far below the rows' top a card's first pinned row stands, less the row gap: as laid out, and as the looks draw it. */
interface PinDepths {
  layout: number | null;
  even: number | null;
}

/**
 * The depths of the card's first row pinned by name below its rows' top ({@link pinDepth}), which bound the file's name at
 * the overview band as the first row drawn there, or nothing when no shown row is pinned by name: from the rows' heights
 * as measured, or as the last reading recorded them (`data-layout-height`) when the branch renderer orders a card's rows
 * without a reading, and the row gap likewise (`data-rows-gap`).
 */
function pinDepths(card: HTMLElement, heights?: ReadonlyMap<HTMLElement, number>, gap?: number): PinDepths {
  const rowGap = gap ?? (parseFloat(card.dataset.rowsGap ?? "") || 0);
  // With files only at the overview (2026-11-13) no row is drawn, and the name's room is the whole compact card.
  const filesOnly = card.closest(`[${OVERVIEW_FILES_ATTRIBUTE}]`) !== null;
  const rows = [...card.querySelectorAll<HTMLElement>(".symbol-row")].map(row => ({
    shown: !filesOnly && !row.classList.contains("branch-symbol-hidden") && !row.classList.contains("symbol-collapsed"),
    pinned: row.classList.contains("symbol-pinned-named"),
    height: heights?.get(row) ?? (parseFloat(row.dataset.layoutHeight ?? "") || 0),
    head: parseFloat(row.dataset.headH ?? "") || undefined,
    internals: row.classList.contains("internals-row")
  }));
  return { layout: pinDepth(rows, rowGap, false), even: pinDepth(rows, rowGap, true) };
}

/** The pin depths for the stylesheet: as laid out for the ladder, as the looks draw the rows for them; none removes them. */
function pinDepthWrites(card: HTMLElement, heights?: ReadonlyMap<HTMLElement, number>, gap?: number): RoomWrite[] {
  const depths = pinDepths(card, heights, gap);
  const writes: RoomWrite[] = [[card, "--title-pin-depth", depths.layout === null ? "" : depths.layout.toFixed(2)],
    [card, "--title-pin-depth-even", depths.even === null ? "" : depths.even.toFixed(2)]];
  if (heights) for (const [row, height] of heights) writes.push([row, "data-layout-height", String(height)]);
  if (gap !== undefined) writes.push([card, "data-rows-gap", String(gap)]);
  return writes;
}

/**
 * Write the pin depths for a card whose rows were just ordered, and its held name's lines at the overview band, whose
 * room they bound, from the card's last reading: no layout is read.
 */
export function markFirstPin(card: HTMLElement): void {
  for (const write of pinDepthWrites(card)) applyRoomWrite(write);
  const name = heldNames.get(card);
  if (!name?.held.isConnected) return;
  for (const write of heldLineWrites(name, ["overview"], pinDepths(card))) applyRoomWrite(write);
  // The rows' order sets where each head's even place is from its own: their shares stay, their shifts are found again.
  if (!name.looks) return;
  const gap = parseFloat(card.dataset.rowsGap ?? "") || 0;
  const drawn = [...card.querySelectorAll<HTMLElement>(".symbol-row:not(.internals-row)")]
    .filter(row => !row.classList.contains("branch-symbol-hidden") && !row.classList.contains("symbol-collapsed"));
  let top = 0;
  const bands = drawn.map(row => {
    const height = parseFloat(row.dataset.layoutHeight ?? "") || 0;
    const band = { top, height, head: parseFloat(row.dataset.headH ?? "") || height };
    top += height + gap;
    return band;
  });
  evenRows(bands, gap).forEach(({ shift }, index) => applyRoomWrite([drawn[index], "--row-even-y", shift.toFixed(2)]));
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

import type { TypeRef } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";
import { pathTo, walk } from "@live-documentation/engine/live-docs/pathfind";

import type { LocalEdge, ReadingControl } from "./types";
import type { ExplorerNodePayload } from "../../../shared/types";
import { escapeHtml } from "../../graph-helpers";
import { renderMarkdown } from "../../markdown";
import { createItemMenu } from "../../panels/item-menu";
import { createReaderLinkHandler, type ReaderLinkContext } from "../../reader-links";
import { authoredSections } from "../../reader-sections";
import { descriptionIsOpen, type ReadingChoice } from "../../reading-state";
import type { InspectionTarget } from "../../types";

/** The share of its room a name may fill when it grows, leaving a little air at the row's edges. */
const ROOM_MARGIN = 0.9;

/** A file's Purpose or one exact symbol's description, named by the card it is read on. */
export interface ReadingTarget { nodeId: string; symbol?: string; }

/** Canonical text, application-owned choices and the actions a card's text can lead to. */
export interface CardReadingOptions {
  links: ReaderLinkContext;
  choices(): readonly ReadingChoice[];
  defaultOpen(nodeId: string, symbol?: string): boolean;
  /** The card composition the person chose in Tuning: descriptions that open and grow, or fixed slots. */
  mode(): "grow" | "slot";
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
      if (this.slots) { this.measureRooms(card, purpose); continue; }
      // A file with many individually short descriptions can still exceed a phone's reading frame. Keep its plain
      // full reader reachable near the top, without shrinking text or installing a scrollbar inside the card.
      if (purpose && !purpose.element.hidden && card.scrollHeight > available) purpose.more.hidden = false;
      if (overflow && (!purpose || purpose.element.hidden) && card.classList.contains("local-reading-card") && card.scrollHeight > available) overflow.hidden = false;
    }
  }

  /**
   * The room each name may grow into below reading scale (2026-11-05, Turn 11: "the symbols didn't expand to fill the
   * spaces left by the disappearance of the text"): a symbol's name may fill its own box while the row's controls stand
   * and its row's allotment once they leave, the file's name the
   * header down to the Purpose's slot, since everything between leaves at the middle band; written as numbers for the
   * stylesheet, which bounds the growth by Name Growth and, for the file's name, by the room the card's buttons take
   * at their held size. Measured once a render, in layout pixels, so that zoom changes nothing here.
   */
  private measureRooms(card: HTMLElement, purpose: ReadingBlock | null): void {
    const k = card.offsetHeight ? card.getBoundingClientRect().height / card.offsetHeight : 0;
    if (!(k > 0)) return;
    // A name's text is narrower than its stretched box, and the name may already be drawn scaled: the text's own width
    // in layout pixels is its range's width, less the map's scale and its own transform.
    const textWidth = (element: HTMLElement): number => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const inner = element.querySelector<HTMLElement>(".symbol-label-text, .local-file-name-text") ?? element;
      const own = new DOMMatrix(getComputedStyle(inner).transform).a || 1;
      return range.getBoundingClientRect().width / (k * own);
    };
    for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
      const wrapper = row.querySelector<HTMLElement>(".symbol-label-wrapper"), label = row.querySelector<HTMLElement>(".symbol-label");
      if (!wrapper || !label || !label.offsetHeight) continue;
      const width = textWidth(label);
      if (!(width > 0)) continue;
      const wrapperStyle = getComputedStyle(wrapper), rowStyle = getComputedStyle(row);
      const roomWidth = wrapper.clientWidth - parseFloat(wrapperStyle.paddingLeft) - parseFloat(wrapperStyle.paddingRight);
      const roomHeight = row.clientHeight - parseFloat(rowStyle.paddingTop) - parseFloat(rowStyle.paddingBottom);
      const byHeight = roomHeight / label.offsetHeight;
      // While the row's Pin and More stand (through the middle band) the name has the room up to them; once they leave, the row.
      const gap = parseFloat(wrapperStyle.columnGap) || 0;
      let after = 0;
      for (let sibling = label.nextElementSibling; sibling; sibling = sibling.nextElementSibling) after += (sibling as HTMLElement).offsetWidth + gap;
      row.style.setProperty("--fill-middle", Math.max(1, ROOM_MARGIN * Math.min((roomWidth - after) / width, byHeight)).toFixed(2));
      row.style.setProperty("--fill-far", Math.max(1, ROOM_MARGIN * Math.min(roomWidth / width, byHeight)).toFixed(2));
    }
    const title = card.querySelector<HTMLElement>(".local-file-name"), header = card.querySelector<HTMLElement>(".node-title");
    if (!title || !header || !title.offsetHeight) return;
    const titleWidth = textWidth(title);
    if (!(titleWidth > 0)) return;
    const headerStyle = getComputedStyle(header), headerRect = header.getBoundingClientRect();
    const left = headerRect.left + parseFloat(headerStyle.paddingLeft) * k, top = headerRect.top + parseFloat(headerStyle.paddingTop) * k;
    const bottom = purpose && !purpose.element.hidden ? purpose.element.getBoundingClientRect().bottom : headerRect.bottom - parseFloat(headerStyle.paddingBottom) * k;
    const roomWidth = (headerRect.right - parseFloat(headerStyle.paddingRight) * k - left) / k, roomHeight = (bottom - top) / k;
    card.style.setProperty("--title-fill-h", Math.max(1, ROOM_MARGIN * roomHeight / title.offsetHeight).toFixed(2));
    card.style.setProperty("--title-room-w", (ROOM_MARGIN * roomWidth).toFixed(1));
    card.style.setProperty("--title-w", titleWidth.toFixed(1));
    // The buttons that stay at each band intrude on the header's room as they hold their size: all three at the middle band, More alone further out.
    card.style.setProperty("--actions-w", String(card.querySelector<HTMLElement>(".local-card-actions")?.offsetWidth ?? 0));
    card.style.setProperty("--more-w", String(card.querySelector<HTMLElement>(".local-file-more")?.offsetWidth ?? 0));
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

/** Empty generated placeholders are not a file description. The complete authored text remains in the reader. */
function purposeOf(file: GraphFile): string {
  const purpose = authoredSections(file.authored).find(section => section.heading?.toLowerCase() === "purpose");
  const text = purpose?.markdown.replace(/^###[^\n]*\n?/u, "").trim() ?? "";
  return /^_?Pending(?: authored purpose)?_?\.?$/iu.test(text) ? "" : text;
}

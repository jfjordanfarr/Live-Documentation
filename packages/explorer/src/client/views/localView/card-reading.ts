import type { TypeRef } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";

import type { ExplorerNodePayload } from "../../../shared/types";
import { escapeHtml } from "../../graph-helpers";
import { renderMarkdown } from "../../markdown";
import { createReaderLinkHandler, type ReaderLinkContext } from "../../reader-links";
import { authoredSections } from "../../reader-sections";
import { descriptionIsOpen, type ReadingChoice } from "../../reading-state";
import type { InspectionTarget } from "../../types";

/** The file Purpose or exact symbol temporarily being read; never a new retained neighborhood. */
export interface ReadingTarget { nodeId: string; symbol?: string; }

/** Canonical text, application-owned choices and the native layout's geometry transaction. */
export interface CardReadingOptions {
  links: ReaderLinkContext;
  choices(): readonly ReadingChoice[];
  defaultOpen(nodeId: string, symbol?: string): boolean;
  change(nodeId: string, symbol: string | undefined, open: boolean): void;
  preview(target: ReadingTarget | null): void;
  inspect(target: InspectionTarget, fragment?: string): void;
  canPreview(): boolean;
  canDismiss(): boolean;
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
  controls: Map<string | undefined, HTMLButtonElement>;
}

const BOOK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1Zm0 0v15"/></svg>';
const sameTarget = (a: ReadingTarget | null, b: ReadingTarget | null): boolean => a?.nodeId === b?.nodeId && a?.symbol === b?.symbol;

/**
 * Builds on-card explanations from the same bundled docs as the full reader. Pointer intent is delegated to the
 * stable map container: layout-generated boundary events cannot start another preview. Geometry changes belong
 * to the controller, which measures and animates the existing card elements without rebuilding them.
 */
export class CardReading {
  private readonly cards = new Map<string, ReadingCard>();
  private previewTarget: ReadingTarget | null = null;
  private candidate: ReadingTarget | null = null;
  private dismissed: ReadingTarget | null = null;
  private intentTimer = 0;
  private lastPointer: { x: number; y: number } | null = null;
  private keyboard = false;
  private visible = true;

  /** Reading attention pauses further ordering even when the pointed-to text was already kept open. */
  get hasAttention(): boolean { return this.previewTarget !== null; }

  constructor(private readonly container: HTMLElement, private readonly options: CardReadingOptions) {
    container.addEventListener("pointermove", this.pointerMove);
    container.addEventListener("pointerleave", this.pointerLeave);
    container.addEventListener("focusin", this.focusIn);
    container.addEventListener("focusout", this.focusOut);
    document.addEventListener("keydown", this.keyDown);
  }

  /** Release listeners and delayed previews with the Local Map. */
  dispose(): void {
    this.reset();
    this.container.removeEventListener("pointermove", this.pointerMove);
    this.container.removeEventListener("pointerleave", this.pointerLeave);
    this.container.removeEventListener("focusin", this.focusIn);
    this.container.removeEventListener("focusout", this.focusOut);
    document.removeEventListener("keydown", this.keyDown);
  }

  /** A structural render replaces cards; no old preview or delayed event may act on their successors. */
  reset(): void {
    window.clearTimeout(this.intentTimer);
    this.cards.clear();
    this.previewTarget = this.candidate = null;
    // Replacing the DOM is neither new pointer input nor permission to undo an explicit dismissal.
  }

  /** Stop preview intent when a camera or retained-state action takes ownership of the scene. */
  cancelPreview(): void {
    window.clearTimeout(this.intentTimer);
    this.candidate = null;
    this.previewTarget = null;
  }

  /** Add canonical Purpose, symbol summaries and recorded signature facts to a newly constructed native card. */
  attach(card: HTMLElement, node: ExplorerNodePayload): void {
    const file = this.options.links.files[node.id];
    if (!file) return;
    const summary = purposeOf(file);
    const purpose = summary ? this.block(node, undefined, summary, false) : null;
    purpose?.element.classList.add("local-reading-purpose");
    if (purpose) card.querySelector(".node-path")?.after(purpose.element);
    const symbols = new Map<string, ReadingBlock>();
    const controls = new Map<string | undefined, HTMLButtonElement>();
    const overflow = this.block(node, undefined, "", false).more;
    if (overflow) {
      overflow.classList.add("local-reading-file-full");
      card.querySelector(".node-path")?.after(overflow);
    }
    const model = { card, node, purpose, overflow, symbols, controls };
    this.cards.set(node.id, model);

    const book = this.readingButton(node);
    card.querySelector(".local-card-actions")?.prepend(book);
    controls.set(undefined, book);
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
      if (!text && !references.length && !hasMore) continue;
      const block = this.block(node, name, text, hasMore);
      if (references.length) {
        const facts = document.createElement("div");
        facts.className = "local-reading-types";
        for (const reference of references) {
          const line = document.createElement("div"), label = document.createElement("span");
          label.className = "local-reading-role";
          label.textContent = reference.role;
          const names = document.createElement("span");
          names.innerHTML = reference.html;
          line.append(label, names);
          facts.append(line);
        }
        block.element.prepend(facts);
      }
      block.element.dataset.symbol = name;
      row.append(block.element);
      symbols.set(name, block);
      const action = this.readingButton(node, name);
      row.querySelector(".local-symbol-pin")?.before(action);
      controls.set(name, action);
    }

    const counts = document.createElement("div");
    counts.className = "local-reading-counts";
    for (const [count, label] of [[file.outbound.length, "Uses"], [file.inbound.length, "Referenced by"]] as const) {
      const item = document.createElement("span");
      item.textContent = `${label} ${count} ${count === 1 ? "file" : "files"}`;
      counts.append(item);
    }
    card.append(counts);
    this.updateCard(model);
  }

  /** Change only disclosure, leaving DOM identities and row order for the layout to preserve. */
  updatePresentation(target: ReadingTarget | null = this.previewTarget, visible = this.visible): void {
    this.previewTarget = target;
    this.visible = visible;
    for (const card of this.cards.values()) this.updateCard(card);
  }

  /** Already-open pinned text needs no geometry work when the pointer merely reads another row. */
  needsLayout(target: ReadingTarget | null): boolean {
    for (const model of this.cards.values()) {
      const wants = (symbol?: string): boolean => this.visible && (this.held(model.node.id, symbol)
        || sameTarget(target, { nodeId: model.node.id, ...(symbol ? { symbol } : {}) }));
      if (model.purpose && model.purpose.element.hidden === wants()) return true;
      for (const [name, block] of model.symbols) if (block.element.hidden === wants(name)) return true;
    }
    return false;
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
        block.more.hidden = block.element.hidden || !(block.hasMore || block.prose.scrollHeight > block.prose.clientHeight + 1);
      }
      // A file with many individually short descriptions can still exceed a phone's reading frame. Keep its plain
      // full reader reachable near the top, without shrinking text or installing a scrollbar inside the card.
      if (purpose && !purpose.element.hidden && card.scrollHeight > available) purpose.more.hidden = false;
      if (overflow && (!purpose || purpose.element.hidden) && card.classList.contains("local-reading-card") && card.scrollHeight > available) overflow.hidden = false;
    }
  }

  /** A deliberate preview keeps existing pinned/explicit text and adds only the one temporary target. */
  private updateCard(model: ReadingCard): void {
    const open = (symbol?: string): boolean => this.visible && (
      this.held(model.node.id, symbol) || sameTarget(this.previewTarget, { nodeId: model.node.id, ...(symbol ? { symbol } : {}) })
    );
    if (model.purpose) model.purpose.element.hidden = !open();
    for (const [name, block] of model.symbols) block.element.hidden = !open(name);
    const reading = this.visible && (this.held(model.node.id)
      || [...model.symbols].some(([, block]) => !block.element.hidden));
    const deliberate = this.visible && (this.held(model.node.id) || [...model.symbols.keys()].some(name => this.held(model.node.id, name)));
    model.card.classList.toggle("local-reading-card", deliberate);
    model.card.classList.toggle("local-reading-preview", reading && !deliberate);
    for (const [symbol, button] of model.controls) {
      const held = symbol === undefined
        ? this.held(model.node.id) && [...model.symbols.keys()].every(name => this.held(model.node.id, name))
        : this.held(model.node.id, symbol);
      const expanded = symbol === undefined ? !!model.purpose && !model.purpose.element.hidden
        || [...model.symbols.values()].some(block => !block.element.hidden) : !model.symbols.get(symbol)?.element.hidden;
      button.setAttribute("aria-pressed", String(held));
      button.setAttribute("aria-expanded", String(expanded));
      button.setAttribute("aria-label", `${held ? "Fold" : "Read"} ${symbol ?? model.node.name}${symbol ? ` in ${model.node.name}` : ""}`);
      button.title = symbol ? `${held ? "Fold" : "Keep open"} this explanation; connections stay pinned independently`
        : `${held ? "Fold" : "Read"} all descriptions in this card; connections stay pinned independently`;
    }
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
      const all = symbol === undefined
        ? this.held(node.id) && [...this.cards.get(node.id)!.symbols.keys()].every(name => this.held(node.id, name))
        : this.held(node.id, symbol);
      this.dismissed = all ? { nodeId: node.id, ...(symbol ? { symbol } : {}) } : null;
      this.options.change(node.id, symbol, !all);
    });
    return button;
  }

  private block(node: ExplorerNodePayload, symbol: string | undefined, text: string, hasMore: boolean): ReadingBlock {
    const element = document.createElement("div"), prose = document.createElement("div"), more = document.createElement("button");
    element.className = "local-reading-block";
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

  private targetOf(element: EventTarget | null): ReadingTarget | null {
    if (!(element instanceof Element)) return null;
    const card = element.closest<HTMLElement>(".node-card"), id = card?.dataset.id;
    const model = id ? this.cards.get(id) : undefined;
    if (!model || !this.visible) return null;
    const row = element.closest<HTMLElement>(".symbol-row");
    if (row) return row.dataset.symbol && model.symbols.has(row.dataset.symbol) ? { nodeId: id!, symbol: row.dataset.symbol } : null;
    if (element.closest(".node-symbols") || !model.purpose) return null;
    return { nodeId: id! };
  }

  private request(target: ReadingTarget | null, immediate = false): void {
    if (!this.options.canPreview()) return;
    if (sameTarget(target, this.candidate)) return;
    window.clearTimeout(this.intentTimer);
    this.candidate = target;
    if (!sameTarget(target, this.dismissed)) this.dismissed = null;
    if (sameTarget(target, this.dismissed) && target) return;
    const show = (): void => {
      if (!sameTarget(target, this.candidate) || sameTarget(target, this.previewTarget)) return;
      this.options.preview(target);
    };
    if (immediate) show();
    else this.intentTimer = window.setTimeout(show, target ? 70 : 100);
  }

  private readonly pointerMove = (event: PointerEvent): void => {
    if (event.pointerType === "touch" || event.buttons) return;
    if (this.lastPointer && this.lastPointer.x === event.clientX && this.lastPointer.y === event.clientY) return;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.keyboard = false;
    this.request(this.targetOf(event.target));
  };
  private readonly pointerLeave = (): void => { if (!this.keyboard) this.request(null, true); };
  private readonly focusIn = (event: FocusEvent): void => {
    if (!(event.target instanceof Element) || !event.target.matches(":focus-visible")) return;
    this.keyboard = true;
    this.request(this.targetOf(event.target), true);
  };
  private readonly focusOut = (event: FocusEvent): void => {
    if (this.keyboard && !(event.relatedTarget instanceof Node && this.container.contains(event.relatedTarget))) this.request(null, true);
  };
  private readonly keyDown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.key !== "Escape" || !this.previewTarget || !this.options.canDismiss() || document.querySelector(":popover-open")) return;
    event.preventDefault();
    this.dismissed = this.previewTarget;
    window.clearTimeout(this.intentTimer);
    this.candidate = null;
    this.options.preview(null);
  };
}

/** Empty generated placeholders are not a file description. The complete authored text remains in the reader. */
function purposeOf(file: GraphFile): string {
  const purpose = authoredSections(file.authored).find(section => section.heading?.toLowerCase() === "purpose");
  const text = purpose?.markdown.replace(/^###[^\n]*\n?/u, "").trim() ?? "";
  return /^_?Pending(?: authored purpose)?_?\.?$/iu.test(text) ? "" : text;
}

/**
 * Build Local Map cards and symbol sections from their presentation values and named actions.
 *
 * The controller owns navigation and live state; this module owns the card DOM,
 * accessible controls, and their event wiring. The branch stage keeps wrappers
 * across renders while replacing each card from current presentation values.
 *
 * @module card-factory
 */

import { compareSymbolNames, type ClosedDirectory } from "./branches";
import { parentDirectory } from "./directory-bands";
import type { ColumnRole } from "./types";
import { countOf } from "./word-seams";
import type { ExplorerNodePayload, ExplorerPublicSymbol, ExplorerTypeReference } from "../../../shared/types";
import { setSeamedText } from "../../dom";
import type { SymbolOrder } from "../../types";

/** The values a fresh card reads while it is built. The wrapper may survive a render, but its card is rebuilt. */
export interface CardPresentation {
  subject: boolean;
  retained: boolean;
  filePinned: boolean;
  expanded: boolean;
  showTests: boolean;
  symbolOrder: SymbolOrder;
  testBacking: readonly ExplorerNodePayload[];
  /** Pressed state is read at construction; a press itself goes through the live action below. */
  isPinned(symbol: string): boolean;
  isDirectlyPinned(symbol: string): boolean;
}

/** Only the facts and actions a card needs; navigation targets are looked up when their event occurs. */
export interface CardContext {
  presentation(node: ExplorerNodePayload): CardPresentation;
  registerAnchor(nodeId: string, role: ColumnRole, key: string, element: HTMLElement): void;
  closeNode(nodeId: string): void;
  /** The pressed file Pin pressed again: its pins go, the subject and the card stay. */
  unpinNode(nodeId: string): void;
  openDirectory(directory: string): void;
  inspectDirectory(directory: string): void | Promise<void>;
  recenterNode(node: ExplorerNodePayload): void | Promise<void>;
  togglePinnedSymbol(nodeId: string, symbol: string): void;
  inspectNode(node: ExplorerNodePayload, symbol?: string): void | Promise<void>;
  /** A name's own action: open or fold the description it names; a card with nothing to open inspects instead. */
  readNode(node: ExplorerNodePayload, symbol?: string): void | Promise<void>;
  showNodeActions(node: ExplorerNodePayload, symbol: string | undefined, anchor: { x: number; y: number }): void | Promise<void>;
  showDirectoryActions(directory: string, anchor: { x: number; y: number }): void | Promise<void>;
  highlightSymbolConnections(nodeId: string, symbol: string): void;
  clearSymbolHighlight(): void;
  focusTypeTarget(targetId: string): void | Promise<void>;
  /** The reading surface receives canonical documentation separately from the graph's render projection. */
  attachReading?(card: HTMLElement, node: ExplorerNodePayload): void;
}

/**
 * The registry's name for a card's node-level hubs, `inbound:#hub` and `outbound:#hub`, by which the overview band's
 * gathered wires find them (2026-11-06); no symbol is named so.
 */
export const NODE_HUB = "#hub";

const actionAnchor = (element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.bottom };
};

/**
 * Creates a node card element for the Local Map view.
 *
 * @param context - The card's presentation inputs and live actions
 * @param node - The node data to render
 * @param columnRole - The role of the column this card belongs to
 * @returns The created card element
 */
export function createNodeCard(
  context: CardContext,
  node: ExplorerNodePayload,
  columnRole: ColumnRole
): HTMLElement {
  const card = document.createElement("div");
  card.className = "node-card";
  card.dataset.id = node.id;
  card.dataset.columnRole = columnRole;
  card.title = node.codeRelativePath;
  card.tabIndex = -1;
  card.setAttribute("role", "group");
  card.setAttribute("aria-label", node.codeRelativePath);

  const presentation = context.presentation(node);

  if (presentation.subject) {
    card.classList.add("selected", "local-focus");
  }
  // A whole-file pin, which the card itself says at the overview band, where its rows are silent (2026-11-06).
  card.classList.toggle("file-pinned", presentation.filePinned);

  const registerAnchor = (key: string, element: HTMLElement) => context.registerAnchor(node.id, columnRole, key, element);

  registerAnchor("card", card);

  const isAsset = (node.archetype || "").toLowerCase() === "asset";

  // For assets: add node-wide inbound AND outbound hubs since they don't have symbol rows
  if (isAsset) {
    const inboundHub = document.createElement("div");
    inboundHub.className = "symbol-anchor hub inbound";
    card.appendChild(inboundHub);
    registerAnchor("inbound:*", inboundHub);
    registerAnchor(`inbound:${NODE_HUB}`, inboundHub);

    const outboundHub = document.createElement("div");
    outboundHub.className = "symbol-anchor hub outbound";
    card.appendChild(outboundHub);
    registerAnchor("outbound:*", outboundHub);
    registerAnchor(`outbound:${NODE_HUB}`, outboundHub);
  }

  // For center and upstream columns: add outbound hub for file-level connections
  // - Center: for connections to dependents when symbol resolution isn't available
  // - Upstream (dependencies): for file-level dependency edges (e.g., require_relative)
  // This ensures connections anchor at the card edge, not the card center.
  if ((columnRole === "center" || columnRole === "upstream") && !isAsset) {
    const outboundHub = document.createElement("div");
    outboundHub.className = "symbol-anchor hub outbound" + (columnRole === "center" ? " center-hub" : "");
    card.appendChild(outboundHub);
    registerAnchor("outbound:*", outboundHub);
    registerAnchor(`outbound:${NODE_HUB}`, outboundHub);
  }
  // The other side's node-level hub, where the overview band's gathered wires arrive (2026-11-06): the same part at the
  // card's left edge, at the existing hub's height. A file-level wire at the closer bands still arrives at Internals'
  // dot (`inbound:*`, below), so this hub has a key of its own, and a class that says so to a reader of the page, such
  // as the layout lab's capture, which reads every other hub as its side's `*` pin.
  if (!isAsset) {
    const inboundHub = document.createElement("div");
    inboundHub.className = "symbol-anchor hub inbound overview-hub";
    card.appendChild(inboundHub);
    registerAnchor(`inbound:${NODE_HUB}`, inboundHub);
  }

  const header = document.createElement("div");
  header.className = "node-title";
  // The file's name opens its descriptions and folds them again; the evidence reader is behind More (2026-11-05).
  const name = document.createElement("button");
  name.type = "button";
  name.className = "local-file-name";
  // The text in a span of its own: the ladder scales the text, never the button's full-width box (2026-11-06).
  const nameText = document.createElement("span");
  nameText.className = "local-file-name-text";
  setSeamedText(nameText, node.name);
  // From the middle band out the card ladder draws the name held at its reading size and wrapped at its seams into the
  // room the header's departed lines leave (the far-zoom review, 2026-11-06). That drawing is generated content, the
  // lines the card reading chooses from this name for each band and step, so that the text in the layout, which keeps
  // the header's height in every band, stays the name's one copy for the page's text and its readers; the button's
  // label names the file for assistive technology. From the middle band out the page's find does not meet the name:
  // the layout's copy is hidden there, and find does not search generated content.
  const held = document.createElement("span");
  held.className = "local-file-name-held";
  held.setAttribute("aria-hidden", "true");
  held.dataset.name = node.name;
  // The room the node's controls take on the header's last line, the button's last inline box: on the name's last line
  // where it fits there, on a line of its own where it does not (the header round, 2026-11-08; local.css).
  const controlsRoom = document.createElement("span");
  controlsRoom.className = "local-file-name-room";
  controlsRoom.setAttribute("aria-hidden", "true");
  name.append(nameText, controlsRoom, held);
  name.setAttribute("aria-label", node.codeRelativePath);
  name.addEventListener("click", event => { event.stopPropagation(); void context.readNode(node); });
  header.append(name);
  card.appendChild(header);
  // The node's controls follow the name in its header, and in its focus order.
  const actions = document.createElement("div");
  actions.className = "local-card-actions";
  const filePin = document.createElement("button");
  filePin.type = "button";
  filePin.className = "local-file-pin";
  filePin.setAttribute("aria-label", `${presentation.filePinned ? "Unpin" : "Pin"} ${node.name}`);
  filePin.setAttribute("aria-pressed", String(presentation.filePinned));
  filePin.title = presentation.filePinned ? "Unpin this file" : "Pin this file and its connections";
  filePin.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6ZM12 14v7"/></svg>';
  filePin.addEventListener("click", event => {
    event.stopPropagation();
    if (presentation.filePinned) context.unpinNode(node.id);
    else context.togglePinnedSymbol(node.id, "*");
  });
  actions.append(filePin);

  const more = document.createElement("button");
  more.type = "button";
  more.className = "local-file-more";
  more.setAttribute("aria-label", `More actions for ${node.name}`);
  more.setAttribute("aria-haspopup", "menu");
  more.title = `More actions for ${node.name}`;
  more.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
  more.addEventListener("click", event => { event.stopPropagation(); void context.showNodeActions(node, undefined, actionAnchor(more)); });
  actions.append(more);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "local-file-close";
  close.title = "Close this expansion; keep symbols needed by other pins";
  close.setAttribute("aria-label", `Close ${node.name}`);
  close.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  close.addEventListener("click", event => { event.stopPropagation(); context.closeNode(node.id); });
  const { retained, subject } = presentation;
  // Every card but the subject's can be made the subject: the one visible way to go there, since a double-click
  // reached the card's click twice first (the owner's challenge, 2026-10-14; one grammar for every input, 2026-10-15).
  if (!subject) {
    const recentre = document.createElement("button");
    recentre.className = "local-file-recentre";
    recentre.title = "Make this file the subject: the map draws its neighbourhood around it";
    recentre.setAttribute("aria-label", `Centre on ${node.name}`);
    recentre.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/></svg>';
    recentre.addEventListener("click", event => { event.stopPropagation(); void context.recenterNode(node); });
    actions.append(recentre);
  }
  if (retained || subject || presentation.expanded) actions.append(close);
  header.append(actions);

  const pathElement = document.createElement("div");
  pathElement.className = "node-path";
  setSeamedText(pathElement, node.codeRelativePath);
  card.appendChild(pathElement);

  card.appendChild(createSymbolSection(context, presentation, node, columnRole));

  if ((node.archetype || "").toLowerCase() !== "test" && presentation.showTests) {
    const backing = presentation.testBacking;
    if (backing && backing.length > 0) {
      card.classList.add("test-backed");
      card.dataset.testCount = String(backing.length);
      const coverage = document.createElement("div");
      coverage.className = "node-tests";
      const label = document.createElement("span");
      label.className = "node-tests__label";
      label.textContent = backing.length === 1 ? "Test" : "Tests";
      coverage.appendChild(label);
      backing.slice(0, 3).forEach(testNode => {
        const tag = document.createElement("span");
        tag.className = "node-tests__item";
        tag.textContent = testNode.name;
        coverage.appendChild(tag);
      });
      if (backing.length > 3) {
        const remainder = document.createElement("span");
        remainder.className = "node-tests__more";
        remainder.textContent = `+${backing.length - 3}`;
        coverage.appendChild(remainder);
      }
      const coverageTitle = backing.map(test => test.codeRelativePath).join("\n");
      card.title = `${card.title}\nTest coverage:\n${coverageTitle}`;
      card.appendChild(coverage);
    }
  }

  const directory = document.createElement("div");
  directory.className = "node-directory";
  directory.textContent = parentDirectory(node.id) || "(root)";
  card.appendChild(directory);

  // A press on the card's body is not an action of its own; it must not reach the map behind it either.
  card.addEventListener("click", event => event.stopPropagation());

  card.addEventListener("keydown", event => {
    if (event.target === card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault(); void context.readNode(node);
    }
  });

  context.attachReading?.(card, node);
  return card;
}

/**
 * A closed directory's box: a pseudo-node with no symbols in the membrane's
 * style, named and counted, that can be inspected or explicitly opened.
 * It carries no pin: a directory with a party file
 * under it is at least encasing, so no wire ever reaches a closed box.
 */
export function createClosedDirectory(context: CardContext, closed: ClosedDirectory): HTMLElement {
  const box = document.createElement("div");
  box.className = "local-directory-closed";
  box.dataset.directory = closed.path;
  box.title = closed.path;
  const name = document.createElement("button");
  name.type = "button";
  name.className = "local-directory-closed__name";
  setSeamedText(name, closed.name);
  name.setAttribute("aria-label", `Inspect ${closed.path}`);
  name.addEventListener("click", event => { event.stopPropagation(); void context.inspectDirectory(closed.path); });
  const count = document.createElement("div");
  count.className = "local-directory-closed__count";
  count.textContent = countsOf(closed.files, closed.directories);
  const open = document.createElement("button");
  open.type = "button";
  open.className = "local-directory-open";
  open.textContent = "Open";
  open.setAttribute("aria-label", `Open ${closed.path}`);
  open.title = "Show the files and subdirectories inside";
  open.addEventListener("click", event => { event.stopPropagation(); context.openDirectory(closed.path); });
  const more = document.createElement("button");
  more.type = "button";
  more.className = "local-directory-actions";
  more.setAttribute("aria-label", `More actions for ${closed.path}`);
  more.setAttribute("aria-haspopup", "menu");
  more.title = `More actions for ${closed.path}`;
  more.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
  more.addEventListener("click", event => { event.stopPropagation(); void context.showDirectoryActions(closed.path, actionAnchor(more)); });
  box.append(name, count, open, more);
  box.addEventListener("click", event => { event.stopPropagation(); void context.inspectDirectory(closed.path); });
  return box;
}

/** "3 files, 2 directories", either part left out at zero; "empty" when both are. */
export function countsOf(files: number, directories: number): string {
  const parts: string[] = [];
  if (files) parts.push(countOf(files, "file"));
  if (directories) parts.push(countOf(directories, "directory", "directories"));
  return parts.length ? parts.join(", ") : "empty";
}

/**
 * Creates the symbol section for a node card, including all public symbols
 * and the "Internals" pseudo-symbol.
 *
 * @param context - The card's presentation inputs and live actions
 * @param presentation - The card's values captured for this render
 * @param node - The node data
 * @param columnRole - The role of the column
 * @returns The symbol section element
 */
function createSymbolSection(
  context: CardContext,
  presentation: CardPresentation,
  node: ExplorerNodePayload,
  columnRole: ColumnRole
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "node-symbols";

  const registerAnchor = (key: string, element: HTMLElement) => context.registerAnchor(node.id, columnRole, key, element);

  const hasPublicSymbols = node.publicSymbols && node.publicSymbols.length > 0;

  if (!hasPublicSymbols) {
    const empty = document.createElement("div");
    empty.className = "node-meta";
    empty.textContent = "No public symbols";
    wrapper.appendChild(empty);
    // Fall through to add the Internals row as the fallback anchor
  }

  const grid = document.createElement("div");
  grid.className = "symbol-grid";

  // Build a map from symbol name to extended info (if available)
  const extendedByName = new Map<string, ExplorerPublicSymbol>();
  if (node.publicSymbolsExtended) {
    for (const ext of node.publicSymbolsExtended) {
      extendedByName.set(ext.name, ext);
    }
  }

  // Alphabetical order holds wherever a card is drawn; the layout order is applied by the branch renderer where there is a layout.
  const symbols = presentation.symbolOrder === "alphabetical" ? [...node.publicSymbols].sort(compareSymbolNames) : node.publicSymbols;
  symbols.forEach(symbol => {
    const extended = extendedByName.get(symbol);
    const typeRefs = extended?.typeReferences;
    const hasTypeRefs = typeRefs && typeRefs.length > 0;

    // Wrapper element for hover targeting (uses display: contents to preserve grid layout)
    const symbolRow = document.createElement("div");
    symbolRow.className = "symbol-row";
    symbolRow.dataset.nodeId = node.id;
    symbolRow.dataset.symbol = symbol;
    symbolRow.classList.toggle("symbol-pinned", presentation.isPinned(symbol));
    // A symbol pinned by name, not through its file's whole pin: only such a row stays drawn at the overview band
    // (2026-11-06; a whole-file pin is a pin of the file, which its card says there).
    symbolRow.classList.toggle("symbol-pinned-named", presentation.isDirectlyPinned(symbol));

    // Add hover handlers for connection highlighting
    symbolRow.addEventListener("mouseenter", () => {
      context.highlightSymbolConnections(node.id, symbol);
    });
    symbolRow.addEventListener("mouseleave", () => {
      context.clearSymbolHighlight();
    });
    // A row names its symbol; a tap on it opens or folds that symbol's description. Pinning is the adjacent explicit action.
    symbolRow.addEventListener("click", (event) => {
      event.stopPropagation();
      void context.readNode(node, symbol);
    });
    const inboundAnchor = document.createElement("div");
    inboundAnchor.className = "symbol-anchor dot inbound";
    inboundAnchor.dataset.symbol = symbol;
    symbolRow.appendChild(inboundAnchor);
    registerAnchor(`inbound:${symbol}`, inboundAnchor);

    const labelWrapper = document.createElement("div");
    labelWrapper.className = "symbol-label-wrapper";

    const label = document.createElement("button");
    label.type = "button";
    label.className = "symbol-label";
    const labelText = document.createElement("span");
    labelText.className = "symbol-label-text";
    setSeamedText(labelText, symbol);
    label.append(labelText);
    label.setAttribute("aria-label", `${symbol} in ${node.name}`);
    label.addEventListener("click", event => { event.stopPropagation(); void context.readNode(node, symbol); });
    labelWrapper.appendChild(label);

    // Add type reference indicator if present
    if (hasTypeRefs) {
      const typeIndicator = createTypeReferenceIndicator(context, typeRefs);
      labelWrapper.appendChild(typeIndicator);
    }

    appendSymbolActions(context, presentation, node, symbol, labelWrapper);

    symbolRow.appendChild(labelWrapper);

    const outboundAnchor = document.createElement("div");
    outboundAnchor.className = "symbol-anchor dot outbound";
    outboundAnchor.dataset.symbol = symbol;
    symbolRow.appendChild(outboundAnchor);
    registerAnchor(`outbound:${symbol}`, outboundAnchor);

    grid.appendChild(symbolRow);
  });

  // Add the "Internals" pseudo-symbol at the end — represents private implementation
  // This row only has an inbound anchor (data flows IN but doesn't flow OUT to other files)
  // Skip for assets — they use the node-wide inbound hub instead (no internal logic to represent)
  const isAsset = (node.archetype || "").toLowerCase() === "asset";
  if (!isAsset) {
    // Wrapper element for hover targeting (uses display: contents to preserve grid layout)
    const internalsRow = document.createElement("div");
    internalsRow.className = "symbol-row internals-row";
    internalsRow.dataset.nodeId = node.id;
    internalsRow.dataset.symbol = "__internals__";
    internalsRow.classList.toggle("symbol-pinned", presentation.isPinned("__internals__"));
    internalsRow.classList.toggle("symbol-pinned-named", presentation.isDirectlyPinned("__internals__"));

    // Add hover handlers for connection highlighting
    internalsRow.addEventListener("mouseenter", () => {
      context.highlightSymbolConnections(node.id, "__internals__");
    });
    internalsRow.addEventListener("mouseleave", () => {
      context.clearSymbolHighlight();
    });
    // Internals is inspectable like a public row, with a separate pin action.
    internalsRow.addEventListener("click", (event) => {
      event.stopPropagation();
      void context.inspectNode(node, "__internals__");
    });
    const internalsInbound = document.createElement("div");
    internalsInbound.className = "symbol-anchor dot inbound internals-anchor";
    internalsInbound.dataset.symbol = "__internals__";
    internalsRow.appendChild(internalsInbound);
    registerAnchor("inbound:__internals__", internalsInbound);
    registerAnchor("inbound:*", internalsInbound);

    const internalsLabel = document.createElement("div");
    internalsLabel.className = "symbol-label-wrapper internals-label";
    const internalsName = document.createElement("button");
    internalsName.type = "button";
    internalsName.className = "symbol-label internals-text";
    const internalsText = document.createElement("span");
    internalsText.className = "symbol-label-text";
    internalsText.textContent = "Internals";
    internalsName.append(internalsText);
    internalsName.setAttribute("aria-label", `Inspect Internals in ${node.name}`);
    internalsName.addEventListener("click", event => { event.stopPropagation(); void context.inspectNode(node, "__internals__"); });
    internalsLabel.append(internalsName);
    internalsLabel.title = "Internal/private implementation — data flows in but isn't exposed as public symbols";
    appendSymbolActions(context, presentation, node, "__internals__", internalsLabel);
    internalsRow.appendChild(internalsLabel);

    // Empty placeholder for the outbound column (internals don't have outbound connections)
    const internalsOutboundPlaceholder = document.createElement("div");
    internalsOutboundPlaceholder.className = "symbol-anchor-placeholder";
    internalsRow.appendChild(internalsOutboundPlaceholder);

    grid.appendChild(internalsRow);
  }

  wrapper.appendChild(grid);
  return wrapper;
}

/** Visible Pin and More controls beside one symbol, independent of its inspection target. */
function appendSymbolActions(context: CardContext, presentation: CardPresentation, node: ExplorerNodePayload, symbol: string, wrapper: HTMLElement): void {
  const pinned = presentation.isDirectlyPinned(symbol);
  const pin = document.createElement("button");
  pin.type = "button";
  pin.className = "local-symbol-pin";
  pin.setAttribute("aria-pressed", String(pinned));
  const action = pinned ? "Unpin" : presentation.filePinned ? "Pin only" : "Pin";
  pin.setAttribute("aria-label", `${action} ${symbol === "__internals__" ? "Internals" : symbol} in ${node.name}`);
  pin.title = pinned ? "Release this symbol pin" : presentation.filePinned ? "Narrow the whole-file pin to this symbol" : "Pin this symbol's connections";
  pin.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6ZM12 14v7"/></svg>';
  pin.addEventListener("click", event => { event.stopPropagation(); context.togglePinnedSymbol(node.id, symbol); });
  wrapper.append(pin);

  const more = document.createElement("button");
  more.type = "button";
  more.className = "local-symbol-more";
  more.setAttribute("aria-label", `More actions for ${symbol === "__internals__" ? "Internals" : symbol} in ${node.name}`);
  more.setAttribute("aria-haspopup", "menu");
  more.title = more.getAttribute("aria-label") ?? "More actions";
  more.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
  more.addEventListener("click", event => { event.stopPropagation(); void context.showNodeActions(node, symbol, actionAnchor(more)); });
  wrapper.append(more);
}

/**
 * Creates a type reference indicator element showing what types a symbol references.
 *
 * @param context - The card's live actions
 * @param typeRefs - The type references to display
 * @returns The indicator element
 */
function createTypeReferenceIndicator(
  context: CardContext,
  typeRefs: ExplorerTypeReference[]
): HTMLElement {
  const indicator = document.createElement("div");
  indicator.className = "type-refs-indicator";

  // Group by role
  const returnRefs = typeRefs.filter(r => r.role === "return");
  const paramRefs = typeRefs.filter(r => r.role === "parameter");
  const extendsRefs = typeRefs.filter(r => r.role === "extends");
  const implementsRefs = typeRefs.filter(r => r.role === "implements");

  const badges: HTMLElement[] = [];

  if (returnRefs.length > 0) {
    const badge = createTypeBadge(context, returnRefs, "→", "return");
    badges.push(badge);
  }

  if (paramRefs.length > 0) {
    const badge = createTypeBadge(context, paramRefs, "←", "param");
    badges.push(badge);
  }

  if (extendsRefs.length > 0) {
    const badge = createTypeBadge(context, extendsRefs, "⊲", "extends");
    badges.push(badge);
  }

  if (implementsRefs.length > 0) {
    const badge = createTypeBadge(context, implementsRefs, "◇", "implements");
    badges.push(badge);
  }

  for (const badge of badges) {
    indicator.appendChild(badge);
  }

  return indicator;
}

/**
 * Creates a single type badge element for a group of type references.
 *
 * @param context - The card's live actions
 * @param refs - The type references for this badge
 * @param icon - The icon to display
 * @param kind - The kind of reference (return, param, extends, implements)
 * @returns The badge element
 */
function createTypeBadge(
  context: CardContext,
  refs: ExplorerTypeReference[],
  icon: string,
  kind: string
): HTMLElement {
  const firstResolved = refs.find(r => r.isResolved && r.targetId);
  const badge = document.createElement(firstResolved ? "button" : "span");
  badge.className = `type-badge type-badge-${kind}`;
  if (firstResolved) {
    badge.classList.add("type-badge-resolved");
  }

  const typeNames = refs.map(r => r.typeName).join(", ");
  badge.title = `${kind}: ${typeNames}`;
  badge.textContent = icon;

  // Only the badge inspects the referenced file. It never pins its source row.
  if (firstResolved?.targetId) {
    const targetId = firstResolved.targetId;
    badge.classList.add("clickable");
    badge.dataset.targetId = targetId;
    badge.setAttribute("aria-label", `Inspect ${firstResolved.typeName}`);
    if (badge instanceof HTMLButtonElement) badge.type = "button";
    badge.addEventListener("click", event => { event.stopPropagation(); void context.focusTypeTarget(targetId); });
  }

  return badge;
}

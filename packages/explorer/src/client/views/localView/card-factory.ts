/**
 * Build Local Map cards and symbol sections from their presentation values and named actions.
 *
 * The controller owns navigation and live state; this module owns the card DOM,
 * accessible controls, and their event wiring. The branch stage keeps wrappers
 * across renders while replacing each card from current presentation values.
 *
 * @module card-factory
 */

import type { ExplorerNodePayload, ExplorerPublicSymbol, ExplorerTypeReference } from "../../../shared/types";
import { setSeamedText } from "../../dom";
import { MASK_FADE, MASK_KEEP } from "../../palette";
import type { ClosedCellColour, ClosedDirectoryLook, ClosedDirectoryShape, SymbolOrder } from "../../types";
import { spatialKindOf } from "../forceGraphAppearance";
import { compareSymbolNames, type ClosedDirectory, type HiddenContents } from "./branches";
import { cellField, CELLS, fieldBands, lineMarks, SHAPE_CORNER, stackEdges, tabOutline, type Cell, type CellField, type ClosedContents, type Rect, type Skin } from "./closed-looks";
import { parentDirectory } from "./directory-bands";
import { chevronMarkup, HANDLE_LINE } from "./directory-handle";
import { READS_ATTRIBUTE } from "./reading-direction";
import type { ColumnRole } from "./types";
import { NODE_HUB } from "./wire-gathering";
import { countOf } from "./word-seams";

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

/** A card can close its own retention, subject or locally expanded symbol list. */
export function hasCloseAction(presentation: Pick<CardPresentation, "retained" | "subject" | "expanded">): boolean {
  return presentation.retained || presentation.subject || presentation.expanded;
}

/** Only the facts and actions a card needs; navigation targets are looked up when their event occurs. */
export interface CardContext {
  presentation(node: ExplorerNodePayload): CardPresentation;
  registerAnchor(nodeId: string, role: ColumnRole, key: string, element: HTMLElement): void;
  closeNode(nodeId: string): void;
  /** The pressed file Pin pressed again: its pins go, the subject and the card stay. */
  unpinNode(nodeId: string): void;
  openDirectory(directory: string): void;
  recenterNode(node: ExplorerNodePayload): void | Promise<void>;
  togglePinnedSymbol(nodeId: string, symbol: string): void;
  inspectNode(node: ExplorerNodePayload, symbol?: string): void | Promise<void>;
  /** A name's own action: open or fold the description it names; a card with nothing to open inspects instead. */
  readNode(node: ExplorerNodePayload, symbol?: string): void | Promise<void>;
  showNodeActions(node: ExplorerNodePayload, symbol: string | undefined, anchor: { x: number; y: number }): void | Promise<void>;
  showDirectoryActions(directory: string, anchor: { x: number; y: number }): void | Promise<void>;
  /** How a closed directory's box is drawn: its look and, for the skin with cells, its shape and its cells' colour; the defaults when not given. */
  closedStyle?(): ClosedStyle;
  highlightSymbolConnections(nodeId: string, symbol: string): void;
  clearSymbolHighlight(): void;
  focusTypeTarget(targetId: string): void | Promise<void>;
  /** The reading surface receives canonical documentation separately from the graph's render projection. */
  attachReading?(card: HTMLElement, node: ExplorerNodePayload): void;
}

/** How a closed directory's box is drawn: Tuning's three choices for it. */
export interface ClosedStyle {
  look: ClosedDirectoryLook;
  shape: ClosedDirectoryShape;
  cells: ClosedCellColour;
}

/** The Pin glyph, a pushpin, in a 24-unit box: the card's Pin, a row's Pin and the card's reveal of its connections outside the view. */
export const PIN_GLYPH = "M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6ZM12 14v7";

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
  filePin.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PIN_GLYPH}"/></svg>`;
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
  const { subject } = presentation;
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
  if (hasCloseAction(presentation)) actions.append(close);
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
 * style, named and counted. The whole box opens the directory (the owner,
 * 2026-11-15: the far zoom is "the primary place in which a user would
 * _want_ to open a directory node", and a text button drawn at the map's
 * scale was 7 px tall there or not drawn): a click or tap anywhere on it, or
 * Enter or Space. Its name is the handle, a button led by a disclosure
 * chevron pointing right, as a file tree draws a folded directory, which
 * says the act and the directory and takes the keyboard; the evidence reader
 * is behind More, as a file's is. It carries no pin: a directory with a party
 * file under it is at least encasing, so no wire ever reaches a closed box.
 */
export function createClosedDirectory(context: CardContext, closed: ClosedDirectory): HTMLElement {
  const box = document.createElement("div");
  box.className = "local-directory-closed";
  box.dataset.directory = closed.path;
  box.title = `Open ${closed.path}`;
  const name = document.createElement("button");
  name.type = "button";
  name.className = "local-directory-closed__name local-directory-handle local-directory-open";
  name.innerHTML = chevronMarkup(false);
  const text = document.createElement("span");
  text.className = "local-directory-closed__text";
  setSeamedText(text, closed.name);
  name.append(text);
  name.setAttribute("aria-label", `Open ${closed.path}`);
  name.setAttribute("aria-expanded", "false");
  name.title = `Open ${closed.path}: show the files and subdirectories inside`;
  // What it holds is drawn, not written, in the skin with cells: the button's description says it.
  name.setAttribute("aria-description", countsOf(closed.files, closed.directories));
  const count = document.createElement("div");
  count.className = "local-directory-closed__count";
  count.textContent = countsOf(closed.files, closed.directories);
  const more = document.createElement("button");
  more.type = "button";
  more.className = "local-directory-actions";
  more.setAttribute("aria-label", `More actions for ${closed.path}`);
  more.setAttribute("aria-haspopup", "menu");
  more.title = `More actions for ${closed.path}`;
  more.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
  more.addEventListener("click", event => { event.stopPropagation(); void context.showDirectoryActions(closed.path, actionAnchor(more)); });
  // In the far zoom looks the box's name is drawn held at the look's size, on the lines the card reading chooses for it
  // (2026-11-13), as a file card's name is: generated content of an element of its own, hidden from assistive
  // technology, the name's button keeping its label and its place in the focus order. The chevron is held with it, a
  // drawing of its own before the lines, which are indented by it.
  const held = document.createElement("span");
  held.className = "local-directory-closed__held";
  held.setAttribute("aria-hidden", "true");
  held.dataset.name = closed.name;
  held.innerHTML = chevronMarkup(false);
  // The row More had under the count before it joined the name's line (2026-11-15), kept at More's own size so that the
  // box keeps its height: nothing is drawn in it but the Cells look's field.
  const room = document.createElement("span");
  room.className = "local-directory-closed__room";
  room.setAttribute("aria-hidden", "true");
  box.append(name, count, room, more, held);
  // One listener for the box and its handle: the handle's own click, a pointer's or the keyboard's, arrives here too.
  box.addEventListener("click", event => { event.stopPropagation(); context.openDirectory(closed.path); });
  box.addEventListener("keydown", event => {
    if (event.target !== box || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    context.openDirectory(closed.path);
  });
  drawClosedLook(box, closed, context.closedStyle?.() ?? { look: "cells", shape: "tab", cells: "kind" });
  return box;
}

const SVG = "http://www.w3.org/2000/svg";

/** What each skin with cells holds and its shape, kept beside its box so that the far looks' drawing can be made from the card reading's rooms. */
const SKINS = new WeakMap<HTMLElement, { contents: ClosedContents; shape: ClosedDirectoryShape; reading: SVGSVGElement; width: number; height: number }>();

/**
 * Draw a closed directory's tab outline, More shift, and reading-size cells once laid out, skipping work when the box's
 * size has not changed. Called both synchronously after layout measurement (so transition captures never race the
 * initial ResizeObserver delivery, 2026-11-24) and on subsequent resizes.
 */
export function drawClosedSkin(box: HTMLElement): void {
  const skin = SKINS.get(box);
  if (!skin || !box.isConnected) return;
  const width = box.offsetWidth, height = box.offsetHeight;
  if (!width || (width === skin.width && height === skin.height)) return;
  skin.width = width;
  skin.height = height;
  if (skin.shape === "tab") { placeTab(box); drawTabs(box); }
  drawCells(box, skin.reading, skin.contents, skin.shape);
}

/** How far the folder's tab lifts its handle above the box's own padding, so that the name stands in the tab's middle and the body's top edge clear of the cells. */
export const TAB_LIFT = 4;

/**
 * A closed directory's looks: each draws over the box's own layout and never changes its size, its controls or what
 * they do. "stack" shows one to three cards under the box by the files under it. "cells", the default (the owner,
 * 2026-11-15: "Cells is definitely my favorite"), draws a skin holding a cell for each file directly in it and a small
 * skin for each directory inside, around cells of the same size, the count's words kept for assistive technology and
 * the hover text; its shape is the capsule, a card's corners, or a folder's silhouette whose tab rises around the handle
 * at the reading look, and its cells take the colour the 3D map gives a file of their kind, or one grey. The cells and
 * the folder's outline are drawn from the box's measured layout whenever the box's size changes.
 */
function drawClosedLook(box: HTMLElement, closed: ClosedDirectory, style: ClosedStyle): void {
  if (style.look === "box") return;
  box.classList.add(`local-closed--${style.look}`);
  if (style.look === "stack") { box.dataset.edges = String(stackEdges(closed.files)); return; }
  box.classList.add(`local-closed-shape--${style.shape}`, `local-closed-cells--${style.cells}`);
  box.title = `Open ${closed.path}: ${countsOf(closed.files, closed.directories)}`;
  const reading = document.createElementNS(SVG, "svg"), held = document.createElementNS(SVG, "svg");
  reading.classList.add("local-closed-cells");
  held.classList.add("local-closed-cells-held");
  for (const svg of [reading, held]) svg.setAttribute("aria-hidden", "true");
  box.append(reading, held);
  if (style.shape === "tab") {
    // The folder's outline: with its tab for the reading look, and plain for the far looks.
    const outline = document.createElementNS(SVG, "svg");
    outline.classList.add("local-closed-outline");
    outline.setAttribute("aria-hidden", "true");
    outline.innerHTML = TAB_LOOKS.map(look => `<path class="local-closed-outline__look" data-look="${look}"/>`).join("");
    box.prepend(outline);
  }
  const contents: ClosedContents = closed.contents ?? { files: [], subdirectories: [] };
  SKINS.set(box, { contents, shape: style.shape, reading, width: 0, height: 0 });
  observeLayout(box, () => drawClosedSkin(box));
}

/** A folder's two outlines: with its tab, as laid out at the reading look, and plain, for the far looks. */
const TAB_LOOKS = ["reading", "plain"] as const;

/** Call draw once the box is laid out and again whenever its size changes. */
function observeLayout(box: HTMLElement, draw: () => void): void {
  if (typeof ResizeObserver === "undefined") return;
  new ResizeObserver(() => { if (box.isConnected && box.offsetWidth) draw(); }).observe(box);
}

/**
 * The folder's tab at reading size, from the box as laid out: More stands right after the name on the tab, and the tab
 * reaches from the box's left to past More, down to under the name (lifted by {@link TAB_LIFT}). More keeps its place in
 * the layout, at the box's right as in every shape, and is drawn moved to the name (--tab-more-shift), so that the far
 * looks, which move it from its layout box, read the same box whatever the shape. Written on the box in its border
 * box's units: the tab's width and rise.
 */
function placeTab(box: HTMLElement): void {
  const name = box.querySelector<HTMLElement>(".local-directory-closed__name"), text = box.querySelector<HTMLElement>(".local-directory-closed__text");
  const more = box.querySelector<HTMLElement>(".local-directory-actions");
  if (!name || !text || !more) return;
  const style = getComputedStyle(box), border = parseFloat(style.borderLeftWidth) || 0;
  const right = box.clientWidth - parseFloat(style.paddingRight) + 3;
  const moreLeft = Math.min(right - more.offsetWidth, name.offsetLeft + text.offsetLeft + text.offsetWidth + 4);
  box.style.setProperty("--tab-more-shift", `${(moreLeft - more.offsetLeft).toFixed(2)}px`);
  box.dataset.tabReading = (border + moreLeft + more.offsetWidth + 6).toFixed(2);
  box.dataset.tabRise = (border + name.offsetTop - TAB_LIFT + name.offsetHeight + 4).toFixed(2);
}

/**
 * The folder's outlines (2026-11-15). The tab is the reading look's: it rises around the handle as laid out. From the
 * connections look out the held name fills a box by its own measure, so that one box had room for a step beside it
 * and its neighbour had none, a difference of form that meant nothing; there every folder is drawn plain, the same
 * rounded outline without a step (the root's decision). The same outlines clip the skin's light (--tab-clip-<look>).
 */
export function drawTabs(box: HTMLElement): void {
  const outline = box.querySelector<SVGSVGElement>(":scope > .local-closed-outline");
  if (!outline || !box.offsetWidth) return;
  const width = box.offsetWidth, height = box.offsetHeight, rise = Number(box.dataset.tabRise), tab = Number(box.dataset.tabReading);
  if (!Number.isFinite(rise) || !Number.isFinite(tab)) return;
  outline.setAttribute("width", String(width));
  outline.setAttribute("height", String(height));
  outline.setAttribute("viewBox", `0 0 ${width} ${height}`);
  for (const look of TAB_LOOKS) {
    const path = tabOutline(width, height, look === "reading" ? { width: tab, rise } : { width, rise: 0 }, SHAPE_CORNER.tab, 0.5);
    outline.querySelector(`[data-look="${look}"]`)?.setAttribute("d", path);
    box.style.setProperty(`--tab-clip-${look}`, `path("${path}")`);
  }
}

/** The skin's field at reading size: below the name, as wide as the count line, down to the foot of the box's content. */
function drawCells(box: HTMLElement, svg: SVGSVGElement, contents: ClosedContents, shape: ClosedDirectoryShape): void {
  const count = box.querySelector<HTMLElement>(".local-directory-closed__count");
  if (!count) return;
  const left = count.offsetLeft, top = count.offsetTop, width = count.offsetWidth;
  const height = box.clientHeight - parseFloat(getComputedStyle(box).paddingBottom) - top;
  svg.setAttribute("width", width.toFixed(2));
  svg.setAttribute("height", height.toFixed(2));
  svg.setAttribute("viewBox", `0 0 ${width.toFixed(2)} ${height.toFixed(2)}`);
  svg.style.left = `${left}px`;
  svg.style.top = `${top}px`;
  svg.innerHTML = fieldMarkup(cellField(contents, fieldBands({ width, height })), width, height, shape);
}

/**
 * The far looks' drawing of a skin with cells (2026-11-13): the cells are the look's other content beside the name, so
 * they are held at the look's scale as the name is, in the room the held name leaves below it, a row of them, veiled
 * where they end; where not a row fits, the skin alone carries the look. The card reading writes each look's room as
 * data-cells-<look>, "left top width height scale", the width and height in held units.
 */
export function drawHeldLooks(box: HTMLElement): void {
  const skin = SKINS.get(box), svg = box.querySelector<SVGSVGElement>(".local-closed-cells-held");
  if (!skin || !svg) return;
  const groups: string[] = [];
  for (const look of ["connections", "overview"]) {
    const [x, y, width, height, scale] = (box.getAttribute(`data-cells-${look}`) ?? "").split(" ").map(Number);
    if (![x, y, width, height, scale].every(value => Number.isFinite(value))) continue;
    const field = cellField(skin.contents, fieldBands({ width: width, height: height }));
    if (!field.cells.length && !field.skins.length) continue;
    groups.push(`<g class="local-cells-look" data-look="${look}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})">${fieldMarkup(field, width, height, skin.shape)}</g>`);
  }
  svg.innerHTML = groups.join("");
}

let veils = 0;

const escapeText = (text: string): string => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** A small folder's tab among the cells: how far it rises above the body's top edge, and how far its contents stand lower for it. */
const NEST_TAB = { rise: 2.5, drop: 1 } as const;

/**
 * A skin inside, in the outer skin's own shape: a pill, a card's corners in small, or a small folder with its tab. The
 * mask, where the field's end fades it, is a group's around it: a mask is read in the user space of the element that
 * names it, which the path's own move would shift.
 */
function skinPath(skin: Rect, shape: ClosedDirectoryShape, mask: string): string {
  const tab = shape === "tab" ? { width: Math.max(5, Math.min(skin.w * 0.45, 14)), rise: NEST_TAB.rise } : { width: 0, rise: 0 };
  const corner = shape === "round" ? skin.h / 2 : shape === "square" ? 1.5 : 3;
  const path = `<path class="local-cell-skin" transform="translate(${skin.x.toFixed(2)} ${skin.y.toFixed(2)})" d="${tabOutline(skin.w, skin.h, tab, corner)}"/>`;
  return mask ? `<g${mask}>${path}</g>` : path;
}

/**
 * A field's drawing: each directory inside as a skin around its own cells and the skins inside it, which says its
 * name and what it holds on hover; each file's cell, with the fill the 3D map gives its kind written on it (the
 * stylesheet draws one grey over it where that is the choice), which says its file's name on hover, the reader's own
 * word for it and the only words here (the owner, 2026-11-16: "A scan of one's software -- their own words, should do
 * essentially all of the talking"); and the veils. A cell that fades under a veil, or stands for what the room left
 * out, names no file. A skin that holds more than it shows keeps its outline and fades its last cell; the field's own
 * end fades whatever stands there. In the folder's shape a skin's contents stand a unit lower, under its small tab. A
 * handle's marks (`marked`) carry no words in the drawing: their buttons over it say the names, and a title the pointer
 * never reaches is one element more for the browser to style for each mark (2026-11-18).
 */
function fieldMarkup(field: CellField, width: number, height: number, shape: ClosedDirectoryShape, marked = false): string {
  const id = `local-cells-veil-${veils += 1}`;
  const ends = field.veils.filter(veil => veil.of === "field");
  // Two masks: the cells fade under every veil, the skins' outlines only under the field's own end.
  const cellsMask = field.veils.length ? ` mask="url(#${id}-cells)"` : "", skinsMask = ends.length ? ` mask="url(#${id}-skins)"` : "";
  // A handle's line marks each of its own marks by its place among them, the skins first, so that its press can light it.
  const mark = (order: number | undefined): string => (order === undefined ? "" : ` data-mark="${order}"`);
  const circle = (c: Cell, order?: number): string => {
    // The kind's colour is the stylesheet's (local.css), from the palette, so that a palette chosen later re-colours the
    // cell; so is the marble's far tint, mixed there from the two shares the cell carries (2026-11-17).
    const shares = c.marble ? ` style="--offers-share: ${c.marble.offers.toFixed(4)}; --uses-share: ${c.marble.uses.toFixed(4)}"` : "";
    const at = `cx="${c.x.toFixed(2)}" cy="${c.y.toFixed(2)}" r="${c.r}" data-kind="${spatialKindOf(c.kind)}"${shares}${mark(order)}`;
    if (!c.name) return `<circle class="local-cell" ${at}/>`;
    return marked ? `<circle class="local-cell local-cell--named" ${at}/>` : `<circle class="local-cell local-cell--named" ${at}><title>${escapeText(c.name)}</title></circle>`;
  };
  const cells = (list: readonly Cell[], from?: number): string =>
    (list.length ? `<g${cellsMask}>${list.map((c, index) => circle(c, from === undefined ? undefined : from + index)).join("")}</g>` : "");
  const drop = shape === "tab" ? ` transform="translate(0 ${NEST_TAB.drop})"` : "";
  const nest = (skin: Skin, order?: number): string => `<g class="local-cell-nest"${mark(order)}>${marked ? "" : `<title>${escapeText(skin.name)}: ${countsOf(skin.total, skin.directories)}</title>`}`
    + `${skinPath(skin, shape, skinsMask)}<g${drop}>${skin.skins.map(inner => nest(inner)).join("")}${cells(skin.cells)}</g></g>`;
  const parts = `${field.skins.map((skin, index) => nest(skin, marked ? index : undefined)).join("")}${cells(field.cells, marked ? field.skins.length : undefined)}`;
  if (!field.veils.length) return `<g>${parts}</g>`;
  const frame = `maskUnits="userSpaceOnUse" x="-4" y="-4" width="${(width + 8).toFixed(2)}" height="${(height + 8).toFixed(2)}"><rect x="-4" y="-4" width="${(width + 8).toFixed(2)}" height="${(height + 8).toFixed(2)}" fill="${MASK_KEEP}"/>`;
  const gradient = (veil: Rect, index: number): string => `<linearGradient id="${id}-${index}" x1="${veil.x.toFixed(2)}" x2="${(veil.x + veil.w).toFixed(2)}" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${MASK_KEEP}"/><stop offset="1" stop-color="${MASK_FADE}"/></linearGradient>`;
  const fade = (veil: Rect, index: number): string => `<rect x="${veil.x.toFixed(2)}" y="${(veil.y - 3).toFixed(2)}" width="${(veil.w + 1).toFixed(2)}" height="${(veil.h + 6).toFixed(2)}" fill="url(#${id}-${index})"/>`;
  const indexed = field.veils.map((veil, index) => ({ veil, index }));
  return `<defs>${indexed.map(each => gradient(each.veil, each.index)).join("")}`
    + `<mask id="${id}-cells" ${frame}${indexed.map(each => fade(each.veil, each.index)).join("")}</mask>`
    + (ends.length ? `<mask id="${id}-skins" ${frame}${indexed.filter(each => each.veil.of === "field").map(each => fade(each.veil, each.index)).join("")}</mask>` : "")
    + `</defs><g>${parts}</g>`;
}

/** What a handle's marks do when pressed: a file's cell pins the file, a directory's skin opens the directory. */
export interface HiddenCellActions {
  pin(file: string): void;
  open(directory: string): void;
}

/** Maximum width of inline hidden-file cells in a directory header line so wide headers fade cleanly into a veil instead of forming long dot strings. */
const MAX_INLINE_CELLS_WIDTH = 88;

/**
 * What a directory drawn only around the pinned picture does not draw, as marks in its handle's line in place of the
 * count's words (the Hidden Files trial, 2026-11-17; the owner: "Could those be represented as cute little cells that
 * could be clicked on to expand them into fuller-sized nodes?"): a closed directory's own cell for each file and its
 * small skin for each directory, drawn by the closed look's own arithmetic and markup, as many whole marks as the line
 * leaves room for after the directory's name, the last fading under a veil where more are held (`lineMarks`). The line
 * is drawn again whenever the room the line leaves it changes, at every look, since from the connections look out the
 * whole line is held at the file names' size. What the marks are and do is {@link markToolbar}'s.
 */
export function createHiddenCells(directory: string, hidden: HiddenContents, style: ClosedStyle, actions: HiddenCellActions): HTMLElement {
  const { contents } = hidden;
  const line = markToolbar("span", "local-directory-cells", directory, hidden, style, actions, CELLS_LEAD, (width, height) => {
    const drawn = lineMarks(contents, { width: Math.max(0, width - CELLS_LEAD), height: height || HANDLE_LINE });
    const places = new Array<MarkPlace | null>(drawn.held).fill(null);
    for (const [order, mark] of drawn.marks.entries()) {
      if (!mark.veiled) places[order] = { left: CELLS_LEAD + mark.left, top: 0, width: mark.right - mark.left, height: height || HANDLE_LINE, x: mark.x - mark.left, w: mark.width, h: mark.height, drawn: order };
    }
    return { field: drawn.field, places, width: Math.max(0, width - CELLS_LEAD), height: height || HANDLE_LINE };
  });
  const natural = lineMarks(contents, { width: Infinity, height: HANDLE_LINE }).natural;
  line.style.maxWidth = `${(CELLS_LEAD + Math.min(MAX_INLINE_CELLS_WIDTH, natural)).toFixed(2)}px`;
  return line;
}

/**
 * The same marks under the handle's line (Hidden Files' "Cells under name", 2026-11-17, on the root's review: with the
 * path kept, the line at reading size held three marks of history's twenty-three), at the reading look, in the height
 * the handle's strip already keeps free under the line, as a closed directory's own field: `fieldBands` and `cellField`
 * on that room, skins first, the field's own veils. A cell that names its file and a small skin that is not faded at the
 * field's end are the marks pressed; a cell standing for what the room leaves out, or fading under a veil, is drawn and
 * names nothing. Its press reaches over the cell and half the air on each side, as wide as a pitch and as tall as a row
 * of the staggered pair, so that the presses of neighbouring cells do not cross. The stylesheet shows the field at the
 * reading look and the line's marks from the connections look out.
 */
export function createHiddenField(directory: string, hidden: HiddenContents, style: ClosedStyle, actions: HiddenCellActions): HTMLElement {
  const { contents } = hidden;
  const { cell, gap, itemGap } = CELLS;
  const pitch = cell + gap, row = pitch * Math.sqrt(3) / 2, directories = contents.subdirectories.length;
  return markToolbar("div", "local-directory-field", directory, hidden, style, actions, 0, (width, height) => {
    const field = cellField(contents, fieldBands({ width, height }));
    const ends = field.veils.filter(veil => veil.of === "field");
    const faded = (x: number, y: number): boolean => ends.some(veil => x >= veil.x - 1e-6 && x <= veil.x + veil.w + 1e-6 && y >= veil.y && y <= veil.y + veil.h);
    const places = new Array<MarkPlace | null>(directories + contents.files.length).fill(null);
    for (const [drawn, skin] of field.skins.entries()) {
      const index = contents.subdirectories.findIndex(sub => sub.name === skin.name);
      if (index >= 0 && !faded(skin.x + skin.w / 2, skin.y + skin.h / 2)) places[index] = { left: skin.x - itemGap / 2, top: skin.y, width: skin.w + itemGap, height: skin.h, x: itemGap / 2, w: skin.w, h: skin.h, drawn };
    }
    for (const [at, c] of field.cells.entries()) {
      const index = c.name === undefined ? -1 : contents.files.findIndex(file => file.name === c.name);
      if (index >= 0) places[directories + index] = { left: c.x - pitch / 2, top: c.y - row / 2, width: pitch, height: row, x: pitch / 2 - c.r, w: 2 * c.r, h: 2 * c.r, drawn: field.skins.length + at };
    }
    return { field, places, width, height };
  });
}

/** Where a mark is pressed and drawn: its button's box, and the mark's own box within it for its ring, in the drawing's units; and its place in the drawing. */
interface MarkPlace { left: number; top: number; width: number; height: number; x: number; w: number; h: number; drawn: number }

/** A drawing of a directory's marks in a room: what to draw, and where each mark stands, in the toolbar's order, or null where it is not pressed. */
type MarkDrawing = (width: number, height: number) => { field: CellField; places: ReadonlyArray<MarkPlace | null>; width: number; height: number };

/**
 * A directory's marks as the reader meets them, in the line or under it: a button for each directory and each file it
 * does not draw, in that order, with no words of its own on the map. A cell's hover says its file's name alone and its
 * press pins the file, the existing pin act, so that it becomes a card with its wires; a skin's says its directory's name
 * and what it holds, and its press opens the directory. For assistive technology a cell is "Pin <path>" and a skin "Open
 * <path>". The marks of one directory are one stop in the tab order, a toolbar whose arrow keys move among the marks
 * pressed, in reading order. They are drawn quieter than the cards, the ground under the wires, and lit under the
 * pointer or the focus (local.css). The drawing is made again whenever the room changes, down to none, so that a room
 * left no width keeps no mark of before; a mark the room does not show is not pressed.
 */
function markToolbar(tag: "span" | "div", className: string, directory: string, hidden: HiddenContents, style: ClosedStyle, actions: HiddenCellActions, svgLeft: number, draw: MarkDrawing): HTMLElement {
  const { contents } = hidden;
  const element: HTMLElement = document.createElement(tag);
  element.className = `${className} local-closed-cells--${style.cells}`;
  element.dataset.directory = directory;
  element.setAttribute("role", "toolbar");
  element.setAttribute("aria-label", `${directory}: +${countsOf(hidden.files.length, hidden.directories.length)}`);
  const svg = document.createElementNS(SVG, "svg");
  svg.classList.add("local-handle-cells");
  svg.setAttribute("aria-hidden", "true");
  svg.style.left = `${svgLeft}px`;
  element.append(svg);
  const directories = hidden.directories.length;
  const buttons = [...hidden.directories, ...hidden.files].map((path, order) => {
    const of = order < directories ? "directory" : "file";
    const button = document.createElement("button");
    button.type = "button";
    button.className = `local-directory-cell local-directory-cell--${of}`;
    button.tabIndex = order === 0 ? 0 : -1;
    button.dataset.mark = String(order);
    button.dataset.path = path;
    if (of === "file") {
      button.setAttribute("aria-label", `Pin ${path}`);
      button.title = contents.files[order - directories].name;
      button.addEventListener("click", event => { event.stopPropagation(); actions.pin(path); });
    } else {
      const sub = contents.subdirectories[order];
      button.setAttribute("aria-label", `Open ${path}`);
      button.title = `${sub.name}: ${countsOf(sub.total, sub.subdirectories.length)}`;
      button.addEventListener("click", event => { event.stopPropagation(); actions.open(path); });
    }
    const light = (on: boolean): void => { if (button.dataset.drawn) svg.querySelector(`[data-mark="${button.dataset.drawn}"]`)?.classList.toggle("is-lit", on); };
    button.addEventListener("pointerenter", () => light(true));
    button.addEventListener("pointerleave", () => light(button === document.activeElement));
    button.addEventListener("focus", () => light(true));
    button.addEventListener("blur", () => light(button.matches(":hover")));
    return button;
  });
  element.append(...buttons);
  const shown = (): HTMLButtonElement[] => buttons.filter(button => !button.hidden);
  // One stop in the tab order: the arrow keys move the stop among the marks shown, Home and End to their ends.
  // When `.local-directory-field` is reflected under a mirrored map, horizontal arrows follow visual screen order.
  element.addEventListener("keydown", event => {
    const list = shown(), at = list.indexOf(event.target as HTMLButtonElement);
    if (at < 0) return;
    const reflected = className === "local-directory-field" && !!element.closest(`[${READS_ATTRIBUTE}="usesFirst"]`);
    const forward = reflected ? "ArrowLeft" : "ArrowRight";
    const backward = reflected ? "ArrowRight" : "ArrowLeft";
    const to = event.key === forward || event.key === "ArrowDown" ? Math.min(list.length - 1, at + 1)
      : event.key === backward || event.key === "ArrowUp" ? Math.max(0, at - 1)
        : event.key === "Home" ? 0 : event.key === "End" ? list.length - 1 : -1;
    if (to < 0) return;
    event.preventDefault();
    event.stopPropagation();
    for (const button of buttons) button.tabIndex = -1;
    list[to].tabIndex = 0;
    list[to].focus({ preventScroll: true });
  });
  const redraw = (room: Room): void => {
    const { field, places, width, height } = draw(room.width, room.height);
    svg.setAttribute("width", width.toFixed(2));
    svg.setAttribute("height", height.toFixed(2));
    svg.setAttribute("viewBox", `0 0 ${width.toFixed(2)} ${height.toFixed(2)}`);
    svg.innerHTML = field.cells.length || field.skins.length ? fieldMarkup(field, width, height, style.shape, true) : "";
    for (const [order, button] of buttons.entries()) {
      const place = places[order];
      button.hidden = !place;
      if (!place) { delete button.dataset.drawn; continue; }
      button.dataset.drawn = String(place.drawn);
      Object.assign(button.style, { left: `${place.left}px`, top: `${place.top}px`, width: `${place.width}px`, height: `${place.height}px` });
      button.style.setProperty("--mark-x", place.x.toFixed(2));
      button.style.setProperty("--mark-w", place.w.toFixed(2));
      button.style.setProperty("--mark-h", place.h.toFixed(2));
      if (button === document.activeElement || button.matches(":hover")) svg.querySelector(`[data-mark="${place.drawn}"]`)?.classList.add("is-lit");
    }
    // The stop stays on a mark that is shown.
    const list = shown();
    if (list.length && !list.some(button => button.tabIndex === 0)) { for (const button of buttons) button.tabIndex = -1; list[0].tabIndex = 0; }
  };
  observeRoom(element, redraw);
  return element;
}

/** A toolbar's room as laid out, in whole pixels as the element reports it. */
interface Room { width: number; height: number }

const ROOM_DRAWINGS = new WeakMap<Element, (room: Room) => void>();
let roomObserver: ResizeObserver | null = null;

/**
 * Draw a handle's marks once their toolbar is laid out and again whenever its room changes. One observer serves every
 * toolbar and reads every room before it draws any: a drawing writes the toolbar's marks, so a room read after another
 * toolbar's drawing made the browser lay out the page again first, once for each toolbar, which cost a map of twenty
 * directories some 300 ms in its first frame (2026-11-18). A toolbar out of the page is not drawn, and the observer does
 * not keep it alive (Chromium holds its targets weakly, checked the same day).
 */
function observeRoom(element: HTMLElement, drawing: (room: Room) => void): void {
  if (typeof ResizeObserver === "undefined") return;
  ROOM_DRAWINGS.set(element, drawing);
  roomObserver ??= new ResizeObserver(entries => {
    const rooms: Array<[(room: Room) => void, Room]> = [];
    for (const { target } of entries) {
      const draw = ROOM_DRAWINGS.get(target);
      if (target.isConnected && draw) rooms.push([draw, { width: target.clientWidth, height: target.clientHeight }]);
    }
    for (const [draw, room] of rooms) draw(room);
  });
  roomObserver.observe(element);
}

/**
 * The air between the handle and its first mark, in the line's own units: the row's gap, which the line's box takes back
 * with a margin of its own (local.css), so that a line the room leaves no mark takes no room from the name either.
 */
const CELLS_LEAD = 4;

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
  // A file at a past moment of the history: its count is known, its rows as they were are not kept (2026-11-19).
  const unkept = hasPublicSymbols ? 0 : node.symbolCount ?? 0;

  if (unkept > 0) {
    wrapper.appendChild(unkeptSymbols(unkept));
  } else if (!hasPublicSymbols) {
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

/**
 * A past moment's count of a file's public symbols, whose rows the history does not keep (2026-11-19, the first rung of
 * history in 2D). The history carries each file's kind and symbol count at every step and not the names, so the card
 * says what is known and no more: the count, in the quiet form a card uses for rows it does not draw ("+4 symbols"),
 * a fact and not a control, since nothing can show those rows. "No public symbols" would have been false. Its title and
 * spoken name say why the rows are absent.
 */
function unkeptSymbols(count: number): HTMLElement {
  const note = document.createElement("span");
  note.className = "local-disclosure local-symbols-unkept";
  note.textContent = `+${countOf(count, "symbol")}`;
  note.title = "The rows as they were are not kept at this moment of the history";
  note.setAttribute("role", "note");
  note.setAttribute("aria-label", `${countOf(count, "public symbol")}; the rows as they were are not kept at this moment`);
  return note;
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
  pin.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PIN_GLYPH}"/></svg>`;
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

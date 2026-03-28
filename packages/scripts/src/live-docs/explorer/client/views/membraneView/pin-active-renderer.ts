/**
 * Pin-active renderer for the Membrane Map.
 *
 * When pins are active, replaces the squarify treemap with a left-to-right
 * dependency-flow layout. Only relevant nodes (pinned + 1-hop neighbors)
 * are rendered as cards arranged in topological columns, grouped by
 * directory (membrane).
 *
 * @module pin-active-renderer
 */

import type { MeasuredAnchor } from "./focal-overlay";
import type { PinLayoutResult, DirectoryBand } from "./pin-layout";
import type { PinSet } from "./pin-state";
import { isSymbolPinned } from "./pin-state";
import type { ExplorerNodePayload } from "../../../shared/types";

/** Escape HTML special characters to prevent XSS. */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
}

/** Callbacks for pin-active renderer interactive elements. */
export interface PinActiveCallbacks {
  onSelectNode: (node: ExplorerNodePayload) => void;
  onTogglePin: (nodeId: string, symbol: string) => void;
  onClearPins: () => void;
  onNavigateToDirectory: (dir: string) => void;
}

/** Result from renderPinActiveLayout. */
export interface PinActiveRenderResult {
  /** Root DOM element containing the column layout. */
  readonly root: HTMLElement;
  /** Pin anchors for connection drawing. */
  readonly anchors: readonly MeasuredAnchor[];
  /** IDs of nodes rendered as cards. */
  readonly cardRenderedIds: ReadonlySet<string>;
}

/**
 * Render the dependency-flow layout when pins are active.
 *
 * Creates a horizontal column layout where:
 * - Upstream (dependency) nodes appear on the left
 * - Pinned nodes appear in the center
 * - Downstream (dependent) nodes appear on the right
 * - Nodes within each column are grouped by directory (membrane)
 *
 * @param pinLayout - Computed dependency-flow layout from computePinLayout
 * @param nodesById - Node payload lookup
 * @param selectedNodeId - Currently selected node for highlight
 * @param callbacks - Interaction handlers
 * @param pinSet - Current pin state (for highlighting active pins)
 */
export function renderPinActiveLayout(
  pinLayout: PinLayoutResult,
  nodesById: ReadonlyMap<string, ExplorerNodePayload>,
  selectedNodeId: string | null,
  callbacks: PinActiveCallbacks,
  pinSet: PinSet,
): PinActiveRenderResult {
  const anchors: MeasuredAnchor[] = [];
  const cardRenderedIds = new Set<string>();

  const root = document.createElement("div");
  root.className = "pin-active-root";

  // Back-to-browse bar
  const headerBar = document.createElement("div");
  headerBar.className = "pin-active-header";
  const backBtn = document.createElement("button");
  backBtn.className = "pin-active-header__back";
  backBtn.textContent = "\u2190 Back to Browse";
  backBtn.title = "Clear all pins and return to directory view (Esc)";
  backBtn.addEventListener("click", e => {
    e.stopPropagation();
    callbacks.onClearPins();
  });
  headerBar.appendChild(backBtn);
  root.appendChild(headerBar);

  if (pinLayout.columnCount === 0) {
    return { root, anchors, cardRenderedIds };
  }

  // Build nested ancestor membrane wrappers from LCA outward.
  // Each ancestor layer is a thin border + label that serves as a
  // clickable escape hatch back to browse mode at that directory level.
  const { ancestorChain } = pinLayout;
  let innermost: HTMLElement = root;

  for (const dir of ancestorChain) {
    const membraneLayer = document.createElement("div");
    membraneLayer.className = "pa-ancestor-membrane";
    membraneLayer.dataset.dir = dir;
    // Stable data-id for FLIP animation matching across re-renders.
    membraneLayer.dataset.id = dir;

    const layerLabel = document.createElement("div");
    layerLabel.className = "pa-ancestor-membrane__label";
    const segmentName = dir.includes("/") ? dir.substring(dir.lastIndexOf("/") + 1) : dir;
    layerLabel.textContent = segmentName;
    layerLabel.title = `Navigate to ${dir}`;
    layerLabel.style.cursor = "pointer";
    layerLabel.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onNavigateToDirectory(dir);
    });
    membraneLayer.appendChild(layerLabel);

    innermost.appendChild(membraneLayer);
    innermost = membraneLayer;
  }

  // Create the grid container inside the innermost ancestor membrane.
  // CSS Grid: one track per column, one label row, then one row per band-row.
  const gridContainer = document.createElement("div");
  gridContainer.className = "pa-grid-container";
  gridContainer.style.gridTemplateColumns = `repeat(${pinLayout.columnCount}, 320px)`;

  // Determine how many band rows exist
  let maxBandRow = 0;
  for (const band of pinLayout.directoryBands) {
    if (band.bandRow > maxBandRow) maxBandRow = band.bandRow;
  }
  // Row 1 = labels, rows 2..N = band rows
  gridContainer.style.gridTemplateRows = `auto ${Array(maxBandRow + 1).fill("auto").join(" ")}`;

  // Column labels (grid row 1)
  for (let col = 0; col < pinLayout.columnCount; col++) {
    const labelEl = document.createElement("div");
    labelEl.className = "pin-active-column__label";
    labelEl.textContent = pinLayout.columnLabels[col] ?? "";
    labelEl.style.gridColumn = String(col + 1);
    labelEl.style.gridRow = "1";
    gridContainer.appendChild(labelEl);
  }

  // Render each directory band as a membrane spanning its column range
  for (const band of pinLayout.directoryBands) {
    const bandEl = renderDirectoryBand(
      band, nodesById, selectedNodeId, callbacks, pinSet, anchors,
      cardRenderedIds, pinLayout.lcaDirectory, pinLayout.columnCount,
    );
    // Position in grid: column span from minColumn to maxColumn (CSS Grid is 1-indexed)
    bandEl.style.gridColumn = `${band.minColumn + 1} / ${band.maxColumn + 2}`;
    bandEl.style.gridRow = String(band.bandRow + 2); // +2: row 1 is labels
    gridContainer.appendChild(bandEl);
  }

  innermost.appendChild(gridContainer);

  return { root, anchors, cardRenderedIds };
}

/**
 * Render a directory band — either a leaf (file cards) or a parent
 * (nested child bands). Parent bands contain an inner grid that places
 * children; leaf bands render file cards directly.
 *
 * @param contextDirectory - parent band's directory, used for relative labels
 */
function renderDirectoryBand(
  band: DirectoryBand,
  nodesById: ReadonlyMap<string, ExplorerNodePayload>,
  selectedNodeId: string | null,
  callbacks: PinActiveCallbacks,
  pinSet: PinSet,
  anchors: MeasuredAnchor[],
  cardRenderedIds: Set<string>,
  contextDirectory: string,
  totalColumns: number,
): HTMLElement {
  const isParent = band.children.length > 0;
  const isRootLevel = band.directory === contextDirectory;
  const container = document.createElement("div");
  container.className = isRootLevel
    ? "pa-band-bare"
    : isParent ? "pa-band-membrane pa-band-membrane--group" : "pa-band-membrane";
  container.dataset.directory = band.directory;
  container.dataset.id = band.directory;

  // Directory label — show relative to the context directory; skip for root-level files
  const showLabel = band.directory && !isRootLevel;
  if (showLabel) {
    const displayDir = contextDirectory && band.directory.startsWith(contextDirectory + "/")
      ? band.directory.substring(contextDirectory.length + 1)
      : band.directory;
    const dirLabel = document.createElement("div");
    dirLabel.className = "pa-band-membrane__label";
    dirLabel.textContent = displayDir;
    dirLabel.title = `Navigate to ${band.directory}`;
    dirLabel.style.cursor = "pointer";
    dirLabel.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onNavigateToDirectory(band.directory);
    });
    container.appendChild(dirLabel);
  }

  if (isParent) {
    // ── Parent band: inner grid of child bands ──────────────────
    const bandSpan = band.maxColumn - band.minColumn + 1;
    let maxChildRow = 0;
    for (const child of band.children) {
      if (child.bandRow > maxChildRow) maxChildRow = child.bandRow;
    }

    const innerGrid = document.createElement("div");
    innerGrid.className = "pa-band-inner";
    innerGrid.style.gridTemplateColumns = `repeat(${bandSpan}, 320px)`;
    innerGrid.style.gridTemplateRows = Array(maxChildRow + 1).fill("auto").join(" ");

    for (const child of band.children) {
      const childEl = renderDirectoryBand(
        child, nodesById, selectedNodeId, callbacks, pinSet, anchors,
        cardRenderedIds, band.directory, totalColumns,
      );
      // Place in inner grid relative to parent's minColumn
      childEl.style.gridColumn = `${child.minColumn - band.minColumn + 1} / ${child.maxColumn - band.minColumn + 2}`;
      childEl.style.gridRow = String(child.bandRow + 1);
      innerGrid.appendChild(childEl);
    }

    container.appendChild(innerGrid);
  } else {
    // ── Leaf band: render file cards ────────────────────────────
    const bandSpan = band.maxColumn - band.minColumn + 1;
    const innerGrid = document.createElement("div");
    innerGrid.className = "pa-band-inner";
    innerGrid.style.gridTemplateColumns = `repeat(${bandSpan}, 320px)`;

    for (let col = band.minColumn; col <= band.maxColumn; col++) {
      const nodeIds = band.nodesByColumn.get(col);
      const slot = document.createElement("div");
      slot.className = "pa-band-slot";
      slot.style.gridColumn = String(col - band.minColumn + 1);

      if (nodeIds) {
        for (const nodeId of nodeIds) {
          const payload = nodesById.get(nodeId);
          if (!payload) continue;
          const card = renderFlowCard(nodeId, payload, selectedNodeId, callbacks, pinSet, anchors);
          cardRenderedIds.add(nodeId);
          slot.appendChild(card);
        }
      }

      innerGrid.appendChild(slot);
    }

    container.appendChild(innerGrid);
  }

  return container;
}

/**
 * Render a file card for the dependency-flow layout.
 *
 * Similar to browse-renderer's renderFileCard but without absolute
 * positioning — cards participate in normal flow within their column.
 */
function renderFlowCard(
  nodeId: string,
  payload: ExplorerNodePayload,
  selectedNodeId: string | null,
  callbacks: PinActiveCallbacks,
  pinSet: PinSet,
  anchors: MeasuredAnchor[],
): HTMLElement {
  const card = document.createElement("div");
  card.className = "membrane-card pin-active-card";
  if (nodeId === selectedNodeId) card.classList.add("selected");
  card.dataset.id = nodeId;
  card.tabIndex = 0;

  // Header
  const header = document.createElement("div");
  header.className = "membrane-card__header";
  header.textContent = escapeHtml(payload.name);
  card.appendChild(header);

  // Symbol grid
  const symbols = payload.publicSymbols ?? [];
  const grid = document.createElement("div");
  grid.className = "membrane-card__symbols";

  for (const symbol of symbols) {
    const row = document.createElement("div");
    row.className = "membrane-card__symbol-row";
    row.dataset.nodeId = nodeId;
    row.dataset.symbol = symbol;
    if (isSymbolPinned(pinSet, nodeId, symbol)) {
      row.classList.add("membrane-card__symbol-row--pinned");
    }

    // Inbound pin (green, left)
    const inPin = document.createElement("div");
    inPin.className = "membrane-focal-pin membrane-focal-pin--inbound";
    if (isSymbolPinned(pinSet, nodeId, symbol)) {
      inPin.classList.add("membrane-focal-pin--active");
    }
    inPin.style.pointerEvents = "auto";
    inPin.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(nodeId, symbol);
    });
    row.appendChild(inPin);
    anchors.push({ nodeId, symbol, direction: "inbound", element: inPin });

    // Label — clicking the name is equivalent to clicking a pin
    const label = document.createElement("span");
    label.className = "membrane-card__symbol-label";
    label.textContent = symbol;
    label.title = `${nodeId}::${symbol}`;
    label.style.cursor = "pointer";
    label.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(nodeId, symbol);
    });
    row.appendChild(label);

    // Outbound pin (blue, right)
    const outPin = document.createElement("div");
    outPin.className = "membrane-focal-pin membrane-focal-pin--outbound";
    if (isSymbolPinned(pinSet, nodeId, symbol)) {
      outPin.classList.add("membrane-focal-pin--active");
    }
    outPin.style.pointerEvents = "auto";
    outPin.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(nodeId, symbol);
    });
    row.appendChild(outPin);
    anchors.push({ nodeId, symbol, direction: "outbound", element: outPin });

    grid.appendChild(row);
  }

  // Internals pseudo-symbol — always present so connections can route here
  {
    const internalsRow = document.createElement("div");
    internalsRow.className = "membrane-card__symbol-row membrane-card__symbol-row--internals";

    const internalsPin = document.createElement("div");
    internalsPin.className = "membrane-focal-pin membrane-focal-pin--inbound";
    if (isSymbolPinned(pinSet, nodeId, "__internals__")) {
      internalsPin.classList.add("membrane-focal-pin--active");
    }
    internalsPin.style.pointerEvents = "auto";
    internalsPin.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(nodeId, "__internals__");
    });
    internalsRow.appendChild(internalsPin);
    anchors.push({ nodeId, symbol: "__internals__", direction: "inbound", element: internalsPin });

    const internalsLabel = document.createElement("span");
    internalsLabel.className = "membrane-card__symbol-label membrane-card__symbol-label--internals";
    internalsLabel.textContent = "⬛ Internals";
    internalsLabel.title = "Internal/private — data flows in but isn't exposed as public symbols";
    internalsLabel.style.cursor = "pointer";
    internalsLabel.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(nodeId, "__internals__");
    });
    internalsRow.appendChild(internalsLabel);

    const placeholder = document.createElement("div");
    placeholder.className = "membrane-focal-pin--placeholder";
    internalsRow.appendChild(placeholder);

    grid.appendChild(internalsRow);
  }

  if (symbols.length === 0) {
    // Wildcard anchors for nodes with no public symbols — enables connection routing
    const wildcardRow = document.createElement("div");
    wildcardRow.className = "membrane-card__symbol-row membrane-card__symbol-row--wildcard";

    const wcInPin = document.createElement("div");
    wcInPin.className = "membrane-focal-pin membrane-focal-pin--inbound";
    wildcardRow.appendChild(wcInPin);
    anchors.push({ nodeId, symbol: "*", direction: "inbound", element: wcInPin });

    const wcLabel = document.createElement("span");
    wcLabel.className = "membrane-card__symbol-label membrane-card__symbol-label--internals";
    wcLabel.textContent = "(file)";
    wcLabel.title = "File-level dependency (no public symbols)";
    wildcardRow.appendChild(wcLabel);

    const wcOutPin = document.createElement("div");
    wcOutPin.className = "membrane-focal-pin membrane-focal-pin--outbound";
    wildcardRow.appendChild(wcOutPin);
    anchors.push({ nodeId, symbol: "*", direction: "outbound", element: wcOutPin });

    grid.appendChild(wildcardRow);
  }

  card.appendChild(grid);

  // Click to select
  card.addEventListener("click", e => {
    e.stopPropagation();
    callbacks.onSelectNode(payload);
  });

  return card;
}

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
import type { PinLayoutResult, MembraneGroup } from "./pin-layout";
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
  const { ancestorChain, lcaDirectory } = pinLayout;
  let innermost: HTMLElement = root;

  for (const dir of ancestorChain) {
    const membraneLayer = document.createElement("div");
    membraneLayer.className = "pa-ancestor-membrane";
    membraneLayer.dataset.dir = dir;

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

  // Create the columns container inside the innermost ancestor membrane
  const columnsContainer = document.createElement("div");
  columnsContainer.className = "pa-columns-container";

  // Group membrane groups by column
  const groupsByColumn = new Map<number, MembraneGroup[]>();
  for (const group of pinLayout.membraneGroups) {
    let list = groupsByColumn.get(group.column);
    if (!list) {
      list = [];
      groupsByColumn.set(group.column, list);
    }
    list.push(group);
  }

  // Render each column
  for (let col = 0; col < pinLayout.columnCount; col++) {
    const columnEl = document.createElement("div");
    columnEl.className = "pin-active-column";
    columnEl.dataset.column = String(col);

    // Column label
    const label = pinLayout.columnLabels[col] ?? "";
    const labelEl = document.createElement("div");
    labelEl.className = "pin-active-column__label";
    labelEl.textContent = label;
    columnEl.appendChild(labelEl);

    // Render membrane groups in this column
    const groups = groupsByColumn.get(col) ?? [];
    for (const group of groups) {
      const groupEl = renderMembraneGroup(
        group, nodesById, selectedNodeId, callbacks, pinSet, anchors, cardRenderedIds,
        lcaDirectory,
      );
      columnEl.appendChild(groupEl);
    }

    columnsContainer.appendChild(columnEl);
  }

  innermost.appendChild(columnsContainer);

  return { root, anchors, cardRenderedIds };
}

/**
 * Render a membrane group: a directory header wrapping a set of file cards.
 */
function renderMembraneGroup(
  group: MembraneGroup,
  nodesById: ReadonlyMap<string, ExplorerNodePayload>,
  selectedNodeId: string | null,
  callbacks: PinActiveCallbacks,
  pinSet: PinSet,
  anchors: MeasuredAnchor[],
  cardRenderedIds: Set<string>,
  lcaDirectory: string,
): HTMLElement {
  const container = document.createElement("div");
  container.className = "pin-active-membrane";
  container.dataset.directory = group.directory;

  // Show directory label only when it differs from the LCA (avoid duplicate labels)
  const showLabel = group.directory && group.directory !== lcaDirectory;
  if (showLabel) {
    // Show relative path from LCA for cleaner labels
    const displayDir = lcaDirectory && group.directory.startsWith(lcaDirectory + "/")
      ? group.directory.substring(lcaDirectory.length + 1)
      : group.directory;
    const dirLabel = document.createElement("div");
    dirLabel.className = "pin-active-membrane__label";
    dirLabel.textContent = displayDir;
    dirLabel.title = `Navigate to ${group.directory}`;
    dirLabel.style.cursor = "pointer";
    dirLabel.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onNavigateToDirectory(group.directory);
    });
    container.appendChild(dirLabel);
  }

  // File cards
  for (const nodeId of group.nodeIds) {
    const payload = nodesById.get(nodeId);
    if (!payload) continue;

    const card = renderFlowCard(
      nodeId, payload, selectedNodeId, callbacks, pinSet, anchors,
    );
    cardRenderedIds.add(nodeId);
    container.appendChild(card);
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

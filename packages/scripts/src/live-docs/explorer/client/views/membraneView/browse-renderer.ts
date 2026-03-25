/**
 * Browse-mode renderer for the Membrane Map.
 *
 * Converts a MembraneLayout into nested DOM elements. Collapsed directories
 * render as clickable tiles with aggregate metrics; expanded directories
 * render as membrane borders containing their children.
 *
 * When the focused (innermost expanded) directory contains only leaf
 * files, the children render as uniform Local-Map-style cards in a
 * scrollable grid instead of squarified treemap tiles.
 */
import type { MeasuredAnchor } from "./focal-overlay";
import type { PinSet } from "./pin-state";
import { isSymbolPinned } from "./pin-state";
import type { MembraneNode, MembraneLayout } from "./types";
import type { ExplorerNodePayload } from "../../../shared/types";
import type { DirectoryAggregate } from "../circuitView/aggregation";

/** Escape HTML special characters to prevent XSS. */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
}

/** Callbacks invoked by browse-mode interactive elements. */
export interface BrowseRenderCallbacks {
  onExpandDirectory: (id: string) => void;
  onCollapseDirectory: (id: string) => void;
  onSelectNode: (node: ExplorerNodePayload) => void;
  onTogglePin: (nodeId: string, symbol: string) => void;
}

/** Result from renderBrowseMode, including any card-grid anchors. */
export interface BrowseRenderResult {
  /** Root DOM element. */
  readonly root: HTMLElement;
  /** Pin anchors registered by card-grid leaf rendering. */
  readonly anchors: readonly MeasuredAnchor[];
  /** IDs of nodes already rendered as cards (focal overlay should skip them). */
  readonly cardRenderedIds: ReadonlySet<string>;
}

/**
 * Render the full membrane tree into a positioned DOM subtree.
 *
 * @param layout - Pre-computed membrane layout (from computeMembraneLayout)
 * @param collapsed - Set of directory IDs that are currently collapsed
 * @param aggregates - Pre-computed aggregate metrics keyed by directory path
 * @param nodesById - Lookup for ExplorerNodePayload by ID
 * @param selectedNodeId - Currently selected node ID (for highlight)
 * @param callbacks - Click handlers for expand/collapse/select
 * @returns A root HTMLElement containing the entire membrane tree
 */
export function renderBrowseMode(
  layout: MembraneLayout,
  collapsed: Set<string>,
  aggregates: Map<string, DirectoryAggregate>,
  nodesById: Map<string, ExplorerNodePayload>,
  selectedNodeId: string | null,
  callbacks: BrowseRenderCallbacks,
  pinSet: PinSet,
  focusedDirectory: string | null,
): BrowseRenderResult {
  const container = document.createElement("div");
  container.className = "membrane-browse-root";
  container.style.position = "relative";
  container.style.width = `${layout.viewport.width}px`;
  // Use min-height instead of fixed height so the container can grow
  // when a leaf directory's card grid overflows the treemap allocation.
  container.style.minHeight = `${layout.viewport.height}px`;

  const anchors: MeasuredAnchor[] = [];
  const cardRenderedIds = new Set<string>();

  renderNode(
    layout.root, container, layout.root, collapsed,
    aggregates, nodesById, selectedNodeId, callbacks,
    pinSet, focusedDirectory, anchors, cardRenderedIds,
  );

  return { root: container, anchors, cardRenderedIds };
}

/**
 * Recursively render a MembraneNode into its parent DOM element.
 * Positions are calculated relative to the parent membrane's content rect.
 */
function renderNode(
  node: MembraneNode,
  parentEl: HTMLElement,
  parentNode: MembraneNode,
  collapsed: Set<string>,
  aggregates: Map<string, DirectoryAggregate>,
  nodesById: Map<string, ExplorerNodePayload>,
  selectedNodeId: string | null,
  callbacks: BrowseRenderCallbacks,
  pinSet: PinSet,
  focusedDirectory: string | null,
  anchors: MeasuredAnchor[],
  cardRenderedIds: Set<string>,
): void {
  // Compute position relative to parent's content rect
  const offsetX = node.rect.x - parentNode.contentRect.x;
  const offsetY = node.rect.y - parentNode.contentRect.y;

  if (!node.isDirectory) {
    // Leaf file
    const leaf = document.createElement("div");
    leaf.className = "membrane-leaf";
    if (node.id === selectedNodeId) {
      leaf.classList.add("selected");
    }
    leaf.dataset.id = node.id;
    leaf.tabIndex = 0;
    leaf.style.left = `${offsetX}px`;
    leaf.style.top = `${offsetY}px`;
    leaf.style.width = `${node.rect.width}px`;
    leaf.style.height = `${node.rect.height}px`;

    const nameEl = document.createElement("span");
    nameEl.className = "membrane-leaf__name";
    nameEl.textContent = node.name;
    leaf.appendChild(nameEl);

    // Only show archetype badge when the leaf tile is large enough
    const payload = nodesById.get(node.id);
    if (payload?.archetype && node.rect.width >= 60 && node.rect.height >= 30) {
      const archEl = document.createElement("span");
      archEl.className = "membrane-leaf__archetype";
      archEl.textContent = payload.archetype;
      leaf.appendChild(archEl);
    }

    // Show public symbols when the tile is large enough (like a mini Local Map)
    const symbols = payload?.publicSymbols ?? [];
    if (symbols.length > 0 && node.rect.width >= 120 && node.rect.height >= 100) {
      const symList = document.createElement("ul");
      symList.className = "membrane-leaf__symbols";
      // Show as many symbols as will fit (estimate ~20px per item)
      const maxSymbols = Math.max(1, Math.floor((node.rect.height - 60) / 20));
      const visibleSymbols = symbols.slice(0, maxSymbols);
      for (const sym of visibleSymbols) {
        const li = document.createElement("li");
        li.textContent = sym;
        symList.appendChild(li);
      }
      if (symbols.length > maxSymbols) {
        const more = document.createElement("li");
        more.className = "membrane-leaf__symbols-more";
        more.textContent = `+${symbols.length - maxSymbols} more`;
        symList.appendChild(more);
      }
      leaf.appendChild(symList);
    }

    leaf.title = node.id;
    leaf.addEventListener("click", e => {
      e.stopPropagation();
      if (payload) callbacks.onSelectNode(payload);
    });

    parentEl.appendChild(leaf);
    return;
  }

  // Directory membrane
  const isCollapsed = collapsed.has(node.id);
  const membrane = document.createElement("div");
  const depthClass = node.depth <= 2 ? `membrane--depth-${node.depth}` : "membrane--depth-2";
  membrane.className = `membrane ${depthClass}`;
  membrane.dataset.id = node.id;

  // Determine if this directory is on the focus path to the focused
  // directory.  Focus-path membranes use relative positioning + auto
  // height so the leaf's content-driven sizing propagates upward
  // through the entire ancestor chain.
  // The root node (__root__) is always on the focus path when a
  // directory is focused, since it's the ancestor of everything.
  const isOnFocusPath = !isCollapsed
    && focusedDirectory !== null
    && (focusedDirectory === node.id
      || focusedDirectory.startsWith(node.id + "/")
      || node.id === "__root__");

  if (isOnFocusPath) {
    membrane.style.position = "relative";
    membrane.style.marginLeft = `${offsetX}px`;
    membrane.style.marginTop = `${offsetY}px`;
    membrane.style.width = `${node.rect.width}px`;
    membrane.style.height = "auto";
    membrane.style.minHeight = `${node.rect.height}px`;
  } else {
    membrane.style.left = `${offsetX}px`;
    membrane.style.top = `${offsetY}px`;
    membrane.style.width = `${node.rect.width}px`;
    membrane.style.height = `${node.rect.height}px`;
  }

  if (isCollapsed) {
    membrane.classList.add("membrane--collapsed");
    membrane.tabIndex = 0;
    membrane.setAttribute("role", "button");

    // Label
    const label = document.createElement("div");
    label.className = "membrane__label";
    label.textContent = escapeHtml(node.name);
    membrane.appendChild(label);

    // Aggregate metrics — only shown if the tile is large enough to read them.
    // Tiles below 80×50 px hide metrics entirely; tiles below 120×60 px
    // show only the file count to avoid badge overflow.
    const agg = aggregates.get(node.id);
    const tileW = node.rect.width;
    const tileH = node.rect.height;
    if (agg && tileW >= 80 && tileH >= 50) {
      const metrics = document.createElement("div");
      metrics.className = "membrane__metrics";
      metrics.appendChild(createBadge(`${agg.fileCount} files`, "files"));
      const showFull = tileW >= 120 && tileH >= 60;
      if (showFull && agg.symbolCount > 0) {
        metrics.appendChild(createBadge(`${agg.symbolCount} sym`, "symbols"));
      }
      if (showFull && agg.outboundDepCount > 0) {
        metrics.appendChild(createBadge(`${agg.outboundDepCount} out`, "outbound"));
      }
      if (showFull && agg.inboundDepCount > 0) {
        metrics.appendChild(createBadge(`${agg.inboundDepCount} in`, "inbound"));
      }
      membrane.appendChild(metrics);
    }

    membrane.title = `${node.id} — click to expand`;
    membrane.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onExpandDirectory(node.id);
    });
    membrane.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callbacks.onExpandDirectory(node.id);
      }
    });
  } else {
    // Expanded membrane — show label + content area with children
    const label = document.createElement("div");
    label.className = "membrane__label";
    label.textContent = escapeHtml(node.name);
    membrane.appendChild(label);

    // Detect leaf directory: the focused directory whose children are all files.
    const isLeafDirectory = node.id === focusedDirectory
      && node.children.length > 0
      && node.children.every(c => !c.isDirectory);

    if (isLeafDirectory) {
      // Render children as uniform Local-Map-style cards in a naturally-
      // flowing grid.  The grid is NOT constrained to the treemap rect —
      // it grows to fit its content and the membrane stretches with it.
      // The user pans / zooms to explore overflow.
      const content = document.createElement("div");
      content.className = "membrane__content membrane__card-grid";
      // Use relative positioning so the grid participates in normal
      // flow and pushes the membrane taller when it overflows.
      content.style.position = "relative";
      content.style.marginLeft = `${node.contentRect.x - node.rect.x}px`;
      content.style.marginTop = `${node.contentRect.y - node.rect.y}px`;
      // Width follows the layout rect so cards wrap predictably,
      // but height is unconstrained (content-driven).
      content.style.width = `${node.contentRect.width}px`;

      for (const child of node.children) {
        const payload = nodesById.get(child.id);
        if (!payload) continue;
        const card = renderFileCard(child, payload, selectedNodeId, callbacks, pinSet, anchors);
        cardRenderedIds.add(child.id);
        content.appendChild(card);
      }

      membrane.appendChild(content);
    } else {
      // Normal expanded membrane — position children via treemap rects
      const content = document.createElement("div");
      content.className = "membrane__content";

      if (isOnFocusPath) {
        // Focus-path ancestor: use relative positioning so height
        // propagates upward through the ancestor chain.
        content.style.position = "relative";
        content.style.marginLeft = `${node.contentRect.x - node.rect.x}px`;
        content.style.marginTop = `${node.contentRect.y - node.rect.y}px`;
        content.style.width = `${node.contentRect.width}px`;
        content.style.minHeight = `${node.contentRect.height}px`;
      } else {
        content.style.left = `${node.contentRect.x - node.rect.x}px`;
        content.style.top = `${node.contentRect.y - node.rect.y}px`;
        content.style.width = `${node.contentRect.width}px`;
        content.style.height = `${node.contentRect.height}px`;
      }

      for (const child of node.children) {
        renderNode(
          child, content, node, collapsed, aggregates, nodesById,
          selectedNodeId, callbacks, pinSet, focusedDirectory, anchors, cardRenderedIds,
        );
      }

      membrane.appendChild(content);
    }

    // Double-click to collapse
    membrane.addEventListener("dblclick", e => {
      e.stopPropagation();
      callbacks.onCollapseDirectory(node.id);
    });
  }

  parentEl.appendChild(membrane);
}

// ─── File Card Rendering ───────────────────────────────────────────

/**
 * Render a single file as a uniform card with symbol rows and pin anchors.
 * Resembles a Local Map node card.
 */
function renderFileCard(
  node: MembraneNode,
  payload: ExplorerNodePayload,
  selectedNodeId: string | null,
  callbacks: BrowseRenderCallbacks,
  pinSet: PinSet,
  anchors: MeasuredAnchor[],
): HTMLElement {
  const card = document.createElement("div");
  card.className = "membrane-card";
  if (node.id === selectedNodeId) card.classList.add("selected");
  card.dataset.id = node.id;
  card.tabIndex = 0;

  // Header
  const header = document.createElement("div");
  header.className = "membrane-card__header";
  header.textContent = escapeHtml(node.name);
  card.appendChild(header);

  // Path
  const pathEl = document.createElement("div");
  pathEl.className = "membrane-card__path";
  pathEl.textContent = payload.codeRelativePath;
  card.appendChild(pathEl);

  // Symbol grid
  const symbols = payload.publicSymbols ?? [];
  const grid = document.createElement("div");
  grid.className = "membrane-card__symbols";

  for (const symbol of symbols) {
    const row = document.createElement("div");
    row.className = "membrane-card__symbol-row";
    row.dataset.nodeId = node.id;
    row.dataset.symbol = symbol;

    // Inbound pin (green, left)
    const inPin = document.createElement("div");
    inPin.className = "membrane-focal-pin membrane-focal-pin--inbound";
    if (isSymbolPinned(pinSet, node.id, symbol)) {
      inPin.classList.add("membrane-focal-pin--active");
    }
    inPin.style.pointerEvents = "auto";
    inPin.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(node.id, symbol);
    });
    row.appendChild(inPin);
    anchors.push({ nodeId: node.id, symbol, direction: "inbound", element: inPin });

    // Label — clicking the name is equivalent to clicking a pin
    const label = document.createElement("span");
    label.className = "membrane-card__symbol-label";
    label.textContent = symbol;
    label.title = `${node.id}::${symbol}`;
    label.style.cursor = "pointer";
    label.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(node.id, symbol);
    });
    row.appendChild(label);

    // Outbound pin (blue, right)
    const outPin = document.createElement("div");
    outPin.className = "membrane-focal-pin membrane-focal-pin--outbound";
    if (isSymbolPinned(pinSet, node.id, symbol)) {
      outPin.classList.add("membrane-focal-pin--active");
    }
    outPin.style.pointerEvents = "auto";
    outPin.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(node.id, symbol);
    });
    row.appendChild(outPin);
    anchors.push({ nodeId: node.id, symbol, direction: "outbound", element: outPin });

    grid.appendChild(row);
  }

  // Internals pseudo-symbol — always present so connections can route here
  {
    const internalsRow = document.createElement("div");
    internalsRow.className = "membrane-card__symbol-row membrane-card__symbol-row--internals";

    const internalsPin = document.createElement("div");
    internalsPin.className = "membrane-focal-pin membrane-focal-pin--inbound";
    if (isSymbolPinned(pinSet, node.id, "__internals__")) {
      internalsPin.classList.add("membrane-focal-pin--active");
    }
    internalsPin.style.pointerEvents = "auto";
    internalsPin.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(node.id, "__internals__");
    });
    internalsRow.appendChild(internalsPin);
    anchors.push({ nodeId: node.id, symbol: "__internals__", direction: "inbound", element: internalsPin });

    const internalsLabel = document.createElement("span");
    internalsLabel.className = "membrane-card__symbol-label membrane-card__symbol-label--internals";
    internalsLabel.textContent = "⬛ Internals";
    internalsLabel.title = "Internal/private — data flows in but isn't exposed as public symbols";
    internalsLabel.style.cursor = "pointer";
    internalsLabel.addEventListener("click", e => {
      e.stopPropagation();
      callbacks.onTogglePin(node.id, "__internals__");
    });
    internalsRow.appendChild(internalsLabel);

    // Placeholder for outbound column alignment
    const placeholder = document.createElement("div");
    placeholder.className = "membrane-focal-pin--placeholder";
    internalsRow.appendChild(placeholder);

    grid.appendChild(internalsRow);
  }

  card.appendChild(grid);

  // Directory path at bottom
  const dirPath = document.createElement("div");
  dirPath.className = "membrane-card__directory";
  const lastSlash = payload.codeRelativePath.lastIndexOf("/");
  dirPath.textContent = lastSlash > 0 ? payload.codeRelativePath.substring(0, lastSlash) : "";
  card.appendChild(dirPath);

  // Click to select
  card.addEventListener("click", e => {
    e.stopPropagation();
    callbacks.onSelectNode(payload);
  });

  return card;
}

function createBadge(text: string, kind: string): HTMLElement {
  const badge = document.createElement("span");
  badge.className = `membrane__badge membrane__badge--${kind}`;
  badge.textContent = text;
  return badge;
}

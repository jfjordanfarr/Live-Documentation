import { normalizeSymbolIdentifier } from "../symbolAnchors";
import { renderBranches } from "./branch-renderer";
import { createHierarchicalColumn, createStackedColumn, highlightSymbolInColumn } from "./column-factory";
import type { LocalViewController } from "./controller";
import type { PathResult } from "./state";
import type { LocalSubgraph } from "./types";


/** Renders (or re-renders) the Local Map DOM layout from the current controller state. */
export function renderLocalView(controller: LocalViewController): void {
  const container = controller.getContainer();
  const overlay = controller.getOverlay();
  const { state } = controller.options;

  // Apply Local Map tuning as CSS variables at render time.
  // This is important because the layout root is recreated on render, and the
  // UI tuning panel may initialize before `.local-layout` exists.
  const columnGap = state.tuning.localMap?.columnGap;
  if (typeof columnGap === "number" && Number.isFinite(columnGap)) {
    container.style.setProperty("--local-column-gap", `${columnGap}px`);
  }

  const dimSymbols = state.tuning.localMap?.hoverDimSymbols;
  if (typeof dimSymbols === "number" && Number.isFinite(dimSymbols)) {
    container.style.setProperty("--hover-dim-symbols", String(dimSymbols));
  }

  const dimConnections = state.tuning.localMap?.hoverDimConnections;
  if (typeof dimConnections === "number" && Number.isFinite(dimConnections)) {
    container.style.setProperty("--hover-dim-connections", String(dimConnections));
  }

  overlay.innerHTML = "";
  container.innerHTML = "";
  controller.currentSubgraph = null;
  controller.branches = null;
  container.classList.remove("symbol-hover-active");
  overlay.classList.remove("symbol-hover-active");
  controller.contentRoot = null;
  controller.clearAnchors();

  if (!state.selectedNode) {
    container.innerHTML = '<div class="empty-hint" tabindex="-1" role="status">Select a node to view local relationships.</div>';
    controller.mapTransform = { x: 0, y: 0, k: 1 };
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.lastCenteredNodeId = null;
    controller.mapInitialTransform = null;
    controller.updateMapTransform();
    return;
  }

  const subgraph = controller.buildLocalSubgraph(state.selectedNode);
  controller.currentSubgraph = subgraph;

  if (subgraph.nodes.length === 0) {
    container.innerHTML = '<div class="empty-hint">No related nodes were found.</div>';
    controller.mapTransform = { x: 0, y: 0, k: 1 };
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.mapInitialTransform = null;
    controller.updateMapTransform();
    return;
  }

  if (!controller.mapUserAdjusted) {
    controller.mapHasInitialFit = false;
    controller.mapInitialTransform = null;
  }

  if (state.selectedNode.id !== controller.lastCenteredNodeId) {
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.lastCenteredNodeId = state.selectedNode.id;
    controller.mapInitialTransform = null;
  }

  const connectionScore = new Map<string, number>();
  subgraph.links.forEach(edge => {
    connectionScore.set(edge.sourceId, (connectionScore.get(edge.sourceId) ?? 0) + 1);
    connectionScore.set(edge.targetId, (connectionScore.get(edge.targetId) ?? 0) + 1);
  });

  // Check if we're in path mode (FROM-TO pathfinding result)
  const activePath = controller.localMapState.getState().activePath;
  const columnCount = activePath ? activePath.nodeIds.length : 3;

  const layoutRoot = document.createElement("div");
  layoutRoot.className = "local-layout";
  // Apply dynamic grid template based on column count
  layoutRoot.style.setProperty("--local-column-count", String(columnCount));
  layoutRoot.style.gridTemplateColumns = `repeat(${columnCount}, max-content)`;
  container.appendChild(layoutRoot);
  controller.contentRoot = layoutRoot;

  // Path mode: render a simple linear chain of nodes
  if (activePath && activePath.nodeIds.length > 0) {
    renderPathModeColumns(controller, layoutRoot, activePath, connectionScore);
    // A path is always framed afresh, from its first file
    controller.applyColumnVerticalCentering(layoutRoot);
    controller.fitMapToPath();
    controller.scheduleConnectionRedraw();
    return;
  }
  // Independent pins disclose branches without changing explicit pathfinding.
  else if (controller.pins.entries.length > 0) {
    renderBranches(controller, layoutRoot);
  }
  else {
    // Single-hop exploration: classic 3-column layout
    renderSingleHopColumns(controller, layoutRoot, subgraph, connectionScore);
  }

  if (!controller.branches) controller.applyColumnVerticalCentering(layoutRoot);

  if (!controller.mapHasInitialFit && controller.contentRoot) {
    controller.fitMapToContent();
  } else {
    controller.updateMapTransform();
  }

  controller.scheduleConnectionRedraw();
}

/**
 * Renders the classic 3-column single-hop layout.
 */
function renderSingleHopColumns(
  controller: LocalViewController,
  layoutRoot: HTMLElement,
  subgraph: LocalSubgraph,
  connectionScore: Map<string, number>
): void {
  const centerNodes = [subgraph.center];
  const inboundNodes = subgraph.nodes.filter(node => subgraph.inboundIds.has(node.id));
  const outboundNodes = subgraph.nodes.filter(node => subgraph.outboundIds.has(node.id));

  // The classic one-hop grammar remains the no-pin starting point.
  const centerLabel = "Selected artifact";
  const upstreamLabel = "Dependencies (inputs)";
  const downstreamLabel = "Dependents (outputs)";

  const centerColumn = createHierarchicalColumn(
    controller,
    centerLabel,
    centerNodes,
    "center",
    "No artifact selected",
    "center",
    connectionScore
  );
  layoutRoot.appendChild(centerColumn);

  const alignmentGuides = controller.collectCenterAlignmentGuides(centerColumn);

  const dependenciesColumn = createStackedColumn(
    controller,
    upstreamLabel,
    outboundNodes,
    "outbound",
    "No dependencies",
    alignmentGuides,
    "left",
    connectionScore
  );
  layoutRoot.insertBefore(dependenciesColumn, centerColumn);

  const dependentsColumn = createStackedColumn(
    controller,
    downstreamLabel,
    inboundNodes,
    "inbound",
    "No dependents",
    alignmentGuides,
    "right",
    connectionScore
  );
  layoutRoot.appendChild(dependentsColumn);
}

/**
 * Renders path mode: one column per file of the path, in the path's order.
 *
 * The path is set only in the direction the map reads, each file depending on
 * the one before it, so the first column offers and the last uses. The columns
 * are center columns with the path index as their hop index; the wires between
 * adjacent columns are drawn by the path drawer in `connections.ts` from the
 * path subgraph's links.
 */
function renderPathModeColumns(
  controller: LocalViewController,
  layoutRoot: HTMLElement,
  activePath: PathResult,
  connectionScore: Map<string, number>
): void {
  const { nodeIds, fromSymbol, toSymbol } = activePath;
  
  if (nodeIds.length === 0) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = "No path data available";
    layoutRoot.appendChild(empty);
    return;
  }

  // Build the path subgraph with edges between adjacent nodes
  const pathSubgraph = controller.buildPathSubgraph(nodeIds);
  if (!pathSubgraph) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = "Path nodes not found in graph";
    layoutRoot.appendChild(empty);
    return;
  }

  // Set the path subgraph as currentSubgraph for connection drawing
  controller.currentSubgraph = pathSubgraph;

  layoutRoot.classList.add("path-mode");
  
  for (let i = 0; i < pathSubgraph.nodes.length; i++) {
    const node = pathSubgraph.nodes[i];
    const isOrigin = i === 0;
    const isDestination = i === pathSubgraph.nodes.length - 1;

    // Generate label
    let label: string;
    if (isOrigin) {
      label = "FROM";
    } else if (isDestination) {
      label = "TO";
    } else {
      label = `Via ${i}`;
    }

    // Center column for this path node
    const centerColumn = createHierarchicalColumn(
      controller,
      label,
      [node],
      "center",
      "No artifact",
      "center",
      connectionScore,
      i
    );
    centerColumn.classList.add("path-node");
    if (isOrigin) centerColumn.classList.add("path-origin");
    if (isDestination) centerColumn.classList.add("path-destination");
    centerColumn.dataset.hopIndex = String(i);
    centerColumn.dataset.columnRole = "center";
    centerColumn.dataset.pathIndex = String(i);
    layoutRoot.appendChild(centerColumn);

    const relevant = new Set<string>();
    for (const edge of pathSubgraph.links) {
      if (edge.sourceId === node.id) relevant.add(normalizeSymbolIdentifier(edge.sourceSymbol) ?? "__internals__");
      if (edge.targetId === node.id) relevant.add(normalizeSymbolIdentifier(edge.targetSymbol) ?? "__internals__");
    }
    if (isOrigin && fromSymbol) relevant.add(normalizeSymbolIdentifier(fromSymbol)!);
    if (isDestination && toSymbol) relevant.add(normalizeSymbolIdentifier(toSymbol)!);
    let hidden = 0;
    centerColumn.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const collapse = !controller.expandedCards.has(node.id) && !relevant.has(normalizeSymbolIdentifier(row.dataset.symbol) ?? "__internals__");
      row.classList.toggle("branch-symbol-hidden", collapse);
      if (collapse) hidden++;
    });
    if (hidden) {
      const reveal = document.createElement("button");
      reveal.className = "local-disclosure";
      reveal.textContent = `+${hidden} symbols`;
      reveal.addEventListener("click", event => { event.stopPropagation(); controller.expandedCards.add(node.id); controller.render(); });
      centerColumn.querySelector(".node-card")?.append(reveal);
    }

    // Highlight symbols if specified
    if (isOrigin && fromSymbol) {
      highlightSymbolInColumn(centerColumn, fromSymbol);
    }
    if (isDestination && toSymbol) {
      highlightSymbolInColumn(centerColumn, toSymbol);
    }
  }
}

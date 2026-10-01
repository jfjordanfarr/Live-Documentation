import { createHierarchicalColumn, createStackedColumn, highlightSymbolInColumn } from "./column-factory";
import type { LocalViewController } from "./controller";
import {
  computeColumnCount,
  computeGridTemplate,
  generateColumnLabel
} from "./layout-math";
import type { PathResult, SymbolPin } from "./state";
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
  controller.setMultiHopSubgraphs(null);
  controller.contentRoot = null;
  controller.clearAnchors();

  if (!state.selectedNode) {
    container.innerHTML = '<div class="empty-hint">Select a node to view local relationships.</div>';
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
  const pinnedPath = controller.localMapState.getState().pinnedPath;
  
  // Determine column count based on mode:
  // - Path mode: N columns (one per node in path, no Dependencies column)
  // - Multi-hop exploration: 2*N columns (each hop has Center + Dependents, plus origin Dependencies)
  // - Single-hop exploration: 3 columns (Dependencies, Center, Dependents)
  const pathNodeCount = activePath ? activePath.nodeIds.length : 0;
  const hopCount = Math.max(1, pinnedPath.length);
  const columnCount = activePath 
    ? pathNodeCount  // Path mode: one column per node
    : computeColumnCount(hopCount);  // Exploration mode

  const layoutRoot = document.createElement("div");
  layoutRoot.className = "local-layout";
  // Apply dynamic grid template based on column count
  layoutRoot.style.setProperty("--local-column-count", String(columnCount));
  layoutRoot.style.gridTemplateColumns = computeGridTemplate(columnCount);
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
  // Multi-hop exploration: when pinnedPath has multiple entries, render each hop
  else if (pinnedPath.length > 1) {
    renderMultiHopColumns(controller, layoutRoot, pinnedPath, connectionScore);
  } else {
    // Single-hop exploration: classic 3-column layout
    renderSingleHopColumns(controller, layoutRoot, subgraph, hopCount, connectionScore);
  }

  controller.applyColumnVerticalCentering(layoutRoot);

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
  hopCount: number,
  connectionScore: Map<string, number>
): void {
  const centerNodes = [subgraph.center];
  const inboundNodes = subgraph.nodes.filter(node => subgraph.inboundIds.has(node.id));
  const outboundNodes = subgraph.nodes.filter(node => subgraph.outboundIds.has(node.id));

  // Generate column labels based on hop count (single-hop vs multi-hop)
  const centerLabel = generateColumnLabel("center", 0, hopCount);
  const upstreamLabel = generateColumnLabel("upstream", 0, hopCount);
  const downstreamLabel = generateColumnLabel("downstream", 0, hopCount);

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
 * Renders multi-hop columns based on the pinned path.
 * 
 * Layout pattern for N hops:
 * - Column 0: Dependencies of hop 0 (upstream)
 * - Column 1: Center of hop 0 (origin)
 * - Column 2: Dependents of hop 0 / Next hop targets
 * - Column 3: Center of hop 1 (if exists)
 * - Column 4: Dependents of hop 1 (if exists)
 * - ...and so on
 */
function renderMultiHopColumns(
  controller: LocalViewController,
  layoutRoot: HTMLElement,
  pinnedPath: SymbolPin[],
  connectionScore: Map<string, number>
): void {
  const totalHops = pinnedPath.length;
  
  // Build subgraphs for each hop
  const hopSubgraphs = controller.buildMultiHopSubgraphs();
  if (!hopSubgraphs || hopSubgraphs.length === 0) {
    // Fallback: render empty state
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = "No path data available";
    layoutRoot.appendChild(empty);
    return;
  }

  // Store hop subgraphs in controller for connection drawing
  controller.setMultiHopSubgraphs(hopSubgraphs);

  // Column 0: Dependencies of origin (first hop)
  const originSubgraph = hopSubgraphs[0].subgraph;
  const originOutbound = originSubgraph.nodes.filter(node => originSubgraph.outboundIds.has(node.id));
  
  const depColumn = createStackedColumn(
    controller,
    generateColumnLabel("upstream", 0, totalHops),
    originOutbound,
    "outbound",
    "No dependencies",
    { anchors: new Map(), cardCenters: new Map() }, // We'll collect guides after center is rendered
    "left",
    connectionScore,
    0 // hopIndex
  );
  depColumn.dataset.hopIndex = "0";
  depColumn.dataset.columnRole = "upstream";
  layoutRoot.appendChild(depColumn);

  // For each hop, create center + dependents columns
  for (let hopIndex = 0; hopIndex < hopSubgraphs.length; hopIndex++) {
    const { center, subgraph } = hopSubgraphs[hopIndex];
    const isOrigin = hopIndex === 0;
    
    // Center column for this hop
    const centerLabel = generateColumnLabel("center", hopIndex, totalHops);
    const centerColumn = createHierarchicalColumn(
      controller,
      centerLabel,
      [center],
      "center",
      "No artifact",
      "center",
      connectionScore,
      hopIndex
    );
    
    // Add hop-specific styling
    if (!isOrigin) {
      centerColumn.classList.add("hop-center");
    }
    centerColumn.dataset.hopIndex = String(hopIndex);
    centerColumn.dataset.columnRole = "center";
    layoutRoot.appendChild(centerColumn);
    
    // Collect alignment guides from this center column
    const guides = controller.collectCenterAlignmentGuides(centerColumn);
    
    // Update the previous dependencies column with proper alignment
    // (First dependencies column was created without guides)
    if (hopIndex === 0 && depColumn) {
      // Re-sort dependencies column based on center guides
      // For now, we accept the initial order; proper re-sorting would require DOM manipulation
    }
    
    // Dependents column for this hop
    // Skip the dependents column for the LAST hop (destination) in multi-hop paths
    // because "Via N" is misleading — the path ends at the destination, not via its dependents
    const isLastHop = hopIndex === totalHops - 1;
    if (isLastHop && totalHops > 1) {
      // Destination reached — don't show its dependents as "Via" nodes
      continue;
    }
    
    const inboundNodes = subgraph.nodes.filter(node => subgraph.inboundIds.has(node.id));
    const dependentsLabel = generateColumnLabel("downstream", hopIndex, totalHops);
    
    const dependentsColumn = createStackedColumn(
      controller,
      dependentsLabel,
      inboundNodes,
      "inbound",
      hopIndex < totalHops - 1 ? "Via next hop" : "No dependents",
      guides,
      "right",
      connectionScore,
      hopIndex
    );
    dependentsColumn.dataset.hopIndex = String(hopIndex);
    dependentsColumn.dataset.columnRole = "downstream";
    layoutRoot.appendChild(dependentsColumn);
  }
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

    // Highlight symbols if specified
    if (isOrigin && fromSymbol) {
      highlightSymbolInColumn(centerColumn, fromSymbol);
    }
    if (isDestination && toSymbol) {
      highlightSymbolInColumn(centerColumn, toSymbol);
    }
  }
}

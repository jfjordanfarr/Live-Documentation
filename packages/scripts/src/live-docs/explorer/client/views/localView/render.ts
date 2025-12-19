import type { ExplorerNodePayload, ExplorerPublicSymbol, ExplorerTypeReference } from "../../../shared/types";
import type { DirectoryNode } from "../../types";
import type { DirectoryLayoutPlan } from "../layoutUtils";
import type { LocalViewController } from "./controller";
import type { PathResult, SymbolPin } from "./state";
import type { CenterAlignmentGuides, ColumnRole, LocalSubgraph } from "./types";
import {
  ROOT_KEY,
  buildHierarchy,
  computeDirectoryLayout,
  getDirectoryKey,
  measureDirectoryTree
} from "../layoutUtils";
import {
  computeColumnCount,
  computeGridTemplate,
  generateColumnLabel
} from "./layout-math";

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
    // Always fit viewport to path content (path mode is a fresh visualization)
    controller.applyColumnVerticalCentering(layoutRoot);
    controller.fitMapToContent();
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
 * Renders path mode: a simple linear chain of nodes in the path.
 * 
 * Path mode is used when a FROM-TO pathfinding result is active.
 * To leverage the existing connection drawing infrastructure, we render
 * the path nodes using the same column structure as exploration mode:
 * 
 * For 2-node path (FROM → TO):
 *   - FROM as center column
 *   - TO as downstream (dependents) column
 *   - Edges from the path subgraph are used for connections
 * 
 * For N-node path (FROM → Hop1 → ... → TO):
 *   - Each node gets its own column as in multi-hop mode
 *   - But only edges between adjacent path nodes are shown
 * 
 * This approach reuses the proven connection drawing infrastructure.
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

  // For a 2-node path, render as center + downstream (like exploration mode)
  // This lets the existing single-hop connection drawing work
  if (nodeIds.length === 2) {
    const fromNode = pathSubgraph.nodes[0];
    const toNode = pathSubgraph.nodes[1];

    // Apply path mode class for styling
    layoutRoot.classList.add("path-mode");

    // FROM as center column
    const centerColumn = createHierarchicalColumn(
      controller,
      "FROM",
      [fromNode],
      "center",
      "No artifact",
      "center",
      connectionScore
    );
    centerColumn.classList.add("path-node", "path-origin");
    layoutRoot.appendChild(centerColumn);

    // Collect alignment guides from center for stacked column
    const alignmentGuides = controller.collectCenterAlignmentGuides(centerColumn);

    // TO as downstream (inbound dependents) column
    const downstreamColumn = createStackedColumn(
      controller,
      "TO",
      [toNode],
      "inbound",
      "No destination",
      alignmentGuides,
      "right",
      connectionScore
    );
    downstreamColumn.classList.add("path-node", "path-destination");
    layoutRoot.appendChild(downstreamColumn);

    // Highlight FROM/TO symbols if specified
    if (fromSymbol) {
      highlightSymbolInColumn(centerColumn, fromSymbol);
    }
    if (toSymbol) {
      highlightSymbolInColumn(downstreamColumn, toSymbol);
    }
    return;
  }

  // For N-node paths (3+), render a simple linear chain of center columns
  // Each path node gets exactly ONE column - no duplicates
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

  // Set up for multi-hop connection drawing
  // Build hop subgraphs that include edges to the next hop only
  const hopSubgraphs: Array<{ center: ExplorerNodePayload; subgraph: LocalSubgraph }> = [];
  for (let i = 0; i < pathSubgraph.nodes.length; i++) {
    const node = pathSubgraph.nodes[i];
    
    // Each hop's subgraph contains only edges to/from adjacent path nodes
    const hopLinks = pathSubgraph.links.filter(edge => {
      // Include edges connecting to the next node in path
      if (i < pathSubgraph.nodes.length - 1) {
        const nextNode = pathSubgraph.nodes[i + 1];
        if ((edge.sourceId === node.id && edge.targetId === nextNode.id) ||
            (edge.targetId === node.id && edge.sourceId === nextNode.id)) {
          return true;
        }
      }
      // Include edges connecting to the previous node in path
      if (i > 0) {
        const prevNode = pathSubgraph.nodes[i - 1];
        if ((edge.sourceId === node.id && edge.targetId === prevNode.id) ||
            (edge.targetId === node.id && edge.sourceId === prevNode.id)) {
          return true;
        }
      }
      return false;
    });

    const hopSubgraph: LocalSubgraph = {
      center: node,
      nodes: [node],
      links: hopLinks,
      inboundIds: new Set(hopLinks.filter(e => e.targetId === node.id).map(e => e.sourceId)),
      outboundIds: new Set(hopLinks.filter(e => e.sourceId === node.id).map(e => e.targetId))
    };

    hopSubgraphs.push({ center: node, subgraph: hopSubgraph });
  }

  // Store hop subgraphs for multi-hop connection drawing
  controller.setMultiHopSubgraphs(hopSubgraphs);
}

/**
 * Highlights a specific symbol row in a column.
 * Used in path mode to auto-highlight FROM/TO symbols.
 */
function highlightSymbolInColumn(column: HTMLElement, symbol: string): void {
  const normalizedSymbol = symbol.toLowerCase();
  column.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
    const rowSymbol = row.dataset.symbol?.toLowerCase();
    if (rowSymbol === normalizedSymbol) {
      row.classList.add("symbol-pinned");
    }
  });
}

function createHierarchicalColumn(
  controller: LocalViewController,
  label: string,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound" | "center",
  emptyLabel: string,
  position: "left" | "center" | "right",
  connectionScore: Map<string, number>,
  hopIndex?: number
): HTMLElement {
  const column = document.createElement("div");
  column.className = `local-column ${direction}`;
  column.dataset.direction = direction;
  column.dataset.position = position;

  const heading = document.createElement("div");
  heading.className = "local-column-label";
  heading.textContent = label;
  column.appendChild(heading);

  if (direction === "center") {
    if (nodes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "local-column-empty";
      empty.textContent = emptyLabel;
      column.appendChild(empty);
      return column;
    }
    const focusSurface = document.createElement("div");
    focusSurface.className = "local-focus-surface";
    nodes.forEach(node => {
      const card = createNodeCard(controller, node, "center", hopIndex);
      card.classList.add("focus-node");
      focusSurface.appendChild(card);
    });
    column.appendChild(focusSurface);
    return column;
  }

  const surface = renderLayoutForNodes(controller, nodes, direction, connectionScore);
  if (!surface) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = emptyLabel;
    column.appendChild(empty);
    return column;
  }

  column.appendChild(surface);
  return column;
}

function createStackedColumn(
  controller: LocalViewController,
  label: string,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound",
  emptyLabel: string,
  guides: CenterAlignmentGuides,
  position: "left" | "right",
  connectionScore: Map<string, number>,
  hopIndex?: number
): HTMLElement {
  const column = document.createElement("div");
  column.className = `local-column ${direction} local-column--stacked`;
  column.dataset.direction = direction;
  column.dataset.position = position;

  const heading = document.createElement("div");
  heading.className = "local-column-label";
  heading.textContent = label;
  column.appendChild(heading);

  const eligibleNodes = nodes.filter(node => controller.shouldIncludeNode(node));
  if (eligibleNodes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = emptyLabel;
    column.appendChild(empty);
    return column;
  }

  const stack = document.createElement("div");
  stack.className = "local-stack";

  const grouped = new Map<
    string,
    {
      nodes: Array<{ node: ExplorerNodePayload; alignment: number; weight: number }>;
      order: number;
    }
  >();

  eligibleNodes.forEach(node => {
    const alignment = computeDirectionalAlignmentValue(controller, node, direction, guides);
    const weight = connectionScore.get(node.id) ?? 0;
    const key = getDirectoryKey(node);
    if (!grouped.has(key)) {
      grouped.set(key, {
        nodes: [],
        order: Number.POSITIVE_INFINITY
      });
    }
    const group = grouped.get(key)!;
    group.nodes.push({ node, alignment, weight });
    if (Number.isFinite(alignment)) {
      group.order = Math.min(group.order, alignment);
    }
  });

  const orderedGroups = Array.from(grouped.entries())
    .map(([path, group]) => {
      const nodesWithOrder = group.nodes.slice().sort((a, b) => {
        const aAlignment = Number.isFinite(a.alignment) ? a.alignment : Number.POSITIVE_INFINITY;
        const bAlignment = Number.isFinite(b.alignment) ? b.alignment : Number.POSITIVE_INFINITY;
        if (aAlignment !== bAlignment) {
          return aAlignment - bAlignment;
        }
        if (b.weight !== a.weight) {
          return b.weight - a.weight;
        }
        return a.node.name.localeCompare(b.node.name);
      });
      const displayName = path === ROOT_KEY ? "(root)" : path.split("/").filter(Boolean).pop() ?? "(root)";
      const orderValue = Number.isFinite(group.order) ? group.order : Number.POSITIVE_INFINITY;
      return {
        path,
        displayName,
        order: orderValue,
        nodes: nodesWithOrder
      };
    })
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.displayName.localeCompare(b.displayName);
    });

  orderedGroups.forEach(group => {
    const groupElement = document.createElement("div");
    groupElement.className = "local-stack-group";

    const shouldShowLabel = !(group.path === ROOT_KEY && orderedGroups.length === 1);
    if (shouldShowLabel) {
      const labelElement = document.createElement("div");
      labelElement.className = "local-stack-group__label";
      labelElement.textContent = group.displayName;
      groupElement.appendChild(labelElement);
    }

    const content = document.createElement("div");
    content.className = "local-stack-group__content";
    // Map edge direction to column role:
    // - "outbound" edges → "upstream" column (dependencies — data flows FROM these)
    // - "inbound" edges → "downstream" column (dependents — data flows TO these)
    const columnRole: ColumnRole = direction === "outbound" ? "upstream" : "downstream";
    group.nodes.forEach(entry => {
      const card = createNodeCard(controller, entry.node, columnRole, hopIndex);
      card.classList.add("layout-node", "stacked-node");
      card.dataset.direction = direction;
      content.appendChild(card);
    });
    groupElement.appendChild(content);
    stack.appendChild(groupElement);
  });

  column.appendChild(stack);
  return column;
}

function computeDirectionalAlignmentValue(
  controller: LocalViewController,
  node: ExplorerNodePayload,
  direction: "inbound" | "outbound",
  guides: CenterAlignmentGuides
): number {
  const subgraph = controller.currentSubgraph;
  if (!subgraph) {
    return Number.POSITIVE_INFINITY;
  }

  const relatedEdges = subgraph.links.filter(edge => {
    if (direction === "inbound") {
      return edge.direction === "inbound" && edge.sourceId === node.id;
    }
    return edge.direction === "outbound" && edge.targetId === node.id;
  });

  const anchorPositions: number[] = [];
  relatedEdges.forEach(edge => {
    const centerNodeId = direction === "inbound" ? edge.targetId : edge.sourceId;
    if (!centerNodeId) {
      return;
    }
    const anchorDirection = direction === "inbound" ? "outbound" : "inbound";
    const symbol = direction === "inbound" ? edge.targetSymbol : edge.sourceSymbol;
    const anchorY = controller.lookupCenterAnchorPosition(guides, centerNodeId, anchorDirection, symbol);
    if (anchorY !== null && Number.isFinite(anchorY)) {
      anchorPositions.push(anchorY);
    }
  });

  if (anchorPositions.length > 0) {
    const sum = anchorPositions.reduce((acc, value) => acc + value, 0);
    return sum / anchorPositions.length;
  }

  const { state } = controller.options;
  const focusFallback = state.selectedNode ? guides.cardCenters.get(state.selectedNode.id) : undefined;
  return focusFallback !== undefined ? focusFallback : Number.POSITIVE_INFINITY;
}

function createNodeCard(
  controller: LocalViewController,
  node: ExplorerNodePayload,
  columnRole: ColumnRole,
  hopIndex?: number
): HTMLElement {
  const card = document.createElement("div");
  card.className = "node-card";
  card.dataset.id = node.id;
  card.dataset.columnRole = columnRole;
  if (hopIndex !== undefined) {
    card.dataset.hopIndex = String(hopIndex);
  }
  card.title = node.codeRelativePath;
  card.tabIndex = 0;

  const { state, testCoverage } = controller.options;

  if (state.selectedNode && state.selectedNode.id === node.id) {
    card.classList.add("selected", "local-focus");
  }

  // Use hop-aware registration when hopIndex is provided
  const registerAnchor = hopIndex !== undefined
    ? (key: string, element: HTMLElement) => controller.registerAnchorWithHop(node.id, columnRole, hopIndex, key, element)
    : (key: string, element: HTMLElement) => controller.registerAnchor(node.id, columnRole, key, element);

  registerAnchor("card", card);

  const isAsset = (node.archetype || "").toLowerCase() === "asset";

  // For assets: add node-wide inbound AND outbound hubs since they don't have symbol rows
  if (isAsset) {
    const inboundHub = document.createElement("div");
    inboundHub.className = "symbol-anchor hub inbound";
    card.appendChild(inboundHub);
    registerAnchor("inbound:*", inboundHub);

    const outboundHub = document.createElement("div");
    outboundHub.className = "symbol-anchor hub outbound";
    card.appendChild(outboundHub);
    registerAnchor("outbound:*", outboundHub);
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
  }

  const header = document.createElement("div");
  header.className = "node-title";
  header.textContent = node.name;
  card.appendChild(header);

  const pathElement = document.createElement("div");
  pathElement.className = "node-path";
  pathElement.textContent = node.codeRelativePath;
  card.appendChild(pathElement);

  card.appendChild(createSymbolSection(controller, node, columnRole, hopIndex));

  if (!controller.isTestNode(node) && state.filters.showTests) {
    const backing = testCoverage.get(node.id);
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
  directory.textContent = getDirectoryKey(node) === ROOT_KEY ? "(root)" : getDirectoryKey(node);
  card.appendChild(directory);

  card.addEventListener("click", event => {
    event.stopPropagation();
    // Clear any pinned symbol when clicking on a card (but not on a symbol row, which handles its own clicks)
    controller.clearPinnedSymbol();
    void controller.selectNode(node);
  });

  card.addEventListener("dblclick", event => {
    event.stopPropagation();
    void controller.recenterNode(node);
  });

  return card;
}

function createSymbolSection(
  controller: LocalViewController,
  node: ExplorerNodePayload,
  columnRole: ColumnRole,
  hopIndex?: number
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "node-symbols";

  // Use hop-aware registration when hopIndex is provided
  const registerAnchor = hopIndex !== undefined
    ? (key: string, element: HTMLElement) => controller.registerAnchorWithHop(node.id, columnRole, hopIndex, key, element)
    : (key: string, element: HTMLElement) => controller.registerAnchor(node.id, columnRole, key, element);

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

  node.publicSymbols.forEach(symbol => {
    const extended = extendedByName.get(symbol);
    const typeRefs = extended?.typeReferences;
    const hasTypeRefs = typeRefs && typeRefs.length > 0;
    const hasResolvedTypeRefs = hasTypeRefs && typeRefs.some(ref => ref.isResolved);

    // Wrapper element for hover targeting (uses display: contents to preserve grid layout)
    const symbolRow = document.createElement("div");
    symbolRow.className = "symbol-row";
    symbolRow.dataset.nodeId = node.id;
    symbolRow.dataset.symbol = symbol;

    // Add hover handlers for connection highlighting
    symbolRow.addEventListener("mouseenter", () => {
      controller.highlightSymbolConnections(node.id, symbol);
    });
    symbolRow.addEventListener("mouseleave", () => {
      controller.clearSymbolHighlight();
    });
    // Add click handler for "sticky" pinned highlighting (useful for mobile & exploring large files)
    symbolRow.addEventListener("click", (event) => {
      event.stopPropagation();
      controller.togglePinnedSymbol(node.id, symbol);
    });

    const inboundAnchor = document.createElement("div");
    inboundAnchor.className = "symbol-anchor dot inbound";
    inboundAnchor.dataset.symbol = symbol;
    symbolRow.appendChild(inboundAnchor);
    registerAnchor(`inbound:${symbol}`, inboundAnchor);

    const labelWrapper = document.createElement("div");
    labelWrapper.className = "symbol-label-wrapper";

    const label = document.createElement("div");
    label.className = "symbol-label";
    label.textContent = symbol;
    labelWrapper.appendChild(label);

    // Add type reference indicator if present
    if (hasTypeRefs && controller.options.state.tuning.visual.showTypeBadges) {
      const typeIndicator = createTypeReferenceIndicator(controller, typeRefs);
      labelWrapper.appendChild(typeIndicator);
    }

    // If there are resolved type refs, make the label visually indicate it
    // But DON'T add a click handler here — badge click will handle navigation
    // Symbol row click will just toggle the pin (handled by the row's click handler)
    if (hasResolvedTypeRefs) {
      labelWrapper.classList.add("has-type-link");
      const firstResolved = typeRefs.find(ref => ref.isResolved);
      if (firstResolved?.targetId) {
        labelWrapper.dataset.targetId = firstResolved.targetId;
        labelWrapper.dataset.targetAnchor = firstResolved.targetAnchor ?? "";
        // Double-click still recenters on the target node
        labelWrapper.addEventListener("dblclick", event => {
          event.stopPropagation();
          const targetNode = controller.options.nodesById.get(firstResolved.targetId!);
          if (targetNode) {
            void controller.recenterNode(targetNode);
          }
        });
      }
    }

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

    // Add hover handlers for connection highlighting
    internalsRow.addEventListener("mouseenter", () => {
      controller.highlightSymbolConnections(node.id, "__internals__");
    });
    internalsRow.addEventListener("mouseleave", () => {
      controller.clearSymbolHighlight();
    });
    // Add click handler for "sticky" pinned highlighting
    internalsRow.addEventListener("click", (event) => {
      event.stopPropagation();
      controller.togglePinnedSymbol(node.id, "__internals__");
    });

    const internalsInbound = document.createElement("div");
    internalsInbound.className = "symbol-anchor dot inbound internals-anchor";
    internalsInbound.dataset.symbol = "__internals__";
    internalsRow.appendChild(internalsInbound);
    registerAnchor("inbound:__internals__", internalsInbound);
    registerAnchor("inbound:*", internalsInbound);

    const internalsLabel = document.createElement("div");
    internalsLabel.className = "symbol-label-wrapper internals-label";
    internalsLabel.innerHTML = `<div class="symbol-label internals-text">⬛ Internals</div>`;
    internalsLabel.title = "Internal/private implementation — data flows in but isn't exposed as public symbols";
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
 * Creates a type reference indicator element showing what types a symbol references.
 */
function createTypeReferenceIndicator(
  controller: LocalViewController,
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
    const badge = createTypeBadge(controller, returnRefs, "→", "return");
    badges.push(badge);
  }

  if (paramRefs.length > 0) {
    const badge = createTypeBadge(controller, paramRefs, "←", "param");
    badges.push(badge);
  }

  if (extendsRefs.length > 0) {
    const badge = createTypeBadge(controller, extendsRefs, "⊲", "extends");
    badges.push(badge);
  }

  if (implementsRefs.length > 0) {
    const badge = createTypeBadge(controller, implementsRefs, "◇", "implements");
    badges.push(badge);
  }

  for (const badge of badges) {
    indicator.appendChild(badge);
  }

  return indicator;
}

/**
 * Creates a single type badge element for a group of type references.
 */
function createTypeBadge(
  controller: LocalViewController,
  refs: ExplorerTypeReference[],
  icon: string,
  kind: string
): HTMLElement {
  const badge = document.createElement("span");
  badge.className = `type-badge type-badge-${kind}`;

  const hasResolved = refs.some(r => r.isResolved);
  if (hasResolved) {
    badge.classList.add("type-badge-resolved");
  }

  const typeNames = refs.map(r => r.typeName).join(", ");
  badge.title = `${kind}: ${typeNames}`;
  badge.textContent = icon;

  // Make resolved badges clickable to navigate to the type
  if (hasResolved) {
    const firstResolved = refs.find(r => r.isResolved);
    if (firstResolved?.targetId) {
      badge.classList.add("clickable");
      badge.addEventListener("click", _event => {
        // Don't stop propagation - let the row's click handler also fire to toggle pin
        const targetNode = controller.options.nodesById.get(firstResolved.targetId!);
        if (targetNode) {
          void controller.focusSidebar(targetNode);
        }
      });
      badge.addEventListener("dblclick", event => {
        event.stopPropagation();
        const targetNode = controller.options.nodesById.get(firstResolved.targetId!);
        if (targetNode) {
          void controller.recenterNode(targetNode);
        }
      });
    }
  }

  return badge;
}

function renderLayoutForNodes(
  controller: LocalViewController,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound" | "center",
  connectionScore: Map<string, number>
): HTMLElement | null {
  const eligibleNodes = direction === "center" ? nodes.slice() : nodes.filter(node => controller.shouldIncludeNode(node));
  if (eligibleNodes.length === 0) {
    return null;
  }

  const hierarchy = buildHierarchy(eligibleNodes);
  const scoreCache = new Map<string, number>();
  const computeScore = (dir: DirectoryNode): number => {
    const cached = scoreCache.get(dir.path);
    if (cached !== undefined) {
      return cached;
    }
    let score = 0;
    dir.nodes.forEach(node => {
      score += connectionScore.get(node.id) ?? 0;
    });
    dir.children.forEach(child => {
      score += computeScore(child);
    });
    scoreCache.set(dir.path, score);
    return score;
  };

  reorderDirectory(hierarchy, computeScore, connectionScore);

  const measure = measureDirectoryTree(hierarchy);
  if (measure.totalNodes === 0) {
    return null;
  }

  const layout = computeDirectoryLayout(measure);

  const surface = document.createElement("div");
  surface.className = "layout-surface local-surface";
  surface.dataset.direction = direction;
  surface.style.position = "relative";
  surface.style.width = `${layout.width}px`;
  surface.style.height = `${layout.height}px`;
  surface.style.minWidth = `${layout.width}px`;
  surface.style.minHeight = `${layout.height}px`;

  const positionElement = (
    element: HTMLElement,
    rect: { x: number; y: number; width: number; height: number },
    origin: { x: number; y: number }
  ): void => {
    element.style.position = "absolute";
    element.style.left = `${rect.x - origin.x}px`;
    element.style.top = `${rect.y - origin.y}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
  };

  const renderDirectoryPlan = (
    plan: DirectoryLayoutPlan,
    parentPlan: DirectoryLayoutPlan | null,
    host: HTMLElement
  ): void => {
    const element = document.createElement("div");
    element.className =
      plan.depth === 0 ? "layout-box layout-box--root local-layout-box" : "layout-box local-layout-box";
    element.dataset.direction = direction;
    element.dataset.clusterPath = plan.path;
    element.setAttribute("role", "region");
    element.setAttribute("aria-label", `Cluster ${plan.path === ROOT_KEY ? "root" : plan.name}`);
    element.tabIndex = 0;
    element.title = plan.path === ROOT_KEY ? "root" : plan.path;
    if (plan.collapsedAncestors.length > 0) {
      element.dataset.collapsedAncestors = plan.collapsedAncestors.map(entry => entry.path).join(",");
    }

    const origin = parentPlan ? { x: parentPlan.contentRect.x, y: parentPlan.contentRect.y } : { x: 0, y: 0 };
    positionElement(element, plan.rect, origin);

    const showLabel = plan.depth > 0 || plan.path === ROOT_KEY;
    if (showLabel) {
      const heading = document.createElement("div");
      heading.className = "layout-box__label";
      heading.textContent = plan.path === ROOT_KEY ? "(root)" : plan.displayName;
      element.appendChild(heading);
    }

    const content = document.createElement("div");
    content.className = "layout-box__content";
    positionElement(content, plan.contentRect, { x: plan.rect.x, y: plan.rect.y });
    element.appendChild(content);
    host.appendChild(element);

    if (plan.fileArea && plan.fileArea.nodes.length > 0) {
      const nodeOrigin = { x: plan.contentRect.x, y: plan.contentRect.y };
      // Map edge direction to column role for anchor registration
      const columnRole: ColumnRole = direction === "center" ? "center"
        : direction === "outbound" ? "upstream" : "downstream";
      plan.fileArea.nodes.forEach(nodePlan => {
        const card = createNodeCard(controller, nodePlan.node, columnRole);
        card.classList.add("layout-node");
        card.dataset.direction = direction;
        positionElement(card, nodePlan.rect, nodeOrigin);
        content.appendChild(card);
      });
    }

    plan.directories.forEach(child => {
      renderDirectoryPlan(child, plan, content);
    });
  };

  renderDirectoryPlan(layout.root, null, surface);
  return surface;
}

function reorderDirectory(
  dir: DirectoryNode,
  computeScore: (dir: DirectoryNode) => number,
  connectionScore: Map<string, number>
): void {
  const entries = Array.from(dir.children.entries());
  entries.forEach(([, child]) => reorderDirectory(child, computeScore, connectionScore));
  entries.sort(([, a], [, b]) => {
    const weightDelta = computeScore(b) - computeScore(a);
    if (weightDelta !== 0) {
      return weightDelta;
    }
    return a.name.localeCompare(b.name);
  });
  dir.children.clear();
  entries.forEach(([key, child]) => {
    dir.children.set(key, child);
  });
  dir.nodes.sort((a, b) => {
    const weightDelta = (connectionScore.get(b.id) ?? 0) - (connectionScore.get(a.id) ?? 0);
    if (weightDelta !== 0) {
      return weightDelta;
    }
    return a.name.localeCompare(b.name);
  });
}

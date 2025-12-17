import type {
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../../shared/types";
import { requireElement } from "../../dom";
import {
  buildNormalizedAnchorKey,
  normalizeSymbolIdentifier,
  tryBuildNormalizedKeyFromAnchorKey
} from "../symbolAnchors";
import { drawConnections } from "./connections";
import { renderLocalView } from "./render";
import {
  clearAnchorRegistry,
  createRuntime,
  getAnchor as fetchAnchor,
  registerAnchor as storeAnchor
} from "./runtime";
import type {
  Bounds,
  CenterAlignmentGuides,
  ColumnRole,
  LocalViewApi,
  LocalViewOptions,
  LayoutExtents,
  LocalSubgraph,
  MapTransform
} from "./types";

export class LocalViewController implements LocalViewApi {
  readonly options: LocalViewOptions;
  readonly runtime = createRuntime(
    requireElement<HTMLDivElement>("view-map"),
    requireElement<HTMLDivElement>("map-container"),
    requireElement<HTMLDivElement>("map-connections")
  );

  private readonly viewport = this.runtime.viewport;
  private readonly container = this.runtime.container;
  private readonly overlay = this.runtime.overlay;

  /** Tracks which symbol is "pinned" (sticky highlight). Format: "nodeId:symbol" or null */
  private pinnedSymbol: string | null = null;

  private readonly handleWindowMouseMove = (event: MouseEvent): void => {
    const { state } = this.options;
    const lastDragPosition = this.runtime.lastDragPosition;
    if (!this.isDragging || !lastDragPosition || state.view !== "map") {
      return;
    }
    event.preventDefault();
    const now = performance.now();
    const deltaX = event.clientX - lastDragPosition.x;
    const deltaY = event.clientY - lastDragPosition.y;
    this.mapTransform = {
      x: this.mapTransform.x + deltaX,
      y: this.mapTransform.y + deltaY,
      k: this.mapTransform.k
    };
    this.updateMapTransform();
    const elapsed = Math.max(1, now - lastDragPosition.time);
    this.runtime.dragVelocity = {
      x: deltaX / elapsed,
      y: deltaY / elapsed
    };
    this.runtime.lastDragPosition = { x: event.clientX, y: event.clientY, time: now };
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    const { state } = this.options;
    if (state.view !== "map") {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      this.mapUserAdjusted = true;
      this.cancelInertia();
      const viewportRect = this.viewport.getBoundingClientRect();
      this.zoomAtPoint(
        event.clientX - viewportRect.left,
        event.clientY - viewportRect.top,
        -event.deltaY * 0.0015
      );
      return;
    }

    event.preventDefault();
    this.mapUserAdjusted = true;
    this.cancelInertia();
    this.mapTransform = {
      x: this.mapTransform.x - event.deltaX,
      y: this.mapTransform.y - event.deltaY,
      k: this.mapTransform.k
    };
    this.updateMapTransform();
  };

  private readonly handleWindowMouseUp = (): void => {
    if (!this.isDragging) {
      return;
    }
    this.isDragging = false;
    this.viewport.style.cursor = "grab";
    document.body.classList.remove("dragging");
    const lastDragPosition = this.runtime.lastDragPosition;
    if (!lastDragPosition) {
      return;
    }
    const vx = this.runtime.dragVelocity.x * 16;
    const vy = this.runtime.dragVelocity.y * 16;
    if (Math.abs(vx) > 0.4 || Math.abs(vy) > 0.4) {
      this.startInertia(vx, vy);
    }
  };

  constructor(options: LocalViewOptions) {
    this.options = options;
    this.container.classList.add("cluster-host", "local-map-host");
    this.viewport.style.cursor = "grab";
    this.bindPointerEvents();
    this.bindWheelEvents();
  }

  render(): void {
    renderLocalView(this);
  }

  drawConnections(): void {
    drawConnections({
      runtime: this.runtime,
      state: this.options.state,
      svgNamespace: this.svgNamespace,
      getAnchor: (nodeId, columnRole, direction, symbol) => this.getAnchor(nodeId, columnRole, direction, symbol),
      measureLayoutExtents: () => this.measureLayoutExtents(),
      getCenterCardBounds: () => this.getCenterCardBounds()
    });
  }

  highlightSelection(): void {
    const { state } = this.options;
    this.container.querySelectorAll<HTMLElement>(".node-card").forEach(element => {
      const id = element.dataset.id;
      if (!state.selectedNode || !id) {
        element.classList.remove("selected", "local-focus");
        return;
      }
      if (id === state.selectedNode.id) {
        element.classList.add("selected", "local-focus");
      } else {
        element.classList.remove("local-focus");
        element.classList.remove("selected");
      }
    });
  }

  /**
   * Highlights connections related to a hovered symbol by dimming unrelated elements.
   * Called when a symbol row gains hover focus.
   * 
   * Edge structure reminder:
   * - sourceId/sourceSymbol: the node+symbol where the edge originates (consuming side)
   * - targetId/targetSymbol: the node+symbol being referenced (providing side)
   * - For cross-file edges, one of sourceId/targetId is the center node
   * 
   * Symbol format note:
   * - Symbol rows store display names: "collectIdentifierUsage"
   * - Cross-file edges store slugified anchors: "symbol-collectidentifierusage"
   * - Self-loop edges store display names: "OracleEdge"
   * - The special "__internals__" symbol represents private implementation
   * We normalize everything to lowercase for matching.
   * 
   * Special cases:
   * - Hovering "__internals__" on center: highlight all edges that have no targetSymbol
   *   (connections into internal implementation)
   * - Hovering "__internals__" on a neighbor: highlight the symbol on center that connects to it
   */
  highlightSymbolConnections(nodeId: string, symbol: string, fromPin = false): void {
    const { currentSubgraph, options } = this;
    if (!currentSubgraph) return;

    // If a symbol is pinned and this isn't the pin-triggering call, suppress hover
    if (this.pinnedSymbol && !fromPin) return;

    const centerId = currentSubgraph.center.id;

    // Get dimming values from tuning config
    const dimSymbols = options.state.tuning.localMap?.hoverDimSymbols ?? 0.5;
    const dimConnections = options.state.tuning.localMap?.hoverDimConnections ?? 0.1;

    // Apply CSS custom properties for dimming
    this.container.style.setProperty("--hover-dim-symbols", String(dimSymbols));
    this.container.style.setProperty("--hover-dim-connections", String(dimConnections));

    // Normalize the hovered symbol for matching
    const isInternalsHover = symbol === "__internals__";
    const normalizedHoverSymbol = isInternalsHover ? "__internals__" : (normalizeSymbolIdentifier(symbol) ?? symbol.toLowerCase());

    // Helper to normalize edge symbol (handles both slugified anchors and display names)
    // Must be consistent with the normalization used for row symbols below!
    const normalizeEdgeSymbol = (sym: string | undefined): string => {
      if (!sym) return "";
      // Use the same normalizeSymbolIdentifier function for consistency
      return normalizeSymbolIdentifier(sym) ?? sym.toLowerCase();
    };

    // Helper to check if an edge symbol matches "Internals" (empty or undefined target)
    const isInternalsEdge = (edgeTargetSymbol: string | undefined): boolean => {
      return !edgeTargetSymbol || edgeTargetSymbol === "";
    };

    // Find all edges that involve this symbol on this node
    let relatedEdges: typeof currentSubgraph.links;

    if (isInternalsHover && nodeId === centerId) {
      // Hovering Internals on the CENTER node:
      // Find edges where center's receiving end goes to Internals (no specific symbol).
      // - For dependencies (outbound edges): center is SOURCE, its sourceSymbol is the consumer
      // - For dependents (inbound edges): center is TARGET, its targetSymbol is the consumer
      relatedEdges = currentSubgraph.links.filter(edge => {
        // Outbound edges: center → neighbor (center imports from dependency)
        // Center's inbound pin connects to sourceSymbol
        const isDependencyToInternals = edge.sourceId === centerId && isInternalsEdge(edge.sourceSymbol);
        // Inbound edges: neighbor → center (dependent imports from center)
        // Center's outbound pin connects to targetSymbol
        const isDependentFromInternals = edge.targetId === centerId && isInternalsEdge(edge.targetSymbol);
        return isDependencyToInternals || isDependentFromInternals;
      });
    } else if (isInternalsHover) {
      // Hovering Internals on a NEIGHBOR node:
      // Internals represents "all the internal code of this file", so highlight ALL edges
      // that involve this neighbor - whether they have specific symbols or not.
      // This shows which center symbols depend on (or are depended upon by) this neighbor.
      relatedEdges = currentSubgraph.links.filter(edge => {
        return edge.sourceId === nodeId || edge.targetId === nodeId;
      });
    } else {
      // Normal symbol hover
      relatedEdges = currentSubgraph.links.filter(edge => {
        const edgeSourceSymbol = normalizeEdgeSymbol(edge.sourceSymbol);
        const edgeTargetSymbol = normalizeEdgeSymbol(edge.targetSymbol);
        
        // Check if this node+symbol is on the source side of the edge
        const isSourceMatch = edge.sourceId === nodeId && edgeSourceSymbol === normalizedHoverSymbol;
        // Check if this node+symbol is on the target side of the edge  
        const isTargetMatch = edge.targetId === nodeId && edgeTargetSymbol === normalizedHoverSymbol;
        return isSourceMatch || isTargetMatch;
      });
    }

    // Build sets of related node+symbol pairs for highlighting (using normalized symbols)
    const relatedSymbols = new Set<string>();
    relatedSymbols.add(`${nodeId}:${normalizedHoverSymbol}`); // The hovered symbol itself

    // Build set of related node IDs for card-level highlighting
    const relatedNodeIds = new Set<string>();
    relatedNodeIds.add(nodeId); // The hovered card itself

    relatedEdges.forEach(edge => {
      // Add both endpoints of each related edge
      if (edge.sourceSymbol) {
        relatedSymbols.add(`${edge.sourceId}:${normalizeEdgeSymbol(edge.sourceSymbol)}`);
      } else {
        // No source symbol means it goes to internals
        relatedSymbols.add(`${edge.sourceId}:__internals__`);
      }
      if (edge.targetSymbol) {
        relatedSymbols.add(`${edge.targetId}:${normalizeEdgeSymbol(edge.targetSymbol)}`);
      } else {
        // No target symbol means it goes to internals
        relatedSymbols.add(`${edge.targetId}:__internals__`);
      }

      // Track related nodes for card highlighting
      relatedNodeIds.add(edge.sourceId);
      relatedNodeIds.add(edge.targetId);
    });

    // Add class to container AND overlay to enable dimming mode
    // (Overlay is a sibling, not descendant, so needs its own class)
    this.container.classList.add("symbol-hover-active");
    this.overlay.classList.add("symbol-hover-active");

    // Determine if collapse mode is enabled (based on hover vs. pin state)
    const shouldCollapse = fromPin 
      ? options.state.tuning.localMap.collapseOnPin 
      : options.state.tuning.localMap.collapseOnHover;

    // Identify node-wide exporters: nodes where ALL their edges lack symbol-level info.
    // These are Ruby files, barrel/index files, assets, etc. that export their entire selves.
    // We skip collapse for these cards because they inherently connect as a whole.
    const nodeWideExporterIds = new Set<string>();
    if (shouldCollapse) {
      // Group edges by node ID to analyze each node's edge patterns
      const edgesByNode = new Map<string, Array<typeof currentSubgraph.links[0]>>();
      currentSubgraph.links.forEach(edge => {
        if (!edgesByNode.has(edge.sourceId)) edgesByNode.set(edge.sourceId, []);
        if (!edgesByNode.has(edge.targetId)) edgesByNode.set(edge.targetId, []);
        edgesByNode.get(edge.sourceId)!.push(edge);
        edgesByNode.get(edge.targetId)!.push(edge);
      });
      
      // A node is a "node-wide exporter" if ALL its edges lack symbol info on its side
      edgesByNode.forEach((edges, nodeIdToCheck) => {
        const allEdgesLackSymbol = edges.every(edge => {
          // Check if this node's side of the edge lacks symbol info
          const isSource = edge.sourceId === nodeIdToCheck;
          const symbolOnThisSide = isSource ? edge.sourceSymbol : edge.targetSymbol;
          return !symbolOnThisSide || symbolOnThisSide === "";
        });
        if (allEdgesLackSymbol && edges.length > 0) {
          nodeWideExporterIds.add(nodeIdToCheck);
        }
      });
      
      // Also treat assets as node-wide exporters
      currentSubgraph.nodes.forEach(n => {
        if ((n.archetype || "").toLowerCase() === "asset") {
          nodeWideExporterIds.add(n.id);
        }
      });
    }

    // Track whether we collapsed anything (need to redraw connections if so)
    let didCollapse = false;

    // Mark related symbols as highlighted (across ALL cards, including neighbors)
    this.container.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const rowNodeId = row.dataset.nodeId;
      const rowSymbol = row.dataset.symbol;
      if (rowNodeId && rowSymbol) {
        // Normalize the row's symbol for comparison
        const normalizedRowSymbol = rowSymbol === "__internals__" 
          ? "__internals__" 
          : (normalizeSymbolIdentifier(rowSymbol) ?? rowSymbol.toLowerCase());
        const isRelated = relatedSymbols.has(`${rowNodeId}:${normalizedRowSymbol}`);
        
        if (isRelated) {
          row.classList.add("symbol-highlighted");
        } else if (shouldCollapse && rowNodeId !== centerId) {
          // Collapse unrelated symbols (except on center node).
          // The center node always shows all its symbols so users can explore them.
          // Node-wide exporters (barrel files, assets) are still collapsed if they have
          // no connection to the pinned symbol—we want to show only relevant connections.
          row.classList.add("symbol-collapsed");
          didCollapse = true;
        }
      }
    });

    // Mark related cards as highlighted (for card-level dimming)
    this.container.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
      const cardId = card.dataset.id;
      if (cardId && relatedNodeIds.has(cardId)) {
        card.classList.add("card-highlighted");
      }
    });

    // If we collapsed any symbols, redraw connections so paths to hidden anchors disappear
    // Do this BEFORE marking connection highlights, since drawConnections replaces all paths
    if (didCollapse) {
      this.drawConnections();
    }

    // Mark related connection paths as highlighted
    // For each related edge, find the matching path(s) by data attributes
    // Note: path attributes use empty string for missing symbols (via ?? "")
    relatedEdges.forEach(edge => {
      const sourceSymbol = edge.sourceSymbol ?? "";
      const targetSymbol = edge.targetSymbol ?? "";
      // Build selector to find paths with matching data attributes (kebab-case in HTML)
      const selector = `.connection-path[data-source-id="${edge.sourceId}"][data-target-id="${edge.targetId}"][data-source-symbol="${sourceSymbol}"][data-target-symbol="${targetSymbol}"]`;
      this.overlay.querySelectorAll<SVGPathElement>(selector).forEach(path => {
        path.classList.add("connection-highlighted");
      });
    });
  }

  /**
   * Clears symbol hover highlighting, restoring all elements to normal opacity.
   * If a symbol is pinned, this is a no-op unless force=true.
   */
  clearSymbolHighlight(force = false): void {
    // Don't clear if we have a pinned symbol (unless forced)
    if (this.pinnedSymbol && !force) {
      return;
    }

    // Track if we had any collapsed symbols (need to redraw connections if so)
    const hadCollapsed = this.container.querySelector(".symbol-collapsed") !== null;
    
    this.container.classList.remove("symbol-hover-active");
    this.overlay.classList.remove("symbol-hover-active");
    this.container.querySelectorAll<HTMLElement>(".symbol-highlighted").forEach(el => {
      el.classList.remove("symbol-highlighted");
    });
    this.container.querySelectorAll<HTMLElement>(".symbol-collapsed").forEach(el => {
      el.classList.remove("symbol-collapsed");
    });
    this.container.querySelectorAll<HTMLElement>(".card-highlighted").forEach(el => {
      el.classList.remove("card-highlighted");
    });
    this.overlay.querySelectorAll<SVGPathElement>(".connection-highlighted").forEach(path => {
      path.classList.remove("connection-highlighted");
    });
    this.container.querySelectorAll<HTMLElement>(".symbol-pinned").forEach(el => {
      el.classList.remove("symbol-pinned");
    });

    // If we had collapsed symbols, redraw connections to restore all paths
    if (hadCollapsed) {
      this.drawConnections();
    }
  }

  /**
   * Toggles "pinned" state for a symbol. When pinned, the highlight persists
   * even when the mouse leaves the symbol row. Useful for mobile and for
   * exploring connections in large files.
   * 
   * - If clicking the same symbol that's pinned: unpins it
   * - If clicking a different symbol: pins the new one (replaces old pin)
   * - If no symbol is pinned: pins the clicked symbol
   */
  togglePinnedSymbol(nodeId: string, symbol: string): void {
    const key = `${nodeId}:${symbol}`;
    
    if (this.pinnedSymbol === key) {
      // Clicking the same symbol: unpin and clear
      this.pinnedSymbol = null;
      this.clearSymbolHighlight(true);
    } else {
      // Pin the new symbol (clear any previous pin first)
      this.clearSymbolHighlight(true);
      this.pinnedSymbol = key;
      this.highlightSymbolConnections(nodeId, symbol, true);
      
      // Mark the pinned row visually
      this.container.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
        if (row.dataset.nodeId === nodeId && row.dataset.symbol === symbol) {
          row.classList.add("symbol-pinned");
        }
      });
    }
  }

  /**
   * Checks if a symbol is currently pinned.
   */
  isPinned(nodeId: string, symbol: string): boolean {
    return this.pinnedSymbol === `${nodeId}:${symbol}`;
  }

  /**
   * Clears any pinned symbol without clearing the highlight.
   * Called when recentering to a new node.
   */
  clearPinnedSymbol(): void {
    this.pinnedSymbol = null;
    this.clearSymbolHighlight(true);
  }

  zoomIn(): void {
    this.zoomByFactor(1.2);
  }

  zoomOut(): void {
    this.zoomByFactor(1 / 1.2);
  }


  resetZoom(): void {
    if (!this.runtime.contentRoot) {
      return;
    }
    if (this.runtime.mapInitialTransform) {
      this.animateMapTransform(this.runtime.mapInitialTransform, true);
    } else {
      this.fitMapToContent();
    }
  }

  private startInertia(initialVx: number, initialVy: number): void {
    this.cancelInertia();
    this.mapUserAdjusted = true;
    let vx = initialVx;
    let vy = initialVy;
    const friction = 0.92;
    const step = () => {
      this.mapTransform = {
        x: this.mapTransform.x + vx,
        y: this.mapTransform.y + vy,
        k: this.mapTransform.k
      };
      this.updateMapTransform();
      vx *= friction;
      vy *= friction;
      if (Math.abs(vx) < 0.06 && Math.abs(vy) < 0.06) {
        this.cancelInertia();
        return;
      }
      this.runtime.mapInertiaFrame = requestAnimationFrame(step);
    };
    this.runtime.mapInertiaFrame = requestAnimationFrame(step);
  }

  private cancelInertia(): void {
    if (this.runtime.mapInertiaFrame) {
      cancelAnimationFrame(this.runtime.mapInertiaFrame);
      this.runtime.mapInertiaFrame = 0;
    }
  }

  get svgNamespace(): string {
    return "http://www.w3.org/2000/svg";
  }

  getContainer(): HTMLDivElement {
    return this.container;
  }

  getOverlay(): HTMLDivElement {
    return this.overlay;
  }

  getViewport(): HTMLDivElement {
    return this.viewport;
  }

  get isDragging(): boolean {
    return this.runtime.isDragging;
  }

  set isDragging(value: boolean) {
    this.runtime.isDragging = value;
  }

  get mapTransform(): MapTransform {
    return this.runtime.mapTransform;
  }

  set mapTransform(transform: MapTransform) {
    this.runtime.mapTransform = transform;
  }

  get currentSubgraph(): LocalSubgraph | null {
    return this.runtime.currentSubgraph;
  }

  set currentSubgraph(value: LocalSubgraph | null) {
    this.runtime.currentSubgraph = value;
  }

  get lastCenteredNodeId(): string | null {
    return this.runtime.lastCenteredNodeId;
  }

  set lastCenteredNodeId(value: string | null) {
    this.runtime.lastCenteredNodeId = value;
  }

  get mapHasInitialFit(): boolean {
    return this.runtime.mapHasInitialFit;
  }

  set mapHasInitialFit(value: boolean) {
    this.runtime.mapHasInitialFit = value;
  }

  get mapUserAdjusted(): boolean {
    return this.runtime.mapUserAdjusted;
  }

  set mapUserAdjusted(value: boolean) {
    this.runtime.mapUserAdjusted = value;
  }

  get mapInitialTransform(): MapTransform | null {
    return this.runtime.mapInitialTransform;
  }

  set mapInitialTransform(value: MapTransform | null) {
    this.runtime.mapInitialTransform = value;
  }

  get contentRoot(): HTMLElement | null {
    return this.runtime.contentRoot;
  }

  set contentRoot(value: HTMLElement | null) {
    this.runtime.contentRoot = value;
  }

  registerAnchor(nodeId: string, columnRole: ColumnRole, key: string, element: HTMLElement): void {
    storeAnchor(this.runtime.anchorRegistry, nodeId, columnRole, key, element, keyValue =>
      this.tryBuildNormalizedKey(keyValue)
    );
  }

  clearAnchors(): void {
    clearAnchorRegistry(this.runtime.anchorRegistry);
  }

  getAnchor(nodeId: string, columnRole: ColumnRole, direction: "inbound" | "outbound", symbol?: string): HTMLElement | null {
    return fetchAnchor(this.runtime.anchorRegistry, nodeId, columnRole, direction, symbol, (dir, sym) =>
      this.buildNormalizedAnchorKey(dir, sym)
    );
  }

  buildNormalizedAnchorKey(direction: "inbound" | "outbound", symbol: string): string | null {
    return this.options.state ? this.normalizeSymbol(direction, symbol) : null;
  }

  tryBuildNormalizedKey(anchorKey: string): string | null {
    return this.normalizeAnchorKey(anchorKey);
  }

  scheduleConnectionRedraw(): void {
    requestAnimationFrame(() => this.drawConnections());
  }

  shouldIncludeNode(node: ExplorerNodePayload): boolean {
    const { state } = this.options;
    const archetype = (node.archetype || "").toLowerCase();
    if (archetype === "test" && !state.filters.showTests && node.id !== state.selectedNode?.id) {
      return false;
    }
    if (archetype === "asset" && !state.filters.showAssets && node.id !== state.selectedNode?.id) {
      return false;
    }
    return true;
  }

  isTestNode(node: ExplorerNodePayload | null | undefined): boolean {
    return !!node && (node.archetype || "").toLowerCase() === "test";
  }

  buildLocalSubgraph(center: ExplorerNodePayload): LocalSubgraph {
    return this.createLocalSubgraph(center);
  }

  resolveNode(id: string): ExplorerNodePayload | undefined {
    return this.options.graphData.nodes.find(node => node.id === id);
  }

  async selectNode(node: ExplorerNodePayload): Promise<void> {
    await this.options.onSelectNode(node);
  }

  async recenterNode(node: ExplorerNodePayload): Promise<void> {
    // Clear any pinned symbol when recentering to a new node
    this.clearPinnedSymbol();
    await this.options.onRecenterNode(node);
  }

  async focusSidebar(node: ExplorerNodePayload): Promise<void> {
    await this.options.onFocusSidebar(node);
  }

  measureLayoutExtents(): LayoutExtents | null {
    return this.computeLayoutExtents();
  }

  /**
   * Returns the bounding box of the center column's node card in viewport-layer coordinates.
   * Used for self-loop wraparound path routing.
   */
  getCenterCardBounds(): { left: number; right: number; top: number; bottom: number } | null {
    const centerCard = this.container.querySelector<HTMLElement>(".local-column.center .node-card");
    if (!centerCard || !this.runtime.contentRoot) {
      return null;
    }
    const cardRect = centerCard.getBoundingClientRect();
    const rootRect = this.runtime.contentRoot.getBoundingClientRect();
    const scale = this.mapTransform.k;
    return {
      left: (cardRect.left - rootRect.left) / scale,
      right: (cardRect.right - rootRect.left) / scale,
      top: (cardRect.top - rootRect.top) / scale,
      bottom: (cardRect.bottom - rootRect.top) / scale
    };
  }

  updateMapTransform(): void {
    // Apply transform to the viewport wrapper so container and overlay share the same stacking context
    const viewport = this.runtime.container.parentElement;
    if (viewport) {
      viewport.style.transform = `translate(${this.mapTransform.x}px, ${this.mapTransform.y}px) scale(${this.mapTransform.k})`;
    }
  }

  // Placeholder utilities to be implemented below
  protected normalizeSymbol(direction: "inbound" | "outbound", symbol: string): string | null {
    return buildNormalizedAnchorKey(direction, symbol);
  }

  protected normalizeAnchorKey(key: string): string | null {
    return tryBuildNormalizedKeyFromAnchorKey(key);
  }

  private bindPointerEvents(): void {
    this.viewport.addEventListener("mousedown", event => {
      if ((event.target as HTMLElement | null)?.closest?.(".node-card")) {
        return;
      }
      this.isDragging = true;
      this.mapUserAdjusted = true;
      this.cancelInertia();
      cancelAnimationFrame(this.runtime.mapAnimationFrame);
      this.runtime.lastDragPosition = { x: event.clientX, y: event.clientY, time: performance.now() };
      this.runtime.dragVelocity = { x: 0, y: 0 };
      this.viewport.style.cursor = "grabbing";
      document.body.classList.add("dragging");
    });

    window.addEventListener("mousemove", this.handleWindowMouseMove);
    window.addEventListener("mouseup", this.handleWindowMouseUp);
  }

  private bindWheelEvents(): void {
    this.viewport.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  private zoomByFactor(factor: number): void {
    this.mapUserAdjusted = true;
    this.cancelInertia();
    const viewportRect = this.viewport.getBoundingClientRect();
    this.zoomAtPoint(viewportRect.width / 2, viewportRect.height / 2, Math.log(factor));
  }

  private zoomAtPoint(offsetX: number, offsetY: number, delta: number): void {
    const scaleFactor = Math.exp(delta);
    const nextScale = this.clamp(this.mapTransform.k * scaleFactor, 0.4, 3);
    const localX = (offsetX - this.mapTransform.x) / this.mapTransform.k;
    const localY = (offsetY - this.mapTransform.y) / this.mapTransform.k;
    this.mapTransform = {
      x: offsetX - localX * nextScale,
      y: offsetY - localY * nextScale,
      k: nextScale
    };
    this.updateMapTransform();
  }

  private animateMapTransform(target: MapTransform, suppressUserState = false): void {
    cancelAnimationFrame(this.runtime.mapAnimationFrame);
    const to = {
      x: target.x,
      y: target.y,
      k: this.clamp(target.k, 0.4, 3)
    };
    const from = { ...this.mapTransform };
    const duration = 350;
    const start = performance.now();

    const step = (now: number) => {
      const progress = this.clamp((now - start) / duration, 0, 1);
      const eased = this.easeOutCubic(progress);
      this.mapTransform = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        k: from.k + (to.k - from.k) * eased
      };
      this.updateMapTransform();
      if (progress < 1) {
        this.runtime.mapAnimationFrame = requestAnimationFrame(step);
      } else if (!suppressUserState) {
        this.mapUserAdjusted = true;
      }
    };

    this.runtime.mapAnimationFrame = requestAnimationFrame(step);
  }

  fitMapToContent(): void {
    this.cancelInertia();
    const extents = this.measureLayoutExtents();
    const viewportRect = this.viewport.getBoundingClientRect();

    if (!extents) {
      this.mapTransform = { x: 0, y: 0, k: 1 };
      this.updateMapTransform();
      this.mapHasInitialFit = true;
      this.mapInitialTransform = { ...this.mapTransform };
      this.scheduleConnectionRedraw();
      return;
    }

    const { content, focus } = extents;
    const contentWidth = Math.max(content.width, 1);
    const contentHeight = Math.max(content.height, 1);
    const normalizedWidth = Math.max(Math.ceil(content.right), Math.ceil(contentWidth));
    const normalizedHeight = Math.max(Math.ceil(content.bottom), Math.ceil(contentHeight));

    this.container.style.width = `${normalizedWidth}px`;
    this.container.style.height = `${normalizedHeight}px`;
    this.container.style.minWidth = `${normalizedWidth}px`;
    this.container.style.minHeight = `${normalizedHeight}px`;
    this.overlay.style.width = `${normalizedWidth}px`;
    this.overlay.style.height = `${normalizedHeight}px`;
    this.overlay.style.minWidth = `${normalizedWidth}px`;
    this.overlay.style.minHeight = `${normalizedHeight}px`;

    const horizontalPadding = this.clamp(viewportRect.width * 0.02, 8, 72);
    const verticalPadding = this.clamp(viewportRect.height * 0.025, 8, 72);

    const focusBounds = focus ?? content;
    const focusLeftDistance = Math.max(0, focusBounds.left - content.left);
    const focusRightDistance = Math.max(0, content.right - focusBounds.right);
    const focusTopDistance = Math.max(0, focusBounds.top - content.top);
    const focusBottomDistance = Math.max(0, content.bottom - focusBounds.bottom);

    const horizontalBuffer = Math.max(viewportRect.width * 0.1, 160);
    const verticalBuffer = Math.max(viewportRect.height * 0.16, 140);

    const effectiveWidth = Math.max(
      1,
      Math.min(
        contentWidth,
        focusBounds.width +
          Math.min(focusLeftDistance, horizontalBuffer) +
          Math.min(focusRightDistance, horizontalBuffer)
      )
    );
    const effectiveHeight = Math.max(
      1,
      Math.min(
        contentHeight,
        focusBounds.height +
          Math.min(focusTopDistance, verticalBuffer) +
          Math.min(focusBottomDistance, verticalBuffer)
      )
    );

    const availableScaleX = Math.max((viewportRect.width - horizontalPadding * 2) / effectiveWidth, 0.05);
    const availableScaleY = Math.max((viewportRect.height - verticalPadding * 2) / effectiveHeight, 0.05);
    const autoScale = Math.min(availableScaleX, availableScaleY);
    const scale = this.clamp(Math.min(autoScale * 0.96, 1), 0.6, 1.45);

    const focusCenterX = focusBounds.left + focusBounds.width / 2;
    const focusCenterY = focusBounds.top + focusBounds.height / 2;

    let targetX = viewportRect.width / 2 - focusCenterX * scale;
    let targetY = viewportRect.height / 2 - focusCenterY * scale;

    const minTargetX = viewportRect.width - horizontalPadding - content.right * scale;
    const maxTargetX = horizontalPadding - content.left * scale;
    if (minTargetX <= maxTargetX) {
      targetX = this.clamp(targetX, minTargetX, maxTargetX);
    }

    const minTargetY = viewportRect.height - verticalPadding - content.bottom * scale;
    const maxTargetY = verticalPadding - content.top * scale;
    if (minTargetY <= maxTargetY) {
      targetY = this.clamp(targetY, minTargetY, maxTargetY);
    }

    const target = { x: targetX, y: targetY, k: scale };

    this.animateMapTransform(target, true);
    this.mapHasInitialFit = true;
    this.mapInitialTransform = { ...target };
    this.scheduleConnectionRedraw();
  }

  private computeLayoutExtents(): LayoutExtents | null {
    if (!this.contentRoot) {
      return null;
    }

    return this.withTransformReset(containerRect => {
      const trackedElements = this.contentRoot!.querySelectorAll<HTMLElement>(".layout-node, .layout-box");
      const contentBounds = this.measureElementsBounds(trackedElements, containerRect);
      if (!contentBounds) {
        return null;
      }
      const focusElement =
        this.contentRoot!.querySelector<HTMLElement>(".node-card.local-focus") ??
        this.contentRoot!.querySelector<HTMLElement>(".local-column.center .node-card") ??
        this.contentRoot!.querySelector<HTMLElement>(".node-card");
      const focusBounds = this.measureElementBounds(focusElement, containerRect);

      const computedStyle = getComputedStyle(this.container);
      const paddingLeft = Number.parseFloat(computedStyle.paddingLeft || "0") || 0;
      const paddingTop = Number.parseFloat(computedStyle.paddingTop || "0") || 0;

      const adjustBounds = (bounds: ReturnType<LocalViewController["measureElementsBounds"]>): ReturnType<
        LocalViewController["measureElementsBounds"]
      > => {
        if (!bounds) {
          return null;
        }
        const width = Math.max(bounds.width, 1);
        const height = Math.max(bounds.height, 1);
        const left = Math.max(bounds.left - paddingLeft, 0);
        const top = Math.max(bounds.top - paddingTop, 0);
        const right = left + width;
        const bottom = top + height;
        return { left, top, right, bottom, width, height };
      };

      const content = adjustBounds(contentBounds);
      const focus = adjustBounds(focusBounds);

      return { content: content ?? contentBounds, focus };
    });
  }

  collectCenterAlignmentGuides(column: HTMLElement): CenterAlignmentGuides {
    const anchors = new Map<string, number>();
    const cardCenters = new Map<string, number>();
    const rootRect = this.container.getBoundingClientRect();

    column.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
      const nodeId = card.dataset.id;
      if (!nodeId) {
        return;
      }
      const rect = card.getBoundingClientRect();
      const centerY = (rect.top + rect.bottom) / 2 - rootRect.top;
      cardCenters.set(nodeId, centerY);
    });

    column.querySelectorAll<HTMLElement>(".symbol-anchor").forEach(anchor => {
      const nodeCard = anchor.closest<HTMLElement>(".node-card");
      if (!nodeCard) {
        return;
      }
      const nodeId = nodeCard.dataset.id;
      if (!nodeId) {
        return;
      }
      const direction = anchor.classList.contains("outbound") ? "outbound" : "inbound";
      const symbol = anchor.dataset.symbol ?? "*";
      const rect = anchor.getBoundingClientRect();
      const centerY = (rect.top + rect.bottom) / 2 - rootRect.top;
      anchors.set(this.anchorGuideKey(nodeId, direction, symbol), centerY);
      if (symbol !== "*") {
        const normalizedSymbol = normalizeSymbolIdentifier(symbol);
        if (normalizedSymbol) {
          anchors.set(this.anchorGuideKey(nodeId, direction, normalizedSymbol), centerY);
        }
        const wildcardKey = this.anchorGuideKey(nodeId, direction, "*");
        if (!anchors.has(wildcardKey)) {
          anchors.set(wildcardKey, centerY);
        }
      }
    });

    return { anchors, cardCenters };
  }

  lookupCenterAnchorPosition(
    guides: CenterAlignmentGuides,
    nodeId: string,
    direction: "inbound" | "outbound",
    symbol: string | undefined | null
  ): number | null {
    const attempts: string[] = [];
    if (symbol && symbol.length > 0) {
      attempts.push(this.anchorGuideKey(nodeId, direction, symbol));
      const normalizedSymbol = normalizeSymbolIdentifier(symbol);
      if (normalizedSymbol && normalizedSymbol !== symbol) {
        attempts.push(this.anchorGuideKey(nodeId, direction, normalizedSymbol));
      }
    }
    attempts.push(this.anchorGuideKey(nodeId, direction, "*"));
    for (const attempt of attempts) {
      const match = guides.anchors.get(attempt);
      if (match !== undefined) {
        return match;
      }
    }
    const fallback = guides.cardCenters.get(nodeId);
    return fallback !== undefined ? fallback : null;
  }

  applyColumnVerticalCentering(layoutRoot: HTMLElement): void {
    const columns = Array.from(layoutRoot.querySelectorAll<HTMLElement>(".local-column"));
    if (columns.length === 0) {
      return;
    }

    columns.forEach(column => {
      column.style.marginTop = "0px";
      column.style.marginBottom = "0px";
    });

    this.withTransformReset(() => {
      let maxHeight = 0;
      const columnHeights = new Map<HTMLElement, number>();
      columns.forEach(column => {
        const rect = column.getBoundingClientRect();
        const height = rect.height;
        columnHeights.set(column, height);
        if (Number.isFinite(height)) {
          maxHeight = Math.max(maxHeight, height);
        }
      });

      if (maxHeight <= 0) {
        return null;
      }

      layoutRoot.style.minHeight = `${maxHeight}px`;

      columns.forEach(column => {
        const height = columnHeights.get(column) ?? 0;
        const offset = Math.max((maxHeight - height) / 2, 0);
        column.style.marginTop = `${offset}px`;
        column.style.marginBottom = `${offset}px`;
      });

      return null;
    });
  }

  private anchorGuideKey(
    nodeId: string,
    direction: "inbound" | "outbound",
    symbol: string | undefined | null
  ): string {
    const normalizedSymbol = symbol && symbol.length > 0 ? symbol : "*";
    return `${nodeId}:${direction}:${normalizedSymbol}`;
  }

  private withTransformReset<T>(callback: (containerRect: DOMRect) => T): T {
    const viewport = this.container.parentElement;
    const previousViewportTransform = viewport?.style.transform ?? "";
    if (viewport) {
      viewport.style.transform = "none";
    }
    try {
      const containerRect = this.container.getBoundingClientRect();
      return callback(containerRect);
    } finally {
      if (viewport) {
        viewport.style.transform = previousViewportTransform;
      }
    }
  }

  private measureElementsBounds(elements: Iterable<HTMLElement>, containerRect: DOMRect): Bounds | null {
    let minLeft = Number.POSITIVE_INFINITY;
    let minTop = Number.POSITIVE_INFINITY;
    let maxRight = Number.NEGATIVE_INFINITY;
    let maxBottom = Number.NEGATIVE_INFINITY;
    let hasElement = false;

    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (!Number.isFinite(rect.left) || !Number.isFinite(rect.top)) {
        continue;
      }
      hasElement = true;
      minLeft = Math.min(minLeft, rect.left);
      minTop = Math.min(minTop, rect.top);
      maxRight = Math.max(maxRight, rect.right);
      maxBottom = Math.max(maxBottom, rect.bottom);
    }

    if (!hasElement) {
      return null;
    }

    const width = Math.max(maxRight - minLeft, 1);
    const height = Math.max(maxBottom - minTop, 1);
    const left = minLeft - containerRect.left;
    const top = minTop - containerRect.top;

    return {
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height
    };
  }

  private measureElementBounds(element: HTMLElement | null, containerRect: DOMRect): Bounds | null {
    if (!element) {
      return null;
    }
    return this.measureElementsBounds([element], containerRect);
  }

  private createLocalSubgraph(center: ExplorerNodePayload): LocalSubgraph {
    const neighbors = new Map<string, ExplorerNodePayload>();
    const linkResults: LocalSubgraph["links"] = [];
    const inboundIds = new Set<string>();
    const outboundIds = new Set<string>();

    const resolveLinkEndpoint = (endpoint: ExplorerLinkPayload["source"]): string =>
      this.options.resolveLinkEndpoint(endpoint);

    this.options.graphData.links.forEach(edge => {
      const sourceId = resolveLinkEndpoint(edge.source);
      const targetId = resolveLinkEndpoint(edge.target);
      const kind = edge.kind ?? "dependency";

      if (sourceId === center.id) {
        const neighbor = this.resolveNode(targetId);
        if (neighbor) {
          if (!this.shouldIncludeNode(neighbor) && neighbor.id !== center.id) {
            return;
          }
          neighbors.set(neighbor.id, neighbor);
          outboundIds.add(neighbor.id);
          linkResults.push({
            sourceId,
            targetId,
            direction: "outbound",
            kind,
            sourceSymbol: edge.sourceSymbol,
            targetSymbol: edge.targetSymbol
          });
        }
      } else if (targetId === center.id) {
        const neighbor = this.resolveNode(sourceId);
        if (neighbor) {
          if (!this.shouldIncludeNode(neighbor) && neighbor.id !== center.id) {
            return;
          }
          neighbors.set(neighbor.id, neighbor);
          inboundIds.add(neighbor.id);
          linkResults.push({
            sourceId,
            targetId,
            direction: "inbound",
            kind,
            sourceSymbol: edge.sourceSymbol,
            targetSymbol: edge.targetSymbol
          });
        }
      }
    });

    // Generate self-loop edges from intra-file type references
    // (symbols that reference other symbols in the same file)
    const selfLoopEdges = this.buildSelfLoopEdges(center);
    linkResults.push(...selfLoopEdges);

    return {
      center,
      nodes: [center, ...neighbors.values()],
      links: linkResults,
      inboundIds,
      outboundIds
    };
  }

  /**
   * Build self-loop edges from intra-file type references.
   * When a symbol references another symbol in the same file, we create a self-loop edge.
   * These enable the "French Corset" wraparound bezier visualization.
   */
  private buildSelfLoopEdges(center: ExplorerNodePayload): LocalSubgraph["links"] {
    const selfLoopEdges: LocalSubgraph["links"] = [];
    const seenKeys = new Set<string>();

    const symbols = center.publicSymbolsExtended;
    if (!symbols) return selfLoopEdges;

    // Build a set of symbol names in this file for quick lookup
    const localSymbolNames = new Set(symbols.map(s => s.name));

    for (const symbol of symbols) {
      const typeRefs = symbol.typeReferences;
      if (!typeRefs) continue;

      for (const ref of typeRefs) {
        // Check if this type reference points to a symbol in the same file
        const isSelfReference =
          (ref.isResolved && ref.targetId === center.id) ||
          (!ref.isResolved && localSymbolNames.has(ref.typeName));

        if (isSelfReference) {
          const key = `${center.id}|${center.id}|type-reference|${symbol.name}|${ref.typeName}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          selfLoopEdges.push({
            sourceId: center.id,
            targetId: center.id,
            direction: "outbound",
            kind: "type-reference",
            sourceSymbol: symbol.name,
            targetSymbol: ref.typeName
          });
        }
      }
    }

    return selfLoopEdges;
  }

  private easeOutCubic(t: number): number {
    const p = t - 1;
    return p * p * p + 1;
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }
}

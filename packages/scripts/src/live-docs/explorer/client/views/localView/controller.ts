import type {
  ExplorerNodePayload
} from "../../../shared/types";
import { requireElement } from "../../dom";
import {
  buildNormalizedAnchorKey,
  normalizeSymbolIdentifier,
  tryBuildNormalizedKeyFromAnchorKey
} from "../symbolAnchors";
import { drawConnections } from "./connections";
import {
  computeLayoutExtents,
  computeFitTransform,
  applyContainerDimensions,
  applyColumnVerticalCentering as applyColumnVerticalCenteringFn,
  collectCenterAlignmentGuides as collectCenterAlignmentGuidesFn,
  lookupCenterAnchorPosition as lookupCenterAnchorPositionFn,
  type LayoutExtents,
  type CenterAlignmentGuides
} from "./layout-measure";
import {
  zoomByFactor as zoomByFactorFn,
  animateMapTransform as animateMapTransformFn,
  startInertia as startInertiaFn,
  cancelInertia as cancelInertiaFn,
  handleDragMove,
  handleDragEnd,
  handleWheel as handleWheelFn,
  startDrag
} from "./pan-zoom";
import { renderLocalView } from "./render";
import {
  clearAnchorRegistry,
  createRuntime,
  getAnchor as fetchAnchor,
  getAnchorWithHop as fetchAnchorWithHop,
  registerAnchor as storeAnchor,
  registerAnchorWithHop as storeAnchorWithHop
} from "./runtime";
import {
  type StateStore,
  type LocalMapState,
  type SymbolPin,
  type PathResult,
  createStateStore,
  createInitialState,
  addPin,
  removePin,
  clearPins,
  setHoveredSymbol,
  isSymbolPinned,
  setActivePath as setActivePathAction
} from "./state";
import {
  createLocalSubgraph as createLocalSubgraphFn,
  buildPathSubgraph as buildPathSubgraphFn
} from "./subgraph-builder";
import {
  computeSymbolHighlight,
  applySymbolHighlight,
  clearSymbolHighlightDOM
} from "./symbol-highlight";
import type {
  ColumnRole,
  LocalViewApi,
  LocalViewOptions,
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

  /** 
   * Legacy single-pin state for backward compatibility.
   * @deprecated Use localMapState.pinnedPath instead. Will be removed once multi-hop is stable.
   */
  private pinnedSymbol: string | null = null;

  /**
   * Observable state store for multi-hop pinned path visualization.
   * Contains pinnedPath[], hoveredSymbol, focusedNodeId, and visualization settings.
   */
  readonly localMapState: StateStore<LocalMapState>;

  /** Cleanup function for state subscription */
  private stateUnsubscribe: (() => void) | null = null;

  private readonly handleWindowMouseMove = (event: MouseEvent): void => {
    const { state } = this.options;
    if (!this.isDragging || !this.runtime.lastDragPosition || state.view !== "map") {
      return;
    }
    event.preventDefault();
    handleDragMove(this.runtime, event.clientX, event.clientY, () => this.updateMapTransform());
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    const { state } = this.options;
    if (state.view !== "map") {
      return;
    }
    handleWheelFn(this.runtime, event, () => this.updateMapTransform());
  };

  private readonly handleWindowMouseUp = (): void => {
    if (!this.isDragging) {
      return;
    }
    handleDragEnd(this.runtime, this.viewport, () => this.updateMapTransform());
  };

  constructor(options: LocalViewOptions) {
    this.options = options;
    this.localMapState = createStateStore(createInitialState());
    this.container.classList.add("cluster-host", "local-map-host");
    this.viewport.style.cursor = "grab";
    this.bindPointerEvents();
    this.bindWheelEvents();
    this.subscribeToStateChanges();
  }

  /**
   * Subscribes to localMapState changes for reactive updates.
   * Triggers connection redraws when pinnedPath, hoveredSymbol, or activePath changes.
   */
  private subscribeToStateChanges(): void {
    this.stateUnsubscribe = this.localMapState.subscribe((state, prevState) => {
      // When activePath changes, trigger full re-render for path-mode layout
      if (state.activePath !== prevState.activePath) {
        // Defer render to avoid recursive updates
        requestAnimationFrame(() => this.render());
        return;
      }

      // When pinned path length changes (e.g., going from 1→2 hops or 2→1), trigger full re-render
      // to switch between single-hop and multi-hop layouts
      const lengthChanged = state.pinnedPath.length !== prevState.pinnedPath.length;
      if (lengthChanged && (state.pinnedPath.length > 1 || prevState.pinnedPath.length > 1)) {
        // Defer render to avoid recursive updates
        requestAnimationFrame(() => this.render());
      }
      // Note: We intentionally do NOT scheduleConnectionRedraw when pinnedPath changes for single-hop pins.
      // The togglePinnedSymbol method already handles the full highlight flow including drawConnections.
      // Scheduling an async redraw here would overwrite the path highlights applied by highlightSymbolConnections.
      // Could add more reactive updates here (e.g., hover state changes)
    });
  }

  /**
   * Cleanup method to unsubscribe from state store.
   * Should be called when the controller is disposed.
   */
  dispose(): void {
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
      this.stateUnsubscribe = null;
    }
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
      getAnchorWithHop: (nodeId, columnRole, hopIndex, direction, symbol) => 
        this.getAnchorWithHop(nodeId, columnRole, hopIndex, direction, symbol),
      measureLayoutExtents: () => this.measureLayoutExtents(),
      getCenterCardBounds: () => this.getCenterCardBounds(),
      multiHopData: this.runtime.multiHopSubgraphs ?? undefined,
      activePath: this.localMapState.getState().activePath ?? undefined
    });
  }

  /**
   * Sets multi-hop subgraphs for connection drawing.
   * Called by render.ts during multi-hop column rendering.
   */
  setMultiHopSubgraphs(hopSubgraphs: Array<{ center: ExplorerNodePayload; subgraph: LocalSubgraph }> | null): void {
    if (!hopSubgraphs) {
      this.runtime.multiHopSubgraphs = null;
      return;
    }
    // Convert to MultiHopEntry format
    this.runtime.multiHopSubgraphs = hopSubgraphs.map((entry, index) => ({
      hopIndex: index,
      centerId: entry.center.id,
      subgraph: entry.subgraph
    }));
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
    const hasPinnedPath = this.localMapState.getState().pinnedPath.length > 0;
    if ((this.pinnedSymbol || hasPinnedPath) && !fromPin) return;

    // Update hover state in the state store (for reactive updates)
    if (!fromPin) {
      this.localMapState.update(s => setHoveredSymbol(s, { nodeId, symbol }));
    }

    // Compute the highlight using pure function
    const highlight = computeSymbolHighlight(currentSubgraph, options, nodeId, symbol, fromPin);

    // Get dimming values from tuning config
    const dimSymbols = options.state.tuning.localMap?.hoverDimSymbols ?? 0.5;
    const dimConnections = options.state.tuning.localMap?.hoverDimConnections ?? 0.1;

    // Apply the highlight to the DOM
    applySymbolHighlight(
      this.container,
      this.overlay,
      highlight,
      currentSubgraph.center.id,
      dimSymbols,
      dimConnections,
      () => this.drawConnections()
    );
  }

  /**
   * Clears symbol hover highlighting, restoring all elements to normal opacity.
   * If a symbol is pinned, this is a no-op unless force=true.
   */
  clearSymbolHighlight(force = false): void {
    // Don't clear if we have a pinned symbol (unless forced)
    const hasPinnedPath = this.localMapState.getState().pinnedPath.length > 0;
    if ((this.pinnedSymbol || hasPinnedPath) && !force) {
      return;
    }

    // Clear hover state in the state store
    this.localMapState.update(s => setHoveredSymbol(s, null));

    // Clear the DOM highlight using pure function
    clearSymbolHighlightDOM(this.container, this.overlay, () => this.drawConnections());
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
    const currentState = this.localMapState.getState();
    
    // Check if this symbol is already pinned using the new state
    const alreadyPinned = isSymbolPinned(currentState, nodeId, symbol);
    
    if (this.pinnedSymbol === key || alreadyPinned) {
      // Clicking the same symbol: unpin and clear
      this.pinnedSymbol = null;
      // Clear the new state as well
      this.localMapState.update(s => clearPins(s));
      this.clearSymbolHighlight(true);
    } else {
      // Pin the new symbol (clear any previous pin first)
      this.clearSymbolHighlight(true);
      this.pinnedSymbol = key;
      
      // Update the new state store with this pin at hop 0 (origin)
      const newPin: SymbolPin = { nodeId, symbol, hopIndex: 0 };
      this.localMapState.update(s => addPin(clearPins(s), newPin));
      
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
   * Adds a pin to the multi-hop path at a specific hop index.
   * Used for building multi-hop traces through the dependency graph.
   * 
   * @param nodeId - The node ID where the symbol resides
   * @param symbol - The symbol name to pin
   * @param hopIndex - Which hop in the chain (0 = origin)
   */
  addPinToPath(nodeId: string, symbol: string, hopIndex: number): void {
    const newPin: SymbolPin = { nodeId, symbol, hopIndex };
    this.localMapState.update(s => addPin(s, newPin));
    
    // Also update legacy state if this is hop 0
    if (hopIndex === 0) {
      this.pinnedSymbol = `${nodeId}:${symbol}`;
    }
    
    // Apply visual highlight for the pinned symbol
    this.container.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      if (row.dataset.nodeId === nodeId && row.dataset.symbol === symbol) {
        row.classList.add("symbol-pinned");
      }
    });
  }

  /**
   * Removes pins from the path starting at a specific hop index.
   * Truncates the path, removing this hop and all subsequent hops.
   * 
   * @param fromHopIndex - Remove pins from this hop index onward
   */
  removePinFromPath(fromHopIndex: number): void {
    this.localMapState.update(s => removePin(s, fromHopIndex));
    
    // If removing from hop 0, also clear legacy state
    if (fromHopIndex === 0) {
      this.pinnedSymbol = null;
    }
    
    // Refresh visual state
    this.scheduleConnectionRedraw();
  }

  /**
   * Gets the current pinned path for external inspection.
   */
  getPinnedPath(): SymbolPin[] {
    return this.localMapState.getState().pinnedPath;
  }

  /**
   * Sets the active path for path-mode rendering.
   * Path mode renders ONLY the nodes in the path as a linear chain,
   * without showing the full Dependencies/Dependents subgraphs of each node.
   * 
   * This is distinct from "exploration mode" (single FROM node) which
   * shows the classic 3-column layout: Dependencies → Center → Dependents.
   * 
   * @param path - The path result containing nodeIds and symbols, or null to exit path mode
   */
  setActivePath(path: PathResult | null): void {
    this.localMapState.update(s => setActivePathAction(s, path));
    
    // Also populate the pinnedPath from the path result for rendering
    if (path) {
      // Clear existing pins
      this.localMapState.update(s => clearPins(s));
      
      // Add pins for each node in the path
      for (let i = 0; i < path.nodeIds.length; i++) {
        const nodeId = path.nodeIds[i];
        // Use the appropriate symbol for first/last nodes, or a generic symbol for intermediates
        let symbol = "";
        if (i === 0 && path.fromSymbol) {
          symbol = path.fromSymbol;
        } else if (i === path.nodeIds.length - 1 && path.toSymbol) {
          symbol = path.toSymbol;
        }
        const pin: SymbolPin = { nodeId, symbol, hopIndex: i };
        this.localMapState.update(s => addPin(s, pin));
      }
    } else {
      // Exiting path mode - clear all pins
      this.localMapState.update(s => clearPins(s));
    }
    
    // Trigger re-render with new path mode
    requestAnimationFrame(() => this.render());
  }

  /**
   * Gets the current active path, or null if in exploration mode.
   */
  getActivePath(): PathResult | null {
    return this.localMapState.getState().activePath;
  }

  /**
   * Builds subgraph data for each hop in the pinned path.
   * Used by render.ts for multi-hop column rendering.
   * 
   * @returns Array of { center, subgraph } for each hop, or null if path is empty
   */
  buildMultiHopSubgraphs(): Array<{ center: ExplorerNodePayload; subgraph: LocalSubgraph }> | null {
    const pinnedPath = this.localMapState.getState().pinnedPath;
    if (pinnedPath.length === 0) {
      return null;
    }

    const result: Array<{ center: ExplorerNodePayload; subgraph: LocalSubgraph }> = [];

    for (const pin of pinnedPath) {
      const node = this.resolveNode(pin.nodeId);
      if (!node) {
        // Skip pins that reference nodes no longer in the graph
        continue;
      }
      const subgraph = this.buildLocalSubgraph(node);
      result.push({ center: node, subgraph });
    }

    return result.length > 0 ? result : null;
  }

  /**
   * Checks if a symbol is currently pinned.
   */
  isPinned(nodeId: string, symbol: string): boolean {
    // Check both legacy and new state for backward compatibility
    const legacyPinned = this.pinnedSymbol === `${nodeId}:${symbol}`;
    const newStatePinned = isSymbolPinned(this.localMapState.getState(), nodeId, symbol);
    return legacyPinned || newStatePinned;
  }

  /**
   * Clears any pinned symbol without clearing the highlight.
   * Called when recentering to a new node.
   */
  clearPinnedSymbol(): void {
    this.pinnedSymbol = null;
    this.localMapState.update(s => clearPins(s));
    this.clearSymbolHighlight(true);
  }

  zoomIn(): void {
    zoomByFactorFn(this.runtime, 1.2, () => this.updateMapTransform());
  }

  zoomOut(): void {
    zoomByFactorFn(this.runtime, 1 / 1.2, () => this.updateMapTransform());
  }


  resetZoom(): void {
    if (!this.runtime.contentRoot) {
      return;
    }
    if (this.runtime.mapInitialTransform) {
      animateMapTransformFn(this.runtime, this.runtime.mapInitialTransform, () => this.updateMapTransform(), true);
    } else {
      this.fitMapToContent();
    }
  }

  private startInertia(initialVx: number, initialVy: number): void {
    startInertiaFn(this.runtime, initialVx, initialVy, () => this.updateMapTransform());
  }

  private cancelInertia(): void {
    cancelInertiaFn(this.runtime);
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

  /** Register anchor for multi-hop columns where same node may appear at different hop indices */
  registerAnchorWithHop(nodeId: string, columnRole: ColumnRole, hopIndex: number, key: string, element: HTMLElement): void {
    storeAnchorWithHop(this.runtime.anchorRegistry, nodeId, columnRole, hopIndex, key, element, keyValue =>
      this.tryBuildNormalizedKey(keyValue)
    );
  }

  /** Retrieve anchor for multi-hop columns using hop index to disambiguate */
  getAnchorWithHop(nodeId: string, columnRole: ColumnRole, hopIndex: number, direction: "inbound" | "outbound", symbol?: string): HTMLElement | null {
    return fetchAnchorWithHop(this.runtime.anchorRegistry, nodeId, columnRole, hopIndex, direction, symbol, (dir, sym) =>
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
    return computeLayoutExtents(this.container, this.contentRoot);
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
      startDrag(this.runtime, event.clientX, event.clientY, this.viewport);
    });

    window.addEventListener("mousemove", this.handleWindowMouseMove);
    window.addEventListener("mouseup", this.handleWindowMouseUp);
  }

  private bindWheelEvents(): void {
    this.viewport.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  fitMapToContent(): void {
    cancelInertiaFn(this.runtime);
    const extents = computeLayoutExtents(this.container, this.contentRoot);
    const viewportRect = this.viewport.getBoundingClientRect();

    if (!extents) {
      this.mapTransform = { x: 0, y: 0, k: 1 };
      this.updateMapTransform();
      this.mapHasInitialFit = true;
      this.mapInitialTransform = { ...this.mapTransform };
      this.scheduleConnectionRedraw();
      return;
    }

    // Apply container dimensions
    applyContainerDimensions(this.container, this.overlay, extents.content);

    // Compute the target transform
    const target = computeFitTransform(extents, viewportRect);

    animateMapTransformFn(this.runtime, target, () => this.updateMapTransform(), true);
    this.mapHasInitialFit = true;
    this.mapInitialTransform = { ...target };
    this.scheduleConnectionRedraw();
  }

  collectCenterAlignmentGuides(column: HTMLElement): CenterAlignmentGuides {
    const rootRect = this.container.getBoundingClientRect();
    return collectCenterAlignmentGuidesFn(column, rootRect, symbol => normalizeSymbolIdentifier(symbol));
  }

  lookupCenterAnchorPosition(
    guides: CenterAlignmentGuides,
    nodeId: string,
    direction: "inbound" | "outbound",
    symbol: string | undefined | null
  ): number | null {
    return lookupCenterAnchorPositionFn(guides, nodeId, direction, symbol, sym => normalizeSymbolIdentifier(sym));
  }

  applyColumnVerticalCentering(layoutRoot: HTMLElement): void {
    applyColumnVerticalCenteringFn(layoutRoot, this.container);
  }

  private createLocalSubgraph(center: ExplorerNodePayload): LocalSubgraph {
    return createLocalSubgraphFn(
      center,
      this.options.graphData,
      endpoint => this.options.resolveLinkEndpoint(endpoint),
      id => this.resolveNode(id),
      node => this.shouldIncludeNode(node)
    );
  }

  /**
   * Builds a subgraph for path mode visualization.
   */
  buildPathSubgraph(pathNodeIds: string[]): LocalSubgraph | null {
    return buildPathSubgraphFn(
      pathNodeIds,
      this.options.graphData,
      endpoint => this.options.resolveLinkEndpoint(endpoint),
      id => this.resolveNode(id)
    );
  }
}

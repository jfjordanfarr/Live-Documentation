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

/**
 * Primary controller for the Explorer's Local Map (3-column symbol) view.
 *
 * Implements {@link LocalViewApi} and orchestrates rendering, pan/zoom,
 * symbol pinning, connection drawing, and multi-hop path visualization.
 * Delegates DOM measurement to `layout-measure`, gesture handling to
 * `pan-zoom`, graph slicing to `subgraph-builder`, and symbol
 * highlighting to `symbol-highlight`.
 *
 * Pin state is managed exclusively through the observable
 * {@link localMapState} store (`pinnedPath`, `hoveredSymbol`, etc.).
 * The legacy `pinnedSymbol` private field was removed 2026-02-18 after
 * multi-hop stabilised (see 2025-12-19 refactoring and Dev Day 71).
 *
 * Many public accessors (e.g. `mapTransform`, `currentSubgraph`,
 * `isDragging`) are thin pass-throughs to the underlying
 * {@link createRuntime | runtime} object; they're exposed so that
 * sibling modules (`render`, `connections`, `pan-zoom`) can read/write
 * shared state through the controller reference without importing the
 * runtime directly.
 *
 * **History:** Created 2025-12-04 (commit `4504d36a`).  Reduced from
 * 1 549 to ~860 lines during the 2025-12-19 Phase 1-4 tech-debt
 * extraction (commit `15073e19`).  Further reduced by deprecated-field
 * removal on 2026-02-18.
 *
 * **Tech debt:** At ~860 lines this class still exceeds the project's
 * 500-line guidance.  The 2025-12-19 plan identified `pin-management`
 * extraction and runtime-accessor elimination as next steps.
 */
export class LocalViewController implements LocalViewApi {
  /** Injected options including graph data, state, and navigation callbacks. */
  readonly options: LocalViewOptions;
  /** Shared mutable runtime holding DOM refs, transform state, and anchor registry. */
  readonly runtime = createRuntime(
    requireElement<HTMLDivElement>("view-map"),
    requireElement<HTMLDivElement>("map-container"),
    requireElement<HTMLDivElement>("map-connections")
  );

  private readonly viewport = this.runtime.viewport;
  private readonly container = this.runtime.container;
  private readonly overlay = this.runtime.overlay;

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

  /** Triggers a full re-render of the Local Map view via {@link renderLocalView}. */
  render(): void {
    renderLocalView(this);
  }

  /** Redraws all SVG connection lines between symbol anchors in the current subgraph. */
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

  /** Applies or removes the `selected` / `local-focus` CSS classes on node cards to reflect the current selection. */
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
    if (hasPinnedPath && !fromPin) return;

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
      () => this.drawConnections(),
      () => this.reapplyVerticalCentering()
    );
  }

  /**
   * Clears symbol hover highlighting, restoring all elements to normal opacity.
   * If a symbol is pinned, this is a no-op unless force=true.
   */
  clearSymbolHighlight(force = false): void {
    // Don't clear if we have a pinned symbol (unless forced)
    const hasPinnedPath = this.localMapState.getState().pinnedPath.length > 0;
    if (hasPinnedPath && !force) {
      return;
    }

    // Clear hover state in the state store
    this.localMapState.update(s => setHoveredSymbol(s, null));

    // Clear the DOM highlight using pure function
    clearSymbolHighlightDOM(
      this.container,
      this.overlay,
      () => this.drawConnections(),
      () => this.reapplyVerticalCentering()
    );
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
    const currentState = this.localMapState.getState();
    const alreadyPinned = isSymbolPinned(currentState, nodeId, symbol);
    
    if (alreadyPinned) {
      // Clicking the same symbol: unpin and clear
      this.localMapState.update(s => clearPins(s));
      this.clearSymbolHighlight(true);
    } else {
      // Pin the new symbol (clear any previous pin first)
      this.clearSymbolHighlight(true);
      
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
    return isSymbolPinned(this.localMapState.getState(), nodeId, symbol);
  }

  /**
   * Clears any pinned symbol without clearing the highlight.
   * Called when recentering to a new node.
   */
  clearPinnedSymbol(): void {
    this.localMapState.update(s => clearPins(s));
    this.clearSymbolHighlight(true);
  }

  /** Zooms the map in by 20%. */
  zoomIn(): void {
    zoomByFactorFn(this.runtime, 1.2, () => this.updateMapTransform());
  }

  /** Zooms the map out by ~17%. */
  zoomOut(): void {
    zoomByFactorFn(this.runtime, 1 / 1.2, () => this.updateMapTransform());
  }


  /** Restores the map to its initial (fit-to-content) transform, or re-fits if no initial transform was captured. */
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

  /** The SVG XML namespace URI used when creating connection path elements. */
  get svgNamespace(): string {
    return "http://www.w3.org/2000/svg";
  }

  /** Returns the `map-container` div that hosts node cards and columns. */
  getContainer(): HTMLDivElement {
    return this.container;
  }

  /** Returns the `map-connections` SVG overlay div used for drawing connection lines. */
  getOverlay(): HTMLDivElement {
    return this.overlay;
  }

  /** Returns the `view-map` scrollable viewport wrapper. */
  getViewport(): HTMLDivElement {
    return this.viewport;
  }

  /** Whether the user is currently dragging the map (pointer is down and moving). */
  get isDragging(): boolean {
    return this.runtime.isDragging;
  }

  /** @see isDragging */
  set isDragging(value: boolean) {
    this.runtime.isDragging = value;
  }

  /** Current pan/zoom transform `{ x, y, k }` applied to the viewport. */
  get mapTransform(): MapTransform {
    return this.runtime.mapTransform;
  }

  /** @see mapTransform */
  set mapTransform(transform: MapTransform) {
    this.runtime.mapTransform = transform;
  }

  /** The subgraph currently rendered in the 3-column layout, or `null` before the first render. */
  get currentSubgraph(): LocalSubgraph | null {
    return this.runtime.currentSubgraph;
  }

  /** @see currentSubgraph */
  set currentSubgraph(value: LocalSubgraph | null) {
    this.runtime.currentSubgraph = value;
  }

  /** The `id` of the node most recently placed in the center column, used to avoid redundant renders. */
  get lastCenteredNodeId(): string | null {
    return this.runtime.lastCenteredNodeId;
  }

  /** @see lastCenteredNodeId */
  set lastCenteredNodeId(value: string | null) {
    this.runtime.lastCenteredNodeId = value;
  }

  /** Whether a fit-to-content pass has been applied since the last subgraph change. */
  get mapHasInitialFit(): boolean {
    return this.runtime.mapHasInitialFit;
  }

  /** @see mapHasInitialFit */
  set mapHasInitialFit(value: boolean) {
    this.runtime.mapHasInitialFit = value;
  }

  /** Whether the user has manually panned or zoomed since the last fit. */
  get mapUserAdjusted(): boolean {
    return this.runtime.mapUserAdjusted;
  }

  /** @see mapUserAdjusted */
  set mapUserAdjusted(value: boolean) {
    this.runtime.mapUserAdjusted = value;
  }

  /** The transform captured at the end of the most recent fit-to-content, used by {@link resetZoom}. */
  get mapInitialTransform(): MapTransform | null {
    return this.runtime.mapInitialTransform;
  }

  /** @see mapInitialTransform */
  set mapInitialTransform(value: MapTransform | null) {
    this.runtime.mapInitialTransform = value;
  }

  /** The top-level `local-map-root` element created by the renderer, or `null` before first render. */
  get contentRoot(): HTMLElement | null {
    return this.runtime.contentRoot;
  }

  /** @see contentRoot */
  set contentRoot(value: HTMLElement | null) {
    this.runtime.contentRoot = value;
  }

  /** Registers a DOM element as a connection anchor for a given node/column/direction slot. */
  registerAnchor(nodeId: string, columnRole: ColumnRole, key: string, element: HTMLElement): void {
    storeAnchor(this.runtime.anchorRegistry, nodeId, columnRole, key, element, keyValue =>
      this.tryBuildNormalizedKey(keyValue)
    );
  }

  /** Removes all registered anchor entries, typically called before re-rendering columns. */
  clearAnchors(): void {
    clearAnchorRegistry(this.runtime.anchorRegistry);
  }

  /** Looks up a registered anchor element for a node/column/direction, optionally filtering by symbol. */
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

  /**
   * Produces a normalized anchor key string from a direction and symbol,
   * used to match symbol rows across columns during connection drawing.
   */
  buildNormalizedAnchorKey(direction: "inbound" | "outbound", symbol: string): string | null {
    return this.options.state ? this.normalizeSymbol(direction, symbol) : null;
  }

  /** Attempts to extract a normalized key from an existing anchor key string. */
  tryBuildNormalizedKey(anchorKey: string): string | null {
    return this.normalizeAnchorKey(anchorKey);
  }

  /** Schedules a connection line redraw on the next animation frame. */
  scheduleConnectionRedraw(): void {
    requestAnimationFrame(() => this.drawConnections());
  }

  /**
   * Reapplies vertical centering to columns after symbol collapse/uncollapse.
   * Called when pinning/unpinning causes cards to change height.
   */
  private reapplyVerticalCentering(): void {
    if (this.contentRoot) {
      this.applyColumnVerticalCentering(this.contentRoot);
    }
  }

  /**
   * Returns `true` when the node should appear in the local subgraph
   * based on current filter settings (test/asset visibility toggles).
   */
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

  /** Returns `true` when the given node has a `"test"` archetype. */
  isTestNode(node: ExplorerNodePayload | null | undefined): boolean {
    return !!node && (node.archetype || "").toLowerCase() === "test";
  }

  /** Builds a {@link LocalSubgraph} centred on the given node (delegates to {@link createLocalSubgraph}). */
  buildLocalSubgraph(center: ExplorerNodePayload): LocalSubgraph {
    return this.createLocalSubgraph(center);
  }

  /** Resolves a node by `id` from the full graph data, or returns `undefined` if not found. */
  resolveNode(id: string): ExplorerNodePayload | undefined {
    return this.options.graphData.nodes.find(node => node.id === id);
  }

  /** Invokes the `onSelectNode` callback to open a node in the detail panel. */
  async selectNode(node: ExplorerNodePayload): Promise<void> {
    await this.options.onSelectNode(node);
  }

  /** Clears any pinned symbol and invokes `onRecenterNode` to re-render with a new centre node. */
  async recenterNode(node: ExplorerNodePayload): Promise<void> {
    // Clear any pinned symbol when recentering to a new node
    this.clearPinnedSymbol();
    await this.options.onRecenterNode(node);
  }

  /** Opens the sidebar detail panel for the given node. */
  async focusSidebar(node: ExplorerNodePayload): Promise<void> {
    await this.options.onFocusSidebar(node);
  }

  /** Measures content and column bounding boxes used for fit-to-content and centering calculations. */
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

  /** Applies the current {@link mapTransform} to the viewport's CSS `transform`, keeping container and overlay in sync. */
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

  /**
   * Computes and animates a transform that fits the full content area inside
   * the viewport, then stores it as {@link mapInitialTransform} for later
   * {@link resetZoom} calls.
   */
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

  /** Scans the center column for symbol row positions and returns alignment guides for vertical centering. */
  collectCenterAlignmentGuides(column: HTMLElement): CenterAlignmentGuides {
    const rootRect = this.container.getBoundingClientRect();
    return collectCenterAlignmentGuidesFn(column, rootRect, symbol => normalizeSymbolIdentifier(symbol));
  }

  /** Returns the vertical position of a center-column anchor for a given node/direction/symbol, or `null` if not found. */
  lookupCenterAnchorPosition(
    guides: CenterAlignmentGuides,
    nodeId: string,
    direction: "inbound" | "outbound",
    symbol: string | undefined | null
  ): number | null {
    return lookupCenterAnchorPositionFn(guides, nodeId, direction, symbol, sym => normalizeSymbolIdentifier(sym));
  }

  /** Vertically centres dependency and dependent columns relative to the center column within the layout root. */
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

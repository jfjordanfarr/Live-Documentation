import { EMPTY_PIN_SET, retainFile, removePinsForNode, toggleFileSymbol, isSymbolPinned as isExplorationPin, type PinSet } from "../pin-state";
import { edgeKey, type BranchGraph } from "./branches";
import type {
  ExplorerNodePayload
} from "../../../shared/types";
import { requireElement } from "../../dom";
import {
  buildNormalizedAnchorKey,
  normalizeSymbolIdentifier,
  tryBuildNormalizedKeyFromAnchorKey
} from "../symbolAnchors";
import { ZoomBarrier, wheelPixels } from "../zoomBarrier";
import { drawConnections } from "./connections";
import {
  computeLayoutExtents,
  computeFitTransform,
  computePathFitTransform,
  applyContainerDimensions,
  withTransformReset,
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
  type PathResult,
  createStateStore,
  createInitialState,
  setHoveredSymbol,
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
  BranchStrain,
  ColumnRole,
  LocalViewApi,
  LocalViewOptions,
  LocalSubgraph,
  MapTransform
} from "./types";

/** Coordinates the native Local Map, independent exploration pins and explicit FROM/TO paths. */
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
   * Observable state for hover and explicit pathfinding; exploration pins are shared with the other views.
   */
  readonly localMapState: StateStore<LocalMapState>;

  /** The independently disclosed branch graph, absent in classic or path mode. */
  branches: BranchGraph | null = null;
  /** Cards whose complete symbol list the person has explicitly opened. */
  readonly expandedCards = new Set<string>();
  private renderedPath = false;
  private restoreExplorationCamera = false;
  private explorationCamera: { transform: MapTransform; initial: MapTransform | null; userAdjusted: boolean; layerTop: number } | null = null;
  /** Shared pins are owned by the application, not this renderer. */
  get pins(): PinSet { return this.options.state.pins ?? EMPTY_PIN_SET; }

  /** How many references the drawn exploration threads through lanes, and how many it draws as stubs. */
  getStrain(): BranchStrain | null {
    const branches = this.branches;
    if (!branches) return null;
    const columnOf = new Map(branches.columns.flatMap((nodes, column) => nodes.map(node => [node.id, column] as const)));
    let threaded = 0;
    for (const edge of branches.subgraph.links) {
      if (edge.sourceId === edge.targetId || branches.back.has(edgeKey(edge))) continue;
      const a = columnOf.get(edge.targetId), b = columnOf.get(edge.sourceId);
      if (a !== undefined && b !== undefined && b > a + 1) threaded++;
    }
    return { threaded, back: branches.back.size, columns: branches.columns.length };
  }

  /** Screen position of a file's readable identity, shared across perspectives. */
  getSubjectAnchor(nodeId: string): { x: number; y: number } | null {
    const title = this.container.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(nodeId)}"] .node-title`);
    if (!title || !title.getClientRects().length) return null;
    const rect = title.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  /** Keep the file under the person's eye while the surrounding representation changes. */
  placeSubjectAnchor(nodeId: string, anchor: { x: number; y: number }): void {
    cancelAnimationFrame(this.runtime.mapAnimationFrame);
    this.runtime.mapAnimationTarget = null;
    this.cancelInertia();
    const current = this.getSubjectAnchor(nodeId);
    if (!current) return;
    this.mapTransform = { ...this.mapTransform, x: this.mapTransform.x + anchor.x - current.x, y: this.mapTransform.y + anchor.y - current.y };
    this.mapHasInitialFit = true;
    this.mapUserAdjusted = true;
    this.layerTop = this.measureLayerTop();
    this.updateMapTransform();
    this.drawConnections();
  }

  /** Watches the map layer so the picture stays put on screen when the toolbar above it grows or shrinks. */
  private layerObserver: ResizeObserver | null = null;
  /** The map layer's top edge, transform reset, as last seen by a fit or by {@link keepContentPutWhenLayerMoves}. */
  private layerTop: number | null = null;

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

  private readonly zoomBarrier = new ZoomBarrier();

  private readonly handleWheel = (event: WheelEvent): void => {
    const { state } = this.options;
    if (state.view !== "map") {
      return;
    }
    if (!event.shiftKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX) && this.options.onZoomOut) {
      const delta = wheelPixels(event.deltaY, event.deltaMode, this.viewport.clientHeight);
      const scale = (this.runtime.mapAnimationTarget ?? this.mapTransform).k;
      if (delta > 0 && scale <= 0.62) {
        event.preventDefault();
        this.options.onZoomBoundary?.(true);
        if (this.zoomBarrier.push(delta, performance.now())) {
          this.options.onZoomBoundary?.(false);
          this.options.onZoomOut();
        }
        return;
      }
      this.zoomBarrier.reset();
      const arriving = delta > 0 && scale * Math.exp(-delta * .0015) <= .62;
      this.options.onZoomBoundary?.(arriving);
      if (arriving) this.zoomBarrier.push(delta, performance.now());
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
    this.bindLayerObserver();
  }

  /**
   * The toolbar above the map takes a status line or the path strip when it has
   * one, and the map layer below it moves down by that much. The picture must not
   * move with it: a status line is not a camera move. Whenever the layer's top
   * edge moves, the transform is shifted the other way by the same amount.
   */
  private bindLayerObserver(): void {
    const layer = this.container.parentElement;
    if (!layer || typeof ResizeObserver === "undefined") {
      return;
    }
    this.layerObserver = new ResizeObserver(() => this.keepContentPutWhenLayerMoves());
    this.layerObserver.observe(layer);
  }

  /** The map layer's top edge in the page, measured with its transform reset. */
  private measureLayerTop(): number {
    const layer = this.container.parentElement ?? this.viewport;
    return withTransformReset(this.container, () => layer.getBoundingClientRect().top);
  }

  private keepContentPutWhenLayerMoves(): void {
    const top = this.measureLayerTop();
    if (this.layerTop !== null && top !== this.layerTop) {
      const dy = top - this.layerTop;
      this.mapTransform = { ...this.mapTransform, y: this.mapTransform.y - dy };
      if (this.mapInitialTransform) {
        this.mapInitialTransform = { ...this.mapInitialTransform, y: this.mapInitialTransform.y - dy };
      }
      if (this.runtime.mapAnimationTarget) {
        this.runtime.mapAnimationTarget = { ...this.runtime.mapAnimationTarget, y: this.runtime.mapAnimationTarget.y - dy };
      }
      this.updateMapTransform();
    }
    this.layerTop = top;
  }

  /**
   * Subscribes to localMapState changes for reactive updates.
   * Renders a new explicit path without modifying independent exploration pins.
   */
  private subscribeToStateChanges(): void {
    this.stateUnsubscribe = this.localMapState.subscribe((state, prevState) => {
      // When activePath changes, trigger full re-render for path-mode layout
      if (state.activePath !== prevState.activePath) {
        // Defer render to avoid recursive updates
        requestAnimationFrame(() => this.render());
        return;
      }

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
    this.layerObserver?.disconnect();
    this.layerObserver = null;
  }

  /** Triggers a full re-render of the Local Map view via {@link renderLocalView}. */
  render(): void {
    // Apply pending toolbar displacement before capturing the visible subject.
    this.keepContentPutWhenLayerMoves();
    const id = this.options.state.selectedNode?.id;
    const path = this.localMapState.getState().activePath;
    const anchor = id && !this.renderedPath && !this.runtime.mapAnimationTarget ? this.getSubjectAnchor(id) : null;
    renderLocalView(this);
    if (this.restoreExplorationCamera && this.explorationCamera) {
      cancelAnimationFrame(this.runtime.mapAnimationFrame);
      this.runtime.mapAnimationTarget = null;
      this.mapTransform = { ...this.explorationCamera.transform };
      const layerTop = this.measureLayerTop();
      this.mapTransform.y += this.explorationCamera.layerTop - layerTop;
      this.mapInitialTransform = this.explorationCamera.initial;
      this.mapUserAdjusted = this.explorationCamera.userAdjusted;
      this.mapHasInitialFit = true;
      this.layerTop = layerTop;
      this.updateMapTransform();
      this.drawConnections();
      this.restoreExplorationCamera = false;
      this.explorationCamera = null;
    } else if (id && anchor && !path) {
      this.placeSubjectAnchor(id, anchor);
    }
    this.renderedPath = !!path;
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
      activePath: this.localMapState.getState().activePath ?? undefined,
      branches: this.branches ?? undefined
    });
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
   * - Hovering "__internals__" isolates edges with no named symbol on that file,
   *   independently of which retained file currently has reading focus.
   */
  highlightSymbolConnections(nodeId: string, symbol: string, fromPin = false): void {
    const { currentSubgraph, options } = this;
    if (!currentSubgraph) return;

    clearSymbolHighlightDOM(this.container, this.overlay, () => this.drawConnections());

    // Update hover state in the state store (for reactive updates)
    if (!fromPin) {
      this.localMapState.update(s => setHoveredSymbol(s, { nodeId, symbol }));
    }

    // Compute the highlight using pure function
    const highlight = computeSymbolHighlight(currentSubgraph, options, nodeId, symbol, fromPin);
    // Retained branches stay in place while hover isolates attention.
    if (this.branches) highlight.shouldCollapse = false;

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
   * Persistent pins remain; only transient attention is cleared.
   */
  clearSymbolHighlight(_force = false): void {
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

  /** Toggle one independent pin, preserving other branches and the clicked symbol’s screen position. */
  togglePinnedSymbol(nodeId: string, symbol: string): void {
    const node = this.resolveNode(nodeId);
    if (!node) return;
    const previous = this.options.state.selectedNode;
    const base = !this.pins.entries.length && previous && previous.id !== nodeId
      ? retainFile(this.pins, previous.id) : this.pins;
    const pins = symbol === "*" ? retainFile(base, nodeId)
      : toggleFileSymbol(base, nodeId, symbol, node.publicSymbols);
    if (pins === this.pins && previous?.id === nodeId && !this.getActivePath()) return;
    this.updateRetainedPins(nodeId, symbol, pins);
  }

  /** Release this file's expansion; other pins may still need some of its rows. */
  closeNode(nodeId: string): void {
    this.expandedCards.delete(nodeId);
    const pins = removePinsForNode(this.pins, nodeId);
    const next = pins.entries.find(pin => pin.nodeId !== nodeId);
    if (this.options.state.selectedNode?.id === nodeId || !pins.entries.length) {
      this.options.state.selectedNode = this.options.state.focusedNode = next ? this.resolveNode(next.nodeId) ?? null : null;
    }
    this.updateRetainedPins(nodeId, "*", pins, false);
  }

  /** Apply retained scope while keeping the acted-on row in its screen position. */
  private updateRetainedPins(nodeId: string, symbol: string, pins: PinSet, focus = true): void {
    const leavingPath = !!this.localMapState.getState().activePath;
    const selector = symbol === "*"
      ? `.node-card[data-id="${CSS.escape(nodeId)}"] .node-title`
      : `.symbol-row[data-node-id="${CSS.escape(nodeId)}"][data-symbol="${CSS.escape(symbol)}"] .symbol-label-wrapper`;
    const before = this.container.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
    const keyboardFocus = this.container.contains(document.activeElement);
    this.options.state.pins = pins;
    const subject = this.resolveNode(nodeId);
    if (subject && focus) this.options.state.selectedNode = this.options.state.focusedNode = subject;
    if (!pins.entries.length) this.options.state.selectedNode = this.options.state.focusedNode = null;
    this.localMapState.update(s => ({ ...s, activePath: null }));
    this.render();
    const after = this.container.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
    if (before && after) {
      cancelAnimationFrame(this.runtime.mapAnimationFrame);
      this.runtime.mapAnimationTarget = null;
      this.mapHasInitialFit = true;
      this.mapUserAdjusted = true;
      this.mapTransform = { ...this.mapTransform, x: this.mapTransform.x + before.left - after.left, y: this.mapTransform.y + before.top - after.top };
      this.updateMapTransform();
      this.drawConnections();
    }
    if (keyboardFocus) {
      const focusSelector = symbol === "*" ? `.node-card[data-id="${CSS.escape(nodeId)}"]` : selector;
      const element = this.container.querySelector<HTMLElement>(focusSelector) ?? this.container.querySelector<HTMLElement>(".node-card, .empty-hint");
      element?.focus({ preventScroll: true });
    }
    this.options.onExplorationChange?.(leavingPath);
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
    const previous = this.localMapState.getState().activePath;
    if (!path && !previous) {
      // Nothing to leave: the person's own pins and camera stay as they are.
      return;
    }
    if (path && !previous) {
      this.explorationCamera = {
        transform: { ...(this.runtime.mapAnimationTarget ?? this.mapTransform) },
        initial: this.mapInitialTransform ? { ...this.mapInitialTransform } : null,
        userAdjusted: this.mapUserAdjusted,
        layerTop: this.layerTop ?? this.measureLayerTop()
      };
    }
    this.restoreExplorationCamera = !!previous && !path;
    this.localMapState.update(s => setActivePathAction(s, path));
    
  }

  /**
   * Gets the current active path, or null if in exploration mode.
   */
  getActivePath(): PathResult | null {
    return this.localMapState.getState().activePath;
  }

  /**
   * Checks if a symbol is currently pinned.
   */
  isPinned(nodeId: string, symbol: string): boolean {
    return isExplorationPin(this.pins, nodeId, symbol) || isExplorationPin(this.pins, nodeId, "*");
  }

  /** Restore legible card size when crossing inward through the zoom boundary. */
  ensureReadable(): void {
    cancelAnimationFrame(this.runtime.mapAnimationFrame);
    this.runtime.mapAnimationTarget = null;
    this.mapTransform = { ...this.mapTransform, k: Math.max(1, this.mapTransform.k) };
    this.updateMapTransform();
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
   *
   * The subject keeps its place on screen while the columns re-center around
   * it. A change of what is disclosed must not move what the person is looking
   * at: before this compensation, pinning a symbol on a file with a long
   * dependents column moved the selected card 862 px off the frame (measured
   * by the still-picture instrument, 2026-10-01).
   */
  private reapplyVerticalCentering(): void {
    if (!this.contentRoot) {
      return;
    }
    const focus =
      this.contentRoot.querySelector<HTMLElement>(".node-card.local-focus") ??
      this.contentRoot.querySelector<HTMLElement>(".local-column.center .node-card");
    const before = focus?.getBoundingClientRect();
    this.applyColumnVerticalCentering(this.contentRoot);
    if (!focus || !before) {
      return;
    }
    const after = focus.getBoundingClientRect();
    const dx = after.left - before.left;
    const dy = after.top - before.top;
    if (dx !== 0 || dy !== 0) {
      this.mapTransform = { ...this.mapTransform, x: this.mapTransform.x - dx, y: this.mapTransform.y - dy };
      this.updateMapTransform();
    }
  }

  /**
   * Returns `true` when the node should appear in the local subgraph
   * based on current filter settings (test/asset visibility toggles).
   */
  shouldIncludeNode(node: ExplorerNodePayload): boolean {
    const { state } = this.options;
    if (this.pins.entries.some(pin => pin.nodeId === node.id)) return true;
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

  /** Follow a file while retaining independently pinned branches. */
  async recenterNode(node: ExplorerNodePayload): Promise<void> {
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
      // A press on a card or in the pathfinder toolbar is not the start of a drag.
      // A drag marks the camera as the person's own, after which no render re-fits
      // it; toolbar clicks used to do that too, which left Clear unable to bring
      // the subject back into the frame (measured 3,846 px off, 2026-10-01).
      if ((event.target as HTMLElement | null)?.closest?.(".node-card, .pathfind-toolbar")) {
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
   * Computes and animates a transform that frames the selected card with its
   * surroundings, then stores it as {@link mapInitialTransform} for later
   * {@link resetZoom} calls.
   */
  fitMapToContent(): void {
    // A retained exploration is framed at reading size: the whole of it when it fits, else the subject with its surroundings.
    this.fitMap((extents, frame) => computeFitTransform(extents, frame, this.branches ? { minScale: 1 } : undefined));
  }

  /**
   * Frames a drawn path: reading size, its first file at the left edge when the
   * path is wider than the frame, centred when it is not.
   */
  fitMapToPath(): void {
    this.fitMap((extents, frame) => computePathFitTransform(extents.content, frame));
  }

  /**
   * Measures the content and the map layer's own frame (the transformed layer
   * under the toolbar, measured with its transform reset, not the whole view),
   * sizes the container, and animates to the transform `target` computes.
   */
  private fitMap(target: (extents: LayoutExtents, frame: DOMRect) => MapTransform): void {
    cancelInertiaFn(this.runtime);
    const extents = computeLayoutExtents(this.container, this.contentRoot);
    const layer = this.container.parentElement ?? this.viewport;
    const frame = withTransformReset(this.container, () => layer.getBoundingClientRect());
    this.layerTop = frame.top;

    if (!extents) {
      this.mapTransform = { x: 0, y: 0, k: 1 };
      this.updateMapTransform();
      this.mapHasInitialFit = true;
      this.mapInitialTransform = { ...this.mapTransform };
      this.scheduleConnectionRedraw();
      return;
    }

    applyContainerDimensions(this.container, this.overlay, extents.content);
    const next = target(extents, frame);
    animateMapTransformFn(this.runtime, next, () => this.updateMapTransform(), true);
    this.mapHasInitialFit = true;
    this.mapInitialTransform = { ...next };
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

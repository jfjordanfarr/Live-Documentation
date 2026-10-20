import { EMPTY_PIN_SET, isSymbolPinned as isExplorationPin, type PinSet } from "../pin-state";
import { createStage, dropStage, renderBranches, type BranchStage } from "./branch-renderer";
import type { BranchGraph } from "./branches";
import type { CardContext } from "./card-factory";
import { NO_OPEN_DIRECTORIES, type OpenDirectories } from "./directory-state";
import type {
  ExplorerNodePayload
} from "../../../shared/types";
import { requireElement } from "../../dom";
import {
  buildNormalizedAnchorKey,
  tryBuildNormalizedKeyFromAnchorKey
} from "../symbolAnchors";
import { clearConnections, drawConnections } from "./connections";
import {
  computeLayoutExtents,
  computeFitTransform,
  computePathFitTransform,
  applyContainerDimensions,
  withTransformReset,
  type LayoutExtents
} from "./layout-measure";
import {
  zoomByFactor as zoomByFactorFn,
  zoomAtPoint as zoomAtPointFn,
  animateMapTransform as animateMapTransformFn,
  startInertia as startInertiaFn,
  cancelInertia as cancelInertiaFn,
  handleDragMove,
  handleDragEnd,
  handleWheel as handleWheelFn,
  startDrag
} from "./pan-zoom";
import {
  clearAnchorRegistry,
  createRuntime,
  getAnchor as fetchAnchor,
  registerAnchor as storeAnchor
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
  computeSymbolHighlight,
  applySymbolHighlight,
  clearSymbolHighlightDOM
} from "./symbol-highlight";
import type {
  ColumnRole,
  LocalViewApi,
  LocalExplorationFrame,
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

  /** The directory-aware graph for the current neighborhood, exploration or path. */
  branches: BranchGraph | null = null;
  /**
   * Where the last branch picture stood each card, by its top in the picture: the order step starts from it among its
   * other starts, and prices a start by the pairs of cards it would swap, so the picture stays put unless another
   * arrangement is clearly cheaper. Null until a branch picture has been drawn, and again when the branches are left.
   */
  previousTops: ReadonlyMap<string, number> | null = null;
  /**
   * The branch picture's elements, kept across renders so that a change of picture moves them rather than redrawing
   * them; null until a branch picture is drawn, and again when the branches are left.
   */
  stage: BranchStage | null = null;
  /**
   * The file whose card the person last acted on, by a click on it or, when the tuning says hover counts, by hovering
   * it; the card a move of the picture holds still on screen (the owner's choice, 2026-10-07).
   */
  lastInteracted: string | null = null;
  /** When the action named a symbol, keep that row under the eye as rows reorder within its card. */
  lastInteractedSymbol: string | null = null;
  /** Cards whose complete symbol list the person has explicitly opened. */
  readonly expandedCards = new Set<string>();
  /** The card builder reads only presentation facts and named actions, never this controller's state bag. */
  readonly cardContext: CardContext = {
    presentation: node => ({
      subject: this.options.state.selectedNode?.id === node.id,
      retained: this.pins.entries.some(pin => pin.nodeId === node.id),
      filePinned: this.pins.entries.some(pin => pin.nodeId === node.id && pin.symbol === "*"),
      expanded: this.expandedCards.has(node.id),
      showTests: this.options.state.filters.showTests,
      symbolOrder: this.options.state.tuning.localMap.symbolOrder,
      testBacking: this.options.testCoverage.get(node.id) ?? [],
      isPinned: symbol => this.isPinned(node.id, symbol),
      isDirectlyPinned: symbol => this.pins.entries.some(pin => pin.nodeId === node.id && pin.symbol === symbol)
    }),
    registerAnchor: (nodeId, role, key, element) => this.registerAnchor(nodeId, role, key, element),
    closeNode: nodeId => this.options.onCloseNode(nodeId),
    unpinNode: nodeId => this.options.onUnpinNode(nodeId),
    openDirectory: directory => this.options.onOpenDirectory(directory),
    inspectDirectory: directory => this.inspectDirectory(directory),
    recenterNode: node => this.recenterNode(node),
    togglePinnedSymbol: (nodeId, symbol) => this.options.onPressPin(nodeId, symbol),
    inspectNode: (node, symbol) => this.focusSidebar(node, symbol),
    showNodeActions: (node, symbol, anchor) => this.showNodeActions(node, symbol, anchor),
    showDirectoryActions: (directory, anchor) => this.showDirectoryActions(directory, anchor),
    highlightSymbolConnections: (nodeId, symbol) => this.highlightSymbolConnections(nodeId, symbol),
    clearSymbolHighlight: () => this.clearSymbolHighlight(),
    focusTypeTarget: targetId => {
      const target = this.options.nodesById.get(targetId);
      if (target) void this.focusSidebar(target);
    }
  };
  private renderedPath = false;
  private restoreExplorationCamera = false;
  private explorationCamera: { transform: MapTransform; initial: MapTransform | null; userAdjusted: boolean; layerTop: number } | null = null;
  /** Shared pins are owned by the application, not this renderer. */
  get pins(): PinSet { return this.options.state.pins ?? EMPTY_PIN_SET; }
  /** The directories the person has opened, owned by the application beside the pins (2026-10-08). */
  get openDirectories(): OpenDirectories { return this.options.state.openDirectories ?? NO_OPEN_DIRECTORIES; }
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
  private pendingRender = 0;
  private readonly handlePointerLeave = (): void => this.clearSymbolHighlight();
  /**
   * A render asked for while the map was not the view shown, owed when it is shown again (the owner's choice,
   * 2026-10-16): the picture is drawn for a view someone is looking at, and a return to an unchanged picture draws
   * nothing.
   */
  private renderOwed = false;
  /** The continuing search runs only while the page is visible; a tab brought back resumes it. */
  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible" && this.isShown()) this.stage?.search?.resume();
  };

  /** The pointers pressed on the viewport, by id: one drags, two pinch. */
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private pinch: { distance: number; x: number; y: number } | null = null;
  private disposeItemEvents = (): void => {};

  private readonly handleWindowPointerMove = (event: PointerEvent): void => {
    const { state } = this.options;
    if (state.view !== "map" || state.perspective !== "2d" || !this.pointers.has(event.pointerId)) {
      return;
    }
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size >= 2 && this.pinch) {
      // Two fingers: zoom around their midpoint by the change in their distance, and pan with the midpoint.
      event.preventDefault();
      const [a, b] = [...this.pointers.values()];
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const frame = this.viewport.getBoundingClientRect();
      if (this.pinch.distance > 0 && distance > 0) {
        zoomAtPointFn(this.runtime, mid.x - frame.left, mid.y - frame.top, Math.log(distance / this.pinch.distance), () => this.updateMapTransform());
      }
      this.mapTransform = { ...this.mapTransform, x: this.mapTransform.x + mid.x - this.pinch.x, y: this.mapTransform.y + mid.y - this.pinch.y };
      this.updateMapTransform();
      this.pinch = { distance, ...mid };
      return;
    }
    if (!this.isDragging || !this.runtime.lastDragPosition) {
      return;
    }
    event.preventDefault();
    handleDragMove(this.runtime, event.clientX, event.clientY, () => this.updateMapTransform());
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    const { state } = this.options;
    if ((state.view !== "map" || state.perspective !== "2d")) {
      return;
    }
    handleWheelFn(this.runtime, event, () => this.updateMapTransform());
  };

  private readonly handleWindowPointerUp = (event: PointerEvent): void => {
    if (!this.pointers.delete(event.pointerId)) {
      return;
    }
    if (this.pinch) {
      // The pinch ends; a finger still down goes on dragging from where it is.
      this.pinch = null;
      const remaining = [...this.pointers.values()][0];
      if (remaining) startDrag(this.runtime, remaining.x, remaining.y, this.viewport);
      else if (this.isDragging) handleDragEnd(this.runtime, this.viewport, () => this.updateMapTransform());
      return;
    }
    if (this.isDragging) handleDragEnd(this.runtime, this.viewport, () => this.updateMapTransform());
  };

  constructor(options: LocalViewOptions) {
    this.options = options;
    this.localMapState = createStateStore(createInitialState());
    this.container.classList.add("cluster-host", "local-map-host");
    this.viewport.style.cursor = "grab";
    this.bindItemEvents();
    this.bindPointerEvents();
    this.bindWheelEvents();
    this.viewport.addEventListener("pointerleave", this.handlePointerLeave);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.subscribeToStateChanges();
    this.bindLayerObserver();
  }

  /** Whether the Local Map is the view the page shows: the map view in its 2D perspective. */
  isShown(): boolean {
    const { state } = this.options;
    return state.view === "map" && state.perspective === "2d";
  }

  /**
   * The map shown again after another view: an owed render runs now; otherwise the picture stands as it was and its
   * search, paused while the map was hidden, goes on from where it stopped.
   */
  show(): void {
    if (this.renderOwed || !this.stage) {
      this.render();
      return;
    }
    this.stage.search?.resume();
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
        cancelAnimationFrame(this.pendingRender);
        this.pendingRender = requestAnimationFrame(() => this.render());
        return;
      }

    });
  }

  /**
   * Cleanup method to unsubscribe from state store.
   * Should be called when the controller is disposed.
   */
  dispose(): void {
    cancelAnimationFrame(this.pendingRender);
    this.viewport.removeEventListener("pointerleave", this.handlePointerLeave);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
      this.stateUnsubscribe = null;
    }
    this.layerObserver?.disconnect();
    this.layerObserver = null;
    this.disposeItemEvents();
    this.dropStage();
  }

  /** Lets the branch picture's stage go, ending any move it runs; its elements are the container's to clear. */
  dropStage(): void {
    if (!this.stage) return;
    dropStage(this.stage);
    this.stage = null;
  }

  /**
   * Triggers a full re-render of the Local Map view, while the map is the view shown;
   * otherwise the render is owed and {@link show} runs it when the map is shown again.
   */
  render(): void {
    cancelAnimationFrame(this.pendingRender);
    this.pendingRender = 0;
    if (!this.isShown()) {
      this.renderOwed = true;
      return;
    }
    this.renderOwed = false;
    // Apply pending toolbar displacement before capturing the visible subject.
    this.keepContentPutWhenLayerMoves();
    const id = this.options.state.selectedNode?.id;
    const path = this.localMapState.getState().activePath;
    const anchor = id && !this.renderedPath && !this.runtime.mapAnimationTarget ? this.getSubjectAnchor(id) : null;
    this.drawScene();
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

  /** Draw every scope through the same branch stage while owning its camera and render lifecycle. */
  private drawScene(): void {
    const { state, graphData } = this.options;
    const tuning = state.tuning.localMap;
    this.container.style.setProperty("--local-column-gap", `${tuning.columnGap}px`);
    this.container.style.setProperty("--hover-dim-symbols", String(tuning.hoverDimSymbols));
    this.container.style.setProperty("--hover-dim-connections", String(tuning.hoverDimConnections));

    this.currentSubgraph = null;
    this.branches = null;
    this.container.classList.remove("symbol-hover-active");
    this.overlay.classList.remove("symbol-hover-active");
    this.clearAnchors();
    const path = this.getActivePath();
    // A path borrows the view, not the exploration's camera or retained arrangement.
    const keepStage = this.stage?.root.parentElement === this.container
      && this.stage.root.classList.contains("path-mode") === !!path;
    if (!keepStage) {
      this.dropStage();
      this.previousTops = null;
      this.container.innerHTML = "";
      this.contentRoot = null;
    }

    if (!graphData.nodes.length) {
      clearConnections(this.runtime);
      this.container.innerHTML = '<div class="empty-hint" tabindex="-1" role="status">No files in this graph.</div>';
      this.mapTransform = { x: 0, y: 0, k: 1 };
      this.mapHasInitialFit = false;
      this.mapUserAdjusted = false;
      this.lastCenteredNodeId = null;
      this.mapInitialTransform = null;
      this.updateMapTransform();
      return;
    }

    if (!this.mapUserAdjusted) {
      this.mapHasInitialFit = false;
      this.mapInitialTransform = null;
    }
    const centeredId = state.selectedNode?.id ?? null;
    if (centeredId !== this.lastCenteredNodeId) {
      this.mapHasInitialFit = false;
      this.mapUserAdjusted = false;
      this.lastCenteredNodeId = centeredId;
      this.mapInitialTransform = null;
      this.lastInteracted = centeredId;
      this.lastInteractedSymbol = null;
    }

    const root = keepStage ? this.stage!.root : document.createElement("div");
    if (!keepStage) {
      root.className = "local-layout";
      this.container.append(root);
    }
    this.contentRoot = root;
    const stage = this.stage ?? (this.stage = createStage(root, this.overlay));
    renderBranches(this, stage);
    if (path) this.fitMapToPath();
    else if (!this.mapHasInitialFit) this.fitMapToContent();
    else this.updateMapTransform();
    this.scheduleConnectionRedraw();
  }

  /** Redraws all SVG connection lines between symbol anchors in the current subgraph. */
  drawConnections(): void {
    drawConnections({
      runtime: this.runtime,
      state: this.options.state,
      svgNamespace: this.svgNamespace,
      getAnchor: (nodeId, columnRole, direction, symbol) => this.getAnchor(nodeId, columnRole, direction, symbol),
      measureLayoutExtents: () => this.measureLayoutExtents(),
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
      if (options.state.tuning.localMap.holdStill === "hover") {
        this.lastInteracted = nodeId;
        this.lastInteractedSymbol = symbol;
      }
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
      currentSubgraph.center?.id ?? "",
      dimSymbols,
      dimConnections,
      () => this.drawConnections()
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
      () => this.drawConnections()
    );
  }

  /** Capture a 2D pin action's screen anchor and keyboard focus; shared pin policy belongs to the application. */
  capturePinChange(nodeId: string, symbol: string, nextSubjectId: string | null, closeExpansion = false): LocalExplorationFrame {
    if (closeExpansion) this.expandedCards.delete(nodeId);
    this.lastInteracted = nodeId;
    this.lastInteractedSymbol = symbol === "*" ? null : symbol;
    // A subject changed by a pin must not be mistaken for a direct choice that re-fits the camera.
    this.lastCenteredNodeId = nextSubjectId;
    const selector = symbol === "*"
      ? `.node-card[data-id="${CSS.escape(nodeId)}"] .node-title`
      : `.symbol-row[data-node-id="${CSS.escape(nodeId)}"][data-symbol="${CSS.escape(symbol)}"] .symbol-label-wrapper`;
    const focusSelector = symbol === "*"
      ? `.node-card[data-id="${CSS.escape(nodeId)}"] .local-file-pin`
      : `${selector} .local-symbol-pin`;
    return this.captureExplorationFrame(selector, focusSelector, ".local-file-inspect, .local-directory-closed__name, .empty-hint");
  }

  /** Capture an opened directory's label or closed box before the application changes the opened set. */
  captureDirectoryChange(directory: string): LocalExplorationFrame {
    this.lastInteracted = directory;
    this.lastInteractedSymbol = null;
    const selector = `.local-directory-label[data-directory="${CSS.escape(directory)}"], .local-directory-closed[data-directory="${CSS.escape(directory)}"]`;
    const label = `.local-directory-label[data-directory="${CSS.escape(directory)}"]`;
    const focusSelector = `${label} .local-directory-open, ${label} .local-directory-close, .local-directory-closed[data-directory="${CSS.escape(directory)}"] .local-directory-open`;
    return this.captureExplorationFrame(selector, focusSelector, ".local-file-inspect, .local-directory-closed__name, .empty-hint");
  }

  /** A pin or opening leaves path mode without restoring the former exploration camera. */
  clearPathForExploration(): void {
    this.localMapState.update(s => ({ ...s, activePath: null }));
  }

  /** The view's visual half of an application-owned exploration transaction. */
  private captureExplorationFrame(selector: string, focusSelector: string, fallbackSelector: string): LocalExplorationFrame {
    const leavingPath = !!this.localMapState.getState().activePath;
    const before = this.isShown() ? this.container.querySelector<HTMLElement>(selector)?.getBoundingClientRect() : undefined;
    const keyboardFocus = this.container.contains(document.activeElement);
    return {
      leavingPath,
      afterRender: () => {
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
          const element = this.container.querySelector<HTMLElement>(focusSelector)
            ?? this.container.querySelector<HTMLElement>(fallbackSelector);
          element?.focus({ preventScroll: true });
        }
      }
    };
  }

  /**
   * Sets the active path for path-mode rendering.
   * Path mode renders ONLY the nodes in the path as a linear chain,
   * without showing the full Dependencies/Dependents subgraphs of each node.
   * 
   * It uses the same directory-aware layout as exploration, while keeping
   * the exploration pins and camera available for Clear.
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

  /** Bring a retained file into reading position without changing the retained selections. */
  focusNode(nodeId: string): void {
    const element = this.container.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(nodeId)}"]`);
    if (element) this.focusElement(element);
  }

  /** Bring a directory's label into reading position without opening or pinning anything. */
  focusDirectory(directory: string): void {
    const element = this.container.querySelector<HTMLElement>(`.local-directory-label[data-directory="${CSS.escape(directory)}"], .local-directory-closed[data-directory="${CSS.escape(directory)}"]`);
    if (element) this.focusElement(element);
    else if (directory === "") this.fitMapToContent();
  }

  private focusElement(element: HTMLElement): void {
    this.cancelInertia();
    const frame = this.viewport.getBoundingClientRect();
    const target = element.getBoundingClientRect();
    const next = {
      ...this.mapTransform,
      x: this.mapTransform.x + frame.left + frame.width * 0.4 - (target.left + target.width / 2),
      y: this.mapTransform.y + frame.top + frame.height * 0.4 - (target.top + target.height / 2)
    };
    this.mapUserAdjusted = true;
    animateMapTransformFn(this.runtime, next, () => this.updateMapTransform(), true);
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

  /** The currently rendered disclosure, or `null` before the first render. */
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

  /** Inspect a file or symbol without changing its retained pins or the map subject. */
  async focusSidebar(node: ExplorerNodePayload, symbol?: string): Promise<void> {
    this.lastInteracted = node.id;
    this.lastInteractedSymbol = symbol ?? null;
    await this.options.onFocusSidebar(node, symbol);
  }

  /** Inspect a directory without opening it. */
  async inspectDirectory(directory: string): Promise<void> {
    this.lastInteracted = directory;
    this.lastInteractedSymbol = null;
    await this.options.onInspectDirectory(directory);
  }

  /** Open the application-owned actions beside the node element that named them. */
  async showNodeActions(node: ExplorerNodePayload, symbol: string | undefined, anchor: { x: number; y: number }): Promise<void> {
    this.lastInteracted = node.id;
    this.lastInteractedSymbol = symbol ?? null;
    await this.options.onShowNodeActions(node, symbol, anchor);
  }

  /** Open the same directory commands from its visible More control or a context gesture. */
  async showDirectoryActions(directory: string, anchor: { x: number; y: number }): Promise<void> {
    this.lastInteracted = directory;
    this.lastInteractedSymbol = null;
    await this.options.onShowDirectoryActions(directory, anchor);
  }

  /** Measures content and column bounding boxes used for fit-to-content and centering calculations. */
  measureLayoutExtents(): LayoutExtents | null {
    return computeLayoutExtents(this.container, this.contentRoot);
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

  /** Entity context gestures share one lifetime; dragging and multi-pointer gestures cancel pending activation. */
  private bindItemEvents(): void {
    type Press = { pointerId: number; x: number; y: number; target: HTMLElement; cancelled: boolean; held: boolean };
    let press: Press | null = null;
    let timer = 0;
    let multiPointerGesture = false;
    const pressed = new Set<number>();
    const entitySelector = ".node-card, .local-directory-label, .local-directory-closed";
    const htmlTarget = (target: EventTarget | null): HTMLElement | null => {
      for (let element = target instanceof Element ? target : null; element; element = element.parentElement) {
        if (element instanceof HTMLElement) return element;
      }
      return null;
    };
    const clearTimer = (): void => { window.clearTimeout(timer); timer = 0; };
    const cancel = (): void => { clearTimer(); if (press) press.cancelled = true; };
    const context = (target: HTMLElement, anchor: { x: number; y: number }): boolean => {
      const card = target.closest<HTMLElement>(".node-card");
      const node = card?.dataset.id ? this.options.nodesById.get(card.dataset.id) : undefined;
      if (node) {
        void this.showNodeActions(node, target.closest<HTMLElement>(".symbol-row")?.dataset.symbol, anchor);
        return true;
      }
      const directory = target.closest<HTMLElement>(".local-directory-label, .local-directory-closed")?.dataset.directory;
      if (directory !== undefined) { void this.showDirectoryActions(directory, anchor); return true; }
      return false;
    };
    const pointerDown = (event: PointerEvent): void => {
      pressed.add(event.pointerId);
      clearTimer();
      if (pressed.size > 1) { multiPointerGesture = true; cancel(); return; }
      multiPointerGesture = false;
      press = null;
      const target = htmlTarget(event.target);
      if (!this.isShown() || event.button !== 0 || !target) return;
      if (!target.closest(entitySelector)) return;
      press = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, target, cancelled: false, held: false };
      // The primary action of a visible command remains that command; only entity surfaces have a held gesture.
      if (target.closest("button:not(.local-file-inspect):not(.symbol-label):not(.local-directory-name):not(.local-directory-closed__name), a, input, select")) return;
      const pending = press;
      timer = window.setTimeout(() => {
        timer = 0;
        if (press !== pending || pending.cancelled || !target.isConnected || !this.isShown()) return;
        pending.held = true;
        // A directory's body can begin a pan. A stationary hold ends that press before showing its actions.
        this.pointers.delete(pending.pointerId);
        if (this.isDragging) handleDragEnd(this.runtime, this.viewport, () => this.updateMapTransform());
        context(target, { x: pending.x, y: pending.y });
      }, 550);
    };
    const pointerMove = (event: PointerEvent): void => {
      if (press?.pointerId === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) cancel();
    };
    const pointerUp = (event: PointerEvent): void => {
      pressed.delete(event.pointerId);
      if (press?.pointerId === event.pointerId) {
        pointerMove(event);
        clearTimer();
        if (event.type === "pointercancel") press.cancelled = true;
      }
    };
    const click = (event: MouseEvent): void => {
      const suppress = event.detail !== 0 && (multiPointerGesture || (press && (press.cancelled || press.held)));
      clearTimer();
      press = null;
      if (suppress) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    const contextMenu = (event: MouseEvent): void => {
      const target = htmlTarget(event.target);
      if (!this.isShown() || !target?.closest(entitySelector)) return;
      event.preventDefault();
      event.stopPropagation();
      clearTimer();
      if (press?.held || press?.cancelled) return;
      if (press) press.held = true;
      const rect = target.getBoundingClientRect();
      context(target, event.clientX || event.clientY
        ? { x: event.clientX, y: event.clientY } : { x: rect.left + rect.width / 2, y: rect.bottom });
    };
    const keyDown = (event: KeyboardEvent): void => {
      const target = htmlTarget(event.target);
      if (!target?.closest(entitySelector)) return;
      if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
      event.preventDefault();
      event.stopPropagation();
      cancel();
      const rect = target.getBoundingClientRect();
      context(target, { x: rect.left + rect.width / 2, y: rect.bottom });
    };
    const escape = (event: KeyboardEvent): void => { if (event.key === "Escape") cancel(); };
    const blur = (): void => { cancel(); pressed.clear(); };
    const visibility = (): void => { if (document.visibilityState !== "visible") blur(); };
    this.viewport.addEventListener("pointerdown", pointerDown, true);
    this.viewport.addEventListener("click", click, true);
    this.viewport.addEventListener("contextmenu", contextMenu);
    this.viewport.addEventListener("keydown", keyDown);
    this.viewport.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("pointermove", pointerMove, true);
    window.addEventListener("pointerup", pointerUp, true);
    window.addEventListener("pointercancel", pointerUp, true);
    window.addEventListener("keydown", escape);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    this.disposeItemEvents = () => {
      clearTimer();
      this.viewport.removeEventListener("pointerdown", pointerDown, true);
      this.viewport.removeEventListener("click", click, true);
      this.viewport.removeEventListener("contextmenu", contextMenu);
      this.viewport.removeEventListener("keydown", keyDown);
      this.viewport.removeEventListener("wheel", cancel);
      window.removeEventListener("pointermove", pointerMove, true);
      window.removeEventListener("pointerup", pointerUp, true);
      window.removeEventListener("pointercancel", pointerUp, true);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
    };
  }

  /**
   * The pan and the pinch on pointer events, so that a mouse, a pen and a finger do the same (2026-10-15; the pan had
   * listened to mouse events alone, which a touch screen's drag never sends). The viewport's `touch-action: none`
   * keeps the browser's own scrolling and zooming off it.
   */
  private bindPointerEvents(): void {
    this.viewport.addEventListener("pointerdown", event => {
      // A press on a card, a directory control or a button is not the start of a drag; nor is a mouse's other button.
      // A drag marks the camera as the person's own, after which no render re-fits
      // it; toolbar clicks used to do that too, which left Clear unable to bring
      // the subject back into the frame (measured 3,846 px off, 2026-10-01).
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if ((event.target as HTMLElement | null)?.closest?.(".node-card, .pathfind-toolbar, button, [role=button], input, select, a")) {
        return;
      }
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        if (this.isDragging) handleDragEnd(this.runtime, this.viewport, () => this.updateMapTransform());
        this.pinch = { distance: Math.hypot(b.x - a.x, b.y - a.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        return;
      }
      if (this.pointers.size > 2) return;
      startDrag(this.runtime, event.clientX, event.clientY, this.viewport);
    });

    window.addEventListener("pointermove", this.handleWindowPointerMove);
    window.addEventListener("pointerup", this.handleWindowPointerUp);
    window.addEventListener("pointercancel", this.handleWindowPointerUp);
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

}

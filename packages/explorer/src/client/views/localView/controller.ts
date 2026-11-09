import { EMPTY_PIN_SET, isSymbolPinned as isExplorationPin, type PinSet } from "../pin-state";
import { createStage, dropStage, refreshReadingGeometry, refreshReadingPresentation, renderBranches, type BranchStage } from "./branch-renderer";
import type { BranchGraph } from "./branches";
import type { CardContext } from "./card-factory";
import { CardReading, type ReadingTarget } from "./card-reading";
import { NO_OPEN_DIRECTORIES, type OpenDirectories } from "./directory-state";
import {
  computeLayoutExtents,
  computeFitTransform,
  computePathFitTransform,
  applyContainerDimensions,
  settleTransform,
  focusTransform,
  cardReadingTransform,
  withTransformReset,
  type Bounds,
  type Frame,
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
import type {
  ExplorerNodePayload
} from "../../../shared/types";
import { requireElement } from "../../dom";
import {
  buildNormalizedAnchorKey,
  tryBuildNormalizedKeyFromAnchorKey
} from "../symbolAnchors";
import { clearConnections, drawConnections } from "./connections";
import { createEdgeSigns, type EdgeSigns, type FramePlace } from "./edge-signs";
import { ladderBand, ladderScales, ladderStep, type LadderBand } from "./ladder-steps";
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
  MapTransform,
  ReadingControl
} from "./types";
import { atScale, CLOSEST_SCALE, farthestScale } from "./zoom-limits";
import { readingFiles } from "../../reading-state";

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
  /** Stable card text and temporary attention, with deliberate choices owned by the application. */
  readonly reading: CardReading | null;
  /** A reading change holds the card's name through its move; under hover anchoring the pointer re-anchors only once that move has ended. */
  readingHold = false;
  /** The card ladder's band (2026-11-05, Turn 9), read by the stylesheet from the container's `data-lod`. */
  private lod: LadderBand = "reading";
  /** The card ladder's step (2026-11-06, Turns 17 to 19), read by the stylesheet from the container's `data-step`; null before the first. */
  private ladderStep: number | null = null;
  /** What the stylesheet was last given by the ladder, so that a frame with the same band and held scales writes nothing. */
  private ladderWritten = "";
  /** Whether a gesture, inertia or an animation moves the camera, as the container's `data-camera` last said. */
  private cameraMoving = false;
  /** The frame at which the camera's motion is looked at again while it moves; 0 at rest. */
  private cameraFrame = 0;
  /** The frame at which the wires are drawn again for a new step of the ladder; 0 when none is owed. */
  private ladderRedraw = 0;
  private readingVisible = true;
  private readingReferenceScale = 1;
  /** The frame's size as last read, against which the farthest zoom is reckoned; null before the first reading. */
  private zoomFrame: Frame | null = null;
  /** Which of the Zoom limits the camera stood at when last said, so that they are said only when they change. */
  private zoomLimitsSaid = "";
  private readingFrame = 0;
  private readingViewportSize: { width: number; windowHeight: number } | null = null;
  private readingCalibrationPending = false;
  private readingFrameTarget: ReadingTarget | null = null;
  private keyboardFocusTarget: HTMLElement | null = null;
  /** The card builder reads only presentation facts and named actions, never this controller's state bag. */
  readonly cardContext: CardContext = {
    presentation: node => ({
      subject: this.options.state.selectedNode?.id === node.id,
      retained: this.pins.entries.some(pin => pin.nodeId === node.id) || this.readingFiles.has(node.id),
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
    readNode: (node, symbol) => this.readNode(node, symbol),
    showNodeActions: (node, symbol, anchor) => this.showNodeActions(node, symbol, anchor),
    showDirectoryActions: (directory, anchor) => this.showDirectoryActions(directory, anchor),
    highlightSymbolConnections: (nodeId, symbol) => this.highlightSymbolConnections(nodeId, symbol),
    clearSymbolHighlight: () => this.clearSymbolHighlight(),
    focusTypeTarget: targetId => {
      const target = this.options.nodesById.get(targetId);
      if (target) void this.focusSidebar(target);
    },
    attachReading: (card, node) => this.reading?.attach(card, node)
  };
  private renderedPath = false;
  private directoryArrivalPending = false;
  /** The requested identity is measured after its layout move, never from a transient pose. */
  private focusRequest: string | null = null;
  private restoreExplorationCamera = false;
  private explorationCamera: { transform: MapTransform; initial: MapTransform | null; userAdjusted: boolean; layerTop: number } | null = null;
  /** Shared pins are owned by the application, not this renderer. */
  get pins(): PinSet { return this.options.state.pins ?? EMPTY_PIN_SET; }
  /** The directories the person has opened, owned by the application beside the pins (2026-10-08). */
  get openDirectories(): OpenDirectories { return this.options.state.openDirectories ?? NO_OPEN_DIRECTORIES; }
  /** Files kept available only to read; they add no neighborhood pin. */
  get readingFiles(): ReadonlySet<string> { return readingFiles(this.options.state.reading ?? []); }
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

  /** The picture's bounds in the layer's pixels as last measured, which the edge signs and the settle read; null before a picture. */
  private contentBounds: Bounds | null = null;
  /** The fades at the frame's edges that say the picture continues past them. */
  private readonly edgeSigns: EdgeSigns;

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
  private pendingCardTouch: { pointerId: number; x: number; y: number } | null = null;
  private disposeItemEvents = (): void => {};

  private readonly handleWindowPointerMove = (event: PointerEvent): void => {
    const { state } = this.options;
    if (state.view !== "map" || state.perspective !== "2d" || !this.pointers.has(event.pointerId)) {
      return;
    }
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pending = this.pendingCardTouch;
    if (pending?.pointerId === event.pointerId) {
      if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) <= 6) return;
      this.pendingCardTouch = null;
      this.beginCameraGesture();
      startDrag(this.runtime, pending.x, pending.y, this.viewport);
    }
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
    this.readingCalibrationPending = false;
    this.readingFrameTarget = null;
    this.directoryArrivalPending = false;
    this.focusRequest = null;
    const { state } = this.options;
    if ((state.view !== "map" || state.perspective !== "2d")) {
      return;
    }
    handleWheelFn(this.runtime, event, () => this.updateMapTransform());
    this.watchCamera();
  };

  private readonly handleWindowPointerUp = (event: PointerEvent): void => {
    if (this.pendingCardTouch?.pointerId === event.pointerId) this.pendingCardTouch = null;
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
    this.reading = options.readingLinks ? new CardReading(this.container, {
      links: options.readingLinks,
      choices: () => options.state.reading ?? [],
      defaultOpen: (nodeId, symbol) => {
        const pins = this.pins.entries.filter(pin => pin.nodeId === nodeId);
        return pins.some(pin => pin.symbol === "*") || (pins.length === 0 && options.state.selectedNode?.id === nodeId)
          || symbol !== undefined && pins.some(pin => pin.symbol === symbol);
      },
      mode: () => options.state.tuning.localMap.cardText,
      resistances: () => options.state.tuning.localMap,
      change: (nodeId, symbol, open, control) => options.onReadingChange?.(nodeId, symbol, open, control),
      inspect: (target, fragment) => options.onReadTarget?.(target, fragment),
      navigate: node => { void this.recenterNode(node); }
    }) : null;
    this.localMapState = createStateStore(createInitialState());
    this.container.classList.add("cluster-host", "local-map-host");
    this.edgeSigns = createEdgeSigns(this.viewport);
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
    if (!this.isShown()) return;
    const top = this.measureLayerTop();
    if (this.layerTop !== null && top !== this.layerTop) {
      const dy = top - this.layerTop;
      const held = this.actedOnElement()?.getBoundingClientRect();
      // A new status/header may cover an identity that was visible before it grew. Keep ordinary anchors still,
      // but move that newly covered identity just below the new edge rather than preserving an invisible place.
      const uncover = dy > 0 && held && held.top - dy >= this.layerTop ? Math.max(0, top + 8 - (held.top - dy)) : 0;
      const shift = -dy + uncover;
      this.mapTransform = { ...this.mapTransform, y: this.mapTransform.y + shift };
      if (this.mapInitialTransform) {
        this.mapInitialTransform = { ...this.mapInitialTransform, y: this.mapInitialTransform.y + shift };
      }
      if (this.runtime.mapAnimationTarget) {
        this.runtime.mapAnimationTarget = { ...this.runtime.mapAnimationTarget, y: this.runtime.mapAnimationTarget.y + shift };
      }
      this.updateMapTransform();
    }
    this.layerTop = top;
    if (this.reading && this.stage && this.readingViewportSize) {
      const view = this.viewport.getBoundingClientRect(), before = this.readingViewportSize;
      // A path/status strip moves the layer but is not a window resize. Keep that picture put, including its text.
      if (view.width !== before.width || window.innerHeight !== before.windowHeight) {
        const frame = this.frameRect(), target = this.readingFrameTarget;
        const subject = target?.nodeId ?? this.options.state.selectedNode?.id ?? this.pins.entries.at(-1)?.nodeId ?? [...this.readingFiles].at(-1);
        const card = subject ? `.node-card[data-id="${CSS.escape(subject)}"]` : null;
        const selector = target?.symbol && card ? `${card} .symbol-row[data-symbol="${CSS.escape(target.symbol)}"]` : card;
        // A layout improvement can move the camera to keep its subject still. Remember who owns the reading frame;
        // neither the responsive rectangle nor the old transform can reliably reconstruct that intent afterwards.
        const centered = !!target;
        this.configureReadingFrame(frame);
        refreshReadingGeometry(this, this.stage, () => this.reading!.updatePresentation(this.readingVisible));
        if (centered && selector) { this.focusRequest = selector; this.settleArrival(); }
      }
    }
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
    cancelAnimationFrame(this.readingFrame);
    cancelAnimationFrame(this.cameraFrame);
    this.cameraFrame = 0;
    cancelAnimationFrame(this.ladderRedraw);
    this.ladderRedraw = 0;
    this.reading?.dispose();
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
    const changedSubject = !!id && !!this.lastCenteredNodeId && id !== this.lastCenteredNodeId;
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
    } else if (id && changedSubject && !path && this.stage?.move) {
      // A returning subject can already exist as an offscreen neighbour. The native move holds its identity;
      // bring that title into the frame now, then let the pending reading arrival settle its final position.
      const title = this.container.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(id)}"] .node-title`);
      if (title) {
        const box = title.getBoundingClientRect(), frame = this.frameRect();
        const x = Math.max(frame.left + 16, Math.min(box.left, frame.left + frame.width - box.width - 16));
        const y = Math.max(frame.top + 16, Math.min(box.top, frame.top + frame.height - box.height - 16));
        this.placeSubjectAnchor(id, { x: x + box.width / 2, y: y + box.height / 2 });
      }
    } else if (id && anchor && !path && !changedSubject) {
      this.placeSubjectAnchor(id, anchor);
    }
    this.renderedPath = !!path;
  }

  /** Draw every scope through the same branch stage while owning its camera and render lifecycle. */
  private drawScene(): void {
    const { state, graphData } = this.options;
    const tuning = state.tuning.localMap;
    cancelAnimationFrame(this.readingFrame);
    this.readingFrame = 0;
    this.reading?.reset();
    const frame = this.frameRect();
    this.configureReadingFrame(frame);
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
      this.options.onBackwardConnections?.(0);
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
      this.readingVisible = true;
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
    this.container.style.setProperty("--slot-lines", String(Math.max(1, Math.round(this.options.state.tuning.localMap.slotLines))));
    this.applyLevelOfDetail(this.mapTransform.k / this.readingReferenceScale);
    this.reading?.updatePresentation(this.readingVisible);
    const stage = this.stage ?? (this.stage = createStage(root, this.overlay));
    renderBranches(this, stage);
    if (path) this.fitMapToPath();
    else if (!this.mapHasInitialFit) this.fitMapToContent();
    else this.updateMapTransform();
    this.scheduleConnectionRedraw();
  }

  /** Redraws all SVG connection lines between symbol anchors in the current subgraph. */
  drawConnections(): void {
    const backward = drawConnections({
      runtime: this.runtime,
      state: this.options.state,
      svgNamespace: this.svgNamespace,
      getAnchor: (nodeId, columnRole, direction, symbol) => this.getAnchor(nodeId, columnRole, direction, symbol),
      measureLayoutExtents: () => this.measureLayoutExtents(),
      branches: this.branches ?? undefined
    });
    // A transient crossing during rearrangement is not a reason to leave 2D. The final frame reports again.
    this.options.onBackwardConnections?.(this.stage?.move ? 0 : backward);
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
   * - Cross-file and self-loop edges store complete documented headings: "OracleEdge"
   * - The special "__internals__" symbol represents private implementation
   * Names keep their case, kind and overload distinctions throughout matching.
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
      // The render after a tap on a name puts a new row under a resting pointer, and Chromium reports that as a
      // hover; re-anchoring to it mid-move would leap the card's name, which the reading change is holding.
      if (options.state.tuning.localMap.holdStill === "hover" && !(this.readingHold && this.stage?.move)) {
        this.lastInteracted = nodeId;
        this.lastInteractedSymbol = symbol;
      }
      if (!this.stage?.move) this.readingHold = false;
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
    return this.captureExplorationFrame(selector, focusSelector, ".local-file-name, .local-directory-closed__name, .empty-hint");
  }

  /** Capture an opened directory's label or closed box before the application changes the opened set. */
  captureDirectoryChange(directory: string): LocalExplorationFrame {
    this.lastInteracted = directory;
    this.lastInteractedSymbol = null;
    const selector = `.local-directory-label[data-directory="${CSS.escape(directory)}"], .local-directory-closed[data-directory="${CSS.escape(directory)}"]`;
    const label = `.local-directory-label[data-directory="${CSS.escape(directory)}"]`;
    const focusSelector = `${label} .local-directory-open, ${label} .local-directory-close, .local-directory-closed[data-directory="${CSS.escape(directory)}"] .local-directory-open`;
    const frame = this.captureExplorationFrame(selector, focusSelector, ".local-file-name, .local-directory-closed__name, .empty-hint");
    return { ...frame, afterRender: () => {
      frame.afterRender();
      this.directoryArrivalPending = this.isShown();
      if (!this.stage?.move) this.settleArrival();
    } };
  }

  /** Keep fixed-slot text changes inside an unchanged scene, preserving its DOM, focus and continuing search. */
  tryRefreshReading(): boolean {
    if (!this.isShown() || this.renderOwed || this.pendingRender || !this.stage) return false;
    const refreshed = refreshReadingPresentation(this, this.stage);
    if (refreshed) this.readingHold = false;
    return refreshed;
  }

  /**
   * Deliberate reading changes share the native anchor/focus transaction, without changing the pin set. The card
   * being read is what the eye is on, so its name is held still and the card grows downward from the tapped row;
   * holding the row itself let the re-solved layout seat the taller card higher and leap its name upward
   * (measured at 103 px on the payment service, 2026-11-05). Focus returns to the control used.
   */
  captureReadingChange(nodeId: string, symbol?: string, control: ReadingControl = "book"): LocalExplorationFrame {
    this.lastInteracted = nodeId;
    this.lastInteractedSymbol = null;
    this.readingHold = true;
    const card = `.node-card[data-id="${CSS.escape(nodeId)}"]`;
    const row = symbol ? `${card} .symbol-row[data-symbol="${CSS.escape(symbol)}"]` : card;
    const focus = control === "name" ? (symbol ? `${row} .symbol-label` : `${card} .local-file-name`)
      : `${row} ${symbol ? ".local-symbol-read" : ".local-file-read"}`;
    return this.captureExplorationFrame(`${card} .node-title`, focus, ".local-file-name");
  }

  private configureReadingFrame(frame: Frame): void {
    const view = this.viewport.getBoundingClientRect();
    this.readingViewportSize = { width: view.width, windowHeight: window.innerHeight };
    const cap = this.options.state.tuning.localMap.cardMaxWidth ?? Infinity;
    this.container.style.setProperty("--reading-available-width", `${Math.max(200, Math.min(520, frame.width - 32))}px`);
    this.container.style.setProperty("--reading-card-width", `${Math.max(200, Math.min(520, frame.width - 32, cap))}px`);
    this.container.style.setProperty("--reading-prose-height", `${Math.max(140, Math.min(280, frame.height * 0.4))}px`);
    this.container.style.setProperty("--reading-frame-height", `${frame.height}px`);
  }

  /** Keep the opened identity through its unfolding, then recover usable space; a person's camera gesture cancels this. */
  settleArrival(): void {
    if (this.stage?.move || !this.isShown()) return;
    if (this.focusRequest) {
      const element = this.container.querySelector<HTMLElement>(this.focusRequest);
      this.focusRequest = null;
      this.directoryArrivalPending = false;
      if (element) this.focusElement(element);
      this.readingCalibrationPending = false;
      return;
    }
    if (!this.directoryArrivalPending) return;
    this.directoryArrivalPending = false;
    if (this.isShown()) this.settleIntoFrame();
  }

  /** A pin or opening leaves path mode without restoring the former exploration camera. */
  clearPathForExploration(): void {
    this.localMapState.update(s => ({ ...s, activePath: null }));
  }

  /** The view's visual half of an application-owned exploration transaction. */
  private captureExplorationFrame(selector: string, focusSelector: string, fallbackSelector: string): LocalExplorationFrame {
    this.readingFrameTarget = null;
    const leavingPath = !!this.localMapState.getState().activePath;
    const before = this.isShown() ? this.container.querySelector<HTMLElement>(selector)?.getBoundingClientRect() : undefined;
    const beforeTop = this.isShown() ? this.viewport.getBoundingClientRect().top + this.framePlace().top : 0;
    const keyboardFocus = this.container.contains(document.activeElement);
    return {
      leavingPath,
      afterRender: () => {
        const after = this.container.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (before && after) {
          // An anchored action owns this arrival, including when leaving a path requested an incidental pending fit.
          this.focusRequest = null;
          this.readingCalibrationPending = false;
          this.readingFrameTarget = null;
          cancelAnimationFrame(this.runtime.mapAnimationFrame);
          this.runtime.mapAnimationTarget = null;
          this.mapHasInitialFit = true;
          this.mapUserAdjusted = true;
          const top = this.viewport.getBoundingClientRect().top + this.framePlace().top;
          const heldTop = top > beforeTop && before.top >= beforeTop ? Math.max(before.top, top + 8) : before.top;
          this.mapTransform = { ...this.mapTransform, x: this.mapTransform.x + before.left - after.left, y: this.mapTransform.y + heldTop - after.top };
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

  private actedOnElement(): HTMLElement | null {
    if (!this.lastInteracted) return null;
    const card = this.container.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(this.lastInteracted)}"]`);
    return (this.lastInteractedSymbol ? card?.querySelector<HTMLElement>(`.symbol-row[data-symbol="${CSS.escape(this.lastInteractedSymbol)}"] .symbol-label-wrapper`) : null)
      ?? card?.querySelector<HTMLElement>(".node-title") ?? null;
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
  focusNode(nodeId: string, symbol?: string): void {
    this.lastInteracted = nodeId;
    this.lastInteractedSymbol = symbol ?? null;
    const card = `.node-card[data-id="${CSS.escape(nodeId)}"]`;
    this.focusRequest = symbol ? `${card} .symbol-row[data-symbol="${CSS.escape(symbol)}"]` : card;
    if (this.reading) {
      this.readingCalibrationPending = true;
      cancelAnimationFrame(this.readingFrame);
      this.readingFrame = 0;
      if (!this.readingVisible && this.stage) {
        this.readingVisible = true;
        this.reading?.updatePresentation(true);
      }
    }
    this.settleArrival();
  }

  /** Bring a directory's label into reading position without opening or pinning anything. */
  focusDirectory(directory: string): void {
    const selector = `.local-directory-label[data-directory="${CSS.escape(directory)}"], .local-directory-closed[data-directory="${CSS.escape(directory)}"]`;
    const element = this.container.querySelector<HTMLElement>(selector);
    if (element) {
      this.lastInteracted = directory;
      this.lastInteractedSymbol = null;
      this.focusRequest = selector;
      this.settleArrival();
    }
    else if (directory === "") this.fitMapToContent();
  }

  private focusElement(element: HTMLElement): void {
    const nodeId = element.closest<HTMLElement>(".node-card")?.dataset.id;
    const symbol = element.closest<HTMLElement>(".symbol-row")?.dataset.symbol;
    this.readingFrameTarget = nodeId ? { nodeId, ...(symbol ? { symbol } : {}) } : null;
    this.cancelInertia();
    const frame = this.frameRect();
    const target = withTransformReset(this.container, origin => {
      const card = element.closest<HTMLElement>(".node-card");
      const across = (card ?? element).getBoundingClientRect();
      const whole = element.getBoundingClientRect();
      // A tall file is entered at its name; a symbol is entered at its own row, however far down the file it lies.
      const vertical = !this.reading && element === card && whole.height > frame.height
        ? card.querySelector<HTMLElement>(".node-title")!.getBoundingClientRect() : whole;
      const left = across.left - origin.left, top = vertical.top - origin.top;
      return { left, top, right: left + across.width, bottom: top + vertical.height, width: across.width, height: vertical.height };
    });
    const next = this.reading && element.classList.contains("node-card")
      ? cardReadingTransform(target, frame) : focusTransform(target, this.mapTransform, frame);
    if (this.reading && nodeId) this.readingReferenceScale = next.k;
    this.mapHasInitialFit = true;
    this.mapInitialTransform = { ...next };
    this.mapUserAdjusted = true;
    this.animateCamera(next);
  }

  /** Zooms the map in by 20%. */
  zoomIn(): void {
    this.readingCalibrationPending = false;
    this.readingFrameTarget = null;
    this.focusRequest = null;
    zoomByFactorFn(this.runtime, 1.2, () => this.updateMapTransform());
  }

  /** Zooms the map out by ~17%. */
  zoomOut(): void {
    this.readingCalibrationPending = false;
    this.readingFrameTarget = null;
    this.focusRequest = null;
    zoomByFactorFn(this.runtime, 1 / 1.2, () => this.updateMapTransform());
  }


  /**
   * Frames the picture again, as a first arrival would: the path's frame in path mode, else the content's. A fresh fit
   * rather than the stored one (2026-10-30), since the frame may have changed since, the reader opened over it or the
   * window resized, and the picture may have moved under the continuing search.
   */
  resetZoom(): void {
    this.focusRequest = null;
    if (!this.runtime.contentRoot) {
      return;
    }
    if (this.getActivePath()) this.fitMapToPath();
    else this.fitMapToContent();
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

  /** A name's tap opens or folds what it names; a card with nothing to open inspects instead. */
  async readNode(node: ExplorerNodePayload, symbol?: string): Promise<void> {
    if (this.reading?.toggle(node.id, symbol, "name")) return;
    await this.focusSidebar(node, symbol);
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

  /**
   * Measures content and column bounding boxes used for fit-to-content and centering calculations, and derives from them
   * the camera's farthest zoom, which follows the picture whenever it is measured.
   */
  measureLayoutExtents(): LayoutExtents | null {
    const extents = computeLayoutExtents(this.container, this.contentRoot);
    this.contentBounds = extents?.content ?? null;
    this.updateZoomFloor();
    return extents;
  }

  /**
   * The farthest zoom (2026-11-06, the far bands' second milestone): the card ladder's last step, or four fifths of the
   * scale that shows the whole map where that is farther, from the picture as last measured, the frame as last read and
   * the calibrated reading scale; unknown before the first layout, when nothing but a guard holds the camera. A camera
   * left beyond it, a remembered view or a frame grown since, is brought to it about the frame's middle at once, unless a
   * gesture or a move holds the camera.
   */
  private updateZoomFloor(): void {
    const floor = farthestScale(this.contentBounds, this.zoomFrame, this.readingReferenceScale);
    this.runtime.zoomFloor = floor;
    const runtime = this.runtime, moving = runtime.isDragging || this.pinch !== null || runtime.mapInertiaFrame !== 0 || runtime.mapAnimationTarget !== null;
    if (floor !== null && !moving && this.mapTransform.k < floor && !atScale(this.mapTransform.k, floor) && this.zoomFrame) {
      const { x, y, k } = this.mapTransform, middle = { x: this.zoomFrame.width / 2, y: this.zoomFrame.height / 2 };
      this.mapTransform = { x: middle.x - (middle.x - x) * floor / k, y: middle.y - (middle.y - y) * floor / k, k: floor };
      this.updateMapTransform();
    }
    this.reportZoomLimits();
  }

  /** Tells the Zoom buttons whether the camera stands at its farthest or its closest zoom, when either changes. */
  private reportZoomLimits(): void {
    const k = this.mapTransform.k, floor = this.runtime.zoomFloor;
    const limits = { farthest: floor !== null && (k <= floor || atScale(k, floor)), closest: k >= CLOSEST_SCALE || atScale(k, CLOSEST_SCALE) };
    const said = `${limits.farthest} ${limits.closest}`;
    if (said === this.zoomLimitsSaid) return;
    this.zoomLimitsSaid = said;
    this.options.onZoomLimits?.(limits);
  }

  /** Applies the current {@link mapTransform} to the viewport's CSS `transform`, keeping container and overlay in sync. */
  updateMapTransform(): void {
    // Apply transform to the viewport wrapper so container and overlay share the same stacking context
    const viewport = this.runtime.container.parentElement;
    if (viewport) {
      viewport.style.transform = `translate(${this.mapTransform.x}px, ${this.mapTransform.y}px) scale(${this.mapTransform.k})`;
      if (this.revealKeyboardFocus()) {
        viewport.style.transform = `translate(${this.mapTransform.x}px, ${this.mapTransform.y}px) scale(${this.mapTransform.k})`;
      }
    }
    this.edgeSigns.update(this.contentRoot ? this.contentBounds : null, this.mapTransform, this.framePlace());
    if (!this.runtime.mapAnimationTarget && !this.stage?.move) this.stage?.search?.resume();
    // From this frame's own scale, not the animation's destination: the owner saw the fonts "jump up in size before
    // the viewport has actually reached its terminal zoom destination" (2026-11-06, Turn 12).
    const ratio = this.mapTransform.k / this.readingReferenceScale;
    this.applyLevelOfDetail(ratio);
    this.reportZoomLimits();
    this.watchCamera();
    if (this.reading && this.stage?.search && !this.readingFrame && !this.readingCalibrationPending) {
      // Below reading scale the prose fades and above it returns, with the same two ratios so that the edge does not
      // chatter; a card's box never changes with zoom (the owner, 2026-11-05).
      const visible = this.readingVisible ? ratio >= 0.74 : ratio >= 0.92;
      if (visible !== this.readingVisible) this.readingFrame = requestAnimationFrame(() => {
        this.readingFrame = 0;
        if (!this.stage || !this.isShown()) return;
        this.readingVisible = visible;
        this.reading!.updatePresentation(visible);
      });
    }
  }

  /** Eases the camera to a pose, saying from its first moment that the camera moves. */
  private animateCamera(next: MapTransform): void {
    animateMapTransformFn(this.runtime, next, () => this.updateMapTransform(), true);
    this.watchCamera();
  }

  /**
   * Says on the container whether the camera moves (`data-camera="moving"`, absent at rest) and promotes the map's
   * viewport to a compositor layer only meanwhile (2026-11-06, Turns 17 to 19): a layer is rastered once at the scale it
   * had and stretched by the GPU after, which blurred the cards close up and aliased them far out, so a pan or a zoom in
   * motion is one cheap transform of a layer and the picture at rest is drawn afresh at its own scale. The motion is a
   * drag or a pinch, inertia, or an animation (a wheel's zoom, a fit, a focus); an instant jump such as a Zoom button's
   * is no motion and draws at its scale at once. While the camera moves it is looked at once a frame, since a drag's
   * release and inertia's last frame end the motion without another camera change.
   */
  private watchCamera(): void {
    const runtime = this.runtime;
    const moving = runtime.isDragging || this.pinch !== null || runtime.mapInertiaFrame !== 0 || runtime.mapAnimationTarget !== null;
    if (moving !== this.cameraMoving) {
      this.cameraMoving = moving;
      if (moving) this.container.dataset.camera = "moving";
      else delete this.container.dataset.camera;
      this.container.parentElement?.classList.toggle("camera-moving", moving);
    }
    if (moving && !this.cameraFrame) this.cameraFrame = requestAnimationFrame(() => {
      this.cameraFrame = 0;
      this.watchCamera();
    });
  }

  /**
   * The card ladder's band and step (2026-11-05, Turn 9; breakpoints since 2026-11-06, Turns 17 to 19). The band says
   * which tier of a slot card has left, the step how large what stays is drawn: a step every 20 % of zoom, each with
   * its held scales for names and controls from the resistances, and nothing computed between steps. Both keep their
   * value a margin past their edges, so a camera resting on one does not chatter, and the stylesheet is written only
   * when the band, the step or a lever changes: a moving camera costs one style pass and one drawing of the wires a
   * step instead of a style pass a frame.
   * Every held part is bounded by the room of the box it belongs to, measured at render by the card reading (the far-zoom
   * review, 2026-11-06), and below reading scale a symbol's name may also grow into the room its description leaves, up
   * to Name Growth times its held size (Turn 11).
   */
  private applyLevelOfDetail(ratio: number): void {
    if (!Number.isFinite(ratio) || ratio <= 0) return;
    this.lod = ladderBand(ratio, this.lod);
    this.ladderStep = ladderStep(ratio, this.ladderStep);
    const step = String(this.ladderStep);
    if (this.container.dataset.step !== step) this.container.dataset.step = step;
    const { textResistance, controlResistance, nameGrowth } = this.options.state.tuning.localMap;
    const growth = Math.max(1, Number.isFinite(nameGrowth) ? nameGrowth : 1).toFixed(2);
    const held = ladderScales(this.ladderStep, { textResistance, controlResistance });
    const text = held.text.toFixed(3), control = held.control.toFixed(3);
    // Only what the stylesheet reads is compared: a step whose held scales equal the last one's (at resistance 0, or
    // past a ceiling) writes nothing, and the page has nothing to draw again.
    const written = `${this.lod} ${text} ${control} ${growth}`;
    if (written === this.ladderWritten) return;
    // A new band or held size draws the anchor dots anew: at a new size from their edge beside the name, on their
    // name's line as it is held, or following the map where the overview silences their rows; so the wires that end at
    // them are drawn again once, the frame after (a render draws them itself; the first writing is a render's).
    if (this.ladderWritten && !this.ladderRedraw && this.stage) this.ladderRedraw = requestAnimationFrame(() => {
      this.ladderRedraw = 0;
      if (this.stage && this.isShown()) this.drawConnections();
    });
    this.ladderWritten = written;
    const style = this.container.style;
    const bandChanged = this.container.dataset.lod !== this.lod;
    this.container.dataset.lod = this.lod;
    style.setProperty("--text-scale", text);
    style.setProperty("--name-growth", growth);
    style.setProperty("--control-scale", control);
    // Slot prose follows the band; keep its reading controls in sync with what the stylesheet now shows.
    if (bandChanged) this.reading?.updatePresentation(this.readingVisible);
  }

  /** Pan only as far as the focused command needs, including while its native row is moving. */
  private revealKeyboardFocus(): boolean {
    const target = this.keyboardFocusTarget;
    if (!this.isShown() || !target?.isConnected || target !== document.activeElement) return false;
    const box = target.getBoundingClientRect();
    if (!box.width || !box.height) return false;
    const place = this.framePlace(), view = this.viewport.getBoundingClientRect();
    const left = view.left + place.left + 8, top = view.top + place.top + 8;
    const right = left + Math.max(1, place.width - 16), bottom = top + Math.max(1, place.height - 16);
    const shift = (start: number, end: number, min: number, max: number): number =>
      start < min ? min - start : end > max ? Math.max(min - start, max - end) : 0;
    const x = shift(box.left, box.right, left, right), y = shift(box.top, box.bottom, top, bottom);
    if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return false;
    this.mapTransform = { ...this.mapTransform, x: this.mapTransform.x + x, y: this.mapTransform.y + y };
    return true;
  }

  /**
   * Where the map layer stands inside the view and how much of it is open: its offsets, which no transform changes,
   * less what the open reader covers at the right. Cheap enough to read on every camera move.
   */
  private framePlace(): FramePlace {
    const layer = this.container.parentElement ?? this.viewport;
    const view = this.viewport.getBoundingClientRect();
    const left = layer.offsetLeft, top = layer.offsetTop, width = layer.offsetWidth, height = layer.offsetHeight;
    const frame = { left: view.left + left, top: view.top + top, right: view.left + left + width, bottom: view.top + top + height, width };
    return { left, top, width: width - this.coveredWidth(frame), height: this.uncoveredHeight(frame) };
  }

  /**
   * How much of the frame's width the open reader covers at its right, so that a fit keeps the picture out from under
   * it (the October 23 review's finding 13, 2026-10-30). A reader that leaves less than 240 px, the narrow screens'
   * full-width reader, covers nothing for this purpose: the fit is then for the map the reader will uncover.
   */
  private coveredWidth(frame: { left: number; top: number; right: number; bottom: number; width: number }): number {
    const obstruction = this.options.obstruction?.() ?? null;
    if (!obstruction || obstruction.bottom <= frame.top || obstruction.top >= frame.bottom || obstruction.left >= frame.right) return 0;
    const covered = frame.right - Math.max(obstruction.left, frame.left);
    return frame.width - covered < 240 ? 0 : covered;
  }

  /** Keep a fit above the persistent floating controls, using their actual boxes at this viewport size. */
  private uncoveredHeight(frame: { left: number; top: number; right: number; bottom: number }): number {
    let bottom = frame.bottom;
    for (const box of this.options.bottomObstructions?.() ?? []) {
      if (box.right > frame.left && box.left < frame.right && box.top >= frame.top && box.top < bottom) bottom = box.top;
    }
    return Math.max(1, bottom - frame.top);
  }

  /**
   * The frame a fit is computed for: the map layer's own box under the toolbar, measured with its transform reset,
   * less what the open reader covers. The layer's top is kept for {@link keepContentPutWhenLayerMoves}.
   */
  private frameRect(): Frame & { left: number; top: number } {
    const layer = this.container.parentElement ?? this.viewport;
    const rect = withTransformReset(this.container, () => layer.getBoundingClientRect());
    this.layerTop = rect.top;
    const frame = { left: rect.left, top: rect.top, width: rect.width - this.coveredWidth(rect), height: this.uncoveredHeight(rect) };
    // The farthest zoom is reckoned against the frame as last read, so that the camera's limit never reads the page.
    this.zoomFrame = { width: frame.width, height: frame.height };
    return frame;
  }

  /**
   * After the subject has been held where another view left it, the picture slides the least that brings it into the
   * frame at its current scale: inside the padding when it fits, the frame full when it does not; a picture already in
   * the frame stays. The return from 3D holds the subject through the motion and then settles so (the owner's choice,
   * 2026-10-30; before, the hold alone could leave a card cut at the edge with the rest of the frame empty).
   */
  settleIntoFrame(): void {
    const extents = this.measureLayoutExtents();
    if (!extents) return;
    const current = this.runtime.mapAnimationTarget ?? this.mapTransform;
    const next = settleTransform(extents.content, current, this.frameRect());
    if (Math.abs(next.x - current.x) < 0.5 && Math.abs(next.y - current.y) < 0.5) return;
    this.cancelInertia();
    this.animateCamera(next);
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
      this.keyboardFocusTarget = null;
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
      if (target.closest("button:not(.local-file-name):not(.symbol-label):not(.local-directory-name):not(.local-directory-closed__name), a, input, select")) return;
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
    const focusIn = (event: FocusEvent): void => {
      const target = htmlTarget(event.target);
      this.keyboardFocusTarget = target?.closest(".node-card") && target.matches(":focus-visible") ? target : null;
      if (this.keyboardFocusTarget && this.isShown()) {
        this.cancelInertia();
        this.updateMapTransform();
      }
    };
    const focusOut = (): void => { this.keyboardFocusTarget = null; };
    const wheel = (): void => { this.keyboardFocusTarget = null; cancel(); };
    const blur = (): void => { cancel(); pressed.clear(); };
    const visibility = (): void => { if (document.visibilityState !== "visible") blur(); };
    this.viewport.addEventListener("pointerdown", pointerDown, true);
    this.viewport.addEventListener("click", click, true);
    this.viewport.addEventListener("contextmenu", contextMenu);
    this.viewport.addEventListener("keydown", keyDown);
    this.viewport.addEventListener("focusin", focusIn);
    this.viewport.addEventListener("focusout", focusOut);
    this.viewport.addEventListener("wheel", wheel, { passive: true });
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
      this.viewport.removeEventListener("focusin", focusIn);
      this.viewport.removeEventListener("focusout", focusOut);
      this.viewport.removeEventListener("wheel", wheel);
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
      // Mouse presses on cards preserve text selection. Touch can pan from prose after movement, while commands
      // keep their native activation; neither a command nor a mouse's other button starts a drag.
      // A drag marks the camera as the person's own, after which no render re-fits
      // it; toolbar clicks used to do that too, which left Clear unable to bring
      // the subject back into the frame (measured 3,846 px off, 2026-10-01).
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.(".pathfind-toolbar, button, [role=button], input, select, textarea, a")
        || (event.pointerType !== "touch" && target?.closest?.(".node-card"))) {
        return;
      }
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.pointers.size === 2) {
        this.pendingCardTouch = null;
        this.beginCameraGesture();
        const [a, b] = [...this.pointers.values()];
        if (this.isDragging) handleDragEnd(this.runtime, this.viewport, () => this.updateMapTransform());
        this.pinch = { distance: Math.hypot(b.x - a.x, b.y - a.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        return;
      }
      if (this.pointers.size > 2) return;
      if (event.pointerType === "touch" && target?.closest?.(".node-card")) {
        this.pendingCardTouch = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        return;
      }
      this.beginCameraGesture();
      startDrag(this.runtime, event.clientX, event.clientY, this.viewport);
    });

    window.addEventListener("pointermove", this.handleWindowPointerMove);
    window.addEventListener("pointerup", this.handleWindowPointerUp);
    window.addEventListener("pointercancel", this.handleWindowPointerUp);
  }

  /** A movement, rather than a tap on readable prose, takes ownership of the camera. */
  private beginCameraGesture(): void {
    this.directoryArrivalPending = false;
    this.focusRequest = null;
    this.readingCalibrationPending = false;
    this.readingFrameTarget = null;
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
    const subject = this.options.state.selectedNode?.id ?? this.pins.entries.at(-1)?.nodeId ?? [...this.readingFiles].at(-1);
    const card = subject ? this.container.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(subject)}"]`) : null;
    if (this.reading && card) {
      this.readingFrameTarget = subject ? { nodeId: subject } : null;
      cancelAnimationFrame(this.runtime.mapAnimationFrame);
      this.runtime.mapAnimationTarget = null;
      this.cancelInertia();
      cancelAnimationFrame(this.readingFrame);
      this.readingFrame = 0;
      this.readingCalibrationPending = true;
      if (!this.readingVisible && this.stage) {
        this.readingVisible = true;
        this.reading?.updatePresentation(true);
      }
      if (this.stage?.move) {
        this.focusRequest = `.node-card[data-id="${CSS.escape(subject!)}"]`;
        return;
      }
      this.fitMap((extents, frame) => {
        const bounds = extents.focus && this.options.state.selectedNode?.id === subject ? extents.focus : withTransformReset(this.container, origin => {
          const rect = card.getBoundingClientRect();
          return { left: rect.left - origin.left, top: rect.top - origin.top, right: rect.right - origin.left,
            bottom: rect.bottom - origin.top, width: rect.width, height: rect.height };
        });
        const next = cardReadingTransform(bounds, frame);
        this.readingReferenceScale = next.k;
        return next;
      });
      this.readingCalibrationPending = false;
      return;
    }
    // Directory and path-free root arrivals still frame their disclosed contents.
    this.fitMap((extents, frame) => computeFitTransform(extents, frame, this.branches ? { minScale: 1 } : undefined));
  }

  /**
   * Frames a drawn path: reading size, its first file at the left edge when the
   * path is wider than the frame, centred when it is not.
   */
  fitMapToPath(): void {
    this.readingFrameTarget = null;
    this.fitMap((extents, frame) => computePathFitTransform(extents.content, frame));
  }

  /**
   * Measures the content and the map layer's own frame (the transformed layer
   * under the toolbar, measured with its transform reset, not the whole view),
   * sizes the container, and animates to the transform `target` computes.
   */
  private fitMap(target: (extents: LayoutExtents, frame: Frame) => MapTransform): void {
    cancelInertiaFn(this.runtime);
    const extents = this.measureLayoutExtents();
    const frame = this.frameRect();

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
    this.animateCamera(next);
    this.mapHasInitialFit = true;
    this.mapInitialTransform = { ...next };
    this.scheduleConnectionRedraw();
  }

}

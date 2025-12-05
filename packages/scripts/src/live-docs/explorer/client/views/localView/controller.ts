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
      getAnchor: (nodeId, direction, symbol) => this.getAnchor(nodeId, direction, symbol),
      measureLayoutExtents: () => this.measureLayoutExtents()
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

  registerAnchor(nodeId: string, key: string, element: HTMLElement): void {
    storeAnchor(this.runtime.anchorRegistry, nodeId, key, element, keyValue =>
      this.tryBuildNormalizedKey(keyValue)
    );
  }

  clearAnchors(): void {
    clearAnchorRegistry(this.runtime.anchorRegistry);
  }

  getAnchor(nodeId: string, direction: "inbound" | "outbound", symbol?: string): HTMLElement | null {
    return fetchAnchor(this.runtime.anchorRegistry, nodeId, direction, symbol, (dir, sym) =>
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

  measureLayoutExtents(): LayoutExtents | null {
    return this.computeLayoutExtents();
  }

  updateMapTransform(): void {
    const { container } = this.runtime;
    container.style.transform = `translate(${this.mapTransform.x}px, ${this.mapTransform.y}px) scale(${this.mapTransform.k})`;
    this.overlay.style.transform = container.style.transform;
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
    const previousContainerTransform = this.container.style.transform;
    const previousOverlayTransform = this.overlay.style.transform;
    this.container.style.transform = "none";
    this.overlay.style.transform = "none";
    try {
      const containerRect = this.container.getBoundingClientRect();
      return callback(containerRect);
    } finally {
      this.container.style.transform = previousContainerTransform;
      this.overlay.style.transform = previousOverlayTransform;
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

    return {
      center,
      nodes: [center, ...neighbors.values()],
      links: linkResults,
      inboundIds,
      outboundIds
    };
  }

  private easeOutCubic(t: number): number {
    const p = t - 1;
    return p * p * p + 1;
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }
}

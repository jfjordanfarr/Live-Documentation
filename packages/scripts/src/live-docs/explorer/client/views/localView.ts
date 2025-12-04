import type {
  ExplorerGraphPayload,
  ExplorerLinkKind,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { DirectoryNode, ExplorerState, TestCoverageMap } from "../types";
import {
  ROOT_KEY,
  buildHierarchy,
  computeDirectoryLayout,
  getDirectoryKey,
  measureDirectoryTree
} from "./layoutUtils";
import type { DirectoryLayoutPlan } from "./layoutUtils";
import {
  buildNormalizedAnchorKey,
  normalizeSymbolIdentifier,
  tryBuildNormalizedKeyFromAnchorKey
} from "./symbolAnchors";

export interface LocalViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  onSelectNode: (node: ExplorerNodePayload) => void | Promise<void>;
  testCoverage: TestCoverageMap;
}

export interface LocalViewApi {
  render(): void;
  drawConnections(): void;
  highlightSelection(): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
}

const SVG_NS = "http://www.w3.org/2000/svg";

interface LocalEdge {
  sourceId: string;
  targetId: string;
  direction: "outbound" | "inbound";
  kind: ExplorerLinkKind;
  sourceSymbol?: string;
  targetSymbol?: string;
}

interface LocalSubgraph {
  center: ExplorerNodePayload;
  nodes: ExplorerNodePayload[];
  links: LocalEdge[];
  inboundIds: Set<string>;
  outboundIds: Set<string>;
}

interface CenterAlignmentGuides {
  anchors: Map<string, number>;
  cardCenters: Map<string, number>;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface LayoutExtents {
  content: Bounds;
  focus: Bounds | null;
}

export function createLocalView(options: LocalViewOptions): LocalViewApi {
  const { state, graphData, resolveLinkEndpoint, onSelectNode, testCoverage } = options;
  const viewport = requireElement<HTMLDivElement>("view-map");
  const container = requireElement<HTMLDivElement>("map-container");
  const overlay = requireElement<HTMLDivElement>("map-connections");

  container.classList.add("cluster-host", "local-map-host");
  viewport.style.cursor = "grab";

  let currentSubgraph: LocalSubgraph | null = null;
  let mapTransform = { x: 0, y: 0, k: 1 };
  let isDragging = false;
  let lastDragPosition: { x: number; y: number; time: number } | null = null;
  let dragVelocity = { x: 0, y: 0 };
  let mapInertiaFrame = 0;
  let mapAnimationFrame = 0;
  let mapHasInitialFit = false;
  let mapUserAdjusted = false;
  let lastCenteredNodeId: string | null = null;
  let mapInitialTransform: { x: number; y: number; k: number } | null = null;
  let contentRoot: HTMLElement | null = null;
  const anchorRegistry = new Map<string, Map<string, HTMLElement>>();
  const isTestNode = (node: ExplorerNodePayload | null | undefined): boolean =>
    !!node && (node.archetype || "").toLowerCase() === "test";
  const shouldIncludeNode = (node: ExplorerNodePayload): boolean => {
    const archetype = (node.archetype || "").toLowerCase();
    if (archetype === "test" && !state.filters.showTests && node.id !== state.selectedNode?.id) {
      return false;
    }
    if (archetype === "asset" && !state.filters.showAssets && node.id !== state.selectedNode?.id) {
      return false;
    }
    return true;
  };

  const registerAnchor = (nodeId: string, key: string, element: HTMLElement): void => {
    if (!anchorRegistry.has(nodeId)) {
      anchorRegistry.set(nodeId, new Map());
    }
    const anchors = anchorRegistry.get(nodeId)!;
    anchors.set(key, element);
    const normalizedKey = tryBuildNormalizedKeyFromAnchorKey(key);
    if (normalizedKey) {
      anchors.set(normalizedKey, element);
    }
  };

  const getAnchor = (
    nodeId: string,
    direction: "inbound" | "outbound",
    symbol?: string
  ): HTMLElement | null => {
    const anchors = anchorRegistry.get(nodeId);
    if (!anchors) {
      return null;
    }
    if (symbol) {
      const exactKey = `${direction}:${symbol}`;
      if (anchors.has(exactKey)) {
        return anchors.get(exactKey)!;
      }
      const normalizedKey = buildNormalizedAnchorKey(direction, symbol);
      if (normalizedKey && anchors.has(normalizedKey)) {
        return anchors.get(normalizedKey)!;
      }
    }
    const defaultKey = `${direction}:*`;
    if (anchors.has(defaultKey)) {
      return anchors.get(defaultKey)!;
    }
    if (anchors.has("card")) {
      return anchors.get("card")!;
    }
    return null;
  };

  viewport.addEventListener("mousedown", event => {
    if ((event.target as HTMLElement | null)?.closest?.(".node-card")) {
      return;
    }
    isDragging = true;
    mapUserAdjusted = true;
    cancelInertia();
    cancelAnimationFrame(mapAnimationFrame);
    lastDragPosition = { x: event.clientX, y: event.clientY, time: performance.now() };
    dragVelocity = { x: 0, y: 0 };
    viewport.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", event => {
    if (!isDragging || !lastDragPosition || state.view !== "map") {
      return;
    }
    event.preventDefault();
    const now = performance.now();
    const deltaX = event.clientX - lastDragPosition.x;
    const deltaY = event.clientY - lastDragPosition.y;
    mapTransform = {
      x: mapTransform.x + deltaX,
      y: mapTransform.y + deltaY,
      k: mapTransform.k
    };
    updateMapTransform();
    const elapsed = Math.max(1, now - lastDragPosition.time);
    dragVelocity = {
      x: deltaX / elapsed,
      y: deltaY / elapsed
    };
    lastDragPosition = { x: event.clientX, y: event.clientY, time: now };
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) {
      return;
    }
    isDragging = false;
    viewport.style.cursor = "grab";
    if (!lastDragPosition) {
      return;
    }
    const vx = dragVelocity.x * 16;
    const vy = dragVelocity.y * 16;
    if (Math.abs(vx) > 0.4 || Math.abs(vy) > 0.4) {
      startInertia(vx, vy);
    }
  });

  viewport.addEventListener("wheel", handleWheel, { passive: false });

  function handleWheel(event: WheelEvent): void {
    if (state.view !== "map") {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      mapUserAdjusted = true;
      cancelInertia();
      const viewportRect = viewport.getBoundingClientRect();
      zoomAtPoint(
        event.clientX - viewportRect.left,
        event.clientY - viewportRect.top,
        -event.deltaY * 0.0015
      );
      return;
    }

    event.preventDefault();
    mapUserAdjusted = true;
    cancelInertia();
    mapTransform = {
      x: mapTransform.x - event.deltaX,
      y: mapTransform.y - event.deltaY,
      k: mapTransform.k
    };
    updateMapTransform();
  }

  function updateMapTransform(): void {
    const matrix = `matrix(${mapTransform.k},0,0,${mapTransform.k},${mapTransform.x},${mapTransform.y})`;
    container.style.transformOrigin = "0 0";
    overlay.style.transformOrigin = "0 0";
    container.style.transform = matrix;
    overlay.style.transform = matrix;
  }

  function anchorGuideKey(nodeId: string, direction: "inbound" | "outbound", symbol: string | undefined | null): string {
    const normalizedSymbol = symbol && symbol.length > 0 ? symbol : "*";
    return `${nodeId}:${direction}:${normalizedSymbol}`;
  }

  function collectCenterAlignmentGuides(column: HTMLElement): CenterAlignmentGuides {
    const anchors = new Map<string, number>();
    const cardCenters = new Map<string, number>();
    const rootRect = container.getBoundingClientRect();

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
      anchors.set(anchorGuideKey(nodeId, direction, symbol), centerY);
      if (symbol !== "*") {
        const normalizedSymbol = normalizeSymbolIdentifier(symbol);
        if (normalizedSymbol) {
          anchors.set(anchorGuideKey(nodeId, direction, normalizedSymbol), centerY);
        }
      }
      if (symbol !== "*") {
        const wildcardKey = anchorGuideKey(nodeId, direction, "*");
        if (!anchors.has(wildcardKey)) {
          anchors.set(wildcardKey, centerY);
        }
      }
    });

    return { anchors, cardCenters };
  }

  function lookupCenterAnchorPosition(
    guides: CenterAlignmentGuides,
    nodeId: string,
    direction: "inbound" | "outbound",
    symbol: string | undefined | null
  ): number | null {
    const attempts: string[] = [];
    if (symbol && symbol.length > 0) {
      attempts.push(anchorGuideKey(nodeId, direction, symbol));
      const normalizedSymbol = normalizeSymbolIdentifier(symbol);
      if (normalizedSymbol && normalizedSymbol !== symbol) {
        attempts.push(anchorGuideKey(nodeId, direction, normalizedSymbol));
      }
    }
    attempts.push(anchorGuideKey(nodeId, direction, "*"));
    for (const attempt of attempts) {
      const match = guides.anchors.get(attempt);
      if (match !== undefined) {
        return match;
      }
    }
    const fallback = guides.cardCenters.get(nodeId);
    return fallback !== undefined ? fallback : null;
  }

  function withTransformReset<T>(callback: (containerRect: DOMRect) => T): T {
    const previousContainerTransform = container.style.transform;
    const previousOverlayTransform = overlay.style.transform;
    container.style.transform = "none";
    overlay.style.transform = "none";
    try {
      const containerRect = container.getBoundingClientRect();
      return callback(containerRect);
    } finally {
      container.style.transform = previousContainerTransform;
      overlay.style.transform = previousOverlayTransform;
    }
  }

  function measureElementsBounds(elements: Iterable<HTMLElement>, containerRect: DOMRect): Bounds | null {
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

  function measureElementBounds(element: HTMLElement | null, containerRect: DOMRect): Bounds | null {
    if (!element) {
      return null;
    }
    return measureElementsBounds([element], containerRect);
  }

  function measureLayoutExtents(): LayoutExtents | null {
    if (!contentRoot) {
      return null;
    }

    return withTransformReset(containerRect => {
      const trackedElements = contentRoot.querySelectorAll<HTMLElement>(".layout-node, .layout-box");
      const contentBounds = measureElementsBounds(trackedElements, containerRect);
      if (!contentBounds) {
        return null;
      }
      const focusElement =
        contentRoot.querySelector<HTMLElement>(".node-card.local-focus") ??
        contentRoot.querySelector<HTMLElement>(".local-column.center .node-card") ??
        contentRoot.querySelector<HTMLElement>(".node-card");
      const focusBounds = measureElementBounds(focusElement, containerRect);

      const computedStyle = getComputedStyle(container);
      const paddingLeft = Number.parseFloat(computedStyle.paddingLeft || "0") || 0;
      const paddingTop = Number.parseFloat(computedStyle.paddingTop || "0") || 0;

      const adjustBounds = (bounds: Bounds | null): Bounds | null => {
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

  function applyColumnVerticalCentering(layoutRoot: HTMLElement): void {
    const columns = Array.from(layoutRoot.querySelectorAll<HTMLElement>(".local-column"));
    if (columns.length === 0) {
      return;
    }

    columns.forEach(column => {
      column.style.marginTop = "0px";
      column.style.marginBottom = "0px";
    });

    withTransformReset(() => {
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

  function zoomAtPoint(offsetX: number, offsetY: number, delta: number): void {
    const scaleFactor = Math.exp(delta);
    const nextScale = clamp(mapTransform.k * scaleFactor, 0.4, 3);
    const localX = (offsetX - mapTransform.x) / mapTransform.k;
    const localY = (offsetY - mapTransform.y) / mapTransform.k;
    mapTransform = {
      x: offsetX - localX * nextScale,
      y: offsetY - localY * nextScale,
      k: nextScale
    };
    updateMapTransform();
  }

  function zoomByFactor(factor: number): void {
    mapUserAdjusted = true;
    cancelInertia();
    const viewportRect = viewport.getBoundingClientRect();
    zoomAtPoint(viewportRect.width / 2, viewportRect.height / 2, Math.log(factor));
  }

  function startInertia(initialVx: number, initialVy: number): void {
    cancelInertia();
    mapUserAdjusted = true;
    let vx = initialVx;
    let vy = initialVy;
    const friction = 0.92;
    const step = () => {
      mapTransform = {
        x: mapTransform.x + vx,
        y: mapTransform.y + vy,
        k: mapTransform.k
      };
      updateMapTransform();
      vx *= friction;
      vy *= friction;
      if (Math.abs(vx) < 0.06 && Math.abs(vy) < 0.06) {
        cancelInertia();
        return;
      }
      mapInertiaFrame = requestAnimationFrame(step);
    };
    mapInertiaFrame = requestAnimationFrame(step);
  }

  function cancelInertia(): void {
    if (mapInertiaFrame) {
      cancelAnimationFrame(mapInertiaFrame);
      mapInertiaFrame = 0;
    }
  }

  function animateMapTransform(target: { x: number; y: number; k: number }, suppressUserState = false): void {
    cancelAnimationFrame(mapAnimationFrame);
    const to = {
      x: target.x,
      y: target.y,
      k: clamp(target.k, 0.4, 3)
    };
    const from = { ...mapTransform };
    const duration = 350;
    const start = performance.now();

    const step = (now: number) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = easeOutCubic(progress);
      mapTransform = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        k: from.k + (to.k - from.k) * eased
      };
      updateMapTransform();
      if (progress < 1) {
        mapAnimationFrame = requestAnimationFrame(step);
      } else if (!suppressUserState) {
        mapUserAdjusted = true;
      }
    };

    mapAnimationFrame = requestAnimationFrame(step);
  }

  function render(): void {
    overlay.innerHTML = "";
    container.innerHTML = "";
    currentSubgraph = null;
    contentRoot = null;
    anchorRegistry.clear();

    if (!state.selectedNode) {
      container.innerHTML = '<div class="empty-hint">Select a node to view local relationships.</div>';
      mapTransform = { x: 0, y: 0, k: 1 };
      mapHasInitialFit = false;
      mapUserAdjusted = false;
      lastCenteredNodeId = null;
      mapInitialTransform = null;
      updateMapTransform();
      return;
    }

    const subgraph = buildLocalSubgraph(state.selectedNode);
    currentSubgraph = subgraph;

    if (subgraph.nodes.length === 0) {
      container.innerHTML = '<div class="empty-hint">No related nodes were found.</div>';
      mapTransform = { x: 0, y: 0, k: 1 };
      mapHasInitialFit = false;
      mapUserAdjusted = false;
      mapInitialTransform = null;
      updateMapTransform();
      return;
    }

    if (!mapUserAdjusted) {
      mapHasInitialFit = false;
      mapInitialTransform = null;
    }

    if (state.selectedNode.id !== lastCenteredNodeId) {
      mapHasInitialFit = false;
      mapUserAdjusted = false;
      lastCenteredNodeId = state.selectedNode.id;
      mapInitialTransform = null;
    }

    const connectionScore = new Map<string, number>();
    subgraph.links.forEach(edge => {
      connectionScore.set(edge.sourceId, (connectionScore.get(edge.sourceId) ?? 0) + 1);
      connectionScore.set(edge.targetId, (connectionScore.get(edge.targetId) ?? 0) + 1);
    });

    const renderLayoutForNodes = (
      nodes: ExplorerNodePayload[],
      direction: "inbound" | "outbound" | "center"
    ): HTMLElement | null => {
      const eligibleNodes =
        direction === "center" ? nodes.slice() : nodes.filter(node => shouldIncludeNode(node));
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

      const reorderDirectory = (dir: DirectoryNode): void => {
        const entries = Array.from(dir.children.entries());
        entries.forEach(([, child]) => reorderDirectory(child));
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
      };

      reorderDirectory(hierarchy);

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
          plan.depth === 0
            ? "layout-box layout-box--root local-layout-box"
            : "layout-box local-layout-box";
        element.dataset.direction = direction;
        element.dataset.clusterPath = plan.path;
        element.setAttribute("role", "region");
        element.setAttribute("aria-label", `Cluster ${plan.path === ROOT_KEY ? "root" : plan.name}`);
        element.tabIndex = 0;
        element.title = plan.path === ROOT_KEY ? "root" : plan.path;
        if (plan.collapsedAncestors.length > 0) {
          element.dataset.collapsedAncestors = plan.collapsedAncestors
            .map(entry => entry.path)
            .join(",");
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
          plan.fileArea.nodes.forEach(nodePlan => {
            const card = createNodeCard(nodePlan.node);
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
    };

    const createHierarchicalColumn = (
      label: string,
      nodes: ExplorerNodePayload[],
      direction: "inbound" | "outbound" | "center",
      emptyLabel: string,
      position: "left" | "center" | "right"
    ): HTMLElement => {
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
          const card = createNodeCard(node);
          card.classList.add("focus-node");
          focusSurface.appendChild(card);
        });
        column.appendChild(focusSurface);
        return column;
      }

      const surface = renderLayoutForNodes(nodes, direction);
      if (!surface) {
        const empty = document.createElement("div");
        empty.className = "local-column-empty";
        empty.textContent = emptyLabel;
        column.appendChild(empty);
        return column;
      }

      column.appendChild(surface);
      return column;
    };

    const computeDirectionalAlignmentValue = (
      node: ExplorerNodePayload,
      direction: "inbound" | "outbound",
      guides: CenterAlignmentGuides
    ): number => {
      if (!currentSubgraph) {
        return Number.POSITIVE_INFINITY;
      }

      const relatedEdges = currentSubgraph.links.filter(edge => {
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
        const anchorY = lookupCenterAnchorPosition(guides, centerNodeId, anchorDirection, symbol);
        if (anchorY !== null && Number.isFinite(anchorY)) {
          anchorPositions.push(anchorY);
        }
      });

      if (anchorPositions.length > 0) {
        const sum = anchorPositions.reduce((acc, value) => acc + value, 0);
        return sum / anchorPositions.length;
      }

      const focusFallback = state.selectedNode ? guides.cardCenters.get(state.selectedNode.id) : undefined;
      return focusFallback !== undefined ? focusFallback : Number.POSITIVE_INFINITY;
    };

    const createStackedColumn = (
      label: string,
      nodes: ExplorerNodePayload[],
      direction: "inbound" | "outbound",
      emptyLabel: string,
      guides: CenterAlignmentGuides,
      position: "left" | "right"
    ): HTMLElement => {
      const column = document.createElement("div");
      column.className = `local-column ${direction} local-column--stacked`;
      column.dataset.direction = direction;
      column.dataset.position = position;

      const heading = document.createElement("div");
      heading.className = "local-column-label";
      heading.textContent = label;
      column.appendChild(heading);

      const eligibleNodes = nodes.filter(node => shouldIncludeNode(node));
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
        const alignment = computeDirectionalAlignmentValue(node, direction, guides);
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
        group.nodes.forEach(entry => {
          const card = createNodeCard(entry.node);
          card.classList.add("layout-node", "stacked-node");
          card.dataset.direction = direction;
          content.appendChild(card);
        });
        groupElement.appendChild(content);
        stack.appendChild(groupElement);
      });

      column.appendChild(stack);
      return column;
    };

    const inboundNodes = subgraph.nodes.filter(node => subgraph.inboundIds.has(node.id));
    const outboundNodes = subgraph.nodes.filter(node => subgraph.outboundIds.has(node.id));
    const centerNodes = [subgraph.center];

    const layout = document.createElement("div");
    layout.className = "local-layout";
    container.appendChild(layout);
    contentRoot = layout;

    const centerColumn = createHierarchicalColumn(
      "Selected Artifact",
      centerNodes,
      "center",
      "No artifact selected",
      "center"
    );
    layout.appendChild(centerColumn);

    const alignmentGuides = collectCenterAlignmentGuides(centerColumn);

    const dependenciesColumn = createStackedColumn(
      "Dependencies (Inputs)",
      inboundNodes,
      "inbound",
      "No dependencies",
      alignmentGuides,
      "left"
    );
    layout.insertBefore(dependenciesColumn, centerColumn);

    const dependentsColumn = createStackedColumn(
      "Dependents (Outputs)",
      outboundNodes,
      "outbound",
      "No dependents",
      alignmentGuides,
      "right"
    );
    layout.appendChild(dependentsColumn);

    applyColumnVerticalCentering(layout);

    if (!mapHasInitialFit && contentRoot) {
      fitMapToContent(contentRoot);
    } else {
      updateMapTransform();
    }

    requestAnimationFrame(drawConnections);
  }

  function fitMapToContent(element: HTMLElement): void {
    cancelInertia();
    void element;
    const extents = measureLayoutExtents();
    const viewportRect = viewport.getBoundingClientRect();

    if (!extents) {
      mapTransform = { x: 0, y: 0, k: 1 };
      updateMapTransform();
      mapHasInitialFit = true;
      mapInitialTransform = { ...mapTransform };
      requestAnimationFrame(drawConnections);
      return;
    }

    const { content, focus } = extents;
    const contentWidth = Math.max(content.width, 1);
    const contentHeight = Math.max(content.height, 1);
    const normalizedWidth = Math.max(Math.ceil(content.right), Math.ceil(contentWidth));
    const normalizedHeight = Math.max(Math.ceil(content.bottom), Math.ceil(contentHeight));

    container.style.width = `${normalizedWidth}px`;
    container.style.height = `${normalizedHeight}px`;
    container.style.minWidth = `${normalizedWidth}px`;
    container.style.minHeight = `${normalizedHeight}px`;
    overlay.style.width = `${normalizedWidth}px`;
    overlay.style.height = `${normalizedHeight}px`;
    overlay.style.minWidth = `${normalizedWidth}px`;
    overlay.style.minHeight = `${normalizedHeight}px`;

    const horizontalPadding = clamp(viewportRect.width * 0.02, 8, 72);
    const verticalPadding = clamp(viewportRect.height * 0.025, 8, 72);

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
        focusBounds.width + Math.min(focusLeftDistance, horizontalBuffer) + Math.min(focusRightDistance, horizontalBuffer)
      )
    );
    const effectiveHeight = Math.max(
      1,
      Math.min(
        contentHeight,
        focusBounds.height + Math.min(focusTopDistance, verticalBuffer) + Math.min(focusBottomDistance, verticalBuffer)
      )
    );

    const availableScaleX = Math.max((viewportRect.width - horizontalPadding * 2) / effectiveWidth, 0.05);
    const availableScaleY = Math.max((viewportRect.height - verticalPadding * 2) / effectiveHeight, 0.05);
    const autoScale = Math.min(availableScaleX, availableScaleY);
    const scale = clamp(Math.min(autoScale * 0.96, 1), 0.6, 1.45);

    const focusCenterX = focusBounds.left + focusBounds.width / 2;
    const focusCenterY = focusBounds.top + focusBounds.height / 2;

    let targetX = viewportRect.width / 2 - focusCenterX * scale;
    let targetY = viewportRect.height / 2 - focusCenterY * scale;

    const minTargetX = viewportRect.width - horizontalPadding - content.right * scale;
    const maxTargetX = horizontalPadding - content.left * scale;
    if (minTargetX <= maxTargetX) {
      targetX = clamp(targetX, minTargetX, maxTargetX);
    }

    const minTargetY = viewportRect.height - verticalPadding - content.bottom * scale;
    const maxTargetY = verticalPadding - content.top * scale;
    if (minTargetY <= maxTargetY) {
      targetY = clamp(targetY, minTargetY, maxTargetY);
    }

    const target = { x: targetX, y: targetY, k: scale };

    animateMapTransform(target, true);
    mapHasInitialFit = true;
    mapInitialTransform = { ...target };
    requestAnimationFrame(drawConnections);
  }

  function createNodeCard(node: ExplorerNodePayload): HTMLElement {
    const card = document.createElement("div");
    card.className = "node-card";
    card.dataset.id = node.id;
    card.title = node.codeRelativePath;
    card.tabIndex = 0;

    if (state.selectedNode && state.selectedNode.id === node.id) {
      card.classList.add("selected", "local-focus");
    }

    registerAnchor(node.id, "card", card);

    const inboundHub = document.createElement("div");
    inboundHub.className = "symbol-anchor hub inbound";
    card.appendChild(inboundHub);
    registerAnchor(node.id, "inbound:*", inboundHub);

    const outboundHub = document.createElement("div");
    outboundHub.className = "symbol-anchor hub outbound";
    card.appendChild(outboundHub);
    registerAnchor(node.id, "outbound:*", outboundHub);

    const header = document.createElement("div");
    header.className = "node-title";
    header.textContent = node.name;
    card.appendChild(header);

    const pathElement = document.createElement("div");
    pathElement.className = "node-path";
    pathElement.textContent = node.codeRelativePath;
    card.appendChild(pathElement);

    card.appendChild(createSymbolSection(node));

    if (!isTestNode(node) && state.filters.showTests) {
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
      void onSelectNode(node);
    });

    card.addEventListener("dblclick", event => {
      event.stopPropagation();
      void onSelectNode(node);
    });

    return card;
  }

  function createSymbolSection(node: ExplorerNodePayload): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "node-symbols";

    if (!node.publicSymbols || node.publicSymbols.length === 0) {
      const empty = document.createElement("div");
      empty.className = "node-meta";
      empty.textContent = "No public symbols";
      wrapper.appendChild(empty);
      return wrapper;
    }

    const grid = document.createElement("div");
    grid.className = "symbol-grid";

    node.publicSymbols.forEach(symbol => {
      const inboundAnchor = document.createElement("div");
      inboundAnchor.className = "symbol-anchor dot inbound";
      inboundAnchor.dataset.symbol = symbol;
      grid.appendChild(inboundAnchor);
      registerAnchor(node.id, `inbound:${symbol}`, inboundAnchor);

      const label = document.createElement("div");
      label.className = "symbol-label";
      label.textContent = symbol;
      grid.appendChild(label);

      const outboundAnchor = document.createElement("div");
      outboundAnchor.className = "symbol-anchor dot outbound";
      outboundAnchor.dataset.symbol = symbol;
      grid.appendChild(outboundAnchor);
      registerAnchor(node.id, `outbound:${symbol}`, outboundAnchor);
    });

    wrapper.appendChild(grid);
    return wrapper;
  }

  function buildLocalSubgraph(center: ExplorerNodePayload): LocalSubgraph {
    const neighbors = new Map<string, ExplorerNodePayload>();
    const linkResults: LocalEdge[] = [];
    const inboundIds = new Set<string>();
    const outboundIds = new Set<string>();

    graphData.links.forEach(edge => {
      const sourceId = resolveLinkEndpoint(edge.source);
      const targetId = resolveLinkEndpoint(edge.target);
      const kind = edge.kind ?? "dependency";

      if (sourceId === center.id) {
        const neighbor = getNodeById(targetId);
        if (neighbor) {
          if (!shouldIncludeNode(neighbor) && neighbor.id !== center.id) {
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
        const neighbor = getNodeById(sourceId);
        if (neighbor) {
          if (!shouldIncludeNode(neighbor) && neighbor.id !== center.id) {
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
      nodes: [center].concat(Array.from(neighbors.values())),
      links: linkResults,
      inboundIds,
      outboundIds
    };
  }

  function getNodeById(id: string): ExplorerNodePayload | undefined {
    return graphData.nodes.find(node => node.id === id);
  }

  function drawConnections(): void {
    overlay.innerHTML = "";
    if (!state.selectedNode || !currentSubgraph) {
      overlay.dataset.active = "false";
      return;
    }

    const extents = measureLayoutExtents();
    if (!extents) {
      overlay.dataset.active = "false";
      return;
    }
    const bounds = extents.content;

    const rootRect = container.getBoundingClientRect();
    const scale = mapTransform.k || 1;

    interface AnchorMeasurement {
      centerX: number;
      centerY: number;
      leftX: number;
      rightX: number;
      topY: number;
      bottomY: number;
      isSymbol: boolean;
    }

    const positionCache = new Map<HTMLElement, AnchorMeasurement>();
    const measureAnchor = (anchor: HTMLElement | null): AnchorMeasurement | null => {
      if (!anchor) {
        return null;
      }
      if (positionCache.has(anchor)) {
        return positionCache.get(anchor)!;
      }
      const rect = anchor.getBoundingClientRect();
      const measurement: AnchorMeasurement = {
        centerX: (rect.left - rootRect.left + rect.width / 2) / scale,
        centerY: (rect.top - rootRect.top + rect.height / 2) / scale,
        leftX: (rect.left - rootRect.left) / scale,
        rightX: (rect.right - rootRect.left) / scale,
        topY: (rect.top - rootRect.top) / scale,
        bottomY: (rect.bottom - rootRect.top) / scale,
        isSymbol: anchor.classList.contains("symbol-anchor")
      };
      positionCache.set(anchor, measurement);
      return measurement;
    };

    const selectHorizontalPoint = (
      anchor: AnchorMeasurement,
      direction: number,
      variant: "entry" | "exit"
    ): number => {
      if (!anchor.isSymbol || Math.abs(direction) < 0.001) {
        return anchor.centerX;
      }
      const isRightward = direction >= 0;
      if (variant === "exit") {
        return isRightward ? anchor.rightX : anchor.leftX;
      }
      return isRightward ? anchor.leftX : anchor.rightX;
    };

    const segments: Array<{
      edge: LocalEdge;
      renderDirection: "inbound" | "outbound";
      source: { x: number; y: number };
      target: { x: number; y: number };
    }> = [];
    currentSubgraph.links.forEach(edge => {
      const providerAnchor = measureAnchor(getAnchor(edge.sourceId, "outbound", edge.sourceSymbol));
      const consumerAnchor = measureAnchor(getAnchor(edge.targetId, "inbound", edge.targetSymbol));
      if (!providerAnchor || !consumerAnchor) {
        return;
      }
      let horizontalDirection = Math.sign(consumerAnchor.centerX - providerAnchor.centerX);
      if (horizontalDirection === 0) {
        horizontalDirection = 1;
      }
      const sourcePoint = {
        x: selectHorizontalPoint(providerAnchor, horizontalDirection, "exit"),
        y: providerAnchor.centerY
      };
      const targetPoint = {
        x: selectHorizontalPoint(consumerAnchor, horizontalDirection, "entry"),
        y: consumerAnchor.centerY
      };
      const renderDirection: "inbound" | "outbound" = edge.direction;
      segments.push({ edge, renderDirection, source: sourcePoint, target: targetPoint });
    });

    if (segments.length === 0) {
      overlay.dataset.active = "false";
      return;
    }

    const width = Math.max(bounds.width, 1);
    const height = Math.max(bounds.height, 1);
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("connection-svg");
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.position = "absolute";
    svg.style.left = `${bounds.left}px`;
    svg.style.top = `${bounds.top}px`;
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.style.pointerEvents = "none";
    overlay.appendChild(svg);

    segments.forEach(({ edge, renderDirection, source, target }) => {
      const adjustedSource = {
        x: source.x - bounds.left,
        y: source.y - bounds.top
      };
      const adjustedTarget = {
        x: target.x - bounds.left,
        y: target.y - bounds.top
      };
      appendConnectionPath(svg, adjustedSource, adjustedTarget, renderDirection, edge);
    });

    overlay.dataset.active = "true";
  }

  function appendConnectionPath(
    svg: SVGSVGElement,
    source: { x: number; y: number },
    target: { x: number; y: number },
    renderDirection: "inbound" | "outbound",
    edge: LocalEdge
  ): void {
    const horizontalDirection = target.x >= source.x ? 1 : -1;
    const gapX = Math.abs(target.x - source.x);
    const commands: string[] = [`M ${source.x} ${source.y}`];

    if (gapX < 24) {
      const midY = (source.y + target.y) / 2;
      commands.push(`Q ${source.x} ${midY} ${target.x} ${target.y}`);
    } else {
      const stubBase = Math.max(gapX * 0.42, 32);
      const stubLimit = Math.max(44, gapX - 20);
      const stub = Math.min(stubBase, stubLimit);
      const control1X = source.x + horizontalDirection * stub;
      const control2X = target.x - horizontalDirection * stub;
      const deltaY = target.y - source.y;
      const control1Y = source.y + deltaY * 0.2;
      const control2Y = target.y - deltaY * 0.2;
      commands.push(`C ${control1X} ${control1Y} ${control2X} ${control2Y} ${target.x} ${target.y}`);
    }

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", commands.join(" "));
    path.classList.add("connection-path", renderDirection);
    path.dataset.kind = edge.kind;
    svg.appendChild(path);
  }

  function easeOutCubic(t: number): number {
    const p = t - 1;
    return p * p * p + 1;
  }

  function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function highlightSelection(): void {
    container.querySelectorAll<HTMLElement>(".node-card").forEach(element => {
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

  return {
    render,
    drawConnections,
    highlightSelection,
    zoomIn: () => zoomByFactor(1.2),
    zoomOut: () => zoomByFactor(1 / 1.2),
    resetZoom: () => {
      if (!contentRoot) {
        return;
      }
      if (mapInitialTransform) {
        animateMapTransform(mapInitialTransform, true);
      } else {
        fitMapToContent(contentRoot);
      }
    }
  };
}

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

export interface LocalViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  onSelectNode: (node: ExplorerNodePayload) => void;
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

export function createLocalView(options: LocalViewOptions): LocalViewApi {
  const { state, graphData, resolveLinkEndpoint, onSelectNode, testCoverage } = options;
  const viewport = requireElement<HTMLDivElement>("view-map");
  const container = requireElement<HTMLDivElement>("map-container");
  const overlay = requireElement<HTMLDivElement>("map-connections");

  container.classList.add("cluster-host");
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
  let resizeAnimationFrame = 0;
  const viewportResizeObserver = new ResizeObserver(() => scheduleResizeAdjustment());
  viewportResizeObserver.observe(viewport);
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
    anchorRegistry.get(nodeId)!.set(key, element);
  };

  const getAnchor = (nodeId: string, direction: "inbound" | "outbound", symbol?: string): HTMLElement | null => {
    const anchors = anchorRegistry.get(nodeId);
    if (!anchors) {
      return null;
    }
    if (symbol) {
      const key = `${direction}:${symbol}`;
      if (anchors.has(key)) {
        return anchors.get(key)!;
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

  const scheduleResizeAdjustment = (): void => {
    if (state.view !== "map" || !contentRoot) {
      return;
    }
    if (resizeAnimationFrame) {
      cancelAnimationFrame(resizeAnimationFrame);
    }
    resizeAnimationFrame = requestAnimationFrame(() => {
      resizeAnimationFrame = 0;
      if (!mapUserAdjusted && contentRoot) {
        fitMapToContent(contentRoot);
      } else {
        updateMapTransform();
        drawConnections();
      }
    });
  };

  window.addEventListener("resize", scheduleResizeAdjustment);

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

    const createDirectionalColumn = (
      label: string,
      nodes: ExplorerNodePayload[],
      direction: "inbound" | "outbound" | "center",
      emptyLabel: string
    ): HTMLElement => {
      const column = document.createElement("div");
      column.className = `local-column ${direction}`;
      column.dataset.direction = direction;

      const heading = document.createElement("div");
      heading.className = "local-column-label";
      heading.textContent = label;
      column.appendChild(heading);

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

    const inboundNodes = subgraph.nodes.filter(node => subgraph.inboundIds.has(node.id));
    const outboundNodes = subgraph.nodes.filter(node => subgraph.outboundIds.has(node.id));
    const centerNodes = [subgraph.center];

    const layout = document.createElement("div");
    layout.className = "local-layout";
    layout.appendChild(
      createDirectionalColumn("Incoming Dependencies", inboundNodes, "inbound", "No incoming dependencies")
    );
    layout.appendChild(createDirectionalColumn("Selected Artifact", centerNodes, "center", "No artifact selected"));
    layout.appendChild(
      createDirectionalColumn("Outgoing Dependencies", outboundNodes, "outbound", "No outgoing dependencies")
    );

    container.appendChild(layout);
    contentRoot = layout;

    if (!mapHasInitialFit && contentRoot) {
      fitMapToContent(contentRoot);
    } else {
      updateMapTransform();
    }

    requestAnimationFrame(drawConnections);
  }

  function fitMapToContent(element: HTMLElement): void {
    cancelInertia();
    const previousContainerTransform = container.style.transform;
    const previousOverlayTransform = overlay.style.transform;
    container.style.transform = "none";
    overlay.style.transform = "none";

    const contentRect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();

    container.style.transform = previousContainerTransform;
    overlay.style.transform = previousOverlayTransform;

    const padding = 160;
    const width = Math.max(contentRect.width, 1);
    const height = Math.max(contentRect.height, 1);
    const availableScale = Math.min(
      (viewportRect.width - padding) / width,
      (viewportRect.height - padding) / height
    );
    const scale = clamp(availableScale, 0.5, 2);
    const centerX = contentRect.left - viewportRect.left + width / 2;
    const centerY = contentRect.top - viewportRect.top + height / 2;

    const target = {
      x: viewportRect.width / 2 - centerX * scale,
      y: viewportRect.height / 2 - centerY * scale,
      k: scale
    };

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
      onSelectNode(node);
    });

    card.addEventListener("dblclick", event => {
      event.stopPropagation();
      onSelectNode(node);
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

    const rootRect = container.getBoundingClientRect();
    const scale = mapTransform.k || 1;
    const svgWidth = Math.max(1, rootRect.width / scale);
    const svgHeight = Math.max(1, rootRect.height / scale);
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("connection-svg");
    svg.setAttribute("width", `${svgWidth}`);
    svg.setAttribute("height", `${svgHeight}`);
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    overlay.appendChild(svg);

    const positionCache = new Map<HTMLElement, { x: number; y: number }>();
    const measureAnchor = (anchor: HTMLElement | null): { x: number; y: number } | null => {
      if (!anchor) {
        return null;
      }
      if (positionCache.has(anchor)) {
        return positionCache.get(anchor)!;
      }
      const rect = anchor.getBoundingClientRect();
      const point = {
        x: (rect.left - rootRect.left + rect.width / 2) / scale,
        y: (rect.top - rootRect.top + rect.height / 2) / scale
      };
      positionCache.set(anchor, point);
      return point;
    };

    let rendered = 0;
    currentSubgraph.links.forEach(edge => {
      const source = measureAnchor(getAnchor(edge.sourceId, "outbound", edge.sourceSymbol));
      const target = measureAnchor(getAnchor(edge.targetId, "inbound", edge.targetSymbol));
      if (!source || !target) {
        return;
      }
      appendConnectionPath(svg, source, target, edge);
      rendered += 1;
    });

    overlay.dataset.active = rendered > 0 ? "true" : "false";
  }

  function appendConnectionPath(
    svg: SVGSVGElement,
    source: { x: number; y: number },
    target: { x: number; y: number },
    edge: LocalEdge
  ): void {
    const horizontalDirection = target.x >= source.x ? 1 : -1;
    const gapX = Math.abs(target.x - source.x);
    const commands: string[] = [`M ${source.x} ${source.y}`];

    if (gapX < 24) {
      const verticalDirection = target.y >= source.y ? 1 : -1;
      const verticalStub = Math.max(28, Math.abs(target.y - source.y) * 0.35);
      const elbowY = source.y + verticalDirection * verticalStub;
      commands.push(`V ${elbowY}`, `H ${target.x}`, `V ${target.y}`);
    } else {
      const stub = Math.min(Math.max(gapX * 0.35, 22), Math.max(22, gapX - 6));
      const elbowX = source.x + horizontalDirection * stub;
      commands.push(`H ${elbowX}`, `V ${target.y}`, `H ${target.x}`);
    }

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", commands.join(" "));
    path.classList.add("connection-path", edge.direction);
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

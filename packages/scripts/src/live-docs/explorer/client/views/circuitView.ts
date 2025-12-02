import type {
  ExplorerGraphPayload,
  ExplorerLinkKind,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { CircuitTransform, ExplorerState, TestCoverageMap } from "../types";
import {
  ROOT_KEY,
  buildHierarchy,
  computeDirectoryLayout,
  findDominantDirectory,
  getDirectoryKey,
  measureDirectoryTree
} from "./layoutUtils";
import type { DirectoryLayoutPlan } from "./layoutUtils";

export interface CircuitViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  onSelectNode: (node: ExplorerNodePayload) => void | Promise<void>;
  onOpenLocalView: (node: ExplorerNodePayload) => void | Promise<void>;
  testCoverage: TestCoverageMap;
}

export interface CircuitViewApi {
  render(): void;
  highlightSelection(): void;
  drawConnections(): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function createCircuitView(options: CircuitViewOptions): CircuitViewApi {
  const { state, graphData, resolveLinkEndpoint, onSelectNode, onOpenLocalView, testCoverage } = options;
  type NodeConnection = { targetId: string; kind: ExplorerLinkKind; direction: "outbound" | "inbound" };

  const isTestNode = (node: ExplorerNodePayload | undefined | null): boolean =>
    !!node && (node.archetype || "").toLowerCase() === "test";

  const connectionMap = new Map<string, NodeConnection[]>();
  graphData.nodes.forEach(node => {
    connectionMap.set(node.id, []);
  });
  graphData.links.forEach(link => {
    const sourceId = resolveLinkEndpoint(link.source);
    const targetId = resolveLinkEndpoint(link.target);
    const normalizedKind = link.kind ?? "dependency";
    if (!connectionMap.has(sourceId)) {
      connectionMap.set(sourceId, []);
    }
    if (!connectionMap.has(targetId)) {
      connectionMap.set(targetId, []);
    }
    connectionMap.get(sourceId)!.push({ targetId, kind: normalizedKind, direction: "outbound" });
    connectionMap.get(targetId)!.push({ targetId: sourceId, kind: normalizedKind, direction: "inbound" });
  });

  const viewport = requireElement<HTMLDivElement>("circuit-viewport");
  const circuitContainer = requireElement<HTMLDivElement>("circuit-container");
  const circuitConnections = requireElement<HTMLDivElement>("circuit-connections");
  circuitContainer.classList.add("layout-surface");

  let circuitTransform: CircuitTransform = { x: 0, y: 0, k: 1 };
  let isDragging = false;
  let lastDragPosition: { x: number; y: number; time: number } | null = null;
  let dragVelocity = { x: 0, y: 0 };
  let circuitInertiaFrame = 0;
  let circuitAnimationFrame = 0;
  let circuitHasInitialFit = false;
  let circuitUserAdjusted = false;
  let circuitInitialTransform: CircuitTransform | null = null;
  let hoveredNodeId: string | null = null;

  viewport.style.cursor = "grab";

  viewport.addEventListener("mousedown", event => {
    if ((event.target as HTMLElement | null)?.closest?.(".node-card")) {
      return;
    }
    isDragging = true;
    circuitUserAdjusted = true;
    cancelInertia();
    lastDragPosition = { x: event.clientX, y: event.clientY, time: performance.now() };
    dragVelocity = { x: 0, y: 0 };
    viewport.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", event => {
    if (!isDragging || !lastDragPosition) {
      return;
    }
    event.preventDefault();
    const now = performance.now();
    const deltaX = event.clientX - lastDragPosition.x;
    const deltaY = event.clientY - lastDragPosition.y;
    circuitTransform = {
      x: circuitTransform.x + deltaX,
      y: circuitTransform.y + deltaY,
      k: circuitTransform.k
    };
    updateCircuitTransform();
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
    if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
      startInertia(vx, vy);
    }
  });

  viewport.addEventListener("wheel", handleWheel, { passive: false });

  function handleWheel(event: WheelEvent): void {
    if (state.view !== "circuit") {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      circuitUserAdjusted = true;
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
    circuitUserAdjusted = true;
    cancelInertia();
    circuitTransform = {
      x: circuitTransform.x - event.deltaX,
      y: circuitTransform.y - event.deltaY,
      k: circuitTransform.k
    };
    updateCircuitTransform();
  }

  function zoomAtPoint(offsetX: number, offsetY: number, delta: number): void {
    const scaleFactor = Math.exp(delta);
    const nextScale = clamp(circuitTransform.k * scaleFactor, 0.1, 5);
    const localX = (offsetX - circuitTransform.x) / circuitTransform.k;
    const localY = (offsetY - circuitTransform.y) / circuitTransform.k;
    circuitTransform = {
      x: offsetX - localX * nextScale,
      y: offsetY - localY * nextScale,
      k: nextScale
    };
    updateCircuitTransform();
    circuitUserAdjusted = true;
  }

  function zoomAtViewportCenter(scaleFactor: number): void {
    const viewportRect = viewport.getBoundingClientRect();
    const centerX = viewportRect.width / 2;
    const centerY = viewportRect.height / 2;
    zoomAtPoint(centerX, centerY, Math.log(scaleFactor));
  }

  function updateCircuitTransform(): void {
    const matrix = `matrix(${circuitTransform.k},0,0,${circuitTransform.k},${circuitTransform.x},${circuitTransform.y})`;
    circuitContainer.style.transformOrigin = "0 0";
    circuitConnections.style.transformOrigin = "0 0";
    circuitContainer.style.transform = matrix;
    circuitConnections.style.transform = matrix;
  }

  function startInertia(initialVx: number, initialVy: number): void {
    cancelInertia();
    cancelAnimationFrame(circuitAnimationFrame);
    circuitUserAdjusted = true;
    let vx = initialVx;
    let vy = initialVy;
    const friction = 0.94;
    const step = () => {
      circuitTransform = {
        x: circuitTransform.x + vx,
        y: circuitTransform.y + vy,
        k: circuitTransform.k
      };
      updateCircuitTransform();
      vx *= friction;
      vy *= friction;
      if (Math.abs(vx) < 0.08 && Math.abs(vy) < 0.08) {
        cancelInertia();
        return;
      }
      circuitInertiaFrame = requestAnimationFrame(step);
    };
    circuitInertiaFrame = requestAnimationFrame(step);
  }

  function cancelInertia(): void {
    if (circuitInertiaFrame) {
      cancelAnimationFrame(circuitInertiaFrame);
      circuitInertiaFrame = 0;
    }
  }

  function animateCircuitTransform(target: Partial<CircuitTransform>, suppressUserState = false): void {
    cancelAnimationFrame(circuitAnimationFrame);
    const duration = 450;
    const to: CircuitTransform = {
      x: target.x ?? circuitTransform.x,
      y: target.y ?? circuitTransform.y,
      k: clamp(target.k ?? circuitTransform.k, 0.1, 5)
    };
    const from = { ...circuitTransform };
    if (!suppressUserState) {
      circuitUserAdjusted = true;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = easeOutCubic(progress);
      circuitTransform = {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        k: from.k + (to.k - from.k) * eased
      };
      updateCircuitTransform();
      if (progress < 1) {
        circuitAnimationFrame = requestAnimationFrame(step);
      }
    };
    circuitAnimationFrame = requestAnimationFrame(step);
  }

  function focusClusterElement(element: HTMLElement | null, suppressUserState = false): void {
    if (!element || !element.isConnected) {
      return;
    }
    cancelInertia();
    if (!suppressUserState) {
      circuitUserAdjusted = true;
    }

    const currentContainerTransform = circuitContainer.style.transform;
    const currentOverlayTransform = circuitConnections.style.transform;
    circuitContainer.style.transform = "none";
    circuitConnections.style.transform = "none";

    const elementRect = element.getBoundingClientRect();
    const containerRect = circuitContainer.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();

    const padding = 200;
    const width = Math.max(elementRect.width, 1);
    const height = Math.max(elementRect.height, 1);
    const scaleX = (viewportRect.width - padding) / width;
    const scaleY = (viewportRect.height - padding) / height;
    const targetScale = clamp(Math.min(scaleX, scaleY), 0.25, 3);

    const centerX = elementRect.left - containerRect.left + width / 2;
    const centerY = elementRect.top - containerRect.top + height / 2;

    circuitContainer.style.transform = currentContainerTransform;
    circuitConnections.style.transform = currentOverlayTransform;

    const targetX = viewportRect.width / 2 - centerX * targetScale;
    const targetY = viewportRect.height / 2 - centerY * targetScale;

    animateCircuitTransform({ x: targetX, y: targetY, k: targetScale }, suppressUserState);
  }

  function easeOutCubic(t: number): number {
    const p = t - 1;
    return p * p * p + 1;
  }

  function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function shouldRenderNode(node: ExplorerNodePayload): boolean {
    if (isTestNode(node)) {
      return !!(state.selectedNode && state.selectedNode.id === node.id);
    }
    const archetype = (node.archetype || "").toLowerCase();
    if (archetype === "asset" && !state.filters.showAssets) {
      return !!(state.selectedNode && state.selectedNode.id === node.id);
    }
    return true;
  }

  function render(): void {
    const nodesForCircuit = graphData.nodes.filter(shouldRenderNode);
    const hierarchy = buildHierarchy(nodesForCircuit);
    const dominantCluster = findDominantDirectory(graphData, nodesForCircuit, resolveLinkEndpoint);
    const measure = measureDirectoryTree(hierarchy);

    const createNodeCard = (node: ExplorerNodePayload): HTMLElement => {
      const card = document.createElement("div");
      card.className = "node-card";
      card.dataset.id = node.id;
      if (state.selectedNode && state.selectedNode.id === node.id) {
        card.classList.add("selected");
      }
      card.innerHTML = [
        `<div class="node-title">${node.name}</div>`,
        `<div class="node-path">${node.codeRelativePath}</div>`,
        `<div class="node-meta"><span class="badge">${node.archetype}</span><span class="badge">${node.publicSymbols.length} symbols</span></div>`,
        '<div class="pin top"></div><div class="pin bottom"></div><div class="pin left"></div><div class="pin right"></div>'
      ].join("");
      card.addEventListener("click", event => {
        event.stopPropagation();
        void onSelectNode(node);
      });
      card.addEventListener("dblclick", event => {
        event.stopPropagation();
        void onOpenLocalView(node);
      });
      card.addEventListener("mouseenter", () => {
        hoveredNodeId = node.id;
        drawConnections();
      });
      card.addEventListener("mouseleave", () => {
        if (hoveredNodeId === node.id) {
          hoveredNodeId = null;
          drawConnections();
        }
      });

      if (!isTestNode(node) && state.filters.showTests) {
        const backing = testCoverage.get(node.id);
        if (backing && backing.length > 0) {
          card.classList.add("test-backed");
          card.dataset.testCount = String(backing.length);
          const meta = card.querySelector(".node-meta");
          const coverage = document.createElement("div");
          coverage.className = "node-tests";
          const label = document.createElement("span");
          label.className = "node-tests__label";
          label.textContent = backing.length === 1 ? "Test:" : "Tests:";
          coverage.appendChild(label);
          backing.slice(0, 2).forEach(testNode => {
            const tag = document.createElement("span");
            tag.className = "node-tests__item";
            tag.textContent = testNode.name;
            coverage.appendChild(tag);
          });
          if (backing.length > 2) {
            const remainder = document.createElement("span");
            remainder.className = "node-tests__more";
            remainder.textContent = `+${backing.length - 2}`;
            coverage.appendChild(remainder);
          }
          card.appendChild(coverage);
          if (meta) {
            meta.before(coverage);
          }
          const existingTitle = card.getAttribute("title") ?? node.codeRelativePath;
          const testList = backing.map(test => test.codeRelativePath).join("\n");
          card.setAttribute("title", `${existingTitle}\nTest coverage:\n${testList}`);
        }
      }

      return card;
    };

    if (measure.totalNodes === 0) {
      circuitContainer.innerHTML =
        '<div class="empty-hint">No documentation nodes matched the current filters.</div>';
      circuitContainer.style.width = "800px";
      circuitContainer.style.height = "520px";
      circuitContainer.style.minWidth = "800px";
      circuitContainer.style.minHeight = "520px";
      updateCircuitTransform();
      requestAnimationFrame(drawConnections);
      return;
    }

    const layout = computeDirectoryLayout(measure);
    const layoutWidth = layout.width;
    const layoutHeight = layout.height;

    circuitContainer.innerHTML = "";
    circuitContainer.style.position = "relative";
    circuitContainer.style.width = `${layoutWidth}px`;
    circuitContainer.style.height = `${layoutHeight}px`;
    circuitContainer.style.minWidth = `${layoutWidth}px`;
    circuitContainer.style.minHeight = `${layoutHeight}px`;

    const pathToElement = new Map<string, HTMLElement>();

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

    const renderDirectoryLayout = (
      plan: DirectoryLayoutPlan,
      parentPlan: DirectoryLayoutPlan | null,
      host: HTMLElement
    ): void => {
      const element = document.createElement("div");
      element.className = plan.depth === 0 ? "layout-box layout-box--root" : "layout-box";
      element.dataset.clusterPath = plan.path;
      element.tabIndex = 0;
      element.setAttribute(
        "aria-label",
        `Cluster ${plan.path === ROOT_KEY ? "root" : plan.name}`
      );
      element.setAttribute("role", "button");
      element.title = plan.path === ROOT_KEY ? "root" : plan.path;
      pathToElement.set(plan.path, element);
      if (plan.collapsedAncestors.length > 0) {
        plan.collapsedAncestors.forEach(ancestor => {
          pathToElement.set(ancestor.path, element);
        });
        element.dataset.collapsedAncestors = plan.collapsedAncestors.map(entry => entry.path).join(",");
      }

      const origin = parentPlan ? { x: parentPlan.contentRect.x, y: parentPlan.contentRect.y } : { x: 0, y: 0 };
      positionElement(element, plan.rect, origin);

      element.addEventListener("click", event => {
        if ((event.target as HTMLElement | null)?.closest?.(".node-card")) {
          return;
        }
        event.stopPropagation();
        focusClusterElement(element);
      });

      element.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focusClusterElement(element);
        }
      });

      if (plan.depth > 0) {
        const heading = document.createElement("div");
        heading.className = "layout-box__label";
        heading.textContent = plan.displayName;
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
          positionElement(card, nodePlan.rect, nodeOrigin);
          content.appendChild(card);
        });
      }

      plan.directories.forEach(child => {
        renderDirectoryLayout(child, plan, content);
      });
    };

    renderDirectoryLayout(layout.root, null, circuitContainer);

    if (!circuitHasInitialFit) {
      const viewportRect = viewport.getBoundingClientRect();
      const padding = 160;
      const scaleX = (viewportRect.width - padding) / layoutWidth;
      const scaleY = (viewportRect.height - padding) / layoutHeight;
      const initialScale = clamp(Math.min(scaleX, scaleY, 1), 0.25, 1.1);
      const offsetX = (viewportRect.width - layoutWidth * initialScale) / 2;
      const offsetY = (viewportRect.height - layoutHeight * initialScale) / 2;
      circuitTransform = { x: offsetX, y: offsetY, k: initialScale };
      circuitHasInitialFit = true;
      circuitInitialTransform = { ...circuitTransform };
    }

    updateCircuitTransform();
    if (!circuitUserAdjusted) {
      circuitInitialTransform = { ...circuitTransform };
    }
    requestAnimationFrame(() => {
      drawConnections();
      if (!circuitUserAdjusted) {
        let primaryElement: HTMLElement | null = null;
        if (dominantCluster && pathToElement.has(dominantCluster.path)) {
          primaryElement = pathToElement.get(dominantCluster.path) ?? null;
        } else if (state.selectedNode) {
          const directoryPath = getDirectoryKey(state.selectedNode);
          primaryElement = pathToElement.get(directoryPath) ?? null;
        }
        if (!primaryElement) {
          primaryElement = pathToElement.get(ROOT_KEY) ?? null;
        }
        focusClusterElement(primaryElement, true);
      }
    });
  }

  function drawConnections(): void {
    if (state.view !== "circuit") {
      return;
    }
    const overlay = requireElement<HTMLDivElement>("circuit-connections");
    overlay.innerHTML = "";

    const nodeMap = new Map<string, HTMLElement>();
    circuitContainer.querySelectorAll<HTMLElement>(".node-card").forEach(element => {
      const id = element.dataset.id;
      if (id) {
        nodeMap.set(id, element);
      }
    });

    if (hoveredNodeId && !nodeMap.has(hoveredNodeId)) {
      hoveredNodeId = null;
    }

    const activeNodeId = hoveredNodeId ?? state.selectedNode?.id ?? null;
    if (!activeNodeId) {
      overlay.dataset.active = "false";
      return;
    }

    const sourceEl = nodeMap.get(activeNodeId);
    if (!sourceEl) {
      overlay.dataset.active = "false";
      return;
    }

    const rootRect = circuitContainer.getBoundingClientRect();
    const scale = circuitTransform.k || 1;
    const svgWidth = Math.max(1, rootRect.width / scale);
    const svgHeight = Math.max(1, rootRect.height / scale);
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.classList.add("connection-svg");
    svg.setAttribute("width", `${svgWidth}`);
    svg.setAttribute("height", `${svgHeight}`);
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    overlay.appendChild(svg);

    let renderedConnections = 0;
    const connectedEdges = connectionMap.get(activeNodeId) ?? [];
    connectedEdges.forEach(connection => {
      const targetEl = nodeMap.get(connection.targetId);
      if (!targetEl) {
        return;
      }
      appendConnectionPath(svg, sourceEl, targetEl, connection.direction, connection.kind);
      renderedConnections += 1;
    });

    overlay.dataset.active = renderedConnections > 0 ? "true" : "false";
  }

  function appendConnectionPath(
    svg: SVGSVGElement,
    sourceElement: HTMLElement,
    targetElement: HTMLElement,
    direction: "outbound" | "inbound",
    kind: ExplorerLinkKind
  ): void {
    const source = getRelativeCenter(sourceElement, circuitContainer);
    const target = getRelativeCenter(targetElement, circuitContainer);

    const horizontalDirection = target.x >= source.x ? 1 : -1;
    const gap = Math.abs(target.x - source.x);
    const commands: string[] = [`M ${source.x} ${source.y}`];

    if (gap < 32) {
      const verticalDirection = target.y >= source.y ? 1 : -1;
      const verticalStub = Math.max(28, Math.abs(target.y - source.y) * 0.35);
      const elbowY = source.y + verticalDirection * verticalStub;
      commands.push(`V ${elbowY}`, `H ${target.x}`, `V ${target.y}`);
    } else {
      const stub = Math.min(Math.max(gap * 0.4, 28), Math.max(28, gap - 8));
      const elbowX = source.x + horizontalDirection * stub;
      commands.push(`H ${elbowX}`, `V ${target.y}`, `H ${target.x}`);
    }

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", commands.join(" "));
    path.classList.add("connection-path", direction);
    path.dataset.kind = kind;
    svg.appendChild(path);
  }

  function getRelativeCenter(element: HTMLElement, root: HTMLElement): { x: number; y: number } {
    const elementRect = element.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const scale = circuitTransform.k || 1;
    const relativeX = (elementRect.left - rootRect.left + elementRect.width / 2) / scale;
    const relativeY = (elementRect.top - rootRect.top + elementRect.height / 2) / scale;
    return { x: relativeX, y: relativeY };
  }

  function highlightSelection(): void {
    document.querySelectorAll<HTMLElement>(".node-card").forEach(element => {
      const id = element.dataset.id;
      if (!state.selectedNode || !id) {
        element.classList.remove("selected");
        return;
      }
      if (id === state.selectedNode.id) {
        element.classList.add("selected");
      } else {
        element.classList.remove("selected");
      }
    });
    if (state.view === "circuit") {
      drawConnections();
    }
  }

  function zoomIn(): void {
    zoomAtViewportCenter(1.2);
  }

  function zoomOut(): void {
    zoomAtViewportCenter(1 / 1.2);
  }

  function resetZoom(): void {
    if (circuitInitialTransform) {
      animateCircuitTransform(circuitInitialTransform, true);
    } else {
      animateCircuitTransform({ x: 0, y: 0, k: 1 }, true);
    }
  }

  return {
    render,
    highlightSelection,
    drawConnections,
    zoomIn,
    zoomOut,
    resetZoom
  };
}

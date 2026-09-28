/**
 * Circuit Board view controller — progressive disclosure treemap.
 *
 * This is the main entry point for the Circuit Board view. It orchestrates
 * two rendering modes:
 *
 * 1. **Aggregated view** (default): Top-level directories rendered as
 *    squarified treemap tiles showing file count, symbol count, and
 *    dependency metrics. ~15-25 tiles instead of 500+ DOM nodes.
 *
 * 2. **Expanded view**: User clicks a directory tile to expand it,
 *    revealing the original file-level layout for that directory.
 *    All other directories remain collapsed.
 *
 * The existing layout pipeline (layoutUtils.ts) is reused verbatim
 * for expanded directories. The new squarify algorithm handles
 * aggregated tile sizing.
 */
import type {
  ExplorerGraphPayload,
  ExplorerLinkKind,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../../shared/types";
import { requireElement } from "../../dom";
import type { CircuitTransform, ExplorerState, TestCoverageMap } from "../../types";
import {
  buildHierarchy,
} from "../layoutUtils";
import type { LayoutRect } from "../layoutUtils";
import type { DirectoryAggregate } from "./aggregation";
import { computeChildAggregates, findDirectoryByPath, computeAggregateWeight, computeFileWeight } from "./aggregation";
import { createBreadcrumb } from "./breadcrumb";
import { createDirectoryTile } from "./directoryTile";
import { computeSquarifiedLayout } from "../squarify";
import {
  type CircuitBoardState,
  createInitialState,
  expandDirectory,
  collapseAll,
  hasExpandedDirectories,
  buildBreadcrumbs,
  findContainingDirectory
} from "./state";

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
}

/** Options passed to the Circuit Board view factory. */
export interface CircuitViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  onSelectNode: (node: ExplorerNodePayload) => void | Promise<void>;
  onRecenterNode: (node: ExplorerNodePayload) => void | Promise<void>;
  onOpenLocalView: (node: ExplorerNodePayload) => void | Promise<void>;
  testCoverage: TestCoverageMap;
}

/** Public API surface of the Circuit Board (treemap) view. */
export interface CircuitViewApi {
  render(): void;
  highlightSelection(): void;
  drawConnections(): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
  scrollToNode(nodeId: string): void;
  /** Expand a specific directory (used by omnisearch integration). */
  expandAndScrollToNode(nodeId: string): void;
}

/** Creates the Circuit Board (treemap) view for the Live Docs Explorer. */
export function createCircuitView(options: CircuitViewOptions): CircuitViewApi {
  const { state, graphData, resolveLinkEndpoint, onSelectNode, onRecenterNode, onOpenLocalView: _onOpenLocalView, testCoverage } = options;
  type NodeConnection = { targetId: string; kind: ExplorerLinkKind; direction: "outbound" | "inbound" };

  const isTestNode = (node: ExplorerNodePayload | undefined | null): boolean =>
    !!node && (node.archetype || "").toLowerCase() === "test";

  // Build connection map once
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

  // DOM elements
  const viewport = requireElement<HTMLDivElement>("circuit-viewport");
  const circuitContainer = requireElement<HTMLDivElement>("circuit-container");
  const circuitConnections = requireElement<HTMLDivElement>("circuit-connections");
  circuitContainer.classList.add("layout-surface");

  type NodeAnchorSet = {
    center: { x: number; y: number };
    anchors: {
      top: { x: number; y: number };
      bottom: { x: number; y: number };
      left: { x: number; y: number };
      right: { x: number; y: number };
    };
  };

  let layoutAnchors = new Map<string, NodeAnchorSet>();

  // Transform state
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

  // Progressive disclosure state
  let boardState: CircuitBoardState = createInitialState();
  let breadcrumbContainer: HTMLElement | null = null;

  // ─── Pan / Zoom ──────────────────────────────────────────────────

  viewport.style.cursor = "grab";

  viewport.addEventListener("mousedown", event => {
    if ((event.target as HTMLElement | null)?.closest?.(".node-card, .directory-tile")) {
      return;
    }
    isDragging = true;
    circuitUserAdjusted = true;
    cancelInertia();
    lastDragPosition = { x: event.clientX, y: event.clientY, time: performance.now() };
    dragVelocity = { x: 0, y: 0 };
    viewport.style.cursor = "grabbing";
    document.body.classList.add("dragging");
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
    document.body.classList.remove("dragging");
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

  function _focusClusterElement(element: HTMLElement | null, suppressUserState = false): void {
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

  // ─── Node filtering ──────────────────────────────────────────────

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

  // ─── Node card creation (shared between aggregated + expanded) ──

  function createNodeCard(node: ExplorerNodePayload): HTMLElement {
    const card = document.createElement("div");
    card.className = "node-card";
    card.dataset.id = node.id;
    if (state.selectedNode && state.selectedNode.id === node.id) {
      card.classList.add("selected");
    }
    card.innerHTML = [
      `<div class="node-title">${escapeHtml(node.name)}</div>`,
      `<div class="node-path">${escapeHtml(node.codeRelativePath)}</div>`,
      `<div class="node-meta"><span class="badge">${escapeHtml(node.archetype)}</span><span class="badge">${node.publicSymbols.length} symbols</span></div>`,
      '<div class="pin top"></div><div class="pin bottom"></div><div class="pin left"></div><div class="pin right"></div>'
    ].join("");
    card.addEventListener("click", event => {
      event.stopPropagation();
      void onSelectNode(node);
    });
    card.addEventListener("dblclick", event => {
      event.stopPropagation();
      void onRecenterNode(node);
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
  }

  // ─── Main render ─────────────────────────────────────────────────

  function render(): void {
    const allNodes = graphData.nodes;
    const nodesForCircuit = allNodes.filter(shouldRenderNode);

    if (nodesForCircuit.length === 0) {
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

    const hierarchy = buildHierarchy(nodesForCircuit);

    // Find viewing directory and its parent for sibling computation
    let viewingDir = hierarchy;
    let parentDir: import("../../types").DirectoryNode | null = null;

    if (hasExpandedDirectories(boardState)) {
      let deepestPath = "";
      for (const path of boardState.expandedDirectories) {
        if (path.length > deepestPath.length) {
          deepestPath = path;
        }
      }
      if (deepestPath) {
        const found = findDirectoryByPath(hierarchy, deepestPath);
        if (found) {
          viewingDir = found;

          // Find parent: the second-deepest expanded path that is a prefix, or root
          let parentPath = "";
          for (const path of boardState.expandedDirectories) {
            if (path === deepestPath) continue;
            if (deepestPath.startsWith(path) && path.length > parentPath.length) {
              parentPath = path;
            }
          }
          parentDir = parentPath
            ? findDirectoryByPath(hierarchy, parentPath)
            : hierarchy;
        }
      }
    }

    renderDirectoryLevel(viewingDir, parentDir);
  }

  // ─── Layout constants ────────────────────────────────────────────

  const TILE_GAP = 8;
  const CARD_WIDTH = 220;
  const CARD_HEIGHT = 120;
  const SIBLING_STRIP_WIDTH = 180;
  const _SIBLING_STRIP_GAP = 6;
  const _SIBLING_STRIP_HEIGHT = 48;

  // ─── Unified directory-level render (progressive disclosure) ─────

  function renderDirectoryLevel(
    viewingDir: import("../../types").DirectoryNode,
    parentDir: import("../../types").DirectoryNode | null
  ): void {
    const childAggregates = computeChildAggregates(viewingDir);
    const looseFiles = viewingDir.nodes.filter(shouldRenderNode);

    // Compute sibling aggregates (other children of parent, excluding current)
    let siblingAggregates: DirectoryAggregate[] = [];
    if (parentDir) {
      const allParentChildren = computeChildAggregates(parentDir);
      siblingAggregates = allParentChildren.filter(a => a.path !== viewingDir.path);
    }

    // Handle edge case: empty directory
    if (childAggregates.length === 0 && looseFiles.length === 0) {
      circuitContainer.innerHTML =
        '<div class="empty-hint">This directory contains no documented artifacts.</div>';
      circuitContainer.style.width = "800px";
      circuitContainer.style.height = "520px";
      circuitContainer.style.minWidth = "800px";
      circuitContainer.style.minHeight = "520px";

      if (hasExpandedDirectories(boardState)) {
        renderBreadcrumbBar();
      } else if (breadcrumbContainer) {
        breadcrumbContainer.remove();
        breadcrumbContainer = null;
      }

      updateCircuitTransform();
      requestAnimationFrame(drawConnections);
      return;
    }

    // Size the layout canvas
    const viewportRect = viewport.getBoundingClientRect();
    const layoutWidth = Math.max(viewportRect.width * 1.5, 1200);
    const layoutHeight = Math.max(viewportRect.height * 1.2, 800);

    // Reserve right strip for siblings if any
    const hasSiblings = siblingAggregates.length > 0;
    const mainWidth = hasSiblings ? layoutWidth - SIBLING_STRIP_WIDTH - TILE_GAP : layoutWidth;

    // Compute two-zone split: directories (squarified) above, files (grid) below
    const totalDirWeight = childAggregates.reduce((s, a) => s + computeAggregateWeight(a), 0);
    const _fileGridHeight = looseFiles.length > 0
      ? computeFileGridHeight(looseFiles.length, mainWidth)
      : 0;

    // Proportional weight-based split between directory tiles and file cards
    let dirZoneHeight = layoutHeight;
    let fileZoneY = layoutHeight;
    if (childAggregates.length > 0 && looseFiles.length > 0) {
      const fileWeight = looseFiles.reduce((s, f) => s + computeFileWeight(f), 0);
      const dirRatio = totalDirWeight / (totalDirWeight + fileWeight);
      // Proportional split clamped so neither zone collapses below 160px
      const MIN_ZONE = 160;
      dirZoneHeight = Math.max(MIN_ZONE, Math.min(layoutHeight * dirRatio, layoutHeight - MIN_ZONE));
      fileZoneY = dirZoneHeight;
    } else if (childAggregates.length === 0) {
      dirZoneHeight = 0;
      fileZoneY = 0;
    }

    // Clear and set up canvas
    circuitContainer.innerHTML = "";
    circuitContainer.style.position = "relative";
    circuitContainer.style.width = `${layoutWidth}px`;
    circuitContainer.style.height = `${layoutHeight}px`;
    circuitContainer.style.minWidth = `${layoutWidth}px`;
    circuitContainer.style.minHeight = `${layoutHeight}px`;
    circuitConnections.style.width = `${layoutWidth}px`;
    circuitConnections.style.height = `${layoutHeight}px`;
    circuitConnections.style.minWidth = `${layoutWidth}px`;
    circuitConnections.style.minHeight = `${layoutHeight}px`;

    layoutAnchors = new Map();

    // ── Zone 1: Squarified directory tiles ──
    if (childAggregates.length > 0 && totalDirWeight > 0) {
      const dirItems = childAggregates.map(agg => ({
        id: agg.path,
        weight: computeAggregateWeight(agg)
      }));
      const dirViewport: LayoutRect = { x: 0, y: 0, width: mainWidth, height: dirZoneHeight };
      const dirTiles = computeSquarifiedLayout(dirItems, dirViewport);
      const dirMap = new Map(childAggregates.map(a => [a.path, a]));

      for (const tile of dirTiles) {
        const aggregate = dirMap.get(tile.item.id);
        if (!aggregate) continue;

        const tileElement = createDirectoryTile(aggregate, directoryPath => {
          boardState = expandDirectory(boardState, directoryPath);
          circuitHasInitialFit = false;
          circuitUserAdjusted = false;
          render();
        });

        tileElement.style.position = "absolute";
        tileElement.style.left = `${tile.rect.x + TILE_GAP}px`;
        tileElement.style.top = `${tile.rect.y + TILE_GAP}px`;
        tileElement.style.width = `${Math.max(tile.rect.width - TILE_GAP * 2, 0)}px`;
        tileElement.style.height = `${Math.max(tile.rect.height - TILE_GAP * 2, 0)}px`;

        circuitContainer.appendChild(tileElement);
      }
    }

    // ── Zone 2: Uniform file card grid ──
    if (looseFiles.length > 0) {
      const fileZone = document.createElement("div");
      fileZone.className = "circuit-file-grid";
      fileZone.style.position = "absolute";
      fileZone.style.left = `${TILE_GAP}px`;
      fileZone.style.top = `${fileZoneY + TILE_GAP}px`;
      fileZone.style.width = `${mainWidth - TILE_GAP * 2}px`;

      for (const file of looseFiles) {
        const card = createNodeCard(file);
        card.classList.add("layout-node", "circuit-file-card");

        // Track layout anchors (approximate position for connection highlighting)
        const cardIndex = looseFiles.indexOf(file);
        const cardsPerRow = Math.max(1, Math.floor((mainWidth - TILE_GAP * 2) / (CARD_WIDTH + TILE_GAP)));
        const col = cardIndex % cardsPerRow;
        const row = Math.floor(cardIndex / cardsPerRow);
        const cardX = col * (CARD_WIDTH + TILE_GAP) + TILE_GAP;
        const cardY = fileZoneY + TILE_GAP + row * (CARD_HEIGHT + TILE_GAP);
        const centerX = cardX + CARD_WIDTH / 2;
        const centerY = cardY + CARD_HEIGHT / 2;

        layoutAnchors.set(file.id, {
          center: { x: centerX, y: centerY },
          anchors: {
            top: { x: centerX, y: cardY },
            bottom: { x: centerX, y: cardY + CARD_HEIGHT },
            left: { x: cardX, y: centerY },
            right: { x: cardX + CARD_WIDTH, y: centerY }
          }
        });

        fileZone.appendChild(card);
      }

      circuitContainer.appendChild(fileZone);
    }

    // ── Sibling strip (dimmed, right edge) ──
    if (hasSiblings) {
      const stripContainer = document.createElement("div");
      stripContainer.className = "circuit-sibling-strip";
      stripContainer.style.position = "absolute";
      stripContainer.style.right = "0";
      stripContainer.style.top = "0";
      stripContainer.style.width = `${SIBLING_STRIP_WIDTH}px`;
      stripContainer.style.height = `${layoutHeight}px`;

      for (const sibling of siblingAggregates) {
        const strip = createSiblingStrip(sibling, directoryPath => {
          // Replace the current expanded dir with the clicked sibling
          const newExpanded = new Set(boardState.expandedDirectories);
          newExpanded.delete(viewingDir.path);
          newExpanded.add(directoryPath);
          boardState = { expandedDirectories: newExpanded };
          circuitHasInitialFit = false;
          circuitUserAdjusted = false;
          render();
        });
        stripContainer.appendChild(strip);
      }

      circuitContainer.appendChild(stripContainer);
    }

    // Breadcrumb navigation
    if (hasExpandedDirectories(boardState)) {
      renderBreadcrumbBar();
    } else if (breadcrumbContainer) {
      breadcrumbContainer.remove();
      breadcrumbContainer = null;
    }

    fitToViewport(layoutWidth, layoutHeight);

    requestAnimationFrame(() => {
      drawConnections();
    });
  }

  /** Computes the height needed for a file grid given count and available width. */
  function computeFileGridHeight(fileCount: number, availableWidth: number): number {
    const cardsPerRow = Math.max(1, Math.floor((availableWidth - TILE_GAP * 2) / (CARD_WIDTH + TILE_GAP)));
    const rows = Math.ceil(fileCount / cardsPerRow);
    return rows * (CARD_HEIGHT + TILE_GAP) + TILE_GAP;
  }

  /** Creates a compact dimmed strip for a sibling directory. */
  function createSiblingStrip(
    aggregate: DirectoryAggregate,
    onExpand: (path: string) => void
  ): HTMLElement {
    const strip = document.createElement("button");
    strip.className = "circuit-sibling-strip__item";
    strip.title = `${aggregate.name} — ${aggregate.fileCount} files, ${aggregate.symbolCount} symbols`;

    const label = document.createElement("div");
    label.className = "circuit-sibling-strip__label";
    label.textContent = aggregate.name;

    const badge = document.createElement("div");
    badge.className = "circuit-sibling-strip__badge";
    badge.textContent = `${aggregate.fileCount}`;

    strip.appendChild(label);
    strip.appendChild(badge);

    strip.addEventListener("click", (event: Event) => {
      event.stopPropagation();
      onExpand(aggregate.path);
    });

    return strip;
  }

  // ─── Shared helpers ──────────────────────────────────────────────

  function fitToViewport(layoutWidth: number, layoutHeight: number): void {
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
  }

  function renderBreadcrumbBar(): void {
    // Remove existing breadcrumb
    if (breadcrumbContainer) {
      breadcrumbContainer.remove();
    }

    // Find the deepest expanded directory for breadcrumb trail
    let deepestPath = "";
    for (const path of boardState.expandedDirectories) {
      if (path.length > deepestPath.length) {
        deepestPath = path;
      }
    }

    if (!deepestPath) return;

    const crumbs = buildBreadcrumbs(deepestPath);
    breadcrumbContainer = createBreadcrumb(crumbs, (path) => {
      if (path === "__root__") {
        boardState = collapseAll(boardState);
      } else {
        // Keep only directories that are ancestors of the clicked path
        const keep = new Set<string>();
        for (const expanded of boardState.expandedDirectories) {
          if (path.startsWith(expanded) || expanded === path) {
            keep.add(expanded);
          }
        }
        // Actually, navigating to a breadcrumb should collapse everything below it
        // Keep only the clicked path and its ancestors
        const ancestors = new Set<string>();
        const segments = path.split("/").filter(Boolean);
        let accumulated = "";
        for (const segment of segments) {
          accumulated = accumulated ? `${accumulated}/${segment}` : segment;
          if (boardState.expandedDirectories.has(accumulated)) {
            ancestors.add(accumulated);
          }
        }
        boardState = { expandedDirectories: ancestors };
      }
      circuitHasInitialFit = false;
      circuitUserAdjusted = false;
      render();
    });

    // Insert breadcrumb at the top of the viewport (above the transform layer)
    viewport.insertBefore(breadcrumbContainer, viewport.firstChild);
  }

  // ─── Connection highlighting ─────────────────────────────────────

  function drawConnections(): void {
    if (state.view !== "circuit") {
      return;
    }
    document.querySelectorAll<HTMLElement>(".node-card.connected-outbound, .node-card.connected-inbound").forEach(el => {
      el.classList.remove("connected-outbound", "connected-inbound");
    });

    if (hoveredNodeId && !layoutAnchors.has(hoveredNodeId)) {
      hoveredNodeId = null;
    }

    const activeNodeId = hoveredNodeId ?? state.selectedNode?.id ?? null;
    if (!activeNodeId) {
      return;
    }

    const connectedEdges = connectionMap.get(activeNodeId) ?? [];
    connectedEdges.forEach(connection => {
      const targetCard = document.querySelector<HTMLElement>(`.node-card[data-id="${connection.targetId}"]`);
      if (targetCard) {
        targetCard.classList.add(connection.direction === "outbound" ? "connected-outbound" : "connected-inbound");
      }
    });
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

  function scrollToNode(nodeId: string): void {
    const anchors = layoutAnchors.get(nodeId);
    if (!anchors) return;

    const viewportRect = viewport.getBoundingClientRect();
    const centerX = viewportRect.width / 2;
    const centerY = viewportRect.height / 2;

    const targetX = centerX - anchors.center.x * circuitTransform.k;
    const targetY = centerY - anchors.center.y * circuitTransform.k;

    animateCircuitTransform({ x: targetX, y: targetY, k: circuitTransform.k }, true);

    const nodeElement = circuitContainer.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      nodeElement.classList.add("pulse-highlight");
      setTimeout(() => {
        nodeElement.classList.remove("pulse-highlight");
      }, 1500);
    }
  }

  /**
   * Expands the full ancestor chain to the directory containing the given node,
   * then scrolls to that node. Used by omnisearch integration to navigate
   * directly to a file within the Circuit Board's progressive disclosure model.
   */
  function expandAndScrollToNode(nodeId: string): void {
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const dirPath = findContainingDirectory(node);
    if (dirPath !== "__root__") {
      // Build full ancestor chain: expand every ancestor directory
      // so progressive disclosure walks down to the target file's directory
      const nodesForCircuit = graphData.nodes.filter(shouldRenderNode);
      const hierarchy = buildHierarchy(nodesForCircuit);

      // Walk the hierarchy from root to the target directory,
      // expanding at each level the effective (chain-collapsed) path
      let current = hierarchy;
      const targetDir = findDirectoryByPath(hierarchy, dirPath);
      if (!targetDir) {
        // Fallback: just expand the containing directory
        boardState = expandDirectory(boardState, dirPath);
      } else {
        // Find the path by walking through aggregate levels
        boardState = createInitialState();
        const segments = dirPath.split("/").filter(Boolean);
        let accumulated = "";
        for (const segment of segments) {
          accumulated = accumulated ? `${accumulated}/${segment}` : segment;
          const found = findDirectoryByPath(hierarchy, accumulated);
          if (found) {
            // Check if this path exists as an effective child aggregate of current
            const childAggs = computeChildAggregates(current);
            const matchingAgg = childAggs.find(a =>
              a.path === accumulated || accumulated.startsWith(a.path + "/") || a.path.startsWith(accumulated)
            );
            if (matchingAgg) {
              boardState = expandDirectory(boardState, matchingAgg.path);
              const next = findDirectoryByPath(hierarchy, matchingAgg.path);
              if (next) current = next;
              // Skip ahead if the aggregate path is longer than our accumulated path
              if (matchingAgg.path.length > accumulated.length) {
                accumulated = matchingAgg.path;
              }
            }
          }
        }
      }
    }
    circuitHasInitialFit = false;
    circuitUserAdjusted = false;
    render();

    // Scroll to node after render completes
    setTimeout(() => {
      scrollToNode(nodeId);
    }, 100);
  }

  return {
    render,
    highlightSelection,
    drawConnections,
    zoomIn,
    zoomOut,
    resetZoom,
    scrollToNode,
    expandAndScrollToNode
  };
}

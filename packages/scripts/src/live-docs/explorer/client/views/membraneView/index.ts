/**
 * Membrane Map view controller.
 *
 * Orchestrates the membrane layout, state management, and rendering.
 * Supports Browse mode (progressive disclosure treemap) and the
 * continuous pin model: symbols can be pinned to reveal connections,
 * expanding from Browse → Explore → Compare → Path as pins accumulate.
 */
import type {
  ExplorerGraphPayload,
  ExplorerNodePayload
} from "../../../shared/types";
import { requireElement } from "../../dom";
import type { UrlStateSnapshot } from "../../persistence/compressed-url-state";
import {
  readUrlState,
  writeUrlState,
} from "../../persistence/compressed-url-state";
import type { ExplorerState, TestCoverageMap } from "../../types";
import type { DirectoryAggregate } from "../circuitView/aggregation";
import { buildHierarchy } from "../layoutUtils";
import type { LayoutRect } from "../layoutUtils";
import { computeAllAggregates } from "./aggregation";
import { capturePositions, animateTransition } from "./animation";
import { renderBrowseMode } from "./browse-renderer";
import {
  renderFocalOverlay,
  drawConnections,
  attachHopBadges,
  renderPathBreadcrumb,
  setupHoverDimming,
  markConnectedEndpoints,
} from "./focal-overlay";
import type { MeasuredAnchor } from "./focal-overlay";
import { computeMembraneLayout } from "./layout";
import { renderPinActiveLayout } from "./pin-active-renderer";
import { computePinLayout } from "./pin-layout";
import type { PinSet } from "./pin-state";
import type { VisibleConnection } from "./pin-state";
import {
  addPin,
  togglePin,
  clearPins,
  removePinsForNode,
  areAllSymbolsPinned,
  getVisibleConnections,
  getRequiredExpansions,
} from "./pin-state";
import type { MembraneLayout } from "./types";

/** Options for creating a Membrane Map view controller. */
export interface MembraneViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  resolveLinkEndpoint: (endpoint: { id: string } | string) => string;
  onSelectNode: (node: ExplorerNodePayload) => void | Promise<void>;
  testCoverage: TestCoverageMap;
  nodesById: Map<string, ExplorerNodePayload>;
}

/** Public API surface returned by {@link createMembraneView}. */
export interface MembraneViewApi {
  render(): void;
  /** Re-measure anchor positions and redraw SVG connections without rebuilding DOM. */
  redrawConnections(): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
}

interface MembraneTransform {
  x: number;
  y: number;
  k: number;
}

/** Clamp `value` between `min` and `max` inclusive. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Initialise the Membrane Map view and return its public API. */
export function createMembraneView(options: MembraneViewOptions): MembraneViewApi {
  const { state, graphData, resolveLinkEndpoint: _resolveLinkEndpoint, onSelectNode, testCoverage, nodesById } = options;

  // DOM elements
  const viewport = requireElement<HTMLDivElement>("membrane-viewport");
  const container = requireElement<HTMLDivElement>("membrane-container");

  // Restore state from URL (or defaults)
  const urlSnapshot = readUrlState();

  // Apply URL-restored selection to shared state if applicable
  if (urlSnapshot.selectedNodeId && !state.selectedNode) {
    const restoredNode = nodesById.get(urlSnapshot.selectedNodeId);
    if (restoredNode) state.selectedNode = restoredNode;
  }

  // State
  const expandedDirectories = new Set<string>(urlSnapshot.expandedDirectories);
  let transform: MembraneTransform = { ...urlSnapshot.transform };
  let isDragging = false;
  let lastDragPos: { x: number; y: number } | null = null;
  let currentLayout: MembraneLayout | null = null;
  let currentAggregates: Map<string, DirectoryAggregate> = new Map();
  let pinSet: PinSet = urlSnapshot.pinSet;

  // Tracks which file cards in the card-grid are expanded to show symbols.
  // Cards start collapsed (compact: name, path, internals) and expand on click.
  const expandedCards = new Set<string>();

  // Focus-based drill-down: tracks which directory the user is
  // "inside" so siblings collapse and the viewport frames it.
  let focusedDirectory: string | null = inferFocusFromExpanded(expandedDirectories);
  let shouldZoomToFocus = false;

  // Stored pin-active render artifacts for lightweight connection redraw
  let lastPinSvg: SVGSVGElement | null = null;
  let lastPinAnchors: readonly MeasuredAnchor[] = [];
  let lastPinConns: readonly VisibleConnection[] = [];
  let lastPinScale = 1;

  // If URL restored a non-default transform, apply it immediately
  const hasRestoredTransform = transform.x !== 0 || transform.y !== 0 || transform.k !== 1;

  // ─── Structural fingerprint ──────────────────────────────────────
  // Tracks whether a full rebuild is needed.  When only the selected
  // node changes the layout is structurally identical and we can apply
  // a lightweight CSS-only selection update.
  let lastStructuralKey = "";

  /** Compute a fingerprint of everything that changes layout structure. */
  function structuralKey(): string {
    const dirs = [...expandedDirectories].sort().join(",");
    const pins = pinSet.entries.map(e => `${e.nodeId}:${e.symbol}`).sort().join(",");
    const cards = [...expandedCards].sort().join(",");
    return `${focusedDirectory}|${dirs}|${pins}|${cards}|${state.filters.showTests}|${state.filters.showAssets}`;
  }

  // ─── Pan / Zoom ──────────────────────────────────────────────────

  viewport.style.cursor = "grab";

  viewport.addEventListener("mousedown", event => {
    if ((event.target as HTMLElement | null)?.closest?.(".membrane--collapsed, .membrane-leaf")) {
      return;
    }
    isDragging = true;
    lastDragPos = { x: event.clientX, y: event.clientY };
    viewport.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", event => {
    if (!isDragging || !lastDragPos) return;
    event.preventDefault();
    const dx = event.clientX - lastDragPos.x;
    const dy = event.clientY - lastDragPos.y;
    transform = { x: transform.x + dx, y: transform.y + dy, k: transform.k };
    applyTransform();
    lastDragPos = { x: event.clientX, y: event.clientY };
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = "grab";
  });

  viewport.addEventListener("wheel", event => {
    if (state.view !== "membrane") return;
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      // Pinch-zoom
      const rect = viewport.getBoundingClientRect();
      zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, -event.deltaY * 0.0015);
    } else {
      // Scroll-pan
      transform = {
        x: transform.x - event.deltaX,
        y: transform.y - event.deltaY,
        k: transform.k
      };
      applyTransform();
    }
  }, { passive: false });

  function zoomAtPoint(ox: number, oy: number, delta: number): void {
    const factor = Math.exp(delta);
    const nextK = clamp(transform.k * factor, 0.1, 5);
    const lx = (ox - transform.x) / transform.k;
    const ly = (oy - transform.y) / transform.k;
    transform = { x: ox - lx * nextK, y: oy - ly * nextK, k: nextK };
    applyTransform();
  }

  function applyTransform(): void {
    const matrix = `matrix(${transform.k},0,0,${transform.k},${transform.x},${transform.y})`;
    container.style.transform = matrix;
  }

  // ─── Keyboard Shortcuts ──────────────────────────────────────────

  window.addEventListener("keydown", event => {
    if (state.view !== "membrane") return;
    // Ignore when focus is in an input/textarea
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (event.key === "Escape") {
      if (pinSet.entries.length > 0) {
        pinSet = clearPins();
        render();
      }
    }
  });

  // ─── Rendering ───────────────────────────────────────────────────

  /**
   * Lightweight selection update — toggles the `.selected` CSS class
   * on existing DOM elements without rebuilding the layout.
   * Returns `true` if the fast path was taken.
   */
  function trySelectionOnlyUpdate(): boolean {
    const key = structuralKey();
    if (key !== lastStructuralKey) return false;

    // Decline the fast path when a leaf is selected but no directory
    // is focused — the full render needs to auto-expand the ancestor
    // path so the node renders as a card instead of a floating overlay.
    const selectedNodeId = state.focusedNode?.id ?? state.selectedNode?.id ?? null;
    if (selectedNodeId && !focusedDirectory && expandedDirectories.size === 0) {
      return false;
    }

    // Toggle .selected on leaves and cards
    for (const el of container.querySelectorAll<HTMLElement>(".selected")) {
      el.classList.remove("selected");
    }
    if (selectedNodeId) {
      const leaf = container.querySelector<HTMLElement>(`.membrane-leaf[data-id="${CSS.escape(selectedNodeId)}"]`);
      if (leaf) leaf.classList.add("selected");
      const card = container.querySelector<HTMLElement>(`.membrane-card[data-id="${CSS.escape(selectedNodeId)}"]`);
      if (card) card.classList.add("selected");
    }

    persistToUrl();
    return true;
  }

  function render(): void {
    // ─── Fast path: selection-only change ─────────────────────────
    if (trySelectionOnlyUpdate()) return;

    // ─── FLIP: capture old positions before teardown ───────────────
    const oldPositions = capturePositions(container, transform.k);

    container.innerHTML = "";

    // Remove stale breadcrumb bars from prior renders
    for (const el of Array.from(viewport.querySelectorAll(".membrane-path-breadcrumb"))) {
      el.remove();
    }

    if (graphData.nodes.length === 0) {
      container.innerHTML = '<div class="empty-hint">No nodes to display.</div>';
      return;
    }

    // Filter nodes based on current filters
    const filteredNodes = graphData.nodes.filter(node => {
      if (!state.filters.showTests && (node.archetype || "").toLowerCase() === "test") return false;
      if (!state.filters.showAssets && (node.archetype || "").toLowerCase() === "asset") return false;
      return true;
    });

    if (filteredNodes.length === 0) {
      container.innerHTML = '<div class="empty-hint">All nodes filtered out.</div>';
      return;
    }

    // Build hierarchy and compute layout
    const hierarchy = buildHierarchy(filteredNodes);
    const viewportRect = viewport.getBoundingClientRect();
    const layoutViewport: LayoutRect = {
      x: 0,
      y: 0,
      width: Math.max(viewportRect.width, 800),
      height: Math.max(viewportRect.height, 600),
    };

    // Auto-focus: when a leaf node is selected but no directory is
    // expanded, expand the ancestor path so the node renders as a
    // card rather than a tiny focal-overlay on a collapsed tile.
    // We must derive the parent directory from the *layout* hierarchy
    // (docRelativePath-based) rather than the node's .id, since the
    // treemap directory structure lives under the MDMD layer path.
    const selectedId = state.focusedNode?.id ?? state.selectedNode?.id ?? null;
    if (selectedId && !focusedDirectory && expandedDirectories.size === 0) {
      const selectedNode = state.focusedNode ?? state.selectedNode;
      const docPath = selectedNode?.docRelativePath ?? "";
      const docParts = docPath.split("/").filter(Boolean);
      if (docParts.length > 1) {
        const parentDir = docParts.slice(0, -1).join("/");
        focusedDirectory = parentDir;
        const focusPath = buildFocusPath(parentDir);
        for (const p of focusPath) {
          expandedDirectories.add(p);
        }
        shouldZoomToFocus = true;
      }
    }

    currentLayout = computeMembraneLayout(
      hierarchy,
      layoutViewport,
      undefined,
      focusedDirectory ? buildFocusPath(focusedDirectory) : undefined
    );
    currentAggregates = computeAllAggregates(hierarchy);

    // Determine collapsed set: by default all directories are collapsed
    // except those the user has explicitly expanded
    const collapsed = new Set<string>();
    for (const [id, node] of currentLayout.index) {
      if (node.isDirectory && !expandedDirectories.has(id)) {
        collapsed.add(id);
      }
    }
    // The root is always expanded (it IS the viewport)
    collapsed.delete(currentLayout.root.id);

    // Auto-expand ancestor directories of pinned nodes so they're visible
    if (pinSet.entries.length > 0) {
      const required = getRequiredExpansions(pinSet);
      for (const dirId of required) {
        collapsed.delete(dirId);
        expandedDirectories.add(dirId);
      }
    }

    const selectedNodeId = state.focusedNode?.id ?? state.selectedNode?.id ?? null;

    // ─── Pin-Active Layout ─────────────────────────────────────────
    // When pins are active, replace the squarify treemap with a
    // left-to-right dependency-flow layout showing only relevant nodes.
    if (pinSet.entries.length > 0) {
      const pinLayout = computePinLayout(pinSet, graphData.links, nodesById);

      if (pinLayout.relevantNodeIds.size > 0) {
        const pinActiveResult = renderPinActiveLayout(
          pinLayout,
          nodesById,
          selectedNodeId,
          {
            onSelectNode: node => {
              void onSelectNode(node);
              render();
            },
            onTogglePin: (nodeId, symbol) => {
              pinSet = togglePin(pinSet, nodeId, symbol);
              render();
            },
            onPinAllSymbols: (nodeId) => {
              const payload = nodesById.get(nodeId);
              if (payload) {
                if (areAllSymbolsPinned(pinSet, nodeId, payload.publicSymbols)) {
                  pinSet = removePinsForNode(pinSet, nodeId);
                } else {
                  for (const sym of payload.publicSymbols) {
                    pinSet = addPin(pinSet, nodeId, sym);
                  }
                  pinSet = addPin(pinSet, nodeId, "__internals__");
                }
              }
              render();
            },
            onClearPins: () => {
              pinSet = clearPins();
              render();
            },
            onNavigateToDirectory: dir => {
              pinSet = clearPins();
              focusedDirectory = dir;
              const focusPath = buildFocusPath(dir);
              expandedDirectories.clear();
              for (const p of focusPath) {
                expandedDirectories.add(p);
              }
              shouldZoomToFocus = true;
              render();
            },
          },
          pinSet,
        );

        container.appendChild(pinActiveResult.root);

        // Create SVG overlay for connections (positioned relative to container)
        const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgOverlay.classList.add("membrane-focal-svg");
        svgOverlay.style.position = "absolute";
        svgOverlay.style.top = "0";
        svgOverlay.style.left = "0";
        svgOverlay.style.width = "100%";
        svgOverlay.style.height = "100%";
        svgOverlay.style.pointerEvents = "none";
        svgOverlay.style.zIndex = "5";
        svgOverlay.style.overflow = "visible";
        container.appendChild(svgOverlay);

        // Enable hover dimming on symbol rows → SVG connections
        setupHoverDimming(container, svgOverlay);

        // Draw connections after FLIP animation completes (elements at final positions)
        const flipDone = animateTransition(container, oldPositions, transform.k);
        void flipDone.then(() => {
          const visibleConns = getVisibleConnections(pinSet, graphData.links);
          // Swap source/target for visual rendering: graph links represent dependency
          // direction (consumer→provider) but pin-active layout shows data-flow
          // direction (provider→consumer, left→right). Swapping produces front-traces
          // instead of back-trace stubs.
          const flowConns = visibleConns.map(conn => ({
            ...conn,
            link: {
              ...conn.link,
              source: conn.link.target,
              target: conn.link.source,
              sourceSymbol: conn.link.targetSymbol,
              targetSymbol: conn.link.sourceSymbol,
            },
          }));
          drawConnections(
            svgOverlay,
            pinActiveResult.anchors,
            flowConns,
            container,
            transform.k,
            state.tuning.bezier,
          );
          markConnectedEndpoints(svgOverlay, container, pinSet);

          // Store artifacts for lightweight connection redraw (tuning slider)
          lastPinSvg = svgOverlay;
          lastPinAnchors = pinActiveResult.anchors;
          lastPinConns = flowConns;
          lastPinScale = transform.k;
        });

        // Render path breadcrumb bar
        const breadcrumb = renderPathBreadcrumb(
          pinSet,
          nodesById,
          {
            onClickHop: (nodeId) => {
              const node = nodesById.get(nodeId);
              if (node) void onSelectNode(node);
            },
            onClearPath: () => {
              pinSet = clearPins();
              render();
            },
          },
        );
        if (breadcrumb) {
          viewport.appendChild(breadcrumb);
        }

        // Persist state and exit — no browse-mode rendering needed
        lastStructuralKey = structuralKey();
        persistToUrl();
        return;
      }
    }

    // ─── Browse Mode (no pins active) ──────────────────────────────
    const browseResult = renderBrowseMode(
      currentLayout,
      collapsed,
      currentAggregates,
      nodesById,
      selectedNodeId,
      {
        onExpandDirectory: id => {
          // Focus-based drill-down: set this directory as the focus,
          // collapse everything not on the ancestor path, and auto-zoom.
          focusedDirectory = id;
          shouldZoomToFocus = true;
          expandedCards.clear();

          const focusPath = buildFocusPath(id);
          expandedDirectories.clear();
          for (const p of focusPath) {
            expandedDirectories.add(p);
          }

          render();
        },
        onCollapseDirectory: id => {
          expandedDirectories.delete(id);
          // Also collapse all children
          for (const key of [...expandedDirectories]) {
            if (key.startsWith(id + "/")) {
              expandedDirectories.delete(key);
            }
          }          expandedCards.clear();
          // Navigate focus up to parent directory
          const lastSlash = id.lastIndexOf("/");
          const parentId = lastSlash > 0 ? id.substring(0, lastSlash) : null;
          focusedDirectory = parentId;
          shouldZoomToFocus = !!parentId;

          render();
        },
        onSelectNode: node => {
          void onSelectNode(node);
          // Re-render so the focal panel with pin anchors appears
          // for the newly selected leaf node.
          render();
        },
        onTogglePin: (nodeId, symbol) => {
          pinSet = togglePin(pinSet, nodeId, symbol);
          render();
        },
        onExpandCard: (nodeId) => {
          expandedCards.add(nodeId);
          render();
        },
        onPinAllSymbols: (nodeId) => {
          const payload = nodesById.get(nodeId);
          if (payload) {
            if (areAllSymbolsPinned(pinSet, nodeId, payload.publicSymbols)) {
              // Toggle: unpin all
              pinSet = removePinsForNode(pinSet, nodeId);
            } else {
              // Pin all
              for (const sym of payload.publicSymbols) {
                pinSet = addPin(pinSet, nodeId, sym);
              }
              pinSet = addPin(pinSet, nodeId, "__internals__");
            }
          }
          render();
        },
      },
      pinSet,
      focusedDirectory,
      expandedCards,
      testCoverage,
    );

    container.appendChild(browseResult.root);

    // ─── Bundled edges (membrane-to-membrane connections) ───
    // Disabled for MVP: the thick arcs between collapsed tiles create
    // visual noise that overwhelms the treemap layout.  Pin-driven
    // connections (focal-overlay) provide a cleaner relationship view.
    // Re-enable once hover-only or progressive-disclosure rendering
    // is implemented for bundle edges.
    // if (currentLayout && graphData.links.length > 0) {
    //   const edgePairs: Array<[string, string]> = graphData.links.map(link => [
    //     resolveLinkEndpoint(link.source),
    //     resolveLinkEndpoint(link.target),
    //   ]);
    //   const bundles = aggregateEdges(currentLayout, edgePairs, collapsed);
    //   const bundleSvg = renderBundledEdges(bundles, currentLayout);
    //   if (bundleSvg) {
    //     container.appendChild(bundleSvg);
    //   }
    // }

    // ─── Focal overlay (card-style panels + connections) ───
    // Show focal panels when: (a) any pins are active, or (b) a leaf node
    // is selected.  The "Selected" state renders the card with pin anchors
    // so the user can click pins to start the continuous pin spectrum.
    // Skip nodes already rendered as cards in the card-grid (they have
    // their own pin anchors and don't need focal overlay panels).
    const hasSelectedLeaf = !!selectedNodeId
      && !browseResult.cardRenderedIds.has(selectedNodeId)
      && currentLayout?.index.get(selectedNodeId)?.isDirectory === false;
    const hasNonCardPins = pinSet.entries.some(e => !browseResult.cardRenderedIds.has(e.nodeId));
    const hasPins = pinSet.entries.length > 0;
    let browseOverlay: { svgOverlay: SVGSVGElement; anchors: MeasuredAnchor[] } | null = null;
    if ((hasNonCardPins || hasSelectedLeaf || hasPins) && currentLayout) {
      const overlay = renderFocalOverlay(
        currentLayout,
        pinSet,
        nodesById,
        {
          onTogglePin: (nodeId, symbol) => {
            pinSet = togglePin(pinSet, nodeId, symbol);
            render();
          },
        },
        selectedNodeId,
        browseResult.cardRenderedIds,
      );

      // Append expansion panels
      for (const panel of overlay.panels.values()) {
        container.appendChild(panel);
      }

      // Attach hop badges for path-mode nodes
      attachHopBadges(overlay.panels, pinSet);

      // Append SVG overlay
      container.appendChild(overlay.svgOverlay);

      // Enable hover dimming on symbol rows → SVG connections
      setupHoverDimming(container, overlay.svgOverlay);

      // Connection drawing is deferred below — after FLIP animation completes
      // so that element positions are settled when anchors are measured.
      browseOverlay = overlay;

      // Render path breadcrumb bar (outside the container, in the viewport)
      const breadcrumb = renderPathBreadcrumb(
        pinSet,
        nodesById,
        {
          onClickHop: (nodeId) => {
            // Navigate to the hop node: select it + ensure it's visible
            const node = nodesById.get(nodeId);
            if (node) void onSelectNode(node);
          },
          onClearPath: () => {
            pinSet = clearPins();
            render();
          },
        },
      );
      if (breadcrumb) {
        viewport.appendChild(breadcrumb);
      }
    }

    // On focus navigation, re-fit to viewport at natural scale (no CSS zoom)
    if (shouldZoomToFocus && focusedDirectory) {
      shouldZoomToFocus = false;
      fitToViewport(layoutViewport);
    } else if (!hasRestoredTransform && transform.x === 0 && transform.y === 0 && transform.k === 1) {
      fitToViewport(layoutViewport);
    }

    // ─── FLIP: animate elements from old to new positions ─────────
    // Draw connections only after FLIP settles so anchor positions are final.
    const flipDone = animateTransition(container, oldPositions, transform.k);
    if (browseOverlay) {
      const ov = browseOverlay;
      const anchors = browseResult.anchors;
      const k = transform.k;
      void flipDone.then(() => {
        const visibleConns = getVisibleConnections(pinSet, graphData.links);
        const allAnchors = [...ov.anchors, ...anchors];
        drawConnections(ov.svgOverlay, allAnchors, visibleConns, container, k, state.tuning.bezier);
      });
    }

    // Record structural fingerprint for fast-path detection
    lastStructuralKey = structuralKey();

    // Persist state to URL
    persistToUrl();
  }

  /** Write current membrane state to the URL without navigation. */
  function persistToUrl(): void {
    const snapshot: UrlStateSnapshot = {
      view: state.view,
      selectedNodeId: state.selectedNode?.id ?? null,
      pinSet,
      expandedDirectories,
      transform,
      filters: {
        showTests: state.filters.showTests,
        showAssets: state.filters.showAssets,
      },
    };
    writeUrlState(snapshot);
  }

  function fitToViewport(layoutRect: LayoutRect): void {
    const viewportRect = viewport.getBoundingClientRect();
    const scaleX = viewportRect.width / layoutRect.width;
    const scaleY = viewportRect.height / layoutRect.height;
    const scale = clamp(Math.min(scaleX, scaleY) * 0.95, 0.1, 2);
    const cx = (viewportRect.width - layoutRect.width * scale) / 2;
    const cy = (viewportRect.height - layoutRect.height * scale) / 2;
    transform = { x: cx, y: cy, k: scale };
    applyTransform();
  }

  /**
   * Compute the set of ancestor directory IDs for a given path,
   * inclusive of the path itself.  E.g. "a/b/c" → {"a", "a/b", "a/b/c"}.
   */
  function buildFocusPath(dirId: string): Set<string> {
    const parts = dirId.split("/");
    const path = new Set<string>();
    for (let i = 1; i <= parts.length; i++) {
      path.add(parts.slice(0, i).join("/"));
    }
    return path;
  }

  /**
   * Infer which directory is focused from a restored set of expanded directories.
   * Returns the deepest expanded directory (most path segments).
   */
  function inferFocusFromExpanded(expanded: Set<string>): string | null {
    let deepest: string | null = null;
    let maxDepth = 0;
    for (const dir of expanded) {
      const depth = dir.split("/").length;
      if (depth > maxDepth) {
        maxDepth = depth;
        deepest = dir;
      }
    }
    return deepest;
  }

  function zoomByFactor(factor: number): void {
    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(rect.width / 2, rect.height / 2, Math.log(factor));
  }

  /**
   * Re-measure anchor positions and redraw SVG connections without
   * rebuilding the DOM.  Called by the tuning-panel column-gap slider
   * so connectors stay aligned when the CSS grid gap changes.
   */
  function redrawConnections(): void {
    if (lastPinSvg && lastPinAnchors.length > 0) {
      drawConnections(
        lastPinSvg, lastPinAnchors, lastPinConns,
        container, lastPinScale, state.tuning.bezier,
      );
      markConnectedEndpoints(lastPinSvg, container, pinSet);
    }
  }

  return {
    render,
    redrawConnections,
    zoomIn: () => zoomByFactor(1.3),
    zoomOut: () => zoomByFactor(1 / 1.3),
    resetZoom: () => {
      transform = { x: 0, y: 0, k: 1 };
      render();
    },
  };
}

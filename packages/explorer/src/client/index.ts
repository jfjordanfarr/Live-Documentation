import { inferDefaultEntryNodeId } from "./bootstrap";
import { createDetailPanel } from "./detailPanel";
import { requireElement, setActiveView } from "./dom";
import { downloadDocs, type DownloadBundleType, type DownloadFormat } from "./download";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { buildTestCoverageMap, resolveLinkEndpoint, getInputById } from "./graph-helpers";
import { initOmnisearch } from "./panels/omnisearch";
import { renderSourcesView } from "./panels/sources-view";
import { initTuningPanel } from "./panels/tuning";
import {
  findPath,
  initPathfind,
  parsePathfindFromUrl,
  updatePathfindUrl,
  type PathfindEndpoint,
  type PathfindResult
} from "./pathfind";
import {
  parseInitialState,
  updateUrlState,
  getDefaultFilters,
  getDefaultTuning,
  readPersistedUi,
  applyPersistedUi,
  readPersistedNav,
  createPersistUiScheduler,
  createPersistNavScheduler
} from "./persistence";
import type { ExplorerState, ViewName } from "./types";
import { createCircuitView } from "./views/circuitView";
import { createForceGraphView } from "./views/forceGraphView";
import { createLocalView } from "./views/localView";
import { createMembraneView } from "./views/membraneView";
import { createWorldMapView } from "./views/worldMap";
import { explorerGraphOf } from "../shared/graph";
import type { StaticExplorerData } from "../shared/staticExplorerData";
import type { ExplorerNodePayload } from "../shared/types";
import type { PathResult } from "./views/localView/state";

declare global {
  interface Window {
    __liveDocsExplorerError?: unknown;
    switchView: (event: MouseEvent, viewName: ViewName) => void;
    openInLocalView: () => void;
    openInGraphView: () => void;
    openInCircuitBoard: () => void;
    openOmnisearch: () => void;
    downloadCurrentDoc: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    toggleSidebar: () => void;
  }
}

const globalWindow = window as Window;

attachGlobalErrorHandler();

void bootstrapExplorer();

/**
 * Bootstrap the explorer from the bundle the static builder wrote.
 */
async function bootstrapExplorer(): Promise<void> {
  try {
    startExplorer(await loadExplorerData());
  } catch (error) {
    reportFatalExplorerError(error);
  }
}

/**
 * Loads the bundle: from the URL named by `?data=`, or from `explorer-data.json` beside the page.
 */
async function loadExplorerData(): Promise<StaticExplorerData> {
  const dataUrl = new URLSearchParams(window.location.search).get("data") ?? "./explorer-data.json";
  const response = await fetch(dataUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `No explorer data at ${dataUrl} (${response.status}). Build a static bundle first with \`npm run live-docs:visualize\`.`
    );
  }
  const bundle = (await response.json()) as Partial<StaticExplorerData>;
  if (!bundle.graph || typeof bundle.graph.files !== "object") {
    throw new Error(`${dataUrl} is not an Explorer bundle: it holds no graph.`);
  }
  return bundle as StaticExplorerData;
}

function startExplorer(bundle: StaticExplorerData): void {
  const graphData = explorerGraphOf(bundle.graph);
  const files = bundle.graph.files;
  const { bundledMarkdown, bundledMarkdownTree, relatedDocLinks } = bundle;
  console.log("Live Docs Explorer graph loaded", graphData);
  if (bundledMarkdown) {
    console.log(`Bundled markdown: ${Object.keys(bundledMarkdown).length} referenced files`);
  }

  // Related markdown, as the Knowledge Sources view lists it
  const bundledDocs = bundledMarkdownTree && bundledMarkdown
    ? { tree: bundledMarkdownTree, count: Object.keys(bundledMarkdown).length }
    : undefined;

  // ─────────────────────────────────────────────────────────────────────────
  // URL + LocalStorage State
  // ─────────────────────────────────────────────────────────────────────────

  const initialState = parseInitialState();

  const defaults = { filters: getDefaultFilters(), tuning: getDefaultTuning() };
  const persistedUi = readPersistedUi();
  const initialUi = applyPersistedUi(defaults, persistedUi);

  const persistedNav = initialState.hasUrlState ? null : readPersistedNav();

  const resolveInitialView = (): ViewName => {
    if (initialState.hasUrlState) {
      return initialState.view;
    }
    // A bundle that carries a board opens on the World Map, the outside of everything.
    return persistedNav?.view ?? (bundle.board ? "world" : initialState.view);
  };

  const state: ExplorerState = {
    view: resolveInitialView(),
    selectedNode: null,
    focusedNode: null,
    filters: initialUi.filters,
    tuning: initialUi.tuning
  };

  const persistUi = createPersistUiScheduler(() => ({
    filters: state.filters,
    tuning: state.tuning
  }));
  const schedulePersistUi = persistUi.schedule;

  const nodesById = new Map(graphData.nodes.map(node => [node.id, node]));

  const persistNav = createPersistNavScheduler(() => ({
    view: state.view,
    focusedNodeId: state.focusedNode?.id ?? null,
    selectedNodeId: state.selectedNode?.id ?? null
  }));
  const schedulePersistNav = persistNav.schedule;

  // Helper to open a node in Circuit Board view
  const openInCircuitBoardView = (node: ExplorerNodePayload): void => {
    // Hide detail panel when navigating to another view
    detailPanel.hide();
    state.selectedNode = node;
    state.view = "circuit";
    setActiveView("circuit");
    updateUrlState("circuit", node.id);
    schedulePersistNav();
    renderCurrentView();
    // Expand the containing directory and scroll to the node
    setTimeout(() => {
      circuitView.expandAndScrollToNode(node.id);
    }, 50);
  };

  // Helper to open a node in Membrane Map view
  const openInMembraneMapView = (node: ExplorerNodePayload): void => {
    detailPanel.hide();
    state.selectedNode = node;
    state.focusedNode = node;
    state.view = "membrane";
    setActiveView("membrane");
    updateUrlState("membrane", node.id);
    schedulePersistNav();
    renderCurrentView();
  };

  // Helper to handle clicks on node links in documentation
  const handleDocNodeClick = (nodeId: string): void => {
    const node = nodesById.get(nodeId);
    if (node) {
      state.focusedNode = node;
      detailPanel.showNode(node);
    }
  };

  const detailPanel = createDetailPanel(nodesById, {
    files,
    onNodeClick: handleDocNodeClick,
    onBundledDocClick: (docPath: string) => {
      // Show the bundled doc in the detail panel
      showBundledDocInDetailPanel(docPath);
    },
    onOpenInCircuitBoard: openInCircuitBoardView,
    onOpenInMembraneMap: openInMembraneMapView,
  });

  // Use imported resolveLinkEndpoint and inferDefaultEntryNodeId from extracted modules

  const testCoverage = buildTestCoverageMap(graphData, resolveLinkEndpoint, nodesById);

  const filterToggleTests = getInputById("filter-toggle-tests");
  const filterToggleAssets = getInputById("filter-toggle-assets");
  const filterToggleRelatedDocs = getInputById("filter-toggle-related-docs");
  const statsLine = document.getElementById("stats-line");

  if (statsLine instanceof HTMLElement) {
    statsLine.textContent = `${graphData.stats.nodes} nodes, ${graphData.stats.links} links, ${graphData.stats.missingDependencies} missing dependencies`;
  }

  const circuitView = createCircuitView({
    state,
    graphData,
    resolveLinkEndpoint,
    onSelectNode: node => handleNodeClick(node),
    onRecenterNode: node => handleNodeDoubleClick(node),
    onOpenLocalView: node => {
      openLocalViewForNode(node);
    },
    testCoverage
  });

  const localView = createLocalView({
    state,
    graphData,
    resolveLinkEndpoint,
    onSelectNode: node => handleNodeClick(node),
    onRecenterNode: node => handleNodeDoubleClick(node),
    onFocusSidebar: node => focusSidebar(node),
    testCoverage,
    nodesById
  });

  const forceGraphView = createForceGraphView({
    state,
    graphData,
    nodesById,
    resolveLinkEndpoint,
    relatedDocLinks,
    onShowBundledDoc: (docPath: string) => {
      showBundledDocInDetailPanel(docPath);
    },
    onFocusNode: (node: ExplorerNodePayload) => {
      state.focusedNode = node;
      detailPanel.showNode(node);
    }
  });

  // The World Map is the outside of every folder when the bundle carries a board.
  const showWorldMap = (): void => {
    detailPanel.hide();
    state.view = "world";
    setActiveView("world");
    updateUrlState("world", null);
    schedulePersistNav();
    renderCurrentView();
  };

  const membraneView = createMembraneView({
    state,
    graphData,
    onSelectNode: node => handleNodeClick(node),
    testCoverage,
    nodesById,
    world: bundle.board ? { open: showWorldMap } : undefined
  });

  // A thing on the World Map opens in the Membrane Map, focused on its folder.
  const openThingInMembraneMap = (thing: { name: string; folder: string }): void => {
    detailPanel.hide();
    state.view = "membrane";
    setActiveView("membrane");
    updateUrlState("membrane", null);
    schedulePersistNav();
    membraneView.focusDirectory(thing.folder);
  };

  const worldMapView = createWorldMapView({
    root: requireElement("world-root"),
    graph: bundle.graph,
    board: bundle.board,
    onOpenFile: (file: string) => {
      const node = nodesById.get(file);
      if (node) {
        openLocalViewForNode(node);
      }
    },
    onOpenThing: openThingInMembraneMap
  });

  syncFilterControls();

  if (filterToggleTests) {
    filterToggleTests.addEventListener("change", event => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      state.filters.showTests = event.target.checked;
      schedulePersistUi();
      renderCurrentView();
    });
  }

  if (filterToggleAssets) {
    filterToggleAssets.addEventListener("change", event => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      state.filters.showAssets = event.target.checked;
      schedulePersistUi();
      renderCurrentView();
    });
  }

  if (filterToggleRelatedDocs) {
    filterToggleRelatedDocs.addEventListener("change", event => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      state.filters.showRelatedDocs = event.target.checked;
      schedulePersistUi();
      // Only re-render Force Graph (Related Docs only affect that view)
      if (state.view === "graph") {
        forceGraphView.render();
      }
    });
  }

  globalWindow.switchView = (event: MouseEvent, viewName: ViewName) => {
    event.preventDefault();
    setActiveView(viewName);
    state.view = viewName;
    updateUrlState(viewName, state.focusedNode?.id ?? state.selectedNode?.id ?? null);
    schedulePersistNav();
    renderCurrentView();
  };

  globalWindow.downloadCurrentDoc = () => {
    detailPanel.downloadCurrentDoc();
  };

  globalWindow.openInLocalView = () => {
    // Prefer focusedNode (sidebar) over selectedNode (center) since user is viewing focused node details
    const target = state.focusedNode ?? state.selectedNode;
    if (!target) {
      return;
    }
    openLocalViewForNode(target);
  };

  globalWindow.openInGraphView = () => {
    // Prefer focusedNode (sidebar) over selectedNode (center) since user is viewing focused node details
    const target = state.focusedNode ?? state.selectedNode;
    if (!target) {
      return;
    }
    // Hide detail panel when navigating to another view
    detailPanel.hide();
    state.selectedNode = target;
    state.view = "graph";
    setActiveView("graph");
    updateUrlState("graph", target.id);
    schedulePersistNav();
    renderCurrentView();
  };

  globalWindow.openInCircuitBoard = () => {
    // Prefer focusedNode (sidebar) over selectedNode (center) since user is viewing focused node details
    const target = state.focusedNode ?? state.selectedNode;
    if (!target) {
      return;
    }
    openInCircuitBoardView(target);
  };

  globalWindow.zoomIn = () => {
    if (state.view === "circuit") {
      circuitView.zoomIn();
      circuitView.drawConnections();
    } else if (state.view === "map") {
      localView.zoomIn();
      localView.drawConnections();
    } else if (state.view === "membrane") {
      membraneView.zoomIn();
    }
  };

  globalWindow.zoomOut = () => {
    if (state.view === "circuit") {
      circuitView.zoomOut();
      circuitView.drawConnections();
    } else if (state.view === "map") {
      localView.zoomOut();
      localView.drawConnections();
    } else if (state.view === "membrane") {
      membraneView.zoomOut();
    }
  };

  globalWindow.resetZoom = () => {
    if (state.view === "circuit") {
      circuitView.resetZoom();
      circuitView.drawConnections();
    } else if (state.view === "map") {
      localView.resetZoom();
      localView.drawConnections();
    } else if (state.view === "membrane") {
      membraneView.resetZoom();
    }
  };

  globalWindow.toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebar-toggle");
    if (sidebar) {
      sidebar.classList.toggle("collapsed");
      if (toggleBtn) {
        toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "▶" : "◀";
      }
    }
  };

  window.addEventListener("resize", () => {
    if (state.view === "circuit") {
      circuitView.drawConnections();
    } else if (state.view === "map") {
      localView.drawConnections();
    }
  });

  // Initialize omnisearch (using imported function)
  initOmnisearch({
    graphData,
    onSelect: node => selectNode(node)
  });

  // ==================
  // PATHFIND STATE
  // ==================

  /** Current path result, if any (prefixed with _ as used only for state tracking) */
  let _currentPathResult: PathfindResult | null = null;

  /** Render the path visualization strip */
  const renderPathVisualization = (result: PathfindResult): void => {
    const pathEl = document.getElementById("pathfind-path");
    const viewMapEl = document.getElementById("view-map");
    if (!pathEl) return;

    // Clear previous path
    pathEl.innerHTML = "";

    if (!result.found || result.path.length === 0) {
      pathEl.hidden = true;
      viewMapEl?.classList.remove("has-path");
      return;
    }

    // Build path visualization
    result.path.forEach((hop, index) => {
      // Add arrow between hops (except before first)
      if (index > 0) {
        const arrow = document.createElement("span");
        arrow.className = "pathfind-path-arrow";
        arrow.textContent = "→";
        pathEl.appendChild(arrow);
      }

      // Create hop element
      const hopEl = document.createElement("div");
      hopEl.className = "pathfind-path-hop";
      
      // Mark endpoints
      if (index === 0 || index === result.path.length - 1) {
        hopEl.classList.add("endpoint");
      }

      // File name
      const nameEl = document.createElement("div");
      nameEl.className = "pathfind-path-hop-name";
      const fileName = hop.node.id.split("/").pop() || hop.node.id;
      nameEl.textContent = fileName;
      nameEl.title = hop.node.id;
      hopEl.appendChild(nameEl);

      // Symbol (if present)
      if (hop.symbol) {
        const symbolEl = document.createElement("div");
        symbolEl.className = "pathfind-path-hop-symbol";
        symbolEl.textContent = `→ ${hop.symbol}`;
        hopEl.appendChild(symbolEl);
      }

      // Click handler to navigate to this node
      hopEl.addEventListener("click", () => {
        handleNodeClick(hop.node);
      });

      pathEl.appendChild(hopEl);
    });

    pathEl.hidden = false;
    viewMapEl?.classList.add("has-path");
  };

  /** Show path result in UI */
  const showPathResult = (result: PathfindResult): void => {
    _currentPathResult = result;
    const statusEl = document.getElementById("pathfind-status");

    if (result.found && result.path.length > 0) {
      // Hide detail panel to avoid blocking the visualization
      detailPanel.hide();

      // Path found - switch to Local Map view centered on first node
      if (state.view !== "map") {
        state.view = "map";
        setActiveView("map");
      }

      // Center on first node in path (suppress detail panel since we just hid it)
      const firstNode = result.path[0].node;
      handleNodeClick(firstNode, { suppressDetailPanel: true });

      // Render the path visualization strip
      renderPathVisualization(result);

      // Build PathResult for path-mode rendering
      // "inbound" direction means TO depends on FROM - the expected/natural flow
      // "outbound" direction means FROM depends on TO - reversed from user intent
      const isReversed = result.direction === "outbound";
      const pathResult: PathResult = {
        nodeIds: result.path.map(hop => hop.nodeId),
        fromSymbol: result.fromEndpoint.symbol,
        toSymbol: result.toEndpoint.symbol,
        isReversed
      };
      
      // Set active path - this triggers path-mode rendering
      // which shows ONLY the path nodes in a linear chain
      localView.setActivePath(pathResult);

      // Update status message with direction context
      const directionHint = isReversed 
        ? ` (FROM depends on TO)` 
        : ` (TO depends on FROM)`;
      if (statusEl) {
        statusEl.textContent = `Path found: ${result.path.length} nodes${directionHint}`;
        statusEl.className = "pathfind-status success";
        statusEl.hidden = false;
      }

      console.log(
        "[Pathfind] Path found:",
        result.path.map(h => h.nodeId).join(" → "),
        `[direction: ${result.direction}]`
      );
    } else {
      // No path found - hide path visualization
      renderPathVisualization(result);

      if (statusEl) {
        const reason = result.maxDepthReached
          ? `No path within 10 hops (searched ${result.searchedNodes} nodes)`
          : `No path exists (searched ${result.searchedNodes} nodes)`;
        statusEl.textContent = reason;
        statusEl.className = "pathfind-status error";
        statusEl.hidden = false;
      }

      console.log(
        "[Pathfind] No path found:",
        result.fromEndpoint.node.id,
        "→",
        result.toEndpoint.node.id,
        result.maxDepthReached ? "(max depth reached)" : ""
      );
    }
  };

  /** Clear path result from UI */
  const clearPathResult = (): void => {
    _currentPathResult = null;
    const statusEl = document.getElementById("pathfind-status");
    if (statusEl) {
      statusEl.hidden = true;
    }
    // Clear path visualization
    const pathEl = document.getElementById("pathfind-path");
    const viewMapEl = document.getElementById("view-map");
    if (pathEl) {
      pathEl.innerHTML = "";
      pathEl.hidden = true;
    }
    viewMapEl?.classList.remove("has-path");
    // Clear path mode and re-render to restore exploration mode layout
    localView.setActivePath(null);
  };

  // Initialize pathfind toolbar (Local Map FROM/TO navigation)
  const pathfindApi = initPathfind(graphData.nodes, {
    onFromChange: (endpoint: PathfindEndpoint | undefined) => {
      console.log("[Pathfind] FROM changed:", endpoint?.node.id, endpoint?.symbol);
      // Update URL state
      updatePathfindUrl({ from: endpoint, to: pathfindApi.state.to });
      // Clear any previous path result when endpoints change
      clearPathResult();
    },
    onToChange: (endpoint: PathfindEndpoint | undefined) => {
      console.log("[Pathfind] TO changed:", endpoint?.node.id, endpoint?.symbol);
      // Update URL state
      updatePathfindUrl({ from: pathfindApi.state.from, to: endpoint });
      // Clear any previous path result when endpoints change
      clearPathResult();
    },
    onFindPath: (from: PathfindEndpoint, to: PathfindEndpoint) => {
      console.log("[Pathfind] Find path:", from.node.id, "→", to.node.id);

      // If FROM and TO are the same node, treat as exploration mode (not path mode)
      if (from.node.id === to.node.id) {
        console.log("[Pathfind] FROM == TO, treating as exploration mode");
        detailPanel.hide();
        localView.setActivePath(null);
        if (state.view !== "map") {
          state.view = "map";
          setActiveView("map");
        }
        selectNode(from.node, { suppressDetailPanel: true });
        // Update status to indicate single-node exploration
        const statusEl = document.getElementById("pathfind-status");
        if (statusEl) {
          statusEl.textContent = `Exploring: ${from.node.name}`;
          statusEl.className = "pathfind-status success";
          statusEl.hidden = false;
        }
        return;
      }

      // Execute BFS pathfinding
      const result = findPath(from.node.id, to.node.id, nodesById, graphData.links);

      // Attach symbol information to result
      if (result.found && result.path.length > 0) {
        // Annotate first hop with from symbol if specified
        if (from.symbol && result.path[0]) {
          result.path[0].symbol = from.symbol;
        }
        // Annotate last hop with to symbol if specified
        if (to.symbol && result.path[result.path.length - 1]) {
          result.path[result.path.length - 1].symbol = to.symbol;
        }
      }

      showPathResult(result);
    },
    onClear: () => {
      console.log("[Pathfind] Cleared");
      // Clear URL state
      updatePathfindUrl({});
      // Clear path result
      clearPathResult();
    }
  });

  // Restore pathfind state from URL if present
  const urlPathfindState = parsePathfindFromUrl(nodesById);
  if (urlPathfindState.from) {
    pathfindApi.setFrom(urlPathfindState.from);
  }
  if (urlPathfindState.to) {
    pathfindApi.setTo(urlPathfindState.to);
  }
  // Auto-execute pathfind if both endpoints are specified in URL
  if (urlPathfindState.from && urlPathfindState.to) {
    // Defer execution to after initial render
    setTimeout(() => pathfindApi.executeFindPath(), 100);
  }

  // Set initial sidebar active state based on parsed URL/config
  setActiveView(state.view);

  // Render initial view
  renderCurrentView();

  // Apply initial focus node if specified (after initial render)
  const urlRequestedNodeId = initialState.hasUrlState ? initialState.nodeId : null;
  const storedOrConfiguredNodeId = !initialState.hasUrlState ? (persistedNav?.nodeId ?? initialState.nodeId) : null;

  const initialFocusNodeId = (() => {
    if (urlRequestedNodeId) {
      return urlRequestedNodeId;
    }
    if (storedOrConfiguredNodeId && nodesById.has(storedOrConfiguredNodeId)) {
      return storedOrConfiguredNodeId;
    }
    return inferDefaultEntryNodeId(graphData, resolveLinkEndpoint, nodesById);
  })();
  if (initialFocusNodeId) {
    const focusNode = nodesById.get(initialFocusNodeId);
    if (focusNode) {
      const focusSource =
        initialState.hasUrlState && initialState.nodeId
          ? "URL"
          : !initialState.hasUrlState && persistedNav?.nodeId && nodesById.has(persistedNav.nodeId)
            ? "localStorage"
            : "heuristic";
      console.log(`Focusing initial node from ${focusSource}: ${initialFocusNodeId}`);
      // Use setTimeout to ensure view is fully rendered before focusing
      setTimeout(() => {
        selectNode(focusNode, { suppressDetailPanel: true });
        // For circuit view, expand the directory and scroll to the node
        if (state.view === "circuit") {
          circuitView.expandAndScrollToNode(focusNode.id);
        }
      }, 100);
    } else {
      console.warn(`Initial focus node not found: ${initialFocusNodeId}`);
    }
  }

  initTuningPanel({
    state,
    onTuningChange: schedulePersistUi,
    onRender: renderCurrentView,
    drawLocalConnections: () => localView.drawConnections(),
    drawMembraneConnections: () => membraneView.redrawConnections(),
  });

  interface SelectNodeOptions {
    /** If true, suppress opening the detail panel */
    suppressDetailPanel?: boolean;
  }

  function selectNode(node: ExplorerNodePayload, options?: SelectNodeOptions): void {
    state.selectedNode = node;
    state.focusedNode = node;
    const contextName = document.getElementById("context-name");
    if (contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
    updateUrlState(state.view, node.id);
    schedulePersistNav();
    renderCurrentView();
    highlightSelectedCards();
    if (!options?.suppressDetailPanel) {
      detailPanel.showNode(node);
    }
  }

  function focusSidebar(node: ExplorerNodePayload, options?: SelectNodeOptions): void {
    state.focusedNode = node;
    const contextName = document.getElementById("context-name");
    if (contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
    updateUrlState(state.view, node.id);
    schedulePersistNav();
    highlightSelectedCards();
    if (!options?.suppressDetailPanel) {
      detailPanel.showNode(node);
    }
  }

  function handleNodeClick(node: ExplorerNodePayload, options?: SelectNodeOptions): void {
    focusSidebar(node, options);
  }

  function handleNodeDoubleClick(node: ExplorerNodePayload, options?: SelectNodeOptions): void {
    selectNode(node, options);
  }

  function highlightSelectedCards(): void {
    circuitView.highlightSelection();
    localView.highlightSelection();
  }

  function openLocalViewForNode(target?: ExplorerNodePayload): void {
    const node = target ?? state.selectedNode;
    if (!node) {
      return;
    }
    // Exit path mode and return to exploration mode
    localView.setActivePath(null);
    clearPathResult();
    // Hide detail panel to avoid blocking the visualization
    detailPanel.hide();
    // Switch to Local Map and select the node (suppress detail panel since we just hid it)
    state.view = "map";
    setActiveView("map");
    selectNode(node, { suppressDetailPanel: true });
    // Populate FROM field with the node and CLEAR TO field (exploration mode)
    pathfindApi.setFrom({ node, symbol: undefined });
    pathfindApi.setTo(undefined);
  }

  function renderCurrentView(): void {
    if (state.view === "sources") {
      doRenderSourcesView();
      return;
    }
    if (state.view === "world") {
      worldMapView.render();
      return;
    }
    if (graphData.nodes.length === 0) {
      return;
    }
    if (state.view === "circuit") {
      circuitView.render();
    } else if (state.view === "map") {
      localView.render();
    } else if (state.view === "graph") {
      forceGraphView.render();
    } else if (state.view === "membrane") {
      membraneView.render();
    }
  }

  const downloadCtx = { files, bundledMarkdown };

  function doRenderSourcesView(): void {
    const canBulkDownload = true;

    renderSourcesView({
      graphData,
      resolveLinkEndpoint,
      nodesById,
      bundledDocs,
      onNavigateToNode: (nodeId: string) => {
        const node = nodesById.get(nodeId);
        if (node) {
          state.view = "map";
          setActiveView("map");
          updateUrlState("map", node.id);
          schedulePersistNav();
          selectNode(node);
        }
      },
      onFocusNode: (nodeId: string) => {
        const node = nodesById.get(nodeId);
        if (node) {
          updateUrlState(state.view, node.id);
          schedulePersistNav();
          selectNode(node);
        }
      },
      onViewBundledDoc: (docPath: string) => {
        showBundledDocInDetailPanel(docPath);
      },
      onDownload: canBulkDownload
        ? (bundleType: DownloadBundleType, format: DownloadFormat) => void downloadDocs(bundleType, format, downloadCtx)
        : undefined
    });
  }

  function showBundledDocInDetailPanel(docPath: string): void {
    const content = bundledMarkdown?.[docPath];
    if (content) {
      detailPanel.showBundledDoc(docPath, content);
    } else {
      console.error(`Failed to load bundled doc: ${docPath}`);
    }
  }

  function syncFilterControls(): void {
    if (filterToggleTests) {
      filterToggleTests.checked = state.filters.showTests;
    }
    if (filterToggleAssets) {
      filterToggleAssets.checked = state.filters.showAssets;
    }
    if (filterToggleRelatedDocs) {
      filterToggleRelatedDocs.checked = state.filters.showRelatedDocs;
    }
  }
}

import { inferDefaultEntryNodeId } from "./bootstrap";
import { createDataLoader } from "./dataLoader";
import { createDetailPanel } from "./detailPanel";
import { setActiveView } from "./dom";
import { downloadDocs, type DownloadBundleType, type DownloadFormat } from "./download";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { buildTestCoverageMap, resolveLinkEndpoint, getInputById } from "./graph-helpers";
import { initOmnisearch } from "./panels/omnisearch";
import { renderSourcesView } from "./panels/sources-view";
import { initTuningPanel } from "./panels/tuning";
import { parseExplorerGraphPayload } from "./parsers";
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
import type { StaticExplorerViewerConfig, BundledMarkdownTreeNode, RelatedDocLink } from "../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerNodePayload
} from "../shared/types";
import type { PathResult } from "./views/localView/state";

declare global {
  interface Window {
    __liveDocsExplorerError?: unknown;
    switchView: (event: MouseEvent, viewName: ViewName) => void;
    openInEditor: () => void;
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
 * Static data bundle shape (when loading from explorer-data.json).
 */
interface StaticBundle {
  graph?: unknown;
  docs?: Record<string, string>;
  bundledMarkdown?: Record<string, string>;
  bundledMarkdownTree?: BundledMarkdownTreeNode;
  relatedDocLinks?: RelatedDocLink[];
  viewerConfig?: StaticExplorerViewerConfig;
}

/**
 * Result from loading explorer data.
 */
interface LoadedExplorerData {
  graphData: ExplorerGraphPayload;
  staticDocs?: Record<string, string>;
  bundledMarkdown?: Record<string, string>;
  bundledMarkdownTree?: BundledMarkdownTreeNode;
  relatedDocLinks?: RelatedDocLink[];
  viewerConfig?: StaticExplorerViewerConfig;
}

/**
 * Bootstrap the explorer, supporting both server mode and static mode.
 * 
 * Static mode detection:
 * 1. Check for inline `<script id="explorer-data">` JSON
 * 2. Check for `?data=<url>` query parameter
 * 3. Check for `./explorer-data.json` file
 * 4. Fall back to server `/graph` endpoint
 */
async function bootstrapExplorer(): Promise<void> {
  try {
    const { graphData, staticDocs, bundledMarkdown, bundledMarkdownTree, relatedDocLinks, viewerConfig } = await loadExplorerData();
    startExplorer(graphData, staticDocs, bundledMarkdown, bundledMarkdownTree, relatedDocLinks, viewerConfig);
  } catch (error) {
    reportFatalExplorerError(error);
  }
}

async function loadExplorerData(): Promise<LoadedExplorerData> {
  // 1. Check for inline data
  const inlineElement = document.getElementById("explorer-data");
  if (inlineElement?.textContent) {
    console.log("Loading explorer data from inline script");
    const staticData = JSON.parse(inlineElement.textContent) as StaticBundle;
    if (staticData.graph) {
      return {
        graphData: parseExplorerGraphPayload(staticData.graph),
        staticDocs: staticData.docs,
        bundledMarkdown: staticData.bundledMarkdown,
        bundledMarkdownTree: staticData.bundledMarkdownTree,
        relatedDocLinks: staticData.relatedDocLinks,
        viewerConfig: staticData.viewerConfig
      };
    }
    return { graphData: parseExplorerGraphPayload(staticData) };
  }

  // 2. Check for data URL parameter
  const params = new URLSearchParams(window.location.search);
  const dataUrl = params.get("data");
  if (dataUrl) {
    console.log(`Loading explorer data from URL: ${dataUrl}`);
    const response = await fetch(dataUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load explorer data from ${dataUrl} (${response.status})`);
    }
    const staticData = (await response.json()) as StaticBundle;
    if (staticData.graph) {
      return {
        graphData: parseExplorerGraphPayload(staticData.graph),
        staticDocs: staticData.docs,
        bundledMarkdown: staticData.bundledMarkdown,
        bundledMarkdownTree: staticData.bundledMarkdownTree,
        relatedDocLinks: staticData.relatedDocLinks,
        viewerConfig: staticData.viewerConfig
      };
    }
    return { graphData: parseExplorerGraphPayload(staticData) };
  }

  // 3. Try static explorer-data.json (for static builds)
  try {
    const staticResponse = await fetch("./explorer-data.json", { cache: "no-store" });
    if (staticResponse.ok) {
      console.log("Loading explorer data from explorer-data.json");
      const staticData = (await staticResponse.json()) as StaticBundle;
      if (staticData.graph) {
        return {
          graphData: parseExplorerGraphPayload(staticData.graph),
          staticDocs: staticData.docs,
          bundledMarkdown: staticData.bundledMarkdown,
          bundledMarkdownTree: staticData.bundledMarkdownTree,
          relatedDocLinks: staticData.relatedDocLinks,
          viewerConfig: staticData.viewerConfig
        };
      }
      return { graphData: parseExplorerGraphPayload(staticData) };
    }
  } catch {
    // Static file not found — no data available
  }

  throw new Error(
    "No explorer data found. Build a static bundle first with `npm run live-docs:visualize`."
  );
}

function startExplorer(
  graphData: ExplorerGraphPayload,
  staticDocs?: Record<string, string>,
  bundledMarkdown?: Record<string, string>,
  bundledMarkdownTree?: BundledMarkdownTreeNode,
  relatedDocLinks?: RelatedDocLink[],
  viewerConfig?: StaticExplorerViewerConfig
): void {
  console.log("Live Docs Explorer graph loaded", graphData);
  
  // Determine if we're in static mode (embedded docs) vs server mode (fetch on demand)
  const isStaticMode = !!staticDocs;
  
  if (staticDocs) {
    console.log(`Static mode: ${Object.keys(staticDocs).length} docs embedded`);
  }
  if (bundledMarkdown) {
    console.log(`Bundled markdown: ${Object.keys(bundledMarkdown).length} referenced files`);
  }
  if (bundledMarkdownTree) {
    console.log("Bundled markdown tree loaded");
  }
  if (viewerConfig) {
    console.log("Viewer config loaded:", viewerConfig);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Data Loader (bundled docs — lazy server fetch or embedded static data)
  // ─────────────────────────────────────────────────────────────────────────

  const dataLoader = createDataLoader({
    isStaticMode,
    bundledMarkdownTree,
    bundledMarkdown,
    relatedDocLinks
  });

  // ─────────────────────────────────────────────────────────────────────────
  // URL + LocalStorage State
  // ─────────────────────────────────────────────────────────────────────────

  const initialState = parseInitialState(viewerConfig ?? null);

  const defaults = { filters: getDefaultFilters(), tuning: getDefaultTuning() };
  const persistedUi = readPersistedUi();
  const initialUi = applyPersistedUi(defaults, persistedUi);

  const persistedNav = initialState.hasUrlState ? null : readPersistedNav();

  const resolveInitialView = (): ViewName => {
    if (initialState.hasUrlState) {
      return initialState.view;
    }
    return persistedNav?.view ?? initialState.view;
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
    // Scroll to the node after render
    setTimeout(() => {
      circuitView.scrollToNode(node.id);
    }, 50);
  };

  // Helper to handle clicks on node links in documentation
  const handleDocNodeClick = (nodeId: string): void => {
    const node = nodesById.get(nodeId);
    if (node) {
      state.focusedNode = node;
      void detailPanel.showNode(node);
    }
  };

  const detailPanel = createDetailPanel(nodesById, {
    staticDocs,
    bundledMarkdown,
    onNodeClick: handleDocNodeClick,
    onBundledDocClick: (docPath: string) => {
      // Show the bundled doc in the detail panel
      void showBundledDocInDetailPanel(docPath);
    },
    onOpenInCircuitBoard: openInCircuitBoardView
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
      void openLocalViewForNode(node);
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
    isStaticMode,
    relatedDocLinks,
    serverBundledDocs: dataLoader.serverBundledDocs,
    onShowBundledDoc: (docPath: string) => {
      void showBundledDocInDetailPanel(docPath);
    },
    onFocusNode: (node: ExplorerNodePayload) => {
      state.focusedNode = node;
      void detailPanel.showNode(node);
    }
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
        // In server mode, ensure bundled docs (including relatedDocLinks) are loaded first
        if (!isStaticMode && event.target.checked && !dataLoader.serverBundledDocs.loaded) {
          void dataLoader.loadServerBundledDocs().then(() => {
            forceGraphView.render();
          });
        } else {
          forceGraphView.render();
        }
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

  globalWindow.openInEditor = () => {
    // Prefer focusedNode (sidebar) over selectedNode (center) since user is viewing focused node details
    const target = state.focusedNode ?? state.selectedNode;
    if (!target) {
      return;
    }
    void fetch(`/open?codePath=${encodeURIComponent(target.codePath)}`);
  };

  globalWindow.downloadCurrentDoc = () => {
    void detailPanel.downloadCurrentDoc();
  };

  globalWindow.openInLocalView = () => {
    // Prefer focusedNode (sidebar) over selectedNode (center) since user is viewing focused node details
    const target = state.focusedNode ?? state.selectedNode;
    if (!target) {
      return;
    }
    void openLocalViewForNode(target);
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
    }
  };

  globalWindow.zoomOut = () => {
    if (state.view === "circuit") {
      circuitView.zoomOut();
      circuitView.drawConnections();
    } else if (state.view === "map") {
      localView.zoomOut();
      localView.drawConnections();
    }
  };

  globalWindow.resetZoom = () => {
    if (state.view === "circuit") {
      circuitView.resetZoom();
      circuitView.drawConnections();
    } else if (state.view === "map") {
      localView.resetZoom();
      localView.drawConnections();
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
    onSelect: node => void selectNode(node)
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
        void handleNodeClick(hop.node);
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
      void handleNodeClick(firstNode, { suppressDetailPanel: true });

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
        void selectNode(from.node, { suppressDetailPanel: true });
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
            : !initialState.hasUrlState && initialState.nodeId && nodesById.has(initialState.nodeId)
              ? "viewerConfig"
              : "heuristic";
      console.log(`Focusing initial node from ${focusSource}: ${initialFocusNodeId}`);
      // Use setTimeout to ensure view is fully rendered before focusing
      setTimeout(() => {
        void selectNode(focusNode);
        // For circuit view, also scroll to the node
        if (state.view === "circuit") {
          circuitView.scrollToNode(focusNode.id);
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
    drawLocalConnections: () => localView.drawConnections()
  });

  interface SelectNodeOptions {
    /** If true, suppress opening the detail panel */
    suppressDetailPanel?: boolean;
  }

  async function selectNode(node: ExplorerNodePayload, options?: SelectNodeOptions): Promise<void> {
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
      await detailPanel.showNode(node);
    }
  }

  async function focusSidebar(node: ExplorerNodePayload, options?: SelectNodeOptions): Promise<void> {
    state.focusedNode = node;
    const contextName = document.getElementById("context-name");
    if (contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
    updateUrlState(state.view, node.id);
    schedulePersistNav();
    highlightSelectedCards();
    if (!options?.suppressDetailPanel) {
      await detailPanel.showNode(node);
    }
  }

  function handleNodeClick(node: ExplorerNodePayload, options?: SelectNodeOptions): void | Promise<void> {
    if (state.tuning.clickBehavior.singleClickFocusOnly) {
      return focusSidebar(node, options);
    }
    return selectNode(node, options);
  }

  function handleNodeDoubleClick(node: ExplorerNodePayload, options?: SelectNodeOptions): void | Promise<void> {
    if (state.tuning.clickBehavior.doubleClickRecenter) {
      return selectNode(node, options);
    }
    return focusSidebar(node, options);
  }

  function highlightSelectedCards(): void {
    circuitView.highlightSelection();
    localView.highlightSelection();
  }

  async function openLocalViewForNode(target?: ExplorerNodePayload): Promise<void> {
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
    await selectNode(node, { suppressDetailPanel: true });
    // Populate FROM field with the node and CLEAR TO field (exploration mode)
    pathfindApi.setFrom({ node, symbol: undefined });
    pathfindApi.setTo(undefined);
  }

  function renderCurrentView(): void {
    if (state.view === "sources") {
      void doRenderSourcesView();
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
    }
  }

  const downloadCtx = {
    graphData,
    isStaticMode,
    staticDocs,
    bundledMarkdown,
    dataLoader
  };

  async function doRenderSourcesView(): Promise<void> {
    const canBulkDownload = true;
    const bundledDocsData = await dataLoader.loadServerBundledDocs();

    renderSourcesView({
      graphData,
      viewerConfig: viewerConfig ?? null,
      staticDocs: staticDocs ? new Map(Object.entries(staticDocs)) : undefined,
      resolveLinkEndpoint,
      nodesById,
      bundledDocs: bundledDocsData,
      onNavigateToNode: (nodeId: string) => {
        const node = nodesById.get(nodeId);
        if (node) {
          state.view = "map";
          setActiveView("map");
          updateUrlState("map", node.id);
          schedulePersistNav();
          void selectNode(node);
        }
      },
      onFocusNode: (nodeId: string) => {
        const node = nodesById.get(nodeId);
        if (node) {
          updateUrlState(state.view, node.id);
          schedulePersistNav();
          void selectNode(node);
        }
      },
      onViewBundledDoc: (docPath: string) => {
        void showBundledDocInDetailPanel(docPath);
      },
      onDownload: canBulkDownload
        ? (bundleType: DownloadBundleType, format: DownloadFormat) => void downloadDocs(bundleType, format, downloadCtx)
        : undefined
    });
  }

  async function showBundledDocInDetailPanel(docPath: string): Promise<void> {
    const content = await dataLoader.fetchBundledDocContent(docPath);
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

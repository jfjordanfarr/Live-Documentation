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
  pathfindHref,
  referencesAgainstPath,
  updatePathfindUrl,
  type PathHop,
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
import { readUrlState, scrubSnapshot, writeUrlState } from "./persistence/compressed-url-state";
import { canGoBack, canGoForward, onHistoryChange, startHistory } from "./persistence/history";
import { placeOf } from "./persistence/place";
import type { ExplorerState, ViewName } from "./types";
import { createCircuitView } from "./views/circuitView";
import { createForceGraphView } from "./views/forceGraphView";
import { createLocalView } from "./views/localView";
import { createMembraneView } from "./views/membraneView";
import { animatePerspective, captureLocalScene, holdPerspective } from "./views/perspectiveTransition";
import { createWorldMapView } from "./views/worldMap";
import { explorerGraphOf } from "../shared/graph";
import type { StaticExplorerData } from "../shared/staticExplorerData";
import type { ExplorerNodePayload } from "../shared/types";

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
  // The pins and the opened directories ride the address together; `?dir=` names an opened directory on its own.
  const initialExploration = scrubSnapshot({ ...readUrlState(), openDirectories: initialState.openDirectories }, nodesById);
  state.pins = initialExploration.pinSet;
  state.openDirectories = initialExploration.openDirectories;

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
    onExplorationChange: persistExploration,
    onZoomOut: () => changePerspective("graph"),
    onZoomBoundary: active => showZoomBoundary(active ? "Scroll again for 3D" : ""),
    graphData,
    resolveLinkEndpoint,
    onSelectNode: node => handleNodeClick(node),
    onRecenterNode: node => handleNodeDoubleClick(node),
    onFocusSidebar: node => focusSidebar(node),
    testCoverage,
    nodesById
  });

  const forceGraphView = createForceGraphView({
    onZoomIn: () => changePerspective("map", state.focusedNode ?? state.selectedNode, true),
    onZoomBoundary: active => showZoomBoundary(active ? "Scroll again for 2D" : ""),
    getPath: () => localView.getActivePath()?.nodeIds,
    state,
    graphData,
    nodesById,
    resolveLinkEndpoint,
    relatedDocLinks,
    onShowBundledDoc: (docPath: string) => {
      showBundledDocInDetailPanel(docPath);
    },
    onFocusNode: (node: ExplorerNodePayload) => {
      selectNode(node);
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

  const perspectiveControls = document.createElement("div");
  perspectiveControls.className = "perspective-controls";
  perspectiveControls.setAttribute("aria-label", "File perspective");
  const mapButton = document.createElement("button");
  mapButton.textContent = "Local Map · 2D";
  mapButton.addEventListener("click", () => changePerspective("map"));
  const graphButton = document.createElement("button");
  graphButton.textContent = "Force Graph · 3D";
  graphButton.addEventListener("click", () => changePerspective("graph"));
  const clearPinsButton = document.createElement("button");
  clearPinsButton.title = "Clear exploration pins";
  clearPinsButton.setAttribute("aria-label", "Clear exploration pins");
  clearPinsButton.addEventListener("click", () => { state.pins = { entries: [] }; persistExploration(); renderCurrentView(); });
  const zoomBoundary = document.createElement("span");
  zoomBoundary.className = "zoom-boundary";
  zoomBoundary.setAttribute("role", "status");
  function showZoomBoundary(text: string): void { zoomBoundary.textContent = text; zoomBoundary.hidden = !text; }
  showZoomBoundary("");
  const perspectivePath = document.createElement("span");
  perspectivePath.className = "perspective-path-status";
  // The Local Map says when its layout is strained, so a person can choose the Force Graph; the threshold is in Tuning.
  const perspectiveStrain = document.createElement("span");
  perspectiveStrain.className = "perspective-strain";
  perspectiveStrain.setAttribute("role", "status");
  perspectiveStrain.textContent = "Dense picture: the Force Graph may read better";
  perspectiveControls.append(zoomBoundary, perspectivePath, perspectiveStrain, mapButton, graphButton, clearPinsButton);
  requireElement("main").append(perspectiveControls);

  function syncPerspectiveControls(): void {
    perspectiveControls.hidden = state.view !== "map" && state.view !== "graph";
    mapButton.setAttribute("aria-pressed", String(state.view === "map"));
    graphButton.setAttribute("aria-pressed", String(state.view === "graph"));
    const path = localView.getActivePath();
    perspectivePath.textContent = path ? `Path: ${path.nodeIds.length} files` : "";
    perspectivePath.hidden = !path;
    const strain = state.view === "map" ? localView.getStrain() : null;
    const dense = !!strain && strain.threaded + strain.back >= state.tuning.localMap.strainNudge;
    perspectiveStrain.hidden = !dense;
    if (strain) {
      perspectiveStrain.title = `${strain.threaded} ${strain.threaded === 1 ? "reference skips" : "references skip"} columns and ${strain.back} ${strain.back === 1 ? "reads" : "read"} against them, across ${strain.columns} columns. Tuning sets the threshold.`;
    }
    const count = state.pins?.entries.length ?? 0;
    clearPinsButton.hidden = count === 0;
    clearPinsButton.textContent = `${count} ${count === 1 ? "pin" : "pins"} ×`;
  }

  let changingPerspective = false;
  let pendingPerspective: (() => void) | null = null;
  let perspectiveEpoch = 0;
  let transitionDestination: ViewName | null = null;
  let releasePerspectiveCover = (): void => {};
  let cancelPerspectiveAnimation = (): void => {};

  /** Change file perspective around the identity the person was last inspecting. */
  function changePerspective(view: "map" | "graph", target = state.focusedNode ?? state.selectedNode, approaching = false): void {
    if (changingPerspective) { pendingPerspective = () => changePerspective(view, target, approaching); return; }
    if (state.view === view && target?.id === state.selectedNode?.id) return;
    showZoomBoundary("");
    const epoch = ++perspectiveEpoch;
    transitionDestination = view;
    const previousView = state.view;
    const sourceCards = previousView === "map" ? captureLocalScene(requireElement("view-map")) : null;
    const sourceGraph = previousView === "graph" ? forceGraphView.captureScene() : null;
    const releaseCover = (previousView === "map" || previousView === "graph") && target
      ? holdPerspective(requireElement(`view-${previousView}`)) : () => {};
    releasePerspectiveCover = releaseCover;
    changingPerspective = true;
    mapButton.disabled = graphButton.disabled = true;
    const source = state.view === "map" ? localView : state.view === "graph" ? forceGraphView : null;
    let anchor = target && source ? source.getSubjectAnchor(target.id) : null;
    detailPanel.hide();
    state.selectedNode = target;
    state.focusedNode = target;
    state.view = view;
    setActiveView(view);
    updateUrlState(view, target?.id ?? null);
    schedulePersistNav();
    renderCurrentView();
    if (approaching && view === "map") localView.ensureReadable();
    if (target && anchor) {
      const viewport = requireElement(`view-${view}`).getBoundingClientRect();
      // Off-screen subjects cannot provide a visible continuity anchor.
      if (anchor.x >= viewport.left && anchor.x <= viewport.right && anchor.y >= viewport.top && anchor.y <= viewport.bottom) {
        (view === "map" ? localView : forceGraphView).placeSubjectAnchor(target.id, anchor);
      } else anchor = null;
    }
    const ready = view === "graph" ? forceGraphView.whenReady() : Promise.resolve();
    void ready.then(() => {
      if (epoch !== perspectiveEpoch) { releaseCover(); return; }
      if (target && anchor) (view === "map" ? localView : forceGraphView).placeSubjectAnchor(target.id, anchor);
      if (target && (previousView === "map" || previousView === "graph")) {
        const cards = view === "graph" ? sourceCards! : captureLocalScene(requireElement("view-map"));
        const graph = view === "graph" ? forceGraphView.captureScene() : sourceGraph!;
        forceGraphView.setActive(false);
        changingPerspective = true;
        mapButton.disabled = graphButton.disabled = true;
        cancelPerspectiveAnimation = animatePerspective(cards, graph, view === "graph", target.id, requireElement(`view-${view}`).getBoundingClientRect(), () => {
          if (epoch !== perspectiveEpoch) return;
          transitionDestination = null;
          changingPerspective = false;
          mapButton.disabled = graphButton.disabled = false;
          forceGraphView.setActive(state.view === "graph");
          const pending = pendingPerspective; pendingPerspective = null; pending?.();
        });
      } else {
        changingPerspective = false;
        mapButton.disabled = graphButton.disabled = false;
      }
      releaseCover();
    });
    highlightSelectedCards();
  }

  globalWindow.switchView = (event: MouseEvent, viewName: ViewName) => {
    event.preventDefault();
    if (viewName === "map" || viewName === "graph") { changePerspective(viewName); return; }
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

  globalWindow.openInGraphView = () => changePerspective("graph");

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

  /** Render the path visualization strip; an empty path hides it. */
  const renderPathVisualization = (path: PathHop[]): void => {
    const pathEl = document.getElementById("pathfind-path");
    const viewMapEl = document.getElementById("view-map");
    if (!pathEl) return;

    // Clear previous path
    pathEl.innerHTML = "";

    if (path.length === 0) {
      pathEl.hidden = true;
      viewMapEl?.classList.remove("has-path");
      return;
    }

    // Build path visualization
    path.forEach((hop, index) => {
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
      if (index === 0 || index === path.length - 1) {
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

  /** Writes the pathfinder's status line; `tone` colours it. */
  const setPathStatus = (text: string, tone: "" | "success" | "error"): HTMLElement | null => {
    const statusEl = document.getElementById("pathfind-status");
    if (!statusEl) return null;
    statusEl.textContent = text;
    statusEl.className = tone ? `pathfind-status ${tone}` : "pathfind-status";
    statusEl.hidden = false;
    return statusEl;
  };

  /**
   * Shows what the search found. The Local Map draws a path only in its reading
   * direction, FROM offering on the left and TO using on the right. When the
   * files connect only the other way, nothing is drawn: the status says so and
   * offers the reverse question as a link, the owner's rule of 2025-12-18.
   */
  const showPathResult = (result: PathfindResult): void => {
    const fromName = result.fromEndpoint.node.name;
    const toName = result.toEndpoint.node.name;

    if (result.path.length > 0) {
      // Hide detail panel to avoid blocking the visualization
      detailPanel.hide();

      // Path found - switch to Local Map view centered on first node
      if (state.view !== "map") {
        state.view = "map";
        setActiveView("map");
      }

      // Path mode draws over a selected file; when none is selected yet, the
      // path's first file becomes it. An existing selection is kept, so Clear
      // returns to the place the person was, address included.
      if (!state.selectedNode) {
        selectNode(result.path[0].node, { suppressDetailPanel: true });
      }

      renderPathVisualization(result.path);

      const nodeIds = result.path.map(hop => hop.nodeId);
      localView.setActivePath({
        nodeIds,
        fromSymbol: result.fromEndpoint.symbol,
        toSymbol: result.toEndpoint.symbol
      });

      const against = referencesAgainstPath(nodeIds, graphData.links);
      const notDrawn = against === 0
        ? ""
        : `; ${against} ${against === 1 ? "reference" : "references"} between these files ${against === 1 ? "runs" : "run"} the other way and ${against === 1 ? "is" : "are"} not drawn`;
      setPathStatus(`Path found: ${result.path.length} files${notDrawn}`, "success");
      return;
    }

    renderPathVisualization([]);

    if (result.reversePath.length > 0) {
      const statusEl = setPathStatus(
        `No path runs from ${fromName} to ${toName}. ${toName} reaches ${fromName} through ${result.reversePath.length} files: `,
        ""
      );
      if (statusEl) {
        const reverse = document.createElement("a");
        reverse.href = pathfindHref({ from: result.toEndpoint, to: result.fromEndpoint });
        reverse.textContent = `show ${toName} to ${fromName}`;
        reverse.addEventListener("click", event => {
          event.preventDefault();
          pathfindApi.swap();
        });
        statusEl.appendChild(reverse);
      }
      return;
    }

    setPathStatus(
      result.maxDepthReached
        ? `No path within ${Math.max(0, nodesById.size - 1)} hops either way (searched ${result.searchedNodes} files)`
        : `No path either way (searched ${result.searchedNodes} files)`,
      "error"
    );
  };

  /** Clear path result from UI */
  const clearPathResult = (): void => {
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
        setPathStatus(`Exploring: ${from.node.name}`, "success");
        return;
      }

      // Execute BFS pathfinding
      const result = findPath(from.node.id, to.node.id, nodesById, graphData.links);

      // Attach symbol information to result
      if (result.path.length > 0) {
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

  // The node to focus first, chosen before the first drawing so that the page draws the focused picture once, rather
  // than a default picture and then the focused one.
  const urlRequestedNodeId = initialState.hasUrlState ? initialState.nodeId : null;
  const storedOrConfiguredNodeId = !initialState.hasUrlState ? (persistedNav?.nodeId ?? initialState.nodeId) : null;
  // An address that opens a directory and names no file is the door into that directory: nothing is put in focus for it.
  const enteredByDirectory = initialState.hasUrlState && !initialState.nodeId && state.openDirectories.size > 0;

  const initialFocusNodeId = (() => {
    if (enteredByDirectory) {
      return null;
    }
    if (urlRequestedNodeId) {
      return urlRequestedNodeId;
    }
    if (storedOrConfiguredNodeId && nodesById.has(storedOrConfiguredNodeId)) {
      return storedOrConfiguredNodeId;
    }
    return inferDefaultEntryNodeId(graphData, resolveLinkEndpoint, nodesById);
  })();
  const focusNode = initialFocusNodeId ? nodesById.get(initialFocusNodeId) : undefined;
  if (focusNode) {
    const focusSource =
      initialState.hasUrlState && initialState.nodeId
        ? "URL"
        : !initialState.hasUrlState && persistedNav?.nodeId && nodesById.has(persistedNav.nodeId)
          ? "localStorage"
          : "heuristic";
    console.log(`Focusing initial node from ${focusSource}: ${initialFocusNodeId}`);
    markSelected(focusNode);
  } else if (initialFocusNodeId) {
    console.warn(`Initial focus node not found: ${initialFocusNodeId}`);
  }

  // Set initial sidebar active state based on parsed URL/config
  setActiveView(state.view);

  // Render initial view
  renderCurrentView();

  if (focusNode) {
    // The selected cards are marked once the view has settled; the Circuit Board also opens the node's directory.
    setTimeout(() => {
      highlightSelectedCards();
      if (state.view === "circuit") {
        circuitView.expandAndScrollToNode(focusNode.id);
      }
    }, 100);
  }

  initTuningPanel({
    state,
    onTuningChange: schedulePersistUi,
    onRender: renderCurrentView,
    drawLocalConnections: () => localView.drawConnections(),
    drawMembraneConnections: () => membraneView.redrawConnections(),
  });

  // Back and Forward: a move to another place is an entry, and landing on one shows the place its address names.
  startHistory({ placeOf, restore: restoreFromUrl });
  const backButton = document.getElementById("history-back");
  const forwardButton = document.getElementById("history-forward");
  const syncHistoryButtons = (): void => {
    if (backButton instanceof HTMLButtonElement) {
      backButton.disabled = !canGoBack();
    }
    if (forwardButton instanceof HTMLButtonElement) {
      forwardButton.disabled = !canGoForward();
    }
  };
  onHistoryChange(syncHistoryButtons);
  syncHistoryButtons();
  backButton?.addEventListener("click", () => window.history.back());
  forwardButton?.addEventListener("click", () => window.history.forward());

  /** Shows the place the address names, after Back or Forward; the history turns any write it makes into a rewrite of that entry. */
  function restoreFromUrl(): void {
    const place = parseInitialState();
    const view: ViewName = place.hasUrlState ? place.view : bundle.board ? "world" : place.view;
    detailPanel.hide();
    state.view = view;
    const exploration = scrubSnapshot({ ...readUrlState(), openDirectories: place.openDirectories }, nodesById);
    state.pins = exploration.pinSet;
    state.openDirectories = exploration.openDirectories;
    setActiveView(view);
    const node = place.nodeId ? nodesById.get(place.nodeId) ?? null : null;
    state.selectedNode = node;
    state.focusedNode = node;
    const contextName = document.getElementById("context-name");
    if (node && contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
    const path = parsePathfindFromUrl(nodesById);
    pathfindApi.setFrom(path.from);
    pathfindApi.setTo(path.to);
    if (view === "membrane") {
      membraneView.applySnapshot(scrubSnapshot(readUrlState(), nodesById));
    } else {
      renderCurrentView();
    }
    if (path.from && path.to) {
      pathfindApi.executeFindPath();
    }
    highlightSelectedCards();
  }

  interface SelectNodeOptions {
    /** If true, suppress opening the detail panel */
    suppressDetailPanel?: boolean;
  }

  /** The node the person is looking at: the state, the context name, the address and the stored place, without drawing. */
  function markSelected(node: ExplorerNodePayload): void {
    state.selectedNode = node;
    state.focusedNode = node;
    const contextName = document.getElementById("context-name");
    if (contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
    updateUrlState(state.view, node.id);
    schedulePersistNav();
  }

  function selectNode(node: ExplorerNodePayload, options?: SelectNodeOptions): void {
    markSelected(node);
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
    changePerspective("map", node);
    // Populate FROM field with the node and CLEAR TO field (exploration mode)
    pathfindApi.setFrom({ node, symbol: undefined });
    pathfindApi.setTo(undefined);
  }

  /** Keep independent branches in the same portable snapshot as selection and filters. */
  function persistExploration(leavingPath = false): void {
    if (leavingPath) clearPathResult();
    syncPerspectiveControls();
    const contextName = document.getElementById("context-name");
    if (contextName) contextName.textContent = state.selectedNode?.codeRelativePath ?? "None";
    writeUrlState({ ...readUrlState(), view: state.view, selectedNodeId: state.selectedNode?.id ?? null,
      pinSet: state.pins!, openDirectories: state.openDirectories ?? new Set(), filters: state.filters }, { preservePath: !leavingPath });
  }

  function renderCurrentView(): void {
    // History and navigation can interrupt an animated perspective change.
    if (changingPerspective && state.view !== transitionDestination) {
      perspectiveEpoch++;
      releasePerspectiveCover(); cancelPerspectiveAnimation();
      changingPerspective = false; pendingPerspective = null; transitionDestination = null;
      mapButton.disabled = graphButton.disabled = false;
      showZoomBoundary("");
    }
    syncPerspectiveControls();
    forceGraphView.setActive(state.view === "graph");
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
      // The strain of the picture just drawn decides the nudge.
      syncPerspectiveControls();
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

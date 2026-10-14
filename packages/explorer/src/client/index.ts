import { inferDefaultEntryNodeId } from "./bootstrap";
import { createDetailPanel } from "./detailPanel";
import { requireElement, setActiveView } from "./dom";
import { downloadDocs, downloadFactsJson, type DownloadBundleType, type DownloadFormat } from "./download";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { buildTestCoverageMap, resolveLinkEndpoint, getInputById } from "./graph-helpers";
import { applyLayoutSettings, layoutPresetOf, layoutSettingsOf } from "./layout-presets";
import { iconButton } from "./panels/icon-button";
import { initOmnisearch } from "./panels/omnisearch";
import { createPinTray } from "./panels/pin-tray";
import { sourcesFacts } from "./panels/sources-facts";
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
import type { ExplorerState, LocalMapPerspective, ViewName } from "./types";
import { createForceGraphView } from "./views/forceGraphView";
import { createLocalView } from "./views/localView";
import { explorerGraphOf } from "../shared/graph";
import type { StaticExplorerData } from "../shared/staticExplorerData";
import type { ExplorerNodePayload } from "../shared/types";
import { under } from "./views/localView/directory-state";
import { animatePerspective, captureLocalScene, holdPerspective } from "./views/perspectiveTransition";
import { EMPTY_PIN_SET } from "./views/pin-state";
import { clearRetainedDirectory, reconcileRetained, releaseRetained, subjectAfterRelease, type RetainedItem, type RetainedState } from "./views/retained-state";
import { createWorldMapView } from "./views/worldMap";

declare global {
  interface Window {
    __liveDocsExplorerError?: unknown;
    switchView: (event: MouseEvent, viewName: ViewName) => void;
    openInLocalView: () => void;
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

  const savedNav = readPersistedNav();
  const persistedNav = initialState.hasUrlState ? null : savedNav;

  const resolveInitialView = (): ViewName => {
    if (initialState.hasUrlState) {
      return initialState.view;
    }
    // A bundle that carries a board opens on the World Map, the outside of everything.
    return persistedNav?.view ?? (bundle.board ? "world" : initialState.view);
  };

  const state: ExplorerState = {
    view: resolveInitialView(),
    perspective: initialState.perspective ?? savedNav?.perspective ?? "2d",
    selectedNode: null,
    focusedNode: null,
    filters: initialUi.filters,
    tuning: applyLayoutSettings(initialUi.tuning, readUrlState().layout)
  };

  const persistUi = createPersistUiScheduler(() => ({
    filters: state.filters,
    tuning: state.tuning
  }));
  const schedulePersistUi = persistUi.schedule;

  const nodesById = new Map(graphData.nodes.map(node => [node.id, node]));
  // The pins and the opened directories ride the address together; `?dir=` names an opened directory on its own.
  const initialExploration = scrubSnapshot({ ...readUrlState(), openDirectories: initialState.hasUrlState
    ? initialState.openDirectories : new Set(persistedNav?.openDirectories ?? []) }, nodesById);
  if (new URLSearchParams(window.location.search).has("s")) state.filters = { ...state.filters, ...initialExploration.filters };
  state.pins = initialExploration.pinSet;
  state.openDirectories = initialExploration.openDirectories;
  state.retentionOrder = initialExploration.retentionOrder;

  const persistNav = createPersistNavScheduler(() => ({
    view: state.view,
    perspective: state.perspective,
    openDirectories: state.openDirectories ?? new Set(),
    focusedNodeId: state.focusedNode?.id ?? null,
    selectedNodeId: state.selectedNode?.id ?? null
  }));
  const schedulePersistNav = persistNav.schedule;

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
  });

  // Use imported resolveLinkEndpoint and inferDefaultEntryNodeId from extracted modules

  const testCoverage = buildTestCoverageMap(graphData, resolveLinkEndpoint, nodesById);

  const filterToggleTests = getInputById("filter-toggle-tests");
  const filterToggleAssets = getInputById("filter-toggle-assets");
  const filterToggleRelatedDocs = getInputById("filter-toggle-related-docs");
  const filterToggleDirectories = getInputById("filter-toggle-directories");
  const filterToggleDirectoryLinks = getInputById("filter-toggle-directory-links");
  const statsLine = document.getElementById("stats-line");

  if (statsLine instanceof HTMLElement) {
    statsLine.textContent = `${graphData.stats.nodes} files, ${graphData.stats.links} references, ${graphData.stats.missingDependencies} missing dependencies`;
  }

  const localView = createLocalView({
    state,
    onExplorationChange: leavingPath => {
      persistExploration(leavingPath);
      if (state.perspective === "3d") forceGraphView.render();
    },
    graphData,
    resolveLinkEndpoint,
    onSelectNode: node => handleNodeClick(node),
    onRecenterNode: node => handleNodeDoubleClick(node),
    onFocusSidebar: node => focusSidebar(node),
    testCoverage,
    nodesById
  });

  const forceGraphView = createForceGraphView({
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
    },
    onRetainNode: node => localView.retainNode(node.id),
    onOpenDirectory: directory => {
      localView.openDirectory(directory);
      forceGraphView.focusDirectory(directory);
    }
  });

  // Opening a thing is a new Local Map scope, rendered in the remembered representation.
  const openThingInLocalMap = (thing: { name: string; folder: string }): void => {
    clearPathResult();
    pathfindApi.setFrom(undefined);
    pathfindApi.setTo(undefined);
    state.pins = { entries: [] };
    state.openDirectories = new Set([thing.folder]);
    state.selectedNode = state.focusedNode = null;
    changePerspective(state.perspective, null);
    persistExploration();
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
    onOpenThing: openThingInLocalMap
  });

  syncFilterControls();

  if (filterToggleTests) {
    filterToggleTests.addEventListener("change", event => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      state.filters.showTests = event.target.checked;
      schedulePersistUi();
      persistExploration();
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
      persistExploration();
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
      persistExploration();
      // Only re-render Force Graph (Related Docs only affect that view)
      if (state.view === "map" && state.perspective === "3d") {
        forceGraphView.render();
      }
    });
  }

  for (const [input, key] of [
    [filterToggleDirectories, "showDirectories"],
    [filterToggleDirectoryLinks, "showDirectoryLinks"]
  ] as const) {
    input?.addEventListener("change", () => {
      state.filters[key] = input.checked;
      syncFilterControls();
      schedulePersistUi();
      persistExploration();
      if (state.view === "map" && state.perspective === "3d") forceGraphView.render();
    });
  }

  const perspectiveControls = document.createElement("div");
  perspectiveControls.className = "perspective-controls";
  perspectiveControls.setAttribute("aria-label", "Local Map layout and representation");
  const compactButton = iconButton("Compact", '<rect x="6" y="6" width="5" height="5" rx="1"/><rect x="13" y="6" width="5" height="5" rx="1"/><rect x="6" y="13" width="5" height="5" rx="1"/><rect x="13" y="13" width="5" height="5" rx="1"/>');
  compactButton.dataset.layoutPreset = "compact";
  const relaxedButton = iconButton("Relaxed", '<rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><rect x="16" y="16" width="5" height="5" rx="1"/>');
  relaxedButton.dataset.layoutPreset = "relaxed";
  const tuningButton = iconButton("Layout tuning", '<path d="M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6M10 15v6"/>');
  tuningButton.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.remove("collapsed");
    const tuning = document.querySelector<HTMLDetailsElement>(".sidebar-details");
    if (tuning) {
      tuning.open = true;
      tuning.querySelector<HTMLElement>("summary")?.focus();
      tuning.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
  const mapButton = document.createElement("button");
  mapButton.textContent = "2D";
  mapButton.title = "Local Map in 2D";
  mapButton.addEventListener("click", () => changePerspective("2d"));
  const graphButton = document.createElement("button");
  graphButton.textContent = "3D";
  graphButton.title = "Local Map in 3D";
  graphButton.addEventListener("click", () => changePerspective("3d"));
  const perspectivePath = document.createElement("span");
  perspectivePath.className = "perspective-path-status";
  perspectiveControls.append(perspectivePath, compactButton, relaxedButton, tuningButton, mapButton, graphButton);
  requireElement("main").append(perspectiveControls);
  const pinTray = createPinTray({
    parent: requireElement("main"),
    nodes: nodesById,
    onRelease: item => applyRetentionChange(releaseRetained(retentionState(), item)),
    onClearDirectory: directory => applyRetentionChange(
      clearRetainedDirectory(retentionState(), directory),
      !!state.selectedNode && under(state.selectedNode.id, directory)
    ),
    onClear: () => applyRetentionChange({ pins: EMPTY_PIN_SET, openDirectories: new Set(), retentionOrder: [] }, true),
    onFocus: focusRetained
  });
  let syncTuningControls = (): void => {};

  function retentionState(): RetainedState {
    return { pins: state.pins ?? EMPTY_PIN_SET, openDirectories: state.openDirectories ?? new Set(), retentionOrder: state.retentionOrder };
  }

  function applyRetentionChange(next: RetainedState, releaseSubject = false): void {
    const current = state.selectedNode;
    const selectedId = subjectAfterRelease(state.pins ?? EMPTY_PIN_SET, next.pins, current?.id ?? null, releaseSubject);
    const selected = selectedId ? nodesById.get(selectedId) ?? null : null;
    const inspected = state.focusedNode;
    const focused = inspected && (inspected.id === selected?.id
      || next.pins.entries.some(pin => pin.nodeId === inspected.id)) ? inspected : selected;
    const view = state.perspective === "2d" ? localView : forceGraphView;
    const anchor = focused ? view.getSubjectAnchor(focused.id) : null;
    Object.assign(state, next);
    state.selectedNode = selected;
    state.focusedNode = focused;
    persistExploration(!!localView.getActivePath());
    renderCurrentView();
    if (focused && anchor) view.placeSubjectAnchor(focused.id, anchor);
  }

  function focusRetained(item: RetainedItem): void {
    detailPanel.hide();
    if (item.kind === "directory") {
      (state.perspective === "2d" ? localView : forceGraphView).focusDirectory(item.directory);
      return;
    }
    const node = nodesById.get(item.pin.nodeId);
    if (!node) return;
    state.focusedNode = node;
    if (state.perspective === "2d") localView.focusNode(node.id);
    else forceGraphView.render();
  }

  function syncPerspectiveControls(): void {
    const contextName = document.getElementById("context-name");
    if (contextName) contextName.textContent = (state.focusedNode ?? state.selectedNode)?.codeRelativePath
      ?? ([...(state.openDirectories ?? [])].map(path => path || "Scan root").join(", ") || "Scan root");
    perspectiveControls.hidden = state.view !== "map";
    const preset = layoutPresetOf(state.tuning);
    for (const button of [compactButton, relaxedButton, tuningButton, mapButton, graphButton]) button.disabled = changingPerspective;
    compactButton.setAttribute("aria-pressed", String(preset === "compact"));
    relaxedButton.setAttribute("aria-pressed", String(preset === "relaxed"));
    tuningButton.classList.toggle("custom-layout", preset === "custom");
    tuningButton.title = preset === "custom" ? "Custom layout — open tuning" : "Layout tuning";
    tuningButton.setAttribute("aria-label", preset === "custom" ? "Layout tuning: Custom" : "Layout tuning");
    mapButton.setAttribute("aria-pressed", String(state.perspective === "2d"));
    graphButton.setAttribute("aria-pressed", String(state.perspective === "3d"));
    const path = localView.getActivePath();
    perspectivePath.textContent = path ? `Path: ${path.nodeIds.length} files` : "";
    perspectivePath.hidden = !path;
    state.retentionOrder = reconcileRetained(retentionState()).retentionOrder;
    pinTray.sync(retentionState(), state.view === "map", changingPerspective);
  }

  let changingPerspective = false;
  let pendingPerspective: (() => void) | null = null;
  let perspectiveEpoch = 0;
  let transitionDestination: LocalMapPerspective | null = null;
  let releasePerspectiveCover = (): void => {};
  let cancelPerspectiveAnimation = (): void => {};

  /** Change Local Map representation around the identity the person was last inspecting. */
  function changePerspective(perspective: LocalMapPerspective, target = state.focusedNode ?? state.selectedNode): void {
    if (changingPerspective) { pendingPerspective = () => changePerspective(perspective, target); return; }
    if (state.view === "map" && state.perspective === perspective && target?.id === state.selectedNode?.id) return;
    const epoch = ++perspectiveEpoch;
    transitionDestination = perspective;
    const previous = state.view === "map" ? state.perspective : null;
    const destination = perspective === "2d" ? "map" : "graph";
    const sourceSurface = previous === "2d" ? "map" : "graph";
    const sourceCards = previous === "2d" ? captureLocalScene(requireElement("view-map")) : null;
    const sourceGraph = previous === "3d" ? forceGraphView.captureScene() : null;
    const releaseCover = previous && target ? holdPerspective(requireElement(`view-${sourceSurface}`)) : () => {};
    releasePerspectiveCover = releaseCover;
    changingPerspective = true;
    syncPerspectiveControls();
    const source = previous === "2d" ? localView : previous === "3d" ? forceGraphView : null;
    let anchor = target && source ? source.getSubjectAnchor(target.id) : null;
    detailPanel.hide();
    state.selectedNode = target;
    state.focusedNode = target;
    state.view = "map";
    state.perspective = perspective;
    setActiveView(state.view, perspective);
    updateUrlState(state.view, target?.id ?? null, perspective);
    schedulePersistNav();
    renderCurrentView();
    if (target && anchor) {
      const viewport = requireElement(`view-${destination}`).getBoundingClientRect();
      if (anchor.x >= viewport.left && anchor.x <= viewport.right && anchor.y >= viewport.top && anchor.y <= viewport.bottom) {
        (perspective === "2d" ? localView : forceGraphView).placeSubjectAnchor(target.id, anchor);
      } else anchor = null;
    }
    const ready = perspective === "3d" ? forceGraphView.whenReady() : Promise.resolve();
    void ready.then(() => {
      if (epoch !== perspectiveEpoch) { releaseCover(); return; }
      if (target && anchor) (perspective === "2d" ? localView : forceGraphView).placeSubjectAnchor(target.id, anchor);
      if (target && previous && previous !== perspective) {
        const cards = perspective === "3d" ? sourceCards! : captureLocalScene(requireElement("view-map"));
        const graph = perspective === "3d" ? forceGraphView.captureScene() : sourceGraph!;
        forceGraphView.setActive(false);
        cancelPerspectiveAnimation = animatePerspective(cards, graph, perspective === "3d", target.id, requireElement(`view-${destination}`).getBoundingClientRect(), () => {
          if (epoch !== perspectiveEpoch) return;
          transitionDestination = null;
          changingPerspective = false;
          syncPerspectiveControls();
          forceGraphView.setActive(state.view === "map" && state.perspective === "3d");
          const pending = pendingPerspective; pendingPerspective = null; pending?.();
        });
      } else {
        transitionDestination = null;
        changingPerspective = false;
        syncPerspectiveControls();
      }
      releaseCover();
    });
    highlightSelectedCards();
  }

  globalWindow.switchView = (event: MouseEvent, viewName: ViewName) => {
    event.preventDefault();
    if (viewName === "map") { changePerspective(state.perspective); return; }
    setActiveView(viewName, state.perspective);
    state.view = viewName;
    updateUrlState(viewName, state.focusedNode?.id ?? state.selectedNode?.id ?? null, state.perspective);
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

  globalWindow.zoomIn = () => {
    if (state.view === "map" && state.perspective === "2d") {
      localView.zoomIn();
      localView.drawConnections();
    }
  };
  globalWindow.zoomOut = () => {
    if (state.view === "map" && state.perspective === "2d") {
      localView.zoomOut();
      localView.drawConnections();
    }
  };
  globalWindow.resetZoom = () => {
    if (state.view === "map" && state.perspective === "2d") {
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
    if (state.view === "map" && state.perspective === "2d") {
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

  let restoringPath = false;

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
      if (!restoringPath && state.view !== "map") {
        state.view = "map";
        setActiveView("map", state.perspective);
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
      updateUrlState(state.view, state.selectedNode?.id ?? null, state.perspective);
      schedulePersistNav();
      renderCurrentView();
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
    if (state.view === "map" && state.perspective === "3d") forceGraphView.render();
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
          setActiveView("map", state.perspective);
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

  // The node to focus first, chosen before the first drawing so that the page draws the focused picture once, rather
  // than a default picture and then the focused one.
  const urlRequestedNodeId = initialState.hasUrlState ? initialState.nodeId : null;
  const storedOrConfiguredNodeId = !initialState.hasUrlState ? (persistedNav?.nodeId ?? initialState.nodeId) : null;
  // An address that opens a directory and names no file is the door into that directory: nothing is put in focus for it.
  const enteredByDirectory = !initialState.nodeId && !persistedNav?.nodeId && state.openDirectories.size > 0;

  const initialFocusNodeId = (() => {
    if (enteredByDirectory || (new URLSearchParams(window.location.search).has("s") && !initialState.nodeId)) {
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
  setActiveView(state.view, state.perspective);

  // Render initial view
  // Resolve a shared path before drawing, so loading it never paints an unrelated neighborhood first.
  if (urlPathfindState.from && urlPathfindState.to) {
    restoringPath = true;
    try { pathfindApi.executeFindPath(); } finally { restoringPath = false; }
  }
  renderCurrentView();

  if (focusNode) {
    setTimeout(highlightSelectedCards, 100);
  }

  syncTuningControls = initTuningPanel({
    state,
    onTuningChange: () => { schedulePersistUi(); persistExploration(); },
    onRender: () => {
      // The spatial renderer owns both file and directory camera anchors.
      if (state.perspective === "3d") {
        renderCurrentView();
        return;
      }
      // An explicit tuning action owns the camera from this point, including
      // when the initial automatic framing has not finished yet.
      const subject = state.focusedNode ?? state.selectedNode;
      const view = localView;
      const anchor = subject ? view.getSubjectAnchor(subject.id) : null;
      if (subject && anchor) view.placeSubjectAnchor(subject.id, anchor);
      renderCurrentView();
      if (subject && anchor) view.placeSubjectAnchor(subject.id, anchor);
    },
    drawLocalConnections: () => localView.drawConnections(),
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
    state.perspective = place.perspective ?? state.perspective;
    const exploration = scrubSnapshot({ ...readUrlState(), openDirectories: place.openDirectories }, nodesById);
    state.tuning = applyLayoutSettings(state.tuning, exploration.layout);
    if (new URLSearchParams(window.location.search).has("s")) state.filters = { ...state.filters, ...exploration.filters };
    syncFilterControls();
    state.pins = exploration.pinSet;
    state.openDirectories = exploration.openDirectories;
    state.retentionOrder = exploration.retentionOrder;
    setActiveView(view, state.perspective);
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
    clearPathResult();
    if (path.from && path.to) {
      restoringPath = true;
      try { pathfindApi.executeFindPath(); } finally { restoringPath = false; }
    }
    renderCurrentView();
    schedulePersistNav();
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
    updateUrlState(state.view, node.id, state.perspective);
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
    updateUrlState(state.view, node.id, state.perspective);
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
    changePerspective(state.perspective, node);
    // Populate FROM field with the node and CLEAR TO field (exploration mode)
    pathfindApi.setFrom({ node, symbol: undefined });
    pathfindApi.setTo(undefined);
  }

  /** Keep independent branches in the same portable snapshot as selection and filters. */
  function persistExploration(leavingPath = false): void {
    if (leavingPath) clearPathResult();
    syncPerspectiveControls();
    schedulePersistNav();
    writeUrlState({ ...readUrlState(), view: state.view, perspective: state.perspective, selectedNodeId: state.selectedNode?.id ?? null,
      pinSet: state.pins!, openDirectories: state.openDirectories ?? new Set(), retentionOrder: state.retentionOrder, filters: state.filters,
      layout: layoutSettingsOf(state.tuning) }, { preservePath: !leavingPath });
  }

  function renderCurrentView(): void {
    // History and navigation can interrupt an animated perspective change.
    if (changingPerspective && (state.view !== "map" || state.perspective !== transitionDestination)) {
      perspectiveEpoch++;
      releasePerspectiveCover(); cancelPerspectiveAnimation();
      changingPerspective = false; pendingPerspective = null; transitionDestination = null;
      syncPerspectiveControls();
    }
    syncPerspectiveControls();
    syncTuningControls();
    forceGraphView.setActive(state.view === "map" && state.perspective === "3d");
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
    if (state.perspective === "2d") localView.render();
    else forceGraphView.render();
    syncPerspectiveControls();
  }

  const downloadCtx = { files, bundledMarkdown };

  function doRenderSourcesView(): void {
    renderSourcesView({
      facts: sourcesFacts(bundle.graph),
      perspective: state.perspective,
      bundledDocs,
      // A file named on the panel goes to the detail panel, where its doc and its doors are; the panel itself stays as it is.
      onFocusNode: (nodeId: string) => {
        const node = nodesById.get(nodeId);
        if (node) focusSidebar(node);
      },
      onViewBundledDoc: (docPath: string) => {
        showBundledDocInDetailPanel(docPath);
      },
      onDownload: (bundleType: DownloadBundleType, format: DownloadFormat) => void downloadDocs(bundleType, format, downloadCtx),
      onDownloadFacts: downloadFactsJson
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
    if (filterToggleDirectories) filterToggleDirectories.checked = !!state.filters.showDirectories;
    if (filterToggleDirectoryLinks) {
      filterToggleDirectoryLinks.checked = !!state.filters.showDirectoryLinks;
      filterToggleDirectoryLinks.disabled = !state.filters.showDirectories;
    }
  }
}

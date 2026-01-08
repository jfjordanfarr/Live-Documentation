import { inferDefaultEntryNodeId } from "./bootstrap";
import { createDetailPanel } from "./detailPanel";
import { requireElement, setActiveView } from "./dom";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { buildTestCoverageMap, resolveLinkEndpoint, getInputById } from "./graph-helpers";
import { initOmnisearch } from "./panels/omnisearch";
import { renderSourcesView, type BundledDocsData } from "./panels/sources-view";
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
  updateUrlState
} from "./persistence";
import type { ExplorerState, ViewName } from "./types";
import { createCircuitView } from "./views/circuitView";
import { createLocalView } from "./views/localView";
import type { StaticExplorerViewerConfig, BundledMarkdownTreeNode } from "../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../shared/types";
import type { PathResult } from "./views/localView/state";

// Extracted modules

interface ForceGraphLink {
  source: string;
  target: string;
  kind: ExplorerLinkPayload["kind"];
}

type ForceGraphNode = ExplorerNodePayload;

interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}

interface ForceGraphInstance {
  (container: HTMLElement): ForceGraphInstance;
  graphData(data: ForceGraphData): ForceGraphInstance;
  nodeLabel(labelAccessor: string | ((node: ForceGraphNode) => string)): ForceGraphInstance;
  nodeColor(colorAccessor: (node: ForceGraphNode) => string): ForceGraphInstance;
  onNodeClick(handler: (node: ForceGraphNode) => void): ForceGraphInstance;
}

type ForceGraphFactory = () => ForceGraphInstance;

declare const ForceGraph3D: ForceGraphFactory | undefined;

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
    const { graphData, staticDocs, bundledMarkdown, bundledMarkdownTree, viewerConfig } = await loadExplorerData();
    startExplorer(graphData, staticDocs, bundledMarkdown, bundledMarkdownTree, viewerConfig);
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
          viewerConfig: staticData.viewerConfig
        };
      }
      return { graphData: parseExplorerGraphPayload(staticData) };
    }
  } catch {
    // Static file not found, fall through to server mode
  }

  // 4. Fall back to server mode
  console.log("Loading explorer data from server /graph endpoint");
  const response = await fetch(`/graph?ts=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Failed to load graph data (${response.status})`);
  }
  return { graphData: parseExplorerGraphPayload(await response.json()) };
}

function startExplorer(
  graphData: ExplorerGraphPayload,
  staticDocs?: Record<string, string>,
  bundledMarkdown?: Record<string, string>,
  bundledMarkdownTree?: BundledMarkdownTreeNode,
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
  // Server Mode Bundled Docs (lazy-loaded from /bundled-docs endpoint)
  // ─────────────────────────────────────────────────────────────────────────

  type ServerBundledDocsState = {
    loaded: boolean;
    loading: boolean;
    tree?: BundledMarkdownTreeNode;
    paths?: string[];
    count?: number;
    error?: string;
  };

  const serverBundledDocs: ServerBundledDocsState = {
    loaded: isStaticMode, // Static mode already has embedded data
    loading: false
  };

  /**
   * Load bundled docs tree from server endpoint (server mode only).
   * Returns the tree if already loaded, or fetches it lazily.
   */
  async function loadServerBundledDocs(): Promise<BundledDocsData | undefined> {
    if (isStaticMode && bundledMarkdownTree) {
      // Static mode: build from embedded data
      return {
        tree: bundledMarkdownTree,
        count: bundledMarkdown ? Object.keys(bundledMarkdown).length : 0
      };
    }
    
    if (serverBundledDocs.loaded) {
      if (serverBundledDocs.tree) {
        return { tree: serverBundledDocs.tree, count: serverBundledDocs.count ?? 0 };
      }
      return undefined;
    }
    
    if (serverBundledDocs.loading) {
      // Wait for in-flight request
      await new Promise(resolve => setTimeout(resolve, 100));
      return loadServerBundledDocs();
    }
    
    serverBundledDocs.loading = true;
    try {
      const response = await fetch("/bundled-docs");
      if (!response.ok) {
        throw new Error(`Failed to load bundled docs (${response.status})`);
      }
      const data = await response.json() as { tree: BundledMarkdownTreeNode; paths: string[]; count: number };
      serverBundledDocs.tree = data.tree;
      serverBundledDocs.paths = data.paths;
      serverBundledDocs.count = data.count;
      serverBundledDocs.loaded = true;
      serverBundledDocs.loading = false;
      return { tree: data.tree, count: data.count };
    } catch (error) {
      serverBundledDocs.error = error instanceof Error ? error.message : "Unknown error";
      serverBundledDocs.loaded = true;
      serverBundledDocs.loading = false;
      console.error("Failed to load bundled docs:", error);
      return undefined;
    }
  }

  /**
   * Fetch a specific bundled doc content from server (server mode only).
   */
  async function fetchBundledDocContent(docPath: string): Promise<string | undefined> {
    if (isStaticMode && bundledMarkdown) {
      return bundledMarkdown[docPath];
    }
    
    try {
      const response = await fetch(`/bundled-docs?path=${encodeURIComponent(docPath)}`);
      if (!response.ok) {
        return undefined;
      }
      return await response.text();
    } catch {
      return undefined;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // URL State Management (using imported functions)
  // ─────────────────────────────────────────────────────────────────────────

  // Parse initial state from URL/config (uses imported parseInitialState)
  const initialState = parseInitialState(viewerConfig ?? null);

  // ─────────────────────────────────────────────────────────────────────────
  // LocalStorage: Persisted UI State (tuning + filters)
  // ─────────────────────────────────────────────────────────────────────────

  const PERSISTED_UI_KEY = "live-docs-explorer:ui:v1";
  const PERSISTED_UI_VERSION = 1 as const;

  type PersistedUiV1 = {
    version: typeof PERSISTED_UI_VERSION;
    filters?: Partial<ExplorerFilters>;
    tuning?: Partial<TuningConfig>;
  };

  const getDefaultFilters = (): ExplorerFilters => ({
    showTests: true,
    showAssets: false
  });

  const getDefaultTuning = (): TuningConfig => ({
    bezier: {
      stubFactor: 0.8,
      stubMin: 8,
      stubMaxOffset: 40,
      verticalOffset: 0
    },
    clickBehavior: {
      singleClickFocusOnly: true,
      doubleClickRecenter: true
    },
    visual: {
      showTypeBadges: true,
      alchemyGlow: true
    },
    localMap: {
      columnGap: 100,
      hoverDimSymbols: 0.5,
      hoverDimConnections: 0.1,
      selfLoopTaper: 0.2,
      collapseOnHover: false,
      collapseOnPin: true
    }
  });

  const isRecord = (value: unknown): value is Record<string, unknown> => {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  };

  const getRecord = (obj: Record<string, unknown>, key: string): Record<string, unknown> | null => {
    const val = obj[key];
    return isRecord(val) ? val : null;
  };

  const readBoolean = (value: unknown): boolean | undefined => {
    return typeof value === "boolean" ? value : undefined;
  };

  const readFiniteNumber = (value: unknown): number | undefined => {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  };

  const readPersistedUi = (): PersistedUiV1 | null => {
    try {
      const raw = window.localStorage.getItem(PERSISTED_UI_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) {
        window.localStorage.removeItem(PERSISTED_UI_KEY);
        return null;
      }
      if (parsed.version !== PERSISTED_UI_VERSION) {
        window.localStorage.removeItem(PERSISTED_UI_KEY);
        return null;
      }

      const result: PersistedUiV1 = { version: PERSISTED_UI_VERSION };

      const parsedFilters = getRecord(parsed, "filters");
      if (parsedFilters) {
        const showTests = readBoolean(parsedFilters.showTests);
        const showAssets = readBoolean(parsedFilters.showAssets);
        result.filters = {
          ...(showTests !== undefined ? { showTests } : null),
          ...(showAssets !== undefined ? { showAssets } : null)
        };
      }

      /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment --
         Type guards verified by tsc; ESLint projectService doesn't resolve this client tsconfig properly */
      const parsedTuning = getRecord(parsed, "tuning");
      if (parsedTuning) {
        const tuning: Partial<TuningConfig> = {};

        const bezierRaw = getRecord(parsedTuning, "bezier");
        if (bezierRaw) {
          const stubFactor = readFiniteNumber(bezierRaw.stubFactor);
          const stubMin = readFiniteNumber(bezierRaw.stubMin);
          const stubMaxOffset = readFiniteNumber(bezierRaw.stubMaxOffset);
          const verticalOffset = readFiniteNumber(bezierRaw.verticalOffset);
          tuning.bezier = {
            ...(stubFactor !== undefined ? { stubFactor } : null),
            ...(stubMin !== undefined ? { stubMin } : null),
            ...(stubMaxOffset !== undefined ? { stubMaxOffset } : null),
            ...(verticalOffset !== undefined ? { verticalOffset } : null)
          };
        }

        const clickBehaviorRaw = getRecord(parsedTuning, "clickBehavior");
        if (clickBehaviorRaw) {
          const singleClickFocusOnly = readBoolean(clickBehaviorRaw.singleClickFocusOnly);
          const doubleClickRecenter = readBoolean(clickBehaviorRaw.doubleClickRecenter);
          tuning.clickBehavior = {
            ...(singleClickFocusOnly !== undefined ? { singleClickFocusOnly } : null),
            ...(doubleClickRecenter !== undefined ? { doubleClickRecenter } : null)
          };
        }

        const visualRaw = getRecord(parsedTuning, "visual");
        if (visualRaw) {
          const showTypeBadges = readBoolean(visualRaw.showTypeBadges);
          const alchemyGlow = readBoolean(visualRaw.alchemyGlow);
          tuning.visual = {
            ...(showTypeBadges !== undefined ? { showTypeBadges } : null),
            ...(alchemyGlow !== undefined ? { alchemyGlow } : null)
          };
        }

        const localMapRaw = getRecord(parsedTuning, "localMap");
        if (localMapRaw) {
          const columnGap = readFiniteNumber(localMapRaw.columnGap);
          const hoverDimSymbols = readFiniteNumber(localMapRaw.hoverDimSymbols);
          const hoverDimConnections = readFiniteNumber(localMapRaw.hoverDimConnections);
          const selfLoopTaper = readFiniteNumber(localMapRaw.selfLoopTaper);
          const collapseOnHover = readBoolean(localMapRaw.collapseOnHover);
          const collapseOnPin = readBoolean(localMapRaw.collapseOnPin);
          tuning.localMap = {
            ...(columnGap !== undefined ? { columnGap } : null),
            ...(hoverDimSymbols !== undefined ? { hoverDimSymbols } : null),
            ...(hoverDimConnections !== undefined ? { hoverDimConnections } : null),
            ...(selfLoopTaper !== undefined ? { selfLoopTaper } : null),
            ...(collapseOnHover !== undefined ? { collapseOnHover } : null),
            ...(collapseOnPin !== undefined ? { collapseOnPin } : null)
          };
        }

        result.tuning = tuning;
      }
      /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

      return result;
    } catch {
      try {
        window.localStorage.removeItem(PERSISTED_UI_KEY);
      } catch {
        // ignore
      }
      return null;
    }
  };

  const applyPersistedUi = (
    defaults: { filters: ExplorerFilters; tuning: TuningConfig },
    persisted: PersistedUiV1 | null
  ): { filters: ExplorerFilters; tuning: TuningConfig } => {
    if (!persisted) {
      return defaults;
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment --
       Type guards verified by tsc; ESLint projectService doesn't resolve this client tsconfig properly */
    const filters: ExplorerFilters = {
      ...defaults.filters,
      ...(persisted.filters ?? {})
    };

    const tuning: TuningConfig = {
      ...defaults.tuning,
      bezier: {
        ...defaults.tuning.bezier,
        ...(persisted.tuning?.bezier ?? {})
      },
      clickBehavior: {
        ...defaults.tuning.clickBehavior,
        ...(persisted.tuning?.clickBehavior ?? {})
      },
      visual: {
        ...defaults.tuning.visual,
        ...(persisted.tuning?.visual ?? {})
      },
      localMap: {
        ...defaults.tuning.localMap,
        ...(persisted.tuning?.localMap ?? {})
      }
    };
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ESLint projectService issue
    return { filters, tuning };
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ESLint projectService issue
  const defaults = { filters: getDefaultFilters(), tuning: getDefaultTuning() };
  const persistedUi = readPersistedUi();
  const initialUi = applyPersistedUi(defaults, persistedUi);

  // ─────────────────────────────────────────────────────────────────────────
  // LocalStorage: Persisted Navigation (view + node selection)
  // ─────────────────────────────────────────────────────────────────────────

  const PERSISTED_NAV_KEY = "live-docs-explorer:nav:v1";
  const PERSISTED_NAV_VERSION = 1 as const;

  type PersistedNavV1 = {
    version: typeof PERSISTED_NAV_VERSION;
    view?: ViewName;
    nodeId?: string | null;
  };

  const readPersistedNav = (): PersistedNavV1 | null => {
    try {
      const raw = window.localStorage.getItem(PERSISTED_NAV_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) {
        window.localStorage.removeItem(PERSISTED_NAV_KEY);
        return null;
      }
      if (parsed.version !== PERSISTED_NAV_VERSION) {
        window.localStorage.removeItem(PERSISTED_NAV_KEY);
        return null;
      }

      const viewCandidate = parsed.view;
      const nodeIdCandidate = parsed.nodeId;

      const view: ViewName | undefined =
        viewCandidate === "circuit" || viewCandidate === "map" || viewCandidate === "graph" || viewCandidate === "sources" ? viewCandidate : undefined;

      const nodeId: string | null | undefined =
        typeof nodeIdCandidate === "string" ? nodeIdCandidate : nodeIdCandidate === null ? null : undefined;

      return {
        version: PERSISTED_NAV_VERSION,
        ...(view ? { view } : null),
        ...(nodeId !== undefined ? { nodeId } : null)
      };
    } catch {
      try {
        window.localStorage.removeItem(PERSISTED_NAV_KEY);
      } catch {
        // ignore
      }
      return null;
    }
  };

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ESLint projectService issue
    filters: initialUi.filters,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ESLint projectService issue
    tuning: initialUi.tuning
  };

  let persistUiTimer: number | null = null;
  const schedulePersistUi = (): void => {
    if (persistUiTimer !== null) {
      window.clearTimeout(persistUiTimer);
    }
    persistUiTimer = window.setTimeout(() => {
      persistUiTimer = null;
      try {
        const payload: PersistedUiV1 = {
          version: PERSISTED_UI_VERSION,
          filters: state.filters,
          tuning: state.tuning
        };
        window.localStorage.setItem(PERSISTED_UI_KEY, JSON.stringify(payload));
      } catch {
        // ignore (storage may be unavailable/blocked)
      }
    }, 150);
  };

  const nodesById = new Map(graphData.nodes.map(node => [node.id, node]));

  let persistNavTimer: number | null = null;
  const schedulePersistNav = (): void => {
    if (persistNavTimer !== null) {
      window.clearTimeout(persistNavTimer);
    }
    persistNavTimer = window.setTimeout(() => {
      persistNavTimer = null;
      try {
        const payload: PersistedNavV1 = {
          version: PERSISTED_NAV_VERSION,
          view: state.view,
          nodeId: state.focusedNode?.id ?? state.selectedNode?.id ?? null
        };
        window.localStorage.setItem(PERSISTED_NAV_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    }, 150);
  };

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

  let forceGraphInstance: ForceGraphInstance | null = null;

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
      renderGraph();
    }
  }

  async function doRenderSourcesView(): Promise<void> {
    // Bulk download is always available: static mode has embedded docs, server mode can fetch
    const canBulkDownload = true;
    
    // Load bundled docs (lazy for server mode)
    const bundledDocsData = await loadServerBundledDocs();
    
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
      onViewBundledDoc: (docPath: string) => {
        void showBundledDocInDetailPanel(docPath);
      },
      onDownloadAll: canBulkDownload ? () => void downloadAllDocs() : undefined
    });
  }

  async function showBundledDocInDetailPanel(docPath: string): Promise<void> {
    const content = await fetchBundledDocContent(docPath);
    if (content) {
      detailPanel.showBundledDoc(docPath, content);
    } else {
      console.error(`Failed to load bundled doc: ${docPath}`);
    }
  }

  async function downloadAllDocs(): Promise<void> {
    try {
      const allDocs: string[] = [];
      let fetchedCount = 0;
      
      // First, collect all Live Docs
      for (const node of graphData.nodes) {
        let markdown: string | undefined;
        
        if (isStaticMode && staticDocs) {
          // Static mode: use embedded markdown
          markdown = staticDocs[node.id];
        } else {
          // Server mode: fetch from doc endpoint
          try {
            const response = await fetch(`/doc?docPath=${encodeURIComponent(node.docPath)}`);
            if (response.ok) {
              markdown = await response.text();
            }
          } catch {
            console.warn(`Failed to fetch doc for ${node.id}`);
          }
        }
        
        if (markdown) {
          // Add separator and header for each doc
          allDocs.push(`\n\n---\n\n<!-- SOURCE: ${node.docRelativePath || node.name} -->\n\n${markdown}`);
          fetchedCount++;
        }
      }

      // Then, include bundled markdown (referenced docs like READMEs, specs, etc.)
      let bundledPaths: string[] = [];
      
      if (isStaticMode && bundledMarkdown) {
        // Static mode: use embedded bundled markdown
        bundledPaths = Object.keys(bundledMarkdown).sort();
        for (const docPath of bundledPaths) {
          const markdown = bundledMarkdown[docPath];
          allDocs.push(`\n\n---\n\n<!-- BUNDLED: ${docPath} -->\n\n${markdown}`);
          fetchedCount++;
        }
      } else if (!isStaticMode && serverBundledDocs.paths && serverBundledDocs.paths.length > 0) {
        // Server mode: fetch bundled docs from server
        bundledPaths = serverBundledDocs.paths.sort();
        for (const docPath of bundledPaths) {
          try {
            const response = await fetch(`/bundled-docs?path=${encodeURIComponent(docPath)}`);
            if (response.ok) {
              const markdown = await response.text();
              allDocs.push(`\n\n---\n\n<!-- BUNDLED: ${docPath} -->\n\n${markdown}`);
              fetchedCount++;
            }
          } catch {
            console.warn(`Failed to fetch bundled doc: ${docPath}`);
          }
        }
      }
      
      if (allDocs.length === 0) {
        alert("No documentation content available to download.");
        return;
      }

      const bundledNote = bundledPaths.length > 0
        ? `\n\nIncludes ${bundledPaths.length} referenced markdown files.`
        : "";
      
      const combined = `# Live Documentation Export\n\nExported ${fetchedCount} documents on ${new Date().toISOString()}${bundledNote}\n\n${allDocs.join("")}`;
      
      const blob = new Blob([combined], { type: "text/markdown; charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "live-documentation-export.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to create documentation archive:", error);
      alert("Failed to download documentation. Check the console for details.");
    }
  }

  function renderGraph(): void {
    const container = requireElement<HTMLDivElement>("graph-svg");

    const includeNode = (node: ExplorerNodePayload): boolean => {
      if (state.selectedNode && state.selectedNode.id === node.id) {
        return true;
      }
      const archetype = (node.archetype || "").toLowerCase();
      if (archetype === "test" && !state.filters.showTests) {
        return false;
      }
      if (archetype === "asset" && !state.filters.showAssets) {
        return false;
      }
      return true;
    };

    const filteredNodes = graphData.nodes.filter(includeNode);
    const allowedIds = new Set(filteredNodes.map(node => node.id));
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = resolveLinkEndpoint(link.source);
      const targetId = resolveLinkEndpoint(link.target);
      return sourceId !== "" && targetId !== "" && allowedIds.has(sourceId) && allowedIds.has(targetId);
    });

    const dataForGraph: ForceGraphData = {
      nodes: filteredNodes.map(node => ({ ...node })),
      links: filteredLinks.map(link => ({
        source: resolveLinkEndpoint(link.source),
        target: resolveLinkEndpoint(link.target),
        kind: link.kind
      }))
    };

    if (forceGraphInstance) {
      forceGraphInstance.graphData(dataForGraph);
      return;
    }

    if (typeof ForceGraph3D !== "function") {
      container.innerHTML = '<div style="padding:20px;color:#f88;">ForceGraph3D failed to load.</div>';
      return;
    }

    const instance = ForceGraph3D();
    forceGraphInstance = instance(container)
      .graphData(dataForGraph)
      .nodeLabel("name")
      .nodeColor(node => {
        const archetype = (node.archetype || "").toLowerCase();
        switch (archetype) {
          case "implementation":
            return "#0091ff";
          case "test":
            return "#28a745";
          case "interface":
            return "#ffc107";
          case "config":
            return "#6c757d";
          case "script":
            return "#17a2b8";
          default:
            return "#888";
        }
      })
      .onNodeClick(node => {
        const original = nodesById.get(node.id);
        if (!original) {
          return;
        }
        // Show node in detail panel without navigating away from Force Graph
        state.focusedNode = original;
        void detailPanel.showNode(original);
      });
  }

  function syncFilterControls(): void {
    if (filterToggleTests) {
      filterToggleTests.checked = state.filters.showTests;
    }
    if (filterToggleAssets) {
      filterToggleAssets.checked = state.filters.showAssets;
    }
  }
}


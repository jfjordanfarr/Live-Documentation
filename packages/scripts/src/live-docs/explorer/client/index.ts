import { createDetailPanel } from "./detailPanel";
import { requireElement, setActiveView } from "./dom";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { parseExplorerGraphPayload } from "./parsers";
import type { ExplorerState, TestCoverageMap, ViewName } from "./types";
import { createCircuitView } from "./views/circuitView";
import { createLocalView } from "./views/localView";
import type { StaticExplorerViewerConfig } from "../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../shared/types";

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
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
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
  viewerConfig?: StaticExplorerViewerConfig;
}

/**
 * Result from loading explorer data.
 */
interface LoadedExplorerData {
  graphData: ExplorerGraphPayload;
  staticDocs?: Record<string, string>;
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
    const { graphData, staticDocs, viewerConfig } = await loadExplorerData();
    startExplorer(graphData, staticDocs, viewerConfig);
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
  viewerConfig?: StaticExplorerViewerConfig
): void {
  console.log("Live Docs Explorer graph loaded", graphData);
  if (staticDocs) {
    console.log(`Static mode: ${Object.keys(staticDocs).length} docs embedded`);
  }
  if (viewerConfig) {
    console.log("Viewer config loaded:", viewerConfig);
  }

  // Shared HTML escape helper
  const escapeHtml = (str: string): string => {
    return str.replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[c] ?? c));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // URL State Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Map between URL/config view names and internal state view names.
   * URL uses: circuit, local, force, sources (matches config schema)
   * Internal uses: circuit, map, graph, sources
   */
  const viewNameToInternal = (name: string): ViewName => {
    switch (name) {
      case "local": return "map";
      case "force": return "graph";
      case "sources": return "sources";
      case "circuit":
      default:
        return "circuit";
    }
  };

  const viewNameToUrl = (name: ViewName): string => {
    switch (name) {
      case "map": return "local";
      case "graph": return "force";
      case "sources": return "sources";
      case "circuit":
      default:
        return "circuit";
    }
  };

  /**
   * Parse initial view and node from URL parameters.
   * Priority: URL params > viewerConfig > defaults (Local Map)
   */
  const parseInitialState = (): { view: ViewName; nodeId: string | null; hasUrlState: boolean } => {
    const params = new URLSearchParams(window.location.search);
    const urlView = params.get("view");
    const urlNode = params.get("node");

    // URL params take priority
    if (urlView || urlNode) {
      return {
        view: urlView ? viewNameToInternal(urlView) : "map",
        nodeId: urlNode,
        hasUrlState: true
      };
    }

    // Fall back to viewerConfig
    if (viewerConfig) {
      return {
        view: viewerConfig.defaultView ? viewNameToInternal(viewerConfig.defaultView) : "map",
        nodeId: viewerConfig.initialFocusNode ?? null,
        hasUrlState: false
      };
    }

    // Defaults: Knowledge Sources is the cold-start landing for first-time visitors
    return { view: "sources", nodeId: null, hasUrlState: false };
  };

  /**
   * Update URL to reflect current view and focused node without page reload.
   * Uses replaceState to avoid polluting browser history on every interaction.
   */
  const updateUrlState = (view: ViewName, nodeId: string | null): void => {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Preserve data param if present
    const dataParam = params.get("data");

    // Clear existing view/node params
    params.delete("view");
    params.delete("node");

    // Set new params (skip defaults to keep URLs clean)
    // Local Map ("local") is the default, so omit it from URL
    const urlViewName = viewNameToUrl(view);
    if (urlViewName !== "local") {
      params.set("view", urlViewName);
    }
    if (nodeId) {
      params.set("node", nodeId);
    }

    // Restore data param at the end for consistency
    if (dataParam) {
      params.delete("data");
      params.set("data", dataParam);
    }

    // Build clean URL (no params = no query string)
    const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
    window.history.replaceState({}, "", newUrl);
  };

  // Parse initial state from URL/config
  const initialState = parseInitialState();

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
    onNodeClick: handleDocNodeClick,
    onOpenInCircuitBoard: openInCircuitBoardView
  });

  const resolveLinkEndpoint = (endpoint: ExplorerLinkPayload["source"]): string => {
    if (typeof endpoint === "string") {
      return endpoint;
    }
    if (endpoint && typeof endpoint === "object" && "id" in endpoint) {
      const candidate = endpoint.id;
      if (typeof candidate === "string") {
        return candidate;
      }
    }
    return "";
  };

  const inferDefaultEntryNodeId = (): string | null => {
    if (!graphData.nodes || graphData.nodes.length === 0) {
      return null;
    }

    const excludedPathFragments = [
      "/node_modules/",
      "/dist/",
      "/build/",
      "/coverage/",
      "/.git/",
      "/.mdmd/",
      "/docs/",
      "/specs/",
      "/ai-agent-workspace/",
      "/tests/",
      "/test/",
      "/__tests__/"
    ];

    const degreeById = new Map<string, number>();
    for (const link of graphData.links) {
      const sourceId = resolveLinkEndpoint(link.source);
      const targetId = resolveLinkEndpoint(link.target);
      if (nodesById.has(sourceId)) {
        degreeById.set(sourceId, (degreeById.get(sourceId) ?? 0) + 1);
      }
      if (nodesById.has(targetId)) {
        degreeById.set(targetId, (degreeById.get(targetId) ?? 0) + 1);
      }
    }

    const scoreNode = (node: ExplorerNodePayload): number => {
      const archetype = (node.archetype || "").toLowerCase();
      const path = (node.codeRelativePath || node.codePath || node.id || "").replace(/\\/g, "/").toLowerCase();
      const basename = path.split("/").pop() ?? "";

      // Hard excludes
      if (excludedPathFragments.some(fragment => path.includes(fragment))) {
        return -1_000_000;
      }
      if (archetype === "test") {
        return -500_000;
      }
      if (archetype === "asset") {
        return -200_000;
      }

      let score = 0;

      // Prefer implementation-ish nodes (when archetype is reliable)
      if (archetype === "implementation") {
        score += 150;
      } else if (archetype === "script") {
        score += 50;
      } else if (archetype === "config") {
        score -= 50;
      }

      // Entry-point filename heuristics (cross-language, case-insensitive)
      if (basename === "main.ts" || basename === "main.js") score += 1200;
      if (basename === "index.ts" || basename === "index.js") score += 1000;
      if (basename === "app.ts" || basename === "app.js") score += 900;
      if (basename === "server.ts" || basename === "server.js") score += 850;
      if (basename === "extension.ts" || basename === "extension.js") score += 800;
      if (basename === "cli.ts" || basename === "cli.js") score += 750;
      if (basename === "program.cs") score += 1200;
      if (basename === "startup.cs") score += 1100;
      if (basename === "global.asax.cs") score += 950;

      // Prefer conventional src locations
      if (path.includes("/src/")) score += 150;
      if (path.endsWith("/src/main.ts") || path.endsWith("/src/main.js")) score += 200;
      if (path.endsWith("/src/index.ts") || path.endsWith("/src/index.js")) score += 150;

      // Prefer common monorepo entry packages (small nudges; not required)
      if (path.startsWith("packages/server/")) score += 120;
      if (path.startsWith("packages/extension/")) score += 90;
      if (path.startsWith("packages/cli/")) score += 70;

      // Graph centrality as a tie-breaker signal
      score += Math.min(300, degreeById.get(node.id) ?? 0);

      // Shallow paths are often entrypoints
      const depth = path.split("/").filter(Boolean).length;
      score += Math.max(0, 20 - depth);

      return score;
    };

    let best: { nodeId: string; score: number; path: string } | null = null;
    for (const node of graphData.nodes) {
      const score = scoreNode(node);
      const path = (node.codeRelativePath || node.codePath || node.id || "").replace(/\\/g, "/");
      if (!best || score > best.score || (score === best.score && path.localeCompare(best.path) < 0)) {
        best = { nodeId: node.id, score, path };
      }
    }

    if (!best || best.score < 0) {
      return null;
    }
    return best.nodeId;
  };

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

  window.addEventListener("resize", () => {
    if (state.view === "circuit") {
      circuitView.drawConnections();
    } else if (state.view === "map") {
      localView.drawConnections();
    }
  });

  // Initialize omnisearch
  initOmnisearch();

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
    return inferDefaultEntryNodeId();
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

  initTuningPanel();

  // ============================================
  // OMNISEARCH
  // ============================================

  function initOmnisearch(): void {
    const omnisearch = document.getElementById("omnisearch");
    const omnisearchInput = document.getElementById("omnisearch-input") as HTMLInputElement | null;
    const omnisearchResults = document.getElementById("omnisearch-results");
    const backdrop = omnisearch?.querySelector(".omnisearch-backdrop");

    if (!omnisearch || !omnisearchInput || !omnisearchResults) return;

    let selectedIndex = -1;
    let currentResults: ExplorerNodePayload[] = [];

    // Open omnisearch
    (globalWindow as unknown as Record<string, unknown>).openOmnisearch = () => {
      omnisearch.hidden = false;
      omnisearchInput.value = "";
      omnisearchInput.focus();
      omnisearchResults.innerHTML = "";
      selectedIndex = -1;
      currentResults = [];
    };

    // Close omnisearch
    const closeOmnisearch = (): void => {
      omnisearch.hidden = true;
      omnisearchInput.blur();
    };

    // Fuzzy search nodes
    const searchNodes = (query: string): ExplorerNodePayload[] => {
      if (!query.trim()) return [];
      const lowerQuery = query.toLowerCase();
      const terms = lowerQuery.split(/\s+/);
      
      return graphData.nodes
        .map(node => {
          const name = (node.name || '').toLowerCase();
          const path = (node.codeRelativePath || '').toLowerCase();
          // publicSymbols is string[], not {name}[]
          const symbols = (node.publicSymbols || []).map(s => (s || '').toLowerCase());
          
          let score = 0;
          for (const term of terms) {
            if (name === term) score += 100;
            else if (name.startsWith(term)) score += 50;
            else if (name.includes(term)) score += 25;
            if (path.includes(term)) score += 10;
            if (symbols.some(s => s.includes(term))) score += 15;
          }
          return { node, score };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(r => r.node);
    };

    // Render results
    const renderResults = (results: ExplorerNodePayload[]): void => {
      currentResults = results;
      selectedIndex = results.length > 0 ? 0 : -1;
      
      if (results.length === 0) {
        omnisearchResults.innerHTML = '<div class="omnisearch-empty">No results found</div>';
        return;
      }

      omnisearchResults.innerHTML = results.map((node, i) => `
        <div class="omnisearch-result ${i === 0 ? 'selected' : ''}" data-index="${i}">
          <span class="omnisearch-result-icon">${getArchetypeIcon(node.archetype)}</span>
          <div class="omnisearch-result-text">
            <div class="omnisearch-result-name">${escapeHtml(node.name)}</div>
            <div class="omnisearch-result-path">${escapeHtml(node.codeRelativePath)}</div>
          </div>
          <span class="omnisearch-result-badge">${node.archetype}</span>
        </div>
      `).join("");
    };

    const getArchetypeIcon = (archetype: string): string => {
      const lower = archetype.toLowerCase();
      if (lower === "test") return "🧪";
      if (lower === "asset") return "📄";
      if (lower === "config") return "⚙️";
      return "📦";
    };

    const escapeHtml = (str: string): string => {
      return str.replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[c] || c));
    };

    // Update selection highlight
    const updateSelection = (): void => {
      const items = omnisearchResults.querySelectorAll(".omnisearch-result");
      items.forEach((item, i) => {
        item.classList.toggle("selected", i === selectedIndex);
      });
      // Scroll into view
      const selected = omnisearchResults.querySelector(".omnisearch-result.selected");
      selected?.scrollIntoView({ block: "nearest" });
    };

    // Select result
    const selectResult = (node: ExplorerNodePayload): void => {
      closeOmnisearch();
      void selectNode(node);
    };

    // Event listeners
    omnisearchInput.addEventListener("input", () => {
      const results = searchNodes(omnisearchInput.value);
      renderResults(results);
    });

    omnisearchInput.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        closeOmnisearch();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentResults.length > 0) {
          selectedIndex = (selectedIndex + 1) % currentResults.length;
          updateSelection();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentResults.length > 0) {
          selectedIndex = selectedIndex <= 0 ? currentResults.length - 1 : selectedIndex - 1;
          updateSelection();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
          selectResult(currentResults[selectedIndex]);
        }
      }
    });

    omnisearchResults.addEventListener("click", e => {
      const target = (e.target as HTMLElement).closest(".omnisearch-result");
      if (target instanceof HTMLElement) {
        const index = parseInt(target.dataset.index || "-1", 10);
        if (index >= 0 && index < currentResults.length) {
          selectResult(currentResults[index]);
        }
      }
    });

    backdrop?.addEventListener("click", closeOmnisearch);

    // Global keyboard shortcut (Ctrl+P)
    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        (globalWindow as unknown as Record<string, unknown>).openOmnisearch?.();
      }
    });
  }

  async function selectNode(node: ExplorerNodePayload): Promise<void> {
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
    await detailPanel.showNode(node);
  }

  async function focusSidebar(node: ExplorerNodePayload): Promise<void> {
    state.focusedNode = node;
    const contextName = document.getElementById("context-name");
    if (contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
    updateUrlState(state.view, node.id);
    schedulePersistNav();
    highlightSelectedCards();
    await detailPanel.showNode(node);
  }

  function handleNodeClick(node: ExplorerNodePayload): void | Promise<void> {
    if (state.tuning.clickBehavior.singleClickFocusOnly) {
      return focusSidebar(node);
    }
    return selectNode(node);
  }

  function handleNodeDoubleClick(node: ExplorerNodePayload): void | Promise<void> {
    if (state.tuning.clickBehavior.doubleClickRecenter) {
      return selectNode(node);
    }
    return focusSidebar(node);
  }

  function initTuningPanel(): void {
    const stubFactorInput = document.getElementById("tuning-stub-factor") as HTMLInputElement | null;
    const stubMinInput = document.getElementById("tuning-stub-min") as HTMLInputElement | null;
    const stubMaxOffsetInput = document.getElementById("tuning-stub-max-offset") as HTMLInputElement | null;
    const verticalOffsetInput = document.getElementById("tuning-vertical-offset") as HTMLInputElement | null;
    const singleClickFocusInput = document.getElementById("tuning-single-click-focus") as HTMLInputElement | null;
    const doubleClickRecenterInput = document.getElementById("tuning-double-click-recenter") as HTMLInputElement | null;
    const typeBadgesInput = document.getElementById("tuning-type-badges") as HTMLInputElement | null;
    const alchemyGlowInput = document.getElementById("tuning-alchemy-glow") as HTMLInputElement | null;
    const columnGapInput = document.getElementById("tuning-column-gap") as HTMLInputElement | null;
    const hoverDimSymbolsInput = document.getElementById("tuning-hover-dim-symbols") as HTMLInputElement | null;
    const hoverDimConnectionsInput = document.getElementById("tuning-hover-dim-connections") as HTMLInputElement | null;
    const selfLoopTaperInput = document.getElementById("tuning-self-loop-taper") as HTMLInputElement | null;

    const wireSlider = (input: HTMLInputElement | null, outputId: string, setter: (v: number) => void): void => {
      if (!input) return;
      const output = document.getElementById(outputId) as HTMLOutputElement | null;
      input.addEventListener("input", () => {
        const value = parseFloat(input.value);
        setter(value);
        if (output) output.textContent = input.value;
        schedulePersistUi();
        if (state.view === "map") {
          localView.drawConnections();
        }
      });
    };

    const wireCheckbox = (input: HTMLInputElement | null, setter: (v: boolean) => void): void => {
      if (!input) return;
      input.addEventListener("change", () => {
        setter(input.checked);
        schedulePersistUi();
        renderCurrentView();
      });
    };

    // Wire slider that also updates CSS custom property on the local-layout container
    const wireLocalMapSlider = (
      input: HTMLInputElement | null,
      outputId: string,
      cssProperty: string,
      setter: (v: number) => void
    ): void => {
      if (!input) return;
      const output = document.getElementById(outputId) as HTMLOutputElement | null;
      input.addEventListener("input", () => {
        const value = parseFloat(input.value);
        setter(value);
        if (output) output.textContent = input.value;
        schedulePersistUi();
        // Update CSS custom property on the local-layout element
        const localLayout = document.querySelector<HTMLElement>(".local-layout");
        if (localLayout) {
          localLayout.style.setProperty(cssProperty, cssProperty === "--local-column-gap" ? `${value}px` : String(value));
        }
        if (state.view === "map") {
          localView.drawConnections();
        }
      });
    };

    const clampToInput = (input: HTMLInputElement, value: number): number => {
      const min = input.min ? parseFloat(input.min) : Number.NEGATIVE_INFINITY;
      const max = input.max ? parseFloat(input.max) : Number.POSITIVE_INFINITY;
      if (!Number.isFinite(value)) {
        return parseFloat(input.value);
      }
      return Math.min(max, Math.max(min, value));
    };

    const setSlider = (input: HTMLInputElement | null, outputId: string, value: number, format?: (v: number) => string): number => {
      if (!input) return value;
      const clamped = clampToInput(input, value);
      input.value = String(clamped);
      const output = document.getElementById(outputId) as HTMLOutputElement | null;
      if (output) {
        output.textContent = format ? format(clamped) : input.value;
      }
      return clamped;
    };

    const setCheckbox = (input: HTMLInputElement | null, value: boolean): void => {
      if (!input) return;
      input.checked = value;
    };

    const syncTuningControlsFromState = (): void => {
      state.tuning.bezier.stubFactor = setSlider(stubFactorInput, "tuning-stub-factor-value", state.tuning.bezier.stubFactor);
      state.tuning.bezier.stubMin = setSlider(stubMinInput, "tuning-stub-min-value", state.tuning.bezier.stubMin);
      state.tuning.bezier.stubMaxOffset = setSlider(stubMaxOffsetInput, "tuning-stub-max-offset-value", state.tuning.bezier.stubMaxOffset);
      state.tuning.bezier.verticalOffset = setSlider(verticalOffsetInput, "tuning-vertical-offset-value", state.tuning.bezier.verticalOffset);

      setCheckbox(singleClickFocusInput, state.tuning.clickBehavior.singleClickFocusOnly);
      setCheckbox(doubleClickRecenterInput, state.tuning.clickBehavior.doubleClickRecenter);
      setCheckbox(typeBadgesInput, state.tuning.visual.showTypeBadges);
      setCheckbox(alchemyGlowInput, state.tuning.visual.alchemyGlow);

      state.tuning.localMap.columnGap = setSlider(columnGapInput, "tuning-column-gap-value", state.tuning.localMap.columnGap, v => String(v));
      state.tuning.localMap.hoverDimSymbols = setSlider(hoverDimSymbolsInput, "tuning-hover-dim-symbols-value", state.tuning.localMap.hoverDimSymbols);
      state.tuning.localMap.hoverDimConnections = setSlider(hoverDimConnectionsInput, "tuning-hover-dim-connections-value", state.tuning.localMap.hoverDimConnections);
      state.tuning.localMap.selfLoopTaper = setSlider(selfLoopTaperInput, "tuning-self-loop-taper-value", state.tuning.localMap.selfLoopTaper);

      const localLayout = document.querySelector<HTMLElement>(".local-layout");
      if (localLayout) {
        localLayout.style.setProperty("--local-column-gap", `${state.tuning.localMap.columnGap}px`);
        localLayout.style.setProperty("--hover-dim-symbols", String(state.tuning.localMap.hoverDimSymbols));
        localLayout.style.setProperty("--hover-dim-connections", String(state.tuning.localMap.hoverDimConnections));
        localLayout.style.setProperty("--self-loop-taper", String(state.tuning.localMap.selfLoopTaper));
      }
    };

    // Ensure controls reflect restored state before wiring events.
    syncTuningControlsFromState();

    wireSlider(stubFactorInput, "tuning-stub-factor-value", v => { state.tuning.bezier.stubFactor = v; });
    wireSlider(stubMinInput, "tuning-stub-min-value", v => { state.tuning.bezier.stubMin = v; });
    wireSlider(stubMaxOffsetInput, "tuning-stub-max-offset-value", v => { state.tuning.bezier.stubMaxOffset = v; });
    wireSlider(verticalOffsetInput, "tuning-vertical-offset-value", v => { state.tuning.bezier.verticalOffset = v; });

    wireCheckbox(singleClickFocusInput, v => { state.tuning.clickBehavior.singleClickFocusOnly = v; });
    wireCheckbox(doubleClickRecenterInput, v => { state.tuning.clickBehavior.doubleClickRecenter = v; });
    wireCheckbox(typeBadgesInput, v => { state.tuning.visual.showTypeBadges = v; });
    wireCheckbox(alchemyGlowInput, v => { state.tuning.visual.alchemyGlow = v; });

    // Local Map tuning sliders
    wireLocalMapSlider(columnGapInput, "tuning-column-gap-value", "--local-column-gap", v => { state.tuning.localMap.columnGap = v; });
    wireLocalMapSlider(hoverDimSymbolsInput, "tuning-hover-dim-symbols-value", "--hover-dim-symbols", v => { state.tuning.localMap.hoverDimSymbols = v; });
    wireLocalMapSlider(hoverDimConnectionsInput, "tuning-hover-dim-connections-value", "--hover-dim-connections", v => { state.tuning.localMap.hoverDimConnections = v; });
    wireLocalMapSlider(selfLoopTaperInput, "tuning-self-loop-taper-value", "--self-loop-taper", v => { state.tuning.localMap.selfLoopTaper = v; });
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
    state.view = "map";
    setActiveView("map");
    await selectNode(node);
  }

  function renderCurrentView(): void {
    if (state.view === "sources") {
      renderSourcesView();
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

  function renderSourcesView(): void {
    const container = requireElement<HTMLDivElement>("sources-container");

    // Compute graph health metrics
    const nodeCount = graphData.nodes.length;
    const linkCount = graphData.links.length;

    // Count archetypes
    const archetypeCounts = new Map<string, number>();
    graphData.nodes.forEach(node => {
      const arch = (node.archetype || "unknown").toLowerCase();
      archetypeCounts.set(arch, (archetypeCounts.get(arch) ?? 0) + 1);
    });

    // High fan-out nodes (potential barrels)
    const outboundCounts = new Map<string, number>();
    const inboundCounts = new Map<string, number>();
    graphData.links.forEach(link => {
      const sourceId = resolveLinkEndpoint(link.source);
      const targetId = resolveLinkEndpoint(link.target);
      if (sourceId) outboundCounts.set(sourceId, (outboundCounts.get(sourceId) ?? 0) + 1);
      if (targetId) inboundCounts.set(targetId, (inboundCounts.get(targetId) ?? 0) + 1);
    });

    const HIGH_FANOUT_THRESHOLD = 50;
    const HIGH_FANIN_THRESHOLD = 30;

    const highFanoutNodes = graphData.nodes
      .filter(node => (outboundCounts.get(node.id) ?? 0) >= HIGH_FANOUT_THRESHOLD)
      .sort((a, b) => (outboundCounts.get(b.id) ?? 0) - (outboundCounts.get(a.id) ?? 0))
      .slice(0, 5);

    const highFaninNodes = graphData.nodes
      .filter(node => (inboundCounts.get(node.id) ?? 0) >= HIGH_FANIN_THRESHOLD)
      .sort((a, b) => (inboundCounts.get(b.id) ?? 0) - (inboundCounts.get(a.id) ?? 0))
      .slice(0, 5);

    // Determine data source
    const isStaticMode = !!staticDocs || document.getElementById("explorer-data")?.textContent;
    const dataSourceLabel = isStaticMode ? "Static bundle (embedded/fetched)" : "Server /graph endpoint";

    // Build archetype breakdown string
    const archetypeList = Array.from(archetypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([arch, count]) => `${arch}: ${count}`)
      .join(", ");

    // Render
    container.innerHTML = `
      <div class="sources-header">
        <h1>📊 Knowledge Sources</h1>
        <p>Where this graph gets its data, what it knows, and how you can improve it.</p>
      </div>

      <div class="sources-panel">
        <h2><span class="panel-icon">🔌</span> Data Provenance</h2>
        <div class="sources-row">
          <span class="sources-row-label">Data source</span>
          <span class="sources-row-value neutral">${escapeHtml(dataSourceLabel)}</span>
        </div>
        <div class="sources-row">
          <span class="sources-row-label">Viewer config</span>
          <span class="sources-row-value ${viewerConfig ? "positive" : "neutral"}">${viewerConfig ? "Present" : "Not provided"}</span>
        </div>
        <div class="sources-row">
          <span class="sources-row-label">Knowledge feeds</span>
          <span class="sources-row-value neutral">0 discovered (server-only feature)</span>
        </div>
      </div>

      <div class="sources-panel">
        <h2><span class="panel-icon">📈</span> Graph Statistics</h2>
        <div class="sources-row">
          <span class="sources-row-label">Total nodes</span>
          <span class="sources-row-value positive">${nodeCount.toLocaleString()}</span>
        </div>
        <div class="sources-row">
          <span class="sources-row-label">Total links</span>
          <span class="sources-row-value positive">${linkCount.toLocaleString()}</span>
        </div>
        <div class="sources-row">
          <span class="sources-row-label">Archetypes</span>
          <span class="sources-row-value neutral">${escapeHtml(archetypeList) || "None"}</span>
        </div>
      </div>

      <div class="sources-panel">
        <h2><span class="panel-icon">⚠️</span> Graph Health Warnings</h2>
        ${renderHealthWarnings(highFanoutNodes, highFaninNodes, outboundCounts, inboundCounts)}
      </div>

      <div class="sources-panel">
        <h2><span class="panel-icon">💡</span> How to Improve</h2>
        <div class="sources-guidance">
          <p>The Explorer builds its graph from <strong>Live Documentation</strong> — markdown files that mirror your source code and declare their dependencies explicitly.</p>
          <p>To enrich the graph:</p>
          <ul>
            <li>Run <code>npm run live-docs:generate</code> to create or update Live Docs for your workspace.</li>
            <li>Place SCIP or LSIF JSON files in <code>data/knowledge-feeds/</code> for compiler-verified symbol data.</li>
            <li>Use <code>npm run live-docs:inspect -- &lt;path&gt;</code> to trace dependency paths from the command line.</li>
          </ul>
          <p><strong>Barrel files</strong> (index.ts re-exporters) can obscure original symbol sources. If you see high fan-out warnings above, consider whether those files are masking the true dependency structure.</p>
        </div>
      </div>
    `;

    // Attach click handlers for warning nodes
    container.querySelectorAll<HTMLElement>(".warning-node").forEach(el => {
      el.addEventListener("click", () => {
        const nodeId = el.dataset.nodeId;
        if (nodeId) {
          const node = nodesById.get(nodeId);
          if (node) {
            state.view = "map";
            setActiveView("map");
            updateUrlState("map", node.id);
            schedulePersistNav();
            void selectNode(node);
          }
        }
      });
    });
  }

  function renderHealthWarnings(
    highFanout: ExplorerNodePayload[],
    highFanin: ExplorerNodePayload[],
    outboundCounts: Map<string, number>,
    inboundCounts: Map<string, number>
  ): string {
    const warnings: string[] = [];

    highFanout.forEach(node => {
      const count = outboundCounts.get(node.id) ?? 0;
      warnings.push(`
        <li>
          <span class="warning-icon">📤</span>
          <span class="warning-text">
            <span class="warning-node" data-node-id="${escapeHtml(node.id)}">${escapeHtml(node.name)}</span>
            has <strong>${count}</strong> outbound dependencies (potential barrel file)
          </span>
        </li>
      `);
    });

    highFanin.forEach(node => {
      const count = inboundCounts.get(node.id) ?? 0;
      warnings.push(`
        <li>
          <span class="warning-icon">📥</span>
          <span class="warning-text">
            <span class="warning-node" data-node-id="${escapeHtml(node.id)}">${escapeHtml(node.name)}</span>
            has <strong>${count}</strong> inbound dependencies (heavily depended-upon)
          </span>
        </li>
      `);
    });

    if (warnings.length === 0) {
      return '<div class="sources-empty">✅ No high fan-out or fan-in nodes detected. Graph looks healthy!</div>';
    }

    return `<ul class="sources-warnings">${warnings.join("")}</ul>`;
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
        void openLocalViewForNode(original);
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

const getInputById = (id: string): HTMLInputElement | null => {
  const element = document.getElementById(id);
  return element instanceof HTMLInputElement ? element : null;
};

function buildTestCoverageMap(
  graphData: ExplorerGraphPayload,
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string,
  nodesById: Map<string, ExplorerNodePayload>
): TestCoverageMap {
  const coverage: TestCoverageMap = new Map();
  const isTestNode = (node: ExplorerNodePayload | undefined): boolean =>
    !!node && (node.archetype || "").toLowerCase() === "test";

  const testIds = new Set<string>();
  graphData.nodes.forEach(node => {
    if (isTestNode(node)) {
      testIds.add(node.id);
    }
  });

  if (testIds.size === 0) {
    return coverage;
  }

  graphData.links.forEach(link => {
    const sourceId = resolveLinkEndpoint(link.source);
    const targetId = resolveLinkEndpoint(link.target);
    if (!testIds.has(sourceId) || sourceId === "" || targetId === "") {
      return;
    }
    if (testIds.has(targetId)) {
      return;
    }
    const testNode = nodesById.get(sourceId);
    if (!testNode) {
      return;
    }
    if (!coverage.has(targetId)) {
      coverage.set(targetId, []);
    }
    const bucket = coverage.get(targetId)!;
    if (!bucket.some(existing => existing.id === testNode.id)) {
      bucket.push(testNode);
    }
  });

  return coverage;
}

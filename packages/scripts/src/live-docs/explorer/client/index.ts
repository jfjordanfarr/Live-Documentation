import { createDetailPanel } from "./detailPanel";
import { requireElement, setActiveView } from "./dom";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { parseExplorerGraphPayload } from "./parsers";
import type { ExplorerState, TestCoverageMap, ViewName } from "./types";
import { createCircuitView } from "./views/circuitView";
import { createLocalView } from "./views/localView";
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
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  }
}

const globalWindow = window as Window;

attachGlobalErrorHandler();

void bootstrapExplorer();

async function bootstrapExplorer(): Promise<void> {
  try {
    const response = await fetch(`/graph?ts=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to load graph data (${response.status})`);
    }
    const rawGraph = (await response.json()) as unknown;
    const graphData = parseExplorerGraphPayload(rawGraph);
    startExplorer(graphData);
  } catch (error) {
    reportFatalExplorerError(error);
  }
}

function startExplorer(graphData: ExplorerGraphPayload): void {
  console.log("Live Docs Explorer graph loaded", graphData);

  const state: ExplorerState = {
    view: "circuit",
    selectedNode: null,
    focusedNode: null,
    filters: {
      showTests: true,
      showAssets: false
    },
    tuning: {
      bezier: {
        stubFactor: 0.8,
        stubMin: 8,
        stubMaxOffset: 8,
        verticalOffset: 0
      },
      clickBehavior: {
        singleClickFocusOnly: true,
        doubleClickRecenter: true
      },
      visual: {
        showTypeBadges: true,
        alchemyGlow: true
      }
    }
  };

  const nodesById = new Map(graphData.nodes.map(node => [node.id, node]));
  const detailPanel = createDetailPanel(nodesById);

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
      renderCurrentView();
    });
  }

  if (filterToggleAssets) {
    filterToggleAssets.addEventListener("change", event => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      state.filters.showAssets = event.target.checked;
      renderCurrentView();
    });
  }

  globalWindow.switchView = (event: MouseEvent, viewName: ViewName) => {
    event.preventDefault();
    setActiveView(viewName);
    state.view = viewName;
    renderCurrentView();
  };

  globalWindow.openInEditor = () => {
    const target = state.selectedNode ?? state.focusedNode;
    if (!target) {
      return;
    }
    void fetch(`/open?codePath=${encodeURIComponent(target.codePath)}`);
  };

  globalWindow.openInLocalView = () => {
    const target = state.selectedNode ?? state.focusedNode;
    if (!target) {
      return;
    }
    void openLocalViewForNode(target);
  };

  globalWindow.openInGraphView = () => {
    const target = state.selectedNode ?? state.focusedNode;
    if (!target) {
      return;
    }
    state.selectedNode = target;
    state.view = "graph";
    setActiveView("graph");
    renderCurrentView();
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

  renderCurrentView();
  initTuningPanel();

  async function selectNode(node: ExplorerNodePayload): Promise<void> {
    state.selectedNode = node;
    state.focusedNode = node;
    const contextName = document.getElementById("context-name");
    if (contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
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

    const wireSlider = (input: HTMLInputElement | null, outputId: string, setter: (v: number) => void): void => {
      if (!input) return;
      const output = document.getElementById(outputId) as HTMLOutputElement | null;
      input.addEventListener("input", () => {
        const value = parseFloat(input.value);
        setter(value);
        if (output) output.textContent = input.value;
        if (state.view === "map") {
          localView.drawConnections();
        }
      });
    };

    const wireCheckbox = (input: HTMLInputElement | null, setter: (v: boolean) => void): void => {
      if (!input) return;
      input.addEventListener("change", () => {
        setter(input.checked);
        renderCurrentView();
      });
    };

    wireSlider(stubFactorInput, "tuning-stub-factor-value", v => { state.tuning.bezier.stubFactor = v; });
    wireSlider(stubMinInput, "tuning-stub-min-value", v => { state.tuning.bezier.stubMin = v; });
    wireSlider(stubMaxOffsetInput, "tuning-stub-max-offset-value", v => { state.tuning.bezier.stubMaxOffset = v; });
    wireSlider(verticalOffsetInput, "tuning-vertical-offset-value", v => { state.tuning.bezier.verticalOffset = v; });

    wireCheckbox(singleClickFocusInput, v => { state.tuning.clickBehavior.singleClickFocusOnly = v; });
    wireCheckbox(doubleClickRecenterInput, v => { state.tuning.clickBehavior.doubleClickRecenter = v; });
    wireCheckbox(typeBadgesInput, v => { state.tuning.visual.showTypeBadges = v; });
    wireCheckbox(alchemyGlowInput, v => { state.tuning.visual.alchemyGlow = v; });
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

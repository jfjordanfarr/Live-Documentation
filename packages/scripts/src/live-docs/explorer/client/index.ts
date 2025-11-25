import type {
    ExplorerGraphPayload,
    ExplorerLinkPayload,
    ExplorerNodePayload
} from "../shared/types";
import { requireElement, setActiveView } from "./dom";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { createDetailPanel } from "./detailPanel";
import { createCircuitView } from "./views/circuitView";
import { createLocalView } from "./views/localView";
import type { ExplorerState, ViewName } from "./types";

declare const ForceGraph3D: ((container?: HTMLElement) => any) | undefined;

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
        const graphData: ExplorerGraphPayload = await response.json();
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
        filters: {
            showTests: false,
            showAssets: false
        }
    };

    const nodesById = new Map<string, ExplorerNodePayload>(
        graphData.nodes.map(node => [node.id, node])
    );
    const detailPanel = createDetailPanel(nodesById);
    const detailPanelApi = detailPanel;

    function resolveLinkEndpoint(endpoint: ExplorerLinkPayload["source"]): string {
        if (typeof endpoint === "string") {
            return endpoint;
        }
        if (endpoint && typeof endpoint === "object" && "id" in endpoint && typeof endpoint.id === "string") {
            return endpoint.id;
        }
        const candidate = (endpoint as { id?: unknown }).id;
        if (typeof candidate === "string") {
            return candidate;
        }
        return String(candidate ?? endpoint);
    }

    const testCoverage = buildTestCoverageMap(graphData, resolveLinkEndpoint, nodesById);

    const filterToggleTests = document.getElementById("filter-toggle-tests") as HTMLInputElement | null;
    const filterToggleAssets = document.getElementById("filter-toggle-assets") as HTMLInputElement | null;
    const statsLine = document.getElementById("stats-line");

    if (statsLine) {
        statsLine.textContent = `${graphData.stats.nodes} nodes, ${graphData.stats.links} links, ${graphData.stats.missingDependencies} missing dependencies`;
    }

    syncFilterControls();

    const circuitView = createCircuitView({
        state,
        graphData,
        resolveLinkEndpoint,
        onSelectNode: selectNode,
        onOpenLocalView: node => {
            void openLocalViewForNode(node);
        },
        testCoverage
    });

    const localView = createLocalView({
        state,
        graphData,
        resolveLinkEndpoint,
        onSelectNode: selectNode,
        testCoverage
    });

    async function openLocalViewForNode(target?: ExplorerNodePayload): Promise<void> {
        const node = target ?? state.selectedNode;
        if (!node) {
            return;
        }
        state.view = "map";
        setActiveView("map");
        await selectNode(node);
    }

    if (filterToggleTests) {
        filterToggleTests.addEventListener("change", event => {
            const target = event.target as HTMLInputElement;
            state.filters.showTests = target.checked;
            if (state.view === "circuit") {
                circuitView.render();
            } else if (state.view === "map") {
                localView.render();
            } else if (state.view === "graph") {
                renderGraph();
            }
        });
    }

    if (filterToggleAssets) {
        filterToggleAssets.addEventListener("change", event => {
            const target = event.target as HTMLInputElement;
            state.filters.showAssets = target.checked;
            if (state.view === "circuit") {
                circuitView.render();
            } else if (state.view === "map") {
                localView.render();
            } else if (state.view === "graph") {
                renderGraph();
            }
        });
    }
    let forceGraphInstance: any = null;

    function syncFilterControls(): void {
        if (filterToggleTests) {
            filterToggleTests.checked = !!state.filters.showTests;
        }
        if (filterToggleAssets) {
            filterToggleAssets.checked = !!state.filters.showAssets;
        }
    }

    globalWindow.switchView = (event: MouseEvent, viewName: ViewName) => {
        event.preventDefault();
        setActiveView(viewName);
        state.view = viewName;
        renderCurrentView();
    };

    function renderCurrentView(): void {
        if (!graphData.nodes || graphData.nodes.length === 0) {
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
            return allowedIds.has(sourceId) && allowedIds.has(targetId);
        });

        const dataForGraph = {
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

        forceGraphInstance = ForceGraph3D()(container)
            .graphData(dataForGraph)
            .nodeLabel("name")
            .nodeColor((node: ExplorerNodePayload) => {
                switch ((node.archetype || "").toLowerCase()) {
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
            .onNodeClick((node: ExplorerNodePayload) => {
                const original = nodesById.get(node.id);
                if (!original) {
                    return;
                }
                void openLocalViewForNode(original);
            });
    }

    async function selectNode(node: ExplorerNodePayload): Promise<void> {
        state.selectedNode = node;
        const contextName = document.getElementById("context-name");
        if (contextName) {
            contextName.textContent = node.codeRelativePath;
        }
        renderCurrentView();
        highlightSelectedCards();

        await detailPanelApi.showNode(node);
    }

    function highlightSelectedCards(): void {
        circuitView.highlightSelection();
        localView.highlightSelection();
    }

    globalWindow.openInEditor = () => {
        if (!state.selectedNode) {
            return;
        }
        void fetch(`/open?codePath=${encodeURIComponent(state.selectedNode.codePath)}`);
    };

    globalWindow.openInLocalView = () => {
        if (!state.selectedNode) {
            return;
        }
        void openLocalViewForNode();
    };

    globalWindow.openInGraphView = () => {
        if (!state.selectedNode) {
            return;
        }
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

    renderCurrentView();
    window.addEventListener("resize", () => {
        if (state.view === "circuit") {
            circuitView.drawConnections();
        } else if (state.view === "map") {
            localView.drawConnections();
        }
    });

    const detailClose = document.getElementById("detail-close");
    if (detailClose) {
        detailClose.addEventListener("click", () => {
            detailPanelApi.hide();
        });
    }
}

function buildTestCoverageMap(
    graphData: ExplorerGraphPayload,
    resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string,
    nodesById: Map<string, ExplorerNodePayload>
): Map<string, ExplorerNodePayload[]> {
    const coverage = new Map<string, ExplorerNodePayload[]>();
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
        if (!testIds.has(sourceId) || testIds.has(targetId)) {
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

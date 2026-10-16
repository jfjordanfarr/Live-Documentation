import { inferDefaultEntryNodeId } from "./bootstrap";
import { landingOf } from "./bootstrap/landing";
import { createDetailPanel } from "./detailPanel";
import { requireElement, setActiveView } from "./dom";
import { downloadDocs, downloadFactsJson, type DownloadBundleType, type DownloadFormat } from "./download";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { buildTestCoverageMap, resolveLinkEndpoint, getInputById } from "./graph-helpers";
import { applyLayoutSettings, layoutPresetOf, layoutSettingsOf } from "./layout-presets";
import { iconButton } from "./panels/icon-button";
import { createPinTray } from "./panels/pin-tray";
import { sourcesFacts } from "./panels/sources-facts";
import { renderSourcesView } from "./panels/sources-view";
import { initTuningPanel } from "./panels/tuning";
import { findPath, reachOf, referencesAgainstPath, type PathfindResult, type Reach } from "./pathfind";
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
import { compressSnapshot, readUrlState, scrubSnapshot, writeUrlState } from "./persistence/compressed-url-state";
import { canGoBack, canGoForward, onHistoryChange, startHistory } from "./persistence/history";
import { placeOf } from "./persistence/place";
import { searchIndexOf, type SearchHit } from "./search/graph-search";
import { createSearchBar, type SearchWords } from "./search/search-bar";
import type { ExplorerState, LocalMapPerspective, PathDestination, SpatialLayout, ViewName } from "./types";
import { createForceGraphView } from "./views/forceGraphView";
import { createLocalView } from "./views/localView";
import { explorerGraphOf } from "../shared/graph";
import type { StaticExplorerData } from "../shared/staticExplorerData";
import type { ExplorerNodePayload } from "../shared/types";
import { under } from "./views/localView/directory-state";
import { animatePerspective, captureLocalScene, holdPerspective } from "./views/perspectiveTransition";
import { addPin, EMPTY_PIN_SET, retainFile } from "./views/pin-state";
import { clearRetainedDirectory, describeRetained, newestRetained, reconcileRetained, releaseRetained, retainedKey, subjectAfterRelease, type RetainedItem, type RetainedState } from "./views/retained-state";
import { createWorldMapView } from "./views/worldMap";

declare global {
  interface Window {
    __liveDocsExplorerError?: unknown;
    switchView: (event: MouseEvent, viewName: ViewName) => void;
    openInLocalView: () => void;
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
    spatialLayout: initialState.spatialLayout ?? savedNav?.spatialLayout ?? "connections",
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
  state.destination = initialExploration.destination;
  state.reachFrom = initialExploration.reachFrom;

  const persistNav = createPersistNavScheduler(() => ({
    view: state.view,
    perspective: state.perspective,
    spatialLayout: state.spatialLayout,
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
  const statsLine = document.getElementById("stats-line");

  if (statsLine instanceof HTMLElement) {
    statsLine.textContent = `${graphData.stats.nodes} files, ${graphData.stats.links} references, ${graphData.stats.referencesOutsideScan} references outside the scan`;
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
    onRecenterNode: node => recentreOn(node),
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
    leavePath();
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
  // The 3D layout: the emergent network of the analyzed references, or the emergent tree of the declared directories
  // (the owner's distinction, 2026-10-14). A choice inside 3D, shown only there.
  const connectionsButton = iconButton("Connections", '<circle cx="12" cy="6" r="2.5"/><circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="m10.8 8.3-3.6 6.4M13.2 8.3l3.6 6.4M8.5 17h7"/>');
  connectionsButton.title = "Connections: files placed by their analyzed references";
  connectionsButton.dataset.spatialLayout = "connections";
  const structureButton = iconButton("Structure", '<circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M12 7.5v4M12 11.5l-6 4M12 11.5l6 4"/>');
  structureButton.title = "Structure: files placed by their declared directories";
  structureButton.dataset.spatialLayout = "structure";
  for (const button of [connectionsButton, structureButton]) {
    button.addEventListener("click", () => changeSpatialLayout(button.dataset.spatialLayout === "structure" ? "structure" : "connections"));
  }
  const perspectivePath = document.createElement("span");
  perspectivePath.className = "perspective-path-status";
  perspectiveControls.append(perspectivePath, compactButton, relaxedButton, tuningButton, mapButton, graphButton, connectionsButton, structureButton);
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
  // One search for the whole Explorer, in place of the Ctrl+P dialog and the FROM/TO toolbar (the owner's ask, 2026-10-14).
  const searchIndex = searchIndexOf(graphData.nodes);
  const searchBar = createSearchBar({
    index: searchIndex,
    onChooseSubject: pinHit,
    onChooseDestination: askPath,
    onClearDestination: () => { leavePath(); persistExploration(); },
    onHopClick: node => handleNodeClick(node)
  });
  let syncTuningControls = (): void => {};
  // What a path from the newest pin can reach, computed once per newest pin: the destination field offers only that.
  let reachKey: string | null = null;
  let reach: Reach | null = null;

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

  /** The words a field shows for a retained thing: its name, and where it stands for the tooltip. */
  function wordsOf(item: RetainedItem): SearchWords {
    const words = describeRetained(item, id => nodesById.get(id)?.name);
    return { name: words.name, context: words.description };
  }

  /** A destination as the retained item it would be once pinned, for its words, its files and the reverse question. */
  function itemOf(destination: PathDestination): RetainedItem {
    return destination.kind === "directory" ? { kind: "directory", directory: destination.directory }
      : { kind: "pin", pin: { nodeId: destination.nodeId, symbol: destination.symbol ?? "*" } };
  }

  /** A retained item as the destination it would be, for the reverse question. */
  function destinationOfItem(item: RetainedItem): PathDestination {
    if (item.kind === "directory") return { kind: "directory", directory: item.directory };
    return item.pin.symbol === "*" ? { kind: "file", nodeId: item.pin.nodeId } : { kind: "file", nodeId: item.pin.nodeId, symbol: item.pin.symbol };
  }

  function destinationOfHit(hit: SearchHit): PathDestination {
    if (hit.kind === "directory") return { kind: "directory", directory: hit.directory };
    return hit.kind === "symbol" ? { kind: "file", nodeId: hit.node.id, symbol: hit.symbol } : { kind: "file", nodeId: hit.node.id };
  }

  /** The files an end of a path stands for: one file, or every file of a directory. */
  function filesOf(item: RetainedItem): string[] {
    if (item.kind === "pin") return [item.pin.nodeId];
    return graphData.nodes.filter(node => under(node.id, item.directory)).map(node => node.id);
  }

  /** Make a retained item the newest, so that a path starts from it. */
  function promoteRetained(item: RetainedItem): void {
    const key = retainedKey(item);
    state.retentionOrder = [...(state.retentionOrder ?? []).filter(other => other !== key), key];
  }

  /**
   * Pin what a search found and bring it into view: a file with all its symbols, one symbol, or a directory opened.
   * The chosen thing becomes the newest pin. A destination already asked is asked again from it.
   */
  function pinHit(hit: SearchHit): void {
    const asked = state.destination ?? null;
    detailPanel.hide();
    if (hit.kind === "directory") {
      if (state.view !== "map") changePerspective(state.perspective);
      localView.openDirectory(hit.directory);
      promoteRetained({ kind: "directory", directory: hit.directory });
      (state.perspective === "2d" ? localView : forceGraphView).focusDirectory(hit.directory);
    } else {
      // From another view the Local Map opens on it; inside the map it becomes the subject and the view brings it to the eye.
      if (state.view !== "map") changePerspective(state.perspective, hit.node);
      else if (state.selectedNode?.id !== hit.node.id) markSelected(hit.node);
      if (hit.kind === "file") localView.retainNode(hit.node.id);
      else localView.retainSymbol(hit.node.id, hit.symbol);
      const pin = (state.pins ?? EMPTY_PIN_SET).entries.find(entry => entry.nodeId === hit.node.id
        && (hit.kind === "file" ? entry.symbol === "*" : entry.symbol === hit.symbol || entry.symbol === "*"));
      if (pin) promoteRetained({ kind: "pin", pin });
      if (state.perspective === "2d") localView.focusNode(hit.node.id);
      else forceGraphView.render();
    }
    state.destination = asked;
    if (asked) runPath();
    else persistExploration();
  }

  /** Ask for the path from the newest pin to what was chosen; asking is a step in the history. */
  function askPath(hit: SearchHit): void {
    state.destination = destinationOfHit(hit);
    runPath();
  }

  /** Leave the path: the destination forgotten, the exploration shown again. */
  function leavePath(): void {
    state.destination = null;
    clearPathResult();
  }

  /** Draw the path from the newest pin to the destination, or say why none is drawn; nothing asked clears the report. */
  function runPath(): void {
    const origin = newestRetained(retentionState());
    const destination = state.destination ?? null;
    if (!origin || !destination) {
      clearPathResult();
      persistExploration();
      return;
    }
    const target = itemOf(destination);
    const result = findPath(filesOf(origin), filesOf(target), nodesById, graphData.links);
    const first = result.path[0];
    const last = result.path.at(-1);
    if (origin.kind === "pin" && origin.pin.symbol !== "*" && first?.nodeId === origin.pin.nodeId) first.symbol = origin.pin.symbol;
    if (destination.kind === "file" && destination.symbol && last?.nodeId === destination.nodeId) last.symbol = destination.symbol;
    showPathResult(result, wordsOf(origin), wordsOf(target));
    persistExploration();
  }

  /** The exploration with the destination pinned as the newest item: the state the reverse question leads to. */
  function retainedWithDestination(destination: PathDestination): RetainedState {
    const item = itemOf(destination);
    const pins = state.pins ?? EMPTY_PIN_SET;
    return reconcileRetained({
      pins: item.kind === "pin" ? (item.pin.symbol === "*" ? retainFile(pins, item.pin.nodeId) : addPin(pins, item.pin.nodeId, item.pin.symbol)) : pins,
      openDirectories: item.kind === "directory" ? new Set([...(state.openDirectories ?? []), item.directory]) : state.openDirectories ?? new Set(),
      retentionOrder: [...(state.retentionOrder ?? []).filter(key => key !== retainedKey(item)), retainedKey(item)]
    });
  }

  /** The address of the reverse question, so that the offered link can be opened elsewhere. */
  function reverseHref(): string {
    const origin = newestRetained(retentionState());
    const destination = state.destination ?? null;
    if (!origin || !destination) return "#";
    const retained = retainedWithDestination(destination);
    const url = new URL(window.location.href);
    url.searchParams.set("s", compressSnapshot({
      ...readUrlState(), view: "map", perspective: state.perspective, spatialLayout: state.spatialLayout, selectedNodeId: state.selectedNode?.id ?? null,
      pinSet: retained.pins, openDirectories: retained.openDirectories, retentionOrder: retained.retentionOrder, filters: state.filters,
      layout: layoutSettingsOf(state.tuning), destination: destinationOfItem(origin)
    }));
    return `${url.pathname}?${url.searchParams.toString()}`;
  }

  /** The reverse question: the destination becomes the newest pin, and the path is asked back to where it started. */
  function swapPath(): void {
    const origin = newestRetained(retentionState());
    const destination = state.destination ?? null;
    if (!origin || !destination) return;
    const node = destination.kind === "file" ? nodesById.get(destination.nodeId) : undefined;
    if (destination.kind === "file" && !node) return;
    state.destination = destinationOfItem(origin);
    pinHit(destination.kind === "directory" ? { kind: "directory", directory: destination.directory }
      : destination.symbol ? { kind: "symbol", node: node!, symbol: destination.symbol } : { kind: "file", node: node! });
  }

  function syncPerspectiveControls(): void {
    const contextName = document.getElementById("context-name");
    if (contextName) contextName.textContent = (state.focusedNode ?? state.selectedNode)?.codeRelativePath
      ?? ([...(state.openDirectories ?? [])].map(path => path || "Scan root").join(", ") || "Scan root");
    perspectiveControls.hidden = state.view !== "map";
    const preset = layoutPresetOf(state.tuning);
    for (const button of [compactButton, relaxedButton, tuningButton, mapButton, graphButton, connectionsButton, structureButton]) button.disabled = changingPerspective;
    connectionsButton.hidden = structureButton.hidden = state.perspective !== "3d";
    connectionsButton.setAttribute("aria-pressed", String(state.spatialLayout === "connections"));
    structureButton.setAttribute("aria-pressed", String(state.spatialLayout === "structure"));
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
    const newest = newestRetained(retentionState());
    const key = newest ? retainedKey(newest) : null;
    if (key !== reachKey) {
      reachKey = key;
      reach = newest ? reachOf(filesOf(newest), nodesById, graphData.links) : null;
    }
    searchBar.sync(newest ? wordsOf(newest) : null, state.destination ? wordsOf(itemOf(state.destination)) : null, reach);
  }

  /** Change how the 3D Local Map places its files; the picture re-settles from where it stands, a step in the history. */
  function changeSpatialLayout(layout: SpatialLayout): void {
    if (state.spatialLayout === layout || changingPerspective) return;
    state.spatialLayout = layout;
    updateUrlState(state.view, (state.focusedNode ?? state.selectedNode)?.id ?? null, state.perspective, layout);
    schedulePersistNav();
    renderCurrentView();
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
    const subjectChanged = target?.id !== state.selectedNode?.id;
    if (state.view === "map" && state.perspective === perspective && !subjectChanged) return;
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
    updateUrlState(state.view, target?.id ?? null, perspective, state.spatialLayout);
    schedulePersistNav();
    renderCurrentView(subjectChanged ? "change" : "show");
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
    updateUrlState(viewName, state.focusedNode?.id ?? state.selectedNode?.id ?? null, state.perspective, state.spatialLayout);
    schedulePersistNav();
    renderCurrentView("show");
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

  // ==================
  // PATHS
  // ==================

  let restoringPath = false;

  /**
   * Shows what the search found. The Local Map draws a path only in its reading
   * direction, the start offering on the left and the end using on the right. When the
   * files connect only the other way, nothing is drawn: the status says so and
   * offers the reverse question as a link, the owner's rule of 2025-12-18.
   */
  const showPathResult = (result: PathfindResult, origin: SearchWords, destination: SearchWords): void => {
    const fromName = origin.name;
    const toName = destination.name;

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

      searchBar.showPath(result.path);

      const nodeIds = result.path.map(hop => hop.nodeId);
      localView.setActivePath({
        nodeIds,
        fromSymbol: result.path[0].symbol,
        toSymbol: result.path[result.path.length - 1].symbol
      });

      const against = referencesAgainstPath(nodeIds, graphData.links);
      const notDrawn = against === 0
        ? ""
        : `; ${against} ${against === 1 ? "reference" : "references"} between these files ${against === 1 ? "runs" : "run"} the other way and ${against === 1 ? "is" : "are"} not drawn`;
      updateUrlState(state.view, state.selectedNode?.id ?? null, state.perspective, state.spatialLayout);
      schedulePersistNav();
      renderCurrentView();
      searchBar.setStatus(`Path found: ${result.path.length} files${notDrawn}`, "success");
      return;
    }

    // Nothing drawn: a path shown before leaves, and the status says why
    clearPathResult();

    if (result.reversePath.length > 0) {
      const statusEl = searchBar.setStatus(
        `No path runs from ${fromName} to ${toName}. ${toName} reaches ${fromName} through ${result.reversePath.length} files: `,
        ""
      );
      const reverse = document.createElement("a");
      reverse.href = reverseHref();
      reverse.textContent = `show ${toName} to ${fromName}`;
      reverse.addEventListener("click", event => {
        event.preventDefault();
        swapPath();
      });
      statusEl.appendChild(reverse);
      return;
    }

    searchBar.setStatus(
      result.maxDepthReached
        ? `No path within ${Math.max(0, nodesById.size - 1)} hops either way (searched ${result.searchedNodes} files)`
        : `No path either way (searched ${result.searchedNodes} files)`,
      "error"
    );
  };

  /** Take the path's report off the page and the path out of the Local Map; the destination asked is kept by the caller. */
  const clearPathResult = (): void => {
    searchBar.clearPath();
    localView.setActivePath(null);
    if (state.view === "map" && state.perspective === "3d") forceGraphView.render();
  };

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
    // The docs' entry points decide the landing: the one entry outside the sample roots, or the root when there are
    // several or none a reading starts at; the guess by file name only when the docs declare no entry at all.
    const landing = landingOf(bundle.graph, bundle.sampleRoots ?? []);
    if (landing.kind === "file") return landing.codePath;
    if (landing.kind === "root") return null;
    return inferDefaultEntryNodeId(graphData, resolveLinkEndpoint, nodesById);
  })();
  const focusNode = initialFocusNodeId ? nodesById.get(initialFocusNodeId) : undefined;
  if (focusNode) {
    markSelected(focusNode);
  } else if (initialFocusNodeId) {
    console.warn(`Initial focus node not found: ${initialFocusNodeId}`);
  }

  // Set initial sidebar active state based on parsed URL/config
  setActiveView(state.view, state.perspective);

  // Render initial view
  // Resolve a shared path before drawing, so loading it never paints an unrelated neighborhood first.
  if (state.destination) {
    restoringPath = true;
    try { runPath(); } finally { restoringPath = false; }
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
    state.spatialLayout = place.spatialLayout ?? state.spatialLayout;
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
    state.destination = exploration.destination;
    clearPathResult();
    if (state.destination) {
      restoringPath = true;
      try { runPath(); } finally { restoringPath = false; }
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
    updateUrlState(state.view, node.id, state.perspective, state.spatialLayout);
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
    updateUrlState(state.view, node.id, state.perspective, state.spatialLayout);
    schedulePersistNav();
    highlightSelectedCards();
    if (!options?.suppressDetailPanel) {
      detailPanel.showNode(node);
    }
  }

  function handleNodeClick(node: ExplorerNodePayload, options?: SelectNodeOptions): void {
    focusSidebar(node, options);
  }

  /** The card's recentre control: the file becomes the subject, the pins kept, the detail panel left closed. */
  function recentreOn(node: ExplorerNodePayload): void {
    detailPanel.hide();
    selectNode(node, { suppressDetailPanel: true });
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
    leavePath();
    // Hide detail panel to avoid blocking the visualization
    detailPanel.hide();
    changePerspective(state.perspective, node);
  }

  /** Keep independent branches in the same portable snapshot as selection and filters. */
  function persistExploration(leavingPath = false): void {
    if (leavingPath) leavePath();
    syncPerspectiveControls();
    schedulePersistNav();
    writeUrlState({ ...readUrlState(), view: state.view, perspective: state.perspective, spatialLayout: state.spatialLayout, selectedNodeId: state.selectedNode?.id ?? null,
      pinSet: state.pins!, openDirectories: state.openDirectories ?? new Set(), retentionOrder: state.retentionOrder, filters: state.filters,
      layout: layoutSettingsOf(state.tuning), destination: state.destination ?? null, reachFrom: state.reachFrom ?? null });
  }

  /**
   * Draws the view shown. Called for a change of state, the Local Map is told to render, which it does at once when it
   * is the view shown and otherwise owes until it is; called to show a view, the Local Map runs an owed render or keeps
   * its picture and resumes its search (the owner's choice, 2026-10-16).
   */
  function renderCurrentView(reason: "change" | "show" = "change"): void {
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
    if (reason === "change") localView.render();
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
    if (state.perspective === "2d") localView.show();
    else forceGraphView.render();
    syncPerspectiveControls();
  }

  const downloadCtx = { files, bundledMarkdown };

  /** The files a chosen start of the panel's walk names: the file, or every file under the directory. */
  function startFilesOf(start: PathDestination): string[] {
    return start.kind === "file" ? [start.nodeId] : graphData.nodes.map(node => node.id).filter(id => under(id, start.directory));
  }

  function doRenderSourcesView(): void {
    const reachFrom = state.reachFrom ?? null;
    renderSourcesView({
      facts: sourcesFacts(bundle.graph, { ...(reachFrom ? { from: startFilesOf(reachFrom) } : {}), sampleRoots: bundle.sampleRoots ?? [] }),
      perspective: state.perspective,
      search: searchIndex,
      reachFrom,
      // The chosen start is exploration state: it rides the share link and the panel is drawn again from it.
      onReachFrom: (start: PathDestination | null) => {
        state.reachFrom = start;
        persistExploration();
        doRenderSourcesView();
      },
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
  }
}

import type { HistorySequence } from "@live-documentation/engine/live-docs/history/format";

import { inferDefaultEntryNodeId } from "./bootstrap";
import { landingOf } from "./bootstrap/landing";
import { createDetailPanel, type DetailPanelAction } from "./detailPanel";
import { requireElement, setActiveView } from "./dom";
import { downloadDocs, downloadFactsJson, type DownloadBundleType, type DownloadFormat } from "./download";
import { attachGlobalErrorHandler, reportFatalExplorerError } from "./errors";
import { buildTestCoverageMap, resolveLinkEndpoint, getInputById } from "./graph-helpers";
import { createHistoryControl, isHistorySequence } from "./history/history-control";
import type { HistoryMoment } from "./history/moment";
import { applyLayoutSettings, layoutPresetOf, layoutSettingsOf } from "./layout-presets";
import { iconButton } from "./panels/icon-button";
import { createItemMenu } from "./panels/item-menu";
import { createPinTray } from "./panels/pin-tray";
import { sourcesFacts } from "./panels/sources-facts";
import { renderSourcesView } from "./panels/sources-view";
import { initTuningPanel } from "./panels/tuning";
import { findPath, reachOf, referencesAgainstPath, type PathfindResult, type Reach } from "./pathfind";
import {
  parseInitialState,
  getDefaultFilters,
  getDefaultTuning,
  readPersistedUi,
  applyPersistedUi,
  readPersistedNav,
  createPersistUiScheduler,
  createPersistNavScheduler
} from "./persistence";
import { compressSnapshot, readUrlState, scrubSnapshot, writeUrlState, type UrlStateSnapshot } from "./persistence/compressed-url-state";
import { canGoBack, canGoForward, onHistoryChange, startHistory } from "./persistence/history";
import { placeOf } from "./persistence/place";
import { searchIndexOf, type SearchHit } from "./search/graph-search";
import { createSearchBar, type SearchWords } from "./search/search-bar";
import type { ExplorerState, InspectionTarget, LocalMapPerspective, PathDestination, SpatialLayout, ViewName } from "./types";
import { createForceGraphView } from "./views/forceGraphView";
import { createLocalView } from "./views/localView";
import { explorerGraphOf } from "../shared/graph";
import type { StaticExplorerData } from "../shared/staticExplorerData";
import type { ExplorerNodePayload } from "../shared/types";
import { closeDirectory as closeOpenedDirectory, openDirectory as addOpenedDirectory, under, type OpenDirectories } from "./views/localView/directory-state";
import { animatePerspective, captureLocalScene, holdPerspective } from "./views/perspectiveTransition";
import { addPin, EMPTY_PIN_SET, INTERNAL_SYMBOL, isSymbolPinned, pressSymbol, removePinsForNode, retainFile, type PinSet } from "./views/pin-state";
import { clearRetainedDirectory, describeRetained, newestRetained, reconcileRetained, releaseRetained, retainedKey, subjectAfterRelease, type RetainedItem, type RetainedState } from "./views/retained-state";
import { createWorldMapView } from "./views/worldMap";

attachGlobalErrorHandler();

void bootstrapExplorer();

/**
 * Bootstrap the explorer from the bundle the static builder wrote.
 */
async function bootstrapExplorer(): Promise<void> {
  try {
    const bundle = await loadExplorerData();
    // An address that names a commit of the history opens on it: the sequence is fetched before the first picture is
    // drawn, so that the page draws that moment once rather than today and then the moment.
    const named = readUrlState().commit;
    const history = named && bundle.history ? await loadHistory(bundle.history.file) : undefined;
    startExplorer(bundle, history);
  } catch (error) {
    reportFatalExplorerError(error);
  }
}

/** Where the bundle's data is read from: the path named by `?data=`, or `explorer-data.json` beside the page. */
function dataUrl(): URL {
  return onOwnSite(new URLSearchParams(window.location.search).get("data") ?? "./explorer-data.json", window.location.href);
}

/**
 * A path resolved against a base, refused unless it lies on the page's own site: no address and no bundle can make the
 * page read from anywhere else. The page's Content-Security-Policy refuses the same, and this says why in words.
 */
function onOwnSite(path: string, base: string | URL): URL {
  const url = new URL(path, base);
  if (url.origin !== window.location.origin) {
    throw new Error(`The Explorer reads only from its own site, and ${url.origin} is not it.`);
  }
  return url;
}

/** Loads the history file the bundle names, which lies beside its data. */
async function loadHistory(file: string): Promise<HistorySequence> {
  const url = onOwnSite(file, dataUrl());
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`No history at ${url.pathname} (${response.status}).`);
  }
  const sequence: unknown = await response.json();
  if (!isHistorySequence(sequence)) {
    throw new Error(`${url.pathname} is not a history this Explorer reads.`);
  }
  return sequence;
}

/**
 * Loads the bundle: from the path named by `?data=` on the page's own site, or from `explorer-data.json` beside the page.
 */
async function loadExplorerData(): Promise<StaticExplorerData> {
  const url = dataUrl();
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `No explorer data at ${url.pathname} (${response.status}). Build a static bundle first with \`npm run live-docs:visualize\`.`
    );
  }
  const bundle = (await response.json()) as Partial<StaticExplorerData>;
  if (!bundle.graph || typeof bundle.graph.files !== "object") {
    throw new Error(`${url.pathname} is not an Explorer bundle: it holds no graph.`);
  }
  return bundle as StaticExplorerData;
}

function startExplorer(bundle: StaticExplorerData, preloadedHistory?: HistorySequence): void {
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
    inspection: null,
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
  const initialExploration = scrubSnapshot({
    ...readUrlState(),
    inspection: initialState.hasUrlState ? readUrlState().inspection : persistedNav?.inspection,
    openDirectories: initialState.hasUrlState
      ? initialState.openDirectories : new Set(persistedNav?.openDirectories ?? [])
  }, nodesById, bundledMarkdown);
  if (new URLSearchParams(window.location.search).has("s")) state.filters = { ...state.filters, ...initialExploration.filters };
  state.pins = initialExploration.pinSet;
  state.openDirectories = initialExploration.openDirectories;
  state.retentionOrder = initialExploration.retentionOrder;
  state.destination = initialExploration.destination;
  state.reachFrom = initialExploration.reachFrom;
  state.historyCommit = initialExploration.commit;
  state.showAuthors = initialExploration.authors;
  state.inspection = initialExploration.inspection ?? null;

  const persistNav = createPersistNavScheduler(() => ({
    view: state.view,
    perspective: state.perspective,
    spatialLayout: state.spatialLayout,
    openDirectories: state.openDirectories ?? new Set(),
    selectedNodeId: state.selectedNode?.id ?? null,
    inspection: state.inspection
  }));
  const schedulePersistNav = persistNav.schedule;

  const detailPanel = createDetailPanel(nodesById, {
    files,
    bundledMarkdown,
    onClose: () => closeInspection(),
    onNodeClick: (nodeId, symbol) => openInspection({ kind: "file", nodeId, ...(symbol ? { symbol } : {}) }),
    onDirectoryClick: directory => openInspection({ kind: "directory", directory }),
    onBundledDocClick: (path, fragment) => openInspection({ kind: "bundled-doc", path, ...(fragment ? { fragment } : {}) })
  });
  const itemMenu = createItemMenu();
  const hasBundledDoc = (path: string): boolean => !!bundledMarkdown && Object.hasOwn(bundledMarkdown, path);
  /** The moment of the history the 3D picture shows, or null for today. */
  let shownMoment: HistoryMoment | null = null;
  let inspectionOpener: HTMLElement | null = null;
  const readerRoom = window.matchMedia("(max-width: 760px), (max-height: 480px)");
  const narrowNavigation = window.matchMedia("(max-width: 760px)");
  const sidebar = requireElement("sidebar");
  if (narrowNavigation.matches) sidebar.classList.add("collapsed");
  narrowNavigation.addEventListener("change", event => {
    if (event.matches) sidebar.classList.add("collapsed");
    syncSidebarToggle();
  });
  syncSidebarToggle();

  // Use imported resolveLinkEndpoint and inferDefaultEntryNodeId from extracted modules

  const testCoverage = buildTestCoverageMap(graphData, resolveLinkEndpoint, nodesById);

  const filterToggleTests = getInputById("filter-toggle-tests");
  const filterToggleAssets = getInputById("filter-toggle-assets");
  const filterToggleRelatedDocs = getInputById("filter-toggle-related-docs");
  const filterToggleCitingDocs = getInputById("filter-toggle-citing-docs");
  const statsLine = document.getElementById("stats-line");

  if (statsLine instanceof HTMLElement) {
    statsLine.textContent = `${graphData.stats.nodes} files, ${graphData.stats.links} references, ${graphData.stats.referencesOutsideScan} references outside the scan`;
  }

  const localView = createLocalView({
    state,
    onPressPin: pressPin,
    onUnpinNode: unpinNode,
    onCloseNode: closePinnedNode,
    onOpenDirectory: openRetainedDirectory,
    onCloseDirectory: closeRetainedDirectory,
    graphData,
    resolveLinkEndpoint,
    onSelectNode: node => handleNodeClick(node),
    onRecenterNode: node => recentreOn(node),
    onFocusSidebar: (node, symbol) => focusSidebar(node, symbol),
    onInspectDirectory: directory => openInspection({ kind: "directory", directory }),
    onShowNodeActions: showNodeActions,
    onShowDirectoryActions: showDirectoryActions,
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
    hasBundledDoc: hasBundledDoc,
    onShowBundledDoc: (docPath: string) => {
      showBundledDocInDetailPanel(docPath);
    },
    onFocusNode: (node: ExplorerNodePayload) => {
      focusSidebar(node);
    },
    onPressPin: pressPin,
    onReleasePin: unpinNode,
    onRecenterNode: recentreOn,
    onShowNodeActions: showNodeActions,
    onShowDirectoryActions: showDirectoryActions,
    onInspectDirectory: directory => openInspection({ kind: "directory", directory }),
    onCentreDirectory: centreOnDirectory,
    onOpenDirectory: directory => {
      openRetainedDirectory(directory);
      forceGraphView.focusDirectory(directory);
    },
    onCloseDirectory: closeRetainedDirectory
  });

  // The history of the 3D Local Map: the scrubber and the step panel over the sequence the bundle carries (ticket C4).
  const historyControl = createHistoryControl({
    parent: requireElement("view-graph"),
    room: requireElement("main"),
    bundled: bundle.history,
    preloaded: preloadedHistory,
    load: () => loadHistory(bundle.history!.file),
    nodesById,
    onMoment: (moment, renames, energy) => {
      shownMoment = moment;
      forceGraphView.setMoment(moment, renames, energy);
      syncReaderNote();
    },
    onSettle: () => forceGraphView.settle(),
    onCommit: commit => {
      if ((state.historyCommit ?? null) === commit) { syncPerspectiveControls(); return; }
      state.historyCommit = commit;
      persistExploration();
    },
    onAuthors: shown => {
      state.showAuthors = shown;
      persistExploration();
    },
    onPinFile: path => {
      const node = nodesById.get(path);
      if (node) retainNode(node.id);
    },
    hasDocument: hasBundledDoc,
    onReadDocument: path => openInspection({ kind: "bundled-doc", path }),
    onOpenChange: () => syncPerspectiveControls()
  });

  // Opening a thing is a new Local Map scope, rendered in the remembered representation.
  const openThingInLocalMap = (thing: { name: string; folder: string }): void => {
    leavePath();
    state.pins = { entries: [] };
    state.openDirectories = new Set([thing.folder]);
    state.selectedNode = null;
    closeInspection(false);
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

  if (filterToggleCitingDocs) {
    filterToggleCitingDocs.addEventListener("change", event => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }
      state.filters.showCitingDocs = event.target.checked;
      schedulePersistUi();
      persistExploration();
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
  // The history: beside the 3D layout's buttons for now, as those went beside 3D, until the consolidation pass the
  // owner expects decides where the control lives (the plan's C4). Offered only when the bundle carries a history.
  const historyButton = iconButton("History", '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>');
  historyButton.title = "History: scrub the picture through the commits";
  historyButton.addEventListener("click", () => historyControl.toggle());
  const fitButton = iconButton("Fit current scope", '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>');
  fitButton.title = "Fit the current path or retained scope";
  fitButton.addEventListener("click", () => forceGraphView.fit());
  perspectiveControls.append(fitButton, compactButton, relaxedButton, tuningButton, mapButton, graphButton, connectionsButton, structureButton, historyButton);
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
    onFocus: focusRetained,
    onOpen: () => closeInspection()
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

  /** Apply a card, search, 3D or history pin with one policy; the 2D view only keeps its visual anchor. */
  function changePinned(nodeId: string, symbol: string, nextPins: PinSet, closeExpansion = false, keepSubject = false): void {
    const previousPins = state.pins ?? EMPTY_PIN_SET;
    let previousSelected = state.selectedNode;
    if (closeExpansion && previousSelected?.id === nodeId) {
      const next = nextPins.entries.at(-1);
      previousSelected = next ? nodesById.get(next.nodeId) ?? null : null;
    }
    const selectedId = previousSelected
      ? keepSubject ? previousSelected.id : subjectAfterRelease(previousPins, nextPins, previousSelected.id)
      : null;
    const selected = selectedId ? nodesById.get(selectedId) ?? null : null;
    const frame = localView.capturePinChange(nodeId, symbol, selected?.id ?? null, closeExpansion);
    state.selectedNode = selected;
    state.pins = nextPins;
    localView.clearPathForExploration();
    localView.render();
    frame.afterRender();
    persistExploration(frame.leavingPath);
    if (state.view === "map" && state.perspective === "3d") forceGraphView.render();
  }

  /** Search and history explicitly retain every interface of a file. */
  function retainNode(nodeId: string): void {
    pressPin(nodeId, "*");
  }

  /** Search retains one symbol unless it already stands alone or under a whole-file pin. */
  function retainSymbol(nodeId: string, symbol: string): void {
    const pins = state.pins ?? EMPTY_PIN_SET;
    if (isSymbolPinned(pins, nodeId, symbol) || isSymbolPinned(pins, nodeId, "*")) return;
    pressPin(nodeId, symbol);
  }

  /** A card press narrows, adds, releases or falls back by the existing pure pin grammar. */
  function pressPin(nodeId: string, symbol: string): void {
    if (!nodesById.has(nodeId)) return;
    const pins = state.pins ?? EMPTY_PIN_SET;
    const next = symbol === "*" ? retainFile(pins, nodeId) : pressSymbol(pins, nodeId, symbol);
    if (next === pins && !localView.getActivePath()) return;
    changePinned(nodeId, symbol, next);
  }

  /** The card's X releases all its pins and its 2D expansion, preserving any other retained file. */
  function closePinnedNode(nodeId: string): void {
    changePinned(nodeId, "*", removePinsForNode(state.pins ?? EMPTY_PIN_SET, nodeId), true);
  }

  /**
   * A pressed Pin pressed again undoes itself: the file's pins go, and the subject and the card's expansion stay, so
   * Pin then Unpin leaves the map as it was. Releasing a file together with the subject is the close's and the tray's.
   */
  function unpinNode(nodeId: string): void {
    const pins = state.pins ?? EMPTY_PIN_SET;
    const next = removePinsForNode(pins, nodeId);
    if (next !== pins) changePinned(nodeId, "*", next, false, true);
  }

  /** An opened directory is shared state; the Local Map owns only its screen anchor and focus. */
  function changeRetainedDirectory(directory: string, next: OpenDirectories): void {
    const frame = localView.captureDirectoryChange(directory);
    state.openDirectories = next;
    localView.clearPathForExploration();
    localView.render();
    frame.afterRender();
    persistExploration(frame.leavingPath);
    if (state.view === "map" && state.perspective === "3d") forceGraphView.render();
  }

  function openRetainedDirectory(directory: string): void {
    const current = state.openDirectories ?? new Set<string>();
    const next = addOpenedDirectory(current, directory);
    if (next !== current || localView.getActivePath()) changeRetainedDirectory(directory, next);
  }

  function closeRetainedDirectory(directory: string): void {
    const current = state.openDirectories ?? new Set<string>();
    const next = closeOpenedDirectory(current, directory);
    if (next !== current) changeRetainedDirectory(directory, next);
  }

  function applyRetentionChange(next: RetainedState, releaseSubject = false): void {
    const current = state.selectedNode;
    const selectedId = subjectAfterRelease(state.pins ?? EMPTY_PIN_SET, next.pins, current?.id ?? null, releaseSubject);
    const selected = selectedId ? nodesById.get(selectedId) ?? null : null;
    const focused = selected;
    const view = state.perspective === "2d" ? localView : forceGraphView;
    const anchor = focused ? view.getSubjectAnchor(focused.id) : null;
    Object.assign(state, next);
    state.selectedNode = selected;
    persistExploration(!!localView.getActivePath());
    renderCurrentView();
    if (focused && anchor) view.placeSubjectAnchor(focused.id, anchor);
  }

  function focusRetained(item: RetainedItem): void {
    closeInspection(false);
    if (item.kind === "directory") {
      (state.perspective === "2d" ? localView : forceGraphView).focusDirectory(item.directory);
      persistExploration();
      return;
    }
    const node = nodesById.get(item.pin.nodeId);
    if (!node) return;
    if (state.perspective === "2d") localView.focusNode(node.id);
    else forceGraphView.focusNode(node.id);
    persistExploration();
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
    closeInspection(false);
    if (hit.kind === "directory") {
      if (state.view !== "map") changePerspective(state.perspective);
      openRetainedDirectory(hit.directory);
      promoteRetained({ kind: "directory", directory: hit.directory });
      (state.perspective === "2d" ? localView : forceGraphView).focusDirectory(hit.directory);
    } else {
      // From another view the Local Map opens on it; inside the map it becomes the subject and the view brings it to the eye.
      if (state.view !== "map") changePerspective(state.perspective, hit.node);
      else if (state.selectedNode?.id !== hit.node.id) markSelected(hit.node);
      if (hit.kind === "file") retainNode(hit.node.id);
      else retainSymbol(hit.node.id, hit.symbol);
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
    if (contextName) contextName.textContent = state.selectedNode?.codeRelativePath
      ?? ([...(state.openDirectories ?? [])].map(path => path || "Scan root").join(", ") || "Scan root");
    perspectiveControls.hidden = state.view !== "map";
    const preset = layoutPresetOf(state.tuning);
    for (const button of [fitButton, compactButton, relaxedButton, tuningButton, mapButton, graphButton, connectionsButton, structureButton, historyButton]) button.disabled = changingPerspective;
    fitButton.hidden = connectionsButton.hidden = structureButton.hidden = state.perspective !== "3d";
    historyButton.hidden = state.perspective !== "3d" || !historyControl.available;
    historyButton.setAttribute("aria-pressed", String(historyControl.isOpen()));
    connectionsButton.setAttribute("aria-pressed", String(state.spatialLayout === "connections"));
    structureButton.setAttribute("aria-pressed", String(state.spatialLayout === "structure"));
    compactButton.setAttribute("aria-pressed", String(preset === "compact"));
    relaxedButton.setAttribute("aria-pressed", String(preset === "relaxed"));
    tuningButton.classList.toggle("custom-layout", preset === "custom");
    tuningButton.title = preset === "custom" ? "Custom layout — open tuning" : "Layout tuning";
    tuningButton.setAttribute("aria-label", preset === "custom" ? "Layout tuning: Custom" : "Layout tuning");
    mapButton.setAttribute("aria-pressed", String(state.perspective === "2d"));
    graphButton.setAttribute("aria-pressed", String(state.perspective === "3d"));
    state.retentionOrder = reconcileRetained(retentionState()).retentionOrder;
    historyControl.sync({
      visible: state.view === "map" && state.perspective === "3d",
      pins: { files: [...new Set((state.pins ?? EMPTY_PIN_SET).entries.map(pin => pin.nodeId))], directories: [...(state.openDirectories ?? [])] },
      subject: state.selectedNode?.id ?? null,
      showAuthors: state.showAuthors ?? false,
      tuning: state.tuning.history
    });
    pinTray.sync(retentionState(), state.view === "map", changingPerspective, item => historyControl.absence(item));
    const newest = newestRetained(retentionState());
    const key = newest ? retainedKey(newest) : null;
    if (key !== reachKey) {
      reachKey = key;
      reach = newest ? reachOf(filesOf(newest), nodesById, graphData.links) : null;
    }
    searchBar.sync(newest ? wordsOf(newest) : null, state.destination ? wordsOf(itemOf(state.destination)) : null, reach, state.view === "map");
  }

  /** Change how the 3D Local Map places its files; the picture re-settles from where it stands, a step in the history. */
  function changeSpatialLayout(layout: SpatialLayout): void {
    if (state.spatialLayout === layout || changingPerspective) return;
    state.spatialLayout = layout;
    renderCurrentView();
    persistExploration();
  }

  let changingPerspective = false;
  let pendingPerspective: (() => void) | null = null;
  let perspectiveEpoch = 0;
  let transitionDestination: LocalMapPerspective | null = null;
  let releasePerspectiveCover = (): void => {};
  let cancelPerspectiveAnimation = (): void => {};

  /** Change representation around the map subject; the independently inspected evidence stays open. */
  function changePerspective(perspective: LocalMapPerspective, target = state.selectedNode): void {
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
    // The 2D map draws today's docs: leaving 3D returns the picture to today and closes the history.
    if (perspective === "2d") historyControl.leave();
    state.selectedNode = target;
    state.view = "map";
    state.perspective = perspective;
    setActiveView(state.view, perspective);
    renderCurrentView(subjectChanged ? "change" : "show");
    persistExploration();
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

  // The page's controls are wired here, never by attributes in its HTML, which its Content-Security-Policy refuses to run.
  for (const button of document.querySelectorAll<HTMLButtonElement>("#sidebar .nav-item[data-view]")) {
    const viewName = button.dataset.view as ViewName;
    button.addEventListener("click", event => {
      event.preventDefault();
      if (viewName === "map") { changePerspective(state.perspective); return; }
      // The other views draw today's docs: leaving 3D returns the picture to today and closes the history.
      historyControl.leave();
      setActiveView(viewName, state.perspective);
      state.view = viewName;
      renderCurrentView("show");
      persistExploration();
    });
  }

  requireElement("download-doc-btn").addEventListener("click", () => detailPanel.downloadCurrentDoc());

  const zooms: Record<string, () => void> = {
    in: () => localView.zoomIn(),
    out: () => localView.zoomOut(),
    reset: () => localView.resetZoom()
  };
  for (const button of document.querySelectorAll<HTMLButtonElement>("#controls [data-zoom]")) {
    const zoom = zooms[button.dataset.zoom ?? ""];
    button.addEventListener("click", () => {
      if (state.view !== "map" || state.perspective !== "2d") return;
      zoom();
      localView.drawConnections();
    });
  }

  requireElement("sidebar-toggle").addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    syncSidebarToggle();
  });

  function syncSidebarToggle(): void {
    const collapsed = sidebar.classList.contains("collapsed");
    const button = requireElement<HTMLButtonElement>("sidebar-toggle");
    button.textContent = collapsed ? "▶" : "◀";
    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute("aria-label", collapsed ? "Open navigation" : "Collapse navigation");
    button.title = collapsed ? "Open navigation" : "Collapse navigation";
  }

  window.addEventListener("resize", () => {
    syncReaderPresentation();
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

    // A question asked through the global bar opens the Local Map for every outcome. Restoring a saved place keeps
    // its chosen view, where the question is retained and the report stays hidden until the person returns to the map.
    if (!restoringPath && state.view !== "map") {
      state.view = "map";
      setActiveView("map", state.perspective);
    }

    if (result.path.length > 0) {
      // Reading evidence is independent of the path being drawn.

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
        : `; ${against} ${against === 1 ? "reference" : "references"} between these files ${against === 1 ? "runs" : "run"} the other way and ${against === 1 ? "is" : "are"} not drawn in 2D`;
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
      renderCurrentView("show");
      return;
    }

    searchBar.setStatus(
      result.maxDepthReached
        ? `No path within ${Math.max(0, nodesById.size - 1)} hops either way (searched ${result.searchedNodes} files)`
        : `No path either way (searched ${result.searchedNodes} files)`,
      "error"
    );
    renderCurrentView("show");
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
  // An address that names a commit opens the 3D picture on that moment, before the first drawing.
  if (state.historyCommit && state.view === "map" && state.perspective === "3d") void historyControl.showCommit(state.historyCommit);
  renderCurrentView();
  renderInspection();

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
      const subject = state.selectedNode;
      const view = localView;
      const anchor = subject ? view.getSubjectAnchor(subject.id) : null;
      if (subject && anchor) view.placeSubjectAnchor(subject.id, anchor);
      renderCurrentView();
      if (subject && anchor) view.placeSubjectAnchor(subject.id, anchor);
    },
    drawLocalConnections: () => localView.drawConnections(),
  });

  // Record the actual initial subject and reader before arming history, including plain and remembered entry links.
  persistExploration();
  // Back and Forward: a move to another place is an entry, and landing on one shows the place its address names.
  startHistory({ placeOf, restore: restoreFromUrl });
  const backButton = document.getElementById("history-back");
  const forwardButton = document.getElementById("history-forward");
  const readerBack = requireElement<HTMLButtonElement>("reader-back");
  const readerForward = requireElement<HTMLButtonElement>("reader-forward");
  const syncHistoryButtons = (): void => {
    if (backButton instanceof HTMLButtonElement) {
      backButton.disabled = !canGoBack();
    }
    if (forwardButton instanceof HTMLButtonElement) {
      forwardButton.disabled = !canGoForward();
    }
    readerBack.disabled = !canGoBack();
    readerForward.disabled = !canGoForward();
  };
  onHistoryChange(syncHistoryButtons);
  syncHistoryButtons();
  backButton?.addEventListener("click", () => window.history.back());
  forwardButton?.addEventListener("click", () => window.history.forward());
  readerBack.addEventListener("click", () => window.history.back());
  readerForward.addEventListener("click", () => window.history.forward());
  readerRoom.addEventListener("change", syncReaderPresentation);
  document.addEventListener("keydown", event => {
    if (event.defaultPrevented || !state.inspection) return;
    if (event.key === "Escape") {
      // An open popover, the ancestry chooser, stands above the reader; the browser closes it on this same Escape.
      if (document.querySelector(":popover-open")) return;
      event.preventDefault();
      closeInspection();
      return;
    }
    if (event.key !== "Tab" || !readerRoom.matches) return;
    const controls = [...requireElement("detail-panel").querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]'
    )].filter(element => !element.closest("[hidden], [inert]") && element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || !requireElement("detail-panel").contains(document.activeElement))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  /** Shows the place the address names, after Back or Forward; the history turns any write it makes into a rewrite of that entry. */
  function restoreFromUrl(): void {
    const place = parseInitialState();
    const view: ViewName = place.hasUrlState ? place.view : bundle.board ? "world" : place.view;
    const exploration = scrubSnapshot({ ...readUrlState(), openDirectories: place.openDirectories }, nodesById, bundledMarkdown);
    const nextTuning = applyLayoutSettings(state.tuning, exploration.layout);
    const nextFilters = new URLSearchParams(window.location.search).has("s")
      ? { ...state.filters, ...exploration.filters } : state.filters;
    const nextMap = {
      ...exploration,
      view,
      perspective: place.perspective ?? state.perspective,
      spatialLayout: place.spatialLayout ?? state.spatialLayout,
      selectedNodeId: place.nodeId ?? null,
      layout: layoutSettingsOf(nextTuning),
      filters: nextFilters,
      inspection: null
    };
    itemMenu.close();
    // Evidence-only Back/Forward leaves camera, DOM identity and the running layout search untouched.
    if (compressSnapshot(nextMap) === compressSnapshot({ ...explorationSnapshot(), inspection: null })) {
      state.inspection = exploration.inspection ?? null;
      renderInspection();
      schedulePersistNav();
      return;
    }
    state.view = view;
    state.perspective = place.perspective ?? state.perspective;
    state.spatialLayout = place.spatialLayout ?? state.spatialLayout;
    state.inspection = exploration.inspection ?? null;
    state.tuning = nextTuning;
    state.filters = nextFilters;
    syncFilterControls();
    state.pins = exploration.pinSet;
    state.openDirectories = exploration.openDirectories;
    state.retentionOrder = exploration.retentionOrder;
    setActiveView(view, state.perspective);
    const node = place.nodeId ? nodesById.get(place.nodeId) ?? null : null;
    state.selectedNode = node;
    const contextName = document.getElementById("context-name");
    if (node && contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
    state.destination = exploration.destination;
    state.reachFrom = exploration.reachFrom;
    state.showAuthors = exploration.authors;
    // Path restoration can persist synchronously; it must already see the restored moment.
    state.historyCommit = exploration.commit;
    clearPathResult();
    if (state.destination) {
      restoringPath = true;
      try { runPath(); } finally { restoringPath = false; }
    }
    renderCurrentView();
    // The moment the address names, or today; the history turns the write this makes into a rewrite of the entry.
    if (view === "map" && state.perspective === "3d") void historyControl.showCommit(exploration.commit);
    else historyControl.leave();
    schedulePersistNav();
    highlightSelectedCards();
    renderInspection();
  }

  interface SelectNodeOptions {
    /** If true, suppress opening the detail panel */
    suppressDetailPanel?: boolean;
  }

  /** The node the person is looking at: the state, the context name, the address and the stored place, without drawing. */
  function markSelected(node: ExplorerNodePayload): void {
    state.selectedNode = node;
    const contextName = document.getElementById("context-name");
    if (contextName instanceof HTMLElement) {
      contextName.textContent = node.codeRelativePath;
    }
  }

  function selectNode(node: ExplorerNodePayload, options?: SelectNodeOptions): void {
    markSelected(node);
    renderCurrentView();
    highlightSelectedCards();
    if (!options?.suppressDetailPanel) {
      focusSidebar(node);
    }
  }

  function focusSidebar(node: ExplorerNodePayload, symbol?: string): void {
    openInspection({ kind: "file", nodeId: node.id, ...(symbol ? { symbol } : {}) });
  }

  function handleNodeClick(node: ExplorerNodePayload): void {
    focusSidebar(node);
  }

  /** Centre is deliberate navigation: retain the working set and close the reader. */
  function recentreOn(node: ExplorerNodePayload): void {
    closeInspection(false);
    leavePath();
    if (state.view !== "map") changePerspective(state.perspective, node);
    else selectNode(node, { suppressDetailPanel: true });
    if (state.perspective === "3d") forceGraphView.focusNode(node.id);
    else localView.focusNode(node.id);
    persistExploration();
  }

  function renderInspection(): void {
    const target = state.inspection;
    if (!target) {
      hideInspection();
      return;
    }
    const panel = requireElement("detail-panel");
    const heldFocus = panel.contains(document.activeElement);
    if (!panel.classList.contains("visible") && document.activeElement instanceof HTMLElement
      && document.activeElement !== document.body && !panel.contains(document.activeElement)) {
      inspectionOpener = document.activeElement;
    }
    pinTray.close();
    if (target.kind === "file") {
      const node = nodesById.get(target.nodeId);
      if (node) detailPanel.showNode(node, target.symbol);
    } else if (target.kind === "directory") detailPanel.showDirectory(target.directory);
    else if (bundledMarkdown && Object.hasOwn(bundledMarkdown, target.path)) {
      detailPanel.showBundledDoc(target.path, bundledMarkdown[target.path], target.fragment);
    }
    syncInspectionActions();
    syncReaderNote();
    syncReaderPresentation();
    // A followed evidence link can replace the focused anchor on wide screens too.
    if (heldFocus && !panel.contains(document.activeElement)) requireElement("detail-close").focus({ preventScroll: true });
  }

  function actionsForFile(node: ExplorerNodePayload, symbol?: string): DetailPanelAction[] {
    const pins = state.pins ?? EMPTY_PIN_SET;
    const whole = isSymbolPinned(pins, node.id, "*");
    const pinned = symbol ? isSymbolPinned(pins, node.id, symbol) : whole;
    const part = symbol === INTERNAL_SYMBOL ? "Internals" : "symbol";
    return [
      {
        label: symbol ? (pinned ? `Unpin ${part}` : whole ? `Pin only ${part === "symbol" ? "this symbol" : part}` : `Pin ${part}`) : whole ? "Unpin file" : "Pin file",
        pressed: pinned,
        run: () => {
          if (!symbol && whole) unpinNode(node.id);
          else pressPin(node.id, symbol ?? "*");
        }
      },
      { label: `Centre on ${node.name}`, text: "Centre", run: () => recentreOn(node) }
    ];
  }

  function syncInspectionActions(): void {
    const target = state.inspection;
    if (target?.kind === "file") {
      const node = nodesById.get(target.nodeId);
      detailPanel.setActions(node ? actionsForFile(node, target.symbol) : []);
    } else if (target?.kind === "directory") {
      const opened = state.openDirectories?.has(target.directory) ?? false;
      detailPanel.setActions([
        {
          label: opened ? "Close directory" : "Open directory",
          pressed: opened,
          run: () => opened ? closeRetainedDirectory(target.directory) : openRetainedDirectory(target.directory)
        },
        { label: "Centre on directory", text: "Centre", run: () => centreOnDirectory(target.directory) }
      ]);
    } else detailPanel.setActions([]);
  }

  /** While the 3D picture shows a past commit, the reader says that its evidence is today's version (2026-10-20). */
  function syncReaderNote(): void {
    const past = state.inspection && shownMoment && state.view === "map" && state.perspective === "3d" ? shownMoment.commit : null;
    detailPanel.setNote(past ? `Today's version. The picture shows ${past.date.slice(0, 10)}, commit ${past.id.slice(0, 8)}.` : null);
  }

  /** A full reader covers a small viewport; opening it never resizes the underlying map. */
  function syncReaderPresentation(): void {
    const panel = requireElement("detail-panel");
    const modal = !!state.inspection && readerRoom.matches;
    panel.setAttribute("role", modal ? "dialog" : "complementary");
    if (modal) panel.setAttribute("aria-modal", "true");
    else panel.removeAttribute("aria-modal");
    const background = [
      sidebar,
      ...requireElement("main").children,
      ...requireElement("views").children
    ];
    for (const element of background) {
      if (element instanceof HTMLElement && element.id !== "views" && element !== panel) {
        element.inert = modal || (element.classList.contains("view-container") && !element.classList.contains("active"));
      }
    }
    if (modal && !panel.contains(document.activeElement)) requireElement("detail-close").focus({ preventScroll: true });
  }

  /** Reader actions never change the subject, working set, path or camera. */
  function openInspection(target: InspectionTarget): void {
    const validated = scrubSnapshot({ ...readUrlState(), inspection: target }, nodesById, bundledMarkdown).inspection;
    if (!validated) return;
    state.inspection = validated;
    itemMenu.close();
    renderInspection();
    persistExploration();
  }

  /** Hiding by Close or by Back gives keyboard focus back to the visible inspection opener. */
  function hideInspection(): void {
    const returnFocus = document.activeElement instanceof HTMLElement && requireElement("detail-panel").contains(document.activeElement);
    detailPanel.hide();
    syncReaderPresentation();
    if (returnFocus) {
      const usable = (element: HTMLElement | null | undefined): element is HTMLElement => !!element?.isConnected
        && element.getClientRects().length > 0 && !element.closest("[hidden], [inert]");
      // A render rebuilds the cards, so an opener can be gone; its successor carries the same accessible name.
      const label = inspectionOpener?.getAttribute("aria-label");
      const successor = label ? document.querySelector<HTMLElement>(`[aria-label="${CSS.escape(label)}"]`) : null;
      const trayToggle = inspectionOpener?.closest(".pin-tray") ? document.querySelector<HTMLElement>(".pin-tray-toggle") : null;
      // A sphere tap records no opener. The map itself takes focus then, never a text field that raises a phone's keyboard.
      const target = [inspectionOpener, successor, trayToggle].find(usable) ?? document.querySelector<HTMLElement>(".view-container.active");
      if (target) focusWithoutTabStop(target);
    }
    inspectionOpener = null;
  }

  /** Focus an element; one that is not a control takes focus without joining the tab order. */
  function focusWithoutTabStop(element: HTMLElement): void {
    if (!element.hasAttribute("tabindex") && element.tabIndex < 0) {
      element.tabIndex = -1;
      element.addEventListener("blur", () => element.removeAttribute("tabindex"), { once: true });
    }
    element.focus({ preventScroll: true });
  }

  function closeInspection(persist = true): void {
    const wasOpen = !!state.inspection;
    state.inspection = null;
    hideInspection();
    if (persist && wasOpen) persistExploration();
  }

  function showNodeActions(node: ExplorerNodePayload, symbol: string | undefined, anchor: { x: number; y: number }, onClose?: () => void): void {
    itemMenu.show(anchor, [
      { label: symbol ? `Inspect ${symbol === INTERNAL_SYMBOL ? "Internals" : symbol}` : "Inspect " + node.name, run: () => focusSidebar(node, symbol) },
      ...actionsForFile(node, symbol)
    ], onClose);
  }

  function centreOnDirectory(directory: string): void {
    closeInspection(false);
    leavePath();
    const current = state.openDirectories ?? new Set<string>();
    state.openDirectories = addOpenedDirectory(current, directory);
    if (state.view !== "map" || state.selectedNode) changePerspective(state.perspective, null);
    else if (state.openDirectories !== current) renderCurrentView();
    (state.perspective === "2d" ? localView : forceGraphView).focusDirectory(directory);
    persistExploration();
  }

  function showDirectoryActions(directory: string, anchor: { x: number; y: number }, onClose?: () => void): void {
    const opened = state.openDirectories?.has(directory) ?? false;
    itemMenu.show(anchor, [
      { label: "Inspect directory", run: () => openInspection({ kind: "directory", directory }) },
      { label: opened ? "Close directory" : "Open directory", run: () => opened ? closeRetainedDirectory(directory) : openRetainedDirectory(directory) },
      { label: "Centre on directory", run: () => centreOnDirectory(directory) },
      {
        label: "Clear pins inside this directory",
        run: () => applyRetentionChange(clearRetainedDirectory(retentionState(), directory),
          !!state.selectedNode && under(state.selectedNode.id, directory))
      }
    ], onClose);
  }

  function highlightSelectedCards(): void {
    localView.highlightSelection();
  }

  function openLocalViewForNode(target?: ExplorerNodePayload): void {
    const node = target ?? state.selectedNode;
    if (!node) {
      return;
    }
    recentreOn(node);
  }

  /** All portable exploration state is projected from its application owner in one place. */
  function explorationSnapshot(): UrlStateSnapshot {
    return {
      view: state.view,
      perspective: state.perspective,
      spatialLayout: state.spatialLayout,
      selectedNodeId: state.selectedNode?.id ?? null,
      pinSet: state.pins ?? EMPTY_PIN_SET,
      openDirectories: state.openDirectories ?? new Set(),
      retentionOrder: state.retentionOrder,
      filters: state.filters,
      layout: layoutSettingsOf(state.tuning),
      destination: state.destination ?? null,
      reachFrom: state.reachFrom ?? null,
      commit: state.historyCommit ?? null,
      authors: state.showAuthors ?? false,
      inspection: state.inspection
    };
  }

  /** Keep independent branches and explicitly open evidence in the portable snapshot. */
  function persistExploration(leavingPath = false): void {
    if (leavingPath) leavePath();
    syncPerspectiveControls();
    syncInspectionActions();
    schedulePersistNav();
    writeUrlState(explorationSnapshot());
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
      history: bundle.history,
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

  function showBundledDocInDetailPanel(path: string): void {
    openInspection({ kind: "bundled-doc", path });
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
    if (filterToggleCitingDocs) {
      filterToggleCitingDocs.checked = state.filters.showCitingDocs;
    }
  }
}

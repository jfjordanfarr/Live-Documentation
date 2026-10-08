# packages/explorer/src/client/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/index.ts
- Generated At: 2026-10-08T17:03:51.606Z

## Authored
### Purpose
Bootstrap entry point for the Explorer client: loads the bundle, projects its graph index into the payload the views render, initialises the views and the detail panel, and wires the global navigation and toolbar handlers.

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was modularised.
- Since 2026-09-28 the bundle is loaded from `explorer-data.json` beside the page, or from the URL named by `?data=`; the fetches from the retired server and their lazy loader are gone.
- Exposes `window.switchView`, `window.openInEditor`, and zoom controls to the HTML template.
- The initial node (from the address, the stored place or the heuristic) is selected before the first drawing (`markSelected`, the selection's bookkeeping without a drawing, which `selectNode` also uses), so the page draws the focused picture once. Until 2026-10-06 it drew a default picture and then, a hundred milliseconds later, the focused one, and every load paid the Local Map's layout twice; found when the layout lab's verify pass read the page's second drawing ([Turn 12](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12)).
- The opened directories (2026-10-08, [the decisions log](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): read with the pins from the address at start and after Back, through `scrubSnapshot` with the `?dir=` door folded in, written with the pins by `persistExploration`; an address that opens a directory and names no file puts nothing in focus, so the directory draws alone rather than around a heuristic entry file.
- The Knowledge Sources panel (2026-10-08) is rendered from the bundle's graph itself rather than the projected payload, and a file named on it goes to the detail panel through `focusSidebar`, which changes the focus without redrawing the view, so the panel keeps its open groups and its scroll.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.inferDefaultEntryNodeId`](./bootstrap/index.ts.mdmd.md#symbol-inferdefaultentrynodeid)
- [`detailPanel.createDetailPanel`](./detailPanel.ts.mdmd.md#symbol-createdetailpanel)
- [`dom.requireElement`](./dom.ts.mdmd.md#symbol-requireelement)
- [`dom.setActiveView`](./dom.ts.mdmd.md#symbol-setactiveview)
- [`download.DownloadBundleType`](./download.ts.mdmd.md#symbol-downloadbundletype)
- [`download.DownloadFormat`](./download.ts.mdmd.md#symbol-downloadformat)
- [`download.downloadDocs`](./download.ts.mdmd.md#symbol-downloaddocs)
- [`download.downloadFactsJson`](./download.ts.mdmd.md#symbol-downloadfactsjson)
- [`errors.attachGlobalErrorHandler`](./errors.ts.mdmd.md#symbol-attachglobalerrorhandler)
- [`errors.reportFatalExplorerError`](./errors.ts.mdmd.md#symbol-reportfatalexplorererror)
- [`graph-helpers.buildTestCoverageMap`](./graph-helpers.ts.mdmd.md#symbol-buildtestcoveragemap)
- [`graph-helpers.getInputById`](./graph-helpers.ts.mdmd.md#symbol-getinputbyid)
- [`graph-helpers.resolveLinkEndpoint`](./graph-helpers.ts.mdmd.md#symbol-resolvelinkendpoint)
- [`omnisearch.initOmnisearch`](./panels/omnisearch.ts.mdmd.md#symbol-initomnisearch)
- [`sources-facts.sourcesFacts`](./panels/sources-facts.ts.mdmd.md#symbol-sourcesfacts-function)
- [`sources-view.renderSourcesView`](./panels/sources-view.ts.mdmd.md#symbol-rendersourcesview)
- [`tuning.initTuningPanel`](./panels/tuning.ts.mdmd.md#symbol-inittuningpanel)
- [`pathfind.PathHop`](./pathfind.ts.mdmd.md#symbol-pathhop)
- [`pathfind.PathfindEndpoint`](./pathfind.ts.mdmd.md#symbol-pathfindendpoint)
- [`pathfind.PathfindResult`](./pathfind.ts.mdmd.md#symbol-pathfindresult)
- [`pathfind.findPath`](./pathfind.ts.mdmd.md#symbol-findpath)
- [`pathfind.initPathfind`](./pathfind.ts.mdmd.md#symbol-initpathfind)
- [`pathfind.parsePathfindFromUrl`](./pathfind.ts.mdmd.md#symbol-parsepathfindfromurl)
- [`pathfind.pathfindHref`](./pathfind.ts.mdmd.md#symbol-pathfindhref)
- [`pathfind.referencesAgainstPath`](./pathfind.ts.mdmd.md#symbol-referencesagainstpath)
- [`pathfind.updatePathfindUrl`](./pathfind.ts.mdmd.md#symbol-updatepathfindurl)
- [`compressed-url-state.readUrlState`](./persistence/compressed-url-state.ts.mdmd.md#symbol-readurlstate)
- [`compressed-url-state.scrubSnapshot`](./persistence/compressed-url-state.ts.mdmd.md#symbol-scrubsnapshot)
- [`compressed-url-state.writeUrlState`](./persistence/compressed-url-state.ts.mdmd.md#symbol-writeurlstate)
- [`history.canGoBack`](./persistence/history.ts.mdmd.md#symbol-cangoback)
- [`history.canGoForward`](./persistence/history.ts.mdmd.md#symbol-cangoforward)
- [`history.onHistoryChange`](./persistence/history.ts.mdmd.md#symbol-onhistorychange)
- [`history.startHistory`](./persistence/history.ts.mdmd.md#symbol-starthistory)
- [`index.applyPersistedUi`](./persistence/index.ts.mdmd.md#symbol-applypersistedui)
- [`index.createPersistNavScheduler`](./persistence/index.ts.mdmd.md#symbol-createpersistnavscheduler)
- [`index.createPersistUiScheduler`](./persistence/index.ts.mdmd.md#symbol-createpersistuischeduler)
- [`index.getDefaultFilters`](./persistence/index.ts.mdmd.md#symbol-getdefaultfilters)
- [`index.getDefaultTuning`](./persistence/index.ts.mdmd.md#symbol-getdefaulttuning)
- [`index.parseInitialState`](./persistence/index.ts.mdmd.md#symbol-parseinitialstate)
- [`index.readPersistedNav`](./persistence/index.ts.mdmd.md#symbol-readpersistednav)
- [`index.readPersistedUi`](./persistence/index.ts.mdmd.md#symbol-readpersistedui)
- [`index.updateUrlState`](./persistence/index.ts.mdmd.md#symbol-updateurlstate)
- [`place.placeOf`](./persistence/place.ts.mdmd.md#symbol-placeof)
- [`types.ExplorerState`](./types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
- [`index.createCircuitView`](./views/circuitView/index.ts.mdmd.md#symbol-createcircuitview)
- [`forceGraphView.createForceGraphView`](./views/forceGraphView.ts.mdmd.md#symbol-createforcegraphview)
- [`index.createLocalView`](./views/localView/index.ts.mdmd.md#symbol-createlocalview)
- [`index.createMembraneView`](./views/membraneView/index.ts.mdmd.md#symbol-createmembraneview)
- [`perspectiveTransition.animatePerspective`](./views/perspectiveTransition.ts.mdmd.md#symbol-animateperspective)
- [`perspectiveTransition.captureLocalScene`](./views/perspectiveTransition.ts.mdmd.md#symbol-capturelocalscene)
- [`perspectiveTransition.holdPerspective`](./views/perspectiveTransition.ts.mdmd.md#symbol-holdperspective)
- [`index.createWorldMapView`](./views/worldMap/index.ts.mdmd.md#symbol-createworldmapview)
- [`graph.explorerGraphOf`](../shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`StaticExplorerData`](../shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`template.context-name`](../shared/template.html.mdmd.md#symbol-context-name)
- [`template.history-back`](../shared/template.html.mdmd.md#symbol-history-back)
- [`template.history-forward`](../shared/template.html.mdmd.md#symbol-history-forward)
- [`template.pathfind-path`](../shared/template.html.mdmd.md#symbol-pathfind-path)
- [`template.pathfind-status`](../shared/template.html.mdmd.md#symbol-pathfind-status)
- [`template.sidebar`](../shared/template.html.mdmd.md#symbol-sidebar)
- [`template.sidebar-toggle`](../shared/template.html.mdmd.md#symbol-sidebar-toggle)
- [`template.stats-line`](../shared/template.html.mdmd.md#symbol-stats-line)
- [`template.view-map`](../shared/template.html.mdmd.md#symbol-view-map)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

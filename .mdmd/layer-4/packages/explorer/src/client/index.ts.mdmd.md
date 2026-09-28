# packages/explorer/src/client/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/index.ts
- Generated At: 2026-09-28T23:04:08.807Z

## Authored
### Purpose
Bootstrap entry point for the Explorer client: loads the bundle, projects its graph index into the payload the views render, initialises the views and the detail panel, and wires the global navigation and toolbar handlers.

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was modularised.
- Since 2026-09-28 the bundle is loaded from `explorer-data.json` beside the page, or from the URL named by `?data=`; the fetches from the retired server and their lazy loader are gone.
- Exposes `window.switchView`, `window.openInEditor`, and zoom controls to the HTML template.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `GET open` (contract)
- [`index.inferDefaultEntryNodeId`](./bootstrap/index.ts.mdmd.md#symbol-inferdefaultentrynodeid)
- [`detailPanel.createDetailPanel`](./detailPanel.ts.mdmd.md#symbol-createdetailpanel)
- [`dom.requireElement`](./dom.ts.mdmd.md#symbol-requireelement)
- [`dom.setActiveView`](./dom.ts.mdmd.md#symbol-setactiveview)
- [`download.DownloadBundleType`](./download.ts.mdmd.md#symbol-downloadbundletype)
- [`download.DownloadFormat`](./download.ts.mdmd.md#symbol-downloadformat)
- [`download.downloadDocs`](./download.ts.mdmd.md#symbol-downloaddocs)
- [`errors.attachGlobalErrorHandler`](./errors.ts.mdmd.md#symbol-attachglobalerrorhandler)
- [`errors.reportFatalExplorerError`](./errors.ts.mdmd.md#symbol-reportfatalexplorererror)
- [`graph-helpers.buildTestCoverageMap`](./graph-helpers.ts.mdmd.md#symbol-buildtestcoveragemap)
- [`graph-helpers.getInputById`](./graph-helpers.ts.mdmd.md#symbol-getinputbyid)
- [`graph-helpers.resolveLinkEndpoint`](./graph-helpers.ts.mdmd.md#symbol-resolvelinkendpoint)
- [`omnisearch.initOmnisearch`](./panels/omnisearch.ts.mdmd.md#symbol-initomnisearch)
- [`sources-view.renderSourcesView`](./panels/sources-view.ts.mdmd.md#symbol-rendersourcesview)
- [`tuning.initTuningPanel`](./panels/tuning.ts.mdmd.md#symbol-inittuningpanel)
- [`pathfind.PathfindEndpoint`](./pathfind.ts.mdmd.md#symbol-pathfindendpoint)
- [`pathfind.PathfindResult`](./pathfind.ts.mdmd.md#symbol-pathfindresult)
- [`pathfind.findPath`](./pathfind.ts.mdmd.md#symbol-findpath)
- [`pathfind.initPathfind`](./pathfind.ts.mdmd.md#symbol-initpathfind)
- [`pathfind.parsePathfindFromUrl`](./pathfind.ts.mdmd.md#symbol-parsepathfindfromurl)
- [`pathfind.updatePathfindUrl`](./pathfind.ts.mdmd.md#symbol-updatepathfindurl)
- [`index.applyPersistedUi`](./persistence/index.ts.mdmd.md#symbol-applypersistedui)
- [`index.createPersistNavScheduler`](./persistence/index.ts.mdmd.md#symbol-createpersistnavscheduler)
- [`index.createPersistUiScheduler`](./persistence/index.ts.mdmd.md#symbol-createpersistuischeduler)
- [`index.getDefaultFilters`](./persistence/index.ts.mdmd.md#symbol-getdefaultfilters)
- [`index.getDefaultTuning`](./persistence/index.ts.mdmd.md#symbol-getdefaulttuning)
- [`index.parseInitialState`](./persistence/index.ts.mdmd.md#symbol-parseinitialstate)
- [`index.readPersistedNav`](./persistence/index.ts.mdmd.md#symbol-readpersistednav)
- [`index.readPersistedUi`](./persistence/index.ts.mdmd.md#symbol-readpersistedui)
- [`index.updateUrlState`](./persistence/index.ts.mdmd.md#symbol-updateurlstate)
- [`types.ExplorerState`](./types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
- [`index.createCircuitView`](./views/circuitView/index.ts.mdmd.md#symbol-createcircuitview)
- [`forceGraphView.createForceGraphView`](./views/forceGraphView.ts.mdmd.md#symbol-createforcegraphview)
- [`index.createLocalView`](./views/localView/index.ts.mdmd.md#symbol-createlocalview)
- [`state.PathResult`](./views/localView/state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`index.createMembraneView`](./views/membraneView/index.ts.mdmd.md#symbol-createmembraneview)
- [`index.createWorldMapView`](./views/worldMap/index.ts.mdmd.md#symbol-createworldmapview)
- [`graph.explorerGraphOf`](../shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`StaticExplorerData`](../shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`template.context-name`](../shared/template.html.mdmd.md#symbol-contextname)
- [`template.pathfind-path`](../shared/template.html.mdmd.md#symbol-pathfindpath)
- [`template.pathfind-status`](../shared/template.html.mdmd.md#symbol-pathfindstatus)
- [`template.sidebar`](../shared/template.html.mdmd.md#symbol-sidebar)
- [`template.sidebar-toggle`](../shared/template.html.mdmd.md#symbol-sidebartoggle)
- [`template.stats-line`](../shared/template.html.mdmd.md#symbol-statsline)
- [`template.view-map`](../shared/template.html.mdmd.md#symbol-viewmap)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

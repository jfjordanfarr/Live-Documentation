# packages/explorer/src/client/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/index.ts
- Generated At: 2026-10-14T21:04:58.403Z

## Authored
### Purpose
Bootstrap entry point for the Explorer client: loads the bundle, projects its graph index into the payload the views render, initialises the views, the search bar and the detail panel, and wires the global navigation handlers.

### Notes
- A shared path, the pins and the destination of the address, is resolved before the first render. Perspective switches use the compact 2D/3D buttons; scrolling stays within the active view. The [owner’s walkthrough](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3) removed the automatic wheel boundary and unsolicited density message.
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was modularised.
- Since 2026-09-28 the bundle is loaded from `explorer-data.json` beside the page, or from the URL named by `?data=`; the fetches from the retired server and their lazy loader are gone.
- Exposes `window.switchView`, `window.openInEditor`, and zoom controls to the HTML template.
- The initial node (from the address, the stored place or the heuristic) is selected before the first drawing (`markSelected`, the selection's bookkeeping without a drawing, which `selectNode` also uses), so the page draws the focused picture once. Until 2026-10-06 it drew a default picture and then, a hundred milliseconds later, the focused one, and every load paid the Local Map's layout twice; found when the layout lab's verify pass read the page's second drawing ([Turn 12](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12)).
- The opened directories (2026-10-08, [the decisions log](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): read with the pins from the address at start and after Back, through `scrubSnapshot` with the `?dir=` door folded in, written with the pins by `persistExploration`; an address that opens a directory and names no file puts nothing in focus, so the directory draws alone rather than around a heuristic entry file.
- The 3D layout (2026-10-14): two icon buttons after 3D in the bottom-centre control, Connections and Structure, shown only in 3D; `changeSpatialLayout` writes the address, so the change is a history step like a perspective change, and re-renders the spatial view, which re-settles from where it stands. The Show Directories and Directory Connections checkboxes of that morning went with it ([the owner's choice](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4)).
- The search bar (2026-10-14, [Turns 5 and 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-5); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)): one search at the top in place of the Ctrl+P dialog and the FROM/TO toolbar, whose wiring, strip and status renderers, console logging and `openOmnisearch` global went with them. `pinHit` pins what a search found and makes it the newest pin, `askPath` and `runPath` draw the path from the newest pin to the destination (a directory at either end standing for every file inside it), `swapPath` answers the reverse question by pinning the destination, and `leavePath` forgets the destination when the picture is clicked out of a path. A new subject chosen in the bar while a destination stands asks the path again from it. The reach from the newest pin (`reachOf`) is computed once per newest pin in `syncPerspectiveControls` and handed to the bar, so that the destination field offers only what connects ([Turn 7](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7)).
- The footer counts "references outside the scan" (2026-10-14): imports of packages and builtins and files the scan does not hold, which it had called "missing dependencies"; the owner: "Oh man that is nagging isn't it?"
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
- [`layout-presets.applyLayoutSettings`](./layout-presets.ts.mdmd.md#symbol-applylayoutsettings)
- [`layout-presets.layoutPresetOf`](./layout-presets.ts.mdmd.md#symbol-layoutpresetof)
- [`layout-presets.layoutSettingsOf`](./layout-presets.ts.mdmd.md#symbol-layoutsettingsof)
- [`icon-button.iconButton`](./panels/icon-button.ts.mdmd.md#symbol-iconbutton)
- [`pin-tray.createPinTray`](./panels/pin-tray.ts.mdmd.md#symbol-createpintray)
- [`sources-facts.sourcesFacts`](./panels/sources-facts.ts.mdmd.md#symbol-sourcesfacts-function)
- [`sources-view.renderSourcesView`](./panels/sources-view.ts.mdmd.md#symbol-rendersourcesview)
- [`tuning.initTuningPanel`](./panels/tuning.ts.mdmd.md#symbol-inittuningpanel)
- [`pathfind.PathfindResult`](./pathfind.ts.mdmd.md#symbol-pathfindresult)
- [`pathfind.Reach`](./pathfind.ts.mdmd.md#symbol-reach)
- [`pathfind.findPath`](./pathfind.ts.mdmd.md#symbol-findpath)
- [`pathfind.reachOf`](./pathfind.ts.mdmd.md#symbol-reachof)
- [`pathfind.referencesAgainstPath`](./pathfind.ts.mdmd.md#symbol-referencesagainstpath)
- [`compressed-url-state.compressSnapshot`](./persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
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
- [`graph-search.SearchHit`](./search/graph-search.ts.mdmd.md#symbol-searchhit)
- [`graph-search.searchIndexOf`](./search/graph-search.ts.mdmd.md#symbol-searchindexof)
- [`search-bar.SearchWords`](./search/search-bar.ts.mdmd.md#symbol-searchwords)
- [`search-bar.createSearchBar`](./search/search-bar.ts.mdmd.md#symbol-createsearchbar)
- [`types.ExplorerState`](./types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.LocalMapPerspective`](./types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.PathDestination`](./types.ts.mdmd.md#symbol-pathdestination) (type-only)
- [`types.SpatialLayout`](./types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
- [`forceGraphView.createForceGraphView`](./views/forceGraphView.ts.mdmd.md#symbol-createforcegraphview)
- [`directory-state.under`](./views/localView/directory-state.ts.mdmd.md#symbol-under)
- [`index.createLocalView`](./views/localView/index.ts.mdmd.md#symbol-createlocalview)
- [`perspectiveTransition.animatePerspective`](./views/perspectiveTransition.ts.mdmd.md#symbol-animateperspective)
- [`perspectiveTransition.captureLocalScene`](./views/perspectiveTransition.ts.mdmd.md#symbol-capturelocalscene)
- [`perspectiveTransition.holdPerspective`](./views/perspectiveTransition.ts.mdmd.md#symbol-holdperspective)
- [`pin-state.EMPTY_PIN_SET`](./views/pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](./views/pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.retainFile`](./views/pin-state.ts.mdmd.md#symbol-retainfile)
- [`retained-state.RetainedItem`](./views/retained-state.ts.mdmd.md#symbol-retaineditem)
- [`retained-state.RetainedState`](./views/retained-state.ts.mdmd.md#symbol-retainedstate)
- [`retained-state.clearRetainedDirectory`](./views/retained-state.ts.mdmd.md#symbol-clearretaineddirectory)
- [`retained-state.describeRetained`](./views/retained-state.ts.mdmd.md#symbol-describeretained)
- [`retained-state.newestRetained`](./views/retained-state.ts.mdmd.md#symbol-newestretained)
- [`retained-state.reconcileRetained`](./views/retained-state.ts.mdmd.md#symbol-reconcileretained)
- [`retained-state.releaseRetained`](./views/retained-state.ts.mdmd.md#symbol-releaseretained)
- [`retained-state.retainedKey`](./views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`retained-state.subjectAfterRelease`](./views/retained-state.ts.mdmd.md#symbol-subjectafterrelease)
- [`index.createWorldMapView`](./views/worldMap/index.ts.mdmd.md#symbol-createworldmapview)
- [`graph.explorerGraphOf`](../shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`StaticExplorerData`](../shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`template.context-name`](../shared/template.html.mdmd.md#symbol-context-name)
- [`template.history-back`](../shared/template.html.mdmd.md#symbol-history-back)
- [`template.history-forward`](../shared/template.html.mdmd.md#symbol-history-forward)
- [`template.sidebar`](../shared/template.html.mdmd.md#symbol-sidebar)
- [`template.sidebar-toggle`](../shared/template.html.mdmd.md#symbol-sidebar-toggle)
- [`template.stats-line`](../shared/template.html.mdmd.md#symbol-stats-line)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

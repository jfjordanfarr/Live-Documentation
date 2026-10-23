# packages/explorer/src/client/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/index.ts
- Entry: declared
- Generated At: 2026-10-22T16:47:54.416Z

## Authored
### Purpose
Bootstrap entry point for the Explorer client: loads the bundle, projects its graph index into the payload the views render, initialises the views, the search bar and the detail panel, owns shared exploration transitions, and wires the global navigation handlers.

### Notes
- A shared path, the pins and the destination of the address, is resolved before the first render. Perspective switches use the compact 2D/3D buttons; scrolling stays within the active view. The [owner’s walkthrough](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3) removed the automatic wheel boundary and unsolicited density message.
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was modularised.
- Since 2026-09-28 the bundle is loaded from `explorer-data.json` beside the page, or from the path named by `?data=`; the fetches from the retired server and their lazy loader are gone. Since 2026-10-21 `?data=` and the history file the bundle names must lie on the page's own site (`onOwnSite`), and the page says so in words when they do not; the page's Content-Security-Policy refuses the same ([Turn 12 of the October 20 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-12)).
- Wires the template's controls (the view buttons, the zoom controls, the sidebar toggle and Download Markdown) with listeners. Until 2026-10-21 the template called functions this module put on `window` from `onclick` attributes, which the page's Content-Security-Policy now refuses to run.
- The initial node (from the address, the stored place or the heuristic) is selected before the first drawing (`markSelected`, the selection's bookkeeping without a drawing, which `selectNode` also uses), so the page draws the focused picture once. Until 2026-10-06 it drew a default picture and then, a hundred milliseconds later, the focused one, and every load paid the Local Map's layout twice; found when the layout lab's verify pass read the page's second drawing ([Turn 12](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12)).
- The opened directories (2026-10-08, [the decisions log](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): read with the pins from the address at start and after Back, through `scrubSnapshot` with the `?dir=` door folded in, written with the pins by `persistExploration`; an address that opens a directory and names no file puts nothing in focus, so the directory draws alone rather than around a heuristic entry file.
- The 3D layout (2026-10-14): two icon buttons after 3D in the bottom-centre control, Connections and Structure, shown only in 3D; `changeSpatialLayout` writes the address, so the change is a history step like a perspective change, and re-renders the spatial view, which re-settles from where it stands. The Show Directories and Directory Connections checkboxes of that morning went with it ([the owner's choice](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4)).
- The search bar (2026-10-14, [Turns 5 and 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-5); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)): one search at the top in place of the Ctrl+P dialog and the FROM/TO toolbar, whose wiring, strip and status renderers, console logging and `openOmnisearch` global went with them. `pinHit` pins what a search found and makes it the newest pin, `askPath` and `runPath` draw the path from the newest pin to the destination (a directory at either end standing for every file inside it), `swapPath` answers the reverse question by pinning the destination, and `leavePath` forgets the destination when the picture is clicked out of a path. A new subject chosen in the bar while a destination stands asks the path again from it. The reach from the newest pin (`reachOf`) is computed once per newest pin in `syncPerspectiveControls` and handed to the bar, so that the destination field offers only what connects ([Turn 7](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7)).
- Path results use the same computation and report in either representation, as the [October 23 remediation requires](../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work). A newly asked destination opens Local Map for success, reverse-only and disconnected outcomes. Restoring an address preserves its navigation view, pins and question; the report is visible only in Local Map. Opposing references are described as omitted from the 2D drawing, since the spatial view draws file-pair connections rather than the symbol-level route. Hop inspection preserves the question and map subject.
- The footer counts "references outside the scan" (2026-10-14): imports of packages and builtins and files the scan does not hold, which it had called "missing dependencies"; the owner: "Oh man that is nagging isn't it?"
- The Knowledge Sources panel (2026-10-08) is rendered from the bundle's graph itself rather than the projected payload. A file named on it opens independent evidence through `focusSidebar`, preserving the map subject and the panel's open groups and scroll.
- Since 2026-10-15 ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) the first subject is decided by `landingOf` over the bundle's graph and sample roots, the file-name guess remaining only when the docs declare no entry; and the Knowledge Sources panel's start (`state.reachFrom`, a file or a directory) is exploration state that rides the share link and redraws the panel from `sourcesFacts` walked from the files it names.
- `renderCurrentView` takes why it is called (2026-10-16, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16)): a change of state tells the Local Map to render, which it does at once when it is the view shown and otherwise owes until it is; a view shown (`switchView`, and `changePerspective` with the subject unchanged) calls the map's `show`, so that a return to an unchanged picture draws nothing and resumes the search. `changePerspective` counts a changed subject as a change.
- Shared pin, directory and subject decisions are applied here for direct controls, search results and history-panel pins. The pure pin and directory rules decide what is retained; the 2D view preserves the acted-on row or directory's screen position and keyboard focus around the state change. A pin or opening exits path mode before its render, without restoring the previous exploration camera; persistence forgets the destination if a path was active. The subject's release policy remains independent of inspected evidence. These are the owner's click and orientation rules from [October 14–15](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-8), applied once across both representations.
- Inspection, retention and Centre are separate application operations, from the owner's [October 19 decision](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and [October 20 continuation](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). Entity clicks and reader links inspect without changing the map. The canonical snapshot includes the independently inspected target; evidence-only Back/Forward updates the reader without rebuilding the map or moving its camera. A restored history commit is assigned before any path callback can persist it. Reader closure returns focus to its opener, else to the opener's rebuilt successor by accessible name, else to the map itself, never to the search field, whose focus raises a phone's keyboard. Escape closes the reader unless an open popover stands above it or another control has used the key first. A pressed Pin pressed again (`unpinNode`) releases only that file's pins and keeps the subject, so a Pin undoes itself; the card's X and the tray release under the subject policy. These three corrections followed an independent review on [2026-10-20](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#landing-checkpoint-claude-code); a full-screen reader makes the background inert, while a desktop overlay preserves the canvas size. More and hold menus call these same application operations and notify their opener when closed.

The history control (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): the History button beside Connections and Structure, offered only in 3D and only when the bundle carries a history, "for now, as those went beside 3D", until the consolidation pass the owner expects; `history-control.ts` wired to the 3D view's `setMoment` and `settle`, to the address through `persistExploration` (the commit and the authors toggle), to the tray through `absence`, and to the application's shared retain action for a file the step panel pins. An address that names a commit fetches the history file before the page starts, so that the first picture is the moment's; leaving 3D for 2D or for another view, and Back or Forward to an address without a commit, return the picture to today and close the control.

Since 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the application keeps the moment the 3D picture shows, so that the reader can say it reads today's version over a past commit, and wires the bundle's documents to the 3D view and the step panel.

The October 23 identity/framing pass adds **Fit current scope** to the shared bottom controls, visible only in 3D and disabled during a perspective transition. It invokes the spatial view’s explicit camera recovery without changing selection, pins or the path question; ordinary inspection still leaves the camera alone.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HistorySequence`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`index.inferDefaultEntryNodeId`](./bootstrap/index.ts.mdmd.md#symbol-inferdefaultentrynodeid)
- [`landing.landingOf`](./bootstrap/landing.ts.mdmd.md#symbol-landingof)
- [`detailPanel.DetailPanelAction`](./detailPanel.ts.mdmd.md#symbol-detailpanelaction)
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
- [`history-control.createHistoryControl`](./history/history-control.ts.mdmd.md#symbol-createhistorycontrol)
- [`history-control.isHistorySequence`](./history/history-control.ts.mdmd.md#symbol-ishistorysequence)
- [`moment.HistoryMoment`](./history/moment.ts.mdmd.md#symbol-historymoment) (type-only)
- [`layout-presets.applyLayoutSettings`](./layout-presets.ts.mdmd.md#symbol-applylayoutsettings)
- [`layout-presets.layoutPresetOf`](./layout-presets.ts.mdmd.md#symbol-layoutpresetof)
- [`layout-presets.layoutSettingsOf`](./layout-presets.ts.mdmd.md#symbol-layoutsettingsof)
- [`icon-button.iconButton`](./panels/icon-button.ts.mdmd.md#symbol-iconbutton)
- [`item-menu.createItemMenu`](./panels/item-menu.ts.mdmd.md#symbol-createitemmenu)
- [`pin-tray.createPinTray`](./panels/pin-tray.ts.mdmd.md#symbol-createpintray)
- [`sources-facts.sourcesFacts`](./panels/sources-facts.ts.mdmd.md#symbol-sourcesfacts-function)
- [`sources-view.renderSourcesView`](./panels/sources-view.ts.mdmd.md#symbol-rendersourcesview)
- [`tuning.initTuningPanel`](./panels/tuning.ts.mdmd.md#symbol-inittuningpanel)
- [`pathfind.PathfindResult`](./pathfind.ts.mdmd.md#symbol-pathfindresult)
- [`pathfind.Reach`](./pathfind.ts.mdmd.md#symbol-reach)
- [`pathfind.findPath`](./pathfind.ts.mdmd.md#symbol-findpath)
- [`pathfind.reachOf`](./pathfind.ts.mdmd.md#symbol-reachof)
- [`pathfind.referencesAgainstPath`](./pathfind.ts.mdmd.md#symbol-referencesagainstpath)
- [`compressed-url-state.UrlStateSnapshot`](./persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
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
- [`place.placeOf`](./persistence/place.ts.mdmd.md#symbol-placeof)
- [`graph-search.SearchHit`](./search/graph-search.ts.mdmd.md#symbol-searchhit)
- [`graph-search.searchIndexOf`](./search/graph-search.ts.mdmd.md#symbol-searchindexof)
- [`search-bar.SearchWords`](./search/search-bar.ts.mdmd.md#symbol-searchwords)
- [`search-bar.createSearchBar`](./search/search-bar.ts.mdmd.md#symbol-createsearchbar)
- [`types.ExplorerState`](./types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.InspectionTarget`](./types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- [`types.LocalMapPerspective`](./types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.PathDestination`](./types.ts.mdmd.md#symbol-pathdestination) (type-only)
- [`types.SpatialLayout`](./types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
- [`forceGraphView.createForceGraphView`](./views/forceGraphView.ts.mdmd.md#symbol-createforcegraphview)
- [`directory-state.OpenDirectories`](./views/localView/directory-state.ts.mdmd.md#symbol-opendirectories)
- [`directory-state.closeDirectory`](./views/localView/directory-state.ts.mdmd.md#symbol-closedirectory)
- [`directory-state.openDirectory`](./views/localView/directory-state.ts.mdmd.md#symbol-opendirectory)
- [`directory-state.under`](./views/localView/directory-state.ts.mdmd.md#symbol-under)
- [`index.createLocalView`](./views/localView/index.ts.mdmd.md#symbol-createlocalview)
- [`perspectiveTransition.animatePerspective`](./views/perspectiveTransition.ts.mdmd.md#symbol-animateperspective)
- [`perspectiveTransition.captureLocalScene`](./views/perspectiveTransition.ts.mdmd.md#symbol-capturelocalscene)
- [`perspectiveTransition.holdPerspective`](./views/perspectiveTransition.ts.mdmd.md#symbol-holdperspective)
- [`pin-state.EMPTY_PIN_SET`](./views/pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.INTERNAL_SYMBOL`](./views/pin-state.ts.mdmd.md#symbol-internal_symbol)
- [`pin-state.PinSet`](./views/pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.addPin`](./views/pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.isSymbolPinned`](./views/pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`pin-state.pressSymbol`](./views/pin-state.ts.mdmd.md#symbol-presssymbol)
- [`pin-state.removePinsForNode`](./views/pin-state.ts.mdmd.md#symbol-removepinsfornode)
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
- [`template.stats-line`](../shared/template.html.mdmd.md#symbol-stats-line)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

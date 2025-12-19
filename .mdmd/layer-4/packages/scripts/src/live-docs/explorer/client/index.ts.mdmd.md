# packages/scripts/src/live-docs/explorer/client/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-index-ts
- Generated At: 2025-12-19T05:01:25.066Z

## Authored
### Purpose
Bootstrap entry point for the Explorer client. Fetches the graph payload, initialises the Circuit, Local Map, and Force Graph views, and wires up global navigation and toolbar handlers.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was modularised.
- Exposes `window.switchView`, `window.openInEditor`, and zoom controls to the HTML template.
- Delegates rendering to `createCircuitView`, `createLocalView`, and the optional `ForceGraph3D` library.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T05:01:25.066Z","inputHash":"8f11dd9688849987"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`detailPanel.createDetailPanel`](./detailPanel.ts.mdmd.md#symbol-createdetailpanel)
- [`dom.requireElement`](./dom.ts.mdmd.md#symbol-requireelement)
- [`dom.setActiveView`](./dom.ts.mdmd.md#symbol-setactiveview)
- [`errors.attachGlobalErrorHandler`](./errors.ts.mdmd.md#symbol-attachglobalerrorhandler)
- [`errors.reportFatalExplorerError`](./errors.ts.mdmd.md#symbol-reportfatalexplorererror)
- [`parsers.parseExplorerGraphPayload`](./parsers.ts.mdmd.md#symbol-parseexplorergraphpayload)
- [`pathfind.PathfindEndpoint`](./pathfind.ts.mdmd.md#symbol-pathfindendpoint)
- [`pathfind.PathfindResult`](./pathfind.ts.mdmd.md#symbol-pathfindresult)
- [`pathfind.findPath`](./pathfind.ts.mdmd.md#symbol-findpath)
- [`pathfind.initPathfind`](./pathfind.ts.mdmd.md#symbol-initpathfind)
- [`pathfind.parsePathfindFromUrl`](./pathfind.ts.mdmd.md#symbol-parsepathfindfromurl)
- [`pathfind.updatePathfindUrl`](./pathfind.ts.mdmd.md#symbol-updatepathfindurl)
- [`types.ExplorerState`](./types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.TestCoverageMap`](./types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
- [`circuitView.createCircuitView`](./views/circuitView.ts.mdmd.md#symbol-createcircuitview)
- [`index.createLocalView`](./views/localView/index.ts.mdmd.md#symbol-createlocalview)
- [`state.PathResult`](./views/localView/state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`staticExplorerData.StaticExplorerViewerConfig`](../shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerviewerconfig) (type-only)
- [`types.ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

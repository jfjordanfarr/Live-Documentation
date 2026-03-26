# packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-index-ts
- Generated At: 2026-03-26T19:37:25.180Z

## Authored
### Purpose

View controller for the Membrane Map, orchestrating layout computation, browse-mode rendering, focal overlay management, pin state transitions, pan/zoom interaction, focus-based directory drill-down, and bidirectional URL state persistence via lz-string compression.

### Notes

- Created during [Dev Day 80 Step 5](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as the minimal browse-mode controller, then augmented in Steps 6–9 with pin state wiring, focal overlay integration, SVG connection drawing, hop badge attachment, path breadcrumb rendering, keyboard shortcuts, and compressed URL state.
- `createMembraneView` is a closure-based controller (not a class) returning a `MembraneViewApi` with `render`, `zoomIn`, `zoomOut`, and `resetZoom` — the closure captures mutable state (transform, expandedDirectories, pinSet, focusedDirectory) and re-renders imperatively on each state change.
- Focus-based drill-down: clicking a collapsed tile sets `focusedDirectory`, clears expansions outside the ancestor path, and triggers `fitToViewport` to auto-zoom; double-clicking an expanded membrane navigates focus up to the parent directory.
- Bundle edge rendering is commented out for MVP with a clear re-enablement path once progressive-disclosure or hover-only rendering is implemented.
- `persistToUrl` writes the full membrane state (view, selected node, pin set, expanded directories, transform, filters) to the URL via `writeUrlState` on every render; `readUrlState` restores on initialization, enabling shareable deep links.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-26T19:37:25.180Z","inputHash":"310c788da7f9a07c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MembraneViewOptions` {#symbol-membraneviewoptions}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts#L47)

##### `MembraneViewOptions` — Summary
Options for creating a Membrane Map view controller.

#### `MembraneViewApi` {#symbol-membraneviewapi}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts#L57)

##### `MembraneViewApi` — Summary
Public API surface returned by {@link createMembraneView}.

#### `createMembraneView` {#symbol-createmembraneview}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts#L76)
- Returns: [`MembraneViewApi`](#symbol-membraneviewapi)
- Parameters: `options`: [`MembraneViewOptions`](#symbol-membraneviewoptions)

##### `createMembraneView` — Summary
Initialise the Membrane Map view and return its public API.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../../dom.ts.mdmd.md#symbol-requireelement)
- [`compressed-url-state.UrlStateSnapshot`](../../persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot) (type-only)
- [`compressed-url-state.readUrlState`](../../persistence/compressed-url-state.ts.mdmd.md#symbol-readurlstate) (type-only)
- [`compressed-url-state.writeUrlState`](../../persistence/compressed-url-state.ts.mdmd.md#symbol-writeurlstate) (type-only)
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.TestCoverageMap`](../../types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`aggregation.DirectoryAggregate`](../circuitView/aggregation.ts.mdmd.md#symbol-directoryaggregate) (type-only)
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect)
- [`layoutUtils.buildHierarchy`](../layoutUtils.ts.mdmd.md#symbol-buildhierarchy)
- [`aggregation.computeAllAggregates`](./aggregation.ts.mdmd.md#symbol-computeallaggregates)
- [`animation.animateTransition`](./animation.ts.mdmd.md#symbol-animatetransition)
- [`animation.capturePositions`](./animation.ts.mdmd.md#symbol-capturepositions)
- [`browse-renderer.renderBrowseMode`](./browse-renderer.ts.mdmd.md#symbol-renderbrowsemode)
- [`focal-overlay.MeasuredAnchor`](./focal-overlay.ts.mdmd.md#symbol-measuredanchor)
- [`focal-overlay.attachHopBadges`](./focal-overlay.ts.mdmd.md#symbol-attachhopbadges)
- [`focal-overlay.drawConnections`](./focal-overlay.ts.mdmd.md#symbol-drawconnections)
- [`focal-overlay.renderFocalOverlay`](./focal-overlay.ts.mdmd.md#symbol-renderfocaloverlay)
- [`focal-overlay.renderPathBreadcrumb`](./focal-overlay.ts.mdmd.md#symbol-renderpathbreadcrumb)
- [`focal-overlay.setupHoverDimming`](./focal-overlay.ts.mdmd.md#symbol-setuphoverdimming)
- [`layout.computeMembraneLayout`](./layout.ts.mdmd.md#symbol-computemembranelayout)
- [`pin-active-renderer.renderPinActiveLayout`](./pin-active-renderer.ts.mdmd.md#symbol-renderpinactivelayout)
- [`pin-layout.computePinLayout`](./pin-layout.ts.mdmd.md#symbol-computepinlayout)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.clearPins`](./pin-state.ts.mdmd.md#symbol-clearpins) (type-only)
- [`pin-state.getRequiredExpansions`](./pin-state.ts.mdmd.md#symbol-getrequiredexpansions) (type-only)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections) (type-only)
- [`pin-state.togglePin`](./pin-state.ts.mdmd.md#symbol-togglepin) (type-only)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

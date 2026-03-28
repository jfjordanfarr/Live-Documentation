# packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-focal-overlay-ts
- Generated At: 2026-03-28T04:28:15.203Z

## Authored

### Purpose

DOM rendering of the focal overlay layer: symbol expansion panels on pinned leaf nodes, SVG connection drawing between measured pin anchors, numbered hop badges for path mode, and a path breadcrumb bar — the visual embodiment of the continuous pin state machine.

### Notes

- Created during [Dev Day 80 Step 6b](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as the DOM companion to the pure-function `pin-state.ts`, then extended in Step 7 with `attachHopBadges` and `renderPathBreadcrumb`.
- `renderFocalOverlay` builds absolutely-positioned symbol panels at each pinned node's layout rect, registering `MeasuredAnchor` elements for subsequent connection routing; `drawConnections` must be called after DOM insertion (via `requestAnimationFrame`) so `getBoundingClientRect` returns real positions.
- Connection rendering delegates to `routeConnection` from `routing.ts`, which classifies each connection as front trace (Bézier) or back trace (French Corset stubs) based on relative pin X positions, then renders the appropriate SVG elements color-coded by edge kind (import=blue, export=green, type=purple). `drawConnections` accepts optional `BezierTuningParams` for live tuning integration.
- `setupHoverDimming` guards against no-op activation when a symbol has zero connections (`matchCount === 0 → return early`), and marks opposite-end symbols with `.membrane-focal-pin--participating` / `.membrane-row--participating` so users see which endpoints interact during hover.
- `markConnectedEndpoints` (added [Dev Day 83](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md)) post-processes SVG connection data attributes to apply `.membrane-card__symbol-row--connected` to unpinned endpoint rows, providing always-visible indication of which symbols participate in drawn connections. Uses case-insensitive matching to bridge the lowercase SVG attribute convention with original-case DOM data attributes.
- `hopLabel` uses Unicode circled numbers (①–⑴) for hop indices 0–19, falling back to parenthesized numbers for larger paths.
- The `skipNodeIds` parameter prevents double-rendering when leaf files are already displayed as Local-Map-style cards in the browse renderer's card grid.
- XSS prevention: `escapeHtml` sanitizes all user-facing text content (file names, symbol names) before DOM insertion.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-28T04:28:15.203Z","inputHash":"c38e68a1fc246d9a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `FocalOverlayCallbacks` {#symbol-focaloverlaycallbacks}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L24)

##### `FocalOverlayCallbacks` — Summary

Callbacks for focal overlay interaction events.

#### `MeasuredAnchor` {#symbol-measuredanchor}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L33)

##### `MeasuredAnchor` — Summary

A measured pin anchor with its absolute position in the layout.
Used after DOM insertion to compute connection geometry.

#### `FocalOverlayResult` {#symbol-focaloverlayresult}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L44)

##### `FocalOverlayResult` — Summary

The result of rendering the focal overlay — contains the DOM elements
and an anchor registry for subsequent connection routing.

#### `renderFocalOverlay` {#symbol-renderfocaloverlay}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L78)
- Returns: [`FocalOverlayResult`](#symbol-focaloverlayresult)
- Parameters: `layout`: [`MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout); `pinSet`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset); `callbacks`: [`FocalOverlayCallbacks`](#symbol-focaloverlaycallbacks); `skipNodeIds`: `ReadonlySet`

##### `renderFocalOverlay` — Summary

Render the focal overlay: symbol expansion panels on pinned nodes.

Call this after browse-mode rendering. The returned panels should be
positioned over the corresponding leaf tiles in the membrane container.

##### `renderFocalOverlay` — Parameters

- `callbacks`: Pin toggle handler
- `layout`: Current membrane layout
- `nodesById`: Node payload lookup
- `pinSet`: Current pin state

##### `renderFocalOverlay` — Returns

Overlay result with panels, anchors, and SVG overlay

#### `drawConnections` {#symbol-drawconnections}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L284)
- Parameters: `svgOverlay`: `SVGSVGElement`; `tuning`: [`BezierTuningParams`](../connection-geometry.ts.mdmd.md#symbol-beziertuningparams)

##### `drawConnections` — Summary

Measure anchor positions and draw SVG connections.

Must be called after the focal overlay panels are inserted into the DOM
(so getBoundingClientRect returns real positions).

##### `drawConnections` — Parameters

- `anchorRegistry`: All measured anchors (from FocalOverlayResult)
- `containerEl`: The membrane container element (for coordinate transform)
- `scale`: Current zoom scale factor
- `svgOverlay`: The SVG element to draw into (from FocalOverlayResult)
- `visibleConnections`: Connections to draw (from getVisibleConnections)

#### `hopLabel` {#symbol-hoplabel}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L537)

##### `hopLabel` — Summary

Get the display label for a hop index.
Uses circled numbers for 0-19, falls back to plain number for larger indices.

#### `attachHopBadges` {#symbol-attachhopbadges}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L552)
- Parameters: `panels`: `ReadonlyMap`; `pinSet`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)

##### `attachHopBadges` — Summary

Attach hop badges to focal panels that are part of an active path.

Each panel that contains a path entry gets a numbered badge in its
top-right corner showing the hop index.

##### `attachHopBadges` — Parameters

- `panels`: Focal panels keyed by node ID
- `pinSet`: Current pin state (must have active path)

#### `BreadcrumbCallbacks` {#symbol-breadcrumbcallbacks}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L584)

##### `BreadcrumbCallbacks` — Summary

Callbacks for breadcrumb bar interaction.

#### `renderPathBreadcrumb` {#symbol-renderpathbreadcrumb}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L600)
- Parameters: `pinSet`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset); `callbacks`: [`BreadcrumbCallbacks`](#symbol-breadcrumbcallbacks)

##### `renderPathBreadcrumb` — Summary

Render a path breadcrumb bar showing the sequence of hops.

Returns null if no active path exists.

##### `renderPathBreadcrumb` — Parameters

- `callbacks`: Click handlers
- `nodesById`: Node payload lookup (for display names)
- `pinSet`: Current pin state

#### `setupHoverDimming` {#symbol-setuphoverdimming}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L684)
- Parameters: `svgOverlay`: `SVGSVGElement`

##### `setupHoverDimming` — Summary

Set up hover dimming on symbol rows within `container`.

When the user hovers a symbol row that participates in at least one
visible connection, all connections in the `svgOverlay` that do NOT
involve that symbol are dimmed. If the hovered symbol has no
connections, nothing happens — no spurious dimming.

Endpoint pins and labels of highlighted connections that are not
themselves pinned are marked as "participating" so they can be
partially un-dimmed, guiding the user toward further exploration.

Handlers are attached via event delegation on the container so setup
is called once, not per-row.

##### `setupHoverDimming` — Parameters

- `container`: The membrane container element (holds symbol rows)
- `svgOverlay`: The SVG overlay element (holds connection paths)

#### `clearHoverDimming` {#symbol-clearhoverdimming}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L767)
- Parameters: `svgOverlay`: `SVGSVGElement`

##### `clearHoverDimming` — Summary

Remove all hover-dimming state from the SVG overlay and container.

#### `markConnectedEndpoints` {#symbol-markconnectedendpoints}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts#L798)
- Parameters: `svgOverlay`: `SVGSVGElement`; `pinSet`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)

##### `markConnectedEndpoints` — Summary

After connections are drawn in pin-active mode, scan all SVG connection
elements and mark the symbol rows of connected-but-unpinned endpoints
with a persistent CSS class. This provides always-visible indication
of which symbols participate in the dependency graph — not just on hover.

Pinned symbols already have `.membrane-focal-pin--active` styling;
this function targets the unpinned endpoints that complete a connection.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`connection-geometry.BezierTuningParams`](../connection-geometry.ts.mdmd.md#symbol-beziertuningparams) (type-only)
- [`animation.animateLineDrawIn`](./animation.ts.mdmd.md#symbol-animatelinedrawin)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.VisibleConnection`](./pin-state.ts.mdmd.md#symbol-visibleconnection) (type-only)
- [`pin-state.getPathEntries`](./pin-state.ts.mdmd.md#symbol-getpathentries) (type-only)
- [`pin-state.getPinnedNodeIds`](./pin-state.ts.mdmd.md#symbol-getpinnednodeids) (type-only)
- [`pin-state.hasActivePath`](./pin-state.ts.mdmd.md#symbol-hasactivepath) (type-only)
- [`pin-state.isSymbolPinned`](./pin-state.ts.mdmd.md#symbol-issymbolpinned) (type-only)
- [`routing.BackTrace`](./routing.ts.mdmd.md#symbol-backtrace) (type-only)
- [`routing.FrontTrace`](./routing.ts.mdmd.md#symbol-fronttrace) (type-only)
- [`routing.PinAnchor`](./routing.ts.mdmd.md#symbol-pinanchor) (type-only)
- [`routing.RoutedTrace`](./routing.ts.mdmd.md#symbol-routedtrace) (type-only)
- [`routing.routeConnection`](./routing.ts.mdmd.md#symbol-routeconnection) (type-only)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
- [`types.MembraneNode`](./types.ts.mdmd.md#symbol-membranenode) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [pin-state.test.ts](./pin-state.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

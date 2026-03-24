# packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-routing-ts
- Generated At: 2026-03-24T03:05:20.059Z

## Authored

### Purpose

Pure-function connection routing that classifies each pin-to-pin connection as a front trace (natural L→R Bézier) or back trace (French Corset stub pair), then computes the SVG geometry for the focal overlay to render.

### Notes

- Created during [Dev Day 80 Step 6](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) alongside `focal-overlay.ts`, after an extended design discussion about how to handle backward-facing connections in a 2D treemap layout.
- The front/back classification is purely spatial: if `outboundPin.x < inboundPin.x`, the connection flows naturally left-to-right (front trace); otherwise it wraps backward (back trace). This is the Membrane Map's adaptation of the "French Corset" pattern established in the Local Map's `connection-geometry.ts`.
- Front traces delegate to `computeBezierPath` from the shared `connection-geometry.ts` module; back traces delegate to `computeSelfLoopStubs`, producing paired polygon stubs that visually suggest the connection routes "behind the board" like PCB back-copper.
- `routeConnections` provides batch routing with opaque `id` correlation, used by the focal overlay to route all visible connections in a single pass after DOM measurement.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:20.059Z","inputHash":"b9ec5fd42c541ab2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `TraceKind` {#symbol-tracekind}

- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L27)

##### `TraceKind` — Summary

Whether a connection is a front-trace (natural L→R flow) or back-trace (R→L wrap).

#### `PinAnchor` {#symbol-pinanchor}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L32)

##### `PinAnchor` — Summary

Anchor positions for a single connection endpoint (one pin on one card).

#### `FrontTrace` {#symbol-fronttrace}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L44)

##### `FrontTrace` — Summary

A routed front-trace connection: a full Bézier between two pins.

#### `BackTrace` {#symbol-backtrace}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L57)

##### `BackTrace` — Summary

A routed back-trace connection: two French Corset stubs with no connecting path.

#### `RoutedTrace` {#symbol-routedtrace}

- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L70)
- Returns: [`FrontTrace`](#symbol-fronttrace), [`BackTrace`](#symbol-backtrace)

##### `RoutedTrace` — Summary

A routed connection: either a full Bézier (front) or paired stubs (back).

#### `classifyTrace` {#symbol-classifytrace}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L88)
- Returns: [`TraceKind`](#symbol-tracekind)
- Parameters: `outbound`: [`PinAnchor`](#symbol-pinanchor); `inbound`: [`PinAnchor`](#symbol-pinanchor)

##### `classifyTrace` — Summary

Classify a connection as front-trace or back-trace.

A connection is a **front trace** when the outbound pin's X position
is to the left of the inbound pin's X position — meaning the connection
flows "naturally" leftward-to-rightward across the viewport.

A connection is a **back trace** when the outbound pin is to the right
of (or at the same X as) the inbound pin — meaning the connection would
need to wrap "backwards" against the L/R directional grammar.

##### `classifyTrace` — Parameters

- `inbound`: The target pin (inbound/green/left side of target card)
- `outbound`: The source pin (outbound/blue/right side of source card)

#### `computeFrontTrace` {#symbol-computefronttrace}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L105)
- Returns: [`FrontTrace`](#symbol-fronttrace)
- Parameters: `outbound`: [`PinAnchor`](#symbol-pinanchor); `inbound`: [`PinAnchor`](#symbol-pinanchor); `tuning`: [`BezierTuningParams`](../connection-geometry.ts.mdmd.md#symbol-beziertuningparams)

##### `computeFrontTrace` — Summary

Compute a front-trace Bézier path between two pin anchors.

The path starts at the outbound pin's right edge and ends at the
inbound pin's left edge.

#### `computeBackTrace` {#symbol-computebacktrace}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L134)
- Returns: [`BackTrace`](#symbol-backtrace)
- Parameters: `outbound`: [`PinAnchor`](#symbol-pinanchor); `inbound`: [`PinAnchor`](#symbol-pinanchor); `params`: [`SelfLoopParams`](../connection-geometry.ts.mdmd.md#symbol-selfloopparams)

##### `computeBackTrace` — Summary

Compute back-trace French Corset stubs for a backward connection.

Each pin gets an independent stub:

- The outbound pin's stub curves rightward and vanishes.
- The inbound pin's stub curves leftward and appears from nowhere.

No connecting path is drawn between them.

#### `routeConnection` {#symbol-routeconnection}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L171)
- Returns: [`RoutedTrace`](#symbol-routedtrace)
- Parameters: `outbound`: [`PinAnchor`](#symbol-pinanchor); `inbound`: [`PinAnchor`](#symbol-pinanchor); `tuning`: [`BezierTuningParams`](../connection-geometry.ts.mdmd.md#symbol-beziertuningparams); `selfLoopParams`: [`SelfLoopParams`](../connection-geometry.ts.mdmd.md#symbol-selfloopparams)

##### `routeConnection` — Summary

Route a single connection: classify as front or back, then compute geometry.

##### `routeConnection` — Parameters

- `inbound`: The inbound (target) pin anchor
- `outbound`: The outbound (source) pin anchor
- `selfLoopParams`: Self-loop params for back trace stubs
- `tuning`: Bézier tuning for front traces

#### `ConnectionToRoute` {#symbol-connectiontoroute}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L190)

##### `ConnectionToRoute` — Summary

A connection to be routed, pairing the outbound and inbound anchors
with an opaque identifier for correlation.

#### `routeConnections` {#symbol-routeconnections}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts#L200)
- Returns: `ReadonlyMap`
- Parameters: `tuning`: [`BezierTuningParams`](../connection-geometry.ts.mdmd.md#symbol-beziertuningparams); `selfLoopParams`: [`SelfLoopParams`](../connection-geometry.ts.mdmd.md#symbol-selfloopparams)

##### `routeConnections` — Summary

Route a batch of connections, returning classified and computed traces.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`connection-geometry.BezierTuningParams`](../connection-geometry.ts.mdmd.md#symbol-beziertuningparams) (type-only)
- [`connection-geometry.DEFAULT_BEZIER_TUNING`](../connection-geometry.ts.mdmd.md#symbol-default_bezier_tuning) (type-only)
- [`connection-geometry.DEFAULT_SELF_LOOP_PARAMS`](../connection-geometry.ts.mdmd.md#symbol-default_self_loop_params) (type-only)
- [`connection-geometry.PathResult`](../connection-geometry.ts.mdmd.md#symbol-pathresult) (type-only)
- [`connection-geometry.Point`](../connection-geometry.ts.mdmd.md#symbol-point) (type-only)
- [`connection-geometry.SelfLoopParams`](../connection-geometry.ts.mdmd.md#symbol-selfloopparams) (type-only)
- [`connection-geometry.computeBezierPath`](../connection-geometry.ts.mdmd.md#symbol-computebezierpath) (type-only)
- [`connection-geometry.computeSelfLoopStubs`](../connection-geometry.ts.mdmd.md#symbol-computeselfloopstubs) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [pin-state.test.ts](./pin-state.test.ts.mdmd.md)
- [routing.test.ts](./routing.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

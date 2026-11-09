# packages/explorer/src/client/views/perspectiveGeometry.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/perspectiveGeometry.ts
- Generated At: 2026-11-08T17:57:47.547Z

## Authored
### Purpose
Defines the reversible geometry and timing of the native Local Map/Force Graph transition, separately from DOM capture and drawing.

### Notes
Outward progress removes directory ancestors before their children, gathers native symbol routes into file segments, and then moves the file tokens. Reversing the same progress reveals interfaces and rebuilds containment from the inside outward. Route samples start at their measured native positions; these functions neither rearrange the graph nor change its relationships or retained symbols.

Since 2026-11-07 a native wire's samples are read from its own path data rather than from the browser (`pathOutline`, `polygonOutline`, `sampleOutline`): the 2D map writes its wires as absolute M, L, C and Q commands and its laces as polygons, and the transition had sampled each by `getPointAtLength`, up to 257 calls a wire, about 15 ms a wire and 2.5 s of a switch on this repository's picture pinned on one file ([the switch-cost probe](../../../../../../../AI-Agent-Workspace/Probes/2026-11-07/switch-cost/README.md)). A curve is flattened by the length of its control polygon, two pixels a piece, which holds its length to the browser's within a small fraction of a pixel (the unit tests compare it with a fine integration); samples stand at equal distances along the outline as the browser's do, and data of any other form returns null, so that the caller samples it through the browser as before.

The November 8 correspondence helper assigns each captured destination once, preferring an exact card before a canonical single-file-directory alias. It uses only the supplied captured IDs and containment metadata, so absent or out-of-scope files cannot acquire an invented destination; tests cover real cells, absent files, several aliases and an exact file beside its alias in either order.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TransitionPoint` {#symbol-transitionpoint}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L2)

##### `TransitionPoint` — Summary
A screen point shared by a symbol route and its file-level connection.

#### `perspectiveCorrespondences` {#symbol-perspectivecorrespondences}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L5)
- Parameters: `destinations`: `ReadonlySet`; `directoryRepresentatives`: `ReadonlyMap`

##### `perspectiveCorrespondences` — Summary
Match each destination once, preferring its exact card over directory aliases derived from canonical containment.

#### `transitionEase` {#symbol-transitionease}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L21)

##### `transitionEase` — Summary
Smooth a bounded phase without overshoot.

#### `perspectivePhases` {#symbol-perspectivephases}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L27)

##### `perspectivePhases` — Summary
Outward phase: remove containment, gather interfaces, then move file tokens.

#### `directoryOpacity` {#symbol-directoryopacity}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L36)

##### `directoryOpacity` — Summary
Peel ancestors before children; running progress backward builds from leaves outward.

#### `gatherWire` {#symbol-gatherwire}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L42)
- Returns: [`TransitionPoint`](#symbol-transitionpoint)[]
- Parameters: `provider`: [`TransitionPoint`](#symbol-transitionpoint); `consumer`: [`TransitionPoint`](#symbol-transitionpoint)

##### `gatherWire` — Summary
Gather a sampled native curve onto one file wire, preserving its exact endpoints at rest.

#### `pathOutline` {#symbol-pathoutline}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L60)
- Returns: [`TransitionPoint`](#symbol-transitionpoint)[]

##### `pathOutline` — Summary
A native wire's outline as a polyline, from the path data the Local Map writes (absolute M, L, C and Q, the commands
`connections.ts` and `branch-routing.ts` use), each curve flattened finely enough that its length and its points
agree with the browser's to a small fraction of a pixel; null for data of any other form, which the caller samples
through the browser instead. Until 2026-11-07 every wire was sampled by `getPointAtLength`, up to 257 calls a wire, about
15 ms a wire and 2.5 s of the switch on this repository's picture pinned on one file.

#### `polygonOutline` {#symbol-polygonoutline}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L110)
- Returns: [`TransitionPoint`](#symbol-transitionpoint)[]

##### `polygonOutline` — Summary
A polygon's outline, closed, from its `points` attribute; null for an attribute it cannot read.

#### `outlineLength` {#symbol-outlinelength}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L118)

##### `outlineLength` — Summary
An outline's length.

#### `sampleOutline` {#symbol-sampleoutline}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L125)
- Returns: [`TransitionPoint`](#symbol-transitionpoint)[]

##### `sampleOutline` — Summary
`steps + 1` points at equal distances along an outline, its ends exact, as the browser's `getPointAtLength` gives them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

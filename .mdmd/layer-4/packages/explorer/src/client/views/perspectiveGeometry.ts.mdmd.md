# packages/explorer/src/client/views/perspectiveGeometry.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/perspectiveGeometry.ts
- Generated At: 2026-10-03T18:02:22.959Z

## Authored
### Purpose
Defines the reversible geometry and timing of the native Local Map/Force Graph transition, separately from DOM capture and drawing.

### Notes
Outward progress removes directory ancestors before their children, gathers native symbol routes into file segments, and then moves the file tokens. Reversing the same progress reveals interfaces and rebuilds containment from the inside outward. Route samples start at their measured native positions; these functions neither rearrange the graph nor change its relationships or retained symbols.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TransitionPoint` {#symbol-transitionpoint}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L2)

##### `TransitionPoint` — Summary
A screen point shared by a symbol route and its file-level connection.

#### `transitionEase` {#symbol-transitionease}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L5)

##### `transitionEase` — Summary
Smooth a bounded phase without overshoot.

#### `perspectivePhases` {#symbol-perspectivephases}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L11)

##### `perspectivePhases` — Summary
Outward phase: remove containment, gather interfaces, then move file tokens.

#### `directoryOpacity` {#symbol-directoryopacity}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L20)

##### `directoryOpacity` — Summary
Peel ancestors before children; running progress backward builds from leaves outward.

#### `gatherWire` {#symbol-gatherwire}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveGeometry.ts#L26)
- Returns: [`TransitionPoint`](#symbol-transitionpoint)[]
- Parameters: `provider`: [`TransitionPoint`](#symbol-transitionpoint); `consumer`: [`TransitionPoint`](#symbol-transitionpoint)

##### `gatherWire` — Summary
Gather a sampled native curve onto one file wire, preserving its exact endpoints at rest.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

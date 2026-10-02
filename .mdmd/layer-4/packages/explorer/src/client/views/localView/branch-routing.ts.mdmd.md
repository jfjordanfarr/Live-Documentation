# packages/explorer/src/client/views/localView/branch-routing.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-routing.ts
- Generated At: 2026-10-02T21:15:07.149Z

## Authored
### Purpose
Computes exterior routes for Local Map connections that skip columns or return within a cyclic component.

### Notes
The route leaves the provider to the right, stays outside the occupied columns and arrives at the consumer from the left. Rounded corners are bounded by adjacent segment lengths.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RoutePoint` {#symbol-routepoint}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L2)

##### `RoutePoint` — Summary
A point in unscaled Local Map coordinates.

#### `branchDetourPoints` {#symbol-branchdetourpoints}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L5)
- Returns: [`RoutePoint`](#symbol-routepoint)[]
- Parameters: `source`: [`RoutePoint`](#symbol-routepoint); `target`: [`RoutePoint`](#symbol-routepoint)

##### `branchDetourPoints` — Summary
Route a skipped rank or cycle around the occupied columns, keeping both endpoint directions.

#### `roundedBranchRoute` {#symbol-roundedbranchroute}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-routing.ts#L14)
- Parameters: `points`: [`RoutePoint`](#symbol-routepoint)[]

##### `roundedBranchRoute` — Summary
Round orthogonal bends without overshooting a short segment.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

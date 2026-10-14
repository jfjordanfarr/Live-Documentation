# packages/explorer/src/client/persistence/navigation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/navigation.ts
- Generated At: 2026-10-14T16:02:17.569Z

## Authored
### Purpose

Normalizes stored and linked view names at the application boundary, separating navigation from the Local Map’s 2D/3D representation and its 3D layout.

### Notes

- Added for the owner’s [three-view decision](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4). Old graph/force addresses mean Local Map in 3D; old membrane/circuit addresses mean Local Map in 2D. Both URL snapshots and browser storage use these rules.
- `readSpatialLayout` (2026-10-14): anything but `structure` is the connections layout.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readView` {#symbol-readview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/navigation.ts#L4)
- Returns: [`ViewName`](../types.ts.mdmd.md#symbol-viewname)

##### `readView` — Summary
Read current and retired view names at the persistence boundary.

#### `readPerspective` {#symbol-readperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/navigation.ts#L9)
- Returns: [`LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)

##### `readPerspective` — Summary
Old Force Graph links are the Local Map in 3D; other old links open in 2D.

#### `readSpatialLayout` {#symbol-readspatiallayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/navigation.ts#L15)
- Returns: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `readSpatialLayout` — Summary
The 3D Local Map's layout; anything but the declared structure is the connectivity layout.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->

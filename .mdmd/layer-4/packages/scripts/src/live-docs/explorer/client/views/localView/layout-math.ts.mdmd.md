# packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-layout-math-ts
- Generated At: 2026-02-03T21:55:36.469Z

## Authored
### Purpose
Pure-function layout computation for the Local Map: column counts, grid templates, multi-hop positioning, and pin-to-hop-data conversion.

### Notes
- Created 2025-12-18 (Dev Day 49) in chat 2025-12-18.1.md Turn 06 as second of three pure-function module extractions
- Uses "upstream/downstream" semantics (not "left/right") to support future RTL layouts
- `computeColumnCount()` handles both exploration mode (3 columns) and path mode (2N+1 for N hops)
- `pinsToHopData()` converts `SymbolPin[]` to renderable `HopData[]` for multi-hop visualization
- `computeMultiHopLayout()` generates full `LocalMapLayout` with per-column node positions
- 495 lines of geometry and layout logic, all unit-testable without DOM

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.469Z","inputHash":"7ca1d1824b961632"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LayoutNode` {#symbol-layoutnode}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L18)

##### `LayoutNode` — Summary
Represents a node in the layout with its computed position.

#### `LayoutColumn` {#symbol-layoutcolumn}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L36)

##### `LayoutColumn` — Summary
Represents a column in the multi-hop layout.

#### `LocalMapLayout` {#symbol-localmaplayout}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L54)

##### `LocalMapLayout` — Summary
Complete layout specification for the Local Map.

#### `ColumnRole` {#symbol-columnrole}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L69)

##### `ColumnRole` — Summary
Semantic role of a column in the layout.

Uses "upstream/downstream" semantics instead of "left/right"
to support future RTL layouts and multi-hop expansion.

#### `HopData` {#symbol-hopdata}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L74)

##### `HopData` — Summary
Input data for a single hop in the chain.

#### `LayoutConfig` {#symbol-layoutconfig}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L89)

##### `LayoutConfig` — Summary
Configuration for layout computation.

#### `DEFAULT_LAYOUT_CONFIG` {#symbol-default_layout_config}
- Type: const
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L99)
- Returns: [`LayoutConfig`](#symbol-layoutconfig)

##### `DEFAULT_LAYOUT_CONFIG` — Summary
Default layout configuration.

#### `computeGridTemplate` {#symbol-computegridtemplate}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L110)

##### `computeGridTemplate` — Summary
Computes the grid template string for a given number of columns.

##### `computeGridTemplate` — Parameters
- `columnCount`: Number of columns

##### `computeGridTemplate` — Returns
CSS grid-template-columns value

#### `computeColumnCount` {#symbol-computecolumncount}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L131)

##### `computeColumnCount` — Summary
Computes the number of columns needed for a given hop count.

Layout pattern:
- Hop 0 (single-hop): [Dependencies, Center, Dependents] = 3 columns
- Multi-hop (hopCount > 1):
  [Dependencies, Origin, Dependents, Hop1Center, (Via1, Hop2Center)..., HopN]
  We skip the LAST hop's dependents column because the path ends there.

Formula:
- Single-hop (hopCount = 1): 3 columns
- Multi-hop (hopCount > 1): 3 + (hopCount - 1) * 2 - 1 = hopCount * 2
  (subtract 1 because we skip last hop's dependents)

##### `computeColumnCount` — Parameters
- `hopCount`: Number of hops (1 = single node, 2 = two nodes, etc.)

##### `computeColumnCount` — Returns
Number of columns needed

#### `getColumnRole` {#symbol-getcolumnrole}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L152)
- Returns: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `getColumnRole` — Summary
Determines the column role for a given column index.

Pattern for N hops:
- Index 0: upstream (dependencies of hop 0)
- Index 1: center (hop 0)
- Index 2: downstream (dependents of hop 0 / hop 1 if exists)
- Index 3: center (hop 1) [if exists]
- Index 4: downstream (dependents of hop 1) [if exists]
- ...

##### `getColumnRole` — Parameters
- `columnIndex`: Zero-based column index

##### `getColumnRole` — Returns
The semantic role of that column

#### `getHopIndex` {#symbol-gethopindex}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L164)

##### `getHopIndex` — Summary
Determines which hop a column belongs to.

##### `getHopIndex` — Parameters
- `columnIndex`: Zero-based column index

##### `getHopIndex` — Returns
The hop index (0-based)

#### `generateColumnLabel` {#symbol-generatecolumnlabel}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L177)
- Parameters: `role`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `generateColumnLabel` — Summary
Generates a label for a column based on its role and hop index.

##### `generateColumnLabel` — Parameters
- `hopIndex`: Which hop this column belongs to
- `role`: Column role
- `totalHops`: Total number of hops in the chain

##### `generateColumnLabel` — Returns
Human-readable column label

#### `computeSingleHopLayout` {#symbol-computesinglehoplayout}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L213)
- Returns: [`LocalMapLayout`](#symbol-localmaplayout)

##### `computeSingleHopLayout` — Summary
Computes the complete layout for a single-hop view (classic 3-column).

##### `computeSingleHopLayout` — Parameters
- `center`: The center node data
- `dependencies`: Nodes that the center depends on
- `dependents`: Nodes that depend on the center

##### `computeSingleHopLayout` — Returns
A LocalMapLayout ready for rendering

#### `computeMultiHopLayout` {#symbol-computemultihoplayout}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L279)
- Returns: [`LocalMapLayout`](#symbol-localmaplayout)
- Parameters: `hops`: [`HopData`](#symbol-hopdata)[]; `config`: [`LayoutConfig`](#symbol-layoutconfig)

##### `computeMultiHopLayout` — Summary
Computes the complete layout for a multi-hop view.

##### `computeMultiHopLayout` — Parameters
- `config`: Layout configuration
- `hops`: Array of hop data, ordered from origin to destination

##### `computeMultiHopLayout` — Returns
A LocalMapLayout ready for rendering

#### `pinsToHopData` {#symbol-pinstohopdata}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L378)
- Returns: [`HopData`](#symbol-hopdata)[]
- Parameters: `pins`: [`SymbolPin`](./state.ts.mdmd.md#symbol-symbolpin)[]

##### `pinsToHopData` — Summary
Converts a pinned path to hop data suitable for layout computation.

This bridges the state module (SymbolPin[]) to the layout module (HopData[]).

##### `pinsToHopData` — Parameters
- `getDependencies`: Function to retrieve dependencies for a node
- `getDependents`: Function to retrieve dependents for a node
- `getNodeData`: Function to retrieve node data by ID
- `pins`: Array of pinned symbols forming the path

##### `pinsToHopData` — Returns
Array of HopData for layout computation

#### `computeVerticalAlignments` {#symbol-computeverticalalignments}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L418)

##### `computeVerticalAlignments` — Summary
Computes vertical alignment values for nodes to minimize edge crossing.

Nodes that connect to the same symbols on the center should be
positioned near each other vertically.

##### `computeVerticalAlignments` — Parameters
- `centerSymbolPositions`: Map of center symbol names to Y positions
- `connections`: Function that returns connected symbol names for a node
- `nodes`: Nodes to compute alignments for

##### `computeVerticalAlignments` — Returns
Map of node IDs to alignment Y values

#### `sortByAlignment` {#symbol-sortbyalignment}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L457)
- Returns: `T`[]
- Parameters: `nodes`: `T`[]

##### `sortByAlignment` — Summary
Sorts nodes by their alignment values (lower Y first).

##### `sortByAlignment` — Parameters
- `alignments`: Map of node IDs to alignment values
- `nodes`: Nodes to sort

##### `sortByAlignment` — Returns
Sorted array of nodes

#### `getIntermediateColumns` {#symbol-getintermediatecolumns}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L481)

##### `getIntermediateColumns` — Summary
Detects which intermediate columns a connection path would cross.

Used to determine if edge routing needs to avoid overlapping content.

##### `getIntermediateColumns` — Parameters
- `sourceColumnIndex`: Column index of the source node
- `targetColumnIndex`: Column index of the target node

##### `getIntermediateColumns` — Returns
Array of column indices that the path crosses

#### `isMultiHopConnection` {#symbol-ismultihopconnection}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts#L503)

##### `isMultiHopConnection` — Summary
Determines if a connection spans multiple hops (requires special routing).

##### `isMultiHopConnection` — Parameters
- `sourceColumnIndex`: Column index of the source node
- `targetColumnIndex`: Column index of the target node

##### `isMultiHopConnection` — Returns
True if the connection spans more than adjacent columns
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`state.SymbolPin`](./state.ts.mdmd.md#symbol-symbolpin) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [layout-math.test.ts](./layout-math.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

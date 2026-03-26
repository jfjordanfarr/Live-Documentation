# packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-pin-layout-ts
- Generated At: 2026-03-26T19:37:25.319Z

## Authored
### Purpose

Pure-function dependency-flow layout engine for Membrane Map pin-active mode. Computes topological column assignment via BFS and directory-based membrane grouping, plus LCA (Least Common Ancestor) directory computation and ancestor chain construction for nested directory membrane rendering.

### Notes

- Created in [Dev Day 80](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as Step 6 of the Membrane Map execution plan; LCA/ancestor chain functions added in [Dev Day 81](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-24.1.md)
- Key exports: `computePinLayout` (main entry — BFS column assignment, membrane grouping, LCA computation), `computeLCA` (longest shared directory prefix), `buildAncestorChain` (progressive path segments from root to LCA), `parentDirectory` (utility)
- Uses `docRelativePath` (not `codeRelativePath`) for directory grouping and LCA computation — this must match `buildHierarchy` in `layoutUtils.ts` which drives the browse-mode directory tree
- Algorithm: pinned nodes anchor column 0; dependencies fan left (−1, −2…), dependents fan right (+1, +2…); inter-pinned edges use Kahn's algorithm for topological ordering; columns are then normalized to start at 0
- 28 tests covering layout mechanics, LCA edge cases (empty set, single file, cross-directory), and ancestor chain construction

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-26T19:37:25.319Z","inputHash":"328e2d962321e4f1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FlowNode` {#symbol-flownode}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L25)

##### `FlowNode` — Summary
A node positioned within the dependency-flow layout.

#### `MembraneGroup` {#symbol-membranegroup}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L37)

##### `MembraneGroup` — Summary
A group of nodes in the same directory, within a column.

#### `DirectoryBand` {#symbol-directoryband}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L53)

##### `DirectoryBand` — Summary
A directory band that spans one or more columns.

Unlike {@link MembraneGroup} (which is per-column), a band spans
the full column range of its children. This enables cross-column
directory membranes in the rendered layout.

#### `PinLayoutResult` {#symbol-pinlayoutresult}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L71)

##### `PinLayoutResult` — Summary
Complete dependency-flow layout result.

#### `parentDirectory` {#symbol-parentdirectory}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L100)

##### `parentDirectory` — Summary
Extract the parent directory from a file path.

#### `computeLCA` {#symbol-computelca}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L109)

##### `computeLCA` — Summary
Compute the Least Common Ancestor directory of a set of file paths.
Returns the longest directory prefix shared by all paths.

#### `buildAncestorChain` {#symbol-buildancestorchain}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L127)

##### `buildAncestorChain` — Summary
Build the ancestor chain from root to a directory path.
E.g. "a/b/c" → ["a", "a/b", "a/b/c"].

#### `computePinLayout` {#symbol-computepinlayout}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L157)
- Returns: [`PinLayoutResult`](#symbol-pinlayoutresult)
- Parameters: `pinSet`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset); `nodesById`: `ReadonlyMap`

##### `computePinLayout` — Summary
Compute a dependency-flow layout from the current pin state.

Algorithm:
1. Get visible connections from pin state
2. Identify relevant nodes (pinned + connected neighbors)
3. BFS from pinned nodes to assign topological columns:
   - Pinned nodes → column 0
   - Dependencies (upstream) → column -1, -2, ...
   - Dependents (downstream) → column +1, +2, ...
4. Normalize columns to start at 0
5. Group by parent directory within each column

##### `computePinLayout` — Parameters
- `links`: Full graph edge list
- `nodesById`: Node payload lookup
- `pinSet`: Current pin state

##### `computePinLayout` — Returns
The dependency-flow layout

#### `computeDirectoryBands` {#symbol-computedirectorybands}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.ts#L437)
- Returns: [`DirectoryBand`](#symbol-directoryband)[]
- Parameters: `flowNodes`: `ReadonlyMap`

##### `computeDirectoryBands` — Summary
Compute hierarchical cross-column directory bands (Strategy B+C).

1. Groups flow nodes by immediate parent directory → leaf bands
2. Builds a directory trie relative to the LCA
3. Collapses single-child chains (e.g. packages → shared → src → packages/shared/src)
4. At branching trie nodes, creates parent bands wrapping child bands
5. Assigns bandRow at each nesting level via greedy interval scheduling

Exported for testing.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.getPinnedNodeIds`](./pin-state.ts.mdmd.md#symbol-getpinnednodeids) (type-only)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pin-layout.test.ts](./pin-layout.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/explorer/src/client/views/localView/directory-bands.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/directory-bands.ts
- Generated At: 2026-10-12T19:21:20.109Z

## Authored
### Purpose

Groups ranked files into nested directory bands spanning their columns. The ordering and placement steps use these bands to keep directories coherent while arranging files and wire lanes.

### Notes

- The cross-column grouping originated in the [March 26 Membrane Map work](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-26.1.md), verified in commit `c675a4eb`. It replaced a separate membrane per column and gained parent wrappers when the owner noticed missing common ancestors.
- [The October 12 retirement](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4) moved the still-used grouping here without retaining the obsolete Membrane BFS layout. Column ranking belongs to the Local Map; these functions only build the hierarchy and assign non-overlapping initial band rows.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FlowNode` {#symbol-flownode}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-bands.ts#L4)

##### `FlowNode` — Summary
A node positioned within the dependency-flow layout.

#### `DirectoryBand` {#symbol-directoryband}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-bands.ts#L14)

##### `DirectoryBand` — Summary
A directory spanning columns, with nested bands or directly held files.

#### `parentDirectory` {#symbol-parentdirectory}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-bands.ts#L32)

##### `parentDirectory` — Summary
Extract the parent directory from a file path.

#### `computeDirectoryBands` {#symbol-computedirectorybands}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-bands.ts#L72)
- Returns: [`DirectoryBand`](#symbol-directoryband)[]
- Parameters: `flowNodes`: `ReadonlyMap`

##### `computeDirectoryBands` — Summary
Compute hierarchical cross-column directory bands (Strategy B+C).

1. Groups flow nodes by immediate parent directory → leaf bands
2. Builds a directory trie relative to the LCA
3. Collapses single-child chains (e.g. packages → shared → src → packages/engine/src)
4. At branching trie nodes, creates parent bands wrapping child bands
5. Assigns bandRow at each nesting level via greedy interval scheduling
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

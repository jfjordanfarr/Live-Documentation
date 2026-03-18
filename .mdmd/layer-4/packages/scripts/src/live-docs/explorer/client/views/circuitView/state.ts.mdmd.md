# packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-circuitview-state-ts
- Generated At: 2026-03-17T19:15:48.665Z

## Authored

### Purpose

Immutable state management for the Circuit Board's progressive disclosure model. Tracks which directories are expanded (showing file-level cards) versus collapsed (showing aggregate directory tiles), and provides breadcrumb construction and node-to-directory lookup.

### Notes

- Extracted from the monolithic `circuitView.ts` during [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md), following the same state extraction pattern that the Local Map used when it was decomposed into 18 files during earlier refactoring.
- All state transitions are immutable: `expandDirectory` and `collapseDirectory` return new `CircuitBoardState` objects with updated `expandedDirectories` sets, making state changes predictable and side-effect-free.
- `buildBreadcrumbs` constructs a `{label, path}[]` trail from root to the deepest expanded directory, used by the breadcrumb navigation bar.
- `findContainingDirectory` maps a file node to its parent directory path, enabling the controller to build the full ancestor expansion chain when navigating to a specific file from omnisearch or external links.
- `collapseToDepth` supports breadcrumb click behavior: clicking an ancestor crumb collapses everything below that level.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-17T19:15:48.665Z","inputHash":"42bdc7b6511f7a8c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `CircuitBoardState` {#symbol-circuitboardstate}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L9)

##### `CircuitBoardState` — Summary

Immutable state for the Circuit Board progressive disclosure.

Tracks which directories are expanded (showing file-level cards)
versus collapsed (showing aggregate directory tiles).

#### `createInitialState` {#symbol-createinitialstate}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L15)
- Returns: [`CircuitBoardState`](#symbol-circuitboardstate)

##### `createInitialState` — Summary

Creates a fresh state with all directories collapsed (aggregated view).

#### `expandDirectory` {#symbol-expanddirectory}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L20)
- Returns: [`CircuitBoardState`](#symbol-circuitboardstate)
- Parameters: `state`: [`CircuitBoardState`](#symbol-circuitboardstate)

##### `expandDirectory` — Summary

Returns a new state with the given directory expanded.

#### `collapseDirectory` {#symbol-collapsedirectory}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L30)
- Returns: [`CircuitBoardState`](#symbol-circuitboardstate)
- Parameters: `state`: [`CircuitBoardState`](#symbol-circuitboardstate)

##### `collapseDirectory` — Summary

Returns a new state with the given directory collapsed.

#### `collapseToDepth` {#symbol-collapsetodepth}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L40)
- Returns: [`CircuitBoardState`](#symbol-circuitboardstate)
- Parameters: `state`: [`CircuitBoardState`](#symbol-circuitboardstate); `keepPaths`: `ReadonlySet`

##### `collapseToDepth` — Summary

Returns a new state with all directories at or below the given depth collapsed.

#### `collapseAll` {#symbol-collapseall}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L54)
- Returns: [`CircuitBoardState`](#symbol-circuitboardstate)
- Parameters: `state`: [`CircuitBoardState`](#symbol-circuitboardstate)

##### `collapseAll` — Summary

Collapses all expanded directories, returning to full aggregate view.

#### `hasExpandedDirectories` {#symbol-hasexpandeddirectories}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L62)
- Parameters: `state`: [`CircuitBoardState`](#symbol-circuitboardstate)

##### `hasExpandedDirectories` — Summary

Returns true if any directory is currently expanded.

#### `buildBreadcrumbs` {#symbol-buildbreadcrumbs}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L77)

##### `buildBreadcrumbs` — Summary

Builds the breadcrumb trail for a given directory path.
Returns an array of { label, path } entries from root to the target.

Example: "packages/shared/src" → [
{ label: "Root", path: "__root__" },
{ label: "packages", path: "packages" },
{ label: "shared", path: "packages/shared" },
{ label: "src", path: "packages/shared/src" }
]

#### `findContainingDirectory` {#symbol-findcontainingdirectory}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts#L98)
- Parameters: `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `findContainingDirectory` — Summary

Finds the directory path that should be expanded when navigating
to a specific node (file) from omnisearch or external link.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [state.test.ts](./state.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

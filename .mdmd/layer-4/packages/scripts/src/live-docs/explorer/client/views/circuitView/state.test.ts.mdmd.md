# packages/scripts/src/live-docs/explorer/client/views/circuitView/state.test.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/state.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-circuitview-state-test-ts
- Generated At: 2026-03-17T19:15:48.643Z

## Authored

### Purpose

Unit tests for the Circuit Board state management module, covering immutable state transitions (expand, collapse, collapse-to-depth, collapse-all), breadcrumb construction, and file-to-directory mapping.

### Notes

- Created alongside `state.ts` during [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md) as part of the pure-function test-first decomposition strategy.
- 21 tests across 6 describe blocks: `createInitialState` (2), `expandDirectory` (3 including idempotency), `collapseDirectory` (3 including isolation), `collapseToDepth` (2), `collapseAll` (2), `hasExpandedDirectories` (2), `buildBreadcrumbs` (4 including root/empty/nested/single-segment), `findContainingDirectory` (3).
- Tests verify immutability guarantees: expanding the same directory twice returns the same reference, collapsing a non-expanded directory is a no-op.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-17T19:15:48.643Z","inputHash":"bdf715241c4857d1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

_No public symbols detected_

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`state.CircuitBoardState`](./state.ts.mdmd.md#symbol-circuitboardstate)
- [`state.buildBreadcrumbs`](./state.ts.mdmd.md#symbol-buildbreadcrumbs)
- [`state.collapseAll`](./state.ts.mdmd.md#symbol-collapseall)
- [`state.collapseDirectory`](./state.ts.mdmd.md#symbol-collapsedirectory)
- [`state.collapseToDepth`](./state.ts.mdmd.md#symbol-collapsetodepth)
- [`state.createInitialState`](./state.ts.mdmd.md#symbol-createinitialstate)
- [`state.expandDirectory`](./state.ts.mdmd.md#symbol-expanddirectory)
- [`state.findContainingDirectory`](./state.ts.mdmd.md#symbol-findcontainingdirectory)
- [`state.hasExpandedDirectories`](./state.ts.mdmd.md#symbol-hasexpandeddirectories)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

#### Vitest Unit Tests

- packages/scripts/src/live-docs/explorer/client/views/circuitView: [state.ts](./state.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->

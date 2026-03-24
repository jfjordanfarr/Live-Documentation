# packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-circuitview-aggregation-test-ts
- Generated At: 2026-03-23T20:05:53.854Z

## Authored
### Purpose

Unit tests for the Circuit Board aggregation module, validating directory metric rollup, single-child chain collapsing, cross-boundary dependency classification, hierarchy path lookup, and weight computation.

### Notes

- Created alongside `aggregation.ts` during [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md) as part of the pure-function test-first decomposition strategy.
- 22 tests across 5 describe blocks: `computeDirectoryAggregates` (10 legacy API), `computeAggregateWeight` (2), `computeChildAggregates` (5 generalized API), `findDirectoryByPath` (5), `computeFileWeight` (2).
- Uses a local `buildTestHierarchy` helper that mirrors the `buildHierarchy` function from `layoutUtils.ts` but is self-contained to avoid coupling test setup to production hierarchy code.
- The tests deliberately exercise edge cases: empty hierarchies, root-level files with no directories, deeply nested single-child chains, and cross-boundary vs. internal dependency classification.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-23T20:05:53.854Z","inputHash":"3ab88a08c5c30127"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`aggregation.DirectoryAggregate`](./aggregation.ts.mdmd.md#symbol-directoryaggregate)
- [`aggregation.computeAggregateWeight`](./aggregation.ts.mdmd.md#symbol-computeaggregateweight)
- [`aggregation.computeChildAggregates`](./aggregation.ts.mdmd.md#symbol-computechildaggregates)
- [`aggregation.computeDirectoryAggregates`](./aggregation.ts.mdmd.md#symbol-computedirectoryaggregates)
- [`aggregation.computeFileWeight`](./aggregation.ts.mdmd.md#symbol-computefileweight)
- [`aggregation.findDirectoryByPath`](./aggregation.ts.mdmd.md#symbol-finddirectorybypath)
- [`types.ExplorerDependencyReference`](../../../shared/types.ts.mdmd.md#symbol-explorerdependencyreference) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/circuitView: [aggregation.ts](./aggregation.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

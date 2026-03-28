# packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.test.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-layout-test-ts
- Generated At: 2026-03-25T17:08:29.902Z

## Authored

### Purpose

Verifies the recursive membrane layout engine's spatial invariants: non-overlapping siblings, containment of children within parent bounds, area proportionality to weight, configurable border sizing, and focus-path-aware layout allocation.

### Notes

- 14 tests covering: single-file degenerate case, multi-sibling non-overlap, nested directory recursion, weight-proportional area allocation, custom config propagation, deep nesting at 4+ levels, empty-directory graceful handling, single-child directories, index population, focus-path narrowing, focus-ancestor border reduction, and three mixed-content tests added in [Dev Day 83](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md) verifying that files in mixed-content focused directories are excluded from squarified layout while non-focused and pure-leaf directories remain unaffected.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:29.902Z","inputHash":"7ed2f76ab9a1109d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

_No public symbols detected_

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
- [`layout.computeMembraneLayout`](./layout.ts.mdmd.md#symbol-computemembranelayout)
- [`types.DEFAULT_MEMBRANE_CONFIG`](./types.ts.mdmd.md#symbol-default_membrane_config) (type-only)
- [`types.MembraneNode`](./types.ts.mdmd.md#symbol-membranenode) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

#### Vitest Unit Tests

- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [layoutUtils.ts](../layoutUtils.ts.mdmd.md), [squarify.ts](../squarify.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [layout.ts](./layout.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->

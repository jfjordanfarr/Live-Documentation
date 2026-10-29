# tests/e2e/spatial-legend.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/spatial-legend.spec.ts
- Generated At: 2026-10-29T18:09:51.851Z

## Authored
### Purpose
Checks that the Local Map's legend describes the rendered representation and actual filtered graph, including explicit retention that overrides a general filter. The spatial key's colour samples are compared with the rendered node materials; the 2D key keeps its offer/use meanings, and neither key appears in other views.

### Notes
Written after the root's visual acceptance of the compact key during the [October 24 Connections review](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12). The small history sample provides a real test file and document citations: hiding tests must retain the Test key while a test is pinned, releasing it must remove both node and key, and an enabled document filter with no matching data must not invent a key. The estate exercises representation and view changes without a repository-sized simulation.

The colour comparison reads CSS pseudo-element paint and Three's native node material independently, rather than asserting against the same shared palette that produces both. The scene observer supplies evidence that the retained test and citation wires actually exist or leave; checking labels alone could accept a legend that described an undrawn graph.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`forceGraphBatches.SpatialDrawEntry`](../../packages/explorer/src/client/views/forceGraphBatches.ts.mdmd.md#symbol-spatialdrawentry) (type-only)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- `three` - `InstancedMesh`, `MeshLambertMaterial`, `Scene` (type-only)
<!-- LIVE-DOC:END Dependencies -->

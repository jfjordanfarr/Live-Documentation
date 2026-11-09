# scripts/layout-lab/spatial.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/spatial.test.ts
- Generated At: 2026-11-02T06:07:20.306Z

## Authored
### Purpose
Verifies the spatial report’s graph facts, filtering and geometric semantics against nontrivial fixtures.

### Notes
Checks summed reciprocal reference counts, known symbol-derived radii and spacing, immutable graph input, explicitly retained test/asset exceptions, documentation overlays and a missing retained file. The November 2 chain cases also prevent silently adding a hop through already-retained neighbors and verify whole-root member reveal including an isolated file.

Created for [the October 13 shared-preset implementation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Since November 8, 2026, the overlay fixture explicitly asks for two hops to reach the retained files' provider and its documentation; the uniform-junction fixture explicitly uses Off and two containment hops so both files and their non-pulling reference are present. Other default-based and explicit hop-scope checks retain their subjects.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.easeSpatialLayout`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-easespatiallayout)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun) (type-only)
- [`spatial.spatialReport`](./spatial.ts.mdmd.md#symbol-spatialreport)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

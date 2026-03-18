# packages/scripts/src/live-docs/explorer/client/views/circuitView/squarify.test.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/squarify.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-circuitview-squarify-test-ts
- Generated At: 2026-03-17T19:15:48.598Z

## Authored

### Purpose

Unit tests for the squarified treemap layout algorithm, verifying proportional area allocation, non-overlapping tile placement, viewport containment, aspect ratio quality, and edge-case handling.

### Notes

- Created alongside `squarify.ts` during [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md) as part of the pure-function test-first approach.
- 11 tests covering: empty input, single item fills viewport, proportional areas (3:1 ratio verification), total area conservation, no-overlap (pairwise intersection check with 0.01 floating-point tolerance), viewport bounds, aspect ratio cap (<5 for 6 items), equal weights, zero-weight filtering, viewport offset, and stress test (50 items).
- Helper functions (`totalArea`, `hasOverlap`, `maxAspectRatio`) are intentionally self-contained in the test file rather than exposed from the production module.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-17T19:15:48.598Z","inputHash":"9535926182b92993"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

_No public symbols detected_

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`squarify.SquarifyItem`](./squarify.ts.mdmd.md#symbol-squarifyitem)
- [`squarify.SquarifyTile`](./squarify.ts.mdmd.md#symbol-squarifytile)
- [`squarify.computeSquarifiedLayout`](./squarify.ts.mdmd.md#symbol-computesquarifiedlayout)
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

#### Vitest Unit Tests

- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [layoutUtils.ts](../layoutUtils.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/circuitView: [squarify.ts](./squarify.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->

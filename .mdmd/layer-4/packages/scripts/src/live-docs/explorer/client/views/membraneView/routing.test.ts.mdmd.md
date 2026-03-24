# packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.test.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-routing-test-ts
- Generated At: 2026-03-24T03:05:20.033Z

## Authored

### Purpose

Verifies connection routing classification (front vs. back trace), Bézier path computation for front traces, French Corset stub geometry for back traces, and batch routing with ID correlation.

### Notes

- 21 tests covering: front/back classification based on relative X positions, front trace source/target at pin edges, back trace stub polygon generation, edge cases (vertically aligned pins, coincident pins, zero-radius pins), `routeConnection` unified router, and `routeConnections` batch API with result map keying.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:20.033Z","inputHash":"14e00236e4893a9a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

_No public symbols detected_

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`routing.ConnectionToRoute`](./routing.ts.mdmd.md#symbol-connectiontoroute)
- [`routing.PinAnchor`](./routing.ts.mdmd.md#symbol-pinanchor)
- [`routing.classifyTrace`](./routing.ts.mdmd.md#symbol-classifytrace)
- [`routing.computeBackTrace`](./routing.ts.mdmd.md#symbol-computebacktrace)
- [`routing.computeFrontTrace`](./routing.ts.mdmd.md#symbol-computefronttrace)
- [`routing.routeConnection`](./routing.ts.mdmd.md#symbol-routeconnection)
- [`routing.routeConnections`](./routing.ts.mdmd.md#symbol-routeconnections)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

#### Vitest Unit Tests

- packages/scripts/src/live-docs/explorer/client/views: [connection-geometry.ts](../connection-geometry.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [routing.ts](./routing.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->

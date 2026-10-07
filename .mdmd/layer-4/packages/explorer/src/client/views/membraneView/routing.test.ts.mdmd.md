# packages/explorer/src/client/views/membraneView/routing.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/membraneView/routing.test.ts
- Generated At: 2026-09-27T23:21:29.141Z

## Authored
### Purpose

Verifies connection routing classification (front vs. back trace), Bézier path computation for front traces, French Corset stub geometry for back traces, and batch routing with ID correlation.

### Notes

- 21 tests covering: front/back classification based on relative X positions, front trace source/target at pin edges, back trace stub polygon generation, edge cases (vertically aligned pins, coincident pins, zero-radius pins), `routeConnection` unified router, and `routeConnections` batch API with result map keying. Every test pin stands on a card whose edge is 8 px beyond it, since the laces are cut by that edge (2026-10-07).

## Generated
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

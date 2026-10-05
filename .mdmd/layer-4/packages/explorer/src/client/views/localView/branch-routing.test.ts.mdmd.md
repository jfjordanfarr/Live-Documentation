# packages/explorer/src/client/views/localView/branch-routing.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-routing.test.ts
- Generated At: 2026-10-05T16:55:01.305Z

## Authored
### Purpose
Checks that a threaded route runs forward through its lanes and never enters a card, and that the native curve leaves to the right and arrives from the left.

### Notes
Samples each curve of the route from its command text against card rectangles placed above and below the lane, checks the lane runs sit at the lane's height, and that two lanes are threaded in order. The curve test also covers the quadratic a near-vertical hop becomes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning) (type-only)
- [`branch-routing.RoutePoint`](./branch-routing.ts.mdmd.md#symbol-routepoint)
- [`branch-routing.curveTo`](./branch-routing.ts.mdmd.md#symbol-curveto)
- [`branch-routing.threadedRoute`](./branch-routing.ts.mdmd.md#symbol-threadedroute)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

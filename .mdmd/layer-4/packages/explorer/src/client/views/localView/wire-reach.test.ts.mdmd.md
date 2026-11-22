# `packages/explorer/src/client/views/localView/wire-reach.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/wire-reach.test.ts`
- Generated At: 2026-11-22T19:55:40.418Z

## Authored
### Purpose
Holds the arithmetic of a wire's reach: a route walked to its points and box, the distance to it, the nearer of two wires whose reaches hold a point (and the later of two as near), and that no wire holds a point farther than half its own width.

### Notes
- Written with `wire-reach.ts` on 2026-11-22. The case of two wires says what changed for a reader: until that day the page gave a point to the later band wherever both held it; now only where they are as near.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`wire-reach.distanceTo`](./wire-reach.ts.mdmd.md#symbol-distanceto)
- [`wire-reach.reachOf`](./wire-reach.ts.mdmd.md#symbol-reachof)
- [`wire-reach.wireAt`](./wire-reach.ts.mdmd.md#symbol-wireat)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

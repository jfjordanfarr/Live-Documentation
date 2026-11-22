# `packages/explorer/src/client/views/localView/mirror-turn.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/mirror-turn.test.ts`
- Generated At: 2026-11-22T05:48:58.416Z

## Authored
### Purpose
Holds the turn's arithmetic to what the motion relies on: the axis read from the picture as laid out and read back from the mirrored one is the same axis with the same two cameras; the angle runs from 0 to 180 and on to 360, never backward and never outside its half turn; and the slide moves a card's place across by the eased share of the way, edge-on at the middle.

### Notes
- Written 2026-11-22, before the functions: all five cases were seen failing on a module that did not yet have them. They were not afterwards seen failing against a broken formula, as the mapping's cases in `reading-direction.test.ts` were.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`mirror-turn.mirrorAxis`](./mirror-turn.ts.mdmd.md#symbol-mirroraxis-function)
- [`mirror-turn.turnAngle`](./mirror-turn.ts.mdmd.md#symbol-turnangle)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

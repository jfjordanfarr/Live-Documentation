# packages/explorer/src/client/views/localView/membrane-outline.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/membrane-outline.test.ts
- Generated At: 2026-10-06T16:47:47.899Z

## Authored
### Purpose

Holds the membrane outline to its shape: one segment is its rectangle, two level segments join without a step, two stepped segments join through the corridor where they overlap with the corners in drawing order, and no segments give no path.

### Notes

- The stepped case is the one the picture shows: the corridor's top is the lower of the two tops and its bottom the higher of the two bottoms, so the joined shape never reaches outside either segment in the gutter.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`membrane-outline.membraneOutline`](./membrane-outline.ts.mdmd.md#symbol-membraneoutline)
- [`membrane-outline.membranePath`](./membrane-outline.ts.mdmd.md#symbol-membranepath)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

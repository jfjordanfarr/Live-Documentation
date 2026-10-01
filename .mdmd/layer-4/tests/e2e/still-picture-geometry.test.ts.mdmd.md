# tests/e2e/still-picture-geometry.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/still-picture-geometry.test.ts
- Generated At: 2026-10-01T19:06:09.321Z

## Authored
### Purpose

Holds each number of `still-picture-geometry.ts` to a drawing: an X is one crossing, parallel wires and a shared stub are none, a weave inside a cable is a channel and not a crossing while a wire cutting across the cable is, a fan at a pin is told from a crossing in the open, a rightward wire flows whichever end its path starts at, a card is adjacent to its folder only when its nearest neighbour shares it, and a tour takes the pans its frame needs and no more.

### Notes

- The straight lines are sampled every 4 px, as the instrument samples real paths, so the stub exclusion and the run lengths behave as they do on a page.
- Runs in the Vitest unit project; `tests/e2e/**/*.test.ts` was added to its include for this file on 2026-10-01.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`still-picture-geometry.Polyline`](./still-picture-geometry.ts.mdmd.md#symbol-polyline)
- [`still-picture-geometry.TourFact`](./still-picture-geometry.ts.mdmd.md#symbol-tourfact)
- [`still-picture-geometry.angleBetween`](./still-picture-geometry.ts.mdmd.md#symbol-anglebetween)
- [`still-picture-geometry.boxGap`](./still-picture-geometry.ts.mdmd.md#symbol-boxgap)
- [`still-picture-geometry.crossings`](./still-picture-geometry.ts.mdmd.md#symbol-crossings)
- [`still-picture-geometry.flowOf`](./still-picture-geometry.ts.mdmd.md#symbol-flowof)
- [`still-picture-geometry.folderAdjacency`](./still-picture-geometry.ts.mdmd.md#symbol-folderadjacency)
- [`still-picture-geometry.intersectionOf`](./still-picture-geometry.ts.mdmd.md#symbol-intersectionof)
- [`still-picture-geometry.planTour`](./still-picture-geometry.ts.mdmd.md#symbol-plantour)
- [`still-picture-geometry.sharedChannels`](./still-picture-geometry.ts.mdmd.md#symbol-sharedchannels)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

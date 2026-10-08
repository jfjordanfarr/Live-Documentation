# tests/e2e/local-map-directories.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-directories.spec.ts
- Generated At: 2026-10-08T01:58:15.857Z

## Authored
### Purpose
Playwright over the Local Map's directories opening and closing: entry by directory, a box opening in place, an encasing membrane's count and its name, the X, the keyboard, and no wire reaching a closed box.

### Notes
Four tests on this repository's bundle ([the decisions log](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): a directory entered with nothing pinned is a grid of compact cards and closed boxes with no wire, kept whole in the frame, whose address round-trips through the share link; a box opens in place with the membrane growing from the box early in the move and its label held where the box was, and its X closes it back to a box; an encasing membrane counts what it hides, its name opens it around the pinned files with the wires unchanged, no wire's end lies inside a closed box, a compact member retains on a click and the X steps the directory down to encasing, keeping the member; and opening and closing work by keyboard with reduced motion, a directory with a party file never closing below encasing. The text audit of `design-audit.ts` runs over the opened pictures. Two clicks in the wide opened picture are dispatched to their elements rather than aimed at the frame, since the map does not scroll and a click lands only on what is shown.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->

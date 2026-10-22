# tests/e2e/perspective-zoom.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/perspective-zoom.spec.ts
- Generated At: 2026-10-22T16:47:58.757Z

## Authored
### Purpose
Exercises layered file/symbol pins, explicit perspective changes with scrolling confined to the active view and a long route across the two native file perspectives.

### Notes
Browser journeys verify transient hover under whole-file pins, narrowing to one symbol with its explicit Pin control, restoration of the whole-file pin when its last symbol is released, a populated intermediate projection, and the ordered thirteen-file estate path through a round trip. Row highlighting records retention by either the file or symbol, while the symbol button's pressed state identifies a direct symbol pin.
- The thirteen-file path is opened by an address that pins its start and names its end (2026-10-14).
- Waits for the picture to rest (`localMapSettled`) after the clicks it measures after, since a change of pins moves the branch picture from one arrangement to the next (2026-10-07).
- A transition copy must retain every computed SVG declaration while removing live identifiers and inline hooks. The check includes a custom property containing quoted punctuation and uses the browser's original per-property CSSOM normalization as its reference, so aliases that change spelling when assigned do not require exclusions. The copied layer remains inert and hidden from the accessibility tree.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`retained-state.retainedKey`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`search-bar.newestKey`](./search-bar.ts.mdmd.md#symbol-newestkey)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

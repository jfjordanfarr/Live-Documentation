# tests/e2e/perspective-zoom.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/perspective-zoom.spec.ts
- Generated At: 2026-10-14T19:09:48.857Z

## Authored
### Purpose
Exercises layered file/symbol pins, explicit perspective changes with scrolling confined to the active view and a long route across the two native file perspectives.

### Notes
Browser journeys verify transient hover under whole-file pins, persistence of an explicit symbol after removing its file pin, a populated intermediate projection, and the ordered thirteen-file estate path through a round trip.
- The thirteen-file path is opened by an address that pins its start and names its end (2026-10-14).
- Waits for the picture to rest (`localMapSettled`) after the clicks it measures after, since a change of pins moves the branch picture from one arrangement to the next (2026-10-07).

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

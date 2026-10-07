# tests/e2e/perspective-zoom.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/perspective-zoom.spec.ts
- Generated At: 2026-10-07T02:59:53.787Z

## Authored
### Purpose
Exercises layered file/symbol pins, deliberate zoom crossings and a long route across the two native file perspectives.

### Notes
Browser journeys verify transient hover under whole-file pins, persistence of an explicit symbol after removing its file pin, a populated intermediate projection, and the ordered thirteen-file estate path through a round trip.
- Waits for the picture to rest (`localMapSettled`) after the clicks it measures after, since a change of pins moves the branch picture from one arrangement to the next (2026-10-07).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->

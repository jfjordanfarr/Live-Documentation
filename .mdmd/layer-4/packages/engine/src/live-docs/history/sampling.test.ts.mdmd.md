# packages/engine/src/live-docs/history/sampling.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/history/sampling.test.ts
- Generated At: 2026-10-18T00:39:19.026Z

## Authored
### Purpose
Vitest over sampling: every commit, every n-th with the first and the last, the last of each UTC day and of each week beginning Monday, the tagged commits, and a window since a date.

### Notes
- Written 2026-10-17 for C14. One commit is late on a Sunday in UTC+2, still Sunday in UTC, so the week's boundary is read in UTC.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sampling.sampleChanges`](./sampling.ts.mdmd.md#symbol-samplechanges)
- [`versionControl.MainlineChange`](./versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

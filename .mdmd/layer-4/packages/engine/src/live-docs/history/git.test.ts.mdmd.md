# packages/engine/src/live-docs/history/git.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/history/git.test.ts
- Generated At: 2026-10-18T00:39:18.840Z

## Authored
### Purpose
Vitest over the parsers of git's output: the mainline's records after rev-list's commit lines, the renames and in-place changes of a NUL-separated name-status listing with paths holding a tab and a newline, and the tags' commits.

### Notes
- Written 2026-10-17 for C1. The git calls themselves are exercised over a real repository in [history.test.ts](../../../../../tests/integration/live-docs/history.test.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`git.parseMainline`](./git.ts.mdmd.md#symbol-parsemainline)
- [`git.parseNameStatus`](./git.ts.mdmd.md#symbol-parsenamestatus)
- [`git.parseTags`](./git.ts.mdmd.md#symbol-parsetags)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

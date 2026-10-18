# tests/integration/live-docs/history-renames.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/history-renames.test.ts
- Generated At: 2026-10-18T00:39:29.794Z

## Authored
### Purpose
The directory-rename rule over this repository's own history: the three package renames of September 2026 (`cad63bdd`, `690f5d27`, `d23a6f90`), read by hand on 2026-10-16 as whole renames, and two merges into a directory that stood (`86a74a76`, `1e36b33e`), which must never read as renames.

### Notes
- Written 2026-10-17 for C9 of [the plan](../../../../../.mdmd/layer-3/change-over-time.mdmd.md): "this repository's September renames, read by hand on 2026-10-16, are committed as an expectation". The input is git's own `diff --name-status -M50%` and its trees at each commit; the expectation is the hand reading, not the rule's output.
- A shallow clone, or one without the commits, is skipped with its reason said in the test's note and on the console, never passed; CI checks out the whole history (`fetch-depth: 0`) so that the test runs there.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:path`
- [`directories.directoryRenames`](../../../packages/engine/src/live-docs/history/directories.ts.mdmd.md#symbol-directoryrenames)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

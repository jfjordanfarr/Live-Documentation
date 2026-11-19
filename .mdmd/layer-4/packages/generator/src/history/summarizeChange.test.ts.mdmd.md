# packages/generator/src/history/summarizeChange.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/history/summarizeChange.test.ts
- Generated At: 2026-11-19T20:51:09.294Z

## Authored
### Purpose
Holds the summary's answer to whether a linked document stood at a commit to the commit's own listing, not the disk: the case gives a tree an index naming a file the disk holds under another spelling, as a disk that folds case or Unicode form can, and requires the listing's answer.

### Notes
- Written 2026-11-19 from the second pass of the independent review of the history engine's round (finding 7): with every name of a tree written, the listing and the disk agree on a disk that tells case apart, so no other test could tell them apart. Seen red against a version that asks the disk.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`git.openGitRepository`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-opengitrepository)
- [`summarizeChange.standingFiles`](./summarizeChange.ts.mdmd.md#symbol-standingfiles)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

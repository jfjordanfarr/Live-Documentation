# packages/generator/src/history/regenerate.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/history/regenerate.test.ts
- Generated At: 2026-11-19T19:05:09.594Z

## Authored
### Purpose
Holds the history's tree to what the generator looks for by name: with the files the configuration excludes left out (`unread`), a scan nested under an excluded folder is still written, and the generator warns of it as it does over the whole commit.

### Notes
- Written 2026-11-19, when the tree writer began to leave out what `exclude` names. The generator's search for nested scans (`scansWithin`) globs the whole tree by name and does not read `exclude`; the case failed with `unread` not asking `marksScan`, and passes with the two sharing the generator's own markers (`scanMarkers`).

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
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`git.writeStoredTree`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-writestoredtree)
- [`generator.generateLiveDocs`](../generator.ts.mdmd.md#symbol-generatelivedocs)
- [`regenerate.treeOptions`](./regenerate.ts.mdmd.md#symbol-treeoptions)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

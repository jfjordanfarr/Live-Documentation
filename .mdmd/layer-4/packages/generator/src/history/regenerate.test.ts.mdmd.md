# packages/generator/src/history/regenerate.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/history/regenerate.test.ts
- Generated At: 2026-11-19T18:10:05.314Z

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
- [`generator.marksScan`](../generator.ts.mdmd.md#symbol-marksscan)
- [`regenerate.unread`](./regenerate.ts.mdmd.md#symbol-unread)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

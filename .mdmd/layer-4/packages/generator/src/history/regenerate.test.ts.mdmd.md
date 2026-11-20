# `packages/generator/src/history/regenerate.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/generator/src/history/regenerate.test.ts`
- Generated At: 2026-11-20T09:35:03.044Z

## Authored
### Purpose
Holds the history's tree to what the generator looks for by name: every name stands, an excluded image, font or recording written empty (`treeOptions`), so a scan nested under an excluded folder is found, and the generator warns of it as it does over the whole commit.

### Notes
- Written 2026-11-19, when the tree writer left out what `exclude` names and the generator's search for nested scans (`scansWithin`), which globs the tree by name, stopped seeing them; since the tree writes every name, the case holds without a special rule, and it holds the generator's warnings over the tree to those over the whole commit.

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
- [`summarizeChange.treeOptions`](./summarizeChange.ts.mdmd.md#symbol-treeoptions)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

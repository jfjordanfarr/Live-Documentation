# `packages/generator/src/history/regenerate.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/generator/src/history/regenerate.test.ts`
- Generated At: 2026-11-22T07:12:57.105Z

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
- [`format.HistoryLens`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historylens) (type-only)
- [`git.writeStoredTree`](../../../engine/src/live-docs/history/git.ts.mdmd.md#symbol-writestoredtree)
- [`lens.lensOf`](../../../engine/src/live-docs/history/lens.ts.mdmd.md#symbol-lensof)
- [`versionControl.MainlineChange`](../../../engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
- [`generator.generateLiveDocs`](../generator.ts.mdmd.md#symbol-generatelivedocs)
- [`computeHistory.poolMemory`](./computeHistory.ts.mdmd.md#symbol-poolmemory)
- [`regenerate.Scratch`](./regenerate.ts.mdmd.md#symbol-scratch)
- [`regenerate.Worker`](./regenerate.ts.mdmd.md#symbol-worker) (type-only)
- [`regenerate`](./regenerate.ts.mdmd.md#symbol-regenerate)
- [`regenerate.workerBound`](./regenerate.ts.mdmd.md#symbol-workerbound)
- [`regenerate.workerTask`](./regenerate.ts.mdmd.md#symbol-workertask)
- [`summarizeChange.WorkerReport`](./summarizeChange.ts.mdmd.md#symbol-workerreport) (type-only)
- [`summarizeChange`](./summarizeChange.ts.mdmd.md#symbol-summarizechange)
- [`summarizeChange.treeOptions`](./summarizeChange.ts.mdmd.md#symbol-treeoptions)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

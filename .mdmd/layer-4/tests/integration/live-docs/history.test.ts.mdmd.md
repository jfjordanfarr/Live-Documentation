# tests/integration/live-docs/history.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/history.test.ts
- Generated At: 2026-10-18T00:39:29.843Z

## Authored
### Purpose
The history command over a repository built from a script of seven commits (files added, a directory renamed whole, a file renamed with an edit above git's threshold, a file rewritten below it, a file deleted, a symbol added, a content-only edit, and a committed mirror's orphan doc), held to oracles it does not produce: the generator's own index regenerated here at every commit, git's own `diff --name-status -M50%` between consecutive commits, the directory renamed whole, a second run that regenerates nothing, a checkout that keeps the stored bytes, the bundle's window, and what `inspect --at` and `--between` answer.

### Notes
- Written 2026-10-17 for C1 and C9 of [the plan](../../../../../.mdmd/layer-3/change-over-time.mdmd.md), as its tests and oracles ask: "nothing grades itself". The fixture's git is isolated from the person's configuration and its authors and dates are fixed; the history command runs as a person runs it, through tsx, with `--jobs 1`.
- The oracle regenerates each commit as a first run over its source sees it, the committed mirror removed, and summarizes the graph by its own reading; the orphan doc in the fixture's mirror is there so that a history read through the committed mirror would fail.
- The renamed screen keeps 75% of the view by git's score, found at git's 50% and not at 90%, so that a reading at another threshold would fail; and the seam checks a commit out under a person's `core.autocrlf=true` and must still give the stored bytes.
- Each test was shown able to fail on 2026-10-17 by a deliberate mutation of the code it holds: the rule's conditions, the touched set, the renamed edges, the replay check, the keyframe's seek, the cache, the committed mirror's removal, the rename threshold, the line endings, and the words inspect says.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`, `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`document.renderLiveDoc`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`format.HistorySequence`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`git.openGitRepository`](../../../packages/engine/src/live-docs/history/git.ts.mdmd.md#symbol-opengitrepository)
- [`sequence.changeAt`](../../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.seek`](../../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`Shape`](../../../packages/engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeKey`](../../../packages/engine/src/live-docs/history/shape.ts.mdmd.md#symbol-edgekey)
- [`staticBuilder.buildStaticExplorer`](../../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- [`StaticExplorerData`](../../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

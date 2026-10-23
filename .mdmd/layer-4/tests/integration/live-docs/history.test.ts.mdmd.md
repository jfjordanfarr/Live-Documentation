# tests/integration/live-docs/history.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/history.test.ts
- Generated At: 2026-10-22T16:48:00.908Z

## Authored
### Purpose
The history command over a repository built from a script of seven commits (files added, a directory renamed whole, a file renamed with an edit above git's threshold, a file rewritten below it, a file deleted, a symbol added, a content-only edit, and a committed mirror's orphan doc), held to oracles it does not produce: the generator's own index regenerated here at every commit, git's own `diff --name-status -M50%` between consecutive commits, the directory renamed whole, a second run that regenerates nothing, a checkout that keeps the stored bytes, the bundle's window, what `inspect --at` and `--between` answer, and, since 2026-10-20, the documents each commit's authored words linked to, held to the script itself.

### Notes
- Written 2026-10-17 for C1 and C9 of [the plan](../../../../../.mdmd/layer-3/change-over-time.mdmd.md), as its tests and oracles ask: "nothing grades itself". The fixture's git is isolated from the person's configuration and its authors and dates are fixed; the history command runs as a person runs it, through tsx, with three workers for the first generation and one for the cache-only repeat. The parallel run guards the worktree lifecycle exercised by the [October 23 failure](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#history-failure-investigation).
- The oracle regenerates each commit as a first run over its source sees it, the committed mirror removed, and summarizes files and wires by its own reading. Since 2026-10-20 ([Turn 9](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the history keeps the mirror's authored words and must still give exactly the oracle's files and wires; the orphan doc in the fixture's mirror, which now also links the design, is there so that a reading that kept it would fail. The doc links are held to the script, which commits a link written before its document exists, a link dropped from a doc, a link that leaves with its file, and the orphan's link, which never counts.
- The renamed screen keeps 75% of the view by git's score, found at git's 50% and not at 90%, so that a reading at another threshold would fail; and the seam checks a commit out under a person's `core.autocrlf=true` and must still give the stored bytes.
- Each test was shown able to fail on 2026-10-17 by a deliberate mutation of the code it holds: the rule's conditions, the touched set, the renamed edges, the replay check, the keyframe's seek, the cache, the committed mirror's removal, the rename threshold, the line endings, and the words inspect says.

The scripted repository moved to `scripted-repository.ts` on 2026-10-18, shared with the Explorer's history sample; the test's oracles are unchanged.

On 2026-10-20 both directions were shown to fail: a lens run that kept stale authored docs failed the replay, the scripted steps and the doc links; one that removed the mirror again failed the doc links and both `inspect` answers.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
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
- [`scripted-repository.MODEL`](./scripted-repository.ts.mdmd.md#symbol-model)
- [`scripted-repository.SCRIPT`](./scripted-repository.ts.mdmd.md#symbol-script)
- [`scripted-repository.SCRIPTED_CONFIG`](./scripted-repository.ts.mdmd.md#symbol-scripted_config)
- [`scripted-repository.buildRepository`](./scripted-repository.ts.mdmd.md#symbol-buildrepository)
- [`scripted-repository.git`](./scripted-repository.ts.mdmd.md#symbol-git)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

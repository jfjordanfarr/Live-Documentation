# `tests/integration/live-docs/history-reading.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/history-reading.test.ts`
- Generated At: 2026-11-20T09:32:50.728Z

## Authored
### Purpose
Holds the history command to a repository with what this repository's own history never held: a folder the configuration excludes that included code imports, re-exports and takes an asset from, documents the bundle excludes, and three symbolic links (`CLAUDE.md -> AGENTS.md`, `lib/b.ts -> ../src/b.ts`, `docs/alias.md -> guide.md`). Its mirror is generated in a checkout and committed, and the check at the head holds the history's last step to it; the summary must keep every linked document and the sequence apply the bundle's exclusions, and an edit of them must change the sequence at the next run with nothing summarized again.

### Notes
- Written 2026-11-19 from the [independent review](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/engine-round-review/README.md) of the engine round, whose test repositories showed the history contradicting the generator's docs while every test passed: the scripted repositories held no `exclude`, no `bundleExclude` and no link. Each behaviour taken away was seen to turn a case red: excluded files left out, links written as nothing, the exclusions applied inside the summary, and not applied where the sequence reads it. Asking the disk instead of the listing whether a linked document stands stays green on this platform, since every name is now written.
- A case for a document whose name holds parentheses waits (`it.fails`) on the doc reader's mend, which belongs to the builder who owns it: the doc reader cannot read back a `Cited By` link holding `)`.
- It runs with a temporary folder of its own, since the system's is shared by every history run on the machine.

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
- `node:zlib`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`format.HistorySequence`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`git.writeStoredTree`](../../../packages/engine/src/live-docs/history/git.ts.mdmd.md#symbol-writestoredtree)
- [`sequence.momentAt`](../../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-momentat)
- [`sequence.seek`](../../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`summary.CommitSummary`](../../../packages/engine/src/live-docs/history/summary.ts.mdmd.md#symbol-commitsummary) (type-only)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`headCheck.committedLiveDocGraph`](../../../packages/generator/src/history/headCheck.ts.mdmd.md#symbol-committedlivedocgraph)
- [`scripted-repository.FIXTURE_GIT_ENV`](./scripted-repository.ts.mdmd.md#symbol-fixture_git_env)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

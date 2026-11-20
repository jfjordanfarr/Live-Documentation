# `tests/integration/live-docs/history-tree-forward.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/history-tree-forward.test.ts`
- Generated At: 2026-11-20T09:35:04.704Z

## Authored
### Purpose
The proof of bringing a commit's tree forward, with the tree written anew as the oracle: a tree brought from one commit to the next must hold, file for file, byte for byte, executable bit for executable bit and folder for folder, exactly what the tree writer writes for that commit into an empty folder, leave out the same entries, and leave nothing of an earlier tree beside it.

### Notes
- Written 2026-11-20 with the history's workers ([the record of that day](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)), from a draft by the builder before. Its cases: every sample workspace of the integration tests committed in turn into one repository, the generator run over each tree before it is brought forward; one kind of small change at a time (bytes, mode, a file added, renamed, removed with its folder, become a folder and back, two names differing by case, a link made, retargeted and led nowhere, an excluded picture, a committed doc); a docs root nested in folders the commit does not hold; a stray file outside the docs root, in a folder that goes and in one that stays; this repository's own commits near, far and backwards.
- Each case also counts the trees brought forward, so that it cannot pass by writing every tree anew; where the disk takes two names for one (Windows, macOS) the case pair is rightly written anew and counted so.
- Seen red with each guard taken out: the blob not compared for a kept entry (the samples, the small changes and this repository's commits), the folders above a nested docs root left, and the walk of names skipped (the stray left in a folder that stays). A first run went red where the test wrote its stand-in for the generator under `.mdmd` while the default docs root is `.live-documentation`: the walk found the strays and every step was written anew, as it should be.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:crypto` - `createHash`
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`liveDocumentationConfig.parseLiveDocumentationConfigBytes`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-parselivedocumentationconfigbytes)
- [`git.openGitRepository`](../../../packages/engine/src/live-docs/history/git.ts.mdmd.md#symbol-opengitrepository)
- [`git.writeStoredTree`](../../../packages/engine/src/live-docs/history/git.ts.mdmd.md#symbol-writestoredtree)
- [`versionControl.WorkingTree`](../../../packages/engine/src/live-docs/history/versionControl.ts.mdmd.md#symbol-workingtree) (type-only)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`summarizeChange.treeOptions`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-treeoptions)
- [`scripted-repository.FIXTURE_GIT_ENV`](./scripted-repository.ts.mdmd.md#symbol-fixture_git_env)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

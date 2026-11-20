# `tests/integration/live-docs/history-lens-lock.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/history-lens-lock.test.ts`
- Generated At: 2026-11-20T14:15:09.425Z

## Authored
### Purpose
The independent oracle of the lock's half of the lens's key: a real worker of the history summarizes a commit of a small repository in every language the engine reads, under Node's permission model in its audit mode, and every path it reads under a `node_modules` folder, the grammars' WebAssembly files among them, must fall inside an entry of the lock that `keyedLockEntries` keys. A package a summary loads that the key left out would let the cache serve a stale summary in silence.

### Notes
- Written 2026-11-20, when the lock stopped keying the lens whole after a pin of Playwright moved the key and owed the whole history a rebuild ([the decision](../../../../layer-3/architectural-decisions.mdmd.md#the-dependency-lock-keys-the-lens-only-through-the-packages-a-summary-loads-recorded-2026-11-20)).
- The permission model neither restricts nor reports a thread's reads, so the case fails if the run starts a thread, and runs esbuild with `ESBUILD_WORKER_THREADS=0` so that tsx's compiler stays in the main thread. What a child process reads (git, esbuild's binary) is not seen.
- The case shows itself red from the same run: with the tree-sitter runtime taken out of the keyed set, and with the launcher taken out of the roots, the files read are named.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `fork`
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`lens.summarizedConfiguration`](../../../packages/engine/src/live-docs/history/lens.ts.mdmd.md#symbol-summarizedconfiguration)
- [`generatorIdentity.LOCK_ROOTS`](../../../packages/generator/src/history/generatorIdentity.ts.mdmd.md#symbol-lock_roots)
- [`generatorIdentity.keyedLockEntries`](../../../packages/generator/src/history/generatorIdentity.ts.mdmd.md#symbol-keyedlockentries)
- [`regenerate.summarizingEnvironment`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingenvironment)
- [`regenerate.summarizingFlags`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingflags)
- [`summarizeChange.WorkerReport`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workerreport) (type-only)
- [`summarizeChange.WorkerTask`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workertask) (type-only)
- [`scripted-repository.buildRepository`](./scripted-repository.ts.mdmd.md#symbol-buildrepository)
- [`scripted-repository.git`](./scripted-repository.ts.mdmd.md#symbol-git)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

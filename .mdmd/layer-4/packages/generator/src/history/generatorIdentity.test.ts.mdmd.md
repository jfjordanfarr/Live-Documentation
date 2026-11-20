# `packages/generator/src/history/generatorIdentity.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/generator/src/history/generatorIdentity.test.ts`
- Generated At: 2026-11-20T14:15:01.943Z

## Authored
### Purpose
Holds the history's lens to the code that makes a summary: the summarizing process's run-time imports, walked with the TypeScript parser from `summarizeChange.ts`, must all key the lens, and the only modules of the history folders they reach are the summary's own; and the rule leaves out the tests and the modules that only read summaries while keeping every other file of the two packages.

### Notes
- Written 2026-11-19 with the lens's narrowing in `generatorIdentity.ts`, so that the codec and the queries of the owner's three rungs ([Turn 37 of November 18](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)) could change after one rebuild. The walk skips what TypeScript elides, an `import type`, an `export type` and an import of types alone, and follows dynamic imports and `require` calls; it was seen to fail on a deliberate import of the codec from the text store.
- Since 2026-11-20 it holds the lock's half of the key too: the Playwright pin of that day (`b5e8d8226`) leaves it as it was; a change of the compiler, the tree-sitter runtime, the bundled grammars, the launcher or an integrity alone moves it; Node's resolution through the lock (a nested entry, a workspace's link, an optional dependency absent, a cycle) on small made-up locks; and every package the two packages' code imports or `require.resolve`s is declared by its manifest or named in `LOCK_ROOTS`. Each case was seen red against the whole-lock key or a broken resolution before the mend.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs` - `readFileSync`, `readdirSync`
- `node:module` - `isBuiltin`
- `node:path` - `path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`generatorIdentity.HISTORY_FOLDERS`](./generatorIdentity.ts.mdmd.md#symbol-history_folders)
- [`generatorIdentity.LOCK_ROOTS`](./generatorIdentity.ts.mdmd.md#symbol-lock_roots)
- [`generatorIdentity.SUMMARY_ENTRIES`](./generatorIdentity.ts.mdmd.md#symbol-summary_entries)
- [`generatorIdentity.SUMMARY_MODULES`](./generatorIdentity.ts.mdmd.md#symbol-summary_modules)
- [`generatorIdentity.keyedLockEntries`](./generatorIdentity.ts.mdmd.md#symbol-keyedlockentries)
- [`generatorIdentity.keysTheLens`](./generatorIdentity.ts.mdmd.md#symbol-keysthelens)
- [`generatorIdentity.lockIdentity`](./generatorIdentity.ts.mdmd.md#symbol-lockidentity)
- [`regenerate.summarizingEnvironment`](./regenerate.ts.mdmd.md#symbol-summarizingenvironment)
- [`regenerate.summarizingFlags`](./regenerate.ts.mdmd.md#symbol-summarizingflags)
- [`summarizeChange.treeOptions`](./summarizeChange.ts.mdmd.md#symbol-treeoptions)
- `typescript` - `ts`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

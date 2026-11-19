# packages/generator/src/history/generatorIdentity.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/history/generatorIdentity.test.ts
- Generated At: 2026-11-19T08:59:55.165Z

## Authored
### Purpose
Holds the history's lens to the code that makes a summary: the summarizing process's run-time imports, walked with the TypeScript parser from `summarizeChange.ts`, must all key the lens, and the only modules of the history folders they reach are the summary's own; and the rule leaves out the tests and the modules that only read summaries while keeping every other file of the two packages.

### Notes
- Written 2026-11-19 with the lens's narrowing in `generatorIdentity.ts`, so that the codec and the queries of the owner's three rungs ([Turn 37 of November 18](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)) could change after one rebuild. The walk skips what TypeScript elides, an `import type`, an `export type` and an import of types alone, and follows dynamic imports and `require` calls; it was seen to fail on a deliberate import of the codec from the text store.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`, `readdirSync`
- `node:path` - `path`
- [`generatorIdentity.HISTORY_FOLDERS`](./generatorIdentity.ts.mdmd.md#symbol-history_folders)
- [`generatorIdentity.SUMMARY_ENTRIES`](./generatorIdentity.ts.mdmd.md#symbol-summary_entries)
- [`generatorIdentity.SUMMARY_MODULES`](./generatorIdentity.ts.mdmd.md#symbol-summary_modules)
- [`generatorIdentity.keysTheLens`](./generatorIdentity.ts.mdmd.md#symbol-keysthelens)
- `typescript` - `ts`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

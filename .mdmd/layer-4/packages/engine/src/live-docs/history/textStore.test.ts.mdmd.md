# packages/engine/src/live-docs/history/textStore.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/history/textStore.test.ts
- Generated At: 2026-11-19T06:20:28.627Z

## Authored
### Purpose
Holds the text store to its contract: each text once under its hash and read back, a text given under another hash refused, a stored text changed on disk refused, and a name that is not a hash refused before it becomes a path.

### Notes
- Written 2026-11-19 with `textStore.ts`, for C15 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md) ([Turn 37 of November 18](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`summary.textHash`](./summary.ts.mdmd.md#symbol-texthash)
- [`textStore.putTexts`](./textStore.ts.mdmd.md#symbol-puttexts)
- [`textStore.readText`](./textStore.ts.mdmd.md#symbol-readtext)
- [`textStore.textPath`](./textStore.ts.mdmd.md#symbol-textpath)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

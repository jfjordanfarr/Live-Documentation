# `packages/engine/src/tooling/compareText.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/compareText.ts`
- Generated At: 2026-11-19T21:10:12.711Z

## Authored
### Purpose
The one order the engine sorts names, labels and paths by, alphabetical without regard to case and then by code unit, so that the docs list their lines in the same order on every machine and every Node.

### Notes
- Written 2026-11-19 after [the independent review of the history's data](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/README.md) found that the engine sorted with `localeCompare`, whose order is the collation of the ICU data Node was built with and of the process's locale: the history's summaries keep the docs' order, and two runs of one generator could have differed. Every `localeCompare` of the engine became this function in one commit; this repository's mirror kept its order line for line.
- Case is folded with `toLowerCase`, which depends on the version of Unicode the runtime lowers by; the history's lens keys on that version (`generatorIdentity.ts`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `compareText` {#symbol-comparetext}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/compareText.ts#L23)

##### `compareText` — Summary
Negative when `a` sorts before `b`, positive when after, 0 only when they are the same text.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

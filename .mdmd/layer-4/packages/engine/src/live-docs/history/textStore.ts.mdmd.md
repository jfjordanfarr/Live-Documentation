# packages/engine/src/live-docs/history/textStore.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/textStore.ts
- Generated At: 2026-11-19T06:20:28.631Z

## Authored
### Purpose
The lens's text store: each distinct text the summaries name, a doc's authored block or a symbol's description, kept once under the SHA-256 of its content, `<lens folder>/texts/<two hex digits>/<hash>`, and read back only when its content is still the text of its name.

### Notes
- Written 2026-11-19 for C15 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), the owner's "How do we mitigate these costs and risks?" ([Turn 37 of November 18](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)): with each summary keeping its texts whole the cache would have grown from 206 MB toward 1.5 to 2 GB, by [the probe's](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-cost/README.md) estimate.
- One file per text, written under a temporary name and renamed into place, so that the processes of a pool write into one store without a lock, two writing one text write the same bytes, and a stopped run leaves no text the store would trust. A text already stored is not written again.
- A read checks the content against its name, so that a text changed on disk is refused rather than shown as that day's words; a name that is not a hash is refused before any path is made of it. The store lives under the lens's folder, so that removing a superseded lens removes its texts.
- It runs in the summarizing process, so the lens keys on it (`generatorIdentity.ts`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TEXT_STORE_DIRECTORY` {#symbol-text_store_directory}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/textStore.ts#L27)

##### `TEXT_STORE_DIRECTORY` — Summary
The folder under a lens's cache folder that holds its texts.

#### `textPath` {#symbol-textpath}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/textStore.ts#L30)

##### `textPath` — Summary
Where the text of a hash lies in the store.

#### `putTexts` {#symbol-puttexts}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/textStore.ts#L42)
- Parameters: `texts`: `ReadonlyMap`

##### `putTexts` — Summary
Puts the texts in the store, each that it lacks, and returns how many it wrote.

##### `putTexts` — Exceptions
- _Unknown_: When a text is not the text of the hash it is given under.

#### `readText` {#symbol-readtext}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/textStore.ts#L74)

##### `readText` — Summary
The text of a hash.

##### `readText` — Exceptions
- _Unknown_: When the store lacks it, or holds under its name a text that is not the text of that hash.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`summary.textHash`](./summary.ts.mdmd.md#symbol-texthash)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

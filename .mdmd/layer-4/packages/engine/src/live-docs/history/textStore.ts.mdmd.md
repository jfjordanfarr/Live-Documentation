# packages/engine/src/live-docs/history/textStore.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/textStore.ts
- Generated At: 2026-11-19T06:20:28.631Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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

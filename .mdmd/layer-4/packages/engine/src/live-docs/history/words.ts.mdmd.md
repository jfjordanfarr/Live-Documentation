# packages/engine/src/live-docs/history/words.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/words.ts
- Generated At: 2026-11-19T06:20:28.673Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WORDS_FORMAT` {#symbol-words_format}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L32)

##### `WORDS_FORMAT` — Summary
The version of the format of a part of the words store.

#### `WORDS_DIRECTORY` {#symbol-words_directory}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L35)

##### `WORDS_DIRECTORY` — Summary
The folder beside the sequence's file that holds the words store of the history command.

#### `WordsHead` {#symbol-wordshead}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L38)

##### `WordsHead` — Summary
What a sequence says of the words store beside it.

#### `WordsPart` {#symbol-wordspart}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L48)

##### `WordsPart` — Summary
One part of the words store: the texts first named by the files of one directory, in path order and then step order.

#### `wordsDirectory` {#symbol-wordsdirectory}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L58)

##### `wordsDirectory` — Summary
The directory whose part of the store holds the words of a file: its own folder, `""` at the top level.

#### `textsOfFile` {#symbol-textsoffile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L64)
- Parameters: `file`: [`FileRows`](./rows.ts.mdmd.md#symbol-filerows)

##### `textsOfFile` — Summary
Every text a file's rows name: its authored words' and its symbols' descriptions'.

#### `textReferences` {#symbol-textreferences}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L76)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `textReferences` — Summary
Where each text a sequence names is first named by the files of each directory: a list per directory of the ids,
ordered by the path that names it and then by the step, so that one file's versions lie together.

#### `wordsStore` {#symbol-wordsstore}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L125)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `wordsStore` — Summary
The words store of a sequence: its head and its parts, each text read by `textOf`.

##### `wordsStore` — Parameters
- `folder`: The store's folder, relative to the folder of the sequence's file.

#### `wordsPartFile` {#symbol-wordspartfile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L137)
- Parameters: `head`: [`WordsHead`](#symbol-wordshead)

##### `wordsPartFile` — Summary
The file name of a directory's part of the store, under the store's folder; undefined when no file of that directory has words.

#### `WordsOfFile (interface)` {#symbol-wordsoffile-interface}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L143)

##### `WordsOfFile (interface)` — Summary
A file's words at a moment, by text id: its authored block, and each symbol's description, by the symbol's anchor.

#### `wordsOfFile (function)` {#symbol-wordsoffile-function}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L151)
- Returns: [`WordsOfFile`](#symbol-wordsoffile-interface)
- Parameters: `rows`: [`Rows`](./rows.ts.mdmd.md#symbol-rows)

##### `wordsOfFile (function)` — Summary
What a file's words were at a moment, by text id, without the texts, which a part of the store holds.

#### `textInPart` {#symbol-textinpart}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/words.ts#L163)
- Parameters: `part`: [`WordsPart`](#symbol-wordspart)

##### `textInPart` — Summary
The text of an id in a part of the store.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HistorySequence`](./format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`rows.AuthoredWords`](./rows.ts.mdmd.md#symbol-authoredwords)
- [`rows.FileRows`](./rows.ts.mdmd.md#symbol-filerows)
- [`Rows`](./rows.ts.mdmd.md#symbol-rows)
- [`rows.applyRowsChange`](./rows.ts.mdmd.md#symbol-applyrowschange)
- [`sequence.changeAt`](./sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.momentAt`](./sequence.ts.mdmd.md#symbol-momentat)
- [`sequence.rowsChangeAt`](./sequence.ts.mdmd.md#symbol-rowschangeat)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

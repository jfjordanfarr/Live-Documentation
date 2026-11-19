# packages/engine/src/live-docs/history/format.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/format.ts
- Generated At: 2026-11-19T06:20:28.511Z

## Authored
### Purpose
The format of `history.json`, the sequence a repository's history is read into under one lens: the head (the lens, the source with its sampling, an export's window, the words store beside it), the paths, archetypes and names written once, the base snapshot in full with its rows, one delta per later commit, and a keyframe every 256 steps. One commit's summary in the cache has its format in `summary.ts` since 2026-11-19.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), from its shape: one file with the shape, not the docs, of every sampled commit, each file with its archetype, symbol count and entry mark and each directed file-to-file edge with its count, as [the probe of 2026-10-16](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/Probes/change-over-time/README.md) measured it (272,627 bytes for 121 steps of this repository, 58 KB gzipped). The decisions it carries are in [Turn 3 of October 16](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3), and [Turn 3](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-3) and [Turn 5](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-5) of October 17: "One lens. One generator over old snapshots", "Trust what git says", and the export's window and authors as the exporter's choice.
- Never committed: on 2025-11-10 the owner retired git-derived numbers from the committed docs because two clones' histories differ, and on 2025-11-11 allowed local history for views nothing permanent depends on; the sequence is such a view, and lives beside the graph index under the docs root.
- A delta's renames are applied first and a renamed file keeps its edges under its new path, so an edge that only followed its file neither comes nor goes. `touched` holds the files git saw change in content while nothing of their shape did: C3's minor ticks.
- The entry mark is one boolean per file, as C1 recommended, so that the walk from a past commit's entries can run; the Entry lines' reasons were in the docs of that day, which the sequence does not keep.
- `HistoryHead` is what the bundle's data says of the history it carries, so that the client knows the lens, the window and where knowledge begins before it fetches the file.
- The format's version is `live-docs-history/2` since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)), when a snapshot and a step began to carry the links from each file's authored words to the documents that stood then (`docLinks`, `docLinksAdded`, `docLinksRemoved`); version 1 had none. The CLI and the static builder refuse another version and name the command that writes this one.
- `GeneratorIdentity.code` (the evening of 2026-10-18) hashes committed tool inputs in place of the commit, which still rides in the head for the reader: until then every commit of this repository, even one touching no generator code, was a new lens and regenerated the whole cache. It included the engine and generator trees and, since 2026-10-19, this tool checkout's dependency-lock entry; since 2026-11-19 it covers only the files that make a summary (`generatorIdentity.ts`). `modified` covers uncommitted changes to the same inputs.
- Format 3 (2026-11-19, [Turn 35](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of November 18) adds the second rung beside the shape, the rows a 2D card draws (`rows.ts`), and names the words of the third by text id (`words.ts`). Its tuples leave out each element at their end that is its default, so that a symbol with no flags, references or description is three numbers; `NO_WORDS` and `UNREAD_WORDS` keep "no doc stood" apart from "a doc stood whose words cannot be read". The shape's tuples are unchanged, so a consumer that reads only the shape reads a format-3 sequence as before; the version still changes, since a format-2 file has no rows and the CLI and the static builder refuse it.
- The step's rows fields name a symbol by its file's path id and its anchor's name id, rather than by an id given at birth as the probe of 2026-11-18 proposed: a step then decodes on its own, as the shape's steps do, which `changeAt` and every reader that walks the steps rely on.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HISTORY_FORMAT` {#symbol-history_format}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L40)

##### `HISTORY_FORMAT` — Summary
The version of the sequence's format, written first in every `history.json`.

#### `HISTORY_DIRECTORY` {#symbol-history_directory}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L43)

##### `HISTORY_DIRECTORY` — Summary
The folder under the docs root that holds the cache and the sequence.

#### `HISTORY_FILE` {#symbol-history_file}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L46)

##### `HISTORY_FILE` — Summary
The name of the sequence's file, under {@link HISTORY_DIRECTORY}.

#### `KEYFRAME_INTERVAL` {#symbol-keyframe_interval}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L49)

##### `KEYFRAME_INTERVAL` — Summary
How many steps lie between two keyframes: a seek replays at most one fewer.

#### `FileTuple` {#symbol-filetuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L52)

##### `FileTuple` — Summary
One file in a snapshot: its path's id, its archetype's id, its symbol count, and 1 when its doc carries an Entry line.

#### `EdgeTuple` {#symbol-edgetuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L55)

##### `EdgeTuple` — Summary
One directed edge in a snapshot: the files' path ids and how many of the source's references land on the target.

#### `EdgeEnds` {#symbol-edgeends}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L58)

##### `EdgeEnds` — Summary
The two ends of a directed edge, by path id.

#### `ShapeTuples` {#symbol-shapetuples}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L61)

##### `ShapeTuples` — Summary
A whole shape: every file, every edge and every doc link, sorted by id.

#### `ReferenceTuple` {#symbol-referencetuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L73)

##### `ReferenceTuple` — Summary
A type reference of a symbol: its role's name id, its type's name id, then, each left out from the end when it is
its default, its parameter's name id (-1 for none), its marks (1 an array, 2 a promise), and the path id and anchor
name id it resolved to (-1 for none).

#### `SymbolTuple` {#symbol-symboltuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L79)

##### `SymbolTuple` — Summary
A symbol row: its heading's, anchor's and kind's name ids, then, each left out from the end when empty, its flags'
name ids, its type references, and the id of its description's text (-1 for none).

#### `DependencyTuple` {#symbol-dependencytuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L86)

##### `DependencyTuple` — Summary
A dependency line: its label's name id and kind (0 an import, 1 a re-export), then, each left out from the end when
it is its default, its marks (1 type-only), its basis's name id, the path id and anchor name id it resolved to (-1
for none), and the name ids of the symbols an external dependency gives.

#### `EntryTuple` {#symbol-entrytuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L89)

##### `EntryTuple` — Summary
An entry line: its reason's name id, then its symbol's and command's name ids and its declarer's path id (-1 for none), left out from the end when none.

#### `ReExportTuple` {#symbol-reexporttuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L92)

##### `ReExportTuple` — Summary
A re-exported anchor: its name id, then its anchor's name id, its origin's path id, its origin's label's name id (-1 for none) and its flags' name ids, left out from the end when none.

#### `NO_WORDS` {#symbol-no_words}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L95)

##### `NO_WORDS` — Summary
The authored words of a file in a tuple: the id of their text, {@link NO_WORDS} or {@link UNREAD_WORDS}.

#### `UNREAD_WORDS` {#symbol-unread_words}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L97)

##### `UNREAD_WORDS` — Summary
A doc stood whose form today's reader cannot read the authored words of.

#### `FileRowsTuple` {#symbol-filerowstuple}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L104)

##### `FileRowsTuple` — Summary
A file's rows: its path id, then, each left out from the end when it is its default, its authored words (a text id,
{@link NO_WORDS} or {@link UNREAD_WORDS}), its symbols in the doc's order, its dependency lines, its entries, its
re-exported anchors and the path ids of the documents that cite it.

#### `SnapshotTuples` {#symbol-snapshottuples}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L107)
- Extends: [`ShapeTuples`](#symbol-shapetuples)

##### `SnapshotTuples` — Summary
A whole snapshot: its shape and, since format 3, every file's rows, sorted by path id.

#### `CommitInfo` {#symbol-commitinfo}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L112)

##### `CommitInfo` — Summary
One change of the version control, as the sequence names it.

#### `StepDelta` {#symbol-stepdelta}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L132)

##### `StepDelta` — Summary
What one step changed, by id; an empty list is left out. Applied in this
order: the renames first (a renamed file keeps its shape, its edges and its
doc links under the new path), then the edges and doc links removed, the
files dead and born, the files resized, rekinded and re-marked, and the
edges added and changed and the doc links added.

#### `HistoryStep` {#symbol-historystep}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L183)

##### `HistoryStep` — Summary
One sampled change after the base: the change and what it did to the shape.

#### `Keyframe` {#symbol-keyframe}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L189)
- Extends: [`SnapshotTuples`](#symbol-snapshottuples)

##### `Keyframe` — Summary
A snapshot repeated whole after a step, so that a seek need not replay from the base.

#### `GeneratorIdentity` {#symbol-generatoridentity}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L195)

##### `GeneratorIdentity` — Summary
Which generator made the summaries: its package version, committed tool inputs, the commit it runs from and any uncommitted change to those inputs.

#### `HistoryLens` {#symbol-historylens}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L211)

##### `HistoryLens` — Summary
The lens: one generator and one configuration, applied to every change of the sequence.

#### `Sampling` {#symbol-sampling}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L220)

##### `Sampling` — Summary
Which changes of the mainline were regenerated.

#### `HistorySource` {#symbol-historysource}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L235)

##### `HistorySource` — Summary
Where the sequence was read from.

#### `HistoryWindow` {#symbol-historywindow}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L254)

##### `HistoryWindow` — Summary
The part of a sequence an export carries, when it carries less than the whole.

#### `HistorySequence` {#symbol-historysequence}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L257)

##### `HistorySequence` — Summary
The sequence: `history.json`.

#### `HistoryHead` {#symbol-historyhead}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/format.ts#L279)

##### `HistoryHead` — Summary
What a sequence says of itself without its body, which the bundle's data carries beside the history file's name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LiveDocumentationConfig`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`words.WordsHead`](./words.ts.mdmd.md#symbol-wordshead) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

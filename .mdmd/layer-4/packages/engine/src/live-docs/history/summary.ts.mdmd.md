# `packages/engine/src/live-docs/history/summary.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/history/summary.ts`
- Generated At: 2026-11-20T14:07:46.280Z

## Authored
### Purpose
One commit's summary as the history command's cache keeps it, read from the graph the generator derived at that commit, and the format it is kept in: since 2026-11-19 every fact of each file's doc that is not prose (its archetype, entries, public symbols in the doc's order with their kinds, flags and type references, dependency lines, re-exported anchors and citing documents, each resolved to the file and symbol it names), with its prose named by the hash of its text, and the texts handed to the caller for the lens's text store.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). An edge counts the graph file's `edges` whose `to` is the other file, dependency lines and linked type references alike, a self-reference left out; the symbol count is the doc's `Public Symbols` headings, overloads included, as the structure layout sizes a sphere.
- A doc without an archetype stops the summary: the generator writes one on every doc, so its absence is a generator bug, not a shape to record.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)) a summary also records each file's related documents, which its caller reads with `relatedDocsOf` and checks against the commit's tree, since the graph alone cannot see whether a document stood; each is recorded once, sorted, and only for a file of the graph.
- Format 3 (2026-11-19) keeps the rows the 2D map draws, for the owner's three rungs of history in 2D ([Turn 35](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-35) and [Turn 37](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37) of the November 18 record, "Then we should really do it"): the build already derived every symbol and description at each commit and discarded them, so one change of the summary serves the second and third rungs with one rebuild. The format moved here from `format.ts`, so that this module, which the summarizing process runs, imports nothing of the sequence's at run time and the lens can leave the sequence's modules out of its key (`generatorIdentity.ts`).
- A type reference's or a dependency line's target is read from the graph's edges, which the graph pushes one per dependency line and then one per linked type of each symbol, in order; the summary checks the count and stops on a mismatch, a generator bug. The symbol and edge counts the shape carries are read back from these rows (`shapeOfSummary` in `shape.ts`).
- A description's text is its `#####` sections as JSON, without the symbol's name, so that a symbol renamed with its words unchanged keeps its text, the evidence `rows.ts` believes a rename on.
- What can be read of a doc's authored block is the caller's to say, from the docs as they stood before the generator rewrote them: `read`, `unread` (a doc stood with no `## Authored` heading, so the block the generator wrote is its placeholder and not that day's words), or nothing, when no doc stood. The data never passes the placeholder off as the words of a day it could not read.
- Each `Source:` line is left out, since its number moves with nearly every edit above it while the doc's order says the same, as the probe of 2026-11-18 recommended.
- Format 4 (2026-11-19, after the independent review of the engine round): a file's `citedBy` holds each citing document's path, read from its `Cited By` line's link, where format 3 held the line's label, which writes a backtick as an apostrophe; the bundle's exclusions are held to the path where the summaries are read, and the rows make the label from it (`citedByLabel`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HISTORY_SUMMARY_FORMAT` {#symbol-history_summary_format}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L36)

##### `HISTORY_SUMMARY_FORMAT` — Summary
The version of the format of one change's summary in the cache.

#### `ReferenceRole` {#symbol-referencerole}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L39)

##### `ReferenceRole` — Summary
How a type reference stands in its symbol's signature, by the graph's name for the edge it makes.

#### `RowReference` {#symbol-rowreference}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L42)

##### `RowReference` — Summary
One type a symbol's signature names: a `Returns`, `Parameters`, `Extends`, `Implements` or `Constraints` entry.

#### `SymbolRow` {#symbol-symbolrow}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L57)

##### `SymbolRow` — Summary
One public symbol of a file, a row of its card, as its doc listed it at the change.

#### `DependencyRow` {#symbol-dependencyrow}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L72)

##### `DependencyRow` — Summary
One `Dependencies` line of a file's doc.

#### `EntryRow` {#symbol-entryrow}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L87)

##### `EntryRow` — Summary
One `Entry` line of a file's doc: why something outside the code starts it.

#### `ReExportRow` {#symbol-reexportrow}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L98)

##### `ReExportRow` — Summary
One entry of a file's `Re-Exported Symbol Anchors`.

#### `SummaryFile` {#symbol-summaryfile}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L109)

##### `SummaryFile` — Summary
What a file's doc said at a change, everything but its prose, which is named by hash, and its `Source:` lines.

#### `CommitSummary` {#symbol-commitsummary}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L135)

##### `CommitSummary` — Summary
One change's summary as the cache keeps it: `<docsRoot>/history/<lens>/<change>.json.gz`.

#### `AuthoredReading` {#symbol-authoredreading}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L164)
- Returns: `ReadonlyMap`

##### `AuthoredReading` — Summary
What the lens could read of a doc's authored block at a change, by the doc's workspace-relative path: `read` when
the doc that stood there has an `## Authored` heading, which the generator carries forward verbatim; `unread` when
it stood in a form with none, as this repository's mirror before 2026-09-27 does, so that the block the generator
writes is its placeholder and not that day's words. A doc absent from the map did not stand at the change.

#### `SummarizedChange` {#symbol-summarizedchange}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L167)

##### `SummarizedChange` — Summary
A summary and the texts it names by hash, for the caller to put in the text store.

#### `summarizeGraph` {#symbol-summarizegraph}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L184)
- Returns: [`SummarizedChange`](#symbol-summarizedchange)
- Parameters: `graph`: [`LiveDocGraph`](../graph.ts.mdmd.md#symbol-livedocgraph); `relatedDocs`: `ReadonlyMap`; `authored`: [`AuthoredReading`](#symbol-authoredreading)

##### `summarizeGraph` — Summary
The summary of a graph.

##### `summarizeGraph` — Parameters
- `authored`: What could be read of each doc's authored block, by doc path; the caller reads the docs that stood
at the change before the generator rewrote them. Without it, every doc's block counts as read.
- `commit`: The change's id.
- `graph`: The graph the generator derived at the change.
- `lens`: The key of the lens the generator ran under.
- `relatedDocs`: The documents a file's authored words link to that stood at the change, by the file's path;
the caller reads them with `relatedDocsOf` and the change's tree, which the graph alone cannot see.

#### `descriptionText` {#symbol-descriptiontext}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L301)

##### `descriptionText` — Summary
A symbol's description as one text: its `#####` sections as JSON, `[{ title, body }]`, without the symbol's name, so
that a symbol renamed with its description unchanged keeps its text; {@link sectionsOfDescription} reads it back.

#### `sectionsOfDescription` {#symbol-sectionsofdescription}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L306)
- Returns: [`DocSection`](../document.ts.mdmd.md#symbol-docsection)[]

##### `sectionsOfDescription` — Summary
The sections a description's text holds.

#### `textHash` {#symbol-texthash}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L311)

##### `textHash` — Summary
The name of a text in the store: the SHA-256 of its UTF-8 bytes, in hexadecimal.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- [`document.DocSection`](../document.ts.mdmd.md#symbol-docsection) (type-only)
- [`graph.EdgeBasis`](../graph.ts.mdmd.md#symbol-edgebasis)
- [`graph.GraphEdge`](../graph.ts.mdmd.md#symbol-graphedge)
- [`graph.LiveDocGraph`](../graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.linkTarget`](../graph.ts.mdmd.md#symbol-linktarget-function)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

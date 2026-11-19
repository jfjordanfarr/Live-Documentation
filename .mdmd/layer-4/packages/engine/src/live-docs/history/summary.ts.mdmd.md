# packages/engine/src/live-docs/history/summary.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/summary.ts
- Generated At: 2026-10-22T16:47:53.404Z

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

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `summarizeGraph` {#symbol-summarizegraph}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L24)
- Returns: [`CommitSummary`](./format.ts.mdmd.md#symbol-commitsummary)
- Parameters: `graph`: [`LiveDocGraph`](../graph.ts.mdmd.md#symbol-livedocgraph); `relatedDocs`: `ReadonlyMap`

##### `summarizeGraph` — Summary
The summary of a graph: every file with its archetype, its symbol count and
whether its doc carries an Entry line, every directed edge between two
different files with the number of the source's references that land on the
target, and every link from a file's authored words to a document.

##### `summarizeGraph` — Parameters
- `commit`: The change's id.
- `graph`: The graph the generator derived at the change.
- `lens`: The key of the lens the generator ran under.
- `relatedDocs`: The documents a file's authored words link to that stood at the change, by the file's path;
the caller reads them with `relatedDocsOf` and the change's tree, which the graph alone cannot see.

#### `shapeOfSummary` {#symbol-shapeofsummary}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/summary.ts#L51)
- Returns: [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- Parameters: `summary`: [`CommitSummary`](./format.ts.mdmd.md#symbol-commitsummary)

##### `shapeOfSummary` — Summary
The shape a summary records.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.LiveDocGraph`](../graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`format.CommitSummary`](./format.ts.mdmd.md#symbol-commitsummary)
- [`format.HISTORY_SUMMARY_FORMAT`](./format.ts.mdmd.md#symbol-history_summary_format)
- [`shape.FileShape`](./shape.ts.mdmd.md#symbol-fileshape)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeKey`](./shape.ts.mdmd.md#symbol-edgekey)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

# packages/engine/src/live-docs/history/summary.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/summary.ts
- Generated At: 2026-10-22T16:47:53.404Z

## Authored
### Purpose
One commit's summary as the history command's cache keeps it, read from the graph the generator derived at that commit: every file with its archetype, its symbol count and whether its doc carries an Entry line, and every directed edge between two different files with how many of the source's references land on the target; and the shape a summary records.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). An edge counts the graph file's `edges` whose `to` is the other file, dependency lines and linked type references alike, a self-reference left out; the symbol count is the doc's `Public Symbols` headings, overloads included, as the structure layout sizes a sphere.
- A doc without an archetype stops the summary: the generator writes one on every doc, so its absence is a generator bug, not a shape to record.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) a summary also records each file's related documents, which its caller reads with `relatedDocsOf` and checks against the commit's tree, since the graph alone cannot see whether a document stood; each is recorded once, sorted, and only for a file of the graph.

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

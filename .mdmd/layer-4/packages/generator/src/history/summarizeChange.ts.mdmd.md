# packages/generator/src/history/summarizeChange.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/summarizeChange.ts
- Generated At: 2026-10-22T16:47:56.984Z

## Authored
### Purpose
One commit's summary, made in a process of its own: the generator run over the commit's working tree under the lens's configuration, the derived graph's shape written to the cache, and the full index too when asked.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). The docs are written into the scratch tree's own docs root, never the real one, and the lens's configuration is applied verbatim, so its docs root stays undocumented as source. Until 2026-10-20 the mirror committed at that commit was removed first: it carries the generator of its day (the plan's failed idea of reading it), and its orphans with authored words would otherwise survive the generator's pruning into the reading.
- Since 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the mirror is regenerated in place, as the owner asked: today's generator rewrites every generated section, so nothing of the generator of that day is read, and keeps that day's authored words, where the doc links are; `keepAuthoredStaleDocs: false` prunes every doc this run does not document, an orphan with words included, so a commit's files and wires are exactly a fresh generation's. Each file's related documents (`relatedDocsOf`) that stand in the commit's tree go into the summary.
- A summary is written to a temporary name and renamed into place, so that a stopped run leaves no summary the cache would trust.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SummaryTask` {#symbol-summarytask}
- Type: interface
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L45)

##### `SummaryTask` — Summary
What one process is asked to do.

#### `summarizeChange` {#symbol-summarizechange}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/summarizeChange.ts#L61)
- Parameters: `task`: [`SummaryTask`](#symbol-summarytask)

##### `summarizeChange` — Summary
Generates the change's docs in its working tree and writes its summary, and its index when asked.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- `node:zlib` - `gzipSync`
- [`LiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`summary.summarizeGraph`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-summarizegraph)
- [`relatedDocs.relatedDocsOf`](../../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-relateddocsof)
- [`generator.generateLiveDocs`](../generator.ts.mdmd.md#symbol-generatelivedocs)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

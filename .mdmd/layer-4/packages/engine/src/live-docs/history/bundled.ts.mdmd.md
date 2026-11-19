# packages/engine/src/live-docs/history/bundled.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/bundled.ts
- Generated At: 2026-11-19T17:55:37.157Z

## Authored
### Purpose
A commit's summary as a person or a command reads it: the documents the configuration's bundle exclusions (`bundleExclude`) name taken out of its document links and its files' `Cited By` lists, by the rule the bundle reads today's graph by (`excluded` in `relatedDocs.ts`). The history command applies it to each summary as it reads the cache into the sequence.

### Notes
- Written 2026-11-19, when the bundle's exclusions moved out of the summaries and out of the lens's key ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-historys-tree-holds-only-what-is-read-and-the-bundles-exclusions-apply-where-summaries-are-read-recorded-2026-11-19)). The session archive had moved the day before and its patterns with it, so the records under its former path counted as linked documents at 188 old steps, and only a rebuild could have mended that while the summarizing process applied the exclusions. Now a summary keeps every linked and citing document and an edit of `bundleExclude` rewrites the sequence from the cache.
- A list emptied is left out, as the summarizing process writes a file no document cites, so that a summary read through this function with the exclusions it was made under is the summary as it was made byte for byte; that is how 54 commits were checked against the cache of the lens before ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-cost/README.md)).
- Not part of the summarizing process and not in the lens's key; it must stay so, or an edit of the exclusions would again cost a rebuild.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `bundledSummary` {#symbol-bundledsummary}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/bundled.ts#L22)
- Returns: [`CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary)
- Parameters: `summary`: [`CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary)

##### `bundledSummary` — Summary
The summary without the documents `bundleExclude` names, in its links and its files' `Cited By`; the summary itself is left as it was.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`summary.CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary) (type-only)
- [`relatedDocs.excluded`](../relatedDocs.ts.mdmd.md#symbol-excluded)
<!-- LIVE-DOC:END Dependencies -->

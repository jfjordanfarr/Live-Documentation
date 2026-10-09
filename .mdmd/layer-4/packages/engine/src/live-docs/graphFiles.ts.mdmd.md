# packages/engine/src/live-docs/graphFiles.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/graphFiles.ts
- Generated At: 2026-10-09T20:42:16.286Z

## Authored
### Purpose
The graph on disk: `readLiveDocGraph` reads every doc under the configured root into a graph, `readEstateGraph` reads the scans a board names into the estate's graph, and `writeLiveDocGraph` writes a graph to `<root>/index.json`, pretty-printed for readers outside this code base.

### Notes
- Written 2026-09-28. The docs are read in parallel: on this workspace's mount a serial read of 562 docs takes about 1.5 s and a parallel one about 0.3 s, while parsing them all takes about 15 ms, which is why no consumer caches the index and every one derives it afresh.
- A doc the grammar refuses stops the read with its path and line; a doc nobody may hand-edit can only be malformed by a generator bug or a preserved orphan.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)) `readEstateGraph` reads the scans a board names: the workspace root when it has docs and the folder of every thing whose `From` has them, each read as its own graph and merged by `deriveEstateGraph`; a scan inside another is reported and not read, the outer standing for it, since a scan never lies inside another scan (the owner's rule, Turn 3 of the same session). One scan at the root is today's single graph, so a board over one workspace reads as before. Every scan is read with the one configuration given; a thing with a configuration of its own is not read by it yet.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readLiveDocGraph` {#symbol-readlivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graphFiles.ts#L24)

##### `readLiveDocGraph` — Summary
Reads every Live Doc under the configured root and derives the graph.

A doc the grammar refuses stops the read with its path and line, since a doc
nobody may hand-edit can only be malformed by a generator bug.

#### `EstateReading` {#symbol-estatereading}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graphFiles.ts#L43)

##### `EstateReading` — Summary
What reading an estate found: its graph, the scans it read, and what it found wanting.

#### `readEstateGraph` {#symbol-readestategraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graphFiles.ts#L62)

##### `readEstateGraph` — Summary
Reads the graph of the estate a board describes.

##### `readEstateGraph` — Remarks
A scan is a folder with docs under the configured root: the workspace root
when it has them, and the folder of every thing whose `From` has them. A scan
never lies inside another scan, so a folder with docs inside another scan is
reported and not read, the outer scan's docs standing for it. The scans are
then merged into one graph by {@link deriveEstateGraph}, which links across
them what each left unlinked. One scan at the root is today's single graph.

#### `writeLiveDocGraph` {#symbol-writelivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graphFiles.ts#L107)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph)

##### `writeLiveDocGraph` — Summary
Writes the graph to `<root>/index.json`, pretty-printed for readers outside this code base.

##### `writeLiveDocGraph` — Returns
The workspace-relative path written.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`Board`](./board.ts.mdmd.md#symbol-board) (type-only)
- [`boardGraph.folderOf`](./boardGraph.ts.mdmd.md#symbol-folderof)
- [`document.LiveDocSyntaxError`](./document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`estateGraph.EstateScan`](./estateGraph.ts.mdmd.md#symbol-estatescan)
- [`estateGraph.contains`](./estateGraph.ts.mdmd.md#symbol-contains)
- [`estateGraph.deriveEstateGraph`](./estateGraph.ts.mdmd.md#symbol-deriveestategraph)
- [`graph.DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)
- [`graph.GRAPH_INDEX_FILE`](./graph.ts.mdmd.md#symbol-graph_index_file)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.deriveLiveDocGraph`](./graph.ts.mdmd.md#symbol-derivelivedocgraph)
<!-- LIVE-DOC:END Dependencies -->

# packages/shared/src/live-docs/graphFiles.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/graphFiles.ts
- Generated At: 2026-09-28T00:41:40.519Z

## Authored
### Purpose
The graph on disk: `readLiveDocGraph` reads every doc under the configured root into a graph, and `writeLiveDocGraph` writes a graph to `<root>/index.json`, pretty-printed for readers outside this code base.

### Notes
- Written 2026-09-28. The docs are read in parallel: on this workspace's mount a serial read of 562 docs takes about 1.5 s and a parallel one about 0.3 s, while parsing them all takes about 15 ms, which is why no consumer caches the index and every one derives it afresh.
- A doc the grammar refuses stops the read with its path and line; a doc nobody may hand-edit can only be malformed by a generator bug or a preserved orphan.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readLiveDocGraph` {#symbol-readlivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/graphFiles.ts#L20)

##### `readLiveDocGraph` — Summary
Reads every Live Doc under the configured root and derives the graph.

A doc the grammar refuses stops the read with its path and line, since a doc
nobody may hand-edit can only be malformed by a generator bug.

#### `writeLiveDocGraph` {#symbol-writelivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/graphFiles.ts#L43)
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
- [`document.LiveDocSyntaxError`](./document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`graph.DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)
- [`graph.GRAPH_INDEX_FILE`](./graph.ts.mdmd.md#symbol-graph_index_file)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.deriveLiveDocGraph`](./graph.ts.mdmd.md#symbol-derivelivedocgraph)
<!-- LIVE-DOC:END Dependencies -->

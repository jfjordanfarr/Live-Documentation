# `packages/engine/src/live-docs/graphFilesCore.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/graphFilesCore.ts`
- Generated At: 2026-11-24T10:31:38.591Z

## Authored
### Purpose
Pure host-driven Live Doc graph reading (`readLiveDocGraphWithHost`) and index writing (`writeLiveDocGraphWithHost`) over an `OutputSink`, with zero `node:fs` imports so both Node and browser hosts derive and persist `<root>/index.json` through one engine module.

### Notes
- Added on 2026-11-24 as Step 6 (Part 1) of [One Engine, Two Hosts](../../../../../layer-3/engine-and-hosts.mdmd.md), pairing with [`nodeOutputSink.ts`](../tooling/nodeOutputSink.ts.mdmd.md) and the Node facade in [`graphFiles.ts`](./graphFiles.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readLiveDocGraphWithHost` {#symbol-readlivedocgraphwithhost}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graphFilesCore.ts#L22)

##### `readLiveDocGraphWithHost` — Summary
Reads every Live Doc under the configured root through `output` and derives the graph.

A doc the grammar refuses stops the read with its path and line, since a doc
nobody may hand-edit can only be malformed by a generator bug.

#### `writeLiveDocGraphWithHost` {#symbol-writelivedocgraphwithhost}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graphFilesCore.ts#L55)
- Parameters: `graph`: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph); `output`: [`OutputSink`](../tooling/workspaceFiles.ts.mdmd.md#symbol-outputsink)

##### `writeLiveDocGraphWithHost` — Summary
Writes the graph to `<root>/index.json` through `output`, pretty-printed for readers outside this code base.

##### `writeLiveDocGraphWithHost` — Returns
The workspace-relative path written.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.LiveDocSyntaxError`](./document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`graph.DocLocation`](./graph.ts.mdmd.md#symbol-doclocation) (type-only)
- [`graph.GRAPH_INDEX_FILE`](./graph.ts.mdmd.md#symbol-graph_index_file)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`graph.deriveLiveDocGraph`](./graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`enginePath.path`](../tooling/enginePath.ts.mdmd.md)
- [`workspaceFiles.OutputSink`](../tooling/workspaceFiles.ts.mdmd.md#symbol-outputsink) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

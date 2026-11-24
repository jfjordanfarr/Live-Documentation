# `packages/engine/src/tooling/nodeOutputSink.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/nodeOutputSink.ts`
- Generated At: 2026-11-24T10:03:06.684Z

## Authored
### Purpose
Node disk implementation of `OutputSink` (`createNodeOutputSink`, `NODE_OUTPUT_SINK`) for reading, listing, writing, and pruning generated Live Docs and `<root>/index.json` on disk, including best-effort empty parent cleanup.

### Notes
- Added on 2026-11-24 as Step 6 (Part 1) of [One Engine, Two Hosts](../../../../../layer-3/engine-and-hosts.mdmd.md). Kept strictly outside the browser scan import graph so `generatorCore.ts`, `graphFilesCore.ts`, and `page-entry.mjs` depend only on the pure `OutputSink` interface in [`workspaceFiles.ts`](./workspaceFiles.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createNodeOutputSink` {#symbol-createnodeoutputsink}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeOutputSink.ts#L50)
- Returns: [`OutputSink`](./workspaceFiles.ts.mdmd.md#symbol-outputsink)
- Parameters: `host`: [`FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost)

##### `createNodeOutputSink` — Summary
Builds a disk-backed {@link OutputSink}. Folder listing walks through `host` (defaulting to {@link NODE_FILE_HOST})
so callers supplying a custom listing host retain full observability of directory walks.

#### `NODE_OUTPUT_SINK` {#symbol-node_output_sink}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/nodeOutputSink.ts#L99)
- Returns: [`OutputSink`](./workspaceFiles.ts.mdmd.md#symbol-outputsink)

##### `NODE_OUTPUT_SINK` — Summary
Default Node disk output sink backed by {@link NODE_FILE_HOST}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path` - `path`
- [`nodeHost.NODE_FILE_HOST`](./nodeHost.ts.mdmd.md#symbol-node_file_host)
- [`sourceText.throwIfMachineFailure`](./sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`workspaceFiles.FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.OutputSink`](./workspaceFiles.ts.mdmd.md#symbol-outputsink) (type-only)
- [`workspaceWalk.walkWorkspace`](./workspaceWalk.ts.mdmd.md#symbol-walkworkspace)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

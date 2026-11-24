# `packages/engine/src/tooling/nodeOutputSink.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/nodeOutputSink.test.ts`
- Generated At: 2026-11-24T10:03:06.680Z

## Authored
### Purpose
Unit tests for `NODE_OUTPUT_SINK` and `createNodeOutputSink`: UTF-8/BOM round-trip, `ENOENT` vs `ENAMETOOLONG`, directory checks, sorted listing with unreadable-folder propagation, and file removal with empty parent tidying strictly beneath `stopDir`.

### Notes
- Added on 2026-11-24 alongside [`nodeOutputSink.ts`](./nodeOutputSink.ts.mdmd.md) for Step 6 (Part 1) of [One Engine, Two Hosts](../../../../../layer-3/engine-and-hosts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path` - `path`
- [`nodeHost.NODE_FILE_HOST`](./nodeHost.ts.mdmd.md#symbol-node_file_host)
- [`nodeOutputSink.NODE_OUTPUT_SINK`](./nodeOutputSink.ts.mdmd.md#symbol-node_output_sink)
- [`nodeOutputSink.createNodeOutputSink`](./nodeOutputSink.ts.mdmd.md#symbol-createnodeoutputsink)
- [`workspaceFiles.FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

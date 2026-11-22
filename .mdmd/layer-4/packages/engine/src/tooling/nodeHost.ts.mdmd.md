# `packages/engine/src/tooling/nodeHost.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/nodeHost.ts`
- Generated At: 2026-11-22T01:51:58.113Z

## Authored
### Purpose
Where the command line reads a source file from the disk: a file's bytes, and its first bytes for the test of whether it is binary. The engine asks whoever runs it for a file's bytes (`FileHost`, `workspaceFiles.ts`); under Node this answers, and in a page the page answers from the folder a person picked. It is the one module of a scan that reads a source file from a disk.

### Notes
- Written on 2026-11-22, the third step of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), at the owner's ask on 2026-11-21 that a page and a command line come from one engine ([the record, Turn 2](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)). Before, every reader and the generator read the disk for themselves (`sourceText.ts`'s `readSourceText`, the generator's test of a file's first bytes, the JSON reader's `readFileSync` of a `tsconfig.json`).
- A reader called with no run's reads, as its own tests call it, reads through `readFileBytes` here directly (`readSourceReading` in `sourceText.ts`). That keeps this module in the page's bundle, so the check that the engine runs in a page still lists `promises.readFile` and `promises.open` for it, though the page's own scan asks neither: it hands the generator its own host.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readFileBytes` {#symbol-readfilebytes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L19)

##### `readFileBytes` — Summary
A file's bytes, from the disk.

#### `readFileHead` {#symbol-readfilehead}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L24)

##### `readFileHead` — Summary
The first `bytes` of a file, for the content's say on what the file is; fewer when the file is shorter.

#### `NODE_FILE_HOST` {#symbol-node_file_host}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L36)
- Returns: [`FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost)

##### `NODE_FILE_HOST` — Summary
The disk, as Node reads it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- [`workspaceFiles.FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

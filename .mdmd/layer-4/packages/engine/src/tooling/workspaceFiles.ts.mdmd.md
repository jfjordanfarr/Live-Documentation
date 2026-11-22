# `packages/engine/src/tooling/workspaceFiles.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/workspaceFiles.ts`
- Generated At: 2026-11-22T01:51:58.146Z

## Authored
### Purpose
Makes a scan read each file once. The generator builds the run's reads over the host that runs the engine (the disk under Node, a picked folder in a page) and hands them to every reader on the file index it already hands them; a reader asks `readSourceText(path, fileIndex)`, and every later ask for the same file (another reader's table, the test of whether it is binary, the count of how its text was decoded) is answered from that one read, decoded once. For example, a C# file in DNN's Library was read five times in one scan before, and is read once now.

### Notes
- Written on 2026-11-22, the third step of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), where the measures before and after are. The owner's reason, 2026-11-21: a weak machine at work, so that reading each file once matters ([the record, Turn 2](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)).
- The reads ride on the file index rather than on an object of their own, because the index already is the run's one object: every reader already receives it, and every table a reader builds from many files is already kept by it (`WeakMap`s keyed by it), so what is kept of a run dies with the run.
- A failed read is not kept: the reader that asked meets the failure and reads it as the machine's or the file's (`throwIfMachineFailure`, `sourceText.ts`), and the next to ask reads again, as every reader did before. So a failure of the machine's that passes costs the reader that met it alone, and nothing about failures changed with this module (the generator's test of a file whose reading throws in the index pass alone holds it).
- What a run keeps of each file read whole: its reading (its text, or why it is not text) and its first bytes, up to the binary test's measure. A file never read whole (a picture, a font) is asked of the host for its first bytes alone.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FileHost` {#symbol-filehost}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L28)

##### `FileHost` — Summary
What runs the engine gives it of a file: its bytes, and its first bytes. Paths are absolute, as the readers hold them.

#### `WorkspaceReads (interface)` {#symbol-workspacereads-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L36)

##### `WorkspaceReads (interface)` — Summary
A run's reads: each file read once through the host, decoded once, and kept for the run.

#### `workspaceReads (function)` {#symbol-workspacereads-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L54)
- Returns: [`WorkspaceReads`](#symbol-workspacereads-interface)
- Parameters: `host`: [`FileHost`](#symbol-filehost)

##### `workspaceReads (function)` — Summary
The reads of one run over a host. Of each whole read the first `keptHead` bytes are kept with its reading, so that a
head no longer than that is answered without asking the host again; a head asked of a file not read whole is asked
of the host, once.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sourceText.SourceTextReading`](./sourceText.ts.mdmd.md#symbol-sourcetextreading)
- [`sourceText.decodeSourceText`](./sourceText.ts.mdmd.md#symbol-decodesourcetext)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

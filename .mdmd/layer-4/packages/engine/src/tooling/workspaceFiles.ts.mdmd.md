# `packages/engine/src/tooling/workspaceFiles.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/workspaceFiles.ts`
- Generated At: 2026-11-24T07:54:04.590Z

## Authored
### Purpose
Makes a scan read each file once. The generator builds the run's reads over the host that runs the engine (the disk under Node, a picked folder in a page) and hands them to every reader on the file index it already hands them; a reader asks `readSourceText(path, fileIndex)`, and every later ask for the same file (another reader's table, the test of whether it is binary, the count of how its text was decoded) is answered from that one read, decoded once. For example, a C# file in DNN's Library was read five times in one scan before, and is read once now.

### Notes
- Written on 2026-11-22, the third step of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), where the measures before and after are. The owner's reason, 2026-11-21: a weak machine at work, so that reading each file once matters ([the record, Turn 2](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)).
- The reads ride on the file index rather than on an object of their own, because the index already is the run's one object: every reader already receives it, and every table a reader builds from many files is already kept by it (`WeakMap`s keyed by it), so what is kept of a run dies with the run.
- A failed read is not kept: the reader that asked meets the failure and reads it as the machine's or the file's (`throwIfMachineFailure`, `sourceText.ts`), and the next to ask reads again, as every reader did before. So a failure of the machine's that passes costs the reader that met it alone, and nothing about failures changed with this module (the generator's test of a file whose reading throws in the index pass alone holds it).
- What a run keeps of each file read whole: its reading (its text, or why it is not text) and its first bytes, up to the binary test's measure. A file never read whole (a picture, a font) is asked of the host for its first bytes alone.
- The first bytes are copied, never cut with `slice`: on Node's `Buffer` that is a view of the same memory, and until it was found later on 2026-11-22 every kept head held its whole file, about 250 MB at the peak of a scan of the whole of DNN. A unit case fails on the view.
- On 2026-11-22 a budget on what a run keeps was built at root's ruling, and deleted the same day. Past the budget, a file was held only until the next was read. Measured under Node on the whole of DNN and in a page slowed four times on its Library, no budget moved the time beyond the machine's noise or the peak beyond its spread ([the measurements](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-hosts/README.md#2026-11-22-last-the-budget-measured-in-a-slowed-page-and-deleted)). Every file read whole is kept for the run.
- Extended on 2026-11-24 for Step 5 of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road): `FileHost` now also supplies `entries(folder)` returning sorted `FolderEntries` (`files`, `folders`, and optional `linkedFolders`) so the pure walker (`workspaceWalk.ts`) lists workspaces through the host without `glob`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FolderEntries` {#symbol-folderentries}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L28)

##### `FolderEntries` — Summary
A folder's immediate entries, by name, sorted: its files (links to files included), its real subfolders, and any links to folders.

#### `GrammarHost` {#symbol-grammarhost}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L36)

##### `GrammarHost` — Summary
Provides the tree-sitter WebAssembly runtime and compiled language grammars as raw bytes.

#### `GitIgnoreAnswer` {#symbol-gitignoreanswer}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L44)

##### `GitIgnoreAnswer` — Summary
What git says of a list of paths: which it ignores, which it cannot judge, and which lie in no repository.

#### `GitIgnores` {#symbol-gitignores}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L62)

##### `GitIgnores` — Summary
Git's word on what it ignores in a workspace, from one listing.

#### `GitUnanswered` {#symbol-gitunanswered}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L70)

##### `GitUnanswered` — Summary
Why git gave no listing of what it ignores in a folder that lies in a repository.

#### `GitHost` {#symbol-githost}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L76)

##### `GitHost` — Summary
Optional version-control port supplied by hosts that can run git (such as Node); omitted in browser pages.

#### `ScansAboveFn` {#symbol-scansabovefn}
- Type: type
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L88)

##### `ScansAboveFn` — Summary
Checks ancestor folders above `workspaceRoot` for outer scans. Returns the outer scan folders when the host can
inspect ancestors (Node), or `undefined` when the host cannot see above the workspace (a browser page).

#### `FileHost` {#symbol-filehost}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L97)

##### `FileHost` — Summary
What runs the engine gives it of a workspace: a file's bytes, its first bytes, a folder's entries, and optional
ports for grammars, git, and ancestor scans. Paths are absolute, as the readers hold them.

#### `WorkspaceReads (interface)` {#symbol-workspacereads-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L113)

##### `WorkspaceReads (interface)` — Summary
A run's reads: each file read once through the host, decoded once, and kept for the run.

#### `workspaceReads (function)` {#symbol-workspacereads-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceFiles.ts#L133)
- Returns: [`WorkspaceReads`](#symbol-workspacereads-interface)

##### `workspaceReads (function)` — Summary
The reads of one run over a host. Of each whole read the first `keptHead` bytes are kept with its reading, so that a
head no longer than that is answered without asking the host again; a head asked of a file not read whole is asked
of the host, once. Every file read whole is kept for the run. A budget on what is kept was built and measured on
2026-11-22, under Node on the whole of DNN and in a slowed page on its Library, and deleted the same day: no budget
moved the time beyond the machine's noise or the peak beyond its spread.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sourceText.SourceTextReading`](./sourceText.ts.mdmd.md#symbol-sourcetextreading) (type-only)
- [`sourceText.decodeSourceText`](./sourceText.ts.mdmd.md#symbol-decodesourcetext)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

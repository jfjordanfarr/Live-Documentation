# `packages/engine/src/tooling/nodeHost.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/nodeHost.ts`
- Generated At: 2026-11-24T07:15:06.297Z

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
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L24)

##### `readFileBytes` — Summary
A file's bytes, from the disk.

#### `readFileHead` {#symbol-readfilehead}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L29)

##### `readFileHead` — Summary
The first `bytes` of a file, for the content's say on what the file is; fewer when the file is shorter.

#### `listFolderEntries` {#symbol-listfolderentries}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L45)

##### `listFolderEntries` — Summary
A folder's immediate files and subfolders on the disk, sorted by name. Symbolic links are inspected with `stat`: a
link to a file joins `files`, a link to a folder joins `linkedFolders`, a link whose target is absent, loops or
passes through a file is skipped, and a failure of the machine's (permission denied, too many open files) is thrown.

#### `listFilesOnDisk` {#symbol-listfilesondisk}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L76)
- Parameters: `ignoredFolders`: `ReadonlySet`

##### `listFilesOnDisk` — Summary
Workspace-relative paths of files matching `extension` on the disk, skipping `.git` and `ignoredFolders` by folder
name, sorted. Used only when a language reader is called standalone without a run's `WorkspaceFileIndex`.

#### `kindOnDisk` {#symbol-kindondisk}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L111)
- Returns: [`PathKind`](./workspaceListing.ts.mdmd.md#symbol-pathkind)

##### `kindOnDisk` — Summary
What lies at a path on the disk, links followed: a file, a folder, or nothing. A failure of the machine's is thrown;
any other (no such file, a name the disk cannot hold) is nothing there. For a reader called with no run's listing,
as a reader's own tests call it (`pathKind` in `workspaceProbes.ts`).

#### `childrenOnDisk` {#symbol-childrenondisk}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L122)
- Returns: [`FolderChildren`](./workspaceListing.ts.mdmd.md#symbol-folderchildren)

##### `childrenOnDisk` — Summary
A folder's files and folders on the disk, by name, links followed; nothing when it is no folder (`folderChildren`).

#### `NODE_FILE_HOST` {#symbol-node_file_host}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/nodeHost.ts#L135)
- Returns: [`FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost)

##### `NODE_FILE_HOST` — Summary
The disk, as Node reads it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `readdirSync`, `statSync`
- `node:path` - `path`
- [`sourceText.throwIfMachineFailure`](./sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`workspaceFiles.FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.FolderEntries`](./workspaceFiles.ts.mdmd.md#symbol-folderentries) (type-only)
- [`workspaceListing.FolderChildren`](./workspaceListing.ts.mdmd.md#symbol-folderchildren) (type-only)
- [`workspaceListing.PathKind`](./workspaceListing.ts.mdmd.md#symbol-pathkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

# `packages/engine/src/tooling/workspaceProbes.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/workspaceProbes.ts`
- Generated At: 2026-11-24T07:15:06.324Z

## Authored
### Purpose
The one way a reader asks what lies at a path (`pathKind`) or what a folder holds (`folderChildren`). It answers from the run's listing when the reader hands the file index it was handed, and otherwise from the disk through the Node host, as for a reader called with no run (its own tests). It is the counterpart of `readSourceText` for a file's bytes.

### Notes
- Written on 2026-11-22, the fourth step of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road). The readers' probes moved onto it that day: Rust, Python, C, CSS, HTML, Ruby, the DOM heuristics and the JSON reader's check in TypeScript's host. The TypeScript resolution of `dependencies.ts` was moved and undone. It resolves an import of excluded code against the disk by a decision of this repository's own, which the listing cannot keep, so it waits on the owner's choice between that decision and the rule that no reader sees what a scan leaves out.
- The fallback to the disk goes at step 9, with the one for reads, when no reader may be called without a run.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ListedFiles` {#symbol-listedfiles}
- Type: type
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceProbes.ts#L17)

##### `ListedFiles` — Summary
A run's listing, where a run hands one: the file index a reader is handed carries it.

#### `pathKind` {#symbol-pathkind}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceProbes.ts#L23)
- Returns: [`PathKind`](./workspaceListing.ts.mdmd.md#symbol-pathkind)
- Parameters: `files`: [`ListedFiles`](#symbol-listedfiles)

##### `pathKind` — Summary
What lies at a path: a kept file or a folder holding kept files, from the run's listing; else on the disk.

#### `folderChildren` {#symbol-folderchildren}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceProbes.ts#L28)
- Returns: [`FolderChildren`](./workspaceListing.ts.mdmd.md#symbol-folderchildren)
- Parameters: `files`: [`ListedFiles`](#symbol-listedfiles)

##### `folderChildren` — Summary
A folder's files and folders by name, from the run's listing; else on the disk. Nothing when there is no such folder.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`nodeHost.childrenOnDisk`](./nodeHost.ts.mdmd.md#symbol-childrenondisk)
- [`nodeHost.kindOnDisk`](./nodeHost.ts.mdmd.md#symbol-kindondisk)
- [`workspaceListing.FolderChildren`](./workspaceListing.ts.mdmd.md#symbol-folderchildren) (type-only)
- [`workspaceListing.PathKind`](./workspaceListing.ts.mdmd.md#symbol-pathkind) (type-only)
- [`WorkspaceListing`](./workspaceListing.ts.mdmd.md#symbol-workspacelisting-interface) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

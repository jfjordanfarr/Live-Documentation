# `packages/engine/src/tooling/workspaceListing.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/workspaceListing.ts`
- Generated At: 2026-11-24T10:31:38.969Z

## Authored
### Purpose
Answers a reader's two questions about other files, at once and without reading any: what lies at a path (a kept file, a folder that holds kept files, or nothing), and what a folder holds. The answers come from the run's listing, the files the scan keeps. For example, the Python reader asks whether `pkg/__init__.py` exists, and C asks what the folder of an `#include` holds; both are answered here, in a page as fast as on a disk. No reader can see a file the scan leaves out.

### Notes
- Written on 2026-11-22, the fourth step of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), at root's ruling that what a scan leaves out, no reader sees. Before it, each reader asked Node's disk for itself, with `statSync`, `fs.promises.stat`, `fs.promises.access` and `readdirSync`.
- Measured before any probe moved, on DNN's Library, this repository's 31 sample programs and its fixtures, and this repository itself with its `node_modules`: no reader's probe reached a file on the disk that the listing does not hold ([the count](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-hosts/README.md#probes-answered-from-the-listing-step-4s-evidence)). With the probes moved, this repository's whole docs and index came out the same bytes. One move was undone all the same, the TypeScript resolution's: a case of the integration suite holds that excluded code an included file imports is resolved against the disk, which the listing cannot do.
- Names match as written on every machine, the engine's own rule of case. A path outside the workspace is nothing: the listing holds only the workspace.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FolderChildren` {#symbol-folderchildren}
- Type: type (type-only)
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceListing.ts#L25)

#### `PathKind` {#symbol-pathkind}
- Type: type (type-only)
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceListing.ts#L25)

#### `WorkspaceListing (interface)` {#symbol-workspacelisting-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceListing.ts#L28)

##### `WorkspaceListing (interface)` — Summary
A run's listing: what lies at a path, and what a folder holds, among the files the scan keeps.

#### `workspaceListing (function)` {#symbol-workspacelisting-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceListing.ts#L36)
- Returns: [`WorkspaceListing`](#symbol-workspacelisting-interface)
- Parameters: `relativePaths`: `Iterable`

##### `workspaceListing (function)` — Summary
The listing of the files a scan keeps, given as paths relative to the workspace with forward slashes.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`enginePath.path`](./enginePath.ts.mdmd.md)
- [`workspaceFiles.FolderChildren`](./workspaceFiles.ts.mdmd.md#symbol-folderchildren) (type-only)
- [`workspaceFiles.PathKind`](./workspaceFiles.ts.mdmd.md#symbol-pathkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

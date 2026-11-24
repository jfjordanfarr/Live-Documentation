# `packages/engine/src/tooling/workspaceWalk.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/workspaceWalk.ts`
- Generated At: 2026-11-24T07:15:06.335Z

## Authored
### Purpose
Walks a workspace top-down over `FileHost.entries()` and matches glob patterns in memory, replacing `glob` across discovery, the generator and `graphFiles.ts` so both the Node disk host and the browser page host share one walker that touches no disk itself.

### Notes
- Written on 2026-11-24 for Step 5 of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), deleting the `glob` package from the scan path and deleting `tests/page-scan/stand-ins/glob.mjs`.
- Calls `shouldEnter(relativeFolder)` before asking `host.entries()` and prunes subtrees whose prefix cannot match any compiled glob pattern, so ignored, excluded and left-out folders (such as a committed NuGet `packages/` directory) are never listed.
- Keeps `linkedFolders` distinct from real folders so bare leading-`**` patterns never follow directory symlinks while explicit non-leading patterns (`*/**/*.ts`) follow one level without recursing into nested links, preserving `glob` v14's contract on existing tests.
- Records folder `scandir` machine failures (`EACCES`, `EMFILE`) in `unreadable` for discovery's leave-out judgment while immediately rethrowing symlink target `stat` machine failures and reading `ENOENT` as empty.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WalkedFile` {#symbol-walkedfile}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L21)

##### `WalkedFile` — Summary
A file found by a walk: its absolute path and its workspace-relative path with forward slashes.

#### `UnreadableFolder` {#symbol-unreadablefolder}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L27)
- Extends: [`WalkedFile`](#symbol-walkedfile)

##### `UnreadableFolder` — Summary
A folder the walk could not read for a cause of the machine's: its paths and the error.

#### `WalkWorkspaceOptions` {#symbol-walkworkspaceoptions}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L32)

##### `WalkWorkspaceOptions` — Summary
Options for {@link walkWorkspace}.

#### `WalkWorkspaceResult` {#symbol-walkworkspaceresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L45)

##### `WalkWorkspaceResult` — Summary
Result of {@link walkWorkspace}: matched files in workspace order, unreadable folders, and the root's file names.

#### `CompiledGlob` {#symbol-compiledglob}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L60)

##### `CompiledGlob` — Summary
One brace-expanded glob pattern split into compiled segments.

#### `expandGlobBraces` {#symbol-expandglobbraces}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L72)

##### `expandGlobBraces` — Summary
Expands top-level and nested `{a,b}` brace groups in a glob pattern into alternative patterns.
An unclosed `{` or a `{...}` containing no comma is kept literally.

#### `compileGlobPatterns` {#symbol-compileglobpatterns}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L152)
- Returns: [`CompiledGlob`](#symbol-compiledglob)[]

##### `compileGlobPatterns` — Summary
Normalizes and compiles a list of glob patterns (stripping leading `./`, expanding `{a,b}` braces).

#### `matchGlobPattern` {#symbol-matchglobpattern}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L219)

##### `matchGlobPattern` — Summary
True when `relativePath` (forward slashes) matches a single glob pattern.

#### `matchesAnyGlob` {#symbol-matchesanyglob}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L224)

##### `matchesAnyGlob` — Summary
True when `relativePath` (forward slashes) matches at least one compiled file glob pattern.

#### `walkWorkspace` {#symbol-walkworkspace}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/workspaceWalk.ts#L257)
- Parameters: `options`: [`WalkWorkspaceOptions`](#symbol-walkworkspaceoptions)

##### `walkWorkspace` — Summary
Walks a workspace top-down through `host.entries()`, pruning before reading each folder via `shouldEnter` and
matching files against `patterns` in memory.

A folder whose read fails for a cause of the machine's (`scandir` error other than `ENOENT`) is recorded in
`unreadable` so the caller can judge whether everything in it would have been left out; a `stat` machine failure
on a symlink target is rethrown immediately. Missing folders (`ENOENT`) and non-machine errors read as empty.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`processMark.machineFailure`](../live-docs/processMark.ts.mdmd.md#symbol-machinefailure)
- [`workspaceFiles.FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.FolderEntries`](./workspaceFiles.ts.mdmd.md#symbol-folderentries) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

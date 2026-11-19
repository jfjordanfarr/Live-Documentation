# packages/engine/src/live-docs/adapters/dotnetPaths.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/dotnetPaths.ts
- Generated At: 2026-11-19T20:42:50.033Z

## Authored
### Purpose
Resolves a path written in a .NET Framework file (a directive, a project reference, a solution's project, a configuration file's name) against the list of the workspace's files, the way Windows reads it: the exact spelling, else the one file that matches without regard to case, else nothing, and nothing where two files differ by case alone. The link is written in the file's true spelling. Also finds the nearest project folder above a file, which is what `~/` in a directive starts from.

### Notes
- Written on November 19, 2026 for the owner's December showing on .NET Framework code. A cold run found three readers asking the disk for a spelling, which loses `web.config` named as `Web.config` on Linux and keeps the asked-for spelling on Windows ([the cold run](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md), [the .NET gaps probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)).
- The file index is what discovery found, so a file that git ignores or the configuration excludes is never linked; before, a disk probe could link to it, and the link led to no doc.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WorkspacePathLookup` {#symbol-workspacepathlookup}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L22)

##### `WorkspacePathLookup` — Summary
A written path looked up in the workspace's files.

#### `lookUpWorkspaceFile` {#symbol-lookupworkspacefile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L43)
- Returns: [`WorkspacePathLookup`](#symbol-workspacepathlookup)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `lookUpWorkspaceFile` — Summary
The workspace file a workspace-relative path names: its exact spelling, else the one file that matches it without regard to case.

#### `workspaceFile` {#symbol-workspacefile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L52)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `workspaceFile` — Summary
The workspace file a workspace-relative path names, or undefined when none does or several do.

#### `joinWorkspacePath` {#symbol-joinworkspacepath}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L62)

##### `joinWorkspacePath` — Summary
A path written relative to a workspace folder, as a workspace-relative path
with forward slashes: backslashes read as separators, `.` and `..` applied.
Undefined when it climbs out of the workspace or is absolute.

#### `folderOf` {#symbol-folderof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L71)

##### `folderOf` — Summary
The folder of a workspace-relative path, `""` for the workspace root.

#### `PROJECT_FILE_EXTENSIONS` {#symbol-project_file_extensions}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L77)

##### `PROJECT_FILE_EXTENSIONS` — Summary
The project file extensions of .NET.

#### `isProjectFile` {#symbol-isprojectfile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L80)

##### `isProjectFile` — Summary
True when the path names a .NET project file.

#### `projectFolders` {#symbol-projectfolders}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L88)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `projectFolders` — Summary
The folders of the workspace that hold a .NET project file.

#### `nearestProjectFolder` {#symbol-nearestprojectfolder}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetPaths.ts#L98)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `nearestProjectFolder` — Summary
The nearest folder at or above a file's own that holds a .NET project file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
<!-- LIVE-DOC:END Dependencies -->

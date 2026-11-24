# `packages/engine/src/live-docs/adapters/dotnetProjects.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/dotnetProjects.ts`
- Generated At: 2026-11-24T10:31:38.111Z

## Authored
### Purpose
Says which projects a C# file's names can bind to, the way the compiler sees them: the file's own project (the nearest folder above it with a project file), then the projects it references with `ProjectReference`, then, for an SDK-style project only, what those reference in turn. The C# reader uses these tiers to link a name to the namesake the compiler would bind, and to none it cannot see.

### Notes
- Written on November 19, 2026, after a comparison with Roslyn over mojoPortal found about one in six C# dependency lines linked to a same-named type in a project the file's project does not reference ([the .NET gaps probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)).
- Classic and SDK-style projects differ as MSBuild has them: a classic project passes only its direct references to the compiler; an SDK-style one passes its references' references too, unless `DisableTransitiveProjectReferences` is set. A reference with `ReferenceOutputAssembly="false"` gives the compiler nothing.
- Since the joining of 2026-11-21 ([the work item](../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)) each project file is read through the engine's one reading step, and a failure of the machine's in reading one is thrown on to the generator, which names it; until then any failure read the project as referencing nothing, which narrows what every file of the projects above it can see.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ProjectReach (interface)` {#symbol-projectreach-interface}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetProjects.ts#L43)

##### `ProjectReach (interface)` — Summary
The projects of a workspace, and what a file's project lets it see.

#### `projectReach (function)` {#symbol-projectreach-function}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetProjects.ts#L53)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `projectReach (function)` — Summary
The workspace's project graph, read once per file index.

#### `readProjectReferences` {#symbol-readprojectreferences}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetProjects.ts#L64)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `readProjectReferences` — Summary
The project folders a project file references for its compiler, and whether it passes on its references' references.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dotnetPaths.folderOf`](./dotnetPaths.ts.mdmd.md#symbol-folderof)
- [`dotnetPaths.isProjectFile`](./dotnetPaths.ts.mdmd.md#symbol-isprojectfile)
- [`dotnetPaths.joinWorkspacePath`](./dotnetPaths.ts.mdmd.md#symbol-joinworkspacepath)
- [`dotnetPaths.nearestProjectFolder`](./dotnetPaths.ts.mdmd.md#symbol-nearestprojectfolder)
- [`dotnetPaths.workspaceFile`](./dotnetPaths.ts.mdmd.md#symbol-workspacefile)
- [`dotnetXml.withoutXmlComments`](./dotnetXml.ts.mdmd.md#symbol-withoutxmlcomments)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`enginePath.path`](../../tooling/enginePath.ts.mdmd.md)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
<!-- LIVE-DOC:END Dependencies -->

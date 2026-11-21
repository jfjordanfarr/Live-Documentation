# `packages/engine/src/live-docs/adapters/solution.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/solution.ts`
- Generated At: 2026-11-21T02:51:59.217Z

## Authored
### Purpose
Reads a Visual Studio solution (`.sln`, and the XML `.slnx`) and links it to the project files it names, so that a solution reaches its projects on the map. A project the solution names that is not in the workspace is kept by its name, as a project reference is; solution folders name no file and are skipped.

### Notes
- Written on November 19, 2026, when a cold run found every `.sln` doc empty ([the .NET gaps probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)). Its project lists agree with `dotnet sln list`, the SDK's own parser, on DNN Platform, mojoPortal and the estate.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `solutionProjects` {#symbol-solutionprojects}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/solution.ts#L30)

##### `solutionProjects` — Summary
The paths of the projects a solution names, as written, solution folders left out.

#### `solutionAdapter` {#symbol-solutionadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/solution.ts#L38)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `solutionAdapter` — Summary
Language adapter for Visual Studio solutions: the projects a solution names, as dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`dotnetPaths.folderOf`](./dotnetPaths.ts.mdmd.md#symbol-folderof)
- [`dotnetPaths.joinWorkspacePath`](./dotnetPaths.ts.mdmd.md#symbol-joinworkspacepath)
- [`dotnetPaths.workspaceFile`](./dotnetPaths.ts.mdmd.md#symbol-workspacefile)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`project.projectStem`](./project.ts.mdmd.md#symbol-projectstem)
- [`project.referencedProjectName`](./project.ts.mdmd.md#symbol-referencedprojectname)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
<!-- LIVE-DOC:END Dependencies -->

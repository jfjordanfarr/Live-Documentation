# packages/engine/src/live-docs/adapters/project.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/project.ts
- Generated At: 2026-10-09T20:42:15.670Z

## Authored
### Purpose
The adapter for .NET project files: what a project stands on. The project is the file's one public symbol, named by its assembly name or the file's stem, and its kind says what it builds, `library`, `program` or `web`, read from the SDK, the output type or the classic web-application project type GUID. Its dependencies are its project references, linked to the project files they name and to the names those publish; its package references, external as `name@version`; and its assembly references, external by name. Compiled files are not listed: a system is a folder, and the folder already says which files belong to it.

### Notes
- Written on 2026-09-28 for the openings ([Turn 34](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)), as the fourth fact the World Map needs; the oracle comparison gained a bucket for project references that day, 3 of 3 on the estate. The kinds it publishes are `PROJECT_KINDS` in `openings.ts`, shared with the board's join, which reads what a thing stands on from the docs whose symbols carry them.
- Regular expressions over the XML, enough for SDK-style and classic project files. A `packages.config` beside a classic project is read by `dotnetConfig.ts` and lists its packages as externals of its own doc, which the join does not read as standing-on, since that doc publishes no manifest symbol; the project file's assembly references are read. A `.vbproj` or `.fsproj` is read the same way; none is in a sample yet.
- Measured by `project.test.ts`.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)) a project reference whose file lies outside the scan or does not exist is kept as the referenced project's name, the file's stem, so that the estate graph can match it to the project another scan publishes by its symbol or its stem; before, it was dropped, which [the probe](../../../../../../../AI-Agent-Workspace/Probes/2026-10-09/two-scans.md) found when the estate's projects were scanned apart.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `projectKind` {#symbol-projectkind}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/project.ts#L38)

##### `projectKind` — Summary
What the project builds.

#### `projectAdapter` {#symbol-projectadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/project.ts#L53)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `projectAdapter` — Summary
Language adapter for .NET project files: the project as a symbol, and what it references as dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.WorkspaceSymbolIndex`](../core.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`openings.PROJECT_KINDS`](../openings.ts.mdmd.md#symbol-project_kinds)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

# packages/engine/src/live-docs/adapters/project.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/project.ts
- Generated At: 2026-09-28T16:48:38.499Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PROJECT_KINDS` {#symbol-project_kinds}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/project.ts#L30)
- Returns: `ReadonlySet`

##### `PROJECT_KINDS` — Summary
The kinds of the project symbol.

#### `projectKind` {#symbol-projectkind}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/project.ts#L37)

##### `projectKind` — Summary
What the project builds.

#### `projectName` {#symbol-projectname}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/project.ts#L47)

##### `projectName` — Summary
The name of the project a project file declares: its assembly name, or the file's stem.

#### `projectAdapter` {#symbol-projectadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/project.ts#L52)
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
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

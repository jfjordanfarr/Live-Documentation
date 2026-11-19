# packages/engine/src/live-docs/adapters/aspnet.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/aspnet.ts
- Generated At: 2026-11-19T20:42:49.607Z

## Authored
### Purpose
Surfaces script and code-behind dependencies for ASP.NET markup assets so the LD-402 pathfinder can follow telemetry chains that hop between `.js`, `.cshtml`/`.razor`, and generated C# partials.

### Notes
- Covers legacy WebForms `<%@ Page %>` directives alongside Razor/Blazor partial class detection, keeping the same adapter usable across all fixtures exercised in `tests/integration/live-docs/inspect-cli.test.ts`.
- Intentional filesystem probes ensure we only yield dependencies for files that actually exist, preventing noisy edges during Stage-0 regeneration.
- Registers `.ascx` since 2026-10-16: its own `MARKUP_EXTENSIONS` had named user controls while the registration had not, found when the shipped defaults were held to the registry.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `aspNetMarkupAdapter` {#symbol-aspnetmarkupadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L63)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `aspNetMarkupAdapter` — Summary
Language adapter for ASP.NET markup: Web Forms pages (`.aspx`), user controls
(`.ascx`), master pages (`.master`), handlers (`.ashx`), web services
(`.asmx`), the application file (`.asax`), WCF service files (`.svc`) and
Razor (`.cshtml`, `.razor`). Its dependencies are the files its directives
name (code-behind, master page, registered user controls, referenced pages),
a Razor file's code-behind, and its `<script src>` references; its public
symbols are element ids, server controls and plain HTML alike.

#### `Directive` {#symbol-directive}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L121)

##### `Directive` — Summary
One `<%@ … %>` directive: its name, lowercased, and its attributes by lowercased name.

#### `readDirectives` {#symbol-readdirectives}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L127)
- Returns: [`Directive`](#symbol-directive)[]

##### `readDirectives` — Summary
The directives of a markup file, by Microsoft's documented syntax; a directive with no name is the file type's own. Server-side comments are skipped.

#### `resolveDirectivePath` {#symbol-resolvedirectivepath}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L173)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `resolveDirectivePath` — Summary
The workspace file a directive's path names. A relative path is read from
the markup's own folder. `~/` is the root of the running web application,
which in a repository is a project's folder: the folder of the nearest
project file above the markup when the file is there, else the one web
project in the workspace that holds a file at that path, as when a module
or provider project is deployed into the web application that hosts it.
Where several web projects hold it, or none does, there is no link. A path
from the site's root (`/…`) names a deployed location no repository folder
stands for, and has no link either.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`dotnetPaths.folderOf`](./dotnetPaths.ts.mdmd.md#symbol-folderof)
- [`dotnetPaths.isProjectFile`](./dotnetPaths.ts.mdmd.md#symbol-isprojectfile)
- [`dotnetPaths.joinWorkspacePath`](./dotnetPaths.ts.mdmd.md#symbol-joinworkspacepath)
- [`dotnetPaths.lookUpWorkspaceFile`](./dotnetPaths.ts.mdmd.md#symbol-lookupworkspacefile)
- [`dotnetPaths.nearestProjectFolder`](./dotnetPaths.ts.mdmd.md#symbol-nearestprojectfolder)
- [`dotnetPaths.workspaceFile`](./dotnetPaths.ts.mdmd.md#symbol-workspacefile)
- [`html.extractElementIds`](./html.ts.mdmd.md#symbol-extractelementids)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`project.projectKind`](./project.ts.mdmd.md#symbol-projectkind)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

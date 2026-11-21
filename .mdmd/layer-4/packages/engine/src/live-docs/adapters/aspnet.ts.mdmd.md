# `packages/engine/src/live-docs/adapters/aspnet.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/aspnet.ts`
- Generated At: 2026-11-21T02:51:58.652Z

## Authored
### Purpose
Surfaces script and code-behind dependencies for ASP.NET markup assets so the LD-402 pathfinder can follow telemetry chains that hop between `.js`, `.cshtml`/`.razor`, and generated C# partials.

### Notes
- Covers legacy WebForms `<%@ Page %>` directives alongside Razor/Blazor partial class detection, keeping the same adapter usable across all fixtures exercised in `tests/integration/live-docs/inspect-cli.test.ts`.
- Intentional filesystem probes ensure we only yield dependencies for files that actually exist, preventing noisy edges during Stage-0 regeneration. _(Since 2026-11-19 a path is looked up in the generator's file index as Windows reads it (`dotnetPaths.ts`), never probed on the disk: the index is what discovery found, so a file git ignores is never linked ([the .NET probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md#second-leg-the-mends-and-the-puzzle)).)_
- Registers `.ascx` since 2026-10-16: its own `MARKUP_EXTENSIONS` had named user controls while the registration had not, found when the shipped defaults were held to the registry.
- Since 2026-11-19 ([the .NET probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)) the whole directive family is read by Microsoft's documented syntax, and master pages, handlers, web services, the application file and WCF service files with it: every attribute that names a file, a relative path from the markup's folder, and `~/` from the one of the markup's own project and the workspace's web projects that holds the path, else no link. Graded on DNN and mojoPortal against a parse of the documented syntax, every link the oracle finds is drawn.
- Since the joining of 2026-11-21 ([the work item](../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)): the markup and the project files read for which projects are web applications are read through the engine's one reading step, and a failure of the machine's in reading a project file is thrown on to the generator, never read as a project that builds nothing; and why a directive's path has no link is handed to the run as a notice ("paths several projects hold, left unlinked" and its kin), its subject the path as written, since the run names the file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `aspNetMarkupAdapter` {#symbol-aspnetmarkupadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L64)
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
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L126)

##### `Directive` — Summary
One `<%@ … %>` directive: its name, lowercased, and its attributes by lowercased name.

#### `readDirectives` {#symbol-readdirectives}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L132)
- Returns: [`Directive`](#symbol-directive)[]

##### `readDirectives` — Summary
The directives of a markup file, by Microsoft's documented syntax; a directive with no name is the file type's own. Server-side comments are skipped.

#### `DIRECTIVE_REASONS` {#symbol-directive_reasons}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L175)

##### `DIRECTIVE_REASONS` — Summary
Why a directive's path has no link.

#### `DirectivePath` {#symbol-directivepath}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L183)

##### `DirectivePath` — Summary
A directive's path, resolved to a workspace file or left unlinked for a reason.

#### `resolveDirectivePath` {#symbol-resolvedirectivepath}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L200)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `resolveDirectivePath` — Summary
The workspace file a directive's path names. A relative path is read from
the markup's own folder. `~/` is the root of the running web application,
which in a repository is a project's folder: the markup's own project (the
nearest folder above it with a project file), or a web project it is
deployed into, as a module or provider project is deployed into the web
application that hosts it. The path links to the one of these that holds a
file there. Where several hold it, the own project among them, there is no
link: a feature project may keep a copy of its host's master page only so
that it compiles, and which copy is served depends on how the build deploys
the project, which is not read here (mojoPortal's feature pages, measured on
November 19, 2026). Where none holds it there is no link either. A path from
the site's root (`/…`) names a deployed location no repository folder stands
for, and has no link.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
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
- [`coreTypes.SourceNotice`](../coreTypes.ts.mdmd.md#symbol-sourcenotice) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

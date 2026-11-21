# `packages/engine/src/live-docs/adapters/aspnet.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/aspnet.ts`
- Generated At: 2026-11-21T07:38:04.873Z

## Authored
### Purpose
Surfaces script and code-behind dependencies for ASP.NET markup assets so the LD-402 pathfinder can follow telemetry chains that hop between `.js`, `.cshtml`/`.razor`, and generated C# partials.

### Notes
- Covers legacy WebForms `<%@ Page %>` directives alongside Razor/Blazor partial class detection, keeping the same adapter usable across all fixtures exercised in `tests/integration/live-docs/inspect-cli.test.ts`.
- Intentional filesystem probes ensure we only yield dependencies for files that actually exist, preventing noisy edges during Stage-0 regeneration. _(Since 2026-11-19 a path is looked up in the generator's file index as Windows reads it (`dotnetPaths.ts`), never probed on the disk: the index is what discovery found, so a file git ignores is never linked ([the .NET probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md#second-leg-the-mends-and-the-puzzle)).)_
- Registers `.ascx` since 2026-10-16: its own `MARKUP_EXTENSIONS` had named user controls while the registration had not, found when the shipped defaults were held to the registry.
- Since 2026-11-19 ([the .NET probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)) the whole directive family is read by Microsoft's documented syntax, and master pages, handlers, web services, the application file and WCF service files with it: every attribute that names a file, a relative path from the markup's folder, and `~/` from the one of the markup's own project and the workspace's web projects that holds the path, else no link. Graded on DNN and mojoPortal against a parse of the documented syntax, every link the oracle finds is drawn.
- Since the joining of 2026-11-21 ([the work item](../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)): the markup and the project files read for which projects are web applications are read through the engine's one reading step, and a failure of the machine's in reading a project file is thrown on to the generator, never read as a project that builds nothing; and why a directive's path has no link is handed to the run as a notice ("paths several projects hold, left unlinked" and its kin), its subject the path as written, since the run names the file.
- Since the same day a `<script src>` is read by the directives' rule, as an independent review asked: `~/` from the web application that holds the file, not the workspace's root, and a path from the site's root (`/…`) left unlinked, each path without a link kept as a line by its text and said as a notice. A query or fragment is taken off (`dnn.js?ver=<%= … %>` is `dnn.js`), a remote address (`https://`, `//host/…`) is not read, and neither is a path the page computes as it runs (a server expression or Razor's), which is no path the markup writes. Before building a reading of `<%= ResolveUrl("~/…") %>`, its constant argument, the shapes were counted: DNN's markup holds 9 relative paths and 5 with a computed query, mojoPortal's 10 `~/`, 6 from the site's root, 8 remote and one computed, and neither holds a server expression with a constant argument, so none is read. Measured on DNN: 5 lines gained, `UpgradeWizard.aspx`'s scripts, no notice added. On mojoPortal: 9 lines gained, the `~/` scripts of `Web/Views`, and 7 kept unlinked with a notice, 6 from the site's root in `layout.Master` (the files are under `Web/Content/`, which the site serves at `/Content/` when deployed at its root, a deployment the rule does not read) and one, `~/Scripts/jquery-1.10.2.min.js`, that no file of the repository holds. Nothing lost on either ([the account](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md)).
- Since the same day no script tag a comment holds is read (`withoutMarkupComments`): the comments are written over in spaces first, positions kept, as `withoutXmlComments` does for project files. An HTML comment, which no browser runs a script inside, conditional comments among them since Internet Explorer 10, and the comment the server removes, Web Forms' `<%-- --%>` or Razor's `@* *@`. An HTML comment ends as HTML parses it, at the first `-->` or at once for `<!-->`, so what a downlevel-revealed conditional comment (`<!--[if !IE]><!--> … <!--<![endif]-->`) leaves outside every comment is read. An independent review showed the three kinds drawn; read file by file both ways, DNN's and mojoPortal's markup hold none, and nothing moves.
- Since the same day an ASP.NET Core application's `~/` is its web root, as Microsoft's "Static files in ASP.NET Core" gives it: a web project whose project file names the SDK `Microsoft.NET.Sdk.Web` and that has a `wwwroot` beside it serves `wwwroot`, so a view of it reads `~/` and `/` from that folder alone, and a module's or plugin's view reads `~/` from the web roots of the applications it may be deployed into; a Web Forms or MVC 5 project serves its own folder, as before. The evidence is the files' own (`projectSdk` in `project.ts`, and a `wwwroot` in the index), never a name. Razor code anywhere in a value (`summernote-@(language).min.js`) is a computed path, not read. Measured on three ASP.NET Core repositories (eShopOnWeb, nopCommerce, Orchard Core): eShopOnWeb gains its 2 scripts under `wwwroot` and nopCommerce 81, and what stays unlinked is said: `wwwroot/lib`, restored by LibMan and ignored by git, and files the framework serves from packages (`_content/…`, `_framework/…`); and, by conventions of those products that ASP.NET does not make, Orchard Core's 252 module scripts named `~/{module}/…` and served from that module's `wwwroot`, and nopCommerce's 4 plugin scripts named `~/Plugins/{plugin}/…` and copied there by the plugin project's `OutputPath`. DNN's and mojoPortal's markup reads as before ([the account](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md)).

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

#### `withoutMarkupComments` {#symbol-withoutmarkupcomments}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L103)

##### `withoutMarkupComments` — Summary
The markup with every comment written over in spaces, its line breaks kept, so that positions keep: an HTML comment
(`<!-- … -->`, which no browser runs a script inside, a conditional comment's content among them since Internet
Explorer 10), and the comment the server removes before anything is sent, Web Forms' `<%-- … --%>` or Razor's
`@* … *@`. An HTML comment ends at the first `-->`, or at once when it is `<!-->` or `<!--->`, as HTML parses it, so
the content a downlevel-revealed conditional comment (`<!--[if !IE]><!--> … <!--<![endif]-->`) leaves outside every
comment is kept.

#### `Directive` {#symbol-directive}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L179)

##### `Directive` — Summary
One `<%@ … %>` directive: its name, lowercased, and its attributes by lowercased name.

#### `readDirectives` {#symbol-readdirectives}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L185)
- Returns: [`Directive`](#symbol-directive)[]

##### `readDirectives` — Summary
The directives of a markup file, by Microsoft's documented syntax; a directive with no name is the file type's own. Server-side comments are skipped.

#### `DIRECTIVE_REASONS` {#symbol-directive_reasons}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L228)

##### `DIRECTIVE_REASONS` — Summary
Why a directive's path has no link.

#### `DirectivePath` {#symbol-directivepath}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L236)

##### `DirectivePath` — Summary
A directive's path, resolved to a workspace file or left unlinked for a reason.

#### `resolveDirectivePath` {#symbol-resolvedirectivepath}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/aspnet.ts#L261)
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

An ASP.NET Core application serves its web root instead, `wwwroot` by
default (Microsoft's "Static files in ASP.NET Core"), and `~/` names it: so
the root of a web project whose project file names the SDK
`Microsoft.NET.Sdk.Web` and that has a `wwwroot` beside it is that folder.
A view of such a project reads `~/` and `/` from its own web root alone,
since it is the application; a module or plugin project's view reads `~/`
from the web roots of the applications it may be deployed into, as above.
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
- [`project.projectSdk`](./project.ts.mdmd.md#symbol-projectsdk)
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

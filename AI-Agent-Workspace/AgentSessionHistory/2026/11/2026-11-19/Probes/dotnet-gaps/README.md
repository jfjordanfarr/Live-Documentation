# The .NET gaps, measured against Microsoft's own tools

Current as of November 19, 2026, end of the third leg. A builder measured the six .NET Framework gaps the [cold run](../cold-run/README.md) found, on two public codebases and the repository's estate sample, before changing any reader; the first leg's tables below count what the reader drew before any mend. The second leg mended directives, filename case and solutions, and found the cause of the designer puzzle: see [the second leg](#second-leg-the-mends-and-the-puzzle). The third leg narrowed `~/`, followed `this.`, and compared the C# reader's dependency lines with the compiler's over both corpora: see [the third leg](#third-leg-rulings-built-and-the-compiler-comparison). Every number counts something an oracle independent of our reader found, then what our reader draws.

## Corpora and oracles

| Corpus | Commit | Why |
| --- | --- | --- |
| DNN Platform, `https://github.com/dnnsoftware/Dnn.Platform` | `9bc6b06f` | The cold run's corpus: Web Forms user controls, 82 project files, five solutions, procedures called through a provider |
| mojoPortal, `https://github.com/i7MEDIA/mojoportal` | `ecbaf7f4` | A second house style: 192 pages, 125 user controls, 6 master pages, 32 handlers; procedures called by name through a helper; its SQL Server scripts kept as `.config` files |
| `tests/integration/programs/csharp/estate` | this branch | The owner's shape, in miniature |

The oracles, all in `scripts/` here:
- **C#**: `roslyn/Program.cs` reads every `.cs` file with Microsoft's own parser (`Microsoft.CodeAnalysis.CSharp` 4.12, syntax trees only, no build) and writes, per file, the types it declares (full name, `partial` or not, members), the simple names it uses, its configuration reads and the string literals it hands to data-access calls.
- **Solutions**: `sln_oracle.py` asks `dotnet sln <file> list` (the .NET 10 SDK's own solution parser) for each solution's projects and checks each against the disk.
- **Directives**: `directives.py` is a plain parse of Microsoft's documented directive syntax, `<%@ [Directive] attribute=value … %>`, with the directive's name defaulting to the file type's own (Page, Control, Master, WebHandler, WebService, Application, ServiceHost). It records every attribute that names a file and checks the written path against the disk.
- **What we draw**: `drawn.py` reads a corpus's derived index after `live-docs:generate` and compares its links with the oracles.

## What each gap measures today

### ASP.NET directives

The directives that name a file, by Microsoft's documentation: `CodeBehind`, `CodeFile` and `Src` on Page, Control, Master and Application; `MasterPageFile` on Page and Master; `CodeBehind` on WebHandler (`.ashx`), WebService (`.asmx`) and ServiceHost (`.svc`); `Src` on Register and Assembly; `Page`, `Control` and `VirtualPath` on Reference; `VirtualPath` on MasterType and PreviousPageType. `Inherits`, `Class`, `Service` and `TypeName` name a type, not a file.

Links the oracle finds (a file exists at the written path; `~/` resolved as described below), and how many today's reader draws:

| Directive and attribute | DNN: found / drawn | mojoPortal: found / drawn |
| --- | ---: | ---: |
| Page `CodeBehind` | 12 / 12 | 182 / 182 |
| Control `CodeBehind` | 124 / 0 | 124 / 0 |
| Register `Src` | 95 / 0 | 48 / 0 |
| Page `MasterPageFile` | none written | 159 / 0 |
| Master `CodeBehind` | none written | 5 / 0 |
| WebHandler `CodeBehind` | 3 / 0 | 28 / 0 |
| WebService `CodeBehind` | none written | 1 / 0 |
| Application `CodeBehind` (`Global.asax`) | none written | 1 / 0 |

Files that no adapter reads at all: `.master` (6 in mojoPortal), `.ashx` (3 and 32), `.asmx` (1), `.asax` (1 and 1), `.svc` (2). `CodeFile`, `Src` on Page, Reference, MasterType and PreviousPageType appear in neither corpus.

**What `~/` resolves against.** `~/` is the root of the running web application, not the repository's root, which is what today's reader uses (it finds 0 of 311 written `~/` paths). In a repository the application root is a project's folder. Scored on every `~/` path written in a directive:

| Rule | DNN (99 paths) | mojoPortal (212 paths) |
| --- | ---: | ---: |
| The folder of the nearest project file above the markup | 45 | 206 |
| else the one web project in the workspace that holds a file at that path | 47 more | 5 more |
| several web projects hold it (no link, and say so) | 0 | 1 |
| no file anywhere at that path | 7 | 0 |

The second line is how DNN's providers and mojoPortal's feature projects work: they are deployed into the host web application, so `~/controls/LabelControl.ascx` in `DNN Platform/Providers/HtmlEditorProviders/DNNConnect.CKE/CKEditorOptions.ascx` names `DNN Platform/Website/controls/LabelControl.ascx`. The seven with no file are DNN skins naming `~/DesktopModules/DDRMenu/Menu.ascx`, a path that exists only after deployment. Relative paths resolve against the markup's own folder: every relative `CodeBehind` and `Src` that has a file resolves that way.

### Halves of a partial class

By Roslyn, grouping `partial` declarations of one full type name within one project:

| | DNN | mojoPortal |
| --- | ---: | ---: |
| Partial types declared in two or more files | 148 (303 files) | 308 (616 files) |
| of which designer and code-behind pairs | 134 | 308 |
| Code-behind names a member only its designer half declares | 111 of 134 | 280 of 308 |
| Designer names a member only its code-behind half declares | 1 of 134 | 0 of 308 |
| Other partial groups: ordered pairs where one half names a member only the other declares | 10 of 182 | none |
| Today: code-behind links to its designer | 5 of 134 | 277 of 308 |
| Today: designer links to its code-behind | 0 | 0 |

The cold run's "129 of 134 not linked" is DNN's; on mojoPortal the reader already draws most code-behind-to-designer links. Why the two differ is not yet known (a type-name collision across DNN's many `View`, `Settings` and `Edit` controls is the first suspect).

On 20 designer pairs drawn with seed 1119 from each corpus, the three candidates would draw:
- **A half links another only when it names a member the other declares:** DNN 15 wires (code-behind to designer), mojoPortal 18; no wire from a designer half.
- **Every half links every other:** 40 wires on each corpus, 20 of them from a designer to its code-behind with nothing named.
- **One type, no wire:** none.

### A library's configuration reads

By Roslyn, reads of `ConfigurationManager.AppSettings[…]` and `.ConnectionStrings[…]` (and `.Get(…)`), the reading project from its folder, and its hosts by following `ProjectReference` backward to every web and program project:

| | DNN | mojoPortal |
| --- | ---: | ---: |
| Reads | 35 | 335 |
| Key not a literal (a constant or a computed name) | 10 | 135 |
| Literal reads in a library | 24 | 123 of 200 |
| Library reads with no host in the workspace | 21 | 0 |
| Library reads with three or more hosts | 3 | 102 |
| Literal reads where exactly one host's configuration defines the key | 0 | 90 |
| Literal reads where no host's configuration defines the key | all 24 | 110 |

DNN keeps no configuration under the name the runtime reads: its website ships `release.config` and `development.config`, renamed to `web.config` at install, so no `Web.config` exists for its 24 library reads to reach. mojoPortal's `Web/Web.config` defines 326 settings and names `user.config` (shipped as `user.config.sample`) for local overrides; 110 literal reads name a key no host's file defines (presumably optional settings with a default in code; not checked). mojoPortal's "hosts" include its feature and plugin web projects, which are deployed into `Web` rather than run on their own, so following `ProjectReference` backward finds four hosts where one runs. Today the reader links 11 of DNN's 18 reading files (all tests, to `DNN Platform/Tests/App.config`, which is right) and 40 of mojoPortal's 127.

The constant-key reads are not yet resolved in this probe; the estate's four reads are all of that kind.

### Filename case

Found so far where only a match without regard to case exists, so a Windows build succeeds and our Linux reading misses:
- `mojoportal.sln` names `mojoPortal.Data.pgSQL\mojoPortal.Data.pgSQL.csproj` and `mojoPortal.Features.Data.pgSQL\…`; the folders are `…pgsql`.
- `Web/App_MasterPages/…` in mojoPortal: one Master `CodeBehind` matches only without regard to case.

Not yet counted: `ProjectReference`, configuration file names and `~/` paths without regard to case.

### Solutions

`dotnet sln list` names 89 projects across DNN's five solutions (every one a file in the workspace) and 38 across mojoPortal's two (33 exact, 2 by case alone, 3 missing from the repository). The estate's `Estate.sln` names 5. Today every `.sln` doc is empty: 0 drawn.

### A procedure named from C#

Not yet measured. The Roslyn probe already collects every literal handed to a data-access call, with whether `CommandType.StoredProcedure` is among the arguments. mojoPortal names its procedures through `new SqlParameterHelper(connection, "mp_Users_SelectOne", n)` in 79 files and defines them in `.config` files under `Setup/applications/*/SchemaInstallScripts/mssql/`, which no SQL reader reads today.

## What the first leg left

- No mend. Gaps 1, 4 and 5 are next, then 3 and 2 as far as the rulings reach.
- The seeded reading of 100 procedure call sites and the candidate rules' scores.
- Why DNN's designer pairs are unlinked while mojoPortal's are linked.
- The case count across every link kind.
- `.cshtml`, `.vb` and configuration files with no settings, which the brief asked to report.

## Second leg: the mends and the puzzle

Measured with this branch's readers at `f4bd8235`, the same oracles, and fresh generation of both corpora.

### Directives after the mend

| Directive and attribute | DNN: found / drawn before / after | mojoPortal: found / drawn before / after |
| --- | --- | --- |
| Control `CodeBehind` | 124 / 0 / 124 | 124 / 0 / 124 |
| Register `Src` | 95 / 0 / 95 | 48 / 0 / 48 |
| Page `CodeBehind` | 12 / 12 / 12 | 182 / 182 / 182 |
| Page `MasterPageFile` | none written | 159 / 0 / 159 |
| Master `CodeBehind` | none written | 5 / 0 / 5 |
| WebHandler `CodeBehind` | 3 / 0 / 3 | 28 / 0 / 28 |
| WebService and Application `CodeBehind` | none written | 2 / 0 / 2 |

The estate's one page was already linked and is unchanged. Paths the oracle finds no file for are kept by their written name.

**Are the `~/` wires the files the application would load?** Twenty resolved `~/` wires drawn from each corpus with seed 1119 (`scripts/tilde_sample.py`), each read against the projects' build files:
- **DNN: 20 of 20 right.** Every one lands in `DNN Platform/Website`, the web application DNN runs; modules and skins are deployed into it. Eighteen are matched only without regard to case (`~/controls/LabelControl.ascx` is `controls/labelcontrol.ascx` on disk), which Windows serves and the old reader could never have found.
- **mojoPortal: 11 of 20 right, 9 wrong.** All nine wrong wires go from a page of `mojoPortal.Features.UI` or `SuperFlexiUI` to that project's own `App_MasterPages/layout.Master`. Those copies are 2.2 KB stubs that let the project compile in Visual Studio. The project's post-build step copies its pages into `Web/` and not its master pages, so at run time `~/App_MasterPages/layout.Master` is `Web/App_MasterPages/layout.Master` (8.5 KB). The ruled order, the own project first, picks the stub. The three right wires from feature projects name user controls the post-build step copies, so the own copy is the deployed one.

So the ruled `~/` rule is right for DNN's shape and wrong for nine of twenty of mojoPortal's. This needs a ruling; see the handback.

### Filename case after the mend

Paths that match a workspace file only without regard to case (`scripts/case_count.py`):

| Link kind | DNN | mojoPortal | Estate |
| --- | ---: | ---: | ---: |
| `ProjectReference` | 1 of 365 | 7 of 85 | 0 of 3 |
| Relative directive path | 0 of 142 | 1 of 341 | 0 of 1 |
| `~/` directive path, resolved | 18 of the 20 sampled | 0 of the 20 sampled | none |
| Solution's project | 0 of 89 | 2 of 38 | 0 of 5 |
| `Web.config` / `App.config` spellings | `Web.config` 3, `App.config` 1 | `Web.config` 9, `app.config` 9 | `Web.config` 2, `App.config` 2 |

Before, each of these was lost on Linux. After, each links to the file in its own spelling: for instance DNN's `DotNetNuke.Instrumentation.csproj` names `..\DotNetNuke.Log4Net\DotNetNuke.Log4Net.csproj` and now reaches `DNN Platform/DotNetNuke.Log4net/DotNetNuke.Log4Net.csproj`, where before it kept the name. The old reader already tried both `Web.config` and `web.config`, so the configuration spellings found here were not lost.

Every product path into the .NET readers goes through `generateLiveDocs`, which builds the file index from discovery and passes it to both of its passes: `live-docs:generate`, the history's `summarizeChange`, `sample-build`, `visualize-history-sample` and `oracle:compare`. The estate reader reads generated docs, not sources. The index holds what discovery keeps: not what git ignores, not what the configuration excludes, not the docs folder. A link to such a file used to be drawn when the disk had it, and led to a doc that does not exist; now there is no link, and a project reference is kept by name.

### Solutions after the mend

`dotnet sln list` names 89 projects in DNN, 38 in mojoPortal and 5 in the estate. Drawn after: 89, 35 (the 33 exact and the 2 by case; the 3 missing are kept by name) and 5. Before: none.

### The designer puzzle, explained

The cause is not how the reader chooses among types of one name. DNN's code style writes every member access as `this.member` (StyleCop's rule SA1101). The C# reader records a use of a partial peer's member only when the name stands bare: `cmdSave.Click` is recorded, `this.cmdSave.Click` is not, because the chain that starts with `this` is not followed. Counted by `scripts/this_prefix.py` over every designer pair:

| Code-behind names a designer-only member | DNN: pairs / drawn today | mojoPortal: pairs / drawn today |
| --- | --- | --- |
| bare, at least once | 2 / 2 | 276 / 276 |
| only through `this.` | 107 / 2 | 3 / 0 |
| not at all | 25 / 1 | 29 / 1 |

Candidate A is already what the reader does for bare names; following `this.` would complete it, and would draw about 107 more links on DNN. Because the cause is not type choice, the compiler comparison over the whole corpora was not run in this leg.

## Third leg: rulings built and the compiler comparison

Measured with this branch at `30edd708` (with `main`'s `3feb97fa` picked), fresh generation of both corpora.

### `~/` with one holder only

Ruled: a `~/` path links only when exactly one of the markup's own project and the workspace's web projects holds a file there. Counts after, against the second leg's:

| `~/` paths written in directives | DNN | mojoPortal |
| --- | ---: | ---: |
| Written | 99 | 212 |
| Linked, second leg (own project first) | 92 | 211 |
| Linked now | 92 | 63 |
| Several projects hold the path: no link | 0 | 149 |
| No project holds it: no link | 7 | 0 |

On mojoPortal the 149 are 145 `MasterPageFile="~/App_MasterPages/layout.Master"`, which `Web`, `mojoPortal.Features.UI` and `SuperFlexiUI` each hold, and four master pages whose `CodeBehind` is written as `~/App_MasterPages/layout.Master.cs` (`scripts/tilde_holders.py`). The same seeded draw of twenty resolved wires (seed 1119, from the wires that remain): **DNN 20 of 20 right** (the same twenty as before), **mojoPortal 20 of 20 right**: twelve user controls of `mojoPortal.Features.UI` under `Blog/`, `Forums/` and `List/`, which the project's post-build step copies into `Web/` at the same paths (`xcopy /s … Blog\*.ascx … Web\Blog\`), so the own project's copy is what runs; and eight user controls and master pages of `Web` named from its own pages.

**What reading the deployment would take.** To link a feature page's `layout.Master` to the copy the application serves, a reader would have to evaluate how each web project's build copies its files into another's folder (mojoPortal's `PostBuildEvent` of `xcopy` lines with `$(ProjectDir)`, `$(SolutionDir)` and wildcards; elsewhere `Content` items, `.targets` files or publish profiles) and map each copied file to its destination. The owner knows of no web project in their estate that is copied into a host site at build time, so nothing calls for it yet.

### Why a written path has no link

Adapters have no channel that reaches the end of a generation run: `SourceAnalysisResult` carries symbols, dependencies, re-exports, a program entry and declared entries, and nothing the generator counts or prints. The reason would need one optional field there, for instance `notices?: { reason: string; subject: string }[]`, passed through `analyzeSourceFile`, and a line per reason with its count at the end of `generateLiveDocs`, such as "148 paths beginning ~/ are held by several web projects". None was built, as ruled.

### `this.member` followed

A half of a partial type now links to its peer through `this.member` and `(this).member` as through a bare name. `base.member` does not count (the base list already links the base type), and neither does a member reached through a cast, `((Base)this).member` (the cast's type name links that type). Code-behind to designer, of all pairs:

| | DNN | mojoPortal |
| --- | ---: | ---: |
| Pairs | 134 | 308 |
| Drawn before | 5 | 277 |
| Drawn after | 112 | 280 |

Every wire gained runs between halves of one partial type, and none was lost (`scripts/new_wires.py`, comparing the second leg's docs with these): DNN gained 109, 107 between a code-behind and its designer and 2 between halves of `EventLogController`; mojoPortal gained 3, all code-behind to designer.

### The C# reader's dependency lines against the compiler's

`scripts/compiler-edges/Program.cs` builds one Roslyn compilation per project from its syntax trees, each referencing the compilations of its `ProjectReference`s, with no framework references, and binds every simple name. A source symbol declared in another file is an edge to each file declaring it (every part of a partial type), labelled by whether a type or only a member carried it; namespaces are not edges. Without the framework, 65% of DNN's 631,719 simple names and 53% of mojoPortal's 567,301 bind; most of the rest are framework names, but a source name reached through a framework type (`Page.Items[…]`) does not bind either, so the compiler's column undercounts. Ours are the C# files' Dependencies lines that name another C# file (`scripts/compare_compiler.py`). Counted as pairs of files:

| | DNN | mojoPortal |
| --- | ---: | ---: |
| Our dependency lines from a C# file to a C# file | 20,991 | 8,180 |
| The compiler's edges | 24,848 | 8,217 |
| In both | 20,390 (97.1% of ours) | 6,894 (84.3% of ours) |
| Ours only | 601 | 1,286 |
| The compiler's only | 4,458 | 1,323 |

Ours that the compiler does not have, by cause:

| Cause | DNN | mojoPortal |
| --- | ---: | ---: |
| We chose a namesake: the compiler bound the same name to a type in another file | 30 | 887 |
| The name is declared in several files and the compiler bound none of them here | 22 | 376 |
| An attribute named without its suffix, unbound without the framework (an oracle limit) | 243 | 0 |
| The file names a type the target declares; the compiler did not bind it | 141 | 21 |
| No name the target declares appears in the file (configuration, reflection, strings) | 164 | 2 |
| Halves of one partial type with no member use the compiler bound | 1 | 0 |

The namesake rows are wrong wires. mojoPortal keeps one data-layer project per database (`mojoPortal.Data.MSSQL`, `.MySql`, `.SQLite`, `.pgsql`), and each declares the same `mojoPortal.Data.ConnectionString`, `DBFields` and so on. `SuperFlexiData.MSSQL/DBFields.cs` references only the MSSQL project, and the compiler binds `ConnectionString` there; our reader links it to the MySQL, SQLite and pgsql copies as well. The reader resolves a full type name across the whole workspace and does not narrow by the projects the file's project references. About one in six of mojoPortal's C# dependency lines is wrong this way (887 certainly, 376 very likely); DNN has few such duplicates (52). The estate's portal and gateway both declare `Controllers.PaymentsController`, the same shape in miniature.

The compiler's that we lack, by cause:

| Cause | DNN | mojoPortal |
| --- | ---: | ---: |
| A member used with no type named (inherited, extension method, through a variable or property) | 3,751 | 1,128 |
| A type named that only the target declares | 628 | 172 |
| A type named whose simple name several files declare | 78 | 23 |
| A member of a partial peer | 1 | 0 |

The first row is by design so far: a dependency line says which declared types a file names, and a file that calls `settings.WebsitePath` on a `LocalSettings` it never names does not list `LocalSettings.cs`. The second and third rows are type names the reader did not resolve; they have not been read one by one.

So "95% of dependency lines resolved" in the cold run counts lines that found a file. Against the compiler, 97% of DNN's C#-to-C# lines and 84% of mojoPortal's are lines the compiler agrees with; the rest are mostly lines that found the wrong one of several same-named types.

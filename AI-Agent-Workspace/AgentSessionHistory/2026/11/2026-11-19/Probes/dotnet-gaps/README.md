# The .NET gaps, measured against Microsoft's own tools

Current as of November 19, 2026, first leg. A builder measured the six .NET Framework gaps the [cold run](../cold-run/README.md) found, on two public codebases and the repository's estate sample, before changing any reader. Nothing here has changed product code yet. Every number counts something an oracle independent of our reader found, then what our reader draws today.

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

## What is not done in this leg

- No mend. Gaps 1, 4 and 5 are next, then 3 and 2 as far as the rulings reach.
- The seeded reading of 100 procedure call sites and the candidate rules' scores.
- Why DNN's designer pairs are unlinked while mojoPortal's are linked.
- The case count across every link kind.
- `.cshtml`, `.vb` and configuration files with no settings, which the brief asked to report.

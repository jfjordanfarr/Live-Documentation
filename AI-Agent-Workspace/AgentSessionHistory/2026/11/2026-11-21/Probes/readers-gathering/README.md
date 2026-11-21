# The three readers graded after their joining onto `main`'s engine

Historical evidence, written on November 21, 2026 by a builder for the root, on the branch `readers-gathering` after its three merges (SQL `5c2b41bdd`, PowerShell `c47de8e36`, .NET `16004f4ef`). It records, for every corpus each reader was graded on, what was read and how, so that the run can be repeated and a number that moves can be told apart from a change of corpus. The records it is set beside are [the SQL reader's](../../../2026-11-19/Probes/sql-reader/README.md), [the PowerShell reader's](../../../2026-11-19/Probes/powershell-wires/README.md) and [the .NET reader's](../../../2026-11-19/Probes/dotnet-gaps/README.md); the work item is [the readers on `main`](../../../../../../Work/readers-on-main.md).

Every corpus was fetched anonymously and shallow, by its full commit id (`git fetch --depth 1 <url> <id>`, then `git checkout FETCH_HEAD`), into a scratch folder outside the checkout; nothing of a corpus is committed. Commands are run from the checkout's root. The tools found on the machine: .NET SDK 10.0.404, PowerShell 7.7.0, Java 21 with Maven, Python 3.

## In short

Every figure equals its record's, but four, and each of the four is explained: a later leg of the same reader that its record's table predates (dbatools' SQL, dbatools' PowerShell), a file the engine's one reading step now decodes (one line of mojoPortal's C#), and folders the record did not name (utPLSQL). Nothing moved because of the joining.

## SQL: T-SQL against ScriptDom

`npm run oracle:sql -- <folder>`. The oracle's walk leaves out every folder named `bin`, `obj`, `target`, `node_modules`, `__pycache__` or `expected`, at any depth (`scripts/oracle/fixture.ts`).

| Corpus | Commit | Folder graded | Files read / graded / refused | Objects found | Lines right | Dependency lines right, missing, invented | The record's |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tSQLt | `4a921d0dacfb1d66b3db124c58158c80e5e910e6` | the whole checkout | 281 / 268 / 13 | 1,525 of 1,535 | 1,525 of 1,525 | 969 of 969, 0, 0 | the same (fourth leg) |
| DNN Platform `.sql` | `9bc6b06f4f15d11f6e52446505ec3117a7c84200` | the whole checkout | 12 / 12 / 0 | 51 of 51 | 51 of 51 | 29 of 29, 0, 0 | the same (second leg) |
| DNN provider scripts | the same | 299 `.SqlDataProvider` files copied as `.sql` by [`provider_copies.py`](provider_copies.py), `{databaseOwner}` as `dbo.` and `{objectQualifier}` as nothing | 299 / 299 / 0 | 4,052 of 4,056 | 4,052 of 4,052 | 6,961 of 6,962, 1, 0 | the same (fourth leg) |
| dbatools `.sql` | `067b215bf843ec3573a79226ac9d2b871d1440cb` | `bin/`, named as the folder itself, since every `.sql` file lies beneath it and the walk leaves out a folder named `bin` | 25 / 24 / 1 | 26 of 26 | 26 of 26 | 199 of 199, 0, 0 | 15 of 15; 175 of 175 (first leg) |

The provider copies are made by `python3 -I provider_copies.py <dnn checkout> <copies folder>`, which writes each file's path with its suffix replaced.

**dbatools moved, and both sides moved together.** Its record is the first leg's table, written before the second leg taught the oracle and the reader the strings a script executes. Of dbatools' executed strings, 11 are written out and name or create an object; read, they add 11 objects (15 to 26) and 24 dependency lines (175 to 199) on both sides, and the agreement stays whole.

## PL/SQL: against the ANTLR project's grammar

`npm run oracle:plsql -- <folder>`. It fetches the ANTLR 4.13.2 tool jar and the grammar at grammars-v4 `de38599628d221099c046e92962f70204d852b54` into `~/.cache/live-documentation/oracle-plsql`, each checked by its SHA-256 sum, and builds with the machine's Java.

| utPLSQL `01a89eae1b359b858a41224327670e9b4d32bdc9` (the last commit on `develop` up to the end of November 19, UTC) | Files read / graded / refused | Packages, types, tables found | Dependency lines expected, right, missing, invented |
| --- | --- | --- | --- |
| `source/` and `examples/`, `test/` and `development/` left out | 366 / 268 / 98 | 40, 113; 15 of 15 tables | 433, 270, 163, 248 |
| the record (third and fourth legs) | 366 / 268 / 98 | 40, 113; 15 of 15 | 433, 270, 163, 248 |
| for comparison: `source/`, `examples/` and `development/` | 370 / 271 / 99 | 41, 113; 15 of 15 | 438, 274, 164, 249 |
| for comparison: the whole checkout | 512 / 365 / 147 | 101, 117; 15 of 15 | 658, 337, 321, 370 |

The record named neither the commit nor the folders. The whole checkout gave other figures, which could have been read as a regression of the joining; the folders were found by trying, and `source/` with `examples/` reproduces every figure of the record exactly, the 976 procedures and functions declared in package specs, the 973 one-part calls and the 212 kept names a package would link among them. The reader and the grader on the branch are byte for byte the SQL branch's tip, but the adapter's two import lines.

## PowerShell: against PowerShell's own parser

`npm run oracle:powershell -- <folder> --detail`, the grader committed with this account (`scripts/oracle/powershell-compare.ts`): `powershell-ast.ps1` over every PowerShell file of the folder, the rules of `powershell-wires.ts` over its facts, and the adapter over the same files with every file of the folder as its index. A folder is every file but the version control's folder and a folder of Live Docs; that is how the record counted the corpora (dbatools' 1,797 PowerShell files include `bin/`). A wire is a file pair, by a load or a call; a call is a file, a function and the file defining it.

| Corpus | Commit | PowerShell files | Wires: parser's / adapter's / both | Calls: parser's / adapter's / both | Programs: agree / differ | The record's last figures |
| --- | --- | ---: | --- | --- | --- | --- |
| dbatools | `067b215bf843ec3573a79226ac9d2b871d1440cb` | 1,797 | 7,479 / 7,478 / 7,478 | 6,630 / 6,629 / 6,629 | 1,792 / 1 | 7,479 / 7,477 / 7,477; 6,630 / 6,628 / 6,628; 1,791 / 2 |
| AL-Go | `403f36ab563291207687c513c8dedd93f683f8ce` | 198 | 493 / 492 / 492 | 1,042 / 1,041 / 1,041 | 198 / 0 | wires 493 / 492, none invented; calls 1,044 and 1,041 before P1 |
| AzureStack-Tools | `0e4a9f32c4677e2ee3b687032e0472b890a772b6` | 42 | 13 / 15 / 13 | 29 / 29 / 29 | 37 / 0 | the same |
| tSQLt | `4a921d0dacfb1d66b3db124c58158c80e5e910e6` | 39 | 39 / 34 / 34 | 34 / 34 / 34 | 39 / 0 | the same |

- **dbatools, one wire, one call and one program more agreed.** The record's figures are its first score, and its later legs did not score dbatools' wires again after the last grammar round, whose table says `Install-DbaInstance.ps1` and its functions were no longer lost. That file's test now reaches it, and the file reads as the library it is. What is left is the record's own remainder: `public/Find-DbaInstance.ps1` holds its function inside text the grammar cannot read, so `tests/Find-DbaInstance.Tests.ps1`'s call is not wired and the file stays a program.
- **AL-Go, the parser's calls 1,044 to 1,042.** P1, built after the record's last count of calls, made `Actions/RunTests/RunTests.psm1` working code, and the parser's rules stopped drawing its two calls to the stubs in `Tests/RunTests.Test.ps1`, which the record had found false. The one wire and one call the adapter misses are the record's: `Invoke-CopilotPRReview.psm1` loads `scripts/GitHub.ps1` by a written-out list in a file the grammar reads with an error, and `CommentPublishing.ps1`'s call to `Test-GlobMatch` reaches `FindingPlacement.ps1` only through that load.
- **AzureStack-Tools' two extra wires** are the record's: two manifests `Import-PowerShellDataFile` refuses, which the adapter's reader of the data language reads.
- **tSQLt's five missing wires** are the record's: scripts run as `./x.ps1`, which the grammar reads as dot-sources.
- **The fifth corpus, "the shop", is not scored.** The cold run made it by hand in its scratch folder ("scratch only", [its table](../../../2026-11-19/Probes/cold-run/README.md)), and it was never committed.

## .NET: against the compiler's edges and Microsoft's parsers

The record's scripts, in [its `scripts/` folder](../../../2026-11-19/Probes/dotnet-gaps/scripts/compare_compiler.py), were copied out of the checkout before building, so that no `bin/` or `obj/` lands in it. For each corpus:

```sh
dotnet build -c Release <copy>/compiler-edges        # Microsoft.CodeAnalysis.CSharp 4.12.0, from NuGet
dotnet build -c Release <copy>/roslyn
dotnet <copy>/compiler-edges/bin/Release/net10.0/CompilerEdges.dll <corpus> <out>/compiler-edges.jsonl
dotnet <copy>/roslyn/bin/Release/net10.0/RoslynProbe.dll <corpus> <out>/roslyn.jsonl
python3 -I <copy>/directives.py <corpus> <out>/directives.jsonl
python3 -I <copy>/sln_oracle.py <corpus> <out>/sln.json
npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/generate.ts --workspace <corpus>
python3 -I <copy>/compare_compiler.py <out>/compiler-edges.jsonl <corpus>/.live-documentation <out>/roslyn.jsonl
python3 -I <copy>/drawn.py <corpus> <out>/directives.jsonl <out>/roslyn.jsonl <out>/sln.json
```

`sln_oracle.py` takes its output file as its second argument. The whole checkout is read; the oracles leave out `.git`, `.live-documentation`, `bin`, `obj` and `node_modules`.

| | DNN Platform `9bc6b06f4f15d11f6e52446505ec3117a7c84200` | mojoPortal `ecbaf7f406ad656ed13b7fb3390ffc881a79f9a3` |
| --- | --- | --- |
| Docs written | 10,776, as the record | 7,911, as the record |
| Our C#-to-C# lines / the compiler's / both | 20,970 / 24,848 / 20,399 | **7,061** / 8,217 / **7,023** |
| Ours only; of which a namesake | 571; 2 | 38; 0 |
| The compiler's only | 4,449 | **1,194** |
| The record's (sixth leg) | 20,970 / 24,848 / 20,399; 571; 2; 4,449 | 7,060 / 8,217 / 7,022; 38; 0; 1,195 |
| Directive links found / drawn | every attribute drawn as found: Control `CodeBehind` 124, Register `Src` 95, Page `CodeBehind` 12, WebHandler 3 | `~/App_MasterPages/layout.Master`, held by three web projects, unlinked (144 of 145 an oracle link); every other link drawn |
| Code-behind to designer | 112 of 134 | 280 of 308 |
| Solution to project | 89 of 89 | 35 of 35 (3 missing from the repository) |
| Notices the run said | "paths no file in the workspace holds, left unlinked: 7"; "type names declared only outside the project's reach, left unlinked: 1" | "paths several projects hold, left unlinked: 149"; "paths no file in the workspace holds, left unlinked: 4"; "type names several projects in reach declare, left unlinked: 874"; "… declared only outside the project's reach …: 19" |

**mojoPortal, one line more, and the compiler binds it.** `mojoPortal.Web.Framework/CultureHelpers/PersianDateHelper.cs` is saved as UTF-16 with a byte-order mark. The .NET branch read it as UTF-8, found no type, and so drew nothing to it; on the joined branch the engine's one reading step reads it, and `DateTimeHelper.cs`'s line to it is drawn, the one compiler edge to that file. The 149 paths several projects hold are the record's 145 `MasterPageFile` and four master pages' `CodeBehind`, all `~/App_MasterPages/layout.Master`; the 7 on DNN are the record's skins naming `~/DesktopModules/DDRMenu/Menu.ascx`.

### The C# grader, `oracle:csharp`, and the reviewer's name cases

After the review, the record's compiler program became the committed grader `npm run oracle:csharp -- <folder>` (`scripts/oracle/csharp-compiler.cs`, the same Roslyn 4.12 package): each project's references are MSBuild's evaluation (`dotnet msbuild -getItem:ProjectReference`), and a project MSBuild cannot evaluate on Linux has its references read from its XML's elements by System.Xml and is named in the report. Its column is therefore not the record's: it counts edges a name makes by a type or only a member, and takes no reference from a comment. Run once with `--write` into each checkout, so that the runs after it read the kept record and change only the reader:

| | DNN Platform | mojoPortal |
| --- | --- | --- |
| Projects; references by MSBuild / by XML elements | 82; 48 / 34 | 25; 21 / 4 |
| References under a condition the default configuration does not meet | 0 | 15 |
| Before the two mends: ours / the compiler's / both | 20,970 / 24,837 / 20,391 | 7,061 / 8,299 / 7,023 |
| Ours only: a namesake / resting on such a reference / other | 2 / 0 / 577 | 3 / 0 / 35 |
| The compiler's only | 4,446 | 1,276 |
| After the base-type lookup (`8d62f8171`) | 20,971 / 24,837 / 20,392; 2 / 0 / 577; 4,445 | unchanged |
| After the alias's arity (`842ff72aa`) | unchanged | unchanged |

The one edge the base-type lookup draws on DNN is `DNN Platform/Library/Services/GeneratedImage/ImageQuantization/GrayscaleQuantizer.cs` to `Quantizer.cs`, which the compiler binds; nothing is lost on either corpus. The namesakes left are of other causes: on DNN `CryptographyProvider.cs` to `ICryptographyProvider.cs` and `SiteSettingsController.cs` to `BrowserTypes.cs`; on mojoPortal three pages to `Web/Controls/SkinSetting.ascx.designer.cs`. mojoPortal's 15 conditional references carry no edge of ours that the compiler lacks. The cases themselves, and two more the compiler settled for the tests (a class does not inherit an interface's nested types; an interface does inherit its base interfaces'), are in the `names` sample and `csharp.test.ts`. One the alias work met and left open: a type nested in a generic type has the same qualified name in the reader as one nested in its non-generic namesake (`Lib.Helper.Part`), so `H.Part` through `using H = Lib.Helper;` is taken for an ambiguity and links nothing, where the compiler binds `Helper.cs`.

**A `<script src>`, by the directives' rule.** An independent review found the ASP.NET reader taking a script's `~/` from the workspace's root and `/` as the same, where the directives take `~/` from the web application that holds the file and leave a site-root path unlinked. Before reading a server expression's constant argument, the shapes a `src` takes in the corpora's markup (`.aspx`, `.ascx`, `.master`, `.ashx`, `.asmx`, `.asax`, `.svc`, `.cshtml`, `.razor`) were counted by a reader that steps over `<% … %>` blocks:

| Shape | DNN | mojoPortal |
| --- | --- | --- |
| Relative | 9 | 0 |
| Relative, with a computed query (`?ver=<%= … %>`) | 5 | 0 |
| `~/` | 0 | 10 |
| From the site's root | 0 | 6 |
| Remote (`https://`, `//host`) | 0 | 8 |
| A server or Razor expression with one constant argument (`ResolveUrl`, `Url.Content`, …) | 0 | 0 |
| Computed otherwise (`@(siteRoot + siteFolderName)…`) | 0 | 1 |

Four more single-quoted values on mojoPortal are text inside JavaScript strings that write script tags (`\'/Content/…\'`, `'{0}'`), not tags; the reader reads double-quoted values only and never sees them. With no constant-argument expression in either corpus, none is read, as ruled. After the change, read file by file with the adapter: DNN gains 5 lines, `UpgradeWizard.aspx`'s five scripts once their query is taken off, and no notice; mojoPortal gains 9 lines, the `~/` scripts of `Web/Views` reaching `Web/Content` and `Web/Scripts`, and keeps 7 unlinked with a notice: 6 site-root paths of `Web/App_MasterPages/layout.Master` ("paths from the site's root, left unlinked"), whose files are under `Web/Content/failsafeskin/js/`, served at `/Content/` only when the site is deployed at its root, and `~/Scripts/jquery-1.10.2.min.js` ("paths no file in the workspace holds"), which no file of the repository holds. No line is lost on either. The notices the run says on mojoPortal go from 153 to 160.

**Where scip-dotnet and the compiler program differ on the C# samples.** Each sample now keeps both records (`expected/compiler-edges.json`, scip-dotnet 0.2.14 or 0.2.16; `expected/csharp-compiler.json`, Roslyn 4.12), and `csharp-oracle.test.ts` holds the reader to the second. Over C# file pairs, scip's edges resting only on an ambiguous symbol set apart:

| Sample | scip-dotnet: settled + ambiguous | The compiler | Both | Where they differ |
| --- | --- | --- | --- | --- |
| `basic` | 13 + 0 | 13 | 13 | nowhere |
| `estate` | 37 + 0 | 37 | 37 | nowhere |
| `rosetta` | 24 + 0 | 24 | 24 | nowhere |
| `webforms` | 2 + 0 | 2 | 2 | nowhere |
| `names` | 1 + 2 | 2 | 1 | the alias: scip leaves `Lib/Helper#` to `Helper.cs` and `HelperOfT.cs`, the compiler binds `Helper.cs` |

The reader agrees with the compiler on every pair of all five. On these samples scip-dotnet's C# file pairs tell nothing the compiler program does not, and where it is unsure the compiler is not; what scip's record still carries that the program's does not is the list of documents it indexed, which `oracle:compare` uses to tell an extra edge from one beyond the compiler's view, and the oracle comparison's run of the whole generator, project files and markup included.

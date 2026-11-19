# A cold run on code shaped like the owner's work

Current as of November 19, 2026. A builder ran this for the root at `aeb840c4`. It changed no product code, test or configuration. In December the owner will show the tool at their work, on Windows PowerShell 5.1, .NET Framework 4.8 (C#, config and project files) and SQL Server code, on a Windows machine with 8 GB of memory. This probe ran the tool cold, the way a stranger would, on public code of that shape. It records everything that went wrong.

## The verdict

**Not today, not without preparation.** Generation finished on every corpus once the files that crash it were set aside, and it fits easily in 8 GB. But the picture would not have shown what the owner's colleagues expect to see.

Three things were most likely to embarrass us:

1. **PowerShell comes out as dots with no wires.** Of dbatools' 1,977 files, 1,947 stand alone. The map draws a connection between scripts only for a dot-source, `Import-Module`, `using module` or `#requires` that names a path written out. A function defined in one script and called from another is never drawn. In a seeded sample of twenty scripts there were 64 such calls and the map drew none. Neither `Invoke-Sqlcmd` nor SQL written inside a PowerShell string is read. dbatools loads its functions in a loop (`. $file.FullName`), which no reader of the text can follow, so its module file connects to nothing.
2. **One apostrophe in a SQL name stops the whole run.** A bracketed name such as `[test that it doesn't fail]` breaks generation. The SQL scanner treats the `'` as the start of a string, swallows text up to the next quote, and writes a name with a line break into the Live Doc. The graph reader then refuses that doc, and the run ends in an error after it has already written every doc and before it writes the index. Five tSQLt files did this; a further 46 procedure names came out garbled without crashing. A file name with a `)` in it, such as Explorer's `Lib - Copy (2).ps1`, stops the run in the same place.
3. **Windows itself.** Git for Windows checks text files out with CRLF endings by default. A colleague who clones a repository with committed Live Docs cannot run `inspect` or `visualize`: both fail on the first doc ("expected the title, found `# Shop.sln\r`"), and `--check` reports every doc as changed. A configuration file saved by Windows PowerShell 5.1 (`Set-Content -Encoding UTF8` writes a byte-order mark) makes every command fail before it starts. SQL scripts saved by SSMS as Unicode (UTF-16) get no symbols, with no warning.

Close behind those three:
- **A user control is never joined to its code.** `.ascx` user controls are never joined to their code-behind: 161 in DNN, none linked.
- **A designer file is never joined to its code-behind.** Of 134 designer/code-behind pairs, 5 are linked.
- **About 6% of PowerShell files hold a construct the grammar cannot parse.** Each is a common Windows PowerShell idiom: `1MB`, `-cin`, a labelled `continue`, a `switch` label in double quotes with a space. In two dbatools files the error swallowed the file's own public function.

## What was run on what

| Corpus | Why | URL | Commit (shallow) | Files |
| --- | --- | --- | --- | ---: |
| dbatools | Mostly PowerShell, written to run on Windows PowerShell 5.1, talks to SQL Server; a module of about 700 public and 140 private function files plus 774 Pester tests | https://github.com/dataplat/dbatools | `067b215b` (development) | 2,002 |
| DNN Platform | A long-lived ASP.NET Web Forms CMS on .NET Framework 4.8: `.sln`, 82 `.csproj` (22 classic, 59 SDK-style targeting `net48`), `web.config` templates, `.ascx`/`.aspx` with code-behind and designer files, 299 SQL scripts in DNN's `.SqlDataProvider` form | https://github.com/dnnsoftware/Dnn.Platform | `9bc6b06f` (develop) | 10,940 |
| tSQLt | SQL Server unit-testing framework: 281 `.sql` files, one object per file, procedures calling procedures and naming tables; also PowerShell build scripts, `.sqlproj`, a little C# CLR | https://github.com/tSQLt-org/tSQLt | `4a921d0d` (main) | 471 |
| shop (made here) | 22 hand-written files of exactly the owner's shape, to test each connection kind once: a classic `.csproj` pair with a `ProjectReference`, `Web.config` with a connection string, setting and WCF endpoint, `.aspx` and `.ascx` with code-behind, a `partial` class in two files, `SqlCommand` naming a procedure, inline SQL in C#, procedures calling procedures and a function, a script dot-sourcing with a backslash path, `Import-Module`, `Invoke-Sqlcmd`, UTF-16 and CRLF copies of a PowerShell, a SQL and a C# file, a `.sln` | scratch only | n/a | 22 |

Files by extension:
- **dbatools:** 1,790 `.ps1`, 54 `.xml`, 33 `.json`, 28 `.yml`, 25 `.sql`, 22 `.sh`, 4 `.psd1`, 3 `.psm1`.
- **DNN:** 3,973 `.cs`, 1,330 `.js`, 1,325 `.png`, 671 `.gif`, 482 `.jsx`, 305 `.less`, 299 `.SqlDataProvider`, 283 `.svg`, 203 `.resx`, 202 `.css`, 175 `.html`, 161 `.ascx`, 89 `.ts`, 87 `.vb`, 82 `.csproj`, 52 `.config`, 30 `.cshtml`, 13 `.aspx`, 12 `.sql`, 5 `.sln`, 4 `.ps1`.
- **tSQLt:** 281 `.sql`, 38 `.ps1`, 37 `.sqlpromptsnippet`, 17 `.cs`, 9 `.sqlproj`, 4 `.ssmssqlproj`, 4 `.csproj`, 1 `.sln`.

Everything ran in a scratch folder outside the repository, on this container (20 threads, 62 GB, Linux), at a load average of 7 to 18 from other builders.

## The stranger's steps and stumbles

What the README and the CLI reference say to do, done literally:

1. `git clone`, `npm install` (here `npm ci`), `npm run build`. No trouble.
2. `npm run live-docs:generate -- --workspace <folder>`. No configuration is needed and none was written at first.
3. `npm run live-docs:visualize -- --workspace <folder>`.
4. `npx http-server dist/explorer …` (not run: no browser in this probe).
5. `npm run live-docs:inspect -- --workspace <folder> --from <file> …`.

Stumbles, in the order met:

- **The run writes into the user's own repository, and a lot.** The first command adds `.live-documentation/` inside the folder being mapped: 1,978 files (15 MB) for dbatools, 10,777 (118 MB) for DNN. Every image gets a doc: DNN's 1,325 PNGs and 671 GIFs among them. Nothing is added to `.gitignore`, so `git status` lists them all. `--dry-run` exists, but the quick start leads with the writing command. Showing this on a colleague's working copy would surprise them.
- **"The current directory" is the tool's checkout, not yours.** Every `--help` says `--workspace` defaults to the current directory. Under `npm run` that is the Live Documentation checkout, so a relative `--workspace ..\MyRepo` is taken from there.
- **Two maps cannot sit side by side.** `visualize` writes into this checkout's `dist/explorer/` unless `--output` names a place, so mapping a second folder overwrites the first map.
- **A mistyped `--workspace` succeeds.** It prints "processed 0 file(s)" and creates the misspelled folder.
- **The crash message names a Live Doc, not the source file, and gives no stack.** `live-docs:generate failed: .live-documentation/source/Tests/Run_Methods_Tests.class.sql.md: line 68: expected "", found "- Entry: opening [...]"`. To learn which code was at fault I had to call `generateLiveDocs` from a script of my own to get the stack, then read `openings.ts`. A stranger would be stuck here.
- **A crash leaves half an output.** Every doc is written; the index is not; the next run reports the docs as "unchanged".
- **Excluding a crashing file is the only way past it, and it takes the exact path.** The `exclude` setting works, but the stranger has to find the setting in the getting-started guide; the README's configuration example does not mention that it is the way past a crash.
- **`inspect` paths are case-sensitive and must be exact.** `--from public/Get-DbaDbView.ps1` works, `PUBLIC/get-dbadbview.ps1` does not ("Unable to resolve --from"). A Windows user types paths in any case. A backslash path does work.
- **Questions return nothing for PowerShell.** "What uses `Get-DbaDbView.ps1`?" and "what does it use?" both answer with the file alone. A path from `Get-DbaDbView.ps1` to `Stop-Function.ps1`, which it calls, is "No dependency path found". `--reachable` lists 1,821 entry points: every `.ps1`, private function files included, is called a `program`. `--groups` says "30 files in 11 groups; 1947 files alone".
- **No source file that no adapter reads is called out.** `.SqlDataProvider` (DNN's SQL), `.sqlproj`, `.sln`, `.vb`, `.bat`, `.resx` and `.cshtml`'s model wiring all get an empty doc. Lint warns about files with no links, but generation says nothing.

Where I had to read source code to go on: the SQL crash (`openings.ts`), why `.ascx` never links (`aspnet.ts`), what PowerShell dependencies are drawn (`powershell.ts`'s header), and why a library's `ConfigurationManager` call did not reach `Web.config` (`csharp.dependencies.ts`).

## Measurements

Wall time, processor-seconds (user + system, all processes) and the peak resident memory of the largest single process. Every generation is a first-time write into an empty `.live-documentation` unless noted. The machine was shared, at load 7 to 18, so read processor-seconds beside wall time.

| Corpus | Run | Docs written | Wall s | Processor s | Peak memory | Output |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| dbatools | generate, default flags, run 1 | 1,977 | 37.0 | 38.9 | 877 MB | 15 MB docs, 5.6 MB index |
| dbatools | generate, default flags, run 2 | 1,977 | 37.0 | 38.8 | 878 MB | |
| dbatools | generate, `--liftoff-only`, run 1 | 1,977 | 46.4 | 48.4 | 742 MB | |
| dbatools | generate, `--liftoff-only`, run 2 | 1,977 | 43.1 | 44.6 | 731 MB | |
| dbatools | generate again over existing docs (nothing changed) | 0 | 44.8 | 47.2 | 664 MB | |
| dbatools | first ever run, `--dry-run`, through `npm run` | 0 | 48.4 | 55.0 | **2,658 MB** | |
| dbatools | the same repeated, and with tsx's cache off | 0 | 48.1 / 54.9 | 51.2 / 58.3 | 664 / 834 MB | |
| dbatools | visualize | | 3.5 | 3.9 | 159 MB | 13 MB (4.0 MB data) |
| tSQLt | generate, first run (crashed) | 465 | 16.1 | 18.8 | 343 MB | |
| tSQLt | generate, five files excluded | 461 | 23.3 | 26.6 | 325 MB | 4.6 MB |
| tSQLt | visualize | | 2.4 | 2.0 | 96 MB | 9.7 MB (1.4 MB data) |
| DNN | generate, default flags, through `npm run` | 10,776 | 176.2 | 192.5 | 1,309 MB | 118 MB docs |
| DNN | generate, default flags (direct) | 10,776 | 142.4 | 161.7 | 1,506 MB | |
| DNN | generate, `--liftoff-only` (direct) | 10,776 | 158.1 | 179.9 | 1,412 MB | |
| DNN | visualize | | 11.3 | 15.1 | 468 MB | 46 MB (37.2 MB data) |

**Default against `--liftoff-only` on 1,790 real PowerShell scripts.** Liftoff-only is slower here, not faster: 43–46 s against 37 s of wall time, and 45–48 against 39 processor-seconds. It used about 140 MB less memory (731–742 against 877 MB). The profile of this repository found a 5–11 s wait while V8 optimizes the PowerShell grammar, and halved parsing speed without it. On this corpus the parsing outweighs the wait: with 1,790 scripts, the optimized code pays for its compile several times over. A mend that turns the optimizing tier off for everyone would cost a PowerShell-heavy repository about a fifth more time. On DNN, which has almost no PowerShell but 3,973 C# files on the C# grammar, one run each also went the default's way: 142 s against 158 s, 162 against 180 processor-seconds, with memory 1.5 against 1.4 GB. So the tier pays for itself on any large body of tree-sitter code, not only PowerShell. Something that keeps the tier but stops the main thread waiting on it would be better on both kinds of repository; not tested here.

**Memory against 8 GB.** Every ordinary run stayed between 0.1 and 1.5 GB, the largest for DNN's 10,776 files. That is room to spare. The exception is the very first dry run on dbatools, which peaked at 2.66 GB in the Node process. It did not recur in eight later runs, including one with tsx's transform cache turned off, and I did not find its cause. Treat it as a one-off worth a second look, not a measured cost. At DNN's rate (about 120 KB a file), 50,000 files would come near 6 GB.

**Rates.** About 50 files a second for DNN's mix, which is mostly C# and JavaScript. About 50 for dbatools and 20 for tSQLt, whose fixed start-up cost dominates. Re-running over unchanged docs costs the same as a first run.

## Every crash

| # | Message | Smallest input | Module at fault | Where met |
| --- | --- | --- | --- | --- |
| 1 | `….sql.md: line 7: unexpected evidence on the opening entry "- Entry: opening [`a     "` (variants: `expected "", found "- Entry: opening …\r"`) | Three lines: `CREATE PROC [a'b]` / `'` / `x]` | `stripSql` in `packages/engine/src/live-docs/openings.ts:293`: it blanks comments and `'…'` strings but does not skip a `[bracketed identifier]`, so an apostrophe inside brackets opens a string. The declaration's name then runs to the next `]`, across lines, and the renderer writes it. The reader (`graphFiles.ts:36`, from `generator.ts:292`) refuses it. | tSQLt: `Tests/Run_Methods_Tests.class.sql`, `AnnotationHostPlatformTests`, `AnnotationSkipTestTests`, `AnnotationSqlServerVersionTests`, `AnnotationsTests` (all `.class.sql`). Excluded through `.live-docs.config.json` to go on. |
| 2 | `main.ps1.md: line 25: unexpected dependency line "- [`Lib - Copy (2)`](./Lib - Copy (2).ps1.md)"` | A file named `Lib - Copy (2).ps1` and a script that dot-sources it | The renderer writes a link target with a `)` in it; the reader's link pattern `\(([^)]+)\)` (`document.ts` 421, 631, 653, 672, 682) stops at it | Made here; found by the Windows review below. Not in the three corpora. |
| 3 | `cannot read the configuration at …: Unexpected token '﻿' … is not valid JSON` | A `.live-docs.config.json` that begins with a UTF-8 byte-order mark | `readConfiguration` in `scripts/live-docs/cli.ts:68` parses without stripping the mark (the JSON adapter does strip it) | Made here. Windows PowerShell 5.1's `Set-Content -Encoding UTF8` and `Out-File` write such files. |

Stack of crash 1, from a driver that calls `generateLiveDocs` directly: `graphFiles.ts:36` (the doc parse) ← `readLiveDocGraph` `graphFiles.ts:29` ← `generateLiveDocs` `generator.ts:292`. The CLI prints only the message.

The same scanner fault, without a crash, garbles 46 more tSQLt procedure names (`test MinSqlMajorVersion doesn` followed by a run of spaces and a fragment of the next statement).

## The facts by language

Shares from the derived index. "Isolated" means no link in or out. "Resolved" means a dependency line that names a file in the map, rather than a name kept as written.

| Corpus / kind | Files | No symbols | Links resolved | Isolated |
| --- | ---: | ---: | ---: | ---: |
| dbatools `.ps1` | 1,790 | 46% (the tests, which define no functions) | 1% of 804 (756 are `Pester`) | 99% |
| dbatools `.psm1` / `.psd1` | 3 / 4 | 0% / 75% | 0% / 50% | 0% / 50% |
| dbatools `.sql` | 25 | 72% | 2% of 1,209 | 64% |
| tSQLt `.sql` | 276 | 21% | 66% of 1,129 | 25% |
| tSQLt `.ps1` | 38 | 79% | 47% of 19 | 76% |
| DNN `.cs` | 3,973 | 2% | 95% of 36,558 | 6% |
| DNN `.csproj` | 82 | 0% | 35% of 1,026 (every `ProjectReference` resolved; the rest are framework assemblies and packages, external by design) | 4% |
| DNN `.config` | 52 | 94% (only the three with `appSettings` or `connectionStrings` get symbols) | none | 98% |
| DNN `.aspx` | 13 | 54% | 100% of 19 | 8% |
| DNN `.ascx` | 161 | 12% | none | 100% |
| DNN `.cshtml` | 30 | 70% | none | 100% |
| DNN `.SqlDataProvider` (its SQL) | 299 | 100%, not read | | 100% |
| DNN `.sql` | 12 | 67% | 26% of 38 | 67% |

Whole maps: dbatools 98% of files alone (31 links among 1,977 files); tSQLt 51% alone; DNN 50% alone, mostly images, styles and resources.

### Twenty files of each, by a seeded draw (seed 1119)

**PowerShell (dbatools).**
- **Right:** functions and their comment-based help. 25 functions in the source, 25 symbols in the docs, and Get-DbaDbView's synopsis, description and every parameter came through intact. `Import-Module PSScriptAnalyzer` is kept as a named module.
- **Missing:** every one of the 64 calls from a sampled script to a function another script defines. Examples: `public/Test-DbaReplLatency.ps1` calls `Connect-DbaInstance`, `Get-DbaReplPublication`, `Stop-Function` and five others, and its doc lists no dependencies. Two sampled tests call `Invoke-DbaQuery` with SQL text, and that SQL is not read.
- **Wrong:** every function file in `public/` and `private/` is marked `Entry: program`, though the module dot-sources them and nothing runs them directly. Over the whole corpus, 17 files' symbols differ from a line-by-line reading. In two (`Install-DbaInstance.ps1`, `Find-DbaInstance.ps1`) a parse error swallowed the file's own public function, so the doc has no symbol for it. In others a mocked function defined several times becomes `Connect-DbaInstance (function overload 1)`, `(… 2)` and so on.

**SQL (tSQLt).**
- **Right:** every procedure, function, view and table created at top level is a symbol. A procedure's `EXEC` of another procedure resolves in 23 of 28 cases in the sample, and `FROM`/`JOIN` tables are drawn.
- **Missing:**
  - Scalar function calls in an expression are not read. `tSQLt.Private_DisallowOverwritingNonTestSchema` calls `tSQLt.Private_IsTestClass(@ClassName)` in an `IF`, and its doc lists nothing.
  - Objects created inside `EXEC('CREATE PROCEDURE …')` are invisible, so `tSQLt.AssertStringIn`, created that way, is "unresolved" for its tests. That is reasonable, but it is not said anywhere.
- **Wrong:**
  - **Line numbers are wrong after any comment or string that spans lines**: 827 of 1,620 SQL symbols point at the wrong line. `stripSql` blanks such text with spaces, newlines included, and `lineOf` then counts newlines in the blanked text. Smallest input: `/*`, ` licence`, `*/`, `CREATE TABLE dbo.T (a int);`. The doc says `#L2`; the truth is line 4.
  - System catalog names (`sys.objects`, `sys.columns`, `master.sys.sp_executesql`) are kept as contracts: doors to "outside" on every script.
  - Type names and CTE names come through as dependencies: `BIGINT`, `INT`, `behavior`, and dbatools' `Waits` and `AggregateBufferPoolUsage`.

**C# (DNN).**
- **Right:**
  - Types: 24 of 25 declared types are symbols.
  - Links: of 71 links to `.cs` files, 65 go to a file declaring a type the source names. The other six are explainable: an attribute named without its `Attribute` suffix, a base class. Of 77 types the sample names that exactly one workspace file declares, 57 are linked; most of the rest are namespace segments my rough reading mistook for types.
  - Partial classes: the two halves of a `partial` class in ordinary files are both linked from a caller.
  - Inline SQL: `SELECT … FROM dbo.Orders` in a `SqlCommand` string reaches the table's script.
- **Missing:**
  - Designer and code-behind halves: 129 of 134 pairs are not linked to each other.
  - A procedure named in `new SqlCommand("dbo.usp_GetCustomer", connection)` with `CommandType.StoredProcedure` is not linked to the procedure (shown in the made-up shop; DNN calls its procedures through a provider).
  - `ConfigurationManager.ConnectionStrings["ShopDb"]` and `AppSettings["AuditMode"]` in a class library are not linked to the web project's `Web.config`. The lookup only climbs the library's own folders for a file named exactly `Web.config`/`App.config`, and in .NET Framework a library reads its host's configuration.
- **Wrong:** none found in the sample.

**Config and project files (DNN; 20 drawn from the 134 `.config` and `.csproj` together).**
- **Right:** every one of the 48 `ProjectReference`s in the 13 sampled project files links to its project, in classic and SDK-style files alike. Each project's one symbol says what it builds (`library`, `web`). `Tests/App.config` gives 16 symbols for its 14 settings and 3 connection strings, and it is linked from the integration tests that read it.
- **Missing:**
  - Six of the seven other sampled `.config` files hold no `appSettings` or `connectionStrings`, so their docs are empty: log4net and URL-rewrite configuration, DNN's install-step configs, `Install/Web.config`. That is honest but tells the reader nothing.
  - The `Compile Include` lists of classic projects are deliberately not read ("a system is a folder"). So a project does not say which `.cs` files are its own, and a file left out of the build looks the same as one in it.
- **Wrong:** none found.

### Which connections the map draws, with an example of each

| Connection | Drawn? | Example |
| --- | --- | --- |
| PowerShell dot-source with a written path, backslashes included | Yes | `. "$PSScriptRoot\Common.ps1"` in the shop's `Deploy.ps1` links to `Common.ps1` (on Linux) |
| `Import-Module <path>` | Yes | `Deploy.ps1` → `Modules/ShopTools.psm1` |
| `Import-Module <name>` | Kept as a name | `PSScriptAnalyzer` in `Invoke-DbatoolsFormatter.ps1` |
| Dot-source in a loop (`. $file.FullName`) | No | `dbatools.psm1`, which loads every function |
| A function called across scripts | No | `Get-DbaDbView.ps1` → `Stop-Function.ps1` |
| A manifest's `FunctionsToExport` → the files defining them | No | `dbatools.psd1` names about 700 functions; it links only to `dbatools.psm1` |
| `Invoke-Sqlcmd -Query "EXEC …"` / `-InputFile` | No | `Deploy.ps1` → `dbo.usp_GetCustomer`, `dbo.usp_LogRead.sql` |
| C# project reference | Yes | `Shop.Web.csproj` → `Shop.Data.csproj`; every DNN `ProjectReference` |
| `.sln` → projects | No | `Shop.sln` and DNN's five `.sln` files have empty docs |
| C# `partial` class across files | Partly | callers link both halves; the halves do not link each other, designer files included |
| `.aspx` → code-behind | Yes | `Default.aspx` → `Default.aspx.cs`; 12 of DNN's 13 |
| `.ascx` → code-behind | No | `aspnet.ts:10` matches only `<%@ Page`, never `<%@ Control`; all 161 DNN user controls |
| `<%@ Register Src="~/x.ascx" %>` | No | `Default.aspx` → `CustomerCard.ascx` |
| WCF client endpoint in config | Yes, as a symbol and an address | `PricingService` in the shop's `Web.config` |
| Connection string / app setting in config | Symbol only | `ShopDb`, `AuditMode`; nothing in a library links to them |
| C# inline SQL naming a table | Yes | `CustomerRepository.cs` → `dbo.Orders.sql` |
| C# naming a stored procedure | No | `new SqlCommand("dbo.usp_GetCustomer", …)` |
| SQL procedure `EXEC` procedure | Yes | `dbo.usp_GetCustomer.sql` → `dbo.usp_LogRead.sql`; tSQLt's tests → `tSQLt.NewTestClass` (82 times) |
| SQL naming a table (`FROM`, `JOIN`, `INSERT INTO`, `UPDATE`) | Yes | `usp_GetCustomer` → `dbo.Customer.sql`; an unknown table kept by name (`dbo.ReadLog`) |
| SQL calling a scalar function in an expression | No | `dbo.fn_OrderCount(c.Id)`; `tSQLt.Private_IsTestClass(...)` |
| SQL in DNN's `.SqlDataProvider` form, `.sqlproj` projects | No | 299 DNN scripts, 13 tSQLt project files |

## Windows

**Tested here, on Linux, by imitation:**
- **Works:** UTF-16 LE PowerShell with a byte-order mark and CRLF endings is read correctly (symbols and dot-sources), and so is UTF-8-with-BOM PowerShell with CRLF. A backslash path in a dot-source resolves. A backslash path given to `inspect --from` works.
- **UTF-16 SQL and C# files:** they produce no symbols and no warning. SSMS's Generate Scripts and older Visual Studio templates write UTF-16.
- **Live Docs with CRLF endings**, which is what Git for Windows' default `core.autocrlf=true` gives anyone who checks them out:
  - `inspect` and `visualize` fail on the first doc;
  - `generate --check` reports all 22 docs changed;
  - `generate` rewrites them all to LF, keeping the authored Purpose.

  On the machine that generated them nothing goes wrong, because the generator writes LF.
- **Configuration:** a configuration file with a byte-order mark stops every command (crash 3).
- **File names:** a file name with a parenthesis stops generation (crash 2).

**Not tested, because this is Linux:** a real Windows run end to end; `cmd.exe` under `npm run`; NTFS's case-insensitivity; drive letters; paths over 260 characters; antivirus holding files; git's behaviour there (ownership checks on shares, git missing from PATH); memory and time on an 8 GB laptop; Windows PowerShell 5.1's own parser as an oracle for the grammar errors below.

**Suspected from the code.** These come from a read-only review by one subagent of my tier (general-purpose, code review only) and were checked against the code where marked:
1. **Case-insensitive lookups keep the asked-for spelling.** On NTFS, a probe for `Web.config` succeeds against a file named `web.config`, and the probe's spelling becomes the dependency. The graph then matches names case-sensitively, so the link is lost. This would make Windows worse than Linux, where the second probe matches. The same pattern appears in `ProjectReference` resolution and code-behind lookup (`csharp.dependencies.ts:25, 165–173`, `project.ts:89–97`, `aspnet.ts:122–145`). The PowerShell adapter already folds case correctly.
2. **When git fails, ignore rules quietly degrade.** `gitIgnored.ts` returns nothing on any git error: "dubious ownership" on a network share or under an elevated shell, or git not on PATH. Discovery then honours only the root `.gitignore`, and `bin/`, `obj/`, `.vs/` and `packages/` can each get a doc for every file, with no warning.
3. **`exclude` is case-sensitive while discovery is not.** `exclude: ["Vendor/**"]` misses `vendor/` (`archetype.ts:174–187`).
4. **The output nests the whole source tree.** Each doc path is the source path plus about 30 characters (`.live-documentation\source\` and `.md`). Node writes such paths, but `git add` without `core.longpaths` and Visual Studio may not.
5. **Windows and Linux runs can write different docs.** Discovery sorts absolute paths byte-wise, and `\` sorts differently from `/`, so a tie between same-named types can resolve to different files on each.
6. **Files saved in Windows-1252 (ANSI)** with non-ASCII characters are read as UTF-8 everywhere except PowerShell, so names and help get replacement characters with no warning.

**Windows PowerShell idioms the grammar does not parse.** 116 of 1,836 PowerShell files across the corpora (6%) have a parse error. Each of these one-liners fails on its own:
- `$a = $b * 1MB` (numeric multipliers `KB`/`MB`/`GB`)
- `if ($a -cnotin $b) {}` (also `-cin`)
- `:main foreach ($a in $b) { continue main }`
- `switch ($t) { "A B" { 1 } }`: a double-quoted label with a space; `'A B'` and `"AB"` pass
- `switch -regex ($t) { "^(A|B)$" { 1 } }`
- `$v = switch ($x) { -1 { $false } default { $true } }`
- `$a = [Outer+Inner]::Value`
- `Add-Member -Name T -Value $o.GetType().Name`: a method call then a member, as a command argument
- `Select-Object A, B , C`: a space before a comma
- a backtick line continuation inside a method call's parentheses, `$o.Script([Opts]::A` then a backtick, a new line, and `-bor [Opts]::B)`

Most errors cost only part of a file. In two dbatools files they cost its one public function. `Configuration` (DSC) blocks are not read as symbols; `workflow` is.

## What I did not get to

- The browser: what the Explorer shows was judged from the exported data and the CLI only.
- A run on Windows, and the 8 GB laptop itself.
- The cause of the one 2.66 GB peak.
- Where generation's time goes on these corpora, phase by phase. The comparison above is whole runs.
- `--no-wasm-tier-up`, or any way to keep the optimizing tier without the main thread waiting.
- A full twenty-file reading of tSQLt's PowerShell, and of DNN's JavaScript and markup beyond the counts.
- `live-docs:history` on any corpus.
- Old-style (pre-SDK) `.csproj` at scale: DNN mixes both, and the shop has two classic ones; both forms resolved their references.

The scripts that measured and sampled are in the builder's scratch folder and were not kept. The measuring wrapper recorded processor time and peak memory from the operating system's own accounting of child processes, since `/usr/bin/time` is not installed here.

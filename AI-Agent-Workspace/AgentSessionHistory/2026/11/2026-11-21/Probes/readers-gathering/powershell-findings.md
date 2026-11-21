# The PowerShell reader's review findings, mended

Historical evidence, written on November 21, 2026 by a builder for the root, on the branch where the three readers are joined (from `cdbf98aa9`). An independent reviewer found four faults in how the PowerShell reader resolves names and in its grader, and one more was found since; this records, for each, the case, what PowerShell itself said and by what command, the test red then green, and the four corpora before and after. The corpora are those of [the joining's account](README.md), read from the first builder's scratch copies at the commits named there; nothing of a corpus is committed.

## The corpora, before and after

Each figure is the parser's / the adapter's / both, as [the account's table](README.md#powershell-against-powershells-own-parser) gives them (the brief that ordered this work wrote them as "ours/oracle/both", in the same order of numbers). `npm run oracle:powershell -- <folder> --json`, and for the later rows the same comparison over the parser's record kept from the first run.

| Corpus | Wires | Calls | Programs agree / differ |
| --- | --- | --- | --- |
| dbatools | 7,479 / 7,478 / 7,478 | 6,630 / 6,629 / 6,629 | 1,792 / 1 |
| AL-Go | 493 / 492 / 492 | 1,042 / 1,041 / 1,041 | 198 / 0 |
| AzureStack-Tools | 13 / 15 / 13 | 29 / 29 / 29 | 37 / 0 |
| tSQLt | 39 / 34 / 34 | 34 / 34 / 34 | 39 / 0 |

These are the figures at `cdbf98aa9`, and they are the figures after every item below, each run on its own: no wire, call or program of the four corpora moved, and the lists of disagreements are the same lists. Of the reader's notices, two are gone, both on dbatools, by item D; no other notice of the four corpora changed (22, 74, 2 and 3 loads whose path the text does not fix; 6 then 4, 2, 1 and 2 loads whose path no file holds).

## E. What makes a file a test, confined to PowerShell

The folder rule read only the file's folders and a name rule `^tests?\.` had been added, for every language, on evidence that was PowerShell's alone (`Test-DbaPath.ps1`, where `Test` is a verb). Now a `.ps1`, `.psm1` or `.psd1` keeps those rules (Pester's name, folders only) and every other file is read as on `a5d29b90f`: the whole path against the test-folder pattern, which already takes `test.js` and `tests.py`, so the added line is gone.

- Test: a table in `packages/engine/src/live-docs/archetype.test.ts`. Red on the branch's rule: 5 failed, `src/test-utils.tsx`, `src/test-helpers.ts`, `lib/test-setup.js`, `src/Test-Thing.cs` and `Source/tSQLt.Tests.view.sql` implementation where the old rule says test. Green: 55 of 55.
- The branch had asserted `Source/tSQLt.Tests.view.sql` implementation ("tSQLt's own view of the tests it holds is part of the framework"); by this ruling it is a test again, as on `a5d29b90f`. Whether it ought to be is the same unmeasured question as `test-utils.tsx`.
- This repository: of its 1,262 tracked files outside `.mdmd/` and `AI-Agent-Workspace/`, none changes archetype under the branch's rule or under the mend. Over all 8,812 tracked files the branch's rule had changed 248, from test to implementation: 213 under `.mdmd/` (the Live Docs themselves, such as `*.test.ts.mdmd.md`) and 35 under `AI-Agent-Workspace/`, neither of which the generator documents as source (the one is the docs' root, the other excluded by the configuration); the mend gives all 248 their old answer. Counted by setting the three rules (`a5d29b90f`'s, the branch's, the mend's) side by side over `git ls-files` with this repository's configuration.

## C. A module named through a variable the file fixes

`run.ps1` = `$m = 'Pester'` then `Import-Module $m`. PowerShell, `pwsh -NoProfile -NonInteractive -File run.ps1` on a machine without Pester: "The specified module 'Pester' was not loaded because no valid module file was found in any module directory." The reader said "dot-sources and imports whose path the text does not fix…: line 2: Import-Module $m" and kept nothing; now it keeps `Pester` and says nothing. Red: the test "keeps a module named through a variable…" failed (a notice where none was expected); green with the mend. The four corpora hold no such import.

## D. A command qualified by its module

`Module\Command` was taken for a script's path. PowerShell 7.7.0, `pwsh -NoProfile -NonInteractive -File run.ps1` and `run2.ps1` from a folder holding `Microsoft.PowerShell.Utility/New-Object.ps1`, `lib/Helpers.ps1` and a module `MyModule/MyModule.psm1` defining `Get-Mine`:

1. `Microsoft.PowerShell.Utility\New-Object -TypeName System.Text.StringBuilder` gave a StringBuilder: the shipped cmdlet, though a script of that path exists; and again after a function `New-Object` was defined, which a plain `New-Object` then ran.
2. `TabExpansionPlusPlus\Register-ArgumentCompleter`: `CouldNotAutoLoadModule`, a module's command, not a path.
3. `MyModule\Get-Mine`: `CouldNotAutoLoadModule` until the module was on the module path or imported by its path, then "the module function MyModule\Get-Mine ran"; `MyModule\Get-Other`, a function defined in the script, `CommandNotFoundException`.
4. `lib/Helpers` ran `lib/Helpers.ps1`, its extension unwritten. On Linux a backslash separates no folders, so pwsh here read `lib\Helpers` and `lib\Helpers.ps1` as modules' commands (`CouldNotAutoLoadModule`); on Windows, where it does, they are paths. No Windows is here to show which wins where both readings exist.

The mend: a name written `Module\Command` is PowerShell's own command when the module is one PowerShell ships (the modules the lists of commands were read from), and no load; otherwise a script's path only where the workspace holds `Module/Command` or `Module/Command.ps1` from the file's folder, as Windows would run it; else neither a load nor a notice. Red: the test "takes a command qualified by its module…" failed with three notices; green. On dbatools the two notices `TabExpansionPlusPlus\Register-ArgumentCompleter` (in `private/functions/tabcompletion/Register-DbaTeppArgumentCompleter.ps1`) and `Microsoft.PowerShell.Utility\New-Object` (in `tests/Copy-DbaPolicyManagement.Tests.ps1`) are gone, and they are the only module-qualified names in the four corpora.

Not decided: a call qualified by a workspace module's name (point 3) is not wired. pwsh says it reaches only that module's function, once the module is loaded or findable by name; the corpora hold none, so nothing measures a rule for it.

## A. PowerShell's functions without a module, and its aliases

`lib/Helpers.ps1` = `function Pause { Read-Host 'Press Enter' | Out-Null }` and `function Invoke-Thing { }`; `run.ps1` = `Write-Host 'Building'`, `Pause`, `Invoke-Thing`, loading nothing. PowerShell 7.7.0, `pwsh -NoProfile -NonInteractive -File run.ps1`: `Get-Command Pause` is "Function source='' file=''", PowerShell's own; from `loads.ps1`, which dot-sources the helper, it is the helper's (`file='…/lib/Helpers.ps1'`). The reader had drawn `run.ps1 → lib/Helpers.ps1` for `Pause`.

The alias ruling, asked of pwsh on a three-line case: `lib.ps1` defines `select` and `Get-ChildItem`; `run.ps1` dot-sources it and runs `'x' | select` and `gci`. pwsh printed `x`, Select-Object answering ahead of the loaded function `select`, as ruled; and "the workspace's Get-ChildItem" for `gci`: an alias names a command, and a loaded function of that command's name answers it. So pwsh refines the ruling, and the reader follows pwsh: a call by an alias is a call to the command the alias names, never to a function of the alias's own name, and to a function of the named command's name only when the caller loads it, as for any shipped command.

The list (`packages/engine/src/live-docs/adapters/powershell.builtins.ts`) is the union of both editions:

- PowerShell 7: `scripts/oracle/powershell-shipped.ps1`, new, run as `pwsh -NoProfile -NonInteractive -File`, on PowerShell 7.7.0 on Debian 13: 288 commands (the list already committed, reproduced exactly), 10 functions without a module (`cd..`, `cd\`, `cd~`, `Clear-Host`, `exec`, `help`, `oss`, `Pause`, `prompt`, `TabExpansion2`) and 108 aliases.
- Windows PowerShell 5.1: Microsoft's reference, MicrosoftDocs/PowerShell-Docs at `aedd8efe1fece22f04e478c2521c3fccc17ab03d` (the commit the 5.1 commands were taken from), fetched anonymously and read as text by a subagent of the builder's tier (general-purpose). 38 functions from `reference/5.1/Microsoft.PowerShell.Core/About/about_Built-in_Functions.md` ("not included in any module"): `cd..`, `cd\`, `pause`, `Get-Verb`, `help`, `ImportSystemModules`, `prompt`, `more`, `Clear-Host`, `TabExpansion2`, `oss`, `mkdir` and `A:` to `Z:`. 186 aliases, from every command page's front matter and NOTES under `reference/5.1/<Module>/`, with `man` and `md` from `about_Built-in_Functions.md` and `ise` from `Starting-Windows-PowerShell.md`. Of them, the 28 of CimCmdlets, LocalAccounts and PSWorkflow are counted shipped commands rather than aliases: those modules export them, so they answer once the module loads (the subagent's belief, stated as such; the documentation does not say which aliases exist at start). No alias names two commands across the editions. Every name, with the file and line of the documentation it rests on and its standing in the 7.5 reference, is kept in [powershell-51-names.json](powershell-51-names.json).

Red: "treat a function PowerShell defines without a module as shipped…" and "read a call by one of PowerShell's aliases…" failed (`Pause`, `mkdir` and `ImportSystemModules` wired; `select` wired and `gci` not); green with the mend. On the four corpora nothing moved.

## B. The grader's independence

`scripts/oracle/powershell-wires.ts` took the shipped names from the reader's own module, so the reader's list was graded by nothing. Now the grader asks the pwsh it runs (`powershell-shipped.ps1`, clean session) and reads a committed record with the names kept in `scripts/oracle/powershell-shipped.json`, which that script wrote. Its header, its Live Doc and the PowerShell grader's paragraph of internal tooling now say what it measures (the reader's reading of the facts, and its list of PowerShell's own names) and what it cannot: the rule itself, which both sides hold; which files are tests, which both take from `resolveArchetype`; and the names only Windows PowerShell 5.1 answers, which pwsh 7 on Linux lacks. Test: `scripts/oracle/powershell-compare.test.ts` reads the fixture's record with pwsh's recorded names, then with one name more as a function and as an alias, and the call wired by "else unique" goes; before, the grader took no names and the test could not be written. On the four corpora, with pwsh 7.7.0's own names, the figures are those above: no corpus call depends on a name only 5.1 has.

The rule itself: the hand reading of 222 wires of 2026-11-19 is committed as a markdown table, [samples.md](../../../2026-11-19/Probes/powershell-wires/samples.md), one row per wire (corpus, calling file and line, name, defining file and line, the rules that drew it, two verdicts), which a test can load. What a test the rule can fail needs, and this round did not build: the parser's facts of the sampled corpora (dbatools, AL-Go, AzureStack-Tools, tSQLt at their commits; the shop was never committed, so its rows cannot be scored), with which a reading of the rule can be set against each T and F verdict. A gate test cannot fetch them; either a grader mode run by hand over the fetched corpora (`--verdicts samples.md`), or a committed extract of the sampled files' facts, which would be the first thing of a corpus committed.

## The gate

`npm run safe:commit` at `f23fdd1bf`: the Live Docs pipeline passed; lint and build passed; unit tests 3,016 of 3,016 (222 files); integration 475 of 477. Both failures were `tests/integration/live-docs/repository-entries.test.ts`, the hand's reading of this repository's entries, which the new grader files change: `scripts/oracle/powershell-shipped.json` was reached by nothing, since the grader read it by its path, and is now imported, so the walk reaches it; and `scripts/oracle/powershell-shipped.ps1` is a program, as `powershell-ast.ps1` is, which the hand's reading in `tests/integration/live-docs/expected/repository-entries.json` does not yet name. That file is not this round's to change; its entry is the one failure left. The gate stops at the first failing stage, so the three SlopCop audits were run alone afterwards: no broken link, asset reference or symbol.

The line was then added at the root's word, the reading of the script being the root's (`5171687ae`), and the test passes.

## The path machinery, read with a reviewer's eye

Read in the first round, and both mended in the second, below.

- `resolvePath` takes no extension for a script run by a path written without one: `scripts/build` runs `scripts/build.ps1` (pwsh: `lib/Helpers` ran `lib/Helpers.ps1`), and is said as a load no file holds. Item D tries `.ps1` only for a name written `Module\Command`.
- `listLoads` reads each command of a loop's body once per name, but `fixedLoads` returns an import only for a module's path (`isModulePath`): `foreach ($m in 'A','B') { Import-Module $m }` keeps neither name, and its command is said as a notice, since a loop's command is spared the notice only when it gave a load. Item C reads a name through a variable assigned once, not through a loop's item.

## The second round, at the root's word

The root accepted the five items and asked for four more, three of them from the findings above. Figures are again the parser's / the adapter's / both; the round began at `eddb8116b`, whose figures on the four corpora are the table above, and whose notices are 22 and 4 on dbatools, 74 and 2 on AL-Go, 2 and 1 on AzureStack-Tools, 3 and 2 on tSQLt (paths not fixed; paths no file holds).

### 1. The program that lists PowerShell's own names

`scripts/oracle/powershell-shipped.ps1` named a program in `tests/integration/live-docs/expected/repository-entries.json`, the reading the root's (`5171687ae`).

### 2. A path written without its extension

PowerShell's answers, pwsh 7.7.0, `pwsh -NoProfile -NonInteractive -File run.ps1` run beside folders made for it:

| What was run | What stood | pwsh |
| --- | --- | --- |
| `a/build`, `& a/build`, `& "$PSScriptRoot/a/build"`, `./a/build` | `a/build.ps1` | "a/build.ps1 ran" each time |
| `. a/build` | `a/build.ps1` | "a/build.ps1 ran" |
| `b/build` | `b/build` (not executable) and `b/build.ps1` | `NativeCommandFailed`; `Get-Command b/build` is `b/build`: the file so named wins |
| `c/build` | `c/build` (executable) and `c/build.ps1` | "c/build (no extension, executable) ran" |
| `d/build` | only `d/build.psm1` | `CommandNotFoundException`: no other extension is tried |
| `e/build.ps1` | `e/build.ps1` and `e/build.ps1.ps1` | "e/build.ps1 ran" |
| `f/build.local`, `f/Get-Thing.Tests`, `. f/Get-Thing.Tests` | `f/build.local.ps1`, `f/Get-Thing.Tests.ps1` | each ran its `.ps1`: added whatever the name ends in |
| `. Stop-It`, `& Stop-It`, from `g/Use.ps1` | `g/Stop-It.ps1` beside it | `CommandNotFoundException`: a name without a folder is a command, not a script beside the file |
| `A/BUILD` | `a/build.ps1` | `CommandNotFoundException` on Linux, which tells case apart; Windows does not, and the reader reads as Windows |

The rule, for a script dot-sourced or run by a path: the file so named, else the path with `.ps1` added; for a path only, never for a name without a folder. The first reading of it took no account of the last row, and on dbatools resolved `. Stop-Function` in `private/functions/flowcontrol/Test-ElevationRequirement.ps1` to the `Stop-Function.ps1` beside it; pwsh's answer for `. Stop-It` corrected it before anything was committed. Test: "read a script run or dot-sourced by a path without its extension…", red (`a/build` and `. "$PSScriptRoot/a/build"` unresolved, said as loads no file holds) then green. The grader's record (`powershell-ast.ps1`, `Resolve-FixtureFile -Script`) reads paths by the same answers, since it stands for what PowerShell would find.

The corpora: with the reader mended and the grader's record as it was, every figure, notice and dependency is as before: none of the four corpora runs or dot-sources a path written without its extension. So no wire was added, and there are none to judge. With the grader's record written again by the mended script, every figure, disagreement and verdict is the same again.

### 3. A loop over written-out names

pwsh, `-File run.ps1` over `foreach ($m in 'Alpha.Missing', 'Beta.Missing') { Import-Module $m }` and `'Gamma.Missing' | ForEach-Object { Import-Module -Name $_ }`: "The specified module 'Alpha.Missing' was not loaded …", then 'Beta.Missing', then 'Gamma.Missing'. Bounded to a loop variable over strings the text writes out (a list in place, or a variable assigned one once); a collection a run computes stays a notice. Test: "keeps each module a loop over written-out names imports…", red (no dependency, three notices) then green (three names, one notice, for the loop over `Get-Content`).

The corpora: one file changes. `HCI/AsHciADArtifactsPreCreationTool.psm1` of AzureStack-Tools assigns `$modules = @('ActiveDirectory','GroupPolicy','Kds')` and imports each in a `foreach`: it now names the three modules, true by the text, and its notice is gone (AzureStack-Tools' notices of paths not fixed, 2 to 1). No wire, call or program moves, since a module named rather than pathed is no file of the workspace.

### 4. The hand reading as a command

`npm run oracle:powershell -- <folder> --verdicts AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md --corpus <name>`, with `scripts/oracle/powershell-verdicts.ts` reading the table and scoring it, and its test holding the reading to the table's own counts (222 rows: dbatools 111, AL-Go 88, AzureStack-Tools 15, tSQLt 7, the shop 1; 137 true, 81 false, 4 arguable; the two readers agree on every row). On the four corpora at their commits, with the second round's reader:

| Corpus | Rows scored | The rule: true drawn / missed; false spared / drawn; arguable drawn / not | The adapter: the same |
| --- | --- | --- | --- |
| dbatools | 111 of 111 | 66 / 2; 43 / 0; 0 / 0 | 66 / 2; 43 / 0; 0 / 0 |
| AL-Go | 88 of 88 | 48 / 4; 32 / 0; 2 / 2 | 47 / 5; 32 / 0; 2 / 2 |
| AzureStack-Tools | 15 of 15 | 9 / 0; 6 / 0; 0 / 0 | 9 / 0; 6 / 0; 0 / 0 |
| tSQLt | 7 of 7 | 7 / 0; 0 / 0; 0 / 0 | 7 / 0; 0 / 0; 0 / 0 |
| the shop | 0 of 1 | never scorable: its corpus was never committed (row 215) | |

No false wire of the 81 is drawn, by the rule or the adapter. The true wires not drawn, each a wire missing where the rule errs toward missing:

- dbatools 105 and 107: `.github/runners/tests/fleet-controller.Tests.ps1` calls `Get-FleetState` and `Get-RunnerDemand` of `FleetCore.psm1`, which it imports through `$script:ControllerRoot`, a path the text does not fix, and `Get-FleetState` is defined in a second file too.
- AL-Go 50, 53, 55 and 71: calls to `OutputWarning` and `OutputError`, each defined both in `Actions/.Modules/DebugLogHelper.psm1` and `Actions/Troubleshooting/Troubleshooting.ps1`, from files whose own text loads neither; the hand found the one each run reaches by how the actions are run.
- AL-Go 60, the adapter alone: `CommentPublishing.ps1`'s call to `Test-GlobMatch`, the record's known miss, through a load in a file the grammar reads with an error.

What a committed extract would hold, for the gate to run this without the corpora: for every PowerShell file of each of the four corpora at its commit, its path, the names of the functions it defines at its own level, the names of the commands it calls, the files its loads resolve to, and whether it reads as a test; no line of code. Their licences: dbatools, MIT (Copyright (c) 2018 Chrissy LeMaire, `license`); AL-Go, MIT (Copyright (c) Microsoft Corporation, `LICENSE`); AzureStack-Tools, MIT (Copyright (c) 2016 Microsoft, `LICENSE.txt`, with `ThirdPartyNotices.txt` and `third-party-license.txt` beside it); tSQLt, Apache 2.0 (`Build/License.txt`). The MIT licence asks that its notice go with "all copies or substantial portions"; Apache 2.0 that a redistribution carry the licence and keep the notices. An extract of names and paths would carry each corpus's notice beside it either way. Whether to commit it waits for the owner.

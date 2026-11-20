# Which file a PowerShell call reaches: candidate rules, measured

Current as of November 19, 2026. A builder measured this for the root at `2114bff6`, before building anything. Nothing under `packages/` changed. The question came from [the cold run](../cold-run/README.md): of dbatools' 1,977 files, 1,947 had no connection at all, because the map connects PowerShell scripts only where a load writes a path out.

**Answer.** One rule is plainly right on these corpora. I call it **R, "loaded, else unique"**:
1. Only a definition at a file's own level counts. A function inside another function, or inside a script block such as Pester's `Describe`, `BeforeAll` or `InModuleScope`, is local to that scope; no other file can call it.
2. A call to a name that the caller's own file defines reaches that definition, so it draws no wire.
3. Otherwise, if what the caller loads includes exactly one file defining the name, the wire goes there. "What the caller loads" means its dot-sources, imports and `using module`, followed, plus its module's files and their loads. If several loaded files define it, no wire is drawn.
4. If none of the defining files is loaded, the wire goes to the one file in the workspace that defines the name; if there are several, no wire is drawn.

**Results for R.**
- In a seeded sample of 60 of its wires, all 60 are true.
- The 13 wires it adds over rule A, which ignores loading, are all true.
- Over the five corpora it connects 17,072 + 2,763 + 59 + 360 + 6 calls.
- Files with no wire fall from 1,780 to 132 in dbatools, from 198 to 12 in AL-Go and from 29 to 18 in tSQLt. Those counts include the loads it also reads; see [Loading](#loading-by-join-path-by-variable-by-loop-and-by-running-a-script).

**What goes wrong in the other rules, and what removes it.** Every false wire in every rule has one cause: the rule picks a definition the caller never loads.
- A test's stub of a cmdlet, written inside a `Describe` block.
- A sibling script's private copy of a helper.
- A sibling module's copy of a function.

Two parts of R remove them: counting only file-level definitions, and choosing by what the caller loads.

**Forks for the root:**
- R or A.
- Whether to read loads written with `Join-Path`.
- Whether to block names PowerShell ships.
- The library rule for entries.
- What a manifest's `FunctionsToExport` should mean.

They are listed at the end with numbers and a recommendation for each.

Every judged wire, with both judges' verdicts, is in [samples.md](samples.md).

## What was measured

| Corpus | Shape | Source | Commit (shallow) | PowerShell files |
| --- | --- | --- | --- | ---: |
| dbatools | One large module: a `.psm1` that dot-sources ~890 function files in loops; 774 Pester tests; CI scripts | https://github.com/dataplat/dbatools (from the cold run) | `067b215b` | 1,797 (1,790 `.ps1`, 3 `.psm1`, 4 `.psd1`) |
| AL-Go | A pile of GitHub Action scripts that dot-source one helper and import small modules, all by `Join-Path $PSScriptRoot ...`; scripts that call scripts; Pester tests | https://github.com/microsoft/AL-Go | `403f36ab` | 198 (172 `.ps1`, 26 `.psm1`) |
| AzureStack-Tools | Many small modules in one repository, several defining the same helper names; Windows PowerShell 5.1 | https://github.com/Azure/AzureStack-Tools | `0e4a9f32` | 42 (19 `.ps1`, 18 `.psm1`, 5 `.psd1`) |
| tSQLt | Build scripts that run each other by path (`& ./tSQLt_Build.ps1`) and `using module` one common module | https://github.com/tSQLt-org/tSQLt (from the cold run) | `4a921d0d` | 39 (38 `.ps1`, 1 `.psm1`) |
| shop | The cold run's hand-made owner-shaped project | made here | n/a | 6 |

dbatools alone would have biased the result: it is one module whose functions all have distinct names. AL-Go is the nearest to a pile of deployment scripts. AzureStack-Tools is the case where names collide. Both are anonymous shallow clones. The corpora are read-only copies in the builder's scratch folder.

**Ground truth for names and positions** is PowerShell's own parser, PowerShell 7.7.0 through `pwsh`. The repository's oracle emitter, [`scripts/oracle/powershell-ast.ps1`](../../../../../../../scripts/oracle/powershell-ast.ps1), was extended in the worktree to record four more things. That extension is uncommitted until the build round:
- **Every command:** the name it is called by, its invocation operator, the file its name resolves to when the name is a path written out, the function it stands in, and the commands whose script blocks enclose it.
- **Every function:** whether it is defined at the file's own level, and its `[Alias()]` names.
- **`Set-Alias` and `New-Alias`:** their names and values, when written out.
- **The file's own-level statements**, each by kind.

Which definition a name reaches at run time is not the parser's to say. That came from reading the source.

**What the existing oracle grades today.** [`powershell-oracle.test.ts`](../../../../../../../tests/integration/live-docs/powershell-oracle.test.ts) holds the adapter to the parser's record of the two fixtures (`programs/powershell/rollout`, `fixtures/powershell-compendium`) on these points:
- the published functions, classes and enums, by name, line and column;
- the functions' help;
- the dependencies, by specifier and resolved file: dot-sources, `Import-Module`, `using module` and `#requires`, each only where a path is written out as a string or a `$PSScriptRoot` string;
- the manifests: whether the file is one, its package symbol, its loads and its declared root module.

It does not grade calls between files, `Join-Path` or loop loads, scripts run by path, or `FunctionsToExport`. Its "program" check restates the extension rule (`file.endsWith(".ps1")`) rather than asking the parser.

## Where the called names are defined

Every command the parser found, by where its name is defined. A function's name is compared without case and without a `script:` or `global:` prefix. Dot-sources of files are left out here; the map already draws those when the path is written out.

| Calls | dbatools | AL-Go | AzureStack | tSQLt | shop |
| --- | ---: | ---: | ---: | ---: | ---: |
| by a name written out | 60,765 | 18,371 | 3,656 | 1,262 | 24 |
| defined nowhere in the workspace | 36,040 | 14,668 | 2,910 | 872 | 18 |
| defined in the caller's own file only | 1,062 | 827 | 424 | 19 | 0 |
| defined in the caller's own file and elsewhere | 290 | 24 | 263 | 11 | 0 |
| defined elsewhere, but only inside a function or block | 6,285 | 13 | 0 | 0 | 0 |
| **defined at file level in exactly one other file** | **17,072** | **2,718** | **55** | **360** | **6** |
| defined at file level in several other files | 16 | 121 | 4 | 0 | 0 |
| by a path written out, resolving to a file (a script run by path) | 1 | 0 | 0 | 32 | 0 |
| by a value only a run knows (`& $command`) | 233 | 146 | 3 | 9 | 0 |
| module-qualified (`Module\Name`) | 2 | 0 | 0 | 0 | 0 |

**Names defined nowhere here.** In dbatools these are 12,039 calls to PowerShell's own cmdlets and 23,970 to names this PowerShell does not know. Of the second group, 85% are Pester's keywords (`Should`, `It`, `Context`, `Describe`, `BeforeAll`, `Mock`); the rest are dbatools' own C# cmdlets from `dbatools.library` (`Write-Message`) and other modules' commands (`Invoke-Sqlcmd`, `Get-AzResource`). The other corpora have the same mix. These calls stay off the map.

**Names defined only inside blocks.** In dbatools, 6,285 calls are to names defined elsewhere only inside a function or a block. They are test stubs: `function Write-Message {}`, `function Test-Path { $true }` and `function New-Object {}`, written inside a test's `BeforeAll` or `InModuleScope`.

**Aliases defined in the workspace** matter to no call here. dbatools sets its aliases in a loop over a hashtable, which a reading cannot follow; no call in any corpus goes through a written-out alias.

## The rules, scored

**Precondition shared by every rule:** a call to a name the caller's own file defines reaches that definition and draws no wire. A wire runs from a calling file to a defining file, carrying the function's name.

- **A-all:** draw a wire when exactly one other file defines the name anywhere: at file level, nested in a function, or inside a block.
- **A:** the same, counting file-level definitions only.
- **B:** as A, but when several files define the name, choose the one in the caller's own module, else draw none. The module was measured two ways:
  - **by folder:** the nearest folder holding a manifest or a `.psm1`;
  - **by loading:** a `.psm1` or a manifest, with every file it dot-sources, lists in a loop or names as `RootModule`, `NestedModules` or `ScriptsToProcess`, followed.
- **C:** as B, but where the module does not decide, draw to every definition (in the caller's module if several are there, else all).
- **L:** wire only to a definition the caller loads (defined under R above).
- **R:** L, falling back to A when no defining file is loaded.

Below, "wires" counts file pairs; "calls" counts calls connected; "alone" counts files left with no wire at all (with today's written-out loads, before reading any new loads). The sample is 60 wires per rule, drawn by a fixed seed (`1119`) from each rule's own wires: 30 from dbatools, 20 from AL-Go, 5 from AzureStack, 4 from tSQLt and 1 from shop. A wire drawn by two rules is ranked the same in both, so samples overlap where rules agree.

| Rule | dbatools wires / calls / alone | AL-Go | AzureStack | tSQLt | shop | Sample of 60: true / false / arguable |
| --- | --- | --- | --- | --- | --- | --- |
| today | 9 / 0 / 1,780 | 0 / 0 / 198 | 11 / 0 / 27 | 9 / 0 / 29 | 4 / 0 / 1 | |
| A-all | 4,797 / 12,666 / 146 | 403 / 2,707 / 14 | 11 / 55 / 24 | 19 / 360 / 21 | 4 / 6 / 1 | 54 / 6 / 0 |
| A | 6,595 / 17,072 / 147 | 406 / 2,718 / 13 | 11 / 55 / 24 | 19 / 360 / 21 | 4 / 6 / 1 | **60 / 0 / 0** |
| B by folder | 6,596 / 17,088 / 147 | 420 / 2,803 / 13 | 11 / 55 / 24 | 19 / 360 / 21 | 4 / 6 / 1 | 60 / 0 / 0 |
| B by loading | 6,595 / 17,072 / 147 | 406 / 2,718 / 13 | 11 / 55 / 24 | 19 / 360 / 21 | 4 / 6 / 1 | 60 / 0 / 0 |
| C by folder | 6,596 / 17,088 / 147 | 436 / 2,839 / 13 | 15 / 59 / 23 | 19 / 360 / 21 | 4 / 6 / 1 | 58 / 2 / 0 |
| C by loading | 6,596 / 17,088 / 147 | 447 / 2,839 / 13 | 15 / 59 / 23 | 19 / 360 / 21 | 4 / 6 / 1 | 58 / 2 / 0 |
| L | 3,474 / 7,675 / 916 | 290 / 1,857 / 37 | 9 / 56 / 27 | 9 / 106 / 29 | 3 / 4 / 1 | 60 / 0 / 0 |
| **R** | **6,595 / 17,072 / 147** | **406 / 2,763 / 13** | **11 / 59 / 24** | **19 / 360 / 21** | **4 / 6 / 1** | **60 / 0 / 0** |

**Where the rules disagree.** A sample of 60 cannot tell rules apart when they share 99% of their wires, so the wires where two rules differ were judged separately: all of them, or the first 40 by the same seed.

| Wires in one rule and not the other | How many | Judged | True / false / arguable |
| --- | ---: | ---: | --- |
| A, not A-all (file-level definitions only, so a block's stub no longer blocks the real one) | 2,515 | 40 | 40 / 0 / 0 |
| A-all, not A (a block's stub as the only definition) | 918 | 40 | 0 / 40 / 0 |
| B by folder, not A | 27 | 27 | 5 / 20 / 2 |
| B by loading, not A | 0 | | |
| C by folder, not B by folder | 34 | 34 | 16 / 18 / 0 |
| C by loading, not B by loading | 88 | 40 | 16 / 20 / 4 |
| R, not A | 13 | 13 | **13 / 0 / 0** |
| A, not R | 0 | | |

**Two judges.** I judged all 222 wires. A second judge, a subagent of my tier (general-purpose), judged the same list. It was given the corpora, standard PowerShell scoping rules and pointers to how each corpus loads its files. It was not given the rules or my verdicts. The two agree on every wire.

Its report reached me before I had written my verdicts down, so mine are not blind to it. I checked every pattern behind an F or an A in the source myself. One point we both relied on, I confirmed by running it in `pwsh`: a `.psm1` without `Export-ModuleMember` re-exports the functions of a module it imports.

## The false wires, and their cause

All false wires in the samples fall into four groups.

1. **A cmdlet wired to a test's stub** (A-all; 6 in its sample, 40 of 40 of its extra wires).
   - `Test-Path` is defined inside `InModuleScope` in `tests/Export-DbaInstance.Tests.ps1` as `function Test-Path { $true }`. So every `Test-Path` in dbatools' 700 public functions became a wire to that test.
   - `New-Object`, `Remove-Item`, `Get-ChildItem`, `Copy-Item`, `Invoke-CimMethod` and `secedit` go the same way.
   - **Removed by** counting only file-level definitions (rule A). A test's stubs live inside its blocks.
2. **A sibling script's copy of a helper** (B by folder, C).
   - AL-Go's `Actions/Troubleshooting/Troubleshooting.ps1` defines its own `OutputWarning` and `OutputError`, then dot-sources `AL-Go-Helper.ps1`. Every other action gets those two names from `Actions/.Modules/DebugLogHelper.psm1`, which `AL-Go-Helper.ps1` imports.
   - The nearest folder holding a `.psm1` puts every action script and `Troubleshooting.ps1` in one "module" (`Actions/`, which holds `Github-Helper.psm1`), and `DebugLogHelper.psm1` in another (`Actions/.Modules/`). So B by folder sent 20 actions' calls to the troubleshooting copy.
   - **Removed by** choosing what the caller loads. For a pile of scripts, a folder is not a module.
3. **A sibling module's copy** (C).
   - AzureStack-Tools defines `Initialize-AzureRmEnvironment` in three modules and `Resolve-GraphEnvironment` in two. The Portal modules import `AzureStack.Identity.Common.psm1` (`PortalUserDataUtilities.psm1:44`).
   - C drew to every copy.
   - AL-Go's `Test-GlobMatch` is defined in the ReviewAgent scripts and in `SetupBCQuality.psm1`, and each caller loads one of them.
   - **Removed by** choosing what the caller loads.
4. **A test that calls inside `InModuleScope FleetCore`**, wired by B by folder to `reconcile-runner-fleet.ps1`, a script with the same function names that the test never loads (dbatools `.github/runners/tests/fleet-controller.Tests.ps1`).
   - R draws nothing here. The test imports `FleetCore.psm1` through a variable that a reading cannot follow, so neither copy is loaded as far as the text says, and two copies exist.
   - This is a correct omission.

**The arguable wires** are AL-Go's `AL-Go-TestRepoHelper.ps1`. `WorkflowInitialize.ps1` dot-sources it with the logging module's functions in scope; `Troubleshooting.ps1` dot-sources it after defining its own copies. R draws none of these wires, because the helper itself loads neither copy and two copies exist.

**What R does not see.** It is right where it draws, but it does not draw everything.
- Names defined in several files that the caller does not load: dbatools 16 calls, AL-Go 76. These need the run's own loading, which only a person or a configuration could say.
- Calls by a value only a run knows: 233 in dbatools.
- The C# cmdlets of a binary module (`Write-Message`, 3,774 calls).

**A risk the samples did not show.** dbatools' `opt/` holds back-ported cmdlets, each defined inside an `if` that runs only on old PowerShell: `if ($PSVersionTable.PSVersion.Major -lt 5) { function Expand-Archive ... }`. R wires 13 calls to them (`Expand-Archive`, `Get-Runspace`, `Compress-Archive`, `Register-ArgumentCompleter`, `Unblock-File`). On Windows PowerShell 5.1 the cmdlet answers, so these are false there.

No other corpus has a file-level definition named like a command PowerShell ships. Blocking names that PowerShell itself ships would remove them; that is a fork below. The standing rule allows blocking "genuine framework or builtin names".

**Calls inside another session's script block** (`Invoke-Command`, `Start-Job`): R wires 3 calls of that kind in all corpora. All three are true, because the block loads what it calls.

## Which `.ps1` files are programs

**The candidate rule.** A `.ps1` whose own level holds only function, filter, workflow and class definitions (after a `param` block) does nothing when run: what it defines vanishes with the script's scope. Its only use is to be dot-sourced, so it is a library.

**A lenient variant** also allows statements that only set up a scope:
- dot-sources and `Import-Module`;
- `Set-StrictMode`, `Export-ModuleMember`, `Set-Alias`, `New-Alias`, `Add-Type`, `Update-TypeData`, `Update-FormatData`, `Register-ArgumentCompleter`;
- assignments that call nothing.

| `.ps1` files | dbatools | AL-Go | AzureStack | tSQLt | shop |
| --- | ---: | ---: | ---: | ---: | ---: |
| all | 1,790 | 172 | 19 | 38 | 5 |
| library by the candidate | 894 | 24 | 1 | 0 | 2 |
| library by the lenient variant | 894 | 29 | 1 | 0 | 2 |
| of those libraries, loaded by a file the reading resolves | 894 | 18 | 1 | 0 | 2 |

**A seeded sample of 60 `.ps1` files** (seed `1119`: 24 dbatools, 18 AL-Go, 6 AzureStack, 9 tSQLt, 3 shop), judged by reading who loads or runs each file. Both readings call 58 of 60 rightly. Neither ever calls a program a library. The two mistakes are libraries called programs:
- **AL-Go `Actions/AL-Go-Helper.ps1`.** Every action dot-sources it, but its own level imports modules inside `if` statements and builds paths with `Join-Path`.
- **tSQLt `Experiments/IncludeTest1.ps1`.** An include holding one variable.

Across the whole of AL-Go, the two readings differ on five files. All five are helpers that only dot-source, import, or set a script variable, and all five are libraries, which only the lenient reading gets right.

In dbatools, the lenient reading takes 894 function files from `Entry: program` to library. All 894 are loaded by `dbatools.psm1`'s loops.

**Under either reading:**
- A `.psm1` is a module, never a program. Today it becomes an entry as a `module` when a manifest names it as `RootModule`.
- A manifest `.psd1` is a `tooling` entry by the package it publishes.
- A data `.psd1` is nothing.

Pester test files stay programs (their own level is `Describe`), and the engine already counts them as tests.

## Manifests

| Manifest | `RootModule` | `FunctionsToExport` | Each name defined at file level in exactly one of the module's files |
| --- | --- | ---: | ---: |
| dbatools `dbatools.psd1` | `dbatools.psm1`, resolved; `RequiredModules` `dbatools.library`, not in the workspace | 724 | 724, among the 894 files `dbatools.psm1`'s loops load |
| AzureStack `HCI/AsHciADArtifactsPreCreationTool.psd1` | resolved | 2 | 2 |
| AzureStack `InfrastructureBackupValidator/Unprotect-AzsBackup.psd1` | resolved | 1 | 1 |

Five other `.psd1` files are data, or a manifest whose table `Import-PowerShellDataFile` refuses to read because it evaluates expressions. No corpus uses `NestedModules` or `ScriptsToProcess` that names a file.

**What a wire from a manifest should mean.** It already means "loading this module loads that file", which is true of `RootModule`, `NestedModules` and `ScriptsToProcess`; every one in these corpora resolves.

`FunctionsToExport` names what the module publishes, not a file it loads. Every exported name here is defined in exactly one file, so R already sends each caller's wire to the origin file. That follows the standing preference for a symbol's origin over what only passes it on. A wire from the manifest to each defining file would add 724 edges from one hub without saying anything a caller's wire does not.

My recommendation is no wire from `FunctionsToExport`. If it is read at all, it should be a later question of which functions a module publishes, for its symbols.

## Loading: by `Join-Path`, by variable, by loop, and by running a script

Today the map reads a load only where the path is a string or a `$PSScriptRoot` string. The parser found many more loads whose path the text still fixes.

| Loads the text fixes, not read today | dbatools | AL-Go | AzureStack | tSQLt |
| --- | ---: | ---: | ---: | ---: |
| dot-source or `Import-Module` of `Join-Path $PSScriptRoot '…'`, its `-Path`/`-ChildPath`/`-Resolve` forms, or a variable assigned once from such at file level | 0 | 266 (119 dot-sources, 147 imports) | 0 | 3 |
| dot-source in a `foreach` over `Get-ChildItem` of a folder | 893 | 0 | 0 | 0 |
| a script run by its path (`& ./x.ps1`, `./x.ps1`, `& "$PSScriptRoot\x.ps1"`) | 1 | 0 | 0 | 32 |
| files left alone by these loads alone (today's count first) | 1,780 → 887 | 198 → 31 | 27 → 27 | 29 → 21 |
| alone with these loads and R together | 132 | 12 | 24 | 18 |

**AL-Go is the important case.** It is the shape nearest a pile of deployment scripts, and today it has no wire at all: every load it makes is `. (Join-Path -Path $PSScriptRoot -ChildPath "..\AL-Go-Helper.ps1" -Resolve)` or the like.

**Sample of these loads.** Eight of each kind (32) were read in the source; all are true.

**Loading by loop.**
- **dbatools** is the one module here that loads by a folder listing. `dbatools.psm1` lines 232–246 do this three times: `foreach ($file in (Get-ChildItem -Path "$script:PSModuleRoot/public/" -Recurse -Filter *.ps1)) { . $file.FullName }`.
  - The folder is fixed by the text once one assignment is followed: `$script:PSModuleRoot = $PSScriptRoot`, at file level, line 35.
  - The filter and `-Recurse` are written out.
  - The same form loads `private/maintenance` from `private/scripts/dbatools-maintenance.ps1`.
  - The loops sit in an `if` whose other branch loads a compiled `dbatools.dat`. A reading takes the branch that loads the source files, which are the ones in the repository.
- **dbatools' `private/configurations/configuration.ps1`** lists folders through `[IO.Path]::Combine($configpath, …)`, with `$configpath` from elsewhere; a reading cannot follow it.
- **AL-Go's ReviewAgent module** loads by a loop over a written-out list: `foreach ($s in @('FindingPlacement.ps1', …)) { . (Join-Path $PSScriptRoot $s) }`. A reading can follow it, but my evaluator did not.
- **The scaffolded module form** is the commonest in published modules: `$Public = @(Get-ChildItem "$PSScriptRoot\Public\*.ps1")` and later `foreach ($f in $Public + $Private) { . $f.FullName }`. It occurs in none of these corpora; the measuring script follows the variable when it does.
- **Loops a reading cannot follow:** the other loops in these corpora dot-source script blocks built at run time (`[ScriptBlock]::Create($function.Extent.Text)`, in tests) or paths from parameters.

## SQL from PowerShell

Every place a script hands text or a file to SQL Server was counted. That covers:
- commands with a query or file parameter (`Invoke-Sqlcmd`, `Invoke-DbaQuery`, `sqlcmd`, and the corpora's own wrappers);
- SMO and ADO.NET calls (`.Query()`, `.ExecuteWithResults()`, `.ExecuteNonQuery()`, `.ExecuteScalar()`, `.ExecuteReader()`, `.CommandText =`, `New-Object …SqlCommand`).

| | dbatools | tSQLt | AzureStack | shop | AL-Go |
| --- | ---: | ---: | ---: | ---: | ---: |
| places | 2,377 | 39 | 12 | 7 | 0 |
| given a string written out | 726 | 4 | 0 | 4 | |
| given a string with variables in it | 638 | 1 | 0 | 2 | |
| given a variable assigned only literals in the file | 584 | 1 | 11 | 0 | |
| other (a parameter, a command object, an expression, a wrapper whose parameters the binder does not know) | 429 | 33 | 1 | 1 | |
| of all of these, a file (`-InputFile`, a list of `.sql` names) | 11 | 4 | 0 | 2 | |
| text the source fixes that names a table, view or procedure | 563 | 0 | 11 | 4 | |
| of which naming an object a `.sql` file of the workspace declares | 0 | 0 | 0 | 4 | |

Examples:
- **dbatools:** `Invoke-DbaQuery -Query 'SELECT id FROM dbo.example'` and `$server.Query("SELECT … FROM msdb.dbo.backupset …")`. Its SQL names system catalogs and `msdb`, never a schema of its own.
- **AzureStack:** `$SQLCmd = "SELECT … FROM [$SubscriptionSqlDbName].[subscriptions.internal].[Offers]"` handed to `Invoke-Sqlcmd`.
- **tSQLt:** `Invoke-SqlFile -FileNames @('ResetValidationServer.sql')`.
- **shop:** `Invoke-Sqlcmd -Query "EXEC dbo.usp_GetCustomer @Id = 1"` and `-InputFile`.

**How C# does it.** The C# reader keeps every string expression that matches `SQL_VERB` (`csharp.ts`, `recordStringUse`). It folds each kept string with `foldString`, finds the objects it names with `sqlReferences` (`openings.ts`), and matches them to the declaring file with `matchSqlObject` over the generator's symbol index. An object nobody declares is kept by name as a contract.

**Could PowerShell share it?** `sqlReferences`, `sqlObjectName` and `matchSqlObject` are language-free and would serve PowerShell unchanged. What PowerShell would need of its own:
- a folding of its strings: here-strings, and an expandable string's variables blanked;
- a variable assigned a literal once in the same scope;
- `-InputFile` and lists of `.sql` names as path wires to the files.

On these corpora that would connect the shop's four queries and no other. dbatools and AzureStack query objects outside the workspace, which would appear as named contracts. Nothing was built.

## The grammar's share of the misses

The engine reads PowerShell with its own tree-sitter grammar, not the parser. It has parse errors in many files:

| | dbatools | AL-Go | AzureStack | tSQLt | shop |
| --- | ---: | ---: | ---: | ---: | ---: |
| files with a parse error | 112 of 1,793 | 78 of 198 | 12 of 37 | 4 of 39 | 1 of 6 |

Yet of the 20,260 calls R connects, the grammar finds 20,258 as commands of the same name on the same line. It misses two definitions R wires to, `Find-DbaInstance` and `Install-DbaInstance`, the two the cold run found swallowed. All four misses are in files with a parse error. So the grammar costs R almost nothing; the parse errors are the grammar builder's.

## How a workspace table would be had

R needs, for every PowerShell file, its file-level definitions and what it loads. The generator does not provide this, and it need not:
- **The C# precedent.** The C# reader builds its own workspace table from the file index, once per index (`csharp.ts`, `tableCache`, around line 918), reading every `.cs` file itself.
- **Why the symbol index will not do.** It carries published symbols only, case-sensitively, without the file-level distinction or any loads.

So nothing is missing from the generator. The PowerShell adapter can build its table the way C# does. The cost to watch in the build is a second parse of every PowerShell file, unless the table's facts are kept for the analysis pass.

## Forks for the root

1. **R or A.**
   - They agree on every wire but 13; those 13 are true in R and missing in A.
   - R needs a reading of what each file loads, followed through modules. A needs only the workspace's file-level definitions.
   - The loads in fork 2 are what R's choice is made from, and the map wants them anyway.
   - **Recommendation: R.** It is how PowerShell itself resolves: what the caller loaded decides. And it is the only rule that can choose rightly when names collide, as they do in AzureStack-Tools and AL-Go.
2. **Read the loads the text fixes:** `Join-Path`, a variable assigned once at file level, a `Get-ChildItem` loop over a fixed folder, and a script run by its path.
   - **Recommendation: yes, in the same round.** Without them AL-Go stays at 198 of 198 files alone in its loads, dbatools' module does not load its functions, and R has nothing to choose by.
   - The oracle would grade them: the parser records the expressions, and its reading of `Join-Path` would live in `powershell-ast.ps1`.
3. **Names PowerShell ships.**
   - Draw no wire for a call whose name is a command of PowerShell's own modules (`Microsoft.PowerShell.*`, as Windows PowerShell 5.1 and PowerShell 7 ship them).
   - That removes dbatools' 13 back-port wires. It would also hide a deliberate file-level override of a cmdlet, which none of these corpora has.
   - The list would be shipped with the engine.
   - **Recommendation: yes.** It is the standing exception for genuine builtin names, and the wire is false on the owner's PowerShell.
4. **Entries.**
   - **Recommendation: the lenient library rule.** It changes 894 dbatools files and 29 AL-Go files from programs to libraries, with no program called a library in the sample.
   - `AL-Go-Helper.ps1` would stay a program; reading `if` statements that only import would fix it, and is not recommended without more evidence.
5. **`FunctionsToExport`. Recommendation: no wire;** see [Manifests](#manifests).
6. **SQL from PowerShell.** Nothing built. The C# machinery would serve, with a PowerShell string folding; it pays off only for a workspace whose scripts query its own schema.

## Reproducing

The measuring scripts and outputs are in the builder's scratch folder, kept until the build round ends:
- `run-oracle.sh` runs the extended emitter in batches.
- `loops.ps1` and `sql.ps1` measure loads and SQL with the parser.
- `model.ts`, `measure.ts`, `sample.ts`, `entries.ts`, `manifests.ts`, `grammar.ts` and `isolation.ts` hold the rules, scores, samples and counts.

The seed for every sample is `1119`. Wires are ranked by the SHA-256 of `1119|corpus|from|name|to`, so a wire two rules share is ranked the same in both.

## Built: the root's rulings and what the build found _(added November 19, 2026, evening)_

**The rulings.**
- Rule R.
- The loads the text fixes, each drawn as a wire of its own.
- Names PowerShell ships, blocked only at the fallback: a definition the caller loads still wins, since a function shadows a cmdlet. The list comes from PowerShell itself.
- The lenient library rule.
- `FunctionsToExport` carried like a TypeScript barrel's re-exports, through the existing mechanism, with no wire.
- No SQL.

All of these are built in `packages/engine/src/live-docs/adapters/powershell.ts`. The decision is in [the decisions log](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md).

**What the oracle found in the first build.** The rules were written a second time over the parser's facts (`scripts/oracle/powershell-wires.ts`), and the built adapter was scored against them on the five corpora. The score found four faults, each mended and each given a test:

1. **Positional arguments after a named one.** `Join-Path -Path $PSScriptRoot "x.psm1"` binds its second argument to `-ChildPath`, but the adapter's binder bound every positional argument by position from the start. AL-Go's modules write their imports this way.
2. **`-Recurse` was never recorded.** The binder took no note of a switch.
3. **A function called with `.`.** `. Stop-Function @splat` calls the function in the caller's scope; it was read as a dot-source of a path.
4. **Test stubs at the file's own level.** `tests/Copy-DbaPolicyManagement.Tests.ps1` is read by the grammar with lines 1 to 173 in one error node, so its stubs of `Write-Message`, `Connect-DbaInstance` and `New-Object` stood at the file's own level. They drew 562 false wires and hid 302 true ones.
   - A definition inside text the grammar could not read now counts as none.
   - A script with such text at its own level stays a program.
   - An assignment that calls a command on its left side (`(Get-Item Function:\X).Visibility = 'Private'`) runs something.

The emitter had two faults of its own, found on the corpora and mended before its record was trusted:
- a variable named `keys` stood in for its table's keys;
- a `return` inside a loop whose output an assignment was collecting emitted the values gathered so far.

**The score, after the mends**, with the oracle's reading of each corpus as the standard. A wire is a file pair; a call is a file, a function and the file that defines it.

| Corpus | Wires: the oracle's / the adapter's / both | Calls: the oracle's / the adapter's / both | Programs: agree / differ |
| --- | --- | --- | --- |
| dbatools | 7,479 / 7,477 / 7,477 | 6,630 / 6,628 / 6,628 | 1,791 / 2 |
| AL-Go | 475 / 471 / 471 | 1,045 / 1,040 / 1,040 | 198 / 0 |
| AzureStack-Tools | 13 / 15 / 13 | 29 / 29 / 29 | 37 / 0 |
| tSQLt | 39 / 34 / 34 | 34 / 34 / 34 | 39 / 0 |
| shop | 5 / 5 / 5 | 6 / 6 / 6 | 6 / 0 |

What each difference is:
- **dbatools: the grammar's.** `public/Find-DbaInstance.ps1` and `public/Install-DbaInstance.ps1` hold their one public function inside text the grammar cannot read. So their tests' calls are not wired, and the two files stay programs.
- **AL-Go: a known weakness of the rule, which the grammar happens to spare the adapter.** `Tests/RunTests.Test.ps1` stubs `Get-AppJsonFromAppFile` and `Get-BcContainerEventLog`, commands of BcContainerHelper (a module the actions download), at its own level, lines 10 and 11. By the parser's facts that test is the only definition, so the oracle wires four actions' five calls to it. Those wires are false. The adapter draws none, because the grammar reads those lines inside an error.
- **AzureStack-Tools: older than this rule.** Two manifests that `Import-PowerShellDataFile` refuses, because their tables evaluate expressions, are read by the adapter's own reader of the data language, which takes the keys it can read.
- **tSQLt: the grammar's.** `./tSQLt_Build/ConcatenateFiles.ps1`, a script run by its path, is read by the grammar as a dot-source. This is the one miss in the oracle test's register too, on the fixture's `./scripts/Clean.ps1`.

**The second sample, drawn after the build** with a new seed (`2026-11-19-built`): sixty wires the built adapter draws, thirty on dbatools and thirty on AL-Go, loads and calls alike.
- I read them in the source. So did a second judge, a general-purpose subagent of my tier, given the corpora and the list only.
- I wrote my verdicts down before opening its file, and its hand-back carried no verdicts.
- Both of us: **59 true, 1 arguable, 0 false, the same verdict on every wire.**
- Every row is in [samples-built.md](samples-built.md).
- The arguable one is AL-Go's `e2eTests/scenarios/CopilotCodeReview/runtest.ps1` wired to `Actions/AL-Go-Helper.ps1`. Its `ConvertTo-HashTable` at line 89 reaches that file through `e2eTestHelper.psm1`. Its `Get-PlainText` at line 11 is a parameter's default, evaluated before the script imports anything; the workflow passes every parameter, so that call never runs there.

**Cost**, generating the whole dbatools checkout from nothing, under a private `TMPDIR`, twice each. The machine was at a load of 18 to 33 throughout.

| | Wall s | Processor s | Peak memory |
| --- | ---: | ---: | ---: |
| before (`8d31ff04`) | 95.9, 92.6 | 86.8, 81.1 | 885, 639 MB |
| after | 88.2, 89.9 | 93.5, 90.7 | 665, 891 MB |

The table reads every PowerShell file once per run, and a file's own analysis reuses its facts when its text is the same. So each file is parsed once a run, where it was parsed twice before (once to index symbols, once to write its doc). The processor time added, about a tenth, is the wires themselves: dbatools' docs now carry about 7,500 dependency lines, each resolved and written, where they carried 9.

**This repository.** Of its PowerShell files, nine docs changed, each rightly:

| Doc | Change | Why |
| --- | --- | --- |
| `programs/powershell/rollout/Invoke-Rollout.ps1` | its loads carry the functions it calls: `Write-RolloutBanner`, `Write-RolloutLog`, `Read-RolloutSettings`, `Send-RolloutNotice`, `Get-RolloutTarget`; a new wire to `Rollout.Steps.psm1` for the four it calls through the manifest it imports | each is called in its body and defined in the file named |
| `programs/powershell/rollout/scripts/Show-RolloutPlan.ps1` | calls `Write-RolloutBanner`, `Format-RolloutReport`, `Get-RolloutPlan` on its loads | the same |
| `programs/powershell/rollout/lib/Logging.ps1`, `lib/Settings.ps1` | no longer `Entry: program` | each only defines functions and is dot-sourced |
| `programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1` | `Re-Exported Symbol Anchors` for the five functions its `FunctionsToExport` names, each linked to `Rollout.Steps.psm1` | the manifest offers them |
| `fixtures/powershell-compendium/scripts/deploy.ps1`, `workspace/scripts/deploy.ps1` | their loads carry `Write-DeploymentLog` and `Get-InventorySnapshot` | called there, defined in the files named |
| `fixtures/powershell-compendium/common/logging.ps1`, `workspace/scripts/common/logging.ps1` | no longer `Entry: program` | libraries, dot-sourced by the deploy scripts |
| `scripts/oracle/powershell-ast.ps1` | the emitter's new functions and notes | the oracle extended |

The other PowerShell files' docs are unchanged: the compendium's `Inventory.psm1` twice and `config/settings.psd1`, and the rollout program's three modules and `config/targets.psd1`. Two oracle records' docs changed, the `expected/powershell-ast.json` files, whose keys gained the new facts.

The new fixture, `tests/integration/fixtures/powershell-wires`, adds 22 PowerShell files and their docs. The other new and changed docs are those of the adapter, its list of shipped commands, their tests, and the oracle's modules and test.

**For the grammar's builder**: [grammar-errors.md](grammar-errors.md) lists the 112 dbatools files and 78 AL-Go files the grammar cannot read in full, each with the first failing line and the idiom where the line tells it. Since this round, those errors cost wires only where they swallow a definition or a call: here, two dbatools functions, and tSQLt's five scripts run as `./x.ps1`.

## Rulings after the build _(added November 19, 2026, late evening)_

The root ruled on the four forks of the build. Three are built here, each with tests that failed against `cb427f0b` first and with the rule written a second time in the oracle. The fourth, keeping the shipped list as broad as it is, needs no change. Counts are of the adapter's wires before and after, and of the oracle's.

1. **A variable assigned inside a block.** It is fixed when the file assigns it exactly once, by `=`, before the load in the text, in the function or script block that holds the load or in one enclosing it.
   - Adapter: no new wire on any corpus. The oracle reads two new loads in `Tests/RunTests.Action.Test.ps1`, which the adapter misses because the grammar cannot read that file in full.
   - The 138 loads through `$scriptRoot` in AL-Go's tests mostly stay unread. 35 of the 36 test files do assign `$scriptRoot` exactly once, but inside a `BeforeAll`, and they load through it inside sibling `It` blocks, which the assigning block does not enclose. Pester runs `BeforeAll`'s variables into those `It` blocks; the text alone does not say so. This is a fork for the root.
   - With no new adapter wire from this ruling, there were no thirty new wires to read by a seeded draw. Over every ruling the adapter gained one wire, read below.
2. **A test's stub is never working code's only definition.** The reach to the only defining file passes over test files when the caller is not a test, by the product's archetype (`resolveArchetype`).
   - Of AL-Go's five false calls the oracle drew, three are gone (from `Deliver.ps1`, `Deploy.psm1`, `RunPipeline.ps1`). Two remain, from `Actions/RunTests/RunTests.psm1`, because the product's test pattern `Tests?\.[^.]+$` calls `RunTests.psm1` a test.
   - The adapter never drew those five, since the grammar loses the stubs.
   - dbatools lost four true wires: `.github/scripts/gh-actions.ps1` and `gh-s3actions.ps1` to `public/Test-DbaInstanceName.ps1`, `Test-DbaTempDbConfig.ps1`, `Test-DbaBackupStorageCompatibility.ps1` and `Test-DbaPath.ps1`. The archetype's directory pattern `\btests?\b` is tested against the whole path, so a file named for PowerShell's approved verb `Test` is a test to the product. The generator labels those files `Archetype: test` in their docs too. That is a fault in `archetype.ts`, which this leg did not touch.
   - **Also missing:** the adapter is not given the workspace's configuration, so it reads the archetype with the default configuration. A workspace's overrides and sample roots are not seen here. Passing the configuration's archetype to the adapters would take a change in the generator's plumbing.
3. **The shipped list stays as built.**
4. **`Split-Path` and loops over names written out.**
   - `Split-Path` of the script's own path (`$MyInvocation.MyCommand.Path` or `.Definition`, `$PSCommandPath`) is its folder. Of another fixed path it is that path's parent, unless it asks for a leaf, a qualifier or whether the path is absolute.
   - A `foreach` or `ForEach-Object` over a string, a list, `@()`, or a variable assigned one, is read once per name with the loop's item standing for it.
   - On the corpora, `Split-Path` gave the adapter its one new wire. `Tests/AppHelper.Test.ps1` sets `$here = Split-Path -Parent $MyInvocation.MyCommand.Path` and dot-sources `..\Actions\AL-Go-Helper.ps1` from it. Read in the source, the wire is true.
   - The written-out lists gave the oracle one new wire: AL-Go's ReviewAgent module, `Invoke-CopilotPRReview.psm1`, loading `scripts/GitHub.ps1`. The adapter misses it because the grammar cannot read that file in full.
   - The fixture has both forms (`Neighbour.ps1`, `Extras/Extras.psm1`), and the adapter and the oracle agree on them.

| Corpus | Adapter wires before → after | Calls before → after | Oracle wires before → after | Oracle calls before → after |
| --- | --- | --- | --- | --- |
| dbatools | 7,477 → 7,473 | 6,628 → 6,624 | 7,479 → 7,475 | 6,630 → 6,626 |
| AL-Go | 471 → 472 | 1,040 → 1,041 | 475 → 478 | 1,045 → 1,044 |
| AzureStack-Tools, tSQLt, shop | unchanged | unchanged | unchanged | unchanged |

**The grammar.**
- **What a rebuild needs here.** `build.sh` needs git, node, a C compiler and the pinned tree-sitter CLI, and the container has all four (`cc` is gcc; the CLI is 0.27.1 from `npm ci`). Its steps, run up to the wasm in a private folder, took 1 s to generate and 5 s to test, with all 164 corpus parses passing.
- **The wasm step.** `tree-sitter build --wasm` downloads wasi-sdk 34 and binaryen 132 into `~/.cache/tree-sitter` the first time. That is a per-user download made by the pinned CLI itself, not a system install. It has not been run.
- **Not started:** mending the idioms, and the smallest input that loses a block's structure. Both were begun in the next leg; see [The grammar's idioms, mended](#the-grammars-idioms-mended-added-november-19-2026-night).

## The archetype's test folders _(added November 19, 2026, night)_

The root ruled that the archetype's folder pattern reads a path's folders, never the file's own name. Built in `fbbfd67a`, with a test that failed first.
- `\btests?\b|__tests__` is now tested against the folders alone. A file's own name makes it a test only by the name conventions.
- One name convention is added, `^tests?\.[^.]+$` without regard to case: a file named for the word alone, such as `test.js` or Django's `tests.py`. Without it, DNN's 17 `test.js` and `test.ts` files, 16 of them CodeMirror's mode tests, would have lost the test label the whole-path reading gave them.
- **This repository:** no doc changes archetype.
- **The corpora**, every move from test to implementation:

| Corpus | Files | Kind | Example | Was the old label wrong? |
| --- | ---: | --- | --- | --- |
| dbatools | 66 | a function named for the verb `Test` | `public/Test-DbaPath.ps1` | yes: working code |
| dbatools | 4 | a CI script named for the verb | `.github/scripts/Test-ActionlintWorkflows.ps1` | yes: a check CI runs, not a test of the code |
| dbatools | 4 | a workflow named for the tests it runs | `.github/workflows/integration-tests.yml` | arguable: CI configuration |
| tSQLt | 1 | a dotted part of the name | `Source/tSQLt.Tests.view.sql` | yes: part of the framework |
| AL-Go | 6 | a settings file named for a workflow | `Templates/AppSource App/.github/Test Current.settings.json` | yes: configuration |
| AL-Go | 3 | an end-to-end test named for the verb | `e2eTests/Test-AL-Go.ps1` | no: these are tests, labelled so only by accident of the verb. The folder `e2eTests` has no word boundary before `Tests`, so the folder pattern does not read it as a test folder. |

- The adapter's wires: dbatools 7,473 → 7,477, the four lost in the last round to `Test-DbaInstanceName`, `Test-DbaTempDbConfig`, `Test-DbaBackupStorageCompatibility` and `Test-DbaPath` coming back. AL-Go stays at 472.

**Pester's `Name.Tests.ps1` against `RunTests.psm1`: not built.** The existing name pattern `Tests?\.[^.]+$` cannot tell AL-Go's `RunTests.psm1` from C#'s `FooTests.cs` without knowing the language. Both are a word ending in `Tests` and then one extension. So the second half needs a rule for PowerShell files, and the root asked for candidates rather than a build. Each is counted on top of the folder mend:

| Candidate | What it says | Files that move from test to implementation |
| --- | --- | --- |
| P1 | A PowerShell file (`.ps1`, `.psm1`, `.psd1`) is a test by its name only as `Name.Tests.ps1` or `Name.Test.ps1`; other languages keep `Tests?\.[^.]+$` | tSQLt 4 (`Build/tSQLt_BuildTests.ps1`, `Build/tSQLt_ValidateRunExampleTests.ps1`, `Build/tSQLt_ValidateRuntSQLtTests.ps1`, `Experiments/InvokeSqlcmdTest.ps1`); AL-Go 4 (`Actions/AnalyzeTests/AnalyzeTests.ps1`, `Actions/RunTests/RunTests.ps1`, `Actions/RunTests/RunTests.psm1`, `Internal/Scripts/GetOwnerForE2ETests.ps1`); dbatools 0 |
| P2 | A PowerShell module (`.psm1`, `.psd1`) is never a test by its name | AL-Go 1 (`Actions/RunTests/RunTests.psm1`) |

P1 is Pester's own convention, and every file it moves is working code that runs tests: an action, a build step, an experiment. P2 is the narrowest change that frees `RunTests.psm1`. The recommendation is P1.

**What the adapter reads.** The adapter reads the archetype with the default configuration, so a workspace's overrides and sample roots do not reach it. The smallest change that would hand a reader the workspace's own answer is for the file index the generator already builds with the configuration to carry it. Exact lines, for the joining:
- `packages/engine/src/live-docs/adapters/index.ts`, line 32, `export type WorkspaceFileIndex = Set<string>;` becomes
  ```ts
  /** Every discovered workspace path; built by the generator, it also answers each one's archetype under the workspace's configuration. */
  export type WorkspaceFileIndex = Set<string> & { archetypeOf?: (path: string) => LiveDocumentationArchetype };
  ```
- `packages/generator/src/generator.ts`, lines 142 to 146, become
  ```ts
  const fileIndex: WorkspaceFileIndex = Object.assign(
    new Set(allTargetFiles.map((absPath) => normalizeWorkspacePath(path.relative(workspaceRoot, absPath)))),
    { archetypeOf: (file: string) => resolveArchetype(file, normalizedConfig) }
  );
  ```
- In `powershell.ts`, `isTestFile(file)` becomes `isTestFile(workspace, file)` and returns `(workspace.archetypeOf?.(file) ?? resolveArchetype(file, DEFAULT_LIVE_DOCUMENTATION_CONFIG)) === "test"`. Its two callers, in `calledFiles`, already hold the workspace's index.

The index stays a `Set` to every one of its consumers, so nothing else changes. A binary file's `asset` label needs its content, which the index does not read; for telling a test from working code that does not matter.

## The grammar's idioms, mended _(added November 19, 2026, night)_

**What a rebuild downloaded.** The pinned CLI's `tree-sitter build --wasm` fetched wasi-sdk 34 and binaryen 132 into `~/.cache/tree-sitter`. Binaryen's download was 111 MB; wasi-sdk's size was not captured. They take 953 MB on disk: wasi-sdk 635 MB and binaryen 318 MB. The CLI also keeps a native `lib/powershell.so` there for `tree-sitter test`. The cache is left in place. No other download, install or permission prompt appeared. Rebuilt from the committed patch, the wasm came out byte for byte the committed one. A wasm build here took 111 to 228 seconds under a load of about 25.

**Graded by PowerShell's own parser.** Measured over 2,073 `.ps1` and `.psm1` files in five corpora. "Missing" counts the functions PowerShell sees, by name and line, that the grammar does not:

| | dbatools | AL-Go | AzureStack-Tools | tSQLt | shop | All |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| files with an error node, before | 112 | 78 | 12 | 4 | 1 | 207 |
| after | 68 | 31 | 10 | 3 | 1 | 113 |
| functions missing, before | 5 | 0 | 5 | 0 | 0 | 10 |
| after | 5 | 0 | 5 | 0 | 0 | 10 |

No file is newly in error. The ten missing functions are the same ten as before: `Find-DbaInstance` and four in `Install-DbaInstance.ps1`, and five in AzureStack's `Deployment/asdk-prechecker.ps1` and `Support/AzS_PoSh/AzS-PoSh-Environment.ps1`.

**The idioms, in the order of the files they free.** Each has an entry in the grammar's own corpus (`test/corpus/assignments.txt`, `script_blocks.txt`), and each failed first against the grammar as it stood. The per-idiom split comes from the first failing line of each error file in [grammar-errors.md](grammar-errors.md). Builds of one mend at a time were not graded reliably in this leg, so the three are graded together above.
1. **An attribute with arguments before an expression**, even on the line before it: `[Diagnostics.CodeAnalysis.SuppressMessageAttribute('Rule', '', Justification = '…')]` then `$x = …`. It was the first error in 43 files, nearly all AL-Go's, and is valid in Windows PowerShell 5.1. It is built as an `attributed_expression` beside the cast, as PowerShell's own `AttributedExpressionAst` is, and declared in conflict with a param block's attributes so that both readings are tried.
   - **Tried first and rejected:** putting the attributes in the assignment's target. Its error recovery lost five functions of AzureStack's `Identity/AzureStack.Identity.psm1`.
   - **Also rejected:** giving the expression a fixed precedence. That took `[CmdletBinding()]` then `[OutputType(...)]` before `param` for an expression. The corpus now has a test that keeps them the param block's.
2. **An empty script block**, `Mock Stop-Function { }`, `-Value { }`, `{}`. Upstream required a statement inside one. This was most of the "not told by the line" first errors: Pester's `Mock`, `Add-Member -Value { }`.
3. **Named blocks a semicolon ends**, `Function Log-Output{…Process{…};};`. This is tSQLt's `Build/CommonFunctionsAndMethods.psm1`. Without this mend, mend 2 made upstream's recovery lose that whole file and its `Replace-InFile`. With it, the file has no error at all.

**What the adapter needed.** An assignment whose target an attribute stands before is read as PowerShell reads it: the attribute changes nothing assigned. A type constraint, `[int]$x`, is a cast and stays unread on both sides. The same rule is written in the oracle's emitter, which unwraps an `AttributedExpressionAst` but not its subclass `ConvertExpressionAst`. The adapter's test failed first on the library half: under the old grammar, AL-Go-Helper's opening attribute left an error at the file's own level, so the file counted as a program.

**A definition inside unread text counts as none.** That rule now has a test that can fail. With the rule's `ERROR` clause removed from `inNestedScope`, the test fails, and it passes with the clause in place. Its input is the smallest found:
```powershell
Describe 'x' {
    $path = 'C:\’
    $name = 'y'
}
function Get-Thing { }
$z = 'w'
```
PowerShell 7, run here, ends a single-quoted string at a typographic quote (`’`) and reads this with no error. Windows PowerShell 5.1 was not run here. The grammar does not, so it loses the `Describe` block and reads the function after it inside an error. The idiom is AzureStack's: `AzS-PoSh-Environment.ps1` has `'C:\’`, and it is why `Read-InputBoxDialog` is lost there. The test first checks that the grammar still loses this input, so that a later mend that reads it fails the test instead of passing it vacuously.

This input loses a function at the file's own level, where the rule costs a true definition. A reduction to a stub inside the lost block got to 52 lines and no smaller in this leg. Only two corpus files still have a definition under an error: AzureStack's `AzS-PoSh-Environment.ps1` and dbatools' `Find-DbaInstance.ps1`. dbatools' `Copy-DbaPolicyManagement.Tests.ps1` and AL-Go's `RunTests.Test.ps1` now read in full, so their stubs stand in the blocks that hold them.

**What the mended grammar changes in the map.** Measured with the adapter over every corpus, after the archetype mend. dbatools, AzureStack-Tools, tSQLt and the shop have the same wires, symbols and programs. AL-Go goes from 472 resolved dependencies to 477:
- Four are loads in two tests the grammar can now read, and the oracle already read them. They are `Tests/RunTests.Action.Test.ps1` loading `Actions/AL-Go-Helper.ps1`, `Actions/.Modules/AlToolHelper.psm1` and `Actions/RunTests/RunTests.psm1`, and `Tests/PullRequestStatusCheck.Test.ps1` loading `Actions/Github-Helper.psm1`. All four are true.
- One is false: `Actions/RunTests/RunTests.psm1` calling `Get-AppJsonFromAppFile` and `Get-BcContainerEventLog` in `Tests/RunTests.Test.ps1`. That test stubs the two BcContainerHelper commands at its own level, lines 10 and 11, and the grammar no longer loses them. The rule passes over tests only when the caller is not one, and the name pattern calls `RunTests.psm1` a test. So this is the oracle's remaining false wire from the last round, now drawn by the adapter too. Candidate P1 or P2 above removes it.

**Not reached in this leg:** Pester's `BeforeAll` rule, and the remaining idioms of [grammar-errors.md](grammar-errors.md): `switch` as an expression, numeric multipliers, a method call followed by a member as a command argument, labelled loops, and the typographic quotes found here.

## P1, the directory's words, and what reaches a Pester `It` _(added November 19, 2026, late night)_

**P1, as the root chose it.** A PowerShell file is a test by its own name only as `Name.Tests.ps1` or `Name.Test.ps1`, without regard to case. Built in `1add3544`, with an archetype test and an adapter test that both failed first.
- Moves from test to implementation: AL-Go 4 (`RunTests.ps1`, `RunTests.psm1`, `AnalyzeTests.ps1`, `GetOwnerForE2ETests.ps1`) and tSQLt 4 (three build steps and an experiment). Nothing else on any corpus, and no doc of this repository.
- The false wire from `Actions/RunTests/RunTests.psm1` to `Tests/RunTests.Test.ps1` is gone. AL-Go's resolved dependencies go from 477 to 476, with no other change.

**A directory's name read in its words: measured, not built.** The root's rule splits a word where a capital follows a small letter or a digit. On the corpora it moves 67 files from implementation to test, and this repository not at all. Not every move is right:

| Corpus | Folder | Files | Right? |
| --- | --- | ---: | --- |
| AL-Go | `e2eTests/` and beneath | 42 | yes: end-to-end tests |
| AL-Go | `Actions/RunTests/` | 3 | **no**: the action that runs tests, which P1 has just called working code |
| AL-Go | `Actions/AnalyzeTests/` | 3 | **no**: the action that analyses test results |
| tSQLt | `TestUtil/`, `TestUtilTests/`, `tSQLtCLR/tSQLtTestUtilCLR/` | 17 | yes: tSQLt's support for its own tests |
| DNN | `Dnn.AdminExperience/ClientSide/Seo.Web/src/components/testUrl/` | 2 | **no**: a component of the SEO page that tests a URL |

The rule cannot tell a folder named for a kind of test (`e2eTests`, `UnitTests`) from one named for something done to tests (`RunTests`, `AnalyzeTests`) or a feature (`testUrl`). Read with it, `RunTests.psm1` would be a test again by its folder, and the false wire P1 removed would come back. So the list goes to the root rather than into the code.

**What reaches an `It`, measured on Pester itself.**
- Pester 3.4.0 (the one Windows PowerShell 5.1 ships), 4.10.1 and 5.9.1 were saved with `Save-PSResource -Path` into a private folder: 0.4, 2.1 and 1.1 MB, nothing installed.
- A probe test file was run on each under the PowerShell 7.7 here.
- Pester 3.4.0 would not load on Linux without one edit to the private copy. It asks for the Windows-only `Get-WmiObject`, which it uses only for a result file's OS line, so that line was removed. Its `TestDrive` also needed `$env:TEMP` set.

| Assigned or dot-sourced where | Reaches an `It`: Pester 3.4.0 | 4.10.1 | 5.9.1 |
| --- | --- | --- | --- |
| the file's own level | yes | yes | no |
| a `Describe`'s or `Context`'s body | yes | yes | no |
| `$script:` in a `Describe`'s body | yes | yes | yes |
| a `BeforeAll`, `BeforeEach`, or a `Context`'s `BeforeAll` | yes | yes | yes |

A `BeforeAll` sees the file's own level under 3.4.0 and 4.10.1 but not under 5.9.1. It sees a variable assigned in a `Describe`'s body under none of them, even one written above the `BeforeAll`; why, the probe does not say.

**The rule built**, in the adapter and written a second time in the oracle's emitter (`Test-PesterSetupReaches`, `Test-PesterRunBlockBetween`):
- A variable assigned once in a `BeforeAll` or `BeforeEach` is followed into the `It` blocks of the `Describe` or `Context` that holds it, nested ones included. This is true under all three versions.
- A variable assigned at the file's own level or in a `Describe`'s or `Context`'s body is not followed into an `It` or a `BeforeAll`. Under 3 and 4 it would reach them; under 5 it does not. A wire true under one version and false under another is not drawn.
- **Not read yet:** a file's own statement of its version, such as a `#Requires -Modules @{ ModuleName = 'Pester'; … }` line, a `BeforeDiscovery` or a `-ForEach`, so the stricter reading holds for every file. `BeforeEach`, `AfterAll` and `AfterEach` were not probed for what they see, and the narrowing does not touch them.
- The adapter's test fails with either half of the rule removed. The oracle test over the fixture agrees.

**On the corpora.** dbatools is unchanged at 7,477. AL-Go goes from 476 to 492 resolved dependencies, with none removed. All 16 new wires are AL-Go tests loading their own action through `$scriptRoot`, which a `BeforeAll` assigns. Sixteen is fewer than thirty, so the sample is the whole set. I read three in their source (`AnalyzeTests.Test.ps1` line 75 dot-sourcing `../AL-Go-Helper.ps1`, `RunHook.Test.ps1`, `CalculateArtifactNames.Test.ps1`) and all three are true. The other thirteen share the same template but were not read line by line. A second judge read all sixteen, below.

**The second judge** read all sixteen wires in their source, blind to the first verdicts, and found all sixteen true under Pester 5 and under 3 and 4. In each, a `BeforeAll` builds the path and an `It` dot-sources or runs it. The judge also noted:
- Several of those tests use Pester 5's `Should -Invoke`. Under Pester 4 that assertion fails, but only after the load has run.
- Under a 3.x release older than the first with `BeforeAll`, no `It` would run at all. The judge did not confirm which release that is.

The oracle, rerun over AL-Go with the rule written its second time, agrees: of 493 pairs it expects, the adapter draws 492 and invents none. The one it misses is the written-out list load in `Invoke-CopilotPRReview.psm1`, a file the grammar still reads with an error.

## More of the grammar's idioms _(added November 19, 2026, late night)_

Three more rules, each with a corpus entry that failed first: `test/corpus/multipliers.txt`, `labels.txt`, `switches.txt`.
- **A number's multiplier, type suffix and exponent in any case:** `1GB`, `10L`, `1E3`. Upstream allowed only the lower case; PowerShell reads both.
- **A label that `break` or `continue` names bare:** `continue main`. Upstream allowed only `:main` or an expression.
- **A switch label in quotes:** `"In Progress" { }`, `'Read-intent only' { }`, and `switch -regex` patterns. Upstream's bare-word token took `"In` for a whole label. A token of the switch's own, which never begins with a quote, leaves a quoted label to the string. Upstream's own switch tests, whose labels are numbers, still pass.

| | dbatools | AL-Go | AzureStack-Tools | tSQLt | shop | All |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| files with an error node, before this round | 68 | 31 | 10 | 3 | 1 | 113 |
| after | 46 | 30 | 9 | 3 | 1 | 89 |
| functions missing, before | 5 | 0 | 5 | 0 | 0 | 10 |
| after | 1 | 0 | 5 | 0 | 0 | 6 |

- No file is newly in error. `Install-DbaInstance.ps1` and the three functions inside it are no longer missing. Its first error was a quoted `switch -regex` label, so that mend most likely freed them, but the mends were not graded one at a time.
- **`switch` as an expression** (`$x = switch ($y) { … }`) needed no rule of its own. The small cases read without error once the earlier mends were in.
- **Not mended: a member after a method call, as a command argument** (`-Value $object.GetType().Name`). Upstream reads `$o.GetType()` in argument mode as a member access followed by a separate argument list, a rule of its own (`_command_element`), so nothing can follow the call. Reading it as an invocation would change the trees of upstream's own corpus tests, which the patch does not carry. It needs a decision on carrying upstream's corpus.
- **Not mended: the typographic quote.** PowerShell 7 here ends a single-quoted string at `’`. Whether Windows PowerShell 5.1's tokenizer does the same was not checked, since 5.1 is not here. That question goes to what only Windows can show.

## The root's rulings on this leg _(November 19, 2026, late night)_

- **A directory's name read in its words is not built.** The rule was the root's and the list above refutes it: no reading of a name's words tells `e2eTests` from `RunTests`. A helper script in a test folder with an unusual name stays drawn as code, which is the lesser error: it is shown and not hidden, and Pester's own name still marks every test file.
- **Which Pester a file is written for can be read from the file,** and is to be measured before it is built. The assertion written without a dash (`Should Be`, `Should Not Throw`) was removed in Pester 5, so a file that uses it is run by 3 or 4, where the file's own level and a `Describe`'s body do reach an `It`; a `BeforeDiscovery` or a `-ForEach` on a block is Pester 5's alone. A file with neither sign keeps the stricter reading. This matters for the owner's code: Windows PowerShell 5.1 ships Pester 3.4.0.
- **The patch may change one of upstream's corpus expectations where PowerShell's own parser shows that expectation wrong,** each such change listed with PowerShell's tree beside it. A corpus is a check, and a check that is wrong is corrected with its evidence. So a member after a method call as a command's argument is to be mended.
- **The typographic quote** goes to the Windows run with the rest of what only Windows can show.
- **The Pester probe's own files** are kept in [`pester-probe/`](pester-probe/Probe.Tests.ps1): the test file run under each version, the script that ran it, and what each version saw (`seen-3.4.0.json`, `seen-4.10.1.json`, `seen-5.9.1.json`, each with its `BeforeAll` reading). Copied there by the root on November 20 from the builder's scratch folder before the dev container was rebuilt.

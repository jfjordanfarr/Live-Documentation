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

All of these are built in `packages/engine/src/live-docs/adapters/powershell.ts`. The decision is in [the decisions log](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md), under "A PowerShell call reaches what its caller loads, else the only definition"; that entry is on the builder's branch with the code until the landing.

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

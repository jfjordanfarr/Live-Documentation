# powershell-wires

The PowerShell fixture for connections between scripts: which file a call reaches, the loads only a reading of `Join-Path`, variables and loops finds, which scripts are libraries rather than programs, and the functions a manifest offers. `expected/powershell-ast.json` is what PowerShell's own parser says about each file; `expected/compiler-edges.json` the edges the rules of `scripts/oracle/powershell-wires.ts` draw from it. The rules were measured on 2026-11-19 ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md)).

| Shape | Where |
| --- | --- |
| A dot-source of `Join-Path $PSScriptRoot '…'`, by position and by name with `-Resolve` | `Deploy.ps1` loads `lib/Common.ps1` and `lib/Paths.ps1` |
| A dot-source of a variable assigned once at the file's level from `Join-Path` | `Deploy.ps1` loads `lib/Helper.ps1` |
| `Import-Module (Join-Path $PSScriptRoot 'Tools')`, a module's folder | `Deploy.ps1` loads `Tools/Tools.psd1` |
| A script run by a path, quoted | `Deploy.ps1` runs `scripts/Run-Step.ps1` |
| A script run by `./path`, which the grammar reads as a dot-source: the one measured miss | `Deploy.ps1` runs `scripts/Clean.ps1` |
| A `foreach` over a variable assigned `@(Get-ChildItem …)` from a folder fixed through `$script:ModuleRoot` | `Tools/Tools.psm1` loads `Tools/Public/*.ps1` |
| `Get-ChildItem` piped to `ForEach-Object { . $_.FullName }` | `Tools/Tools.psm1` loads `Tools/Private/*.ps1` |
| A call to the only file that defines the function, which the caller does not load; it runs where its caller's scope holds it | `scripts/Run-Step.ps1` calls `Write-Log` in `lib/Common.ps1` |
| A test's stub inside a block, which counts as no definition | `tests/Tools.Tests.ps1` (`Write-Log`) |
| A call through a module's manifest and the files its root module lists | `Deploy.ps1` and `tests/Tools.Tests.ps1` call `Get-Tool` in `Tools/Public/Get-Tool.ps1` |
| A module's files calling each other | `Tools/Public/*.ps1` call `Format-Tool` in `Tools/Private/Format-Tool.ps1` |
| One name in three files: the loaded copy wins; two loaded, or none loaded, draw nothing; the caller's own copy is its own | `Copies/Use-Alpha.ps1`, `Copies/Use-Both.ps1`, `Copies/Use-Neither.ps1`, `Own.ps1` |
| A back-port of a command PowerShell ships: no wire by being the only definition, a wire when loaded | `Backport/Use-Archive.ps1`, `Backport/Use-Backport.ps1` |
| A library of functions only, and one that also sets up its scope | `lib/Common.ps1`, `lib/Paths.ps1` |
| The two kinds of library the rule calls programs, as measured | `lib/Helper.ps1` (imports inside an `if`), `lib/Settings.inc.ps1` (assigns a variable only) |
| `FunctionsToExport` offering two functions from their files and naming one the module does not define | `Tools/Tools.psd1` |
| A variable assigned once inside a test's `BeforeAll`, read by a load in the same block (since the evening of 2026-11-19) | `tests/Tools.Tests.ps1` loads `Tools/Private/Format-Tool.ps1` |
| A test's stub at its own level of a command another module supplies: working code that calls it is not wired to the test | `tests/Tools.Tests.ps1` (`Get-Vendor`), called by `scripts/Run-Step.ps1` |
| `Split-Path -Parent $MyInvocation.MyCommand.Path`, the Windows PowerShell 5.1 way to find a neighbour | `Neighbour.ps1` loads `lib/Common.ps1` |
| A loop over names written out, in a `foreach` and piped to `ForEach-Object` | `Extras/Extras.psm1` loads `Extras/One.ps1` and `Extras/Two.ps1` |
| A call by one of PowerShell's aliases, beside loaded functions named for the alias and for its command (since 2026-11-21; `pwsh -NoProfile -NonInteractive -File Aliases/Use-Aliases.ps1` printed `x`, Select-Object answering `select`, then "the fixture's Get-ChildItem", the loaded function answering `gci`) | `Aliases/Use-Aliases.ps1` calls `Get-ChildItem` in `Aliases/Helpers.ps1`, never `select` |

Index it: `npm run oracle:index -- tests/integration/fixtures/powershell-wires`.

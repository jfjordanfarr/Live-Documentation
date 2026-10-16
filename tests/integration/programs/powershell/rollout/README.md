# rollout

A small deployment tool written the way an estate's PowerShell is written: scripts that dot-source helpers and import modules, a module with a manifest, a module of classes reached through `using module`, and text that looks like code. It is the program the PowerShell adapter is measured on; `expected/compiler-edges.json` holds the file-to-file edges PowerShell's own parser gives, and `expected/powershell-ast.json` everything else the parser says about each file.

What it exercises, and where:

| Shape                                                                  | Where                                                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A script with `[CmdletBinding()]` and `param()`, and its own help      | `Invoke-Rollout.ps1`                                                                         |
| `using module` by path, before the parameters                          | `Invoke-Rollout.ps1` loads `modules/Rollout.Targets/Rollout.Targets.psm1`                    |
| `#requires -Modules` by name and by hashtable                           | `Invoke-Rollout.ps1`                                                                         |
| Dot-sourcing through `$PSScriptRoot`, quoted                           | `Invoke-Rollout.ps1` (`. "$PSScriptRoot/lib/Logging.ps1"`)                                   |
| Dot-sourcing by a relative path                                        | `Invoke-Rollout.ps1` (`. ./lib/Settings.ps1`), which is why it runs from this directory      |
| Dot-sourcing through `$PSScriptRoot` unquoted, with backslashes        | `scripts/Show-RolloutPlan.ps1` (`. $PSScriptRoot\..\lib\Logging.ps1`)                        |
| `Import-Module` by path, to a manifest, with `-Force -ErrorAction Stop` | `Invoke-Rollout.ps1`                                                                         |
| `Import-Module` by name                                                | `Invoke-Rollout.ps1` (`Microsoft.PowerShell.Utility`)                                        |
| `Import-Module` by an unquoted `$PSScriptRoot` path with backslashes   | `scripts/Show-RolloutPlan.ps1`; `Invoke-Rollout.ps1` (`Rollout.Notify`)                       |
| Help before the keyword, one blank line between                        | `Invoke-Rollout.ps1` (`Assert-RolloutTarget`)                                                |
| Help before the keyword, at the start of the body, at its end          | `lib/Logging.ps1`; `New-RolloutStep` and `Invoke-RolloutStep` in `Rollout.Steps.psm1`        |
| A comment that is not help                                             | `lib/Settings.ps1` (`Read-RolloutSettings`)                                                  |
| A nested function, a filter, a `script:`-scoped function               | `Get-StepAction`, `Select-PendingStep` in `Rollout.Steps.psm1`; `Get-LogPrefix`, `ConvertTo-TargetTier` |
| `Export-ModuleMember` with several names, and with `*`                 | `Rollout.Steps.psm1` (two functions kept private); `Rollout.Targets.psm1`                    |
| `Export-ModuleMember` from a variable, which only a run can read: every function is published, the private one too | `modules/Rollout.Notify/Rollout.Notify.psm1` |
| A class and an enum, symbols of their own; the constructor and method are not functions | `Rollout.Targets.psm1`                                                         |
| A module manifest naming its root module, and a required module by specification with a version | `modules/Rollout.Steps/Rollout.Steps.psd1`                                    |
| A data file                                                            | `config/targets.psd1`, read with `Import-PowerShellDataFile`                                 |
| `#` and `function` inside a here-string, a string and an expandable string | `lib/Logging.ps1`, `lib/Settings.ps1`                                                    |
| A bare-word comma list as a command's argument                          | `Format-Table Number, Target, Action` in `Rollout.Steps.psm1`, and the `Export-ModuleMember` |

Run it from this directory: `pwsh ./Invoke-Rollout.ps1 -Environment staging`, or `-WhatIf` to plan without running. Print a plan from anywhere: `pwsh scripts/Show-RolloutPlan.ps1 -Environment production`. Index it: `npm run oracle:index -- tests/integration/programs/powershell/rollout`.

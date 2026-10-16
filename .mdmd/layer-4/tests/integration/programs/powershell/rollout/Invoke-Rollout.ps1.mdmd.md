# tests/integration/programs/powershell/rollout/Invoke-Rollout.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/Invoke-Rollout.ps1
- Entry: program
- Generated At: 2026-10-16T21:50:05.183Z

## Authored
### Purpose
The entry script of the rollout sample program: rolls a release out to the targets of one environment, planning a copy, a restart and a verification for each, running the steps that change something and sending a notice of what it planned; `-WhatIf` plans without running.

### Notes
- Carries the shapes an estate's entry script has: `using module` by path before `[CmdletBinding()] param()`, `#requires -Modules` by name and by hashtable, dot-sources through a quoted `$PSScriptRoot` and by a relative path (so it runs from its own directory), `Import-Module` by path to a manifest with `-Force -ErrorAction Stop`, by name, and by an unquoted `$PSScriptRoot` path with backslashes to `Rollout.Notify.psm1` (since the evening of 2026-10-16), and a function whose help stands one blank line above its keyword. The bundled grammar had no `using` statement and read the `param()` after one with errors; the engine's own grammar (2026-10-16) reads both.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Assert-RolloutTarget` {#symbol-assert-rollouttarget}
- Type: function
- Source: [source](../../../../../../../tests/integration/programs/powershell/rollout/Invoke-Rollout.ps1#L47)

##### `Assert-RolloutTarget` — Summary
Stops the rollout when an environment has no targets.

##### `Assert-RolloutTarget` — Parameters
- `Targets`: The targets read for the environment.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.PowerShell.Management`
- `Microsoft.PowerShell.Utility`
- [`Logging`](./lib/Logging.ps1.mdmd.md)
- [`Settings`](./lib/Settings.ps1.mdmd.md)
- [`Rollout.Notify`](./modules/Rollout.Notify/Rollout.Notify.psm1.mdmd.md)
- [`Rollout.Steps`](./modules/Rollout.Steps/Rollout.Steps.psd1.mdmd.md)
- [`Rollout.Targets`](./modules/Rollout.Targets/Rollout.Targets.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1
- Entry: tooling
- Generated At: 2026-11-19T20:49:37.563Z

## Authored
### Purpose
The manifest of the `Rollout.Steps` module: its root module, version, the module it requires and the functions it exports; the entry script imports the module through it.

### Notes
- Read as a manifest since 2026-10-16: the module `Rollout.Steps` is its symbol, its root module a dependency and the `module` entry it declares, and `Microsoft.PowerShell.Utility@7.0.0.0` an external dependency, from a `RequiredModules` specification added that day so that a version is measured against the oracle. The program still runs under PowerShell 7, which carries that module.
- A `tooling` entry by the package it publishes, since a `.psd1`'s name cannot tell a manifest from a data file such as `config/targets.psd1`, which is no entry.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Rollout.Steps` {#symbol-rolloutsteps}
- Type: package
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.PowerShell.Utility@7.0.0.0`
- [`Rollout.Steps`](./Rollout.Steps.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Re-Exported Symbol Anchors -->
### Re-Exported Symbol Anchors
#### `Format-RolloutReport` {#symbol-format-rolloutreport}
- Re-exported from [`Rollout.Steps`](./Rollout.Steps.psm1.mdmd.md#symbol-format-rolloutreport)

#### `Get-RolloutPlan` {#symbol-get-rolloutplan}
- Re-exported from [`Rollout.Steps`](./Rollout.Steps.psm1.mdmd.md#symbol-get-rolloutplan)

#### `Invoke-RolloutStep` {#symbol-invoke-rolloutstep}
- Re-exported from [`Rollout.Steps`](./Rollout.Steps.psm1.mdmd.md#symbol-invoke-rolloutstep)

#### `New-RolloutStep` {#symbol-new-rolloutstep}
- Re-exported from [`Rollout.Steps`](./Rollout.Steps.psm1.mdmd.md#symbol-new-rolloutstep)

#### `Select-PendingStep` {#symbol-select-pendingstep}
- Re-exported from [`Rollout.Steps`](./Rollout.Steps.psm1.mdmd.md#symbol-select-pendingstep)
<!-- LIVE-DOC:END Re-Exported Symbol Anchors -->

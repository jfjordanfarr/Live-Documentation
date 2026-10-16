# tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psm1
- Entry: module of [`tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1`](./Rollout.Steps.psd1.mdmd.md)
- Generated At: 2026-10-16T21:23:48.943Z

## Authored
### Purpose
The module that plans the steps of a rollout and runs them: makes a step, plans a copy, a restart and a verification per target, selects the steps that change something, runs them and formats the report.

### Notes
- Exports five functions with `Export-ModuleMember` and a bare-word list, keeping the nested `Get-StepAction` and `Get-StepCount` private; its help stands above a keyword, first in a body and last in a body; `Select-PendingStep` is a filter. The bundled grammar could not read the bare-word list, so until the engine built its own grammar on 2026-10-16 the adapter narrowed nothing here and documented the two private functions, a miss the oracle measured; now it publishes the five. The root module of `Rollout.Steps.psd1`, which declares it a `module` entry.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `New-RolloutStep` {#symbol-new-rolloutstep}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psm1#L5)

##### `New-RolloutStep` — Summary
Describes one step of a rollout: a target and the action taken on it.

##### `New-RolloutStep` — Parameters
- `Target`: The host the step acts on.
- `Action`: What the step does: copy, restart or verify.

#### `Get-RolloutPlan` {#symbol-get-rolloutplan}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psm1#L29)

##### `Get-RolloutPlan` — Summary
Plans a rollout: a copy, a restart and a verification for each target.

#### `Select-PendingStep` {#symbol-select-pendingstep}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psm1#L43)

#### `Invoke-RolloutStep` {#symbol-invoke-rolloutstep}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psm1#L47)

##### `Invoke-RolloutStep` — Summary
Runs one step and passes it on.

##### `Invoke-RolloutStep` — Parameters
- `Step`: The step, as New-RolloutStep made it.

#### `Format-RolloutReport` {#symbol-format-rolloutreport}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psm1#L62)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

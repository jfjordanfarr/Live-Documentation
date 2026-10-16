# tests/integration/programs/powershell/rollout/modules/Rollout.Targets/Rollout.Targets.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/modules/Rollout.Targets/Rollout.Targets.psm1
- Generated At: 2026-10-16T21:23:48.963Z

## Authored
### Purpose
The rollout program's targets as typed objects: an enum of tiers, a class of target, and the function that reads one environment's targets from the settings.

### Notes
- Reached by the entry script through `using module`, which makes its class a type the script can name; it exports `*`, the `script:`-scoped converter included. PowerShell's parser holds the class's constructor and method as function definitions; neither the oracle's published list nor the adapter counts them as functions. The enum and the class are symbols of their own kinds since 2026-10-16, measured against the parser's type definitions.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TargetTier` {#symbol-targettier}
- Type: enum
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Targets/Rollout.Targets.psm1#L4)

#### `RolloutTarget` {#symbol-rollouttarget}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Targets/Rollout.Targets.psm1#L9)

#### `Get-RolloutTarget` {#symbol-get-rollouttarget}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Targets/Rollout.Targets.psm1#L33)

##### `Get-RolloutTarget` — Summary
Reads the targets of one environment from the settings.

##### `Get-RolloutTarget` — Parameters
- `Settings`: The settings, as config/targets.psd1 holds them.
- `Environment`: The environment whose targets are wanted.

#### `script:ConvertTo-TargetTier` {#symbol-scriptconvertto-targettier}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Targets/Rollout.Targets.psm1#L40)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

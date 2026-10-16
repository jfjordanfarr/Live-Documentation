# tests/integration/programs/powershell/rollout/scripts/Show-RolloutPlan.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/scripts/Show-RolloutPlan.ps1
- Entry: program
- Generated At: 2026-10-16T21:23:48.983Z

## Authored
### Purpose
Prints the plan a rollout would run for an environment, without running it, from any working directory.

### Notes
- Dot-sources and imports through an unquoted `$PSScriptRoot` with backslashes, which PowerShell's argument mode reads as one word. The bundled grammar parsed the dot-source and not the same shape as `Import-Module`'s argument, so this script's edge to `Rollout.Steps.psm1` was a measured miss until the engine built its own grammar on 2026-10-16; the edge is found now.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Logging`](../lib/Logging.ps1.mdmd.md)
- [`Rollout.Steps`](../modules/Rollout.Steps/Rollout.Steps.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

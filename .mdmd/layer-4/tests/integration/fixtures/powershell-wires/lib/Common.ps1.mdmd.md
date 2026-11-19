# tests/integration/fixtures/powershell-wires/lib/Common.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/lib/Common.ps1
- Generated At: 2026-11-19T20:49:36.121Z

## Authored
### Purpose
A library of functions only, `Write-Log` and `Get-Setting`, dot-sourced by `Deploy.ps1`: not the program's entry.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).
- `scripts/Run-Step.ps1` calls `Write-Log` without loading this file, and reaches it because `Deploy.ps1`, which runs it, dot-sourced it here; the wire is drawn because this is the only file that defines `Write-Log` at its own level, the test's stub in `tests/Tools.Tests.ps1` standing inside a block.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Write-Log` {#symbol-write-log}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-wires/lib/Common.ps1#L5)

##### `Write-Log` — Summary
Writes a line of the deployment's log.

#### `Get-Setting` {#symbol-get-setting}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-wires/lib/Common.ps1#L14)

##### `Get-Setting` — Summary
Reads one setting of the deployment.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

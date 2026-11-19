# tests/integration/fixtures/powershell-wires/scripts/Run-Step.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/scripts/Run-Step.ps1
- Entry: program
- Generated At: 2026-11-19T20:49:36.151Z

## Authored
### Purpose
A step script `Deploy.ps1` runs by its path; it calls `Write-Log`, which its caller's scope holds.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Common.Write-Log`](../lib/Common.ps1.mdmd.md#symbol-write-log)
<!-- LIVE-DOC:END Dependencies -->

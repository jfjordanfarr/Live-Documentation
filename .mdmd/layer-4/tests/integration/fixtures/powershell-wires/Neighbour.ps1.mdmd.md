# `tests/integration/fixtures/powershell-wires/Neighbour.ps1`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/powershell-wires/Neighbour.ps1`
- Entry: program
- Generated At: 2026-11-21T02:25:26.148Z

## Authored
### Purpose
Finds its neighbour the Windows PowerShell 5.1 way, `$here = Split-Path -Parent $MyInvocation.MyCommand.Path`, then dot-sources `lib/Common.ps1` from it and calls `Write-Log`.

### Notes
- Written on the evening of 2026-11-19 for the root's rulings on the rule "loaded, else unique" ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#rulings-after-the-build-added-november-19-2026-late-evening)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Common.Write-Log`](./lib/Common.ps1.mdmd.md#symbol-write-log)
<!-- LIVE-DOC:END Dependencies -->

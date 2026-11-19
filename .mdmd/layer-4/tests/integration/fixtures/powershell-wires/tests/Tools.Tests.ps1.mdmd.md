# tests/integration/fixtures/powershell-wires/tests/Tools.Tests.ps1

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/fixtures/powershell-wires/tests/Tools.Tests.ps1
- Entry: program
- Generated At: 2026-11-19T20:49:36.161Z

## Authored
### Purpose
A Pester test that imports the Tools manifest and calls `Get-Tool`, reaching its file through the module; its stub of `Write-Log` inside `BeforeAll` counts as no definition elsewhere.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Write-Log` {#symbol-write-log}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-wires/tests/Tools.Tests.ps1#L8)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Get-Tool`](../Tools/Public/Get-Tool.ps1.mdmd.md#symbol-get-tool)
- [`Tools`](../Tools/Tools.psd1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

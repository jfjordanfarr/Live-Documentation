# tests/integration/fixtures/powershell-wires/Tools/Public/Get-Tool.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/Tools/Public/Get-Tool.ps1
- Generated At: 2026-11-19T20:49:36.043Z

## Authored
### Purpose
`Get-Tool`, one public function in its own file, as dbatools lays out its module; it calls the private `Format-Tool`, which the module loads.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Get-Tool` {#symbol-get-tool}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/powershell-wires/Tools/Public/Get-Tool.ps1#L5)

##### `Get-Tool` — Summary
Finds a tool by name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Format-Tool`](../Private/Format-Tool.ps1.mdmd.md#symbol-format-tool)
<!-- LIVE-DOC:END Dependencies -->

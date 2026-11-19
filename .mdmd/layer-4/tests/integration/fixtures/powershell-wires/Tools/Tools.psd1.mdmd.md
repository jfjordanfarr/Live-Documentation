# tests/integration/fixtures/powershell-wires/Tools/Tools.psd1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/Tools/Tools.psd1
- Entry: tooling
- Generated At: 2026-11-19T20:49:36.064Z

## Authored
### Purpose
The Tools module's manifest: its root module, and `FunctionsToExport` naming `Get-Tool` and `Set-Tool`, which it offers from their files, and `Remove-Tool`, which the module does not define and which is not offered.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Tools` {#symbol-tools}
- Type: package
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-wires/Tools/Tools.psd1#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Tools`](./Tools.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Re-Exported Symbol Anchors -->
### Re-Exported Symbol Anchors
#### `Get-Tool` {#symbol-get-tool}
- Re-exported from [`Get-Tool`](./Public/Get-Tool.ps1.mdmd.md#symbol-get-tool)

#### `Set-Tool` {#symbol-set-tool}
- Re-exported from [`Set-Tool`](./Public/Set-Tool.ps1.mdmd.md#symbol-set-tool)
<!-- LIVE-DOC:END Re-Exported Symbol Anchors -->

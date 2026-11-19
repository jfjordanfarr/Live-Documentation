# tests/integration/fixtures/powershell-wires/Extras/Two.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/Extras/Two.ps1
- Generated At: 2026-11-19T21:23:46.901Z

## Authored
### Purpose
`Get-Two`, loaded by `Extras.psm1`'s pipeline over a written-out name; it calls `Get-One`, which the module loads.

### Notes
- Written on the evening of 2026-11-19 for the root's rulings on the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#rulings-after-the-build-added-november-19-2026-late-evening)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Get-Two` {#symbol-get-two}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-wires/Extras/Two.ps1#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`One.Get-One`](./One.ps1.mdmd.md#symbol-get-one)
<!-- LIVE-DOC:END Dependencies -->

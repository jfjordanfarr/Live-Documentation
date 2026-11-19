# tests/integration/fixtures/powershell-wires/Extras/Extras.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/Extras/Extras.psm1
- Generated At: 2026-11-19T21:23:46.890Z

## Authored
### Purpose
Loads its two helpers by names written out, once in a `foreach` over `@('One.ps1')` and once by `'Two.ps1' | ForEach-Object`, each name read with the loop's item standing for it.

### Notes
- Written on the evening of 2026-11-19 for the root's rulings on the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#rulings-after-the-build-added-november-19-2026-late-evening)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `$PSScriptRoot\$_`
- [`One`](./One.ps1.mdmd.md)
- [`Two`](./Two.ps1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/powershell-wires/Tools/Tools.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/Tools/Tools.psm1
- Entry: module of [`tests/integration/fixtures/powershell-wires/Tools/Tools.psd1`](./Tools.psd1.mdmd.md)
- Generated At: 2026-11-19T20:49:36.076Z

## Authored
### Purpose
The Tools module's root: dot-sources `Public/*.ps1` in a `foreach` over a variable assigned `@(Get-ChildItem ...)` from a folder fixed through `$script:ModuleRoot`, and `Private/*.ps1` by `Get-ChildItem` piped to `ForEach-Object`; publishes two functions.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Format-Tool`](./Private/Format-Tool.ps1.mdmd.md)
- [`Get-Tool`](./Public/Get-Tool.ps1.mdmd.md)
- [`Set-Tool`](./Public/Set-Tool.ps1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

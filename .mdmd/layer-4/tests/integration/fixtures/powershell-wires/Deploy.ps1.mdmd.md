# tests/integration/fixtures/powershell-wires/Deploy.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/Deploy.ps1
- Entry: program
- Generated At: 2026-11-19T20:49:36.008Z

## Authored
### Purpose
The wires fixture's program: loads its helpers by `Join-Path` in both parameter forms and through a variable assigned once, dot-sources an include by a `$PSScriptRoot` string, imports the Tools module by its folder, calls functions the helpers and the module define, and runs two step scripts by their paths.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).
- Each line is one form [the fixture's README](../../../../../../tests/integration/fixtures/powershell-wires/README.md) names. `./scripts/Clean.ps1` is the one measured miss: the grammar reads it as the dot-source `. /scripts/Clean.ps1`, so this doc keeps a rooted `/scripts/Clean.ps1` where PowerShell runs the script beside it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `/scripts/Clean.ps1`
- [`Get-Tool`](./Tools/Public/Get-Tool.ps1.mdmd.md#symbol-get-tool)
- [`Set-Tool`](./Tools/Public/Set-Tool.ps1.mdmd.md#symbol-set-tool)
- [`Tools`](./Tools/Tools.psd1.mdmd.md)
- [`Common.Get-Setting`](./lib/Common.ps1.mdmd.md#symbol-get-setting)
- [`Common.Write-Log`](./lib/Common.ps1.mdmd.md#symbol-write-log)
- [`Helper`](./lib/Helper.ps1.mdmd.md)
- [`Paths.Get-DataPath`](./lib/Paths.ps1.mdmd.md#symbol-get-datapath)
- [`Settings.inc`](./lib/Settings.inc.ps1.mdmd.md)
- [`Run-Step`](./scripts/Run-Step.ps1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

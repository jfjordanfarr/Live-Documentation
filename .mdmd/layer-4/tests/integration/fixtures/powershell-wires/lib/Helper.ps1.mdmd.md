# tests/integration/fixtures/powershell-wires/lib/Helper.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/lib/Helper.ps1
- Entry: program
- Generated At: 2026-11-19T20:49:36.130Z

## Authored
### Purpose
A helper that imports a module inside an `if` before its function: dot-sourced, never run, yet a program by the library rule, one of the rule's two measured misses, pinned.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Compress-Release` {#symbol-compress-release}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-wires/lib/Helper.ps1#L9)

##### `Compress-Release` — Summary
Packs a release folder into an archive.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.PowerShell.Archive`
<!-- LIVE-DOC:END Dependencies -->

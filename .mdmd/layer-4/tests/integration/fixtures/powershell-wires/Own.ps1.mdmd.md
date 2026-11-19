# tests/integration/fixtures/powershell-wires/Own.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-wires/Own.ps1
- Entry: program
- Generated At: 2026-11-19T20:49:36.016Z

## Authored
### Purpose
Defines its own `Resolve-Target`, as `Copies/Alpha.psm1` and `Copies/Beta.psm1` do, and calls it: a call reaches the caller's own definition, so no wire is drawn.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Resolve-Target` {#symbol-resolve-target}
- Type: function
- Source: [source](../../../../../../tests/integration/fixtures/powershell-wires/Own.ps1#L2)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

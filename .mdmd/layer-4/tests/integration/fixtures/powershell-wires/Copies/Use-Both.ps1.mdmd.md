# `tests/integration/fixtures/powershell-wires/Copies/Use-Both.ps1`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/powershell-wires/Copies/Use-Both.ps1`
- Entry: program
- Generated At: 2026-11-21T02:25:26.135Z

## Authored
### Purpose
Imports both `Alpha.psm1` and `Beta.psm1` and calls `Resolve-Target`: two loaded definitions draw no call wire, only the two loads.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Alpha`](./Alpha.psm1.mdmd.md)
- [`Beta`](./Beta.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

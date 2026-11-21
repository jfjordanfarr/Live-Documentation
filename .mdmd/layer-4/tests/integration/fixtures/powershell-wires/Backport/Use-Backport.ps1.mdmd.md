# `tests/integration/fixtures/powershell-wires/Backport/Use-Backport.ps1`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/powershell-wires/Backport/Use-Backport.ps1`
- Entry: program
- Generated At: 2026-11-21T02:25:26.128Z

## Authored
### Purpose
Dot-sources the back-port and calls `Expand-Archive`: a definition the caller loads is what runs, whatever the name, so the call is wired to it.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Expand-Archive`](./Expand-Archive.ps1.mdmd.md#symbol-expand-archive)
<!-- LIVE-DOC:END Dependencies -->

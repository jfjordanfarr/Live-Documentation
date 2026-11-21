# `tests/integration/fixtures/powershell-wires/Build/Use-Build.ps1`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/powershell-wires/Build/Use-Build.ps1`
- Entry: program
- Generated At: 2026-11-21T19:30:06.807Z

## Authored
### Purpose
Dot-sources `./build`, a relative path without its extension beside both `build` and `build.ps1`: `build.ps1` on Windows, as the owner's run kept in `expected/windows-runs.json` showed and the reader reads it; `build` for pwsh on Linux, whose parser record says so, the difference the oracle test's register holds by its cause.

### Notes
- Added on 2026-11-21 ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`build`](./build.ps1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

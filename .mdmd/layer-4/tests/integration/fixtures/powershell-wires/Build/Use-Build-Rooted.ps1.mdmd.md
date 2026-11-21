# `tests/integration/fixtures/powershell-wires/Build/Use-Build-Rooted.ps1`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/powershell-wires/Build/Use-Build-Rooted.ps1`
- Entry: program
- Generated At: 2026-11-21T19:30:06.805Z

## Authored
### Purpose
Dot-sources `"$PSScriptRoot/build"`, a rooted path without its extension beside both `build` and `build.ps1`, which PowerShell runs as `build` on Windows and on Unix alike, its literal tried first; the reader and the parser's record agree.

### Notes
- Added on 2026-11-21 ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`build`](./build.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

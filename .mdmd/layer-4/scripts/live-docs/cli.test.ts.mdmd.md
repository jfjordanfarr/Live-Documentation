# `scripts/live-docs/cli.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/live-docs/cli.test.ts`
- Generated At: 2026-11-19T22:40:13.220Z

## Authored
### Purpose
Holds the edge every Live Docs command shares to what a person on Windows meets first: a configuration saved by Windows PowerShell 5.1, with a byte-order mark (`Set-Content -Encoding UTF8`) or as UTF-16 (`Out-File`, `>`), read as if saved plainly; and the folder a command is run from, which is where the person stood when npm ran the command, and a process's own working directory when npm did not start it; and the nearest folder at or above a folder that holds a configuration, the workspace when none is named.

### Notes
- Written 2026-11-19 after [the cold run](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#every-crash) found every command stopping on a configuration with a mark (its crash 3); [the Windows and command-line probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) mended it. The three cases with a mark failed before the mend.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`cli.invocationFolder`](./cli.ts.mdmd.md#symbol-invocationfolder)
- [`cli.nearestConfiguredFolder`](./cli.ts.mdmd.md#symbol-nearestconfiguredfolder)
- [`cli.readConfiguration`](./cli.ts.mdmd.md#symbol-readconfiguration)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

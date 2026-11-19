# scripts/live-docs/run-all.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/run-all.ts
- Entry: command `livedocs` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-19T19:18:28.000Z

## Authored
### Purpose
Runs generation to completion before lint reads the resulting Live Docs. It is the shared pipeline for a local mirror update and for the non-writing freshness check used by CI.

### Notes
- Created during the Windows CLI migration (Oct 2025) to replace ad-hoc shell chains. The script consumes its own stage-skip flags and forwards every other argument to `generate.ts`; lint receives only configuration flags.
- The [October 19 audit](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-19/2026-10-19.1.record.md#turn-16) found that importing the commands returned before their asynchronous work finished: lint could pass before the first doc existed. Each stage now runs as a child command whose exit is awaited, so a failed generation prevents lint and a lint failure stops the pipeline. `--check` is forwarded to generation; ordinary `--dry-run` remains a successful preview.
- Since 2026-11-19 each stage runs from the folder the pipeline was run from, its script and tsx found by this file's own location, so that the stages take a relative `--workspace` or `--config`, and their default workspace, from where the person stood, as each command does ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md)). The pipeline no longer names the workspace's configuration to each stage, since each reads it unasked.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:path` - `path`
- `node:process` - `process`
- [`cli.invocationFolder`](./cli.ts.mdmd.md#symbol-invocationfolder)
<!-- LIVE-DOC:END Dependencies -->

# scripts/live-docs/run-all.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/run-all.ts
- Entry: command `livedocs` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-19T16:53:00.372Z

## Authored
### Purpose
Runs generation to completion before lint reads the resulting Live Docs. It is the shared pipeline for a local mirror update and for the non-writing freshness check used by CI.

### Notes
- Created during the Windows CLI migration (Oct 2025) to replace ad-hoc shell chains. The script consumes its own stage-skip flags and forwards every other argument to `generate.ts`; lint receives only configuration flags.
- The [October 19 audit](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-16) found that importing the commands returned before their asynchronous work finished: lint could pass before the first doc existed. Each stage now runs as a child command whose exit is awaited, so a failed generation prevents lint and a lint failure stops the pipeline. `--check` is forwarded to generation; ordinary `--dry-run` remains a successful preview.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->

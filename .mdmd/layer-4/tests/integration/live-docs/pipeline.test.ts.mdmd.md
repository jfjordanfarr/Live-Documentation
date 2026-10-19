# tests/integration/live-docs/pipeline.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/pipeline.test.ts
- Generated At: 2026-10-19T16:54:11.517Z

## Authored
### Purpose
Exercises the actual two-command Live Docs pipeline in temporary workspaces, checking that generation finishes before lint, failures stop the chain, and CI freshness checks report drift without changing the mirror.

### Notes
- Written for the [October 19 audit and implementation](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-16), after a fresh workspace had passed lint before its first doc existed. The test spawns the pipeline CLI rather than calling its helpers, so it observes child-command completion and exit status.
- The freshness journey checks a missing doc, a changed source interface and a deleted source, compares both doc and graph-index bytes before and after each check, and keeps the older `--dry-run` success contract.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/slopcop/assetsAudit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/slopcop/assetsAudit.test.ts
- Generated At: 2026-09-27T23:21:39.732Z

## Authored
### Purpose
Exercises the SlopCop asset audit CLI against the healed fixture workspace to prove the baseline stays green and that runtime mutations trigger structured missing-asset diagnostics ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).

### Notes
- Copies the fixture into a temp workspace before deleting files so diagnostics can be asserted without polluting the curated manifest, keeping `npm run fixtures:verify` healthy ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).

- `tsx` is found where Node resolves it (`require.resolve("tsx/cli")`) since 2026-11-16, as the slopcop scripts' own tests find it: a builder's worktree has no `node_modules` of its own, so the path under the repository's root failed every case there ([Turn 5 of the November 15 record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs/promises`
- `node:os`
- `node:path`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

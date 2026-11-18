# tests/integration/slopcop/symbolsAudit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/slopcop/symbolsAudit.test.ts
- Generated At: 2026-09-27T23:21:39.744Z

## Authored
### Purpose
Runs the SlopCop symbol audit against the healed fixture workspace to prove the CLI stays green on baseline content and emits structured issues when duplicate headings or broken anchors are introduced ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).

### Notes
- Each scenario copies the fixture into a temp workspace, mutates markdown, and expects JSON diagnostics (`duplicate-heading`, `missing-anchor`) so the audit can fail fast without contaminating the curated corpus ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).
- Shared a 20s timeout after Safe Commit uncovered slow spawn/compile phases, keeping the symbol audit reliable across Windows CI runs ([safe commit stabilization](../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/2025-11-16/2025-11-16.md)).

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

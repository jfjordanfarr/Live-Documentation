# tests/integration/slopcop/symbolsAudit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/slopcop/symbolsAudit.test.ts
- Live Doc ID: LD-test-tests-integration-slopcop-symbolsaudit-test-ts
- Generated At: 2026-01-15T02:41:19.185Z

## Authored
### Purpose
Runs the SlopCop symbol audit against the healed fixture workspace to prove the CLI stays green on baseline content and emits structured issues when duplicate headings or broken anchors are introduced ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).

### Notes
- Each scenario copies the fixture into a temp workspace, mutates markdown, and expects JSON diagnostics (`duplicate-heading`, `missing-anchor`) so the audit can fail fast without contaminating the curated corpus ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).
- Shared a 20s timeout after Safe Commit uncovered slow spawn/compile phases, keeping the symbol audit reliable across Windows CI runs ([safe commit stabilization](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:19.185Z","inputHash":"dae8c5129c7390c9"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# tests/integration/slopcop/assetsAudit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/slopcop/assetsAudit.test.ts
- Live Doc ID: LD-test-tests-integration-slopcop-assetsaudit-test-ts
- Generated At: 2026-02-03T21:55:51.375Z

## Authored
### Purpose
Exercises the SlopCop asset audit CLI against the healed fixture workspace to prove the baseline stays green and that runtime mutations trigger structured missing-asset diagnostics ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).

### Notes
- Copies the fixture into a temp workspace before deleting files so diagnostics can be asserted without polluting the curated manifest, keeping `npm run fixtures:verify` healthy ([fixture harness and integration suites](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-27.SUMMARIZED.md#turn-22-healing-fixtures-documenting-harnesses--tests-lines-6801-7200)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:51.375Z","inputHash":"0649e4e5cc11f2e5"}]} -->
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

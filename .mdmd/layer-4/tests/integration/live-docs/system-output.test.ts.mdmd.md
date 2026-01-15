# tests/integration/live-docs/system-output.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/system-output.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-system-output-test-ts
- Generated At: 2026-01-15T02:41:19.182Z

## Authored
### Purpose
Proves the `live-docs:system` CLI can materialise Layer-3 system docs either to stdout or a caller-supplied directory without polluting the repo, anchoring the new workflow introduced alongside the system wrapper ([system CLI roll-out](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-26-stand-up-on-demand-cli--integration-coverage-lines-3521-3700)).

### Notes
- Confirms the generator no longer tracks `.live-documentation/system/` in git by asserting the temp workspace is discarded after each run, keeping the system view ephemeral for follow-on tooling ([system CLI roll-out](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-26-stand-up-on-demand-cli--integration-coverage-lines-3521-3700)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:19.182Z","inputHash":"9cb04298eba94ec3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert`
- `node:fs/promises`
- `node:os`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# tests/integration/live-docs/evidence.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/evidence.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-evidence-test-ts
- Generated At: 2026-02-03T21:55:51.309Z

## Authored
### Purpose
Exercises the evidence bridge end to end so coverage manifests, fixtures, and waiver files produce the expected Live Doc sections before regressions land in Stage-0 ([integration rerun](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).

### Notes
- Validates manifest ingestion by asserting Observed Evidence targets and fixture links after generator changes broke the legacy regex assertions ([diagnostic recap](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L6258-L6286)).
- Covers empty-manifest paths to guarantee Supporting Fixtures defaults remain visible when no artifacts are recorded ([integration rerun](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).
- Confirms waiver files emit explanatory comments so reviewers can trace manual evidence waivers inside the rendered doc ([integration rerun](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:51.309Z","inputHash":"548e0bf1e424be58"}]} -->
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

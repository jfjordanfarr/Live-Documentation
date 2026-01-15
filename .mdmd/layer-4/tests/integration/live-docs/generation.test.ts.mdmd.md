# tests/integration/live-docs/generation.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/generation.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-generation-test-ts
- Generated At: 2026-01-15T02:41:19.175Z

## Authored
### Purpose
Spins up a scratch workspace, seeds a sample TypeScript module, and runs the generator twice to prove authored sections survive regeneration while the output remains byte-identical after the Stage-0 migration work ([integration log](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).

### Notes
- Pulls `LIVE_DOCUMENTATION_FILE_EXTENSION` from the shared config so the test tracks the repo-wide shift to `.md` Live Docs without hard-coded extensions ([Stage-0 extension migration](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-15-shift-live-docs-to-md-outputs-lines-1401-1820)).
- Seeds a legacy `### Description` block to ensure the generator keeps unexpected human-authored headings even after the template dropped that section ([deterministic template refresh](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-09.SUMMARIZED.md#turn-13-regenerate-base-layer-without-description-lines-1841-1990)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:19.175Z","inputHash":"97671717f639140a"}]} -->
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

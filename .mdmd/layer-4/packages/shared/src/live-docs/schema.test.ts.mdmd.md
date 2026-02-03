# packages/shared/src/live-docs/schema.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/schema.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-schema-test-ts
- Generated At: 2026-02-03T21:55:40.650Z

## Authored
### Purpose
Validates Live Doc metadata normalization so config defaults, provenance merging, and staged outputs stay deterministic across generators and lint.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760]

### Notes
- Added with the schema hardening pass to guard the Stage‑0 rollout from regressions as manifests and generators ingested the new metadata contracts.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760]
- Continues to back the refactored Stage‑0 toolchain that consumes shared schema utilities during the Nov 11 live-docs system split.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-08-begin-refactor--stage-0-extraction-lines-961-1100]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.650Z","inputHash":"a624bc69704701be"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`schema.DEFAULT_LIVE_DOC_LAYER`](./schema.ts.mdmd.md#symbol-default_live_doc_layer)
- [`schema.normalizeLiveDocMetadata`](./schema.ts.mdmd.md#symbol-normalizelivedocmetadata)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/config: [liveDocumentationConfig.ts](../config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [schema.ts](./schema.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

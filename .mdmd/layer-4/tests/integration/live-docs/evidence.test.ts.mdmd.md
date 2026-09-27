# tests/integration/live-docs/evidence.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/evidence.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-evidence-test-ts
- Generated At: 2026-09-27T08:09:23.224Z

## Authored
### Purpose
Exercises the evidence bridge end to end so coverage manifests, fixtures, and waiver files produce the expected Live Doc sections before regressions land in Stage-0 ([integration rerun](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).

### Notes
- Validates manifest ingestion by asserting Observed Evidence targets and fixture links after generator changes broke the legacy regex assertions ([diagnostic recap](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L6258-L6286)).
- Covers empty-manifest paths to guarantee Supporting Fixtures defaults remain visible when no artifacts are recorded ([integration rerun](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).
- Confirms waiver files emit explanatory comments so reviewers can trace manual evidence waivers inside the rendered doc ([integration rerun](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T08:09:23.224Z","inputHash":"af66d3b139058d5b"}]} -->
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
- [`generator.generateLiveDocs`](../../../packages/server/src/features/live-docs/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- `vitest` - `describe`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Integration Tests
- packages/server/src/features/live-docs: [evidenceBridge.ts](../../../packages/server/src/features/live-docs/evidenceBridge.ts.mdmd.md), [generator.ts](../../../packages/server/src/features/live-docs/generator.ts.mdmd.md)
- packages/shared/src/config: [liveDocumentationConfig.ts](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../../../packages/shared/src/live-docs/core.ts.mdmd.md), [markdown.ts](../../../packages/shared/src/live-docs/markdown.ts.mdmd.md), [schema.ts](../../../packages/shared/src/live-docs/schema.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../../packages/shared/src/tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

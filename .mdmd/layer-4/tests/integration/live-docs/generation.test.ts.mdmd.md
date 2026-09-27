# tests/integration/live-docs/generation.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/generation.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-generation-test-ts
- Generated At: 2026-09-27T09:36:45.803Z

## Authored
### Purpose
Spins up a scratch workspace, seeds a sample TypeScript module, and runs the generator twice to prove authored sections survive regeneration while the output remains byte-identical after the Stage-0 migration work ([integration log](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).

### Notes
- Pulls `LIVE_DOCUMENTATION_FILE_EXTENSION` from the shared config so the test tracks the repo-wide shift to `.md` Live Docs without hard-coded extensions ([Stage-0 extension migration](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-15-shift-live-docs-to-md-outputs-lines-1401-1820)).
- Seeds a legacy `### Description` block to ensure the generator keeps unexpected human-authored headings even after the template dropped that section ([deterministic template refresh](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-09.SUMMARIZED.md#turn-13-regenerate-base-layer-without-description-lines-1841-1990)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T09:36:45.803Z","inputHash":"0cfb5cf4af3f3c18"}]} -->
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
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- `vitest` - `describe`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Integration Tests
- packages/generator/src: [evidenceBridge.ts](../../../packages/generator/src/evidenceBridge.ts.mdmd.md), [generator.ts](../../../packages/generator/src/generator.ts.mdmd.md)
- packages/shared/src/config: [liveDocumentationConfig.ts](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../../../packages/shared/src/live-docs/core.ts.mdmd.md), [markdown.ts](../../../packages/shared/src/live-docs/markdown.ts.mdmd.md), [schema.ts](../../../packages/shared/src/live-docs/schema.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../../packages/shared/src/tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# tests/integration/live-docs/polyglot-fixtures.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/polyglot-fixtures.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-polyglot-fixtures-test-ts
- Generated At: 2026-09-27T09:36:45.823Z

## Authored
### Purpose
Runs the Live Docs generator across the curated polyglot fixture workspaces so we can diff the markdown produced for each language and guard the adapter registry against regressions ([C# adapter + polyglot integration](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-11-build-the-c-adapter--polyglot-test-lines-2061-2300)).

### Notes
- Expanded iteratively as new adapters landed—first adding Java coverage, then layering in the rest of the Roslyn-era fixtures—so the suite snapshots representative markdown for every supported language ([Java adapter expansion](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-13.SUMMARIZED.md#turn-05-extend-polyglot-integration-test-lines-901-1020)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T09:36:45.823Z","inputHash":"0ae58755cf44c7fe"}]} -->
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

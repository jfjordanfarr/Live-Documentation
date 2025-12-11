# packages/server/src/features/live-docs/renderPublicSymbolLines.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/live-docs/renderPublicSymbolLines.test.ts
- Live Doc ID: LD-test-packages-server-src-features-live-docs-renderpublicsymbollines-test-ts
- Generated At: 2025-12-11T02:38:01.005Z

## Authored
### Purpose
Ensures the public symbol renderer emits heading blocks with type metadata, source links, and normalized documentation snippets so generated Live Docs show consistent structure across languages.

### Notes
- Added while refactoring the renderer to `####` heading format and detail bullets; see [2025-11-08 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md).
- Expanded again during the docstring normalization push outlined in [2025-11-12 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md) to keep tests aligned with richer metadata.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.005Z","inputHash":"24aca651709b8217"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `LIVE_DOCUMENTATION_FILE_EXTENSION`
- `@live-documentation/shared/live-docs/core` - `computePublicSymbolHeadingInfo`
- `node:path` - `path`
- [`generator.__testUtils`](./generator.ts.mdmd.md#symbol-__testutils)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/live-docs: [evidenceBridge.ts](./evidenceBridge.ts.mdmd.md), [generator.ts](./generator.ts.mdmd.md)
- packages/shared/src/config: [liveDocumentationConfig.ts](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../../../../shared/src/live-docs/core.ts.mdmd.md), [markdown.ts](../../../../shared/src/live-docs/markdown.ts.mdmd.md), [schema.ts](../../../../shared/src/live-docs/schema.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../../../shared/src/tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

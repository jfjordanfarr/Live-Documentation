# packages/generator/src/generator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/generator.test.ts
- Generated At: 2026-09-27T23:21:26.750Z

## Authored
### Purpose
Validates that `generateLiveDocs` prunes stale documents without authored context while preserving files that contain manual notes.

### Notes
- Ensures the Stage‑0 pruning safeguards added during the generator refactor (see [2025-11-10 summary](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md)) remain regression-tested.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`generator.generateLiveDocs`](./generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

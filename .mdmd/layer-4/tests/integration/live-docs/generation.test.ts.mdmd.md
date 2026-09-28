# tests/integration/live-docs/generation.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/generation.test.ts
- Generated At: 2026-09-28T00:41:41.854Z

## Authored
### Purpose
Spins up a scratch workspace, seeds a sample TypeScript module, and runs the generator twice to prove authored sections survive regeneration while the output remains byte-identical after the Stage-0 migration work ([integration log](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L930-L1004)).

### Notes
- Pulls `LIVE_DOCUMENTATION_FILE_EXTENSION` from the shared config so the test tracks the repo-wide shift to `.md` Live Docs without hard-coded extensions ([Stage-0 extension migration](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-15-shift-live-docs-to-md-outputs-lines-1401-1820)).
- Seeds a legacy `### Description` block to ensure the generator keeps unexpected human-authored headings even after the template dropped that section ([deterministic template refresh](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-09.SUMMARIZED.md#turn-13-regenerate-base-layer-without-description-lines-1841-1990)).

## Generated
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
- [`graph.LiveDocGraph`](../../../packages/shared/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`graphFiles.readLiveDocGraph`](../../../packages/shared/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- `vitest` - `describe`, `it`
<!-- LIVE-DOC:END Dependencies -->

# packages/shared/src/live-docs/generator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/generator.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-generator-test-ts
- Generated At: 2026-02-03T21:55:40.517Z

## Authored
### Purpose
Exercises the Live Docs renderer/generator glue to ensure authored blocks, provenance markers, and file naming stay stable across regeneration cycles.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-15-build-evidence-bridge--lint-pipeline-lines-2641-2960]

### Notes
- Added with the Stage‑0 tooling rollout to lock down the contract between schema metadata and markdown rendering.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-15-build-evidence-bridge--lint-pipeline-lines-2641-2960]
- Kept in the `.md` migration to confirm extension changes didn’t alter rendered headings or provenance comments.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-15-shift-live-docs-to-md-outputs-lines-1401-1820]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.517Z","inputHash":"107c64f71ea34d7b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`markdown.composeLiveDocId`](./markdown.ts.mdmd.md#symbol-composelivedocid)
- [`markdown.composeLiveDocPath`](./markdown.ts.mdmd.md#symbol-composelivedocpath)
- [`markdown.defaultAuthoredTemplate`](./markdown.ts.mdmd.md#symbol-defaultauthoredtemplate)
- [`markdown.extractAuthoredBlock`](./markdown.ts.mdmd.md#symbol-extractauthoredblock)
- [`markdown.renderLiveDocMarkdown`](./markdown.ts.mdmd.md#symbol-renderlivedocmarkdown)
- [`markdown.renderProvenanceComment`](./markdown.ts.mdmd.md#symbol-renderprovenancecomment)
- [`schema.LiveDocMetadata`](./schema.ts.mdmd.md#symbol-livedocmetadata) (type-only)
- [`schema.LiveDocProvenance`](./schema.ts.mdmd.md#symbol-livedocprovenance) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/config: [liveDocumentationConfig.ts](../config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [markdown.ts](./markdown.ts.mdmd.md), [schema.ts](./schema.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

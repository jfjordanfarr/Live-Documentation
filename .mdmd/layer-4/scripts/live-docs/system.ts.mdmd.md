# scripts/live-docs/system.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/system.ts
- Live Doc ID: LD-implementation-scripts-live-docs-system-ts
- Generated At: 2025-11-24T15:19:59.484Z

## Authored
### Purpose
CLI wrapper for `generateSystemLiveDocs`, producing Layer‑3 “System” documentation bundles on demand so architecture views can be materialised outside the workspace mirror.

### Notes
We added this helper when commissioning the System doc generator (Nov 2024) to give designers a repeatable way to export markdown to `AI-Agent-Workspace/tmp/system-cli-output`. It supports `--clean` and `--dry-run` flags so CI and human runs can avoid clobbering curated exports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:59.484Z","inputHash":"61d85196b4a36810"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LiveDocumentationConfigInput`, `normalizeLiveDocumentationConfig`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`generator.generateSystemLiveDocs`](../../packages/server/src/features/live-docs/system/generator.ts.mdmd.md#symbol-generatesystemlivedocs)
<!-- LIVE-DOC:END Dependencies -->

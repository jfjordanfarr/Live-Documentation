# scripts/live-docs/system.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/system.ts
- Live Doc ID: LD-implementation-scripts-live-docs-system-ts
- Generated At: 2026-02-03T21:55:41.948Z

## Authored
### Purpose
CLI wrapper for `generateSystemLiveDocs`, producing Layer‑3 “System” documentation bundles on demand so architecture views can be materialised outside the workspace mirror.

### Notes
We added this helper when commissioning the System doc generator (Nov 2024) to give designers a repeatable way to export markdown to `AI-Agent-Workspace/tmp/system-cli-output`. It supports `--clean` and `--dry-run` flags so CI and human runs can avoid clobbering curated exports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.948Z","inputHash":"dae09e1d49df5ba3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`generator.generateSystemLiveDocs`](../../packages/server/src/features/live-docs/system/generator.ts.mdmd.md#symbol-generatesystemlivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
<!-- LIVE-DOC:END Dependencies -->

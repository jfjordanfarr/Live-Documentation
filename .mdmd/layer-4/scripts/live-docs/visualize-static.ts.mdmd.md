# scripts/live-docs/visualize-static.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-static.ts
- Entry: command `live-docs:visualize` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-18T00:39:24.944Z

## Authored
### Purpose
CLI entry point for building the static Explorer bundle, for offline viewing and static hosting.

### Notes
- Created 2025-12-07.
- Accepts `--output <dir>` (default `dist/explorer/`), `--config <file>` and `--pretty`; the Local Map precomputation and provenance flags went on 2026-09-28.
- `--history none|all|since <date>|last <n>` (2026-10-17, C1 of [the plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md)): how much of the history the export carries, by the exporter's choice, since some histories are too large to ride; by default all of it when the history command has written `<root>/history/history.json`, and none otherwise.
- Delegates to `staticBuilder.buildStaticExplorer()` and prints the file, edge and related-markdown counts and the bundle size. Invoked as `npm run live-docs:visualize`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`staticBuilder.ExportedHistory`](../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-exportedhistory)
- [`staticBuilder.buildStaticExplorer`](../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
<!-- LIVE-DOC:END Dependencies -->

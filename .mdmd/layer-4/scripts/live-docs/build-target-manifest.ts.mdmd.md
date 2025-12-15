# scripts/live-docs/build-target-manifest.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/build-target-manifest.ts
- Live Doc ID: LD-implementation-scripts-live-docs-build-target-manifest-ts
- Generated At: 2025-12-15T00:38:07.434Z

## Authored
### Purpose
Generates `data/live-docs/targets.json`, mapping every test to the implementation files and fixtures it exercises so evidence-aware tooling (lint, graph, diagnostics) can reason about coverage without re-parsing the workspace on every run.

### Notes
We introduced the manifest-builder while bootstrapping the evidence bridge (Sep 2024) to keep the Live Docs pipeline deterministic. It understands TS path aliases and recursively expands dependencies, which is why it runs inside `npm run livedocs` before linting or the precision report.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.434Z","inputHash":"02e73eae8013bd10"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`pathUtils.normalizeWorkspacePath`](../../packages/shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

# scripts/live-docs/build-target-manifest.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/build-target-manifest.ts
- Live Doc ID: LD-implementation-scripts-live-docs-build-target-manifest-ts
- Generated At: 2025-11-24T15:19:59.409Z

## Authored
### Purpose
Generates `data/live-docs/targets.json`, mapping every test to the implementation files and fixtures it exercises so evidence-aware tooling (lint, graph, diagnostics) can reason about coverage without re-parsing the workspace on every run.

### Notes
We introduced the manifest-builder while bootstrapping the evidence bridge (Sep 2024) to keep the Live Docs pipeline deterministic. It understands TS path aliases and recursively expands dependencies, which is why it runs inside `npm run livedocs` before linting or the precision report.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:59.409Z","inputHash":"c74b27a3bf9589a7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `normalizeLiveDocumentationConfig`
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

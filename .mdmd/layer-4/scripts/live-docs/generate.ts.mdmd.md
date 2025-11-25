# scripts/live-docs/generate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/generate.ts
- Live Doc ID: LD-implementation-scripts-live-docs-generate-ts
- Generated At: 2025-11-24T15:19:59.433Z

## Authored
### Purpose
CLI entry point that applies workspace configuration, resolves include/changed filters, and invokes the server-side Live Doc generator so developers can regenerate Layer‑4 mirrors on demand or during automation.

### Notes
The script wraps `generateLiveDocs` from the server package, wiring in JSON config files and `--system` materialisation toggles added during the Stage‑0 retirement (Oct 2025). It also persists the `data/live-docs/targets.json` manifest used by lint, graph, and evidence tooling so that downstream tasks do not have to re-scan the workspace.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:59.433Z","inputHash":"a313ebb5f2634290"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LiveDocumentationConfig`, `LiveDocumentationConfigInput`, `normalizeLiveDocumentationConfig`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`generator.generateLiveDocs`](../../packages/server/src/features/live-docs/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`generator.generateSystemLiveDocs`](../../packages/server/src/features/live-docs/system/generator.ts.mdmd.md#symbol-generatesystemlivedocs)
<!-- LIVE-DOC:END Dependencies -->

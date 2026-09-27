# scripts/live-docs/generate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/generate.ts
- Live Doc ID: LD-implementation-scripts-live-docs-generate-ts
- Generated At: 2026-09-27T09:36:40.594Z

## Authored
### Purpose
CLI entry point that applies workspace configuration, resolves include/changed filters, and invokes the server-side Live Doc generator so developers can regenerate Layer‑4 mirrors on demand or during automation.

### Notes
The script wraps `generateLiveDocs` from the server package, wiring in JSON config files and `--system` materialisation toggles added during the Stage‑0 retirement (Oct 2025). It also persists the `data/live-docs/targets.json` manifest used by lint, graph, and evidence tooling so that downstream tasks do not have to re-scan the workspace.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T09:36:40.594Z","inputHash":"cbe50428faa9cc4c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
<!-- LIVE-DOC:END Dependencies -->

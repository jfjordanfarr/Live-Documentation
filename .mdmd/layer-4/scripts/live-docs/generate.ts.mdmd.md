# scripts/live-docs/generate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/generate.ts
- Generated At: 2026-09-27T23:21:31.819Z

## Authored
### Purpose
CLI entry point that applies workspace configuration, resolves include/changed filters, and invokes the server-side Live Doc generator so developers can regenerate Layer‑4 mirrors on demand or during automation.

### Notes
The script wraps `generateLiveDocs` from the generator package, wiring in the JSON config file and the `--changed`, `--include` and `--dry-run` filters.

## Generated
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

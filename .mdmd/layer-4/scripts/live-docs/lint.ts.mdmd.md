# scripts/live-docs/lint.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/lint.ts
- Generated At: 2026-09-28T00:41:40.762Z

## Authored
### Purpose
Checks every Live Doc against the grammar, refuses absolute links, warns about authored sections still holding placeholders, and reports files disconnected from the graph, so the workspace fails fast before docs drift.

### Notes
- Introduced alongside the first Live Docs CLI (Aug 2024) and expanded repeatedly through the MDMD migration. In Nov 2025 authored-section warnings were added to surface pending Purpose and Notes placeholders without blocking commits.
- Since 2026-09-28 the connectivity check derives the graph from the docs the run has just validated, and is skipped when any doc fails the grammar, so the structural failures are reported instead of a crash.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.hasMeaningfulAuthoredContent`](../../packages/shared/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`document.LiveDoc`](../../packages/shared/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.LiveDocSyntaxError`](../../packages/shared/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.authoredBlockOf`](../../packages/shared/src/live-docs/document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](../../packages/shared/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`graph.LiveDocGraph`](../../packages/shared/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.deriveLiveDocGraph`](../../packages/shared/src/live-docs/graph.ts.mdmd.md#symbol-derivelivedocgraph)
<!-- LIVE-DOC:END Dependencies -->

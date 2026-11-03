# scripts/live-docs/lint.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/lint.ts
- Entry: command `live-docs:lint` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-03T00:48:35.565Z

## Authored
### Purpose
Checks every Live Doc against the grammar, refuses absolute links, warns about authored sections still holding placeholders, and reports files disconnected from the graph, so the workspace fails fast before docs drift.

### Notes
- Introduced alongside the first Live Docs CLI (Aug 2024) and expanded repeatedly through the MDMD migration. In Nov 2025 authored-section warnings were added to surface pending Purpose and Notes placeholders without blocking commits.
- Since 2026-09-28 the connectivity check derives the graph from the docs the run has just validated, and is skipped when any doc fails the grammar, so the structural failures are reported instead of a crash.
- Since 2026-10-18 `--version` prints the engine package's version, whose grammar the lint applies, through [cli.ts](cli.ts.mdmd.md); until then a constant, 0.1.0, or an environment variable.

Since 2026-11-02 the connectivity warning's islands are the files the engine's `fileGroups` calls alone, the set `inspect --groups` prints and the Knowledge Sources panel lists, so that the three give one answer; before, the lint counted the files with no outbound and no inbound edge itself, the same set by a second computation, a note the builder of the groups left for the root ([Turn 12 of the November 2 record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-12)). The groups test of `tests/integration/live-docs/inspect-cli.test.ts` holds the agreement.

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
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.hasMeaningfulAuthoredContent`](../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`document.LiveDoc`](../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`document.LiveDocSyntaxError`](../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.authoredBlockOf`](../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`graph.LiveDocGraph`](../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)
- [`graph.deriveLiveDocGraph`](../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`pathfind.fileGroups`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-filegroups-function)
- [`cli.packageVersion`](./cli.ts.mdmd.md#symbol-packageversion)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/slopcop.mdmd.md`](../../../layer-3/slopcop.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

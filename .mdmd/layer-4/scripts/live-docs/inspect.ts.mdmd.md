# scripts/live-docs/inspect.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect.ts
- Live Doc ID: LD-implementation-scripts-live-docs-inspect-ts
- Generated At: 2026-01-14T15:17:48.910Z

## Authored
### Purpose
Trace Live Documentation dependencies from the command line, supporting outbound and inbound lookups between artefacts as well as fan-out exploration when only a starting point is supplied.

### Notes
The CLI now emits stable JSON payloads for path, not-found, and fanout searches, flags max-depth cut-offs, and highlights missing documentation so LD-402 scenarios can assert failure diagnostics alongside happy-path chains. Symbol nodes carry any available documentation summaries and parameter notes so comment-based help from sources like PowerShell flows straight into inspect results.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T15:17:48.910Z","inputHash":"c89efa57c75ca521"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocGraph.buildLiveDocGraph`](../../packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-buildlivedocgraph)
- [`index.Direction`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-direction)
- [`index.emitDualDirectionResult`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitdualdirectionresult)
- [`index.emitDualDirectionSymbolResult`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitdualdirectionsymbolresult)
- [`index.emitFanoutResult`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitfanoutresult)
- [`index.emitNotFound`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitnotfound)
- [`index.emitPathResult`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitpathresult)
- [`index.emitSymbolPathNotFound`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitsymbolpathnotfound)
- [`index.emitSymbolPathResult`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitsymbolpathresult)
- [`index.enumerateTerminalPaths`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-enumerateterminalpaths)
- [`index.hasSymbolReference`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-hassymbolreference)
- [`index.resolveArtifactIdentifier`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-resolveartifactidentifier)
- [`index.resolveSymbolReference`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-resolvesymbolreference)
- [`index.searchGraph`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-searchgraph)
- [`index.searchSymbolPath`](../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-searchsymbolpath)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
<!-- LIVE-DOC:END Dependencies -->

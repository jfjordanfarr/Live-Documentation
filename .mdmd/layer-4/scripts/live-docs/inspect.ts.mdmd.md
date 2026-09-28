# scripts/live-docs/inspect.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect.ts
- Generated At: 2026-09-28T00:41:40.746Z

## Authored
### Purpose
Trace Live Documentation dependencies from the command line, supporting outbound and inbound lookups between artefacts as well as fan-out exploration when only a starting point is supplied.

### Notes
- Emits stable JSON payloads for path, not-found, fanout, symbol-path and dual-direction searches, flags max-depth cut-offs, and lists the dependencies that resolved to no file. Symbol nodes carry documentation summaries and parameter notes, so comment-based help from sources like PowerShell flows straight into results.
- Since 2026-09-28 it reads the graph derived from the docs. The fallback that tried `.mdmd/layer-4` when the configured root held nothing is gone: configuration is the only place a layout comes from.

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
- [`graphFiles.readLiveDocGraph`](../../packages/shared/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
<!-- LIVE-DOC:END Dependencies -->

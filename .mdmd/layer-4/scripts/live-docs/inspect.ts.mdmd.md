# scripts/live-docs/inspect.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect.ts
- Generated At: 2026-10-14T21:05:00.918Z

## Authored
### Purpose
Trace Live Documentation dependencies from the command line, supporting outbound and inbound lookups between artefacts, fan-out exploration when only a starting point is supplied, and, with `--reachable`, every file a path reaches from the start with its hops.

### Notes
- Emits stable JSON payloads for path, not-found, fanout, symbol-path and dual-direction searches, flags max-depth cut-offs, and lists the dependencies that resolved to no file. Symbol nodes carry documentation summaries and parameter notes, so comment-based help from sources like PowerShell flows straight into results.
- Since 2026-09-28 it reads the graph derived from the docs. The fallback that tried `.mdmd/layer-4` when the configured root held nothing is gone: configuration is the only place a layout comes from.
- `--reachable` (2026-10-14, [Turn 7](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-walk-under-the-cli-and-the-explorer-and-a-destination-field-that-offers-only-what-connects-recorded-2026-10-14)) is the headless form of the Explorer's destination field, from the same engine walk: every file a path reaches, nearest first, one list per direction, both with `--direction both`. A fan-out asked both ways is refused with a message: it had silently listed the inbound paths, because the neighbour function read "both" as inbound.

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
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`LiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`pathfind.Direction`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction)
- [`pathfind.OneWay`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-oneway)
- [`pathfind.enumerateTerminalPaths`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-enumerateterminalpaths)
- [`pathfind.getNeighbors`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-getneighbors)
- [`pathfind.reachFrom`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachfrom)
- [`pathfind.searchGraph`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-searchgraph)
- [`pathfind.searchSymbolPath`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-searchsymbolpath)
- [`emit.emitDualDirectionResult`](./inspect/emit.ts.mdmd.md#symbol-emitdualdirectionresult)
- [`emit.emitDualDirectionSymbolResult`](./inspect/emit.ts.mdmd.md#symbol-emitdualdirectionsymbolresult)
- [`emit.emitFanoutResult`](./inspect/emit.ts.mdmd.md#symbol-emitfanoutresult)
- [`emit.emitNotFound`](./inspect/emit.ts.mdmd.md#symbol-emitnotfound)
- [`emit.emitPathResult`](./inspect/emit.ts.mdmd.md#symbol-emitpathresult)
- [`emit.emitReachableResult`](./inspect/emit.ts.mdmd.md#symbol-emitreachableresult)
- [`emit.emitSymbolPathNotFound`](./inspect/emit.ts.mdmd.md#symbol-emitsymbolpathnotfound)
- [`emit.emitSymbolPathResult`](./inspect/emit.ts.mdmd.md#symbol-emitsymbolpathresult)
- [`resolve.hasSymbolReference`](./inspect/resolve.ts.mdmd.md#symbol-hassymbolreference)
- [`resolve.resolveArtifactIdentifier`](./inspect/resolve.ts.mdmd.md#symbol-resolveartifactidentifier)
- [`resolve.resolveSymbolReference`](./inspect/resolve.ts.mdmd.md#symbol-resolvesymbolreference)
<!-- LIVE-DOC:END Dependencies -->

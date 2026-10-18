# scripts/live-docs/inspect.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect.ts
- Entry: command `live-docs:inspect` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-18T01:36:54.247Z

## Authored
### Purpose
Trace Live Documentation dependencies from the command line, supporting outbound and inbound lookups between artefacts, fan-out exploration when only a starting point is supplied, with `--reachable` every file a path reaches from the start with its hops, and with `--reachable` alone the entry points the docs declare and what they reach.

### Notes
- Emits stable JSON payloads for path, not-found, fanout, symbol-path and dual-direction searches, flags max-depth cut-offs, and lists the dependencies that resolved to no file. Symbol nodes carry documentation summaries and parameter notes, so comment-based help from sources like PowerShell flows straight into results.
- Since 2026-09-28 it reads the graph derived from the docs. The fallback that tried `.mdmd/layer-4` when the configured root held nothing is gone: configuration is the only place a layout comes from.
- `--reachable` (2026-10-14, [Turn 7](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-walk-under-the-cli-and-the-explorer-and-a-destination-field-that-offers-only-what-connects-recorded-2026-10-14)) is the headless form of the Explorer's destination field, from the same engine walk: every file a path reaches, nearest first, one list per direction, both with `--direction both`. A fan-out asked both ways is refused with a message: it had silently listed the inbound paths, because the neighbour function read "both" as inbound.
- `--reachable` without `--from` (2026-10-15, [Turn 4](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) is the headless form of the Knowledge Sources panel: the engine's `reachability` from every file an `Entry` line or the test archetype marks, printed as the entries with their reasons, the files reached nearest first, the files no entry reaches with their archetypes, and the files only a test reaches; `--json` prints the engine's object, which the panel's export writes too. It takes no `--to` and no `--direction`, since from the entries the walk runs along what they depend on.
- `--at <commit>` and `--between <a> <b>` (2026-10-17, C9 of [the plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md)) answer from `<root>/history/history.json`, never from today's docs: at a commit, with `--from`, whether the file existed and its wires with their counts, and with `--reachable`, the walk from that commit's entries by the same `reachability`; between two commits, the files born, dead, renamed and resized and the wires added and removed, each file followed through every rename between. Each answer says first that it comes from the shape alone, a commit is named by a prefix of its id, and a workspace with no history is refused with the command that computes it.
- Since 2026-10-18 `--version` prints the engine package's version, whose graph and pathfinder answer every question, through [cli.ts](cli.ts.mdmd.md), and a reader that closes the pipe early, as `head` does, ends the listing quietly instead of with an EPIPE trace.

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
- [`pathfind.reachability`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachability-function)
- [`pathfind.searchGraph`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-searchgraph)
- [`pathfind.searchSymbolPath`](../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-searchsymbolpath)
- [`cli.endQuietlyWhenThePipeCloses`](./cli.ts.mdmd.md#symbol-endquietlywhenthepipecloses)
- [`cli.packageVersion`](./cli.ts.mdmd.md#symbol-packageversion)
- [`emit.emitDualDirectionResult`](./inspect/emit.ts.mdmd.md#symbol-emitdualdirectionresult)
- [`emit.emitDualDirectionSymbolResult`](./inspect/emit.ts.mdmd.md#symbol-emitdualdirectionsymbolresult)
- [`emit.emitFanoutResult`](./inspect/emit.ts.mdmd.md#symbol-emitfanoutresult)
- [`emit.emitNotFound`](./inspect/emit.ts.mdmd.md#symbol-emitnotfound)
- [`emit.emitPathResult`](./inspect/emit.ts.mdmd.md#symbol-emitpathresult)
- [`emit.emitReachableFromEntries`](./inspect/emit.ts.mdmd.md#symbol-emitreachablefromentries)
- [`emit.emitReachableResult`](./inspect/emit.ts.mdmd.md#symbol-emitreachableresult)
- [`emit.emitSymbolPathNotFound`](./inspect/emit.ts.mdmd.md#symbol-emitsymbolpathnotfound)
- [`emit.emitSymbolPathResult`](./inspect/emit.ts.mdmd.md#symbol-emitsymbolpathresult)
- [`history.HistoryRefusal`](./inspect/history.ts.mdmd.md#symbol-historyrefusal)
- [`history.emitBetween`](./inspect/history.ts.mdmd.md#symbol-emitbetween)
- [`history.emitFileAt`](./inspect/history.ts.mdmd.md#symbol-emitfileat)
- [`history.emitReachableAt`](./inspect/history.ts.mdmd.md#symbol-emitreachableat)
- [`history.readHistory`](./inspect/history.ts.mdmd.md#symbol-readhistory)
- [`history.resolveStep`](./inspect/history.ts.mdmd.md#symbol-resolvestep)
- [`resolve.hasSymbolReference`](./inspect/resolve.ts.mdmd.md#symbol-hassymbolreference)
- [`resolve.resolveArtifactIdentifier`](./inspect/resolve.ts.mdmd.md#symbol-resolveartifactidentifier)
- [`resolve.resolveSymbolReference`](./inspect/resolve.ts.mdmd.md#symbol-resolvesymbolreference)
<!-- LIVE-DOC:END Dependencies -->

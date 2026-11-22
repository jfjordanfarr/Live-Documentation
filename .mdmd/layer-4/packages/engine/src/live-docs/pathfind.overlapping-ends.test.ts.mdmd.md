# `packages/engine/src/live-docs/pathfind.overlapping-ends.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/pathfind.overlapping-ends.test.ts`
- Generated At: 2026-11-22T05:38:27.675Z

## Authored
### Purpose
Holds the path finder to its own rule for two ends that share files: "a file in both sets is not its own path". A path between two different files, one in each end, must still be found. The cases are a directory to a file under it, two sets that overlap, and a directory to a subdirectory of it inbound. A fourth case checks that one file asked as both ends is still no path. A last case holds the symbol search to the same rule: `--from a.ts#x --to a.ts#x` must not answer a path of no hops.

### Notes
- Written on 2026-11-22 by the engine review of that day's work ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md)). `walkBetween` drops every start from the targets, so `inspect --from src/ --to src/b.ts` answered "No path runs between src/ and src/b.ts, either way" even though `src/a.ts` uses `src/b.ts`. The Explorer walks through the same function. When the review committed this file, the first three cases and the symbol case failed; the case of one file as both ends passed. The symbol case's mend may instead be a ruling that a symbol's path to itself is a different question; if so, the case changes with that ruling.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.GraphFile`](./graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`pathfind.pathTo`](./pathfind.ts.mdmd.md#symbol-pathto)
- [`pathfind.searchGraph`](./pathfind.ts.mdmd.md#symbol-searchgraph)
- [`pathfind.searchSymbolPath`](./pathfind.ts.mdmd.md#symbol-searchsymbolpath)
- [`pathfind.under`](./pathfind.ts.mdmd.md#symbol-under)
- [`pathfind.walkBetween`](./pathfind.ts.mdmd.md#symbol-walkbetween)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

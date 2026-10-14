# packages/engine/src/live-docs/pathfind.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/pathfind.test.ts
- Generated At: 2026-10-14T21:04:58.009Z

## Authored
### Purpose
Vitest over the engine's pathfinder: the walk's hops, parents and stops, a target met and a start among the targets, the depth limit, the reach without its starts, `searchGraph`'s path and frontier in the forms the inspect CLI prints, and the terminal paths.

### Notes
- Written on 2026-10-14 ([Turn 7](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7)) when the walk was gathered under the CLI and the Explorer. Until then the engine's pathfinder was exercised only through the inspect CLI's integration tests, and the client's copy had the unit tests.
- The graph is built from the files each file depends on, with one dependency that resolved to no file, so the outbound frontier's "missing-doc" entry is tested beside the stops, in the order the CLI prints them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.GraphEdge`](./graph.ts.mdmd.md#symbol-graphedge) (type-only)
- [`graph.GraphFile`](./graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`pathfind.enumerateTerminalPaths`](./pathfind.ts.mdmd.md#symbol-enumerateterminalpaths)
- [`pathfind.getNeighbors`](./pathfind.ts.mdmd.md#symbol-getneighbors)
- [`pathfind.pathTo`](./pathfind.ts.mdmd.md#symbol-pathto)
- [`pathfind.reachFrom`](./pathfind.ts.mdmd.md#symbol-reachfrom)
- [`pathfind.searchGraph`](./pathfind.ts.mdmd.md#symbol-searchgraph)
- [`pathfind.walk`](./pathfind.ts.mdmd.md#symbol-walk-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

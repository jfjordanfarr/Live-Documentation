The page lists five files that use `packages/explorer/src/client/pathfind.ts`. Its "Dependents" list in the Live Docs Explorer shows:

- `packages/explorer/src/client/index.ts`
- `packages/explorer/src/client/search/graph-search.ts`
- `packages/explorer/src/client/search/search-bar.ts`
- `packages/explorer/src/client/pathfind.test.ts`
- `packages/explorer/src/client/history/moment-paths.test.ts`

The last two are tests. The other three are non-test source files.

The page's purpose text says the search bar (`search/search-bar.ts`) is the main consumer. The file is the Local Map's pathfinder. It does a breadth-first walk to find the shortest path between two sets of files. It also exports `findPath`, `reachOf`, `referencesAgainstPath`, `adjacencyOf` and a few types.

The file is also cited in two docs: `.mdmd/layer-3/architectural-decisions.mdmd.md` and `.mdmd/layer-3/live-documentation-explorer.mdmd.md`.

I read these from the explorer's generated index (dated Nov 18, 2026), not from the source code. I didn't search the code directly, so very recent changes may not appear.

I opened the link in the Live Docs Explorer's Local Map and read it for `packages/explorer/src/client/pathfind.ts`. This is what the map shows.

**Files that use it** (links run from the right side of `pathfind.ts` to these files):
- `client/search/graph-search.ts` uses it. It has the `reachWords` and `destinationScope` symbols.
- `client/search/search-bar.ts` uses it.
- `client/index.ts`, the client bootstrap entry point, uses it. Its internals have a lot of connections (+117), so I can't tell how many of those go to `pathfind.ts`.
- Two test files use it: `client/pathfind.test.ts` (its direct unit test) and `client/history/moment-paths.test.ts`.

**What it uses itself**, for context:
- The shared `types.ts` (`ExplorerLinkPayload`, `ExplorerNodePayload`).
- A separate `pathfind.ts` in the `live-docs` package, which has `walk`, `Neighbours`, `reachFrom` and `pathTo`.

I read the direction of the links from the picture, and the map is dense. I didn't click through each link to confirm it. The status bar also notes that 1,209 dependencies sit outside the scan. For a definitive list, run a grep for imports of `pathfind` in the repo.

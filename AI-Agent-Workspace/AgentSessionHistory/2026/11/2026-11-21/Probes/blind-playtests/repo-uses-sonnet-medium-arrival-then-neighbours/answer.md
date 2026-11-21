I checked the file's page in the Explorer. Here's what uses `packages/explorer/src/client/pathfind.ts`.

**Code that depends on it (5 files):**
- `packages/explorer/src/client/search/search-bar.ts`
- `packages/explorer/src/client/search/graph-search.ts`
- `packages/explorer/src/client/index.ts`
- `packages/explorer/src/client/pathfind.test.ts`, its own test file
- `packages/explorer/src/client/history/moment-paths.test.ts`

**Docs that cite it (2 files):**
- `.mdmd/layer-3/architectural-decisions.mdmd.md`
- `.mdmd/layer-3/live-documentation-explorer.mdmd.md`

The file is the pathfinder for the Explorer's Local Map. It finds the shortest path between two sets of files and counts what a drawn path leaves out. Its own notes say the search bar is the main caller. It also relies on `packages/engine/src/live-docs/pathfind.ts`, which supplies `Neighbours`, `reachFrom` and `pathTo`.

The page lists no other dependents. The Explorer says it scanned 1,134 files, so a dynamic or string-based reference wouldn't show up there.

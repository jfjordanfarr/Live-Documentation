The file is `packages/explorer/src/client/pathfind.ts`. The Live Docs Explorer page lists five files that depend on it (its "Dependents" tab):

1. `packages/explorer/src/client/history/moment-paths.test.ts`
2. `packages/explorer/src/client/index.ts`
3. `packages/explorer/src/client/pathfind.test.ts`
4. `packages/explorer/src/client/search/graph-search.ts`
5. `packages/explorer/src/client/search/search-bar.ts`

The page's description says the file is the pathfinder for the Local Map. The search bar uses it to find the shortest path between two sets of files. The two test files cover it, and `index.ts` is the client entry point. These are the explorer's own static analysis, so I haven't checked them against the source code. I only read the page and didn't change anything.

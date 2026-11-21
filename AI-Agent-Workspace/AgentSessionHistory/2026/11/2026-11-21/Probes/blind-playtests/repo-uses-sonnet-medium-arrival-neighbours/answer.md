The page's Dependents list shows five files that use `packages/explorer/src/client/pathfind.ts`:

- `packages/explorer/src/client/search/search-bar.ts`: the search bar, which the file's purpose note names as the caller that asks for paths.
- `packages/explorer/src/client/search/graph-search.ts`: it uses `reachWords` and `destinationScope`.
- `packages/explorer/src/client/index.ts`
- `packages/explorer/src/client/pathfind.test.ts`: the file's own test.
- `packages/explorer/src/client/history/moment-paths.test.ts`: a test.

So three non-test files use it (the search bar, graph search and the client index), and two tests cover it.

Two documents also cite it: `.mdmd/layer-3/architectural-decisions.mdmd.md` and `.mdmd/layer-3/live-documentation-explorer.mdmd.md`.

This client file is separate from `packages/engine/src/live-docs/pathfind.ts`, which has a similar name. The client file depends on that engine file for `Neighbours`, `pathTo` and `reachFrom`.

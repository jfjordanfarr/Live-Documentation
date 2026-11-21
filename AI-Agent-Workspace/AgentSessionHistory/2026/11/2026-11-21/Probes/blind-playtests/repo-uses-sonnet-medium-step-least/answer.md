I checked the Dependents section for `pathfind.ts` in the explorer. Five files use `packages/explorer/src/client/pathfind.ts`:

- `packages/explorer/src/client/search/search-bar.ts`: the search bar. The file's own description names it as the caller that asks for paths.
- `packages/explorer/src/client/search/graph-search.ts`
- `packages/explorer/src/client/index.ts`
- `packages/explorer/src/client/pathfind.test.ts`: the unit tests for it.
- `packages/explorer/src/client/history/moment-paths.test.ts`: a second test file.

Only the first three are production code. The other two are tests.

The file itself depends on `packages/engine/src/live-docs/pathfind.ts`, which provides `Neighbours`, `pathTo` and `reachFrom`. It also uses the shared `types.ts`, as the map shows.

Two documents cite it: `.mdmd/layer-3/architectural-decisions.mdmd.md` and `.mdmd/layer-3/live-documentation-explorer.mdmd.md`.

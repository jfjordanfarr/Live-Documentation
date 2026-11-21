Five files use `pathfind.ts` (`packages/explorer/src/client/pathfind.ts`). I read this from the Local Map's dependency graph, so I haven't checked the code itself.

- **`client/search/graph-search.ts`**: uses its `reachWords` and `destinationScope` symbols.
- **`client/search/search-bar.ts`**: uses it through its internals.
- **`client/index.ts`**: uses it through its internals.
- **`client/search/pathfind.test.ts`**: the unit tests for it.
- **`client/history/moment-paths.test.ts`**: a second test file that uses it.

`pathfind.ts` also depends on two files itself:

- `packages/live-docs/.../pathfind.ts`, a different file that has the same name. It supplies `walk`, `Neighbours`, `reachFrom` and `pathTo`.
- `packages/explorer/src/shared/types.ts`, which supplies `ExplorerLinkPayload` and `ExplorerNodePayload`.

The map has "Show Tests" turned on, which is why the two test files appear. The map might not show every user, because the page says some dependencies sit outside the scan.

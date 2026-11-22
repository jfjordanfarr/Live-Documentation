Files that import `packages/explorer/src/client/pathfind.ts`:

- `packages/explorer/src/client/index.ts` imports `findPath`, `reachOf`, `referencesAgainstPath`, and the types `PathfindResult` and `Reach`.
- `packages/explorer/src/client/search/graph-search.ts` imports the `Reach` type.
- `packages/explorer/src/client/search/search-bar.ts` imports the `PathHop` and `Reach` types.
- `packages/explorer/src/client/pathfind.test.ts` is its own test file. It imports `findPath`, `reachOf`, and `referencesAgainstPath`.
- `packages/explorer/src/client/history/moment-paths.test.ts` is a test that imports the same three functions.

The other uses are not imports of this file:

- `sources-facts.ts` and `card-reading.ts` import from `@live-documentation/engine/live-docs/pathfind`. That is the engine's module, which `pathfind.ts` itself builds on.
- Elsewhere, "pathfind" only appears in DOM ids, CSS classes in `search.css`, and comments.

I searched by text for the string "pathfind". An import that builds the path dynamically, or one that doesn't match that string, would not show up. I didn't run `live-docs`, so I haven't checked whether it reports anything different.

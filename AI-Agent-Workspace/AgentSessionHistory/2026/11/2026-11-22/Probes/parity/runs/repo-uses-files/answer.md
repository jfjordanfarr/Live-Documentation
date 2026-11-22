Five files import `packages/explorer/src/client/pathfind.ts`. It's a breadth-first path search over the links the Local Map draws, and it wraps the engine's `live-docs/pathfind`.

**Runtime code**
- `client/index.ts` imports `findPath`, `reachOf`, `referencesAgainstPath` and the types `PathfindResult` and `Reach`.
- `client/search/search-bar.ts` imports the types `PathHop` and `Reach`. It renders the path strip and status line (`#pathfind-status`, `#pathfind-path`).
- `client/search/graph-search.ts` imports the type `Reach`.

**Tests**
- `client/pathfind.test.ts` is its own test file.
- `client/history/moment-paths.test.ts` imports `findPath`, `reachOf` and `referencesAgainstPath`.

The file exports `PathHop`, `PathfindResult`, `Reach`, `Adjacency`, `adjacencyOf`, `findPath`, `reachOf` and `referencesAgainstPath`.

Don't confuse it with the engine module `@live-documentation/engine/live-docs/pathfind`. `client/panels/sources-facts.ts` and `client/views/localView/card-reading.ts` import that module directly, not this file.

Other hits for "pathfind" are only CSS classes, HTML ids in `template.html`, and comments. That includes `localView/controller.ts`, `state.ts` and `types.ts`, which use the word for the pathfinding mode but don't import this file.

I searched the whole tree except `node_modules`, `.git` and `dist`. I only looked for the literal string "pathfind", so a dynamic import built from a variable wouldn't show up.

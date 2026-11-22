The folder has four files in a layered chain. Each file imports only from the one below it.

**`graph-search.ts`** (336 lines) is the base layer. It has no UI code and no DOM access.
- It defines the types: `SearchHit`, `SearchFile`, `SearchGroup`, `SearchResult`, `SearchScope`, `SearchRow`, `SearchIndex` and `SearchOptions`.
- It builds the index with `searchIndexOf(nodes)`, using helpers such as `directoriesOf`, `directoryOf`, `termsOf`, `stemOf`, `directoryScore` and `fileNameScore`.
- It runs queries with `searchGraph(query, index, options)`. `searchRows(result)` then flattens the result into rows that can be shown.
- It exports `FILE_LIMIT` (12) and `DIRECTORY_LIMIT` (6).
- `reachWords` and `destinationScope` turn a pathfinding `Reach` (imported as a type from `../pathfind`) into a search scope. The destination field uses this to offer only files a path can reach.

**`search-field.ts`** (307 lines) is one reusable search input with its results list.
- It exports `createSearchField(options)`.
- It handles typing, arrow keys, Enter, click and Escape.
- It calls `searchGraph` and `searchRows` from `graph-search.ts` and uses the limits and types from there.
- It also pulls in `announce`/`withdraw`, `escapeHtml` and the directory and file icons from sibling client modules.

**`search-bar.ts`** (222 lines) is the top-level bar.
- It exports `createSearchBar(options)`.
- It creates two `search-field` instances: a subject field, and a destination field that appears once something is pinned.
- It uses `destinationScope` from `graph-search.ts` to limit the destination field.
- It also owns the path status line and the strip of path hops, using `PathHop` and `Reach` from `../pathfind`.

**`graph-search.test.ts`** (267 lines) is the vitest suite. It tests only `graph-search.ts`: the index, the scoring helpers, `searchGraph`, `searchRows`, `reachWords` and `destinationScope`. The two UI files have no tests here.

**How the rest of the client uses the folder**
- `index.ts` imports `searchIndexOf` and `createSearchBar`, so it builds the index and mounts the bar.
- `panels/sources-view.ts` reuses `createSearchField` and the types directly, without going through the bar.
- `history/file-identity.ts` imports `directoriesOf`.
- `history/moment-paths.test.ts` imports `destinationScope`, `searchGraph` and `searchIndexOf`.
- `pathfind.ts` only mentions `search-bar.ts` in a comment. The search code depends on `pathfind` types, not the other way round.

The data flow is: nodes go through `searchIndexOf` into an index. A query goes through `searchGraph` and `searchRows` into rows, which a `search-field` renders. `search-bar` combines two fields and the path display.

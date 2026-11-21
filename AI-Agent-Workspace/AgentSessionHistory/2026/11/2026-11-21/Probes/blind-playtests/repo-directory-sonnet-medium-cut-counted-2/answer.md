The `packages/explorer/src/client/search` folder has four files. Three are implementation files and one is a test. I read each file's page in the map, so this comes from the map's own descriptions and dependency lists, not from the source code.

**The four files**
- **`graph-search.ts`** is the base layer. It is a pure search with no UI. It builds the search index once from the bundle's files, then scores and groups the matches. It defines the shared types `SearchHit`, `SearchScope`, `SearchIndex` and `SearchRow`. It also defines the functions `searchIndexOf`, `searchGraph`, `searchRows`, `reachWords` and `destinationScope`.
- **`search-field.ts`** is a single search field with its results listed underneath. It exports `createSearchField`. It imports `searchGraph`, `searchRows` and the `Search*` types from `graph-search.ts`. It also uses `announce` and `withdraw` from `../announce.ts` and `escapeHtml` from `../graph-helpers.ts`. Its job is to search as you type, move the selection with the arrow keys, choose with Enter or a click, expand a file's fold in place, and restore the earlier words on Escape.
- **`search-bar.ts`** is the search bar at the top of the Explorer. It exports `createSearchBar`. It builds two search fields with `createSearchField`: one finds the next thing to pin, and the other finds the end of a path from the newest pin. It also pulls `SearchHit`, `SearchIndex`, `SearchScope` and `destinationScope` from `graph-search.ts`. It imports `PathHop` and `Reach` from `../pathfind.ts`, `requireElement` from `../dom.ts`, and a payload type from `shared/types.ts`. It also draws the path status and the strip of file-inspection buttons.
- **`graph-search.test.ts`** is the test for `graph-search.ts`. It checks the search logic on its own.

**How they connect**
```
graph-search.ts   (pure search logic and types)
      ↑                 ↑
search-field.ts         |
 (one field + results)  |
      ↑                 |
search-bar.ts ──────────┘
 (two fields + path status)
```

- `search-bar.ts` depends on `search-field.ts` and `graph-search.ts`.
- `search-field.ts` depends on `graph-search.ts`.
- `graph-search.ts` depends on none of the other three.
- Outside the folder, `src/client/index.ts` uses `search-bar.ts`, and `panels/sources-view.ts` uses `search-field.ts`.

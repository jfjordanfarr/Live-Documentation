The `packages/explorer/src/client/search` folder has four files, and `graph-search.ts` is the hub the other three connect through.

- **`graph-search.ts`** is the core. Its description is "The one search of the Explorer, pure: a few typed words find directories by their last segment, file…". It exports the search types and functions: `SearchWords`, `SearchScope`, `SearchHit`, `SearchIndex`, `searchGraph`, `searchRows`, `searchIndexOf`, `reachWords`, `destinationScope`, and `SearchRow`.
- **`search-field.ts`** is one search field with its results under it. Its purpose says the bar makes it twice, and its rows are drawn by `searchRows`. It depends on `graph-search.ts` for `SearchGroup`, `SearchHit`, `SearchRow`, `SearchScope`, `searchGraph`, and `searchRows`. It also uses `announce` and `withdraw` from `client/announce.ts`, and `escapeHtml` from `client/graph-helpers.ts`. Its public symbols are `SearchField`, `SearchFieldOptions`, and `createSearchField`.
- **`search-bar.ts`** is the search bar at the top of the Explorer. Its purpose says the first field shows the newest pin and its destination. The map shows it has `SearchWords`, `createSearchBar`, `StatusTone`, `SearchBarOptions`, and `SearchBar`, and that it uses `graph-search.ts` (the `SearchWords` and `createSearchBar` links) and `search-field.ts` (the `SearchBar` links). I didn't open its dependency list directly, so the exact import list is from the map view.
- **`graph-search.test.ts`** is the test for `graph-search.ts`. The map labels it as a test, but I didn't open it, so I can't say what it checks.

In short: `graph-search.ts` holds the logic, `search-field.ts` and `search-bar.ts` build the UI on top of it, and the test covers the core logic.

Side effect: the bottom-right pin counter went from "1 pin" to "2 pins" while I was browsing. I didn't click any pin buttons on purpose, so the view may have pinned something as I opened files.

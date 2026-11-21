The `search` folder has four files, and the map shows how they connect. I read the first two in detail. For the other two I only have the map's short descriptions.

- **`graph-search.ts`** is the core. Its description says it is "the one search of the Explorer, pure: a few typed words find directories by their last segment." It exposes a set of named pieces: `reachWords`, `destinationScope`, `SearchHit`, `SearchScope`, `SearchIndex`, `searchIndexOf`, `searchGraph`, and `SearchRow`. It also takes input from the search bar and feeds results to the file-level search views.
- **`search-bar.ts`** is the search bar at the top of the Explorer. It contains `SearchWords`, `createSearchBar`, `StatusTone`, `SearchBarOptions`, and `SearchBar`, and its `Internals` section is linked to the folder. Its job is to take what you type and pass it on to the graph search. Its first field shows the newest pin and destination.
- **`search-field.ts`** is one search field, with its results. Per the map, the bar uses it twice, so the same component is reused. I did not open it in full.
- **`graph-search.test.ts`** is the test file for `graph-search.ts`. It is linked to that module, and the map marks it as test-backed. I did not open it.

In short: the bar (`search-bar.ts`) and the field (`search-field.ts`) are the UI. Both call into `graph-search.ts`, which does the matching. The test file checks the matching logic.

I typed the folder path into the Explorer's search box, opened the files from the results, and left the page in its current state. I did not copy anything to the clipboard.

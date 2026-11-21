The `packages/explorer/src/client/search` folder has four files, and they form a small chain: a pure search core, a search bar that uses it, and a search field inside that bar.

- **graph-search.ts** is the core. Its description says it is "the one search of the Explorer, pure: a few typed words find directories by their last segment." It exposes the pieces the others use: `SearchWords`, `SearchHit`, `SearchScope`, `SearchIndex`, `searchIndexOf`, `searchGraph` (which finds files and directories and groups them by directory), and `SearchRow`. It also uses `reachWords` and `destinationScope` to work out what a search can reach.
- **search-bar.ts** is the bar at the top of the Explorer. It sits on top of the core: `SearchWords` lets it read the words typed, and `createSearchBar` builds it. It also has `StatusTone`, `SearchBarOptions`, and a `SearchBar` piece. It is the only file that calls the core directly from the top of the page.
- **search-field.ts** is one field inside that bar. `createSearchField` builds a single input with its results area, `SearchFieldOptions` says what a field is made from, and `SearchField` is the piece that shows words while nobody is typing. The bar wires two of these together, so the field is a child of the bar and depends on the core for the words.
- **graph-search.test.ts** is the test for the core. It is the only test in the folder, and it is linked to graph-search.ts.

In short: graph-search.ts does the matching, search-field.ts is one input box, and search-bar.ts combines the field with the core into the top-of-page bar. All three depend on the internal module of the same folder.

I opened the four files by searching for them in the map, which left three cards pinned on the map. I did not change any files.

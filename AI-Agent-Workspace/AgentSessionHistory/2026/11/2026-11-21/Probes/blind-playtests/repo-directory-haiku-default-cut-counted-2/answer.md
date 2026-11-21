The folder `packages/explorer/src/client/search` has four files, and they split into a core and a UI layer that connect through a shared `Internals` piece.

- **graph-search.ts** is the core. Its description says it is "the one search of the Explorer, pure: a few typed words find directories by their last segment." It defines the search logic: `SearchWords`, `SearchScope`, `SearchHit`, `SearchIndex`, `searchGraph`, and `SearchRow`. It also has a test file, `graph-search.test.ts`, which is marked as test-backed.
- **search-bar.ts** is the top bar you see at the top of the Explorer. Its description says the first field "shows the newest pin and…", and it uses the core's words and results. It has `createSearchBar`, `StatusTone`, `SearchBarOptions`, and `SearchBar`. It draws on `Internals` from the same folder.
- **search-field.ts** builds one search field with its results list underneath. It has `createSearchField`, `SearchFieldOptions`, and `SearchField`. Its description says the bar uses it twice: once for the words typed and once for the destination. It also draws on `Internals`.
- **search-bar.ts** and **search-field.ts** both depend on the `Internals` node in the same folder, so that node is the shared helper between the UI files.

The map shows the core's connections: `searchGraph` and `SearchIndex` feed results to the UI, and `searchIndexOf` builds the index for each bar search.

There's also a test file at `tests/e2e/search-bar.ts`, which is a separate test for the bar, not in this folder.

I opened these by typing into the map's search box, and that left three pins on the map. Clicking the pin icon on a node removes it.

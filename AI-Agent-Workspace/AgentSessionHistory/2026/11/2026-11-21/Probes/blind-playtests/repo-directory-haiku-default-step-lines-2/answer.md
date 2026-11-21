The folder has four files, and the map shows them as one small pipeline. I read this from the map's cards and connection lines, not from the source code itself.

- **graph-search.ts** is the core. Its card calls it "the one search of the Explorer, pure: a few typed words find directories by their last segment." It holds the search logic: `SearchWords`, `SearchScope`, `SearchHit`, `SearchIndex`, `searchGraph` (which finds files and directories and groups them by directory), `searchIndexOf`, and `SearchRow`. Everything else in the folder depends on it.
- **search-bar.ts** is the bar at the top of the Explorer. It uses graph-search through `SearchWords`, `SearchScope`, `SearchBarOptions`, and `SearchBar`. Its card says the first field shows the newest pin, and it also has `createSearchBar` and `StatusTone`.
- **search-field.ts** is a single search field with its own results. Its card says the bar uses it twice, so the bar's two fields are built from this one component.
- **graph-search.test.ts** is the test file for graph-search.ts. It's the only file that appears in the map's test-backed view, and it has its own connections to the search code.

In short: graph-search.ts does the matching, search-field.ts is the reusable input-and-results widget, and search-bar.ts puts two of those fields into the top bar. The test file checks the matching logic.

I didn't open search-field.ts's full card, so its exact connections are less certain than the other three.

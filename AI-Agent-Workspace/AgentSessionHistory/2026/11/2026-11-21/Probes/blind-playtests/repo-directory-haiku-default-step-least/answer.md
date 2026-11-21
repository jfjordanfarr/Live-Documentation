The folder `packages/explorer/src/client/search` has four files, and they form a small chain around `graph-search.ts`:

- **`graph-search.ts`** is the core. Its own description calls it "the one search of the Explorer, pure: a few typed words find directories by their last segment." It defines the search pieces: `SearchWords`, `SearchScope`, `SearchHit`, `SearchIndex`, `searchIndexOf`, `searchGraph`, and `SearchRow`. Those pieces take the typed words, look them up in an index, and return matching files and directories grouped by directory.
- **`search-bar.ts`** is the search bar at the top of the Explorer. Its description says the first field shows the newest pin and the destination. It contains `SearchWords`, `createSearchBar`, `StatusTone`, `SearchBarOptions`, and `SearchBar`. The map shows it uses `graph-search.ts`, with `createSearchBar` calling into the search code.
- **`search-field.ts`** is one search field with its own results. Its card says the bar shows two fields, and the map shows it connected to the search logic.
- **`graph-search.test.ts`** is the test file for `graph-search.ts`, shown as a test-backed link in the map.

So the flow is: `search-bar.ts` and `search-field.ts` take what you type, `graph-search.ts` does the matching, and `graph-search.test.ts` checks the matching logic. Outside this folder, the map also links the search code to history files such as `file-identity.ts`, and to the tests in `tests/e2e/search-bar.ts`.

I didn't open `search-field.ts` in full, so its details come from the short card only. Also, I clicked around the map, and the pin counter went from 1 to 2, so the map may have recorded a pin during my clicks.

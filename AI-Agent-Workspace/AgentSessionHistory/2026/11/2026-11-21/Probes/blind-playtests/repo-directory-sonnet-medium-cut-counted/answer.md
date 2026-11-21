`packages/explorer/src/client/search` holds four files. I opened the folder in the map and read each file's description and its connections. The map's descriptions were cut off in places, so the picture below is partly an inference from the connection lines.

**How they fit together**

- **`graph-search.ts`** is the pure search logic, with no interface. It builds the search index from the bundle's files (`searchIndexOf`, `SearchIndex`). It ranks files and directories into grouped results (`searchGraph`, `SearchHit`, `SearchRow`). It also works out the scope of a search from the newest pin and the destination (`destinationScope`, `reachWords`, `SearchScope`). It is the main provider in the folder, and its outputs are used heavily across the client.
- **`search-field.ts`** is one search field with its results beneath it. Per its description, the bar uses two of these. One field searches the words as typed, and the other searches the destination. It uses `graph-search.ts` for the matching.
- **`search-bar.ts`** is the search bar at the top of the Explorer. It builds the bar from those fields (`createSearchBar`, `SearchBar`, `SearchBarOptions`). It also defines the words each field shows (`SearchWords`) and the status colouring (`StatusTone`). It is the part the rest of the app uses. The first field shows the newest pin, and the second is the "Path to…" box.
- **`graph-search.test.ts`** is the Vitest test for the pure search. It checks how directories are derived from files, how words are split, and how files are grouped by directory. It tests `graph-search.ts` directly.

So the layering is `search-bar.ts` on top, then `search-field.ts`, then `graph-search.ts`, with the test covering the bottom layer. I didn't check a few details, such as whether `search-bar.ts` also imports `graph-search.ts` directly. The map also shows files outside the folder, such as `palette.ts` and `types.ts`, connected to these files.

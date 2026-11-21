The `search` folder (packages/explorer/src/client/search) holds four files. One does the searching, two build the search fields on top of it, and one tests it.

- **`graph-search.ts`** is the search logic itself. It has no screen code. It finds directories, files and symbols from typed words and groups the results by directory, then file, then matched symbols. `searchRows` flattens those groups into the order the field draws them. `destinationScope` limits the second field to what can be reached from the newest pin. It imports `pathfind.ts` (for `Reach`) and `shared/types.ts`.
- **`search-field.ts`** is one search box with its results list. It builds on `graph-search.ts` and also imports `announce.ts` (screen-reader announcements) and `graph-helpers.ts`. It runs the search as you type and draws the rows in `searchRows` order. It handles the arrow keys, Enter and Escape, and the fold row that expands a file's matches.
- **`search-bar.ts`** is the bar at the top of the Explorer. It makes two search fields. The first finds the next thing to pin. The second appears once something is pinned and offers only what a path from the newest pin can reach. It also draws the path status line and the strip of file buttons. It imports `dom.ts`, `pathfind.ts` and `graph-search.ts`. I didn't open its full dependency list. It almost certainly also uses `search-field.ts`, since its description says the bar makes the fields.
- **`graph-search.test.ts`** tests `graph-search.ts`.

So the chain is `graph-search.ts` (logic), then `search-field.ts` (one field), then `search-bar.ts` (the full bar).

Outside the folder, `graph-search.ts` is also used by `client/index.ts`, `panels/sources-view.ts`, and two files in `history/`: `file-identity.ts` and `moment-paths.test.ts`.

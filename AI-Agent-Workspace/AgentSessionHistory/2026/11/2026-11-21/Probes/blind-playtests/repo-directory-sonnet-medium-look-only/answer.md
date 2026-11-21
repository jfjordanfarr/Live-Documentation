The folder `packages/explorer/src/client/search` holds four files. Three are source files and one is a test. I read the links from the Local Map, and the lines were dense, so the finer details are my best reading.

- **`graph-search.ts`** is the search logic. It builds on `shared/types.ts` and `client/pathfind.ts`, which sit outside the folder. It is test-backed by `graph-search.test.ts`.
- **`graph-search.test.ts`** is the test for `graph-search.ts`. Nothing else uses it.
- **`search-field.ts`** is a single input field. `search-bar.ts` uses it.
- **`search-bar.ts`** is the top-level piece that ties the others together. It uses `search-field.ts` and `graph-search.ts`. It also uses `client/dom.ts` and `client/pathfind.ts`, which are outside the folder. The map and the file's own description show it exporting `createSearchBar`, `SearchBar`, `SearchBarOptions`, `SearchWords` and `StatusTone`. It describes the search bar at the top of the Explorer.
- **`client/index.ts`** uses `search-bar.ts`. Of the folder's files, only `search-bar.ts` shows a link to it on the map.

The flow runs from `index.ts` to `search-bar.ts`. That file uses `search-field.ts` for input and `graph-search.ts` for the search itself, and `graph-search.test.ts` tests the search.

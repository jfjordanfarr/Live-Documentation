The `search` folder holds four files. `graph-search.ts` is the base, and the other three build on it.

- **`graph-search.ts`** is the search logic. It has no screen code. It finds directories, files and symbols from a few typed words. It groups the results by directory, then file, then matched symbols. `searchRows` flattens those groups into the rows the keyboard walks through. `destinationScope` limits the destination field to what the newest pin can reach. It imports `pathfind.ts` (for `Reach`) and `shared/types.ts`.
- **`search-field.ts`** is the search box itself, with `createSearchField`. It imports many search types and functions from `graph-search.ts`, including `searchGraph` and `searchRows`. It also uses `announce`/`withdraw` from `client/announce.ts` and `escapeHtml` from `graph-helpers.ts`.
- **`search-bar.ts`** is the search bar. It depends on `graph-search.ts`, as `graph-search.ts` lists it as a dependent. I didn't open its own page, so I can't say if it also uses `search-field.ts`.
- **`graph-search.test.ts`** tests `graph-search.ts`.

Outside the folder, `graph-search.ts` is also used by `client/index.ts`, `panels/sources-view.ts`, `history/file-identity.ts` and `history/moment-paths.test.ts`. It is cited in two of the project's design docs: `architectural-decisions.mdmd.md` and `live-documentation-explorer.mdmd.md`.

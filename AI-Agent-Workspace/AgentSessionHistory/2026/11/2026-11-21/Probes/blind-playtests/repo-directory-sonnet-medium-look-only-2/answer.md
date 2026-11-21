The `search` folder holds four files. `graph-search.ts` is the base, `search-field.ts` builds on it, and `search-bar.ts` builds on both.

**Files**
- **`graph-search.ts`** is the search logic. It has no UI. It defines the search types (`SearchHit`, `SearchScope`, `SearchIndex`, `SearchRow`) and the functions `searchGraph`, `searchIndexOf`, `searchRows` and `destinationScope`. It searches directory names, file names, paths and symbols. The map says it's "pure", meaning no DOM.
- **`graph-search.test.ts`** is the Vitest test for `graph-search.ts`.
- **`search-field.ts`** is one search box with its results list (`createSearchField`).
  - It runs the typed words through `searchGraph` and `searchRows` from `graph-search.ts`.
  - It handles the arrow keys, Enter and click to choose a result, a fold that opens a file in place, and Escape to restore the earlier words.
  - It also uses `announce` and `withdraw` from `../announce.ts` and `escapeHtml` from `../graph-helpers.ts`.
- **`search-bar.ts`** is the bar at the top of the Explorer (`createSearchBar`).
  - It creates two `search-field` instances. The first finds the next thing to pin. The second appears once something is pinned and finds the end of a path from the newest pin.
  - It also draws the path status report and the strip of file-inspection buttons.
  - Beyond `search-field.ts`, it uses `graph-search.ts` types and `destinationScope`. It also uses `dom.ts`, `pathfind.ts` (`PathHop`, `Reach`) and `shared/types.ts`.

**Dependency chain**
`graph-search.ts` ← `search-field.ts` ← `search-bar.ts` ← `client/index.ts`, which is the only file outside the folder that uses `search-bar.ts`. `search-field.ts` is also used by `panels/sources-view.ts`. The test file only checks `graph-search.ts`.

I didn't open the test file itself, so its description comes from the card on the map.

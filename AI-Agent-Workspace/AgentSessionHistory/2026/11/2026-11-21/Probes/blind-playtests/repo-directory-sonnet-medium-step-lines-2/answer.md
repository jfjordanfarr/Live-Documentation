The `packages/explorer/src/client/search` folder has four files. I opened it in the Local Map and read the Purpose, Dependencies and Dependents lists for `graph-search.ts`, `search-field.ts` and `search-bar.ts`. For `graph-search.test.ts` I only saw the card's summary line, not its full page.

**The files**
- **`graph-search.ts`** is the pure search logic, with no UI. It finds directories by their last segment and files by name, path and symbols. It exports `searchGraph`, `searchIndexOf`, `destinationScope`, `reachWords`, and the types `SearchHit`, `SearchScope`, `SearchIndex` and `SearchRow`.
- **`search-field.ts`** is one search box with its results list. It exports `createSearchField`. It filters as you type and handles arrow keys, Enter, click and Escape. Each result row can fold open to show a file's contents. It gets its search behaviour from `graph-search.ts`.
- **`search-bar.ts`** is the bar at the top of the Explorer. It exports `createSearchBar`. It has two fields:
  - The first finds the next thing to pin.
  - The second appears once something is pinned. It finds the end of a path from the newest pin and offers only what that pin can reach.
  
  The bar also draws the path status and the strip of file buttons.
- **`graph-search.test.ts`** is a Vitest test file for `graph-search.ts`.

**How they connect**
- `search-bar.ts` is the top layer. It builds two search fields by calling `createSearchField` from `search-field.ts`.
- `search-field.ts` is the middle layer. It imports `graph-search.ts` for searching and row ordering. It also imports `announce` and `withdraw` from `../announce.ts` and `escapeHtml` from `../graph-helpers.ts`.
- `graph-search.ts` is the base layer. Both `search-bar.ts` and `search-field.ts` import its types and functions. `search-bar.ts` uses `destinationScope` to work out what the second field may offer.
- `search-bar.ts` also imports `requireElement` from `../dom.ts`, `PathHop` and `Reach` from `../pathfind.ts`, and `ExplorerNodePayload` from `shared/types.ts`.
- Outside the folder, `search-bar.ts` is imported by `client/index.ts`. `search-field.ts` is also imported by `panels/sources-view.ts`.

So the flow is `client/index.ts` → `search-bar.ts` → `search-field.ts` → `graph-search.ts`. `search-bar.ts` also calls `graph-search.ts` directly.

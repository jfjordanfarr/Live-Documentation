The folder has four files, and `graph-search.ts` is the hub that the others connect through. I opened `graph-search.ts` and read its panel and the cards beside it. I didn't open `search-bar.ts` or `graph-search.test.ts` individually, so their roles below come from their names and the map labels.

- **`graph-search.ts`** is the core. Its description says it is "the one search of the Explorer, pure: a few typed words find directories by their last segment…". It exposes the search functions as named pieces: `reachWords`, `destinationScope`, `SearchHit`, `SearchScope`, `SearchIndex`, `searchIndexOf`, `searchGraph`, and `SearchRow`. Its links fan out to the history files on the right (`moment-paths.test.ts`, `file-identity.ts`) and to `search-field.ts`.
- **`search-field.ts`** is the input the user types into. The map describes it as "one search field with its results," and it shares the same words-to-results logic as the bar.
- **`search-bar.ts`** is the other search surface. The map says it searches "twice by the bar: the words typed…", which suggests it reuses the same core search rather than doing its own matching.
- **`graph-search.test.ts`** is the test file for `graph-search.ts`. It's marked as test-backed on the map.

So the pattern is: `graph-search.ts` holds the pure search logic, the search field and bar call into it, and the test file checks it. The map also shows `graph-search.ts` depending on history code (`file-identity.ts`, `moment-paths.test.ts`), which is how search results link back to the file's history.

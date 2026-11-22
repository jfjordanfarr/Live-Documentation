The folder has four files in three layers. Each layer imports only from the one below it.

**`graph-search.ts` (336 lines): the search logic.**
- It has no UI and no DOM code, and it imports only types.
- It defines the shared types: `SearchHit` (a directory, file or symbol), `SearchResult`, `SearchScope`, `SearchRow` and `SearchIndex`.
- Its functions build and query the index: `searchIndexOf`, `searchGraph`, `searchRows`, and the scoring helpers `termsOf`, `directoryScore` and `fileNameScore`.
- It also exports `destinationScope` and `reachWords`, which narrow a search to what a path from the newest pin can reach, using the `Reach` type from `../pathfind`.
- It exports `FILE_LIMIT` and `DIRECTORY_LIMIT`.

**`search-field.ts` (307 lines): one search box with its results list.**
- It imports `searchGraph`, `searchRows`, the limits and the types from `graph-search`.
- Its `createSearchField` takes an input, a results element, a `scope()` callback that is read on every keystroke, and an `onChoose` callback.
- It handles arrow-key navigation, Enter, click and Escape. It also handles the "more…" folds that reveal results the limits cut off, and the "Nothing found" message.
- Its only other imports are from outside the folder: `announce`, `escapeHtml` and the icons.

**`search-bar.ts` (222 lines): the composite bar.**
- It imports `destinationScope` and the types from `graph-search`, and `createSearchField` from `search-field`.
- It creates two fields. The subject field searches the whole index. The destination field appears once something is pinned and searches only what is reachable from the newest pin.
- It also owns the path status line and the strip of path hops.
- Its interface is `setIndex`, `sync`, `showPath`, `setStatus`, `clearPath` and `focusSubject`.

**`graph-search.test.ts` (267 lines)** is the vitest suite for `graph-search.ts` only. The field and bar have no tests here.

Files outside the folder use it like this:
- `client/index.ts` imports `searchIndexOf` and `createSearchBar`, so it is the main consumer.
- `panels/sources-view.ts` reuses `createSearchField` directly, without the bar.
- `history/file-identity.ts` uses `directoriesOf`.
- `history/moment-paths.test.ts` uses `searchGraph`, `searchIndexOf` and `destinationScope`.

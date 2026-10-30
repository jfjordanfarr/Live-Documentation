# packages/explorer/src/client/search/graph-search.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/search/graph-search.ts
- Generated At: 2026-10-30T14:49:26.050Z

## Authored
### Purpose

The one search of the Explorer, pure: a few typed words find directories by their last segment, files by name, path and symbols, and the symbols themselves, and the results come grouped the way the declared structure reads, directory, then file, then the file's matched symbols, capped at five with the count of the rest unless the file is expanded. `searchRows` flattens the groups into the rows a keyboard walks, in the order the field draws them. `destinationScope` turns the reach of the newest pin into what the destination field searches: the connected files offered with their distance, a directory by its nearest file, and the rest kept apart under a fold.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)) when the owner asked for one search at the top in place of the Ctrl+P dialog and the FROM/TO toolbar, grouped "by directory, group by node, then have symbols". The scoring is the one the dialog and the toolbar each carried since the toolbar's creation on 2025-12-17: a name exact 100, as a prefix 50, anywhere 25; the path 10; a symbol 15. The directories are derived once from the files' ids, the scan root among them as the empty path.
- A file whose own name or path did not match, found by a symbol alone, is marked unmatched so that the field can show why it is listed; the fold ("n more symbols") is the honest indication of what the cap hides, and expanding a file lists every matched symbol.
- The scope (2026-10-14, [Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-walk-under-the-cli-and-the-explorer-and-a-destination-field-that-offers-only-what-connects-recorded-2026-10-14)): a search returns the count of files matched before the limit, so that the fold under the offered rows can say how many files match but no path connects; `reachWords` are "n files" and "n files, the other way", the status line's own words; a directory offered by name says what its nearest file says, one the map can draw to before one the other way, since the search between sets answers from a directory's nearest file.
- The order (2026-10-30, the remediation plan the owner accepted at [Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)): the October 23 review typed "generator" and found `generator.ts` in the ninth row, behind a symbol of `tsconfig.base.json` and `GeneratorIdentity`, for two reasons. A file's name was scored with its extension, so a word was never an exact match for a file; and the score only decided which twelve files made the cut, the groups then standing alphabetically by directory. Now each word takes the better of the name with and without its extension (`fileNameScore`), the groups stand by their best score, a directory found by its own name counting its own score beside its files', and a group's files by score, then name. The weights themselves are unchanged.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchHit` {#symbol-searchhit}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L10)

##### `SearchHit` — Summary
The three kinds of thing a search can find, each of which a pin can hold.

#### `SearchFile` {#symbol-searchfile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L16)

##### `SearchFile` — Summary
One file in a group: the file, and the symbols of it the words matched, capped unless the file is expanded.

#### `SearchGroup` {#symbol-searchgroup}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L26)

##### `SearchGroup` — Summary
A directory and the files found in it, directly or below.

#### `SearchResult` {#symbol-searchresult}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L34)

##### `SearchResult` — Summary
What a search found: the groups within the limits, and how many files the words matched before them.

#### `SearchScope` {#symbol-searchscope}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L41)

##### `SearchScope` — Summary
What a field searches: the index offered, the words on an offered row, and the files kept apart under a fold.

#### `SearchRow` {#symbol-searchrow}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L56)
- Returns: [`SearchHit`](#symbol-searchhit)

##### `SearchRow` — Summary
A row the keyboard walks: a thing to choose, or the fold that reveals a file's remaining symbols.

#### `SearchIndex` {#symbol-searchindex}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L59)

##### `SearchIndex` — Summary
What a search is run over: the files, and every directory above them, computed once.

#### `SearchOptions` {#symbol-searchoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L65)

##### `SearchOptions` — Summary
What a search is told beyond its words: which files list their matched symbols in full, and how many files, directories and symbols are offered.

#### `directoriesOf` {#symbol-directoriesof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L81)

##### `directoriesOf` — Summary
Every directory above the files, the scan root as "", deepest last within a branch.

#### `searchIndexOf` {#symbol-searchindexof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L91)
- Returns: [`SearchIndex`](#symbol-searchindex)

##### `searchIndexOf` — Summary
The index a bar searches, built once from the bundle's files.

#### `directoryOf` {#symbol-directoryof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L96)

##### `directoryOf` — Summary
The directory a file stands in.

#### `termsOf` {#symbol-termsof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L102)

##### `termsOf` — Summary
The words of a query, lowercased; an empty query has none.

#### `stemOf` {#symbol-stemof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L121)

##### `stemOf` — Summary
A file's name without its extension: "generator" for generator.ts; the whole name when it has none or its only dot leads.

#### `fileNameScore` {#symbol-filenamescore}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L130)

##### `fileNameScore` — Summary
How well a file's name answers the words: each word scored against the name with and without its extension and
the better taken, so that "generator" and "generator.ts" are both an exact match for generator.ts.

#### `searchGraph` {#symbol-searchgraph}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L143)
- Returns: [`SearchResult`](#symbol-searchresult)
- Parameters: `index`: [`SearchIndex`](#symbol-searchindex); `options`: [`SearchOptions`](#symbol-searchoptions)

##### `searchGraph` — Summary
The files and directories the words find, grouped by directory. A file scores by its name first, its path and its
symbols after, as the Explorer's searches always have; a directory by its last segment. The best-scored files are
kept; the groups stand in the order of their best score, a matched directory's own score counted with its files',
ties by directory, and the files inside a group by score, then name.

#### `searchRows` {#symbol-searchrows}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L206)
- Returns: [`SearchRow`](#symbol-searchrow)[]

##### `searchRows` — Summary
The rows of the groups in reading order: a matched directory, each file, its symbols, then the fold if any.

#### `reachWords` {#symbol-reachwords}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L220)
- Parameters: `reach`: [`Reach`](../panels/sources-facts.ts.mdmd.md#symbol-reach)

##### `reachWords` — Summary
The words a destination row carries: the files a path to it would show, and whether it runs the other way.

#### `destinationScope` {#symbol-destinationscope}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L230)
- Returns: [`SearchScope`](#symbol-searchscope)
- Parameters: `index`: [`SearchIndex`](#symbol-searchindex); `reach`: [`Reach`](../panels/sources-facts.ts.mdmd.md#symbol-reach)

##### `destinationScope` — Summary
The destination's scope from the reach of the newest pin: the connected files offered with their distance, a
directory by its nearest file (one the map can draw to before one the other way), and the rest kept apart under
a fold.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pathfind.Reach`](../pathfind.ts.mdmd.md#symbol-reach) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

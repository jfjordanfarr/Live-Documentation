# packages/explorer/src/client/search/graph-search.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/search/graph-search.ts
- Generated At: 2026-10-14T18:27:57.711Z

## Authored
### Purpose

The one search of the Explorer, pure: a few typed words find directories by their last segment, files by name, path and symbols, and the symbols themselves, and the results come grouped the way the declared structure reads, directory, then file, then the file's matched symbols, capped at five with the count of the rest unless the file is expanded. `searchRows` flattens the groups into the rows a keyboard walks, in the order the field draws them.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)) when the owner asked for one search at the top in place of the Ctrl+P dialog and the FROM/TO toolbar, grouped "by directory, group by node, then have symbols". The scoring is the one the dialog and the toolbar each carried since the toolbar's creation on 2025-12-17: a name exact 100, as a prefix 50, anywhere 25; the path 10; a symbol 15. The directories are derived once from the files' ids, the scan root among them as the empty path.
- A file whose own name or path did not match, found by a symbol alone, is marked unmatched so that the field can show why it is listed; the fold ("n more symbols") is the honest indication of what the cap hides, and expanding a file lists every matched symbol.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchHit` {#symbol-searchhit}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L9)

##### `SearchHit` — Summary
The three kinds of thing a search can find, each of which a pin can hold.

#### `SearchFile` {#symbol-searchfile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L15)

##### `SearchFile` — Summary
One file in a group: the file, and the symbols of it the words matched, capped unless the file is expanded.

#### `SearchGroup` {#symbol-searchgroup}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L25)

##### `SearchGroup` — Summary
A directory and the files found in it, directly or below.

#### `SearchRow` {#symbol-searchrow}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L33)
- Returns: [`SearchHit`](#symbol-searchhit)

##### `SearchRow` — Summary
A row the keyboard walks: a thing to choose, or the fold that reveals a file's remaining symbols.

#### `SearchIndex` {#symbol-searchindex}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L36)

##### `SearchIndex` — Summary
What a search is run over: the files, and every directory above them, computed once.

#### `SearchOptions` {#symbol-searchoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L41)

#### `directoriesOf` {#symbol-directoriesof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L57)

##### `directoriesOf` — Summary
Every directory above the files, the scan root as "", deepest last within a branch.

#### `searchIndexOf` {#symbol-searchindexof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L67)
- Returns: [`SearchIndex`](#symbol-searchindex)

##### `searchIndexOf` — Summary
The index a bar searches, built once from the bundle's files.

#### `directoryOf` {#symbol-directoryof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L72)

##### `directoryOf` — Summary
The directory a file stands in.

#### `termsOf` {#symbol-termsof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L78)

##### `termsOf` — Summary
The words of a query, lowercased; an empty query has none.

#### `searchGraph` {#symbol-searchgraph}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L97)
- Returns: [`SearchGroup`](#symbol-searchgroup)[]
- Parameters: `index`: [`SearchIndex`](#symbol-searchindex); `options`: [`SearchOptions`](#symbol-searchoptions)

##### `searchGraph` — Summary
The files and directories the words find, grouped by directory. A file scores by its name first, its path and its
symbols after, as the Explorer's searches always have; a directory by its last segment.

#### `searchRows` {#symbol-searchrows}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/graph-search.ts#L156)
- Returns: [`SearchRow`](#symbol-searchrow)[]

##### `searchRows` — Summary
The rows of the groups in reading order: a matched directory, each file, its symbols, then the fold if any.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

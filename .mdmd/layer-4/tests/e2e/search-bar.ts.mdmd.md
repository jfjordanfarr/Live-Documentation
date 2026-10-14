# tests/e2e/search-bar.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/search-bar.ts
- Generated At: 2026-10-14T21:05:01.798Z

## Authored
### Purpose

Helpers for the browser specs that drive the search bar: `choose` types into a field and picks the row wanted, a file by its path, a directory by its path or a symbol under its file; `pathAddress` builds an address that asks for a path, the origin pinned whole and newest, the destination named; `currentSnapshot` and `newestKey` read the exploration the page's address carries.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) with the bar, for the path, navigation, zoom and focus specs that had driven the FROM/TO toolbar or opened a path by the four loose address parameters, which the compressed snapshot's destination replaced.
- `choose` opens the fold when the row wanted is not offered (2026-10-14, [Turn 7](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7)), since the destination field keeps the files no path connects under it; a spec that asks for such a file gets the honest answer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchFieldName` {#symbol-searchfieldname}
- Type: type
- Source: [source](../../../../tests/e2e/search-bar.ts#L11)

#### `WantedRow` {#symbol-wantedrow}
- Type: type
- Source: [source](../../../../tests/e2e/search-bar.ts#L14)

##### `WantedRow` — Summary
The row wanted: a file by its path, a directory by its path, or a symbol of a file.

#### `choose` {#symbol-choose}
- Type: function
- Source: [source](../../../../tests/e2e/search-bar.ts#L20)
- Parameters: `page`: `Page`; `field`: [`SearchFieldName`](#symbol-searchfieldname); `wanted`: [`WantedRow`](#symbol-wantedrow)

##### `choose` — Summary
Click a field of the bar, type, and choose the row wanted among the results. The destination field keeps the files
no path connects under a fold; when the row wanted is not offered and the fold stands, the fold is opened first.

#### `pathAddress` {#symbol-pathaddress}
- Type: function
- Source: [source](../../../../tests/e2e/search-bar.ts#L54)
- Parameters: `destination`: [`PathDestination`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-pathdestination)

##### `pathAddress` — Summary
An address that asks for a path: the origin pinned as a whole file and newest, the destination named, a file selected.

#### `currentSnapshot` {#symbol-currentsnapshot}
- Type: const
- Source: [source](../../../../tests/e2e/search-bar.ts#L64)

##### `currentSnapshot` — Summary
The exploration the page's address carries now.

#### `newestKey` {#symbol-newestkey}
- Type: function
- Source: [source](../../../../tests/e2e/search-bar.ts#L67)
- Parameters: `snapshot`: [`UrlStateSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)

##### `newestKey` — Summary
The key of the newest retained item in a snapshot, or null.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`types.PathDestination`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-pathdestination) (type-only)
- [`retained-state.retainedKey`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retainedkey)
<!-- LIVE-DOC:END Dependencies -->

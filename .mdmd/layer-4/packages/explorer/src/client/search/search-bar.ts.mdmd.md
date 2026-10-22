# packages/explorer/src/client/search/search-bar.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/search/search-bar.ts
- Generated At: 2026-10-22T16:47:54.917Z

## Authored
### Purpose

The search bar at the top of the Explorer: the first field shows the newest pin and finds the next thing to pin; the second, shown under a map marker once anything is pinned, is the end of a path from the newest pin, asked at once, and offers only what a path from that pin can reach, each row saying how far and which way, the rest folded. The bar also owns the path's report in the Local Map, the status line with the reverse question as a link, and the strip of the drawn path's hops, which `index.ts` rendered itself before.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)), the owner's words: "an omnisearch at the top which _becomes_ a pathfinding UI once anything is pinned. There should be no "FROM" text in the pathfinding and there should just be one omnisearch. Once a pin exists, _then_ we can have a map marker/location-like icon appear next to a new text input field for the omnisearch for destination"; and "field value = most recent pin".
- Ctrl+P, the dialog's shortcut since 2025-12-19, focuses the first field. The status line's and the strip's element ids (`pathfind-status`, `pathfind-path`) and classes are those of the toolbar they came from, so the specs that read a path's report read it where it was.
- What the fields show, and whether the second is shown, is told to the bar by the entry's `syncPerspectiveControls` on every render, from the retained state, with the reach from the newest pin (2026-10-14, [Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-walk-under-the-cli-and-the-explorer-and-a-destination-field-that-offers-only-what-connects-recorded-2026-10-14)); the bar turns the reach into the destination's scope only when it changes, and says "Nothing connects to X" in the placeholder when the reach is empty. Otherwise the bar holds no state of its own.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchWords` {#symbol-searchwords}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-bar.ts#L16)

##### `SearchWords` — Summary
The words a field shows for a pinned thing or a destination: its name, and where it stands for the tooltip.

#### `StatusTone` {#symbol-statustone}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-bar.ts#L24)

#### `SearchBarOptions` {#symbol-searchbaroptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-bar.ts#L29)

#### `SearchBar` {#symbol-searchbar}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-bar.ts#L43)

#### `createSearchBar` {#symbol-createsearchbar}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-bar.ts#L61)
- Returns: [`SearchBar`](#symbol-searchbar)
- Parameters: `options`: [`SearchBarOptions`](#symbol-searchbaroptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`pathfind.PathHop`](../pathfind.ts.mdmd.md#symbol-pathhop) (type-only)
- [`pathfind.Reach`](../pathfind.ts.mdmd.md#symbol-reach) (type-only)
- [`graph-search.SearchHit`](./graph-search.ts.mdmd.md#symbol-searchhit)
- [`graph-search.SearchIndex`](./graph-search.ts.mdmd.md#symbol-searchindex)
- [`graph-search.SearchScope`](./graph-search.ts.mdmd.md#symbol-searchscope)
- [`graph-search.destinationScope`](./graph-search.ts.mdmd.md#symbol-destinationscope)
- [`search-field.createSearchField`](./search-field.ts.mdmd.md#symbol-createsearchfield)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

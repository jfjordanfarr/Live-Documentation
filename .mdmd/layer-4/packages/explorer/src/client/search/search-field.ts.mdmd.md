# packages/explorer/src/client/search/search-field.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/search/search-field.ts
- Generated At: 2026-10-14T18:27:57.776Z

## Authored
### Purpose

One search field with its results under it, made twice by the bar: the words typed are searched as they are typed, the rows are drawn in the order `searchRows` walks them so that the indices agree, the arrow keys move the selection, Enter or a click chooses, the fold row expands its file in place, Escape and leaving the field put back the words it showed.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)) as the one field that replaces three: the Ctrl+P dialog (`panels/omnisearch.ts`, extracted from `index.ts` on 2025-12-19 as the Explorer's quick-open) and the pathfind toolbar's FROM and TO fields (`pathfind.ts`, 2025-12-17), which carried three copies of the same search and two of the same keyboard handling.
- A mousedown on the results is prevented from taking the focus, so a click on a row is a choice rather than a leave; a leave without a choice settles the field 150 ms later, as the toolbar's fields did.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchFieldOptions` {#symbol-searchfieldoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L10)

#### `SearchField` {#symbol-searchfield}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L18)

#### `createSearchField` {#symbol-createsearchfield}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L26)
- Returns: [`SearchField`](#symbol-searchfield)
- Parameters: `options`: [`SearchFieldOptions`](#symbol-searchfieldoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph-helpers.escapeHtml`](../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`graph-search.SearchHit`](./graph-search.ts.mdmd.md#symbol-searchhit)
- [`graph-search.SearchIndex`](./graph-search.ts.mdmd.md#symbol-searchindex)
- [`graph-search.SearchRow`](./graph-search.ts.mdmd.md#symbol-searchrow)
- [`graph-search.searchGraph`](./graph-search.ts.mdmd.md#symbol-searchgraph)
- [`graph-search.searchRows`](./graph-search.ts.mdmd.md#symbol-searchrows)
<!-- LIVE-DOC:END Dependencies -->

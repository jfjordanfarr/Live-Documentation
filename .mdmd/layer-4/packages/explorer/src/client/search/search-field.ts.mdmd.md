# packages/explorer/src/client/search/search-field.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/search/search-field.ts
- Generated At: 2026-10-16T14:48:53.699Z

## Authored
### Purpose

One search field with its results under it, made twice by the bar: the words typed are searched as they are typed, the rows are drawn in the order `searchRows` walks them so that the indices agree, the arrow keys move the selection, Enter or a click chooses, the fold row expands its file in place, Escape and leaving the field put back the words it showed. Each field searches a scope: the index offered, the words a row carries, and the files kept apart under a fold that opens in place.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)) as the one field that replaces three: the Ctrl+P dialog (`panels/omnisearch.ts`, extracted from `index.ts` on 2025-12-19 as the Explorer's quick-open) and the pathfind toolbar's FROM and TO fields (`pathfind.ts`, 2025-12-17), which carried three copies of the same search and two of the same keyboard handling.
- A mousedown on the results is prevented from taking the focus, so a click on a row is a choice rather than a leave; a leave without a choice settles the field 150 ms later, as the toolbar's fields did.
- The scope is read at every keystroke (2026-10-14, [Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7)), so that the bar can change the destination's as the newest pin changes. The fold row toggles the apart section, whose rows are drawn faded and marked with the scope's words; the row numbers are written after the HTML, in the order `searchRows` walks with the fold after the offered rows, so that the keyboard and the click agree.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchFieldOptions` {#symbol-searchfieldoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L11)

##### `SearchFieldOptions` — Summary
What a search field is made from: its input and its results element, the scope it searches, and what is done with the thing chosen.

#### `SearchField` {#symbol-searchfield}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L21)

##### `SearchField` — Summary
A search field as the bar drives it: show words while nobody types, take focus, and settle back to the shown words.

#### `createSearchField` {#symbol-createsearchfield}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L38)
- Returns: [`SearchField`](#symbol-searchfield)
- Parameters: `options`: [`SearchFieldOptions`](#symbol-searchfieldoptions)

##### `createSearchField` — Summary
Make a search field over an input and a results element: typing searches the scope, the arrows walk the rows, Enter or a click chooses, Escape settles.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph-helpers.escapeHtml`](../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`graph-search.SearchGroup`](./graph-search.ts.mdmd.md#symbol-searchgroup)
- [`graph-search.SearchHit`](./graph-search.ts.mdmd.md#symbol-searchhit)
- [`graph-search.SearchRow`](./graph-search.ts.mdmd.md#symbol-searchrow)
- [`graph-search.SearchScope`](./graph-search.ts.mdmd.md#symbol-searchscope)
- [`graph-search.searchGraph`](./graph-search.ts.mdmd.md#symbol-searchgraph)
- [`graph-search.searchRows`](./graph-search.ts.mdmd.md#symbol-searchrows)
<!-- LIVE-DOC:END Dependencies -->

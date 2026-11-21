# `packages/explorer/src/client/search/search-field.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/search/search-field.ts`
- Generated At: 2026-11-21T09:00:30.001Z

## Authored
### Purpose

One search field with its results under it, made twice by the bar: the words typed are searched as they are typed, the rows are drawn in the order `searchRows` walks them so that the indices agree, the arrow keys move the selection, Enter or a click chooses, a fold row shows what it counts (a file's remaining symbols, a group's remaining files, the next files elsewhere, the next directories) and moves the selection to the first row it brought, Escape and leaving the field put back the words it showed. Each field searches a scope: the index offered, the words a row carries, and the files kept apart under a fold that opens in place.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-6); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#one-search-at-the-top-and-a-path-starts-at-the-newest-pin-recorded-2026-10-14)) as the one field that replaces three: the Ctrl+P dialog (`panels/omnisearch.ts`, extracted from `index.ts` on 2025-12-19 as the Explorer's quick-open) and the pathfind toolbar's FROM and TO fields (`pathfind.ts`, 2025-12-17), which carried three copies of the same search and two of the same keyboard handling.
- A mousedown on the results is prevented from taking the focus, so a click on a row is a choice rather than a leave; a leave without a choice settles the field 150 ms later, as the toolbar's fields did.
- The scope is read at every keystroke (2026-10-14, [Turn 7](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-7)), so that the bar can change the destination's as the newest pin changes. The fold row toggles the apart section, whose rows are drawn faded and marked with the scope's words; the row numbers are written after the HTML, in the order `searchRows` walks with the fold after the offered rows, so that the keyboard and the click agree.
- Escape marks itself handled (2026-10-20), so the reader behind the field and the World Map's keys leave that Escape alone: one key closes one thing. Before, Escape in the field also closed an open reader.
- A combobox over a listbox since 2026-10-30, under the remediation plan the owner accepted ([Turn 3](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-30/2026-10-30.1.record.md#turn-3)): the field makes its input `role="combobox"` with `aria-autocomplete="list"` and `aria-controls` naming its results, which it makes the `listbox`; `aria-expanded` follows whether the results show, every row is an `option` with an id of its place, and `aria-activedescendant` names the keyboard's row, so that a screen reader follows the arrows while focus stays in the input. Group headings are presentational. The field sets all of it, so every field made by it, the Knowledge Sources' "Reachable from" among them, carries the same; the keyboard is unchanged.
- Since 2026-11-19 ([Turn 14 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14)) "Nothing found" is said once in the page's status region ([announce.ts](../announce.ts.mdmd.md)) when the results empty, and taken back when words find something again or the field settles (WCAG 2.2 SC 4.1.3). Before, it was drawn alone under `role="presentation"` and a screen reader heard nothing.
- The folds since 2026-11-21 ([the blind runs](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/README.md#cut-counted-on-a-task-where-a-counter-is-the-shortest-way), whose testers met twelve of a folder's 32 files with no sign of the rest): every count of what the limits leave out is an `option` row drawn as the map's cut signs are, a downward arrow and the number, with a file's or a folder's glyph at the list's end where the place does not say the kind; `foldName` gives its words, "20 more files in packages/engine/src/live-docs/history: show them", as the row's `aria-label` and tooltip, and no sentence of ours stands on the list. The symbols' fold, "n more symbols" in italic words until then, took the same form so that the list has one sign of hidden rows. What a press revealed belongs to the words it was pressed under, kept apart for the offered and the apart sections, and is forgotten when the words change; a file's expanded symbols, named by the file, stay as before. After a press the keyboard's row moves to the first row the press brought, wherever its group stands, since files listed from elsewhere may join groups above the fold.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchFieldOptions` {#symbol-searchfieldoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L13)

##### `SearchFieldOptions` — Summary
What a search field is made from: its input and its results element, the scope it searches, and what is done with the thing chosen.

#### `SearchField` {#symbol-searchfield}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L23)

##### `SearchField` — Summary
A search field as the bar drives it: show words while nobody types, take focus, and settle back to the shown words.

#### `foldName` {#symbol-foldname}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L67)
- Parameters: `fold`: `CountFold`

##### `foldName` — Summary
The words of a fold for a screen reader and a resting pointer: what it counts, and what a press shows. On the
screen it is an arrow and the count, and the kind's glyph where its place does not say the kind.

#### `createSearchField` {#symbol-createsearchfield}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/search-field.ts#L89)
- Returns: [`SearchField`](#symbol-searchfield)
- Parameters: `options`: [`SearchFieldOptions`](#symbol-searchfieldoptions)

##### `createSearchField` — Summary
Make a search field over an input and a results element: typing searches the scope, the arrows walk the rows, Enter or a click chooses, Escape settles.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`announce`](../announce.ts.mdmd.md#symbol-announce)
- [`announce.withdraw`](../announce.ts.mdmd.md#symbol-withdraw)
- [`graph-helpers.escapeHtml`](../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`icon-button.DIRECTORY_ICON`](../panels/icon-button.ts.mdmd.md#symbol-directory_icon)
- [`icon-button.FILE_ICON`](../panels/icon-button.ts.mdmd.md#symbol-file_icon)
- [`graph-search.DIRECTORY_LIMIT`](./graph-search.ts.mdmd.md#symbol-directory_limit)
- [`graph-search.FILE_LIMIT`](./graph-search.ts.mdmd.md#symbol-file_limit)
- [`graph-search.SearchHit`](./graph-search.ts.mdmd.md#symbol-searchhit)
- [`graph-search.SearchResult`](./graph-search.ts.mdmd.md#symbol-searchresult)
- [`graph-search.SearchRow`](./graph-search.ts.mdmd.md#symbol-searchrow)
- [`graph-search.SearchScope`](./graph-search.ts.mdmd.md#symbol-searchscope)
- [`graph-search.searchGraph`](./graph-search.ts.mdmd.md#symbol-searchgraph)
- [`graph-search.searchRows`](./graph-search.ts.mdmd.md#symbol-searchrows)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

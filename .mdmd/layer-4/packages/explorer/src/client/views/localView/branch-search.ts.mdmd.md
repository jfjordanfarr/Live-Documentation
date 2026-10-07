# packages/explorer/src/client/views/localView/branch-search.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-search.ts
- Generated At: 2026-10-07T14:15:46.795Z

## Authored
### Purpose
The continuing search: after the first picture, the order step keeps trying seeded starts in the page's idle moments and the picture moves to one that beats the shown picture by more than the churn it costs; and a card's rows measured once, from which a pin's place for any order of them is arithmetic, so that a start is priced without the page.

### Notes
- Pure, no DOM, no clock. `beginSearch` and `judgeStart` are the search's state and its judge: a start is adopted when its price with its churn is strictly below the shown picture's own price, churn aside, and the shown price becomes the start's own; a run of starts as long as the patience none of which betters the best price found, churn aside, settles the search, and the last seed caps it; when both fall on one start the search is settled. Until later on 2026-10-07 the run counted starts not adopted, so a better start refused for its churn cut the search short; the four scopes' tables showed one such run on the estate's five files, and the owner's suspicion that the search approaches the best picture whatever the churn cost holds once the patience follows the best found ([Turn 18](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-18)). The seeds are a fixed sequence from the one after the last the first paint tried, so the picture after any number of starts is the same on every machine; only the moments they arrive differ. `CardRows` is a card's rows as the renderer measured them once at the chosen widths (the header, the gap, each visible row's height and its pins' places in it, which row is Internals); `orderedRows` stands them as the renderer's `orderRows` would (a named row per mention, the rest grouped by name in the order the names first stood, Internals last, or as they stand when no order is named) and `pinFor` sums the rows above a pin, rounding half pixels up as the page's measurement does; a symbol with no row falls to the Internals row, as the card's own anchor does. The lab's restarts tabulation runs the page's own judge over its tabulated starts (`simulateSearch`). Built for the plan's step 5 after the owner's go ([Turn 17](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-17)), to their stopping rule ([Turn 16](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SearchSettings` {#symbol-searchsettings}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L29)

##### `SearchSettings` — Summary
The seeds the search runs through and when it gives up.

#### `SearchState` {#symbol-searchstate}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L39)

##### `SearchState` — Summary
Where the search stands.

#### `beginSearch` {#symbol-beginsearch}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L59)
- Returns: [`SearchState`](#symbol-searchstate)
- Parameters: `settings`: [`SearchSettings`](#symbol-searchsettings)

##### `beginSearch` — Summary
A search about to try its first seed; already capped when there is none to try.

#### `judgeStart` {#symbol-judgestart}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L73)
- Parameters: `state`: [`SearchState`](#symbol-searchstate)

##### `judgeStart` — Summary
The next seed tried: the start is adopted when its price with its churn is
strictly below the shown picture's own, and the shown price becomes the
start's own. The start betters the best found when its price without
churn is strictly below it, adopted or not; else the run without a better
start grows, and the search settles when it reaches the patience. Past
the last seed the search is capped. `base` is the start's price without
churn, `priced` with it.

#### `RowMeasure` {#symbol-rowmeasure}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L90)

##### `RowMeasure` — Summary
One row of a card as measured once: its height and where its pins stand in it, from its top.

#### `CardRows` {#symbol-cardrows}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L99)

##### `CardRows` — Summary
A card's rows as measured once, in the order they stood; a pin's place for any order follows from them.

#### `orderedRows` {#symbol-orderedrows}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L115)
- Returns: [`RowMeasure`](#symbol-rowmeasure)[]
- Parameters: `card`: [`CardRows`](#symbol-cardrows)

##### `orderedRows` — Summary
The rows in the order the order step names them, as the renderer stands
them: a named row per mention of its name, then the rows not named, each
name's rows together in the order the names first stood, Internals last;
with no order named, the rows as they stand.

#### `pinFor` {#symbol-pinfor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L143)
- Parameters: `card`: [`CardRows`](#symbol-cardrows)

##### `pinFor` — Summary
Where a pin stands from its card's top when the rows stand in `order`:
the header, the rows above it with the gaps between, and the pin's place
in its row. A symbol with no row of its own, or none named, falls to the
Internals row, as the card's own anchor does; a card with neither answers
null. Rounded as the page's measurement is.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

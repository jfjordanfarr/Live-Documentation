# packages/explorer/src/client/views/localView/branch-search.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-search.ts
- Generated At: 2026-10-13T16:52:34.886Z

## Authored
### Purpose
Provides deterministic continuing-search decisions and a card-row model that relocates the renderer’s resolved endpoints without reading the DOM for each trial.

### Notes
- Pure, no DOM, no clock. `beginSearch` and `judgeStart` are the search's state and its judge: a start is adopted when its price with its churn is strictly below the shown picture's own price, churn aside, and the shown price becomes the start's own; a run of starts as long as the patience none of which betters the best price found, churn aside, settles the search, and the last seed caps it; when both fall on one start the search is settled. Until later on 2026-10-07 the run counted starts not adopted, so a better start refused for its churn cut the search short; the four scopes' tables showed one such run on the estate's five files, and the owner's suspicion that the search approaches the best picture whatever the churn cost holds once the patience follows the best found ([Turn 18](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-18)). The seeds are a fixed sequence from the one after the last the first paint tried, so the picture after any number of starts is the same on every machine; only the moments they arrive differ. `CardRows` is a card's rows as the renderer measured them once at the chosen widths (the header, CSS grid gap, each visible track’s height, the Internals row, and the resolved endpoint-to-row or fixed-card offsets); `orderedRows` stands them as the renderer's `orderRows` would (a named row per mention, the rest grouped by name in the order the names first stood, Internals last, or as they stand when no order is named) and `pinFor` sums the rows above a pin, rounding half pixels up as the page's measurement does; endpoint resolution is captured from the runtime, including exact names, duplicate normalized names, hidden anchors and file/asset hubs; the cache never guesses a fallback. An uncaptured endpoint is an error rather than a silently omitted wire. The lab's restarts tabulation runs the page's own judge over its tabulated starts (`simulateSearch`). Built for the plan's step 5 after the owner's go ([Turn 17](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-17)), to their stopping rule ([Turn 16](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16)).

Alignment trials share the complete shown/best price but do not consume ordering seeds or their patience. The next-trial helper alternates available kinds, so a settled ordering search cannot hide pending joins. This supports [the owner’s weighted geometry preference](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply). Negative label margins are removed when measuring grid tracks; actual resolved anchor identity and fixed hub offsets survive row reordering.

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

#### `judgeAlignment` {#symbol-judgealignment}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L95)
- Parameters: `state`: [`SearchState`](#symbol-searchstate)

##### `judgeAlignment` — Summary
An alignment trial shares the picture's price and adoption count, but does
not consume an ordering seed or its patience. A settled ordering search
still permits pending alignment trials; each new incumbent supplies its
own finite neighborhood of joins.

#### `nextTrialKind` {#symbol-nexttrialkind}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L101)
- Parameters: `state`: [`SearchState`](#symbol-searchstate)

##### `nextTrialKind` — Summary
Alternate available trial kinds; exhausted seed patience cannot hide pending alignment choices.

#### `RowMeasure` {#symbol-rowmeasure}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L108)

##### `RowMeasure` — Summary
One row of a card as measured once: its identity and the height of its grid track.

#### `ResolvedPin` {#symbol-resolvedpin}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L114)

##### `ResolvedPin` — Summary
A resolved endpoint moves with its named row, or stays at a card offset for a hub or card-level fallback.

#### `endpointKey` {#symbol-endpointkey}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L120)

##### `endpointKey` — Summary
The exact request the runtime resolved; an absent and an empty symbol both ask for its default anchor.

#### `RowChildBox` {#symbol-rowchildbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L123)

##### `RowChildBox` — Summary
A visible grid child's border box and vertical margins, in unscaled coordinates.

#### `rowBounds` {#symbol-rowbounds}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L131)

##### `rowBounds` — Summary
The row's layout extent: negative label margins protrude beyond a track and must not make the track taller.

#### `CardRows` {#symbol-cardrows}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L140)

##### `CardRows` — Summary
A card's rows as measured once, in the order they stood; a pin's place for any order follows from them.

#### `orderedRows` {#symbol-orderedrows}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L158)
- Returns: [`RowMeasure`](#symbol-rowmeasure)[]
- Parameters: `card`: [`CardRows`](#symbol-cardrows)

##### `orderedRows` — Summary
The rows in the order the order step names them, as the renderer stands
them: a named row per mention of its name, then the rows not named, each
name's rows together in the order the names first stood, Internals last;
with no order named, the rows as they stand.

#### `pinFor` {#symbol-pinfor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-search.ts#L187)
- Parameters: `card`: [`CardRows`](#symbol-cardrows)

##### `pinFor` — Summary
Where a pin stands from its card's top when the rows stand in `order`:
the header, the rows above it with the gaps between, and the pin's place
in its resolved row. Hubs and card-level fallbacks retain their measured
card offset; an explicitly unmeasurable endpoint remains null. Resolution
is captured from the runtime, preserving exact names, normalized aliases
and duplicate rows without guessing again here.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

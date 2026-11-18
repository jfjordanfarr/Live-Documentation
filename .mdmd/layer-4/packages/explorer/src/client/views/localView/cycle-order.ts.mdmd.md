# packages/explorer/src/client/views/localView/cycle-order.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/cycle-order.ts
- Generated At: 2026-11-16T05:26:03.529Z

## Authored
### Purpose
Gives the 2D Local Map's ranking the candidate left-to-right orders of a cycle's files, which decide the references the picture must draw backward: the greedy order, the order that returns the fewest references, and the orders a single move reaches between them; the continuing search tries them ([cycle-trials.ts](cycle-trials.ts.mdmd.md)). Holds the Return Cost's default.

### Notes
Written on 2026-11-16 ([Turn 5 of the November 15 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)). The owner had asked on 2026-10-06 for "optimizations to minimize the number of times that a node must defy the left-to-right layout rule", and on November 15, after the 3D button began counting a cycle's returns, suggested that the amber cue could tell us to "tweak the layout preferences to avoid backwards-facing connections more strongly". The root measured that the ranking's greedy order, Eades, Lin and Smyth's, counted files rather than references: in 31 of this repository's 968 single-file pictures it returned more references than the least any order could, 425 against 357, the common case two files using each other where the heavier direction returned.

`comparePrices` is the fewest-returns order's own price: the fewest references read backward (a pair line counting the links it stands for), then the fewest pairs of files with a return between them, then the fewest pairs joined by a reference that stand the other way round from the greedy order (`greedyOrder` unweighted, the ranking's order until 2026-11-16), which counts only what the picture shows and keeps a picture that was already at its minimum exactly as it was. `exactOrder` finds the cheapest order by a search over subsets, exact because every part of the price is a sum over pairs; `fewestReturnsOrder` uses it up to `EXACT_LIMIT`, twelve files, about 2 ms on a worst case in which every file uses every other (the time doubles with each file: 4 ms at thirteen, 9 at fourteen, 43 at sixteen). A larger cycle starts from the greedy order weighted by references and takes the single move of one file that lowers the price most until none does (`improvedOrder`, about 1 ms for twenty-five files used all by all). On every distinct cycle of this repository's pictures, 45 of two to eight files, that path lands on the exact price; this repository's one larger cycle, the twenty-five files around `packages/engine/src/live-docs/core.ts`, went from 30 backward references to 18 in that file's picture and from 37 to 22 in `adapters/index.ts`'s. The measurement is in [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md).

Later on 2026-11-16 a return became one term of a price, first at the ranking, then on the placed picture, and the choice moved to the continuing search ([cycle-trials.ts](cycle-trials.ts.mdmd.md)). `cycleCandidates` gives the orders the search tries: the greedy order first, then each order a single move reaches on the way to `fewestReturnsOrder`, a file taken to its place there, each set of returns once. `DEFAULT_RETURN_COST`, 1500 px of wire, is Tuning's default for Return Cost; it lives here, in a module with no imports, so that the tuning's defaults can read it, and how it was set from real card sizes is in [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CycleWeights` {#symbol-cycleweights}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L19)

##### `CycleWeights` — Summary
A cycle's references by its files' indices: `weight[p][c]` is how many references file c makes to file p.

#### `CyclePrice` {#symbol-cycleprice}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L22)

##### `CyclePrice` — Summary
What an order of a cycle's files costs; {@link comparePrices} says which of two is cheaper.

#### `comparePrices` {#symbol-compareprices}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L43)
- Parameters: `a`: [`CyclePrice`](#symbol-cycleprice); `b`: [`CyclePrice`](#symbol-cycleprice)

##### `comparePrices` — Summary
The cheaper of two orders' prices, as a comparison (negative when `a` is cheaper). First the fewest references read
backward: each is a wire that leaves a card on its right and walks leftward to its destination, against the reading
of the picture, which is what the owner asked the layout to avoid (2026-10-06) and what the cards' feet and the 3D
button count. Among equals, the fewest pairs of files with a return between them: every such pair is a lace and a
foot at both its cards, so the same returns between fewer pairs are fewer marks to read. Among equals, the order
nearest the greedy one ({@link greedyOrder}, unweighted), in which the ranking stood every cycle until 2026-11-16,
counted as the pairs of files joined by a reference that stand the other way round from it: so a picture whose order
was already a minimum does not move at all, and one that must move turns as few of its pairs as it can. Pairs that no
reference joins are not counted, so the price depends only on which references return, which is all the picture
shows of the order.

#### `EXACT_LIMIT` {#symbol-exact_limit}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L52)

##### `EXACT_LIMIT` — Summary
The largest cycle ordered exactly. The search's time doubles with each file: on a worst case, every file of the
cycle using every other by one to nine references, twelve files take about 2 ms and sixteen about 43 ms (measured
2026-11-16 in the devcontainer), while this repository's largest cycles but one have eight files.

#### `DEFAULT_RETURN_COST` {#symbol-default_return_cost}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L61)

##### `DEFAULT_RETURN_COST` — Summary
What a reference read backward through a cycle costs a picture, in pixels of wire, when no tuning says otherwise:
Tuning → 2D Layout → Return Cost's default, a term of the placed picture's price (`cycle-choice`). Set from the
pictures the fewest-returns order changed in this repository (2026-11-16): every picture that reads better has left
the greedy order by 1,475 and none that only scores better leaves it below 2,675; the measurement is in the decisions
log. Kept here, in a module with no imports, so that the tuning's defaults can read it.

#### `fewestReturnsOrder` {#symbol-fewestreturnsorder}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L64)
- Parameters: `weight`: [`CycleWeights`](#symbol-cycleweights)

##### `fewestReturnsOrder` — Summary
The order of a cycle's files that returns the fewest references: exact up to {@link EXACT_LIMIT} files, a local minimum beyond.

#### `cycleCandidates` {#symbol-cyclecandidates}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L76)
- Parameters: `weight`: [`CycleWeights`](#symbol-cycleweights)

##### `cycleCandidates` — Summary
The orders the ranking prices for a cycle, the greedy order first: then, on the way to the fewest-returns order, the
order each single move reaches, a file taken to the place it has there, the leftmost that differs first, ending with
that order. Orders that return the same references draw the same picture, so each set of returns is given once, by
the first order found with it. So a cycle whose greedy order already returns the fewest has one candidate.

#### `greedyOrder` {#symbol-greedyorder}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L103)
- Parameters: `weight`: [`CycleWeights`](#symbol-cycleweights)

##### `greedyOrder` — Summary
Eades, Lin and Smyth's greedy order of a cycle: a file nothing left serves goes to the back, one that uses nothing
left goes to the front, otherwise the one that serves the most more than it uses; what is left is looked at again,
each choice the first of the files in their given order. Unweighted it counts files, the rule the ranking used alone
until 2026-11-16 and the price's last tie-break since; weighted it counts references, the start of a large cycle's
search.

#### `priceOf` {#symbol-priceof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L124)
- Returns: [`CyclePrice`](#symbol-cycleprice)
- Parameters: `weight`: [`CycleWeights`](#symbol-cycleweights)

##### `priceOf` — Summary
The price of an order of a cycle's files, against the greedy order.

#### `exactOrder` {#symbol-exactorder}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L143)
- Parameters: `weight`: [`CycleWeights`](#symbol-cycleweights)

##### `exactOrder` — Summary
The cheapest order by the price, by a search over subsets: the cheapest order of each set of files is the cheapest,
over the file that stands last, of the cheapest order of the rest with that file after it, which adds the references
it offers to the rest, the pairs it returns to and the joined pairs it turns. Every part of the price is such a sum,
so the search is exact. Among orders of the same price it keeps the first found, by the files' given order.

#### `improvedOrder` {#symbol-improvedorder}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cycle-order.ts#L174)
- Parameters: `weight`: [`CycleWeights`](#symbol-cycleweights)

##### `improvedOrder` — Summary
An order improved by the price's cheapest local moves: each round tries every file at every other place, keeps the
move that lowers the price the most, the first found among equals, and stops when none lowers it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

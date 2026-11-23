# What a pin does to an opened directory's cards at Flow

**Historical evidence, 2026-11-23.** Taken by a builder for the root of [the day's record](../../2026-11-23.1.record.md), on the day branch at `e0b057f06`, to explain one red browser case. The root's ruling was not to build any of the alternatives below yet. They are evidence for the trial of matched alternatives already planned with the owner, who said on 2026-11-22 that Flow's reshuffle is "too much surprise".

## The red case and its cause

The case at `tests/e2e/local-map-directories.spec.ts` opened `packages/explorer/src/client/views/localView` at Flow and pressed the pin of `directory-flow.ts`. It expected that no card already on screen would change column. Since `unconnected-symbols.ts` and `unconnected-symbols.test.ts` joined the directory, those two cards change column on the pin.

The browser's readings (one worker, 1800 by 1100, the case's own link and pin):

| | Before the pin | After the pin |
| --- | --- | --- |
| Chosen shape (`data-flow-shape`) | `{"rows":null,"boxRows":{},"looseColumns":{}}` | the same |
| A shape priced (`data-flow-shape-ms`) | 181 ms | absent: none priced |
| Cards | 95 | 97, adding `packages/explorer/src/shared/types.ts` (column 1) and `tests/e2e/local-map-directories.spec.ts` (column 5) |
| `unconnected-symbols.ts` | column 9 | column 4 |
| `unconnected-symbols.test.ts` | column 10 | column 5 |

The cause: the pin brings in the pinned file's references from outside the directory, among them `shared/types.ts`. Flow joins every pair of file cards on screen by a line, so `shared/types.ts` is also joined to each card of the directory that imports it, the two new files among them. The ranking (`rankBranches` in `packages/explorer/src/client/views/localView/branches.ts`) then ranks the directory's own files together with the incoming cards. `unconnected-symbols.ts` used to stand at 9, just left of `branch-renderer.ts`, because its ties on the right outweighed its one tie on the left, to `subgraph-builder.ts` at column 3. The new tie to `shared/types.ts` tips that balance, and the network simplex moves it left to column 4. Its test follows it.

The shape was not repriced, and the order is stable. Running `exploreBranches` with and without `retainFile` on the bundle's graph gives the same two moves with no browser, in the ranked columns and in `flowColumns`.

## How often a pin moves the directory's own cards

[The script](flow-pins.mts.txt) opens each directory alone, pins each of its files whole in turn and compares the ranked columns with the unpinned picture. [Its output](flow-pins.outputs.txt):

| Directory | Pins | Moved today | Real conflicts | Column needed | Loose joined | Within reach |
| --- | --- | --- | --- | --- | --- | --- |
| `packages/explorer/src/client/views/localView` | 94 | 38 | 0 | 3 | 0 | 91 |
| `packages/explorer/src/client` | 25 | 16 | 0 | 10 | 3 | 13 |
| `packages/explorer/src/client/views` | 57 | 26 | 13 | 1 | 0 | 43 |
| `scripts` | 11 | 0 | 0 | 0 | 3 | 8 |
| `scripts/live-docs` | 20 | 14 | 0 | 13 | 6 | 7 |
| `packages/engine/src/live-docs` | 42 | 8 | 8 | 0 | 0 | 34 |
| All | 249 | 102 | 21 | 27 | 12 | 196 |

What the columns count:

- **Moved today:** pins after which at least one of the directory's own ranked cards stands in another column. The ranking has worked this way since Flow began, so "a pin keeps every card in its column" was never a property of the product. On `localView` it held only because of that directory's content.
- **Real conflicts:** pins that bring in a card which uses an own card at column c and is used by an own card at column c or further left. No column holds it while the own cards keep theirs. For example, in `packages/explorer/src/client/views`, pinning `forceGraphData.ts` brings in `packages/explorer/src/client/types.ts`, which must stand right of column 5 and left of column 1.
- **Column needed:** pins with no real conflict that bring in a card whose only place is between two neighbouring own columns. A column must be inserted, and the number of every column to its right shifts.
- **Loose joined:** pins after which a file of the directory that no line joined before is joined only to an incoming card. It leaves the block of unjoined files for the ranked columns.
- **Within reach:** pins with none of the last three.

The windows of incoming cards are read against the directory's own cards only. Links between two incoming cards are not counted.

## The alternatives, with what each costs

- **A. Hold the directory's own columns, and fit incoming cards around them.** Rank the opened directories' own cards on the lines among themselves only, as with no pin. Place each incoming card between its own-card providers and users, inserting a column where the gap is empty. Where nothing can hold it, its lines run backward and are drawn as returns, the way a cycle's return is. Unjoined files stay in their block.
  - Keeps every card for about 196 of 249 pins.
  - Costs: the 27 pins that need a column shift the numbers of the columns to its right. About 21 pins draw backward lines outside any cycle, a new kind of picture that the ordering, routing and drawing would need to learn. "A file stands left of the files that use it" stops being true in Flow.
- **B. Keep today's joint ranking, and say so.** Nothing to build. The own cards keep reshuffling on 102 of 249 pins.
- **C. A, but move own cards only where nothing else works.** Where no column can hold an incoming card, the least set of own cards moves (the joint ranking's answer for them). Reshuffles are limited to about 21 of 249 pins, and "provider left of user" keeps holding. It is more code than A.
- **D. Draw pair lines only among the directory's own files.** Incoming cards join only by the pinned file's own references. This weakens Flow's promise that every pair of cards on screen where one uses the other is joined, and it guarantees nothing: a pinned file's references can still pull its neighbours.

The builder's recommendation is **C**. It keeps the reading Flow rests on (a file left of the files that use it) and limits reshuffles to pins where nothing else could work.

## A note on wrapped shapes

`wrapOwn` in `packages/explorer/src/client/views/localView/directory-flow.ts` already gives incoming cards in a wrapped rank "one column of their own at its left". So when a directory's chosen shape wraps a rank and an incoming card lands in it, every column number to the right of that rank shifts on the pin. `localView`'s chosen shape wraps nothing (`rows: null`), which is part of why the column check held there. A case that reads column numbers cannot tell an inserted column from a moved card.

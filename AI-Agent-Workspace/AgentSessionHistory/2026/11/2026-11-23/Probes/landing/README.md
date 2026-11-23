# The third landing: two reds in the browser's whole suite, and what the new one is

**Historical evidence, 2026-11-23.** Taken by the root of [the day's record](../../2026-11-23.1.record.md) on the main checkout, the day branch at `fce80bb52`, with the three rounds of the day merged: how a view is put away, the 3D map's pick rule, and the copies of the change of perspective. The four stages were run by [the landing's script](../../../2026-11-22/Probes/landing/README.md) as one command with nothing beside it. `main` did not move.

## The four stages

[The stage log](run-3.stages.txt), 03:26 to 04:32 UTC:

| Stage | Result |
| --- | --- |
| History levelled | exit 0 |
| The gate without the browser | exit 0 |
| The bundles | exit 0 |
| The browser's whole suite, through the lane | **exit 1:** first pass 735 passed, 2 failed, 7 skipped by design, in 52.4 minutes; second pass, the three cases that run alone, 3 passed |

[The two failed cases as printed](run-3.failed.txt):

1. `force-graph-discovery.spec.ts:70`, the known red: "the picture did not come to rest within 2700 substeps of its motion; after 2707 substeps, 1373 frames and 27.1 s it was still moving". Its bound has never been raised; it waits on the owner's eye for the Settle Hold or a different rule of rest.
2. `force-graph-drag.spec.ts:41`, with Tuning's Drag at its default, which holds its ground: "the sphere rests near where the hand left it, not where it began", expected more than 325.0 (half the hand's way), received 318.1. **New.** The same case with Drag at Swings passed.

The cases that stopped the second landing of November 22 all passed here: the 3D pick, the press of 3D and the transition's first frame, and the two mended that evening.

## The drag case: what the press took before today, and what it takes now

The case goes to this repository's 3D map with `packages/engine/src/live-docs/graph.ts` pinned, presses at that sphere's place on the screen, carries the pointer 280 px right and 120 px up in forty moves, lets go, and waits for rest. It then asks that the sphere rest more than half the hand's way from where it began, and that the files tied to it had come most of their own way by the time the hand arrived.

A probe made the same drag and printed what the case asserts ([its source](drag-probe.spec.ts.txt), kept as text so that it does not join the suite; [every line it printed](drag-probe.outputs.txt)). It was run on the merged day branch and in the three builders' finished worktrees, whose built bundles hold the day's three changes apart.

| Build | What the press at `graph.ts`'s place takes | How far `graph.ts` had gone when the hand arrived | Where it rests | Share of the hand's way |
| --- | --- | ---: | ---: | ---: |
| Old pick rule, with the put-away mend (`b5d952eb3`), Drag holds | **the shell of `packages/explorer`** | 122 | 106 | 0.866 |
| Old pick rule, same build, Drag swings | the shell of `packages/explorer` | 237 | 204 | 0.862 |
| Old pick rule, with the mend and the first-frame candidate (`0993e6cf0`), holds | not read | 122 | 106 | 0.866 |
| New pick rule, without the put-away mend (`7f44261b5`), holds | not read | 650 | 318 | 0.489 |
| **New pick rule, the merged day branch (`fce80bb52`), holds** | **`graph.ts`** | 650 | 317 to 318 | **0.488 to 0.489**, seven runs |
| New pick rule, the merged day branch, swings | `graph.ts` | 650 | 455 | 0.70, two runs |

What this says:

- **It is not load.** Alone at one worker the case's reading is the same to three figures in seven runs.
- **It is the pick rule, and the rule is doing what it was ruled to do.** With the rule on, the reading is 0.489 with or without the put-away mend; with it off, 0.866 with or without the first-frame candidate.
- **Since it was written on November 22 the case has been dragging the shell of `packages/explorer`.** At `graph.ts`'s place on the screen that shell's skin stands nearer the eye ([the measurement of the pick](../picking/README.md) found the same at the same picture), and until today a skin met first took the press. The hand carried the shell, and `graph.ts`, tied to it, followed 122 units. The case read the follower as the sphere in the hand.
- **Today the hand takes `graph.ts` itself** and carries it 650 units, the same pixels at that sphere's own depth. Let go under the default, it comes back to about half of that way and rests there; under Swings it keeps seven tenths.
- **What the mend of November 22 was built for holds on the real drag.** When the hand arrives, the 51 files tied to `graph.ts` have come, at the median, 1.13 of the way they go in the end under the default and 1.16 under Swings (more than the whole, since they come back a little with the sphere), against the case's bar of 0.6.
- **So one sub-claim of the case is false of the product as built:** that a sphere let go under the default rests in the far half of the hand's way. That claim was never observed of a sphere; its evidence, and [the record of November 22](../../../2026-11-22/Screenshots/drag-live/README.md) that "the dragged sphere rests where the hand left it", was a shell's follower.

## Not done, and why

- **No assertion was changed and the bound was not moved.** Whether a sphere that a person puts somewhere should stay there under the default is the open trial of Tuning's Drag, which waits on the owner's eye; the case's line cannot be made right before that is chosen, only made to pass.
- **Not measured:** the same drag on a file with few ties; the estate; what a real drag of a sphere did before November 22. That the spring back is the tether and the ties, and not the pick, is read from the code (`anchorHere` at the start of a hold in `forceGraphLayout.ts`), not measured apart.
- The readings of November 22 under "drag-live" were taken by an instrument that pressed at the same place, so they are a shell's too; they are not corrected here.

## The fourth and fifth runs, with the Unconnected trial merged: `main` not moved again

**Added the same day, at about 15:57 UTC, by the same root.** `main` had been moved to `f0e7e48af` at the owner's word at 14:12 UTC and pushed by them. These two runs were of the day branch past it, carrying [the trial lever Unconnected](../../Screenshots/unconnected-symbols/README.md).

- **The fourth** ([stage log](run-4.stages.txt)) stopped in two minutes at the gate without the browser, exit 2: the type-check of the tests refused the trial's new spec at three places, a symbol's optional slug used as a string. Mended in the spec and run again.
- **The fifth** ([stage log](run-5.stages.txt), 15:02 to 15:54 UTC on `bdbb9a445`; [the failed cases as printed](run-5.failed.txt)): history, the gate and the bundles passed; the browser's whole suite gave 740 passed, 2 failed, 7 skipped by design, and its three cases that run alone passed.
  1. `force-graph-discovery.spec.ts:70`, the known red.
  2. **`local-map-directories.spec.ts:617`, new:** "with Opened Directory at Flow, a pin in a directory prices no shape and keeps the cards already on screen in their columns" found two cards that changed column, `packages/explorer/src/client/views/localView/unconnected-symbols.ts` and its test, which are the two files the trial added to the directory the case opens. Alone at one worker it failed three times of three with the same two cards. So it is not load, and it is not the lever's doing in the page (the lever is at its default): it is the Flow layout moving two cards of that directory to another column when `directory-flow.ts` is pinned, which the ruling of 2026-11-13 says a pin does not do, shown by a directory that gained two files. **Why those two move is not measured.**
- **`force-graph-drag.spec.ts:41` at the default Drag passed in the fifth run,** where in the third it failed at 0.489 of the hand's way against a half, the same in seven runs. Nothing in the motion changed between the two; the repository's own map gained a few files. That case reads a physics result on a sample that grows and sits on its bound from either side, so neither its red nor its pass says much until the Drag ruling (Swings) is built and the case asserts one behaviour.
- Both new reds of this day are cases that read this repository's own, growing content: one a shell's follower mistaken for a sphere, one a directory that gained files.

# A cycle's returning connection, the row's hover, and the hubs

Historical evidence, November 19, 2026 (UTC). A builder's pictures for the round that answered the owner's picture of [Turn 23 of the day's record](../../2026-11-18.1.record.md#turn-23) ([their picture](../owner-turn-23/README.md)). All are 1440 by 900, the suite's stilled search, nothing remembered. "The owner's state" is the estate sample with the directories `PaymentService` and `PaymentService/Data` opened, Flow, the default; "rows shown" adds a press on the "+N symbols" of `App.config` and `PaymentService.cs`, as the owner had done. Before is `main` at `55cb5477`; after is the branch `returning-connections` at each step.

The cycle is `PaymentService.cs` to `PaymentsContext.cs` to `App.config` and back. Its return, `App.config`'s use of `PaymentService.cs`, is in the graph a link from `App.config`'s Internals to `PaymentService.cs`'s row `PaymentService`; in Flow it is a pair line between the two files' hubs.

## 1. A row's hover

| Picture | What it shows |
| --- | --- |
| [01-before-row-internals-connections.png](01-before-row-internals-connections.png) | The owner's state, rows shown, at the connections look, the pointer on `App.config`'s Internals, which carries the return. Every wire of the picture fades, the return's two curls among them: the owner's report. The hub of `App.config` stands half way down the card, level with the row `Estate.Payments.Paym...`. |
| [02-after-row-internals-connections.png](02-after-row-internals-connections.png) | The same with the first two steps: the return's two laces and its route are kept and drawn, everything else fades. |
| [03-after-row-paymentsdb-reading.png](03-after-row-paymentsdb-reading.png) | At the reading look, the pointer on `App.config`'s `PaymentsDb`, which `PaymentsContext.cs` uses: that line is kept, and the row at its far end (`PaymentsContext.cs`'s Internals, not shown on its card) with it. |

## 2. What the cue counts, drawn in its colour; a lace or a foot keeps its whole connection

| Picture | What it shows |
| --- | --- |
| [04-before-reading-rest.png](04-before-reading-rest.png) | The owner's state as it arrives: a green curl at `App.config`'s left edge, a blue one at `PaymentService.cs`'s right, the 3D button amber. |
| [05-after-reading-rest.png](05-after-reading-rest.png) | The same with the second step: both curls amber, the 3D button's colour; every other wire in the roles' blue and green. |
| [06-after-reading-lace.png](06-after-reading-lace.png) | The pointer on `App.config`'s lace: both laces and the route kept, both cards standing, the other cards and every other wire faded. The route is the straight amber line from one card's edge to the other's, across both cards. |
| [07-after-reading-foot.png](07-after-reading-foot.png) | The pointer on `App.config`'s foot, "1 connection returns in a cycle": the same. |
| [08-after-connections-lace.png](08-after-connections-lace.png) and [09-after-overview-lace.png](09-after-overview-lace.png) | A lace pointed at, at the connections and overview looks. |
| [10-before-branch-renderer.png](10-before-branch-renderer.png) and [11-after-branch-renderer.png](11-after-branch-renderer.png) | This repository's `branch-renderer.ts` opened alone: six returning laces at its right edge, blue before and amber after; the green curls at its left edge are the file's own references, which are no returns and keep their colours. |

## 3. The hubs at the file's name

| Picture | What it shows |
| --- | --- |
| [12-after-hubs-reading.png](12-after-hubs-reading.png) | The owner's state as it arrives with the third step: each line ends level with its file's name, the cards standing by their names. |
| [13-after-hubs-connections-row.png](13-after-hubs-connections-row.png) | The owner's picture again, rows shown, the pointer on `App.config`'s Internals: the curls stand at the names, clear of every row. The route, still a straight line between the two hubs, now runs through both names. |
| [14-after-hubs-overview.png](14-after-hubs-overview.png) | The overview look: the hubs at the held names, larger with the look. |
| [15-after-hubs-branch-renderer.png](15-after-hubs-branch-renderer.png) | `branch-renderer.ts` alone with the third step, unchanged where no hub ends a line. |

## What was judged

- The row's hover keeps exactly what carries the row's links (the browser case reads them from the graph's own links).
- The amber laces read as one thing with the button. In these pictures no directory mark in orange stands near them (a closed directory's cells are drawn by file kind, and none here is a directory cell), so no second hue was drawn for comparison.
- The route as drawn is a straight line between the two hubs and crosses both cards: before the third step it crossed the rows level with the hubs, after it crosses both file names. It reads as one connection with the laces, but as a strike through the names. Left for the root and the owner.

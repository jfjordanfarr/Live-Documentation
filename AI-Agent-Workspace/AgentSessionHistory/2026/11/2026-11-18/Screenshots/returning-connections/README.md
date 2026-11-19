# A cycle's returning connection, the row's hover, and the hubs

Historical evidence, November 19, 2026 (UTC). A builder's pictures for the round that answered the owner's picture of [Turn 23 of the day's record](../../2026-11-18.1.record.md#turn-23) ([their picture](../owner-turn-23/README.md)). All but 18 and 19 are 1440 by 900, the suite's stilled search, nothing remembered. "The owner's state" is the estate sample with the directories `PaymentService` and `PaymentService/Data` opened, Flow, the default; "rows shown" adds a press on the "+N symbols" of `App.config` and `PaymentService.cs`, as the owner had done. Before is `main` at `55cb5477`. Every "after" picture (02, 03, 05 to 09, 11 to 25) was retaken on November 19 on the round's final build, the branch `returning-connections-finish` merged with `main`, so all of them show the hubs at the names and the route over the top; 02 and 13 are now the same state and picture, as are 05 and 12, and 11 and 15. The tuning panel's badge reads 1 because the browser suite saves one setting of its own (the search's starts at nought).

The cycle is `PaymentService.cs` to `PaymentsContext.cs` to `App.config` and back. Its return, `App.config`'s use of `PaymentService.cs`, is in the graph a link from `App.config`'s Internals to `PaymentService.cs`'s row `PaymentService`; in Flow it is a pair line between the two files' hubs.

## 1. A row's hover

| Picture | What it shows |
| --- | --- |
| [01-before-row-internals-connections.png](01-before-row-internals-connections.png) | The owner's state, rows shown, at the connections look, the pointer on `App.config`'s Internals, which carries the return. Every wire of the picture fades, the return's two curls among them: the owner's report. The hub of `App.config` stands half way down the card, level with the row `Estate.Payments.Paym...`. |
| [02-after-row-internals-connections.png](02-after-row-internals-connections.png) | The same after the round: the return's two laces and its route are kept and drawn, everything else fades. |
| [03-after-row-paymentsdb-reading.png](03-after-row-paymentsdb-reading.png) | At the reading look, the pointer on `App.config`'s `PaymentsDb`, which `PaymentsContext.cs` uses: that line is kept, and the row at its far end (`PaymentsContext.cs`'s Internals, not shown on its card) with it. |

## 2. What the cue counts, drawn in its colour; a lace or a foot keeps its whole connection

| Picture | What it shows |
| --- | --- |
| [04-before-reading-rest.png](04-before-reading-rest.png) | The owner's state as it arrives: a green curl at `App.config`'s left edge, a blue one at `PaymentService.cs`'s right, the 3D button amber. |
| [05-after-reading-rest.png](05-after-reading-rest.png) | The same after the round: both curls amber, the 3D button's colour, at the files' names; every other wire in the roles' blue and green. |
| [06-after-reading-lace.png](06-after-reading-lace.png) | The pointer on `App.config`'s lace: both laces and the route kept, both cards standing, the other cards and every other wire faded. The route leaves `PaymentService.cs` to the right, runs back above both cards and comes down into `App.config` from the left (section 4). |
| [07-after-reading-foot.png](07-after-reading-foot.png) | The pointer on `App.config`'s foot, "1 connection returns in a cycle": the same. |
| [08-after-connections-lace.png](08-after-connections-lace.png) and [09-after-overview-lace.png](09-after-overview-lace.png) | A lace pointed at, at the connections and overview looks. |
| [10-before-branch-renderer.png](10-before-branch-renderer.png) and [11-after-branch-renderer.png](11-after-branch-renderer.png) | This repository's `branch-renderer.ts` opened alone: six returning laces at its right edge, blue before and amber after; the green curls at its left edge are the file's own references, which are no returns and keep their colours. |

## 3. The hubs at the file's name

| Picture | What it shows |
| --- | --- |
| [12-after-hubs-reading.png](12-after-hubs-reading.png) | The owner's state as it arrives with the third step: each line ends level with its file's name, the cards standing by their names. |
| [13-after-hubs-connections-row.png](13-after-hubs-connections-row.png) | The owner's picture again, rows shown, the pointer on `App.config`'s Internals: the curls stand at the names, clear of every row, and the route runs back above both cards. (Before the route was redrawn this picture showed it as a straight line between the hubs, through both names.) |
| [14-after-hubs-overview.png](14-after-hubs-overview.png) | The overview look: the hubs at the held names, larger with the look. |
| [15-after-hubs-branch-renderer.png](15-after-hubs-branch-renderer.png) | `branch-renderer.ts` alone with the third step, unchanged where no hub ends a line. |

The hubs stand at the middle of the header's first line: for a name of one line, the line it shares with the controls' room, which stands a few pixels above the text's own middle; for a longer name, its first line.

## The two meanings of a hub, as they look today (for the choice the owner is to be offered)

| Picture | What it shows |
| --- | --- |
| [16-whole-file-reference-reading.png](16-whole-file-reference-reading.png) | A whole-file reference: `Portal/Pages/Default.aspx` (the subject) uses `Default.aspx.cs` and `portal.js` as files, no symbol named at their end. The line from `Default.aspx.cs` leaves its hub, at its name, and arrives at `Default.aspx`'s Internals dot: the offering end of a whole-file reference is the hub, the using end the Internals row. The use of `portal.js` returns in a cycle, so it is an amber lace at `Default.aspx`'s Internals (and at `portal.js`'s hub, out of the frame). |
| [17-whole-file-reference-connections.png](17-whole-file-reference-connections.png) | The same at the connections look: `Default.aspx.cs`'s hub at its held name, as large as the look's dots; `portal.js`'s amber lace at its hub, at its name. |
| [12-after-hubs-reading.png](12-after-hubs-reading.png) | A gathered line's hub: every line of the opened directories is a pair line standing for the links between two files, and ends at both files' hubs, whatever rows its links leave or reach. Today the two meanings, "the whole file" and "some of this file", are drawn the same. |

## What was judged

- The row's hover keeps exactly what carries the row's links (the browser case reads them from the graph's own links).
- The amber laces read as one thing with the button. In these pictures no directory mark in orange stands near them (a closed directory's cells are drawn by file kind, and none here is a directory cell), so no second hue was drawn for comparison.
- The route was a straight line between the two hubs across both cards: before the hubs moved it crossed the rows level with them, after it struck both file names through. It is now drawn over the top (section 4).

## 4. The lit route: three ways to draw it

The same two states for each: the reading look with the pointer on `App.config`'s lace, and the owner's state with rows shown at the connections look with the pointer on `App.config`'s Internals. A and B were drawn into the built page by the picture script (A: the old pin-to-pin line, straight here since both hubs are level, masked by every card's box; B: the route hidden); C is the built product.

| Pictures | Alternative | What I see |
| --- | --- | --- |
| [20](20-route-a-beneath-reading-lace.png), [21](21-route-a-beneath-connections-row.png) | A: the old line beneath the cards, seen only between them | The names are clear, but what remains is one amber segment from `App.config`'s right hub to `PaymentService.cs`'s left hub, past `PaymentsContext.cs`: the exact shape of a forward wire saying `App.config` offers to `PaymentService.cs`, which is the opposite of the truth. The laces are disconnected from it. It reads as a wire, but the wrong one. |
| [22](22-route-b-none-reading-lace.png), [23](23-route-b-none-connections-row.png) | B: no route; both laces and both cards lit, the rest faded | Honest and quiet; it cannot be taken for a forward wire. At the reading look the two lit cards say "these two"; at the connections look the two laces are small hooks at opposite ends of the frame and nothing draws the eye from one to the other: it reads as two lit things, not as one connection. |
| [24](24-route-c-over-reading-lace.png), [25](25-route-c-over-connections-row.png) | C (built): the route leaves the offering card's pin to the right, runs back above every card between the two pins, and comes down into the using card's pin from the left | One closed amber loop around both cards, continuous with both laces: it reads as one connection, and as a way back. It crosses no card and no name. It runs right to left above the picture, where no forward wire runs, so it cannot be taken for one. Cost: one pure function (`returnRoute` in `returning-connections.ts`) and the boxes the router already measures. |

C is built; A and B stay as pictures for the root and the owner. The route stands 12 px above the highest box that a run at its height would meet between its turns, so a tall card between the two pins lifts it, and turns 12 px outside each pin.

## The Flow price and the hub's place

The price that chooses an opened directory's shape under Flow measures a nominal card, not the page's, and still ends every line half way down it (`nominalMeasurer` in `directory-flow.ts`), though the page now stands hubs at the names. `scripts/live-docs` opened, at 1800 by 1100, Flow, as the browser case `local-map-directories.spec.ts` opens it:

| Pictures | What they show |
| --- | --- |
| [18-price-nominal-hub-half-way.png](18-price-nominal-hub-half-way.png), [its Width Cost at nought](18-price-nominal-hub-half-way-width-cost-0.png) | The price as it is (the default): four rows; with Width Cost at nought the directory stands wider, in two rows. |
| [19-price-nominal-hub-at-name.png](19-price-nominal-hub-at-name.png), [its Width Cost at nought](19-price-nominal-hub-at-name-width-cost-0.png) | A trial build with the nominal hub at the name (23 px down, where a one-line name beside the controls stands it): the default is the same four rows, but Width Cost at nought no longer widens it; it stays in four rows. `local-map-directories.spec.ts:553` fails on that build for this reason ("Width Cost turns the choice"). |

The default is unchanged; which the owner prefers is open.


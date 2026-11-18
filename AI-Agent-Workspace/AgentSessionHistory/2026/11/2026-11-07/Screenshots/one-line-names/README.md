# One-line file names in the 2D card ladder

_Status: implementation evidence for the root's review and the owner's eye, not a verdict. A builder made a file's held name one line at every band and step, from the root's brief after the owner's words in [the November 6 record, Turn 8](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-8) ("the choice to allow up to 2 lines of text on the card titles at certain breakpoints has caused rather silly clunky layouts at certain zoom distances"), on commit `476ea2c8`, uncommitted in its worktree. One line is the root's decision, reversible by the owner. The pictures were taken by [`held-names.cjs`](../../../Probes/2026-11-07/one-line-names/held-names.cjs) on the builder's bundle (served on port 8911, "after") and on the bundle of `476ea2c8` itself (port 8914, "before"), in a private headless Chromium at 1440 × 960 with a fresh profile and the background search off; the camera moves by the Zoom Out button, one step a press, from the arrival's reading scale. The Internals row, which the owner also named ("internals is still always small"), is not part of this round._

## What changed

From the middle band out a card draws its file's name held at its reading size in the room its header leaves beside the node's held buttons (all three at the middle band, More alone beyond). Until now the card reading chose up to as many lines as the room held, by four rules; at the far band the held More stands about one and a half lines of the name tall in a header room of two lines, so no line below it was free and the rules broke the name beside it: "branch- / renderer.ts" and "symbol- / highlight.ts" in the owner's picture ([`symbolAnchors-far-step-two-line-titles-internals-tiny.png`](../../../ChatHistory/2026/11/2026-11-06.1.images/symbolAnchors-far-step-two-line-titles-internals-tiny.png)).

Now the name is drawn on one line at every band and step, never two. It stands on the first line of its room, beside the buttons, when it fits there whole; otherwise on the first line below the buttons, when the room has one and it fits there whole; otherwise on the wider of those two lines (the line below where the room has one, else the line beside the buttons), cut with an ellipsis at its end. The header's box, the name's held size, the bands, the steps and the buttons are unchanged; the stylesheet still draws one attribute a band and step, since a cut differs by step. The rule is `chooseHeldLines` in `held-lines.ts`; the box audit (`tests/e2e/card-ladder-boxes.spec.ts`) now holds, at every press of its three subjects, that every name is one line (any lines before it empty, beside the buttons), whole or cut at its end with an ellipsis, a name cut below the buttons too wide for that full line, and no line past its room or under the buttons. On the bundle of `476ea2c8` that audit fails on the still picture at the third press out, where `local-map-simplicity.spec.ts` stood on three lines, "local-map- / simplicity. / spec.ts".

## The counts

Every card's held name at every press, classified by the line the attribute for the band and step shown holds: whole on the first line (beside the buttons), whole on a line below them, on two lines or more (before only; whole or with its last line cut), or cut on one line with an ellipsis. "Cut" after counts the names cut beside the buttons in brackets. The cut names are listed as drawn, once each; the full readings, with every card, are the JSON files beside the pictures.

### `symbolAnchors.ts`, the owner's subject, pinned alone

The address the search gives when `symbolAnchors.ts` is typed and chosen (a whole-file pin, the file the subject), loaded afresh. The walk ends at press 10, where the whole map stands in the frame.

| Press | Band / step | Before: whole beside | whole below | on two lines or more | cut | After: whole beside | whole below | cut | After, the cut names as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | reading / 0 | none held | | | | none held | | | |
| 1 | reading / 1 | none held | | | | none held | | | |
| 2 | middle / 2 | 12 | 0 | 0 | 0 | 12 | 0 | 0 (0 beside) |  |
| 3 | middle / 3 | 10 | 2 | 0 | 0 | 10 | 2 | 0 (0 beside) |  |
| 4 | middle / 4 | 6 | 2 | 2 | 2 | 6 | 2 | 4 (4 beside) | `branch-re…`, `connecti…`, `symbol-h…`, `control…` |
| 5 | far / 5 | 10 | 0 | 2 | 0 | 10 | 0 | 2 (2 beside) | `branch-rend…`, `symbol-highl…` |
| 6 | far / 6 | 5 | 0 | 5 | 2 | 5 | 0 | 7 (7 beside) | `local-map-corset.s…`, `branch-re…`, `connectio…`, `symbol-hi…`, `controll…`, `symbolAnchor…`, `symbolAnchors.…` |
| 7 | overview / 7 | 4 | 1 | 7 | 0 | 4 | 1 | 7 (2 beside) | `local-map-cors…`, `branch-re…`, `connectio…`, `symbol-hi…`, `controlle…`, `symbolAncho…`, `symbolAnch…` |
| 8 | overview / 8 | 3 | 1 | 8 | 0 | 3 | 1 | 8 (0 beside) | `local-map-cor…`, `branch-r…`, `connect…`, `symbol-…`, `control…`, `symbolAnc…`, `symbolAnch…`, `measurer…` |
| 9 | overview / 9 | 0 | 3 | 6 | 3 | 0 | 3 | 9 (1 beside) | `still-pictur…`, `local-map-c…`, `branc…`, `conne…`, `symb…`, `contr…`, `symbolA…`, `symbol…`, `measur…` |
| 10 | overview / 10 | 0 | 0 | 8 | 4 | 0 | 0 | 12 (4 beside) | `still-pi…`, `local-m…`, `branche…`, `bran…`, `co…`, `sym…`, `cont…`, `symbol…`, `pin-stat…`, `symbo…`, `card-mo…`, `meas…` |

### The box audit's three subjects at the far and overview bands' first and last steps

`tests/e2e/still-picture.ts` alone (46 files):

| Press | Band / step | Before: whole beside | whole below | on two lines or more | cut | After: whole beside | whole below | cut | After, the cut names as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | far / 5 | 15 | 0 | 31 | 0 | 15 | 0 | 31 (31 beside) | `still-picture…`, `local-map-corset.…`, `force-graph-disco…`, `force-graph-revea…`, `force-graph-focus…`, `explorer-navigatio…`, `perspective-zoom…`, `force-graph-wrap…`, `force-graph-shell…`, `local-map-row-mo…`, `card-ladder-boxes…`, `local-map-overvie…`, `local-map-hidden.…`, `force-graph-direct…`, `force-graph-explo…`, `local-map-motion.…`, `local-map-search.…`, `local-map-keyboa…`, `local-map-learnin…`, `local-map-branch…`, `local-map-framing…`, `local-map-path.sp…`, `explorer-history.s…`, `card-reading.spec…`, `local-map-packin…`, `local-map-directo…`, `local-map-pins.sp…`, `world-map-design…`, `world-map-estate.…`, `layout-lab.s…`, `local-map-s…` |
| 6 | far / 6 | 9 | 0 | 37 | 0 | 9 | 0 | 37 (37 beside) | `still-pict…`, `local-map-cor…`, `force-graph-di…`, `force-graph-re…`, `force-graph-fo…`, `explorer-navi…`, `perspective-z…`, `force-graph-w…`, `force-graph-s…`, `card-slots.spe…`, `local-map-row…`, `card-ladder-b…`, `card-ladder.sp…`, `local-map-ove…`, `local-map-hid…`, `force-graph-e…`, `local-map-mot…`, `local-map-sea…`, `local-map-key…`, `local-map-lear…`, `local-map-bra…`, `inspection.sp…`, `local-map-fra…`, `pin-clicks.spe…`, `local-map-pat…`, `explorer-histo…`, `still-picture.sp…`, `card-reading.…`, `local-map-pac…`, `local-map-dire…`, `search-bar.sp…`, `local-map-pin…`, `world-map-de…`, `world-map-est…`, `layout-la…`, `local-ma…` |
| 7 | overview / 7 | 6 | 2 | 38 | 0 | 6 | 2 | 38 (36 beside) | `still-picture-geometr…`, `still-pictu…`, `local-map-…`, `force-grap…`, `explorer-n…`, `perspectiv…`, `card-slots.…`, `local-map-r…`, `card-ladde…`, `local-map-l…`, `inspection.…`, `local-map-f…`, `pin-clicks.…`, `explorer-hi…`, `still-picture…`, `card-readi…`, `search-bar.…`, `world-map-…`, `layout…`, `local-…` |
| 10 | overview / 10 | 2 | 0 | 7 | 37 | 2 | 0 | 44 (37 beside) | `captur…`, `verify…`, `staticExpl…`, `local-stor…`, `symbolA…`, `still-picture…`, `design-aud…`, `still-…`, `local-…`, `force…`, `explo…`, `pers…`, `card-…`, `inspe…`, `pin-cl…`, `still-p…`, `searc…`, `world…`, `lay…`, `loc…` |

`rosetta-manifest.json` pinned whole:

| Press | Band / step | Before: whole beside | whole below | on two lines or more | cut | After: whole beside | whole below | cut | After, the cut names as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | far / 5 | 9 | 0 | 9 | 0 | 9 | 0 | 9 (9 beside) | `compiler-edges.…`, `rosetta-manife…` |
| 6 | far / 6 | 9 | 0 | 9 | 0 | 9 | 0 | 9 (9 beside) | `compiler-ed…`, `rosetta-ma…` |
| 7 | overview / 7 | 9 | 0 | 9 | 0 | 9 | 0 | 9 (0 beside) | `compiler-ed…`, `rosetta-ma…` |
| 10 | overview / 10 | 1 | 1 | 1 | 15 | 1 | 1 | 16 (15 beside) | `mai…`, `com…`, `Mai…`, `rosett…` |

The estate's `PaymentService.cs` with its `PaymentService` row pinned:

| Press | Band / step | Before: whole beside | whole below | on two lines or more | cut | After: whole beside | whole below | cut | After, the cut names as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | far / 5 | 5 | 0 | 6 | 0 | 5 | 0 | 6 (6 beside) | `PaymentQuery.…`, `PaymentResult…`, `PaymentReque…`, `IPaymentServi…`, `compiler-edges.…`, `hand-verified-ed…` |
| 6 | far / 6 | 2 | 0 | 9 | 0 | 2 | 0 | 9 (9 beside) | `PaymentQu…`, `PaymentRe…`, `IPaymentSe…`, `compiler-ed…`, `hand-verifie…`, `PostPaymentR…`, `PaymentsCont…`, `PaymentServ…` |
| 7 | overview / 7 | 2 | 0 | 8 | 1 | 2 | 0 | 9 (1 beside) | `PaymentQu…`, `PaymentRe…`, `IPaymentSe…`, `compiler-ed…`, `hand-verifie…`, `PostPayment…`, `PaymentsCont…`, `PaymentS…` |
| 10 | overview / 10 | 0 | 0 | 8 | 3 | 0 | 0 | 11 (3 beside) | `Paym…`, `IPay…`, `com…`, `han…`, `Payme…`, `PostPa…`, `App.co…`, `Pay…` |

What the counts say: where a name stood whole on one line before, it still does, at the same place (the "whole beside" and "whole below" columns are equal at every press); every name the four rules drew on two lines is now one line, cut. At the far band the room holds no free line below the held More, so those names are cut beside it, at the narrowest width a name has: on the still picture 31 of 46 names at the fifth press and 37 at the sixth, mostly test specs cut to their first one or two words ("force-graph-disco…", "local-map-overvie…"). At the overview band the cut stands on the full line below the More, but the cards are narrow against a name held at 15 px, so names cut to a few characters ("co…" for `connections.ts`, "Paym…" for three of the payment service's files alike, `PaymentQuery.cs`, `PaymentResult.cs` and `PaymentRequest.cs`). A cut at the end keeps a name's start, which is where names in one directory most often agree. Before, the same names were drawn whole on two lines at the far band and the first overview steps, and from the ninth press on many were cut there too.

## The alternative, pictured and not built

The same subject with the held More at the far and overview bands no taller than one line of the held name, so that a name can stand beside it on one line and the lines below it are free. Done by an injected style on the builder's bundle, [`more-one-line.css`](../../../Probes/2026-11-07/one-line-names/more-one-line.css):

```css
:is([data-lod="far"], [data-lod="overview"]) .local-slot-card .local-card-actions {
    transform: scale(min(var(--node-control-scale), calc(var(--title-line) * var(--title-scale) / 20)));
}
```

(More is a 20 px button; the name's line is 15 px at its held scale.) Since the product chooses the name's line at render for the More it draws, the probe (`RECHOOSE=1`) chooses each name's line again in the page by the same one-line rule, in the room the smaller More leaves; nothing of it is in the product. Its counts for `symbolAnchors.ts`:

| Press | Band / step | As built: whole beside | whole below | cut | More one line: whole beside | whole below | cut | More one line, the cut names as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | far / 5 | 10 | 0 | 2 (2 beside) | 10 | 0 | 2 (0 beside) | `branch-renderer…`, `symbol-highligh…` |
| 6 | far / 6 | 5 | 0 | 7 (7 beside) | 5 | 3 | 4 (0 beside) | `local-map-corset.spe…`, `branch-rend…`, `symbol-highl…`, `symbolAnchors.tes…` |
| 7 | overview / 7 | 4 | 1 | 7 (2 beside) | 4 | 1 | 7 (0 beside) | `local-map-corset.…`, `branch-re…`, `connectio…`, `symbol-hi…`, `controlle…`, `symbolAncho…`, `symbolAnchors…` |
| 8 | overview / 8 | 3 | 1 | 8 (0 beside) | 3 | 1 | 8 (0 beside) | `local-map-cor…`, `branch-r…`, `connect…`, `symbol-…`, `control…`, `symbolAnc…`, `symbolAnch…`, `measurer…` |
| 9 | overview / 9 | 0 | 3 | 9 (1 beside) | 0 | 3 | 9 (1 beside) | `still-pictur…`, `local-map-c…`, `branc…`, `conne…`, `symb…`, `contr…`, `symbolA…`, `symbol…`, `measur…` |
| 10 | overview / 10 | 0 | 0 | 12 (4 beside) | 0 | 0 | 12 (4 beside) | `still-pi…`, `local-m…`, `branche…`, `bran…`, `co…`, `sym…`, `cont…`, `symbol…`, `pin-stat…`, `symbo…`, `card-mo…`, `meas…` |

With More one line tall (the probe measured it at one line of the name or less on every card, and every room then had its lines below the button free) the far band's names move below it, whole where they fit the full line (three at the sixth press) and cut there with more of the name kept where they do not ("branch-renderer…" against "branch-rend…" beside the button); at the overview band the counts are the same as built, two names at the seventh press moving from beside the button to below it, since there the room mostly had a line below the button already. The far band's header room of two lines is what this alternative frees; it gains nothing where a card is narrow against the name.

## Pictures

The pictures without a prefix are the builder's bundle. For `symbolAnchors.ts` the bundle of `476ea2c8` is kept only from the sixth press: at presses 3 to 5 its pictures are byte for byte the same as these (the names that change stand outside the arrival's frame, which is why the panned pictures were taken), and at presses 0 to 2 no held name differs. The JSON files are each walk's full reading, every card's name and lines at every press.

| Picture | What it shows |
| --- | --- |
| [before-payment-service-pinned-05-far-5.png](before-payment-service-pinned-05-far-5.png) | the payment service with its row pinned, press 5, far / 5: before, the bundle of `476ea2c8`. |
| [before-payment-service-pinned-06-far-6.png](before-payment-service-pinned-06-far-6.png) | the payment service with its row pinned, press 6, far / 6: before, the bundle of `476ea2c8`. |
| [before-payment-service-pinned-07-overview-7.png](before-payment-service-pinned-07-overview-7.png) | the payment service with its row pinned, press 7, overview / 7: before, the bundle of `476ea2c8`. |
| [before-payment-service-pinned-10-overview-10.png](before-payment-service-pinned-10-overview-10.png) | the payment service with its row pinned, press 10, overview / 10: before, the bundle of `476ea2c8`. |
| [before-rosetta-pinned-whole-05-far-5.png](before-rosetta-pinned-whole-05-far-5.png) | `rosetta-manifest.json` pinned whole, press 5, far / 5: before, the bundle of `476ea2c8`. |
| [before-rosetta-pinned-whole-06-far-6.png](before-rosetta-pinned-whole-06-far-6.png) | `rosetta-manifest.json` pinned whole, press 6, far / 6: before, the bundle of `476ea2c8`. |
| [before-rosetta-pinned-whole-07-overview-7.png](before-rosetta-pinned-whole-07-overview-7.png) | `rosetta-manifest.json` pinned whole, press 7, overview / 7: before, the bundle of `476ea2c8`. |
| [before-rosetta-pinned-whole-10-overview-10.png](before-rosetta-pinned-whole-10-overview-10.png) | `rosetta-manifest.json` pinned whole, press 10, overview / 10: before, the bundle of `476ea2c8`. |
| [before-still-picture-05-far-5.png](before-still-picture-05-far-5.png) | `still-picture.ts`, press 5, far / 5: before, the bundle of `476ea2c8`. |
| [before-still-picture-06-far-6.png](before-still-picture-06-far-6.png) | `still-picture.ts`, press 6, far / 6: before, the bundle of `476ea2c8`. |
| [before-still-picture-07-overview-7.png](before-still-picture-07-overview-7.png) | `still-picture.ts`, press 7, overview / 7: before, the bundle of `476ea2c8`. |
| [before-still-picture-10-overview-10.png](before-still-picture-10-overview-10.png) | `still-picture.ts`, press 10, overview / 10: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-05-far-5-panned.png](before-symbolAnchors-05-far-5-panned.png) | `symbolAnchors.ts` pinned alone, press 5, far / 5, the map dragged 700 px left to the `localView` band of the owner's picture: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-06-far-6-panned.png](before-symbolAnchors-06-far-6-panned.png) | `symbolAnchors.ts` pinned alone, press 6, far / 6, the map dragged 700 px left to the `localView` band of the owner's picture: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-06-far-6.png](before-symbolAnchors-06-far-6.png) | `symbolAnchors.ts` pinned alone, press 6, far / 6: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-07-overview-7-panned.png](before-symbolAnchors-07-overview-7-panned.png) | `symbolAnchors.ts` pinned alone, press 7, overview / 7, the map dragged 700 px left to the `localView` band of the owner's picture: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-07-overview-7.png](before-symbolAnchors-07-overview-7.png) | `symbolAnchors.ts` pinned alone, press 7, overview / 7: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-08-overview-8.png](before-symbolAnchors-08-overview-8.png) | `symbolAnchors.ts` pinned alone, press 8, overview / 8: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-09-overview-9.png](before-symbolAnchors-09-overview-9.png) | `symbolAnchors.ts` pinned alone, press 9, overview / 9: before, the bundle of `476ea2c8`. |
| [before-symbolAnchors-10-overview-10.png](before-symbolAnchors-10-overview-10.png) | `symbolAnchors.ts` pinned alone, press 10, overview / 10: before, the bundle of `476ea2c8`. |
| [payment-service-pinned-05-far-5.png](payment-service-pinned-05-far-5.png) | the payment service with its row pinned, press 5, far / 5: after. |
| [payment-service-pinned-06-far-6.png](payment-service-pinned-06-far-6.png) | the payment service with its row pinned, press 6, far / 6: after. |
| [payment-service-pinned-07-overview-7.png](payment-service-pinned-07-overview-7.png) | the payment service with its row pinned, press 7, overview / 7: after. |
| [payment-service-pinned-10-overview-10.png](payment-service-pinned-10-overview-10.png) | the payment service with its row pinned, press 10, overview / 10: after. |
| [rosetta-pinned-whole-05-far-5.png](rosetta-pinned-whole-05-far-5.png) | `rosetta-manifest.json` pinned whole, press 5, far / 5: after. |
| [rosetta-pinned-whole-06-far-6.png](rosetta-pinned-whole-06-far-6.png) | `rosetta-manifest.json` pinned whole, press 6, far / 6: after. |
| [rosetta-pinned-whole-07-overview-7.png](rosetta-pinned-whole-07-overview-7.png) | `rosetta-manifest.json` pinned whole, press 7, overview / 7: after. |
| [rosetta-pinned-whole-10-overview-10.png](rosetta-pinned-whole-10-overview-10.png) | `rosetta-manifest.json` pinned whole, press 10, overview / 10: after. |
| [still-picture-05-far-5.png](still-picture-05-far-5.png) | `still-picture.ts`, press 5, far / 5: after. |
| [still-picture-06-far-6.png](still-picture-06-far-6.png) | `still-picture.ts`, press 6, far / 6: after. |
| [still-picture-07-overview-7.png](still-picture-07-overview-7.png) | `still-picture.ts`, press 7, overview / 7: after. |
| [still-picture-10-overview-10.png](still-picture-10-overview-10.png) | `still-picture.ts`, press 10, overview / 10: after. |
| [symbolAnchors-00-reading-0.png](symbolAnchors-00-reading-0.png) | `symbolAnchors.ts` pinned alone, press 0, reading / 0: after. |
| [symbolAnchors-01-reading-1.png](symbolAnchors-01-reading-1.png) | `symbolAnchors.ts` pinned alone, press 1, reading / 1: after. |
| [symbolAnchors-02-middle-2.png](symbolAnchors-02-middle-2.png) | `symbolAnchors.ts` pinned alone, press 2, middle / 2: after. |
| [symbolAnchors-03-middle-3.png](symbolAnchors-03-middle-3.png) | `symbolAnchors.ts` pinned alone, press 3, middle / 3: after. |
| [symbolAnchors-04-middle-4.png](symbolAnchors-04-middle-4.png) | `symbolAnchors.ts` pinned alone, press 4, middle / 4: after. |
| [symbolAnchors-05-far-5-panned.png](symbolAnchors-05-far-5-panned.png) | `symbolAnchors.ts` pinned alone, press 5, far / 5, the map dragged 700 px left to the `localView` band of the owner's picture: after. |
| [symbolAnchors-05-far-5.png](symbolAnchors-05-far-5.png) | `symbolAnchors.ts` pinned alone, press 5, far / 5: after. |
| [symbolAnchors-06-far-6-panned.png](symbolAnchors-06-far-6-panned.png) | `symbolAnchors.ts` pinned alone, press 6, far / 6, the map dragged 700 px left to the `localView` band of the owner's picture: after. |
| [symbolAnchors-06-far-6.png](symbolAnchors-06-far-6.png) | `symbolAnchors.ts` pinned alone, press 6, far / 6: after. |
| [symbolAnchors-07-overview-7-panned.png](symbolAnchors-07-overview-7-panned.png) | `symbolAnchors.ts` pinned alone, press 7, overview / 7, the map dragged 700 px left to the `localView` band of the owner's picture: after. |
| [symbolAnchors-07-overview-7.png](symbolAnchors-07-overview-7.png) | `symbolAnchors.ts` pinned alone, press 7, overview / 7: after. |
| [symbolAnchors-08-overview-8.png](symbolAnchors-08-overview-8.png) | `symbolAnchors.ts` pinned alone, press 8, overview / 8: after. |
| [symbolAnchors-09-overview-9.png](symbolAnchors-09-overview-9.png) | `symbolAnchors.ts` pinned alone, press 9, overview / 9: after. |
| [symbolAnchors-10-overview-10.png](symbolAnchors-10-overview-10.png) | `symbolAnchors.ts` pinned alone, press 10, overview / 10: after. |
| [symbolAnchors-more-one-line-05-far-5-panned.png](symbolAnchors-more-one-line-05-far-5-panned.png) | `symbolAnchors.ts` pinned alone, press 5, far / 5, the map dragged 700 px left to the `localView` band of the owner's picture: the alternative, More held one line tall (injected style). |
| [symbolAnchors-more-one-line-05-far-5.png](symbolAnchors-more-one-line-05-far-5.png) | `symbolAnchors.ts` pinned alone, press 5, far / 5: the alternative, More held one line tall (injected style). |
| [symbolAnchors-more-one-line-06-far-6-panned.png](symbolAnchors-more-one-line-06-far-6-panned.png) | `symbolAnchors.ts` pinned alone, press 6, far / 6, the map dragged 700 px left to the `localView` band of the owner's picture: the alternative, More held one line tall (injected style). |
| [symbolAnchors-more-one-line-06-far-6.png](symbolAnchors-more-one-line-06-far-6.png) | `symbolAnchors.ts` pinned alone, press 6, far / 6: the alternative, More held one line tall (injected style). |
| [symbolAnchors-more-one-line-07-overview-7-panned.png](symbolAnchors-more-one-line-07-overview-7-panned.png) | `symbolAnchors.ts` pinned alone, press 7, overview / 7, the map dragged 700 px left to the `localView` band of the owner's picture: the alternative, More held one line tall (injected style). |
| [symbolAnchors-more-one-line-07-overview-7.png](symbolAnchors-more-one-line-07-overview-7.png) | `symbolAnchors.ts` pinned alone, press 7, overview / 7: the alternative, More held one line tall (injected style). |
| [symbolAnchors-more-one-line-10-overview-10.png](symbolAnchors-more-one-line-10-overview-10.png) | `symbolAnchors.ts` pinned alone, press 10, overview / 10: the alternative, More held one line tall (injected style). |

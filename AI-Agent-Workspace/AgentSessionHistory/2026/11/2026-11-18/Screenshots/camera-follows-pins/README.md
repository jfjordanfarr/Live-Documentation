# The camera that follows the pins: Tuning's Framing, Follows Pins

_Historical evidence, taken in the night of 2026-11-18 to 19 by the builder of the follows-pins round, on the branch `camera-follows-pins` (main at `f3714076` with the round's change). The design is in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md) and the rule in [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md). The owner's words are [Turn 37 of the record](../../2026-11-18.1.record.md#turn-37)._

**The setup.** This repository's Explorer and the estate sample built by `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`, served on port 8826, Chromium at 1440 × 900 and 390 × 844, device scale 1, the continuing search off unless said. Framing chosen through the saved tuning or the link. Frames of a motion are screenshots taken as fast as they come while the map says its camera moves (`data-camera`), about one every 100 to 300 ms on this shared machine, so a strip shows a few moments of an ease, not every frame.

## The second increment: root's rulings of 2026-11-19

After the first pictures root ruled: older pins held by their name lines beside the newest, which is held whole; a re-frame the person did not cause never zooms in and never drops a target it can keep; a long move after a change of the pinned set takes van Wijk and Nuij's smooth zoom; Out To Files as a matched alternative; and the pin tray's sign for pins outside the frame. Taken on `camera-follows-pins` after `git merge main` (`c52a2d34`), the repository and estate bundles rebuilt for each hold.

| Picture | What I see |
| --- | --- |
| `r2-cell-press-follows-1440-rest.png` | **The named case under the rulings**, `pathfind.ts` at reading size, the first `live-docs/history` cell pressed. Still `codec.ts` alone at reading size, `pathfind.ts` said left out. Holding the older targets by their names changes nothing here, since the unpinned subject was already held by its name: the new card lands about 2,700 map px below that name, beyond what the floor holds in a 900 px window. After the hold of the pressed handle the rest of the move is under a frame's diagonal at this size, so it eased flat (`data-framing-path="flat"`), one ease of a few hundred ms at one scale: calm, but the subject goes. |
| `r2-cell-press-follows-390-strip.png` (before, two moving frames, rest) | The same at 390 × 844, where the move is longer than a diagonal and takes the smooth path: the second frame was caught at scale 0.83 on the way out and shows **an empty view**, the dark map with nothing drawn; the rest is `codec.ts` at reading size. So the pull back here is not deep enough to show anything, and whether the empty frame is the path or the page not yet drawing at the new scale I cannot tell from two frames. Jarring as caught. |
| `r2-search-reframe-rest.png` | Ruling 2. Two pins (`graph.ts`, then `pathfind.ts`), the continuing search on. Arrival framed both at the floor (0.336); after the search's rearrangement the camera kept 0.336 and only panned (y −1059 to −324): `pathfind.ts` whole at the top, `graph.ts`'s name at the left, its card cut below, nothing left out. In the first increment the same search had jumped to reading size and dropped `graph.ts`. The strip's frames were not caught (the ease ran before my sampler began), so its motion is unseen. |
| `r2-estate-pin-strip.png` (before, two moving frames, rest), `r2-estate-pin-rest.png` | The estate, `PostPayment` pinned on `PaymentsContext.cs`, then the `PostPaymentRow` row pinned from its card: one short pan at 1.45 that brings `PostPaymentRow.cs`'s name and row in beside `PostPayment`, the wire across the middle. Calm: nothing changes size, the eye follows the pan. |
| `r2-five-near-follows-1440.png`, `r2-five-near-out-to-files-1440.png` | Five whole-file pins from one directory (`graph.ts`, `document.ts`, `graphFiles.ts`, `discovery.ts`, then `pathfind.ts`). **Follows Pins** still frames only the newest at reading size: `pathfind.ts` is so tall that even entered at its top it leaves no room for the four names at the connections floor. **Out To Files** holds all five at 0.196 in the overview's files-only picture, every file name legible, the pinned ones among some sixty others; the five are not marked out from the rest beyond the pins' own look. |
| `r2-five-scattered-follows-1440.png`, `r2-five-scattered-out-to-files-1440.png` | The five scattered pins. Follows Pins: the newest alone, four left out. Out To Files: at 0.229, `codec.ts` and `pathfind.ts` held, three left out: even the overview cannot hold five directories apart. |
| `r2-fit-gives-following-back-rest.png` | The five scattered pins, the wheel turned (0.64, Fit not pressed), Fit pressed: back at the newest at 1.0, Fit pressed again. No moving frame was caught. |
| Reduced motion | **Found broken and mended, not yet seen after the mend.** On the estate with reduced motion the second pin did not re-frame at all: without a move to end, the settle that re-frames was never called. The pin's settle is now owed whenever the camera follows (`capturePinChange`); see the hold-C note below. |

**The tray's sign.** A pin left out says *Outside the frame* in the tray's quiet italic, the words it already uses for a pin absent from a history moment, and the row's name ends with ", outside the frame". The browser case on the five scattered pins checks the name; I have no picture of the open tray yet.

**An opened directory** is a target only while it is the newest thing: at the next pin, the directory stops being framed, though it stays open.

## The first increment

## What works

| Picture | What I see |
| --- | --- |
| `one-file-pin-1440.png`, `one-file-pin-390.png` | `pathfind.ts` pinned whole, the subject: the arrival as By Hand gives it, reading size (scale 1.0), the card entered at its top. Fit's frame icon is drawn pressed. |
| `one-symbol-pin-1440.png`, `one-symbol-pin-390.png` | The estate, `PostPayment` pinned on `PaymentsContext.cs`: the card's name line and the pinned row framed at the reading scale 1.45 (1.15 at 390), the row in the middle of the view. |
| `two-symbols-estate-1440.png` | **The owner's case.** `PostPaymentRow` pinned on `PostPaymentRow.cs`, then `PostPayment` on `PaymentsContext.cs`: both cards' names and both rows in view at 1.45, the wire between the two rows across the middle; `Payment.cs` and the rest of `PaymentsContext.cs` cut at the edges, incidental. It reads as the owner's own picture, a little closer. |
| `two-symbols-estate-390.png` | The same at phone width: scale 0.47, the connections look, both rows and both names legible, `App.config` and `SqlServer` incidental above and below. |
| `five-pins-1440.png`, `five-pins-390.png` | Five whole-file pins from four directories (`graph.ts`, `visualize-static.ts`, `index.ts`, `history/codec.ts`, then `pathfind.ts`): they do not fit together at the floor, nor do any two of them, so the four oldest are left out (the map names them in `data-framing-left-out`) and the newest, `pathfind.ts`, is framed alone as one pin. The tray still says 5 pins. Honest, and not the picture a person hopes for: five scattered whole cards are too much for one view at a legible scale. |
| `pin-after-hand-before.png`, `pin-after-hand-rest.png` | Arrival following, then one turn of the wheel out (scale 0.74): Fit is no longer pressed. A history cell pressed: the scale stays 0.74 and the camera pans only the least that shows `codec.ts`, today's step. Calm. |
| `fit-before-press.png`, `fit-gives-following-back-rest.png` | The five pins, the wheel turned (scale 0.64, Fit not pressed), then Fit pressed: one ease back to the pins' frame (1.0, `pathfind.ts`), Fit pressed again. |

## What does not, and why

| Picture | What I see |
| --- | --- |
| `cell-press-follows-1440-strip.png` (before, three moving frames, rest) beside `cell-press-hand-1440-strip.png` | **The owner's rollercoaster, both ways.** `pathfind.ts` at reading size, the first cell under `live-docs/history` pressed. Under Follows Pins the held history handle comes first (the hold through the re-layout), then the camera rides about 2,700 map px down to `codec.ts` and comes to rest with it centred at reading size (`cell-press-follows-1440-rest.png`); under By Hand it rides the same way and rests with `codec.ts` at the right edge (`cell-press-hand-1440-rest.png`). **The promised short pull back does not happen here.** The new card lands farther below the subject's name than the floor (the connections look's last press, 0.335 of reading) can hold in a 900 px window, so the rule leaves the subject out and frames the newest alone. Holding the unpinned subject by its name line rather than its whole tall card (built tonight) was not enough. At 390 the same (`cell-press-*-390-rest.png`). The motion reads as calm-ish (one ease at one scale, no look change), but it is still the ride. |
| `search-first.png`, `search-rest.png` | Two pins, `graph.ts` then `pathfind.ts`, the continuing search on. First picture: both cards framed at the floor (0.336, the connections look), names legible. After the search's rearrangement the pair no longer fit at the floor, so the camera re-framed to `pathfind.ts` alone at reading size: a jump from the farthest legible zoom to the closest across the look edge, where this repository's picture freezes for about a quarter of a second (another builder's fault, not hidden or worked round here). I did not catch this ease in frames; I expect it reads as jarring, both for the freeze and because a whole pin vanishes from the frame without the person doing anything. |

## Numbers

Ease lengths by the rule (`framingEaseMs`): 300 ms at least, plus 250 ms a doubling of scale and 400 ms a frame's diagonal travelled, at most 900 ms. The probe's log: the cell-press re-frame ran over three to six captured frames; no wall-clock figure is asserted anywhere.

## Browser cases

Four new cases at the end of `tests/e2e/camera-intent.spec.ts`, each reading the lever both ways, run once on this build: the owner's two symbols (passes; the By Hand half confirms the arrival frames the subject's card alone), the five pins leaving out the oldest (passes; By Hand writes nothing). The cell press pulling back, and Fit giving the following back after a wheel, failed for the geometry above and were marked `test.fail()` that night; in the second increment both were rewritten to the rule as it then stood and pass as ordinary cases, and no case is marked (corrected 2026-11-19).

## Links (Framing = Follows Pins, carried in the `s=` snapshot's layout settings)

A fresh browser opens these with Follows Pins (the page also writes the lever into its own address after the next exploration change):

- the owner's two symbols: `/samples/estate/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQAzAJ0wFsBLAOwHMoTUE0B3AZxAF8v4bGACpgCeFAKY0ALgGUxpMFXRiA9ABFMkzMqGiJk9gGFUUsQA9JAOnSd4hSAG1Q-SCB3ips+YpXrN21OySbnoASqisVjYgnC4CAUEi7pJhrNywToKJep4KSmoaWsFShsaSZpbWIPAxrvFFktwAulxAA`
- one symbol: `/samples/estate/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQAzAJ0wFsBLAOwHMoTUE0B3AZxAF8v4bGACpgCeFAKY0ALgGUxpMFXRiA9ABFMkzMqGiJk9gGFUUsQA9JAOnSd4hSAG1Q-SCB3ips+YpXrN2ke76RibmVjYgnC4CqOySbnrcALpcQA`
- `pathfind.ts`, for the cell press: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQAzAJ0wFsBLAOwHMoTUE0B3AZxAF8v4bH8mdAGtMdAKbsA9OPq1xU9qXRSEVMOIC0AEwzTBAFwAWxWtoB0BzlyA`
- the five pins: `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQAzAJ0wFsBLAOwHMoTUE0B3AZxAF8v4bH8mdAGtMdAKbsA9OPq1xU9qXRSEVMOIC0AEwzTBAFwAWxWtoB0BzvEKQA2qH6QQgkWMky5NBUpVqNOnpSdOT4RpbWIJzOAFTcsI6M7OikVPhWqupauujSYFTsAK7YVABeWuwGmAZU6BEg8NEgcbyJzq6iEtLiAB74aKTipIrKUuhqsgZSZr31jYwtCSBOLkKdHrJ08iN+WYG5UkYFBqikAJ5jqNridVYNUQvxbatuXZ5b3juZATn61SZmOYPWLcAC6XCAA`

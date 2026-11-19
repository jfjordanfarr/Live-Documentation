# The pinned file through the history: never dimmed, and two knobs to move by

_Historical evidence, taken 2026-11-19 by the builder of the round. The owner's words behind it are [Turn 24 of the November 18 record](../../2026-11-18.1.record.md#turn-24) and their pictures [in the owner's Turn 24 folder](../owner-turn-24/README.md); the behaviour is described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md)._

**The setup.** This repository's Explorer with its history to 2026-11-13 (818 steps, read from the main tree's history file). The "before" pictures are main's Explorer as built at 01:42 UTC, which holds every product commit up to `e7e5de43`. The "after" pictures are the round's branch. Both are in 3D, Connections, with the engine's `live-docs/pathfind.ts` pinned and the default tuning: Changed Files at Dim, marbles From Its Doc. The window is 834 by 650, the owner's own width. In the map pictures the navigation is collapsed, as the owner had it, and the wheel has drawn the camera in toward the pinned file. The camera moves differently between the two builds, so the framings differ. The graphics card drew every picture (ANGLE on D3D12).

**What the engine marks for `pathfind.ts`.** Over the 818 steps, eight tall marks (steps 296, 525, 535, 576, 626, 700, 705 and 722) and no short one. The Explorer's own `pathfind.ts` has thirteen tall and four short.

| Picture | What I see |
| --- | --- |
| [01-before-step-762-pathfind-dim.png](01-before-step-762-pathfind-dim.png) | Main at step 762, the owner's moment. The step's changed files are bright green dots inside the `e2e` bubble. `pathfind.ts`, the large marble above its label, is dimmed to a dark ghost like everything else the step left. The playback has three buttons. |
| [02-after-step-762-pathfind-undimmed.png](02-after-step-762-pathfind-undimmed.png) | The branch at the same step. `pathfind.ts` is a full, bright marble with its blue and green veins, while its unchanged neighbours stay dimmed. The changed files are as bright as before. A hover tooltip from the pointer is in the picture. The playback has five buttons: a chevron against a bar at each end for the marked commits, and the plain chevrons for the commits. |
| [03-next-marked-0.png](03-next-marked-0.png) | The strip begins at step 535 (2026-10-15), one of `pathfind.ts`'s marks. |
| [03-next-marked-1.png](03-next-marked-1.png) | Next marked commit pressed once: step 576 (2026-10-18). |
| [03-next-marked-2.png](03-next-marked-2.png) | Pressed twice: step 626 (2026-10-22). |
| [03-next-marked-3.png](03-next-marked-3.png) | Three times: step 700 (2026-11-02). In this framing the pinned marble sits at the bottom edge, partly under the control strip. |
| [03-next-marked-4.png](03-next-marked-4.png) | Four times: step 705 (2026-11-03). Each press landed on the next tall mark and skipped the quiet steps between. |

**The narrow scrubbers.** These are the same moment at a phone's width, at the owner's width with the navigation open and collapsed, and at 1400. Looking at them found two faults older than this round. The narrow rule that gives the track its own row had never taken effect, because the slider's own `flex` came after it. And below an 850 px window the control strip stood at a fixed height that ignored the open scrubber, so it covered part of the scrubber. Both are mended in `styles/history.css` and `styles/local.css`. The measures are each part's box, read in the page.

| Picture | What I see |
| --- | --- |
| [04-before-390.png](04-before-390.png) | Main at 390 by 844. The control strip lies across the scrubber and hides its track and its buttons. The track, where it shows, is 89 px wide. |
| [05-after-390.png](05-after-390.png) | The branch at 390 by 844. The scrubber has three rows: the 280 px track, then the five buttons and the speed, then the readout and the two toggles. The pin tray stands above the scrubber and the control strip above the tray. Nothing overlaps. |
| [06-before-scrubber-834-navigation-open.png](06-before-scrubber-834-navigation-open.png) | Main at 834 with the navigation open: one row, the track squeezed to 146 px, and the control strip's lower edge over the scrubber's top. |
| [07-after-scrubber-834-navigation-open.png](07-after-scrubber-834-navigation-open.png) | The branch, same window: the track has its own row, 511 px wide, with the ruler's months legible, and the buttons sit beneath it. |
| [08-after-scrubber-834-navigation-collapsed.png](08-after-scrubber-834-navigation-collapsed.png) | The owner's own layout: one row 749 px wide. The two pairs take the track from 328 px to 264 px, and the marks and the ruler stay legible. |
| [09-after-scrubber-1400.png](09-after-scrubber-1400.png) | At 1400 one row, with a 618 px track (682 before). |

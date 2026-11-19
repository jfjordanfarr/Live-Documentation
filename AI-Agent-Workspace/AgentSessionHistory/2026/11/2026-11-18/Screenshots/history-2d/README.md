# The history in the 2D Local Map: the first rung

_Historical evidence, taken 2026-11-19 by the builder of the round. The owner's request behind it is [Turn 34 of the November 18 record](../../2026-11-18.1.record.md#turn-34). The behaviour is described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md)._

**The setup.** The Explorer is built from the branch `history-2d`. Pictures 01 to 06 use the scripted history sample (`samples/history/`, 7 steps) with the scan root opened and Show Tests on. Pictures 07 to 09 use this repository with its history to 2026-11-13, with the engine's `pathfind.ts` pinned. All are in 2D with the default tuning, Changed Files at Dim. The graphics card drew every picture. Pictures 01 to 09 were taken before the mend that lifts the zoom controls (+, −, ⟲) above the open scrubber; in them the scrubber hides those controls.

| Picture | What I see |
| --- | --- |
| [01-sample-2d-step4-1400.png](01-sample-2d-step4-1400.png) | Step 4 in 2D, the History button pressed and the scrubber along the bottom. The step panel stands below the search bar. The root's file card is a files-only card ("No public symbols"), faded since the step left it, and the lib, src and tests boxes stand beside it. |
| [02-sample-2d-step3-after-3d-and-back-1400.png](02-sample-2d-step3-after-3d-and-back-1400.png) | The arrow took the thumb to step 3, the 3D button was pressed and then 2D again: the thumb is still at step 3, and the picture and the panel are step 3's. |
| [03-sample-3d-step3-after-switch-1400.png](03-sample-3d-step3-after-switch-1400.png) | The same moment in 3D after the switch: huge.ts, born at step 3, stands beside main.ts, and the files the step left are dimmed. |
| [04-sample-2d-pin-not-yet-created-1400.png](04-sample-2d-pin-not-yet-created-1400.png) | huge.ts pinned, at step 1, in 2D: the search bar and the tray both say "not yet created", and the map shows the root, since nothing pinned stands there. |
| [05-sample-2d-step4-834.png](05-sample-2d-step4-834.png) | Step 4 at 834 px with the navigation open: the scrubber has two rows, and the strip and the tray stand above it. |
| [06-sample-2d-step4-390.png](06-sample-2d-step4-390.png) | Step 4 at 390 px: the scrubber has three rows, and the strip and the tray stand clear of it. The step panel covers part of the map, as it does in 3D at this width. |
| [07-repo-2d-step700-pathfind-1400.png](07-repo-2d-step700-pathfind-1400.png) | This repository at step 700, which changed `pathfind.ts`. The pinned card is a files-only card with its node-level hub and its pair lines. Its description is today's, which is not yet hidden at a moment. |
| [08-repo-2d-step762-camera-off-1400.png](08-repo-2d-step762-camera-off-1400.png) | Step 762 opened straight from an address: the camera stands far to the right of the pinned card, at 1.45 scale. Only card-reading.ts, which the step changed, and its neighbours are in view. A fault, not yet found. |
| [10-sample-2d-step4-zoom-controls-lifted-1400.png](10-sample-2d-step4-zoom-controls-lifted-1400.png) | Step 4 again after the mend: the zoom controls (+, −, ⟲) stand above the scrubber at the left, level with the control strip. |
| [09-repo-2d-today-1400.png](09-repo-2d-today-1400.png) | Today, for comparison: the same pin with its symbol rows and descriptions, and the zoom controls at the left. |

## The second pass (pictures prefixed `2nd-`)

_Taken 2026-11-19 by the builder of the second pass, on the branch `history-2d-second` merged with main at `924bec80` (the returning connections round, which moved each card's hubs to its name line), except picture 2nd-07, taken on the same branch before that second merge. The first pass's pictures above stay as its evidence: 07 and 08 are the "before" of 2nd-01 and 2nd-02._

**The setup.** Show Tests on, Changed Files at its default, Dim, except 2nd-06 at Glow; the graphics card drew every picture. Each picture was taken once the map said it was settled (no move, no camera motion), and 600 ms after.

| Picture | What I see |
| --- | --- |
| [2nd-01-repo-step700-pathfind-1400.png](2nd-01-repo-step700-pathfind-1400.png) | This repository at step 700, the engine's `pathfind.ts` pinned, opened from an address. The pinned card stands in the middle at reading size: its name, its path, then "+28 symbols", quiet, where its rows would be, then Internals and its directory. No description and no Read control. Its lines end at the hub on the name line and at Internals' dot. Compare picture 07, where the card wore today's "Pathfinding over the graph index..." and said "No public symbols". |
| [2nd-02-repo-step762-address-1400.png](2nd-02-repo-step762-address-1400.png) | Step 762 opened straight from an address, the case of picture 08: the pinned card stands in the middle of the frame, framed as at step 700. The neighbours fade under Dim; `queries.test.ts` and `pathfind.test.ts` say "No public symbols", which is true of them then. |
| [2nd-03-sample-main-step3-1400.png](2nd-03-sample-main-step3-1400.png) | The history sample at step 3, `src/app/main.ts` pinned: "+1 symbol" where its one row would be; `.live-docs.config.json` says "+4 symbols"; `tests/main.test.ts`, which had none, says "No public symbols". No card carries a description. |
| [2nd-04-sample-main-today-1400.png](2nd-04-sample-main-today-1400.png) | The same pin today, for comparison: main.ts with its row `main`, its description "Runs the app.", its test backing and the Read controls. |
| [2nd-03-sample-main-step3-834.png](2nd-03-sample-main-step3-834.png) | Step 3 at 834 px: the scrubber's two rows, the strip, the zoom controls and the tray above them, the card whole in the frame. |
| [2nd-03-sample-main-step3-390.png](2nd-03-sample-main-step3-390.png) | Step 3 at 390 px: the scrubber's three rows with the controls above, the card in the frame; the step panel covers the card's top edge, as it does in 3D at this width (older than this round). |
| [2nd-05-sample-closed-lib-lit-dim-1400.png](2nd-05-sample-closed-lib-lit-dim-1400.png) | The scan root opened at step 4, which deleted `lib/legacy.ts` and the wire to it from `src/app/main.ts`: lib and src keep their look, tests and the config card fade to three tenths. Before this pass a closed box never lit or faded. |
| [2nd-06-sample-closed-lib-lit-glow-1400.png](2nd-06-sample-closed-lib-lit-glow-1400.png) | The same at Glow: the lib and src folders' outlines are drawn in the history's white, tests and the config card are not. |
| [2nd-07-sample-resized-1400-to-390.png](2nd-07-sample-resized-1400-to-390.png) | A page opened at 1,400 px with the scrubber open, then narrowed to 390: the strip and the zoom controls stand above the scrubber's three rows. Before the mend they stood on the scrubber until the next step. |

**Unseen.** A step whose renamed file moves: a renamed file still enters as a new card at rest (not re-keyed). The cells inside a closed box are not lit one by one, and no picture shows one.

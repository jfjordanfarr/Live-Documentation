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

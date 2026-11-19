# The history track zoomed by the wheel

_Historical evidence, taken 2026-11-19 by the builder of the round. The owner's question behind it is [Turn 26 of the November 18 record](../../2026-11-18.1.record.md#turn-26). The behaviour is described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md)._

**The setup.** This repository's Explorer, built from the branch `history-zoom` with the focus mend (`a0cd0a2f`). The history runs to 2026-11-13 (818 steps). The map is 3D, Connections, with the engine's `pathfind.ts` pinned, at step 762, in an 834 by 650 window. In each round the wheel turned toward the screen three times by 300 pixels, with the pointer held at 93% of the track's width. The graphics card drew every picture. Each picture is the scrubber alone, except the last, which is the whole page.

| Picture | What I see |
| --- | --- |
| [01-zoom-0-whole.png](01-zoom-0-whole.png) | The whole history, steps 0 to 817. There are 30 ticks, grouped by month, and the ruler names months. |
| [02-zoom-1.png](02-zoom-1.png) | Steps 135 to 583, with 69 ticks. Step 762 is now past the right end, so the thumb has left the track and its mark stands at that end. |
| [03-zoom-2.png](03-zoom-2.png) | Steps 198 to 272, with 75 ticks. The fixed pointer now stands over the quiet stretch between March and September. Under the date axis, the step there is the last one before the gap, so the zoom closes in on March. |
| [04-zoom-3.png](04-zoom-3.png) | Steps 256 to 268: 13 single commits. |
| [05-zoom-4-least-span.png](05-zoom-4-least-span.png) | Steps 260 to 268, the least span of eight steps: 9 ticks. The wheel narrows no further. |
| [06-slid-away-mark-at-end.png](06-slid-away-mark-at-end.png) | After three turns with Shift held, the range has slid to steps 284 to 292, and the ruler names a single day. The step shown, 762, lies beyond, and its mark stands at the right end of the track. |
| [07-brought-back.png](07-brought-back.png) | The mark pressed: the range has slid to steps 754 to 762, and the thumb stands at its end with the November days on the ruler. |
| [08-resized-to-390.png](08-resized-to-390.png) | The same page resized live to 390 px. The control strip and the pin tray cover part of the scrubber, because the scrubber's room is set when it refreshes, not on a resize. A fresh load at 390 px stands clear (the history-pinned folder's picture 05). |

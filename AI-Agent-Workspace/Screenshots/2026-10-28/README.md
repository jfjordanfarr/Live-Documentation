# October 28, 2026 — the 3D Local Map enters in pieces

Historical pictures of the reveal built this day for [the October 28 session](../../ChatHistory/2026/10/2026-10-28.1.record.md#turn-2), taken by the root agent in headless Chromium (1280×800, the software renderer) from this repository's bundle rebuilt without its history (`npm run live-docs:visualize -- --history none`) and from the T3 bundle's saved two-file state served under the new page with its data of 2026-10-27 unchanged. The observations are the agent's; the owner's eye decides. The corresponding motion is held by `tests/e2e/force-graph-reveal.spec.ts`.

## Method and limits

A script opened each state in 3D, counted the spheres drawn every 100 ms through the observation instrument of the end-to-end suite, and took a picture at the first drawn frame, at half the files, at all of them, and when the engine fell still. Times are wall-clock in headless Chromium, where a frame is drawn in software, and say only that the first piece is on screen at once and the rest follows; a real browser draws faster. Pictures 01 to 12 are from the build whose reveal spec passes (each piece applied and drawn before the next). Pictures 13 to 15 were taken earlier, from the T3 state with the exact field and before the fix that waits for a piece to be on screen, so their growth skipped pieces; they are kept as the first look at T3 in 3D and will be retaken once the octree field is merged.

| Picture | What it shows |
| --- | --- |
| [01](01-connections-first.png) | This repository, connections, nothing retained: the first piece of 300, the most connected files first, labelled, half a second after opening. |
| [02](02-connections-half.png) | The same picture at 450 files, growing outward. |
| [03](03-connections-full.png) | All 877 in, two seconds after opening, still unfolding. |
| [04](04-connections-still.png) | At rest, 41 s and 353 frames later in the software renderer. |
| [05](05-subject-first.png) | The subject `forceGraphView.ts` selected: the first piece holds it and its neighbourhood, the camera on the subject. |
| [06](06-subject-half.png), [07](07-subject-full.png) | Growing to 450 and to all 877 around the subject. |
| [08](08-subject-still.png) | At rest around the subject, 26 s later. |
| [09](09-structure-first.png) | The structure layout with the subject: the first piece holds the subject, its hubs and the nearest files. |
| [10](10-structure-half.png), [11](11-structure-full.png) | Growing to 582 and to all 1,165 spheres (877 files and 288 hubs). |
| [12](12-structure-still.png) | At rest, 25.6 s later. |
| [13](13-t3-first.png) | T3, the saved two-file path, in 3D with the exact field: the path's two files and their nearest on screen within a second, where before nothing appeared at all. |
| [14](14-t3-1000.png), [15](15-t3-5000.png) | T3 at a thousand and at five thousand spheres, the path kept in focus, the context faint. |

## What the pictures say

- The first piece is on screen at once at every size tried: 0.5 s here and on T3, where the diagnosis of 2026-10-27 found the page frozen for the better part of a minute before any picture.
- The subject's neighbourhood is what a person sees first; the context grows around it rather than the subject appearing somewhere in a crowd.
- The whole of this repository is in within two seconds and settles over tens of seconds in software, which the exact field's cost sets; the octree field is to shorten it.
- Nothing in these pictures judges the rest picture against the former one; the layout lab's comparison of the reveal's rest against the whole-at-once rest is still to be run.

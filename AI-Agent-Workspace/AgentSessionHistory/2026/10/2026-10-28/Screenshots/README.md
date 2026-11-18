# October 28, 2026 — the 3D Local Map enters in pieces

Historical pictures of the reveal built this day for [the October 28 session](../../ChatHistory/2026/10/2026-10-28.1.record.md#turn-2), taken by the root agent in headless Chromium (1280×800, the software renderer) from this repository's bundle rebuilt without its history (`npm run live-docs:visualize -- --history none`) and from the T3 bundle's saved two-file state served under the new page with its data of 2026-10-27 unchanged. The observations are the agent's; the owner's eye decides. The corresponding motion is held by `tests/e2e/force-graph-reveal.spec.ts`.

## Method and limits

A script opened each state in 3D, counted the spheres drawn every 100 ms through the observation instrument of the end-to-end suite, and took a picture at the first drawn frame, at half the files, at all of them, and when the engine fell still. Times are wall-clock in headless Chromium, where a frame is drawn in software, and say only that the first piece is on screen at once and the rest follows; a real browser draws faster. Pictures 01 to 12 are from the build whose reveal spec passes (each piece applied and drawn before the next). Pictures 13 to 15 were taken earlier, from the T3 state with the exact field and before the fix that waits for a piece to be on screen, so their growth skipped pieces; they are kept as the first look at T3 in 3D. Pictures 16 to 21 are T3 again with the octree field at its default of 0.3 and the corrected reveal, taken while the full test chain ran on the same machine. Pictures 22 to 27 are T3 with the pacing as well, the motion taken in parts within 10 ms a frame.

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
| [16](16-t3-first.png) | T3 with the octree field: the first piece, the path's two files and their neighbourhood labelled, 4.1 s after opening, of which about 3.5 s is the 124.6 MB bundle's load. |
| [17](17-t3-1000.png), [18](18-t3-5000.png), [19](19-t3-10000.png) | Growing past a thousand, five thousand and ten thousand spheres; 3,978 were in at 10.6 s and 18,293 at 45 s. |
| [20](20-t3-21720.png) | All 21,720 in, 89 s after opening, the subject held in focus and the rest faint. |
| [21](21-t3-at-240s.png) | Still settling at 240 s: with every sphere in, one tick of the field takes seconds, and the software renderer drew 95 frames in four minutes. This is the work the pacing is for. |
| [22](22-t3-paced-first.png), [23](23-t3-paced-1000.png), [24](24-t3-paced-5000.png), [25](25-t3-paced-10000.png) | T3 with the pacing: the first piece at 4.0 s, 4,814 spheres at 10 s, a piece a frame. |
| [26](26-t3-paced-21720.png) | All 21,720 in, 30 s after opening. |
| [27](27-t3-paced-at-240s.png) | Settling at 240 s. The physics took a median 11.8 ms a frame and at most 28.5 ms (218 parts logged over 90 s by a temporary diagnostic); the frame itself, drawing 94,000 objects in software, took seconds, so pictures 26 and 27 differ little. |

## What the pictures say

- The first piece is on screen at once at every size tried: 0.5 s here and on T3, where the diagnosis of 2026-10-27 found the page frozen for the better part of a minute before any picture.
- The subject's neighbourhood is what a person sees first; the context grows around it rather than the subject appearing somewhere in a crowd.
- The whole of this repository is in within two seconds and settles over tens of seconds in software, which the exact field's cost sets; the octree field is to shorten it.
- T3 with the octree: the path is on screen as soon as the bundle has loaded, the whole picture is in within a minute and a half, and the settling after that runs at a frame every few seconds, since one tick at 21,720 spheres is several evaluations of a quarter second each and the frame draws 94,000 objects in software. The pacing that spreads an evaluation across frames is what keeps the page answering through that; the picture itself is already usable as the path's context.
- T3 with the pacing: the whole picture is in by 30 s, and the physics keeps to its budget of a frame at full size. What headless Chromium cannot show is the frame rate a real GPU gives: there the frame is the budget plus the drawing, and the settling, seconds of physics a tick spread over frames, takes minutes while the page answers. The first attempt, a piece a tick, left the reveal at 11,357 spheres after four minutes in software and was replaced by a piece a frame.
- Nothing in these pictures judges the rest picture against the former one; the layout lab's comparison of the reveal's rest against the whole-at-once rest is still to be run.

# The 3D settle, sooner: a pacing that changes no path, and a shorter tail for the eye

_Historical evidence, taken 2026-11-19 by the builder of the round `settle-sooner`, from `main` at `c29e2a4a`. It follows [the running down of the discovery case's slow settle](../suite-reds/README.md), whose first section this round answers. "Main" is a build of `c29e2a4a` in a scratch copy; "paced" is this round's first commit. Frames are counted by the suite's own observer of drawn frames (`force-graph-observation.ts`); seconds are wall time beside the machine's one-minute load, on the graphics card, at 1280 × 800 (the discovery case) and 1440 × 900 or 960 (the estate's)._

## Step 1: a frame takes as many of a tick's substeps as fit, once the picture has entered

**What changed.** The page takes the 3D motion within 10 ms a frame, a tick in parts. A part was held to one evaluation of the field, so a frame drew one substep, and a stiff picture whose every tick takes several substeps took a frame for each. Now, once the whole picture has entered, a part reaches through as many of a tick's substeps as the budget holds (sized by the rate the last part measured), never past the tick's end; while the picture still enters, a piece a frame, and at the first call after a piece or a hand moved spheres, the part is what it was, one evaluation at most, by the same rule as before line for line. That first call is why a new piece is drawn first where it was placed: it reads the field and goes no further, as `force-graph-structure-cells.spec.ts:134` holds for a bubble's pop (a build that let that call reach through a tick moved a popped file 11.3 units in the pop's frame, past the case's 5). It is the second of the two pacings tried in [suite-reds](../suite-reds/README.md), made landable.

**Why no path can change.** A tick's numbers are the same however it is divided (`SpatialMotion.advance`, held by its unit tests since 2026-10-28). The only thing the page does at a frame that touches the motion on its own is the reveal's next piece; a hand, a wake, a step of history and a change of perspective happen when a person makes them. While the pieces enter, at a piece's first call and at a hand's, the pacing is as it was, so each piece meets the motion at the moment it always has; after the last piece, nothing meets it but the ticks. A part never passes a tick's end, so a frame still completes at most one tick and the tether's hold and the rest rule read every tick as before.

**The proof.** Every sphere's place at rest on three pictures, three runs each of main and of the paced build, compared by id; the paced build's three runs were taken before its first-call rule above, the number after the semicolon on the final build ([`step-1/runs-and-places.json`](step-1/runs-and-places.json) has the numbers and main's places):

| Picture | Spheres at rest | Spheres in the same place to the last digit, every run against every run | Frames to rest, main | Frames to rest, paced |
| --- | --- | --- | --- | --- |
| This repository, the largest group's seed clicked (the discovery case, `force-graph-discovery.spec.ts:70`) | 305 | 305 of 305 | 5,247, 5,248, 5,248 | 2,637, 2,637, 2,637; 2,638 |
| Its archipelago, before the click | 101 | 101 of 101 | 43 | 43; 43 |
| The estate, `PaymentService/PaymentService.cs` clicked on the archipelago (Skin, one hop) | 26 | 26 of 26 | 999, 999, 999 | 996, 996, 996; 997 |
| The estate's Whole in Structure with Skin (`force-graph-exploration.spec.ts:206`) | 54 | 54 of 54 | 240, 240, 240 | 236, 236, 236; 237 |
| Its first picture, `Portal` open, before Whole | 11 | 11 of 11 | 155 | 153; 154 |

The tolerance asked for was the rest rule's own, 3 × 10⁻⁵ of the picture's diagonal; none was needed: the largest difference of any coordinate on any picture is exactly zero, and the screenshots at rest are the same bytes (`cmp`), so one of each is kept: [`step-1/discovery-rest.png`](step-1/discovery-rest.png), [`step-1/estate-rest.png`](step-1/estate-rest.png), [`step-1/whole-rest.png`](step-1/whole-rest.png). The start is deterministic as the page makes it: the same link, the same viewport, the pointer moved off the picture at once after the click, and on these pictures an evaluation of the field fits the budget, so even main's pacing while entering depends on nothing timed. Main's 5,247 against 5,248 is the observer's count of the frame in which the busy flag fell, not the motion: the places are identical.

**Seconds**, wall time from the click to rest, with the load before, at the click and after:

| Picture | Main | Paced |
| --- | --- | --- |
| Discovery growth | 88.5 s (2.9/2.9/2.3), 88.5 s (1.8/1.8/2.0), 91.5 s (2.8/2.5/3.0) | 44.3 s (2.6/2.4/1.9), 46.3 s (2.1/2.1/2.4), 45.3 s (2.4/2.4/2.5) |
| Estate seed click | 21.0 s, 19.0 s, 22.1 s (load 1.4 to 3.2) | 20.0 s, 20.1 s, 20.0 s (load 1.9 to 2.6) |
| Estate Whole | 5.9 s, 4.9 s, 4.9 s | 4.9 s, 5.9 s, 4.9 s |

**What it does not do.** The discovery growth's path is main's, and main's path takes about 2,600 ticks to rest, so at a tick a frame it rests in 2,637 frames, under the case's bound of 2,700 by 62; in the lane, with the pointer left where the seed's name stood, the case passed in 2,638 frames and 46.1 s at a load of 2.5. The estate's pictures, whose ticks are mostly one substep already, gain a few frames. The tail itself is untouched; that is step 2.

**A hand.** A part is held to one evaluation at a call after a hand moved a sphere, as every part was, so a drag goes as it went; the pacing reaches further only between such calls.

**Frames now depend on the machine.** Before, a frame drew one substep whatever the machine, so a settle's frames were the picture's alone. Now a frame draws as many substeps as fit in its 10 ms, so a loaded machine draws fewer a frame and takes more frames: the discovery growth took 3,883 frames (215 s) at a load of 24 to 29 with a screenshot every 60 frames, against 2,638 at a load of 2.5, and still rested with all 305 spheres in main's places to the last digit. Under such a load the discovery case's bound of 2,700 frames can be crossed again by the machine, not the picture.

**The lane, on the final build of step 1**, each file alone through the browser lane: `force-graph-structure-cells` 3 passed, `force-graph-discovery` 3 passed (the grown group at rest in 2,638 frames, 46.1 s), `force-graph-exploration` 8 passed (`:206`, the case the first pacing broke, among them), `force-graph-building` 3, `force-graph-defaults` 7, `force-graph-focus` 15, `force-graph-shells` 9, `history-emphasis` 16. Loads 2.3 to 4.0.

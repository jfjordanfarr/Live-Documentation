# The shells' third round: the second round's faults (3D Local Map)

_Status: implementation evidence of 2026-11-07, for review. A builder fixed, on its worktree reset to `91e39276`, the faults of the shells' second round that are not the nesting fork, which stays the owner's: nothing here chooses between full nesting, one level drawn, or a flat body with membranes, and Group Wrappers stays Off by default. The pictures were taken in a private headless Chromium with software rendering at 1440 × 960, Group Wrappers chosen as a saved Tuning choice and the background search off, on a slower and busier machine than the second round's (about 3.7 frames a second in the gate's Chromium against about 9 the day before). "Before" is the bundle built at `91e39276`; "after" is the same bundle, the same data, with this round's page and code, so that the two are pictures of one picture. The instruments are in [the probe folder](../../../Probes/2026-11-07/shell-faults/README.md)._

## 1. The blade through the T3 sample's picture

**What it was: wires.** Hidden in turn, the spheres left the blade standing ([without spheres](t3-before-without-spheres.png)) and the wires took it away ([without wires](t3-before-without-wires.png)); no wire was wide (2.4 pixels at the most, by the shader's own rule), the camera stood in no skin, and every hull stood within 7 % of its body. 874 of the picture's 1,273 drawn wires lay within eight pixels of one line on the screen, 541 between files, 309 between a file and a shell and 24 between shells, because the picture's 43 shells stood in a line in space: 97.7 % of their spread along one axis, from `apps/marketing` to `alchemy-effect`, some 8,500 units end to end ([the record](t3-line-before.json)). The wires from the files to the shells ran along it, and the software renderer drew hundreds of them over one another as one white blade ([before](t3-before.png)).

**Its cause: the shells' birth.** Headlessly, the shells' births alone, with nothing moved, already stood in that line (98.7 %, the `birth.cjs` probe). The second round bore a shell outside the placed mass, beyond the farthest sphere placed toward its wired files from the centroid of everything placed. All 43 shells enter in the first piece of the picture, wired to the pin and to one another, and each one placed drew the centroid and its next sibling's neighbours after it, so that each was born beyond the last.

**The fix.** A shell is born outside the files alone, clear of every shell already placed: along each of 65 directions (toward its wired files, and 64 evenly over the sphere) it stands as near the files' centroid as clears the files' rim and every placed shell, and of those places it takes the one nearest the centroid of what it is wired to (`placeNewSpheres`). The T3 sample's births: 50.4 % of their spread along one axis, within 88 to 1,725 units of the files' centroid (median 427) where they had reached 1,696 to 10,382 (median 8,223). A unit test holds the case: twelve sibling shells wired to the same files were born in a line reaching 1,348 units, longer than their diameters laid end to end (1,225); now they reach 210.

**The same view after** ([after](t3-after.png), 150 s after loading, as before, and still not at rest): no blade. The shells stand about the files (their centroid 140 units from the files', where it had stood 7,900 away) and no longer in a line (52.2 % of their spread along one axis); the camera frames the picture from 13,500 units where it had needed 30,100 ([the record](t3-line-after.json)). What remains is the short fan of wires from the pinned file's neighbourhood into `alchemy-effect`, whose skin is drawn larger than the rest of the picture together: the nesting fork's size, the owner's to weigh.

## 2. The stall of packing

A picture packed every body it named in the frame that named it, since a body's size is its node's in the field. Where the time went, headlessly, on the T3 sample's largest shell (13,095 files): 2,199 bubbles, of which the 2,135 of 48 units or fewer took two thirds of the time, the greedy placement testing each of 64 places beside each placed sphere against every placed sphere.

**What changed.** (a) The greedy placement of up to 48 spheres tests a candidate place only against the spheres near enough the sphere it touches to block it, and only when the place would reach less far than the best yet; it chooses exactly the places it chose: every one of the 722 bodies of the T3 picture, the 51 of this repository's reference, the 42 of its rosetta picture and the 4 of the estate's are byte for byte the same shapes before and after (`pack.cjs` dumps), 400 seeded sets of 1 to 48 spheres pack the same, and three packings are pinned to the last digit in the unit tests. Over 48 units the relaxation is unchanged. (b) A body is built a bubble at a time (`bodySteps`); the render packs what fits in 24 ms and, while any body it names is unpacked, returns before it changes anything, the picture standing as it was and the page busy, and packs on a few bubbles a frame, building the picture once the last is packed. Since the picture is built only once every body is packed, the spreading changes nothing of the picture or its motion (the archipelago's pictures in section 3 are byte for byte the same). (c) A pop takes each bubble it releases as a body from the popped body's packing (`innerShape`) instead of packing it again, so that a pop never waits.

**Numbers.** Headlessly, the processor time to pack every body, the least of three runs, two runs each interleaved on a machine shared with other work: the T3 picture's 722 bodies 1,932 and 4,079 ms before, 1,347 and 2,874 ms after (about 30 % less); this repository's reference, 51 bodies, 145 and 165 ms before, 104 and 83 ms after. In the page (`stall.cjs`, one load each):

| Picture | Before | After |
| --- | --- | --- |
| The T3 sample pinned on `agentSessions.ts` | all packing in the render's one task: 1,883 ms; first frame at 5.9 s | the render's partition 78 ms; packing in 60 parts over the frames, 1,860 ms in all, the longest part 94 ms (one large bubble: a part packs at least one); first frame at 6.7 s |
| This repository's reference | 159 ms in the render's one task; first frame at 1.1 s | the render 3 ms; packing in 5 parts, 104 ms in all, the longest 26 ms; first frame at 0.9 s |

The longest tasks the browser saw on the T3 picture are its frames, drawn by the software renderer: 2.8 to 3.6 s before, 1.8 to 1.9 s after, the budget of section 4 drawing fewer spheres. What the bound does not bound: one bubble is one step, so a directory of many hundreds of files in one folder packs in one part (the T3 sample's widest, 220 units, about 30 ms; a thousand units about half a second headlessly).

## 3. A shell's weight and the rest

A sphere may now have a mass: the motion moves it by its force over its mass, and the field's stiffness reading, which sets how many substeps a tick takes, counts each sphere's stiffness per unit of its mass. The forces are unchanged, so the picture still rests where they balance; with no masses, or all of one, the motion is the one it was to the last digit.

**Tried as asked, then changed.** Weighed in proportion to the files it holds, a shell made the picture rest later, not sooner: the per-tick substeps fell, but a shell of a hundred files under the drag, which takes the same share of every sphere's speed each tick, crept toward its place a hundred times slower and the ticks to rest more than doubled. The headless twin of this repository's reference picture (evaluations of the field to rest, and ticks):

| A shell weighs | Second round's birth | Third round's birth |
| --- | --- | --- |
| nothing extra (one) | 599 (280 ticks) | 570 (272) |
| the files it holds | 746 (660) | 650 (553) |
| their square root | 412 (318) | 390 (289) |
| **their cube root**, as a ball of them is wide | 381 (286) | **351 (254)** |
| Group Wrappers Off | 392 (305) | 392 (305) |

The estate's picture moved little under any rule (185 evaluations with no weight and with the cube root, 186 at the square root, 202 in proportion; 190 Off). The cube root is built (`shellMass`); a shell of 139 files weighs 5.2 files.

**In the page**, frames from navigation until the picture reports rest, one load each, before and after on the same data:

| Picture | Off | Skin before | Skin after | After against Off |
| --- | --- | --- | --- | --- |
| This repository pinned on `forceGraphView.ts` (also the subject), two hops, Shell Depth 2 | 331 · 29.1 s | 482 · 121.3 s | **354 · 89.4 s** | 1.07 (before: 1.46) |
| The estate pinned on `PaymentService.cs`, Shell Depth 2 | 187 · 5.1 s | 194 · 6.1 s | 194 · 5.8 s | 1.04 |
| The archipelago (no pin) | 50 · 3.1 s | 61 · 16.5 s | 61 · 15.0 s | 1.22 |

The second round's 958 frames on the reference were the previous day's data and machine; on today's bundle at `91e39276` the reference rested in 482, 1.46 times Off, within the one and a half by a hair before this round. The seconds are this machine's software renderer and were taken while other work shared it; the frames are the measure.

**Pictures that should not change did not, byte for byte**: the Off pictures of all three ([reference](repo-off.png), [estate](estate-off.png), [archipelago](islands-off.png)), and the archipelago's Skin ([picture](islands-skin.png)), which has no shells and so neither weighs nor is born differently. The reference's and the estate's Skin pictures changed, as their shells are born elsewhere and weigh: [reference before](repo-skin-before.png) and [after](repo-skin-after.png), [estate before](estate-skin-before.png) and [after](estate-skin-after.png). The numbers are in [`rest.json`](rest.json).

## 4. A budget for the whole picture

`DRAWN_FILES` (1,024) bounded the files drawn within one body's skin, not a picture of many bodies. The same bound now holds for the whole picture (`pictureVeils`): while the files drawn within all the skins pass it, the smallest body still drawn, by the files it holds, is veiled, its skin showing one milky bubble with nothing drawn inside (`veiledUnits`, as a body too large for its own budget is drawn); every label keeps its true count, and the shapes and pops are unchanged, the veil being only what is drawn.

**What the T3 sample draws under it**: its pinned picture holds 21,854 files in 722 bodies (43 shells and 679 islands), whose skins drew 8,175 files and 8,916 units in all. Under the budget the largest shell, `alchemy-effect` (13,095 files), keeps the 1,024 files and 288 bubbles its own budget opens, and the other 721 bodies are veiled: 1,024 files and 2,033 units in all. This repository's pictures (690 files drawn on the reference, 755 on the rosetta picture), the estate's (10) and the archipelago's (851) are within the budget and unchanged.

The page drew exactly that ([the record](t3-after.json)): 1,024 files within skins, all inside `alchemy-effect` with its 288 bubbles and its own 31 veiled ones, and one veiled bubble in each of the 721 other bodies; [the picture](t3-after.png). Its frames drew in 1.8 to 1.9 s against 2.8 to 3.6 s before.

**A doubt, for the owner's eye.** Smallest first, as asked, gives the whole budget to the largest body, which on the T3 sample is far from the pin, and veils the shells nearest it (`apps/web`, `apps/server`, `packages/contracts`). A budget given nearest the pin first, or a share to each body, would keep the pin's neighbourhood open instead; neither is built.

_The root's decision at the review (2026-11-07): the order is changed before the commit to nearest the pin first (by the nearest hop of a shown file a body's wires join), and among bodies as far the largest veiled first, so that the budget goes to the pin's neighbourhood; the figures and the picture of this section are the builder's order's, and the T3 sample was not re-measured under the root's, since its copy was deleted with the round's scratch. This repository's, the estate's and the archipelago's pictures are within the budget under either order._

## 5 and 6. The popped directories' names, and pops in the frame

**The names.** A popped directory's name stood at the centroid of what it released with no radius, so that it landed on the bubble the pop released, whose own name stood just beside it, and the names of directories popped one inside another piled at nearly one place. It now stands beside the skin the directory had, as a file's name beside its sphere: that skin's radius about the centroid of what it released (`poppedSkins`), counting only what the pops released, the hidden files they show and the shells beneath it, never a file the picture showed anyway; it keeps nothing clear of it (`clear: 0` in the placement), since the names of what it released stand within it. A first try took the extent of everything under the directory as the radius, and since the pinned file and its neighbours live under `explorer/src/client/views`, the names were flung to the frame's edges; that is why only what was released counts. The placement's unit test lays three nested names apart at their skins' sizes and checks that the released bubbles' names may still stand within them.

**The pictures.** `look.cjs` now pans the camera before each pop, by right-drags from an empty corner, until the shell stands within forty pixels of the frame's middle (two drags or none, every pop), so that the pop's pictures show it whole. This repository's reference, `explorer/src` ⊃ `client` ⊃ `views` popped level by level, before and after:

| | Before | After |
| --- | --- | --- |
| The frame before the first pop, `explorer/src` in the middle | [before](pops-before-pop-1-before.png) | [after](pops-after-pop-1-before.png) |
| The frame of the first pop: `src`'s name on the released `client` bubble, then beside the skin it had, still just above `client · 79`'s name, since `src` released little else | [before](pops-before-pop-1-pop.png) | [after](pops-after-pop-1-pop.png) |
| At rest after the second pop: `src` and `client` | [before](pops-before-pop-2-rest.png), 21 px apart, stacked | [after](pops-after-pop-2-rest.png), 181 px apart |
| At rest after the third pop: `src`, `client` and `views` | [before](pops-before-pop-3-rest.png), the nearest two 21 px apart | [after](pops-after-pop-3-rest.png), 99 px apart |

The frames of the second and third pops are kept too (`pops-*-pop-2-pop.png`, `pops-*-pop-3-pop.png`). Every pop, before and after, left every released unit inside the skin at the place it was shown and every released bubble at its size (`allInside`, `sizeKept`); the records are in [`pops.json`](pops.json).

## 7. Every force-graph spec, before and after

All ten `force-graph-*.spec.ts` files, 54 tests, run whole with one worker on each bundle served on its own port:

| Bundle | Passed | Failed |
| --- | --- | --- |
| Before, `91e39276` | 52 | 2: `force-graph-focus.spec.ts:70` (the test's 30 s budget ran out at 33.3 s) and `force-graph-update.spec.ts:128` (this repository's whole picture not at rest within the 150 s the test allows, 2.7 min) |
| After | 53 | 1: `force-graph-update.spec.ts:128`, the same wait for the same whole picture, 2.6 min |

Both are pictures with Group Wrappers Off, which this round leaves byte for byte as they were (section 3), and both are time budgets on a slow machine: the focus test ran 33.3 s before and passed in 28.3 s after, against a 30 s budget; the update test failed the same way on both bundles, 2.7 and 2.6 min.

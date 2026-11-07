# Directory shells as stand-ins for what they hold (3D Local Map)

_Status: implementation evidence of 2026-11-06, not yet the owner's judgement. A builder made the 3D directory shells (Group Wrappers, still Off by default) true stand-ins for the files beneath them, on commit `a5a7047e`, and took these pictures in a private headless Chromium with software rendering at 1440 × 960, from bundles built in its worktree: "before" from `a5a7047e` itself; a first build of the change with the Live Docs of `a5a7047e`, so that the pictures with Group Wrappers Off could be compared byte for byte; and the final build, with the Live Docs regenerated and the shells' softness at a sixth, which took every picture here but the "before" ones. Group Wrappers and the Shell Depth were saved Tuning choices, the layout's background search off. The probes that took them are in [the probe folder](../../../Probes/2026-11-06/shell-mesh/README.md)._

The owner, trying the shells of November 5: "Aside from the lack of rings, I barely see the difference between having it on and off. I have to look into the dimmed background to see those membranes. The implementation, to me, looks like a bit of a copout: a replacement for the ring around a single node rather than a computed mesh which is a stand-in for many many many nodes underneath it. It's a start but there is a vast difference between the skinned mesh and what emerges from it on click." ([Turn 3 of the November 6 record](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-3))

## What changed

- **True size.** A shell's body is its files' own spheres, each in a wrapper's padding (one and a half times a symbol-less file's radius), at the density of spheres pulled apart inside a ball, three fifths. `engine/src`, 139 files, was a body of radius 20.7 with a skin drawn scaled down to it, while its pop released files at a packing of radius 51.8; it is now a body of radius 73.9, its skin drawn at that size (75.2, the facets of the hull over its largest balloon standing a little out), and its pop releases what it holds inside it. `explorer/src`, 75 files: 16.9 to 58.0. The estate's `Portal`, 10 files: 8.6 to 31.9. A subdirectory's balloon is its own shell's size by the same rule, so that a balloon popped out of a balloon is as large as it was drawn.
- **Visible contents.** Under Skin, the skin shows within it its own files as spheres in their kinds' colours, at the size a sphere draws, and each subdirectory as a smaller balloon in the skin's own look, at the places a pop leaves them, pulled apart inside the body. At most 64 units a shell are shown, the balloons first, the largest first, then its own files; the label keeps the true count. **The clouds stay opaque to what they hold**: they were favoured for reducing what the eye has to read, so they veil it. A shell whose lumpy skin is not yet built (a few a frame) stands as one plain balloon of its body, so that a shell born of a pop is seen in the frame of the pop.
- **Foreground.** A shell is never dimmed as a hop beyond: its skin is drawn at full opacity and its name as a file's is, unless a hover or a path has the attention. So are the files a pop releases, since they are what a pop asked to see and were drawn bright inside the skin.
- **Continuity.** At the pop, the released files and shells enter the picture in one frame where the skin showed them, rather than at the reveal's pace over sixty frames, and the skin bursts around them (a tenth larger, fading over a quarter second; at once under reduced motion).
- **Physics.** A shell's contacts are soft, pushing a sixth as hard as two files', and a shell is born outside the placed mass on the side of the files it is wired to. Why, below.

What did not change: the partition by directory, the bundled wires and their counts, the legend, the island wrappers (their room is still their files' volume and a padding, now named `filesRadius`), and the rule that a shown file whose hidden neighbours are all held by shells wears no ring. With that rule, this repository's pinned picture with shells has no ring at all, since every hidden neighbour is held, and the key drops its Ring row; the estate at Shell Depth 1 keeps one ringed file, whose lone hidden neighbour no shell holds.

## Pictures

| Picture | Off | Skin | Cloud | Skin before this change |
| --- | --- | --- | --- | --- |
| This repository pinned on `forceGraphView.ts`, also the subject, two hops, Shell Depth 2 (the links of the November 5 record the review of November 6 loaded) | [Off](repo-off.png) | [Skin](repo-skin.png) | [Cloud](repo-cloud.png) | [before](repo-skin-before.png) |
| The estate pinned on `PaymentService.cs`, Shell Depth 2 (the shells spec's picture) | [Off](estate-off.png) | [Skin](estate-skin.png) | [Cloud](estate-cloud.png) | [before](estate-skin-before.png) |
| The estate at Shell Depth 1 (the spec's pop) | | [Skin](estate-depth-1-skin.png) | | [before](estate-depth-1-skin-before.png) |

The pops, each as three frames, the page's clock paused at the pop and stepped one frame for the second:

- This repository, the largest shell, `engine/src` (139 files: four subdirectory balloons, no file of its own): [before](repo-pop-1-before.png), [the frame of the pop](repo-pop-1-pop.png), [at rest](repo-pop-1-rest.png). One level down, the largest balloon it released, `engine/src/live-docs` (119 files, 36 units: files and balloons): [before](repo-pop-2-before.png), [the frame of the pop](repo-pop-2-pop.png), [at rest](repo-pop-2-rest.png).
- The estate at Shell Depth 1, `Portal` (10 files: five of its own and two balloons): [before](estate-pop-1-before.png), [the frame of the pop](estate-pop-1-pop.png), [at rest](estate-pop-1-rest.png). One level down, `Portal/Pages` (3 files): [before](estate-pop-2-before.png), [the frame of the pop](estate-pop-2-pop.png), [at rest](estate-pop-2-rest.png).

## Rest time

Frames drawn until the picture reports rest, and the page's seconds from navigation ([every load](rest.jsonl)), the looks taken in turn. Frame counts repeated exactly from load to load of one bundle; seconds varied with the machine's load, which other builders' browsers and test runs shared. The target was rest within one and a half times the picture without shells.

The final build, as handed back:

| Picture | Off | Skin | Cloud | Skin against Off, frames · seconds |
| --- | --- | --- | --- | --- |
| Repository, pinned, depth 2 | 328 · 24.8 s, 27.0 s, 27.5 s | 408 · 41.9 s, 46.0 s, 49.2 s | 408 · 32.2 s | 1.24 · 1.69 to 1.79 (Cloud, the same motion: 1.30) |
| Estate, pinned, depth 2 | 187 · 5.3 s | 194 · 5.5 s | 194 · 5.1 s | 1.04 · 1.05 |
| Estate, pinned, depth 1 | 187 · 4.1 s | 188 · 5.0 s | | 1.01 · 1.20 |

**On this repository's picture the target is met in frames and missed in seconds.** The motion is within budget, 1.24 times the frames, but a frame with the shells takes longer to draw in the software renderer: about 113 ms against 83 ms with Off, the seconds from navigation over the frames. The Cloud, the same motion with nothing drawn within the skins, rested in 1.30 times Off's seconds, so most of the difference is likely the Skin's contents, translucent balloons and spheres layered inside large translucent skins, which a software renderer fills pixel by pixel. On the first build, with the Live Docs of `a5a7047e`, the second loads stood at 1.08; why the regenerated picture costs more a frame was not found. A GPU was not measured. Ways to recover it, not built: draw the contents only at rest or only for shells near enough to read, draw the balloons with fewer facets, and build a shell's packing without allocating each frame.

Against `a5a7047e`, with its Live Docs (two loads of each; the first build of the change, softness a third):

| Picture | Off | Skin before | Skin, first build | Cloud, first build |
| --- | --- | --- | --- | --- |
| Repository, pinned, depth 2 | 425 · 30.3 s, 36.7 s | 308 · 24.9 s, 24.9 s | 332 · 59.1 s (beside the unit tests), 33.6 s | 332 · 29.0 s, 25.7 s |
| Estate, pinned, depth 2 | 187 · 4.1 s, 4.2 s | 217 · 4.8 s, 4.6 s | 194 · 4.6 s, 5.3 s | 194 · 4.6 s, 4.4 s |
| Estate, pinned, depth 1 | 187 · 4.0 s, 4.0 s | 377 · 7.5 s, 7.4 s | 188 · 4.9 s, 5.9 s | |

With Group Wrappers Off the first build took the same 425 and 187 frames as `a5a7047e`, and drew the same pictures: this repository's Off picture is byte for byte the one of `a5a7047e`, and so is the estate's at depth 1, while the estate's at depth 2 differs in 33 of its 1,382,400 pixels by at most 3 of 255 in a channel, which no eye can see. The regenerated Live Docs give this repository's picture three more files (255 spheres against 252), which is why its Off differs between the tables.

The frame counts can depend on the machine, since a tick that does not fit the frame's budget is taken in parts across frames. The headless twin of the page (`twin.cjs`) counts the evaluations of the field to rest, at most one a frame on the page, which cannot; it is a relative instrument, its counts not the page's frames one for one:

| Picture | Off | Skin before | Trial size, firm | Trial size, soft (a third) | Trial size, soft, born outside | True size, a third | True size, a sixth (final) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Repository, Live Docs of `a5a7047e` | 326 | 377 | 560 | 383 | 359 | 390 | 355 |
| Repository, Live Docs regenerated | 314 | | | | | 650 | 430 |
| Estate, depth 2 | 190 | 232 | not run | 232 | 189 | 185 | 185 |
| Estate, depth 1 | 190 | 315 | not run | 315 | 223 | 224 | 224 |

The trial size was the packing of symbol-less files in their padding, 51.8 for `engine/src`, the size its pop released files at before this change.

### Why true size had cost so much, and what the physics suggested

The earlier builder recorded 924 frames against 334 when the bodies were two and a half times larger. The twin found the cause at rest, not in the shoving: the picture took as many ticks at the trial size as before (248 against 250), but half again as many evaluations per tick, about two from the fiftieth tick on. At the trial size, one file wired to `engine/src` by 61 references rested 0.48 of a unit inside the collision's clearance, pressed there by the mass behind it. A contact adds twice the collision's stiffness, six, to a sphere's stiffness; `engine/src`'s springs came to 2.18, so its stiffness was 8.18, just past the eight below which a tick is one step (the motion keeps h² × stiffness under two). Every tick of the picture's settle was split in two for that one light contact. Two changes, each tried on the twin before it was kept:

- **Soft shells.** A shell pushes back on a sphere in its clearance by a share of what two files do (a balloon gives). At the trial size: 562 evaluations at full stiffness, 383 at a third, 365 at a tenth; with the birth change below, 557, 376 at a half and 359 at a third. A third was kept first, the file sinking 1.6 of the clearance's five units. Then the regenerated Live Docs put three files against `engine/src` at rest, and at a third its stiffness passed eight again: 650 evaluations against 314. At a sixth a contact adds one, so that a shell wired like `engine/src` may rest against six: 430 against 314 (a quarter: 439; an eighth: 434; a twelfth: 449), and 355 on the earlier Live Docs. The cost, in the twin: the hub `graph.ts`, pressed between `engine/src` and the mass, rests 6.1 units inside their clearance, through the five-unit gap and a unit into the skin.
- **Born outside.** A shell is born outside the placed mass, toward the centroid of the files it is wired to, just clear of the farthest sphere that way, instead of beside them in a seeded direction. It barely mattered on this repository (359 against 383 evaluations) and mattered most on the small estate at depth 1, 315 to 223, where a shell born inside the mass had to work its way out.

The cliff at a stiffness of eight remains: a shell wired like `engine/src` resting against seven spheres would split the ticks again. Giving a shell weight in proportion to what it holds, so that its contacts' stiffness counts per unit of its mass, would remove the cliff rather than move it; the motion has no masses today, and that is not built.

## The pop: continuity and how far things moved

At the frame of the pop, every unit the skin showed stood inside the skin's volume at the place it was shown, in all four pops: the largest distance from the shown place at the first frame was 0. (The browser spec allows the frame's one tick, less than a file's padding: in one of its runs a balloon stood 0.7 of a unit past the skin at the first frame, its tick having parted it from its overlapping sibling.) After the picture rested again ([the repository's](repo-pops.json) and [the estate's](estate-pops.json) records, unit by unit):

| Pop | Files | Skin radius | Units shown | Inside at the pop | Moved by rest, median (× skin radius) · largest | The picture's other spheres, median · largest | Rest after the pop |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `engine/src` | 139 | 75.2 | 4 balloons | all | 138.6 (1.84) · 162.0 | 12.4 · 175.9 | 19.6 s, 191 frames |
| `engine/src/live-docs`, out of it | 119 | 70.2 | 36 | all | 224.3 (3.20) · 339.2 | 56.3 · 212.9 | 45.5 s, 386 frames |
| `Portal`, estate depth 1 | 10 | 31.9 | 5 files, 2 balloons | all | 60.1 (1.89) · 84.8 | 29.4 · 41.7 | 11.8 s, 509 frames |
| `Portal/Pages`, out of it | 3 | 21.6 | 3 files | all | 44.7 (2.07) · 58.0 | 21.5 · 34.9 | 2.9 s, 131 frames |

(The pop of `Portal` with the shells of November 5 took 14.9 s to rest.) What drives the movement after the pop: each released unit is now a body with wires of its own. The shell stood where all its units' wires balanced, and once apart each unit goes where its own wires pull it, which is mostly away from where the shell stood: `engine/src`'s three smaller balloons moved 91, 139 and 162 units, its `live-docs` balloon, wired much as `engine/src` was, 32. The packing inside the skin knows nothing of those wires: units are placed by a hash, pulled apart, not by where their references lead. Released files also repel one another and part from the padding they were packed in, and the rest of the picture settles around the newcomers (the third column).

## What I still do not like

- **The units migrate far after a pop**, two to three skin radii, so that "leaves standing what was seen inside" holds at the frame of the pop and not for long after. The next step I would try is a packing that places each unit on the side of the skin facing its own wires, and turns the shell's body with them as the picture moves; it is not built.
- **Balloons that are all a directory holds overlap.** A subdirectory's balloon has its own shell's size and a parent's volume is its children's, so `explorer/src` (75 files, 71 of them in `client`) is a skin around a balloon nearly its own size, and `engine/src`'s `live-docs` nearly fills it; the pop parts them. Giving each level room for its children would make the large shells half again as large or more.
- **More bright labels.** Every shell is named as a file is, and a pop adds its subdirectories' names: [the repository's picture at its second pop](repo-pop-2-pop.png) names six shells and two popped directories over the core.
- **The clouds, larger now, veil more of the picture**, and show nothing within them.
- **Seconds to rest on this repository's picture are 1.7 to 1.8 times Off's** in the software renderer, though its frames are 1.24 times: the contents cost drawing time (above). Seconds are also noisy on this machine; the frames and the twin's evaluations are the steadier measures. The T3 sample was not measured: pulling up to 64 units apart costs a body up to about 20 ms to build in Node (this repository's `tests/e2e`, 45 units, with its hull), more than the 8 ms a frame spends building hulls, one body a frame at least.

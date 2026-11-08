# The bag of cells in Structure (3D Local Map)

_Status: implementation evidence of 2026-11-07 and 8, for review, not a verdict. A builder built, on its worktree reset to `476ea2c8`, the Structure layout's bubbles the owner asked for in [Turn 8 of the November 6 record](../../../ChatHistory/2026/11/2026-11-06.1.record.md#turn-8) ("can we also get the bag-of-cells look for the "structure" part too?"), with the owner's later rule of the same day, "Make no embryos which appear to have only one cell". Group Wrappers stays Off by default and the hops at two (the change of defaults the owner asked for afterwards is not part of these pictures). The pictures were taken in a private headless Chromium with software rendering at 1440 × 960, the wrappers and hops chosen as saved Tuning choices and the background search off, one load each, on a machine shared with other builders' browser runs (one at a time, by a lock). The instruments are in [the probe folder](../../../Probes/2026-11-07/structure-cells/README.md)._

## What was built

With Group Wrappers Skin or Cloud, in the Structure layout, every directory hub the picture shows none of whose children it shows is drawn as a bubble of everything under that directory, built from the leaves as a shell's body is: its own files as spheres in their kinds' colours, each subdirectory a bubble within, the hub's own node keeping the body's size in the field and its containment wire to its parent. It is named as a shell is (`tests · 487`), never dimmed, and wears no ring. A click on it is the directory's Open, the opened set the 2D Local Map and the address share; its hub then stands with spokes to its own files and its subdirectories' bubbles, each born where the skin showed it. Close wraps it again. An opened directory is asked about as its hub alone, so that the hops keep their meaning and the root's start stays beside it. A hub at the frontier with one file under it is no bubble: that file stands in the hub's place on its wire, named by the hub's chain and its own name (this repository's `.vscode/settings.json` at one hop; seven of the estate's at two).

## The pictures

| Picture | Off | Skin |
| --- | --- | --- |
| This repository's Structure start, nothing pinned, two hops (the saved default): with Skin the top level stands as hubs and the next level as twelve bubbles | [off](repo-start-off.png) | [skin](repo-start-skin.png) |
| The same at one hop, the owner's setting: the root's ten files and five bubbles, `.vscode` its one file | [off](repo-start-1hop-off.png) | [skin](repo-start-1hop-skin.png) |
| `packages` opened (two hops): Off shows the whole subtree, Skin its hub, its children's hubs and the bubbles beyond | [off](repo-packages-off.png) | [skin](repo-packages-skin.png) |
| `packages` and `packages/explorer` opened | [off](repo-explorer-off.png) | [skin](repo-explorer-skin.png) |
| The estate's start, two hops | [off](estate-start-off.png) | [skin](estate-start-skin.png) |
| The estate's start, one hop: six bubbles round the root | [off](estate-start-1hop-off.png) | [skin](estate-start-1hop-skin.png) |

**Off is byte for byte the picture it was.** The four Off pictures of the brief (the start, `packages` opened, `packages/explorer` opened too, the estate's start) were taken on the bundle built at `476ea2c8` and again on this round's bundle, the same data, and compared with `cmp`: identical, all four. The before pictures are therefore not kept twice.

**The pops**, at one hop, each as three frames, the camera panned by right-drags so that the bubble stands in the middle, the page's clock paused at the click and stepped one frame for the frame of the pop ([the record](pops.json)):

| | Before | The frame of the pop | At rest |
| --- | --- | --- | --- |
| `packages` (368 files): its four bubbles released, each born where it was shown (0 units off), inside the skin, at its size | [before](pops-1-before.png) | [pop](pops-1-pop.png) | [rest](pops-1-rest.png), 237 frames, 110 s after the click |
| `packages/explorer` (209 files): its two files and the `src` bubble, the farthest 3.0 units from where it was shown after the frame's one tick | [before](pops-2-before.png) | [pop](pops-2-pop.png) | [rest](pops-2-rest.png), 518 frames, 255 s after the click |

After each pop the address carried the opened set (`packages`, then `packages` and `packages/explorer`) and nothing was pinned.

## The numbers

**Frames and seconds to rest**, one load each ([the record](rest.json)); the shells' budget is one and a half times the frames of the picture without them:

| Picture | Off | Skin | Skin against Off |
| --- | --- | --- | --- |
| This repository's start, two hops | 236 · 7.6 s | 240 · 86.1 s | 1.02 |
| With `packages` opened | 1,249 · 159.6 s (the whole subtree, 378 files) | 282 · 102.9 s | 0.23 |
| With `packages/explorer` opened too | 1,249 · 161.5 s | 256 · 86.9 s | 0.20 |
| The estate's start, two hops | 197 · 6.4 s | 207 · 7.1 s | 1.05 |
| This repository's start, one hop | 123 · 3.9 s | 549 · 221.5 s | **4.46** |
| The estate's start, one hop | 40 · 1.8 s | 61 · 3.1 s | 1.53 |

Where it lands and why: at two hops the bubbles are many and middling (the largest `tests/integration`, 423 files) and the picture rests in the frames it took Off; opened, Skin rests far sooner than Off because Off's Open shows the whole subtree as 378 spheres, which Skin holds in bubbles. At one hop this repository's start is **out of the budget**: two bubbles of hundreds of files, `tests` (487 files, 545 units in radius) and `packages` (368, 327), hang on short spokes from one small hub, so that they must stand nearly opposite one another, and their soft contacts and the springs settle slowly. That is the picture the owner sees at one hop and the one a change of default to one hop would show first; it is not fixed in this round. The seconds are the software renderer's: some 930 files drawn within skins make a frame cost a third of a second to more than half a second here (the longest tasks the browser saw, 500 to 800 ms, are frames), against some 30 ms for Off.

**The packing's cost.** Headlessly (`pack.cjs`, processor time, the least of three): this repository's start at one hop packs five bubbles in 91 ms (`packages` 49 ms, `tests` 32 ms), at two hops twelve in 79 ms; **the whole repository packed from the leaves as the root's one bubble, 945 files, in 71 ms**, 877.5 units in radius, 197 bubbles within it, nothing veiled. The estate's start 5 ms, its whole 9 ms. In the page the packing is spread over frames as the third round built it: four or five parts, 87 to 104 ms in all, the longest part 26 to 33 ms, so that the thread is never held by the packing longer than a frame of drawing holds it.

**The drawing budget** (1,024 files within skins, the picture-wide veil): it veils nothing in these pictures. The start draws 926 files at two hops and 934 at one, with 180 and 192 inner bubbles; after the pop of `packages`, 934 in eight bubbles; after `packages/explorer`, 932. Every bubble's label keeps its true count.

**No bubble of one cell.** `onecell.cjs` counted what every skin and every inner bubble shows within it, a wrapped group's seed counted, on the Connections layout's pictures the root named (this repository pinned on `forceGraphView.ts` and the estate pinned on its payment service, one and two hops, Shell Depth 2 and 4, and the archipelago) and on the Structure starts (this repository at one and two hops, the estate at one): none shows a single cell, none is empty. In the Connections layout the root's candidates do not occur: a two-file island draws its seed's sphere inside its skin beside its other file, a bubble whose only unit would be a bubble collapses into it as a chain does, and a shell needs two hidden files. The one case found was the Structure layout's own, a frontier hub of one file (`.vscode`, before the rule), now that file.

## The spokes from the packing (milestone 2, November 8)

**What was wrong.** At one hop the start rested in 549 frames against Off's 123 and its two largest bubbles stood through each other ([before](repo-start-1hop-skin.png)): a spoke's rest length was the two ends' radii and the link gap, so `tests` (545 units in radius) and `packages` (327) hung from the root's small hub on spokes far shorter than themselves, and the springs and the contacts fought, the root's files pressed between.

**What was built.** Each hub shown with children shown is packed with its children about it, the hub the fixed centre (`structureSpokes`, by `packBall`); a child is as large as it stands (a file its sphere, a bubble its body, an open subdirectory's hub the ball of its own children, packed first). Each child's distance from its hub there is its spoke's rest length (`rest` on the link, which `spatialLinkDistance` and so the spring keep), and its place about its hub is where it is born (`placeNewSpheres`, `spokeOf`). Off computes none of it.

**Two tries before it, both rejected on evidence.**
- *Every bubble with its own hub at its centre*, so that one packing would serve the skins, the spokes and a pop alike, as the root proposed. A ball centred on a small hub must be twice as wide as its largest child, and nested so the bubbles grew level by level: headlessly, `tests` 545 → 5,748 units, `packages` 327 → 2,239, the whole repository 877 → 11,512. The page rested in 22 frames, the camera framing skins ten times too large. The skins therefore keep their packing free of their hubs, and a pop's children move from where the skin showed them to where their spokes rest.
- *The spokes packed with the collision's gap* (5 units, as a skin packs its files): one hop rested in 159 frames against 123 (1.29), but two hops did not rest within ten minutes in the page; the headless twin (`twin.cjs`) gave 824 ticks against Off's 326 at two hops. A hub's many files packed as tight as a skin's were pressed together against the repulsion between them. **With the tuning's link gap** (60 units, the gap a spoke keeps when Off) the twin gave 328 against 326 at two hops and 147 against 162 at one; that is what is built.

**Frames and seconds to rest**, one load each under the lock, the machine shared and slow (the seconds are not comparable between rows):

| Picture | Off | Skin, milestone 1 | Skin, spokes from the packing | Against Off |
| --- | --- | --- | --- | --- |
| This repository's start, one hop | 123 | 549 | **131** · 67.7 s | **1.07** |
| This repository's start, two hops | 236 | 240 | **414** · 194.6 s | **1.75, out of the budget** |
| The estate's start, one hop | 40 | 61 | **31** · 3.1 s | 0.78 |
| After the pop of `packages` (one hop), frames from the click to rest | | 237 | 342 · 166.9 s | |
| After the pop of `packages/explorer` | | 518 | 625 · 287.9 s | |

Pictures: [the one-hop start](repo-start-1hop-skin-spokes.png), `tests` above, `packages` below, the root between, nothing through anything; [the two-hop start](repo-start-skin-spokes.png); [the estate at one hop](estate-start-1hop-skin-spokes.png); the pops, each before, at its frame and at rest: [`packages` before](pops-spokes-1-before.png), [pop](pops-spokes-1-pop.png), [rest](pops-spokes-1-rest.png); [`packages/explorer` before](pops-spokes-2-before.png), [pop](pops-spokes-2-pop.png), [rest](pops-spokes-2-rest.png). Every unit a pop released stood at its frame where the skin showed it (0 units off), inside the skin, at its size ([the record](pops-spokes.json); the rests in [rest-spokes.json](rest-spokes.json)).

**Where it lands, and why.** The one-hop start, the owner's setting, is within the budget; the estate too. Two hops is not: 414 frames against 236, where milestone 1 rested in 240. The twin, which bears every sphere at once, does not reproduce it (328 against 326), so the page's difference is in how the picture enters: at two hops the second hop enters a piece a frame over the reveal, each piece born at its hub's packing while the hubs still move, and the files around a top-level hub stand in a ball about it, some a second layer out on longer spokes, where Off stands them all at one distance. That is an account, not a measurement of the cause. The pops rest later than in milestone 1 (342 and 625 frames against 237 and 518): their children are released where the skin showed them, packed with the collision's gap, and travel to spokes packed with the link gap. Off is byte for byte the picture it was ([below](#off-is-byte-for-byte-unchanged-milestone-2)).

### The simpler rule, and what moves at two hops (after the review of milestone 2)

**The simpler rule is milestone 1.** A spoke's rest length as the sum of its two ends' radii and the link gap, local to the link, with the births as they were, is what `spatialLinkDistance` already gave the bag of cells before the packing: a bubble's radius in it is its body's. Its page numbers are milestone 1's (one hop 549 frames against Off's 123, 4.46; two hops 240 against 236, 1.02; the pops 237 and 518), on the same code, with the pictures above. In the headless twin (`twin.cjs`, ticks to rest):

| Spokes | One hop | Two hops | Two hops, no gravity |
| --- | --- | --- | --- |
| Off | 162 | 326 | 304 |
| The sum of the radii and the link gap (milestone 1) | 228 | 351 | 430 |
| Packed per hub with the collision's gap | 163 | 824 | |
| Packed per hub with the link gap (built) | 147 | 328 | 263 |

So neither rule is in the budget at both hops in the page: the simpler one fails at one hop (4.46), the packing at two (1.75). The twin, which bears every sphere at once and has no reveal, does not reproduce either failure.

**What moves at two hops** (`entry.cjs`, every drawn frame read from the page's node buffer): all 38 spheres are in by frame 22, Skin and Off alike, and nothing moves during the entry. Off then unfolds (a mean of 186 units of travel a frame over frames 25 to 49) and has calmed by frame 200, at rest at 236. Skin unfolds as much (127 a frame over frames 25 to 49) but keeps a long tail, 20 to 34 units a frame from frame 100 to 225, at rest at 414. What travels is the `tests` subtree as a whole: `tests/integration` 908 units after the entry, `tests/tsconfig.json` 846, the `tests` hub 780, `tests/e2e` 720; then `packages/engine` 390 and `packages` 360. Off's farthest travellers go 250 to 320 units. The tail is the slow drift of the heaviest bubble (`tests/integration`, 423 files, weighing their cube root, 7.5 files) and its subtree, hung from the root on one long spoke; the third round saw a heavy shell creep under the same drag. Why the subtree ends so far from where the packing bore it is not measured; gravity is part of it in the twin (328 ticks with it, 263 without) but not the whole of the page's difference. Not changed in this round.

### Gravity spared the hanging bodies: tried and taken out (milestone 4)

The experiment the two-hop measurement suggested: a body of the bag of cells that hangs from its hub by its containment spoke alone felt no gravity (a share of the gravity per sphere in the field, zero for such a body; every other sphere, and every sphere when Off, as before), since the spoke already holds it where its hub's packing put it. Measured once in the twin and once in the page under the lock:

| Picture | Off | Milestone 2 | Gravity spared | Against Off |
| --- | --- | --- | --- | --- |
| Twin, one hop (ticks) | 162 | 147 | 155 | |
| Twin, two hops (ticks) | 326 | 328 | 306 | |
| This repository's start, one hop (frames) | 123 | 131 | **229** | **1.86, out** |
| This repository's start, two hops | 236 | 414 | 323 | 1.37, in |
| The estate's start, one hop | 40 | 31 | 55 | 1.38 |
| After the pop of `packages` (one hop) | | 342 | 267 | |
| After the pop of `packages/explorer` | | 625 | 325 | |

It brought two hops into the budget and halved the second pop's rest, but cost one hop (229 against 131, out of the budget) and the estate, so by the rule set for it, it was taken out; the round stands at milestone 2's spokes, and the two-hop tail stays open. Pictures of it: [the two-hop start](repo-start-skin-gravity.png) and [the first pop at rest](pops-gravity-1-rest.png) ([the pops' record](pops-gravity.json); every unit released at its frame where the skin showed it, 0 units off). Without gravity holding them, the one-hop start's big bubbles were left to the repulsion and the collisions alone, which took longer to settle than gravity and the spokes together; that is an account, not a measurement.

### Off is byte for byte unchanged (milestone 2)

The base commit's page (`476ea2c8`'s three view sources, built over today's data) was served beside this round's page on the same server, and the six Off pictures of the brief taken on each: this repository's start at one and two hops, with `packages` opened and with `packages/explorer` opened too, and the estate's start at one and two hops. Compared with `cmp`: identical, all six (the rests in [rest-spokes.json](rest-spokes.json), the base page's under `/base/`).

## The history's playback

This repository's bundle carries no history unless the history command has written one, so a history of a step a day since October 25 was computed in the worktree (`npm run live-docs:history -- --step day --since 2026-10-25`, 14 changes, every one regenerated, about 70 s each, three at a time) and the bundle with it served as a sample folder. `history.cjs` opened the History in Structure with Skin at one hop (with nothing asked about, the History opens the scan root, which in the bag of cells is the start itself), waited for rest, and pressed Play at the default two steps a second ([the record](history.json), [the last step](history-end.png)).

- **Every step was shown, and the bubbles followed their files**: a step that created or deleted files re-packed the bubbles whose files changed, between 19 and 66 ms of packing a step, 479 ms over the playback; a bubble whose files did not change kept its shape (its body is cached by its files and their sizes). The picture never fell apart: the bubbles stand where they stood and grow or shrink in place.
- **Two of thirteen steps were never built** (steps 2 and 9): the next step arrived before their packing finished, and the picture went from step 1 to 3 and from 8 to 10. The cause is the third round's spreading: a frame packs at most 24 ms, and a frame of this picture takes 0.4 s to draw in the software renderer (some 930 files within skins), so that a re-pack of 45 ms spans two frames, 0.8 s, longer than the half second between steps.
- **Frames per step**: two (the median; one to three, and 17 for the last step, which stood until the reading ended); the longest tasks the browser saw were frames of 0.39 to 0.40 s, 41 tasks over 200 ms, none from packing.

Off's playback was not measured: with nothing asked about the History opens the whole repository, 945 spheres when Off, and that picture had not come to rest after ten minutes. The shape of the problem for the owner's wish of October 16 ("our "declared layout" (directory-oriented) 3D force graph will perform really nicely going snapshot by snapshot"): the bag of cells keeps the playback's picture small (eleven files, the root's hub and five bubbles at one hop, against 945 spheres), and what it costs is the drawing of the files within skins and a re-pack that can miss a step. Two remedies are named and not built: re-pack only the inner bubbles whose files changed (a step touches few directories, so most of a body's bubbles are unchanged), and let a playback pack a step's bodies within one frame rather than a part of one.

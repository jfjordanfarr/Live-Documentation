# Directory shells in the 3D Local Map: experiment 2 of the shrink-wrap work

Matched pictures and measurements of experiment 2, built on the owner's [correction of November 5](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-11) to [experiment 1](../group-wrappers/README.md): "The idea is to abstract a crapton of nodes into fewer ungulfing "nodes" (meshes that wrap those nodes)." The experiment sits behind the same Group Wrappers choice in Tuning → 3D Layout → Discovery, Off by default, with a new Shell Depth lever (1 to 6, default 2) beside it. A builder took these in a private headless Chromium (software rendering) at 1280 × 800, with the layout's background search off (`searchStarts: 0`), against bundles built from its own worktree. This is evidence for a judgement the owner has not yet made: no look and no rule is chosen.

## What a shell is

In a pinned picture, every file of the pinned group that the hops leave out is hidden. Hidden files are held by the shell of their directory cut to Shell Depth, named for the deepest directory that holds them all (`engine/src`, not `engine`). A directory with fewer than two hidden files makes no shell. Each shell is one body of the simulation. Its radius grows with the cube root of its file count, starting from the radius of a file with no symbols. Its wires bundle its members' references: one wire per pair of ends, carrying the count of references in both directions, and the hover names each direction. The skin is drawn over a deterministic phantom packing of the shell's files, scaled to the body: each subdirectory is packed as one ball, so the lumps of the skin are its subdirectories. Wrapped islands (experiment 1) now use the same packing instead of a hidden layout.

A click on a shell pops it, and so does Enter on its name or the strip's one button. The shell bursts, its own files enter at their packed places, and each subdirectory's hidden files become a shell of their own. The popped directory keeps a dimmed name where its files stand, and a click on that name wraps it again. The code is in [`forceGraphShells.ts`](../../../../packages/explorer/src/client/views/forceGraphShells.ts), and the design paragraph is in [the Explorer design](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md).

## Pictures

| Picture | Off | Skin | Cloud | Depth 1 | Depth 2 | Depth 3 |
| --- | --- | --- | --- | --- | --- | --- |
| This repository, pinned on `forceGraphView.ts` | [Off](repo-off.png) | [Skin](repo-skin.png) | [Cloud](repo-cloud.png) | [1](repo-depth-1.png) | [2](repo-depth-2.png) | [3](repo-depth-3.png) |
| The estate, pinned on `PaymentService.cs` | [Off](estate-off.png) | [Skin](estate-skin.png) | [Cloud](estate-cloud.png) | [1](estate-depth-1.png) | [2](estate-depth-2.png) | [3](estate-depth-3.png) |

Each row is one camera. The camera framed the Skin picture as it first unfolded; Cloud, Off and the depths came next, each after the picture came to rest again. The depth pictures are in Skin.

For each pop, the page's clock was paused at the click and then stepped, so the times are the page's own, counted from the first frame after the pop:

- The estate at depth 1, popping `Portal` (10 files): [pointer on the shell](estate-pop-hover.png), [0 ms](estate-pop-0ms.png), [100 ms](estate-pop-100ms.png), [250 ms](estate-pop-250ms.png), [500 ms](estate-pop-500ms.png), [settled](estate-pop-settled.png), [wrapped again](estate-wrapped-again.png). The pop shows five files and turns `Portal/Models` and `Portal/Pages` into shells.
- This repository at depth 2, popping `engine/src` (139 files): [pointer on the shell](repo-pop-hover.png), [0 ms](repo-pop-0ms.png), [100 ms](repo-pop-100ms.png), [250 ms](repo-pop-250ms.png), [500 ms](repo-pop-500ms.png), [settled](repo-pop-settled.png), [wrapped again](repo-wrapped-again.png). The pop shows no file and opens onto four subdirectory shells, because none of the hidden files sit directly in `src`.

The pointer stays on the shell through each pop, so the pop pictures show the hover's attention.

## Measurements

The figures come from the page's own instruments: the wrappers mesh's record, the drawn buffers, the frames counter, `aria-busy`, and the timeline's `live-docs:shells` (the partition and wires, once per change of what is shown) and `live-docs:wrapper-hulls` (each frame's hull building). Measurement files: [repository](repo-measurements.json) and [its pop](repo-pop-measurements.json); [estate](estate-measurements.json) and [its pop](estate-pop-measurements.json).

### First picture at rest, Off against Skin

Three loads of each picture. Frame counts were identical across runs; wall-clock times varied by up to a quarter on this loaded machine.

| Picture | Off: frames, median time | Skin: frames, median time | Ratio, frames · time | Shells (files) | Bundled wires | Hull triangles |
| --- | --- | --- | --- | --- | --- | --- |
| Repository archipelago | 50 · 1.75 s | 50 · 2.00 s | 1.00 · 1.14 | 0 (42 wrapped islands) | 0 | 6,582 |
| Repository pinned, depth 2 | 334 · 19.2 s | 334 · 24.7 s | 1.00 · 1.29 | 10 (328) | 134 | 8,400 |
| Estate archipelago | 42 · 1.10 s | 41 · 1.16 s | 0.98 · 1.05 | 0 (2 wrapped islands) | 0 | 416 |
| Estate pinned, depth 2 | 187 · 3.93 s | 217 · 4.43 s | 1.16 · 1.13 | 3 (7) | 4 | 404 |
| Estate pinned, depth 1 | 187 · 3.69 s | 377 · 6.93 s | 2.02 · 1.88 | 2 (12) | 5 | 378 |

A further pair of repository loads came to rest in 20.7 s and 22.6 s (ratio 1.09), at the same 334 frames. Two more repository pins, measured in frames: `tuning.ts` took 324 frames Off and 279 with Skin (0.86); `forceGraphLayout.ts` took 313 and 327 (1.04).

The extra wall-clock time on the repository comes per frame, not from more frames. Drawing cost little: the time inside `renderer.render`, including a GPU finish, came to 169 ms Off and 219 ms with Skin over a whole settle. That leaves the larger tick, which simulates 257 bodies on 692 springs where Off simulates 247 on 558.

The target was a first picture at rest within 1.2 times the Off time. Wall clock met it on both archipelagos and on the estate at depth 2. It missed on this repository's pinned picture (1.29; 1.09 on a second pair of loads) and badly on the estate at depth 1 (1.88).

The estate at depth 1 is the motion's sensitivity on a small picture. The headless twin, `easeSpatialLayout` with the page's motion, shows it: adding the two shells to the 19-file picture took 279 ticks to 421. Adding them with no wires at all took 394, and adding two plain file-sized spheres in their place took 479. Any two extra bodies on that picture slow it.

### Shell size against settling

Three radius rules were measured on the repository's pinned picture (334 frames Off). The radius of a file with no symbols times the cube root, plus 2.5 file radii of room for the skin: 475 frames. Its children were also larger together than the shell itself, and the estate's pop then took 16 s to fall still. 2.5 times the cube-root radius (the files with their padding): 924 frames. The cube-root radius alone, which the page now uses: 332 frames. Bigger bodies take longer to settle. The skin is drawn scaled down to fit the body.

### Main-thread stalls from shell building

| Picture | `live-docs:shells` (largest) | `live-docs:wrapper-hulls` (largest frame) |
| --- | --- | --- |
| Repository pinned | 8.4 ms | 13.0 ms |
| Repository archipelago | 3.4 ms | 8.9 ms (up to 17.2 ms in earlier runs) |
| Estate | ≤ 2.3 ms | ≤ 17.2 ms |
| T3 sample pinned on `packages/contracts/src/agentSessions.ts` | 63 to 107 ms | 35 ms |

Hulls are built a few per frame within 8 ms, with at least one hull per frame. The physics has each body's room before its hull arrives, so a late hull moves nothing.

The T3 sample shows 6,648 files and hides 19,398 in 43 shells, with 724 bundled wires and 722 wrapped islands (76,888 triangles). Its partition stalls past the 50 ms target. In Node the shells' part measured about 55 ms: the partition 15 to 25 ms, reading each of the 80,108 links' ends about 24 ms, and the rest the rings and the keys. This sits on top of the 120 to 140 ms the scope itself takes in that render, with or without shells.

The T3 sample came to rest within the time measured in neither look. Off was still moving after 92 s (118 frames, longest task 1.6 s); Skin was still moving after 93 s (106 frames, longest task 2.7 s).

At rest, an idle picture repaints nothing: zero frames over three seconds in every still and after each wrap.

### Pops

- Estate, `Portal` at depth 1: within 100 ms of the pop, 5 files and 2 shells entered and the burst was drawn. The burst was gone by 250 ms. The picture came to rest 14.9 s after the pop. Wrapping again came to rest in 2.3 s and restored the 2 shells and 19 spheres exactly. Before the files were born at the packing's own size (larger than the drawn skin), the pop took 19.3 s.
- Repository, `engine/src` at depth 2: 13 shells after the pop, at rest in 6.9 s. Wrapped again in 6.7 s, back to 10 shells. This pop was captured before the births change, so its four sub-shells were born at the skin's scale.
- In this repository's picture, switching between Skin and Cloud moved nothing (at rest within 0.3 s). Switching Skin to Off and back took about 7.3 s each way. Changing Shell Depth took 7.8 to 8.8 s.

## What the builder sees, offered for the owner's eye

- At the cube-root radius the shells are small. In this repository's pinned picture a 139-file shell is about 21 units across in a picture about 800 across, and it is dimmed as context. The skins are hard to find at this camera, and the hover is what names them. The radius that settles fastest is the one that reads least as a balloon.
- The estate's shells read as small grey blobs. At depth 2, two of its three shells (`Portal/Models`, `Portal/Pages`) have no wire at all: they connect to the picture only through lone hidden files that no shell holds. That is the "dangerous and true" case: a shell that hides its route.
- On hover, the shell's bundled wires light up together and its name with its count appears (`engine/src · 139`). This reads as a route running through the shell.
- Pops that open onto subdirectory shells can show no file at all (`engine/src`). The balloon is then full of balloons only.

## What is not settled

- The rule itself. Directory shells as bodies are one rule among several. Others are reach-depth cells from the frontier (each hidden file held by the frontier sphere that reaches it first) and communities of the reference graph. Lone hidden files breaking a route is this rule's flaw.
- Performance. The 1.2× target is met on the archipelagos and the estate at depth 2, and missed on this repository's pinned picture by wall clock (frames equal) and on the estate at depth 1. The stall target is met on this repository and the estate, and missed on the T3 sample.
- Size against legibility, once the owner has seen the pictures.
- Popped directories live in the view's memory only, not the URL.
- The pop's settle on the estate (14.9 s).

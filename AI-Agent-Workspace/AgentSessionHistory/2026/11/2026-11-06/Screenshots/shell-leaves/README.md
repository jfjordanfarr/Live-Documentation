# Bubbles built from the leaves (3D Local Map, the shells' second round)

_Status: implementation evidence of 2026-11-06, for the owner's judgement, with a fork the brief asked to hand back rather than choose silently: nesting makes the largest shells half again as large and more. A builder built bodies from the leaves on its worktree over round one's staged work on `a5a7047e` (tree `dc59e66c`), and took these pictures in a private headless Chromium with software rendering at 1440 × 960 from bundles built in that worktree, Group Wrappers chosen as a saved Tuning choice, the background search off. The "before" pictures are the owner's own three of round one, kept with the record of that turn and linked from there. The probes are in [the probe folder](../../../Probes/2026-11-06/shell-leaves/README.md)._

The owner, on round one: "The 3D engulfing bubbles are getting better. I'd say that I strongly prefer when I can see a bundle of nodes engulfed rather than just one which suddenly appears to multiply into many. It would be preferable, I thiiiink(?) if the engulfing optimization started at the leaves, ensuring that no bubble appears to have fewer nodes than it really does, even when it's a bubble-in-a-bubble situation" (Turn 4 of the November 6 record).

## What is built

- **From the leaves.** A body is built bottom-up over the directory tree of what it holds: a directory's own files are spheres; a subdirectory of one file is that file; a chain of directories holding only one subdirectory collapses into what it holds (`java/rosetta` holds `pom.xml` and the bubble of `src/com/rosetta`, not `src` ⊃ `com` ⊃ `rosetta`); every other subdirectory is a bubble built the same way first. A bubble's units are packed apart by the collision's gap (5), the largest first, each small one placed greedily where it reaches least far from the middle of the first two and all then drawn together and pushed apart; the bubble is as large as holds them with half the gap to its skin. Siblings never overlap (within a hundredth of the gap).
- **Every file seen.** Under Skin every file is drawn in its kind's colour inside the innermost bubble that holds it, and every inner bubble as a faint rim; the outer skin is fainter face-on than round one's. Every shell in the pictures below draws as many spheres as its label counts (`src · 139`: 139; `csharp/rosetta · 12`: 12).
- **The limit.** Past 1,024 files a body opens its smaller bubbles first and draws any bubble whose files would pass the limit as a veiled, milky bubble with nothing drawn inside, never an empty-looking one; a body whose own files pass it is one veiled bubble. The label keeps the true count. The limit is set by drawing cost in this software renderer (below); only the T3 sample reaches it (`alchemy-effect · 13,095`: 1,024 files drawn, 31 bubbles veiled).
- **Islands.** A wrapped group is one bubble of its files about its seed, drawn at that size with every member inside it; the seed keeps that room in the field and is still the body the pointer names. Its pop releases all of its files where they were seen, as before, and they enter in the frame of the pop. Nesting an island by directory was not tried.
- **Pops.** A pop releases the outer skin's own files and its bubbles one level in; each bubble is born as the shell of its directory at its place and its size (`sizeKept` in the records), its contents still seen, and everything enters in the frame of the pop. **The partition's rule did not change**: a shell is already named for the deepest directory holding its files, and a pop already makes each subdirectory's shell for the deepest directory under it, which is exactly the collapsed bubble the body drew.
- The clouds still veil what they hold. Round one's soft contacts, birth outside the mass and enter-at-once pop are kept.

## Pictures

| View | Round one (the owner's) | Now |
| --- | --- | --- |
| Wrapped groups far from any pin | [before](../../../ChatHistory/2026/11/2026-11-06.1.images/island-wrappers-one-sphere-each.png) | [Skin](islands.png) · [Off](islands-off.png) |
| One group under the pointer, `rosetta-manifest.json` | [before](../../../ChatHistory/2026/11/2026-11-06.1.images/island-wrapper-hovered-rosetta-manifest.png) | [hovered](island-hovered.png) |
| This repository pinned on `rosetta-manifest.json`, one hop, Shell Depth 4 | [before](../../../ChatHistory/2026/11/2026-11-06.1.images/rosetta-manifest-pinned-one-hop-shells.png) | [Skin](rosetta-one-hop.png) · [Off](rosetta-one-hop-off.png) |

The two references: this repository pinned on `forceGraphView.ts` (also the subject), two hops, Shell Depth 2: [Skin](repo-skin.png) · [Off](repo-off.png); the estate pinned on its payment service, Shell Depth 2: [Skin](estate-skin.png) · [Off](estate-off.png).

Pops, each as three frames (before, the frame of the pop with the page's clock paused and stepped one frame, at rest):
- **A chain**: `java/rosetta` in the rosetta picture, releasing `pom.xml` and the chain's bubble `src/com/rosetta` with its four bubbles and the lone file of `app`: [before](rosetta-chain-pop-1-before.png), [pop](rosetta-chain-pop-1-pop.png), [rest](rosetta-chain-pop-1-rest.png).
- **A bubble in a bubble in a bubble, level by level**: `explorer/src` ⊃ `client` ⊃ `views` ⊃ `localView`: [1 before](repo-pop-1-before.png), [1 pop](repo-pop-1-pop.png), [1 rest](repo-pop-1-rest.png); [2 before](repo-pop-2-before.png), [2 pop](repo-pop-2-pop.png), [2 rest](repo-pop-2-rest.png); [3 before](repo-pop-3-before.png), [3 pop](repo-pop-3-pop.png), [3 rest](repo-pop-3-rest.png).
- The estate at Shell Depth 1, `Portal` then `Portal/Pages`: [1 before](estate-depth-1-skin-pop-1-before.png), [1 pop](estate-depth-1-skin-pop-1-pop.png), [1 rest](estate-depth-1-skin-pop-1-rest.png), [2 before](estate-depth-1-skin-pop-2-before.png), [2 pop](estate-depth-1-skin-pop-2-pop.png), [2 rest](estate-depth-1-skin-pop-2-rest.png).
- **The T3 sample's largest shell**, pinned on `packages/contracts/src/agentSessions.ts`, two hops, 150 s after loading and not yet at rest: [Skin](t3-skin.png) · [Off](t3-off.png).

## Sizes

Radius of the reference shells, round one's rule against the leaves'; the full list per picture is in [the records](sizes.txt).

| Shell | Files | Round one | From the leaves | × |
| --- | --- | --- | --- | --- |
| `engine/src` | 139 | 73.9 | 114.0 | 1.54 |
| `explorer/src` | 75 | 58.0 | 111.6 | 1.92 |
| the estate's `Portal` | 10 | 31.9 | 43.0 | 1.35 |
| `csharp/rosetta`, `java/rosetta` | 12 | 34.9, 34.7 | 68.0, 67.7 | 1.95 |
| the T3 sample's `alchemy-effect` | 13,095 | 346.3 | 1,686.1 | 4.87 |
| the T3 sample's `effect-smol` | 972 | 183.1 | 584.5 | 3.19 |
| this repository's main group (an island) | 487 | 37.5 (its room) | 97.6 | 2.60 |

**This is the fork to hand back.** Bubbles that may not overlap need room: a bubble that holds one large bubble and a few small ones is at least as wide as the two largest side by side, and the cost compounds with each level of nesting, so that the deep, wide trees grow most. Shells of files alone (`tests/e2e`, 35.0 against 44.2) shrank, since the gap between spheres is now the collision's 5, not a wrapper's padding. What was tried to make the nested ones smaller: placing the small units in the waist beside the large ones instead of a shell around them (`explorer/src` 125.9 to 111.6), centring a bubble on the small ball that holds its units rather than on its largest unit (168.7 to 125.9), and dropping the hull's facet allowance from the inner bubbles' radii. What was not tried, for the owner to weigh: letting inner bubbles overlap again (round one), drawing nesting only a few levels deep, or a size that does not grow with nesting at all, where the pop's units would then not stand where they were seen.

## Rest, frame cost and building

Frames until the picture reports rest, the page's seconds from navigation, and the median milliseconds of a frame drawn with the camera turning (one load each; the records are the `*.json` files here).

| Picture | Off: frames · seconds · ms a frame | Skin: frames · seconds · ms a frame | Frames, Skin against Off |
| --- | --- | --- | --- |
| This repository on `forceGraphView.ts` | 328 · 31.8 s · 83 ms | 958 · 269 s · 241 ms | **2.92** |
| The estate, Shell Depth 2 | 187 · 4.9 s | 194 · 6.7 s | 1.04 |
| The estate, Shell Depth 1 | 187 (round one's Off) | 181 · 6.7 s | 0.97 |
| This repository on `rosetta-manifest.json`, one hop, depth 4 | 197 · 7.7 s · 33 ms | 208 · 53.1 s · 233 ms | 1.06 |
| The archipelago (no pin) | 50 · 2.6 s | 62 · 13.4 s | 1.24 |
| The T3 sample on `agentSessions.ts` | not at rest in 150 s · 1,250 ms | not at rest in 150 s · 5,333 ms | — |

**The frame budget is missed on this repository's reference picture** (2.92 times Off's frames). The headless twin (`twin.cjs` here) says why, as in round one: the larger shells rest against more spheres, so `explorer/src` (springs 4.48, six contacts at a sixth of the collision's stiffness each) reaches a stiffness of 10.5, past the eight under which a tick is one step: 839 evaluations of the field to rest against 314 Off. The islands' larger rooms make no difference to it (839 either way). Softer contacts would let the hub files sink further: at rest `graph.ts` already stands 17.9 units inside its clearance with `engine/src`, that is, some 13 units inside its skin, which can be seen. The remedy the twin points to, not built: give a shell weight in proportion to what it holds, so that its contacts' stiffness counts per unit of its mass, which removes the cliff instead of moving it.

**The seconds are missed everywhere the bodies are many**, since the software renderer fills every translucent skin and draws every sphere within: a frame of the rosetta picture costs 233 ms with its 824 spheres within skins against 33 ms Off, this repository's 241 against 83, the T3 sample's 5.3 s against 1.25 s with 8,175 spheres in 722 skins. A GPU was not measured. The limit per body (1,024) does not bound a picture of many bodies; a budget for the whole picture, nearest and largest first, is not built.

Building the bodies, in Node: this repository's ten shells 115 ms (`engine/src` 65 ms), its 41 islands 24 to 335 ms; the T3 sample's 43 shells 2.2 s (`alchemy-effect` 1.5 s) and 679 islands 97 ms. They are built when the picture first names them and kept, but that is a stall of that length on the T3 sample's first picture.

## The pops

At the frame of the pop every unit the outer skin showed stood inside it, at the place shown, and every bubble released stood as the shell of its directory at the size it was drawn (the `pops` of each record). How far the released units moved before the picture rested again:

| Pop | Files | Skin radius | Released (bubbles), inner units shown | Inside, at the place and size shown | Moved by rest, median (× skin radius) · largest | Other spheres, median | Rest after the pop |
| --- | --- | --- | --- | --- | --- | --- | --- |
| The estate's `Portal` | 10 | 44.4 | 7 (2), 5 | all | 56.9 (1.28) · 93.5 | 28.8 | 6.3 s, 262 frames |
| `Portal/Pages`, out of it | 3 | 20.4 | 3 (0) | all | 45.9 (2.25) · 67.2 | 20.6 | 3.2 s, 130 frames |
| `java/rosetta`, a chain | 12 | 71.9 | 2 (1), 15 | all | 74.4 (1.03) · 74.4 | 4.8 | 50.1 s, 235 frames |
| `explorer/src` ⊃ `client` ⊃ `views`, level by level | 75, 71, 40 | 117.8, 94.3, 65.6 | not read: the run's bundle did not yet record each unit's depth | at the frame of the pop, as the pictures show | not read | 11.4, 19.6, 16.1 | 91.5 s, 137.2 s, 116.7 s |

Round one's `Portal` units moved 60.1 (1.89 skin radii). What drives the rest is what drove it then: each released unit has its own wires and goes where they pull, away from where the shell stood as the balance of all of them; siblings no longer have to part, since they are born apart.

## What I still do not like

- The size of nested shells (above): `explorer/src` at nearly twice round one's radius is the largest thing in its picture, and the T3 sample's largest shells are enormous.
- The rest budget on this repository's picture, and hub files sinking into large shells.
- Drawing cost: in this renderer every picture with many bodies is several times slower a frame, and the T3 sample is unusable with Skin.
- The faint inner rims read well one and two levels deep; three deep (`explorer/src`), with the outer skin's highlight, the inner bubbles are hard to tell apart from each other at this camera.
- The labels of popped directories pile up at the centre of what they released.

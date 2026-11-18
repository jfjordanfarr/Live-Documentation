# Group Wrappers in the 3D Local Map: skin, cloud and cloud with a rim

Matched pictures of the experiment the owner asked to push forward on [November 5](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-10), from their proposal of a clickable mesh around a hidden group on [November 4](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-16--november-4) and their reading of the [throwaway probe](../../../Probes/2026-11-04/cluster-wrap/README.md): the cloud for reducing line density, the skin for the itch to pop it ([Turn 17](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-17--november-4)). The experiment sits behind one choice, Group Wrappers, in Tuning → 3D Layout → Discovery, which defaults to Off; Skin, Cloud and "Cloud, rim on hover" can be flipped on port 8900 with the same picture and camera. Taken by a builder in a private headless Chromium (software rendering) at 1280 × 800, with the layout's background search off (`searchStarts: 0`). This is evidence for a judgement the owner has not yet made; no look is chosen.

## What is wrapped, and what a wrapper does

Only a disconnected group the picture shows by its seed alone, of two files or more, is wrapped: every group but the lone files at the archipelago, and the unreached groups standing dimmed beside a pin. No wire leaves such a group, so a wrapper can hide no route. A wrapper is the padded convex hull of the group's own files, laid out hidden by the page's own physics as they would stand were the group shown, centred on the seed's live place. A wrapped seed keeps its wrapper's room in the physics, so wrappers do not overlap one another or cover what is shown; that spreads the archipelago to the groups' real extents, as the Off and Skin pictures at one camera show. Hovering a wrapper names its group with its seed's label (the title adds "· N files in this group"); a click pins the seed, the wrapper bursts a tenth larger and fades over 250 ms, and the files that enter stand where the hidden layout placed them, so they fill the shape that was popped. Releasing the pin wraps the group again. The wrapper replaces the seed's ring, and the key has a Wrapped group row.

## Pictures

Each row is one picture at one camera; each cell links one look. Hovered pictures put the pointer on a seed; the page names whichever wrapper is in front there.

| Picture | Off | Skin | Cloud | Cloud, rim on hover |
| --- | --- | --- | --- | --- |
| This repository's archipelago | [rest](repo-archipelago-off.png) · [hovered](repo-archipelago-off-hover.png) | [rest](repo-archipelago-skin.png) · [hovered](repo-archipelago-skin-hover.png) | [rest](repo-archipelago-cloud.png) · [hovered](repo-archipelago-cloud-hover.png) | [rest](repo-archipelago-cloud-rim.png) · [hovered](repo-archipelago-cloud-rim-hover.png) |
| Pinned on `rosetta-manifest.json`, the other groups dimmed | [rest](repo-pinned-off.png) · [hovered](repo-pinned-off-hover.png) | [rest](repo-pinned-skin.png) · [hovered](repo-pinned-skin-hover.png) | [rest](repo-pinned-cloud.png) · [hovered](repo-pinned-cloud-hover.png) | [rest](repo-pinned-cloud-rim.png) · [hovered](repo-pinned-cloud-rim-hover.png) |
| The estate sample's archipelago | [rest](estate-archipelago-off.png) · [hovered](estate-archipelago-off-hover.png) | [rest](estate-archipelago-skin.png) · [hovered](estate-archipelago-skin-hover.png) | [rest](estate-archipelago-cloud.png) · [hovered](estate-archipelago-cloud-hover.png) | [rest](estate-archipelago-cloud-rim.png) · [hovered](estate-archipelago-cloud-rim-hover.png) |
| The estate pinned on `PaymentService.cs` | [rest](estate-pinned-off.png) · [hovered](estate-pinned-off-hover.png) | [rest](estate-pinned-skin.png) · [hovered](estate-pinned-skin-hover.png) | [rest](estate-pinned-cloud.png) · [hovered](estate-pinned-cloud-hover.png) | [rest](estate-pinned-cloud-rim.png) · [hovered](estate-pinned-cloud-rim-hover.png) |

The Off pictures were taken last at each camera, after switching from the wrapped looks, so they show the same seeds after the picture drew back together without the wrappers' room.

The pop in Skin, the page's clock paused at the click and stepped, so the times are the page's own from the first frame after the pop: [0 ms](repo-pop-0ms.png), [100 ms](repo-pop-100ms.png), [250 ms](repo-pop-250ms.png), [500 ms](repo-pop-500ms.png), [settled](repo-pop-settled.png), and the [release back to wrapped](repo-released.png), for `rosetta-manifest.json`'s group of 102 files; the same for the estate's payment service, 30 files: [0 ms](estate-pop-0ms.png), [100 ms](estate-pop-100ms.png), [250 ms](estate-pop-250ms.png), [500 ms](estate-pop-500ms.png), [settled](estate-pop-settled.png), [released](estate-released.png). At 0 and 100 ms the wrapper is drawn bursting; at 250 ms it is gone.

## What was measured

Hulls, in Node on the same bundles, with the functions the page runs ([`forceGraphWrappers.ts`](../../../../packages/explorer/src/client/views/forceGraphWrappers.ts)):

| Picture | Wrapped groups | Hidden layout | Hull build | Merge | Vertices | Triangles |
| --- | --- | --- | --- | --- | --- | --- |
| This repository, archipelago | 42 | 1,482 ms | 61 ms | 2.9 ms | 3,472 | 6,776 |
| This repository, pinned on `rosetta-manifest.json` | 41 | 1,327 ms | 22 ms | 2.1 ms | 3,296 | 6,428 |
| Estate, archipelago | 2 | 85 ms | 11 ms | 0.6 ms | 187 | 366 |
| Estate, pinned on `PaymentService.cs` | 1 | 3 ms | 1.3 ms | 0.1 ms | 69 | 134 |

The largest group, this repository's main structure of 466 files, takes 1,196 ms of the hidden layout alone and makes a hull of 392 triangles. The page builds the first picture's hulls before it unfolds, and later ones a few groups a frame within 8 ms, the largest a frame of its own; each shape is cached per group and tuning, so a changed force or size lays them all out again. The triangle counts drawn in the browser equal the counts here.

In the browser ([measurements](repo-measurements.json), [pop measurements](repo-pop-measurements.json), and the estate's [stills](estate-measurements.json) and [pop](estate-pop-measurements.json)):

- An idle picture repaints nothing: zero frames drawn over three seconds at rest, in every look and in Off, in all sixteen stills and after each release.
- This repository's archipelago came to rest in about 17 s with Skin chosen at load, against under 2 s with Off. Choosing Skin at rest took 23 to 29 s; Off again, 3 to 7 s. The estate came to rest in 4 s.
- Switching among Skin, Cloud and the rim moves nothing: the room is the same, and the picture was at rest within a frame.
- The pop of `rosetta-manifest.json` grew the picture from 94 to 190 files and came to rest in 25 s; the release brought the wrapper back within the frame and the picture to rest in 16 s. The estate's pop came to rest in 3.4 s and its release in 5.0 s.
- Two earlier arrangements were measured and replaced: giving each wrapper's room to the physics as each hull arrived flung one seed 39,000 units out and kept the archipelago moving for 122 s; holding the picture where it stood when the room changed took 62 s to rest after choosing Skin and 54 s after a release.

## What the builder sees, offered for the owner's eye

- The skin reads as a gem more than a balloon: a convex hull of a spread-out layout has long flat faces, and its highlights pick out their seams; a faint line along one seam of the largest wrapper shows in some pictures. The probe showed the same geometry.
- The cloud is softer and hides the small islands' crowding, but the dimmed wrappers beside a pin are faint in both looks; they are dimmed to 0.6 of their opacity, less than a sphere's 0.4, since at 0.4 they nearly vanished.
- The rim marks the hovered cloud clearly, and hovering also fades every other wrapper to 0.2, as it fades other spheres.
- With the wrappers' room, the main structure and the second-largest group stand far from the crowd of small islands, which reads as true scale but spends screen space; the framing includes each wrapper.
- From some cameras a nearer wrapper covers another seed's place, and the pointer then names the nearer group. The hovered pictures of the archipelago name `rosetta-manifest.json`'s group; those beside the pin name the C modular sample's.

## What is not settled

- A ring's hidden neighbourhood inside a connected component is not wrapped; who would own a file two frontier spheres both reach is an open design question, as is recursive wrapping.
- A concave shrink-wrap, a wrapper that follows the seed's drawn size under zoom resistance, a pattern in motion and any reduction in layout cost are not attempted; with wrappers on, the page does more work, not less.

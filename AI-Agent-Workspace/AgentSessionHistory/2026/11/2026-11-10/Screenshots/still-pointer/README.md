# Still Pointer: three answers to a sphere arriving under a resting pointer

_Historical evidence of a trial that was never merged, carried onto `main` on 2026-11-16 when its branch was removed. The owner decided the question on 2026-11-15 ([Turn 4 of that day's record](../../../ChatHistory/2026/11/2026-11-15.1.record.md#turn-4)): no hover or click on a node while the 3D map builds, and a sign that it is building, which is what `main` does since `7f3e4160` ([its evidence](../../2026-11-15/building-map/README.md)). None of the three modes below exists in the product; the Tuning setting, `forceGraphHover.ts` and `force-graph-still-pointer.spec.ts` named here were on the branch `trial/still-pointer` at commit `357ad2e9`, with the pictures and the recording this note names, which were not carried over. The numbers are kept beside it._

Status when written: trial evidence, 2026-11-11, captured by a builder for the root's and then the owner's judgement. Not an adopted design: the default is Follows, the hover as it was, and the trial is Tuning → 3D Layout → Appearance → Still Pointer. Origin: the root's finding in [Turn 5 of the November 10 record](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-5) (a click on a seed, the pointer kept still, the grown picture arriving faded around an unrelated file whose actions landed under the pointer) and the owner's answer in [Turn 6](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-6): "I'm confident that I need to try several different approaches with my own eyes and hands before knowing for certain."

## The three modes

| Mode | A sphere, name or action strip arrives under a resting pointer | The pointer then moves over it | A hover the pointer began, as its sphere leaves and another arrives |
| --- | --- | --- | --- |
| Follows (default) | hovered: named, its actions offered, the rest faded | no change | the hover moves to the arrival, faded around it |
| Waits | nothing: not named for a hover, no actions, nothing faded | ordinary hover | the hover ends after the 180 ms grace; nothing begins |
| Names | named, its actions offered, nothing faded | ordinary hover, the rest fades | the arrival is named and offered, nothing faded |

"Moves" means a `pointermove` at a new place, or a press on the canvas. A wheel zoom moves the camera and not the pointer. The rule is `packages/explorer/src/client/views/forceGraphHover.ts`.

## What was captured, and how

A headless Chromium per journey, 1440×960, DPR 1, software rendering, against this worktree's own build on port 8771 (`npm run live-docs:visualize` and `:estate` at the trial's tree). The numbers are in [measurements.json](measurements.json). "Faded" counts the spheres drawn fainter than in the same picture at rest with the pointer away, read from the instance buffers' opacities; nothing is predicted.

**The estate sample, the spec's construction** (`tests/e2e/force-graph-still-pointer.spec.ts`): `Portal/Services/GatewayClient.cs` pinned, two hops, wrappers off, 14 spheres. The pointer is parked off the picture and Fit is pressed from the keyboard; the wheel zooms out over the barest canvas; the pointer is moved to where `Gateway/GatewaySettings.cs` stood in the fitted picture, bare canvas now; Fit is pressed again from the keyboard and the sphere arrives under the pointer, which does not move.

| Mode | `estate-*-1-arrived.png`: at arrival | `estate-*-2-moved.png`: after a 1 px move |
| --- | --- | --- |
| Follows | hovered, actions for GatewaySettings, **12 of 14 faded** | the same, 12 faded |
| Waits | no hover, no actions, **0 faded**; its name stands above it by proximity, not for a hover | hovered, 12 faded |
| Names | hovered, actions for GatewaySettings, named, **0 faded** | hovered, 12 faded |

`estate-*-0-before.png` is the zoomed picture with the pointer resting on bare canvas, the same in all three. `estate-three-modes.webm` (960×640) runs the three journeys in turn, Follows, Waits, Names, each captioned: the pointer glides to its place, Fit is pressed, and after a pause the pointer moves 1 px.

**This repository, the journey of the finding**: Connections, wrappers off, two hops, tests shown, nothing pinned; the largest group's seed (`packages/explorer/src/client/types.ts`, 511 files) found by its hover title, then its name clicked and the pointer kept where it clicked while the group grew, 321 spheres. `repository-*-1-grown.png` is the grown picture at rest with the pointer still there.

| Mode | Under the resting pointer | Faded |
| --- | --- | --- |
| Follows | `views/localView/network-simplex.ts`'s action strip; hovered, named | **318 of 321** |
| Waits | the same strip's place, bare: no hover, no actions | **0** |
| Names | network-simplex's actions and its name, no fade | **0** |

The finding reproduced on this tree with a different file than on November 11 (`scripts/layout-lab/verify.ts` then, 237 of 245): which file lands under the pointer depends on the settled layout.

## What each feels like, and what is wrong with it

These are the builder's readings of the pictures and the recording, headless and without a hand on a mouse; the owner's hand decides.

- **Follows** is the behaviour as it was. A picture that changes under the pointer re-targets the hover at once, which keeps a moving or zooming camera honest about what is under the pointer and never leaves a stale preview. What is wrong is the finding itself: after a click the person did not ask to look at anything, yet the grown picture arrives isolated around whatever file's sphere, name or actions settled under the pointer, 318 of 321 spheres faint, with that file's actions waiting under the pointer for a second click. By the same rule a wheel zoom over the picture hovers each sphere it sweeps under the pointer (from the code; not recorded here).
- **Waits** gives the calmest picture: a click or a zoom delivers the picture as asked, with no fade and no stray actions. What is wrong: the page under a still pointer now looks unresponsive; a sphere sits under the pointer, the cursor stays an arrow (`data-hovered-node` drives the hand cursor and is false), and nothing happens until the pointer twitches. After a wheel zoom a person usually holds the mouse still and expects the thing under it to answer. A hover that was begun also ends when the camera carries its sphere away, even if the person was about to press its actions.
- **Names** keeps the page answering (the arriving file is named, the hand cursor shows, its actions are offered) without taking the picture away. What is wrong: the offered actions still land under the pointer where the person just clicked, so a careless second click can pin an unrelated file, the very hazard the finding named; and the name it gives may be faint, since a file at the frontier is named in the frontier's dim style. The fade arriving with the first small move may read as a delayed flicker (an expectation; the recording shows it at a 1 px move after a pause).

## Not covered here

- No picture shows a Waits end held off by another file's name landing under the pointer; the view guards against it (Chromium sends `pointerenter`, and no `pointermove`, to an element that moves under a still pointer, measured on 2026-11-11), but no browser case constructs that arrival.
- Touch and pen were not tried; a touch release still clears the pointer's hover in every mode.
- The history's playback, which changes the picture under the pointer at two steps a second, was not recorded; it is the next place to try the modes by hand.

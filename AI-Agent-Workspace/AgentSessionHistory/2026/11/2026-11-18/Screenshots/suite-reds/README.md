# Three red browser cases on main, run down

_Historical evidence, taken 2026-11-19 between 09:47 and 09:59 UTC by the builder of the round `suite-reds`, on a machine loaded at 17 to 20 by another builder's rebuild of the history. "Before" is `main` at `834abd86`, built in a scratch worktree; "after" is the branch `suite-reds`. The three cases failed in the whole browser suite on `main` at `a93ac108` that morning (597 passed, 3 failed)._

## The 3D growth that took 5,535 frames to rest

`force-graph-discovery.spec.ts:70` clicks the largest group's seed (`local-storage.ts`, 588 files in its group) on this repository's archipelago and waits for its two hops, 305 spheres, to come to rest within 2,700 drawn frames.

**Cause.** The page paces the 3D motion within 10 ms a frame, a tick taken in parts (2026-10-28). A part was held to one evaluation of the field, so a frame drew one substep of the motion however little of the frame it used, and a stiff picture, whose tick takes several substeps, took a frame a substep. Counted on `main` with the page instrumented: one wake at the click, then 5,498 calls of the motion before it fell still at frame 5,534; with the budget lifted for the experiment, so that a call takes a whole tick, the same picture fell still in 1,273 ticks at frame 1,274. The case's bound counted substeps, not ticks, and the merge of Unpin others (`7f603b12`) added one sphere to the picture, `tests/e2e/others.spec.ts`, which pushed the substeps past 2,700. Its code is not the cause: that merge's `packages/` over the Live Docs of the commit before it rested in 2,243 frames, as that commit did. On the first-parent line the grown picture took 2,114 frames at `f571f9d9` (the last whole green run), 1,980 at `8e42651b`, 907 at `8127eaea`, 1,635 at `a206e08c`, 1,854 at `dd5dfdae`, 2,243 at `d6f59f0f`, then more than 2,700 at `7f603b12` and `5b7c4574`, and 5,535 at `834abd86`.

**Mend.** `SpatialMotion.advance` says how many spheres it evaluated (`evaluated`), and the motion force sizes the next part by that rate, so that a part reaches through as many of a tick's substeps as the budget holds and never past the tick's end. The numbers of a tick are unchanged however it is divided.

| Picture | What I see |
| --- | --- |
| `before-1-after-600-frames.png` | `main`, 600 frames (23.4 s) after the click: the group grown and spread, still drifting. |
| `before-2-at-rest.png` | `main` at rest: 5,491 frames and 202.6 s after the click at 27 frames a second. |
| `after-1-after-600-frames.png` | The branch, 600 frames (22.1 s) after the click: the group grown, in another arrangement. |
| `after-2-at-rest.png` | The branch at rest: 1,610 frames and 66.9 s after the click at 24 frames a second. |

The two rests are both the field's, and they are not the same arrangement: the reveal enters a piece a frame, and a frame now carries a tick where it carried a substep, so the pieces meet the motion at other moments. The spheres' places at rest are in `before-places.json` and `after-places.json`: on a picture 1,275 units wide, the median sphere stands 146 units from where it stood before, 110 of the 305 within 50, and the farthest, `tests/e2e/contained-sphere-reference.ts`, the sphere that glides last in both, 796 units away. To my eye both rests read the same way: the group's tangle in the lower left of the frame, the seed's name at its heart, the other groups' seeds dimmed around it; neither is tidier. On a machine as loaded, the arrangement now also varies from run to run, since how many substeps fit a frame depends on the machine's time; on `main` it varied too, by less (5,491 and 5,535 frames on two runs). The branch's arrangement is the one the headless twin's pacing gives, a piece a tick while a tick fits a frame. In the case itself on the branch the growth rested in 1,850 frames alone and 780 frames with its file, both on the loaded machine; the bound of 2,700 is unchanged.

## The Structure start's `tests` bubble, veiled

`structure-start-tests-veiled.png`: the 3D Structure start with Skin at one hop on this repository. `tests · 556` is a single veiled bubble; `packages · 408` shows its files. This is the product as it stands on `main` and on the branch, not a change of this round: the picture draws at most 1,024 files within all its skins (`pictureVeils`, 2026-11-07), and since the marble trial's second commit (`8127eaea`, four new files) the top level holds 1,028; the largest bubble is veiled first. `force-graph-structure-cells.spec.ts:75` said in its words "or a veil the budget drew" but asked every bubble for files; it now expects the veils `pictureVeils` gives. Counted with the case's own functions: 1,012 files at `f571f9d9`, 1,024 at `8e42651b`, 1,028 at `8127eaea`, 1,054 at `834abd86`.

## The pin tray's row of a deleted file

`pin-tray-deleted-today.png`: the history sample at today, `lib/legacy.ts` pinned in its lifetime. Its row says *deleted at ce0ea978* in the tray's quiet italic, and its accessible name is "Show lib/legacy.ts, deleted at ce0ea978": a row's words are part of its name since the camera round (`220c3838`, merged in `36083775`; the design system's interaction rules, "in its name too"). `history-scrubber.spec.ts:399` asked for the name "Show lib/legacy.ts" exactly; it now asks for the name with its words.

# Three red browser cases on main, run down

_Historical evidence, taken 2026-11-19 between 09:00 and 10:50 UTC by the builder of the round `suite-reds`, on a machine loaded at 11 to 20 by another builder's rebuild of the history. "Before" is `main` at `834abd86`, built in a scratch worktree; "after" is the branch `suite-reds` while it carried the first pacing below, since taken back. The three cases failed in the whole browser suite on `main` at `a93ac108` that morning (597 passed, 3 failed)._

## The 3D growth that took 5,535 frames to rest: not mended, a question for the root

`force-graph-discovery.spec.ts:70` clicks the largest group's seed (`local-storage.ts`, 588 files in its group) on this repository's archipelago and waits for its two hops, 305 spheres, to come to rest within 2,700 drawn frames.

**Where it went red.** On the first-parent line the grown picture took 2,114 frames at `f571f9d9` (the last whole green run), 1,980 at `8e42651b`, 907 at `8127eaea`, 1,635 at `a206e08c`, 1,854 at `dd5dfdae`, 2,243 at `d6f59f0f`, then more than 2,700 at `7f603b12` (the merge of Unpin others) and `5b7c4574`, and 5,535 at `834abd86`. The merge's code is not the cause: its `packages/` over the Live Docs of the commit before it rested in 2,243 frames, exactly as that commit did. Its data is: one new file, `tests/e2e/others.spec.ts`, joined the group's two hops (300 spheres to 301), and the settle's length, which swings from 907 to 2,243 frames with a few files, crossed the bound. Frames to rest on `main` were 5,487 to 5,535 on four runs at loads from 4 to 20: the count is the picture's, not the machine's.

**Why so many frames.** The page paces the motion within 10 ms a frame, a tick taken in parts (2026-10-28), and a part was held to one evaluation of the field, so a frame draws one substep. Counted on `main` with the page instrumented: one wake at the click and none after it, no outside write of a sphere's place, 5,498 calls of the motion before it fell still at frame 5,534. The pointer's rest (`f2b2c444`, `5a5e4de9`) is not the cause: on every one of those runs the pointer was moved off the picture at once after the click, and `dd5dfdae`, which carries the pointer's rest, rested in 1,854 frames. A trace of every frame shows the tail: after the group has settled to the eye by about frame 1,000, single spheres glide off shallow balances one after another (`contained-sphere-reference.ts` near frames 2,000 to 3,000, `tuning-levers.ts` near 3,300, `pointer-frames.ts` near 4,250), each moving a thousandth of the picture's diagonal a frame, until the still rule fires at frame 5,534. That is the slowness the still rule's own note (2026-11-16) calls the forces' matter.

**Two pacings tried, neither landed.**

1. A part sized by the rate measured, reaching through as many of a tick's substeps as the budget holds, never past the tick's end (`SpatialMotion.evaluated`, the force's part from it; commit `3a94a4f8`, taken back in `e4541663`). The discovery growth rested in 780 to 1,850 frames. But the reveal enters a piece a frame, so a frame carrying a tick meets the pieces at other moments of the motion and the paths change: the estate's Whole in Structure with Skin took 1,028 frames to rest where `main` takes 243 (30 to 40 s against 9 to 12 s on the loaded machine), and `force-graph-exploration.spec.ts:206` failed its 25 s wait where `main` passed beside it.
2. The same, but held to one evaluation a call while the picture still enters (`readyToAnchor`), so that every path is `main`'s. The Whole kept its 240 frames, and the discovery growth rested in 2,676 frames on the loaded machine: `main`'s path itself takes about as many ticks as the bound allows frames.

| Picture | What I see |
| --- | --- |
| `before-1-after-600-frames.png` | `main`, 600 frames (23.4 s) after the click: the group grown and spread, still drifting. |
| `before-2-at-rest.png` | `main` at rest: 5,491 frames and 202.6 s after the click at 27 frames a second. |
| `after-1-after-600-frames.png` | The first pacing tried, 600 frames (22.1 s) after the click: the group grown, in another arrangement. |
| `after-2-at-rest.png` | The first pacing at rest: 1,610 frames and 66.9 s after the click at 24 frames a second. |

The two rests are both the field's and not the same arrangement. The spheres' places at rest are in `before-places.json` and `after-places.json`: on a picture 1,275 units wide, the median sphere stands 146 units from where it stood, 110 of the 305 within 50, the farthest (`contained-sphere-reference.ts`, the last to glide in both) 796 units away. To my eye both read the same way: the group's tangle in the lower left of the frame, the seed's name at its heart, the other groups' seeds dimmed around it; neither is tidier.

## The Structure start's `tests` bubble, veiled

`structure-start-tests-veiled.png`: the 3D Structure start with Skin at one hop on this repository. `tests · 556` is a single veiled bubble; `packages · 408` shows its files. This is the product as it stands on `main` and on the branch, not a change of this round: the picture draws at most 1,024 files within all its skins (`pictureVeils`, 2026-11-07), and since the marble trial's second commit (`8127eaea`, four new files) the top level holds 1,028; the largest bubble is veiled first. `force-graph-structure-cells.spec.ts:75` said in its words "or a veil the budget drew" but asked every bubble for files; it now expects the veils `pictureVeils` gives. Counted with the case's own functions: 1,012 files at `f571f9d9`, 1,024 at `8e42651b`, 1,028 at `8127eaea`, 1,054 at `834abd86`.

## The pin tray's row of a deleted file

`pin-tray-deleted-today.png`: the history sample at today, `lib/legacy.ts` pinned in its lifetime. Its row says *deleted at ce0ea978* in the tray's quiet italic, and its accessible name is "Show lib/legacy.ts, deleted at ce0ea978": a row's words are part of its name since the camera round (`220c3838`, merged in `36083775`; the design system's interaction rules, "in its name too"). `history-scrubber.spec.ts:399` asked for the name "Show lib/legacy.ts" exactly; it now asks for the name with its words.

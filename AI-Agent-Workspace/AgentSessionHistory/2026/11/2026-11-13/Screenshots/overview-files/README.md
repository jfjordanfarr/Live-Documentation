Evidence for a trial, 2026-11-13 and 14: the 2D Local Map's farthest zoom look drawn as files only, in the look an opened directory has in Flow, behind Tuning → 2D Layout → Zoomed Out Fully. A builder's pictures and numbers for the root's review, taken again for the trial's second round (the root's review of the first: the way back in, names broken inside a word, a picture drawn afresh while files only shows, and the crowded picture's press). Historical: it describes the trial as built in that round, not the product after it.

The owner, after opening three directories in Flow: "I feel like the "Flow" look is much closer to what the full zoom-out in the 2D Local Map might reasonably be" ([Turn 8 of the November 13 record](../../2026-11-13.1.record.md#turn-8)). Their own rule had been that cards do not resize as the map zooms out, so this is a trial, the default unchanged, and the motion into it and out of it is half of what is to be judged.

## The pictures

Thirty-six still pictures, 1,440 by 900, headless Chromium, the continuing search off. Named `{subject}-{state}-{choice}-{fallback|segoe}.png`: `press6` is six Zoom Out presses from arrival (the last of the connections look), `press7` seven (the first of the overview look), `fit` Fit pressed from the seventh; `keep` is Cards keep their size (the default), `files` is Files only, as in Flow; `fallback` is this container's font, `segoe` the same glyphs with Segoe UI's line metrics, which is what the owner's screen draws. Subjects, each pinned whole: `documentationLinks` (this repository's `scripts/doc-tools/documentationLinks.ts`), `client-types` (`packages/explorer/src/client/types.ts` inside the opened `packages/explorer/src/client`, the crowded one), `estate-PaymentService` (the estate sample's `PaymentService/PaymentService.cs`).

Twelve more show the move on `documentationLinks` with files only: `documentationLinks-move-{out|back}-{first|middle|last}-files-{fallback|segoe}.png`, shot with Move Length stretched to 2.4 s so that a screenshot can follow it (the same path in space, at a sixth of the speed).

## Numbers

At seven presses, the picture in the map's own units, under Segoe's lines (fallback's heights are the same or within 20):

| Subject | Keep: height, area | Files: height, area | Names cut, keep / files | Broken inside a word, keep / files (fallback; Segoe) |
| --- | --- | --- | --- | --- |
| documentationLinks | 1,748; 3.49 M | 821; 1.64 M | 2 / 0 | 3; 4 / 0; 0 |
| client-types | 5,161; 38.3 M | 4,343; 32.2 M | 3 / 0 | 2; 2 / 0; 0 |
| estate-PaymentService | 1,269; 2.53 M | 1,064; 2.12 M | 0 / 0 | 0; 1 / 0; 0 |

"Broken inside a word" counts a held name whose line ends in a letter or digit and whose next line begins with one (`markdow / nShared`); a break at a capital after a small letter or at a dot is a seam and is not counted. In the first round files only broke as many names as the default (documentationLinks 3 and 4, client 2 and 2, estate 0 and 1); now a compact card's name is held at the overview's size unless its widest segment would not fit across, and then at the largest size at which every segment fits, never below the connections look's, so it breaks only at seams. On `documentationLinks` five sizes stand side by side, from 2.93 to 3.6 of the map's units, the narrow cards' names smaller. The least air between a name's last line and its card's inner bottom edge is 31 to 34 map units with files only, about what the default leaves (33).

The move, out from six presses to seven and back, with Zoom Out and Zoom In pressed with the pointer away from the map, so that the card nearest the frame's centre is held:

| Subject | Held | Held drift on screen | Farthest card travels, out / back | Duration out / back | Frames drawn | Symbol wires drawn while it runs |
| --- | --- | --- | --- | --- | --- | --- |
| documentationLinks | `documentationLinks.ts` | 0 px | 303 / 363 px | 440 / 445 ms | 26 / 24 | 0 (31 after the move back) |
| estate-PaymentService | `PaymentService.cs` | 0 px | 91 / 109 px | 440 / 450 ms | 25 / 25 | 0 (27 after) |
| client-types | `reading-state.test.ts` out, `types.ts` back (each the card nearest the centre at its press) | 0 px | 334 / 401 px | 430 to 600 / 550 to 710 ms after the press's own work | 3 to 4 / 3 | 0 (396 after) |

Out and back, every card returned to the box it had at six presses, in the map's units, on every subject under both lines. Fit pressed twice gave the same camera every time, under both choices. Fit frames the picture with its rows from either layout, so from the overview with files only it lands where the default's Fit lands: in the connections look on `documentationLinks` and the estate, whose picture then shows framed with its rows, and in the overview on `client`. The root accepted that for the trial.

## Time

On this machine, which ran about 1.5 times slower than usual and shared its processor with another builder's browser. First paint is the same under both choices (documentationLinks about 0.35 s, estate 0.3 s, client about 2.3 s). The synchronous work of the press that changes the look, out / back:

| Subject | Keep | Files only |
| --- | --- | --- |
| documentationLinks | 0.07 to 0.11 / 0.11 to 0.18 s | 0.17 to 0.24 / 0.17 to 0.22 s |
| estate-PaymentService | 0.08 to 0.11 / 0.11 to 0.12 s | 0.15 to 0.18 / 0.11 to 0.13 s |
| client-types | 0.57 to 0.80 / 0.61 to 0.74 s | 1.45 to 1.61 / 1.11 to 1.34 s |

On `client` the default's press had taken 1.7 to 1.9 s in the first round, on `main` as well. A CPU profile of one such press (the default, before this round) put 2.27 s of self time in `getBoundingClientRect` and the trace 2.37 s in 184 style recalculations: the overview's wires measured each card's node-level hub for the first time after the previous wire had been written, so every wire laid the page out again (`drawOverviewWires`, 1.69 s of total time). The overview's drawing now measures every hub before it writes, which brought the default's press on `client` to 0.6 to 0.8 s. The rest of that press is the frame's measure after the change (`measureLayoutExtents`, about 0.7 s in the profile) and the look's morph (about 0.18 s). Files only adds its relayout, about 0.8 s on `client`.

## The design audit

From the first round: `tests/e2e/design-audit.ts` over press six and press seven of every subject under Segoe's lines, on that build (both choices) and on a build of `main`: no collision and no cut text anywhere. It reads the directory labels, closed boxes and pinned rows' names; the held file names are generated content it cannot read, which the cut and broken counts above cover.

## What the builder saw

- The far picture with files only reads as Flow's: short cards in their columns, one line between each pair, the pinned file outlined, every name whole and broken only at its seams. The price of whole words is that names on narrow cards stand smaller than on wide ones, down to about four fifths of the overview's size on `documentationLinks`.
- A compact card is as tall as its name needs, so a long name on a card of few rows can make it taller than its rows' card: on `documentationLinks`, `enforce-documentation-links.test.ts` grows from 174.5 to 197.5 map units at the overview, the only one. Every other card's height falls.
- The picture's height is set by its tallest column, so it falls less than the cards do: to under half on `documentationLinks`, to five sixths on the estate and `client`, where columns of lines between the cards keep it tall.
- The move out is a collapse toward the held card: each card keeps its column and slides up or down while its box shrinks from the bottom, the names cross-fading in the first 160 ms. The move back in is its reverse: each card grows by its rows, revealed from the top, its counts below them, the pairs' lines drawn to the cards' hubs until the move ends, and then the symbols' wires (`documentationLinks-move-back-*`). No wire reaches a row the card still hides.
- On `client` the move cannot be followed: the press takes 1.1 to 1.6 s with files only, and the move then draws three or four frames.

## To see it

Build and serve the worktree's Explorer (`npm run live-docs:visualize`, then `npx http-server dist/explorer -p 8947 -c-1`), open a pinned file, choose Tuning → 2D Layout → Zoomed Out Fully → Files only, as in Flow, and press Zoom Out seven times, then Zoom In once.

## The root's review at the landing

Written by the root, 2026-11-14 UTC. The trial is on `main` behind its Tuning choice, the default unchanged, merged by hand with the closed directory's choice that landed an hour before it (the Tuning panel now holds sixty controls).

Opened by the root, under Segoe's metrics: `documentationLinks-press7-keep` and `-files` of both rounds, `client-types-press7-files` of the first, and the move back's middle frame of both. In the first round four of seven names in the far picture broke inside a word and loose wire ends hung below a growing card; in the second every name stands whole, the narrow cards' a little smaller than the wide ones', and the card grows by its rows with no wire drawn to a row still hidden.

Checked by the root on the preview rebuilt from the merged tree, opened by a long address that carries the choice, under both metrics: at the seventh press the look is overview, no row is laid out, seven lines join the seven cards, and the picture's height falls from 1,748 to 826 (fallback) and 821 (Segoe's lines); one press in, every card stands where it stood.

On the merged tree: type-check and lint pass; the unit cases of the client and the layout lab pass after one correction, the new control's help sentence, which was 142 characters against the limit of 120 that a case holds and is now 108; eight browser spec files, 52 of 52 (`overview-files`, `closed-directory-looks`, `tuning`, `zoom-looks`, `card-slots`, `card-reading-refresh`, `local-map-directories`, `local-map-motion`). The builder ran fourteen spec files of the default path on its branch, 94 cases, all passing once its own case allowed a compact card to stand taller than its rows' card where its name needs it.

Left as found: with files only the crowded `client` picture's press takes about 1.5 s and its move draws three or four frames; Fit from the overview lands in the connections look on a small picture, by the rule that keeps it stable; during the 160 ms text morph out of the overview a name held smaller is drawn at the overview's own size.

To see it on the day's preview: [documentationLinks with files only chosen](http://127.0.0.1:8999/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkRUwBTAJzAEtSB3AMSoVIGcoQAzJ1kAX1-gA7di3Tkq+AC4sA9ABMMAWkmpUCWQvQBXALalBkzJKqpBAGSqCA1iwB00vkA), then Zoom Out seven times and Zoom In once.

# Unconnected: what a whole file's card does with the rows nothing connects to

Historical record, 2026-11-23. The first pictures of the trial lever Tuning → 2D Layout → Unconnected (Shown, the
default; Dimmed; Folded), built on the owner's word of that day: "can we make it so that, by default, the symbols which
have no reference to anything else are not shown or dimmed or something? I'm looking at this powershell module here
going 'holy moly'". Two files of this repository's map, each pinned whole and the subject, at 1,440 by 900, the suite's
stilled search (`searchStarts: 0`) and nothing else remembered; the lever carried by the link. The builder's eye, not the
owner's.

The counts, from the graph the page holds (`unconnectedSymbols`):

- `tests/integration/programs/powershell/rollout/expected/powershell-ast.json`, the owner's file: **138 of its 138 rows
  are unconnected.** Its symbols are the keys of a JSON file; no reference of the graph names any of them.
- `packages/engine/src/live-docs/graph.ts`: **1 of its 15 rows is unconnected**, `DocumentationEdge`.

| Picture | Rows drawn, faded | Count line | Card's height on screen | What the eye judges |
| --- | --- | --- | --- | --- |
| `powershell-ast-shown.png` | 138, 0 | none | 2,366 px at the arrival's pull-back (scale 0.33) | Today's picture: the column of rows runs from under the toolbar off the bottom of the view. |
| `powershell-ast-dimmed.png` | 138, 138 | none | 2,366 px | The same column, every row's text and dots at the Hover Dim token's half opacity. Since every row is unconnected, nothing stands out against anything; at this scale it reads only as a slightly greyer column. It does nothing for the owner's "holy moly". |
| `powershell-ast-folded.png` | 0, 0 | "+138 symbols", not drawn at this look | 90 px | The card is its name and the Internals row, and the camera, with no tall card to frame, pulls back to the neighbourhood: the seven cards of the rollout program and their wires all stand in view. **Not honest at this look:** the count line is hidden in the connections look where the card's room below what it draws cannot hold it, which is the existing rule for every compact card's count (`footWrites` in `card-reading.ts`, `reading.css`); a reader at this look sees a card with no symbols and is not told that 138 are folded. |
| `powershell-ast-folded-reading-size.png` | 0, 0 | "+138 symbols", drawn | 269 px (scale 1.45) | At reading size the card says "+138 symbols" under Internals, in the quiet count idiom. |
| `powershell-ast-folded-count-pressed.png` | 138, 0 | none | 7,065 px | After the count is pressed from the keyboard (focus, Enter): every row is back and the card is a column again, entered at its top. |
| `graph-ts-shown.png` | 15, 0 | none | 425 px (scale 0.33) | Today's picture at the pull-back: a card of fifteen wired rows among 52 cards and 233 wires. |
| `graph-ts-dimmed.png` | 15, 1 | none | 425 px | `DocumentationEdge`, second from the card's foot, is visibly fainter than its neighbours and has no wire; the other fourteen are as in Shown. Here the fade does what it is for. |
| `graph-ts-folded.png` | 14, 0 | "+1 symbol", drawn | 408 px | The row is gone, the card 17 px shorter, and "+1 symbol" stands at its foot under Internals, at the connections look. The wires, the folder's band and the cards beside it moved with it; nothing overlaps. |
| `graph-ts-folded-reading-size.png` | 14, 0 | "+1 symbol" | 1,219 px | At reading size the card is taller than the view; the folded row and the count line are at its foot, below the view. |
| `graph-ts-folded-count-pressed.png` | 15, 0 | none | 1,271 px | After the press: the fifteenth row is back below the view; the card's top holds its place. |

Measured on every picture: no two drawn rows of the card overlap, every drawn row stands inside its card, and the page
reported no error. Under Folded the folder's band followed the card's height (on the owner's file, 132 px tall about a
90 px card), and on `graph.ts` 233 wires were drawn under every value, as in Shown (their places were not compared).

The design audit's rules (`textBoxes`, `overlapsAmong`, `truncations` over the map's text) over the owner's file at the
arrival's pull-back: Folded, no fault. Shown, today's picture, has 72 of the card's long row names cut (for example
"files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:Power…", by 140 px), and Dimmed the same 72 and no other; the
cuts are the card's own matter and not this lever's. `tests/e2e/unconnected-symbols.spec.ts` holds both.

The pictures and their numbers come from [`stills.mjs`](stills.mjs), kept here; its head says how to run it.

Evidence for two repairs to the World Map's camera, 2026-11-13: a builder's pictures and measurements for commits `9d924360` and `db6dbccf`, written up by the root. Historical: it describes those commits, not the product after them.

The owner had reported that day ([Turn 2 of the record](../../2026-11-13.1.record.md#turn-2)): "Right click-and-drag-based rotation is EXTREMELY slow. Performance on rotating the camera has dropped significantly for some reason", and that the button for the view from above "takes you to a skewed/oddly-rotated top-down view if you have already performed any amount of rotation beyond what the scene starts with".

## What changed

- **The view from above** turns to the squared angle nearest the camera's, never more than an eighth of a turn, and the tool shows pressed only when the board is above and squared; a second press returns to the view it looked down from, unless the camera turned while above. It had always turned back a fixed eighth, which squares the board only from the four angles the turn keys reach.
- **A turn by drag** draws once a frame and settles the labels once a drawing, reading every label's resting box in one batch. The label rule of November 12 had put each label back and read its box one at a time, the page laid out again for each. At rest every label stands exactly where that rule put it: over 260 camera states on both boards, none of 11,036 labels takes a different move.

## The measurements

The builder's, in a headless browser at 1,280 by 720, a right-button drag of 61 pointer moves, each build run twice at a load average of 5 to 8. For each pointer move: times the page is laid out, script time, and the gap between drawn frames.

| Board, gesture | Before November 12's label rule | The morning of November 13 | With the fix |
| --- | --- | --- | --- |
| This repository, turn | 11.8 layouts, 22 ms, 29 ms | 44.7 layouts, 36 ms, 44 ms | 2.1 layouts, 18 to 21 ms, 24 to 30 ms |
| This repository, pan | 5.0 layouts, 3 to 4 ms | 21.0 layouts, 8 ms | 2.0 layouts, 6 to 8 ms |
| This repository, wheel | 9.1 layouts, 6 ms | 21.6 layouts, 13 to 14 ms | 2.1 layouts, 8 to 12 ms |
| The estate, turn | 17.4 layouts, 16 to 24 ms, 22 to 31 ms | 32.8 layouts, 28 to 30 ms, 34 to 37 ms | 2.1 layouts, 13 to 15 ms, 19 to 21 ms |

The counts are the reliable column; the times move with the machine. A pan and a wheel step still spend their script time in the label rule's own arithmetic, which tests each place a label might take against every piece's outline.

## The pictures

Twenty-two, named by board (`repository-`, `estate-`) and state: `1-after-a-free-turn`, `2-straight-down-squared`, `3-up-again-back-to-the-turn`, and `turn-by-drag-frame-N-of-8`.

What the root saw: on its own run of the same drag and press against the morning's build and the fix, the board from above ended 31.6 degrees off the screen's axes before and square after, and the second press returned to the dragged view. Of these pictures the root looked at frames 5 and 8 of this repository's turn. The board turns as it should. **What is still wrong, and is yesterday's label rule, not this change:** the rule is applied afresh at every frame, so during a turn a label can hop between above and below its piece (`explorer` is above in the first frame, below in the fifth, above in the eighth), and at the eighth frame's angle `action`'s label lands below its own piece and beside `explorer`'s, where it reads as naming the wrong piece. A label that kept its side while the camera moves would be the repair; it changes what a person sees in motion and was not attempted. The other pictures are described by the builder's handback, summarized in [the record](../../2026-11-13.1.record.md#turn-6); the root did not open them.

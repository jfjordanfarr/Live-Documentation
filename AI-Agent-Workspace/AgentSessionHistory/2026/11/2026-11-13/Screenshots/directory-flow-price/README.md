Evidence for giving the layout's price a term for width and letting it choose how an opened directory stands in flow order, 2026-11-13: a builder's pictures and measurements over three attempts, written up by the root. Historical: it describes that day's round, whose last attempt is the one on main.

## Why

The owner, having used the opened-directory trial ([Turn 2 of the record](../../2026-11-13.1.record.md#turn-2)): Flow "superior in basically every place I look", `localView` "overwhelming", and "grid does indeed lay out the nodes more cleanly, especially when only directory-level pinning has occurred". To the root's proposal of a rule for the sub-directory boxes they answered that the layout had been improved "through a systematic mechanism that tries to maximize many often-competing signals", and worried about "a good amount of rearrangement as new pins are added" ([Turn 3](../../2026-11-13.1.record.md#turn-3)). Told that the price had no term for width: "If a user can understand software at a glance better by adding that extra term to the 'price', go ahead and add it." ([Turn 4](../../2026-11-13.1.record.md#turn-4))

## What is on main

- **A cost for each pixel of the picture's width**, beside the height's, with its lever (Tuning → 2D Layout → Width Cost, default 5, the height's own). Inside one picture the order of cards never changes its width, so the term decides only between shapes.
- **A shape of three choices, priced:** how tall a rank grows before it wraps, how many rows an opened directory's closed boxes stand in, how many columns its unlinked files stand across. The rule that wrapped ranks so that a picture was "about as wide as tall, counted in cards" is gone, with the square root for unlinked files.
- **The shape is chosen on the directory alone and on a nominal card** (a file's card 240 by 180, a closed box 160 by 81): not on what is pinned, not on what was shown before, not on the reader's fonts. So it is the same at first paint, after any pins and from a link, on every machine, and a pin prices nothing. A browser case fails if the nominal card drifts more than a fifth in height or two fifths in width from the page's median.
- **A shape governs only the opened directories' own files.** A card a pin brings in from elsewhere stands in its rank unwrapped, in a column of its own at the rank's left where the directory's files of that rank wrap.

## What was tried and removed on the way

1. **Shapes priced from the page's measured cards at every render.** The first pictures were the ones kept below, but a pin re-chose the shape: on `localView` half the cards then moved more than 1,107 map units where they had moved 336, and on `client` the pin spent 2 s walking the shapes.
2. **A term for how far the cards on screen would travel**, the root's design. It held `localView` (310 units) and failed `client` (2,716 units, about 3 s), where one wrap cap chosen for a six-file rank was applied to the 64 cards a pin brings. It also made a shape depend on the path a person took, so a link would not show what its sender saw. Withdrawn by the root.

## The numbers of the attempt on main (`-1c`)

| Directory, and the file pinned | A pin moves half the cards more than, and pairs keeping their left-to-right order: before the round | With it | The pin's layout time, before | With it |
| --- | --- | --- | --- | --- |
| `scripts/live-docs`, `generate.ts` | 440, 80% | 241, 100% | 154 to 164 ms | 137 to 176 ms |
| `localView`, `directory-flow.ts` | 336 in the morning's runs, 712 in the afternoon's; 100% | 446, 100% | 797 to 871 ms | 718 to 747 ms |
| `packages/explorer/src/client`, `types.ts` | 1,037, 76% | 1,307 to 1,338, 76% | 1,373 to 1,395 ms | 1,494 to 1,648 ms |

`client`'s pin is the bar the round missed: a quarter more movement, where the Grid moves 2,017. First paint costs what it did within the runs' noise (110, 160, 385, 648 and 105 ms on the five subjects). A link of a pinned state stands the directory's cards in the columns the pinning left them in; with the travel term 13 of `client`'s cards had stood elsewhere.

## The pictures

Named `<subject>-flow-<arrival|fit|pinned-arrival|pinned-fit>-<before|after|1c>.png`, 1,440 by 900, the Tuning panel open at the left: `before` is the build before the round, `after` the first attempt's unpinned pictures, which the attempt on main draws the same, and `1c` the attempt on main with its pins. The twenty-four pictures of the two removed attempts' pins were not kept; their numbers are above. Subjects: `scripts`, `live-docs`, `client`, `localView`, `estate-Contracts`.

What the root saw in the four it looked at itself:

- `localView-flow-fit-before` and `-after`: before, eleven columns, a wrapped rank standing beside itself, many names cut ("directory…", "branch…"); after, nine columns each a true rank, the picture in the window's proportions, nearly every name whole. This is the gain the round exists for.
- `client-flow-pinned-fit-before` and `-1c`: sixty-four cards after `types.ts` is pinned, crowded in both; with the round, one short extra column where four of the directory's own files wrap, three of its cards so narrow that their names are cut to the ellipsis alone. Not good, and not this round's to mend: it is the card's own far-zoom drawing.

Unchanged by the round: `scripts` (its five boxes still three deep, since standing them wider adds width and saves no height), `scripts/live-docs` and the estate's directory. The other pictures are described by the builder's handbacks, summarized in [the record](../../2026-11-13.1.record.md#turn-6); the root did not open them.

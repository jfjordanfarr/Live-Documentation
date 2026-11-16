# The colour pass: what the Explorer's colours are, what they mean, and two candidate palettes

_Historical evidence, November 16, 2026. Written by the root agent in [the November 16 session](../../../ChatHistory/2026/11/2026-11-16.1.record.md#turn-1), in answer to the owner's four questions: which colours the app uses, what each means, which alternative palettes could carry the same information, and what has been said about colour before. Nothing in this folder is product code, and no palette here is a decision: the two candidates are the root's design, for the owner's eye on the built thing._

## What is here

- [inventory.md](inventory.md): every colour the product draws, 177 rows, each with its value, where it is defined, where it is used and what it tells the person looking; then findings and measurements. By an Opus researcher, read-only, from `main` at `6daa2f70`. The root checked its main claims in the source: the two pin colours, the table of kind colours, the two undefined variables, the World Map's variables.
- [history.md](history.md): every exchange about colour in the record, 2025-10-16 to 2026-11-16, with the owner's words and their sources; decisions in force, what was tried and thrown away, what is open. By a second Opus researcher. The root checked seven of its quotations and corrected one claim, in a note at its head.
- [palettes.png](palettes.png): a specimen sheet, today's colours beside the two candidates, each as drawn and as three kinds of colour blindness see it, with the measured distance of the closest pair in each group. A specimen of colours, not a picture of the Explorer.
- Four pictures of the build as it stood (`dist/explorer` of 15:45 UTC, 1,440 by 900, the container's fallback font): [a directory opened in the 2D map](today-2d-scripts-directory.png), where the key sets a blue dot for Implementation and a green one for Test under the row whose blue is Offers and whose green is Uses; [a pinned file in the 2D map](today-2d-branch-renderer-pinned.png), where blue is also the selected card's border, the active buttons and the reading icons; [a pinned file in the 3D map](today-3d-pathfind-pinned.png); and [the World Map](today-world-map.png).

## How distances were measured

The same way as [the probe of the night before](../../../Screenshots/2026-11-15/kind-palette/README.md): the distance between two colours in OKLab, times 100, unsimulated and under simulated protanopia, deuteranopia and tritanopia (Machado, Oliveira and Fernandes, 2009, full severity), with the floors of the harness's data-visualisation skill: 15 to tell two colours apart with full colour vision, 8 with red-green colour blindness. Contrast is the WCAG ratio. The root's bench reproduced the three published numbers of that probe (12.7, 14.3, 2.5) before anything else was measured with it. The bench and the search that found the candidates were scratch and are not kept; the product's own check, when a palette is built, is to be a unit test of the same arithmetic.

## What the colours mean today

Five jobs, in the order a designer would name them.

| Job | What it tells | Today |
| --- | --- | --- |
| A connection's role | which end offers and which uses | 2D wires run `#38bdf8` to `#34d399`; 2D pins are another blue and green, `#0091ff` and `#00d3aa`; World Map doors a third pair in its light theme. Not drawn in 3D since 2026-10-31. |
| A file's kind | implementation, test, asset, document, directory | One table, `SPATIAL_NODE_STYLES`: `#0091ff`, `#28a745`, `#e83e8c`, `#9966cc`, `#e9984d`. The test's green and the asset's pink are stock colours of the Bootstrap framework, as are the colours of three more kinds that nothing produces. Draws 3D spheres, 2D cells and both keys. |
| Has tests | a 2D card that tests cover | Violet `#8a5cff`, as halo, border and chip. |
| Attention and events | what is asked about, what is beyond, what changed in a commit | Opacity for attention; white for a changed file. |
| The interface itself | selected, active, focused, a link, a warning | One accent, `#0091ff`, read 90 times through its variable and written out as a literal 16 more; amber `#e9b86d` for the 3D button's cue; red for errors. |

## What is wrong, in a designer's terms

1. **One colour, several meanings.** `#0091ff` is the accent, the offering pin and the implementation kind: the same hex. Green is the using pin and the test file. Violet is "has tests" in 2D and a document in 3D, 8.7 apart. A warm orange is the directory, the 3D cue, a World Map mark and a badge. The term is **semantic colour**: a hue should answer one question, and here blue answers three.
2. **One meaning, several colours.** Offers is three blues and uses three greens across the wires, the pins and the World Map's doors; a test is green as a file and violet as a card's tests.
3. **The interface wears a data colour.** In a picture made of data the usual rule is that the **chrome is neutral**, so that every hue on the screen is information. Here the chrome's blue is the most used colour in the product.
4. **Colours that cannot be told apart by some readers.** In 3D a test and a directory are 2.5 apart under protanopia; an asset and an unknown file 2.2 under deuteranopia. Nobody chose these against each other.
5. **Marks and words below their floors.** The 2D pins stand at 1.8 to 1 and 2.4 to 1 against their card where 3 to 1 is asked of a mark; four of the eleven tones of text are under 4.5 to 1, one of them (3.3 to 1) used nineteen times.
6. **Colour that a stylesheet cannot reach.** 34 of the 83 live colours that state a fact live in TypeScript or shader code; only the World Map has a theme switch; two colour variables are read and never defined; seven tokens and five rules are dead.

## What the record already fixes

From [history.md](history.md), each with its source there. Blue offers and green uses at every scale, the colours an agent's choice that the owner ratified ("stick to it", 2025-12-03; "Offers!! I Like that!", 2026-09-29). A wire begins blue and ends green. One colour for every kind of relationship on a wire. Fade the irrelevant before boosting the relevant, the dimming moderate. Colours in theme variables with semantic meanings (the owner, 2025-12-06). 3D wires one colour, colour as the carrier of direction tried and withdrawn. A changed file stands out for its whole step. The World Map bright by default with a dark one on offer, its districts light blue for cloud and light orange for on-premises. Bright outside and dark inside as the default pairing. Closed directories' cells coloured by kind. And the owner's taste, in their words: "an overall color excess problem", "reduce the number of simultaneous colors", "colored by salient information that their eyes can learn and adjust to".

## The candidates

Both keep one hue for one meaning in every view, and differ only in ground and in step.

| Meaning | Night (dark) | Day (light) | Why this hue |
| --- | --- | --- | --- |
| Offers | `#23a1ef` | `#046aac` | Blue, by the standing rule. One value for wire, pin and door. |
| Uses | `#5ee7b5` | `#008e60` | Green, by the standing rule; stepped lighter than the blue so that the two also differ in lightness. |
| Implementation | `#a8b2c3` | `#848ea1` | The common case goes quiet: a cool grey. The owner's reading of 2026-11-16 found neutral "the best with respect to understandability". |
| Test, and has tests | `#8a5cff` | `#682fdd` | The violet the 2D cards already use, now for the test file as well. |
| Asset | `#db547e` | `#a52971` | The rose it has, stepped. |
| Document | `#f1d96e` | `#a28e09` | Off violet, which tests take; a paper yellow. The owner's first word for documents was "Muted gray"; a grey sand was measured and stood too near white and too near implementation. |
| Directory | `#e9984d` | `#bb4e11` | The orange it has. |
| Changed in this commit | `#ffffff` | `#111318` | White on dark; the darkest ink on light. |
| Selected, active, focused | `#f2f2f2` | `#111318` | Neutral, so that blue is never the interface. |
| The 3D button's cue | `#e9b86d` | `#a96800` | Amber, the one warning hue the chrome keeps. |
| Words, four tones | `#f2f2f2` `#d0d0d4` `#a6a6ad` `#8f8f97` | `#111318` `#2c323c` `#555d6b` `#646c7a` | Each at 4.5 to 1 or better on its card. |

Measured, every pair of the seven identity colours and white: Night, the closest pair 15.2 with full colour vision (offers and implementation) and 8.5 under red-green colour blindness (uses and document); Day, 15.3 and 8.2 (uses and document). Today's set: 0.0 (the offering pin and implementation) and 2.5.

**What makes a palette valid here,** the root's proposal: it fills every meaning; offers is its blue and uses its green; every pair of identity colours that can stand in one view clears 15 and 8; a mark stands at 3 to 1 on its ground and a word at 4.5 to 1; white, or the darkest ink, is kept for the event; and the chrome wears no hue but the amber of a warning.

## Not decided here

Which candidate becomes the default, and whether Today stays as a choice; whether a shared link carries the sender's palette or the palette is the viewer's own; whether the World Map and the Local Map keep separate choices, as "bright outside, dark inside" suggests; the World Map's six district tints, which stand 1.8 to 5.4 apart; and whether the four tinted type badges on a symbol's row keep their hues.

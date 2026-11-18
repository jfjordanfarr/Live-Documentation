# A palette for a file's kind that stays off the role colours: a probe, November 16, 2026 (UTC)

_Historical evidence. Taken by the root agent in [the November 15 session](../../../ChatHistory/2026/11/2026-11-15.1.record.md#turn-9), after the owner chose the closed directory's cells in the colours of a file's kind and then asked that their clash with the colours of a connection's role be resolved. These pictures are probes: the directory builder's build of that hour (its branch at `eabe3ddb` with work in progress), served read-only, with the cells' colours replaced by styles the root injected. Nothing here is product code, and the 3D map is not shown._

## What the pictures are

`scripts` opened in the 2D Local Map at reading size, 1,440 by 900 at device scale 2, Segoe UI's line metrics, cropped to the map. In each the wires keep the role colours (`#38bdf8` from what offers, `#34d399` to what uses) and only the cells change.

- [probe-three-palettes.png](probe-three-palettes.png): the three side by side.
- [probe-scripts-today.png](probe-scripts-today.png): the 3D map's colours as the builder drew them, implementation `#0091ff` and test `#28a745`.
- [probe-scripts-amber-violet.png](probe-scripts-amber-violet.png): implementation `#ff9f1c`, test `#8a5cff`, which is the violet the 2D cards already use for tests (the halo of `steps.mjs` and its chip in the same frame).
- [probe-scripts-neutral-violet.png](probe-scripts-neutral-violet.png): implementation `#c9d1dc`, test `#8a5cff`.

## What was measured

Distance between two colours in OKLab, times 100, by the method of the harness's data-visualisation skill and its validator: 15 is the floor for telling two colours apart with full colour vision, 8 the target under simulated red-green colour blindness (Machado, 2009, protanopia and deuteranopia at full severity).

| Pair, at full strength | Normal | Colour blind, the worse of the two |
| --- | --- | --- |
| Today: the offering blue and implementation's blue | 12.7 | 12.9 |
| Today: the using green and the test's green | 14.3 | 14.0 |
| Today, 3D map: a test and a directory's hub (`#e9984d`) | 23.7 | 2.5 |
| Amber and violet: the nearest pair of a kind and a role (the using green and amber) | 24.1 | 12.6 |
| Neutral and violet: the offering blue and the neutral | 16.1 | 10.4 |
| Neutral and violet: the using green and the neutral | 17.7 | 9.0 |

As the cells are drawn, at 42% over the skin beside wires at 70%: today's implementation cell stands 13.6 from a wire from what offers and today's test cell 15.8 from a wire to what uses; the neutral cell stands 11.1 and 13.7 from the two wires (4.4 under deuteranopia from the second), since a grey and a faded green are near in lightness; amber and violet keep every pair of a cell and a wire at 19.7 or more (8.5 under deuteranopia at the nearest, the amber cell and the wire to what uses). The root's scripts for these numbers were scratch and are not kept; the validator is the skill's own.

## What the root sees

Today's cells are handsome and say two things with the two colours the wires use for something else. Amber and violet reads as a second code at once, and its violet is the sign the 2D map already gives a test. Neutral and violet is the calmest and makes tests the only figure, at the price of the colour the owner liked and of the numbers above.

## What the owner saw

Shown the side-by-side picture ([Turn 11](../../../ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)): the probes "do not attempt to make consistent the coloring of these nodes inside the directories in 2D and 3D", where the 3D map holds the older half of the conflict; none shows "a directory with many different types of files (documentation, assets, tests, implementations)", and "We'd need to see that across a ton of views". Of the three: neutral with violet "is the best with respect to understandability of what's inside the directories", and today's blue and green "is the most aesthetically pleasing based on the surrounding screen area". Amber with violet, the root's pick, was named on neither count.

No palette was built from this probe. The cells landed in the 3D map's colours, and the question is open in [direction](../../../Memory/direction.md#open-with-the-owner).

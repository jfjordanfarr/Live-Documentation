# packages/explorer/src/client/views/localView/ladder-steps.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/ladder-steps.ts
- Generated At: 2026-11-10T22:19:02.034Z

## Authored
### Purpose

The card ladder's breakpoints for the 2D Local Map: maps the camera's zoom against the calibrated reading scale to a band, which says what leaves a slot card, and a step, which says how large what stays is drawn, each kept a margin past its edges; and gives a step's held scales for names and controls from the Text and Control Resistance levers. Pure, so that the controller writes the stylesheet only when a band or a step changes.

### Notes

Built in the breakpoint pass (2026-11-06) from the owner's [Turns 17 to 19](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6): "we will likely get better performance and a more intuitive viewing experience if we actually just sit down and make these scaled-designs as breakpoint-driven logic", and "Clamps as in 'prevent runaway goofy rendering results that emerge from extreme inputs'". The root's refinement, agreed: the bands (what leaves) stay coarse, and the held sizes step every 20 % of zoom, four steps to a doubling, below what the eye reads as a change; coarse size steps were rejected because names would shrink to half before snapping back. A step is centred on a whole number of steps out from reading scale, covering half a step either side, because the Zoom buttons move by exactly the step ratio: with edges at whole steps every press landed on an edge, the step shown depended on rounding, and the hysteresis made a press move none or two steps (measured on the payment card and `still-picture.ts` the same day); centred, each press moves exactly one. A step is kept a quarter step past its edges, so a held size on screen lies between 1.2^-0.75 (0.87) and 1.2^0.75 (1.15) of its reading size, inside the agreed floor of about four fifths. The first step covers every zoom closer than reading scale, so that zooming in never shrinks anything; the last, at a sixth of reading scale, holds its scales however far the camera goes. The band edges (0.25, 0.45, 0.74, 1.3 with a 15 % margin, 2026-11-05, Turn 9) moved here from the controller unchanged. The leap between steps snaps; whether it should ease is the owner's open call, and an ease would be a short transition on the stylesheet's transforms when `data-step` changes.

In the root's review of the far bands (2026-11-06) the band edges came to be derived from the presses rather than written as ratios: each stands between the last press of a band and the next press out, at that press's ratio over the square root of the band margin times the step ratio, the middle of the window in which a press out and the press back read the same band. With the literal edges one press out had been the reading band going out and the middle band coming back, and likewise at the far, overview and close edges, against the owner's rule that returning to a place keeps its picture. The overview band begins at the seventh press since the same review, where a file's header held one line and a row's name five letters beside its More. The restriction that kept this module out of the far bands' round was lifted for exactly these two changes.

Since 2026-11-10 the module also holds a trial beside the ladder, Tuning's Zoom Looks, from the root's design in [Turn 5 of the November 10 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-5) to test the owner's hypothesis of [2026-11-08, Turn 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-2) ("very very FEW breakpoints (2-3) for heavily quanitized different looks of the nodes"): `zoomLook` maps the same ratio to one of three looks, reading through the second press out, connections from the third to the sixth and overview from the seventh, with the bands' edge rule and margin (the two share `edgesAfter` and `stateOf`); `LOOK_BANDS` names the band whose stylesheet rules draw each look, and `LOOK_SCALES` its one held scale for names, controls and dots, 1, 2.2 and 3.6. Connections' 2.2 keeps a name on screen between 1.27 and 0.74 of its reading size across its presses, the design's aim of about 1.3 to 0.72; overview's was 4.5 by the same aim until the root's review of the trial's pictures (the same day), where the estate's narrow cards broke file names inside a word ("Paymen / t / Service / .cs"): whole words outrank the floor, and 3.6, about the ladder's seventh step, draws 1.0 to 0.58 with every name broken at its seams. The ladder stays the default; whether the looks replace it is the owner's call.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LadderBand (type)` {#symbol-ladderband-type}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L11)

##### `LadderBand (type)` — Summary
What a slot card shows, from the closest to the farthest.

#### `BAND_MARGIN` {#symbol-band_margin}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L15)

##### `BAND_MARGIN` — Summary
A band is re-entered closer only 15 % past its edge, so that a camera resting on one does not chatter.

#### `STEP_RATIO` {#symbol-step_ratio}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L18)

##### `STEP_RATIO` — Summary
The zoom between two steps: 20 %, four steps to a doubling, below what the eye reads as a change of size.

#### `STEP_HYSTERESIS` {#symbol-step_hysteresis}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L57)

##### `STEP_HYSTERESIS` — Summary
A step is left only a quarter step past its edges, so that a camera resting on one does not chatter.

#### `FIRST_STEP` {#symbol-first_step}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L59)

##### `FIRST_STEP` — Summary
The first step holds reading size and covers every closer zoom: zooming in never shrinks anything.

#### `LAST_STEP` {#symbol-last_step}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L61)

##### `LAST_STEP` — Summary
The last step, about a sixth of reading scale; farther out the card's held sizes stay and the card shrinks with the map.

#### `ladderBand (function)` {#symbol-ladderband-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L67)
- Returns: [`LadderBand`](#symbol-ladderband-type)
- Parameters: `previous`: [`LadderBand`](#symbol-ladderband-type)

##### `ladderBand (function)` — Summary
The band of a zoom ratio, given the band the map shows: farther out at an edge, closer again only past the margin.
A ratio that is not a positive number keeps the band.

#### `ZoomLook (type)` {#symbol-zoomlook-type}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L78)

##### `ZoomLook (type)` — Summary
The zoom looks, a trial beside the ladder (Tuning → 2D Layout → Zoom Looks; the owner's hypothesis of 2026-11-08, "very
very FEW breakpoints (2-3) for heavily quanitized different looks of the nodes", and the trial's design of 2026-11-10):
one state in place of the band and the step, so that a slot card changes only twice on the way out. Reading is the card
as composed at reading scale, everything following the map; connections is the far band's drawing (names, one More a
row, the file's name and its More) and overview the overview band's, each at one held scale for every zoom inside it.

#### `LOOK_BANDS` {#symbol-look_bands}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L86)

##### `LOOK_BANDS` — Summary
The ladder's band each look draws with: the stylesheet's rules for that band say what has left.

#### `LOOK_SCALES` {#symbol-look_scales}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L98)

##### `LOOK_SCALES` — Summary
Each look's one held scale for names, controls and dots, in the map's own units. Inside a look a name on screen is its
reading size times the zoom ratio times this scale; the design aimed at about 1.3 at the look's nearest press and 0.72
at its farthest. Connections spans presses 3 to 6 (ratios 0.579 to 0.335): 2.2 draws 1.27 to 0.74. Overview spans
presses 7 to 10 (0.279 to 0.162), where a file's name is the card's only text and a card is no wider than its rows
made it: whole words outrank the 0.72 floor (the root's review of the trial, 2026-11-10), since at 4.5, the aim's
scale, the estate's narrow cards broke names inside a word ("Paymen / t / Service / .cs"), so 3.6, about the ladder's
seventh step, which kept them whole, draws 1.0 to 0.58, a file's name still above 8 px at the tenth press. Reading
holds nothing.

#### `zoomLook (function)` {#symbol-zoomlook-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L104)
- Returns: [`ZoomLook`](#symbol-zoomlook-type)
- Parameters: `previous`: [`ZoomLook`](#symbol-zoomlook-type)

##### `zoomLook (function)` — Summary
The look of a zoom ratio, given the look shown: the band's edges and margin, so that a press out and the press back
show the same look and a camera resting on a press does not chatter. A ratio that is not a positive number keeps it.

#### `ladderStep` {#symbol-ladderstep}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L116)

##### `ladderStep` — Summary
The step of a zoom ratio, given the step shown (null before any): step n is centred on STEP_RATIO^-n, covering half a
step either side, and the step shown is kept until the ratio passes a quarter step beyond its edges either way. The
Zoom buttons move the camera by STEP_RATIO, so each of their steps lands in the middle of the next step, far from an
edge (with edges at whole steps, every click landed on one and the step it showed depended on rounding). Ratios closer
than the first step's far edge are the first step and farther than the last's near edge the last. A ratio that is
not a positive number keeps the step.

#### `LadderResistances` {#symbol-ladderresistances}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L131)

##### `LadderResistances` — Summary
The resistances of Tuning → 2D Layout: 0 follows the map, 1 holds the screen size the step began with.

#### `LadderScales (interface)` {#symbol-ladderscales-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L137)

##### `LadderScales (interface)` — Summary
A step's held scales, in the map's own units: what a name and a control are multiplied by while the step holds.

#### `ladderScales (function)` {#symbol-ladderscales-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/ladder-steps.ts#L150)
- Returns: [`LadderScales`](#symbol-ladderscales-interface)
- Parameters: `resistances`: [`LadderResistances`](#symbol-ladderresistances)

##### `ladderScales (function)` — Summary
The held scales of a step: at resistance 1 the reading screen size at the step's centre, STEP_RATIO to the step's
power, so that across the step and its margins a held size on screen lies between STEP_RATIO^-0.75 (0.87) and
STEP_RATIO^0.75 of its reading size; at 0 the map's own scale. A resistance outside 0 to 1 is read as its nearest end,
so no lever makes a runaway.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

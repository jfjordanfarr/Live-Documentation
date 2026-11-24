# `packages/explorer/src/client/views/localView/camera-intent.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/camera-intent.ts`
- Generated At: 2026-11-24T13:32:24.226Z

## Authored
### Purpose
The 2D camera's arithmetic and timing for the intent a gesture declares: where an arrival that frames the neighbours comes to rest, the hold and ease that take it there and the inputs that end them, and the least pan that brings a step's newcomer into view. Pure, so that the frame is a function of the picture and the view alone; the controller measures the page and moves the camera.

### Notes
Written on 2026-11-19 for the camera-intent round, from two requests of the owner's: on the hidden-file cells, "I might wish the camera followed the newly-opened one though, as I quickly lose it" (November 18), and, after blind testers all had to move the view before they could say what uses a file, "perhaps that's a reasonable best-of-both-worlds default? The user simply will not know that the deepest level of detail exists unless we show it to them" (November 19). A pre-timed zoom-out had been proposed on November 4 and not selected; the owner proposed it themself this time, and it is a Tuning choice, not the default, until the owner has seen it.

The floor of the neighbours' frame is the connections look's last press (`farthestRatioOf` in `ladder-steps.ts`), the farthest zoom at which every card's names still read; the timings are the three named constants here. A card larger than the view is entered at its top rather than shown by its name row at the view's far edge, a choice made in the building after the first pictures. The evidence is in [the camera-intent pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/camera-intent/README.md).

Since the night of 2026-11-19 it also holds the frame and the ease of a trial behind Tuning's Framing, Follows Pins: `pinsFrame` (the targets oldest first, the frame they fit at between reading scale and the same floor, the oldest left out until the rest fit, one target framed as an arrival frames it) and `framingEaseMs`, from the owner's [Turn 37 of the November 18 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37): "follow the sucker for a bit if the user hasn't provided input to navigate", "try to frame every pinned thing as best you can with bias towards most recent items". The floor is this module's, chosen because past it the overview silences a symbol's row. On this repository the floor is what stops the hoped-for pull back after a cell's press ([the follows-pins pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/camera-follows-pins/README.md)).

Since 2026-11-21 it holds the frames of a third trial, Tuning's Step, what the camera frames after a step, which the root briefed after blind testers that day answered from a cut-off view: `stepWholeFrame` (the whole newcomer, the scale kept where it fits, else eased out just far enough, never past the same floor and never in) and `stepLinesFrame` (the frame Fit would give the newcomer and the cards its lines reach). `cutByEdge` and `cutPan` are the arithmetic of Cut Counted, the lever beside Step: a count of what a step opened at each edge that cuts it, and the pan a press on that count makes, to the nearest of those cards whole ([`cut-signs.ts`](cut-signs.ts.mdmd.md)). Their unit cases include the boxes the page drew for `live-docs/history`. [The step-framing pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/README.md) are the evidence.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ARRIVAL_REST_S` {#symbol-arrival_rest_s}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L33)

##### `ARRIVAL_REST_S` — Summary
The default of Tuning's Arrival Rest: how long, in seconds, an arrival that pulls back stays on the subject at reading
size, at the least, once the picture has settled (the owner, 2026-11-22: "ensure a minimum of N seconds of reading view
size time, then permit immediate zoom-out when pointer exits node"). It was 0.9 s, fixed, from 2026-11-19, and the
probe of 2026-11-21 found a reader "pulled off" the words at that. The rest is not the time to read the card, which the
pointer or the focus on the card gives for as long as it stays: it is the time to see what stands there and to bring a
pointer to it. Counted from what a person does in it: about a quarter of a second to take in a new picture, the file's
name and the first words under it read at some four words a second (silent reading of English runs near 240 words a
minute), and a hand's move to a large card in the middle of the view, about half a second. That is near a second and a
half, and half a second more would begin to read as the page having stopped.

#### `ARRIVAL_EASE_MS` {#symbol-arrival_ease_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L35)

##### `ARRIVAL_EASE_MS` — Summary
How long the ease from reading size to the neighbours takes.

#### `arrivalReleased` {#symbol-arrivalreleased}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L45)
- Parameters: `waits`: [`ArrivalWait`](../../types.ts.mdmd.md#symbol-arrivalwait)

##### `arrivalReleased` — Summary
Whether an arrival's rest at reading size is over and its pull-back may begin (Tuning's Arrival Waits): `rested` is how
long the picture has stood settled, `rest` the least it stays (both in milliseconds), and `attended` whether a pointer
brought to the subject's card stands on it or the keyboard's focus is inside it. Under "attended" the pull-back begins
at the first moment the rest has passed and the card is not attended: at once when the pointer or the focus leaves a
card it stayed on past the rest, and at the rest's end where neither was ever there. Under "never" and "pointed" it
begins when the rest has passed; "pointed" starts the rest again while pointed at ({@link arrivalRestStartsAgain}).

#### `arrivalRestStartsAgain` {#symbol-arrivalreststartsagain}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L50)
- Parameters: `waits`: [`ArrivalWait`](../../types.ts.mdmd.md#symbol-arrivalwait)

##### `arrivalRestStartsAgain` — Summary
Whether the rest's clock starts again this frame: under "pointed", while the pointer stands on the subject's card.

#### `ArrivalLookChange (type)` {#symbol-arrivallookchange-type}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L60)

##### `ArrivalLookChange (type)` — Summary
Where an arrival's pull-back changes the cards' look (trials of 2026-11-21, after the owner's "the stutter of
performance as the stylesheet breakpoints were hit was jarring", the November 18 record's Turn 37): "crossing", where
the zoom crosses the look's edge, as since 2026-11-19, which restyles the whole map in the middle of the motion; "after",
the look held through the ease and changed once at rest at its end; "before", changed at rest at reading size, after the
hold and before the ease, which then runs in the look it ends in. Null for an arrival that does not pull back.

#### `arrivalLookChange (function)` {#symbol-arrivallookchange-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L63)
- Returns: [`ArrivalLookChange`](#symbol-arrivallookchange-type)
- Parameters: `arrival`: [`ArrivalFraming`](../../types.ts.mdmd.md#symbol-arrivalframing)

##### `arrivalLookChange (function)` — Summary
Where the pull-back of an Arrival choice changes the look; null where the choice does not pull back.

#### `ARRIVAL_LOOK_LEAD_MS` {#symbol-arrival_look_lead_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L73)

##### `ARRIVAL_LOOK_LEAD_MS` — Summary
How long a look changed before the ease stands still before the camera moves: past the end of the look's cross-fade,
which the controller takes off 200 ms after the change and which restyles the cards again (`morphLook`), and a few
frames more, so that the change's restyle and its fade's end both fall while nothing moves. At 200 ms the fade's end
fell on the ease's first frames (measured 2026-11-21: a frame of 1,017 ms restyling 2,366 elements on two slowed cores).

#### `STEP_MARK_MS` {#symbol-step_mark_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L76)

##### `STEP_MARK_MS` — Summary
How long a newcomer's outline is drawn emphasised, fading to its usual look.

#### `ARRIVAL_FLOOR_RATIO` {#symbol-arrival_floor_ratio}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L83)

##### `ARRIVAL_FLOOR_RATIO` — Summary
The farthest an arrival frames the neighbours, as a ratio of reading scale: the connections look's last press, the
farthest zoom at which every card's names still read (ladder-steps.ts). Farther, the overview look strips a card to its
file's name alone.

#### `FILES_FLOOR_RATIO` {#symbol-files_floor_ratio}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L90)

##### `FILES_FLOOR_RATIO` — Summary
The floor of Framing's "Follows Pins, Out To Files" (a matched alternative for the owner's eye, 2026-11-19): the
overview look's last press (presses 7 to 10, ladder-steps.ts), where a file's name is a card's only text. Used only when
every target is a whole-file pin, since past the connections look a pinned symbol's row is silenced.

#### `arrivalEndFrame` {#symbol-arrivalendframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L109)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `content`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `subject`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `arrivalEndFrame` — Summary
Where an arrival comes to rest when it frames the neighbours: what Fit frames (the whole picture, centred inside the
frame's padding), but never closer than reading scale and never farther than {@link ARRIVAL_FLOOR_RATIO} of it. Along
each axis independently, when the picture fits inside the frame at that scale (including inside the padding margin
when `k` is clamped up to `floor`) it is centred in the frame so both edges stay inside `[0, frame.width]` /
`[0, frame.height]` with symmetric margin rather than shoving one edge off-screen to preserve full padding on the
opposite side; when it overflows the frame, the subject is centred and clamped against the picture's bounds so no
dead void opens past one edge while cutting neighbours on the opposite edge. Content and subject are in the picture's
own units, the frame in the screen's; the result depends on nothing else, so that two screens of one size land on one
frame.

The frame holds what was asked ({@link holdAsked}; the root's rule of 2026-11-22, after a sweep of the browser suite on
the pull-back as the default found a tall file's name above the view and a symbol chosen in the search outside it):
`asked` is the subject's name, always, and the row asked for where one was, least particular first. Where the
neighbourhood cannot be shown with what was asked still in the frame, what was asked wins, and the neighbourhood is
what fits round it: a subject taller than the frame is entered at its top, as a step enters a tall card.

#### `holdAsked` {#symbol-holdasked}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L134)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `holdAsked` — Summary
The camera moved by the least pan, its scale kept, that brings what was asked inside the frame's padding: all of it
where it fits together, and where it does not, the more particular of it, the things asked dropped from the first (a
row asked for is kept before the name of the file it is in). What is already inside moves nothing. In the picture's
units.

Why the row and not the name, where a card is too tall for both (the root's ruling of 2026-11-22 on the builder's
choice): the row is what was asked for, and the file is still said on the page without its card's name in the frame,
by the search bar and by the context line under the sidebar.

#### `ArrivalPhase` {#symbol-arrivalphase}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L144)

##### `ArrivalPhase` — Summary
The arrival's moment: resting at reading size, easing back, or done.

#### `arrivalPose` {#symbol-arrivalpose}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L152)
- Parameters: `start`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `end`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `arrivalPose` — Summary
The camera of an arrival that eases back to the neighbours, `elapsed` milliseconds after its rest at reading size
(`start`) was over ({@link arrivalReleased}; negative while it rests): eased in and out to `end` over
{@link ARRIVAL_EASE_MS}. The scale is eased in its logarithm, so that the zoom reads as even; the point under the
frame's middle travels in a straight line between the two frames' middles.

#### `poseBetween` {#symbol-posebetween}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L163)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `start`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `end`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `poseBetween` — Summary
The camera a fraction `eased` of the way from `start` to `end`: the scale in its logarithm, so that a zoom reads as
even, and the picture's point under the frame's middle along a straight line between the two frames' middles.

#### `FramingTarget` {#symbol-framingtarget}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L178)

##### `FramingTarget` — Summary
One thing the camera frames when it follows the pins (Tuning → 2D Layout → Framing, Follows Pins; 2026-11-19): a
whole-file pin's card, a pinned symbol's row with its card's name line, so that a row is never framed without saying
whose it is, or the subject's card when nothing is pinned. In the picture's own units. A `card` alone is read as an
arrival reads it, at reading scale and entered at its top where it is taller than the room.

#### `PinsFraming` {#symbol-pinsframing}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L191)

##### `PinsFraming` — Summary
Where following the pins puts the camera, and which targets that frame holds and which it leaves out, oldest first.

#### `pinsFrame` {#symbol-pinsframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L206)
- Returns: [`PinsFraming`](#symbol-pinsframing)
- Parameters: `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `pinsFrame` — Summary
The frame that follows the pins, as a map application's tracking mode follows its blue dot. The targets come oldest
first. The frame is the smallest box that holds them, padded as Fit pads, at the largest scale that holds it, never
closer than `ceiling` (reading scale: text is never enlarged past it) and never farther than `floor`. Where the targets
do not fit at the floor, the oldest are left out one at a time until the rest fit; the newest is always held. One
target alone is the owner's "one pin": a card at the ceiling, entered at its top or left where it is larger than the
room, as an arrival frames it; any other target at the largest scale between floor and ceiling that holds it, entered
at its start where even the floor cannot. Null for no targets. Depends on its inputs alone.

#### `keepFrame` {#symbol-keepframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L229)
- Returns: [`PinsFraming`](#symbol-pinsframing)
- Parameters: `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `keepFrame` — Summary
The following camera's re-frame when the person changed nothing (root's ruling of 2026-11-19): the layout moved a held
target (the continuing search, a card grown by reading, an opening). It never zooms in and never drops a target it can
keep: from the camera as it stands it zooms out only as far as the held targets need, never past the floor, and pans
the least that shows them; where even the floor cannot hold them all it keeps the newest alone and says the rest are
left out. `held` is what the last frame held, oldest first.

#### `FRAMING_EASE_MIN_MS` {#symbol-framing_ease_min_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L279)

##### `FRAMING_EASE_MIN_MS` — Summary
The shortest a re-frame of the following camera eases.

#### `FRAMING_EASE_MAX_MS` {#symbol-framing_ease_max_ms}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L281)

##### `FRAMING_EASE_MAX_MS` — Summary
The longest a re-frame of the following camera eases.

#### `framingEaseMs` {#symbol-framingeasems}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L289)
- Parameters: `start`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `end`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `framingEaseMs` — Summary
How long a re-frame eases, growing with how far the camera goes: a quarter of a second for each doubling of scale, and
two fifths of a second for each frame's diagonal the frame's middle travels on screen at the lesser of the two scales,
from {@link FRAMING_EASE_MIN_MS} to {@link FRAMING_EASE_MAX_MS}. A short pull back is short; a long ride is not
made longer than the eye will follow.

#### `framingTravel` {#symbol-framingtravel}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L302)
- Parameters: `start`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `end`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `framingTravel` — Summary
How far a re-frame travels, in frames' diagonals on screen at the lesser of its two scales: past about one, a flat pan
crosses a view of empty map, and the following camera takes the smooth zoom's path instead.

#### `smoothZoom` {#symbol-smoothzoom}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L315)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `start`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `end`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `smoothZoom` — Summary
The smooth zoom's path between two cameras (van Wijk and Nuij, "Smooth and efficient zooming and panning", 2003; the
form of d3's `interpolateZoom`, rho = sqrt 2): the camera pulls back, travels and closes in, so that a long move is seen
as a short one from farther away. Never farther than `floor`; the returned `duration` grows with the path's length, from
{@link FRAMING_EASE_MIN_MS} to twice {@link FRAMING_EASE_MAX_MS}.

#### `sameCamera` {#symbol-samecamera}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L345)
- Parameters: `a`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `b`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)

##### `sameCamera` — Summary
Whether two cameras differ by less than the eye sees: half a pixel of pan and a thousandth of scale.

#### `easeInOutCubic` {#symbol-easeinoutcubic}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L350)

##### `easeInOutCubic` — Summary
Ease in and out, cubic.

#### `ARRIVAL_ENDING_INPUTS` {#symbol-arrival_ending_inputs}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L358)

##### `ARRIVAL_ENDING_INPUTS` — Summary
The input of a person's on the map that ends an arrival where it stands: their hand outranks the camera. A pointer
pressed, a wheel turned, a key pressed or a touch begun; a pointer that only passes over the map does not.

#### `arrivalEndedBy` {#symbol-arrivalendedby}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L370)
- Parameters: `waits`: [`ArrivalWait`](../../types.ts.mdmd.md#symbol-arrivalwait)

##### `arrivalEndedBy` — Summary
Whether one of {@link ARRIVAL_ENDING_INPUTS} ends an arrival where it stands. Every one does, but for a key that only
moves the focus while the arrival waits on attention ("attended"): there the focus is what holds the picture and what
lets it go, as the pointer is, so the key that carries it into the subject's card or out of it is not an act on the
picture (the owner, 2026-11-22, of gamepads: "their focus element is quantized rather than continuous"). Enter, Space,
Escape and every other key act, and end it.

#### `revealPan` {#symbol-revealpan}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L381)
- Parameters: `newcomer`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `revealPan` — Summary
The least pan, in the screen's pixels, that brings a newcomer wholly inside the frame's padding at the camera given.
Where the newcomer is larger than the room along an axis, its start is brought to the room's start along it, as a
page is entered at its top left: a card taller than the view is entered at its name row with as much of it below as
the view holds, and an opened directory at its label. A newcomer already inside does not move the camera. The
newcomer is in the picture's own units.

#### `STEP_FLOOR_RATIO` {#symbol-step_floor_ratio}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L399)

##### `STEP_FLOOR_RATIO` — Summary
The farthest a step's ease goes, as a ratio of reading scale (Tuning's Step, 2026-11-21): for now the arrival's floor,
the connections look's farthest press. Whether a step, which the person did not ask to change scale, should stop nearer
(two thirds of reading scale was tried beside it) is the owner's to decide by eye.

#### `stepWholeFrame` {#symbol-stepwholeframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L411)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `newcomer`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `stepWholeFrame` — Summary
Tuning → 2D Layout → Step "Whole" (a trial, root's brief of 2026-11-21): after a step, the whole newcomer (the opened
directory's box, or the new card) inside the frame's padding. Where it fits at the camera's scale, the scale is kept and
the least pan brings it in (*object constancy*: what was pressed keeps its size); where it does not, the camera eases out
just far enough to hold it, never in, and only where some scale at or above `floor` holds it whole: an ease costs the
person their place and their reading size, and is worth it only when it delivers the whole (the root's ruling on the
first pictures, 2026-11-21, where a folder eased out to the floor still did not show). Null where the floor cannot hold
it: the step then does what Least Pan does. Scaled about the frame's middle, then the least pan, as the following
camera's re-frame is. In the picture's units.

#### `stepLinesFrame` {#symbol-steplinesframe}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L427)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `reach`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `newcomer`: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds); `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `stepLinesFrame` — Summary
Tuning → 2D Layout → Step "With Its Lines" (a trial, 2026-11-21): after a step, the frame Fit would give the newcomer
and the cards its lines reach (`reach`, which holds the newcomer): centred, at the largest scale that holds it, never
closer than `ceiling` (reading scale), where some scale at or above `floor` holds it; else Whole's frame of the newcomer
alone; else null, and the step does what Least Pan does.

#### `ViewEdge` {#symbol-viewedge}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L434)

##### `ViewEdge` — Summary
An edge of the view.

#### `VIEW_EDGES` {#symbol-view_edges}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L437)

##### `VIEW_EDGES` — Summary
Every edge, in the order the signs are drawn and read: left, right, top, bottom.

#### `cutByEdge` {#symbol-cutbyedge}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L445)
- Parameters: `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `cutByEdge` — Summary
Tuning → 2D Layout → Cut Counted (a trial, 2026-11-21): of the newcomer's cards (in the picture's units), those not
wholly in view at the camera given, each at the one edge it reaches farthest past on screen, so that the counts sum to
the cards that are cut (the root's ruling: counted at every edge it went past, a folder up and to the right of the view
said 31, 27 and 4 for 32 cards, and a person adds the numbers). An edge past which nothing goes is absent.

#### `cutPan` {#symbol-cutpan}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L469)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `edge`: [`ViewEdge`](#symbol-viewedge); `camera`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](./layout-measure.ts.mdmd.md#symbol-frame)

##### `cutPan` — Summary
Where a sign at an edge takes the camera when pressed: the least pan, the scale kept, that brings the nearest of the
cards cut there wholly inside the frame's padding (a card taller or wider than the room entered at its start), the
nearest being the one that reaches least far past that edge, then the one nearest the frame's middle across it. One
card at a time, so that a press always lands on one of them whole and the next press goes on to the next; a pan along
the edge's axis alone to all of them at once was tried first (2026-11-21) and, where they lay up and to the right of
the view, landed on other cards with none of them whole.

#### `unionOf` {#symbol-unionof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts#L487)
- Returns: [`Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds)

##### `unionOf` — Summary
Every box given as one, in the same units; null for none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ArrivalFraming`](../../types.ts.mdmd.md#symbol-arrivalframing) (type-only)
- [`types.ArrivalWait`](../../types.ts.mdmd.md#symbol-arrivalwait) (type-only)
- [`ladder-steps.STEP_RATIO`](./ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`ladder-steps.farthestRatioOf`](./ladder-steps.ts.mdmd.md#symbol-farthestratioof)
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds) (type-only)
- [`layout-measure.Frame`](./layout-measure.ts.mdmd.md#symbol-frame) (type-only)
- [`layout-measure.clamp`](./layout-measure.ts.mdmd.md#symbol-clamp)
- [`layout-measure.framePadding`](./layout-measure.ts.mdmd.md#symbol-framepadding)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

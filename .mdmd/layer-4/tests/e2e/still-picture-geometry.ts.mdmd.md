# tests/e2e/still-picture-geometry.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/still-picture-geometry.ts
- Generated At: 2026-10-06T20:39:27.003Z

## Authored
### Purpose

The geometry under the still-picture deck's expanded measures, pure so that Vitest can hold each number to a drawing it can see: wires crossing wires, wires sharing a channel, the flow of a wire from its offering end to its using end, whether a card's nearest neighbour shares its folder, and the greedy tour that plans the pans needed to see every drawn fact. The page reading that feeds it is `still-picture.ts`; the measures are defined in [the still-picture deck](../../../../AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md) under "The expanded deck".

### Notes

- A crossing is an intersection of two sampled paths more than 24 px from either wire's ends, so two wires leaving one pin are not crossing at their stub, at an angle of at least 15 degrees, so two wires weaving inside one cable are a shared channel rather than a crossing. A meeting at a sample point counts only when the two wires' directions out of it, read from their neighbouring samples, alternate around it: a wire sampled exactly through another is not missed, while two wires drawn along one path, as the members of a Local Map bundle are, cross nowhere, and two that part from one point cross nowhere either; until 2026-10-05 every bend sample of such a pair counted, and the first measurement of the bundles read thousands of crossings that were not there ([Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-9)). One crossing seen by up to four segment pairs is counted once, and `spots` counts the distinct places within 4 px, so a cable of many wires crossed once reads as one. The score also reports the points more than 80 px from both wires' ends, which tells a crossing in the open from one in the fan at a pin; an overlay of the counted points on the live pages settled both refinements on 2026-10-01.
- A shared channel is a run of more than 40 px within 6 px of another wire, beyond the stubs. Flow forgives a stub-sized step back (24 px) and not a detour. Folder adjacency measures the gap between boxes, not between centers, and a tie counts.
- The tour aims each pan at a not-yet-seen fact, takes the pan that makes the most facts legible, prefers a pan that keeps a card in view, and breaks ties by the shortest pan; a fact under reading size or wider than the frame is unreachable by panning and is reported as such. Segments are bucketed on a 32 px grid so the pair tests stay cheap over two hundred wires.
- Built on 2026-10-01 for the measures the owner's reading of the first scoreboard added ([Turn 8](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-8)). The crossing finder tests each pair of segments sharing a grid cell once, by a numeric key, after a bounding-box rejection; it had made a string key for every pair, which cost the layout lab 2.9 of the 3 seconds of an evaluation (2026-10-06), and the change left its counts and its tests as they were.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Point` {#symbol-point}
- Type: type
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L8)

##### `Point` — Summary
The geometry under the still-picture deck's expanded measures: crossings, shared channels, flow, folder
adjacency and the tour. Pure, so that Vitest can hold each number to a drawing it can see. The page reading
that feeds these lives in `still-picture.ts`; the measures are defined in
`AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md` under "The expanded deck".

#### `Box` {#symbol-box}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L10)

#### `Polyline` {#symbol-polyline}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L18)

##### `Polyline` — Summary
A wire as a sampled polyline in screen coordinates, from its first drawn end to its last.

#### `FAR_FROM_PINS_PX` {#symbol-far_from_pins_px}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L26)

##### `FAR_FROM_PINS_PX` — Summary
Beyond this distance from a wire's ends, a crossing is in the open rather than in the fan where many wires leave one pin.

#### `arcLengths` {#symbol-arclengths}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L39)

##### `arcLengths` — Summary
The arc position of each point along its polyline, in px.

#### `intersectionOf` {#symbol-intersectionof}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L91)
- Returns: [`Point`](#symbol-point)
- Parameters: `a`: `Straight`; `b`: `Straight`

##### `intersectionOf` — Summary
Where two segments meet, or null. Ends count, so a wire sampled exactly through another is not missed; collinear
overlap is a shared channel, not a crossing, and returns null.

#### `CrossingScore` {#symbol-crossingscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L104)

#### `angleBetween` {#symbol-anglebetween}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L118)
- Parameters: `a`: `Straight`; `b`: `Straight`

##### `angleBetween` — Summary
The angle between two segments' directions, in degrees from 0 to 90.

#### `Crossing` {#symbol-crossing}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L126)

#### `findCrossings` {#symbol-findcrossings}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L142)
- Returns: [`Crossing`](#symbol-crossing)[]

##### `findCrossings` — Summary
Every crossing of two wires, more than `endExclusionPx` from either wire's ends, at an angle of at least
`minAngleDeg`. Two wires that merge at a shallower angle are a shared channel, which test 8 counts; without the
angle, every weave inside a cable counted as a crossing and the number stopped meaning what the eye sees. A
crossing is a crossing: either each segment reaches across the other, or the wires meet at a sample point and
their directions out of it alternate around it. Two wires drawn along one path, which touch at every sample,
cross nowhere, and two that part from one point cross nowhere either (2026-10-05, when the Local Map began to
bundle the wires of one pin and the old count read every bend of a bundle as crossings).

#### `crossings` {#symbol-crossings}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L212)
- Returns: [`CrossingScore`](#symbol-crossingscore)

##### `crossings` — Summary
Test 7, summarized: points, spots, pairs of wires and wires taking part.

#### `ChannelScore` {#symbol-channelscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L228)

#### `sharedChannels` {#symbol-sharedchannels}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L236)
- Returns: [`ChannelScore`](#symbol-channelscore)

##### `sharedChannels` — Summary
Test 8: wires that share a channel, running within `withinPx` of another for more than `minRunPx`, beyond their stubs.

#### `FlowReading` {#symbol-flowreading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L278)

#### `flowOf` {#symbol-flowof}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L286)
- Returns: [`FlowReading`](#symbol-flowreading)

##### `flowOf` — Summary
Test 9: one wire's flow, from its offering end to its using end.

#### `CardPlace` {#symbol-cardplace}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L299)

#### `boxGap` {#symbol-boxgap}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L306)
- Parameters: `a`: [`Box`](#symbol-box); `b`: [`Box`](#symbol-box)

##### `boxGap` — Summary
The gap between two boxes, 0 when they touch or overlap.

#### `AdjacencyScore` {#symbol-adjacencyscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L312)

#### `folderAdjacency` {#symbol-folderadjacency}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L320)
- Returns: [`AdjacencyScore`](#symbol-adjacencyscore)

##### `folderAdjacency` — Summary
Test 10: folder adjacency over the whole drawing.

#### `TourFact` {#symbol-tourfact}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L339)

#### `TourPan` {#symbol-tourpan}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L348)

#### `TourPlan` {#symbol-tourplan}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L356)

#### `planTour` {#symbol-plantour}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-geometry.ts#L374)
- Returns: [`TourPlan`](#symbol-tourplan)
- Parameters: `frame`: [`Box`](#symbol-box)

##### `planTour` — Summary
Test 15: a greedy tour. Each pan is at most `maxPanX` by `maxPanY` and aims a not-yet-seen fact at the frame's
center; the pan that makes the most facts legible wins, a pan that keeps a card in view beats one that does not,
and the shortest pan breaks the tie. A pan toward a fact that is still too far to arrive is a step, not a waste.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

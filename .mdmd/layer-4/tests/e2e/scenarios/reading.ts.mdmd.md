# tests/e2e/scenarios/reading.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/scenarios/reading.ts
- Generated At: 2026-11-18T19:06:10.608Z

## Authored
### Purpose
The shape of a reading: what one settled picture of the 2D Local Map says, as data, so that the scenario suite's judgments can be pure functions and their tests can build pictures by hand.

### Notes
The middle of the three layers of the browser tests' scenario suite, after [the owner's proposal](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-8) of 2026-11-17 and [the frame they accepted](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#roots-reply-to-turn-11-as-delivered): a scenario (a map and an address), a reading of the settled page, and judgments over readings. Every box is in screen pixels. A field is added only when a judgment needs it and the instrument can read it from the page; nothing reaches a reading through a side channel. First written on 2026-11-18 for [the slice's brief](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-scenario-suites-builder-dispatched).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Box` {#symbol-box}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L14)

##### `Box` — Summary
What one settled picture of the 2D Local Map says, as data: the middle layer of the scenario suite.

A scenario is a map and an address; a reading is what the page shows once it has settled there; judgments are pure
functions over readings (`judgments.ts`). This module holds only the reading's shape, so that the judgments and
their unit tests can build readings by hand without a browser. The instrument that fills it from the page is
`instrument.ts`; it reuses the still-picture instrument's wire and card reading and the design audit's text faults,
and adds only what those do not read (directories, lanes, the frame and its edge signs, wire styles, anchors).

Every box is in screen pixels (CSS pixels of the page, after the camera's transform), as `getBoundingClientRect`
gives it.

#### `CardRead` {#symbol-cardread}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L22)

##### `CardRead` — Summary
A drawn file card.

#### `AnchorRead` {#symbol-anchorread}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L35)

##### `AnchorRead` — Summary
A symbol's dot on a card's edge, where its wires meet the card.

#### `WireKind` {#symbol-wirekind}
- Type: type
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L46)

##### `WireKind` — Summary
What a drawn wire is.

#### `WireRead` {#symbol-wireread}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L56)

#### `DirectoryRead` {#symbol-directoryread}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L76)

##### `DirectoryRead` — Summary
One directory as the renderer published it: its segments, column by column, and the cards it holds directly.

#### `LaneRead` {#symbol-laneread}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L89)

##### `LaneRead` — Summary
A gap the map reserves for wires passing a column.

#### `TextFault` {#symbol-textfault}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L96)

##### `TextFault` — Summary
A text fault the design audit found.

#### `ToneRead` {#symbol-toneread}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L106)

##### `ToneRead` — Summary
The colour facts the tone promises are read from, already reduced to contrast ratios against their surfaces.

#### `NameRead` {#symbol-nameread}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L121)

##### `NameRead` — Summary
A name as drawn: its text and the lines it stands on, top to bottom.

#### `Reading` {#symbol-reading}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/reading.ts#L126)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

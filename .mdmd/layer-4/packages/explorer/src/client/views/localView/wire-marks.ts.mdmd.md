# `packages/explorer/src/client/views/localView/wire-marks.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/wire-marks.ts`
- Generated At: 2026-11-21T09:00:48.031Z

## Authored
### Purpose
Where Tuning → 2D Wires → Direction Marks, a trial, stands its chevrons on a 2D wire and how each is drawn: one at the wire's middle, and on a long wire one in the middle of each equal stretch of about 320 px, none near an end; *Along* pointing from what is offered to what uses it, *Against* the other way. Pure: it walks the wire's own path commands, so that [`connections.ts`](connections.ts.mdmd.md) writes the chevrons into the wire's path, where they take its colour, opacity and fading, without asking the page for geometry.

### Notes
- Made on November 21, 2026, from the root's brief ([the probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/line-direction/README.md)). *Against*, the dependency arrow's convention, runs against the owner's rule ("we should always always always draw **from** blue … **to** green", 2025-12-04) and is in the trial only to learn which convention a stranger brings; the lever's help says so.
- The first build measured each wire through the page (`getTotalLength`, `getPointAtLength`). Opening `views/localView` from `controller.ts`, 498 wires, then held the page in one task of 137 seconds during the move, which draws the wires every frame. The marks now walk the path's commands in the module, each curve in 16 straight pieces.
- A mark's arms grow with the wire's width, so that it shows past a gathered wire's line. The pictures are [the line-direction evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/line-direction/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MARK_SPACING` {#symbol-mark_spacing}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L19)

##### `MARK_SPACING` — Summary
How far apart a long wire's marks stand, in the map's own pixels: about the width of a gutter and a card, so that a
wire threaded past a column keeps one in sight while a wire across one gutter has only its middle's.

#### `MARK_MARGIN` {#symbol-mark_margin}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L22)

##### `MARK_MARGIN` — Summary
How near a wire's end a mark may stand, in the map's own pixels: clear of the pins, where the wires of a row crowd.

#### `MarkPoint` {#symbol-markpoint}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L25)

##### `MarkPoint` — Summary
A point, or a heading, in the wires' overlay.

#### `markStations` {#symbol-markstations}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L35)

##### `markStations` — Summary
Where a wire's marks stand, as distances along it from its offering end: one at its middle, and on a wire longer than
twice the spacing, one in the middle of each of the equal stretches the spacing divides it into, so that the marks are
evenly spread and none stands within the margin of an end. A wire too short to hold a mark clear of both ends has none.

#### `markSize` {#symbol-marksize}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L43)

##### `markSize` — Summary
A mark's size, the length of each arm, for a wire of the given width: larger on a gathered wire, so that it shows past the line.

#### `chevron` {#symbol-chevron}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L52)
- Parameters: `at`: [`MarkPoint`](#symbol-markpoint); `heading`: [`MarkPoint`](#symbol-markpoint)

##### `chevron` — Summary
One mark as path commands: an open chevron whose point stands at `at` and points along `heading` (the wire's way from
its offering end, or, against, the reverse), its two arms swept back at forty-five degrees. A heading of no length
draws nothing.

#### `pathPoints` {#symbol-pathpoints}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L73)
- Returns: [`MarkPoint`](#symbol-markpoint)[]

##### `pathPoints` — Summary
A path's commands walked as a line of points: its first subpath only, `M` then any of `L`, `C` and `Q` in absolute
coordinates, each curve cut into {@link CURVE_PIECES} straight pieces. Anything else ends the walk.

#### `markStrokes` {#symbol-markstrokes}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts#L111)

##### `markStrokes` — Summary
A wire's marks as path commands to write after its own: a chevron at each of {@link markStations} along the walked
path, pointing along the piece it stands on, or against it; empty where the wire holds none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

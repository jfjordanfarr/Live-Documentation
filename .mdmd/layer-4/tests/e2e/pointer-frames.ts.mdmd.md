# `tests/e2e/pointer-frames.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/pointer-frames.ts`
- Generated At: 2026-11-19T21:10:23.596Z

## Authored
### Purpose
What each frame of the page showed under the pointer, read by the page itself at every animation frame, so that a browser case can say that no frame of a sweep showed words, rather than only the frame it happened to look at: the 3D map's actions, a wire's words, the pointing hand and its faintest sphere, and the World Map's peek, fade and door names. With it, a sweep paced by the page's own frames and a wait for the pointer to rest on a 3D node.

### Notes
- Written on November 19, 2026 for the pointer's rest ([Turn 22 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-22)); used by `world-map.spec.ts`, `force-graph-focus.spec.ts` and `force-graph-directories.spec.ts`. A sweep is paced by animation frames, sixteen pixels a frame, about a thousand pixels a second, rather than by timers. `restsOn` waits on the page's own state, the pointing hand and then the node's actions, never on a bare sleep.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PointerFrame` {#symbol-pointerframe}
- Type: interface
- Source: [source](../../../../tests/e2e/pointer-frames.ts#L8)

##### `PointerFrame` — Summary
What each frame of the page showed under the pointer, read by the page itself at every animation frame, so that a
case can say that no frame of a sweep showed words, not merely the frame it happened to look at (2026-11-19, the
pointer's rest). Only what is drawn as words or as a fade is read, and the sign that a thing can be pressed.

#### `recordFrames` {#symbol-recordframes}
- Type: function
- Source: [source](../../../../tests/e2e/pointer-frames.ts#L27)
- Parameters: `page`: `Page`

##### `recordFrames` — Summary
Start reading every frame, for the life of the page.

#### `framesDuring` {#symbol-framesduring}
- Type: function
- Source: [source](../../../../tests/e2e/pointer-frames.ts#L74)
- Parameters: `page`: `Page`

##### `framesDuring` — Summary
The frames drawn from just before `act` until two frames after it.

#### `restsOn` {#symbol-restson}
- Type: function
- Source: [source](../../../../tests/e2e/pointer-frames.ts#L88)
- Parameters: `page`: `Page`

##### `restsOn` — Summary
Whether the pointer, held where it is, comes to rest on the 3D map's node `id`: the pointing hand says at once that
something is under it, and the node's actions show once the pointer has rested (2026-11-19). False when nothing is
under the pointer, or another node's actions show instead, within `timeout`.

#### `sweepThrough` {#symbol-sweepthrough}
- Type: function
- Source: [source](../../../../tests/e2e/pointer-frames.ts#L100)
- Parameters: `page`: `Page`

##### `sweepThrough` — Summary
Sweep the pointer through some points at an ordinary pace without stopping: `pixels` a step and one step a frame,
paced by the page's own frames, about a thousand pixels a second at sixteen pixels and sixty frames a second.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
<!-- LIVE-DOC:END Dependencies -->

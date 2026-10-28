# packages/explorer/src/client/views/forceGraphReveal.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphReveal.ts
- Generated At: 2026-10-28T18:59:46.863Z

## Authored
### Purpose
Decides the order in which the 3D Local Map's spheres enter the picture and how many enter at each tick, so that the page and the headless easing reveal a picture the same way.

### Notes
Built on 2026-10-28 for the T3 bundle, where the 3D Local Map could not start: [the diagnosis of 2026-10-27](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-27.1.SUMMARIZED.md#turn-6) found the view simulating 21,720 spheres at once, and the owner chose a gradual reveal for 3D, and not for the 2D Local Map whose membership is bounded by the question ([Turn 2 of the October 28 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-2)). The order is the agent's design put to the owner the same day: the attention set first, then what the pulling links reach a layer at a time, most connected first and ties by id, then the next most connected part when the reach runs out, so that what a person asked about is on screen first and the context grows around it, which is what keeps their bearings. The growth is a fixed share of what is shown with a floor, so that the reveal takes a number of ticks logarithmic in the size and always completes (the owner's floor, [Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-3), accepted in [Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-4)); the frame rate is the pacing's to hold, not the growth's. The constants in `REVEAL` are the starting values of that day, to be measured in the layout lab and judged in pictures ([the day's pictures](../../../../../../../AI-Agent-Workspace/Screenshots/2026-10-28/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RevealSettings` {#symbol-revealsettings}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L19)

##### `RevealSettings` — Summary
How a reveal runs: the size of the first piece, the share and the least that enter at every later tick, and how many ticks the first piece settles hidden before the rest enters.

#### `REVEAL` {#symbol-reveal}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L31)
- Returns: [`RevealSettings`](#symbol-revealsettings)

##### `REVEAL` — Summary
The reveal's constants, starting values of 2026-10-28 to be measured in the layout lab and judged in pictures: a first
piece of 300 spheres, a tenth more at every tick and ten at the least, after the hundred hidden ticks the library has
given the first picture since 2026-10-03 (`6b881f00`).

#### `revealOrder` {#symbol-revealorder}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L42)
- Parameters: `attention`: `ReadonlySet`; `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `revealOrder` — Summary
The ids of `nodes` in the order they enter the picture. `attention` names the spheres a person asked about; those
among the nodes enter first, most connected first, then every sphere a pulling link reaches from what has entered, a
layer at a time, each layer most connected first and ties by id, so that the order is the same on every machine. When
the reach runs out, the most connected sphere not yet entered starts the next part, until every node has entered. Which
links pull is the caller's to say, as the layout rules it.

#### `nextRevealCount` {#symbol-nextrevealcount}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L84)

##### `nextRevealCount` — Summary
How many spheres are shown after the next tick of a reveal: `shown` plus the greater of `share` of it and `least`,
never past `total`. A share of a tenth from a first piece of a few hundred reaches twenty thousand in some fifty ticks.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink) (type-only)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode) (type-only)
<!-- LIVE-DOC:END Dependencies -->

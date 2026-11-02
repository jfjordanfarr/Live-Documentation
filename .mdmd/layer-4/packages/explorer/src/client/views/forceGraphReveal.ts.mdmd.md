# packages/explorer/src/client/views/forceGraphReveal.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphReveal.ts
- Generated At: 2026-11-02T06:07:14.680Z

## Authored
### Purpose
Decides the order in which the 3D Local Map's spheres enter the picture, in layers by hops, and how many enter at each frame, so that the page and the headless easing reveal a picture the same way.

### Notes
Built on 2026-10-28 for the T3 bundle, where the 3D Local Map could not start: [the diagnosis of 2026-10-27](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-27.1.SUMMARIZED.md#turn-6) found the view simulating 21,720 spheres at once, and the owner chose a gradual reveal for 3D, and not for the 2D Local Map whose membership is bounded by the question ([Turn 2 of the October 28 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-2)). The order is the agent's design put to the owner the same day, by hops: what a person asked about first, then what the connecting links reach a layer at a time, most connected first and ties by id, then the next most connected part when the reach runs out, so that what a person asked about is on screen first and the context grows around it, which is what keeps their bearings. Since 2026-10-31 (discovery, [Turn 4 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)) the order is in layers (`revealLayers`): what was asked about directly as one layer, and its own connections as the next, wherever they stand, since a first piece of a pinned file beside an unconnected hub of an open directory flew apart in the hidden warm-up and the picture crept for seventeen hundred frames where the headless easing took three hundred (found 2026-10-31 by the preset check); an open directory's files by hops within the directory from what has entered and then from its most connected file, part by part, the files no link joins to another member last together, so that a directory opened whole unfurls from its hub; then the hops beyond; then the islands, most connected first and the unconnected last together, the owner's "stragglers, weird islands, and orphans, appear very last in the drawing order". The pace changed the same day: a share of the whole at every frame, the tuning's Reveal Frames, so that a picture of fifteen spheres and one of twenty thousand both enter over the same frames and the hops read as waves; until then the first piece was up to 300 spheres and a tenth more entered at every frame with a floor of ten (the owner's floor, [Turn 3 of the October 28 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-28.1.record.md#turn-3)), which was in before the eye could follow it. `REVEAL` keeps the hundred hidden ticks of the first piece's warm-up.

The [November 2 directory journey](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-8--continue-until-the-directory-exploration-journey-is-ready-for-new-users) adds counterpart priority for a 2D/3D handoff: already-visible file cards and closed folders are promoted within the existing reveal membership before it is captured. Shown members remain shown, out-of-scope identities are ignored, and no pin is added. Cold anchoring waits for all requested members to enter.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RevealSettings` {#symbol-revealsettings}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L26)

##### `RevealSettings` — Summary
What a reveal is paced by: how many ticks the first piece settles hidden before the rest enters.

#### `REVEAL` {#symbol-reveal}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L31)
- Returns: [`RevealSettings`](#symbol-revealsettings)

##### `REVEAL` — Summary
The reveal's constants: the hundred hidden ticks the library has given the first picture since 2026-10-03 (`6b881f00`).

#### `RevealAttention` {#symbol-revealattention}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L34)

##### `RevealAttention` — Summary
What a person asked about: directly, each thing on its own, and as a set, the files of an open directory.

#### `revealLayers` {#symbol-reveallayers}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L49)
- Parameters: `attention`: [`RevealAttention`](#symbol-revealattention); `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `revealLayers` — Summary
The ids of `nodes` in the order they enter the picture, in layers: the asked-about spheres among the nodes as the
first layer, and their own connections as the second; the members by hops within the members from what has entered
and then from their most connected, each part when the reach runs out starting a new layer, the members no link joins
to another member last together; then every sphere a connecting link reaches from what has entered, a layer a hop;
then, when the reach runs out, the most connected sphere not yet entered starting the next part, the spheres no link
reaches at all last together. Each layer most connected first and
ties by id, so that the order is the same on every machine. Which links connect is the caller's to say, as the
layout rules it. No layer is empty.

#### `revealOrder` {#symbol-revealorder}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L101)
- Parameters: `attention`: `ReadonlySet`; `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `revealOrder` — Summary
The order the layers give, flat: the attention set as what was asked about directly.

#### `revealCorresponding` {#symbol-revealcorresponding}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L107)
- Parameters: `counterparts`: `ReadonlySet`

##### `revealCorresponding` — Summary
Carry already-visible 2D identities into the first 3D picture, retaining membership and the order of everything else.

#### `nextRevealCount` {#symbol-nextrevealcount}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphReveal.ts#L118)

##### `nextRevealCount` — Summary
How many spheres are shown after the next frame of a reveal: `shown` plus a share of `total` such that the whole
enters in `frames` frames, at least one sphere a frame, never past `total`. A picture of fifteen spheres and one of
twenty thousand both enter over the same number of frames.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink) (type-only)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode) (type-only)
- [`forceGraphScope.connectedNeighbours`](./forceGraphScope.ts.mdmd.md#symbol-connectedneighbours)
- [`forceGraphScope.mostConnectedFirst`](./forceGraphScope.ts.mdmd.md#symbol-mostconnectedfirst)
<!-- LIVE-DOC:END Dependencies -->

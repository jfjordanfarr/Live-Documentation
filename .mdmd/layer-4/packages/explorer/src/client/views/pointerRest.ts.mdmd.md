# packages/explorer/src/client/views/pointerRest.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/pointerRest.ts
- Generated At: 2026-11-19T02:09:37.389Z

## Authored
### Purpose
When a pointer has rested on a thing, as pure functions the 3D map ([`forceGraphView.ts`](forceGraphView.ts.mdmd.md)) and the World Map ([`controller.ts`](worldMap/controller.ts.mdmd.md)) share: what a moving pointer touches shows at once only that it can be pressed, and a thing's words and the fading of the rest wait until the pointer has rested on it. The design system names it *hover intent* ([Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md)).

### Notes
- Made on November 19, 2026, for the owner's words after blind testers who were models wished for more words under the pointer ([Turn 22 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-22)): "What I don't want to have is an application which is shooting random text at me every which way as I scroll my mouse across the screen (which it most certainly does in the 3D local map ...)", and their "words are only warranted on a modestly long hover".
- A rest is a pointer held within `REST_TOLERANCE` (4 px) of where it began for `REST_DWELL` (350 ms, 21 frames at sixty a second); a drift past the tolerance starts it again, so no sweep rests whatever the dwell. Every thing waits afresh: there is no "warm" shortcut by which a rest on one thing lets the next show its words at once. Once rested, a pointer moving about on the same thing keeps it.
- Only the pointer's own movement starts a rest again: a picture moving under a still pointer neither starts it again nor ends it, and what stands under the pointer when the dwell is reached is rested on. The first build of the rule held such a thing back until the pointer moved; a sphere flickering with its wrapper under a still pointer in a drifting picture then never rested, and the root's brief had said that the picture's motion is the building rule's business. Whether anything may begin at all while the 3D map builds is the building rule's, [`forceGraphBuilding.ts`](forceGraphBuilding.ts.mdmd.md), which this sits beside.
- The dwell was weighed against 250 and 500 ms by frame counts, not by building each; [the pictures](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/rested-pointer/README.md) say how.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `REST_DWELL` {#symbol-rest_dwell}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L24)

##### `REST_DWELL` — Summary
Milliseconds a pointer must rest on a thing before its words show: 21 frames at sixty a second. Weighed on 2026-11-19
against 250 (15 frames) and 500 (30). A rest is a pointer held within `REST_TOLERANCE`, so no sweep rests, whatever
the dwell; the dwell decides whether a hand that hesitates on its way somewhere is shown words. At 250 a quarter
second's hesitation, as a hand turns, would be; at 500 a deliberate rest waits half a second, as long as a slow
tooltip. 350 stands between, the owner's "modestly long hover".

#### `REST_TOLERANCE` {#symbol-rest_tolerance}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L27)

##### `REST_TOLERANCE` — Summary
Pixels a resting pointer may drift from where its rest began and still be resting.

#### `RestPoint` {#symbol-restpoint}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L30)

##### `RestPoint` — Summary
A point on the screen, in the page's pixels.

#### `PointerRest` {#symbol-pointerrest}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L39)

##### `PointerRest` — Summary
The pointer's rest: the thing under it (`null` for nothing), where the pointer was last seen, and where and when the
pointer last came to a stop (`since` null before the pointer has been seen).

#### `NO_REST` {#symbol-no_rest}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L47)
- Returns: [`PointerRest`](#symbol-pointerrest)

##### `NO_REST` — Summary
No pointer seen.

#### `restAt` {#symbol-restat}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L53)
- Returns: [`PointerRest`](#symbol-pointerrest)
- Parameters: `previous`: [`PointerRest`](#symbol-pointerrest); `at`: [`RestPoint`](#symbol-restpoint)

##### `restAt` — Summary
The rest after a look at the pointer at `now`: `on` is what lies under it now, `at` where it stands. A look may come
from a pointer event or from a frame that redrew the picture under a pointer that stayed where it was.

#### `restedOn` {#symbol-restedon}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L66)
- Parameters: `rest`: [`PointerRest`](#symbol-pointerrest)

##### `restedOn` — Summary
The thing the pointer has rested on at `now`, if any.

#### `restsAt` {#symbol-restsat}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pointerRest.ts#L71)
- Parameters: `rest`: [`PointerRest`](#symbol-pointerrest)

##### `restsAt` — Summary
When the pointer will have rested on what it is on, if it keeps still; null when it is on nothing.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

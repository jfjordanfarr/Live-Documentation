# packages/explorer/src/client/views/forceGraphBuilding.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphBuilding.ts
- Generated At: 2026-11-15T23:38:50.892Z

## Authored
### Purpose
The rule for what a pointer may do on the 3D Local Map's nodes while the map builds, as pure functions the view applies: when a building begins and ends, when the map says so, and whether a hover or a press may begin. The view, [`forceGraphView.ts`](forceGraphView.ts.mdmd.md), feeds it the map's work each frame and shows the result on the container's `data-building`.

### Notes
- Made on November 15, 2026, for the owner's decision ([Turn 4 of that day's record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-4)): "not allowing hover or click interactions on the nodes as the map gets built ... should be replaced only when it's not good enough". It replaced the Still Pointer trial of November 11 (three Tuning modes, never merged), whose pure-function shape it keeps.
- Building is what a person sees as the map being built: a body packing, the reveal bringing spheres in, a perspective change into the 3D map, or a change of what is shown, and the camera's framing flight, which continues a building but never begins one (a Fit is a camera move). A lull under `BUILDING_HOLD` (200 ms) does not end it, so that packing then a reveal are one building and the sign does not flicker; the sign waits `BUILDING_SIGN_DELAY` (300 ms).
- Building is deliberately not the settle that `aria-busy` says. Measured on the base before it was built, the settle ran some 22 s at 60 frames a second after a seed click on the estate while the picture last visibly moved after about 3 s ([the measurements](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-15/building-map/README.md)); a map that refused a click for that long would be worse than the fault.
- A pointer that has not moved since building began may hover nothing, during the build or in the drift after it, until it moves; a press acts whenever the map is not building, since a press is the pointer's own act.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BUILDING_HOLD` {#symbol-building_hold}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L15)

##### `BUILDING_HOLD` — Summary
Milliseconds a lull in the work must last before building ends, so that packing then a reveal are one building.

#### `BUILDING_SIGN_DELAY` {#symbol-building_sign_delay}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L18)

##### `BUILDING_SIGN_DELAY` — Summary
Milliseconds building must last before the map shows that it is building.

#### `Building` {#symbol-building}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L21)

##### `Building` — Summary
When the current building began, and when its work last stopped, if it has; both null when the map is not building.

#### `NOT_BUILDING` {#symbol-not_building}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L27)
- Returns: [`Building`](#symbol-building)

##### `NOT_BUILDING` — Summary
The map at rest.

#### `BuildingWork` {#symbol-buildingwork}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L34)

##### `BuildingWork` — Summary
What the map is doing now: `work` is a body packing, the reveal bringing spheres in, a perspective change or a change
of what is shown; `flight` is the camera's framing flight, which continues a building and never begins one, since a
Fit or a step toward a file is a camera move, not a building.

#### `nextBuilding` {#symbol-nextbuilding}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L40)
- Returns: [`Building`](#symbol-building)
- Parameters: `previous`: [`Building`](#symbol-building); `_unnamed_`: [`BuildingWork`](#symbol-buildingwork)

##### `nextBuilding` — Summary
The building after a look at the map's work at `now`.

#### `buildingPhase` {#symbol-buildingphase}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L49)
- Parameters: `building`: [`Building`](#symbol-building)

##### `buildingPhase` — Summary
Whether the map is building, and whether it has built long enough to say so: no sign for a quick update.

#### `nodePointer` {#symbol-nodepointer}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphBuilding.ts#L59)

##### `nodePointer` — Summary
What a pointer may begin on a node of the map, a sphere, a name, a shell, a bubble or an action: a hover only when the
map is not building and the pointer has moved since building last began; a press whenever the map is not building,
since a press is the pointer's own act. A press while building is dropped, never kept for later.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

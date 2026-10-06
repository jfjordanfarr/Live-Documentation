# packages/explorer/src/client/views/localView/branch-placement.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-placement.ts
- Generated At: 2026-10-06T15:18:09.661Z

## Authored
### Purpose

Places the cards and lanes of a retained Local Map exploration on the vertical axis, in the order the sweep chose, so that the wires between pins are as short as the constraints allow: the coordinate-assignment step of layered drawing, solved exactly by `network-simplex.ts` on the auxiliary graph of Gansner, Koutsofios, North and Vo.

### Notes

- The objective is the owner's reward of 2026-10-05, the total length of the drawn connectors across a frame ([Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-12)), as the weighted sum of the vertical distances between the two pins of every wire, since the columns fix the horizontal spans; a bundle's shared run weighs its member count. A wire becomes an auxiliary node both pins stand above by their offsets on their items, so the cheapest place for it is the lower pin and the cost is the distance to the other.
- The constraints: the order within each column with a gap between neighbours; every directory's box around its members with the room its label and padding take, and around its subdirectories' boxes; and sibling boxes that share a column standing in their rows, one wholly above the other, by the band gap. Beneath the wires every box's height costs one unit against a wire's million, so boxes are tight around their members and no wire is ever traded for a box.
- A lane is a box of the bands whose items are its slots, one per bundle, and it stands in its column's stack by its edges. The slots keep the order the sweep chose, each at least its own height, the lane's pitch, below the one above, and a slot is placed by the wires through it as a card is, so the lane's edges follow its first and last slots at the lane's padding and a lane is as tall as its wires ask. Until 2026-10-06 a lane was one rigid item, a block of slots at pitch, so its heavy slots decided where its light ones went; on this repository's five-file scope document.ts's thirteen bundles dropped 173 px into the lane before boardGraph.ts and climbed 160 px out again ([Turn 14](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-05.1.SUMMARIZED.md#turn-14) of the October 5 session). A lane named in a column that is no box of the bands is refused, since its edges would float free of its slots.
- Pure, with no DOM. Heights, offsets and gaps are CSS pixels of the unscaled page, rounded to integers; `branch-renderer.ts` measures them and reads the tops back. Tested for the stacked start, the lowered card, the heavier bundle, the nested boxes and the stacked siblings, tight boxes, a lane standing in a stack at its gaps, slots spread to the wires through them, slots pulled past each other that keep their order and pitch, the refused lane, never costing more than the stack, and determinism.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Pin` {#symbol-pin}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L33)

##### `Pin` — Summary
A place on an item where a wire ends: the item and the distance from its top.

#### `PlacementWire` {#symbol-placementwire}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L39)

##### `PlacementWire` — Summary
A wire between two pins, weighted by how many references it draws.

#### `PlacementBand` {#symbol-placementband}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L46)

##### `PlacementBand` — Summary
A directory's box: its members, its subdirectories, the room its label and padding take, and its place among its siblings.

#### `PlacementLane` {#symbol-placementlane}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L62)

##### `PlacementLane` — Summary
A lane in a column's stack: a box of `bands`, whose items are the lane's slots and whose insets are its padding.

#### `StackEntry` {#symbol-stackentry}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L70)
- Returns: [`PlacementLane`](#symbol-placementlane)

##### `StackEntry` — Summary
One thing in a column's stack: a card by its item id, or a lane.

#### `PlacementInput` {#symbol-placementinput}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L73)

##### `PlacementInput` — Summary
What the placement takes.

#### `Placement` {#symbol-placement}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L88)

##### `Placement` — Summary
The placement: every item's top, every box's edges, and the objective.

#### `placementCost` {#symbol-placementcost}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L100)
- Parameters: `top`: `ReadonlyMap`

##### `placementCost` — Summary
The weighted sum of the wires' vertical distances at given tops; a wire whose pin is unplaced costs nothing.

#### `placeBranches` {#symbol-placebranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-placement.ts#L111)
- Returns: [`Placement`](#symbol-placement)
- Parameters: `input`: [`PlacementInput`](#symbol-placementinput)

##### `placeBranches` — Summary
Places the items; see the module note.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`network-simplex.Constraint`](./network-simplex.ts.mdmd.md#symbol-constraint)
- [`network-simplex.rankByNetworkSimplex`](./network-simplex.ts.mdmd.md#symbol-rankbynetworksimplex)
<!-- LIVE-DOC:END Dependencies -->

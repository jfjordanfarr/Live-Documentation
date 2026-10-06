# packages/explorer/src/client/views/localView/branch-scene.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-scene.test.ts
- Generated At: 2026-10-06T19:32:25.174Z

## Authored
### Purpose

Holds the scene's plan and layout to a small exploration with a page of fixed sizes standing in for the browser.

### Notes

Three files in two directories, one reference skipping a column: the plan has a box per directory, every card inside a drawn directory with the padding and border as its inset, one lane in the skipped column hosted by the directory that holds the provider, and the column's stack holding the card and the lane. The layout is checked against arithmetic: the column widths from the widest card with its insets, the lefts a gap apart, the measurer asked once for widths with no cap and once for heights at each card's column width less its insets and each label at its segment's width, the directory's top inset the inset plus the label's height, the cards inside their segments, four wires with two through the lane's slot at its middle line, the slot line at the lane's padding plus the middle pixel, and the placement's cost equal to the cost of the returned wires at the returned tops. A third test caps the cards' widths through the measurer and takes the gap and padding from the tuning.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-placement.placementCost`](./branch-placement.ts.mdmd.md#symbol-placementcost)
- [`branch-scene.BAND_BORDER`](./branch-scene.ts.mdmd.md#symbol-band_border)
- [`branch-scene.DEFAULT_SCENE_TUNING`](./branch-scene.ts.mdmd.md#symbol-default_scene_tuning)
- [`branch-scene.SLOT_LINE`](./branch-scene.ts.mdmd.md#symbol-slot_line)
- [`branch-scene.SceneMeasurer`](./branch-scene.ts.mdmd.md#symbol-scenemeasurer)
- [`branch-scene.hostOf`](./branch-scene.ts.mdmd.md#symbol-hostof)
- [`branch-scene.layoutScene`](./branch-scene.ts.mdmd.md#symbol-layoutscene)
- [`branch-scene.planBranches`](./branch-scene.ts.mdmd.md#symbol-planbranches)
- [`branches.buildBranches`](./branches.ts.mdmd.md#symbol-buildbranches)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](../pin-state.ts.mdmd.md#symbol-addpin)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

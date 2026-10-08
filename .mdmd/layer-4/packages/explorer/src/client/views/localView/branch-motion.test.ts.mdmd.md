# packages/explorer/src/client/views/localView/branch-motion.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-motion.test.ts
- Generated At: 2026-10-07T02:59:51.424Z

## Authored
### Purpose
Holds the pose and the tween: the pose's keys and places from a real scene, the tween's midpoint and its ends, a membrane whose columns change, and the ease.

### Notes
- Builds the three-file scene of the scene tests with a fixed-size measurer for `scenePose`, then hand-made poses for `tweenPose`, so that every number is checkable by hand: a kept card halfway between its places, a new card at its place, a gone card left out, a membrane's box moving while its outline snaps when its columns differ.
- A directory opening and closing in place (2026-10-08): the membrane grows from its box's rectangle and the box shrinks from its membrane's; the poses carry heights since that day.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-motion.Pose`](./branch-motion.ts.mdmd.md#symbol-pose)
- [`branch-motion.boxKeyOf`](./branch-motion.ts.mdmd.md#symbol-boxkeyof)
- [`branch-motion.easeInOutCubic`](./branch-motion.ts.mdmd.md#symbol-easeinoutcubic)
- [`branch-motion.scenePose`](./branch-motion.ts.mdmd.md#symbol-scenepose)
- [`branch-motion.tweenPose`](./branch-motion.ts.mdmd.md#symbol-tweenpose)
- [`branch-scene.DEFAULT_SCENE_TUNING`](./branch-scene.ts.mdmd.md#symbol-default_scene_tuning)
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

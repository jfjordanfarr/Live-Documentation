# packages/explorer/src/client/views/localView/zoom-limits.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/zoom-limits.test.ts
- Generated At: 2026-11-06T20:08:42.553Z

## Authored
### Purpose

Vitest cases for the farthest zoom: a map that fits the frame stops at the last step, a map too large stops where it stands whole with its margin, the limit falls continuously with the map's size, nothing is known before the first layout, and an extreme reading scale never puts the limit closer than the closest zoom; and a camera ten presses out reads as standing at the last step whatever its rounding.

### Notes

Written with the module in the far bands' second milestone (2026-11-06, [Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)). A case that first expected the closest zoom for a tiny map at an extreme reading scale was wrong about the fit, which caps itself at 1; it now holds the bound that is true.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ladder-steps.LAST_STEP`](./ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.STEP_RATIO`](./ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`zoom-limits.CLOSEST_SCALE`](./zoom-limits.ts.mdmd.md#symbol-closest_scale)
- [`zoom-limits.WHOLE_MAP_MARGIN`](./zoom-limits.ts.mdmd.md#symbol-whole_map_margin)
- [`zoom-limits.atScale`](./zoom-limits.ts.mdmd.md#symbol-atscale)
- [`zoom-limits.farthestScale`](./zoom-limits.ts.mdmd.md#symbol-farthestscale)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

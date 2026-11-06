# packages/explorer/src/client/views/localView/ladder-steps.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/ladder-steps.test.ts
- Generated At: 2026-11-06T09:34:11.969Z

## Authored
### Purpose

Vitest cases for the card ladder's breakpoints: the steps, their hysteresis and clamps, the bands, and the held scales from the resistances.

### Notes

Written with the module in the breakpoint pass (2026-11-06, [Turns 17 to 19](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-17--november-6)): the cases name a step for each 20 % of zoom, centred on whole steps, move exactly one step for each Zoom button press whatever the rounding, keep it a quarter step past either edge and through a trembling camera, jump straight to a far step, clamp at the first and last step and keep the step for a ratio that is not a positive number; the band edges and their margin; and the held scales at resistance 1, 0 and between, with the step's bounds on screen (0.87 to 1.15) and the levers read at their nearest end.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ladder-steps.FIRST_STEP`](./ladder-steps.ts.mdmd.md#symbol-first_step)
- [`ladder-steps.LAST_STEP`](./ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.STEP_HYSTERESIS`](./ladder-steps.ts.mdmd.md#symbol-step_hysteresis)
- [`ladder-steps.STEP_RATIO`](./ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`ladder-steps.ladderBand`](./ladder-steps.ts.mdmd.md#symbol-ladderband-function)
- [`ladder-steps.ladderScales`](./ladder-steps.ts.mdmd.md#symbol-ladderscales-function)
- [`ladder-steps.ladderStep`](./ladder-steps.ts.mdmd.md#symbol-ladderstep)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

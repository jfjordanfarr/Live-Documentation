# packages/explorer/src/client/history/tick-model.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/tick-model.test.ts
- Generated At: 2026-10-18T05:36:01.422Z

## Authored
### Purpose
Tests of the tick model: the positions by step and by date, the reading of a position back to a step, the calendar periods, the weights of the ticks with and without pins, the salient and grouped granularities, the automatic choice by the budget, the stops the step key moves between, and the ruler's labels.

### Notes
- Written 2026-10-18 with the module, for the plan's C4 and C14. The cases are a five-day history, a history with a quiet half-year between October 2025 and April 2026, three years of ten commits a day for the automatic rule, and years for the ruler's unit; a commit date earlier than its predecessor's is among them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`tick-model.TICK_BUDGET`](./tick-model.ts.mdmd.md#symbol-tick_budget)
- [`tick-model.automaticGranularity`](./tick-model.ts.mdmd.md#symbol-automaticgranularity)
- [`tick-model.nextStop`](./tick-model.ts.mdmd.md#symbol-nextstop)
- [`tick-model.periodOf`](./tick-model.ts.mdmd.md#symbol-periodof)
- [`tick-model.positionOfStep`](./tick-model.ts.mdmd.md#symbol-positionofstep)
- [`tick-model.rulerOf`](./tick-model.ts.mdmd.md#symbol-rulerof)
- [`tick-model.stepAtPosition`](./tick-model.ts.mdmd.md#symbol-stepatposition)
- [`tick-model.tickModel`](./tick-model.ts.mdmd.md#symbol-tickmodel-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

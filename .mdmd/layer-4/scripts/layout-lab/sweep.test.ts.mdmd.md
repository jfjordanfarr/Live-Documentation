# scripts/layout-lab/sweep.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/sweep.test.ts
- Generated At: 2026-10-06T20:39:26.040Z

## Authored
### Purpose

Holds the sweep's grid, sampling, sensitivity, scoring and Pareto front.

### Notes

A grid of lists, ranges and `none` parses and an unknown lever is refused; one lever at a time skips the baseline's own value; a small grid is walked whole and a large one sampled by its seed, the baseline first, nothing twice, the same for a seed and different between seeds; the score follows the weights and a signal the baseline lacks counts double; the levers a configuration moved are named; the front keeps only the rows no other beats.
The grid accepts the simplicity lever, and the weighted-score cases give distinct values to unevenness, step count and row misalignment so a missing term changes the expected result. These extend the [original lab tests](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-10) for the [October 13 shared shape work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`evaluate.LEVERS`](./evaluate.ts.mdmd.md#symbol-levers)
- [`evaluate.baselineConfig`](./evaluate.ts.mdmd.md#symbol-baselineconfig)
- [`report.differences`](./report.ts.mdmd.md#symbol-differences)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- [`sweep.configurations`](./sweep.ts.mdmd.md#symbol-configurations)
- [`sweep.oneAtATime`](./sweep.ts.mdmd.md#symbol-oneatatime)
- [`sweep.paretoFront`](./sweep.ts.mdmd.md#symbol-paretofront)
- [`sweep.parseGrid`](./sweep.ts.mdmd.md#symbol-parsegrid)
- [`sweep.parseWeights`](./sweep.ts.mdmd.md#symbol-parseweights)
- [`sweep.scoreOf`](./sweep.ts.mdmd.md#symbol-scoreof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

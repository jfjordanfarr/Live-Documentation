# scripts/layout-lab/sweep.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/sweep.ts
- Generated At: 2026-10-06T20:39:26.055Z

## Authored
### Purpose

The configurations a run tries and how they are scored: a grid over the levers' values, sampled by a seed when large, the baseline and each lever alone, the weighted score and the Pareto front.

### Notes

A grid spec names each lever's values (`lever=a,b;lever=none,1..4`); the default grid gained `orderStarts` (0, 4, 8) with the restarts of 2026-10-06, and a configuration with restarts on lays out every start before its routes are drawn once; the whole grid is walked when it is no larger than the limit, else the limit's worth is drawn by mulberry32 from the seed, the baseline first and nothing twice. Each lever alone from the baseline is the report's sensitivity table. The score is the weighted sum of the signals as fractions of the baseline's, the owner's order of 2026-10-06 as the default weights (length first, the membranes' concerns behind); a signal the baseline has none of counts double when it appears. The Pareto front is the rows no other beats on both the length and the crossing spots.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LeverValues` {#symbol-levervalues}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L13)

##### `LeverValues` — Summary
A lever and the values a run tries for it.

#### `DEFAULT_GRID` {#symbol-default_grid}
- Type: const
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L19)

##### `DEFAULT_GRID` — Summary
The first grid: the levers at the values the design has stood at and around them.

#### `parseGrid` {#symbol-parsegrid}
- Type: function
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L24)
- Returns: [`LeverValues`](#symbol-levervalues)[]

##### `parseGrid` — Summary
`lever=a,b,c;lever=none,1..4`: lists, `none` for null, `a..b` for every integer between.

#### `configKey` {#symbol-configkey}
- Type: const
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L42)

##### `configKey` — Summary
A configuration's identity: its levers' values in order.

#### `random` {#symbol-random}
- Type: function
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L45)

##### `random` — Summary
A small deterministic generator (mulberry32).

#### `oneAtATime` {#symbol-oneatatime}
- Type: function
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L57)
- Parameters: `baseline`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)

##### `oneAtATime` — Summary
Each lever varied alone from the baseline, in the grid's order.

#### `configurations` {#symbol-configurations}
- Type: function
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L69)
- Returns: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)[]
- Parameters: `baseline`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)

##### `configurations` — Summary
The whole grid when it is no larger than `limit`, else `limit` configurations drawn from it by the seed; the baseline is always first.

#### `Weights` {#symbol-weights}
- Type: type
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L100)

##### `Weights` — Summary
Weights on the signals, each a fraction of the baseline's value per unit of weight.

#### `DEFAULT_WEIGHTS` {#symbol-default_weights}
- Type: const
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L103)
- Returns: [`Weights`](#symbol-weights)

##### `DEFAULT_WEIGHTS` — Summary
The owner's order of 2026-10-06: the length first, the membranes' concerns behind it.

#### `parseWeights` {#symbol-parseweights}
- Type: function
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L106)
- Returns: [`Weights`](#symbol-weights)

##### `parseWeights` — Summary
Weights from `name=value,...`; the defaults when nothing is given.

#### `scoreOf` {#symbol-scoreof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L119)
- Parameters: `signals`: [`Signals`](./signals.ts.mdmd.md#symbol-signals); `baseline`: [`Signals`](./signals.ts.mdmd.md#symbol-signals); `weights`: [`Weights`](#symbol-weights)

##### `scoreOf` — Summary
A configuration's score: the weighted sum of its signals as fractions of the baseline's; the baseline scores the sum of the weights.

#### `paretoFront` {#symbol-paretofront}
- Type: function
- Source: [source](../../../../scripts/layout-lab/sweep.ts#L129)
- Returns: `T`[]

##### `paretoFront` — Summary
The configurations no other beats on both the length and the crossing spots.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`evaluate.LEVERS`](./evaluate.ts.mdmd.md#symbol-levers)
- [`evaluate.LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
<!-- LIVE-DOC:END Dependencies -->

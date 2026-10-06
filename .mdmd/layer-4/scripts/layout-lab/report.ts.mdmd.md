# scripts/layout-lab/report.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/report.ts
- Generated At: 2026-10-06T20:39:25.926Z

## Authored
### Purpose

A run's report as markdown a person reads and as JSON the next analysis loads.

### Notes

The capture's date and warnings, the drift check, the baseline's signals, each lever alone in its own table, the twelve best by the weighted score with only the levers they moved named, the trade between length and crossings, and what the numbers are.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReportRow` {#symbol-reportrow}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/report.ts#L16)

##### `ReportRow` — Summary
One configuration's signals and the time its solve took.

#### `RunReport` {#symbol-runreport}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/report.ts#L23)

##### `RunReport` — Summary
Everything a run found, for the markdown and the JSON.

#### `differences` {#symbol-differences}
- Type: function
- Source: [source](../../../../scripts/layout-lab/report.ts#L43)
- Parameters: `config`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig); `baseline`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)

##### `differences` — Summary
The levers of a configuration that differ from the baseline, as `lever=value`.

#### `renderMarkdown` {#symbol-rendermarkdown}
- Type: function
- Source: [source](../../../../scripts/layout-lab/report.ts#L56)
- Parameters: `report`: [`RunReport`](#symbol-runreport); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `renderMarkdown` — Summary
The run as a person reads it.

#### `toJson` {#symbol-tojson}
- Type: function
- Source: [source](../../../../scripts/layout-lab/report.ts#L91)
- Parameters: `report`: [`RunReport`](#symbol-runreport)

##### `toJson` — Summary
The run as the next analysis loads it, the scope reduced to its names.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`evaluate.LEVERS`](./evaluate.ts.mdmd.md#symbol-levers)
- [`evaluate.LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun) (type-only)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals) (type-only)
- [`sweep.Weights`](./sweep.ts.mdmd.md#symbol-weights)
- [`sweep.paretoFront`](./sweep.ts.mdmd.md#symbol-paretofront)
- [`sweep.scoreOf`](./sweep.ts.mdmd.md#symbol-scoreof)
<!-- LIVE-DOC:END Dependencies -->

# packages/explorer/src/client/history/step-summary.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/step-summary.test.ts
- Generated At: 2026-10-18T05:36:01.378Z

## Authored
### Purpose
Tests of the step summary: a rename step with its files under their new names and the directory whole, a death step with "gone since" and the shape before, a born file that stands today, the base, and a file today's bundle lacks.

### Notes
- Written 2026-10-18 with the module, for the plan's C4, over a sequence built with the engine's `SequenceBuilder` so that the summary is read from a real sequence rather than a hand-made change.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`format.CommitInfo`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`format.HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`sequence.SequenceBuilder`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-sequencebuilder)
- [`sequence.seek`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`Shape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeKey`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-edgekey)
- [`step-summary.changeCount`](./step-summary.ts.mdmd.md#symbol-changecount)
- [`step-summary.stepSummary`](./step-summary.ts.mdmd.md#symbol-stepsummary-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

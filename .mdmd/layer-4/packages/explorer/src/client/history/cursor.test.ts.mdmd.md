# packages/explorer/src/client/history/cursor.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/cursor.test.ts
- Generated At: 2026-10-18T05:36:01.136Z

## Authored
### Purpose
Tests of the cursor: where it starts, a seek back with the renames across the span, the deltas forward one step or several, a merge into a standing directory read as no rename, and the refusals.

### Notes
- Written 2026-10-18 with the module, for the plan's C4; its first run corrected the author's expectation that a directory half-moved before the cursor's step is renamed whole across the rest of its move, which the rule rightly reads as a merge, since the new directory already stood.

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
- [`shape.shapeDifferences`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shapedifferences)
- [`cursor.HistoryCursor`](./cursor.ts.mdmd.md#symbol-historycursor)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

# packages/engine/src/live-docs/history/sequence.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/history/sequence.test.ts
- Generated At: 2026-10-18T00:39:19.088Z

## Authored
### Purpose
Vitest over the sequence and its codec: the replay of every step by seek, a keyframe every 256 steps and a seek that uses it, interning and empty lists left out, a rename the shapes contradict not believed, the head, and every kind of change through the tables and back.

### Notes
- Written 2026-10-17 for C1. The keyframe's use is shown by emptying the deltas it stands for: a seek that replayed from the base would then give the wrong shape.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`codec.Interner`](./codec.ts.mdmd.md#symbol-interner)
- [`codec.decodeChange`](./codec.ts.mdmd.md#symbol-decodechange)
- [`codec.decodeShape`](./codec.ts.mdmd.md#symbol-decodeshape)
- [`codec.encodeChange`](./codec.ts.mdmd.md#symbol-encodechange)
- [`codec.encodeShape`](./codec.ts.mdmd.md#symbol-encodeshape)
- [`format.CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo)
- [`format.HistoryLens`](./format.ts.mdmd.md#symbol-historylens)
- [`format.HistorySource`](./format.ts.mdmd.md#symbol-historysource)
- [`format.KEYFRAME_INTERVAL`](./format.ts.mdmd.md#symbol-keyframe_interval)
- [`sequence.SequenceBuilder`](./sequence.ts.mdmd.md#symbol-sequencebuilder)
- [`sequence.changeAt`](./sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.commitAt`](./sequence.ts.mdmd.md#symbol-commitat)
- [`sequence.headOf`](./sequence.ts.mdmd.md#symbol-headof)
- [`sequence.seek`](./sequence.ts.mdmd.md#symbol-seek)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeKey`](./shape.ts.mdmd.md#symbol-edgekey)
- [`shape.shapeDifferences`](./shape.ts.mdmd.md#symbol-shapedifferences)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

# packages/engine/src/live-docs/history/queries.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/history/queries.test.ts
- Generated At: 2026-10-18T05:36:00.490Z

## Authored
### Purpose
Vitest over the sequence's headless questions: a commit by a prefix of its id, what changed between two commits through every rename between, the walk from a shape's entry marks by the pathfinder, and a file at a commit with its wires.

### Notes
- Written 2026-10-17 for C9. The walk is also run without the shape's marks, to show that the pathfinder alone would find only the test.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`format.CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`queries.changesBetween`](./queries.ts.mdmd.md#symbol-changesbetween-function)
- [`queries.entryMarked`](./queries.ts.mdmd.md#symbol-entrymarked)
- [`queries.fileOfShape`](./queries.ts.mdmd.md#symbol-fileofshape)
- [`queries.followChanges`](./queries.ts.mdmd.md#symbol-followchanges)
- [`queries.graphOfShape`](./queries.ts.mdmd.md#symbol-graphofshape)
- [`queries.stepsMatching`](./queries.ts.mdmd.md#symbol-stepsmatching)
- [`sequence.SequenceBuilder`](./sequence.ts.mdmd.md#symbol-sequencebuilder)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.edgeKey`](./shape.ts.mdmd.md#symbol-edgekey)
- [`shape.emptyChange`](./shape.ts.mdmd.md#symbol-emptychange)
- [`versionControl.VersionChanges`](./versionControl.ts.mdmd.md#symbol-versionchanges) (type-only)
- [`pathfind.reachability`](../pathfind.ts.mdmd.md#symbol-reachability-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

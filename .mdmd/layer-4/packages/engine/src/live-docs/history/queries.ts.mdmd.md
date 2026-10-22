# packages/engine/src/live-docs/history/queries.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/queries.ts
- Generated At: 2026-10-22T16:47:53.263Z

## Authored
### Purpose
The questions a sequence answers headlessly: which step a commit is by a prefix of its id, what a file was at a commit with its wires, the graph a commit's shape makes for the pathfinder with the shape's entry marks, and what changed between two commits with each file followed through every rename between.

### Notes
- Written 2026-10-17 for C9 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), the headless twin: "what the scrubber shows, the CLI answers in text and JSON". `inspect --at` and `--between` read it.
- Every answer is from the shape alone: the graph it makes has no symbols, no Entry lines and no edge kinds, and a file's `docPath` is where its doc stood at that commit. The walk from the entries hands the shape's entry marks to `reachability`, since the files it makes carry no Entry lines.
- Between two commits a file renamed twice is one rename, a file born and dead between them is neither, and an edge that followed its files' renames neither comes nor goes.

`followChanges` and the directories renamed whole across a span (2026-10-18, for the Explorer's C4 in [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): the composition of a run of consecutive changes over the files that stood before them, which `changesBetween` was doing inline, is a function of its own so that the Explorer's cursor can compose the renames of a move the same way; and `ChangesBetween` gains `directoriesRenamed`, the directories renamed whole across the span by the rule each step's are read by, over the files' composed renames, which `inspect --between` prints as "Renamed whole".

Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) `fileOfShape` lists a file's linked documents at a change, and `changesBetween` the links that came and went, a file followed through its renames as its edges are.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `stepsMatching` {#symbol-stepsmatching}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L24)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `stepsMatching` — Summary
The steps whose change id begins with `reference`, ignoring case; more than one when the reference is ambiguous.

#### `graphOfShape` {#symbol-graphofshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L45)
- Returns: [`LiveDocGraph`](../graph.ts.mdmd.md#symbol-livedocgraph)
- Parameters: `shape`: [`Shape`](./shape.ts.mdmd.md#symbol-shape); `location`: [`DocLocation`](../graph.ts.mdmd.md#symbol-doclocation)

##### `graphOfShape` — Summary
The graph a shape describes, for the pathfinder: every file with its
archetype and its edges' ends, and nothing of its doc. Each file's
`docPath` is where its doc stood at that change; `symbols`, `entries`,
`dependencies` and `edges` are empty, since the shape does not carry them,
and a file's entry mark is read with {@link entryMarked}.

#### `entryMarked` {#symbol-entrymarked}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L80)
- Parameters: `shape`: [`Shape`](./shape.ts.mdmd.md#symbol-shape); `file`: [`GraphFile`](../graph.ts.mdmd.md#symbol-graphfile)

##### `entryMarked` — Summary
Whether a file of a graph made by {@link graphOfShape} is an entry, as the
pathfinder's walk from the entries asks: its doc carried an Entry line at
that change, or it is a test, which a runner starts.

#### `Neighbour` {#symbol-neighbour}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L85)

##### `Neighbour` — Summary
A file's neighbour at a change, with the edge's count.

#### `FileAtChange` {#symbol-fileatchange}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L91)

##### `FileAtChange` — Summary
What a file was at a change.

#### `fileOfShape` {#symbol-fileofshape}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L107)
- Returns: [`FileAtChange`](#symbol-fileatchange)
- Parameters: `shape`: [`Shape`](./shape.ts.mdmd.md#symbol-shape)

##### `fileOfShape` — Summary
What a file was in a shape: whether it existed, its shape, and its neighbours either way.

#### `ChangesBetween (interface)` {#symbol-changesbetween-interface}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L130)

##### `ChangesBetween (interface)` — Summary
What changed from one change of a sequence to a later one, every list sorted.

#### `changesBetween (function)` {#symbol-changesbetween-function}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L158)
- Returns: [`ChangesBetween`](#symbol-changesbetween-interface)
- Parameters: `sequence`: [`HistorySequence`](./format.ts.mdmd.md#symbol-historysequence)

##### `changesBetween (function)` — Summary
What changed from step `from` to the later step `to`, a file followed
through every rename between, so that a file renamed twice is one rename
and a file born and dead between them is neither.

#### `FollowedChanges` {#symbol-followedchanges}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L235)

##### `FollowedChanges` — Summary
What a run of consecutive changes does to the files that stood before the first of them, and the files it bears.

#### `followChanges` {#symbol-followchanges}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/queries.ts#L250)
- Returns: [`FollowedChanges`](#symbol-followedchanges)
- Parameters: `changes`: `Iterable`; `standing`: `Iterable`

##### `followChanges` — Summary
Follows a run of consecutive changes, oldest first, from the files that
stood before the first of them (`standing`): a file renamed twice is one
move, a file born and dead between is neither, and a file dead on the way
is dead whatever happened to its path after.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.DocLocation`](../graph.ts.mdmd.md#symbol-doclocation) (type-only)
- [`graph.GraphFile`](../graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`directories.directoryRenames`](./directories.ts.mdmd.md#symbol-directoryrenames)
- [`format.CommitInfo`](./format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`format.HistorySequence`](./format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`sequence.changeAt`](./sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.commitAt`](./sequence.ts.mdmd.md#symbol-commitat)
- [`sequence.seek`](./sequence.ts.mdmd.md#symbol-seek)
- [`shape.FileShape`](./shape.ts.mdmd.md#symbol-fileshape)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- [`shape.edgeEnds`](./shape.ts.mdmd.md#symbol-edgeends)
- [`shape.edgeKey`](./shape.ts.mdmd.md#symbol-edgekey)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

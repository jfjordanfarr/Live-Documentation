# `packages/engine/src/live-docs/processMark.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/processMark.ts`
- Generated At: 2026-11-20T17:53:59.675Z

## Authored
### Purpose
Says whether what this process derived could depend on the process's own past, and why: a file nested deeper than the reading depth, a file the generator could not map, or a fault of the tree-sitter runtime. The history's worker, which lives across many changes, publishes nothing it derived while marked after its first change, and is ended after any marked change, so that such a change is decided by a fresh process (`summarizeChange.ts`, `regenerate.ts`).

### Notes
- Made on 2026-11-20, after an independent review of the workers showed a warm worker reading a TypeScript file nested 1,000 deep that a fresh process could not (the stack a process has to spare depends on what V8 has already compiled), and a file the generator failed on dropped from a summary in silence. Until then only the runtime's fault marked the process (`runtimeFaulted` in `treeSitter.ts`).
- The depth is measured without recursion: by `ts.forEachChild` over an explicit stack for TypeScript, right after each parse (`sourceAnalysis.ts`, and the parse of a provider behind `export *` in `dependencies.ts`), by a tree-sitter cursor in `readTree` before the adapter's walk, and by `nestingBeyondDepth` over a parsed JSON value (the JSON adapter's documents and a tsconfig it reads) and a POM's elements; the JSON adapter counts the levels of a script's quoted words as it reads them.
- `machineFailure` lives here too, since the engine's readers that swallow a failure to read a file (`dependencies.ts`) must let a failure of the machine's through, and the history's worker must refuse to write a summary made with one (`summarizeChange.ts`); its list of a name's or a path's codes is a copy of the tree writer's in `history/git.ts`.
- Two bounds since the second probe of 2026-11-20 ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-speed/depth-probe.md)). `READING_DEPTH`, 200, bounds the nesting TypeScript's parser reaches by recursion. A step of a chain it reads by a loop adds nothing to the nesting: a binary expression's left operand, a call's expression, a property or element access's object. `TREE_DEPTH`, 400, bounds every level of any tree, TypeScript's or tree-sitter's, over which only the generator's own walks recurse. One depth for both had first been set at 200, from the lowest cold limit (nested tuple types, 453). It marked `htmlEntities.ts`, a concatenation 255 deep with a nesting of 17, in 174 changes. `reading-depth.test.ts` holds each bound's margin and their sum. A JSON value takes the bound of whatever built it. A tsconfig read by TypeScript's reader of JSON, which recurses as its parser does, takes the nesting bound. A value built by `JSON.parse`, which holds no stack, or a POM's elements, built by an explicit stack, is recursed over only by our own walks, and takes the tree's bound.
- Later on 2026-11-20 an independent reviewer showed that `ts.forEachChild` never reaches a node's JSDoc, which `ts.createSourceFile` parses by the same recursive type parser: a JSDoc tuple 650 deep counted 5, and a warm worker published a file a fresh one could not map. The walk now takes each node's JSDoc as nesting, and the default of a bracketed JSDoc parameter, which the parser reads and keeps nothing of, read again on its own; `<` is nesting, since the parser first tries each operand as type arguments through every later `<`; a non-null assertion, an `as` or `satisfies` cast and a tagged template's tag are chain steps. What the bounds promise holds for the constructs `reading-depth.test.ts` reads; the record's third round lists what a walk by `forEachChild` misses and what was not settled.
- The same reviewer then showed that the rule for `<` followed only the tree's left spine: `f(a < a, a < a, …)` failed fresh at 517 and counted 7. It also showed that the second read of a default read the tag's prose as code, counting it and throwing `RangeError` on 3,000 parentheses. So every place the parser reads and throws away in TypeScript 5.9.3 was audited (the record's fourth round, dated 2026-11-20, pinned to that version by `processMark.test.ts`). The count now has three parts:
  - a statement holding a comparison of its own counts as its nesting plus twice its height plus its own comparisons and expression-bodied arrows (`Region`), one rule in place of the left operand of `<`;
  - a JSDoc comment counts as its deepest node plus its deepest nested type literal's nesting below it, for the child tags tried and thrown away;
  - a default is read again cut at its own end by TypeScript's scanner, its `RangeError` counted beyond every bound.
  The root measured a bound by the stack really used and set it aside (`stack-share-probe.out` beside the record).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `READING_DEPTH` {#symbol-reading_depth}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L51)

##### `READING_DEPTH` — Summary
How many levels of a TypeScript tree its parser may reach by recursion before the process is marked: at most half
the smallest depth at which a fresh process on node's default stack fails a nesting construct the margin's test
holds, so that below it no process fails for want of stack on such a construct, whatever it has run before. The
probe of 2026-11-20 (node 26, a worker as the pool starts one, under tsx or built) found the smallest in nested tuple
types (`[[[number]]]`), which a fresh process fails at 453 levels, in code or in a JSDoc comment; type arguments
(`Array<Array<…>>`) at 506, nested calls at 598, nested arrays at about 660. Counted by {@link typeScriptExtent},
where a step of a chain adds nothing. `tests/integration/live-docs/reading-depth.test.ts` reads each nesting
construct it lists cold at twice this bound, and goes red on the day a later TypeScript or node lowers a limit below
it; a construct it does not list is outside this claim.

#### `TREE_DEPTH` {#symbol-tree_depth}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L58)

##### `TREE_DEPTH` — Summary
How deep any syntax tree, TypeScript's or tree-sitter's, may be before the process is marked, every level counted:
the bound of the generator's own walks, which recurse over every level. Every chain and every tree-sitter construct
the probe of 2026-11-20 tried was read cold at 800, twice this bound, which `reading-depth.test.ts` holds.

#### `ProcessMark` {#symbol-processmark}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L61)

##### `ProcessMark` — Summary
Why a process is marked: a file beyond {@link READING_DEPTH} or {@link TREE_DEPTH}, a file the generator could not map, or a fault of the tree-sitter runtime.

#### `markProcess` {#symbol-markprocess}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L66)
- Parameters: `reason`: [`ProcessMark`](#symbol-processmark)

##### `markProcess` — Summary
Marks the process: what it derives from now on may depend on its past.

#### `processMarks` {#symbol-processmarks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L71)
- Returns: [`ProcessMark`](#symbol-processmark)[]

##### `processMarks` — Summary
Every reason the process was marked for, in a fixed order; none when it was not.

#### `machineFailure` {#symbol-machinefailure}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L82)

##### `machineFailure` — Summary
Whether a failure is the machine's rather than the file's: a system call that failed ({@link failedCall}) for a cause
other than the name's or the path's (`NAME_FAILURES`), which the history's tree writer leaves out and names
(`unwritten`) for the same codes. Such a failure (too many open files, a full disk, a file Windows holds) would make
a summary a later run would not, so the history never writes one made with it (`summarizeChange.ts`), and a reader
that swallows a failure to read a file lets this kind through (`throwIfMachineFailure`, `tooling/sourceText.ts`).

#### `failedCall` {#symbol-failedcall}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L92)

##### `failedCall` — Summary
The code of the failed system call an error is, or wraps: the first error along its chain of causes (`cause`, as a
library that wraps a failure in an error of its own keeps it) that names its `syscall` and its `code`. Until
2026-11-20 only the error itself was read, so a failed call a library wrapped sorted as the file's.

#### `nestingBeyondDepth` {#symbol-nestingbeyonddepth}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L110)
- Parameters: `root`: `T`; `node`: `T`

##### `nestingBeyondDepth` — Summary
Whether a tree a reader built of a file's content is deeper than `bound`, by an explicit stack over `children`, so
that the measure itself never runs short of stack: a parsed JSON value (`jsonChildren`), an XML document's elements.
A tree deeper marks the process (`deep`). The bound is the one of the mechanism that recursed over the value. A
value built without the stack, by `JSON.parse` (a fresh node read an array nested 1,000,000 deep, by the probe of
2026-11-20) or by the POM reader's explicit stack, is recursed over only by our own walks, as a chain is:
{@link TREE_DEPTH}. A value TypeScript's reader of JSON built recurses as its parser does: {@link READING_DEPTH}.

#### `jsonChildren` {#symbol-jsonchildren}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L129)

##### `jsonChildren` — Summary
The values a parsed JSON value holds: an array's items, an object's values, nothing of a scalar.

#### `typeScriptExtent` {#symbol-typescriptextent}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L260)
- Parameters: `root`: `ts.SourceFile`

##### `typeScriptExtent` — Summary
A TypeScript tree's nesting, the most levels its parser reaches by recursion (a step of a chain adds nothing), and
its depth, every level counted, the root 1 in each, by an explicit stack over `ts.forEachChild` and what it does not
reach ({@link unvisited}), each counted as nesting, and each statement's attempts at type arguments ({@link Region}),
so that the measure itself never runs short of stack. A default read again that runs short of stack where the parser
did not counts as nested beyond every bound. With `bounded`, the walk stops as soon as either passes its bound.

#### `typeScriptBeyondDepth` {#symbol-typescriptbeyonddepth}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L322)
- Parameters: `root`: `ts.SourceFile`

##### `typeScriptBeyondDepth` — Summary
Whether a TypeScript tree is nested beyond {@link READING_DEPTH} or deeper than {@link TREE_DEPTH}; either marks the process (`deep`).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pathUtils.NAME_FAILURES`](../tooling/pathUtils.ts.mdmd.md#symbol-name_failures)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

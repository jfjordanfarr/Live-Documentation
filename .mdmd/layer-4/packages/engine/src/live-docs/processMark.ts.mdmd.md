# `packages/engine/src/live-docs/processMark.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/processMark.ts`
- Generated At: 2026-11-20T15:07:21.021Z

## Authored
### Purpose
Says whether what this process derived could depend on the process's own past, and why: a file nested deeper than the reading depth, a file the generator could not map, or a fault of the tree-sitter runtime. The history's worker, which lives across many changes, publishes nothing it derived while marked after its first change, and is ended after any marked change, so that such a change is decided by a fresh process (`summarizeChange.ts`, `regenerate.ts`).

### Notes
- Made on 2026-11-20, after an independent review of the workers showed a warm worker reading a TypeScript file nested 1,000 deep that a fresh process could not (the stack a process has to spare depends on what V8 has already compiled), and a file the generator failed on dropped from a summary in silence. Until then only the runtime's fault marked the process (`runtimeFaulted` in `treeSitter.ts`).
- The depth is measured without recursion: by `ts.forEachChild` over an explicit stack for TypeScript, right after each parse (`sourceAnalysis.ts`, and the parse of a provider behind `export *` in `dependencies.ts`), and by a tree-sitter cursor in `readTree` before the adapter's walk.
- Two bounds since the second probe of 2026-11-20 ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-speed/depth-probe.md)). `READING_DEPTH`, 200, bounds the nesting TypeScript's parser reaches by recursion. A step of a chain it reads by a loop adds nothing to the nesting: a binary expression's left operand, a call's expression, a property or element access's object. `TREE_DEPTH`, 400, bounds every level of any tree, TypeScript's or tree-sitter's, over which only the generator's own walks recurse. One depth for both had first been set at 200, from the lowest cold limit (nested tuple types, 453). It marked `htmlEntities.ts`, a concatenation 255 deep with a nesting of 17, in 174 changes. `reading-depth.test.ts` holds each bound's margin and their sum.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `READING_DEPTH` {#symbol-reading_depth}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L40)

##### `READING_DEPTH` — Summary
How many levels of a TypeScript tree its parser may reach by recursion before the process is marked: at most half
the smallest depth at which a fresh process on node's default stack fails a nesting construct, so that below it no
process fails for want of stack, whatever it has run before. The probe of 2026-11-20 (node 26, a worker as the pool
starts one, under tsx or built) found the smallest in nested tuple types (`[[[number]]]`), which a fresh process
fails at 453 levels; type arguments (`Array<Array<…>>`) at 506, nested calls at 598, nested arrays at about 660.
Counted by {@link typeScriptExtent}, where a step of a chain adds nothing. `tests/integration/live-docs/
reading-depth.test.ts` reads every nesting construct cold at twice this bound, and goes red on the day a later
TypeScript or node lowers a limit below it.

#### `TREE_DEPTH` {#symbol-tree_depth}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L47)

##### `TREE_DEPTH` — Summary
How deep any syntax tree, TypeScript's or tree-sitter's, may be before the process is marked, every level counted:
the bound of the generator's own walks, which recurse over every level. Every chain and every tree-sitter construct
the probe of 2026-11-20 tried was read cold at 800, twice this bound, which `reading-depth.test.ts` holds.

#### `ProcessMark` {#symbol-processmark}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L50)

##### `ProcessMark` — Summary
Why a process is marked: a file beyond {@link READING_DEPTH} or {@link TREE_DEPTH}, a file the generator could not map, or a fault of the tree-sitter runtime.

#### `markProcess` {#symbol-markprocess}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L55)
- Parameters: `reason`: [`ProcessMark`](#symbol-processmark)

##### `markProcess` — Summary
Marks the process: what it derives from now on may depend on its past.

#### `processMarks` {#symbol-processmarks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L60)
- Returns: [`ProcessMark`](#symbol-processmark)[]

##### `processMarks` — Summary
Every reason the process was marked for, in a fixed order; none when it was not.

#### `typeScriptExtent` {#symbol-typescriptextent}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L85)
- Parameters: `root`: `ts.Node`

##### `typeScriptExtent` — Summary
A TypeScript tree's nesting, the most levels its parser reaches by recursion (a step of a chain adds nothing), and
its depth, every level counted, the root 1 in each, by an explicit stack over `ts.forEachChild`, so that the measure
itself never runs short of stack. With `bounded`, the walk stops as soon as either passes its bound.

#### `typeScriptBeyondDepth` {#symbol-typescriptbeyonddepth}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L106)
- Parameters: `root`: `ts.Node`

##### `typeScriptBeyondDepth` — Summary
Whether a TypeScript tree is nested beyond {@link READING_DEPTH} or deeper than {@link TREE_DEPTH}; either marks the process (`deep`).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

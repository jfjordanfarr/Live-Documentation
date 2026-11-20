# `packages/engine/src/live-docs/processMark.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/processMark.ts`
- Generated At: 2026-11-20T14:07:46.361Z

## Authored
### Purpose
Says whether what this process derived could depend on the process's own past, and why: a file nested deeper than the reading depth, a file the generator could not map, or a fault of the tree-sitter runtime. The history's worker, which lives across many changes, publishes nothing it derived while marked after its first change, and is ended after any marked change, so that such a change is decided by a fresh process (`summarizeChange.ts`, `regenerate.ts`).

### Notes
- Made on 2026-11-20, after an independent review of the workers showed a warm worker reading a TypeScript file nested 1,000 deep that a fresh process could not (the stack a process has to spare depends on what V8 has already compiled), and a file the generator failed on dropped from a summary in silence. Until then only the runtime's fault marked the process (`runtimeFaulted` in `treeSitter.ts`).
- The depth is measured without recursion: by `ts.forEachChild` over an explicit stack for TypeScript, right after each parse (`sourceAnalysis.ts`, and the parse of a provider behind `export *` in `dependencies.ts`), and by a tree-sitter cursor in `readTree` before the adapter's walk.
- As of its first commit, `READING_DEPTH` rests on a partial probe (three TypeScript constructs: nested arrays, objects and parentheses), and no test holds its margin over a fresh process's limits.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `READING_DEPTH` {#symbol-reading_depth}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L30)

##### `READING_DEPTH` — Summary
How deep a file's syntax tree may be before the process is marked: well under the depth at which a fresh process
on node's default stack fails to read a construct the readers meet, so that below it no process fails for want of
stack, whatever it has run before. Under half of the smallest cold limit the probe of 2026-11-20 found (node 26, the
built engine): TypeScript's nested arrays, which a fresh process fails at 656 levels, about 660 deep by this measure;
nested objects at 496 levels (about 1,000 deep), parentheses at 672 (about 680). That probe covered three constructs
of the many the readers meet.

#### `ProcessMark` {#symbol-processmark}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L33)

##### `ProcessMark` — Summary
Why a process is marked: a file beyond {@link READING_DEPTH}, a file the generator could not map, or a fault of the tree-sitter runtime.

#### `markProcess` {#symbol-markprocess}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L38)
- Parameters: `reason`: [`ProcessMark`](#symbol-processmark)

##### `markProcess` — Summary
Marks the process: what it derives from now on may depend on its past.

#### `processMarks` {#symbol-processmarks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L43)
- Returns: [`ProcessMark`](#symbol-processmark)[]

##### `processMarks` — Summary
Every reason the process was marked for, in a fixed order; none when it was not.

#### `typeScriptBeyondDepth` {#symbol-typescriptbeyonddepth}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L51)
- Parameters: `root`: `ts.Node`

##### `typeScriptBeyondDepth` — Summary
Whether a TypeScript tree is deeper than {@link READING_DEPTH}, by an explicit stack over `ts.forEachChild`, so that
the measure itself never runs short of stack. A tree deeper marks the process (`deep`).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

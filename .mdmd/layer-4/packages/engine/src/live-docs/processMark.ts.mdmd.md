# `packages/engine/src/live-docs/processMark.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/processMark.ts`
- Generated At: 2026-11-20T14:29:14.432Z

## Authored
### Purpose
Says whether what this process derived could depend on the process's own past, and why: a file nested deeper than the reading depth, a file the generator could not map, or a fault of the tree-sitter runtime. The history's worker, which lives across many changes, publishes nothing it derived while marked after its first change, and is ended after any marked change, so that such a change is decided by a fresh process (`summarizeChange.ts`, `regenerate.ts`).

### Notes
- Made on 2026-11-20, after an independent review of the workers showed a warm worker reading a TypeScript file nested 1,000 deep that a fresh process could not (the stack a process has to spare depends on what V8 has already compiled), and a file the generator failed on dropped from a summary in silence. Until then only the runtime's fault marked the process (`runtimeFaulted` in `treeSitter.ts`).
- The depth is measured without recursion: by `ts.forEachChild` over an explicit stack for TypeScript, right after each parse (`sourceAnalysis.ts`, and the parse of a provider behind `export *` in `dependencies.ts`), by a tree-sitter cursor in `readTree` before the adapter's walk, and by `nestingBeyondDepth` over a parsed JSON value (the JSON adapter's documents and a tsconfig it reads) and a POM's elements; the JSON adapter counts the levels of a script's quoted words as it reads them.
- `machineFailure` lives here too, since the engine's readers that swallow a failure to read a file (`dependencies.ts`) must let a failure of the machine's through, and the history's worker must refuse to write a summary made with one (`summarizeChange.ts`); its list of a name's or a path's codes is a copy of the tree writer's in `history/git.ts`.
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

#### `machineFailure` {#symbol-machinefailure}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L54)

##### `machineFailure` — Summary
Whether a failure is the machine's rather than the file's: a system call that failed (the error names its `syscall`
and its `code`) for a cause other than the name's or the path's, which the history's tree writer leaves out and names
(`unwritten`) for the same codes. Such a failure (too many open files, a full disk, a file Windows holds) would make
a summary a later run would not, so the history never writes one made with it (`summarizeChange.ts`), and a reader
that swallows a failure to read a file lets this kind through (`dependencies.ts`).

#### `typeScriptBeyondDepth` {#symbol-typescriptbeyonddepth}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/processMark.ts#L67)
- Parameters: `root`: `ts.Node`

##### `typeScriptBeyondDepth` — Summary
Whether a TypeScript tree is deeper than {@link READING_DEPTH}, by an explicit stack over `ts.forEachChild`, so that
the measure itself never runs short of stack. A tree deeper marks the process (`deep`).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

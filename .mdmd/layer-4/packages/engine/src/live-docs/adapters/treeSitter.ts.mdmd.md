# `packages/engine/src/live-docs/adapters/treeSitter.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/treeSitter.ts`
- Generated At: 2026-11-24T07:54:04.073Z

## Authored
### Purpose
Loads the tree-sitter grammars the adapters parse with: one `web-tree-sitter` parser per grammar, created on first use from the engine's own build of the grammar when the package carries one (`grammars/<name>/tree-sitter-<name>.wasm`) and otherwise from the `.wasm` files that `@vscode/tree-sitter-wasm` ships, and `readTree`, the only way the adapters take a tree: it parses a string with a named grammar, hands the tree's root to the adapter's synchronous reading, and releases the tree, marking the process (`runtimeFaulted`) on anything thrown from the grammar's load to the release.

### Notes
- The runtime is `web-tree-sitter`; the bundled grammar binaries come from `@vscode/tree-sitter-wasm`, whose own JavaScript entry point cannot be required from Node. The `SyntaxNode` alias exists because the runtime's `Node` collides with the DOM type.
- The engine's own grammars arrived on 2026-10-16 with PowerShell's, built by `packages/engine/grammars/powershell/build.sh` from the upstream grammar at a pinned commit and a patch upstream has not yet taken ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16)). The choice is by file: deleting a grammar's folder, once upstream ships the fix, returns it to the bundle. The folder is found from this module's place, three folders below the package root in `src` and in `dist` alike, and the package's `files` carry it.
- A `SyntaxTree` alias that nothing used was deleted on 2026-10-08 in [the dead code sweep](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-08/Probes/dead-code-sweep.md); the runtime's `Tree` was the return type of `parseSource` until 2026-11-20.
- Since 2026-11-20 ([the record of the workers' review](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md), its fourth round) the adapters take, walk and release a tree only through `readTree`, and any throw there marks the process, whatever its class: the runtime's one WebAssembly module, which every grammar's parser shares, restores none of its state when a call into it throws, and whether a throw was a trap, an abort, an exit of the module, a stack overflow or the adapter's own cannot be told from the error. The history's worker, which lives across commits, then writes nothing of that commit unless it was its first, and the command gives the commit to a fresh worker. Before, `parseSource` handed the tree to the adapter, and only a `RuntimeError` thrown inside `parse` marked the process, after the commit's summary was written. What it cannot see: a module whose state went wrong without anything thrown, and a node an adapter keeps and reads after the release.
- Since 2026-11-20 `grammarFile` probes the engine's own grammar with `statSync` and `throwIfNoEntry: false`, a failure of the machine's thrown by `throwIfMachineFailure` ([sourceText.ts](../../tooling/sourceText.ts.mdmd.md)), so that the load fails and is dropped and the next ask loads the engine's own. Before, `existsSync` read such a failure as no build of the engine's: the bundled, unpatched grammar was loaded and kept for the process's life, and every later file of that language in that worker read by it. The structural case `sourceText.boundary.test.ts` found it; `treeSitter.test.ts` holds it.
- Since 2026-11-21 `rangesOf` and `writtenOver` are the shared step by which a reader that finds a construct by a pattern over a language's text reads nothing a comment holds, the grammar telling a comment from a string ([the comment guard](./commentGuard.test.ts.mdmd.md)): C#'s patterns and Ruby's use it.
- Since the evening of 2026-11-21 `writtenOver` writes through `inSpaces` (`spaces.ts`), one space for each UTF-16 unit, and takes its ranges in order and apart, as `rangesOf` gives them ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md#the-second-round-after-an-independent-review)).
- Since 2026-11-24 (Step 7 of [the road to one engine for a page and a command line](../../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road)) this module takes its runtime and language `.wasm` binaries solely as bytes from the active `GrammarHost` (`setGrammarHost` / `getGrammarHost`), holding no `node:fs`, `node:path`, `__dirname` or `require.resolve` calls. `Parser.init` receives `{ wasmBinary, locateFile: (name) => name }` so Emscripten never builds a URL from `import.meta.url` in a classic browser script; Node's disk loader lives in [`nodeGrammars.ts`](../../tooling/nodeGrammars.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GrammarHost` {#symbol-grammarhost}
- Type: type (type-only)
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L14)

#### `SyntaxNode` {#symbol-syntaxnode}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L17)
- Returns: `Node`

##### `SyntaxNode` — Summary
A node of a parsed tree; the runtime's own name for it collides with the DOM type.

#### `getGrammarHost` {#symbol-getgrammarhost}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L30)
- Returns: [`GrammarHost`](../../tooling/workspaceFiles.ts.mdmd.md#symbol-grammarhost)

##### `getGrammarHost` — Summary
Returns the currently active {@link GrammarHost}, if one has been registered.

#### `setGrammarHost` {#symbol-setgrammarhost}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L39)
- Parameters: `host`: [`GrammarHost`](../../tooling/workspaceFiles.ts.mdmd.md#symbol-grammarhost)

##### `setGrammarHost` — Summary
Registers the {@link GrammarHost} that supplies the tree-sitter runtime and language `.wasm` bytes.
Passing the host already active is a no-op so cached parsers stay warm across runs; passing a different host or
`undefined` clears the runtime promise and cached parsers cleanly.

#### `grammarParser` {#symbol-grammarparser}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L52)

##### `grammarParser` — Summary
One parser per grammar, created on first use and kept for the life of the process (or until the active
{@link GrammarHost} changes); a load that fails, the runtime's or the grammar's, is dropped, so that the next file
asks again and a process that lives across many generations never fails a file for a failure of the past.

#### `readTree` {#symbol-readtree}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L107)
- Returns: `T`
- Parameters: `root`: [`SyntaxNode`](#symbol-syntaxnode)

##### `readTree` — Summary
Parses `source` with the named grammar, hands the tree's root to `read`, which must be synchronous, and releases the
tree, returning what `read` returned. The only way the adapters take a tree.

##### `readTree` — Remarks
Every node `read` touches is a call into the runtime's one WebAssembly module, which every grammar's parser shares,
and the runtime restores none of its state when such a call throws: a trap throws a `WebAssembly.RuntimeError`, an
abort sets a flag the module keeps and throws one, an exit of the module throws its `ExitStatus`, a stack overflow
throws a `RangeError` wherever the stack ran out, in the module or in the adapter's walk, and `parse` holds no
`finally` round its call. Which of these a throw was cannot be told from the error, so any throw from the grammar's
load to the tree's release marks the process (`runtime`, `processMark.ts`), whatever its class, the adapter's own
error among them: a mark too many costs a change summarized again in a fresh process; a mark too few lets a module
of unknown state make a summary. Before `read` is called the tree's depth is measured by a cursor, without
recursion, and a tree deeper than `TREE_DEPTH` marks the process too (`deep`): a fresh process might run out of
stack in the adapter's walk where this one does not, or the other way round. Until 2026-11-20 only a `RuntimeError`
thrown inside `parse` marked it, and the adapters walked and released their trees themselves (`parseSource`); the
depth is measured since a later review of that day.

#### `COMMENT_NODES` {#symbol-comment_nodes}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L152)
- Returns: `ReadonlySet`

##### `COMMENT_NODES` — Summary
The node a grammar gives a comment: C#'s, Ruby's (`#` and `=begin` … `=end` alike) and most others'.

#### `rangesOf` {#symbol-rangesof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L161)
- Parameters: `root`: [`SyntaxNode`](#symbol-syntaxnode); `types`: `ReadonlySet`

##### `rangesOf` — Summary
Where a tree holds nodes of the given types, a comment by default: each one's start and end in the text, in its
UTF-16 units, in order, as a flat list of pairs; what lies inside such a node is not visited. Walked by a cursor,
like the depth's measure, so that it needs no stack of its own. With {@link writtenOver}, the shared step by which a
reader that finds a construct by a pattern over a language's text reads nothing a comment holds, the grammar
telling a comment from a string as the language does (the guard of 2026-11-21, `commentGuard.test.ts`).

#### `writtenOver` {#symbol-writtenover}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L185)

##### `writtenOver` — Summary
The text with each range of `ranges` (pairs of start and end, in order and apart, as {@link rangesOf} gives them)
written over in spaces ({@link inSpaces}), its line breaks kept, so that a position or a line found in the result is
the same in the text.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`spaces.inSpaces`](./spaces.ts.mdmd.md#symbol-inspaces)
- [`processMark.TREE_DEPTH`](../processMark.ts.mdmd.md#symbol-tree_depth)
- [`processMark.markProcess`](../processMark.ts.mdmd.md#symbol-markprocess)
- [`workspaceFiles.GrammarHost`](../../tooling/workspaceFiles.ts.mdmd.md#symbol-grammarhost) (type-only)
- `web-tree-sitter` - `Language`, `Node`, `Parser`, `Tree`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../../layer-3/engine-and-hosts.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

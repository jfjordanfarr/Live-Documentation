# packages/engine/src/live-docs/adapters/treeSitter.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/treeSitter.ts
- Generated At: 2026-10-08T16:03:27.089Z

## Authored
### Purpose
Loads the tree-sitter grammars the adapters parse with: one `web-tree-sitter` parser per grammar, created on first use from the `.wasm` files that `@vscode/tree-sitter-wasm` ships, and `parseSource`, which parses a string with a named grammar and hands the caller a tree it owns.

### Notes
- The runtime is `web-tree-sitter`; only the grammar binaries come from `@vscode/tree-sitter-wasm`, whose own JavaScript entry point cannot be required from Node. The `SyntaxNode` alias exists because the runtime's `Node` collides with the DOM type.
- A `SyntaxTree` alias that nothing used was deleted on 2026-10-08 in [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md); the runtime's `Tree` is the return type of `parseSource`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SyntaxNode` {#symbol-syntaxnode}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L12)

##### `SyntaxNode` — Summary
A node of a parsed tree; the runtime's own name for it collides with the DOM type.

#### `grammarParser` {#symbol-grammarparser}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L20)

##### `grammarParser` — Summary
One parser per grammar, created on first use and kept for the life of the process.

#### `parseSource` {#symbol-parsesource}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L37)

##### `parseSource` — Summary
Parses `source` with the named grammar. The caller owns the tree and should `delete()` it when done.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `web-tree-sitter` - `Language`, `Node`, `Parser`, `Tree`
<!-- LIVE-DOC:END Dependencies -->

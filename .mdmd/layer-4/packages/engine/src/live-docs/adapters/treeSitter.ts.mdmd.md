# packages/engine/src/live-docs/adapters/treeSitter.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/treeSitter.ts
- Generated At: 2026-09-27T23:21:31.201Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SyntaxNode` {#symbol-syntaxnode}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L12)

##### `SyntaxNode` — Summary
A node of a parsed tree; the runtime's own name for it collides with the DOM type.

#### `SyntaxTree` {#symbol-syntaxtree}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L14)
- Returns: `Tree`

##### `SyntaxTree` — Summary
A parsed tree.

#### `grammarParser` {#symbol-grammarparser}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L22)

##### `grammarParser` — Summary
One parser per grammar, created on first use and kept for the life of the process.

#### `parseSource` {#symbol-parsesource}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/treeSitter.ts#L39)

##### `parseSource` — Summary
Parses `source` with the named grammar. The caller owns the tree and should `delete()` it when done.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `web-tree-sitter` - `Language`, `Node`, `Parser`, `Tree`
<!-- LIVE-DOC:END Dependencies -->

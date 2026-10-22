# packages/engine/src/live-docs/adapters/java.javadoc.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/java.javadoc.ts
- Generated At: 2026-10-22T18:45:22.087Z

## Authored
### Purpose
Parses one Javadoc block comment into structured documentation: summary and remarks, `@param`, `@return`, `@throws`, `@see`, `@example`, with inline `{@code}`, `{@link}` and `{@literal}` rewritten to Markdown.

### Notes
- Moved verbatim out of the old scanner on 2026-09-27 when the Java adapter moved to tree-sitter; the adapter hands it the `block_comment` node above a declaration.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `parseJavaDoc` {#symbol-parsejavadoc}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/java.javadoc.ts#L13)
- Returns: [`SymbolDocumentation`](../coreTypes.ts.mdmd.md#symbol-symboldocumentation)

##### `parseJavaDoc` — Summary
Parses one Javadoc block comment, `/** ... *\/`, into structured documentation; anything else yields nothing.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationLinkKind`](../core.ts.mdmd.md#symbol-symboldocumentationlinkkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

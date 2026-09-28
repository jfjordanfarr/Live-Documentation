# packages/engine/src/live-docs/adapters/java.javadoc.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/java.javadoc.ts
- Generated At: 2026-09-27T23:21:30.691Z

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
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/java.javadoc.ts#L17)
- Returns: [`SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation)

##### `parseJavaDoc` — Summary
Parses one Javadoc block comment, `/** ... *\/`, into structured documentation; anything else yields nothing.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`core.SymbolDocumentationException`](../core.ts.mdmd.md#symbol-symboldocumentationexception) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`core.SymbolDocumentationLinkKind`](../core.ts.mdmd.md#symbol-symboldocumentationlinkkind) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
<!-- LIVE-DOC:END Dependencies -->

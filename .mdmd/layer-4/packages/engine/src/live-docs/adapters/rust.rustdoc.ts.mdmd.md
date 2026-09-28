# packages/engine/src/live-docs/adapters/rust.rustdoc.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/rust.rustdoc.ts
- Generated At: 2026-09-28T02:39:05.779Z

## Authored
### Purpose
Parses the lines of a rustdoc comment into structured documentation: summary and remarks, the `# Arguments`, `# Returns`, `# Errors`, `# Panics` and `# Examples` sections, and links in the text.

### Notes
- Moved verbatim out of the old scanner on 2026-09-27 when the Rust adapter moved to tree-sitter; the adapter hands it the `///` lines or the `/** */` block above an item, markers removed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `parseRustDocumentation` {#symbol-parserustdocumentation}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/rust.rustdoc.ts#L24)
- Returns: [`SymbolDocumentation`](../coreTypes.ts.mdmd.md#symbol-symboldocumentation)

##### `parseRustDocumentation` — Summary
Parses the lines of a doc comment (`///` or `/** *\/`, markers removed) into structured documentation: summary, remarks, and the `# Arguments`, `# Returns`, `# Errors`, `# Panics` and `# Examples` sections rustdoc readers expect.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`core.SymbolDocumentationException`](../core.ts.mdmd.md#symbol-symboldocumentationexception) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
<!-- LIVE-DOC:END Dependencies -->

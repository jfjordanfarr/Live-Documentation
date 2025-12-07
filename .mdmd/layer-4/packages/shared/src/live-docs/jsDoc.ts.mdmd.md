# packages/shared/src/live-docs/jsDoc.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/jsDoc.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-jsdoc-ts
- Generated At: 2025-12-07T03:35:42.502Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T03:35:42.502Z","inputHash":"1343493ee55fc5d3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extractJsDocDocumentation` {#symbol-extractjsdocdocumentation}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/jsDoc.ts#L41)
- Returns: [`SymbolDocumentation`](./core.ts.mdmd.md#symbol-symboldocumentation)
- Parameters: `node`: `ts.Node`

##### `extractJsDocDocumentation` — Summary
Extracts structured documentation from JSDoc comments on a TypeScript node.

##### `extractJsDocDocumentation` — Remarks
Supported JSDoc tags:
- `@param` - Parameter descriptions
- `@returns` / `@return` - Return value description
- `@template` - Type parameter descriptions
- `@throws` / `@exception` - Exception documentation
- `@see` / `@link` - Cross-references
- `@example` - Code examples (with optional language)
- `@remarks` - Additional remarks
- `@deprecated` - Deprecation notice

Unknown tags are preserved in `rawFragments`.

##### `extractJsDocDocumentation` — Parameters
- `node`: The TypeScript AST node to extract documentation from

##### `extractJsDocDocumentation` — Returns
Structured documentation object, or undefined if no meaningful content
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`coreTypes.SymbolDocumentation`](./coreTypes.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`coreTypes.SymbolDocumentationExample`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`coreTypes.SymbolDocumentationException`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationexception) (type-only)
- [`coreTypes.SymbolDocumentationLink`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`coreTypes.SymbolDocumentationLinkKind`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationlinkkind) (type-only)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

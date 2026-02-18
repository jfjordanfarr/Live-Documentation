# packages/server/src/features/knowledge/tsSymbolExtractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/tsSymbolExtractor.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-tssymbolextractor-ts
- Generated At: 2026-02-18T21:27:52.410Z

## Authored
### Purpose
TypeScript symbol extraction for the knowledge graph. Parses TypeScript/JavaScript source files to extract exported symbol metadata (name, kind, isDefault, isTypeOnly) for indexing and link resolution.

### Notes
- Extracted 2025-12-08 from `workspaceIndexProvider.ts` during the refactoring session
- Handles all TypeScript export syntax: `export default`, `export { }`, `export const`, `export function`, etc.
- Returns `ExportedSymbolKind` enum values: class, function, variable, enum, interface, type, namespace, default, unknown
- Skips C# files (`.cs`) which require a different parser

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.410Z","inputHash":"1c154ec3d0f3fb31"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExportedSymbolKind` {#symbol-exportedsymbolkind}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/knowledge/tsSymbolExtractor.ts#L7)

##### `ExportedSymbolKind` — Summary
Discriminant for the kind of TypeScript/JavaScript exported symbol.

#### `ExportedSymbolMetadata` {#symbol-exportedsymbolmetadata}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/tsSymbolExtractor.ts#L19)

##### `ExportedSymbolMetadata` — Summary
Metadata for a single exported symbol (name, kind, default/type-only flags).

#### `extractExportedSymbols` {#symbol-extractexportedsymbols}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/tsSymbolExtractor.ts#L29)
- Returns: [`ExportedSymbolMetadata`](#symbol-exportedsymbolmetadata)[]

##### `extractExportedSymbols` — Summary
Extracts exported symbol metadata from a TypeScript/JavaScript file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path`
- [`languageInference.DEFAULT_CODE_EXTENSIONS`](./languageInference.ts.mdmd.md#symbol-default_code_extensions)
- [`languageInference.inferScriptKind`](./languageInference.ts.mdmd.md#symbol-inferscriptkind)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

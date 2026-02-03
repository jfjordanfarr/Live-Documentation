# packages/shared/src/live-docs/symbolExtraction.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/symbolExtraction.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-symbolextraction-ts
- Generated At: 2026-02-03T21:55:40.726Z

## Authored
### Purpose
TypeScript AST symbol extraction for Live Documentation. Walks the AST of TypeScript/JavaScript source files to extract exported declarations (functions, classes, interfaces, types, enums, constants) and their type references for cross-Live-Doc linking.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- 766 lines — handles the complexity of TypeScript's export syntax variations
- `collectExportedSymbols()` is the main entry point, returning a location-sorted symbol list
- `collectTypeReferencesFromFunction/Class/Interface/TypeAlias()` extract type dependencies
- Filters out primitive types (string, number, boolean, etc.) from type references
- Handles edge cases: `export =`, `export default`, namespace re-exports, type-only exports

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.726Z","inputHash":"1de8843e3fd14336"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferScriptKind` {#symbol-inferscriptkind}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/symbolExtraction.ts#L32)
- Returns: `ts.ScriptKind`

##### `inferScriptKind` — Summary
Infers the TypeScript ScriptKind from a file extension.

##### `inferScriptKind` — Parameters
- `extension`: File extension including the dot (e.g., ".ts", ".tsx")

##### `inferScriptKind` — Returns
The appropriate ScriptKind for parsing

#### `collectExportedSymbols` {#symbol-collectexportedsymbols}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/symbolExtraction.ts#L62)
- Returns: [`PublicSymbolEntry`](./core.ts.mdmd.md#symbol-publicsymbolentry)[]
- Parameters: `sourceFile`: `ts.SourceFile`

##### `collectExportedSymbols` — Summary
Scans a TypeScript source file for exported declarations and captures their metadata.

##### `collectExportedSymbols` — Parameters
- `sourceFile`: Parsed TypeScript source file produced by the compiler host.

##### `collectExportedSymbols` — Returns
A location-sorted list of exported symbols suitable for Live Doc rendering.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.TypeReference`](./coreTypes.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreUtils.getNodeLocation`](./coreUtils.ts.mdmd.md#symbol-getnodelocation)
- [`coreUtils.hasDefaultModifier`](./coreUtils.ts.mdmd.md#symbol-hasdefaultmodifier)
- [`coreUtils.hasExportModifier`](./coreUtils.ts.mdmd.md#symbol-hasexportmodifier)
- [`coreUtils.resolveExportAssignmentName`](./coreUtils.ts.mdmd.md#symbol-resolveexportassignmentname)
- [`jsDoc.extractJsDocDocumentation`](./jsDoc.ts.mdmd.md#symbol-extractjsdocdocumentation)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

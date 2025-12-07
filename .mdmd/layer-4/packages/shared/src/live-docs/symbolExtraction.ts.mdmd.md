# packages/shared/src/live-docs/symbolExtraction.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/symbolExtraction.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-symbolextraction-ts
- Generated At: 2025-12-07T04:00:25.844Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T04:00:25.844Z","inputHash":"feaacea743772367"}]} -->
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

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](./adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](./adapters/rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](./core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

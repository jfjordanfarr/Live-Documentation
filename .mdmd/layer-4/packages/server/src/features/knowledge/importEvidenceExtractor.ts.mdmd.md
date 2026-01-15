# packages/server/src/features/knowledge/importEvidenceExtractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/importEvidenceExtractor.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-importevidenceextractor-ts
- Generated At: 2026-01-15T02:41:18.485Z

## Authored
### Purpose
Extracts link evidence from import/require statements in TypeScript/JavaScript files for the knowledge graph. Parses AST to find module references, resolves them to workspace paths, and determines if bindings are used at runtime vs type-only.

### Notes
- Extracted 2025-12-08 from `workspaceIndexProvider.ts` during the refactoring session
- Distinguishes `import`, `export`, `require`, and dynamic `import()` contexts
- Uses `collectIdentifierUsage()` and `hasRuntimeUsage()`/`hasTypeUsage()` to filter unused imports
- Module resolution probes multiple extensions via `MODULE_RESOLUTION_EXTENSIONS`

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.485Z","inputHash":"3f14b11eea767ce7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ImportEvidenceContext` {#symbol-importevidencecontext}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/importEvidenceExtractor.ts#L17)

#### `extractImportEvidences` {#symbol-extractimportevidences}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/importEvidenceExtractor.ts#L34)
- Parameters: `context`: [`ImportEvidenceContext`](#symbol-importevidencecontext)

##### `extractImportEvidences` — Summary
Extracts link evidence from import/require statements in TypeScript/JavaScript files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path`
- `node:url` - `pathToFileURL`
- [`directoryScanner.fileExists`](./directoryScanner.ts.mdmd.md#symbol-fileexists)
- [`languageInference.MODULE_RESOLUTION_EXTENSIONS`](./languageInference.ts.mdmd.md#symbol-module_resolution_extensions)
- [`languageInference.inferScriptKind`](./languageInference.ts.mdmd.md#symbol-inferscriptkind)
- [`index.LinkEvidence`](../../../../shared/src/index.ts.mdmd.md#symbol-linkevidence)
- [`index.LinkRelationshipKind`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind)
- [`index.collectIdentifierUsage`](../../../../shared/src/index.ts.mdmd.md#symbol-collectidentifierusage)
- [`index.extractLocalImportNames`](../../../../shared/src/index.ts.mdmd.md#symbol-extractlocalimportnames)
- [`index.hasRuntimeUsage`](../../../../shared/src/index.ts.mdmd.md#symbol-hasruntimeusage)
- [`index.hasTypeUsage`](../../../../shared/src/index.ts.mdmd.md#symbol-hastypeusage)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

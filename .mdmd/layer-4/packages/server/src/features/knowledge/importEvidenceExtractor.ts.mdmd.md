# packages/server/src/features/knowledge/importEvidenceExtractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/importEvidenceExtractor.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-importevidenceextractor-ts
- Generated At: 2026-02-18T21:27:52.344Z

## Authored
### Purpose
Extracts link evidence from import/require statements in TypeScript/JavaScript files for the knowledge graph. Parses AST to find module references, resolves them to workspace paths, and determines if bindings are used at runtime vs type-only.

### Notes
- Extracted 2025-12-08 from `workspaceIndexProvider.ts` during the refactoring session
- Distinguishes `import`, `export`, `require`, and dynamic `import()` contexts
- Uses `collectIdentifierUsage()` and `hasRuntimeUsage()`/`hasTypeUsage()` to filter unused imports
- Module resolution probes multiple extensions via `MODULE_RESOLUTION_EXTENSIONS`

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.344Z","inputHash":"746b3a61bb1d6c31"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ImportEvidenceContext` {#symbol-importevidencecontext}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/importEvidenceExtractor.ts#L18)

##### `ImportEvidenceContext` — Summary
Contextual inputs for the import/require evidence extraction pass.

#### `extractImportEvidences` {#symbol-extractimportevidences}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/importEvidenceExtractor.ts#L35)
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
- [`artifacts.LinkRelationshipKind`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
- [`linkInference.LinkEvidence`](../../../../shared/src/inference/linkInference.ts.mdmd.md#symbol-linkevidence)
- [`typeScriptAstUtils.collectIdentifierUsage`](../../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-collectidentifierusage)
- [`typeScriptAstUtils.extractLocalImportNames`](../../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-extractlocalimportnames)
- [`typeScriptAstUtils.hasRuntimeUsage`](../../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-hasruntimeusage)
- [`typeScriptAstUtils.hasTypeUsage`](../../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-hastypeusage)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

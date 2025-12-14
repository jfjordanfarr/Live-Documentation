# packages/server/src/features/knowledge/workspaceIndexProvider.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/workspaceIndexProvider.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-workspaceindexprovider-ts
- Generated At: 2025-12-13T23:56:47.720Z

## Authored
### Purpose
Scans the workspace for implementation, documentation, and script artifacts so integration environments can seed the graph with code/doc nodes, relationship hints, and link evidence before real watchers run.

### Notes
- First composed during the Oct 19 ingestion build to unblock integration tests; see [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md).
- Extended on Oct 30 to parse MDMD identifiers and section symbols for audit tooling, as recorded in [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-13T23:56:47.720Z","inputHash":"c1b63cd5cafffcf6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExportedSymbolKind` {#symbol-exportedsymbolkind}
- Type: unknown
- Source: [source](../../../../../../../packages/server/src/features/knowledge/workspaceIndexProvider.ts#L37)

#### `ExportedSymbolMetadata` {#symbol-exportedsymbolmetadata}
- Type: unknown
- Source: [source](../../../../../../../packages/server/src/features/knowledge/workspaceIndexProvider.ts#L37)

#### `DocumentSymbolReferenceMetadata` {#symbol-documentsymbolreferencemetadata}
- Type: unknown
- Source: [source](../../../../../../../packages/server/src/features/knowledge/workspaceIndexProvider.ts#L38)

#### `MdmdDocumentDetails` {#symbol-mdmddocumentdetails}
- Type: unknown
- Source: [source](../../../../../../../packages/server/src/features/knowledge/workspaceIndexProvider.ts#L38)

#### `DEFAULT_CODE_EXTENSIONS` {#symbol-default_code_extensions}
- Type: unknown
- Source: [source](../../../../../../../packages/server/src/features/knowledge/workspaceIndexProvider.ts#L39)

#### `DEFAULT_DOC_EXTENSIONS` {#symbol-default_doc_extensions}
- Type: unknown
- Source: [source](../../../../../../../packages/server/src/features/knowledge/workspaceIndexProvider.ts#L39)

#### `createWorkspaceIndexProvider` {#symbol-createworkspaceindexprovider}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/workspaceIndexProvider.ts#L55)
- Returns: [`WorkspaceLinkProvider`](../../../../shared/src/inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider)
- Parameters: `options`: `WorkspaceIndexProviderOptions`

##### `createWorkspaceIndexProvider` — Summary
Lightweight workspace indexer that seeds implementation artifacts so markdown linkage heuristics
have viable candidates. Intended primarily for integration and dogfooding scenarios.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactSeed`, `LinkEvidence`, `RelationshipHint`, `WorkspaceLinkContribution`, `WorkspaceLinkProvider`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`directoryScanner.createGitignoreFilter`](./directoryScanner.ts.mdmd.md#symbol-creategitignorefilter)
- [`directoryScanner.isLikelyBinaryFile`](./directoryScanner.ts.mdmd.md#symbol-islikelybinaryfile)
- [`directoryScanner.scanDirectory`](./directoryScanner.ts.mdmd.md#symbol-scandirectory)
- [`directoryScanner.shouldSkipPath`](./directoryScanner.ts.mdmd.md#symbol-shouldskippath)
- [`importEvidenceExtractor.extractImportEvidences`](./importEvidenceExtractor.ts.mdmd.md#symbol-extractimportevidences)
- [`languageInference.DEFAULT_CODE_EXTENSIONS`](./languageInference.ts.mdmd.md#symbol-default_code_extensions)
- [`languageInference.DEFAULT_DOC_EXTENSIONS`](./languageInference.ts.mdmd.md#symbol-default_doc_extensions)
- [`languageInference.inferDocLanguage`](./languageInference.ts.mdmd.md#symbol-inferdoclanguage)
- [`languageInference.inferDocumentLayer`](./languageInference.ts.mdmd.md#symbol-inferdocumentlayer)
- [`languageInference.inferLanguage`](./languageInference.ts.mdmd.md#symbol-inferlanguage)
- [`languageInference.looksLikeDocsPath`](./languageInference.ts.mdmd.md#symbol-lookslikedocspath)
- [`linkHintExtractor.LinkHintContext`](./linkHintExtractor.ts.mdmd.md#symbol-linkhintcontext)
- [`linkHintExtractor.extractLinkHints`](./linkHintExtractor.ts.mdmd.md#symbol-extractlinkhints)
- [`linkHintExtractor.extractPathReferenceHints`](./linkHintExtractor.ts.mdmd.md#symbol-extractpathreferencehints)
- [`mdmdParser.DocumentSymbolReferenceMetadata`](./mdmdParser.ts.mdmd.md#symbol-documentsymbolreferencemetadata)
- [`mdmdParser.MdmdDocumentDetails`](./mdmdParser.ts.mdmd.md#symbol-mdmddocumentdetails)
- [`mdmdParser.createMdmdMetadataHints`](./mdmdParser.ts.mdmd.md#symbol-createmdmdmetadatahints)
- [`mdmdParser.extractDocumentSymbolReferences`](./mdmdParser.ts.mdmd.md#symbol-extractdocumentsymbolreferences)
- [`mdmdParser.extractMdmdDocumentDetails`](./mdmdParser.ts.mdmd.md#symbol-extractmdmddocumentdetails)
- [`tsSymbolExtractor.ExportedSymbolKind`](./tsSymbolExtractor.ts.mdmd.md#symbol-exportedsymbolkind)
- [`tsSymbolExtractor.ExportedSymbolMetadata`](./tsSymbolExtractor.ts.mdmd.md#symbol-exportedsymbolmetadata)
- [`tsSymbolExtractor.extractExportedSymbols`](./tsSymbolExtractor.ts.mdmd.md#symbol-extractexportedsymbols)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [workspaceIndexProvider.test.ts](./workspaceIndexProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

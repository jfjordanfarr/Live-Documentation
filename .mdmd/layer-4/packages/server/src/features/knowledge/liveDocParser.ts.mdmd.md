# packages/server/src/features/knowledge/liveDocParser.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/liveDocParser.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-livedocparser-ts
- Generated At: 2026-02-23T21:32:13.035Z

## Authored
### Purpose
Parses Live Documentation markdown files (originally MDMD format) to extract structured metadata—layer, identifiers, code paths, exports, and section symbols—enabling workspaceIndexProvider to seed the knowledge graph with document-to-code relationships and symbol references for integration test environments and graph audits.

### Notes
- Created 2025-12-08 during workspaceIndexProvider modularization (commit `4cd6cfa1`); extracted from 1461-line orchestrator to isolate MDMD parsing logic ([chat log](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-08.2.SUMMARIZED.md)).
- Renamed from mdmdParser.ts → liveDocParser.ts on 2025-12-14 during Phase 1 npm readiness cleanup to eliminate workspace-specific naming from production code ([chat log](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-14.1.md)).
- The "MDMD" naming persists in function/interface names (`extractMdmdDocumentDetails`, `MdmdDocumentDetails`) as an internal implementation detail; the module itself now uses the public "Live Documentation" branding.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-23T21:32:13.035Z","inputHash":"0214919a1105cce2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocDocumentDetails` {#symbol-livedocdocumentdetails}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L8)

##### `LiveDocDocumentDetails` — Summary
Structured metadata extracted from a Live Documentation markdown file.

#### `DocumentSymbolReferenceMetadata` {#symbol-documentsymbolreferencemetadata}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L18)

##### `DocumentSymbolReferenceMetadata` — Summary
A symbol referenced in backticks within a markdown document.

#### `extractLiveDocDocumentDetails` {#symbol-extractlivedocdocumentdetails}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L28)
- Returns: [`LiveDocDocumentDetails`](#symbol-livedocdocumentdetails)

##### `extractLiveDocDocumentDetails` — Summary
Extracts Live Documentation document details from markdown content.

#### `createLiveDocMetadataHints` {#symbol-createlivedocmetadatahints}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L45)
- Parameters: `details`: [`LiveDocDocumentDetails`](#symbol-livedocdocumentdetails); `context`: [`LinkHintContext`](./linkHintExtractor.ts.mdmd.md#symbol-linkhintcontext)

##### `createLiveDocMetadataHints` — Summary
Creates relationship hints from Live Doc metadata code paths.

#### `extractDocumentSymbolReferences` {#symbol-extractdocumentsymbolreferences}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L76)
- Returns: [`DocumentSymbolReferenceMetadata`](#symbol-documentsymbolreferencemetadata)[]
- Parameters: `liveDocDetails`: [`LiveDocDocumentDetails`](#symbol-livedocdocumentdetails)

##### `extractDocumentSymbolReferences` — Summary
Extracts symbol references from document content.

#### `parseLiveDocMetadata` {#symbol-parselivedocmetadata}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L127)

##### `parseLiveDocMetadata` — Summary
Parses Live Doc metadata section from markdown content.

#### `collectSectionSymbols` {#symbol-collectsectionsymbols}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L255)

##### `collectSectionSymbols` — Summary
Collects symbol names from specific section headings.

#### `resolveSectionSymbolTargets` {#symbol-resolvesectionsymboltargets}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L298)

##### `resolveSectionSymbolTargets` — Summary
Returns the section titles to search for symbols based on the document layer.

#### `looksLikeSymbolIdentifier` {#symbol-lookslikesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L332)

##### `looksLikeSymbolIdentifier` — Summary
Returns true if the candidate looks like a valid symbol identifier.

#### `isPotentialLiveDocSymbol` {#symbol-ispotentiallivedocsymbol}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L339)

##### `isPotentialLiveDocSymbol` — Summary
Returns true if the candidate could be a Live Doc symbol (identifier or prefixed ID).

#### `extractSymbolToken` {#symbol-extractsymboltoken}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L354)

##### `extractSymbolToken` — Summary
Extracts the symbol token from a heading title.

#### `stripSymbolAnchor` {#symbol-stripsymbolanchor}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L374)

##### `stripSymbolAnchor` — Summary
Strips anchor markers like {#anchor} from a heading.

#### `stripSymbolWrappers` {#symbol-stripsymbolwrappers}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L381)

##### `stripSymbolWrappers` — Summary
Strips markdown formatting wrappers (backticks, bold, italic) from a value.

#### `normalizeMetadataKey` {#symbol-normalizemetadatakey}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L415)

##### `normalizeMetadataKey` — Summary
Normalizes a metadata key to lowercase with single spaces.

#### `splitMetadataList` {#symbol-splitmetadatalist}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L426)

##### `splitMetadataList` — Summary
Splits a metadata list value, handling markdown links.

#### `shouldRegisterInlineCode` {#symbol-shouldregisterinlinecode}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L446)
- Parameters: `details`: [`LiveDocDocumentDetails`](#symbol-livedocdocumentdetails)

##### `shouldRegisterInlineCode` — Summary
Determines if an inline code snippet should be registered as a symbol reference.

#### `MdmdDocumentDetails` {#symbol-mdmddocumentdetails}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L473)
- Returns: [`LiveDocDocumentDetails`](#symbol-livedocdocumentdetails)

##### `MdmdDocumentDetails` — Additional Documentation
- @deprecated Use {@link LiveDocDocumentDetails} instead.

#### `extractMdmdDocumentDetails` {#symbol-extractmdmddocumentdetails}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L475)

##### `extractMdmdDocumentDetails` — Additional Documentation
- @deprecated Use {@link extractLiveDocDocumentDetails} instead.

#### `createMdmdMetadataHints` {#symbol-createmdmdmetadatahints}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L477)

##### `createMdmdMetadataHints` — Additional Documentation
- @deprecated Use {@link createLiveDocMetadataHints} instead.

#### `parseMdmdMetadata` {#symbol-parsemdmdmetadata}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L479)

##### `parseMdmdMetadata` — Additional Documentation
- @deprecated Use {@link parseLiveDocMetadata} instead.

#### `isPotentialMdmdSymbol` {#symbol-ispotentialmdmdsymbol}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L481)

##### `isPotentialMdmdSymbol` — Additional Documentation
- @deprecated Use {@link isPotentialLiveDocSymbol} instead.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:url` - `pathToFileURL`
- [`linkHintExtractor.LinkHintContext`](./linkHintExtractor.ts.mdmd.md#symbol-linkhintcontext)
- [`linkHintExtractor.resolveReferencePath`](./linkHintExtractor.ts.mdmd.md#symbol-resolvereferencepath)
- [`fallbackInference.RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint)
<!-- LIVE-DOC:END Dependencies -->

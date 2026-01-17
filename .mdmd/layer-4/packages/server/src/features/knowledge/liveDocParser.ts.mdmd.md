# packages/server/src/features/knowledge/liveDocParser.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/liveDocParser.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-livedocparser-ts
- Generated At: 2026-01-17T18:11:29.462Z

## Authored
### Purpose
Parses Live Documentation markdown files (originally MDMD format) to extract structured metadata—layer, identifiers, code paths, exports, and section symbols—enabling workspaceIndexProvider to seed the knowledge graph with document-to-code relationships and symbol references for integration test environments and graph audits.

### Notes
- Created 2025-12-08 during workspaceIndexProvider modularization (commit `4cd6cfa1`); extracted from 1461-line orchestrator to isolate MDMD parsing logic ([chat log](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-08.2.SUMMARIZED.md)).
- Renamed from mdmdParser.ts → liveDocParser.ts on 2025-12-14 during Phase 1 npm readiness cleanup to eliminate workspace-specific naming from production code ([chat log](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-14.1.md)).
- The "MDMD" naming persists in function/interface names (`extractMdmdDocumentDetails`, `MdmdDocumentDetails`) as an internal implementation detail; the module itself now uses the public "Live Documentation" branding.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T18:11:29.462Z","inputHash":"b8f7518e21526034"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MdmdDocumentDetails` {#symbol-mdmddocumentdetails}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L7)

#### `DocumentSymbolReferenceMetadata` {#symbol-documentsymbolreferencemetadata}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L16)

#### `extractMdmdDocumentDetails` {#symbol-extractmdmddocumentdetails}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L26)
- Returns: [`MdmdDocumentDetails`](#symbol-mdmddocumentdetails)

##### `extractMdmdDocumentDetails` — Summary
Extracts MDMD document details from markdown content.

#### `createMdmdMetadataHints` {#symbol-createmdmdmetadatahints}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L43)
- Parameters: `details`: [`MdmdDocumentDetails`](#symbol-mdmddocumentdetails); `context`: [`LinkHintContext`](./linkHintExtractor.ts.mdmd.md#symbol-linkhintcontext)

##### `createMdmdMetadataHints` — Summary
Creates relationship hints from MDMD metadata code paths.

#### `extractDocumentSymbolReferences` {#symbol-extractdocumentsymbolreferences}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L74)
- Returns: [`DocumentSymbolReferenceMetadata`](#symbol-documentsymbolreferencemetadata)[]
- Parameters: `mdmdDetails`: [`MdmdDocumentDetails`](#symbol-mdmddocumentdetails)

##### `extractDocumentSymbolReferences` — Summary
Extracts symbol references from document content.

#### `parseMdmdMetadata` {#symbol-parsemdmdmetadata}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L125)

##### `parseMdmdMetadata` — Summary
Parses MDMD metadata section from markdown content.

#### `collectSectionSymbols` {#symbol-collectsectionsymbols}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L253)

##### `collectSectionSymbols` — Summary
Collects symbol names from specific section headings.

#### `resolveSectionSymbolTargets` {#symbol-resolvesectionsymboltargets}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L296)

##### `resolveSectionSymbolTargets` — Summary
Returns the section titles to search for symbols based on the document layer.

#### `looksLikeSymbolIdentifier` {#symbol-lookslikesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L330)

##### `looksLikeSymbolIdentifier` — Summary
Returns true if the candidate looks like a valid symbol identifier.

#### `isPotentialMdmdSymbol` {#symbol-ispotentialmdmdsymbol}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L337)

##### `isPotentialMdmdSymbol` — Summary
Returns true if the candidate could be an MDMD symbol (identifier or prefixed ID).

#### `extractSymbolToken` {#symbol-extractsymboltoken}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L352)

##### `extractSymbolToken` — Summary
Extracts the symbol token from a heading title.

#### `stripSymbolAnchor` {#symbol-stripsymbolanchor}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L372)

##### `stripSymbolAnchor` — Summary
Strips anchor markers like {#anchor} from a heading.

#### `stripSymbolWrappers` {#symbol-stripsymbolwrappers}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L379)

##### `stripSymbolWrappers` — Summary
Strips markdown formatting wrappers (backticks, bold, italic) from a value.

#### `normalizeMetadataKey` {#symbol-normalizemetadatakey}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L413)

##### `normalizeMetadataKey` — Summary
Normalizes a metadata key to lowercase with single spaces.

#### `splitMetadataList` {#symbol-splitmetadatalist}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L424)

##### `splitMetadataList` — Summary
Splits a metadata list value, handling markdown links.

#### `shouldRegisterInlineCode` {#symbol-shouldregisterinlinecode}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/liveDocParser.ts#L444)
- Parameters: `details`: [`MdmdDocumentDetails`](#symbol-mdmddocumentdetails)

##### `shouldRegisterInlineCode` — Summary
Determines if an inline code snippet should be registered as a symbol reference.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:url` - `pathToFileURL`
- [`linkHintExtractor.LinkHintContext`](./linkHintExtractor.ts.mdmd.md#symbol-linkhintcontext)
- [`linkHintExtractor.resolveReferencePath`](./linkHintExtractor.ts.mdmd.md#symbol-resolvereferencepath)
- [`fallbackInference.RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint)
<!-- LIVE-DOC:END Dependencies -->

# packages/server/src/features/knowledge/mdmdParser.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/mdmdParser.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-mdmdparser-ts
- Generated At: 2025-12-08T19:22:38.872Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T19:22:38.872Z","inputHash":"f9639c1a2d330a06"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MdmdDocumentDetails` {#symbol-mdmddocumentdetails}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L7)

#### `DocumentSymbolReferenceMetadata` {#symbol-documentsymbolreferencemetadata}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L16)

#### `extractMdmdDocumentDetails` {#symbol-extractmdmddocumentdetails}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L26)
- Returns: [`MdmdDocumentDetails`](./workspaceIndexProvider.ts.mdmd.md#symbol-mdmddocumentdetails)

##### `extractMdmdDocumentDetails` — Summary
Extracts MDMD document details from markdown content.

#### `createMdmdMetadataHints` {#symbol-createmdmdmetadatahints}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L43)
- Parameters: `details`: [`MdmdDocumentDetails`](./workspaceIndexProvider.ts.mdmd.md#symbol-mdmddocumentdetails); `context`: [`LinkHintContext`](./linkHintExtractor.ts.mdmd.md#symbol-linkhintcontext)

##### `createMdmdMetadataHints` — Summary
Creates relationship hints from MDMD metadata code paths.

#### `extractDocumentSymbolReferences` {#symbol-extractdocumentsymbolreferences}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L74)
- Returns: [`DocumentSymbolReferenceMetadata`](./workspaceIndexProvider.ts.mdmd.md#symbol-documentsymbolreferencemetadata)[]
- Parameters: `mdmdDetails`: [`MdmdDocumentDetails`](./workspaceIndexProvider.ts.mdmd.md#symbol-mdmddocumentdetails)

##### `extractDocumentSymbolReferences` — Summary
Extracts symbol references from document content.

#### `parseMdmdMetadata` {#symbol-parsemdmdmetadata}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L125)

##### `parseMdmdMetadata` — Summary
Parses MDMD metadata section from markdown content.

#### `collectSectionSymbols` {#symbol-collectsectionsymbols}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L253)

##### `collectSectionSymbols` — Summary
Collects symbol names from specific section headings.

#### `resolveSectionSymbolTargets` {#symbol-resolvesectionsymboltargets}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L296)

##### `resolveSectionSymbolTargets` — Summary
Returns the section titles to search for symbols based on the document layer.

#### `looksLikeSymbolIdentifier` {#symbol-lookslikesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L330)

##### `looksLikeSymbolIdentifier` — Summary
Returns true if the candidate looks like a valid symbol identifier.

#### `isPotentialMdmdSymbol` {#symbol-ispotentialmdmdsymbol}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L337)

##### `isPotentialMdmdSymbol` — Summary
Returns true if the candidate could be an MDMD symbol (identifier or prefixed ID).

#### `extractSymbolToken` {#symbol-extractsymboltoken}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L352)

##### `extractSymbolToken` — Summary
Extracts the symbol token from a heading title.

#### `stripSymbolAnchor` {#symbol-stripsymbolanchor}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L372)

##### `stripSymbolAnchor` — Summary
Strips anchor markers like {#anchor} from a heading.

#### `stripSymbolWrappers` {#symbol-stripsymbolwrappers}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L379)

##### `stripSymbolWrappers` — Summary
Strips markdown formatting wrappers (backticks, bold, italic) from a value.

#### `normalizeMetadataKey` {#symbol-normalizemetadatakey}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L413)

##### `normalizeMetadataKey` — Summary
Normalizes a metadata key to lowercase with single spaces.

#### `splitMetadataList` {#symbol-splitmetadatalist}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L424)

##### `splitMetadataList` — Summary
Splits a metadata list value, handling markdown links.

#### `shouldRegisterInlineCode` {#symbol-shouldregisterinlinecode}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/mdmdParser.ts#L444)
- Parameters: `details`: [`MdmdDocumentDetails`](./workspaceIndexProvider.ts.mdmd.md#symbol-mdmddocumentdetails)

##### `shouldRegisterInlineCode` — Summary
Determines if an inline code snippet should be registered as a symbol reference.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `RelationshipHint`
- `node:url` - `pathToFileURL`
- [`linkHintExtractor.LinkHintContext`](./linkHintExtractor.ts.mdmd.md#symbol-linkhintcontext)
- [`linkHintExtractor.resolveReferencePath`](./linkHintExtractor.ts.mdmd.md#symbol-resolvereferencepath)
<!-- LIVE-DOC:END Dependencies -->

# packages/server/src/features/knowledge/linkHintExtractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/linkHintExtractor.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-linkhintextractor-ts
- Generated At: 2025-12-08T19:22:38.831Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T19:22:38.831Z","inputHash":"779e165cd140bb05"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkHintContext` {#symbol-linkhintcontext}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/linkHintExtractor.ts#L8)

#### `extractLinkHints` {#symbol-extractlinkhints}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/linkHintExtractor.ts#L20)
- Parameters: `context`: [`LinkHintContext`](#symbol-linkhintcontext)

##### `extractLinkHints` — Summary
Extracts relationship hints from `@link` directives in file content.

#### `extractPathReferenceHints` {#symbol-extractpathreferencehints}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/linkHintExtractor.ts#L52)
- Parameters: `context`: [`LinkHintContext`](#symbol-linkhintcontext)

##### `extractPathReferenceHints` — Summary
Extracts relationship hints from string-literal path references.

#### `isExternalReference` {#symbol-isexternalreference}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/linkHintExtractor.ts#L100)

##### `isExternalReference` — Summary
Returns true if the reference appears to be an external URL.

#### `resolveReferencePath` {#symbol-resolvereferencepath}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/linkHintExtractor.ts#L107)
- Parameters: `context`: [`LinkHintContext`](#symbol-linkhintcontext)

##### `resolveReferencePath` — Summary
Attempts to resolve a path reference to an absolute file path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `RelationshipHint`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`directoryScanner.fileExists`](./directoryScanner.ts.mdmd.md#symbol-fileexists)
<!-- LIVE-DOC:END Dependencies -->

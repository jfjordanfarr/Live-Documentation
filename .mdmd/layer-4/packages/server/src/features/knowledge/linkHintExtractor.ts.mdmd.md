# packages/server/src/features/knowledge/linkHintExtractor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/linkHintExtractor.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-linkhintextractor-ts
- Generated At: 2026-01-17T18:11:29.459Z

## Authored
### Purpose
Extracts relationship hints from code files by parsing `@link` directives and string-literal path references. Converts discovered references into `documents` relationship hints for the knowledge graph.

### Notes
- Extracted 2025-12-08 from `workspaceIndexProvider.ts` during the refactoring session
- `extractLinkHints()` parses `@link directive` comments (0.9 confidence)
- `extractPathReferenceHints()` finds string paths like `./templates/x.md` (0.75 confidence)
- `resolveReferencePath()` handles relative/absolute path resolution and exports for reuse in `mdmdParser.ts`

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T18:11:29.459Z","inputHash":"33adf697023887cf"}]} -->
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
- `node:path`
- `node:url` - `pathToFileURL`
- [`directoryScanner.fileExists`](./directoryScanner.ts.mdmd.md#symbol-fileexists)
- [`fallbackInference.RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint)
<!-- LIVE-DOC:END Dependencies -->

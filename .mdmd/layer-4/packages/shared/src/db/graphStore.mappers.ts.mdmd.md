# packages/shared/src/db/graphStore.mappers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/db/graphStore.mappers.ts
- Live Doc ID: LD-implementation-packages-shared-src-db-graphstore-mappers-ts
- Generated At: 2025-12-08T19:22:39.366Z

## Authored
### Purpose
Row-to-domain mapper functions for the GraphStore database layer. Converts raw SQLite row types from `graphStore.types.ts` into typed domain objects from `domain/artifacts.ts`, handling JSON parsing, null coalescing, and type narrowing.

### Notes
- Extracted 2025-12-08 from `graphStore.ts` during the workspaceIndexProvider extraction session
- Each `map*Row()` function is a pure transformation with no side effects
- Handles nullable database fields by converting to `undefined` for domain model consistency
- JSON-stringified columns (`metadata`, `link_ids`, `llm_assessment`) are safely parsed with fallbacks
- 252 lines covering 5 entity types plus helper parsing functions

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T19:22:39.366Z","inputHash":"6359367299c57506"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `mapArtifactRow` {#symbol-mapartifactrow}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L23)
- Returns: [`KnowledgeArtifact`](../../../extension/src/shared/artifactSchemas.ts.mdmd.md#symbol-knowledgeartifact)
- Parameters: `row`: [`ArtifactRow`](./graphStore.types.ts.mdmd.md#symbol-artifactrow)

##### `mapArtifactRow` — Summary
Maps a database row to a KnowledgeArtifact domain object.

#### `mapLinkRow` {#symbol-maplinkrow}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L39)
- Returns: [`LinkRelationship`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationship)
- Parameters: `row`: [`LinkRow`](./graphStore.types.ts.mdmd.md#symbol-linkrow)

##### `mapLinkRow` — Summary
Maps a database row to a LinkRelationship domain object.

#### `mapLlmEdgeProvenanceRow` {#symbol-mapllmedgeprovenancerow}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L54)
- Returns: [`LlmEdgeProvenance`](../domain/artifacts.ts.mdmd.md#symbol-llmedgeprovenance)
- Parameters: `row`: [`LlmEdgeProvenanceRow`](./graphStore.types.ts.mdmd.md#symbol-llmedgeprovenancerow)

##### `mapLlmEdgeProvenanceRow` — Summary
Maps a database row to an LlmEdgeProvenance domain object.

#### `mapDiagnosticRow` {#symbol-mapdiagnosticrow}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L77)
- Returns: [`DiagnosticRecord`](../domain/artifacts.ts.mdmd.md#symbol-diagnosticrecord)
- Parameters: `row`: [`DiagnosticRow`](./graphStore.types.ts.mdmd.md#symbol-diagnosticrow)

##### `mapDiagnosticRow` — Summary
Maps a database row to a DiagnosticRecord domain object.

#### `mapDriftHistoryRow` {#symbol-mapdrifthistoryrow}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L97)
- Returns: [`DriftHistoryEntry`](../domain/artifacts.ts.mdmd.md#symbol-drifthistoryentry)
- Parameters: `row`: [`DriftHistoryRow`](./graphStore.types.ts.mdmd.md#symbol-drifthistoryrow)

##### `mapDriftHistoryRow` — Summary
Maps a database row to a DriftHistoryEntry domain object.

#### `parseMetadata` {#symbol-parsemetadata}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L116)

##### `parseMetadata` — Summary
Parses a JSON string into a metadata record.

#### `parseLinkIds` {#symbol-parselinkids}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L131)

##### `parseLinkIds` — Summary
Parses a JSON string into an array of link IDs.

#### `parseLlmAssessment` {#symbol-parsellmassessment}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L147)
- Returns: [`LlmAssessment`](../domain/artifacts.ts.mdmd.md#symbol-llmassessment)

##### `parseLlmAssessment` — Summary
Parses a JSON string into an LlmAssessment object.

#### `normalizeTier` {#symbol-normalizetier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L226)

##### `normalizeTier` — Summary
Normalizes a confidence tier string to a valid tier value.

#### `parseStringArray` {#symbol-parsestringarray}
- Type: function
- Source: [source](../../../../../../packages/shared/src/db/graphStore.mappers.ts#L237)

##### `parseStringArray` — Summary
Parses a JSON string into a string array.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./graphStore.types` - `ArtifactRow`, `DiagnosticRow`, `DriftHistoryRow`, `LinkRow`, `LlmEdgeProvenanceRow`
- [`artifacts.DiagnosticRecord`](../domain/artifacts.ts.mdmd.md#symbol-diagnosticrecord)
- [`artifacts.DiagnosticStatus`](../domain/artifacts.ts.mdmd.md#symbol-diagnosticstatus)
- [`artifacts.DriftHistoryEntry`](../domain/artifacts.ts.mdmd.md#symbol-drifthistoryentry)
- [`artifacts.DriftHistoryStatus`](../domain/artifacts.ts.mdmd.md#symbol-drifthistorystatus)
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact)
- [`artifacts.LinkRelationship`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationship)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
- [`artifacts.LlmAssessment`](../domain/artifacts.ts.mdmd.md#symbol-llmassessment)
- [`artifacts.LlmEdgeProvenance`](../domain/artifacts.ts.mdmd.md#symbol-llmedgeprovenance)
<!-- LIVE-DOC:END Dependencies -->

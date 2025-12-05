# packages/server/src/features/knowledge/schemaValidator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/schemaValidator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-schemavalidator-ts
- Generated At: 2025-12-05T15:37:23.961Z

## Authored
### Purpose
Validates incoming knowledge snapshots and stream events so ingestion rejects malformed artifacts, relationships, or metadata before touching the graph.

### Notes
- Added with the knowledge schema spike documented in [2025-10-17 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md) alongside SpecKit requirements.
- Layer-4 notes refreshed during the Oct 30 metadata audit (see [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)) when validation guidance was woven into architecture docs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:23.961Z","inputHash":"60656395d7d47c97"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SchemaViolation` {#symbol-schemaviolation}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L11)

#### `SchemaValidationResult` {#symbol-schemavalidationresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L16)

#### `validateSnapshot` {#symbol-validatesnapshot}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L44)
- Returns: `SchemaValidationResult`
- Parameters: `snapshot`: [`ExternalSnapshot`](../../../../shared/src/knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalsnapshot)

#### `validateStreamEvent` {#symbol-validatestreamevent}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L108)
- Returns: `SchemaValidationResult`
- Parameters: `event`: [`ExternalStreamEvent`](../../../../shared/src/knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalstreamevent)

#### `assertValidSnapshot` {#symbol-assertvalidsnapshot}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L184)
- Parameters: `snapshot`: [`ExternalSnapshot`](../../../../shared/src/knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalsnapshot)

#### `assertValidStreamEvent` {#symbol-assertvalidstreamevent}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L191)
- Parameters: `event`: [`ExternalStreamEvent`](../../../../shared/src/knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalstreamevent)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactLayer`, `ExternalArtifact`, `ExternalLink`, `ExternalSnapshot`, `ExternalStreamEvent`, `LinkRelationshipKind`, `StreamEventKind`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [knowledgeFeedManager.test.ts](./knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](./knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](./knowledgeGraphIngestor.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

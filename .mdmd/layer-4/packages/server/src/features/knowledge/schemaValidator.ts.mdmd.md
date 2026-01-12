# packages/server/src/features/knowledge/schemaValidator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/schemaValidator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-schemavalidator-ts
- Generated At: 2026-01-12T21:47:40.536Z

## Authored
### Purpose
Validates incoming knowledge snapshots and stream events so ingestion rejects malformed artifacts, relationships, or metadata before touching the graph.

### Notes
- Added with the knowledge schema spike documented in [2025-10-17 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md) alongside SpecKit requirements.
- Layer-4 notes refreshed during the Oct 30 metadata audit (see [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)) when validation guidance was woven into architecture docs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.536Z","inputHash":"63dbcdf9c5dbb41e"}]} -->
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
- Returns: [`SchemaValidationResult`](#symbol-schemavalidationresult)
- Parameters: `snapshot`: [`ExternalSnapshot`](../../../../shared/src/knowledge/externalTypes.ts.mdmd.md#symbol-externalsnapshot)

#### `validateStreamEvent` {#symbol-validatestreamevent}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L108)
- Returns: [`SchemaValidationResult`](#symbol-schemavalidationresult)
- Parameters: `event`: [`ExternalStreamEvent`](../../../../shared/src/knowledge/externalTypes.ts.mdmd.md#symbol-externalstreamevent)

#### `assertValidSnapshot` {#symbol-assertvalidsnapshot}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L184)
- Parameters: `snapshot`: [`ExternalSnapshot`](../../../../shared/src/knowledge/externalTypes.ts.mdmd.md#symbol-externalsnapshot)

#### `assertValidStreamEvent` {#symbol-assertvalidstreamevent}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/schemaValidator.ts#L191)
- Parameters: `event`: [`ExternalStreamEvent`](../../../../shared/src/knowledge/externalTypes.ts.mdmd.md#symbol-externalstreamevent)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.ArtifactLayer`](../../../../shared/src/index.ts.mdmd.md#symbol-artifactlayer)
- [`index.ExternalArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-externalartifact)
- [`index.ExternalLink`](../../../../shared/src/index.ts.mdmd.md#symbol-externallink)
- [`index.ExternalSnapshot`](../../../../shared/src/index.ts.mdmd.md#symbol-externalsnapshot)
- [`index.ExternalStreamEvent`](../../../../shared/src/index.ts.mdmd.md#symbol-externalstreamevent)
- [`index.LinkRelationshipKind`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind)
- [`index.StreamEventKind`](../../../../shared/src/index.ts.mdmd.md#symbol-streameventkind)
<!-- LIVE-DOC:END Dependencies -->

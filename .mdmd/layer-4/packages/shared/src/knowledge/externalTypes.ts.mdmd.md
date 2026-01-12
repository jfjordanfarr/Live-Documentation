# packages/shared/src/knowledge/externalTypes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/knowledge/externalTypes.ts
- Live Doc ID: LD-implementation-packages-shared-src-knowledge-externaltypes-ts
- Generated At: 2026-01-12T21:47:40.687Z

## Authored
### Purpose
Defines pure Data Transfer Object (DTO) types for consuming external knowledge feeds such as LSIF indexes, SCIP semantic graphs, or future third-party sources. These types describe the shape of external artifacts, links, snapshots, and streaming events without imposing any implementation dependencies.

### Notes
- Created during the Jan 2026 GraphStore elimination refactor to preserve feed-related types needed by `linkInference.ts`.
- These DTOs have no class implementations—they are intentionally lightweight type definitions.
- Future LSIF/SCIP feed integration will parse external data into these shapes before merging into Live Docs.
- The types mirror the eliminated `KnowledgeGraphBridge` contract but without SQLite persistence.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.687Z","inputHash":"1c8a0148541e266e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExternalArtifact` {#symbol-externalartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/externalTypes.ts#L8)

#### `ExternalLink` {#symbol-externallink}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/externalTypes.ts#L19)

#### `ExternalSnapshot` {#symbol-externalsnapshot}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/externalTypes.ts#L30)

#### `StreamEventKind` {#symbol-streameventkind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/knowledge/externalTypes.ts#L39)

#### `ExternalStreamEvent` {#symbol-externalstreamevent}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/externalTypes.ts#L45)

#### `StreamCheckpoint` {#symbol-streamcheckpoint}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/knowledge/externalTypes.ts#L56)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.ArtifactLayer`](../domain/artifacts.ts.mdmd.md#symbol-artifactlayer) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [linkInference.test.ts](../inference/linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

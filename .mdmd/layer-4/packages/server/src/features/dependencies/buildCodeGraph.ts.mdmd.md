# packages/server/src/features/dependencies/buildCodeGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/dependencies/buildCodeGraph.ts
- Live Doc ID: LD-implementation-packages-server-src-features-dependencies-buildcodegraph-ts
- Generated At: 2025-12-07T21:41:17.399Z

## Authored
### Purpose
Performs breadth-first traversal over incoming dependency links to generate the impact edges consumed by the T039 dependency quick pick described in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Caps traversal depth and link kinds to keep dependency fan-out predictable while still honouring transitive chains for the inspect/quick pick experiences.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:17.399Z","inputHash":"e5eef005fc3c2be1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CodeImpactEdge` {#symbol-codeimpactedge}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/dependencies/buildCodeGraph.ts#L4)

#### `BuildCodeGraphOptions` {#symbol-buildcodegraphoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/dependencies/buildCodeGraph.ts#L17)

#### `buildCodeImpactGraph` {#symbol-buildcodeimpactgraph}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/dependencies/buildCodeGraph.ts#L32)
- Returns: [`CodeImpactEdge`](#symbol-codeimpactedge)[]
- Parameters: `graphStore`: [`GraphStore`](../../../../shared/src/db/graphStore.ts.mdmd.md#symbol-graphstore); `triggers`: [`KnowledgeArtifact`](../../../../extension/src/shared/artifactSchemas.ts.mdmd.md#symbol-knowledgeartifact)[]; `options`: [`BuildCodeGraphOptions`](#symbol-buildcodegraphoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`, `KnowledgeArtifact`, `LinkRelationshipKind`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [inspectDependencies.test.ts](./inspectDependencies.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

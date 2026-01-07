# packages/extension/src/shared/artifactSchemas.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/shared/artifactSchemas.ts
- Live Doc ID: LD-implementation-packages-extension-src-shared-artifactschemas-ts
- Generated At: 2026-01-07T22:04:53.484Z

## Authored
### Purpose
Centralises Zod schemas for artifact layers, knowledge artifacts, and relationship kinds so extension-side quick picks validate the same payloads as the language server, work originally introduced in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L6534-L6574](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L6534-L6574).

### Notes
When we added Live Doc metadata to the quick pick outputs on 2025-11-01 ([AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L5908-L6070](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L5908-L6070)), these schemas kept the client aligned with the shared contracts—extend them in tandem with `packages/shared/src/contracts/diagnostics.ts` anytime new relationship kinds appear.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T22:04:53.484Z","inputHash":"e368cdc68ed83707"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactLayerSchema` {#symbol-artifactlayerschema}
- Type: const
- Source: [source](../../../../../../packages/extension/src/shared/artifactSchemas.ts#L3)

#### `ArtifactLayer` {#symbol-artifactlayer}
- Type: type
- Source: [source](../../../../../../packages/extension/src/shared/artifactSchemas.ts#L11)
- Returns: `z.infer`

#### `KnowledgeArtifactSchema` {#symbol-knowledgeartifactschema}
- Type: const
- Source: [source](../../../../../../packages/extension/src/shared/artifactSchemas.ts#L13)

#### `KnowledgeArtifact` {#symbol-knowledgeartifact}
- Type: type
- Source: [source](../../../../../../packages/extension/src/shared/artifactSchemas.ts#L24)
- Returns: `z.infer`

#### `LinkRelationshipKindSchema` {#symbol-linkrelationshipkindschema}
- Type: const
- Source: [source](../../../../../../packages/extension/src/shared/artifactSchemas.ts#L26)

#### `LinkRelationshipKind` {#symbol-linkrelationshipkind}
- Type: type
- Source: [source](../../../../../../packages/extension/src/shared/artifactSchemas.ts#L34)
- Returns: `z.infer`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `zod` - `z`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [dependencyQuickPick.test.ts](../diagnostics/dependencyQuickPick.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

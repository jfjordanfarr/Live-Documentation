# packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts
- Live Doc ID: LD-implementation-packages-server-src-prompts-llm-ingestion-relationshiptemplate-ts
- Generated At: 2026-01-17T18:11:29.525Z

## Authored
### Purpose
Renders the versioned relationship-extraction prompt and JSON schema that power our LLM ingestion dry-run so we can feed artifacts/chunks into the model and expect a normalized `relationships` payload <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1915-L1925> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L5840-L5850>.

### Notes
- Keep the prompt text, response schema, and `dry-run.sample.json` fixture in lockstep—our orchestrator and integration tests treat that sample as the canonical contract <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L2457-L2499> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6045-L6052>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T18:11:29.525Z","inputHash":"124df3d18148a3dd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConfidenceLabel` {#symbol-confidencelabel}
- Type: type
- Source: [source](../../../../../../../packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts#L5)

#### `PromptArtifactSummary` {#symbol-promptartifactsummary}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts#L7)

#### `PromptChunkSummary` {#symbol-promptchunksummary}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts#L15)

#### `RelationshipPromptOptions` {#symbol-relationshippromptoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts#L24)

#### `RenderedRelationshipPrompt` {#symbol-renderedrelationshipprompt}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts#L33)

#### `renderRelationshipExtractionPrompt` {#symbol-renderrelationshipextractionprompt}
- Type: function
- Source: [source](../../../../../../../packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts#L44)
- Returns: [`RenderedRelationshipPrompt`](#symbol-renderedrelationshipprompt)
- Parameters: `options`: [`RelationshipPromptOptions`](#symbol-relationshippromptoptions)

#### `RELATIONSHIP_RESPONSE_SCHEMA` {#symbol-relationship_response_schema}
- Type: const
- Source: [source](../../../../../../../packages/server/src/prompts/llm-ingestion/relationshipTemplate.ts#L126)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- [`artifacts.ArtifactLayer`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-artifactlayer) (type-only)
- [`artifacts.LinkRelationshipKind`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

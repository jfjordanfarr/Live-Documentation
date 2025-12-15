# packages/server/src/features/changeEvents/saveDocumentChange.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/changeEvents/saveDocumentChange.ts
- Live Doc ID: LD-implementation-packages-server-src-features-changeevents-savedocumentchange-ts
- Generated At: 2025-12-15T00:38:06.164Z

## Authored
### Purpose
Persists markdown change events and any accompanying inference output into the graph store, completing the doc-to-diagnostics loop captured in [2025-10-17 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md).

### Notes
- Generates canonical artifact records and change-event IDs even when inference metadata is absent, ensuring downstream diagnostics still learn about the save.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.164Z","inputHash":"223d889dfd2b795d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PersistedDocumentChange` {#symbol-persisteddocumentchange}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/saveDocumentChange.ts#L12)

#### `SaveDocumentChangeOptions` {#symbol-savedocumentchangeoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/saveDocumentChange.ts#L17)

#### `persistInferenceResult` {#symbol-persistinferenceresult}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/saveDocumentChange.ts#L25)
- Parameters: `graphStore`: [`GraphStore`](../../../../shared/src/db/graphStore.ts.mdmd.md#symbol-graphstore); `inference`: [`LinkInferenceRunResult`](../../../../shared/src/inference/linkInference.ts.mdmd.md#symbol-linkinferencerunresult)

#### `saveDocumentChange` {#symbol-savedocumentchange}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/saveDocumentChange.ts#L59)
- Returns: [`PersistedDocumentChange`](#symbol-persisteddocumentchange)
- Parameters: `options`: [`SaveDocumentChangeOptions`](#symbol-savedocumentchangeoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `randomUUID`
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`artifactWatcher.DocumentTrackedArtifactChange`](../watchers/artifactWatcher.ts.mdmd.md#symbol-documenttrackedartifactchange) (type-only)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- [`index.LinkInferenceRunResult`](../../../../shared/src/index.ts.mdmd.md#symbol-linkinferencerunresult)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [saveDocumentChange.test.ts](./saveDocumentChange.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

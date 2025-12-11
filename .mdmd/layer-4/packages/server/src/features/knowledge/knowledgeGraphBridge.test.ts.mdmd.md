# packages/server/src/features/knowledge/knowledgeGraphBridge.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/knowledge/knowledgeGraphBridge.test.ts
- Live Doc ID: LD-test-packages-server-src-features-knowledge-knowledgegraphbridge-test-ts
- Generated At: 2025-12-11T02:38:00.642Z

## Authored
### Purpose
Confirms the bridge service discovers static knowledge feeds, hydrates them into the GraphStore, and publishes health updates, matching the ingestion workflow delivered in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Exercises both the happy path (static JSON feed + onStatusChanged listeners) and the disabled-workspace fallback, ensuring the service keeps safeguards added during the Oct 30 refinement cycle ([2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.642Z","inputHash":"909ae1b88c1d1eaa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`
- `node:fs` - `mkdirSync`, `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`knowledgeGraphBridge.KnowledgeGraphBridgeLogger`](./knowledgeGraphBridge.ts.mdmd.md#symbol-knowledgegraphbridgelogger)
- [`knowledgeGraphBridge.KnowledgeGraphBridgeService`](./knowledgeGraphBridge.ts.mdmd.md#symbol-knowledgegraphbridgeservice)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/knowledge: [feedCheckpointStore.ts](./feedCheckpointStore.ts.mdmd.md), [feedDiagnosticsGateway.ts](./feedDiagnosticsGateway.ts.mdmd.md), [feedFormatDetector.ts](./feedFormatDetector.ts.mdmd.md), [knowledgeFeedManager.ts](./knowledgeFeedManager.ts.mdmd.md), [knowledgeGraphBridge.ts](./knowledgeGraphBridge.ts.mdmd.md), [knowledgeGraphIngestor.ts](./knowledgeGraphIngestor.ts.mdmd.md)
  [lsifParser.ts](./lsifParser.ts.mdmd.md), [schemaValidator.ts](./schemaValidator.ts.mdmd.md), [scipParser.ts](./scipParser.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

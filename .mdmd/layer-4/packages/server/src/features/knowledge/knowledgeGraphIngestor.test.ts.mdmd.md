# packages/server/src/features/knowledge/knowledgeGraphIngestor.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/knowledge/knowledgeGraphIngestor.test.ts
- Live Doc ID: LD-test-packages-server-src-features-knowledge-knowledgegraphingestor-test-ts
- Generated At: 2025-12-15T00:38:06.341Z

## Authored
### Purpose
Validates the ingestion pipeline built on Oct 20 by driving snapshots and stream events through the orchestrator, ensuring knowledge feeds populate normalized artifacts, checkpoints, and health signals as described in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Covers regression cases for URI-based link reconciliation, duplicate event suppression, and degraded status reporting, aligning with the resilience requirements reinforced during the Oct 30 hardening pass ([2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.341Z","inputHash":"cb2f0376c8af89d1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `mkdtempSync`, `rmSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`feedCheckpointStore.FileFeedCheckpointStore`](./feedCheckpointStore.ts.mdmd.md#symbol-filefeedcheckpointstore)
- [`feedDiagnosticsGateway.FeedDiagnosticsGateway`](./feedDiagnosticsGateway.ts.mdmd.md#symbol-feeddiagnosticsgateway)
- [`feedDiagnosticsGateway.FeedStatusSummary`](./feedDiagnosticsGateway.ts.mdmd.md#symbol-feedstatussummary)
- [`knowledgeGraphIngestor.KnowledgeGraphIngestor`](./knowledgeGraphIngestor.ts.mdmd.md#symbol-knowledgegraphingestor)
- [`index.ExternalSnapshot`](../../../../shared/src/index.ts.mdmd.md#symbol-externalsnapshot)
- [`index.ExternalStreamEvent`](../../../../shared/src/index.ts.mdmd.md#symbol-externalstreamevent)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeGraphBridge`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgegraphbridge)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/knowledge: [feedCheckpointStore.ts](./feedCheckpointStore.ts.mdmd.md), [feedDiagnosticsGateway.ts](./feedDiagnosticsGateway.ts.mdmd.md), [knowledgeGraphIngestor.ts](./knowledgeGraphIngestor.ts.mdmd.md), [schemaValidator.ts](./schemaValidator.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

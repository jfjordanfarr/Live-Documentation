# packages/server/src/features/utils/uri.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/utils/uri.ts
- Live Doc ID: LD-implementation-packages-server-src-features-utils-uri-ts
- Generated At: 2025-12-15T00:38:06.593Z

## Authored
### Purpose
Provides a server-scoped re-export of `normalizeFileUri` so every feature imports canonical URI logic through the features namespace, keeping watcher, diagnostics, and knowledge ingestion modules aligned on the same normalization contract.

### Notes
- Introduced during the URI canonicalization sweep captured in [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md) after duplicate nodes surfaced in the graph store.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.593Z","inputHash":"6148d03533780ac6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `normalizeFileUri` {#symbol-normalizefileuri}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/utils/uri.ts#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`normalizeFileUri.normalizeFileUri`](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [saveCodeChange.test.ts](../changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../dependencies/symbolNeighbors.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../watchers/pathReferenceDetector.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../telemetry/latencyTracker.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

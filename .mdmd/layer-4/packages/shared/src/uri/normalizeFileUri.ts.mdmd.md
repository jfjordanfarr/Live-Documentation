# packages/shared/src/uri/normalizeFileUri.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/uri/normalizeFileUri.ts
- Live Doc ID: LD-implementation-packages-shared-src-uri-normalizefileuri-ts
- Generated At: 2025-12-11T02:38:02.425Z

## Authored
### Purpose
Centralises file URI canonicalisation so diagnostics, change events, and telemetry compare consistent `file://` strings across platforms ([shared refactor](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L3258-L3277)).

### Notes
- Re-exported through the server `uri.ts` shim so every watcher and change processor path goes through the same normaliser instead of ad hoc `pathToFileURL` calls ([shared refactor](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L3258-L3277)).
- Manually sanity-checked the built helper on Windows to confirm drive-letter casing and whitespace trimming behave as expected during the transitive diagnostics investigation ([debug session](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L2808-L2816)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.425Z","inputHash":"02831acba6cbbe81"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `normalizeFileUri` {#symbol-normalizefileuri}
- Type: function
- Source: [source](../../../../../../packages/shared/src/uri/normalizeFileUri.ts#L8)

##### `normalizeFileUri` — Summary
Normalise a file URI so equivalent paths resolve to a consistent canonical representation.
Ensures Windows drive letters and percent-encoded segments are handled uniformly.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [saveCodeChange.test.ts](../../../server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../../../server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../../../server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../../../server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../../../server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../../../server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../../../server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../../../server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../../../server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [inferenceAccuracy.test.ts](../../../server/src/telemetry/inferenceAccuracy.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

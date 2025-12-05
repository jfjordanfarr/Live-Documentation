# packages/server/src/features/watchers/artifactWatcher.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/watchers/artifactWatcher.ts
- Live Doc ID: LD-implementation-packages-server-src-features-watchers-artifactwatcher-ts
- Generated At: 2025-12-05T04:16:18.975Z

## Authored
### Purpose
Coordinates how workspace file updates flow into the server ingestion pipeline by classifying code versus documentation artifacts, harvesting reference hints, and driving link inference before writing results back to the GraphStore.

### Notes
- Replaced the legacy markdown watcher so code and doc changes share one queue and telemetry trail; see [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md) for the refactor narrative.
- Normalizes file URIs prior to persistence so downstream diagnostics and knowledge feeds address a single canonical node per artifact.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:18.975Z","inputHash":"3741921a34a12f7e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactCategory` {#symbol-artifactcategory}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L24)

#### `DocumentStore` {#symbol-documentstore}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L26)

#### `ArtifactWatcherLogger` {#symbol-artifactwatcherlogger}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L30)

#### `ArtifactWatcherOptions` {#symbol-artifactwatcheroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L36)

#### `TrackedArtifactChange` {#symbol-trackedartifactchange}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L48)

#### `DocumentTrackedArtifactChange` {#symbol-documenttrackedartifactchange}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L60)
- Returns: `TrackedArtifactChange`

#### `CodeTrackedArtifactChange` {#symbol-codetrackedartifactchange}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L61)
- Returns: `TrackedArtifactChange`

#### `SkippedArtifactChange` {#symbol-skippedartifactchange}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L63)

#### `ArtifactWatcherResult` {#symbol-artifactwatcherresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L68)

#### `ArtifactWatcher` {#symbol-artifactwatcher}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/watchers/artifactWatcher.ts#L89)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactLayer`, `ArtifactSeed`, `FallbackLLMBridge`, `GraphStore`, `KnowledgeArtifact`, `KnowledgeFeed`, `LinkInferenceOrchestrator`, `LinkInferenceRunResult`, `LinkedArtifactSummary`, `RelationshipHint`, `WorkspaceLinkProvider`
- `node:fs` - `promises`
- `node:path` - `path`
- `node:url` - `fileURLToPath`
- [`changeQueue.QueuedChange`](../changeEvents/changeQueue.ts.mdmd.md#symbol-queuedchange) (type-only)
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`pathReferenceDetector.buildFileReferenceHints`](./pathReferenceDetector.ts.mdmd.md#symbol-buildfilereferencehints)
- `vscode-languageserver-textdocument` - `TextDocument`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [saveCodeChange.test.ts](../changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [artifactWatcher.test.ts](./artifactWatcher.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

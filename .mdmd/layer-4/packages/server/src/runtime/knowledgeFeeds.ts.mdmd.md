# packages/server/src/runtime/knowledgeFeeds.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/runtime/knowledgeFeeds.ts
- Live Doc ID: LD-implementation-packages-server-src-runtime-knowledgefeeds-ts
- Generated At: 2025-12-15T00:38:06.657Z

## Authored
### Purpose
Bootstraps and supervises the knowledge-feed bridge so the language server only advertises healthy external feeds to the artifact watcher, a readiness gate we added while stabilising US5 in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-06-better-sqlite3-rebuild-discipline--feed-readiness-lines-2801-3600](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-06-better-sqlite3-rebuild-discipline--feed-readiness-lines-2801-3600).

### Notes
`KnowledgeFeedController` mirrors the `KnowledgeGraphBridgeService` health callbacks into the watcher so diagnostics avoid stale feeds; keep the log phrasing aligned with the telemetry expectations captured during that same pass in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2808-L2924](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2808-L2924). Any change to the backoff window or status semantics must be reflected in the extension telemetry consumers (`extension.ts`, status tree views) to preserve feed readiness UX.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.657Z","inputHash":"6204301e36639cda"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `KnowledgeFeedControllerOptions` {#symbol-knowledgefeedcontrolleroptions}
- Type: interface
- Source: [source](../../../../../../packages/server/src/runtime/knowledgeFeeds.ts#L13)

#### `KnowledgeFeedInitializeParams` {#symbol-knowledgefeedinitializeparams}
- Type: interface
- Source: [source](../../../../../../packages/server/src/runtime/knowledgeFeeds.ts#L18)

#### `KnowledgeFeedController` {#symbol-knowledgefeedcontroller}
- Type: class
- Source: [source](../../../../../../packages/server/src/runtime/knowledgeFeeds.ts#L25)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`knowledgeGraphBridge.KnowledgeGraphBridgeDisposable`](../features/knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-knowledgegraphbridgedisposable)
- [`knowledgeGraphBridge.KnowledgeGraphBridgeService`](../features/knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-knowledgegraphbridgeservice)
- [`artifactWatcher.ArtifactWatcher`](../features/watchers/artifactWatcher.ts.mdmd.md#symbol-artifactwatcher) (type-only)
- [`environment.describeError`](./environment.ts.mdmd.md#symbol-describeerror)
- [`index.GraphStore`](../../../shared/src/index.ts.mdmd.md#symbol-graphstore) (type-only)
- [`index.KnowledgeFeed`](../../../shared/src/index.ts.mdmd.md#symbol-knowledgefeed) (type-only)
- `vscode-languageserver/node` - `Connection` (type-only)
<!-- LIVE-DOC:END Dependencies -->

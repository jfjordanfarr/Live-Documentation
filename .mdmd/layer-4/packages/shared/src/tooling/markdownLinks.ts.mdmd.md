# packages/shared/src/tooling/markdownLinks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/markdownLinks.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-markdownlinks-ts
- Generated At: 2025-12-07T21:41:19.613Z

## Authored
### Purpose
Detects broken local markdown links for the SlopCop markdown audit by walking inline/reference syntax, resolving targets relative to the workspace, and surfacing line/column diagnostics ([SlopCop rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-33-symbol-audit-implementation-lines-5161-5900)).

### Notes
- The `slopcop:markdown` CLI and safe-to-commit gate call this helper so human runs, CI, and fixture tests all share the same ignore-glob and severity behaviour ([follow-up configuration pass](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-34-slopcop-configuration--doc-refresh-lines-5901-6500)).
- Feeds MDMD relationship analysis too—relationship resolvers reuse the detected targets to wire documentation ↔ code edges without reimplementing link parsing ([shared helper extraction](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.613Z","inputHash":"efdd6576cb1848d9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MarkdownLinkIssue` {#symbol-markdownlinkissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/markdownLinks.ts#L11)

#### `MarkdownLinkAuditOptions` {#symbol-markdownlinkauditoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/markdownLinks.ts#L19)

#### `findBrokenMarkdownLinks` {#symbol-findbrokenmarkdownlinks}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownLinks.ts#L29)
- Returns: [`MarkdownLinkIssue`](#symbol-markdownlinkissue)[]
- Parameters: `options`: [`MarkdownLinkAuditOptions`](#symbol-markdownlinkauditoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`markdownShared.computeLineStarts`](./markdownShared.ts.mdmd.md#symbol-computelinestarts)
- [`markdownShared.extractReferenceDefinitions`](./markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`markdownShared.parseLinkTarget`](./markdownShared.ts.mdmd.md#symbol-parselinktarget)
- [`markdownShared.toLineAndColumn`](./markdownShared.ts.mdmd.md#symbol-tolineandcolumn)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../../../extension/src/commands/analyzeWithAI.test.ts.mdmd.md)
- [exportDiagnostics.test.ts](../../../extension/src/commands/exportDiagnostics.test.ts.mdmd.md)
- [inspectSymbolNeighbors.test.ts](../../../extension/src/commands/inspectSymbolNeighbors.test.ts.mdmd.md)
- [dependencyQuickPick.test.ts](../../../extension/src/diagnostics/dependencyQuickPick.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../../../extension/src/diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
- [localOllamaBridge.test.ts](../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
- [symbolBridge.test.ts](../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [saveCodeChange.test.ts](../../../server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../../../server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../../../server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../../../server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md)
- [acknowledgementService.test.ts](../../../server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md)
- [listOutstandingDiagnostics.test.ts](../../../server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../../../server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [feedFormatDetector.test.ts](../../../server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../../../server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../../../server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../../../server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [llmIngestionOrchestrator.test.ts](../../../server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md)
- [lsifParser.test.ts](../../../server/src/features/knowledge/lsifParser.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../../../server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [scipParser.test.ts](../../../server/src/features/knowledge/scipParser.test.ts.mdmd.md)
- [workspaceIndexProvider.test.ts](../../../server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
- [markdownLinks.test.ts](./markdownLinks.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

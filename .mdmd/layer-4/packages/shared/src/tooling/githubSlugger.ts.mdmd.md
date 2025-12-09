# packages/shared/src/tooling/githubSlugger.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/githubSlugger.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-githubslugger-ts
- Generated At: 2025-12-09T01:18:23.578Z

## Authored
### Purpose
Provides a fully vendored GitHub-compatible slugger (function + stateful class) so Live Docs, SlopCop, and CLI tooling share identical heading-anchor logic without relying on the external `github-slugger` ESM package.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Exposes both stateless `slug` helpers and duplicate-tracking `GitHubSlugger` instances, enabling utilities like `slug-heading.ts` and the Live Docs generator to reuse the same behaviour.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]
- November 7 anchor-audit confirmed the maintainCase flag and unicode handling stay aligned with GitHub after targeting mis-slugged `COMP-003 – Heuristic Suite` references.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T01:18:23.578Z","inputHash":"0ff9c720d242862e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SlugContext` {#symbol-slugcontext}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L11)

#### `GitHubSlugger` {#symbol-githubslugger}
- Type: class
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L17)

#### `slug` {#symbol-slug}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L54)

#### `createSlugger` {#symbol-createslugger}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L63)
- Returns: [`GitHubSlugger`](#symbol-githubslugger)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`githubSluggerRegex.GITHUB_SLUG_REMOVE_PATTERN`](./githubSluggerRegex.ts.mdmd.md#symbol-github_slug_remove_pattern)
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
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
- [aspnet.test.ts](../live-docs/adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](../live-docs/adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](../live-docs/adapters/csharp.hangfire.test.ts.mdmd.md)
- [java.typeref.test.ts](../live-docs/adapters/java.typeref.test.ts.mdmd.md)
- [powershell.test.ts](../live-docs/adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](../live-docs/adapters/python.docstring.test.ts.mdmd.md)
- [python.typeref.test.ts](../live-docs/adapters/python.typeref.test.ts.mdmd.md)
- [ruby.docstring.test.ts](../live-docs/adapters/ruby.docstring.test.ts.mdmd.md)
- [ruby.typeref.test.ts](../live-docs/adapters/ruby.typeref.test.ts.mdmd.md)
- [rust.docstring.test.ts](../live-docs/adapters/rust.docstring.test.ts.mdmd.md)
- [rust.typeref.test.ts](../live-docs/adapters/rust.typeref.test.ts.mdmd.md)
- [core.docstring.test.ts](../live-docs/core.docstring.test.ts.mdmd.md)
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [githubSlugger.test.ts](./githubSlugger.test.ts.mdmd.md)
- [symbolReferences.test.ts](./symbolReferences.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/shared/src/tooling/githubSluggerRegex.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/githubSluggerRegex.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-githubsluggerregex-ts
- Generated At: 2025-12-09T01:18:23.582Z

## Authored
### Purpose
Packages the vendored GitHub slug sanitiser regex so our slugger matches exactly what the upstream library emits, keeping Live Doc anchors identical to GitHub and VS Code behaviour for multilingual headings.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Pulled in alongside the internal `GitHubSlugger` port during the October 25 documentation-alignment push to eliminate dependency on the ESM-only upstream package.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]
- Verified repeatedly while tuning doc-link anchors for SlopCop on November 7, ensuring unicode headings slug to `comp003--heuristic-suite` and similar real-world cases.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T01:18:23.582Z","inputHash":"047b81693a3d7f2d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GITHUB_SLUG_REMOVE_PATTERN` {#symbol-github_slug_remove_pattern}
- Type: const
- Source: [source](../../../../../../packages/shared/src/tooling/githubSluggerRegex.ts#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
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

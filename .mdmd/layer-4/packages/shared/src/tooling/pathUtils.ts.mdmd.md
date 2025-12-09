# packages/shared/src/tooling/pathUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/pathUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-pathutils-ts
- Generated At: 2025-12-09T01:18:23.607Z

## Authored
### Purpose
Unifies workspace path handling by converting between file URIs, absolute paths, and POSIX-style workspace-relative strings so relationship rules and diagnostics resolve targets consistently across platforms ([relationship rules upgrade](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5428-L5454)).

### Notes
- Relationship rule provider, engine, and audit flows all depend on these helpers to normalise URIs before emitting `documents`/`implements` edges, avoiding divergent path logic in consumers ([upgrade summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5428-L5454)).
- Chosen over ad hoc normalisation so Windows drive letters and separator differences collapse to the same canonical representation used by Live Docs and link audits ([upgrade summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5428-L5454)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T01:18:23.607Z","inputHash":"dafc9f3e22eaf56d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `toWorkspaceRelativePath` {#symbol-toworkspacerelativepath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/pathUtils.ts#L8)

##### `toWorkspaceRelativePath` — Summary
Convert a file URI into a workspace-relative path using POSIX-style separators.
Returns undefined when the URI is outside the workspace or cannot be resolved.

#### `toWorkspaceFileUri` {#symbol-toworkspacefileuri}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/pathUtils.ts#L31)

##### `toWorkspaceFileUri` — Summary
Resolve a workspace-relative path (or absolute path) to a file URI.

#### `normalizeWorkspacePath` {#symbol-normalizeworkspacepath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/pathUtils.ts#L41)

##### `normalizeWorkspacePath` — Summary
Normalise a path so directory separators are POSIX-style.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
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
- [generator.test.ts](../live-docs/generator.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

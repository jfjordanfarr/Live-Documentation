# packages/shared/src/reporting/testReport.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/reporting/testReport.ts
- Live Doc ID: LD-implementation-packages-shared-src-reporting-testreport-ts
- Generated At: 2025-12-05T04:16:19.982Z

## Authored
### Purpose
Formats benchmark telemetry (AST accuracy, rebuild stability, future suites) into human-auditable Markdown sections consumed by `generateTestReport.ts` and reporting pipelines.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-31.SUMMARIZED.md#turn-08-new-language-fixtures--documentation-sweep-lines-1821-2200]

### Notes
- Introduced with the benchmark reporting push so `safe-to-commit` could publish test reports alongside fixture docs and manifest updates.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-31.SUMMARIZED.md#turn-09-full-verify-run--commit-prep-lines-2201-2400]
- Expanded on Nov 3 to support per-mode reports when benchmarks began emitting distinct AST and self-similarity outputs.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-09-implement-per-mode-benchmark-reporting-lines-821-1030]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.982Z","inputHash":"3c21d3278707e0a6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkEnvironment` {#symbol-benchmarkenvironment}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L1)

#### `BenchmarkRecord` {#symbol-benchmarkrecord}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L11)

#### `TestReportContext` {#symbol-testreportcontext}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L20)

#### `RebuildStabilityData` {#symbol-rebuildstabilitydata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L27)

#### `AstAccuracyTotals` {#symbol-astaccuracytotals}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L37)

#### `AstAccuracyFixture` {#symbol-astaccuracyfixture}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L47)

#### `AstAccuracyData` {#symbol-astaccuracydata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L54)

#### `ReportSection` {#symbol-reportsection}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L64)

#### `buildTestReportMarkdown` {#symbol-buildtestreportmarkdown}
- Type: function
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L69)
- Parameters: `context`: `TestReportContext`; `benchmarks`: `BenchmarkRecord`[]
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
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
- [testReport.test.ts](./testReport.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/shared/src/reporting/testReport.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/reporting/testReport.ts
- Live Doc ID: LD-implementation-packages-shared-src-reporting-testreport-ts
- Generated At: 2025-12-11T02:38:02.220Z

## Authored
### Purpose
Formats benchmark telemetry (AST accuracy, rebuild stability, future suites) into human-auditable Markdown sections consumed by `generateTestReport.ts` and reporting pipelines.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-31.SUMMARIZED.md#turn-08-new-language-fixtures--documentation-sweep-lines-1821-2200]

### Notes
- Introduced with the benchmark reporting push so `safe-to-commit` could publish test reports alongside fixture docs and manifest updates.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-31.SUMMARIZED.md#turn-09-full-verify-run--commit-prep-lines-2201-2400]
- Expanded on Nov 3 to support per-mode reports when benchmarks began emitting distinct AST and self-similarity outputs.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-09-implement-per-mode-benchmark-reporting-lines-821-1030]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.220Z","inputHash":"3c21d3278707e0a6"}]} -->
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
- Parameters: `context`: [`TestReportContext`](#symbol-testreportcontext); `benchmarks`: [`BenchmarkRecord`](#symbol-benchmarkrecord)[]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [testReport.test.ts](./testReport.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

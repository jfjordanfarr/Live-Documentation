# packages/shared/src/reporting/testReport.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/reporting/testReport.ts
- Live Doc ID: LD-implementation-packages-shared-src-reporting-testreport-ts
- Generated At: 2026-02-17T21:51:00.629Z

## Authored
### Purpose
Formats benchmark telemetry (AST accuracy, rebuild stability, future suites) into human-auditable Markdown sections consumed by `generateTestReport.ts` and reporting pipelines.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-31.SUMMARIZED.md#turn-08-new-language-fixtures--documentation-sweep-lines-1821-2200]

### Notes
- Introduced with the benchmark reporting push so `safe-to-commit` could publish test reports alongside fixture docs and manifest updates.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-31.SUMMARIZED.md#turn-09-full-verify-run--commit-prep-lines-2201-2400]
- Expanded on Nov 3 to support per-mode reports when benchmarks began emitting distinct AST and self-similarity outputs.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-09-implement-per-mode-benchmark-reporting-lines-821-1030]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:51:00.629Z","inputHash":"7e0167cbcd4f285a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkEnvironment` {#symbol-benchmarkenvironment}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L4)

##### `BenchmarkEnvironment` — Summary
Runtime environment metadata captured alongside benchmark results.

#### `BenchmarkRecord` {#symbol-benchmarkrecord}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L19)

##### `BenchmarkRecord` — Summary
A single benchmark measurement persisted to the versioned JSON archive
under `reports/benchmarks/<mode>/`.

##### `BenchmarkRecord` — Additional Documentation
- @typeparam TData - Shape of the benchmark-specific payload
(e.g. {@link RebuildStabilityData}, {@link AstAccuracyData}).

#### `TestReportContext` {#symbol-testreportcontext}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L37)

##### `TestReportContext` — Summary
Metadata included in the report header.

#### `RebuildStabilityData` {#symbol-rebuildstabilitydata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L52)

##### `RebuildStabilityData` — Summary
Payload for the `"rebuild-stability"` benchmark measuring graph rebuild
duration consistency across repeated iterations.

#### `AstAccuracyTotals` {#symbol-astaccuracytotals}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L71)

##### `AstAccuracyTotals` — Summary
Aggregate accuracy metrics for an AST-based inference benchmark.

#### `AstAccuracyFixture` {#symbol-astaccuracyfixture}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L84)

##### `AstAccuracyFixture` — Summary
Per-fixture accuracy breakdown within an AST accuracy benchmark.

#### `AstAccuracyData` {#symbol-astaccuracydata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L99)

##### `AstAccuracyData` — Summary
Payload for the `"ast-accuracy"` benchmark comparing inferred edges
against ground-truth fixture oracles.

#### `ReportSection` {#symbol-reportsection}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L113)

##### `ReportSection` — Summary
A titled section of markdown content within the test report.

#### `buildTestReportMarkdown` {#symbol-buildtestreportmarkdown}
- Type: function
- Source: [source](../../../../../../packages/shared/src/reporting/testReport.ts#L129)
- Parameters: `context`: [`TestReportContext`](#symbol-testreportcontext); `benchmarks`: [`BenchmarkRecord`](#symbol-benchmarkrecord)[]

##### `buildTestReportMarkdown` — Summary
Renders a complete markdown test report from benchmark records.

Dispatches each record to a benchmark-specific formatter
(`rebuild-stability`, `ast-accuracy`) or a generic JSON fallback,
and appends environment and artifact summary sections.

##### `buildTestReportMarkdown` — Parameters
- `benchmarks`: Array of benchmark records to render.
- `context`: Report metadata (timestamp, git info, mode).

##### `buildTestReportMarkdown` — Returns
Complete markdown document as a string.
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

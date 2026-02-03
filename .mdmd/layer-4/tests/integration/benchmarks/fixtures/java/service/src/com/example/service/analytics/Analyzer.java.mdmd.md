# tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-service-src-com-example-service-analytics-analyzer-java
- Generated At: 2026-02-03T21:55:44.453Z

## Authored
### Purpose
Runs the analytics workflow for the Java service benchmark, logging progress and invoking the summary builder to highlight service layering.

### Notes
Preserve both logging statements; they provide the analyzer with multiple util dependencies in a single method.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:44.453Z","inputHash":"f66983d43de30689"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Analyzer (class)` {#symbol-analyzer-class}
- Type: class
- Source: [source](../../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java#L10)

#### `Analyzer (constructor)` {#symbol-analyzer-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java#L13)

#### `evaluate` {#symbol-evaluate}
- Type: method
- Source: [source](../../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java#L17)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`SummaryBuilder`](../metrics/SummaryBuilder.java.mdmd.md#symbol-summarybuilder)
- [`Sample`](../model/Sample.java.mdmd.md#symbol-sample)
- [`Summary`](../model/Summary.java.mdmd.md#symbol-summary)
- [`Logger`](../util/Logger.java.mdmd.md#symbol-logger)
<!-- LIVE-DOC:END Dependencies -->

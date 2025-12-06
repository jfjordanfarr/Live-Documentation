# tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/service/src/com/example/service/analytics/Analyzer.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-service-src-com-example-service-analytics-analyzer-java
- Generated At: 2025-12-06T22:49:48.470Z

## Authored
### Purpose
Runs the analytics workflow for the Java service benchmark, logging progress and invoking the summary builder to highlight service layering.

### Notes
Preserve both logging statements; they provide the analyzer with multiple util dependencies in a single method.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.470Z","inputHash":"c2fc85eafc9e7f4c"}]} -->
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
- `com.example.service.metrics.SummaryBuilder`
- `com.example.service.model.Sample`
- `com.example.service.model.Summary`
- `com.example.service.util.Logger`
<!-- LIVE-DOC:END Dependencies -->

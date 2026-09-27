# tests/integration/programs/java/service/src/com/example/service/analytics/Analyzer.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/service/src/com/example/service/analytics/Analyzer.java
- Live Doc ID: LD-test-tests-integration-programs-java-service-src-com-example-service-analytics-analyzer-java
- Generated At: 2026-09-27T20:19:23.618Z

## Authored
### Purpose
Runs the analytics workflow for the Java service benchmark, logging progress and invoking the summary builder to highlight service layering.

### Notes
Preserve both logging statements; they provide the analyzer with multiple util dependencies in a single method.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:19:23.618Z","inputHash":"56b09fedcbe25ca4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Analyzer (class)` {#symbol-analyzer-class}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/analytics/Analyzer.java#L10)

#### `Analyzer (constructor)` {#symbol-analyzer-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/analytics/Analyzer.java#L13)
- Parameters: `builder`: [`SummaryBuilder`](../metrics/SummaryBuilder.java.mdmd.md#symbol-summarybuilder)

#### `evaluate` {#symbol-evaluate}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/analytics/Analyzer.java#L17)
- Returns: [`Summary`](../model/Summary.java.mdmd.md#symbol-summary)
- Parameters: `samples`: `List`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`SummaryBuilder`](../metrics/SummaryBuilder.java.mdmd.md#symbol-summarybuilder)
- [`Sample`](../model/Sample.java.mdmd.md#symbol-sample)
- [`Summary`](../model/Summary.java.mdmd.md#symbol-summary)
- [`Logger`](../util/Logger.java.mdmd.md#symbol-logger)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# tests/integration/programs/java/service/src/com/example/service/analytics/Analyzer.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/service/src/com/example/service/analytics/Analyzer.java
- Generated At: 2026-10-02T20:20:06.494Z

## Authored
### Purpose
Runs the analytics workflow for the Java service benchmark, logging progress and invoking the summary builder to highlight service layering.

### Notes
Preserve both logging statements; they provide the analyzer with multiple util dependencies in a single method.

## Generated
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

# tests/integration/programs/java/service/src/com/example/service/metrics/SummaryBuilder.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/service/src/com/example/service/metrics/SummaryBuilder.java
- Live Doc ID: LD-test-tests-integration-programs-java-service-src-com-example-service-metrics-summarybuilder-java
- Generated At: 2026-09-27T21:43:45.584Z

## Authored
### Purpose
Builds summary objects for the Java service benchmark, converting sample collections into alert-aware aggregates.

### Notes
The alert threshold is deliberate; adjust it only when coordinating changes with analyzer expectations.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:45.584Z","inputHash":"73e9b4943274af1d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SummaryBuilder` {#symbol-summarybuilder}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/metrics/SummaryBuilder.java#L8)

#### `create` {#symbol-create}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/metrics/SummaryBuilder.java#L9)
- Returns: [`Summary`](../model/Summary.java.mdmd.md#symbol-summary)
- Parameters: `samples`: `List`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Sample`](../model/Sample.java.mdmd.md#symbol-sample)
- [`Summary`](../model/Summary.java.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Dependencies -->

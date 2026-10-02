# tests/integration/programs/java/service/src/com/example/service/metrics/SummaryBuilder.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/service/src/com/example/service/metrics/SummaryBuilder.java
- Generated At: 2026-10-02T20:20:06.551Z

## Authored
### Purpose
Builds summary objects for the Java service benchmark, converting sample collections into alert-aware aggregates.

### Notes
The alert threshold is deliberate; adjust it only when coordinating changes with analyzer expectations.

## Generated
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

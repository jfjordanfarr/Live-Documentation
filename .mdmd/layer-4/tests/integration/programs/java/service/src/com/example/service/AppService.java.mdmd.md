# tests/integration/programs/java/service/src/com/example/service/AppService.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/service/src/com/example/service/AppService.java
- Generated At: 2026-10-02T20:20:06.475Z

## Authored
### Purpose
Coordinates repository and analyzer dependencies for the Java service benchmark so layered service wiring remains visible to the analyzer.

### Notes
Leave the constructor and `generate` method focused on delegation; additional logic belongs in the collaborators.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AppService (class)` {#symbol-appservice-class}
- Type: class
- Source: [source](../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/AppService.java#L7)

#### `AppService (constructor)` {#symbol-appservice-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/AppService.java#L11)
- Parameters: `repository`: [`Repository`](./data/Repository.java.mdmd.md#symbol-repository-class); `analyzer`: [`Analyzer`](./analytics/Analyzer.java.mdmd.md#symbol-analyzer-class)

#### `generate` {#symbol-generate}
- Type: method
- Source: [source](../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/AppService.java#L16)
- Returns: [`Summary`](./model/Summary.java.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Analyzer`](./analytics/Analyzer.java.mdmd.md#symbol-analyzer-class)
- [`Repository`](./data/Repository.java.mdmd.md#symbol-repository-class)
- [`Summary`](./model/Summary.java.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Dependencies -->

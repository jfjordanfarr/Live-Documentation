# tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-service-src-com-example-service-appservice-java
- Generated At: 2026-02-03T21:55:44.413Z

## Authored
### Purpose
Coordinates repository and analyzer dependencies for the Java service benchmark so layered service wiring remains visible to the analyzer.

### Notes
Leave the constructor and `generate` method focused on delegation; additional logic belongs in the collaborators.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:44.413Z","inputHash":"52d6abb8110d9f38"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AppService (class)` {#symbol-appservice-class}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java#L7)

#### `AppService (constructor)` {#symbol-appservice-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java#L11)

#### `generate` {#symbol-generate}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java#L16)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Analyzer`](./analytics/Analyzer.java.mdmd.md#symbol-analyzer-class)
- [`Repository`](./data/Repository.java.mdmd.md#symbol-repository-class)
- [`Summary`](./model/Summary.java.mdmd.md#symbol-summary)
<!-- LIVE-DOC:END Dependencies -->

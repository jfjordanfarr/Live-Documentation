# tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/Repository.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/Repository.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-service-src-com-example-service-data-repository-java
- Generated At: 2026-01-14T02:54:35.089Z

## Authored
### Purpose
Fetches datasets for the Java service benchmark, logging access and routing through the source registry to expose layered dependencies.

### Notes
Keep the logging call and delegation intact; they ensure both util and registry modules appear in the graph.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T02:54:35.089Z","inputHash":"d1f4e89497d979cd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Repository (class)` {#symbol-repository-class}
- Type: class
- Source: [source](../../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/Repository.java#L8)

#### `Repository (constructor)` {#symbol-repository-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/Repository.java#L11)

#### `fetch` {#symbol-fetch}
- Type: method
- Source: [source](../../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/data/Repository.java#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Sample`](../model/Sample.java.mdmd.md)
- [`Logger`](../util/Logger.java.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

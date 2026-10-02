# tests/integration/programs/java/service/src/com/example/service/data/Repository.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/service/src/com/example/service/data/Repository.java
- Generated At: 2026-10-02T20:20:06.513Z

## Authored
### Purpose
Fetches datasets for the Java service benchmark, logging access and routing through the source registry to expose layered dependencies.

### Notes
Keep the logging call and delegation intact; they ensure both util and registry modules appear in the graph.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Repository (class)` {#symbol-repository-class}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/data/Repository.java#L8)

#### `Repository (constructor)` {#symbol-repository-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/data/Repository.java#L11)
- Parameters: `registry`: [`SourceRegistry`](./SourceRegistry.java.mdmd.md#symbol-sourceregistry-class)

#### `fetch` {#symbol-fetch}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/programs/java/service/src/com/example/service/data/Repository.java#L15)
- Returns: `List`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`SourceRegistry`](./SourceRegistry.java.mdmd.md#symbol-sourceregistry-class)
- [`Sample`](../model/Sample.java.mdmd.md#symbol-sample)
- [`Logger`](../util/Logger.java.mdmd.md#symbol-logger)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Reader.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Reader.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-basic-src-com-example-data-reader-java
- Generated At: 2025-12-06T22:49:48.451Z

## Authored
### Purpose
Loads synthetic records for the Java basic benchmark, illustrating how data modules feed the reporting pipeline.

### Notes
Keep the sample values predictable; analyzer regressions rely on this deterministic dataset.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.451Z","inputHash":"8c204d80fe422fc5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Reader` {#symbol-reader}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Reader.java#L11)

##### `Reader` — Summary
Loads synthetic records for the fixtures.

#### `load` {#symbol-load}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/basic/src/com/example/data/Reader.java#L21)

##### `load` — Summary
Loads records for the provided dataset identifier.

##### `load` — Parameters
- `dataset`: dataset identifier used to seed record values

##### `load` — Returns
ordered list of synthetic records

##### `load` — Examples
`Reader.load("baseline")`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `com.example.model.Record`
<!-- LIVE-DOC:END Dependencies -->

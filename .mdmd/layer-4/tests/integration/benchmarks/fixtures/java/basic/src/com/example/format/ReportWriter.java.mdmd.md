# tests/integration/benchmarks/fixtures/java/basic/src/com/example/format/ReportWriter.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/basic/src/com/example/format/ReportWriter.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-basic-src-com-example-format-reportwriter-java
- Generated At: 2026-02-03T21:55:43.902Z

## Authored
### Purpose
Transforms record collections into summaries for the Java basic benchmark, tying formatting logic to the catalog module.

### Notes
Do not reorder the dependency on `Catalog`; it exists to highlight formatter-to-data module edges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:43.902Z","inputHash":"77fbcc648a767ab5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReportWriter` {#symbol-reportwriter}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/basic/src/com/example/format/ReportWriter.java#L11)

##### `ReportWriter` — Summary
Formats `Record` collections into human-readable summaries.

#### `write` {#symbol-write}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/basic/src/com/example/format/ReportWriter.java#L21)

##### `write` — Summary
Writes a summary string for the supplied records.

##### `write` — Parameters
- `records`: record collection to summarise

##### `write` — Returns
catalog description combined with the aggregate value

##### `write` — Links
- `Catalog#describe(String)`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Catalog`](../data/Catalog.java.mdmd.md#symbol-catalog)
- [`Record`](../model/Record.java.mdmd.md#symbol-record)
<!-- LIVE-DOC:END Dependencies -->

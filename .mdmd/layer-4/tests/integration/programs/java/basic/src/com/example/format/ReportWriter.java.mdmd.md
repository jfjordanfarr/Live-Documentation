# tests/integration/programs/java/basic/src/com/example/format/ReportWriter.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/basic/src/com/example/format/ReportWriter.java
- Generated At: 2026-09-27T23:21:36.171Z

## Authored
### Purpose
Transforms record collections into summaries for the Java basic benchmark, tying formatting logic to the catalog module.

### Notes
Do not reorder the dependency on `Catalog`; it exists to highlight formatter-to-data module edges.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReportWriter` {#symbol-reportwriter}
- Type: class
- Source: [source](../../../../../../../../../../../tests/integration/programs/java/basic/src/com/example/format/ReportWriter.java#L11)

##### `ReportWriter` — Summary
Formats `Record` collections into human-readable summaries.

#### `write` {#symbol-write}
- Type: method
- Source: [source](../../../../../../../../../../../tests/integration/programs/java/basic/src/com/example/format/ReportWriter.java#L21)
- Parameters: `records`: `List`

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

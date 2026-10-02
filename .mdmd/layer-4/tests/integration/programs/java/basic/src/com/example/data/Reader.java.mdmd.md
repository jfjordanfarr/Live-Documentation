# tests/integration/programs/java/basic/src/com/example/data/Reader.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/basic/src/com/example/data/Reader.java
- Generated At: 2026-10-02T20:20:06.205Z

## Authored
### Purpose
Loads synthetic records for the Java basic benchmark, illustrating how data modules feed the reporting pipeline.

### Notes
Keep the sample values predictable; analyzer regressions rely on this deterministic dataset.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Reader` {#symbol-reader}
- Type: class
- Source: [source](../../../../../../../../../../../tests/integration/programs/java/basic/src/com/example/data/Reader.java#L11)

##### `Reader` — Summary
Loads synthetic records for the fixtures.

#### `load` {#symbol-load}
- Type: method
- Source: [source](../../../../../../../../../../../tests/integration/programs/java/basic/src/com/example/data/Reader.java#L21)
- Returns: `List`

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
- [`Record`](../model/Record.java.mdmd.md#symbol-record)
<!-- LIVE-DOC:END Dependencies -->

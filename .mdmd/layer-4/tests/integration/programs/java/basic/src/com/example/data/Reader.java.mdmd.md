# tests/integration/programs/java/basic/src/com/example/data/Reader.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/basic/src/com/example/data/Reader.java
- Live Doc ID: LD-test-tests-integration-programs-java-basic-src-com-example-data-reader-java
- Generated At: 2026-09-27T18:53:06.774Z

## Authored
### Purpose
Loads synthetic records for the Java basic benchmark, illustrating how data modules feed the reporting pipeline.

### Notes
Keep the sample values predictable; analyzer regressions rely on this deterministic dataset.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:06.774Z","inputHash":"845df90d5b65968a"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

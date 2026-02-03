# tests/integration/benchmarks/fixtures/ruby/basic/lib/data_store.rb

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/ruby/basic/lib/data_store.rb
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-ruby-basic-lib-data-store-rb
- Generated At: 2026-02-03T21:55:45.248Z

## Authored
### Purpose
Maintains the static datasets for the Ruby basic benchmark so dependency analysis captures constant maps and module accessors.

### Notes
Dataset keys and values are intentionally small; change them only when expanding fixture coverage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:45.248Z","inputHash":"18185afeea3fed30"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/data_store.rb#L3)

#### `DataStore` {#symbol-datastore}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/data_store.rb#L5)

##### `DataStore` — Summary
In-memory dataset registry used by the demo fixtures.

#### `self.fetch` {#symbol-selffetch}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/data_store.rb#L15)

##### `self.fetch` — Summary
Looks up a dataset by key.

##### `self.fetch` — Parameters
- `key`: Dataset identifier.

##### `self.fetch` — Returns
[Array<Integer>] Frozen copy of the dataset or `[0]` when missing.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

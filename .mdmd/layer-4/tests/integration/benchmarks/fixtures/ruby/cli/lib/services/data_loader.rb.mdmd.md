# tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-ruby-cli-lib-services-data-loader-rb
- Generated At: 2026-02-03T21:55:45.525Z

## Authored
### Purpose
Provides dataset loading for the Ruby CLI benchmark, emitting log messages so analyzer coverage includes service-to-support wiring.

### Notes
Keep dataset names and logging intact; they ensure deterministic edges for the fixture.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:45.525Z","inputHash":"f96c9411c0ee0bc4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkCLI` {#symbol-benchmarkcli}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb#L5)

#### `Services` {#symbol-services}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb#L6)

#### `DataLoader` {#symbol-dataloader}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb#L7)

#### `load` {#symbol-load}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/services/data_loader.rb#L21)

##### `load` — Summary
Loads a dataset by name.

##### `load` — Parameters
- `name`: Identifier such as "baseline".

##### `load` — Returns
[Array<Integer>] Numeric samples.

##### `load` — Examples
```ruby
  DataLoader.load("baseline")
```
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`logger`](../support/logger.rb.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

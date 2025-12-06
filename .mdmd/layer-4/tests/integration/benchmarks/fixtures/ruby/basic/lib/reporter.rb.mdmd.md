# tests/integration/benchmarks/fixtures/ruby/basic/lib/reporter.rb

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/ruby/basic/lib/reporter.rb
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-ruby-basic-lib-reporter-rb
- Generated At: 2025-12-06T22:49:48.562Z

## Authored
### Purpose
Wraps the formatter for the Ruby basic benchmark, turning raw numeric samples into console-friendly summaries.

### Notes
Retain the delegations to `Formatter` so the fixture continues to exercise cross-module references.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.562Z","inputHash":"09090e0c9ad6456e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/reporter.rb#L6)

#### `Reporter` {#symbol-reporter}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/reporter.rb#L8)

##### `Reporter` — Summary
Provides helpers for emitting benchmark summaries.

#### `summary` {#symbol-summary}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/reporter.rb#L18)

##### `summary` — Summary
Converts raw numeric samples into a human readable report.

##### `summary` — Parameters
- `data`: Collection of numeric samples.

##### `summary` — Returns
[String] Rendered output suitable for console display.

##### `summary` — Examples
```ruby
  Reporter.summary([1, 2, 3])
```

##### `summary` — Links
- `Formatter.to_text`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`data_store`](./data_store.rb.mdmd.md)
- [`formatter`](./formatter.rb.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/programs/ruby/basic/lib/reporter.rb

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/ruby/basic/lib/reporter.rb
- Generated At: 2026-09-27T23:21:38.429Z

## Authored
### Purpose
Wraps the formatter for the Ruby basic benchmark, turning raw numeric samples into console-friendly summaries.

### Notes
Retain the delegations to `Formatter` so the fixture continues to exercise cross-module references.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/reporter.rb#L6)

#### `Reporter` {#symbol-reporter}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/reporter.rb#L8)

##### `Reporter` — Summary
Provides helpers for emitting benchmark summaries.

#### `summary` {#symbol-summary}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/reporter.rb#L18)

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

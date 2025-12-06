# tests/integration/benchmarks/fixtures/ruby/basic/lib/formatter.rb

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/ruby/basic/lib/formatter.rb
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-ruby-basic-lib-formatter-rb
- Generated At: 2025-12-06T22:49:48.552Z

## Authored
### Purpose
Routes formatting calls for the Ruby basic benchmark, intentionally exposing a long-form comment block to test doc parsing.

### Notes
Preserve the embedded documentation and module function style—they help exercise the analyzer's comment handling.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.552Z","inputHash":"9f002883746e3c99"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/formatter.rb#L5)

#### `Formatter` {#symbol-formatter}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/formatter.rb#L6)

#### `to_text` {#symbol-to_text}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/formatter.rb#L21)

##### `to_text` — Summary
Renders a statistical snapshot using the configured templates.

##### `to_text` — Parameters
- `data`: Numeric samples to summarise.

##### `to_text` — Returns
- String describing the totals.

##### `to_text` — Examples
```ruby
Formatter.to_text([10, 20])
```
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`templates`](./templates.rb.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/programs/ruby/basic/lib/formatter.rb

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/ruby/basic/lib/formatter.rb
- Live Doc ID: LD-test-tests-integration-programs-ruby-basic-lib-formatter-rb
- Generated At: 2026-09-27T18:53:07.747Z

## Authored
### Purpose
Routes formatting calls for the Ruby basic benchmark, intentionally exposing a long-form comment block to test doc parsing.

### Notes
Preserve the embedded documentation and module function style—they help exercise the analyzer's comment handling.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:07.747Z","inputHash":"faf9f59baf78c914"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/formatter.rb#L5)

#### `Formatter` {#symbol-formatter}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/formatter.rb#L6)

#### `to_text` {#symbol-to_text}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/formatter.rb#L21)

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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

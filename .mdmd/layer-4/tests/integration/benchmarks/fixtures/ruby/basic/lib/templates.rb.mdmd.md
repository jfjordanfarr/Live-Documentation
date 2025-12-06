# tests/integration/benchmarks/fixtures/ruby/basic/lib/templates.rb

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/ruby/basic/lib/templates.rb
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-ruby-basic-lib-templates-rb
- Generated At: 2025-12-06T22:49:48.566Z

## Authored
### Purpose
Formats summarized metrics for the Ruby basic benchmark so the analyzer observes presentation helpers.

### Notes
Keep the string template stable; downstream assertions rely on the current total/count wording.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.566Z","inputHash":"5ca7882acc87663d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/templates.rb#L3)

#### `Template` {#symbol-template}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/templates.rb#L4)

#### `render` {#symbol-render}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/basic/lib/templates.rb#L11)

##### `render` — Summary
Formats aggregate values for presentation.

##### `render` — Parameters
- `data`: Samples to summarise.

##### `render` — Returns
[String] Message containing totals and counts.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

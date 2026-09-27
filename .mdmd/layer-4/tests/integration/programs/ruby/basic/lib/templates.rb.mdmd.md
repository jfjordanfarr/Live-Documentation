# tests/integration/programs/ruby/basic/lib/templates.rb

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/ruby/basic/lib/templates.rb
- Live Doc ID: LD-test-tests-integration-programs-ruby-basic-lib-templates-rb
- Generated At: 2026-09-27T21:43:47.295Z

## Authored
### Purpose
Formats summarized metrics for the Ruby basic benchmark so the analyzer observes presentation helpers.

### Notes
Keep the string template stable; downstream assertions rely on the current total/count wording.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:47.295Z","inputHash":"7b68f91e1966a111"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/templates.rb#L3)

#### `Template` {#symbol-template}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/templates.rb#L4)

#### `render` {#symbol-render}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/templates.rb#L11)

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

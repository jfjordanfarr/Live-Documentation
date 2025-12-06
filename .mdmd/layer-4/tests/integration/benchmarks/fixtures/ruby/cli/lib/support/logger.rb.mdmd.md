# tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-ruby-cli-lib-support-logger-rb
- Generated At: 2025-12-06T22:49:48.596Z

## Authored
### Purpose
Provides the lightweight logging backend for the Ruby CLI benchmark so support modules appear in the dependency graph.

### Notes
Leave the API minimal; the analyzer relies on these two methods to map support module usage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.596Z","inputHash":"c227cdecfe41f0e7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkCLI` {#symbol-benchmarkcli}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb#L3)

#### `Support` {#symbol-support}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb#L4)

#### `Logger` {#symbol-logger}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb#L5)

#### `info` {#symbol-info}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb#L12)

##### `info` — Summary
Emits an informational message.

##### `info` — Parameters
- `message`: Text to print.

##### `info` — Returns
[void]

#### `warn` {#symbol-warn}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/support/logger.rb#L20)

##### `warn` — Summary
Emits a warning message.

##### `warn` — Parameters
- `message`: Text to print.

##### `warn` — Returns
[void]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

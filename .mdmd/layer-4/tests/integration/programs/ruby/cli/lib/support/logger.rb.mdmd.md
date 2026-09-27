# tests/integration/programs/ruby/cli/lib/support/logger.rb

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/ruby/cli/lib/support/logger.rb
- Generated At: 2026-09-27T23:21:38.588Z

## Authored
### Purpose
Provides the lightweight logging backend for the Ruby CLI benchmark so support modules appear in the dependency graph.

### Notes
Leave the API minimal; the analyzer relies on these two methods to map support module usage.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkCLI` {#symbol-benchmarkcli}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/support/logger.rb#L3)

#### `Support` {#symbol-support}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/support/logger.rb#L4)

#### `Logger` {#symbol-logger}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/support/logger.rb#L5)

#### `info` {#symbol-info}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/support/logger.rb#L12)

##### `info` — Summary
Emits an informational message.

##### `info` — Parameters
- `message`: Text to print.

##### `info` — Returns
[void]

#### `warn` {#symbol-warn}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/support/logger.rb#L20)

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

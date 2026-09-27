# tests/integration/programs/ruby/cli/lib/cli.rb

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/ruby/cli/lib/cli.rb
- Live Doc ID: LD-test-tests-integration-programs-ruby-cli-lib-cli-rb
- Generated At: 2026-09-27T18:53:07.842Z

## Authored
### Purpose
Defines the entry point for the Ruby CLI benchmark, dispatching to subcommands so the analyzer captures namespaced routing.

### Notes
Keep the command switch intentionally small; new behavior should live in the services or command modules to preserve this file's role.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:07.842Z","inputHash":"e6ed3b730a19889d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkCLI` {#symbol-benchmarkcli}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/cli/lib/cli.rb#L6)

#### `execute` {#symbol-execute}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/ruby/cli/lib/cli.rb#L15)

##### `execute` — Summary
Entry point for the demo CLI.

##### `execute` — Parameters
- `argv`: Raw command-line arguments.

##### `execute` — Returns
[void]

##### `execute` — Examples
```ruby
  BenchmarkCLI.execute(["report"])
```
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`report`](./commands/report.rb.mdmd.md)
- [`logger`](./support/logger.rb.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-ruby-cli-lib-commands-report-rb
- Generated At: 2025-12-06T22:49:48.578Z

## Authored
### Purpose
Implements the `report` command for the Ruby CLI benchmark, stitching together services to exercise layered namespaces.

### Notes
Keep the flow focused on service calls; this command intentionally avoids extra logic to highlight dependency edges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.578Z","inputHash":"db70eacab928aa73"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkCLI` {#symbol-benchmarkcli}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb#L6)

#### `Commands` {#symbol-commands}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb#L7)

#### `Report` {#symbol-report}
- Type: module
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb#L8)

#### `run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/ruby/cli/lib/commands/report.rb#L14)

##### `run` — Summary
Generates the default benchmark report.

##### `run` — Returns
[void]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`analyzer`](../services/analyzer.rb.mdmd.md)
- [`data_loader`](../services/data_loader.rb.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

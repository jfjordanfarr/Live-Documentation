# tests/integration/programs/ruby/cli/lib/commands/report.rb

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/ruby/cli/lib/commands/report.rb
- Live Doc ID: LD-test-tests-integration-programs-ruby-cli-lib-commands-report-rb
- Generated At: 2026-09-27T18:53:07.865Z

## Authored
### Purpose
Implements the `report` command for the Ruby CLI benchmark, stitching together services to exercise layered namespaces.

### Notes
Keep the flow focused on service calls; this command intentionally avoids extra logic to highlight dependency edges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:07.865Z","inputHash":"060151938ba2c626"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkCLI` {#symbol-benchmarkcli}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/commands/report.rb#L6)

#### `Commands` {#symbol-commands}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/commands/report.rb#L7)

#### `Report` {#symbol-report}
- Type: module
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/commands/report.rb#L8)

#### `run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/ruby/cli/lib/commands/report.rb#L14)

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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

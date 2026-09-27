# tests/integration/programs/ruby/basic/lib/main.rb

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/ruby/basic/lib/main.rb
- Live Doc ID: LD-test-tests-integration-programs-ruby-basic-lib-main-rb
- Generated At: 2026-09-27T18:53:07.772Z

## Authored
### Purpose
Provides the entry point for the Ruby basic benchmark, coordinating the data store and reporter modules for dependency coverage.

### Notes
Keep imports limited to the existing modules; the benchmark depends on this compact orchestration.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:07.772Z","inputHash":"7242657850ab6a3b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BenchmarkApp` {#symbol-benchmarkapp}
- Type: module
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/main.rb#L6)

#### `self.run` {#symbol-selfrun}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/ruby/basic/lib/main.rb#L13)

##### `self.run` — Summary
Runs the minimal benchmark pipeline.

##### `self.run` — Parameters
- `key`: Dataset name to process.

##### `self.run` — Returns
[String] Generated summary.

##### `self.run` — Examples
```ruby
  BenchmarkApp.run("baseline")
```
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`data_store`](./data_store.rb.mdmd.md)
- [`reporter`](./reporter.rb.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

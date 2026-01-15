# tests/integration/benchmarks/fixtures/ruby/cli/expected.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/ruby/cli/expected.json
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-ruby-cli-expected-json
- Generated At: 2026-01-15T18:39:07.066Z

## Authored
### Purpose
Defines the expected dependency fan-out for the Ruby CLI benchmark so layered service coverage stays predictable.

### Notes
Use `npm run fixtures:regenerate -- --fixture ruby-cli --write` to refresh this snapshot when the fixture or analyzer changes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T18:39:07.066Z","inputHash":"66640c53d5f9b860"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`cli`](./lib/cli.rb.mdmd.md)
- [`report`](./lib/commands/report.rb.mdmd.md)
- [`analyzer`](./lib/services/analyzer.rb.mdmd.md)
- [`cache`](./lib/services/cache.rb.mdmd.md)
- [`data_loader`](./lib/services/data_loader.rb.mdmd.md)
- [`logger`](./lib/support/logger.rb.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/benchmarks/fixtures/c/modular/src/logger.c

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/modular/src/logger.c
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-modular-src-logger-c
- Generated At: 2026-02-03T21:55:42.301Z

## Authored
### Purpose
Implements the lightweight logger used across the C modular benchmark, ensuring support utilities appear in the dependency graph.

### Notes
Leave the null guard and `stdio` include intact; they intentionally exercise standard-library dependencies.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.301Z","inputHash":"9e686c86043dada1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `log_message` {#symbol-log_message}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/modular/src/logger.c#L10)

##### `log_message` — Summary
Prints the provided message when defined.

##### `log_message` — Parameters
- `message`: Text written with a trailing newline.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `stdio.h`
- [`logger.log_message`](./logger.h.mdmd.md#symbol-log_message)
<!-- LIVE-DOC:END Dependencies -->

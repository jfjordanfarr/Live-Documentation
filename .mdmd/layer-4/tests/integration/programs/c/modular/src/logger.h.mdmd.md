# tests/integration/programs/c/modular/src/logger.h

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/modular/src/logger.h
- Live Doc ID: LD-test-tests-integration-programs-c-modular-src-logger-h
- Generated At: 2026-09-27T18:53:04.938Z

## Authored
### Purpose
Declares the logging helper consumed across the modular C benchmark so pipeline steps can emit diagnostics during analysis.

### Notes
The logger stays intentionally tiny—just a printf wrapper—to keep the fixture portable across build environments.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:04.938Z","inputHash":"33aeb121214fff62"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LOGGER_H` {#symbol-logger_h}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/logger.h#L2)

#### `log_message` {#symbol-log_message}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/logger.h#L11)

##### `log_message` — Summary
Writes a line to stdout.

##### `log_message` — Remarks
Provides a consistent logging surface for the modular fixture pipeline.

##### `log_message` — Parameters
- `message`: Message that should be written when not NULL.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

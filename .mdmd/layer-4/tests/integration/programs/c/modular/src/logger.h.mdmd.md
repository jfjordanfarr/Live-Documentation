# tests/integration/programs/c/modular/src/logger.h

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/modular/src/logger.h
- Generated At: 2026-09-27T23:21:34.055Z

## Authored
### Purpose
Declares the logging helper consumed across the modular C benchmark so pipeline steps can emit diagnostics during analysis.

### Notes
The logger stays intentionally tiny—just a printf wrapper—to keep the fixture portable across build environments.

## Generated
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

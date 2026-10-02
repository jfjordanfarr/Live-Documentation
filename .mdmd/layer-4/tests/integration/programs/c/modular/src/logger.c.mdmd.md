# tests/integration/programs/c/modular/src/logger.c

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/c/modular/src/logger.c
- Generated At: 2026-10-02T20:20:04.199Z

## Authored
### Purpose
Implements the lightweight logger used across the C modular benchmark, ensuring support utilities appear in the dependency graph.

### Notes
Leave the null guard and `stdio` include intact; they intentionally exercise standard-library dependencies.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `log_message` {#symbol-log_message}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/logger.c#L10)

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

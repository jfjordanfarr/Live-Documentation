# tests/integration/programs/c/modular/src/main.c

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/c/modular/src/main.c
- Generated At: 2026-10-02T20:20:04.237Z

## Authored
### Purpose
Runs the modular C benchmark end-to-end, invoking the pipeline and logger to expose cross-translation-unit dependencies.

### Notes
Keep the sample values and logging strings stable; they provide deterministic edges for the analyzer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/modular/src/main.c#L8)

##### `main` — Summary
End-to-end demonstration of the modular pipeline runnable.

##### `main` — Returns
int Zero when the pipeline produces a non-negative value.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`logger.log_message`](./logger.h.mdmd.md#symbol-log_message)
- [`pipeline.run_pipeline`](./pipeline.h.mdmd.md#symbol-run_pipeline)
<!-- LIVE-DOC:END Dependencies -->

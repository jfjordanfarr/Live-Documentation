# tests/integration/fixtures/include-dirs/src/core/engine.cpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/include-dirs/src/core/engine.cpp
- Generated At: 2026-10-16T00:58:47.742Z

## Authored
### Purpose
`engine_run()`'s definition; includes `core/engine.hpp`, which is not beside it.

### Notes
- The second include that needs `-I include`.
- Part of the include-directories fixture written 2026-10-16 to tell the include rules apart against the compiler ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); `tests/integration/live-docs/include-dirs.test.ts` keeps the chosen rule to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `engine_run` {#symbol-engine_run}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/src/core/engine.cpp#L4)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`engine.engine_run`](../../include/core/engine.hpp.mdmd.md#symbol-engine_run)
<!-- LIVE-DOC:END Dependencies -->

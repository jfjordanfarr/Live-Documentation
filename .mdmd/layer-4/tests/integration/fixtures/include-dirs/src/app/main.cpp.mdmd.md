# tests/integration/fixtures/include-dirs/src/app/main.cpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/include-dirs/src/app/main.cpp
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T00:58:47.627Z

## Authored
### Purpose
The fixture's program: three quoted includes found three different ways (a sibling, `-I include`, `-I .`) and one system include.

### Notes
- Calls one function from each header so that the compiler records every include.
- Part of the include-directories fixture written 2026-10-16 to tell the include rules apart against the compiler ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); `tests/integration/live-docs/include-dirs.test.ts` keeps the chosen rule to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/src/app/main.cpp#L9)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`engine.engine_run`](../../include/core/engine.hpp.mdmd.md#symbol-engine_run)
- [`util.app_util`](./util.hpp.mdmd.md#symbol-app_util)
- [`log.log_line`](../shared/log.hpp.mdmd.md#symbol-log_line)
- `vector`
<!-- LIVE-DOC:END Dependencies -->

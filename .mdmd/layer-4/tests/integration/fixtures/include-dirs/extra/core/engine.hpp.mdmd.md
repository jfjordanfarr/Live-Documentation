# tests/integration/fixtures/include-dirs/extra/core/engine.hpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/include-dirs/extra/core/engine.hpp
- Generated At: 2026-10-16T00:58:47.392Z

## Authored
### Purpose
A second decoy with the tail `core/engine.hpp`, in a directory that sorts before `include/`, declaring `extra_engine_run()`. Nothing includes it.

### Notes
- Added so that a greedy rule breaking ties alphabetically is caught picking it; it was, twice, in the probe.
- Part of the include-directories fixture written 2026-10-16 to tell the include rules apart against the compiler ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); `tests/integration/live-docs/include-dirs.test.ts` keeps the chosen rule to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extra_engine_run` {#symbol-extra_engine_run}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/extra/core/engine.hpp#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

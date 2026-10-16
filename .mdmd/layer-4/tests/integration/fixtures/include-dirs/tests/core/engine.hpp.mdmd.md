# tests/integration/fixtures/include-dirs/tests/core/engine.hpp

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/fixtures/include-dirs/tests/core/engine.hpp
- Generated At: 2026-10-16T00:58:47.796Z

## Authored
### Purpose
A decoy: the tail `core/engine.hpp` of the real header in a directory no `-I` names, declaring `test_engine_run()`. Nothing includes it.

### Notes
- A greedy rule matching by tail could pick it.
- Part of the include-directories fixture written 2026-10-16 to tell the include rules apart against the compiler ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); `tests/integration/live-docs/include-dirs.test.ts` keeps the chosen rule to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `INCLUDE_DIRS_TESTS_CORE_ENGINE_HPP` {#symbol-include_dirs_tests_core_engine_hpp}
- Type: const
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/tests/core/engine.hpp#L3)

#### `test_engine_run` {#symbol-test_engine_run}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/tests/core/engine.hpp#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

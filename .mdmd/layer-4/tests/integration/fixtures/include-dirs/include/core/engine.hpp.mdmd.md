# tests/integration/fixtures/include-dirs/include/core/engine.hpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/include-dirs/include/core/engine.hpp
- Generated At: 2026-10-16T00:58:47.478Z

## Authored
### Purpose
`engine_run()`'s declaration under `include/`, reached by `-I include`; itself includes a sibling and a header under `src/` by `-I src`.

### Notes
- The include that today's rule and the ancestors rule cannot resolve.
- Part of the include-directories fixture written 2026-10-16 to tell the include rules apart against the compiler ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); `tests/integration/live-docs/include-dirs.test.ts` keeps the chosen rule to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `INCLUDE_DIRS_CORE_ENGINE_HPP` {#symbol-include_dirs_core_engine_hpp}
- Type: const
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/include/core/engine.hpp#L2)

#### `engine_run` {#symbol-engine_run}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/include/core/engine.hpp#L9)

##### `engine_run` — Summary
Runs the engine once and returns its result.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`engine_detail`](./engine_detail.hpp.mdmd.md)
- [`log`](../../src/shared/log.hpp.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

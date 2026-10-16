# tests/integration/fixtures/include-dirs/src/shared/log.hpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/include-dirs/src/shared/log.hpp
- Generated At: 2026-10-16T00:58:47.780Z

## Authored
### Purpose
`log_line()`, under `src/shared/`, reached from the program by `-I .` and from the engine header by `-I src`.

### Notes
- Two includes, two different search paths.
- Part of the include-directories fixture written 2026-10-16 to tell the include rules apart against the compiler ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); `tests/integration/live-docs/include-dirs.test.ts` keeps the chosen rule to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `INCLUDE_DIRS_SHARED_LOG_HPP` {#symbol-include_dirs_shared_log_hpp}
- Type: const
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/src/shared/log.hpp#L2)

#### `log_line` {#symbol-log_line}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/src/shared/log.hpp#L5)

##### `log_line` — Summary
Writes one line to standard output.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

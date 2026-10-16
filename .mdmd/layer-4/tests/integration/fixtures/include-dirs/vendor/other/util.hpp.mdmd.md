# tests/integration/fixtures/include-dirs/vendor/other/util.hpp

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/include-dirs/vendor/other/util.hpp
- Generated At: 2026-10-16T00:58:47.815Z

## Authored
### Purpose
A decoy: the base name of `src/app/util.hpp` in a directory no `-I` names, declaring `other_util()`. Nothing includes it.

### Notes
- A greedy rule matching by name alone could pick it.
- Part of the include-directories fixture written 2026-10-16 to tell the include rules apart against the compiler ([the probe](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); `tests/integration/live-docs/include-dirs.test.ts` keeps the chosen rule to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `INCLUDE_DIRS_VENDOR_OTHER_UTIL_HPP` {#symbol-include_dirs_vendor_other_util_hpp}
- Type: const
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/vendor/other/util.hpp#L3)

#### `other_util` {#symbol-other_util}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/include-dirs/vendor/other/util.hpp#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

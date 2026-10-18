# packages/explorer/src/client/history/rekey.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/history/rekey.test.ts
- Generated At: 2026-10-18T05:36:01.252Z

## Authored
### Purpose
Tests of the re-keying: a file moved by its path, a hub by the innermost renamed directory that holds it, the caches' objects kept with their ids rewritten and their keys recomputed, the inverted and the composed renames.

### Notes
- Written 2026-10-18 with the module, for the plan's C4 and C6; the case is `packages/shared` to `packages/engine` with a fixture folder moved elsewhere, as the September renames were.

The contested-key test (2026-10-18) holds a rename onto a dead file's lingering object: the renamed node takes the key and the lingering object is dropped whichever was cached first, and the live containment link keeps its object under the new key; it failed under the rule as it was, where the last insertion won.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`rekey.NO_RENAMES`](./rekey.ts.mdmd.md#symbol-no_renames)
- [`rekey.Renames`](./rekey.ts.mdmd.md#symbol-renames)
- [`rekey.composedRenames`](./rekey.ts.mdmd.md#symbol-composedrenames)
- [`rekey.hasRenames`](./rekey.ts.mdmd.md#symbol-hasrenames)
- [`rekey.invertedRenames`](./rekey.ts.mdmd.md#symbol-invertedrenames)
- [`rekey.rekeyedCaches`](./rekey.ts.mdmd.md#symbol-rekeyedcaches)
- [`rekey.renamedDirectory`](./rekey.ts.mdmd.md#symbol-renameddirectory)
- [`rekey.renamedId`](./rekey.ts.mdmd.md#symbol-renamedid)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

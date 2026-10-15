# tests/integration/fixtures/entry-points/workspace/src/orphan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/entry-points/workspace/src/orphan.ts
- Generated At: 2026-10-15T15:49:43.587Z

## Authored
### Purpose
The entry-points fixture's orphan: nothing starts it and nothing imports it, so the walk from the entries lists it as unreachable.

### Notes
- Written 2026-10-15 for `tests/integration/live-docs/entries.test.ts` and the inspect CLI's entries-mode test; the fixture is copied to a temporary workspace before generating and never written to.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `unused` {#symbol-unused}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/entry-points/workspace/src/orphan.ts#L4)

##### `unused` — Summary
Nothing starts this file and nothing imports it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`util.count`](./util.ts.mdmd.md#symbol-count)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/entry-points/workspace/src/loader.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/entry-points/workspace/src/loader.ts
- Generated At: 2026-10-15T15:49:43.566Z

## Authored
### Purpose
The entry-points fixture's loader, which imports the plugin by a dynamic `import()` with a literal path; the docs record the edge.

### Notes
- Written 2026-10-15 for `tests/integration/live-docs/entries.test.ts` and the inspect CLI's entries-mode test; the fixture is copied to a temporary workspace before generating and never written to.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadPlugin` {#symbol-loadplugin}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/entry-points/workspace/src/loader.ts#L2)

##### `loadPlugin` — Summary
Loads the plugin by a dynamic import with a literal path, which the docs record as an import.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`plugin`](./plugin.ts.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

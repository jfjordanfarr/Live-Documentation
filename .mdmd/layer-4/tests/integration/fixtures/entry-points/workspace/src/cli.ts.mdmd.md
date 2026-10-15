# tests/integration/fixtures/entry-points/workspace/src/cli.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/entry-points/workspace/src/cli.ts
- Entry: command `demo` of [`tests/integration/fixtures/entry-points/workspace/package.json`](../package.json.mdmd.md)
- Entry: command `start` of [`tests/integration/fixtures/entry-points/workspace/package.json`](../package.json.mdmd.md)
- Generated At: 2026-10-15T15:49:43.503Z

## Authored
### Purpose
The entry-points fixture's command: what `npm start` and the `demo` binary run; it imports the library and the loader.

### Notes
- Written 2026-10-15 for `tests/integration/live-docs/entries.test.ts` and the inspect CLI's entries-mode test; the fixture is copied to a temporary workspace before generating and never written to.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/entry-points/workspace/src/cli.ts#L5)

##### `main` — Summary
What `npm start` and the `demo` binary run.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`lib.summarize`](./lib.ts.mdmd.md#symbol-summarize)
- [`loader.loadPlugin`](./loader.ts.mdmd.md#symbol-loadplugin)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/entry-points/workspace/package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/entry-points/workspace/package.json
- Entry: tooling
- Generated At: 2026-10-16T20:40:23.033Z

## Authored
### Purpose
The entry-points fixture's manifest: a `main` module built from `src/lib.ts`, a `demo` binary built from `src/cli.ts`, a `start` script that runs `src/cli.ts`, and a `check` script that only names a tsconfig, so that the docs declare the first three and not the fourth.

### Notes
- Written 2026-10-15 for `tests/integration/live-docs/entries.test.ts` and the inspect CLI's entries-mode test; the fixture is copied to a temporary workspace before generating and never written to.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `entry-points` {#symbol-entry-points}
- Type: package
- Source: [source](../../../../../../../tests/integration/fixtures/entry-points/workspace/package.json#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

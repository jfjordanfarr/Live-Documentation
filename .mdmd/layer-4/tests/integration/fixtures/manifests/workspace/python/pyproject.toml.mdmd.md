# tests/integration/fixtures/manifests/workspace/python/pyproject.toml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/manifests/workspace/python/pyproject.toml
- Entry: tooling
- Generated At: 2026-10-16T20:40:24.664Z

## Authored
### Purpose
The manifests fixture's Python project: it names the distribution `tally`, requires `click>=8.1`, builds with setuptools (not written as a dependency), and declares the `tally` script on `tally.cli:main`, a module of the src layout.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`; the fixture is copied to a temporary workspace before generating and never written to.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tally` {#symbol-tally}
- Type: package
- Source: [source](../../../../../../../../tests/integration/fixtures/manifests/workspace/python/pyproject.toml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `click@>=8.1`
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/manifests/workspace/python/src/tally/cli.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/manifests/workspace/python/src/tally/cli.py
- Entry: command `tally` of [`tests/integration/fixtures/manifests/workspace/python/pyproject.toml`](../../pyproject.toml.mdmd.md)
- Generated At: 2026-10-16T16:21:50.324Z

## Authored
### Purpose
The manifests fixture's command: a click command that prints the sum of its arguments, the module the `tally` script names, so that its doc carries the command its manifest declares.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`. It has no `__main__` guard; what starts it is the script.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/fixtures/manifests/workspace/python/src/tally/cli.py#L8)

##### `main` — Summary
Print the sum of the counts given.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `click`
<!-- LIVE-DOC:END Dependencies -->

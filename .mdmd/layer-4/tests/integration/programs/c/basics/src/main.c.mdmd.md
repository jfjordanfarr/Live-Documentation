# tests/integration/programs/c/basics/src/main.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/basics/src/main.c
- Live Doc ID: LD-test-tests-integration-programs-c-basics-src-main-c
- Generated At: 2026-09-27T21:43:43.249Z

## Authored
### Purpose
Entry point for the C basics benchmark, calling into `util` so the analyzer observes header-driven dependencies.

### Notes
The body must stay compact; its role is to surface the `build_widget` usage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:43.249Z","inputHash":"fae99bb3a9811b95"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/basics/src/main.c#L7)

##### `main` — Summary
Entry point that exercises build_widget.

##### `main` — Returns
int Zero when widget math behaves as expected.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`util.build_widget`](./util.h.mdmd.md#symbol-build_widget)
- [`util.widget`](./util.h.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Dependencies -->

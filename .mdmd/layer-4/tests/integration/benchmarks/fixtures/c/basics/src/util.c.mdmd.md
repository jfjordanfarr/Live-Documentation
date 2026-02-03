# tests/integration/benchmarks/fixtures/c/basics/src/util.c

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/basics/src/util.c
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-basics-src-util-c
- Generated At: 2026-02-03T21:55:42.201Z

## Authored
### Purpose
Implements the widget builder for the C basics benchmark, demonstrating how simple structs cross translation units.

### Notes
Keep the example comment and return structure; they are intentionally verbose for analyzer coverage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.201Z","inputHash":"58421dc767a0c15a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `build_widget` {#symbol-build_widget}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/basics/src/util.c#L9)

##### `build_widget` — Examples
```c
struct widget item = build_widget(5);
```
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`util.build_widget`](./util.h.mdmd.md#symbol-build_widget)
- [`util.widget`](./util.h.mdmd.md#symbol-widget)
<!-- LIVE-DOC:END Dependencies -->

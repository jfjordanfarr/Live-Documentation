# tests/integration/programs/c/basics/src/util.c

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/c/basics/src/util.c
- Live Doc ID: LD-test-tests-integration-programs-c-basics-src-util-c
- Generated At: 2026-09-27T21:43:43.267Z

## Authored
### Purpose
Implements the widget builder for the C basics benchmark, demonstrating how simple structs cross translation units.

### Notes
Keep the example comment and return structure; they are intentionally verbose for analyzer coverage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:43.267Z","inputHash":"4280fd290c876a7e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `build_widget` {#symbol-build_widget}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/c/basics/src/util.c#L9)

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

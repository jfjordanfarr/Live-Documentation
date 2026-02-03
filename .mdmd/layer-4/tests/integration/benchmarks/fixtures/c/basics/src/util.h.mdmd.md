# tests/integration/benchmarks/fixtures/c/basics/src/util.h

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/c/basics/src/util.h
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-c-basics-src-util-h
- Generated At: 2026-02-03T21:55:42.217Z

## Authored
### Purpose
Declares the widget struct and factory API used by the C basics benchmark so the fixture mirrors a minimal but realistic header layout.

### Notes
The header intentionally keeps the API tiny—just a value wrapper and its constructor—to ease cross-language comparison in the benchmark suite.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.217Z","inputHash":"1cebb774e9ff2ff1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WIDGET_UTIL_H` {#symbol-widget_util_h}
- Type: const
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/basics/src/util.h#L2)

#### `widget` {#symbol-widget}
- Type: struct
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/basics/src/util.h#L9)

##### `widget` — Summary
Simple widget used by the basics fixture.

##### `widget` — Remarks
Represents a single sampled value that mirrors the Live Docs output.

#### `build_widget` {#symbol-build_widget}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/c/basics/src/util.h#L21)

##### `build_widget` — Summary
Builds a widget from the provided seed.

##### `build_widget` — Remarks
Doubles the seed value to make assertions easy.

##### `build_widget` — Parameters
- `seed`: Input value that drives the widget contents.

##### `build_widget` — Returns
struct widget Widget initialized with a deterministic value.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

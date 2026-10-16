# packages/engine/src/live-docs/adapters/c.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/c.test.ts
- Generated At: 2026-10-16T00:58:42.002Z

## Authored
### Purpose
Unit tests of the C and C++ adapter: C file-scope symbols, C++ classes, namespaces, templates and aliases, Doxygen on a method, the four include strategies over a small tree with decoys, symbol-level uses, and the program entries.

### Notes
- Written 2026-10-16 with the adapter's rewrite over the C++ grammar; the include cases mirror the include-directories fixture that the integration test and the probe measure against the compiler ([the probe](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`c.DEFAULT_INCLUDE_STRATEGY`](./c.ts.mdmd.md#symbol-default_include_strategy)
- [`c.IncludeStrategy`](./c.ts.mdmd.md#symbol-includestrategy)
- [`c.analyzeCSource`](./c.ts.mdmd.md#symbol-analyzecsource)
- [`c.cAdapter`](./c.ts.mdmd.md#symbol-cadapter)
- [`c.resolveInclude`](./c.ts.mdmd.md#symbol-resolveinclude)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

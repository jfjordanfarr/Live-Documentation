# packages/shared/src/live-docs/adapters/go.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/go.test.ts
- Generated At: 2026-09-27T23:21:30.546Z

## Authored
### Purpose
Tests the Go adapter's rules on small temporary modules: what is published, same-package resolution and shadowing, `pkg.Name` through the module path and aliases, dot and blank imports, test-file visibility, type references, and external versus standard-library imports.

### Notes
- Each test writes its own `go.mod` and files, so the cases read as small Go modules.

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
- [`go.goAdapter`](./go.ts.mdmd.md#symbol-goadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

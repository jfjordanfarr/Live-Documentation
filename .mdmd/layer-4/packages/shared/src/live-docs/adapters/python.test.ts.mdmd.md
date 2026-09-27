# packages/shared/src/live-docs/adapters/python.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/python.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-python-test-ts
- Generated At: 2026-09-27T21:43:41.072Z

## Authored
### Purpose
Tests the Python adapter's resolution rules on small temporary workspaces: re-exports followed to their origin, submodules and aliased modules, imports inside functions and under `TYPE_CHECKING`, wildcard imports, published members, type names, and the lookup roots.

### Notes
- Each test writes its own files, so the cases read as small Python programs; `python.resolution.test.ts` and `python.typeref.test.ts` hold the older cases the rewrite had to keep passing.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:41.072Z","inputHash":"7a4d9204e89117a2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`python.pythonAdapter`](./python.ts.mdmd.md#symbol-pythonadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

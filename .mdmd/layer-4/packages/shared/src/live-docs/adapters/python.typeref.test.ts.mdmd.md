# packages/shared/src/live-docs/adapters/python.typeref.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/python.typeref.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-python-typeref-test-ts
- Generated At: 2025-12-11T02:38:02.009Z

## Authored
### Purpose
Unit tests verifying that the Python language adapter correctly extracts `typeReferences` from class inheritance (`class Child(Parent)` and mixin patterns), enabling symbol-level dependency visualization in the Explorer graph.

### Notes
- Created 2025-12-08 during the polyglot typeReferences feature (12/8.2 session)
- 6 test cases: single base, multiple bases (mixins), ABC abstract classes, builtin filtering, dataclass decorators, classes without inheritance
- Uses temp directories with fixture files to avoid polluting the workspace
- All Python base classes use `role: "extends"` (Python has no separate `implements` concept)
- Filters out builtins like `ABC`, `Protocol`, `Exception` from rendered type references

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.009Z","inputHash":"02427efceb17b493"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [python.ts](./python.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

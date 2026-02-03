# packages/shared/src/live-docs/adapters/python.resolution.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/python.resolution.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-python-resolution-test-ts
- Generated At: 2026-02-03T21:55:40.089Z

## Authored
### Purpose
Validates Python import resolution logic including local modules, relative imports, stdlib detection, and symbol extraction from `from X import Y` statements.

### Notes
Tests cover the fixture patterns used in `python/basics` and `python/pipeline` benchmark fixtures to ensure Live Doc dependency links resolve correctly.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.089Z","inputHash":"0ac34977b229847e"}]} -->
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
- packages/shared/src/languages: [languages/index.ts](../../languages/index.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [python.ts](./python.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

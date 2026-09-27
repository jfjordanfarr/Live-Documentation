# packages/shared/src/live-docs/adapters/go.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/go.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-go-test-ts
- Generated At: 2026-09-27T20:36:53.780Z

## Authored
### Purpose
Tests the Go adapter's rules on small temporary modules: what is published, same-package resolution and shadowing, `pkg.Name` through the module path and aliases, dot and blank imports, test-file visibility, type references, and external versus standard-library imports.

### Notes
- Each test writes its own `go.mod` and files, so the cases read as small Go modules.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:36:53.780Z","inputHash":"4fa97d0170a9cebb"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/languages: [languages/index.ts](../../languages/index.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [go.ts](./go.ts.mdmd.md), [treeSitter.ts](./treeSitter.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

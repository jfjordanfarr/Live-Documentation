# packages/shared/src/live-docs/adapters/java.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/java.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-java-test-ts
- Generated At: 2026-09-27T20:30:53.096Z

## Authored
### Purpose
Tests the Java adapter's rules on small temporary workspaces: what is published, same-package resolution across source roots, on-demand and static imports, fully qualified and nested names, annotations, names in strings and comments, type references, and external imports.

### Notes
- Each test writes its own files; `java.typeref.test.ts` holds the older inheritance cases the rewrite had to keep passing.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:30:53.096Z","inputHash":"5bfcbaec7f1bd426"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`java.javaAdapter`](./java.ts.mdmd.md#symbol-javaadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/languages: [languages/index.ts](../../languages/index.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [java.ts](./java.ts.mdmd.md), [treeSitter.ts](./treeSitter.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# packages/shared/src/live-docs/adapters/java.typeref.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/java.typeref.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-java-typeref-test-ts
- Generated At: 2025-12-11T02:38:01.959Z

## Authored
### Purpose
Unit tests verifying that the Java language adapter correctly extracts `typeReferences` from class inheritance (`extends`) and interface implementation (`implements`) clauses, enabling symbol-level dependency visualization in the Explorer graph.

### Notes
- Created 2025-12-08 during the polyglot typeReferences feature (12/8.2 session)
- 5 test cases: extends-only, implements-only, combined extends+implements, interface extends, generic type parameters
- Uses temp directories with fixture files to avoid polluting the workspace
- Tests that `role: "extends"` vs `role: "implements"` is correctly assigned based on Java semantics

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.959Z","inputHash":"3bfd080080c89d8c"}]} -->
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
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [java.ts](./java.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

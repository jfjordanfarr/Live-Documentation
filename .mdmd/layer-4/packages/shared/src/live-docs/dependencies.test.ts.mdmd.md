# packages/shared/src/live-docs/dependencies.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/dependencies.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-dependencies-test-ts
- Generated At: 2026-09-27T21:58:31.347Z

## Authored
### Purpose
Proves how a relative import specifier is resolved to a workspace file: a dot inside a file name is part of the name, a JavaScript extension names the TypeScript source it compiles from, and an extensionless specifier is tried by extension and then by index file.

### Notes
- Written on 2026-09-27 when five of this repository's own docs listed `./csharp.dependencies` and its siblings as external modules: the resolver had read `.dependencies` as an extension and looked for that exact file.
- Each test builds its own temporary workspace, so the cases never depend on the repository's layout.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:58:31.347Z","inputHash":"afccf0ba7dce9c6e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path` - `path`
- [`dependencies.resolveDependency`](./dependencies.ts.mdmd.md#symbol-resolvedependency)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

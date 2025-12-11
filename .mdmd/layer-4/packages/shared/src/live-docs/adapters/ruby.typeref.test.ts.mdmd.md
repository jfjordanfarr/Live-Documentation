# packages/shared/src/live-docs/adapters/ruby.typeref.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/ruby.typeref.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-ruby-typeref-test-ts
- Generated At: 2025-12-11T02:38:02.031Z

## Authored
### Purpose
Unit tests verifying that the Ruby language adapter correctly extracts `typeReferences` from class inheritance (`class Child < Parent`) and mixin patterns (`include`, `extend`, `prepend`), enabling symbol-level dependency visualization in the Explorer graph.

### Notes
- Created 2025-12-08 during the polyglot typeReferences feature (12/8.2 session)
- 5 test cases: inheritance, mixins (include/extend/prepend), combined inheritance+mixins, nested classes, module-only files
- Uses `role: "extends"` for inheritance and `role: "implements"` for mixins to distinguish the semantics
- Uses temp directories with fixture files to avoid polluting the workspace

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.031Z","inputHash":"4ea4045bc5a42746"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`ruby.rubyAdapter`](./ruby.ts.mdmd.md#symbol-rubyadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [ruby.ts](./ruby.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

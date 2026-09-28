# packages/engine/src/live-docs/adapters/ruby.typeref.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/ruby.typeref.test.ts
- Generated At: 2026-09-27T23:21:31.075Z

## Authored
### Purpose
Unit tests verifying that the Ruby language adapter correctly extracts `typeReferences` from class inheritance (`class Child < Parent`) and mixin patterns (`include`, `extend`, `prepend`), enabling symbol-level dependency visualization in the Explorer graph.

### Notes
- Created 2025-12-08 during the polyglot typeReferences feature (12/8.2 session)
- 5 test cases: inheritance, mixins (include/extend/prepend), combined inheritance+mixins, nested classes, module-only files
- Uses `role: "extends"` for inheritance and `role: "implements"` for mixins to distinguish the semantics
- Uses temp directories with fixture files to avoid polluting the workspace

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`ruby.rubyAdapter`](./ruby.ts.mdmd.md#symbol-rubyadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

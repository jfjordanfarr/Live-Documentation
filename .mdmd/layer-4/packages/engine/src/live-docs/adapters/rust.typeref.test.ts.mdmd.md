# packages/engine/src/live-docs/adapters/rust.typeref.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/rust.typeref.test.ts
- Generated At: 2026-09-27T23:21:31.189Z

## Authored
### Purpose
Unit tests verifying that the Rust language adapter correctly extracts `typeReferences` from trait implementations (`impl Trait for Struct`), enabling symbol-level dependency visualization in the Explorer graph.

### Notes
- Created 2025-12-08 during the polyglot typeReferences feature (12/8.2 session)
- 8 test cases: single trait impl, multiple traits, enums with traits, generic impls, inherent impls (should not create edges), structs without impls, derive macros, generic trait bounds
- Uses `role: "implements"` for all trait implementations (Rust has no class inheritance, only traits)
- Uses temp directories with fixture files to avoid polluting the workspace

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
- [`rust.rustAdapter`](./rust.ts.mdmd.md#symbol-rustadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

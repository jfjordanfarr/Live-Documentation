# packages/shared/src/live-docs/adapters/rust.typeref.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/rust.typeref.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-rust-typeref-test-ts
- Generated At: 2025-12-11T02:38:02.051Z

## Authored
### Purpose
Unit tests verifying that the Rust language adapter correctly extracts `typeReferences` from trait implementations (`impl Trait for Struct`), enabling symbol-level dependency visualization in the Explorer graph.

### Notes
- Created 2025-12-08 during the polyglot typeReferences feature (12/8.2 session)
- 8 test cases: single trait impl, multiple traits, enums with traits, generic impls, inherent impls (should not create edges), structs without impls, derive macros, generic trait bounds
- Uses `role: "implements"` for all trait implementations (Rust has no class inheritance, only traits)
- Uses temp directories with fixture files to avoid polluting the workspace

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.051Z","inputHash":"01003f93f4c12796"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [rust.ts](./rust.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

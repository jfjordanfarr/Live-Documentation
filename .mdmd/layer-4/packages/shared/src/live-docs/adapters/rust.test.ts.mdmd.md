# packages/shared/src/live-docs/adapters/rust.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/rust.test.ts
- Generated At: 2026-09-27T23:21:31.129Z

## Authored
### Purpose
Tests the Rust adapter's rules on small temporary crates: what is published, `mod` declarations in both layouts, paths through the module tree and re-exports, the library crate by package name, glob imports, macro token trees, type references, and external crates.

### Notes
- Each test writes its own `Cargo.toml` and files; `rust.typeref.test.ts` and `rust.docstring.test.ts` hold the older cases the rewrite had to keep passing.

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

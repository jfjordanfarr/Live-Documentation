# packages/shared/src/live-docs/adapters/rust.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/rust.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-rust-ts
- Generated At: 2026-09-27T20:50:49.848Z

## Authored
### Purpose
The Rust adapter: tree-sitter symbols (public items, impl and trait methods, public fields, enum variants, with rustdoc) and path resolution through each crate's module tree, built from Cargo's crate roots and their `mod` declarations.

### Notes
- Measured against `rust-analyzer` on the four Rust sample programs; `rust/stockroom` is the one with a library and a binary in one package. The misses it keeps are a method call that needs type inference and a `crate/` reference that comes from a macro expansion; the extras are the library root named by the package name.
- Crate roots are found from the nearest `Cargo.toml` on disk, not from the file index, which carries only the files the configuration globs. `#[path]` attributes on `mod` declarations are not read.
- Inside a macro invocation the source is a token tree; `a::b::c` is read back from the tokens, so paths in `println!` and `assert_eq!` count.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:50:49.848Z","inputHash":"8c21135a6065cc43"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rustAdapter` {#symbol-rustadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/rust.ts#L862)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `rustAdapter` — Summary
Language adapter for Rust (`.rs`): tree-sitter symbols and path resolution through the crate's module tree.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./rust.rustdoc` - `parseRustDocumentation`
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.rustSyntax`](../../languages/index.ts.mdmd.md#symbol-rustsyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [rust.docstring.test.ts](./rust.docstring.test.ts.mdmd.md)
- [rust.typeref.test.ts](./rust.typeref.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

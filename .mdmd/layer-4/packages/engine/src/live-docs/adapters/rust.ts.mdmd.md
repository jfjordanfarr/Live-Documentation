# packages/engine/src/live-docs/adapters/rust.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/rust.ts
- Generated At: 2026-10-22T16:47:52.418Z

## Authored
### Purpose
The Rust adapter: tree-sitter symbols (public items, impl and trait methods, public fields, enum variants, with rustdoc) and path resolution through each crate's module tree, built from Cargo's crate roots and their `mod` declarations.

### Notes
- Measured against `rust-analyzer` on the four Rust sample programs; `rust/stockroom` is the one with a library and a binary in one package. The misses it keeps are a method call that needs type inference and a `crate/` reference that comes from a macro expansion; the extras are the library root named by the package name.
- Crate roots are found from the nearest `Cargo.toml` on disk, not from the file index, which carries only the files the configuration globs. `#[path]` attributes on `mod` declarations are not read.
- Inside a macro invocation the source is a token tree; `a::b::c` is read back from the tokens, so paths in `println!` and `assert_eq!` count.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: a top-level `fn main` in a binary crate root, public or not, with its line: `src/main.rs`, `src/bin/<name>.rs`, `src/bin/<name>/main.rs` and, since 2026-10-16, `examples/<name>.rs` and `examples/<name>/main.rs` relative to the nearest `Cargo.toml` (an example is an executable by Cargo's default), or any `main.rs` outside a package, as `crateRoots` reads roots; `src/lib.rs`, module files, `tests/` and `benches/` never, a test's `main` being its harness's and a bench not a program a person runs. Cargo's `[[example]]` tables and `autoexamples = false` are not read, as the bins' tables are not.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rustAdapter` {#symbol-rustadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/rust.ts#L893)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `rustAdapter` — Summary
Language adapter for Rust (`.rs`): tree-sitter symbols and path resolution through the crate's module tree.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.rustSyntax`](../../languages/index.ts.mdmd.md#symbol-rustsyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`rust.rustdoc.parseRustDocumentation`](./rust.rustdoc.ts.mdmd.md#symbol-parserustdocumentation)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreTypes.ProgramEntry`](../coreTypes.ts.mdmd.md#symbol-programentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

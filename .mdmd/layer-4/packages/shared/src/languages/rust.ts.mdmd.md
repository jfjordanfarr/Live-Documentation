# packages/shared/src/languages/rust.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/rust.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-rust-ts
- Generated At: 2026-02-16T18:25:01.661Z

## Authored
### Purpose
Provides Rust-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `r#"..."#`), and a blocklist of common Rust identifiers (`self`, `result`, `err`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — raw string literal syntax (`r#"..."#`) is partially supported via regex; deep nesting of `#` delimiters requires tree-sitter for accuracy.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:25:01.661Z","inputHash":"609163409f30a766"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rustSyntax` {#symbol-rustsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/rust.ts#L51)

##### `rustSyntax` — Summary
Rust language syntax configuration.

Covers `.rs` extensions.  Comment stripping uses the shared C-style
default, which also handles `///` and `//!` doc
comments.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

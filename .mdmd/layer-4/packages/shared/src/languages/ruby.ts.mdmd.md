# packages/shared/src/languages/ruby.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/ruby.ts
- Generated At: 2026-09-27T23:21:30.162Z

## Authored
### Purpose
Provides Ruby-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`#`, `=begin...=end`), string delimiters (`"`, `'`, `%q`, `%Q`), and a blocklist of common Ruby identifiers (`self`, `block`, `args`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — heredoc and percent-literal stripping is best-effort; complex Ruby string interpolation needs tree-sitter for correctness.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rubySyntax` {#symbol-rubysyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/ruby.ts#L67)

##### `rubySyntax` — Summary
Ruby language syntax configuration.

Covers `.rb`, `.rake`, `.gemspec` extensions.  Uses a custom comment
stripper that handles both `=begin…=end` block comments and `#` line
comments.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

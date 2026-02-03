# packages/shared/src/languages/ruby.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/ruby.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-ruby-ts
- Generated At: 2026-02-03T21:55:39.457Z

## Authored
### Purpose
Provides Ruby-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`#`, `=begin...=end`), string delimiters (`"`, `'`, `%q`, `%Q`), and a blocklist of common Ruby identifiers (`self`, `block`, `args`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — heredoc and percent-literal stripping is best-effort; complex Ruby string interpolation needs tree-sitter for correctness.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.457Z","inputHash":"3aa55b2eb35c5b31"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rubySyntax` {#symbol-rubysyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/ruby.ts#L55)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

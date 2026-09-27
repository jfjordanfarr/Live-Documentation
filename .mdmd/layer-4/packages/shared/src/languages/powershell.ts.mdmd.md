# packages/shared/src/languages/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/powershell.ts
- Generated At: 2026-09-27T23:21:30.127Z

## Authored
### Purpose
Provides PowerShell-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`#`, `<#...#>`), string delimiters (`"`, `'`, `@"..."@`, `@'...'@`), and a blocklist of common PS identifiers (`$_`, `$args`, `$input`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — here-strings (`@"..."@`) are stripped via multiline regex. Variable sigils (`$`) are not stripped from identifiers; they appear as-is in symbol matching.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `powershellSyntax` {#symbol-powershellsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/powershell.ts#L63)

##### `powershellSyntax` — Summary
PowerShell language syntax configuration.

Covers `.ps1`, `.psm1`, `.psd1` extensions.  Uses a custom comment
stripper that handles `<# … #>` block comments and `#` line comments.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

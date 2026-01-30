# packages/shared/src/languages/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/powershell.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-powershell-ts
- Generated At: 2026-01-30T21:01:45.976Z

## Authored
### Purpose
Provides PowerShell-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`#`, `<#...#>`), string delimiters (`"`, `'`, `@"..."@`, `@'...'@`), and a blocklist of common PS identifiers (`$_`, `$args`, `$input`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — here-strings (`@"..."@`) are stripped via multiline regex. Variable sigils (`$`) are not stripped from identifiers; they appear as-is in symbol matching.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T21:01:45.976Z","inputHash":"0d79cdacec1cc915"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `powershellSyntax` {#symbol-powershellsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/powershell.ts#L52)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

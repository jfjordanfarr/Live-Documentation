# packages/shared/src/languages/python.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/python.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-python-ts
- Generated At: 2026-01-30T00:04:21.101Z

## Authored
### Purpose
Provides Python-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`#`), string delimiters (`"""`, `'''`, `"`, `'`), and a blocklist of common Python identifiers (`self`, `cls`, `args`, `kwargs`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — triple-quoted strings are stripped first to avoid false partial matches. The regex approach may mishandle raw strings (`r"..."`); tree-sitter integration will resolve edge cases.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:04:21.101Z","inputHash":"f9615ea7e94e63fb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `pythonSyntax` {#symbol-pythonsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/python.ts#L56)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

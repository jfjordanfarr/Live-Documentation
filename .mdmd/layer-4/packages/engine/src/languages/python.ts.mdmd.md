# packages/engine/src/languages/python.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/languages/python.ts
- Generated At: 2026-09-27T23:21:30.145Z

## Authored
### Purpose
Provides Python-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`#`), string delimiters (`"""`, `'''`, `"`, `'`), and a blocklist of common Python identifiers (`self`, `cls`, `args`, `kwargs`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — triple-quoted strings are stripped first to avoid false partial matches. The regex approach may mishandle raw strings (`r"..."`); tree-sitter integration will resolve edge cases.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `pythonSyntax` {#symbol-pythonsyntax}
- Type: const
- Source: [source](../../../../../../packages/engine/src/languages/python.ts#L125)

##### `pythonSyntax` — Summary
Python language syntax configuration.

Covers `.py` and `.pyw` extensions.  Uses a line-by-line
string-aware comment stripper because Python's `#` comment character
can appear inside string literals.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

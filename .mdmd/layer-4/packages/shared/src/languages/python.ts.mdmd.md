# packages/shared/src/languages/python.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/python.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-python-ts
- Generated At: 2026-02-03T21:55:39.443Z

## Authored
### Purpose
Provides Python-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`#`), string delimiters (`"""`, `'''`, `"`, `'`), and a blocklist of common Python identifiers (`self`, `cls`, `args`, `kwargs`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — triple-quoted strings are stripped first to avoid false partial matches. The regex approach may mishandle raw strings (`r"..."`); tree-sitter integration will resolve edge cases.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.443Z","inputHash":"37eb54e9f711fc21"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PYTHON_STDLIB_MODULES` {#symbol-python_stdlib_modules}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/python.ts#L26)

##### `PYTHON_STDLIB_MODULES` — Summary
Known Python standard library modules that should not be resolved to local files.

##### `PYTHON_STDLIB_MODULES` — Remarks
This is a representative subset; full stdlib enumeration would be extensive.
We include the most common modules to avoid false positive resolution attempts.

#### `pythonSyntax` {#symbol-pythonsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/python.ts#L161)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

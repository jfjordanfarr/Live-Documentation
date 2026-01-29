# packages/shared/src/languages/typescript.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/typescript.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-typescript-ts
- Generated At: 2026-01-29T20:42:58.590Z

## Authored
### Purpose
Provides TypeScript/JavaScript-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `'`, `` ` ``), and a blocklist of common JS/TS identifiers (`data`, `result`, `item`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — covers `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` extensions. Template literal (backtick) stripping uses a simplified regex that may miss nested expressions; tree-sitter will handle these accurately.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-29T20:42:58.590Z","inputHash":"3c69f5a5f1c83aa1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `typescriptSyntax` {#symbol-typescriptsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/typescript.ts#L75)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

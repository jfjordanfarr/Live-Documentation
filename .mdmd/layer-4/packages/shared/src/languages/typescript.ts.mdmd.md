# packages/shared/src/languages/typescript.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/typescript.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-typescript-ts
- Generated At: 2026-02-16T18:25:01.690Z

## Authored
### Purpose
Provides TypeScript/JavaScript-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `'`, `` ` ``), and a blocklist of common JS/TS identifiers (`data`, `result`, `item`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — covers `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` extensions. Template literal (backtick) stripping uses a simplified regex that may miss nested expressions; tree-sitter will handle these accurately.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:25:01.690Z","inputHash":"51276740b69f797e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `typescriptSyntax` {#symbol-typescriptsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/typescript.ts#L45)

##### `typescriptSyntax` — Summary
TypeScript/JavaScript language syntax configuration.

Covers `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` extensions.
Comment stripping uses the shared C-style default,
which also handles JSDoc blocks.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

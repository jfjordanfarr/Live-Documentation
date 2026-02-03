# packages/shared/src/languages/csharp.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/csharp.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-csharp-ts
- Generated At: 2026-02-03T21:55:39.322Z

## Authored
### Purpose
Provides C#-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `@"`, `$"`, `'`), and a blocklist of common C# identifiers (`var`, `args`, `value`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — scaffolded alongside other language configs. C# verbatim (`@"`) and interpolated (`$"`) string handling is regex-approximated; tree-sitter will provide accurate parsing.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.322Z","inputHash":"3f48cbf0db6c28af"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `csharpSyntax` {#symbol-csharpsyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/csharp.ts#L59)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

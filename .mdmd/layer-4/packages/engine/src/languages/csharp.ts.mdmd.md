# packages/engine/src/languages/csharp.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/languages/csharp.ts
- Generated At: 2026-09-27T23:21:30.001Z

## Authored
### Purpose
Provides C#-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `@"`, `$"`, `'`), and a blocklist of common C# identifiers (`var`, `args`, `value`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — scaffolded alongside other language configs. C# verbatim (`@"`) and interpolated (`$"`) string handling is regex-approximated; tree-sitter will provide accurate parsing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `csharpSyntax` {#symbol-csharpsyntax}
- Type: const
- Source: [source](../../../../../../packages/engine/src/languages/csharp.ts#L49)

##### `csharpSyntax` — Summary
C# language syntax configuration.

Covers `.cs` extensions.  Comment stripping uses the shared C-style
default, which also handles `///` XML doc comments.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

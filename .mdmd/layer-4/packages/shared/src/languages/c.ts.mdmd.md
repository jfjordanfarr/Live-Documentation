# packages/shared/src/languages/c.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/c.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-c-ts
- Generated At: 2026-01-30T21:01:45.966Z

## Authored
### Purpose
Provides C-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `'`), and a small blocklist of ubiquitous C identifiers (`NULL`, `errno`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — extracted from the C adapter's local `stripCommentsAndStrings()` function. Enables the adapter to use the shared async interface while maintaining identical stripping behavior.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T21:01:45.966Z","inputHash":"d0a9864a23184c56"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cSyntax` {#symbol-csyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/c.ts#L56)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

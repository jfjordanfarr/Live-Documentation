# packages/shared/src/languages/go.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/go.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-go-ts
- Generated At: 2026-01-29T20:42:58.574Z

## Authored
### Purpose
Provides Go-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`` " ``, `` ` ``), and a blocklist of common Go variable names (`err`, `ctx`, `req`, etc.) to reduce false-positive symbol matches.

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — consolidates the `GO_COMMON_VARIABLE_NAMES` blocklist that was originally local to the Go heuristic. The ignored identifiers list merges knowledge from heuristic tuning (Dev Day 64-65) and planned tree-sitter integration.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-29T20:42:58.574Z","inputHash":"5f1b1069c109c001"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `goSyntax` {#symbol-gosyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/go.ts#L138)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

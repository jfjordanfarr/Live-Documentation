# packages/shared/src/languages/go.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/go.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-go-ts
- Generated At: 2026-02-03T21:55:39.337Z

## Authored
### Purpose
Provides Go-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`` " ``, `` ` ``), and a blocklist of common Go variable names (`err`, `ctx`, `req`, etc.) to reduce false-positive symbol matches.

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — consolidates the `GO_COMMON_VARIABLE_NAMES` blocklist that was originally local to the Go heuristic. The ignored identifiers list merges knowledge from heuristic tuning (Dev Day 64-65) and planned tree-sitter integration.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.337Z","inputHash":"56c106ab20c9bb87"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GO_STDLIB_PACKAGES` {#symbol-go_stdlib_packages}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/go.ts#L23)

##### `GO_STDLIB_PACKAGES` — Summary
Standard library packages (partial list - major ones).
Used to distinguish stdlib imports from local/third-party imports.

#### `goSyntax` {#symbol-gosyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/go.ts#L132)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
<!-- LIVE-DOC:END Dependencies -->

# packages/engine/src/languages/java.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/languages/java.ts
- Generated At: 2026-09-27T23:21:30.110Z

## Authored
### Purpose
Provides Java-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `'`), and a blocklist of common Java identifiers (`args`, `result`, `value`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — text blocks (Java 15+) are not yet handled by the regex stripper; tree-sitter integration will address this gap.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `javaSyntax` {#symbol-javasyntax}
- Type: const
- Source: [source](../../../../../../packages/engine/src/languages/java.ts#L47)

##### `javaSyntax` — Summary
Java language syntax configuration.

Covers `.java` extensions.  Comment stripping uses the shared C-style
default, which also handles Javadoc blocks.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

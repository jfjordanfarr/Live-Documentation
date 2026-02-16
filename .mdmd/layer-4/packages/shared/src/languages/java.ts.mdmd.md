# packages/shared/src/languages/java.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/java.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-java-ts
- Generated At: 2026-02-16T18:25:01.598Z

## Authored
### Purpose
Provides Java-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `'`), and a blocklist of common Java identifiers (`args`, `result`, `value`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — text blocks (Java 15+) are not yet handled by the regex stripper; tree-sitter integration will address this gap.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:25:01.598Z","inputHash":"8e61826b2744e7c3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `javaSyntax` {#symbol-javasyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/java.ts#L47)

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

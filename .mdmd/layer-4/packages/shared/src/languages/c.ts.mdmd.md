# packages/shared/src/languages/c.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/c.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-c-ts
- Generated At: 2026-02-16T18:25:01.490Z

## Authored
### Purpose
Provides C-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters (`"`, `'`), and a small blocklist of ubiquitous C identifiers (`NULL`, `errno`, etc.).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — extracted from the C adapter's local `stripCommentsAndStrings()` function. Enables the adapter to use the shared async interface while maintaining identical stripping behavior.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:25:01.490Z","inputHash":"88ff02e9c4d44fa4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cSyntax` {#symbol-csyntax}
- Type: const
- Source: [source](../../../../../../packages/shared/src/languages/c.ts#L47)

##### `cSyntax` — Summary
C/C++ language syntax configuration.

Covers `.c`, `.h`, `.cpp`, `.hpp`, `.cc`, `.cxx` extensions.
Comment stripping uses the shared C-style default.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

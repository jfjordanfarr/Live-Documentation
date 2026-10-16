# packages/engine/src/languages/c.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/languages/c.ts
- Generated At: 2026-10-16T00:58:41.798Z

## Authored
### Purpose
Provides the C and C++ syntax configuration implementing `LanguageSyntax`: comment and string delimiters, a small blocklist of ubiquitous identifiers, and the one list of extensions the adapter registers (`.c .h .cpp .cc .cxx .hpp .hh .hxx .inl`).

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — extracted from the C adapter's local `stripCommentsAndStrings()` function. Enables the adapter to use the shared async interface while maintaining identical stripping behavior.
- The extensions grew to C++'s on 2026-10-16 when the adapter was rewritten over the C++ grammar; the adapter reads its registration from here, so the registry and the adapter cannot disagree again.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cSyntax` {#symbol-csyntax}
- Type: const
- Source: [source](../../../../../../packages/engine/src/languages/c.ts#L49)

##### `cSyntax` — Summary
C/C++ language syntax configuration.

Covers the C sources and headers `.c` and `.h`, the C++ sources `.cpp`,
`.cc` and `.cxx`, and the C++ headers `.hpp`, `.hh`, `.hxx` and `.inl`.
The C adapter reads the same list, so a file the registry knows is a file
the adapter analyzes. Comment stripping uses the shared C-style default.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

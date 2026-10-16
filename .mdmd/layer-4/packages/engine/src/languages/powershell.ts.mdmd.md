# packages/engine/src/languages/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/languages/powershell.ts
- Generated At: 2026-09-27T23:21:30.127Z

## Authored
### Purpose
PowerShell's entry in the language registry: its id, which names a file's language in the docs, and its extensions, which the PowerShell adapter registers; with the comment and string delimiters, framework types and comment stripper that the `LanguageSyntax` interface asks of every language.

### Notes
- Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md), when the registry was written for every language.
- As of 2026-10-16 nothing reads its delimiters, framework types or comment stripper: the adapter takes comments and strings from the grammar's tree, and the `pwsh` adapter before it never read this module. They stay because the interface requires them of every language, which is a question for the interface. The stripper's line rule would also remove a `#` inside a string.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `powershellSyntax` {#symbol-powershellsyntax}
- Type: const
- Source: [source](../../../../../../packages/engine/src/languages/powershell.ts#L63)

##### `powershellSyntax` — Summary
PowerShell language syntax configuration.

Covers `.ps1`, `.psm1`, `.psd1` extensions.  Uses a custom comment
stripper that handles `<# … #>` block comments and `#` line comments.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax)
<!-- LIVE-DOC:END Dependencies -->

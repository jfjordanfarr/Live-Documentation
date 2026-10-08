# packages/engine/src/languages/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/languages/index.ts
- Generated At: 2026-10-08T16:03:26.425Z

## Authored
### Purpose
Central registry for language syntax configurations: the lookups `getSyntaxById()`, `getSyntaxByExtension()`, `getSyntaxByPath()`, `isLanguageSupported()` and `isExtensionSupported()`, and the re-export of the seven syntaxes that other modules import through here. The syntax types and the comment-stripping helpers come from `./syntax`.

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — designed as the single entry point for language-aware utilities. Adapters and heuristics import from here rather than individual language files to ensure consistent resolution. On 2026-10-08 [the dead code sweep](../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md) removed three functions nothing called (`getAllSyntaxes`, `stripCommentsForPath`, `isFrameworkTypeForPath`) and nine re-exports nobody imported through here.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cSyntax` {#symbol-csyntax}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L21)

#### `csharpSyntax` {#symbol-csharpsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L22)

#### `goSyntax` {#symbol-gosyntax}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L23)

#### `javaSyntax` {#symbol-javasyntax}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L24)

#### `pythonSyntax` {#symbol-pythonsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L25)

#### `rustSyntax` {#symbol-rustsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L26)

#### `typescriptSyntax` {#symbol-typescriptsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L27)

#### `getSyntaxById` {#symbol-getsyntaxbyid}
- Type: function
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L67)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)

##### `getSyntaxById` — Summary
Gets a language syntax configuration by language ID.

##### `getSyntaxById` — Parameters
- `languageId`: The language identifier (e.g., 'go', 'csharp')

##### `getSyntaxById` — Returns
The syntax configuration, or undefined if not found

#### `getSyntaxByExtension` {#symbol-getsyntaxbyextension}
- Type: function
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L77)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)

##### `getSyntaxByExtension` — Summary
Gets a language syntax configuration by file extension.

##### `getSyntaxByExtension` — Parameters
- `extension`: The file extension including dot (e.g., '.go', '.cs')

##### `getSyntaxByExtension` — Returns
The syntax configuration, or undefined if not found

#### `getSyntaxByPath` {#symbol-getsyntaxbypath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L87)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)

##### `getSyntaxByPath` — Summary
Gets a language syntax configuration by file path.

##### `getSyntaxByPath` — Parameters
- `filePath`: Path to the file

##### `getSyntaxByPath` — Returns
The syntax configuration, or undefined if not found

#### `isLanguageSupported` {#symbol-islanguagesupported}
- Type: function
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L97)

##### `isLanguageSupported` — Summary
Checks if a language is supported.

##### `isLanguageSupported` — Parameters
- `languageId`: The language identifier

#### `isExtensionSupported` {#symbol-isextensionsupported}
- Type: function
- Source: [source](../../../../../../packages/engine/src/languages/index.ts#L106)

##### `isExtensionSupported` — Summary
Checks if a file extension is supported.

##### `isExtensionSupported` — Parameters
- `extension`: The file extension including dot
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`c.cSyntax`](./c.ts.mdmd.md#symbol-csyntax)
- [`csharp.csharpSyntax`](./csharp.ts.mdmd.md#symbol-csharpsyntax)
- [`go.goSyntax`](./go.ts.mdmd.md#symbol-gosyntax)
- [`java.javaSyntax`](./java.ts.mdmd.md#symbol-javasyntax)
- [`powershell.powershellSyntax`](./powershell.ts.mdmd.md#symbol-powershellsyntax)
- [`python.pythonSyntax`](./python.ts.mdmd.md#symbol-pythonsyntax)
- [`ruby.rubySyntax`](./ruby.ts.mdmd.md#symbol-rubysyntax)
- [`rust.rustSyntax`](./rust.ts.mdmd.md#symbol-rustsyntax)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`typescript.typescriptSyntax`](./typescript.ts.mdmd.md#symbol-typescriptsyntax)
<!-- LIVE-DOC:END Dependencies -->

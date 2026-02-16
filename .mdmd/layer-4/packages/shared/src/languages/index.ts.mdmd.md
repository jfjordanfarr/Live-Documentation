# packages/shared/src/languages/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/index.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-index-ts
- Generated At: 2026-02-16T18:25:01.581Z

## Authored
### Purpose
Central registry for language syntax configurations. Exports all `LanguageSyntax` implementations and provides lookup functions: `getSyntaxById()`, `getSyntaxByExtension()`, `getSyntaxByPath()`, and the convenience `stripCommentsAndStringsForPath()`.

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — designed as the single entry point for language-aware utilities. Adapters and heuristics import from here rather than individual language files to ensure consistent resolution.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:25:01.581Z","inputHash":"b41ebce60fe76325"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LanguageSyntax` {#symbol-languagesyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L22)

#### `LanguageSyntaxConfig` {#symbol-languagesyntaxconfig}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L23)

#### `CommentDelimiters` {#symbol-commentdelimiters}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L24)

#### `StringDelimiters` {#symbol-stringdelimiters}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L25)

#### `createSyncStripper` {#symbol-createsyncstripper}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L28)

#### `createLanguageSyntax` {#symbol-createlanguagesyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L28)

#### `stripCStyleComments` {#symbol-stripcstylecomments}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L28)

#### `cSyntax` {#symbol-csyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L30)

#### `csharpSyntax` {#symbol-csharpsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L31)

#### `goSyntax` {#symbol-gosyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L32)

#### `GO_STDLIB_PACKAGES` {#symbol-go_stdlib_packages}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L32)

#### `javaSyntax` {#symbol-javasyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L33)

#### `powershellSyntax` {#symbol-powershellsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L34)

#### `pythonSyntax` {#symbol-pythonsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L35)

#### `PYTHON_STDLIB_MODULES` {#symbol-python_stdlib_modules}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L35)

#### `rubySyntax` {#symbol-rubysyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L36)

#### `rustSyntax` {#symbol-rustsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L37)

#### `typescriptSyntax` {#symbol-typescriptsyntax}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L38)

#### `getSyntaxById` {#symbol-getsyntaxbyid}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L78)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)

##### `getSyntaxById` — Summary
Gets a language syntax configuration by language ID.

##### `getSyntaxById` — Parameters
- `languageId`: The language identifier (e.g., 'go', 'csharp')

##### `getSyntaxById` — Returns
The syntax configuration, or undefined if not found

#### `getSyntaxByExtension` {#symbol-getsyntaxbyextension}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L88)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)

##### `getSyntaxByExtension` — Summary
Gets a language syntax configuration by file extension.

##### `getSyntaxByExtension` — Parameters
- `extension`: The file extension including dot (e.g., '.go', '.cs')

##### `getSyntaxByExtension` — Returns
The syntax configuration, or undefined if not found

#### `getSyntaxByPath` {#symbol-getsyntaxbypath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L98)
- Returns: [`LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax)

##### `getSyntaxByPath` — Summary
Gets a language syntax configuration by file path.

##### `getSyntaxByPath` — Parameters
- `filePath`: Path to the file

##### `getSyntaxByPath` — Returns
The syntax configuration, or undefined if not found

#### `getAllSyntaxes` {#symbol-getallsyntaxes}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L106)

##### `getAllSyntaxes` — Summary
Gets all registered language syntax configurations.

#### `isLanguageSupported` {#symbol-islanguagesupported}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L115)

##### `isLanguageSupported` — Summary
Checks if a language is supported.

##### `isLanguageSupported` — Parameters
- `languageId`: The language identifier

#### `isExtensionSupported` {#symbol-isextensionsupported}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L124)

##### `isExtensionSupported` — Summary
Checks if a file extension is supported.

##### `isExtensionSupported` — Parameters
- `extension`: The file extension including dot

#### `stripCommentsForPath` {#symbol-stripcommentsforpath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L136)

##### `stripCommentsForPath` — Summary
Strips comments from content using the appropriate language syntax.
String literals are preserved to avoid destroying code in interpolated strings.

##### `stripCommentsForPath` — Parameters
- `content`: The source code content
- `filePath`: Path to the file (used to determine language)

##### `stripCommentsForPath` — Returns
Stripped content, or original content if language not supported

#### `isFrameworkTypeForPath` {#symbol-isframeworktypeforpath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/index.ts#L154)

##### `isFrameworkTypeForPath` — Summary
Checks if an identifier is a fundamental framework type for the given file's language.

##### `isFrameworkTypeForPath` — Parameters
- `filePath`: Path to the file (used to determine language)
- `identifier`: The identifier to check

##### `isFrameworkTypeForPath` — Returns
True if the identifier is a framework type to filter as noise, false otherwise
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`c.cSyntax`](./c.ts.mdmd.md#symbol-csyntax)
- [`csharp.csharpSyntax`](./csharp.ts.mdmd.md#symbol-csharpsyntax)
- [`go.GO_STDLIB_PACKAGES`](./go.ts.mdmd.md#symbol-go_stdlib_packages)
- [`go.goSyntax`](./go.ts.mdmd.md#symbol-gosyntax)
- [`java.javaSyntax`](./java.ts.mdmd.md#symbol-javasyntax)
- [`powershell.powershellSyntax`](./powershell.ts.mdmd.md#symbol-powershellsyntax)
- [`python.PYTHON_STDLIB_MODULES`](./python.ts.mdmd.md#symbol-python_stdlib_modules)
- [`python.pythonSyntax`](./python.ts.mdmd.md#symbol-pythonsyntax)
- [`ruby.rubySyntax`](./ruby.ts.mdmd.md#symbol-rubysyntax)
- [`rust.rustSyntax`](./rust.ts.mdmd.md#symbol-rustsyntax)
- [`syntax.CommentDelimiters`](./syntax.ts.mdmd.md#symbol-commentdelimiters) (type-only)
- [`syntax.LanguageSyntax`](./syntax.ts.mdmd.md#symbol-languagesyntax) (type-only)
- [`syntax.LanguageSyntaxConfig`](./syntax.ts.mdmd.md#symbol-languagesyntaxconfig) (type-only)
- [`syntax.StringDelimiters`](./syntax.ts.mdmd.md#symbol-stringdelimiters) (type-only)
- [`syntax.createLanguageSyntax`](./syntax.ts.mdmd.md#symbol-createlanguagesyntax) (type-only)
- [`syntax.createSyncStripper`](./syntax.ts.mdmd.md#symbol-createsyncstripper) (type-only)
- [`syntax.stripCStyleComments`](./syntax.ts.mdmd.md#symbol-stripcstylecomments) (type-only)
- [`typescript.typescriptSyntax`](./typescript.ts.mdmd.md#symbol-typescriptsyntax)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [index.test.ts](./index.test.ts.mdmd.md)
- [c.docstring.test.ts](../live-docs/adapters/c.docstring.test.ts.mdmd.md)
- [python.docstring.test.ts](../live-docs/adapters/python.docstring.test.ts.mdmd.md)
- [python.resolution.test.ts](../live-docs/adapters/python.resolution.test.ts.mdmd.md)
- [python.typeref.test.ts](../live-docs/adapters/python.typeref.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

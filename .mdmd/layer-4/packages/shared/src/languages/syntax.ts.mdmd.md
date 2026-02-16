# packages/shared/src/languages/syntax.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/syntax.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-syntax-ts
- Generated At: 2026-02-16T18:25:01.674Z

## Authored
### Purpose
Defines the `LanguageSyntax` interface — the unified contract for language-specific syntax utilities across adapters, heuristics, and tree-sitter integration. Provides async-first `stripCommentsAndStrings()` for comment/string removal, plus metadata like identifiers to ignore (common variable names) and supported file extensions.

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — created as part of the LanguageSyntax module to unify duplicated comment-stripping logic across Go heuristics and C adapters. The async interface anticipates tree-sitter WASM integration; `createSyncStripper()` provides backward compatibility for sync callers.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:25:01.674Z","inputHash":"c903af43a75e4075"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CommentDelimiters` {#symbol-commentdelimiters}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L20)

##### `CommentDelimiters` — Summary
Comment delimiter configuration for a language.
Used for both regex-based stripping and tree-sitter traversal hints.

#### `StringDelimiters` {#symbol-stringdelimiters}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L30)

##### `StringDelimiters` — Summary
String literal delimiter configuration for a language.

#### `LanguageSyntax` {#symbol-languagesyntax}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L44)

##### `LanguageSyntax` — Summary
Language syntax configuration and utilities.

Each supported language provides an implementation of this interface.
The interface is intentionally async-compatible to allow for tree-sitter
WASM integration in the future.

#### `LanguageSyntaxConfig` {#symbol-languagesyntaxconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L109)

##### `LanguageSyntaxConfig` — Summary
Declarative configuration for creating a {@link LanguageSyntax} via
the {@link createLanguageSyntax} factory.

All fields are pure data except the optional `stripComments` override.
When `stripComments` is omitted the factory defaults to C-style regex
stripping (`// …` line comments + `/* … * /` block comments), which is
correct for C, C#, Java, TypeScript, and Rust.

#### `stripCStyleComments` {#symbol-stripcstylecomments}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L140)

##### `stripCStyleComments` — Summary
Strips C-style comments from source code.

Removes:
- Block comments `/* … * /` (including JSDoc / Javadoc)
- Line comments `// …`

String literals are **not** individually tracked because the regex
approach is intentionally coarse — tree-sitter provides the precise
path.  For heuristic usage the loss is acceptable and the simplicity
is a feature.

Used as the default `stripComments` by {@link createLanguageSyntax}
for C, C#, Java, TypeScript, and Rust.

#### `createLanguageSyntax` {#symbol-createlanguagesyntax}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L161)
- Returns: [`LanguageSyntax`](./index.ts.mdmd.md#symbol-languagesyntax)
- Parameters: `config`: [`LanguageSyntaxConfig`](./index.ts.mdmd.md#symbol-languagesyntaxconfig)

##### `createLanguageSyntax` — Summary
Creates a {@link LanguageSyntax} implementation from declarative
configuration, eliminating per-language boilerplate.

Default behaviours provided by the factory:
- **`stripComments`** — delegates to {@link stripCStyleComments} unless
  a custom stripper is supplied via `config.stripComments`.
- **`isFrameworkType`** — always delegates to
  `config.frameworkTypes.has(identifier)`.
- The async `Promise.resolve()` wrapper around the synchronous
  stripper, required by the interface's tree-sitter-ready signature.

##### `createLanguageSyntax` — Parameters
- `config`: Pure-data language configuration

##### `createLanguageSyntax` — Returns
A fully conformant {@link LanguageSyntax} object

#### `createSyncStripper` {#symbol-createsyncstripper}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L191)
- Parameters: `syntax`: [`LanguageSyntax`](./index.ts.mdmd.md#symbol-languagesyntax)

##### `createSyncStripper` — Summary
Creates a synchronous wrapper around the async stripComments method.

This is provided for backward compatibility with existing synchronous code.
New code should prefer the async version when possible.

**Important**: This relies on the fact that current regex-based implementations
resolve synchronously via `Promise.resolve()`. When tree-sitter implementations
are added, callers using this wrapper will need to migrate to async patterns.

##### `createSyncStripper` — Parameters
- `syntax`: The LanguageSyntax implementation

##### `createSyncStripper` — Returns
A synchronous stripping function
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

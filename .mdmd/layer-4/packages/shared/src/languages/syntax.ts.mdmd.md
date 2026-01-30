# packages/shared/src/languages/syntax.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/languages/syntax.ts
- Live Doc ID: LD-implementation-packages-shared-src-languages-syntax-ts
- Generated At: 2026-01-30T21:01:45.981Z

## Authored
### Purpose
Defines the `LanguageSyntax` interface — the unified contract for language-specific syntax utilities across adapters, heuristics, and tree-sitter integration. Provides async-first `stripCommentsAndStrings()` for comment/string removal, plus metadata like identifiers to ignore (common variable names) and supported file extensions.

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — created as part of the LanguageSyntax module to unify duplicated comment-stripping logic across Go heuristics and C adapters. The async interface anticipates tree-sitter WASM integration; `createSyncStripper()` provides backward compatibility for sync callers.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T21:01:45.981Z","inputHash":"2c2132e462b7a2f8"}]} -->
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

#### `createSyncStripper` {#symbol-createsyncstripper}
- Type: function
- Source: [source](../../../../../../packages/shared/src/languages/syntax.ts#L113)
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

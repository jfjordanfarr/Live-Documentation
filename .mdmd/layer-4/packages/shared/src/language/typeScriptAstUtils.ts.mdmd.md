# packages/shared/src/language/typeScriptAstUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/language/typeScriptAstUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-language-typescriptastutils-ts
- Generated At: 2026-02-17T21:05:03.520Z

## Authored
### Purpose
Tracks TypeScript identifier usage so fallback inference and workspace indexing can distinguish runtime imports from type-only references, preserving accurate dependency edges. Introduced during the November 3 analyzer hardening pass documented in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L2367](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L2367).

### Notes
The ripple semantics review the same day captured why we route TypeScript compiler events through these helpers—see [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3504](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3504) for the rationale that guides future adjustments.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:03.520Z","inputHash":"44ae59568cfafdeb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IdentifierUsage` {#symbol-identifierusage}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L9)

##### `IdentifierUsage` — Summary
Tracks whether an identifier is used in value position, type position, or both.

Used by the import-pruning heuristic to determine whether a dependency
is a runtime (value) import or a type-only import.

#### `extractLocalImportNames` {#symbol-extractlocalimportnames}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L23)
- Parameters: `importClause`: `ts.ImportClause`

##### `extractLocalImportNames` — Summary
Extracts the locally-bound names introduced by an import clause
(default import, named imports, or namespace import).

##### `extractLocalImportNames` — Parameters
- `importClause`: The TypeScript AST import clause node.

##### `extractLocalImportNames` — Returns
Array of local binding names.

#### `collectIdentifierUsage` {#symbol-collectidentifierusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L59)
- Parameters: `sourceFile`: `ts.SourceFile`

##### `collectIdentifierUsage` — Summary
Walks a TypeScript source file AST and records whether each identifier
appears in value position, type position, or both.

Declaration names and import/export binding names are excluded;
only usage-site occurrences are tracked.

##### `collectIdentifierUsage` — Parameters
- `sourceFile`: Parsed TypeScript source file.

##### `collectIdentifierUsage` — Returns
Map from identifier text to its usage record.

#### `hasRuntimeUsage` {#symbol-hasruntimeusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L96)

##### `hasRuntimeUsage` — Summary
Returns `true` if any of the given local names appear in a runtime (value)
position in the usage map.

When `localNames` is empty, returns `true` as a conservative default
(the import *may* have side effects).

#### `hasTypeUsage` {#symbol-hastypeusage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L111)

##### `hasTypeUsage` — Summary
Returns `true` if any of the given local names appear in a type-only
position in the usage map.

#### `isLikelyTypeDefinitionSpecifier` {#symbol-islikelytypedefinitionspecifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/language/typeScriptAstUtils.ts#L129)

##### `isLikelyTypeDefinitionSpecifier` — Summary
Heuristic check for whether an import specifier points to a
type-definition file (`.d.ts`, `types.ts`, `*-types.ts`, etc.).

Used to classify imports as type-only when no AST usage data is
available (e.g. unresolved or external modules).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
